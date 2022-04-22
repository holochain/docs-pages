---
hide:
  - toc
---

## Scaffolding a new hApp

Commands that serve to set up a new Holochain app (hApp) are at your fingertips. There are two ways in which you can create a new hApp: generate an empty project or use a GUI to describe your app's structure and then generate it. **All of the following commands need to be run from a Holochain nix-shell.**

### Create an empty project

The command to set up a new empty project is

```bash
hn-init
```

It will create a new folder named "my-app" in the current directory. Inside that new folder there's a number of files and folders:

- initialized git repository
- initialized npm package
- default.nix configuration for the Holochain nix-shell
- a DNA with one Zome
- configuration files to bundle DNA, hApp and Web hApp (UI + hApp)
- Tryorama setup for e2e tests of the DNA
- a Vuejs skeleton frontend hooked up to the DNA
- npm scripts for developing, testing, building and packaging the hApp

> The generated file structure is the recommended layout for hApps.

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

### Create a new hApp using the GUI

If you already know the data structure of your hApp or prefer a visual way of defining the hApp's entries, you can create the new hApp using a GUI.

```bash
holochain-create
```

The resulting hApp is laid out as printed above. A web app is executed and opens in the default web browser. It provides controls to add DNAs and Zomes, and to add and configure
field name and types of your hApp's entry definitions. Further you can choose between different templates for the hApp's UI.

When you're done setting up the hApp in this graphical way, all files will be produced in the folder "my-app".

## Running a deployed hApp

At some stage in the app development you'll want to deploy your hApp for others to use it. If you've created the hApp with the scaffolding tools, all you need to do to package is is run

```bash
npm run package
```

The app bundle ending in `.webhapp` will be available in the project root's `workdir` folder. Now you can deploy it to a place where users can download it. In order to install and run the hApp, there's a GUI for administrating apps on a computer. It's called the Holochain Launcher. To download and use it, refer to https://github.com/holochain/launcher.