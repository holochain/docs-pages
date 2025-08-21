---
title: "Getting an Agent's Status"
---

::: topic-list
### In this section {data-no-toc}

* [Validation](/build/validation/)
    * [`genesis_self_check` Callback](/build/genesis-self-check-callback/) --- writing a function to control access to a network
    * [`validate` Callback](/build/validate-callback/) --- basic callback, examples using stub functions
    * [`must_get_*` Host Functions](/build/must-get-host-functions/) --- Deterministically retrieving DHT data for use in validation
    * [DHT operations](/build/dht-operations/) --- advanced details on the underlying data structure used in DHT replication and validation
    * Getting an Agent's Status (this page) --- checking for invalid actions committed by another agent
:::

::: intro
At certain points in a hApp a user may want to check on a peer's good standing in the network, particularly to find out whether they've broken the rules of a hApp or of Holochain itself. `get_agent_activity` lets you get a summary of an agent's current state, including any outstanding [**warrants**](/resources/glossary/#warrant) attached to them.
:::

## When do we need to check an agent's state?

If your app involves interactions between peers that require a high level of integrity, such as exchanging value, entering into a contract, or registering a vote, it's helpful for agents to be able to check the reputation and history of another agent before interacting with them. (We'll call this sort of interaction an 'agreement' in this document.)

