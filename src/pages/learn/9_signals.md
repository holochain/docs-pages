---
title: "Signals: Communicating without waiting for a response"
---

::: learn-intro
A DNA usually only receives function calls from the outside world and returns a response. But a DNA can also push **signals** to a listening client on the agent's device, or another agent on the same network.
:::

::: learn-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [When signals are useful](#when-are-signals-useful)
2. [Where you can send a signal to](#local-and-remote-signals)
3. [What signals should not be used for](#when-not-to-use-signals)
4. [What the future holds](#the-future-pub-sub)

### <i class="far fa-atom"></i> Why it matters

Signals reduce the need for a client to regularly poll a zome function to retrieve new data, making UIs much more responsive and performant. They can also trigger automatic actions in a cell or client without needing human intervention.
:::

![](/assets/img/learn/9.1-signals.png){.sz80p} {.center}

## When are signals useful?

Most connected applications are heavily interactive. Chat messages appear, notification badges change, documents show real-time updates from collaborators, your opponent moves her knight, and so on. This aliveness is the heartbeat of the modern app.

So far we've only described a DNA as a collection of functions that you can call. And it is. You can make your app feel fairly responsive by having the UI regularly poll a function such as `get_messages_for_chat_channel`, but this feels old-fashioned and can hurt performance.

**Signals** extend a DNA's communication ability beyond mere function calls, allowing a cell to broadcast messages to local clients or remote cells. Just like [zome function calls](../8_calls_capabilities/), they pass information to a receiver. But unlike zome function calls, they don't expect the receiver to respond. Like most other payloads, the information is just bytes and can contain any sort of data you like.

## Local and remote signals

There are two kinds of signals. One goes to the client; the other goes to another agent on a DHT.

### Local signals

![](/assets/img/learn/9.2-client-signal.png){.sz80p} {.center}

When a UI or other client wants to keep up to date on something without initiating any action, they can listen for local signals on the same WebSocket connection they use to make zome calls. The DNA can emit these signals as part of a zome function or other callback. For instance, in [Calls and Capabilities](../8_calls_capabilities/) when Alice calls Bob's `receive_publish_post_permission`, it would be nice to let Bob know he's received that permission. So that function emits a signal to his UI to let him know he's able to publish the article on her behalf now.

You would typically use this in functions that are not called by a client, such as functions that are meant to be called remotely by other agents in the network, by bridged cells on the user's own machine, or by lifecycle event callbacks such as scheduled functions and post-commit callbacks.

### Remote signals

![](/assets/img/learn/9.3-remote-signal.png){.sz80p} {.center}

Not every peer-to-peer interaction on the DHT needs a response. In cases where Bob doesn't need to know whether his message was received, he can simply send a signal rather than making a remote call.

This is a lot faster too --- if Bob needs to send a message to fifty people, with remote calls he'd have to make a call to each recipient, wait for a response or a timeout, and move on to the next. Remote signals, on the other hand, let him specify multiple recipients, send off the message, and move on with function execution. The conductor will send it off to all recipients in parallel.

## When not to use signals

As signals don't receive a response, there's no way to tell whether the recipient has actually received the message or acted upon it. It's not safe to use a signal for mission-critical message delivery such as within a [countersigning](../10_countersigning) session. If you do use it to facilitate important activities, make sure there's also a slower but more dependable way of accessing the message's information. For remote signals, this could include Bob following up with Alice via remote calls or publishing the signal data to the DHT; for local signals that update the UI, the UI could also poll for new source chain or DHT data on a slower interval.

## The future: pub/sub

Signals are a fairly simple construct right now, and it's likely that your app will have complex performance or security requirements that mean not all signals should be broadcast everywhere. We intend to introduce a [publish/subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) model to signals so that clients and remote cells can ask to receive certain messages and not others, while DNA code can approve or reject those requests. We also plan to implement signals for DHT events, such as new entries, [CRUD actions](../6_crud_actions/), or [links](../5_links_anchors/) on a base.

## Key takeaways

* Signals allow a cell to communicate with listeners without expecting a response.
* Signals can be used to avoid
* A signal doesn't have guaranteed delivery because there's no way to tell whether it's been received.
* A signal is simply a message payload consisting of arbitrary bytes.
* Local signals are emitted over the WebSocket application interface to listening clients, and are most useful when emitted from a function call that wasn't triggered by the listening client.
* Remote signals are emitted over the network transport to listening cells within the same network.

### Next Up

[Learn about countersigning →](../10_countersigning/){.btn-purple}