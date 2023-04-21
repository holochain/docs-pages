---
title: "Countersigning: Reaching Agreement Between Peers"
---

::: coreconcepts-intro
Although there's no global consensus in a Holochain application, it's sometimes useful for two or more parties to record shared agreements. Countersigning allows them to coordinate the writing of a single entry across all their source chains.
:::

::: coreconcepts-orientation
### What you'll learn

1. [Differences between Holochain, client/server, and blockchain](#agreement-versus-consensus)
2. [How countersigning works](#the-countersigning-process)
3. [How to nominate witnesses](#enzymatic-countersigning)
4. [What countersigning doesn't do](#what-about-double-spending)
5. [How to prevent double-spends](#m-of-n-optional-witnesses)

### Why it matters

A lot of human interactions involve formal transactions of one sort or another. These are usually conducted in a peer-to-peer way --- that is, as an exchange of information among the people who are directly involved. Payments, legal agreements, property transfers, and even chess moves require parties to reach a **shared understanding** of the states of one another's worlds, then coordinate a **shared change** to those states. Because this is such a common pattern, we built it right into Holochain.
:::

![](/assets/img/concepts/10.1-countersigning.png){.sz80p} {.center}

## Agreement versus consensus

If you're familiar with client/server or blockchain architectures, you might be surprised that Holochain doesn't attempt to maintain a consensus about global state. As you saw when you learned about the [source chain](../3_source_chain/), each participant is responsible for their own local state.

It might sound messy, but it's how the real world works. When we're busy about our day, we don't constantly check a public "record of everything everyone did" to make sure we're not getting in each other's way. We just do things. And when we want to coordinate our actions with other people, we arrange it with them directly.

We believe that, for the vast majority of applications involving transactions, this --- plus witnessing by a selection of random peers --- is all that's needed.

Holochain lets you do this through **countersigning**. In this process, two or more parties agree on the contents of a single entry, then write that entry to all of their chains within an agreed-upon time period. It's hard to manage the communication necessary for reaching a reasonable level of atomicity, so that's why it's built into the framework rather than being something you have to build yourself. The human agreement on the content beforehand, and some of the data transfer steps, are left for you to build however you like. But the core of the functionality --- in which everybody does their best to make the commit atomic for all counterparties' source chains --- is all provided.

## The countersigning process

In order to safely coordinate the writing of a single new action to both of their source chains, Alice and Bob have to be able to:

1. Lock their source chains at an agreed-upon point,
2. Check that the action to be written will be valid from the perspective of both of their states,
3. Tentatively publish the action in a way that lets them back out if something goes wrong,
4. Wait for evidence that the other party has done the same thing, and
5. Complete the write and permanently publish the whole thing to the DHT if everything's successful, or back out if it's not, and
6. Unlock their source chains.

Here's a more in-depth look at this process. Keep in mind that it's meant to be an automated process, finished within a few seconds while Alice and Bob are both online. Any human agreement (such as negotiating meeting times, contract terms, or transaction amount) should happen beforehand.

::: coreconcepts-storysequence

![](/assets/img/concepts/10.2-entry-exchange.png){.sz80p} {.center}

Alice and Bob exchange the details needed to create the entry that will be countersigned.

![](/assets/img/concepts/10.3-preflight.png){.sz80p} {.center}

Alice creates a **preflight request** containing:

    * The parties involved (her and Bob in this case)
    * The hash of the entry that will be countersigned
    * The time window in which the countersigning must complete
    * A stub of the action to go along with the entry, which contains its action type and entry type (currently create-entry and update-entry actions can be countersigned; in the future delete-entry, create-link, and delete-link actions will be too)
    * Optional arbitrary application data

![](/assets/img/concepts/10.4-preflight-send.png){.sz80p} {.center}

Alice sends the preflight request to Bob for approval. (You can implement this any way you like, but a [remote call](../8_calls_capabilities/) is probably the best.) At this stage, Bob could use his history with Alice, or the optional application data, to determine whether the request is something he wants to accept. Acceptance could be automated, or it could request Bob's intervention via a signal to his UI.

![](/assets/img/concepts/10.5-preflight-inspection.png){.sz80p} {.center}

Bob's conductor attempts to accept the preflight request, which involves checking whether it is possible to write a countersigned record (that is, there are no incomplete countersigning sessions or pending source chain writes, and Alice's specified time window doesn't conflict with Bob's system clock). If everything looks good, Bob's conductor locks his source chain.

![](/assets/img/concepts/10.6-bob-lock.png){.sz80p} {.center}

Bob's conductor produces a **preflight response**, containing his signature on the request and the record ID at which his source chain is currently locked. Bob sends this preflight response back to Alice.

![](/assets/img/concepts/10.7-alice-lock.png){.sz80p} {.center}

Alice receives Bob's preflight response, then tries to generate a preflight response herself from the request she created. Now her own source chain is locked as well.

![](/assets/img/concepts/10.8-countersigning-session.png){.sz80p} {.center}

Alice compiles both the preflight responses into a **countersigning session** structure, containing the original agreed-upon preflight request and all the responses. She shares it with Bob (again, this could be done with a remote call).

![](/assets/img/concepts/10.9-trial-commit.png){.sz80p} {.center}

Alice and Bob both create the entry to be countersigned on their own machines, which contains both the countersigning session data structure and the app data they'd previously agreed on. Then they do a trial run of committing the entry.

![](/assets/img/concepts/10.10-validate.png){.sz80p} {.center}

At this point Alice and Bob's conductors take over completely from the cells. As with any commit, they attempt to validate the new action. But with a countersigned action, each participant's conductor validates it multiple times --- once from their own perspective, and once from the perspective of all the other parties. This is possible because Alice and Bob both have the same countersigning session data structure, which contains the current states of both of their source chains. If this step didn't happen, DHT validating authorities would [warrant](../7_validation/#invalid-entry) all parties for neglect, not just the one for whom the action was invalid.

![](/assets/img/concepts/10.11-authorities-collect.png){.sz80p} {.center}

Once validation is finished, Alice and Bob both do a trial run of publishing the operations generated by the new action to the DHT --- but only the [store entry operations](../4_dht/#a-cloud-of-witnesses). The authorities collect the data but don't integrate it into their DHT stores; right now they're simply acting as witnesses who wait until they've seen the operations from both Alice and Bob.

![](/assets/img/concepts/10.12-authorities-distribute.png){.sz80p} {.center}

Once the authorities have collected all the data, they send the full set of actions back to both of them.

!!! info Timeouts
If Alice and Bob reach the end of the time window without receiving this action set, their conductors discard the new action and unlock their source chains as if nothing had happened. Likewise, the authorities discard the pre-published data if they don't collect all the required signatures within the time window. There is no built-in feature to retry an expired session, but it could be built into the application.
!!!

![](/assets/img/concepts/10.13-commit-and-publish.png){.sz80p} {.center}

When Alice and Bob's conductors each receive the full set of actions, they finally unlock their source chains, commit the actions, and publish _all_ the resulting operations to the DHT as normal. This creates a permanent, public record of all parts of the transaction.
:::

## Enzymatic countersigning

![](/assets/img/concepts/10.14-enzyme.png){.sz80p} {.center}

Normally, counterparties publish their actions to a DHT neighborhood and hope that there are enough honest and reliable validation authorities there to collect and return a full set of signed actions to everyone. But this can put them at risk; if the neighborhood contains authorities who either are malicious, have slow network connections, or have inaccurate clocks, it's possible, for some counterparties to see all signatures within the time window while others have not. This would cause some to complete the session and others to back out, after which any later writes could be seen as attempts to rewrite history.

To counter this problem, the counterparties can nominate an **enzyme**. The enzyme is typically an agent that all counterparties can trust, with no stake in the transaction, who participates in the session only as a witness. It's their job to collect all the signatures and send them to the other counterparties. The data they sign includes all signatures as well as their own. As the collector and final signer, they definitively determine whether the session was successful within the time period.

Note that this still carries the same risks as allowing DHT authorities to be witnesses --- an enzyme can report conflicting results to different counterparties, or simply not manage to deliver news of completion to one counterparty in time. But at least it can reduce the chances of that happening, and it gives peers a chance to explicitly name a peer they trust.

## What about double spending?

If you're familiar with blockchains, you might be wondering, _how does countersigning deal with 'double spending'?_ Countersigning, because it allows two or more parties to reach an agreement on something and publish the agreement, sounds like it might be an answer to this problem. The plain answer, though, is that **it isn't**.

You could see a blockchain as simply **a mechanism for determining what doesn't exist**; that is, a means of making a decision about what _does_ exist in a distributed system and rejecting all other possibilities. Many transactional applications, such as currencies and transfer-of-title contracts (also known as non-fungible tokens or <abbr>NFTs</abbr>), depend on this feature to prevent one asset from being transferred to two different people simultaneously. Because there's only one shared history, the recipient of an asset can be assured that an alternative transaction involving the same asset doesn't secretly exist.

Holochain, on the other hand, merely equips all peers to **detect** [source chain](../3_source_chain/) forks, which are the agent-centric equivalent of a double-spend, after they've happened. This lets peers avoid interacting with known bad actors.

For reasonably safe environments, this is likely to discourage forks simply due to the threat of ejection from a network. But in low-trust environments where counterfeit ('Sybil') agents are easy to create, or where people stand to gain from a fork even if they have to suffer the consequences, this might not be enough.

If your application needs something more, you can build in strategies to discourage, prevent, or detect a double-spend attempt as it's happening. The simplest of these is to nominate an enzyme as a 'trusted notary', a witness whose job is to record agents' histories on its own source chain and decline to participate in any sessions that would cause forks in any counterparty's source chain --- similar to agent activity authorities, but with the benefit of the determinism of a single history. Essentially, the enzyme becomes a consensus-maker.

## M-of-N optional witnesses

![](/assets/img/concepts/10.15-m-of-n-witnesses.png){.sz80p} {.center}

A countersigning session initiator can also nominate **optional witnesses** to sign the transaction. This can be used to create a 'lightweight consensus', in which a majority of trusted witnesses must confirm, before signing, that no counterparty is attempting to fork their source chain. One of the witnesses must be an enzyme who collects all the required and optional signatures.

While this requires more network chatter, it can tolerate more hardware and network failure than a single enzyme. Although an enzyme is still required, the enzyme role can be rotated among the pool of witnesses.

## Key takeaways

* Countersigning allows two or more agents to reach a shared understanding of each other's source chains in order for them to simultaneously write a single new action.
* Countersigning is an automated, non-interactive process that happens within a short time window, once all human negotiations have been finalized.
* All participating counterparties must be online for the entire countersigning session.
* Countersigning begins with the sharing of a preflight, in which one party proposes a session time window, the hash of the entry to be signed, and the list of signers.
* Countersigning proceeds from preflight to the session once all counterparties have seen each other's preflight signatures as an expression of commitment.
* Before writing the new record to their source chain, each party pre-publishes the action to the DHT, letting their expression of commitment become a public record.
* Once the DHT peers have collected the full list of actions, they broadcast them to all parties.
* Once each party receives all of their counterparties' actions, they commit the new action to their own source chain and publish it to the DHT permanently.
* If a countersigning session times out before a party receives all counterparties' actions, they may abandon the session. The DHT peers will also discard the pre-published entry and actions.
* A counterparty's source chain is locked for the entire countersigning session time window, until the session succeeds or times out.
* One counterparty can be nominated an enzyme, who collects all signatures, signs the full signature set, and distributes the set to the other counterparties.
* Optional witnesses can be added to the session, a majority of whom must also sign it, and one of whom must be a non-optional enzyme.
* Countersigning is not for preventing double-spends; it's only for atomically synchronizing a single write to multiple source chains.
* Enzymatic countersigning and M-of-N optional signers can be used to create various forms of robust witnessing and lightweight consensus.

### Next Up

[Learn about lifecycle events →](..//){.btn-purple}