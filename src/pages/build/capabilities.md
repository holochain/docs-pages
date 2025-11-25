---
title: "Capabilities"
---

::: intro
Access to zome functions is secured by **capability-based security**, allowing agents to grant and revoke access to specific external agents (local front ends and remote peers) for specific coordinator zome functions. Your app implements this functionality by writing **capability grant, delete, and claim actions** to the agent's source chain.
:::

## Capability-based security, updated for agent-centric applications

Holochain secures zome function calls by creating and deleting `ZomeCallCapGrant` entries on an agent's source chain. These are then compared against the public key of a function caller (every function call must be signed by a private key). There are three levels of access to choose from; let's take a look at the [`CapAccess` enum](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/enum.CapAccess.html) which defines the kinds of **capability grant** you can use in your hApp:

* `CapAccess::Unrestricted`: any caller can access the function(s) covered by the capability.
* `CapAccess::Transferable`: any caller who possesses the secret can access the function(s). This gives moderate security; it's impossible to control who the possessor of a secret shares it with.
* `CapAccess::Assigned`: a caller must possess the secret _and_ sign the call with an authorized key. If you've used capability systems before, this is the closest to a true capability.

If the caller has the same key pair as the agent that owns the cell being called --- that is, another cell in the same hApp or a UI bundled with the hApp --- they can call any function without an explicit capability grant.

## Create a capability grant

