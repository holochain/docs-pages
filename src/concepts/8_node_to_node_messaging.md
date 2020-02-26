# 08. Node-to-Node Messaging: Communicate Directly with Peers

<div class="coreconcepts-intro" markdown="1">
Peers can use encrypted **node-to-node messaging** to talk directly to each other without relying on the DHT. This is useful for off-the-record communications.
</div>

<div class="coreconcepts-orientation" markdown="1">
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [When node-to-node messaging makes sense](#node-to-node-messaging-private-immediate-and-temporary-data-exchange)
2. [How messaging works](#the-lifecycle-of-a-message)

### <i class="far fa-atom"></i> Why it matters

The source chain and the DHT aren't appropriate for all kinds of data exchange. Knowing about node-to-node messaging helps you decide which tool to use.
</div>

![](https://i.imgur.com/Z1ShKBB.jpg)

## Node-to-node messaging: private, immediate, and temporary data exchange

Not all data needs to be permanent. Some things simply don't need to become a matter of record, and other things should remain private between two parties. Putting them in the DHT would be a waste of space or, even worse, a privacy risk. It's also not the fastest or most reliable way to share real-time updates or guarantee a quick response.

Holochain lets two peers directly exchange private messages with each other. When you send a message to another node, it's encrypted in-transit just like any communication, but it doesn't get 'gossiped' through the DHT. This makes it useful for completely private, end-to-end encrypted messaging.

Node-to-node messaging is useful for things like:

* **Private** data sharing, such as health records, shared encryption keys, or votes.
* **Synchronous** interactions, such as the negotiation of a financial transaction before it's published to the parties' source chains.
* **Temporary** messages, such as [heartbeats](https://en.wikipedia.org/wiki/Heartbeat_(computing)) and notifications
* **Immediate** communications, such as real-time game moves and collaborative editing.
* **Delegating** your agency to another agent (i.e., allowing them to act on your behalf).

## The lifecycle of a message

Holochain exposes a `send` function to the DNA to allow one agent to send a message to another, and expects the DNA to implement a `receive` callback to process received messages.

Here's an example of what happens in a node-to-node message exchange, using a silent auction app.

1. From within a zome function called `place_bid`, Alice creates a message that says, "$50 on the black velvet painting of a clown" and calls the `send` function. Message sending pauses or ['blocks'](https://en.wikipedia.org/wiki/Blocking_(computing)) the execution of the `place_bid` function.
2. Alice's Holochain conductor uses the DHT to look up Bob's current IP address and sends the message to Bob's device.
3. Bob's conductor calls a `receive` callback in his running DNA instance. It receives the message, registers Alice's bid as an entry on his source chain, and returns a response containing an acknowledgment of her registered bid.
4. Bob's conductor sends the acknowledgement message back to Alice's conductor.
5. Alice's conductor returns Bob's acknowledgement message to the `place_bid` function, which records the message on her own source chain so she can claim her painting later.

## Key takeaways

* Node-to-node messaging is a direct, end-to-end encrypted channel between two agents.
* You message agents according to their agent IDs; Holochain resolves the ID to the agent's IP address.
* Node-to-node messaging can be used for any data exchange that needs to be private, synchronous, temporary, or immediate.
* Node-to-node messaging can also facilitate agent-to-agent function calls, allowing one agent to 'delegate' their agency to another.
* In a message cycle, the initiator sends a message, then the recipient processes it with a handler function and sends the initiator a response.
* The message cycle blocks execution on the sender's side until they receive a response or the request times out.

## Learn more

* [HDK Reference: `send` function](https://docs.rs/hdk/latest/hdk/api/fn.send.html)
