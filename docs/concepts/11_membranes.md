# 11. Securing access to DNA instances with membranes

> A Holochain DNA can specify who belongs to its network using **membranes**---functions which determine whether a node may join a network and gossip with other nodes. These tools can be used to screen new members or eject existing members.

**Please note**: These features are still in design and development. More information when they become available!

![](https://i.imgur.com/91Hclc7.jpg)

You'll remember from the [section on validation](../7_validating_data) and one of its tutorials that write access can be managed with validation rules. But we didn't say anything about read access. Why is that?

In a Holochain application, data is either **private** to your source chain or **public** on the DHT. This is a pretty coarse distinction; do we feel comfortable sharing our data with everyone on the network? Who's allowed into that public space anyway?

Holochain was built to foster **networks of trust** between sovereign individuals. But not all kinds of trust can be created with a magical integrity algorithm. In fact, the kinds of trust that matter to most people all come from social agreements: family relationships, cultural norms, company policy, contracts, laws, and so on.

Besides the 'rules of the game' for participants, we need a way to define who's allowed to play the game. In other words, we need some sort of **membrane**---a boundary that permits and restricts the flow of information and people between its inside and outside.

Holochain lets you create membranes with two tools:

![](https://i.imgur.com/hjrpgey.jpg)
* A **special validation function for the agent ID entry**, which can contain extra content such as invite codes or third-party attestations of identity. This involves every participant in the screening of new entrants.
* [ What is the other thing? I know it's non-deterministic, and it involves allowing agents decide for themselves who to talk to based on current state. Not available yet. ]

[Tutorial: **SecureMicroBlog** >](#)
[Next: **Bridging Across Multiple DNA Instances** >>](../12_bridging)
