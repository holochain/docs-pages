---
hide:
  - toc
---

## Understand Holochain App Code

When you use the Scaffolding Tool to generate your sample project, it will create a new folder with the app name in the current directory. Inside that new folder there's a number of files and folders:

- a .gitignore file
- initialized npm workspace
- default.nix configuration for the Holochain nix-shell
- a DNA "forum" with one Zome "posts"
- configuration files to bundle DNA, hApp and Web hApp (UI + hApp)
- Tryorama setup for e2e tests of the DNA
- a Vuejs (or Svelte or LIT) skeleton frontend hooked up to the DNA
- npm scripts for developing, testing, building and packaging the hApp

*The generated file structure is the recommended layout for hApps.*

```bash
├── Cargo.toml
├── default.nix
├── dnas
│   └── forum
│       ├── workdir
│       │   └── dna.yaml
│       └── zomes
│           ├── coordinator
│           │   └── posts
│           │       ├── Cargo.toml
│           │       └── src
│           │           ├── all_posts.rs
│           │           ├── comment.rs
│           │           ├── lib.rs
│           │           └── post.rs
│           └── integrity
│               └── posts
│                   ├── Cargo.toml
│                   └── src
│                       ├── comment.rs
│                       ├── lib.rs
│                       └── post.rs
├── nix
│   ├── sources.json
│   └── sources.nix
├── package.json
├── README.md
├── tests
│   ├── package.json
│   ├── src
│   │   └── forum
│   │       └── posts
│   │           ├── comment.test.ts
│   │           └── post.test.ts
│   └── tsconfig.json
├── ui
│   ├── index.html
│   ├── package.json
│   ├── src
│   │   ├── App.vue
│   │   ├── forum
│   │   │   └── posts
│   │   │       ├── AllPosts.vue
│   │   │       ├── CommentDetail.vue
│   │   │       ├── CommentsForPost.vue
│   │   │       ├── CreateComment.vue
│   │   │       ├── CreatePost.vue
│   │   │       ├── EditPost.vue
│   │   │       ├── PostDetail.vue
│   │   │       └── types.ts
│   │   ├── main.ts
│   │   ├── style.css
│   │   └── vite-env.d.ts
│   ├── tsconfig.json
│   └── vite.config.ts
└── workdir
    ├── happ.yaml
    └── web-happ.yaml

20 directories, 43 files
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
