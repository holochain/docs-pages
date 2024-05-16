---
title: "Deploying your Holochain application"
tocData:
  - text: Packaging
    href: packaging
  - text: Runtimes
    href: runtimes
    children:
      - text: Launcher
        href: launcher-the-multi-app-runtime
      - text: Standalone
        href: standalone-executable
  - text: Next steps
    href: next-steps
---

Now that you've built an application, it's time to get it into other people's hands. First an app must be packaged into a distributable bundle format. Then it can be published somewhere a user can access it.

## Packaging

You specify the components of a hApp using manifest files, written in [YAML](https://yaml.org/), and the `hc` CLI looks for them when it's building a distributable hApp for you. If you look in the `workdir` folder:

```shell
ls workdir
```

You'll see that the scaffolding tool has generated two manifest files for you:

:::output-block
```text
happ.yaml  web-happ.yaml
```
::: output-block

The first step is to package your app:

```shell
npm run package
```

This command does a number of things:

1. Triggers the Rust compiler to build the zomes,
2. Uses the `hc` CLI too to combine the built zomes and the DNA manifest into a `.dna` file,
3. Combines all the DNAs and the hApp manifest into a `.happ` file,
3. Builds the UI and compresses it into a `.zip` file, and
4. Combines the hApp file, the UI zip, and the web hApp manifest into a `.webhapp` file.

Of course, this application only has one zome and one DNA, but more complex apps may have many of each.

Now you'll see some new files in `workdir`:

```shell
ls workdir
```

::: output-block
```text
happ.yaml  my_forum_app.happ  my_forum_app.webhapp  web-happ.yaml
```
::: output-block

The packed app is now ready for deployment to a Holochain runtime.

## Runtimes

In the centralized world, deployment is usually achieved by Continuous Integration (CI) automation that builds up code changes and sends them to whatever server or cloud-based platform you're using. In the decentralized world of Holochain, deployment happens when end-users download and run your hApp in the Holochain runtime (although you could certainly use CI to build releases of your hApp).

From the end-user perspective there are currently two ways to go about this:

1. Download Holochain's official Launcher runtime and install the app from its app store or the filesystem.
2. Download your app as its own standalone desktop executable, as they would any other application for their computer.

### Launcher, the multi-app runtime

Holochain's official end-user runtime is the [Holochain Launcher](https://github.com/holochain/launcher). It allows people to install hApps, including web hApps from a built-in app store or from the filesystem. Installed apps' UIs can then be launched from a friendly UI. The app store is itself a distributed Holochain application which provides details on applications that are available for download. As a developer you can either go through a simple publishing process and add your app to the app store where it will be available for installation by all people who use the Launcher, or you can share it directly with end-users through your own channels and they can install it into their Holochain Launcher manually from the filesystem.

You can try this latter approach with your forum app immediately by downloading and running the Launcher! If you install `workdir/my_forum_app.webhapp`, the hApp _and its UI_ will be installed.

The steps for publishing an app to the Launcher's app store are documented in the Github repository of the Holochain Launcher [here](https://github.com/holochain/launcher#publishing-and-updating-an-app-in-the-devhub).

### Standalone executable

If you prefer to distribute your app as a full standalone executable, you'll need to bundle the Holochain runtime and your app together and take care of the necessary interactions between them. Because Holochain itself is really just a set of Rust libraries, you can of course build your own application that uses those libraries, but that's a fair amount of work. Currently there are two much simpler paths for doing this: using either the [Electron](https://www.electronjs.org/) or [Tauri](https://tauri.app/) frameworks, both of which can generate cross-platform executables from standard web UIs. These frameworks automatically bundle the necessary binaries, the [`holochain` conductor runtime](https://crates.io/crates/holochain) and the [`lair` keystore](https://crates.io/crates/lair_keystore). Though there is quite a bit of complexity in setting things up for these frameworks, all the hard work has already been done for you:

* **Tauri**: See the officially supported [holochain-kangaroo](https://github.com/holochain-apps/holochain-kangaroo) repo.
* **Electron**: See the officially supported [holochain-kangaroo-electron](https://github.com/holochain-apps/holochain-kangaroo-electron) repo.

Both of these are GitHub template repos. The Tauri one has detailed instructions on how to clone them and add in your UI and DNA, as well as build and release commands that will create the cross-platform executables that you can then deliver to your end users. The Electron one is a work in progress, although we'll be putting most of our focus on it in the future, as it has fewer cross-platform bugs.

The supported Holochain versions of these repos sometimes lags behind the current recommended version, so you may need to manually update them.

!!! note Code Signing
For macOS and Windows, you'll probably also want to go through the process of registering as a developer so that your application can be "code-signed". This is needed so that users don't get the "unsigned code" warnings when launching the applications on those platforms. Both of the above templates include instructions for CI automation to run the code-signing steps on release once you have acquired the necessary certificates.
!!!

## Next steps

Congratulations! You've learned how to create a new Holochain application, understand its layout, work with core concepts, and deploy it.

### Further exploration and resources

Now that you have successfully built a basic forum application using Holochain and integrated it with a front end, you may want to explore more advanced topics and techniques to further enhance your application or create new ones. Here are some resources and ideas to help you get started:

#### Holochain developer documentation

The official Holochain developer documentation is a valuable resource for deepening your understanding of Holochain concepts, techniques, and best practices. Be sure to explore the documentation thoroughly:

* [Holochain Core Concepts](/concepts/1_the_basics/)
* [Holochain Developer Kit (HDK) reference](https://docs.rs/hdk/latest/hdk)

#### Community resources

The Holochain community is an excellent source of support, inspiration, and collaboration. Consider engaging with the community to further your learning and development:

* [Holochain GitHub repositories](https://github.com/holochain)
* [Holochain Discord server](https://discord.com/invite/k55DS5dmPH)

#### Example applications and tutorials

Studying existing Holochain applications and tutorials can provide valuable insights and inspiration for your projects. Here are some resources to explore:

* [Holochain Open Dev](https://github.com/holochain-open-dev)
* [Holochain Foundation sample apps](https://github.com/holochain-apps)