# 12: Bridging across multiple DNA instances

> A user's running DNA instances can be **bridged** to each other to allow trustable interaction between app networks, mediated by their own membership in each of those networks.

![](https://i.imgur.com/cLIbp2d.jpg)

When we outlined the [architecture of a typical hApp](../2_application_architecture), we recommended that you write DNA with a small scope of responsibility, so that they can be repurposed and combined into new apps, similar to [microservices](https://en.wikipedia.org/wiki/Microservices). But in order to function together in an app, these packets of functionality often need some way of talking to each other.

You can do this in two ways:

* A client on the user's machine (e.g., GUI) can talk to two DNA instances to translate data from one DNA's space to another. This is flexible but loses some of the integrity provided by Holochain's trusted execution environment.
* Two DNA instances on the user's machine can form a **bridge** to talk to each other directly. This creates a hard dependency between those DNAs, but allows them to guarantee the integrity of their responses.

In both cases, it's the _agents themselves_ (or, rather, the software they're running) that create the bridge. They make the connection between two app DHTs by their presence in both of them. Many agents might bridge between the same two DHTs and recognise each other in both spaces, or there might only be a single user mediating a bridge. It all depends on how you design your app.

A DNA can specify a bridge dependency either:

* **explicitly** by its **DNA hash**, or
* **implicitly** by referencing one or more **traits** that it may implement.

A trait is like a [contract](https://en.wikipedia.org/wiki/Design_by_contract), [interface, or protocol](https://en.wikipedia.org/wiki/Protocol_(object-oriented_programming)) from object-oriented programming. It specifies a collection of functionality that a zome is capable of. This gives users choice over their preferred implementations of DNAs with certain traits. An example that we'll explore in the next tutorial is a currency DNA that broadcasts transaction announcements into a microblogging DNA --- as a user, you could swap the microblogging dependency with any DNA that advertises the ability to post a short status message.

## Further reading

* [Holochain core apps](#) (non-existent article; link does notwork), DNAs that exist on nearly every Holochain node. You can bridge to these apps from your own and even 'fork' them into private instances.
* [Open-source DNA registry](#) (non-existent link; should link to a GH repo that tracks things like [HoloREA](https://github.com/holo-rea), [File Storage](https://github.com/holochain/file-storage-zome), and [HoloJS](https://github.com/ReversedK/HoloJS).

Here's a short listof core apps:

* [**DeepKey**](https://github.com/Holo-Host/DeepKey), for maintaining a continuous identity across devices by allowing users to create, connect, and revoke their device keys.
* [**Personas & Profiles**](https://github.com/holochain/personas-profiles), for storing personal information, sharing it with other hApps, and keeping it in sync.
* [**Basic Chat**](https://github.com/holochain/holochain-basic-chat), for creating chat, forum, commenting, instant messaging, or live customer support apps.
* [**HCHC**](https://github.com/holochain/HCHC-rust) or Holochain of Holochains, a package manager for distributing Holochain DNA and UI bundles.
* [**hApp Store**](https://github.com/holochain/HApps-Store), a directory of Holochain apps.
* **Source chain backups**, for safely making redundant copies of private source chain data and restoring them to new devices.

[Tutorial: **TransactionAnnouncements** >](#)
[Next: **Spawning New DNA Instances From A Template** >>](#)

