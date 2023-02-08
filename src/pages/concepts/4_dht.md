---
title: "The DHT: A Shared, Distributed Graph Database"
---

::: coreconcepts-intro
Agents share records of their actions, including any data meant to be shared with the group, in a  [**distributed hash table (DHT)**](https://en.wikipedia.org/wiki/Distributed_hash_table). This database provides redundancy and availability for data and gives the network the power to detect corruption.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [The downsides and risks of self-owned data](#self-owned-data-isnt-enough)
2. [How public data is stored](#the-distributed-hash-table-a-public-data-store)
3. [How nodes store and retrieve data in a distributed database](#finding-peers-and-data-in-a-distributed-database)
4. [What happens when the network falls apart](#resilience-and-availability)
5. [How public data is validated](#a-cloud-of-witnesses)

### <i class="far fa-atom"></i> Why it matters

If you’re unsure whether a distributed network can provide the same integrity, performance, and uptime guarantees as a server-based system under your control, this article will give you a better picture of how Holochain addresses these issues. You’ll also have a better understanding of how user data is stored, which will help you think about how to design your persistence layer.
:::

## Self-owned data isn't enough

Let’s talk about your source chain again. It belongs to you, it lives in your device, and you can choose to keep it private.

However, the value of most apps comes from their ability to connect people to one another. Email, social media, and team collaboration tools wouldn’t be very useful if you kept all your work to yourself. Data that lives on your machine is also not very available—as soon as you go offline, nobody else can access it. Most users don’t want to run their own servers, so there needs to be a way to make shared data stick around when its author isn't there.

This is also the point where we run into integrity problems in a peer-to-peer system. When everybody is responsible for creating their own data, they can mess around with it any way they like. In the last article, we learned that the signed source chain is resistant to third-party tampering, but not to tampering by its owner. They could erase a transaction or a vote and make it look like it never happened.

And finally, in cases where the validity of a given piece of data depends on a bunch of other data, it can be costly for someone to audit someone else’s data before deciding to engage with them. Because other people have probably checked portions of that same data, it might be possible to save everyone a bit of work. 

## The distributed hash table, a public data store

![](/assets/img/concepts/4.1-network.png)

In a Holochain network, you share your source chain actions and public entries with a random selection of your peers, who witness, validate, and hold copies of them.

![](/assets/img/concepts/4.2-public-entry-commit.png)

When you commit a record with private data, the entry data stays in your source chain, but its action is still shared.

![](/assets/img/concepts/4.3-private-entry-commit.png)

Every DNA has its own private, encrypted network of peers who [**gossip**](https://en.wikipedia.org/wiki/Gossip_protocol) with one another about new peers, new data, integrity breaches, and network health.

This network holds a distributed database of all public data called a [**distributed hash table (DHT)**](https://en.wikipedia.org/wiki/Distributed_hash_table), which is basically just a big key/value store. Each node holds a small **shard** of the DHT, so the burden of participation isn't painful for any one agent.

## Finding peers and data in a distributed database

Databases that spread their data among a bunch of machines have a performance problem: unless you have time to talk to each node, it’s very hard to find the data you’re looking for. DHTs handle this by assigning data to nodes by ID. Here’s how Holochain’s implementation works:

1. Each agent gets their own DHT address, based on their public key. Each piece of data also gets its own DHT address, based on its hash. These addresses are just huge numbers, so they can be compared to each other. And because they’re derived directly from the data they represent, they can’t be forged or chosen at will.
2. Each agent chooses the size of the DHT neighborhood they want to be an authority for, as a range to the left and right of them in the DHT’s address space. They commit to keeping track of all the peers and storing all the data whose addresses fall in that neighborhood.
3. When an agent wants to publish or query a piece of data, they need to figure out who is most likely to be an authority for its address.
4. The agent looks in their own list of peers and compares their addresses against the data’s address.
5. The agent sends their publish or query message to a few of the top candidates.
6. If any of those candidates are authorities for that address, they respond with a confirmation of storage (for publishing) or the requested data (for a query).
7. If none of the candidates are authorities, they look in their own lists of peers and suggest peers who are more likely to be authorities. The agent then contacts those peers and the cycle repeats until authorities are found.
8. If the request was a ‘publish’ request, the authorities ‘gossip’ the data to other authorities in their neighborhood to increase redundancy of the data.

Every agent knows about its neighbors and a few faraway acquaintances. Using these connections, they can find any other agent in the DHT with just a few hops. This makes it fairly quick to find the right authorities for an address.

![](/assets/img/concepts/4.4-address-space-and-neighborhoods.png)

Let’s see how this works with a very small address space. Instead of public keys and hashes, we’re just going to use letters of the alphabet.

<div class="coreconcepts-storysequence" markdown=1>
1. ![](/assets/img/concepts/4.5-alice-neighborhood.png)
Alice lives at address A. Her neighbors to the left are Diana and Fred, and her neighbors to the right are Zoe and Walter.

2. ![](/assets/img/concepts/4.7-alice-publish-address-calculation.png)
Alice creates an entry containing the word “molecule”, whose address is M.

3. ![](/assets/img/concepts/4.8-authority-resolution.png)
Of all of Alice’s neighbors, Fred is closest to that address, so she asks him to store it. Fred hasn’t claimed authority for that address, so he tells Alice about his neighbor Louise.

3. ![](/assets/img/concepts/4.9-gossip-publish.png)
Alice shares the entry with Louise, who agrees to store it because her neighborhood covers M.

4. ![](/assets/img/concepts/4.10-gossip-resilience.png)
Louise shares it with her neighbor, Norman, in case she goes offline.

5. ![](/assets/img/concepts/4.11-retrieval.png)
Rosie is a word collector who learns that an interesting new word lives at address is M. She asks her neighbor, Norman, if he has it. Louise has already given him a copy, so he delivers it to Rosie.
</div>

## Resilience and availability

The DHT stores multiple redundant copies of each entry so that the information is available even when the author and a portion of the authorities are offline. This allows others to access it whenever they need to.

It also helps an application tolerate network disruptions. If your town experiences a natural disaster and is cut off from the internet, you and your neighbors can still use the app. The data you see might not be complete or up to date, but it’s still accessible and you can still reach each other. You might even be able to use the app when you’re completely offline.

Using information about their neighbors' uptime, cooperating agents work hard to keep at least one copy of each entry around at all times. They adjust their neighborhood size to ensure adequate coverage of the entire address space.

Let’s see how this plays out in the real world.

<div class="coreconcepts-storysequence" markdown=1>
![](/assets/img/concepts/4.12-healthy-network.png)
1. An island is connected to the mainland by a radio link. They communicate with each other using a Holochain app.

![](/assets/img/concepts/4.13-partition.png)
2. A hurricane blows through and wipes out both radio towers. The islanders can’t talk to the mainlanders, and vice versa, so some DHT neighbors are unreachable. But everyone can still talk to their physical neighbors. None of the data is lost, but not all of it is available to each side.

![](/assets/img/concepts/4.14-resilience-building.png)
3. On both sides, all agents attempt to improve resilience by enlarging their neighborhoods. Meanwhile, they operate as usual, talking with one another and creating new entries.

![](/assets/img/concepts/4.15-partition-healing.png)
4. The radio towers are rebuilt, the network partition heals, and new data syncs up across the DHT. At this point everyone has the option of shrinking their neighborhoods, although experience has shown them that it might be best to overcompensate in case another hurricane comes around.
</div>

## A cloud of witnesses

When we [laid out the basics of Holochain](../1_the_basics/), we said that the second pillar of trust is **peer validation**. When a node is asked to store an entry, it doesn't _just_ store it---it also checks it for validity. As the entry is passed to more nodes in its neighborhood, it gathers more signatures attesting to its validity.

There are up to three authorities for each source chain record.

* The **entry authority**, whose address is in the neighborhood of the entry’s address, checks the contents of the entry data to make sure it’s properly formed and conforms to the validation rules for the entry type. (Some records, like link creations and deletions, don’t have any entry data.)
* The **action authority**, whose address is in the neighborhood of the action’s address, checks the contents of the action to make sure the previous action exists on the DHT and the action’s sequence ID and timestamp are higher than that of the previous action.
* The **agent activity authority**, whose address is in the neighborhood of the record’s author (that is, they’re the author’s neighbors), receives a copy of the action and checks that it doesn’t conflict with another action — that is, the author isn’t trying to modify their history by publishing an alternate one.

All three authorities check the signature on the data they receive to make sure it hasn’t been modified in transit and it belongs to the agent that claims to have authored it. If the signature check fails, the data is rejected.

After this first check, the authority runs the data through the proper system and app-level **validation rules**, then signs and shares the validation result with its neighbors. If the result shows that validation failed, it's considered a **warrant** that contains evidence of malicious behavior, and it's also shared with the author's agent activity authority. Others can use that warrant to justify ignoring or blocking the rule-breaker. This is what creates Holochain’s immune system.

Using cryptographically random data (public keys and hashes) as addresses has a couple benefits. First, validator selection is impartial, resistant to collusion, and enforced by all honest participants. Second, the data load is also spread fairly evenly around the DHT.

The important thing is that the DHT _remembers what you’ve published_, so it’s very hard to break the rules without getting caught.

## Key takeaways

* Source chain entries can be private (kept on the user’s device) or public (shared with the group). Source chain actions are always public. Participants share these with their peers in a distributed database called the DHT.
* A piece of data in a DHT is retrieved by its unique address, which is based on the data’s hash.
* Each participant takes responsibility to be an authority for validating and storing a small portion of the public data in the DHT.
* Holochain’s DHT is a validating DHT that remembers the validation result of existing entries. This speeds things up for everyone and allows the detection of bad actors.
* Holochain’s DHT also detects agents’ attempts to modify their source chains.
* Authority selection for a piece of data is random and enforced by all honest peers.
* News of bad actors is spread through warrants, which are special validation results that attest that an agent has broken the rules.
* A DHT tolerates network disruptions. It can keep operating as two separate networks and subsequently ‘heal’ when the network is repaired.

## Learn more

* [Wikipedia: Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol)
* [Wikipedia: Distributed hash table](https://en.wikipedia.org/wiki/Distributed_hash_table)
* [Wikipedia: Peer-to-peer](https://en.wikipedia.org/wiki/Peer-to-peer)

### Next Up 

[Explore links & anchors —>](./5_links_anchors/){.btn-purple} 