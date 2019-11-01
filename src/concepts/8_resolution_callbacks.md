# 8: Handling data conflicts on the DHT with CRDTs or resolution callbacks

> Inconsistencies between two nodes' views of the world can be prevented with [**conflict-free replicated data types (CRDTs)**](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) or handled with **conflict resolution callback functions**.

**Please note**: These features are still in design and development. More information when they become available!

## Distributed systems and disagreements

A distributed computer system is a tricky thing. Each node has to figure out how to keep its data in sync with the other nodes that hold copies of that same data. But network delays, disruptions, and mismatched clocks all make it impossible to do this perfectly. Computer scientists quickly realized that there are only two ways to respond to this problem:

1. Halt all activity until all data is guaranteed to be synchronized (optimize for consistency), or
2. Allow reads and writes all the time and figure out how to resolve inconcistencies as you go (optimize for availability).

Many real-world systems, even global financial networks, choose availability over consistency, so that people can get on with business. There are different ways to go about this. Some of them, based on 'coordination protocols' are complicated to get right; they involve all sorts of special roles and rules.

But then we figured out that, as long as new data only adds to the existing data set, and never removes, edits, or retracts existing data, it doesn't need coordination protocols at all. Data might not be _up-to-date_, but no two pieces of data will ever be in _conflict_ with each other. And, given enough time, all nodes are guaranteed to reach consistency with each other.

The simplest example of this is a hash table. As long as you always add items and never remove them, there will never be a clash between In Holochain, the source chain and the DHT are both examples of this strong eventual consistency. This is usually true for metadata on an entry, but there are some exceptions. [Modified/deleted status](../6_modifyin_and_deleting_data), for example, should always have one value only. Let's take a look at how and why the modified/deleted status might end up in a conflicting state:

* Alice and Bob both see an entry on the DHT, held by Charlie. Its status is 'live'&mdash;that is, it hasn't been deleted or modified.
* Alice tries to update it, but Bob tries to delete it at the same time. In each of their local copies of the DHT, they see a different state for that same entry.
* This creates a conflict, because an entry can't be updated and deleted at the same time! But at this point neither Alice nor Bob is aware of the problem.
* They both send a message to Charlie, telling him to update the status of that entry with their conflicting views.
* Charlie must now decide whether to update the status to 'modified' for Alice or 'deleted' for Bob, and Alice and Bob must eventually learn of Charlie's decision.

You can see that this is an extremely rare situation. But edge cases have a way of popping up in real-life situations, so we have to account for them.

## Conflict-free replicated data types

In the case of update/delete status, Holochain simply allows both the updated and the deleted status to exist at once, but decides that the delete status always wins. This is a simple example of a [**conflict-free replicated data type (CRDT)**](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type). CRDTs let you avoid conflict by defining rules about how changes are applied to a single data point.

This might be important when, for instance, you don't want two agents to create and publish the same entry. You could define a CRDT that says that the author who published the entry first wins.

## Conflict resolution callbacks

There may be other situations where you can't or don't want to define a CRDT to automatically resolve a conflict. Maybe it's too complex a problem, or maybe it's better be handled by humans. Resolution callbacks let you resolve these conflicts any way you like.

#### Learn more

* [Wikipedia: CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), which states that distributed systems must choose between availability and consistency if they are to tolerate partitions.
* [The CALM Conjecture: Reasoning About Consistency](https://databeta.wordpress.com/2010/10/28/the-calm-conjecture-reasoning-about-consistency/), an article that explains why 'monotonically increasing' data (such as content-addressable DHTs, hash chains, and CRDTs) don't require coordination protocols.

[Tutorial: **MicroBlogWithUserNames** >](#)
[Next: **Sending Messages Directly To Peers** >>](../9_sending_messages_directly_to_peers)