An agent generates a capability by storing a [`ZomeCallCapGrant`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.ZomeCallCapGrant.html) system entry on their source chain using the [`create_cap_grant`](https://docs.rs/hdk/latest/hdk/capability/fn.create_cap_grant.html) host function.

!!! info Capabilities have to be created in every cell
A cell's zome functions aren't accessible to anyone except the author until the agent creates capability grants for them. A capability _only covers one cell_ in a hApp.
!!!

### Unrestricted

A hApp might want certain zome functions on an agent's device to be accessible to any caller without a secret. You can create an **unrestricted grant** for this.

The classic example is the [`recv_remote_signal` callback](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback), which needs an unrestricted grant in order for the corresponding [`send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html) host function to succeed. Here, we're setting it up in the `init` callback so it's ready to go on cell startup.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn init() -> ExternResult<InitCallbackResult> {
    let mut functions = HashSet::new();
    functions.insert((zome_info()?.name, "recv_remote_signal".into()));
    create_cap_grant(ZomeCallCapGrant {
        tag: "remote_signals".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(functions),
    })?;
    Ok(InitCallbackResult::Pass)
}
```

### Transferrable

A **transferrable grant** requires that a caller supply a secret in order to exercise it. The secret can be leaked by anyone the grantor gives it to, and should be considered minimal security.

This example creates a capability grant for some zome functions that create, update, or delete the [`Movie` and `Director` entries defined in the Entries page](/build/entries/).

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn approve_delegate_author_request(reason: String) -> ExternResult<CapSecret> {
    // Use this host call to generate a sufficiently random secret.
    let secret = generate_cap_secret()?;

    // Create the list of functions to grant access to.
    let mut functions = HashSet::new();
    functions.insert((zome_info()?.name, "create_movie".into()));
    functions.insert((zome_info()?.name, "update_movie".into()));
    functions.insert((zome_info()?.name, "delete_movie".into()));
    functions.insert((zome_info()?.name, "create_director".into()));

    // Now write the cap grant.
    let cap_grant = ZomeCallCapGrant {
        // Keep a memo of why we're creating this capability grant.
        // This makes it possible to audit and revoke it later.
        tag: format!("delegate_author_reason_{}", reason).into(),
        access: CapAccess::Transferable { secret },
        functions: GrantedFunctions::Listed(functions),
    };
    create_cap_grant(cap_grant)?;

    // Return the secret so the grantor can send it to the requestor.
    Ok(secret)
}
```

### Assigned

An **assigned grant** lets you bind a capability to one or more authorized public keys, which prevents unauthorized use if the secret gets leaked. This function rewrites `approve_delegate_author_request` to create an assigned grant.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct DelegateAuthorRequest {
    requestor: AgentPubKey,
    reason: String,
}

#[hdk_extern]
pub fn approve_delegate_author_request(input: DelegateAuthorRequest) -> ExternResult<CapSecret> {
    let secret = generate_cap_secret()?;

    // Create the list of agents to give access to.
    let mut assignees = HashSet::new();
    assignees.insert(input.requestor.clone());

    let mut functions = HashSet::new();
    functions.insert((zome_info()?.name, "create_movie".into()));
    functions.insert((zome_info()?.name, "update_movie".into()));
    functions.insert((zome_info()?.name, "delete_movie".into()));
    functions.insert((zome_info()?.name, "create_director".into()));

    let cap_grant = ZomeCallCapGrant {
        tag: format!("delegate_author_reason_{}", input.reason).into(),
        access: CapAccess::Assigned {
            secret,
            assignees,
        },
        functions: GrantedFunctions::Listed(functions),
    };
    create_cap_grant(cap_grant)?;

    Ok(secret)
}
```

## Store a capability claim

Once an agent has gotten a capability secret from a grantor, they need to store it as a [`CapClaim`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.CapClaim.html) entry with the [`create_cap_claim`](https://docs.rs/hdk/latest/hdk/capability/fn.create_cap_claim.html) host function so they can use it later when they want to call the functions they've been granted access to.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct DelegateAuthorApproval {
    grantor: AgentPubKey,
    secret: CapSecret,
}

#[hdk_extern]
pub fn store_delegate_author_approval(input: DelegateAuthorApproval) -> ExternResult<ActionHash> {
    let cap_claim = CapClaimEntry {
        // When the agent wants to use this capability, they'll want
        // to be able to query their source chain for it by tag.
        tag: format!("delegate_author"),
        grantor: input.grantor,
        secret: input.secret,
    };
    create_cap_claim(cap_claim)
}
```

## Use a capability

To exercise a capability they've been granted, an agent needs to retrieve the claim from their source chain using the [`query`](https://docs.rs/hdk/latest/hdk/chain/fn.query.html) host function and supply the secret along with the zome call.

```rust
use hdk::prelude::*;
use movies_integrity::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateMovieDelegateInput {
    movie: Movie,
    author_to_delegate_to: AgentPubKey,
}

pub fn create_movie_delegate(input: CreateMovieDelegateInput) -> ExternResult<ActionHash> {
    let CreateMovieDelegateInput { movie, author_to_delegate_to } = input;

    // Search the source chain for a capability claim of the right type and
    // author.
    let filter = ChainQueryFilter::new()
        // Capability claims are stored as entries.
        .action_type(ActionType::Create)
        .entry_type(EntryType::CapClaim)
        .include_entries(true);
    let maybe_matching_claim = query(filter)?
        .into_iter()
        .find_map(|r| {
            // It's safe to unwrap here because we only asked for records that
            // create cap claim entries.
            if let Entry::CapClaim(claim) = r.entry().as_option().unwrap() {
                if claim.tag == "delegate_author"
                    && claim.grantor == author_to_delegate_to {
                    // We've found the right claim!
                    return Some(claim.clone());
                } else {
                    return None;
                }
            }
            None
        });

    match maybe_matching_claim {
        Some(claim) => {
            // Use the claim in the remote zome call.
            let response = call_remote(
                claim.grantor.clone(),
                zome_info()?.name,
                "create_movie".into(),
                Some(claim.secret),
                movie,
            )?;

            match response {
                ZomeCallResponse::Ok(data) => data.decode().map_err(|e| wasm_error!("Couldn't deserialize response from remote agent: {}", e)),
                ZomeCallResponse::Unauthorized(_, _, _, _, _) => Err(wasm_error!("Agent {} won't let us create a movie through them", claim.grantor)),
                _ => Err(wasm_error!("Something unexpected happened")),
            }
        }
        _ => Err(wasm_error!("Couldn't find delegate author capability for {}", author_to_delegate_to)),
    }
}
```

## Reference

* [`holochain_integrity_types::capability::CapAccess`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/enum.CapAccess.html)
* [`holochain_integrity_types::capability::ZomeCallCapGrant`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.ZomeCallCapGrant.html)
* [`hdk::capability::create_cap_grant`](https://docs.rs/hdk/latest/hdk/capability/fn.create_cap_grant.html)
* [`holochain_integrity_types::capability::CapClaim`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.CapClaim.html)
* [`hdk::capability::create_cap_claim`](https://docs.rs/hdk/latest/hdk/capability/fn.create_cap_claim.html)
* [`hdk::chain::query`](https://docs.rs/hdk/latest/hdk/chain/fn.query.html)
* [`holochain_integrity_types::entry::Entry`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/entry/enum.Entry.html) (`CapClaim` and `CapGrant` variants)
* [`hdk::p2p::call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html)
* [`hdk::p2p::call_remote`](https://docs.rs/hdk/latest/hdk/p2p/fn.call_remote.html)
* [`hdk::p2p::emit_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.emit_signal.html)
* [`hdk::p2p::send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html)

## Further reading

* [Core Concepts: Calls and Capabilities](/concepts/8_calls_capabilities/)
* Build Guide: Callbacks and Lifecycle Hooks: [`init`](/build/callbacks-and-lifecycle-hooks/#define-an-init-callback), [`recv_remote_signal`](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback), and [`post_commit`](/build/callbacks-and-lifecycle-hooks/#define-a-post-commit-callback) callbacks
*