You can do this with the [`get_agent_activity`](https://docs.rs/hdk/latest/hdk/chain/fn.get_agent_activity.html) host function, which gives information about both chain forks and collected **warrants** for an agent.

A warrant is a [DHT operation](/build/dht-operations/) that indicates that some agent has broken a rule, either a base Holochain rule (such as "a chain must not fork") or an app-specific validation rule encoded in a [`validate` callback](/build/validate-callback/).

A warrant is created for _any_ DHT operation that fails app validation, and sent to the [authority](/resources/glossary/#validation-authority) responsible for the warranted author's [agent ID](/build/identifiers/#agent) address. No warrants are created for chain forks, because a warrant is simply a way of informing other agents of an incident on data they might not be an authority on, and agent ID authorities already watch for chain forks.<!-- TODO: change this language if chain fork warrants become a thing -->

An agent's state is not deterministic, so it's not something you check in a validation callback. Instead, you check for chain forks and warrants in a zome function when you need insight into the integrity of another agent --- like when an agent is about to enter into an agreement.

## Get the status of an agent

To check an agent for chain forks and warrants, call `get_agent_activity` with [`ActivityRequest::Status`](https://docs.rs/hdk/latest/hdk/prelude/enum.ActivityRequest.html#variant.Status) and empty chain query filters. This will tell you whether their state is valid, without returning their whole source chain.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn is_agent_safe_to_interact_with(agent: AgentPubKey) -> ExternResult<bool> {
    let agent_state = get_agent_activity(
        agent,
        // We're not interested in the contents of their chain, so we don't
        // need to specify any chain query filters.
        ChainQueryFilter::new(),
        ActivityRequest::Status,
    )?;

    // The agent is safe if their chain has no forks or invalid data,
    // and no other authorities have produced warrants.
    Ok(
        matches!(agent_state.status, ChainStatus::Valid(_))
        && agent_state.warrants.len() == 0
    )
}
```

!!! info Warrants and chain forks are eventually consistent
The absence of a warrant or chain fork doesn't necessarily mean an agent is in good standing; it simply means _no evidence of rule-breaking has been discovered yet_ by the authority the calling agent has queried. However, most authorities with good connectivity to their [neighbors](/resources/glossary/#neighbor) will discover invalid data and chain forks and publish warrants within seconds after the data is published.
!!!

## Check for a published action

When you're dealing with high-risk interactions, it's good practice to start an agreement with some sort of 'proposal' entry, which the initiator commits to their source chain. The other parties can then receive the hash of the proposal's creation action, and use `get_agent_activity` to check that the initiator actually published the entry and that the authorities consider it valid.

Because the DHT is eventually consistent, it's also a good idea for the other parties to wait a short period --- perhaps scaled to the level of risk involved in the agreement --- before calling `get_agent_activity` to allow warrants and conflicting actions (which cause chain forks) to propagate to all authorities.

```rust
use hdk::prelude::*;

#[derive(Serialize, Debug)]
pub enum ProposalStatus {
    /// The proposal hasn't appeared at the agent ID authority yet.
    NotAvailable,
    /// No invalid actions observed yet.
    GoodSoFar,
    /// The proposal may be invalid, either because the agent ID authority
    /// discovered a chain-based error or another op authority discovered
    /// an issue and sent a warrant to the agent ID authority.
    /// The proposal may also be valid but a prior invalid action has been
    /// discovered.
    Invalid,
    /// A chain fork has been discovered -- either conflicting with the
    /// proposal action or further in the past.
    ChainFork,
}

// To be called by the front end at intervals -- first, in a polling loop
// until the action is seen on the initiator's chain, and then after a
// suitable interval to allow evidence of bad activity to show up.
#[hdk_extern]
pub fn is_proposal_currently_good(input: IsProposalCurrentlyGoodInput) -> ExternResult<ProposalStatus> {
    let initiator_state = get_agent_activity(
        input.initiator,
        ChainQueryFilter::new()
            // For scarce resources, you'll want to make sure that another
            // conflicting proposal for the same resource hasn't been created
            // before or after this proposal. Here, we're assuming the
            // proposal doesn't deal with a scarce resource and simply
            // check that it exists on the chain.
            // You can read more about building a chain query filter at
            // https://developer.holochain.org/build/querying-source-chains/#filtering-a-query
            .sequence_range(ChainQueryFilterRange::ActionHashTerminated(input.proposal_hash, 0)),
        ActivityRequest::Full,
    )?;

    match initiator_state.status {
        ChainStatus::Forked(_) => Ok(ProposalStatus::ChainFork),
        ChainStatus::Invalid(_) => Ok(ProposalStatus::Invalid),
        // The initiator doesn't appear to have created a source chain.
        ChainStatus::Empty => Ok(ProposalStatus::NotAvailable),
        ChainStatus::Valid(_) => {
            // AgentState::status doesn't account for warrants.
            // We have to check for them as a separate step.
            if initiator_state.warrants.len() > 0 {
                return Ok(ProposalStatus::Invalid);
            }
            if initiator_state.valid_activity.len() == 0 {
                return Ok(ProposalStatus::NotAvailable);
            }
            Ok(ProposalStatus::GoodSoFar)
        }
    }
}
```

!!! info Time-based attacks
This approach is still vulnerable to various time-based attacks; for instance:

* A malicious agent claims to have published an action but has withheld it and conflicting actions from publishing until immediately before they send its hash to the receiver. The receiver may mistakenly think enough time has passed for warrants and forks to propagate.
* A malicious agent crafts a conflicting action but withholds it until after the receiver completes an agreement, causing the proposal action and its subsequent acceptance action to be seen as invalid due to a chain fork.

Vulnerabilities like this are outside the scope of this document; we recommend you get a third-party security audit for any high-risk hApp involving a multi-party agreement process.
!!!

## Query an agent's source chain

An agent's source chain is part of their state, so you can also use `get_agent_activity` to retrieve their state. We'll write more about this soon.<!-- TODO: link to /build/querying-source-chains/ when this is written -->

## Reference

* [`hdk::chain::get_agent_activity`](https://docs.rs/hdk/latest/hdk/chain/fn.get_agent_activity.html)
* [`holochain_zome_types::query::ActivityRequest`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/enum.ActivityRequest.html)
* [`holochain_zome_types::query::ChainQueryFilter`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/struct.ChainQueryFilter.html)
* [`holochain_zome_types::query::AgentActivity`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/struct.AgentActivity.html)

## Further reading

* [Core Concepts: Source Chain](/concepts/3_source_chain/)
* [Core Concepts: Validation](/concepts/7_validation/)
* [Build Guide: DHT Operations: Warrant operations](/build/dht-operations/#warrant-operations)