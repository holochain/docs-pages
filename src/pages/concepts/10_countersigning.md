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

## Agreement versus consensus

If you're familiar with client/server or blockchain architectures, you might be surprised that Holochain doesn't attempt to maintain a consensus about global state. As you saw when you learned about the [source chain](../3_source_chain/), each participant is responsible for their own local state.

It might sound messy, but it's how the real world works. When we're busy about our day, we don't constantly check a public "record of everything everyone did" to make sure we're not getting in each other's way. We just do things. And when we want to coordinate our actions with other people, we arrange it with them directly.

We believe that, for the vast majority of applications involving transactions, this --- plus validation by a selection of random witnesses --- is all that's needed.

Holochain lets you do this through **countersigning**. In this process, two or more parties agree on the contents of a single entry, then write that entry to all of their chains within an agreed-upon time period. It's hard to manage the communication to reach a reasonable level of atomicity, so that's why it's built into the framework rather than being something you have to build yourself. The human negotiation steps beforehand, and some of the data transfer steps, are left for you to build however you like. But the core of the functionality --- the steps that ensure safety for everyone, as well as all the data structures --- are all provided.

## The countersigning process

In order to safely coordinate the writing of a single new action to both of their source chains, Alice and Bob have to be able to:

1. Lock their source chains at a certain point,
2. Check that the action to be written will be valid from both of their perspectives,
3. Tentatively publish the action in a way that lets them back out if something goes wrong,
4. Wait for evidence that the other party to do the same thing, and
5. Complete the write and permanently publish the whole thing to the DHT if everything's successful, or back out if it's not, and unlock their source chains.

Here's a more in-depth look at this process. Keep in mind that it's meant to be an automated process, finished within a few seconds while Alice and Bob are both online. Any human agreement (such as negotiating meeting times, contract terms, or transaction details) should happen beforehand.

1. Alice creates a **preflight request** containing:

    * The parties involved (her and Bob)
    * The hash of the entry that will eventually be countersigned
    * The time window in which the countersigning must complete
    * A stub of the action to go along with the entry, which contains its action type and entry type (currently create-entry and update-entry actions can be countersigned; in the future delete-entry, create-link, and delete-link actions can be too)
    * Optional application data

2. Alice sends the preflight request to Bob for approval. (You can implement this any way you like, but a [remote call](../8_calls_capabilities/) is probably the most reliable.) At this stage, Bob could use his history with Alice, or the optional application data, to determine whether the request is even relevant to him.

3. Bob tries to accept the preflight request. At this point, he doesn't know or care what he's being asked to countersign. All he's doing is checking whether he can safely lock his chain from now until the end of the time window Alice specified and create an action with Alice's specified start time --- that is, whether his source chain is at risk of having a timestamp that's too far in the past or future. If everything looks good, the conductor locks Bob's source chain.

4. Bob's conductor produces a **preflight response**, containing a signature on the request and the point at which Bob's source chain is currently locked. Bob sends the preflight response back to Alice.

5. Alice receives Bob's preflight response, then tries to accept the request herself. Now her own source chain is locked, and she has two preflight responses --- Bob's and her own.

6. Alice compiles both the preflight responses into a **countersigning session data** structure, containing the original agreed-upon preflight request and all the responses. She shares it with Bob (again, this could be done with a remote call).

7. Alice and Bob both create the entry to be countersigned on their own machines, using information they've previously shared with each other (remember, the preflight was simply an agreement to lock their source chains). Then they attempt to commit the entry, which includes the countersigning session data structure and the application data.

8. At this point the conductor takes over completely. As with any commit, it attempts to validate the new action. But with a countersigned action, the conductor validates it multiple times --- once from the perspective of each party. This is possible because the countersigning session data structure contains the current states of all signing parties' source chains. Alice can't construct a signature for Bob's action, but she can construct the rest of the action and validate it.

9. Once validation is finished, Alice and Bob both 'pre-publish' the new action to the DHT --- but only to the entry authorities. This shows their intention to fully commit the action once they see each other do the same. Because the entry hash is the same for both of them, it'll go to the same set of DHT authorities. At this point the data only exists temporarily on the DHT.

