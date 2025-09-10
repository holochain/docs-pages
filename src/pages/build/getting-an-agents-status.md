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

In a network where all agents are [authorities](/resources/glossary/#dht-authority) for the full DHT, all invalid data will eventually be discovered by everyone, and their Holochain conductors will automatically block the bad actor at the network level. In a sharded network, discovery of bad actors happens instead through the publishing and discovery of [**warrants**](/resources/glossary/#warrant).

A warrant is a [DHT operation](/build/dht-operations/) that proves that some agent has broken a rule, either a base Holochain rule or an app-specific rule encoded in a [`validate` callback](/build/validate-callback/). The warrant contains details of the proof, signed by the validator that discovered it, and the warrant is both published to the malicious author's [agent ID](/resources/glossary/#agent-id) address and returned any time someone asks for any bad data.

<!-- TODO: remove this when chain fork warrants and blocking are stable -->

!!! info Chain fork warrants aren't available yet {#chain-fork-warrants-future}
Warrants are only produced for operations that fail app or basic system validation rules. Chain forks will be warranted in the future.
!!!

!!! info Blocking isn't operational yet {#blocking-future}
Malicious agents currently aren't blocked when a warrant is found; this will be implemented in a future release.
!!!

However, in a DHT where agents hold [shards](/resources/glossary/#sharding) of the total data set, not everyone will discover all warrants. They can be discovered actively though: if you call `get`, `get_details`, or `get_links` on an address with invalid data stored at it, the authority will return a warrant to you, and your conductor will check the warrant's validity, remember the warrant, and block the bad actor.

But it's still possible to mistakenly build new graph data on top of invalid data. Actions are split into [DHT operations](/build/dht-operations/) and spread around the DHT to different addresses. The author's agent ID and the action hash will both store partial information about a record's validity, as will the entry hash, the link base addresses, or any other addresses that might be relevant to the action.

This is because code path in a [`validate` callback](/build/validate-callback/) for _one_ operation may find invalid data, but the code path for _another_ operation produced from _the same action_ might not. For example, if the `validate` callback for an [`Update` action](/build/dht-operations/#update) checks that the author has permission to update an entry when it's validating the action's [`RegisterUpdate`](/build/dht-operations/#registerupdate) operation but not when it's validating the [`StoreEntry`](/build/dht-operations/#storeentry) operation, then checking the entry hash for a permission violation won't turn up any problems.

So the best place to check for _all_ invalid operations for an agent is at the agent's public key, which is where other validators of the agent's operations will publish warrants to. You can do this with the [`get_agent_activity`](https://docs.rs/hdk/latest/hdk/chain/fn.get_agent_activity.html) host function, which, among other information, lets an agent discover both chain forks and collected warrants for another agent.

An agent's state is not deterministic, so it's not something you can check in a `validate` callback. Instead, you check for chain forks and warrants in a zome function when you need insight into the integrity of another agent --- like when an agent is about to enter into an agreement.

!!! Warrants are 'sticky'
Once an agent receives a warrant from any source, Holochain validates it to make sure it's legitimate. If it is, Holochain stores it permanently. (In the future, they'll also [block the warranted agent](#blocking-future)). This isn't true yet of chain forks, which [don't yet produce warrants](#chain-fork-warrants-future).
!!!

## Get the status of an agent

To check an agent for chain forks and warrants, call `get_agent_activity` with [`ActivityRequest::Status`](https://docs.rs/hdk/latest/hdk/prelude/enum.ActivityRequest.html#variant.Status) and empty chain query filters. This will tell you whether their state is currently valid, without returning their whole source chain.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn is_agent_currently_safe_to_interact_with(agent: AgentPubKey) -> ExternResult<bool> {
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

When you're writing an agreement-based program flow, it's good practice to start with some sort of 'proposal' entry, which the initiator commits to their source chain, publishes, and sends to the receiving party. The receiving party can then use `get_agent_activity` to check that validators in the DHT actually received the entry, consider it valid, and haven't seen any conflicting proposals.

Because the DHT is eventually consistent, it's also a good idea for the receiving party to wait a short period --- perhaps scaled to the level of risk involved in the agreement --- to allow validators to gossip possible validation errors or chain forks with each other.

```rust
use hdk::prelude::*;

#[derive(Serialize, Debug)]
pub enum ProposalStatus {
    /// The proposal hasn't appeared at the agent ID authority yet.
    NotAvailable,
    /// No invalid or conflicting actions observed yet. A problem may be
    /// discovered in the future, but hopefully we've waited long enough for
    GoodSoFar,
    /// The proposal may be invalid, either because the agent ID authority
    /// discovered a chain-based error or another op authority discovered
    /// an issue and sent a warrant to the agent ID authority.
    /// The proposal may also be valid but follow after a prior invalid action.
    /// Either way, the initiator is a bad actor.
    Invalid,
}

#[derive(Deserialize, Debug)]
pub struct IsProposalCurrentlyGoodInput {
    pub initiator: AgentPubKey,
    pub proposal_hash: ActionHash,
}

// To be called by the front end at intervals -- first, in a polling loop
// until it stops reporting `ProposalStatus::NotAvailable`, and then, if it
// reports `ProposalStatus::GoodSoFar`, calling it again after a suitable delay
// to allow authorities to discover and report evidence of bad activity.
#[hdk_extern]
pub fn is_proposal_currently_good(input: IsProposalCurrentlyGoodInput) -> ExternResult<ProposalStatus> {
    let initiator_state = get_agent_activity(
        input.initiator,
        ChainQueryFilter::new()
            // Here we're only asking for the proposal record, nothing earlier.
            // We just want to know it's been published and validated.
            // Since we're dealing with a 'scarce' resource like an account
            // balance or the right to vote, we'd also want to check the whole
            // chain to make sure the resource hasn't already been used up.
            // You can read more about building a chain query filter at
            // https://developer.holochain.org/build/querying-source-chains/#filtering-a-query
            .sequence_range(ChainQueryFilterRange::ActionHashTerminated(input.proposal_hash, 0)),
        ActivityRequest::Full,
    )?;

    match initiator_state.status {
        ChainStatus::Forked(_) => Ok(ProposalStatus::Invalid),
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
                // The initiator doesn't seem to have published their proposal
                // to the authority we've contacted yet.
                return Ok(ProposalStatus::NotAvailable);
            }
            Ok(ProposalStatus::GoodSoFar)
        }
    }
}
```

!!! info Conflicts over scarce resources
When you're dealing with a proposal over a 'scarce' resource --- something that can be 'used up' such as a voting privilege, an account balance, or a unique name --- you want to check that nothing conflicts with the agreement being proposed. There are two kinds of conflict:

* _Prior actions that have already used up the resource_ --- you can deal with this deterministically by writing validation code that walks back through the source chain.
* _Actions in an alternative timeline_, or **source chain fork** --- there is no perfect protection against this, because a malicious agent may publish an action that forks a chain years down the road. However, if you use the pattern above, you can reasonably hope to detect an attempt to create two forks simultaneously (what blockchain folks call a 'double spend').

No distributed system is perfectly secure against conflict; if you're building a hApp with high-risk use cases, we recommend that you get your code audited.
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