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
3. [A note on going back on your promise](#going-back-on-your-promise)

### Why it matters

A lot of human interactions involve formal transactions of one sort of another. These are usually conducted in a peer-to-peer way --- that is, as an exchange of information among the people who are directly involved. Payments, legal agreements, property transfers, and even chess moves require parties to reach a **shared understanding** of the states of one another's worlds, then coordinate a **shared change** to those states. Because this is such a common pattern, we built it right into Holochain.
</div>

## Agreement versus consensus

If you're familiar with client/server or blockchain architectures, you might be surprised that Holochain doesn't even attempt to maintain a single source of truth. As you saw when you learned about the [source chain](../3_source_chain/), each participant is responsible for their own ledger with its own record of application state changes. 

It might sound messy, but it's how the real world works. When Alice is busy living her life, she doesn't have to consult a global record of "things everybody did" (we hope) in order to avoid stepping on other people's toes. She has her own _agency_ --- the power to observe and act in her environment in ways that are consistent with its rules.

When Alice wants to interact with someone --- say, she wants to get together with Bob at lunchtime -- they simply check their own calendars, maybe check the availability at a few restaurants, and come to an agreement on when and where to go.

We think that, for the vast majority of applications involving transactions, this is all that's needed.

In a distributed system, this is hard. Holochain offers countersigning as a way for two or more participants to lock their source chains at a particular moment in order to write a single identical entry to all of them, knowing that the others have done the same.
</div>

---

# Notes

* Not the same as coordination protocol (doesn't quality as CP, still gets to be called CALM)
    * It is still coordination; parties coordinate *before* writing
    * in CP systems, parties coordinate to determine what *was* written
        * Is this entirely true? Leader selection means you coordinate to determine what *will* be written by choosing who will do the writing
* PoW blockchain is logically monotonic
    * expanding tree of possibilities
        * DAG of state changes
        * entire tree is theoretically preserved, though in practice orphans are pruned
        * Nodes are weighted by hash difficulty
        * Like a CRDT that reduces sister nodes to one canonical node
            * Is that completely true? Longest/heaviest chain also matters
* CAP theorem applies to distributed systems.
    * DHT is a distributed system (well, a circle of overlapping replicas)
    * Source chain is not distributed; it's immediately consistent.
    * Two source chains are slightly distributed, but have their own histories and are not replicas trying to reach consensus.
    * Problem is different from traditional distributed systems which would use two-phase commits to reach consistency of same data set
    * Therefore, countersigning is orthogonal to questions of CALM/non-CALM
        * Also orthogonal to fork finality
            * Still, it's hard to completely separate the two, given that the applications that use countersigning overlap strongly with applications where forking is super dangerous
                * detecting old forks is easy (though probablistic)
                * preventing or discouraging a fork is harder
                    * witnessing
* Countersigning -- what is it?
    * Two or more parties
    * Writing the same state change entry to all of their source chains
    * At an agreed-upon point (or rather, set of points)
    * Why the as-at value?
        * So Alice can validate the write from her perspective _and_ Bob's
            * You never validate an entry; you validate a commit
            * Can't tell which applications need validation based on history; better to include it always
            * Even for applications that don't require history validation (e.g., legal agreements, which don't happen under conditions of exclusivity except when there's a notary) knowledge of the chain could be valuable in human terms, cuz some agreements might be predicated on the existence or absence of others
                * absence is hard to prove; on the one hand you can validate the absence of a logically prior one, but on the other hand you can't validate the absence of a chain fork
