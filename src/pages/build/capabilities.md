---
title: "Capabilities"
---

::: intro
Access to zome functions is secured by **capability-based security**. Holochain extends this concept by adding the ability to restrict access to a given set of callers.
:::

## Capability-based security, updated for agent-centric applications

Traditional [capability-based security](https://en.wikipedia.org/wiki/Capability-based_security) works on a simple concept: the owner of a resource grants access to other processes by giving out a handle to the resource rather than direct access to it. (Usually in a client/server system, the handle is an authorization secret such as an [OAuth2 token](https://auth0.com/intro-to-iam/what-is-oauth-2).) Thus they can control the way the resource is used without needing to deal with access control lists or other access control methods. When the owner no longer wants the process to access the resource, they invalidate the handle.

Holochain extends this concept for zome calls, first by requiring that the payload of every call be signed by a private key. Let's take a look at the [`CapAccess` enum](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/enum.CapAccess.html) which defines the kinds of **capability grant** you can use in your hApp:

* `CapAccess::Unrestricted`: any signing key can access the function(s) covered by the capability.
* `CapAccess::Transferable`: any caller who possesses the secret can access the function(s). This is identical to traditional capability-based security.
* `CapAccess::Assigned`: a caller must possess the secret _and_ sign the call with a known key.

There's a fourth kind of capability, called the **author grant**, which covers any call made by a caller with the same key as the cell's agent ID --- that is, _the agent who owns the cell_. It's essentially a combination of unrestricted (in terms of what functions can be called) plus assigned (in terms of who may call those functions).

All zome-to-zome calls within a cell and cell-to-cell calls within an agent's hApp instance are covered by the author grant. UIs are also covered by the author grant if they're hosted by one of the [well-known Holochain runtimes](/build/happs/#package-a-happ-for-distribution).

## Create a capability grant

An agent generates a capability by storing a [`CapGrantEntry`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.CapGrantEntry.html) system entry on their source chain using the [`create_cap_grant`](https://docs.rs/hdk/latest/hdk/capability/fn.create_cap_grant.html) host function.

!!! Capabilities have to be created in every cell

A cell's zome functions aren't accessible to anyone except the author until the agent creates capability grants for them. Capabilities only cover one cell in a hApp.
!!!

### Unrestricted

A hApp might want certain zome functions on an agent's device to be accessible to any caller without a secret. This sort of grant often gets set up in the [`init` callback](/build/callbacks-and-lifecycle-hooks/#define-an-init-callback) so it's ready to go when agents need it.

The classic example is the [`recv_remote_signal` callback](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback), which needs an unrestricted capability in order for the corresponding [`send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html) host function to succeed. This often happens when the cell is initialized:

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn init() -> ExternResult<InitCallbackResult> {
    let mut functions = BTreeSet::new();
    functions.insert((zome_info()?.name, "recv_remote_signal".into()));
    create_cap_grant(CapGrantEntry {
        tag: "remote_signals".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(functions),
    })?;
    Ok(InitCallbackResult::Pass)
}
```

Another use case is the [division of responsibilities pattern](/build/dnas/#dividing-responsibilities), in which an agent assumes special responsibilities based on their access to resources outside the DHT. Rather than doing the work in the `init` callback, this example implements a special function which opens up access to a zome function called [`handle_search_query`, defined on the previously linked page](/build/dnas/#call-from-one-cell-to-another). This function would be called from the UI, possibly in response to a checkbox labelled "I want to become a search provider".

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn become_search_provider() -> ExternResult<()> {
    let mut functions = BTreeSet::new();
    functions.insert((zome_info()?.name, "handle_search_query".into()));
    create_cap_grant(CapGrantEntry {
        tag: "search_provider".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(functions),
    })?;
    // The agent would probably also want to advertise their services somehow,
    // possibly by linking from a `search_providers` anchor to their agent ID.
    // See https://developer.holochain.org/build/links-paths-and-anchors/ for
    // more info.
    Ok(())
}
```

### Transferrable

Sometimes you want to selectively grant access to a function but don't want to restrict the number of agents that can exercise the capability. This is useful when a person has multiple devices (and hence multiple agent IDs), or when there's a bot or background process whose signing key at call time is rotated on an unknown schedule.

This example creates a capability grant for some zome functions that create, update, or delete the [`Movie` and `Director` entries defined in the Entries page](/build/entries/).

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn approve_delegate_author_request(reason: String) -> ExternResult<CapSecret> {
    // Use this host call to generate a sufficiently random secret.
    let secret = generate_cap_secret()?;

    // Create the list of functions to grant access to.
    let mut functions = BTreeSet::new();
    functions.insert((zome_info()?.name, "create_movie".into()));
    functions.insert((zome_info()?.name, "update_movie".into()));
    functions.insert((zome_info()?.name, "delete_movie".into()));
    functions.insert((zome_info()?.name, "create_director".into()));

    // Now write the cap grant.
    let cap_grant = CapGrantEntry {
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

If you're concerned about capability secrets being leaked, you can bind a secret to one or more public keys. The zome call's provenance must match one of these public keys, and the payload signature must be valid for the provenance. This function rewrites `approve_delegate_author_request` to create an assigned grant.

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
    let mut assignees = BTreeSet::new();
    assignees.insert(input.requestor.clone());

    let mut functions = BTreeSet::new();
    functions.insert((zome_info()?.name, "create_movie".into()));
    functions.insert((zome_info()?.name, "update_movie".into()));
    functions.insert((zome_info()?.name, "delete_movie".into()));
    functions.insert((zome_info()?.name, "create_director".into()));

    let cap_grant = CapGrantEntry {
        tag: format!("delegate_author_agent_{}_reason_{}", input.requestor, input.reason).into(),
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

Once an has gotten a capability secret from a grantor, they need to store it as a [`CapClaim`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.CapClaim.html) entry with the [`create_cap_claim`](https://docs.rs/hdk/latest/hdk/capability/fn.create_cap_claim.html) host function so they can use it later when they want to call the functions they've been granted access to.

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

## Use a capability secret

To exercise a capability they've been granted, the agent needs to retrieve the claim from their source chain using the [`query`](https://docs.rs/hdk/latest/hdk/chain/fn.query.html) host function and supply the secret along with the zome call.

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
* [`holochain_integrity_types::capability::CapGrantEntry`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.CapGrantEntry.html)
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