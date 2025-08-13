---
title: Operating a hApp
---

::: intro
Operating a peer-to-peer app is different from operating a cloud-based app. There's no application server to maintain and no code to deploy, but there are new things you'll have to think about: **distribution/updating**, **DHT availability**, and **bootstrapping**.
:::

## Distributing a hApp

Because the users of a hApp are the ones that run the application code, you don't have to deploy any application code in the cloud. But you do have to get a copy of the hApp into your users' hands. There are two well-supported ways to do this, both of which involve bundling your hApp and web-based UI into a binary:

* You can create an [Electron](https://www.electronjs.org/)-based binary for Windows, macOS, and Linux using the [Kangaroo repository](https://github.com/holochain/kangaroo-electron) as a starting point. <!-- TODO: link to guide -->
* You can create a [Tauri](https://tauri.app/)-based binary for Windows, macOS, Linux, and Android using the [p2p Shipyard](https://darksoil.studio/p2p-shipyard/) tool from our friends at [darksoil studio](https://darksoil.studio/). [Read their documentation](https://darksoil.studio/p2p-shipyard/guides/creating-an-app.html) to find out how.

!!! info Be careful with auto-updating
The auto-updater code in Kangaroo checks your project's GitHub releases page for releases with a version number that's [semver](https://semver.org)-compatible with the one the user currently has installed. It's up to you to make sure that you bump your version numbers in a way that an auto-update doesn't break anything.

In particular, the following needs to be considered:

* Updating/changing the hApp file that's bundled with the app will not replace the hApp file for existing users of your app receiving an auto-update. This means:
  * You cannot update coordinator zomes.
  * If you change the hApp file that you bundle with the app, any new users of your app who start from this new version will be using a different hApp than existing users that installed the version via auto-updates.
* You should only update the bundled Holochain version to semver-compatible Holochain versions to prevent data loss or network forks.

If you want to release an incompatible version of your app that includes changes to the hApp file or bumps to an incompatible Holochain version, you should bump the leftmost integer of the app's version number, to indicate to the auto-updater that it's an incompatible version from the previous one.
!!!

!!! info Code signing certificates
To make your hApps run on macOS and Windows without showing your users a security warning, you'll need to get a code signing certificate. Read [Apple's documentation](https://developer.apple.com/documentation/security/code-signing-services) for macOS and [this third-party howto](https://melatonin.dev/blog/how-to-code-sign-windows-installers-with-an-ev-cert-on-github-actions/) for Windows. If you're using Kangaroo, you can then [follow the instructions](https://github.com/holochain/kangaroo-electron/?tab=readme-ov-file#code-signing) to get code signing into your GitHub CI pipeline.
!!!

## Keeping a DHT alive

A DHT only exists if agents are actively running cells instantiated from that DHT and communicating with each other.

The more users there are, and the more time they spend using your hApp, the greater the chance they'll be able to keep its DHTs running by themselves. But this is never a sure thing, so a real-world network is likely to suffer from poor round-the-clock availability, which your users will experience as inability to join the network, missing data from others, and network latency.

The solution to this is **always-on nodes**. You can run a few hApp instances on devices you own (or in the cloud), or you can encourage some users to leave their devices turned on with their instance of the hApp running. <!-- TODO: Update this to mention full-arc when sharding is a thing -->

## Running network infrastructure

### Bootstrap/signal server

For a hApp to run smoothly on the public internet, its users need a little bit of centralized infrastructure to discover each other and establish peer-to-peer connections. You'll need to set up and maintain an instance of the Kitsune2 bootstrap/signal server; [read the howto](/resources/howtos/running-network-infrastructure/) to get set up.

### WebRTC servers

Although Holochain is designed to support multiple transport protocols, currently it only officially supports WebRTC over IP networks. We recommend you find or set up your own WebRTC [STUN](https://en.wikipedia.org/wiki/STUN) servers. There are a number of free public servers run by various companies.

### Configuring the hApp

Once you've set up your bootstrap/signal server and chosen your STUN servers, you'll need to configure your hApp to use them. If you're using the Kangaroo template repository, it comes with a [config file](https://github.com/holochain/kangaroo-electron/blob/main/kangaroo.config.ts) with default servers; replace the `bootstrapUrl`, `signalUrl`, and `iceUrls` fields with the correct values. `bootstrapUrl` and `signalUrl` can use the same Kitsune2 server instance because it provides both services; make sure `bootstrapUrl` starts with `https://` and `signalUrl` starts with `wss://`.

!!! info
All agents in a DNA must use the same bootstrap and signal servers in order to discover each other.
!!!