---
hide:
  - toc
---

## Understanding the Project Structure of your Scaffolded hApp

When you use the Scaffolding Tool to generate your sample project, it will create a new folder with the app name in the current directory. Inside that new folder there's a number of files and folders:

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

## Running a deployed hApp

At some stage in the app development you'll want to deploy your hApp for others to use it. If you've created the hApp with the scaffolding tools, all you need to do to package is run

```bash
npm run package
```

The app bundle ending in `.webhapp` will be available in the project root's `workdir` folder. Now you can deploy it to a place where users can download it. In order to install and run the hApp, there's a GUI for administrating apps on a computer. It's called the Holochain Launcher. To download and use it, refer to <https://github.com/holochain/launcher>.