10. Once those authorities have collected all actions, they send the full action set to both Alice and Bob. (However, if Alice and Bob reach the end of the time window without receiving this action set, their conductors discard the new action and unlock their source chains as if nothing had happened. Likewise, the authorities discard the pre-published data if they don't collect all the required signatures within the time window. There is no built-in feature to retry an expired session, but it could be built into the application.)

11. When Alice and Bob's conductors each receive the full action set, they finally commit the action to their source chains and unlock them. This causes information to be published to the entry, action, and agent activity authorities, creating a permanent record on the DHT of all parts of the transaction.

## Enzymatic countersigning

Normally, counterparties publish their actions to a DHT neighbourhood and hope that there are enough honest and reliable agents there to collect and return a full set of signed actions to everyone. But this can lead to dishonest DHT authorities withholding a complete set of signatures, publishing them later when a counterparty has given up. This causes the poor counterparty to appear as if they've forked their source chain.

To counter this problem, the counterparties can nominate them as an **enzyme**. The enzyme is typically an agent that all counterparties can trust, with no stake in the transaction, and they participate in the session only as a witness. It's their job to collect all the signatures and send them to the other counterparties. The data they sign includes the signatures of all the other counterparties. As the collector and final signer, they definitively determine whether the session was successful within the time period.

Note that this gives an enzyme the same power as a malicious DHT authority, but at least peers can explicitly name who they trust. The initiator of a session can even nominate themselves or another counterparty.

## What about double spending?

If you're familiar with blockchains, you might be wondering, _how does countersigning deal with 'double spending'?_ Countersigning, because it allows two or more parties to reach an agreement on something and publish the agreement, sounds like it might be an answer to this problem. The plain answer, though, is that **it isn't**.

You could see a blockchain as simply **a mechanism for determining what doesn't exist**, by making a decision about what _does_ exist in a distributed system and rejecting all other possibilities. Many transactional applications, such as currencies and transfer-of-title contracts (also known as non-fungible tokens or <abbr>NFTs</abbr>), depend on this feature to prevent one asset from being transferred simultaneously to two different people. The recipient of an asset can be assured that an alternative transaction involving the same asset doesn't secretly exist.

Holochain, on the other hand, merely equips all peers to **detect** [source chain](../3_source_chain/) 'forks', which are the agent-centric equivalent of a double-spend, after they've happened. This lets peers avoid interacting with bad actors. This happens through the [peer witnessing](../4_dht/#a-cloud-of-witnesses) of the agent activity authorities.

For reasonably safe environments, this is likely to discourage forks simply because people will be unwilling to jeopardize their long-term involvement. But in low-trust environments where counterfeit ('Sybil') agents are easy to create, or where people stand to gain from a fork even if they're ejected from a network, this might not be enough.

If your application needs something more, you can build in strategies to discourage, prevent, or detect a double-spend attempt as it's happening. The simplest of these is to nominate an enzyme as a 'trusted notary', a witness whose job is to record agents' histories on its source chain and look for forks --- similar to agent activity authorities, but with the benefit of the determinism of a single source chain. Essentially, the enzyme becomes a consensus-maker.

## M-of-N optional witnesses

Countersigning agents can also nominate **optional witnesses** to sign the transaction. This can be used to create a 'lightweight consensus', in which a majority of trusted witnesses confirm, before signing, that no counterparty is attempting to fork their source chain. One of the witnesses must be an enzyme who collects all the required and optional signatures.

While this requires more network chatter, it can tolerate more hardware and network failure than a single enzyme. Although an enzyme is still required, the enzyme role can be chosen at random or by rotation from among the pool of witnesses.

## Key takeaways

* Countersigning allows two or more agents to reach a shared understanding of each other's source chains in order to simultaneously write a new action to all of them.
* Countersigning is an automated, non-interactive process that happens within a short time window, once all human agreements have been finalized.
* All participating counterparties must be online for the entire countersigning session.
* Countersigning begins with the sharing of a preflight, in which one party proposes a session time window, the hash of the entry to be signed, and the list of signers.
* Countersigning proceeds from preflight to the session once all counterparties have seen each other's preflight signatures as an expression of intent to participate.
* Before writing the new record to their source chain, each party pre-publishes the action to the DHT, expressing their commitment to write it to their source chain if all the others do as well.
* Once the DHT peers have collected the full list of actions, they broadcast them to all parties.
* Once each party receives all counterparties' actions, they commit the new action to their own source chain and publish it to the DHT permanently.
* If a countersigning session times out before a party receives all counterparties' actions, they may abandon the session. The DHT peers will also discard the pre-published entry and actions.
* A party's source chain is locked for the entire countersigning session time window, until the session succeeds or times out.
* One counterparty can be nominated an enzyme, who collects all signatures, signs the full signature set, and distributes the set to the other counterparties.
* Optional witnesses can be added to the session, a majority of whom must also sign it, and one of whom must be an enzyme.
* Countersigning is not for preventing double-spends; it's only for atomically synchronizing a single write to multiple source chains.
* Enzymatic countersigning and M-of-N optional signers can be used to create various forms of lightweight consensus by recording agent actions on their source chains.