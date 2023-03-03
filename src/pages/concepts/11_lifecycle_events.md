---
title: "Lifecycle events: reacting to external triggers"
---

::: coreconcepts-intro
In the course of its existence, the conductor triggers **lifecycle events**, to which a cell can respond with specially named callbacks.
:::

::: coreconcepts-orientation
### What you'll learn

* stub
* Entry and link type definitions
* Validation and genesis self-check callbacks
* init callback
* post-commit callback
* Scheduling functions
* recv_remote_signal

### Why it matters

Because a cell can do nothing but respond to external events, it needs to know what's happening in the outside world. Normally this happens via its public API --- its exposed zome functions --- but it's also useful for it to be able to hook into other sorts of events.
:::

## This is a stub page