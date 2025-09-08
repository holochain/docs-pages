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
At certain points in time, a user may want to check on a peer's good standing in the network, particularly to find out whether they've broken the rules of a hApp or of Holochain itself. The `get_agent_activity` host function lets you get a summary of an agent's current state, including any [**warrants**](/resources/glossary/#warrant) attached to them.
:::

## When do we need to check an agent's state?

If your app involves interactions between peers that require a high level of integrity, such as exchanging value, entering into a contract, or registering a vote, it's important for agents to be able to check the reputation and history of another agent before interacting with them. (We'll call this sort of interaction an 'agreement' in this document.)

In a network where all agents are [authorities](/resources/glossary/#dht-authority) for the full DHT, all invalid data will eventually be discovered by everyone, and their Holochain conductors will automatically block the bad actor at the network level. This happens through the publishing of [**warrants**](/resources/glossary/#warrant). A warrant is a [DHT operation](/build/dht-operations/) that indicates that some agent has broken a rule, either a base Holochain rule or an app-specific rule encoded in a [`validate` callback](/build/validate-callback/). The warrant contains a proof of the bad action, signed by the validator that discovered it, and it's both published to the malicious author's [agent ID](/resources/glossary/#agent-id) and returned any time someone asks for the bad data.

<!-- TODO: remove this when chain fork warrants and blocking are stable -->

!!! info Chain fork warrants aren't available yet {#chain-fork-warrants-future}
Warrants are only produced for operations that fail app or basic system validation rules. Chain forks will be warranted in the future.
!!!

!!! info Blocking isn't operational yet
Malicious agents currently aren't blocked when a warrant is found; this will be implemented in a future release.
!!!

However, in a DHT where agents hold [shards](/resources/glossary/#sharding) of the total data set, not everyone will discover all warrants. They can be discovered actively though: if you call `get`, `get_details`, or `get_links` on an address with invalid data stored at it, the authority will return a warrant to you, and your conductor will check the warrant's validity, remember the warrant, and block the bad actor.

But it's still possible to mistakenly build new graph data on top of invalid data. Actions are split into [DHT operations](/build/dht-operations/) and spread around the DHT to different addresses. The author's agent ID and the action hash will both store partial information about a record's validity, as will the entry hash, the link base addresses, or any other addresses that might be relevant to the action.

This is because code path in a [`validate` callback](/build/validate-callback/) for _one_ operation may find invalid data, but the code path for _another_ operation produced from _the same action_ might not. For example, if the `validate` callback for an [`Update` action](/build/dht-operations/#update) checks that the author has permission to update an entry when it's validating the action's [`RegisterUpdate`](/build/dht-operations/#registerupdate) operation but not when it's validating the [`StoreEntry`](/build/dht-operations/#storeentry) operation, then checking the entry hash for a permission violation won't turn up any problems.

So the best place to check for _all_ invalid operations for an agent is at the agent's public key, which is where other validators of the agent's operations will publish warrants to. You can do this with the [`get_agent_activity`](https://docs.rs/hdk/latest/hdk/chain/fn.get_agent_activity.html) host function, which, among other information, lets an agent discover both chain forks and collected warrants for another agent.

An agent's state is not deterministic, so it's not something you can check in a `validate` callback. Instead, you check for chain forks and warrants in a zome function when you need insight into the integrity of another agent --- like when an agent is about to enter into an agreement.

!!! Warrants are 'sticky'
Once an agent receives a warrant from any source, Holochain validates it to make sure it's legitimate. If it is, Holochain stores it permanently and blocks the warranted agent. This isn't true yet of chain forks, which [don't yet produce warrants](#chain-fork-warrants-future).
!!!

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
        && agent_state.warrants.is_empty()
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
            if !initiator_state.warrants.is_empty() {
                return Ok(ProposalStatus::Invalid);
            }
            if initiator_state.valid_activity.is_empty() {
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
* [Build Guide: `must_get` Host Functions: `must_get_agent_activity`](/build/must-get-host-functions/#must-get-agent-activity)