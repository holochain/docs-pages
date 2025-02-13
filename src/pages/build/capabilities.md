---
title: "Capabilities"
---

::: intro
Access to zome functions is secured by a variant of **capability-based security** that adds the ability to restrict access to a given set of callers, identified and authenticated by their public/private key pair.
:::

## Capability-based security, updated for agent-centric applications

Traditional [capability-based security](https://en.wikipedia.org/wiki/Capability-based_security) works on a simple concept: the owner of a resource grants access to other processes by giving out a handle to the resource rather than direct access to it. (Usually in a client/server system, the handle is an authorization secret such as an [OAuth2 token](https://auth0.com/intro-to-iam/what-is-oauth-2).) Thus they can control the way the resource is used without needing to deal with access control lists or other access control methods. When the owner no longer wants the process to access the resource, they destroy the handle.

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

In a hApp where agents can call each other's zome functions, <!--TODO: expand this to other cells on agent's device when `UseExisting` provisioning strategy is implemented-->it's usually necessary to create an unrestricted grant for at least one zome function that allows an agent to ask another agent for more capabilities.

This sort of grant often gets set up in the [`init` callback](/build/callbacks-and-lifecycle-hooks/#define-an-init-callback) so it's ready to go when agents need it. This example grants unrestricted access to the [`recv_remote_signal` callback](/build/callbacks-and-lifecycle-hooks/#define-a-recv-remote-signal-callback) when the cell is initialized:

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn init() -> ExternResult<InitCallbackResult> {
    let mut functions = BTreeSet::new();
    functions.insert((zome_info()?.name, "recv_remote_signal".into()));
    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(functions),
    })?;
    Ok(InitCallbackResult::Pass)
}
```

### Transferrable

Sometimes it doesn't matter who's calling a zome function, as long as they can supply the right secret. This is useful when there's an open number of bots, system services, or other agents that should be authorized to call the function.

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

## Store a capability secret

Once the requestor has gotten a capability secret, they need to store it as a [`CapClaim`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/capability/struct.CapClaim.html) entry with the [`create_cap_claim`](https://docs.rs/hdk/latest/hdk/capability/fn.create_cap_claim.html) host function so they can use it later when they want to call the functions they've been granted access to.

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

## Putting it all together

There are a lot of parts involved in creating a functional capability system. Let's take a look at an example that builds on the previous examples to create a system that allows agents to request the ability to ["ghost write"](https://en.wikipedia.org/wiki/Ghostwriter) `Movie` and `Director` entries on behalf of other agents, who can then review and approve the request. This example has a lot of comments to explain what happens at each step; Alice is the ghost writer and Bob is the agent Alice wants to write for.

```rust
use hdk::prelude::*;
use movies_integrity::*;

#[hdk_extern]
pub fn init() -> ExternResult<InitCallbackResult> {
    let mut fns = BTreeSet::new();
    // On cell startup, Bob opens up unrestricted access to his
    // `handle_delegate_author_request` function so Alice can ask him for
    // authoring privileges.
    fns.insert((zome_info()?.name, "handle_delegate_author_request".into()));
    // Alice also opens up unrestricted access to her remote signal handler
    // callback, which will receive an approval message from Bob.
    fns.insert((zome_info()?.name, "recv_remote_signal".into()));
    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(fns),
    })?;

    Ok(InitCallbackResult::Pass)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RequestDelegateAuthorPrivilegeInput {
    author_to_request: AgentPubKey,
    reason: String,
}

// First Alice's UI calls this function, passing Bob's public key and the
// reason she wants him to grant her authoring privileges.
#[hdk_extern]
pub fn request_delegate_author_privilege(input: RequestDelegateAuthorPrivilegeInput) -> ExternResult<()> {
    // Alice calls Bob's request handler.
    return call_remote(
        input.author_to_request,
        zome_info()?.name,
        "handle_delegate_author_request".into(),
        None,
        input.reason,
    )?;
}

