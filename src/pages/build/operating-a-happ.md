---
title: Operating a hApp
---

::: intro
Operating a peer-to-peer app is different from operating a cloud-based app. There's no application server to maintain and no code to deploy, but there are new things you'll have to think about: **distribution/updating**, **DHT aliveness**, and **bootstrapping**.
:::

## Distributing a hApp

Because the users of a hApp are the ones that run the application code, you don't have to deploy any application code in the cloud. But you do have to get a copy of the hApp into your users' hands. There are two well-supported ways to do this, both of which involve bundling your hApp and web-based UI into a binary:

* You can create an [Electron](https://www.electronjs.org/)-based binary for Windows, macOS, and Linux using the [Kangaroo repository](https://github.com/holochain/kangaroo-electron) as a starting point. <!-- TODO: link to guide -->
* You can create a [Tauri](https://tauri.app/)-based binary for Windows, macOS, Linux, and Android using the [p2p Shipyard](https://darksoil.studio/p2p-shipyard/) tool from our friends at [dark soil studio](https://darksoil.studio/). [Read their documentation](https://darksoil.studio/p2p-shipyard/guides/creating-an-app.html) to find out how.

Because a hApp is defined by its DNAs, and those DNAs live on the devices of your users, it's a good idea to use auto-updating because you can't easily update the hApp any other way. Both of the choices above support auto-updating, with two warnings:

!!! info Auto-updating Holochain or the hApp may create network forks
* If you make changes to any of the integrity code in a DNA, it'll be backed by an entirely new network without access to the old network and its data. This means users who have upgraded may not be able to see users who haven't upgraded yet.
* If you update the bundled Holochain conductor, its network protocol and local database schema might not be compatible with a previous version, so your users may lose access to their existing data or be unable to communicate with users on older versions of Holochain.
!!!

## Keeping a DHT alive

A DHT only exists if agents are actively running cells instantiated from that DHT and communicating with each other.

If you have enough users, your hApp's DHTs will probably stay alive by themselves. But if you have a small number of users, or if they're only online for a few minutes at a time, the network might suffer from poor connectivity, which your users will experience as inability to join the network, missing data from others, and network latency.

The solution to this is **always-on nodes**. You can run a few hApp instances on devices you own (or in the cloud), or you can encourage some users to leave their devices turned on with their copy of the hApp running. <!-- TODO: Update this to mention full-arc when sharding is a thing -->

Our partners at Holo Hosting also offer [Cloud Nodes](https://holo.host/product/hosting-services/), which are always-on Holochain conductors hosted on a decentralized network of community-owned devices around the world. Click the 'Request a demo' button on [Holo's website](https://holo.host/) to get started.

## Running network infrastructure

### Bootstrap/signal server

For a hApp to run smoothly on the public internet, its users need a little bit of centralized infrastructure to discover each other and establish peer-to-peer connections. You'll need to set up and maintain an instance of the Kitsune2 bootstrap/signal server; [read the howto](#) <!-- TODO: link when https://github.com/holochain/docs-pages/pull/594 is merged --> to get set up.

### WebRTC servers

Although Holochain is designed to support multiple transport protocols, currently it only officially supports WebRTC over IP networks. We recommend you find or set up your own WebRTC [STUN](https://en.wikipedia.org/wiki/STUN) and [ICE](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) servers. There are a number of free public servers run by various companies; for instance, Holochain defaults to `stun.l.google.com` for both STUN and ICE if you don't specify any.

### Configuring the hApp

Once you've set up your bootstrap/signal server and chosen your STUN and ICE servers, you'll need to configure your hApp to use them. If you're using the Kangaroo template repository, it comes with a [config file](https://github.com/holochain/kangaroo-electron/blob/main/kangaroo.config.ts) with default servers; replace the `bootstrapUrl`, `signalUrl`, and `iceUrls` fields with the correct values. `bootstrapUrl` and `signalUrl` can use the same Kitsune2 server instance because it provides both services; make sure `bootstrapUrl` starts with `https://` and `signalUrl` starts with `wss://`.

!!! info
All agents in a DNA must use the same bootstrap and signal servers in order to discover each other. However, different agents can use different ICE/STUN servers without trouble.
!!!