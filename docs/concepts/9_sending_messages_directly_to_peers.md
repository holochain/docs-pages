# 9: Sending messages directly to peers

> Peers can use encrypted **node-to-node messaging** to talk directly to each other without relying on the DHT. This is useful for off-the-record communications.

![](https://i.imgur.com/Z1ShKBB.jpg)

Not everything needs to be end up on your source chain or the DHT. Some things should remain secret between parties, and other things simply don't need to become a matter of record.

Holochain lets peers contact each other directly and exchange private messages. When you send a message to another node, it's encrypted in-transit just like any communication, but it doesn't get 'gossiped' through the DHT. This makes it useful for completely private, end-to-end-encrypted messaging.

Node-to-node messaging is also useful for ephemeral communications like:

* 'Pinging' a peer to let them know you've published a DHT entry that they ought to be aware of
* Negotiating a transaction or agreement with another party before publishing it to your source chains---this includes the mutual exchange of signatures

Neither of these scenarios necessarily requires data to be private, but they also don't require data to be permanent.

Here's what happens in a node-to-node message exchange:

1. Alice creates a message and sends it to Bob's DHT address, then waits for his response.
2. Alice's Holochain conductor looks up Bob's IP address on the DHT, then sends the message to Bob's device.
3. Bob receives the message, decides what to do with it, and sends a response back to Alice.
4. Alice receives Bob's response and processes it.

[Tutorial: **PrivateMessenger** >](#)
[Next: **Securing And Delegating Zome Functions With Capability Tokens** >>](../10_capability_tokens)
