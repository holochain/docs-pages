---
title: Distribute your App
---

## Packaging a Web-hApp archive

At some stage in the app development you'll want to deploy your hApp for others to use it. For this, you will need to package it into a `.webhapp` file that contains both the back-end and the front-end code of your hApp.

If you've created the hApp with the `hc scaffold` cli tool, all you need to do is:

```shell
npm run package
```

The app bundle ending in `.webhapp` will be available in the project root's `workdir` folder. Now you can deploy it to a place where users can download it or directly share it with peers you want to use it with.

To bundle manually and for extended details on Web-hApps, refer to the packaging steps in the [Github repo of the Holochain Launcher](https://github.com/holochain/launcher?tab=readme-ov-file#developers).

## Installing the app using the Holochain Launcher

Holochain provides the Holochain Launcher, a graphical user interface, to install, run and administrate hApps. [Download Holochain Launcher](https://github.com/holochain/launcher/releases)

To publicly share your bundled hApp through the Holochain Launcher, follow the [instructions on how to publish it to the DevHub](https://github.com/holochain/launcher?tab=readme-ov-file#publish-an-app-to-launchers-app-store) in the README of the Holochain Launcher.

Another option is to distribute the app bundle via a website such as GitHub's releases page for your project. Other users will need to obtain the bundled app file and install it to their Launcher.