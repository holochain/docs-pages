---
title: "Calls and Capabilities: Communicate With Other Components And Peers"
---

::: coreconcepts-intro
Application components can **call a cell's functions**. On one agent's device, clients can call functions in cells, and cells in the same conductor can call each other's functions. Within one DHT, cells can call other agents' cells, allowing agents to delegate their agency to others.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Who can call whose functions](#client-inter-zome-bridge-and-remote-calls-who-can-call-whom)
2. [How to secure functions against unauthorized use](#how-to-secure-functions-against-unauthorized-use)
3. [How calls work](#the-lifecycle-of-a-call)

### <i class="far fa-atom"></i> Why it matters

Web 2.0 flourished thanks in part to 'mashups', applications that combined the functionality of multiple publicly accessible APIs in new and creative ways. Holochain enables a richer sharing of functionality and data between apps, anchoring the experience in the end-user's agency. This increases application development velocity and encourages the development of standard, shared component libraries. Remote calls, on the other hand, allow agents in one app to interact privately without publishing any data to the DHT.
:::

![](/assets/img/concepts/8.1-calls.png){.sz80p} {.center}

## Client, inter-zome, bridge, and remote calls: who can call whom

You might remember from [Application Architecture](../2_application_architecture/) that all back-end functionality of a Holochain application is contained in the DNA, or rather, the individual zome libraries in the DNA. Any externally exposed functions in those libraries, specifically the **coordinator zomes**, are exposed in turn by the conductor as the cell's public API. There are four scenarios when this API might be accessed. In every scenario, it could be considered a [remote procedure call](https://en.wikipedia.org/wiki/Remote_procedure_call).

### Client call

![](/assets/img/concepts/8.2-client-call.png){.sz80p} {.center}

An agent makes things happen in her cell by calling one of its public functions through the **app interface**, which is a WebSocket port that the conductor makes available on the agent's device. The thing making the calls is a client of some sort --- a GUI, a shell script, a long-running service, anything that can speak WebSocket. The important thing to remember is that, because the conductor only exposes the app interface on the local machine, the client has to live on the local machine too. This protects the cell from being accessed by anyone other than its owner.

### Inter-zome call

![](/assets/img/concepts/8.3-inter-zome-call.png){.sz80p} {.center}

Although zomes are libraries in one DNA, they don't have direct access to each other's functions. They can still call each other, though, via the `call` host function.

### Bridge call

![](/assets/img/concepts/8.4-bridge-call.png){.sz80p} {.center}

A bridge call allows different cells in a hApp to communicate with each other. This works only within a conductor, not across a network, and is useful for combining the functionality of multiple DNAs into one app. Because Holochain is centered around the agent, it makes more sense to say "Alice's app components are talking to each other" than "app A is talking to app B".

As we've seen, a client can talk to cells too, and it could certainly take responsibility for bridging functionality between cells. But it can't offer the same correctness guarantees or convenience that direct calls between cells can offer: the source chains of both cells are 'locked' for the duration of the call, and the conductor provides the assurance that the code that cell A thinks cell B is running is actually what it's running. This means you can better reason about the state of each cell, which is important for things like financial transactions.

### Remote call

![](/assets/img/concepts/8.5-remote-call.png){.sz80p} {.center}

A remote call allows agents running the same DNA to call each other's functions. When Bob's cell makes a remote call to Alice's cell, it's Alice's cell doing the work, which means that everything that happens --- reads and writes, signals, and even calls to other cells --- _happens from Alice's perspective_. Essentially she's delegating a bit of her agency to him.

Alice and Bob can use this to do all sorts of useful things:

* Alice can share off-the-record information with Bob, completely bypassing source chains and the DHT. The connection between the two of them is end-to-end encrypted and doesn't involve any hops through other peers.
* Bob can ask Alice for private data from her source chain.
* Bob can send Alice timely updates on information that matters to both of them, such as presence indicators or notifications of new records on his source chain (although [signals](../9_signals/) are usually more appropriate for these --- we'll talk about them in a later section).
* Bob can also ask Alice for data from other cells that she's running and he isn't --- Alice acts as a mediator between the two DHTs.
* Alice and Bob can negotiate an agreement using [countersigning](../10_countersigning/), such as a financial transaction or legal contract, because both of their source chains are 'frozen' at the moment of interaction.
* Alice can give Bob the power to perform certain tasks, such as publishing blog posts under her name (see the example below). She can even 'sub-delegate' agency that others have delegated to her.

## How to secure functions against unauthorized use

At first sight, this seems pretty risky. Giving your agency away to someone else seems like it should be protected somehow --- which it is.

Holochain uses a variation of [capability-based security](https://wikipedia.org/wiki/Capability_based_security) to protect a cell's exposed zome functions. In this model, one agent is in complete control of a resource but can delegate control to another agent via public zome functions protected by 'capability tokens'. While traditional capability-based security doesn't care who's making the call as long as they can produce the token, we've expanded that model a little bit by adding more **access types**:

![](/assets/img/concepts/8.6-unrestricted-capability.png){.sz80p} {.center}

An **unrestricted** capability lets anybody call a function without producing a token.

![](/assets/img/concepts/8.7-transferrable-capability.png){.sz80p} {.center}

A **transferable** capability lets anybody call a function if they can present a valid capability token (this is identical to traditional capability-based security).

![](/assets/img/concepts/8.8-assigned-capability.png){.sz80p} {.center}

An **assigned** capability only allows agents with a valid capability token to call a function, but only if they've signed the call with a recognized public key.

In order for others to call one of their functions, the callee first has to grant access to that function. They do this by writing a **capability grant entry** to their source chain that specifies the function name, the access level, and any optional information depending on the access type (a random capability token and/or a list of assignees). After that, Holochain will automatically check the credentials of any incoming function call to make sure they match an existing grant. When a grantor wants to revoke or modify access, they simply delete or update that grant entry.

In order to use a transferable or assigned grant, a caller must have already received a capability secret, which (if they're another cell) they can then save to their own source chain as a **capability claim entry**. Any time they want to call the function, they retrieve this entry and pass the secret along with the function call.

![](/assets/img/concepts/8.9-author-capability.png){.sz80p} {.center}

There is one special case: if the public key of the caller and the callee match, such as with calls between zomes in a single DNA, cells in a single hApp, or UIs hosted in the Holochain Launcher, the conductor applies the **author** grant and no explicit capability grant is needed.

### Giving a client a capability

It's recommended that a minimally permissive capability should be granted to a caller. A caller may be running in one of a few different contexts, each with different appropriate strategies for granting capabilities:

* If the client is **embedded** into the same executable as the conductor, as with the [Holochain Launcher](https://github.com/holochain/launcher) or an Electron app that includes the conductor, the executable will have access to the signing capabilities of the author's private key and can take advantage of the author grant.
* If the client is **separate** from the conductor, such as a page spawned in the participant's web browser, it can either generate and store its own key pair, ask the conductor to authorize it, and use it to sign all zome calls; or it can ask the conductor to generate a transferrable grant and store the capability secret.

## The lifecycle of a call

Here's an example of how remote calls might work in a blog app that allows people to publish under someone else's name.

Alice is the world's foremost authority on octopi who occasionally hires ghost writers to write about her research in a more popular tone. Recently, she's hired Bob to write a few articles about octopus camouflage. Their cells both use the same blog DNA, whose functions include:

* `publish_post`, which receives the text of a post, writes it to the participant's source chain, and publishes it to the DHT
* `receive_publish_post_permission`, which takes a capability secret and a memo about why this permission is being granted, and records it as a capability claim on the source chain (this function is given an unrestricted capability at app install time, so anyone can send a capability to anyone else)
* `get_publish_post_permissions`, which queries the source chain for all the capability claims an agent has collected from other agents
* `publish_as`, which receives a post address and a capability claim address and remote-calls `publish_post` in the grantor's cell

First, Alice needs to let Bob publish posts under her name. Here's how she does it:

1. Alice grants Bob permission to call her `publish_post` function by committing an assigned capability grant to her source chain, consisting of Bob's public key, a random secret, and the aforementioned function name.
2. Alice shares the secret with Bob by remote-calling his `receive_publish_post_permission` function along with the memo "write octopus camouflage articles for Alice".
3. Because access to `receive_publish_post_permission` is already covered by an unrestricted grant, Bob's conductor allows Alice to call it. Inside the function, a capability claim entry is written to his chain consisting of the secret, Alice's public key, the function name, and a tag consisting of the memo. This process doesn't require any interaction from Bob, but just to be nice it sends a [signal](../9_signals/) to his UI (we'll talk about that later) to let him know Alice has just granted him permission for something.
4. Bob has already been working on an article draft for Alice. Now that he's received permission from Alice, it's time to publish it. Bob clicks the 'Publish' button in his UI.
5. Bob's UI calls his DNA's `get_publish_post_permissions` function, then displays the 'Publish As' dialog box that shows the names of all the agents who've granted him permission to ghost-write for them, along with the memos that explained why he received those permissions.
6. Bob selects Alice's and clicks 'Publish'. It calls his DNA's `publish_as` function with the post ID and capability claim address, which retrieves the post and the capability secret, then remote-calls Alice's `publish_post` function.
7. Alice's `publish_post` republishes Bob's post as if it were Alice, then returns a success message to Bob's `publish_as` function, which returns the message to his UI.

## Key takeaways

* Client calls let a client call a cell's functions. Both client and cell need to be on the same device.
* Inter-zome calls let one zome call another zome's functions within one agent's cell.
* Bridge calls let one of an agent's cells call another of their cells, allowing sharing of functionality and data between apps.
* Remote calling lets one agent call functions in another agent's cell within the same DNA's network.
* Remote calling sets up a direct, end-to-end encrypted channel between two agents to exchange the input parameters and return value.
* One agent calls another agent's functions by specifying their agent ID; Holochain resolves this ID to a network transport address.
* Remote calling can be used for any data exchange that needs to be private, synchronous, temporary, or timely.
* Remote calling allows one agent to 'delegate' their agency to another.
* An inter-zome, bridge, or remote call blocks execution on the caller's side until they receive a response or the request times out.
* All calls are covered by capability-based security, which consists of a grant created by the callee, who shares a capability secret (when applicable) for the caller to use whenever they want to make a call.
* In Holochain's capability model, unrestricted and assigned capabilities allow for more or less permissivity than the traditional capability model.

!!! learn Learn more
* [Wikipedia: Principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege)
!!!

### Next Up

[Explore signals →](../9_signals/){.btn-purple}