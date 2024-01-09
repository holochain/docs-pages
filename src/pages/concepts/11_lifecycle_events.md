---
title: "Lifecycle events: reacting to external triggers"
---

::: coreconcepts-intro
In the course of its existence, the conductor triggers **lifecycle events**, to which a cell can respond with specially named callbacks.
:::

::: coreconcepts-orientation
### What you'll learn

* [How to tell the conductor about the entry types your zome defines](#entry-type-definition-callbacks)
* [How to validate data](#validation-and-genesis-self-check-callbacks)
* [How to initialize a cell's state](#init-callback)
* [How to follow up after successful source chain commits](#post-commit-callback)
* [How to schedule a function for later execution](#scheduled-functions)
* [How to respond to a remote signal](#remote-signal-receiver)

### Why it matters

A cell can do nothing but respond to external events, so it needs to know what's happening in the outside world. Normally this happens via its public API --- its exposed zome functions --- but it's also useful for it to be able to hook into other sorts of events.
:::

## Entry type definition callbacks

**Where**: integrity zomes

When a conductor first installs a DNA, it needs to know about the entry types defined in each of its integrity zomes, so that it can call the correct zome's validation function whenever a coordinator zome commits something. When you define an `entry_defs` callback that returns a list of entry type [definitions](https://docs.rs/hdi/latest/hdi/prelude/struct.EntryDef.html) --- their names, visibility, and so forth.

If you're using our Rust-based SDK, there are a bunch of macros that will auto-generate this function for you from a collection of Rust type definitions, so you'll rarely see an actual callback defined in an integrity zome's code. If you use these macros, you'll also get the benefit of automatic deserialization from entry data to the proper Rust type.

## Validation and genesis self-check callbacks

**Where**: integrity zomes

We covered both of these callbacks in the section on [validation](../7_validation/), but here's a refresher:

* An integrity zome's validation callback is called any time an entry or link whose type is defined in the zome is written to the source chain.
* The validation callback is called for every **DHT operation** produced by an action.
* The validation callback must return success, failure with an optional failure message, or 'unresolved depndencies'. If a validation callback attempts but fails to retrieve DHT data, the conductor will terminate the execution of the validation function with the 'unresolved dependencies' result.
* The genesis self-check function is called at cell instantiation time, before the cell attempts to connect to the network. It's an opportunity to do a quick check on the integrity of the user-supplied **membrane proof**.

## Init callback

**Where**: coordinator zomes

Shortly after a cell is instantiated and connects to the network, the conductor looks for an init callback in every coordinator zome. This function is a place to initialize source chain data with necessary information, or make connections to peers, or anything necessary to bootstrap the cell. When all coordinator zomes in a cell have finished executing their init callback, the final [genesis record](../3_source_chain/), the 'init complete' action, is written to the source chain.

An init callback can return 'pass', 'fail' with an error string, or a list of unresolved dependencies. If one init callback fails, initialization of the entire cell fails and the cell is put into a disabled state.

!!! warn Lazy initialization
The init callbacks aren't actually called until the first time something calls a function in any coordinator zome.
!!!

## Post-commit callback

**Where**: coordinator zomes

Every time a function in a coordinator zome successfully commits one or more actions to a source chain, the conductor looks for a post-commit callback in the zome that committed it and calls it. This is an opportunity for a cell to notify clients or cells on the network of a successful change to its state, as it happens after the function has finished executing and all commits have been validated. This callback takes a list of all the newly committed action and doesn't return anything.

## Scheduled functions

**Where**: coordinator zomes

A function in a coordinator zome can schedule another function for later or repeated execution by passing the name and zome of the function to be scheduled. The schedule can either be:

You can't pass any arguments to a function when you schedule it. Instead, it has to make decisions about how to execute based on external state --- such as the source chain, DHT, or DNA properties. This may be a surprise, but it's meant to defend against [confused deputy](https://en.wikipedia.org/wiki/Confused_deputy_problem) situations --- that is, situations in which a remote caller tricks the cell into giving away special privileges by allowing a zome function to directly pass maliciously crafted input parameters to the scheduled function.

Instead, the scheduled function receives one parameter --- an optional schedule. On first run, this will be blank, but the return value of the scheduled function is _also_ an optional schedule. This allows the function to modify its schedule each time it's run, or cancel itself by passing an empty value.

A schedule is either:

* **ephemeral**, happening once at a set amount of time into the future, without guarantee of retries if the conductor is shut down, or
* **persisted**, happening at regular intervals defined by a [crontab](https://www.man7.org/linux/man-pages/man5/crontab.5.html) string.

This pattern of receiving and returning a schedule can be used for things like implementing exponential falloff when retrying a failed task, or cancelling a recurring job that's no longer needed.

Finally, a scheduled function is 'infallible', which means it can't return an error. If a runtime error happens either in the function call or a host function that it calls, the conductor will log the error and silently fail.

## Remote signal receiver

**Where**: coordinator zomes

This is a special public zome function made for receiving [remote signals](../9_signals/#remote-signals) from other peers on the same network. It receives the signal payload as its only parameter. As with any public zome function, you can set access privileges using [capabilities](../8_calls_capabilities/#how-to-secure-functions-against-unauthorized-use) to prevent abuse.

!!! info What's really going on with remote signals
Behind the scenes, a remote signal is just a [remote call](../8_calls_capabilities/#remote-call) to the `recv_remote_signal` zome function. The conductor treats this function specially, not waiting for a response from the remote end.
!!!

## Key takeaways

* The entry type defintions callback tells a conductor about the entry types an integrity zome defines, but the Rust SDK generates one for you using macros.
* Validation and genesis self-check callbacks receive data for validation.
* The init callback can be used to set up initial cell state, make connections with peers, and other startup tasks.
* The post-commit callback is called after every successful zome function call that commits data.
* Functions can be scheduled for asynchronous execution, either once or on a recurring schedule, and can modify their schedules every time they're executed.
* Scheduled functions cannot throw errors.
* The remote signal receiver is a special zome function that responds to remote signals and doesn't need to return a value.