// This gets used in both the local signal sent to Bob's UI and the input of
// the approval function that his UI calls.
#[derive(Serialize, Deserialize, Debug)]
pub struct DelegateAuthorRequest {
    requestor: AgentPubKey,
    reason: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
enum LocalSignal {
    // This signal gets sent to Bob's UI to notify him of a request and ask
    // him to review it.
    DelegateAuthorRequest(DelegateAuthorRequest),
}

// On Bob's side, this function receives the request from Alice and notifies
// his UI.
#[hdk_extern]
pub fn handle_delegate_author_request(reason: String) -> ExternResult<()> {
    let call_info = call_info()?;
    emit_signal(Signal::DelegateAuthorRequest(DelegateAuthorRequest {
        requestor_pub_key: call_info.provenance,
        reason,
    }));
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
enum RemoteSignal {
    // This signal gets sent to Alice when Bob has approved her request.
    DelegateAuthorApproval {
        secret: CapSecret,
    },
}

// When Bob approves the request, his UI calls this function to generate the
// capability grant and send the secret to Alice.
#[hdk_extern]
pub fn approve_delegate_author_request(input: DelegateAuthorRequest) -> ExternResult<()> {
    // Use the host's crypto functions to generate a sufficiently random
    // secret.
    let secret = generate_cap_secret()?;

    // Create the list of agents to give access to, containing Alice's key.
    let assignees = BTreeSet::new();
    assignees.insert(input.requestor);

    let mut functions = BTreeSet::new();
    fns.insert((zome_info()?.name, "create_movie".into()));
    fns.insert((zome_info()?.name, "update_movie".into()));
    fns.insert((zome_info()?.name, "delete_movie".into()));
    fns.insert((zome_info()?.name, "create_director".into()));

    let cap_grant = CapGrantEntry {
        tag: format!("delegate_author_agent_{}_reason_{}", input.requestor, input.reason).into(),
        // Bob's granting an assigned capability for higher security.
        access: CapAccess::Assigned {
            secret,
            assignees,
        },
        functions,
    };
    create_cap_grant(cap_grant)?;

    // Rather than returning the secret to Bob's UI so he can send it to her
    // out-of-band, let's send it to her directly. In a more robust app, we'd
    // want to check for failed delivery and set up a retry handler.
    send_remote_signal(
        RemoteSignal::DelegateAuthorApproval { secret }
    )?;
    Ok(())
}

// Alice's remote signal handler receives Bob's approval, stores it, and
// notifies her of Bob's approval.
pub fn recv_remote_signal(signal: RemoteSignal) -> ExternResult<()> {
    match signal {
        RemoteSignal::DelegateAuthorApproval { secret } => {
            // Find out who sent the signal -- this will be Bob.
            let grantor = call_info()?.provenance;
            let cap_claim = CapClaimEntry {
                // When Alice wants to use this capability, she'll want
                // to be able to query her source chain for it by tag and
                // Bob's public key.
                tag: format!("delegate_author", grantor),
                grantor,
                secret,
            };
            create_cap_claim(cap_claim)?;
        }
        _ => {}
    };
    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
struct CreateMovieDelegateInput {
    movie: Movie,
    author_to_delegate_to: AgentPubKey,
}

// Finally, when Alice wants to ghost-write for Bob, she calls this function.
// It's unmodified from the previous example.
#[hdk_extern]
pub fn create_movie_delegate(input: CreateMovieDelegateInput) -> ExternResult<ActionHash> {
    let CreateMovieDelegateInput { movie, author_to_delegate_to } = input;

    // Search the source chain for a capability claim of the right type and
    // author.
    let maybe_matching_claim = query(ChainQueryFilter.new()
            // Capability claims are stored as entries.
            .action_type(ActionType::Create)
            .entry_type(EntryType::CapClaim)
            .include_entries(true)
        )?
        .iter()
        .find_map(|r| {
            // It's safe to unwrap and cast here because we only asked for
            // records that create cap claim entries.
            let Entry::CapClaim(claim) = r.entry().into_option().unwrap();
            if claim.tag == "delegate_author"
                && claim.grantor == author_to_delegate_to {
                // We've found the right claim!
                return Some(claim);
            } else {
                return None;
            }
        });

    match maybe_matching_claim {
        Some(claim) => {
            // Use the claim in the remote zome call.
            let response = call_remote(
                claim.grantor,
                zome_info()?.name,
                fn_name: "create_movie".into(),
                cap_secret: claim.secret,
                payload: movie,
            )?;

            match response {
                Ok(data) => Ok(data.decode()),
                Unauthorized(_, _, _, _, _) => Err(wasm_error!("Agent {} won't let us create a movie through them", claim.grantor)),
                _ => Err(wasm_error!("Something unexpected happened")),
            }
        }
        None => Err(wasm_error!("Couldn't find delegate author capability for {}", author_to_delegate_to)),
    }
}

// Alice's `create_movie_delegate` function calls this function in Bob's cell,
// which saves the movie data she wrote into his source chain and signs it
// with his key. To the rest of the DHT, it looks like Bob authored it, which
// is why we're being so careful about function access privileges!
#[hdk_extern]
pub fn create_movie(input: Movie) -> ExternResult<ActionHash> {
    // This function is implemented by the scaffolding tool; we won't show its
    // contents here.
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