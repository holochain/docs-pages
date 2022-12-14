---
hide:
  - toc
---

## Scaffolding a new hApp

Commands to set up a new Holochain app (hApp) are at your fingertips. There are two ways in which you can create one:

1. generate an empty project or
2. use a GUI to describe your app's structure and then generate it.

**All of the following commands need to be run from a Holochain nix-shell.** [Steps to set up such a nix-shell](../install/#using-holochain-with-a-pinned-holochain-version).

### Create an empty project

The command to set up a new empty project is

```bash
npm init @holochain
```

### Create a new hApp using the GUI

This offers a visual way of defining the hApp's entries, you can create the new hApp using a GUI. You can also just proceed without editing anything and click 'Scaffold App' to generate your project folders and switch to editing in an IDE.

The resulting hApp is laid out as printed above. A web app is executed and opens in the default web browser. It provides controls to add DNAs and Zomes, and to add and configure
field name and types of your hApp's entry definitions. Further you can choose between different templates for the hApp's UI.

It will create a new folder named "my-app" in the current directory. Inside that new folder there's a number of files and folders:

- initialized git repository
- initialized npm package
- default.nix configuration for the Holochain nix-shell
- a DNA with one Zome
- configuration files to bundle DNA, hApp and Web hApp (UI + hApp)
- Tryorama setup for e2e tests of the DNA
- a Vuejs (or Svelte or LIT) skeleton frontend hooked up to the DNA
- npm scripts for developing, testing, building and packaging the hApp

*The generated file structure is the recommended layout for hApps.*

```bash
├── Cargo.toml
├── default.nix
├── dnas
│   └── dna-1
│       ├── workdir
│       │   └── dna.yaml
│       └── zomes
│           └── zome-1
│               ├── Cargo.toml
│               └── src
│                   ├── entry-def-1
│                   │   ├── entry.rs
│                   │   ├── handlers.rs
│                   │   └── mod.rs
│                   └── lib.rs
├── package.json
├── README.md
├── tests
│   ├── package.json
│   ├── src
│   │   ├── dna-1
│   │   │   └── zome-1
│   │   │       └── entry-def-1.ts
│   │   ├── index.ts
│   │   └── utils.ts
│   └── tsconfig.json
├── ui
│   ├── index.html
│   ├── package.json
│   ├── public
│   │   └── favicon.ico
│   ├── README.md
│   ├── src
│   │   ├── App.vue
│   │   ├── assets
│   │   │   └── logo.png
│   │   ├── components
│   │   │   └── HelloWorld.vue
│   │   ├── env.d.ts
│   │   ├── main.ts
│   │   ├── services
│   │   │   └── appWebsocket.ts
│   │   └── types.ts
│   │       └── dna-1
│   │           └── zome-1.ts
│   ├── tsconfig.json
│   └── vite.config.ts
└── workdir
    ├── happ.yaml
    └── web-happ.yaml

20 directories, 30 files
```

You can enter the Holochain nix-shell and immediately start developing your hApp.

## Distribute and Run your hApp

At some stage in the app development you'll want to deploy your hApp for others to use it. For this, you will need to package it into a `.webhapp` file that contains both the backend and the front-end code of your hApp.

If you've created the hApp with the `hc scaffold` cli tool, all you need to do is:

```bash
npm run package
```

The app bundle ending in `.webhapp` will be available in the project root's `workdir` folder. Now you can deploy it to a place where users can download it or directly share it with peers you want to use it with.

To run a `.webhapp` file on your computer, Holochain provides the Holochain Launcher, a graphical user interface to install, run and administrate Holochain apps.

[Download Holochain Launcher](https://github.com/holochain/launcher/releases)

To publicly share your bundled hApp via the Holochain Launcher, follow the [instructions](https://github.com/holochain/launcher#publishing-a-webhapp-to-the-devhub) in the README of the Holochain Launcher.
