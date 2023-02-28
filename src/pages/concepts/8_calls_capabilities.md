---
title: "Calls and Capabilities: Communicate With Other Components And Peers"
---

::: coreconcepts-intro
Application components can **call a DNA's functions**. On one agent’s device, clients can call functions in cells, and cells in the same conductor can call each other’s functions. Within one DHT, cells can call other agent’s cells, allowing agents to delegate their agency to others.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Who can call whose functions](#client-inter-zome-bridge-and-remote-calls-who-can-call-whom)
2. [How to secure functions against unauthorized use](#how-to-secure-functions-against-unauthorized-use)
3. [How calls work](#the-lifecycle-of-a-call)

### <i class="far fa-atom"></i> Why it matters

Web 2.0 flourished thanks in part to ‘mashups’, or publicly accessible APIs that allowed apps and services to use each other’s data. Holochain enables a richer sharing of functionality and data between apps, anchoring the experience in the end-user’s agency. This increases application development velocity and encourages the development of standard, shared component libraries. Remote calls, on the other hand, allow agents in one app to interact privately without publishing any data to the DHT.
:::

![](/assets/img/concepts/8.1-calls.png){.sz80p}
{.center}

## Client, inter-zome, bridge, and remote calls: who can call whom

There are four scenarios when a zome’s functions might be accessed. In every scenario, they’re just a [remote procedure call](https://en.wikipedia.org/wiki/Remote_procedure_call). You might remember from [Application Architecture](../2_application_architecture/) that all back-end functionality of a Holochain application is contained in the DNA, or rather, the individual zome libraries in the DNA. Any externally exposed functions in those libraries are exposed in turn by the host as the DNA's public API.

### Client call

![](/assets/img/concepts/8.2-client-call.png)
{.center}

An agent makes things happen in their cell by calling one of its public functions through the **app interface**, which is a WebSocket port that the conductor makes available on the agent's device. The thing making the calls is a client of some sort --- a GUI, a shell script, a long-running service, anything that can speak WebSocket. The important thing to remember is that, because the conductor only exposes the app interface on the local machine, the UI has to live on the local machine. This helps discourage anyone from impersonating the owner of the cell.

### Inter-zome call

![](/assets/img/concepts/8.3-inter-zome-call.png)
{.center}

Although zomes are libraries in one DNA, they don’t have direct access to each other’s functions. They can still call each other, though, via the `call` host function.

### Bridge call

![](/assets/img/concepts/8.4-bridge-call.png)
{.center}

A bridge call allows an agent's cells on one machine to communicate with each other. This is useful for combining the functionality of multiple DNAs into one app. Because Holochain is centered around the agent, it makes more sense to say “Alice’s app instances are talking to each other” than “app A is talking to app B”.

As we've seen, a client can talk to cells too, and it could certainly bear the responsibility for connecting multiple cells together. But it can’t offer the same correctness guarantees that direct calls between cells can offer: the source chains of both cells are ‘locked’ for the duration of the call, and the conductor provides the assurance that the code that cell A thinks cell B is running is actually what it’s running. This means you can better reason about the state of each instance, which is important for things like financial transactions.

### Remote call

![](/assets/img/concepts/8.5-remote-call.png)
{.center}

A remote call allows agents running the same DNA to call each other’s functions. When Bob’s cell makes a remote call to Alice’s cell, it’s Alice’s cell doing the work, which means that everything that happens — reads and writes, signals, and even calls to other cells — _happens from Alice's perspective_. Essentially she’s delegating a bit of her agency to him.

Alice and Bob can use this to do all sorts of useful things:

* Alice can share off-the-record information with Bob, completely bypassing source chains and the DHT. The connection between the two of them is end-to-end encrypted and doesn’t involve any hops through other peers.
* Bob can ask Alice for private data from her source chain.
* Bob can send Alice timely updates on information that matters to both of them, such as chat notifications, heartbeats, game moves, or edits on a shared document (although [signals](../9_signals/) are usually more appropriate for this --- we'll talk about them in a later section).
* Bob can also ask Alice for data from other cells that she’s running and he isn’t — Alice acts as Bob’s bridge between the two DHTs.
* Alice and Bob can negotiate an agreement, such as a financial transaction or legal contract, because both of their source chains are ‘frozen’ at the moment of interaction.
* Alice can delegate certain tasks to Bob, such as publishing blog posts under her name (see the example below). She can even 'sub-delegate' agency that others have delegated to her.

## How to secure functions against unauthorized use

At first sight, this seems pretty risky. Giving your agency away to someone else seems like it should be protected somehow --- which it is.

Holochain uses a variation of [capability-based security](https://wikipedia.org/wiki/Capability_based_security) to protect a cell’s exposed zome functions. In this model, one agent is in complete control of a resource but can delegate control to another agent via public functions protected by 'capability tokens'. While traditional capability-based security doesn't care who's making the call as long as they can produce the token, we’ve expanded that model a little bit:

![](/assets/img/concepts/8.6-unrestricted-capability.png)
{.center}

An **unrestricted** capability lets anybody call a function without producing a token.

![](/assets/img/concepts/8.7-transferrable-capability.png)
{.center}

A **transferable** capability lets anybody who presents a valid capability token call a function (this is identical to traditional capability-based security).

![](/assets/img/concepts/8.8-assigned-capability.png)
{.center}

An **assigned** capability only allows agents with a valid capability token _and the right agent ID_ to call a function.

In order for others to call one of their functions, the callee first has to grant access to that function. They do this by writing a **capability grant entry** to their source chain that specifies the function name, the access level, and any optional information depending on the access level (a random capability token and/or a list of assignees). After that, Holochain will automatically check the credentials of any incoming function call to make sure they match an existing grant. When a grantor wants to revoke or modify access, they simply delete or update that grant entry.

In order to use a transferable or assigned grant, a caller must have already received a capability secret, which they can then save to their own source chain as a capability claim entry. Any time they want to call a function, they retrieve this entry and pass the secret along with the function call.

![](/assets/img/concepts/8.9-author-capability.png)
{.center}

There is one special case where capability tokens aren’t needed: the **author** capability. If the agent ID of the caller and the callee match, such as with calls between zomes in a DNA or cells whose agent IDs are the same, no explicit capability grant is needed.

!!! info "Client calls are currently unprotected"
At time of writing, client zome calls aren't protected by capability-based security; the conductor simply applies the author capability to them. This will change in the near future, which means the clients you write will need to be able to get a capability claim from the agent in order to make calls! We intend to make it easy for app developers though.
!!!

## The lifecycle of a call

Here’s an example of how remote calls might work in a blog app that allows people to publish under someone else’s name.

Alice is the world’s foremost authority on octopi who occasionally hires ghost writers to write about her research in a more popular tone. Recently, she’s hired Bob to write a few articles about octopus camouflage. They both use the same blog DNA, whose functions include:

* `publish_post`, which receives the text of a post, writes it to the user’s source chain, and publishes it to the DHT
* `receive_publish_post_permission`, which takes a capability secret and a memo about why this permission is being granted, and records it as a capability claim on the source chain (this function is given an unrestricted capability at app install time, so anyone can call anyone else’s)
* `get_publish_post_permissions`, which queries the source chain for all the capability claims an agent has collected from other agents
* `publish_as`, which receives a post address and a capability claim address and remote-calls `publish_post`

First, Alice needs to let Bob publish posts under her name. Here’s how she does it:

1. Alice grants Bob permission to call her `publish_post` function by committing an assigned capability grant to her source chain, consisting of Bob’s public key, a random secret, and the aforementioned function name.
2. Alice shares the secret with Bob by remote-calling his `receive_publish_post_permission` function along with the memo “write octopus camouflage articles for Alice”.
3. Bob’s conductor checks his source chain, finds the unrestricted grant, and runs the `receive_publish_post_permission` function with the arguments Alice provided. Inside the function, a capability claim entry is written to his chain consisting of the secret, Alice’s public key, the function name, and a tag consisting of the memo. This process doesn’t require any interaction from Bob, but just to be nice it sends a [signal](../9_signals/) to his UI (we’ll talk about that later) to let him know Alice has granted him permission.
4. Bob has already been working on an article draft for Alice. Now that he’s received permission from Alice, it’s time to publish it. Bob clicks the ‘Publish’ button in his UI.
5. Bob’s UI calls his DNA’s `get_publish_post_permissions` function, then displays the ‘Publish As’ dialog box that shows the names of all the agents who’ve granted him permission to ghost-write for them, along with the memos that explained why he received those permissions.
6. Bob selects Alice’s and clicks ‘Publish’. It calls his DNA’s `publish_as` function with the post ID and capability claim address, which retrieves the post and the capability secret, then remote-calls Alice’s `publish_post` function.
7. Alice’s `publish_post` publishes Bob's post as if it were Alice, then returns a success message to Bob’s `publish_as` function, which returns the message to his UI.

## Key takeaways

* Client calls let a client call a cell's functions. Both client and cell need to be on the same device.
* Inter-zome calls let one zome call another zome’s functions within one agent’s cell.
* Bridge calls let one of an agent’s cells call another of their cells, allowing sharing of functionality and data between apps.
* Remote calling lets one agent call functions in another agent’s cell within the same DHT network.
* Remote calling sets up a direct, end-to-end encrypted channel between two agents to pass the input parameters and return value.
* You call another agent's functions by specifying their agent ID; Holochain resolves this ID to an IP address.
* Remote calling can be used for any data exchange that needs to be private, synchronous, temporary, or timely.
* Remote calling allows one agent to ‘delegate’ their agency to another.
* An inter-zome, bridge, or remote call blocks execution on the caller’s side until they receive a response or the request times out.
* All calls are covered by capability-based security, which consists of a grant created by the callee, who shares a capability secret for the caller to use whenever they want to make a call.
* In Holochain’s capability model, unrestricted and assigned capabilities allow for more or less permissivity than the traditional capability model.

### Next Up 

[Explore signals —>](../9_signals/){.btn-purple} 