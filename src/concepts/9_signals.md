# 9. Signals: Communicating without waiting for a response

<div class="coreconcepts-intro" markdown="1">A DNA usually only receives function calls from the outside world and returns a response. But a DNA can also push **signals** to a listening client on the agent’s device, or another agent on the same DHT.
</div>

<div class="coreconcepts-orientation" markdown="1">
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [When signals are useful](#when-are-signals-useful)
2. [Where you can send a signal to](#local-and-remote-signals)
3. [What signals should not be used for](#when-not-to-use-signals)

### <i class="far fa-atom"></i> Why it matters

Signals avoid the need for a client to regularly poll a zome function to retrieve new data, making UIs much more responsive and performant. They can also trigger automatic actions in a cell or client without needing human intervention.
</div>

![](../../img/concepts/9.1-signals.png)

## When are signals useful?

Most connected applications are heavily interactive. You expect information from others as much as you create your own information. Chat messages appear, notification badges change, documents show real-time updates from collaborators, your opponent moves her knight, and so on. This liveness is the heartbeat of the modern app.

So far we’ve only described a DNA as a collection of functions that you can call. And it is. You can make your app feel fairly responsive by having the UI regularly poll a function such as `get_messages_for_chat_channel`, but this feels old-fashioned and can hurt performance.

**Signals** allow a cell to broadcast messages to clients or other cells. Just like [zome function calls](../8_calls_capabilities/), they take an input. But unlike zome function calls, they don't expect a response from the receiver. Like most other payloads, the input is just bytes and can contain any sort of data you like.

## Local and remote signals

There are two kinds of signals. One goes to the user; the other goes to other agents on the DHT.

### Local signals

![](../../img/concepts/9.2-client-signal.png)

When a UI or other client wants to keep up to date on something without initiating any action, they can listen for local signals on the same WebSocket connection they use to make zome and admin calls. The DNA can emit these signals as part of a zome function or other callback. For instance, in [Calls and Capabilities](../8_calls_capabilities/) Bob wants to ask Alice to give him permission to ghost-write on her behalf. Alice needs to know about his outstanding request, so the function that receives permission requests can emit a signal to her UI saying “please check this request and take action on it”.

You would typically use this in functions that are not called by a client, such as functions that are meant to be called remotely by other agents in the network, or by bridged DNA instances on the user’s own machine.

### Remote signals

![](../../img/concepts/9.3-remote-signal.png)

Not every peer-to-peer interaction on the DHT needs a response. In cases where Bob doesn’t need to know whether his message was received, he can simply send a signal rather than making a remote call.

This is a lot faster too — if Bob needs to send a message to fifty people, with remote calls he’d have to make a call to each recipient, wait for a response or a timeout, and move on to the next. Remote signals, on the other hand, let you specify multiple recipients, send off the message, and move on with execution. The conductor will send it off to all recipients in parallel.

## When not to use signals

As signals don't receive a response, there's no way to tell whether the recipient has actually received the message or acted upon it. It's not safe to use a signal for mission-critical message delivery. If you do use it to facilitate important activities, make sure there’s always a slower but more dependable way of accessing the information contained in the message. For remote signals, this could include Bob following up with Alice via remote calls or publishing the signal data to the DHT; for local signals that update the UI, the UI could periodically poll for new messages.

## The future: pub/sub

Signals are a fairly simple construct right now, and it's likely that your app will have complex performance or security requirements that mean not all signals should be broadcast everywhere. We intend to introduce a [publish/subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) model to signals so that clients and remote cells can ask to receive certain messages and not others, while DNA code can approve or reject those requests.

We also hope to introduce DHT signals, so an agent can subscribe to a base DHT address and receive information about new [links](../5_links_anchors/), [CRUD actions](../6_crud_actions/), or publish headers on that address.