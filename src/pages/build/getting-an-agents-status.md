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

In a network where all agents are [authorities](/resources/glossary/#dht-authority) for the full DHT, all invalid data will eventually be discovered by everyone, and their Holochain conductors will automatically block the bad actor at the network level. In a [sharded](/resources/glossary/#sharding) network, however, news of bad actors spreads instead through the publishing and discovery of [**warrants**](/resources/glossary/#warrant).

A warrant is a [DHT operation](/build/dht-operations/) that proves that some agent has broken a rule, either a base Holochain rule or an app-specific rule encoded in a [`validate` callback](/build/validate-callback/). The warrant contains details of the proof, signed by the validator that discovered it, and the warrant is published to the malicious author's [agent ID](/resources/glossary/#agent-id) address.

<!-- TODO: remove this when chain fork warrants and blocking are stable -->

!!! info Chain fork warrants aren't operational yet {#chain-fork-warrants-future}
Warrants are only produced for operations that fail app or basic system validation rules. Chain forks will be warranted in the future.
!!!

!!! info Blocking isn't operational yet {#blocking-future}
Malicious agents currently aren't blocked when a warrant is found; this will be implemented in a future release.
!!!

Although most `get*` host functions filter out invalid data or at least flag it as invalid, it's still possible to miss something, and end up building new data on top of bad data. This is because actions are split into [DHT operations](/build/dht-operations/) and spread around the DHT to different addresses. Depending on which operation a validator receives, they might run a different code path in your [`validate` callback](/build/validate-callback/).

Here's an example: let's say that, in order to optimize performance of your `validate` callback for an [`Update` action](/build/dht-operations/#update) on a certain entry type, the code path for the [`RegisterUpdate`](/build/dht-operations/#register-update) operation checks that the author of the new entry matches the author of the old entry, but the code paths for the [`StoreEntry`](/build/dht-operations/#store-entry) and [`StoreRecord`](/build/dht-operations/#store-record) operations skip this check. In this case, checking the old entry or action hash for invalid updates will expose the same-author validation failure, but checking the new entry or action hash will not.

So the best place to check for _all_ invalid operations for an agent is at their public key, which is where all validators of their operations will publish warrants to. You can do this with the [`get_agent_activity`](https://docs.rs/hdk/latest/hdk/chain/fn.get_agent_activity.html) host function, which, among other information, lets an agent discover another agent's chain forks, collected warrants, and invalid data.

An agent's state is not deterministic, so it's not something you can check in a `validate` callback. Instead, you check for chain forks and warrants in a zome function when you need insight into the integrity of another agent --- like when you're about to enter into an agreement with that agent.

!!! info Warrants are 'sticky'
Once an agent receives a warrant, their conductor validates it to make sure it's legitimate. If it is, it's stored permanently. (In the future, they'll also [block the warranted agent](#blocking-future)). Currently warrants are discovered via `get_agent_activity` only, not other `get*` host functions, although that is set to change in the future as well. <!-- TODO: update these when things change -->
!!!

## Get the status of an agent

To check an agent for chain forks and warrants, call `get_agent_activity` with [`ActivityRequest::Status`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/enum.ActivityRequest.html#variant.Status) and empty chain query filters. This will tell you whether their state is currently valid, without returning their whole source chain.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn is_agent_currently_safe_to_interact_with(agent: AgentPubKey) -> ExternResult<bool> {
    let agent_state = get_agent_activity(
        agent,
        // Chain filters are ignored when you use `ActivityRequest::Status`, so
        // just give an empty filter.
        ChainQueryFilter::new(),
        ActivityRequest::Status,
    )?;

    // The agent is safe if their chain has no forks or invalid data,
    // and no warrants have been created or discovered.
    Ok(
        matches!(agent_state.status, ChainStatus::Valid(_))
        && agent_state.warrants.is_empty()
    )
}
```

!!! info Warrants and chain forks are eventually consistent
The absence of a warrant or chain fork doesn't necessarily mean an agent is in good standing; it simply means _no evidence of rule-breaking has been discovered yet_ by the authority the calling agent has queried. However, most authorities with good connectivity to their [neighbors](/resources/glossary/#neighbor) will discover invalid data and chain forks and publish warrants within seconds after the data is published.
!!!

## Check the validity of a published action

As mentioned above, most of the `get*` host functions return only a partial picture of an action's validity, based on the validator's perspective. You can also use `get_agent_activity` with [`ActivityRequest::Full`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/enum.ActivityRequest.html#variant.Full) to get a fuller picture of one or more actions' validity as reported by _all_ validators.

This is especially important when you're writing an agreement-based program flow. It's good practice to start with some sort of 'proposal' entry, which the initiator commits to their source chain, publishes, and sends to a receiving party. That party can then commit their own 'acceptance' entry, but only after they use `get_agent_activity` to check that validators in the DHT actually received the entry, consider it valid, and haven't seen any proposal entries that conflict with it.

The next example is a zome function that tries to determine whether a 'proposal' action is currently in 'good standing' --- whether it exists and is valid as part of an un-forked source chain. It's meant to be called by the front end at intervals --- first, in a polling loop until it stops reporting `ProposalStatus::NotAvailable`, and then, if it reports `ProposalStatus::GoodSoFar`, calling it again after a suitable delay to allow authorities to discover and report evidence of bad activity.

Because the DHT is eventually consistent, it's a good idea for the checking party to wait a short period --- perhaps scaled to the level of risk involved in the agreement --- to allow validators to gossip possible validation errors or chain forks with each other.

```rust
use hdk::prelude::*;

#[derive(Serialize, Debug)]
pub enum ProposalStatus {
    /// The proposal hasn't appeared at the agent ID authority yet.
    NotAvailable,
    /// No invalid or conflicting actions observed yet. A problem may be
    /// discovered in the future.
    GoodSoFar,
    /// Either the agent ID authority discovered a chain-based error or another
    /// op authority discovered an issue and sent a warrant to the agent ID
    /// authority.
    /// The proposal may also be valid but follow after a prior invalid action.
    /// Either way, the author is a bad actor.
    BadActor,
}

#[derive(Deserialize, Debug)]
pub struct IsProposalCurrentlyGoodInput {
    pub initiator: AgentPubKey,
    pub proposal_hash: ActionHash,
}

#[hdk_extern]
pub fn is_proposal_currently_good(input: IsProposalCurrentlyGoodInput) -> ExternResult<ProposalStatus> {
    let initiator_state = get_agent_activity(
        input.initiator,
        ChainQueryFilter::new()
            // Retrieve just the proposal; we only need to know it exists and
            // is valid.
            .sequence_range(ChainQueryFilterRange::ActionHashTerminated(input.proposal_hash, 0)),
        ActivityRequest::Full,
    )?;

    match initiator_state.status {
        ChainStatus::Forked(_) => Ok(ProposalStatus::BadActor),
        ChainStatus::Invalid(_) => Ok(ProposalStatus::BadActor),
        // The author doesn't appear to have created a source chain.
        ChainStatus::Empty => Ok(ProposalStatus::NotAvailable),
        ChainStatus::Valid(_) => {
            // AgentActivity::status doesn't account for warrants.
            // We have to check for them as a separate step.
            if !initiator_state.warrants.is_empty() {
                // Although we receive all warrants, even ones that don't apply
                // to the actions matched by our filter query, we consider even
                // a single warrant as evidence of a bad actor.
                return Ok(ProposalStatus::BadActor);
            }
            if initiator_state.valid_activity.is_empty() {
                // The author doesn't seem to have published their proposal to
                // the authority we've contacted yet.
                return Ok(ProposalStatus::NotAvailable);
            }
            Ok(ProposalStatus::GoodSoFar)
        }
    }
}
```

!!! info Conflicts over scarce resources
When an action deals with a 'scarce' resource --- something that can be 'used up' such as a voting privilege, an account balance, a unique name, or a publishing rate limit --- you want to check that nothing conflicts with the action. There are two kinds of conflict:

* _Prior actions that have already used up the resource_ --- you can deal with this deterministically by [writing validation code for the `RegisterAgentActivity` operation](/build/must-get-host-functions/#must-get-agent-activity) that walks back through the source chain looking for conflicts.
* _Actions in an alternative timeline_, or **source chain fork** --- there is no perfect protection against this, because a malicious agent may publish an action that forks a chain at any time, even years later. However, if you use the pattern above, you can reasonably hope to detect an attempt to create two forks simultaneously (what blockchain folks call a 'double spend').

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