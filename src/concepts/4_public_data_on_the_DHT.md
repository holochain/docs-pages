# 04: Public data on the DHT

<div class="coreconcepts-intro" markdown=1>
Agents share their public keys, source chain headers, and public entries with their peers in a [**distributed hash table (DHT)**](https://en.wikipedia.org/wiki/Distributed_hash_table). This distributed database provides redundancy and availability for data and gives the network the power to detect corruption.
</div>

<div class="coreconcepts-orientation" markdown=1>
## What you'll learn

1. [The downsides and risks of self-owned data](#self-owned-data-isnt-enough)
2. [How public data is stored](#the-distributed-hash-table-a-public-data-store)
3. [How nodes store and retrieve data in a distributed database](#finding-peers-and-data-in-a-distributed-database)
4. [What happens when the network goes down](#resilience-and-availability)
5. [How public data is validated](#a-cloud-of-witnesses)

## Why it matters

If you're unsure of whether a distributed network can provide the same integrity, performance, and uptime guarantees as a server-based system under your control, this article will give you a better picture of how Holochain addresses these issues. You'll also have a better understanding of how user data is stored, which will help you think about how to design your persistence layer.
</div>

## Self-owned data isn't enough

Let's talk about your source chain again. It belongs to you, it lives in your own device, and you can choose to keep it private.

However, the value of most apps comes from their ability to connect people to one another. Email, social media, and team collaboration tools wouldn't be very useful if you kept all your work to yourself. Data that lives on your machine is also not very available; as soon as you go offline, nobody else can access it. Most users don't want to run their own servers, so we need a way to make public data stick around.

This is also the point where we run into integrity problems in a peer-to-peer system: when everybody is responsible for their own data, they can mess around with it any way they like. In the last article we learned that the signed source chain is resistant to third-party tampering, but not to tampering by its owner. An agent could erase a transaction or a vote and make it look like it never happened.

And finally, it seems inefficient to make each node to check the correctness of every piece of data they engage with. Surely we could speed things up if we know that multiple people are accessing the same piece of data.

## The distributed hash table, a public data store

![](https://i.imgur.com/l19cWOw.png)

In a Holochain network, you share your source chain headers and public entries with a random selection of your peers, who witness, validate, and hold copies of them.

![](https://i.imgur.com/RmvhwpY.png)

When you commit a private entry, it stays in your source chain but its header is still shared.

![](https://i.imgur.com/uWyEeby.png)

Every DNA has its own private, encrypted network of peers who [**gossip**](https://en.wikipedia.org/wiki/Gossip_protocol) with one another about new peers, new data entries, invalid data, and network health.

This network holds a distributed database of all public data. This database is called a [**distributed hash table (DHT)**](https://en.wikipedia.org/wiki/Distributed_hash_table), and is basically just a big key/value store. Each node holds a small **shard** of the DHT, so the burden of participation isn't painful.

## Finding peers and data in a distributed database

Distributed databases have a performance problem: unless you have time to talk to each each node, it's very hard to find the data you're looking for. Here's how DHTs handle this:

1. Give each node a random address.
2. When an entry is created, calculate the hash of its content. This becomes its address or key.
3. Store the entry on the node whose address is numerically nearest to the entry's address.
4. When a node has an entry address and wants the content, they query the node nearest to the entry address.

Every node knows about its neighbors and a few faraway acquaintances. Using these connections, they can find any other node in the DHT with just a few hops. This makes it fairly quick to find data.

![](https://i.imgur.com/9k0BBjg.png)

Let's see how this works with a very small address space, in which the addresses are letters of the alphabet.

<div class="coreconcepts-storysequence" markdown=1>
1. ![](https://i.imgur.com/H4dr7W7.png)
Alice lives at address A. Her neighbors to the left are Diana and Fred, and her neighbors to the right are Zoe and Walter.

2. ![](https://i.imgur.com/48bQ0ca.png)
Alice creates an entry containing the word "molecule", whose address is M.

3. ![](https://i.imgur.com/RSI668H.png)
Of all Alice's neighbors, Fred is closest to that address, so she asks him to store it. Fred isn't responsible for that address, so he tells Alice about his neighbor Louise.

4. ![](https://i.imgur.com/9XjP6NI.png)
Alice shares the entry with Louise, whose neighborhood covers M, so she agrees to store it.

5. ![](https://i.imgur.com/flzdGjc.png)
Louise shares it with her neghbor Norman in case she goes offline.

6. ![](https://i.imgur.com/ZrmR29U.png)
Rosie learns that someone has published an interesting word whose address is M. She asks her neighbor Norman if he has it. Louise has already given him a copy, so he delivers it it to Rosie.
</div>

## Resilience and availability

The DHT stores multiple redundant copies of each entry, so the information is available even when its author or some of its validators are offline. This allows others to access it whenever they need to.

It also helps an application tolerate network disruptions. If your town experiences a natural disaster and is cut off from the internet, you and your neighbors can still use the app. The data you see might not be complete or up-to-date, but you can still interact with each other. You can even use the app when you're completely offline.

The author of an app can specify the desired data redundancy level. This is called the **resilience factor**. Cooperating agents work hard to keep enough copies of each entry to satisfy the resilience factor. It should be set higher for apps that require higher security or better failure tolerance.

Let's see how this plays out in the real world.

<div class="coreconcepts-storysequence" markdown=1>
![](https://i.imgur.com/vQ6pstS.png)
1. An island is connected to the mainland by a radio link. They communicate with each other using a Holochain app.

![](https://i.imgur.com/bmhXe37.png)
2. A hurricane blows through and wipes out both radio towers. The islanders can't talk to the mainlanders, and vice versa, but everyone can still talk to their physical neighbors. None of the data is lost, but not all of it is available to each side.

![](https://i.imgur.com/GSi7RQw.png)
3. On both sides, all agents attempt to improve resilience by enlarging their DHT neighborhoods. Meanwhile, they operate as usual, talking with one another and creating new entries.

![](https://i.imgur.com/ieWZhja.png)
4. The radio towers are rebuilt. The network partition 'heals,' and new data syncs up across the DHT.
</div>

## A cloud of witnesses

When we [laid out the basics of Holochain](../1_the_basics), we said that the second pillar of trust is **peer validation**. When a node is asked to store an entry, it doesn't _just_ store it---it also checks the entry for validity. As the entry is passed to more nodes in its neighborhood, it gathers more signatures attesting to its validity. As more randomly chosen witnesses validate it, its trustworthiness and the accountability of its author are strengthened.

Before storing an entry or header, a validator checks that:

1. The entry's signature is correct.
2. The header is part of an unbroken, unmodified, unbranched source chain. This is what prevents you from rewriting your own history.
3. The entry's content conforms to the [validation rules](../7_validating_data) defined in the DNA.

If any one of these checks fails, the validator marks the entry as invalid and spreads news about the agent's activity to its neighbors. This is what creates Holochain's immune system.

Using a hash as an address has a nice side benefit: entry addresses are random. Node addresses are also random, which means that validator selection is impartial and resistant to collusion. It also distributes the data load fairly evenly around the DHT.

The important thing is that the DHT _remembers what you've published_, so it's very hard to go back on your word. Validation is a very important part of a DNA---perhaps the most important part. We'll talk more about it in a later chapter.

## Key takeaways

* Some source chain entries are marked as public. Nodes share these with their peers in a distributed database called the DHT.
* Source chain headers of both public and private entries are also shared to the DHT.
* An entry in a DHT is retrieved by its unique address, which is the hash of the entry's content.
* Holochain's DHT is a validating DHT that remembers the validation result of existing entries. This speeds things up for everyone and allows the detection of bad actors.
* Holochain's DHT also detects agents' attempts to roll back their source chains and create alternate histories.
* Any node can be randomly selected to validate and hold an entry, based on their address' nearness to the entry's address. This helps to randomize validator selection.
* News of bad actors is spread through warrants, special entries that carry evidence of corruption.
* A DHT can set a resilience factor, or expected level of redundancy, for each entry.
* A DHT tolerates network disruptions: it can keep operating as two separate networks and subsequently heal when the network is repaired.

## Learn more

* [Wikipedia: Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol)
* [Wikipedia: Distributed hash table](https://en.wikipedia.org/wiki/Distributed_hash_table)
* [Wikipedia: Peer-to-peer](https://en.wikipedia.org/wiki/Peer-to-peer)

## Tutorials

<div class="h-tile-container">
    <div class="h-tile tile-alt tile-tutorials">
        <a href="../../tutorials/coreconcepts/hello_holo">
            <h4>01: Hello Holo Tutorial</h4>
        </a>
    </div>
</div>
