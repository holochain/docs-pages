---
title: "Connecting the Parts"
---

::: topic-list
### In this section {data-no-toc}

* Connecting the parts (this page)
    * [Front end](/build/connecting-a-front-end/) --- establishing a WebSocket connection from JavaScript
    * [Calling zome functions](/build/calling-zome-functions) --- examples for front ends, cell-to-cell, and agent-to-agent
    * [Capabilities](/build/capabilities/) --- how to manage access to a cell's zome functions
    * [Signals](/build/signals/) --- receiving notifications from cells
:::

::: intro
Your hApp back end's public interface consists of all the [**zome functions**](/build/zome-functions/) of all the [**cells**](/concepts/2_application_architecture/#cell) instantiated from all the [**DNAs**](/build/dnas/) that fill the hApp's [**roles**](/build/application-structure/#happ). It is accessible to locally running processes and to network peers, and is secured by a form of [**capability-based security**](/build/capabilities/), adapted for peer-to-peer applications.

The back end can also send out [**signals**](/build/signals/) that can be received either by UIs or remote peers.
:::

## What processes can connect to a hApp? {#what-processes-can-connect-to-a-happ}

It's worth mentioning again that **all the components of a hApp backend [run on the devices of the individual agents](/build/application-structure/#local)** as cells representing those agents' autonomy --- their capacity to write their own data to their own source chains.

With that in mind, these are the kinds of processes that can make calls to a cell's zome functions:

1. another coordinator zome in the same cell
2. another cell in the same hApp on the agent's device
3. an external client, such as a UI, script, or system service, on the agent's device
4. another peer in the same network as the cell (that is, sharing the same DNA hash)

Of these, only number 3, an external client, can listen to local signals emitted by a zome function. (There's another kind of signal, a remote signal, that's sent between peers in a network. It's actually just a zome function with a special name.)

### How does a process connect?

For cases 1 and 2 above, the Holochain conductor handles inter-process communication between cells. For case 3, Holochain exposes a WebSocket interface for clients to call. And for case 4, the two peers' conductors handle the zome call over the network.

## Securing zome functions against unauthorized access

An agent naturally doesn't want any remote peer calling any of their zome functions, and even local processes should be restricted in case of poorly written DNAs or malware processes on the machine. Holochain uses a modified form of [capability-based security](https://en.wikipedia.org/wiki/Capability-based_security) to secure zome function access.

Capability-based security, in short, says that you should never give out direct access to a resource such as a file or network connection. Instead you mediate access to that resource and give out 'handles' that represent a set of privileges. Holochain expands on this idea by adding the ability to restrict resource access to a certain group of agents, represented by their private keys.

[Read more about Holochain's capability security system.](/build/capabilities/)

## Sending signals for reactive, event-based programming

Zome functions can [send out signals](/build/signals/), either locally to front ends or remotely to other agents in the same network. This lets you write programs that react to activity rather than having to poll a function for updates.

## Further reading

* [Core Concepts: Application Architecture](/concepts/2_application_architecture/)
* [Core Concepts: Calls and Capabilities](/concepts/8_calls_capabilities/)
* [Core Concepts: Signals](/concepts/9_signals/)
* [Build Guide: Calling Zome Functions](/build/calling-zome-functions/)
* [Build Guide: Capabilities](/build/capabilities/)
* [Build Guide: Signals](/build/signals/)