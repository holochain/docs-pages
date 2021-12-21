# 10. Countersigning: Reaching Agreement Between Peers

!!! note
    This page describes an incomplete feature. The basics of countersigning are implemented, but the 'enzyme' feature isn't.

<div class="coreconcepts-intro" markdown=1>
Without a global ledger, there's no global consensus in a Holochain application. However, it's sometimes useful for two or more parties to reach shared agreements. Countersigning allows them coordinate the writing of a single entry across all their source chains.
</div>

<div class="coreconcepts-orientation" markdown=1>
### What you'll learn

1. [Differences between Holochain, client/server, and blockchain](#agreement-versus-consensus)
2. [How countersigning works](#the-countersigning-process)
3. [What countersigning doesn't do](#what-about-double-spending)

### Why it matters

A lot of human interactions involve formal transactions of one sort of another. These are usually conducted in a peer-to-peer way --- that is, as an exchange of information among the people who are directly involved. Payments, legal agreements, property transfers, and even chess moves require parties to reach a **shared understanding** of the states of one another's worlds, then coordinate a **shared change** to those states. Because this is such a common pattern, we built it right into Holochain.
</div>

## Agreement versus consensus

If you're familiar with client/server or blockchain architectures, you might be surprised that Holochain doesn't attempt to maintain a single source of truth. As you saw when you learned about the [source chain](../3_source_chain/), each participant is responsible for their own journal of application state changes. 

It might sound messy, but it's how the real world works. When we're busy about our day, we don't constantly check a public "record of everything everyone did" to make sure we're not getting in each other's way. We just do things. And when we want to coordinate our actions with other people, we arrange it with them directly, sharing information with them so we can can all reach a clear agreement.

We believe that, for the vast majority of applications involving transactions, this is all that's needed.

Holochain lets you do this through **countersigning**. In this process, two or more parties synchronize the states of their source chains at the same time. There's a lot that could go wrong in this process, so that's why it's built into the framework rather than being something you have to build yourself.

## The countersigning process

In order to safely coordinate the writing of a single new element to both of their source chains, Alice and Bob have to be able to:

1. Lock their source chains at a certain point,
2. Check that the write will be valid from both their perspective and the other party's,
3. Write the element to their source chains and publish it in a way that lets them back out if something goes wrong,
4. Wait for the other party to do so, and
5. Complete the write if everything's successful, or back out and unlock their chains if it's not.

Here's a more in-depth look at this process. Keep in mind that it's meant to be an automated process, finished within a few seconds while Alice and Bob are both online. Any human agreement (such as negotiating meeting times, contract terms, or transaction details) should happen beforehand.

1. Alice creates a **preflight request** containing:
    * The parties involved (her and Bob)
    * The eventual hash of the entry that will be countersigned
    * The time window in which the countersigning must complete
    * A stub of the header to go along with the entry, which contains its action type and entry type (currently create-entry and update-entry actions can be countersigned; in the future delete-entry, create-link, and delete-link actions will be too)
    * Optional application data

2. Alice sends the preflight request to Bob for approval. (You can implement this any way you like, but a [remote call](../8_calls_capabilities/) is probably the most reliable.)

3. Bob tries to accept the preflight request. At this point, he doesn't know or care what he's being asked to countersign (although his previous interactions with Alice, and the optional application data, will likely give him a clue). All he's doing is checking whether he can safely lock his chain from now until the end of the time window Alice specified and create an element with Alice's specified start time. Bob's source chain is now locked.

4. If Holochain has checked that Bob's current state lets him participate in the countersigning, it produces a **preflight response**, containing a signature on the request and Bob's current locked source chain point. Bob sends the preflight response back to Alice.

5. Alice receives Bob's preflight response, then tries to accept the request herself. Now her own source chain is locked, and she has two preflight responses --- Bob's and her own.

6. Alice compiles both the preflight responses into a **countersigning session data** structure, containing the original agreed-upon preflight request and all the responses. She shares it with Bob.

7. Alice and Bob both create the entry to be countersigned on their own machines, using information they've previously shared with each other (remember, the preflight was simply an attempt to lock both chains for a time window). Then they attempt to commit the entry, along with the countersigning session data structure.

8. At this point the conductor takes over completely. As with any commit, it attempts to validate the new element. But with a countersigned element, the conductor validates it multiple times --- once from the perspective of each party. This is possible because the countersigning session data structure contains the current states of all signing parties' source chains. Alice can't construct a signature for Bob's header, but she can construct the rest of the header and validate it.

9. Once validation is finished, Alice and Bob both publish the new element, with their own header, to the DHT --- but only to the entry authorities. Because the entry hash is the same for both of them, it'll go to the same set of authorities.

10. Once those authorities have collected all headers, they send the full header set to both Alice and Bob. (If Alice and Bob reach the end of the time window without receiving this header set, however, their conductors roll back and unlock their source chains as if nothing had happened.)

11. When Alice and Bob's conductors each receive the full header set, they finally commit the element to their source chains. This causes information to be published to the header authorities and agent activity authorities, creating a full record on the DHT of all parts of the transaction.

12. Alice and Bob's source chains are now unlocked.

## What about double spending?

If you're familiar with blockchains, you might be wondering, _how does countersigning deal with 'double spending'?_ Countersigning, because it allows two or more parties to reach an agreement on something, sounds like it might be an answer to this problem of distributed systems. The plain answer, though, is that **it isn't**.

You could see a blockchain as simply **a mechanism for determining what doesn't exist**, by making a decision about what _does_ exist and rejecting all other possibilities. Many transactional applications, such as currencies and transfer-of title contracts (also known as non-fungible tokens or <abbr>NFTs</abbr>), depend on this feature to prevent one asset from being transferred simultaneously to two different people. The recipient of an asset can be assured that an alternative transaction involving the same asset doesn't secretly exist.

Holochain, on the other hand, equips all peers to **detect** bad activity, including attempts to 'fork' one's [source chain](../3_source_chain/) and create two simultaneous transactions. Your application can take advantage of [peer witnessing](../4_dht/#a-cloud-of-witnesses) to protect agents from this sort of attack. You can also build extra measures into your application, such as economic disincentives or extra layers of witnessing.

But, as we've mentioned, that's not the job of countersigning. Countersigning merely seals the deal once the parties are ready.

## Key takeaways

* Countersigning allows two or more agents to reach a shared understanding of each other's source chains in order to simultaneously write a new element to all of them.
* Countersigning is an automated, non-interactive process that happens within a short time window, once all human agreements have been finalized.
* All participating counterparties must be online for the entire countersigning session.
* Countersigning begins with the sharing of a preflight, in which one party proposes a session time window, the hash of the entry to be signed, and the list of signers.
* Countersigning proceeds from preflight to the session once all counterparties have seen each other's preflight signatures as an expression of intent to participate.
* Before writing the new element to their source chain, each party pre-publishes their header for the element to the DHT, expressing their commitment to write the element.
* Once the DHT peers have collected the full list of headers, they broadcast them to all parties.
* Once a party receives all counterparties, headers, they commit the new element to their own source chain and publish it.
* If a countersigning session times out before a party receives all counterparties' headers, they may abandon the session.
* A party's source chain is locked for the entire countersigning session time window, until they see all counterparties headers or the session times out.
* Countersigning is not for preventing double-spends; it's only for atomically synchronizing a single write to multiple source chains.