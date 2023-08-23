---
title: Get Started
tocData:
  - text: 1. Introduction to Holochain
    href: 1-introduction-to-holochain
  - text: 2. Installing Holochain development environment
    href: 2-installing-holochain-development-environment
  - text: 3. Scaffold a simple "Hello, World!" Holochain application
    href: 3-scaffold-a-simple-hello-world-holochain-application
  - text: 4. Understanding the layout of a Holochain application
    href: 4-understanding-the-layout-of-a-holochain-application
  - text: "5. Zero to built: creating a forum app"
    href: 5-zero-to-built-creating-a-forum-app
    children:
    - text: 5.1. Scaffolding a hApp
      href: 5-1-scaffolding-a-happ
    - text: 5.2. Select user interface framework
      href: 5-2-select-user-interface-framework
    - text: 5.3. Set up Holonix development environment
      href: 5-3-set-up-holonix-development-environment
    - text: 5.4. Scaffold a DNA
      href: 5-4-scaffold-a-dna
    - text: 5.5. Scaffold a zome
      href: 5-5-scaffold-a-zome
    - text: 5.6. Scaffold entry types
      href: 5-6-scaffold-entry-types
    - text: 5.7. Scaffold link types
      href: 5-7-scaffold-link-types
    - text: 5.8. Scaffold a collection
      href: 5-8-scaffold-a-collection
    - text: 5.9. Integrate the generated UI elements
      href: 5-9-integrate-the-generated-ui-elements
  - text: 6. Creating validation rules
    href: 6-creating-validation-rules
    children:
      - text: 6.1. Beginner (inspecting the entries)
        href: 6-1-beginner-inspecting-the-entries
      - text: 6.2. Advanced (inspecting the actions)
        href: 6-2-advanced-inspecting-the-actions
  - text: 7. Deploying your Holochain application
    href: 7-deploying-your-holochain-application
    children:
      - text: 7.1 Packaging
        href: 7-1-packaging
      - text: 7.2 Runtimes
        href: 7-2-runtimes
  - text: 8. Next steps
    href: 8-next-steps
---

Welcome to the Getting Started with Holochain guide! This guide will walk you through the process of installing the Holochain development tools and creating a simple forum application. By the end of this guide, you'll be familiar with the core concepts of Holochain and have a basic understanding of how to develop peer-to-peer applications using the Holochain framework.

## How to use this guide

Follow this guide step by step. All steps are essential to create the example applications. No additional code or steps are needed.

* We assume that you are reading this guide because your are a developer new to Holochain but interested in actually building peer-to-peer distributed applications using a framework that is agent-centric, that provides intrinsic data integrity, is scalable, and when deployed, end-user code runs just on the devices of the participants without relying on centralized servers or blockchain tokens or other points of centralized control.
* We assume that you've at least skimmed [Holochain's Core Concepts](https://developer.holochain.org/concepts/1_the_basics/) or are ready to pop over there when needed.
* Because Holochain's DNA's are written in Rust, we assume you have at least a basic familiarity with the language. Note, however, that this guide will take you through everything you need to do, step-by-step, so you can follow the steps and learn Rust later. Additionally, Holochain DNAs rarely need to take advantage of the more complicated aspects of the language, so don't let Rust's learning curve scare you.
    * If you're new to Rust, you can start your learning journey by reading chapters 1 to 11 in the [Rust Book](https://doc.rust-lang.org/book/) and doing the accompanying [Rustlings exercises](https://github.com/rust-lang/rustlings/).
* We also assume that you have basic familiarity with the Unix command line.

## 1. Introduction to Holochain

Holochain is a framework for building peer-to-peer distributed applications, also known as hApps. It emphasizes agent-centric architecture, intrinsic data integrity, and scalability. Holochain enables developers to build applications that run on just the devices of the participants without relying on centralized servers or blockchain tokens and it provides a robust and efficient means of managing data.

## 2. Installing Holochain development environment

In this section, we'll walk you through the step-by-step process of installing Holochain, its dependencies, and developer tools on your system so that you can develop hApps.

### 2.1. Hardware requirements

Before you install the Holochain development environtment, make sure your system meets the following hardware requirements:

* 8GB+ RAM (16GB+ recommended)
* 4+ cores CPU (6+ cores recommended)
* 30GB+ available disk space
* High-speed internet connection

### 2.2. Windows prerequisite: WSL2 {#2-2-windows-prerequisite-wsl2}

For Windows users, please note that the Nix package manager, which is used to install and manage Holochain development environment, only supports macOS and Linux. You will need to [install Linux under Windows with WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) (recommended) or dual boot a Linux Operating System, alongside your [Windows 10](https://www.freecodecamp.org/news/how-to-dual-boot-windows-10-and-ubuntu-linux-dual-booting-tutorial/) or [Windows 11](https://www.xda-developers.com/dual-boot-windows-11-linux/) OS to proceed.

Holochain is supported under WSL2 via the Ubuntu distribution.

### 2.3. Set up development environment

Once you've ensured that your system meets the hardware requirements and set up WSL2 on Windows or a dual boot Linux OS (if applicable), you can proceed with the installation of the Nix package manager and the binary package cache for Holochain.

Open a [command line terminal](https://hackmd.io/c15fobj9QtmOuEuiNAkaQA) and run the following command by pasting or typing the following text in and pressting <kbd>Enter</kbd>:

```bash
bash <(curl https://holochain.github.io/holochain/setup.sh)
```

This command downloads the setup script and runs it, installing the Nix package manager and setting up the Holochain binary cache.

### 2.4. Verify installation

In a new terminal session type:

```bash
nix run --refresh -j0 -v github:holochain/holochain#hc-scaffold -- --version
```

Look out for binaries being copied from `holochain-ci.cachix.org`:

::: output-block
```text
downloading 'https://holochain-ci.cachix.org/nar/<some-hash>.nar.zst'...
```
:::

It proves that the binary cache is configured correctly.

At the end of the output, Holochain's scaffolding tool should print its version string:

::: output-block
```text
holochain_scaffolding_cli x.y.z
```
:::

Congratulations! The Holochain development environment is now set up successfully on your system.

## 3. Scaffold a simple "Hello, World!" Holochain application

In this section, we'll use Holochain's scaffolding tool to generate a simple "Hello, World!" application.

When getting started, seeing a simple, but fully-functional app can be very helpful. You can have Holochain's scaffold tool generate a "Hello, World!" application (but for a distributed multi-agent world), by typing the following in your command line terminal:

```bash
nix run github:holochain/holochain#hc-scaffold -- example hello-world
```

The scaffolding tool should print out these four commands:

```bash
cd hello-world
```
```bash
nix develop
```
```bash
npm install
```
```bash
npm start
```

When you run them, you should see two windows pop up representing two agents, both of which will have published a `Hello World` entry to the network, and when you click on the "get hellos" button, you should be able to see the hellos:

[image of hellos?]

When you are done checking out this app, you can go back to the terminal and stop both agents by pressing <kbd><kbd>Ctrl</kbd>+<kbd>C</kbd></kbd> (Linux) or <kbd><kbd>Cmd</kbd>+<kbd>C</kbd></kbd> (macOS).

## 4. Understanding the layout of a Holochain application

Let's explore the different files and folders that make up the structure of the "Hello, World!" hApp that you just created.

List the folders and files in our `hello-world/` folder by entering:

```bash
$ ls
```

If you are new to navigating folders and files using the command line, check out [Navigating with the Command Line (Mac + Linux)](https://hackmd.io/@oitz5O-qR2qrfRre3Kbv-Q/SJqWJ6T43)

For now, make use of:

* `ls` to list the contents of the folder that you are in,
* `cd <folder_name>` to navigate into a particular sub-folder, and
* `cd ..` to navigate back up to a parent folder.

!!! dig-deeper Scaffolded application structure

This table includes everything in the `hello-world/` folder as well as details of the contents of the `dnas/` subfolder since that makes up the bulk of the "Holochain" part of an application. For certain working folders, like `node_modules/`, `target/`, `tests/`, and `ui/`, the table only contains a high-level overview.

| File/folder                | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|<pre> ├── hello-world/         </pre>| Root folder of the "Hello, World!" application. All other files and folders will reside here.                                                                                                                                                                                                                                                                                                                                                                                                                      |
|<pre> ├┬─ dnas/                </pre>| This folder contains the DNA configuration and source code for the application. DNAs are one of the most important building blocks in Holochain. Simply put, **a DNA is the source-code for the game you are playing with your peers in Holochain.** And here is the twist: in Holochain, **every DNA creates its own peer-to-peer network** (for the validation, storage, and serving of content). Every Holochain application contains at least one DNA. In this example hApp, we have just one: `hello_world`. |
|<pre> │└┬─ hello_world/        </pre>| Folder for the "Hello, World!" DNA. It contains modules (zomes) that define the rules of this application.                                                                                                                                                                                                                                                                                                                                                                                                         |
|<pre> │ ├┬─ workdir/           </pre>| A working folder containing configuration files and compiled artifacts related to the DNA.                                                                                                                                                                                                                                                                                                                                                                                                                         |
|<pre> │ │├── dna.yaml          </pre>| DNA manifest file. A YAML file that defines the properties and zomes of the DNA. YAML is a human-readable data serialization language.                                                                                                                                                                                                                                                                                                                                                                             |
|<pre> │ │└── hello_world.dna   </pre>| The compiled DNA file, which includes both the integrity and coordinator zomes. This file is used by Holochain to run the hApp.                                                                                                                                                                                                                                                                                                                                                                                    |
|<pre> │ └┬─ zomes/             </pre>| The executable code modules in a DNA are called zomes (short for chromosomes), each with its own name like `profile` or `chat` or in our case `hello` (below). Zomes define the core logic in a DNA. This folder contains zomes for the `hello_world` DNA. Zome modules can be composed together to create more powerful functionality. DNAs in Holochain are always composed out of one or more zomes.                                                                                                            |
|<pre> │  ├┬─ coordinator/      </pre>| This folder contains the coordinator zomes, which are responsible for this DNA's controller layer, such as reading/writing data and handling communication between peers.                                                                                                                                                                                                                                                                                                                                          |
|<pre> │  │└┬─ hello_world/     </pre>| Folder containing the `hello_world` coordinator zome.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|<pre> │  │ ├┬─ src/            </pre>| Source code folder for the `hello_world` coordinator zome.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|<pre> │  │ │└── lib.rs         </pre>| The main source code file for the `hello_world` coordinator zome. In Rust, `lib.rs` is the entry point for a 'crate' (Rust module). If you have nothing else in there, you should have a `lib.rs` file.                                                                                                                                                                                                                                                                                                            |
|<pre> │  │ └── Cargo.toml      </pre>| The manifest file for the `hello_world` coordinator zome, containing metadata, dependencies, and build options.                                                                                                                                                                                                                                                                                                                                                                                                    |
|<pre> │  └┬─ integrity/        </pre>| This folder contains the integrity zomes, which are responsible for the application's model layer, such as defining data structures and validation rules.                                                                                                                                                                                                                                                                                                                                                          |
|<pre> │   └┬─ hello_world/     </pre>| Folder containing the `hello_world` integrity zome.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|<pre> │    ├┬─ src/            </pre>| Source code folder for the `hello_world` integrity zome.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|<pre> │    │└── lib.rs         </pre>| The main source code file for the `hello_world` integrity zome.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|<pre> │    └── Cargo.toml      </pre>| The configuration file for Rust, containing dependencies and build options for the `hello_world` integrity zome.                                                                                                                                                                                                                                                                                                                                                                                                   |
|<pre> ├── node_modules/        </pre>| A folder containing JavaScript packages and dependencies for the user interface and tests.                                                                                                                                                                                                                                                                                                                                                                                                                         |
|<pre> ├── target/              </pre>| A folder containing the compiled output from the Rust build process.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|<pre> ├── tests/               </pre>| A folder containing JavaScript-base test code for the "Hello, World!" application.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|<pre> ├── ui/                  </pre>| A folder containing the source code and assets for the user interface of the "Hello, World!" application.                                                                                                                                                                                                                                                                                                                                                                                                          |
|<pre> ├┬─ workdir/             </pre>| A working folder containing configuration files and compliled artifacts related to the building of the whole hApp.                                                                                                                                                                                                                                                                                                                                                                                                 |
|<pre> │├── happ.yaml           </pre>| The manifest file for the hApp. It references the DNA files to be included, along with the roles they play in the application.                                                                                                                                                                                                                                                                                                                                                                                     |
|<pre> │├── hello_world.happ    </pre>| The compiled hApp bundle, which includes all the DNAs (in case just the one).                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|<pre> │├── hello_world.webhapp </pre>| The compiled web hApp bundle, which includes the hApp bundle plus the zipped UI.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|<pre> │└── web-happ.yaml       </pre>| The manifest file for the hApp plus the UI. It references the compiled hApp bundle and zipped UI folder to be included.                                                                                                                                                                                                                                                                                                                                                                                            |
|<pre> ├── Cargo.lock           </pre>| A file generated by Cargo, Rust's package manager, that lists the exact versions of dependencies used in the project.                                                                                                                                                                                                                                                                                                                                                                                              |
|<pre> ├── Cargo.toml           </pre>| The main configuration file for the Rust project, containing dependencies, build options, and other metadata for the "Hello, World!" application.                                                                                                                                                                                                                                                                                                                                                                  |
|<pre> ├── flake.lock           </pre>| A file generated by Nix, a package manager, that lists the exact versions of dependencies used in the project.                                                                                                                                                                                                                                                                                                                                                                                                     |
|<pre> ├── flake.nix            </pre>| A Nix expression that defines the project's build environment, dependencies, and how the project should be built.                                                                                                                                                                                                                                                                                                                                                                                                  |
|<pre> ├── package.json         </pre>| The main configuration file for the JavaScript/Node.js project, containing dependencies, scripts, and other metadata for the user interface of the "Hello, World!" application.                                                                                                                                                                                                                                                                                                                                    |
|<pre> ├── package-lock.json    </pre>| A file generated by npm, Node.js package manager, that lists the exact versions of dependencies used in the user interface project.                                                                                                                                                                                                                                                                                                                                                                                |
|<pre> └── README.md            </pre>| A markdown file containing the documentation and instructions for the "Hello, World!" application, including how to build, run, and test the project.                                                                                                                                                                                                                                                                                                                                                              |

These files and folders make up the structure of a Holochain application, with the main logic defined in the zomes (in the `dnas/<dna>/zomes/` folders) and the user interface defined in the `ui/` folder. The manifest files bring all the Holochain and UI assets together, allowing the `hc` tool to bundle them into a single hApp file ready for distribution.

!!!

## 5. Zero to built: creating a forum app

First, navigate back to the folder where you want to keep your Holochain applications. If this is just your home folder, you can navigate there by typing `cd ~`.

!!! warning Pre-requisite
First, ensure you have Holochain installed as per section 2.
!!!

Next up, we'll walk you through creating a forum application from scratch using Holochain's scaffolding tool, step-by-step. Our forum application will enable participants to share text-based posts and to comment on those posts.

Each post will have a title and content and authors will be able to edit --- or update --- their posts. However, they won't be able to delete them.

Each comment will be a reply to a particular post, will be limited in length to 140 characters, and will be able to be deleted but not updated.

We'll create a couple of other things along the way that will enable us to find these posts and comments, but we'll cover those things when we get there.

The good news is that the Holochain scaffold tool will do a lot of the heavy lifting in terms of generating folders, files, and boilerplate code. It will walk us through each step in the hApp generation process. In fact, the scaffold does so much of the work for us on the backend, that many people have commented that the time spent writing a holochain app is 90% (or more) focused on building out the frontend user interface and experience.

First, let's use the scaffolding tool to generate the basic folders and files for our hApp.

### 5.1. Scaffolding a hApp {#5-1-scaffolding-a-happ}

To start, run the following command in your terminal:

```bash
$ nix run github:/holochain/holochain#hc-scaffold -- web-app
```

You should then see:

::: output-block
```text
? App name (no whitespaces):
```
:::

Enter the name of your forum application using snake_case. Let's enter:

```text
my_forum_app
```

### 5.2. Select user interface framework

You'll then be prompted to choose a user interface (UI) framework for your front end.

For this example, use the arrow keys to choose **Svelte** and press <kbd>Enter</kbd>.

### 5.3. Set up Holonix development environment

Next, you'll be asked if you want to set up the Holonix development environment for the project. This allows you to enter a shell that has all the right tools and libraries for the version of Holochain that your code was generated for.

Choose **Yes (recommended)** and press <kbd>Enter</kbd>.

You should see:

::: output-block
```text
Setting up nix development environment...
```
:::

along with some details of what is being added. Follow the instructions to set up the development environment for your hApp and continue to scaffold more of its elements.

First, enter the hApp project folder:

```bash
cd my_forum_app
```

Just to get an overview of what our first scaffold command set up for us, let's check the contents of that `my_forum_app` folder by typing:

```bash
ls
```

It should look like it has set up a similar set of folders and configuration files to those we saw in the "Hello, World!" hApp.

Now, fire up the nix development shell, which makes all scaffolding tools and the Holochain binaries directly available from the command line, by entering:

```bash
nix develop
```

You should see:

::: output-block
```text
Holochain development shell spawned. Type exit to leave.
```
:::

As it says, if at any time, you want to leave the nix development shell, you can type `exit`. When you want to re-enter it, navigate to the `my_forum_app` folder and type `nix develop` again. But for now, let's install the Node Package Manager (npm) dependencies with:

```bash
npm install
```

These dependencies are used by various tools and assets --- the scaffolded tests, the UI, and various development activities like spawning apps for testing.

When that finishes, we should see some text that ends with something like:

::: output-block
```text
added 371 packages, and audited 374 packages in 1m

37 packages are looking for funding
    run 'npm fund' for details
found 0 vulnerabilities
```
:::

If you see something like that, you've successfully downloaded all the dependencies.

Now if we again enter:

```bash
ls
```

We should notice that a new folder has been added called `node_modules`. If we opened that folder we would see a whole bunch of libraries that have been installed. If you have, before going to the next step, just make sure that you [navigate back](https://hackmd.io/@oitz5O-qR2qrfRre3Kbv-Q/SJqWJ6T43) to the root folder for our hApp: `my_forum_app`.

We've already scaffolded a new web app!

Next up, we are going to start creating one of the most important building blocks in a Holochain app: a DNA.

!!! dig-deeper Scaffolding subcommands

To get an overview of the subcommands that hc scaffold makes available to us, let's enter:

```bash
hc scaffold --help
```

We should see something like:

::: output-block
```text
holochain_scaffolding_cli 0.1.8
The list of subcommands for `hc scaffold`

USAGE:
    hc-scaffold <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

SUBCOMMANDS:
    collection    Scaffold a collection of entries in an existing zome
    dna           Scaffold a DNA into an existing app
    entry-type    Scaffold an entry type and CRUD functions into an existing zome
    example
    help          Prints this message or the help of the given subcommand(s)
    link-type     Scaffold a link type and its appropriate zome functions into an existing zome
    template      Set up the template used in this project
    web-app       Scaffold a new, empty web app
    zome          Scaffold one or multiple zomes into an existing DNA
```
:::
!!!

!!! info Backing out of a mistake
A quick note: if while scaffolding some part of your hApp, you realize you've made a mistake (a typo or wrong selection for instance), as long as you haven't finished scaffolding that portion, **you can stop the scaffold by using <kbd><kbd>Ctrl</kbd>+<kbd>C</kbd></kbd> on Linux or <kbd><kbd>Command</kbd>+<kbd>C</kbd></kbd> on macOS**.
!!!

### 5.4. Scaffold a DNA

A DNA folder is where we will put the code that defines the rules of our application. We are going to stay in the `my_forum_app/` root folder of our hApp and, with some simple commands, the scaffold tool will do much of the creation of relevant folders and files for us.

!!! dig-deeper About DNAs {#about-dnas}

#### Why do we use the term DNA?

In Holochain, we are trying to enable coherent social coordination that people are choosing to participate in. To do that, we are borrowing some patterns from how biological organisms are able to coordinate coherently even at scales that social organisations such as companies or nations have come nowhere close to. In living creatures like humans, dolphins, redwood trees, and coral reefs, many of the cells in the body of an organism (trillions of the cells in a human body for instance) are each running a (roughly) identical copy of a rule set in the form of DNA.

This enables many different independent parts (cells) to build relatively consistent superstructures (a body, for instance), move resources, identify and eliminate infections, and more --- all without centralized command and control. There is no "CEO" cell in the body telling everybody else what to do. It's a bunch of independent actors (cells) playing by a consistent set of rules (the DNA) coordinating in effective and resilient ways.

A cell in the muscle of your bicep finds itself in a particular context, with certain resources and conditions that it is facing. Based on those signals, that cell behaves in particular ways, running relevant portions of the larger shared instruction set (DNA) and transforming resources in ways that fit the context of that part of the larger organism when faced with those circumstances. A different cell in your blood, perhaps facing a context where there is a bacterial infection, will face a different set of circumstances and consequently will make use of other parts of the shared instruction set to guide how it behaves. In other words, many biological organisms make use of this pattern where "many participants run the same rule set, but each in their own context" and that unlocks a powerful capacity for coherent coordination.

Holochain borrows this pattern that we see in biological coordination to try to enable similarly coherent social coordination. However, our focus is on enabling such coherent social coordination to be "opted into" by the participants. We believe that this pattern of being able to choose which games you want to play --- and being able to leave them or adapt them as experience dictates --- is critical to enabling individual and collective adaptive capacity. We believe that it may enable a fundamental shift in the ability of individuals and communities to sense and respond to the situations that they face.

To put it another way: if a group of us can all agree to the rules of a game, then together we can play that game.

All of us opting in to those rules --- and helping to enforce them --- enables us to play that game together whether it is a game of chess, chat, a forum app, or something much richer.

#### DNA as boundary of network

A Holochain DNA and the network of participants that are running that DNA enable "peer witnessing" of actions by the participants of that network. A (deterministically random) set of peers are responsible for validating, storing, and serving each particular piece of content. In other words, the users of a particular hApp agree to a set of rules and then work together collectively to enforce those rules and to store and serve content (state changes) that do not violate those rules.

#### Our network of peers is determined at the DNA level

Every hApp needs to include at least one DNA. Moreover, as indicated above, **it is at the DNA level** (note: not the higher application level) **where users will form a network of peers to validate, store, and serve content** in accordance with the rules defined in that DNA.

There are some powerful consequences to this architectural choice --- including freedom to have your application look and feel the way you want, or to combine multiple DNAs together in ways that work for you without having to get everyone else to agree to do the same --- but we'll save those empowerment/flexibility details for later.

#### So if we have multiple DNAs in our hApp...

...then we are participating in multiple networks, with each network of peers that are participating in a particular DNA also participating alongside one another in the distributed hash table (shared database) for that DNA, and enforcing those rules while validating, storing, and serving content alongside those peers.

This is similar to the way in which multiple DNA communities coexist in biological organisms. In fact, there are more cells in a human body that contain other DNA (like bacteria and other microorganisms) than cells that contain our DNA. This indicates that we are an _ecology_ of coherent communities that are interacting with --- and evolving alongside --- one another.

When it comes to hApps, this lets us play coherent games with one another at the DNA level, while also participating in adjacent coherent games with others as well. That means that applications are not one-size-fits-all. You can choose to combine different bits of functionality in interesting and even novel ways.

!!!

For now, let's create a new DNA using the scaffolding tool by entering:

```bash
hc scaffold dna
```

You should then see:

::: output-block
```text
? DNA name (snake_case):
```
:::

We need to enter a name for the DNA. Let's use:

```text
forum
```

You should then see:

::: output-block
```text
DNA "forum" scaffolded!
Add new zomes to your DNA with:
    hc scaffold zome
```
:::

Success! Inside of our `dnas/` folder, the scaffolding tool generated a `forum/` folder and, inside of that, the folders and files that any DNA needs. At this point we have a skeleton structure for our `forum` DNA. As we take the next steps, the scaffolding tool will make additions and edits to some of those folders and files based on our instructions.

Next up, we want to create our first module of functionality for the forum DNA.

### 5.5. Scaffold a zome

DNAs are comprised of code modules, which we call zomes (short for chromosomes). Zomes are modules that typically focus on enabling some small unit of functionality. Building with this sort of modular pattern provides a number of advantages, including the ability to reuse a module in more than one DNA to provide similar functionality in a different context. For instance, the [profiles zome](https://github.com/holochain-open-dev/profiles) is one that many apps make use of. For our forum DNA, we'll create one zome: **posts**.

Start by entering:

```bash
hc scaffold zome
```

You should then see:

::: output-block
```text
? What do you want to scaffold? ›
❯ Integrity/coordinator zome-pair (recommended)
  Only an integrity zome
  Only a coordinator zome
```
:::

!!! dig-deeper Integrity zomes and coordinator zomes

#### Integrity zomes

An integrity zome, as the name suggests, is responsible for maintaining the data integrity of a Holochain application. It sets the rules and ensures that any data transactions occurring within the application are consistent with those rules. In other words, it is responsible for ensuring that data is correct, complete, and trustworthy. Integrity zomes help maintain a secure and reliable distributed peer-to-peer network by enforcing the validation rules defined by the application developer --- in this case, you!

#### Coordinator zomes

On the other hand, a coordinator zome contains the code that actually commits data, retrieves it, or sends and receives messages between peers or between portions of that application on a user's own device (between the backend and the front-end UI, for instance).

#### Why two types?

They are separated from one another so we can update coordinator zomes without having to update the integrity zomes. This is important, because changes made to an integrity zome result in a fork of the DNA, because the integrity code is what defines the 'rules of the game' for a network of agents --- that is, what types of actions are valid. If you changed the code of an integrity zome, you would find yourself suddenly in a new and different network from the other folks who haven't yet changed their integrity zome --- and we want to minimize those sorts of forks to situations where they are needed (like when a community decides they want to play by different rules, for instance changing the maximum length of messages from 140 characters to 280 characters).

At the same time, a community will want to be able to improve the ways in which things are done in a Holochain app. This can take the form of adding new features or fixing bugs, and we want agents to also be able to take advantage of the latest improvements in Holochain. Separating integrity and coordination enables them to do that more easily, because:

* Holochain's coordinator zome API receives frequent updates while the integrity zome API is fairly stable, and
* coordinator zomes can be added to or removed from a DNA at runtime without affecting the DNA's hash.

!!!

For this app, we are going to want both an integrity zome and a coordinator zome, so use the arrow keys to select:

::: output-block
```text
Integrity/coordinator zome-pair
```
:::

and press <kbd>Enter</kbd>.

You should then see:

::: output-block
```text
? Enter coordinator zome name (snake_case):
 (The integrity zome will automatically be named '{name of coordinator zome}_integrity')
```
:::

Enter the name:

```text
posts
```

and press <kbd>Enter</kbd>.

You should then see prompts asking if you want to scaffold the integrity and coordinator zomes in their respective default folders.

Press <kbd>Y</kbd> for both prompts.

As that runs (which will take a moment as the scaffold makes changes to various files) you should then see:

::: output-block
```text
Coordinator zome "posts" scaffolded!
Updating crates.io index
    Fetch [===>       ] ... (then after download is done...)
Downloaded (a bunch of downloaded files ... then)

Add new entry definitions to your zome with:
    hc scaffold entry-type
```
:::

Once that is all done, our hApp skeleton will have filled out a bit. Before we scaffold the next piece, let's give a little context for how content is "spoken into being" when a participant publishes a post in a forum hApp.

If you aren't yet familiar with Holochain's concept of a source chain, check out [The Source Chain: A Personal Data Journal](https://developer.holochain.org/concepts/3_source_chain/).

!!! dig-deeper Source chains, actions, and entries

#### Source chain

Any time a participant in a hApp takes some action that changes data, they add a record to a journal called a source chain. Each participant has their own source chain, and it is a local, tamper-proof, and chronological store of the participant's actions in that application.

This is one of the main differences between Holochain and other systems such as blockchains or centralized server-based applications. Instead of recording a "global" (community-wide) record of what actions have taken place, in Holochain actions are taken by agents and are thought of as transformations of their own state.

One big advantage of this approach is that a single agent can be considered authoritative about the order in which they took actions. From their perspective, first they did A, then B, then C etc. The fact that someone else didn't get an update about these changes, and possibly received them in a different order, doesn't matter. The order that the authoring agent took those actions will be captured in the actions themselves (thanks to each action referencing the previous one that they had taken, thus creating an ordered sequence --- or chain --- of actions).

#### Actions and entries

You'll notice that we used the word "action" a lot. In fact, **we call the content in a source chain record an action**. In Holochain applications, data is always "spoken into being" by an agent (a participant) from their own perspective. Each record captures their act of adding, modifying, or removing data, rather than simply capturing the data itself.

There are a few different kinds of actions, but the most important one is "create entry". Entries store most of the actual content created by a participant, such as the text of a post in our forum hApp. When someone creates a forum post, they're recording an action to their source chain that reads something like: _I am creating this forum post entry with the title "Intros" and the content "Where are you from and what is something you love about where you live?" and I would like my peers in the network to store a copy of it as a public record._ So while it’s useful for noun-like things like messages and images, it is also well-suited to verb-like things like real-time document edits, game moves, and transactions.

Every action contains the ID of its author (actually a cryptographic public key), a timestamp, a pointer to the previous source chain record, and a pointer to the entry data, if there is any. In this way, actions provide historical context and provenance for the entries they operate on.

The pointer to the previous source chain record creates an unbroken history from the current record all the way back to the source chain's starting point. This 'genesis' record contains the hash of the DNA, which identifies the specific validation rules that all following records should follow.

An action is cryptographically signed by its author and is immutable (can't be changed) once written. This, along with the validation rules specified by the DNA hash, are examples of a concept we call "intrinsic data integrity", in which data carries enough information about itself to be self-validating.

Unlike a centralized application, we aren't just going to add this data into some database. We are going to:

1. ensure that the action being taken doesn't violate the validation rules of our DNA,
2. add it as the next record to our source chain, and then
3. tell our network peers about it so they can validate and store it, if it's meant to be public.

The bits of shared information that all the peers in a network are holding are collectively called a distributed hash table, or DHT. We'll explain more about the DHT later.

!!!

Now it is time to start defining the structure and validation rules for data within our application.

### 5.6. Scaffold entry types

An entry type is a fundamental building block used to define the structure and validation rules for data within a distributed application. Each entry type corresponds to a specific kind of data that can be stored, shared, and validated within the application.

!!! dig-deeper Entry types and validation

An entry type is just a label, an identifier for a certain type of data that your DNA deals with. But it serves as something to attach validation rules to in your integrity zome, and those rules are what give an entry type its meaning. They take the form of code in a function that gets called any time something is about to be stored, and because they're just code, they can validate all sorts of things. Here are a few key examples:

* **Data structure**: When you use the scaffold tool to create an entry type, it generates a Rust-based data type that define fields in your entry type, and it also generates code in the validation function that attempts to convert the raw bytes into an instance of that type. By providing a well-defined structure, this type ensures that data is consistently formatted and organized across the entire distributed network. If it can't be deserialized into the appropriate Rust structure, it's not valid.

* **Constraints on data**: Beyond simple fields, validation code can constrain the values in an entry --- for instance, it can enforce a maximum number of characters in a text field or reject nonsensical calendar dates.

* **Privileges**: Because it originates in a source chain, an entry comes with metadata about its author, which can be used to control who can create, edit, or delete an entry. This can be used to prevent people editing or deleting others' posts and comments, or to restrict certain actions to an administrator.

* **Contextual conditions**: Another consequence of the source chain is that an entry can be validated based on the agent's history --- for instance, to prevent currency transactions beyond a credit limit or disallow more than two comments per minute to discourage spam. An entry can also point to other entries upon which it depends, and the data from those entries can be used in its validation.

!!!

We will want to create two entry types for our `posts` integrity zome: **`post`** and **`comment`**. Posts will have a `title` field and a `content` field. Comments will have a `comment_content` field and a way of indicating which post they are a comment on.

Let's go ahead and follow the instructions that the scaffold suggested for adding "new entry definitions to your zome".

Let's create the **`post`** entry type first. Enter:

```bash
hc scaffold entry-type
```

You should then see:

::: output-block
```text
✔ Entry type name (snake_case):
```
:::

Enter the name:

```text
post
```

You should then see:

::: output-block
```text
Which fields should the entry contain?

? Choose field type: ›
❯ String
  bool
  u32
  i32
  f32
  Timestamp
  ActionHash
  EntryHash
  DnaHash
  AgentPubKey
  Enum
  Option of...
  Vector of...
```
:::

The scaffold tool is prompting us to add fields to the `post` entry type.

Fields are the individual components or attributes within an entry type that define the structure of the data. They determine the specific pieces of information to be stored in an entry and their respective data types.

For our `post` entry type, we are going to add a **`title`** and a **`content`** field.

Let's first add the title field.

Select `String` as the field type, and enter:

```text
title
```

as the field name.

Press <kbd>Y</kbd> for the field to be visible in the UI, and use the arrow keys to select `TextField` as the widget to render this field.

A `TextField` is a single-line input field designed for capturing shorter pieces of text.

When you see:

::: output-block
```text
?Add another field to the entry?(y/n)
```
:::

press <kbd>Y</kbd>.

For the **`content`** field, we are also going to select `String` as the field type. Then enter `content` as the field name.

Press <kbd>Y</kbd> for the field to be visible in the UI, and select `TextArea` as the widget to render the field.

A `TextArea` is a multi-line input field that allows users to enter larger blocks of text. That works for the longer chunks of text that people may want to add as the content (body) of their posts in our forum app.

After adding the title and description fields, press <kbd>N</kbd> when asked if you want to add another field. Next, you should see:

::: output-block
```text
Which CRUD functions should be scaffolded (SPACE to select/unselect, ENTER to continue)?
✔ Update
✔ Delete
```
:::

The scaffolding tool can add zome and UI functions for updating and deleting entries. In this case, we want authors to be able to update posts, but not delete them, so let's use the arrow keys and the spacebar to ensure that Update has a check and that Delete does not. It should look like this:

::: output-block
```text
Which CRUD functions should be scaffolded (SPACE to select/unselect, ENTER to continue)?
✔ Update
  Delete
```
:::

Then press <kbd>Enter</kbd>.

At this point you should see:

::: output-block
```text
? Should a link from the original entry be created when this entry is updated? ›
❯ Yes (more storage cost but better read performance, recommended)
  No (less storage cost but worse read performance)
```
:::

Go ahead and select `Yes` by pressing <kbd>Enter</kbd>.

!!! dig-deeper CRUD (create, read, update, delete)

#### Mutating immutable data and improving performance

In short, the above choice is about how changes get dealt with when a piece of content is updated.

Because all data in a Holochain application is immutable once it's written, we don't just go changing existing content, because that would break the integrity of the agent's source chain as well as the data already in the DHT. So instead we add metadata to the original data, indicating that people should now look elsewhere for the data or consider it deleted. This is produced by `UpdateEntry` and `DeleteEntry` source chain actions.

For an `UpdateEntry` action, the original "create entry" or `UpdateEntry` action and its entry content on the DHT get a "replaced by" pointer to the new `UpdateEntry` action and its entry content.

When the scaffolding tool asks you whether to create a link from the original entry, it's not talking about this pointer. Instead, it's talking about an extra piece of metadata that points to the _very newest_ entry. If an entry were to get updated, and that update were updated, and this were repeated three more times, anyone trying to retrieve the entry would have to query the DHT five times before they finally found the newest revision. This extra link, which is not a built-in feature, 'jumps' them past the entire chain of updates at the cost of a bit of extra storage. The scaffolding tool will generate all the extra code needed to write and read this metadata in its update and read functions.

For a `DeleteEntry` action, the original action and its entry content are simply marked as deleted. In the cases of both updating and deleting, all original data is still accessible if the application needs it.

#### CRUD functions

**By default, the scaffolding tool generates a `create_<entry_type>' function in your coordinator zome for an entry type** because creating new data is a fundamental part of any application, and it reflects the core principle of Holochain's agent-centric approach.

Similarly, when a public entry is published, it becomes accessible to other agents in the network. Public entries are meant to be shared and discovered by others, so **a `read_<entry_type>' function is provided by default** to ensure that agents can easily access and retrieve publicly shared entries. (The content of _private_ entries, however, are not shared to the network.) For more info on entries, see: the **Core Concepts sections on [Source Chains](https://developer.holochain.org/concepts/3_source_chain/) and [DHT](https://developer.holochain.org/concepts/4_dht/)**.

**Developers decide whether to let the scaffolding tool generate `update_<entry_type>` and `delete_<entry_type>` functions based on their specific application requirements**. More details in the Core Concepts section on [CRUD](https://developer.holochain.org/concepts/6_crud_actions/).

!!!

Next, you should see:

::: output-block
```text
Entry type "post" scaffolded!

Add new collections for that entry type with:

    hc scaffold collection
```
:::

We'll dive into links in a moment, but first let's create the **`comment`** entry type.

Again type:

```bash
hc scaffold entry-type
```
This time enter the name:

```text
comment
```

for the entry type name.

We're going to add a **`comment_content`** field, so select the `String` field type and enter:

```text
comment_content
```

Then select `TextArea` widget and press <kbd>Enter</kbd>.

Again, a `TextArea` is a multi-line input field that allows users to enter larger blocks of text. Perfect for a comment on a post.

Press <kbd>Y</press> to add another field.

For this next field we want to create a field that will help us associate each particular comment to the post that it is commenting on.

We are going to use the arrow keys to select `ActionHash` as the field type. After hitting <kbd>Enter</kbd>, we should see:

::: output-block
```text
? Should a link from this field be created when this entry is created? (y/n) ›
```
:::

Go ahead and press <kbd>Y</kbd> to accept creating a link. This creates a pointer from the original post that comment is replying to.

Next you will see:

::: output-block
```text
✔ Which entry type is this field referring to?
```
:::

Press <kbd>Enter</kbd> to accept the suggested entry type `Post`.

Next, you will be asked to pick a field name. You can press <kbd>Enter</kbd> to accept the field name suggestion, which should be:

```text
post_hash
```

Press <kbd>N</kbd> to decline adding another field to the entry.

Then use the arrow keys to deselect Update, but leave Delete selected. It should look as follows:

::: output-block
```text
Which CRUD functions should be scaffolded (SPACE to select/unselect, ENTER to continue)?
  Update
✔ Delete
```
:::

Once that is done, press <kbd>Enter</kbd> to generate a delete function for the **`comment`** entry type.

You should then see:

::: output-block
```text
Entry type "comment" scaffolded!

Add new collections for that entry type with:

    hc scaffold collection
```
:::

!!! dig-deeper Hashes and other identifiers

There are two kinds of unique identifiers or 'addresses' in Holochain: **hashes** for data and **public keys** for agents.

A hash is a unique "digital fingerprint" for a piece of data, generated by running it through a mathematical function called a **hash function**. None of the original data is present in the hash, but all the same, the hash is extremely unlikely to be identical to the hash of any other piece of data.

To ensure data integrity and facilitate efficient data retrieval, each entry is associated with a unique hash value, which is generated using a cryptographic hashing function. If you change even one character of the entry's content, the hash will be radically (and unpredictably) different.

Holochain uses a hash function called blake2b. You can play with [an online blake2b hash generator](https://toolkitbay.com/tkb/tool/BLAKE2b_512) to see how changing content a tiny bit alters the hash. Try hashing `hi` and then `Hi` and compare their hashes.

#### `EntryHash`

If we hash an entry, we will generate its **`EntryHash`**. The `EntryHash` serves the following purposes:

* **Uniqueness:** The cryptographic hashing function ensures that each entry has a unique hash value, which helps to differentiate it from other entries on the network.
* **Integrity verification:** `Hi` will always generate that same hash no matter who runs it through the hashing function. So when an entry is retrieved, its hash can be recalculated and compared with the stored `EntryHash` to ensure that a third party hasn't tampered with the data.
* **Efficient lookup:** The `EntryHash` is used as a key (essentially an address) in the network's storage system, called a distributed hash table (DHT), enabling efficient and decentralized storage and retrieval of entries.
* **Collusion resistance:** The network peers who take responsibility for validating and storing an entry are chosen randomly based on the similarity of their IDs to the `EntryHash`. It would take a huge amount of computing power to generate a hash that would fall under the responsibility of a colluding peer.

When you want to retrieve an entry, you can simply search for the corresponding `EntryHash` in the DHT, without needing to know who's storing it or what it contains. In essence, you retrieve content by asking others for it by ID. Your Holochain runtime reaches out to the (multiple) peers in the network responsible for that `EntryHash`, and one or more of those peers then serve the entry to you.

This is a key part of what enables Holochain applications to provide reliable access to data even when some peers are occasionally dropping offline. Each entry will have multiple peers making copies available on the network, so even if some devices drop off the network, you will usually still be able to retrieve a file from one of the other peers that is holding on to a copy. In fact, as devices responsible for serving a range of `EntryHash`es and their associated entries drop off the network, other backups of that content start getting made (on other devices) to improve the availability of data.

This also helps ensure the integrity of the data in the DHT. Because multiple random peers are called on to validate and store an entry, it's more likely that at least one honest peer will report a problem with an entry's integrity when you request it.

#### `ActionHash`

If, instead, we hash an action (the metadata about a state change) we call the result an **`ActionHash`**.

`ActionHash`es play a similar role to `EntryHash`es. However, because they contain different metadata, it helps to disambiguate identical entries written at different times by different agents. If ten different people in our Forum hApp write `Hi` as a post, the `EntryHash` of each of those posts will be identical (since the content is identical), but each `ActionHash` will be unique, because the Action includes not only the `EntryHash` of the associated ("Hi") entry, but also the Agent's public key, the `ActionHash` of the previous Action, and a timestamp.

#### `AgentPubKey`

**Each agent in a network is identified by their cryptographic public key**, a unique number that's mathematically related to a private number that they hold on their machine. Public-key cryptography is a little complex for this guide -- it's enough to know that your private key signs your source chain actions, and those signatures paired with your public key allow others to verify that you are the one who authored those actions.

An `AgentPubKey` isn't a hash, but it's the same length, and it's unique just like a hash. So it can be used as a way of referring to an agent, like a user ID.

#### Summary

Whereas `EntryHash` is used to uniquely identify, store, and efficiently retrieve an entry from the DHT, `ActionHash` is used to uniquely identify, store, and retrieve the action (metadata), which can provide information about the history and context of any associated entry (including what action preceded it). `ActionHash`es are also what enable any participant to retrieve and reconstruct the continuous sequence of actions (and any associated entries) in another agent's source chain.

**Use `EntryHash` when** you want to link to or retrieve the actual content or data (e.g., when linking to a category in a forum application).

**Use `ActionHash` when** you want to link to or retrieve the authorship or history of an entry (e.g., when distinguishing between two posts with identical content or retrieving the author of a post).

**Use `AgentPubKey` when** you want to link to an agent (such as associating a profile or icon with them) or retrieve information about their history (such as scanning their source chain for posts and comments).

You can check out the Core Concepts to dive a bit deeper into [how the distributed hash table helps](https://developer.holochain.org/concepts/4_dht/) to not only make these entries and actions available but helps to ensure that agents haven't gone back to try and change their own histories after the fact. But for now, let's dive into links.

!!!

### 5.7. Scaffold link types

We can request content by asking peers for `ActionHash`es or `EntryHash`es, but how do we find out which `ActionHash` or `EntryHash` to ask for?

Links can help us with that.

Links are a mechanism to establish relationships between identifiers, enabling efficient organization, lookup, and retrieval of related data in the distributed hash table (our application's storage system). They serve as a way to connect and reference actions, entries, and agents.

For our forum application, we'll want to create a couple of types of links.

Let's create a link-type from a post to a comment. If we have a post, we will be able to use links of this type to find all of the comments that have been made on that post. This pattern makes use of `ActionHash`es to navigate to Actions, queries the content of those Actions, then uses the `EntryHash`es referenced in them to request the entry content of the comments themselves. We can think of this as a post-to-comment link type.

Run the following command:

```bash
hc scaffold link-type
```

You should see:

::: output-block
```text
? Link from which entry type? ›
❯ Post
  Comment
  Agent
```
:::

Select `Post`, then you should see:

::: output-block
```text
? Reference this entry type with its entry hash or its action hash?
❯ ActionHash (recommended)
  EntryHash
```
:::

Select `ActionHash` and press <kbd>Enter</kbd>.

Then you should see:

::: output-block
```text
? Link to which entry type? ›
❯ Post
  Comment
  Agent
  [None]
```
:::

Use the arrow keys to select `Comment` and press <kbd>Enter</kbd>.

Again, you will see:

::: output-block
```text
? Reference this entry type with its entry hash or its action hash? ›
❯ ActionHash (recommended)
  EntryHash
```
:::

Press <kbd>Enter</kbd> to select `ActionHash (recommended)`

You should then see:

::: output-block
```text
? Should the link be bidirectional? (y/n) ›
```
:::

Press <kbd>Y</kbd> to make the link bidirectional.

!!! dig-deeper Bidirectional = make two links

Making the link type bidirectional tells the scaffolding tool to **also create a link type from a comment to the post** that it is responding to, along with code to create a link of that type whenever a comment is created. Links in Holochain aren't actually bidirectional. But to gain that functionality, we simply create two links, one in each direction.

With a link type from a comment to a post, if an agent has a comment, they can find out which post it is a response to.

We can think of this as a comment-to-post link type.

!!!

Next you should see:

::: output-block
```text
? Can the link be deleted? (y/n) ›
```
:::

Hit `y` to allow the link to be deleted.

You should then see:

::: output-block
```text
Link type scaffolded!
```
:::

Links allow us to create paths that agents can follow to find associated content. We've created two separate link types --- one pointing from a post to a comment (`PostToComments`) and another pointing from a comment to a post (`CommentToPosts`). If we want to see some of that code, take a look at the `dnas/forum/zomes/integrity/posts/src/lib.rs` file and you should see right near the top that a function has been created for validating the creation of a `post_to_comments` link. Similarly, other validation functions related to the deletion of those links is below. And further down are the validation functions related to the creation and deletion of a `comment_to_posts` link.

You might be thinking "That's all fine, but what exactly is a link? Where is it stored? How does it work? And what do they let us do that we couldn't do otherwise?"

This Core Concepts section on [Links and Anchors](https://developer.holochain.org/concepts/5_links_anchors/) paints a pretty clear picture.

In short, links enable us to build a graph of references from one piece of content to other pieces of content in a hApp and then to navigate that graph. This is important because without some sort of trail to follow, it is infeasible to just "search for all content" thanks to the address space (all possible hashes) being so large and spread out across machines that iterating through tme all could take millions of years.

By linking from known things to unknown things, we enable the efficient discovery and retrieval of related content in our hApp.

!!! dig-deeper How links are stored and retrieved in a Holochain app

**Storage**: When an agent creates a link between two entries, a "create link" action is written to their source chain. A link is so small that there's no entry for the action. It simply contains the address of the base, the address of the target, the link type (which describes the relationship), and an optional tag which contains a small amount of application-specific information. The base and target can be any sort of DHT address --- an `EntryHash`, an `ActionHash`, or an `AgentPubKey`. But they can also be the hash of a piece of data that doesn't even exist in the DHT.

After storing the action in the local source chain, the agent then publishes the link to the DHT, where it goes to the peers who are responsible for storing the base address and gets attached to the address as metadata.

**Lookup**: To look up and retrieve links in a Holochain app, agents can perform a `get_links` query on a base DHT address. This operation involves asking the DHT peers responsible for that address for any link metadata of a given link type attached to it, with an optional "starts-with" query on the link tag. The peers return a list of links matching the query, which contain the addresses of the targets, and the link types and tags. The agent can then retrieve the actual target data by performing a [`get`](https://docs.rs/hdk/latest/hdk/entry/fn.get.html) query on the target address, which may be an `EntryHash`, `ActionHash`, or `AgentPubKey` (or an empty result, in the case of data that doesn't exist on the DHT).

!!!

### 5.8. Scaffold a collection

Now, let's create a collection that can be used to retrieve all the posts. To create a collection, type:

```bash
hc scaffold collection
```

You should then see:

::: output-block
```text
Collection name (snake_case, eg. "all_posts"): ›
```
:::

Enter:

```text
all_posts
```

and press <kbd>Enter</kbd>. You should then see:

::: output-block
```text
? Which type of collection should be scaffolded? ›
❯ Global (get all entries of the selected entry types)
  By author (get entries of the selected entry types that a given author has created)
```
:::

Select **`Global`** and press <kbd>Enter</kbd>. You should then see:

::: output-block
```text
? Which entry type should be collected? ›
❯ Post
  Comment
```
:::

Select **`Post`** and press <kbd>Enter</kbd>. You should then see:

::: output-block
```text
Collection "all_posts" scaffolded!

At first, the UI for this application is empty. If you want the newly scaffolded collection to be the entry point for its UI, import the element in `ui/src/App.svelte`:

   import AllPosts from './forum/posts/AllPosts.svelte';

And use the element in the `&lt;div id="content" /&gt` block by adding in this:

   &lt;div id="content">&lt;<AllPosts>&lt;/AllPosts>&lt;/div>
```
:::



These instructions are telling us that if we want to include this component in the user interface of our hApp, we need to a) import the component and b) tell the UI to display the component.

In the next section, we will begin working with our `.svelte` files to control our UI.

!!! dig-deeper How a collection is implemented

We already explored how links make data in the DHT discoverable by connecting known DHT base addresses to unknown addresses. Essentially every address becomes an anchor point to hang a collection of links from.

But there's one remaining problem: _where do you start?_ When someone starts their app for the first time, the only DHT base addresses they know about are their public key, the DNA hash, and the few actions and entries on their source chain. There's no obvious way to start discovering other people's data yet.

This is where **collections** help out. A collection is just a bunch of links on a base address that's easy to find --- typically the address is hard-coded in the coordinator zome's code as the hash of a string such as `"all_posts"`. It's easy to get the links, because their base address is right there in the code.

This pattern, which we call the "anchor pattern", is so useful that it's built right into Holochain's SDK --- integrity zomes that use it will have all the necessary entry and link types automatically defined, and coordinator zomes that use it will have functions that can retrieve anchors and the links attached to them. The scaffolded code uses this implementation behind the scenes.

The built-in implementation is actually a simplification of a more general pattern called "paths", which is also built into the SDK. With paths, you can create trees of linked anchors, allowing you to create and query hierarchical structures. This can be used to implement categories, granular collections (for example, "all posts" → "all posts created in 2023" → "all posts created in 2023-05" → "all posts created on 2023-05-30"), and indexes for type-ahead search (for example, "all usernames" → "all usernames starting with 'mat'" → "all usernames starting with 'matt'"). What the SDK calls an `Anchor` is actually a tree with a depth of two, in which the root node is two empty bytes.

Hierarchical paths serve another useful purpose. On the DHT, where every node is tasked with storing a portion of the whole data set, some anchors could become "hot spots" --- that is, they could have thousands or even millions of links attached to them. The nodes responsible for storing those links would bear a disproportionate data storage and serving burden.

The examples of granular collections and type-ahead search indexes breaks up those anchors into increasingly smaller branches, so that each leaf node in the tree only has to store a small number of links.

The scaffolding tool doesn't have any feature for building anchors and trees beyond simple one-anchor collections, but if you'd like to know more, you can read the Core Concepts section on [Links and Anchors](https://developer.holochain.org/concepts/5_links_anchors/) and the SDK reference for [`hash_path`](https://docs.rs/hdk/latest/hdk/hash_path/index.html) and [`anchor`](https://docs.rs/hdk/latest/hdk/hash_path/anchor/index.html).

!!!

### 5.9. Integrate the generated UI elements

At this stage, we will incorporate all the UI components that have been scaffolded by the scaffolding tool into our main application interface. Our aim here is to make all the functionality of our forum application accessible from a single, unified interface. We'll use Svelte to accomplish this, as it is the framework that we have chosen for the UI layer of our application.

Let's go ahead and start our forum hApp in develop mode from the command line. Back in Terminal, from the root folder (`my_forum_app/`), enter:

```bash
npm start
```

* **Note:** if you are having an issue, make sure that you are still in nix shell. If not, you may need to re-enter `nix develop` first, then type the above command again. And remember that you can always exit nix shell by typing `exit` to get back to your normal shell.

When we start the hApp with `npm start`, this launches a new conductor in sandbox mode with two agents running that hApp, and opens three windows:

1. A web browser window with Holochain Playground, a tool that makes visible the various actions that have taken place in our forum hApp. At present we have a couple of agents in a DHT, with mostly empty source chains and, correspondingly, a mostly empty graph.
2. An application window with one agent (conductor 0) running the forum hApp. This window lets us take actions as that agent (0, or Alice, if you prefer).
3. Another application window with a second agent (conductor 1) running the forum hApp. This window lets us take actions as the other agent (1, or Bob).

These application windows allow us to test multiple agents in a Holochain network interacting with one another. It is all running on our one device, but the two conductors behave very much the same as separate agents on different machines would, minus network lag.

These three windows together will let us interact with our hApp as we are building it.

The Holochain Playground in particular is helpful in that it creates visual representations of the data that has been created and the way it relates to other content. Take a look at it and click one of the two items in the **DHT Cells** window. These are our two agents. When you click one of them, some content gets displayed in the **Source Chain** window. These are the initial actions in that agent's source chain. The arrows point from newer content back to older content.

From oldest to newest, in the newly created source chains, the actions are:

1. `DNA`, recording the hash of the DNA to be used to validate all subsequent source chain actions,
2. `AgentValidationPkg`, providing proof that this participant is allowed to participate in this hApp ([see more](https://www.holochain.org/how-does-it-work/) in Holochain: How does it work?),
3. `AgentID`, sharing the public key that is the complement of that agent's private key for that hApp and serves as their ID,
4. Eventually `InitComplete`, indicating that all coordinator zomes have had a chance to do initial setup, then
5. Whatever actions the agent takes after that.

The playground also lets us click on actions and entries in the DHT or the source chain to see their contents.

The two application UI windows allow us to interact with the application and see what is working, what is not working, and how data propagates when we take particular actions.

At first, each of the UI windows (conductors 0 for Alice and 1 for Bob) include instructions for us as developers to go and examine the UI elements that have been generated by the scaffold by looking at the contents in the folder `ui/src/<dna>/<zome>/`, where `<dna>` and `<zome>` are generic placeholders for our DNA (`forum`) and zome (`post`).

Thus far, nine different components have been generated as `.svelte` files in the `ui/src/forum/posts/` directory.  If we go look at that folder we can see the files that have been created. Note that for ease in development, we have configured the sandbox testing environment to live-reload the UI as we edit UI files. So don't quit the process you started with `npm start`; instead, **open a new terminal window**. Then navigate to the root folder of your hApp (`my_forum_app/`) and then list the files in `ui/src/forum/posts/` by entering:

```bash
ls ui/src/forum/posts/
```

You should see nine different `.svelte` files, plus a `types.ts` file:

::: output-block
```text
AllPosts.svelte         CreatePost.svelte   PostsForComment.svelte
CommentDetail.svelte    EditComment.svelte  types.ts
CommentsForPost.svelte  EditPost.svelte
CreateComment.svelte    PostDetail.svelte
```
:::

The next step is to edit the UI files in the text editor or integrated development environment of your choice. If you don't yet have path commands for opening files in your prefered IDE, [this tutorial can help guide you through setting up path commands](https://hackmd.io/@oitz5O-qR2qrfRre3Kbv-Q/r1Z_Z6Qgrn).

**Going forward in this tutorial, we are going to use `code` to open files in [VS Code](https://code.visualstudio.com/)**, but you should substitute a different command (ex: `atom`) for `code`, if you are using a different IDE.

Let's open up `CreatePost.svelte` and take a look at its contents. Using VS Code as our IDE, we would enter:

```bash
code ui/src/forum/posts/CreatePost.svelte
```

In the script section in the top part of the file, we see some imports, some variable assignments, and an async function for `createPost`. Below the script section, we see a CSS section with style information for Title, Content and a "Create Post" button.

So that `CreatePost.svelte` file contains all the things that are needed for a basic User Interface related to that `CreatePost` component.

Each of the other `.svelte` files has something similar for each of the other components.

As the appliction windows showed, to integrate all of these generated UI elements, we need to add them to the `App.svelte` file located in the `ui/src/` folder.

Adding in a component into the UI in Svelte requires two simple steps:

1. Import the content of that particular `.svelte` file in the script section, e.g.:

    ```typescript
    import CreatePost from './forum/post/CreatePost.svelte'
    ```

2. Add the the UI component HTML for that file to the `main` section, e.g.:

    ```html
    <CreatePost></CreatePost>
    ```

Open the `App.svelte` file with your preferred IDE.

With VS Code, for example, from our root folder for the hApp (forum), we would enter:

```bash
code ui/src/App.svelte
```

Our `App.svelte` file will have three sections:

1. a script section,
2. a main section, and
3. a style section

and should initially look like this:

```html
<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import type { ActionHash, AppAgentClient } from '@holochain/client';
  import { AppAgentWebsocket } from '@holochain/client';
  import '@material/mwc-circular-progress';

  import { clientContext } from './contexts';

  let client: AppAgentClient | undefined;
  let loading = true;

  $: client, loading;

  onMount(async () => {
    // We pass '' as url because it will dynamically be replaced in launcher environments
    client = await AppAgentWebsocket.connect('', 'forum');
    loading = false;
  });

  setContext(clientContext, {
    getClient: () => client,
  });
</script>

<main>
  {#if loading}
    <div style="display: flex; flex: 1; align-items: center; justify-content: center">
      <mwc-circular-progress indeterminate />
    </div>
  {:else}
    <div id="content" style="display: flex; flex-direction: column; flex: 1;">
      <h2>EDIT ME! Add the components of your app here.</h2>

      <span>Look in the <code>ui/src/DNA/ZOME</code> folders for UI elements that are generated with <code>hc scaffold entry-type</code>, <code>hc scaffold collection</code> and <code>hc scaffold link-type</code> and add them here as appropriate.</span>

      <span>For example, if you have scaffolded a "todos" dna, a "todos" zome, a "todo_item" entry type, and a collection called "all_todos", you might want to add an element here to create and list your todo items, with the generated <code>ui/src/todos/todos/AllTodos.svelte</code> and <code>ui/src/todos/todos/CreateTodo.svelte</code> elements.</span>

      <span>So, to use those elements here:</span>
      <ol>
        <li>Import the elements with:
        <pre>
import AllTodos from './todos/todos/AllTodos.svelte';
import CreateTodo from './todos/todos/CreateTodo.svelte';
        </pre>
        </li>
        <li>Replace this "EDIT ME!" section with <code>&lt;CreateTodo&gt;&lt;/CreateTodo&gt;&lt;AllTodos&gt;&lt;/AllTodos&gt;</code>.</li>
        </ol>
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
```

!!! dig-deeper Detailed breakdown of `App.svelte`

#### `<script>` section:

* This section contains the JavaScript/TypeScript code for the component.
* It imports various dependencies needed to build a single-page web app:
    * `svelte` is the Svelte engine itself, and its `onMount` function lets you register a handler to be run when the component is initialized, while `setContext` lets you pass data to be used in the rendering of the component.
    * `@holochain/client` is the Holochain client library; first we load in some useful TypeScript types, followed by the client object itself.
    * `@mwc/material-circular-progress` is just a UI component that gives us a spinner when something is loading.
    * `./contexts` is a local file, generated by the scaffolding tool. It store the name of the context that is set with the `setContext()` that is then used by each of the elements to retrieve the contextual information they need, which in our case is the Holochain `AppAgentClient` object.
* It declares and initializes the `onMount` handler that creates a Holochain client object when the main app component is initialized, connects it to the locally running hApp, removes the loading message and spinner, then adds that object to the context available to the main app component and its child components via the `setContext` handler. (Note: The `$:` syntax turns local variables into 'reactive' variables --- that is, variables that trigger a UI update when they're changed.)

#### `<main>` section:

* This section is a template for the displayable content of the main app component.
* Using an `{#if}` block, this section starts up with a 'loading' spinner that is shown until the Holochain client connects to the hApp backend. After that, it shows some boilerplate text telling you to add something meaningful to the template.
* When a reactive variable is used anywhere here, such as the `loading` variable which becomes false once the Holochain client is connected, Svelte will handle the updating of the UI whenever that variable changes.

#### `<style>` section:

* This section is a template for the CSS styles that get applied to the HTML in the `<main>` section of the component. You can also use reactive variables here, and the styling will update whenever the variables change.
* The scaffolded styles set the component up with some basic layout to make it readable at small and large window sizes.

!!!

At the top of the file, there is a list of import scripts.

We are going to begin by importing all the generated Svelte components at the top of our script block.

Following the same pattern that we were directed to use after we scaffolded our `AllPosts` collection and again in our two conductor windows, let's copy the following text and paste it into the script block of the `App.svelte` file, just a line or two below `import { clientContext } from './contexts';`

```typescript
import AllPosts from './forum/posts/AllPosts.svelte';
import CommentDetail from './forum/posts/CommentDetail.svelte';
import CommentsForPost from './forum/posts/CommentsForPost.svelte';
import CreateComment from './forum/posts/CreateComment.svelte';
import CreatePost from './forum/posts/CreatePost.svelte';
import EditComment from './forum/posts/EditComment.svelte';
import EditPost from './forum/posts/EditPost.svelte';
import PostDetail from './forum/posts/PostDetail.svelte';
import PostsForComment from './forum/posts/PostsForComment.svelte';
```

Next we will need to add our components a little further down the page in the `<main>` section of the file, where there is currently some "EDIT ME!" content. We are going to start by just adding `CreatePost`.

Just below the line that reads:

```html
<div id="content" style="display: flex; flex-direction: column; flex: 1;">
```

add the following:

```html
<CreatePost></CreatePost>
```

Then save that file and take a look again at the two UI windows. You should now see a "Create Post" headline, a "Title" input box, a "Content" input box and a "Create Post" button.

Great! Let's create a post!

Go ahead and type something into one of the two conductor windows like:

* Title: `Hi from 0`
* Content: `Hello 1!`

and then press the "Create Post" button.

You'll' immediately notice that you don't see any change in the application windows. This is because there's no UI code yet to display any posts, but if you take a look at the Holochain Playground window, you will see that a new entry has been created. If you click the "App" element that you've created in Alice's source chain, it will pull up some details in the Entry Contents section, including the title and content of our entry. Note the hash of that entry (top of the Entry Contents window). Then click on the Create Action that is pointing toward that App entry in the source chain. If you look back at the contents window, you will see that it is now sharing Action Contents. And if you look down the list a bit, you will see the entry hash of the entry for the first post.

!!! dig-deeper Relationships in a source chain versus relationships in the DHT

At this point, in our DHT graph it should look like we have two different agents and then a separate floating entry and action. But we know that the new post is associated with a source chain which is associated with an agent. So why aren't they connected on the DHT?

A source chain merely serves as a history of one agent's attempts to manipulate the state of the graph database contained in the DHT. It's useful to think of the DHT as a completely separate data store that doesn't necessarily reflect agent-to-entry relationships unless you explicitly create a link type for them.

For the purpose of this hApp, we're not interested in agent-to-posts relationships, so it's fine that they're not linked. But if you wanted to create a page that showed all posts by an author, that's when you might want to scaffold that link type. `hc scaffold collection` will do this for you if you choose a by-author collection, along with generating a `get_posts_by_author` function, if you choose to create a collection by author rather than a global one.

!!!

Now let's add the UI component that will actually let our users see things that have been posted. That's `AllPosts`.

Go ahead and try to add `AllPosts` on your own. We've already imported the component's source file. You just need to add its renderer to the `<main>` section. Once you are done, continue below.

Did you end up adding something like

```html
<AllPosts></AllPosts>
```

just before or after `<CreatePost></CreatePost>`?

Once you save the file, you should see your first post show up for both 0 (Alice) and 1 (Bob).

Let's go ahead and edit that post. In the same UI window that you created the post in, click "Edit" adjacent to the post content.

Now alter the content a bit. Maybe change it from `Hello 1!` to `Hello, World!` and click "Save".

That should update the post (at least for the agent that made the change). The other application window will get the updated version the next time it is refreshed. Later, we will work on making these sorts of changes propagate more instantaneously from a user perspective.

If we look at the Holochain Playground, we can see that the update was added to to the source chain of the agent that made the update. Specifically, it created:

1. a new entry (with our `Hello, World!` text),
2. an `UpdateEntry` action that indicated this entry is to replace the original entry, and
3. a `CreateLink` action that articulates a link between the original create action and the update action.

Let's go ahead and delete that post. If we look again at the Holochain Playground, we will see that a `DeleteEntry` action has been added to the source chain. Clicking on that action will show the details in the Action Contents window. We can see that the update action and the original entry are being marked as deleted in this delete action.

Let's create another post.

If we just add the comment form component to the `<main>` section of our `App.svelte` file, the Post functionality stops working. For instance, just below `<AllPosts></AllPosts> let's add:

```html
<CreateComment></CreateComment>
```

When we do that, we stop being able to see existing posts, and lose our ability to create new posts. Something is wrong here.

What is it?

The `CreateComment` component needs to be created _in response to some particular post_. We need to add some logic that will clarify when `CreateComment` is supposed to become available.

TODO: add UI stuff here.

<div style="display:none">
TODO: this looks like older stuff, cleanup?

====

TODO (Matt's best guess at this):
6. Creating Validation Rules
7. Built to Beautiful: adjusting our User Interface
8. Creating Tests
~~9. Deploying Your Holochain Application
    9.1. Packaging Your Application
    9.2. Configuring the Conductor
    9.3. Running Your Application~~
10. Testing Your Holochain Application
    10.1 Creating Test Scenarios


QUESTIONS:
When to introduce:
- conductors
- cells
-

---
</div>

## 6. Creating validation rules

What can validation rules do? All sorts of things including:

* validate the expected structure of the data (deserialize and throw an error if something isn't as it should be)
* validate constraints like length of a string
* write privileges
* membership privileges
* validate in the context of a person's history (can't really do that with a database schema)
    * by virtue of the fact that you have the user's whole history available, you could validate whether this person has built up enough history to post this comment.

For this tutorial, we are going to create just a couple of validation rules to give a feel for what goes into them

1. a simpler validation rule by imposing a constraint on the length of a comment and
2. a more advanced validation rule that only allows the original author of a post to update that post.

### 6.1. Beginner (inspecting the entries)

Character limit on comment length

In this section, we are going to make a validation rule that sets the maximum length of a comment to 140 characters.

Let's start by making use of a Test Driven Development (TDD) pattern and write a test to check whether or not comments longer than 140 characters are able to be created. Initially, this test should fail.

Then we will write a validation rule that ensures that comments with more than 140 characters are rejected as invalid so that our test will pass.

##### Writing a test

Holochain comes with some testing tools to make it easier to test peer-to-peer applications. One that the scaffold makes use of in the code that it generates is [Tryorama](https://github.com/holochain/tryorama).

Tryorama is a framework for testing Holochain applications. It provides a way to run a number of Holochain conductors (instances of the Holochain runtime) on your local machine, and can be used in combination with a test runner and assertion library to test the behavior of multiple Holochain nodes in a network. In this case, the test runner and assertion library we use are `vitest` and `assert` respectively.

In short, Tryorama helps us test that things are working as they should even when multiple peers are interacting by spinning up a virtual network of different agents on your computer.

In order to test whether or not comments longer than 140 are going to be able to be created, we are going to first open our `comment.test.ts`` file:

```bash
code tests/src/forum/posts/comment.test.ts
```

This file contains the boilerplate that the scaffold has written for testing comments. At the top are some imports, including `createComment` and `sampleComment` from `./common.js`. Then below that are some tests: one that tests 'create Comment', another that tests 'create and read Comment', another that tests 'create and update Comment' and finally, one that tests 'create and delete Comment'.

We are going to look to those tests for inspiration regarding how to structure our max 140 characters test.

Looking at the 'create Comment' test (starting at line 9 or so), the main steps of the test are as follows

* The location of the Holochain application bundle (`.happ` file) is specified.
* The application is installed for two players, Alice and Bob.
* Peer discovery through gossip is initiated with `scenario.shareAllAgents()`, allowing the players to recognize each other in the network.
* Alice creates a comment using the createComment function, which implements a call to a Holochain zome function to create a comment. This returns a Record instance.
* An assertion checks that the returned record is valid.

The first three steps basically involve setting up the test network with the application. Each test cleans up after itself so that subsequent tests are working with a clean slate. So we are going to have to implement some of those same steps in the test that we will be writing. Let's add that part first.

At the bottom of the `comment.test.ts` file, add in:

```javascript
test('should not create a Comment longer than 140 characters', async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + '/../workdir/my_forum_app.happ';

    // Set up the app to be installed
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();
  });
});
```

That gets the basic network set up out of the way. Now let's prep a constant to hold our "long comment" and a variable to keep track of whether an error occurred before we add the actual constraints that we want to test.

Just below the `await scenario.shareAllAgents();` line, create a string that is longer than 140 characters and assigning it to a constant:

```javascript
// Create a string longer than 140 characters
const longCommentContent = Array(142).join("a");
```

Directly after that line, add the following assertion:

```javascript
// Trying to create a Comment with content longer than 140 characters should throw an error
await expect(() => createComment(alice.cells[0], longCommentContent)).rejects.toThrowError();
```

This tests whether the `createComment` function properly throws an error when attempting to create a comment that is too long.

`alice.cells[0]` represents the first cell of the 'alice' agent, which might mean the first application, or component of an application if there are multiple DNAs, Alice can operate within.

`longCommentContent` is a string of text that represents a comment. In the context of the test, this string has been deliberately set to a length of 142 characters, which is longer than the application's allowed limit of 140 characters.

The await keyword is used to wait until the Promise returned by createComment either resolves (meaning the comment was successfully created), or rejects (throws an exception), which would indicate that an error occurred, such as the comment being too long.

In this test it is expected that the Promise of executing `createComment` be rejected. `rejects` unwraps the Promise and gives access to the value that it was rejected with. We expect to find an error object. That would mean that the validation of a too long comment failed.

##### Running our test

So as not to run all the tests, and just run the one we just created, change `test` at the beginning of this test to `test.only`.

Second, let's run just that test. In the command line run:

```bash
npx vitest --run comment.test.ts
```

Note: When you want to run all the tests, change `test.only` back to `test` and in the command line, run:

```bash
npm run test
```

The test should initially fail (because we haven't yet implemented that 140 character constraint).

##### Writing the validation rule

Our next step is to start editing the appropriate validation rule so that agents can only create a comment if it is no more than 140 characters in length.

Fortunately, the scaffold has already written a fair bit of validation rule boilerplate code for us.

In our IDE, let's open our integrity zome `comment.rs` file:

```bash
code dnas/zomes/integrity/posts/src/comment.rs
```

In `comment.rs`, we are going to want to add our "maximum 140 characters" constraint to the `validate_create_comment()` function (about line 8). Edit the `validate_create_comment` function to add the following on the line just above `Ok<ValidateCallbackResult::Valid)` (at the bottom of that function).

```rust
    if (comment.comment_content.len()) > 140 {
        return Ok(ValidateCallbackResult::Invalid("Comment is longer than 140 characters".to_string()));
    }
```

When finished, it should look like this:

```rust
pub fn validate_create_comment(
    _action: EntryCreationAction,
    comment: Comment,
) -> ExternResult<ValidateCallbackResult> {
  TODO
/*    let record = must_get_valid_record(comment.post_hash.clone())?;
    let _post: crate::Post = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Dependant action must be accompanied by an entry"))
            ),
        )?;*/
    if (comment.comment_content.len()) > 140 {
        return Ok(ValidateCallbackResult::Invalid("Comment is longer than 140 characters".to_string()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

Lets save the file.

If we now run the test again, it will pass.

TODO: SHOW RUNNING THE TEST AND IT PASSING.

What about updating comments?  Remember that in Holochain, because the source-chain is an appen only ledger, updating a comment is really creating a new comment and marking the old comment as deleted. Thus, when someone updates a comment, the create validation rules will still get enforced because a new comment entry gets created.

### 6.2. Advanced (inspecting the actions)

Permissions on updates and deletes

In `post.rs`, there is a function that enables us to update a post.

```rust
pub fn validate_update_comment()
```

Here we can create a validation rule that requires that the editor of a comment is the original author of that comment.
Edit the `validate_update_post` function as follows:

```rust
pub fn validate_update_post(
    _action: Update,
    _post: Post,
    _original_action: EntryCreationAction,
    _original_post: Post,
) -> ExternResult<ValidateCallbackResult> {
    // Check that the agent who originally created the post is the same as the one trying to update it.
    if *_original_action.author() != _action.author {
        return Ok(ValidateCallbackResult::Invalid("Only the original author can update the post".to_string()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

UI doesn't generate an edit button that the author can't edit.

Using the validation error message to store some JSON to say "these fields are incorrect", have a list of error messages, compile them in a way the UI can parse, that feels like a user friendly

Other possibilities: validate as you type. Calls the validate create comment function (as if it were validating, even though it isn't actually validating now)

What would be really cool - if we a schema definition for your entry types that would generate the validation code and the UI side as you type javascript code.

<div style="display:none">
TODO:
### 6.3. Validating links?

(currently one dht is an isolated thing, but we can link from elsewhere, we just have to be content with that input being unvalidated)
    has to be data at the base address

4 dht entry action
store entry
store action
register agent activity
also sends a register update entry op to the holders of the original entry
creating a sort of a link from the old entry to the new entry
Those who receive the store action (validation authorities), they will run the validation.

---
</div>

## 7. Deploying your Holochain application

### 7.1 Packaging
Now that you've implemented an application, it's time to think about how you might deploy it. The first step is to package your app:

```bash
npm run package
```

This command does a number of things:
1. triggers the rust compiler to build the zomes
2. uses the `hc` command line to combine the built zomes into a DNA file
3. builds the UI and compresses it into a `.zip` file
4. combines the DNA file and the UI zip into a `.webhapp` file

These files end up in the `workdir` directory: TODO: confirm

```bash
ls workdir
TODO add results
```

The packed app is now ready for deployment to a Holochain runtime.

### 7.2 Runtimes

In the centralized world, deployment is usually achieved by Continuous Integration (CI) automation that builds up code changes and sends them to what ever server or cloud-based platform you are using. In the decentralized world of Holochain, deployment happens when end-users adds your application into a Holochain run-time environment on their own computers.

From the end-user perspective there are currently there are two ways to go about this, both of which will feel familiar:

1. Download Holochain's official Launcher run-time and install the app from its app-store.
2. Download an your app as its own stand-alone desktop executable, as they would any other application for their computer.

#### 7.2.1 Launcher, the multi-app runtime

Holochain's official end-user runtime is the [Holochain Launcher](https://github.com/holochain/launcher). It allows end-users to install apps from a built-in app store or from the file system. Installed apps can then be launched from a friendly UI. Note that the app store is itself a distributed Holochain application which provides details on applications that are available to be run. As a developer you can either go through a simple publishing process and add your app to the app store where it will be available for installation by all people who use the Launcher, or you can share your application directly with end-users through your own channels and they can install it into their Holochain Launcher manually from the file system.

You can try this latter approach immediately by downloading and running the Launcher!

The steps for publishing an app to the Launcher's app store are documented in the Github repository of the Holochain Launcher [here](https://github.com/holochain/launcher#publishing-and-updating-an-app-in-the-devhub).

#### 7.2.2 Standalone executable

If you prefer to distribute your app as a full standalone executable, you will need to find a way to ship the Holochain runtime and your app together and take care of the necessary interactions between them. Currently there are two straightforward paths for doing this: using either the [Electron](https://www.electronjs.org/) or [Tauri](https://tauri.app/) frameworks, both of which can generate cross-platform executables from standard web UIs. These frameworks also support inclusion of additional binaries, which in our case are the conductor and the lair keystore. Though there is quite a bit of complexity in setting things up for these frameworks, all the hard work has already been done for you:

* **Electron**: Refer to the community supported [electron-holochain-template](https://github.com/lightningrodlabs/electron-holochain-template/) repo.
* **Tauri**: See the [holochain-kanagroo](https://github.com/holochain-apps/holochain-kangaroo) repo.

Both of these are GitHub template repos with detailed instructions on how to clone the repos and add in your UI and DNA, as well as build and release commands that will create the cross-platform executables that you can then deliver to your end users.

!!! note Code Signing
For macOS and Windows, you will probably also want to go through the process of registering as a developer so that your application can be "code-signed". This is needed so that users don't get the "unsigned code" warnings when launching the applications on those platforms. Both of the above templates include instructions for CI automation to run the code-signing steps on release once you have acquired the necessary certificates.
!!!

<div style="display:none">
TODO: this looks like older stuff, cleanup?

---

Now that you've implemented the forum application, it's time to deploy it. To do this, you'll need to package your application and configure the conductor.

### 7.1. Packaging your application

Navigate to the `forum/dna` folder and run the following command:

hc dna pack my_forum_app.dna.workdir


This will create a `forum.dna` file, which is a packaged version of your application.

### 7.2. Configuring the conductor

Edit the `conductor/conductor-config.yml` file with the following content:

```yaml
---
environment_path: ./
use_dangerous_test_keystore: false
signing_service_uri: ~
encryption_service_uri: ~
decryption_service_uri: ~
dpki: ~
keystore_path: "./keystore"
passphrase_service: ~
admin_interfaces:
  - driver:
      type: websocket
      port: 0
network:
  bootstrap_service: https://bootstrap.holo.host
  transport_pool:
    - type: webrtc
      signal_url: wss://signal.holo.host
  network_type: quic_bootstrap
```

### 7.3. Running your application

To run your Holochain application, navigate to the forum/conductor folder and run the following command:

```bash
hc run
```

This will start your Holochain application and provide a WebSocket API for interacting with it.

Congratulations! You have now successfully created and deployed a forum application using Holochain. With this knowledge, you can continue exploring and building more complex applications using the Holochain framework.

## 8. Testing your application

To ensure that your application works as expected, you should write tests for the application's functionality. In Holochain, tests are written in a separate tests folder.

### 8.1. C

Navigate to the `my_forum_app/tests/` folder and create a new file called `my_forum_app_tests.rs`. This file will contain the test scenarios for your application.

First, add the necessary imports and create a test_scenario function that initializes the test environment:

```rust
use ::fixt::prelude::*;
use hdk::prelude::*;
use holochain::test_utils::conductor_testing::{conductor_test, HostFnCaller};
use holochain_types::app::InstalledCell;
use holochain_wasm_test_utils::TestWasm;

pub struct TestContext {
    pub cell: InstalledCell,
    pub call: HostFnCaller,
}

async fn test_scenario(
    test_fn: impl FnOnce(TestContext) -> BoxFuture<'static, ()> + Send + 'static,
) {
    conductor_test(test_fn, vec![(TestWasm::ForumZome, "my_forum_app.wasm")]).await;
}
```

### 8.2. W

Now, write test cases for creating and retrieving threads:

```rust
use my_forum_app::{CreateThreadInput, GetThreadInput};

#[tokio::test(threaded_scheduler)]
async fn test_create_and_get_threads() {
    test_scenario(|ctx: TestContext| {
        async move {
            // Create a new thread
            let thread_title = "Test Thread".to_string();
            let post_content = "This is a test post.".to_string();
            let create_input = CreateThreadInput {
                title: thread_title.clone(),
                content: post_content.clone(),
            };
            let thread_hash = ctx
                .call(TestWasm::ForumZome, "create_thread", create_input)
                .await
                .unwrap()
                .unwrap();

            // Retrieve all threads
            let threads = ctx
                .call(TestWasm::ForumZome, "get_all_threads", ())
                .await
                .unwrap()
                .unwrap();
            assert!(threads.contains(&thread_hash));

            // Retrieve the created thread
            let get_input = GetThreadInput { thread_hash };
            let thread = ctx
                .call(TestWasm::ForumZome, "get_thread", get_input)
                .await
                .unwrap()
                .unwrap();
            assert_eq!(thread.title, thread_title);
            assert_eq!(thread.initial_post.content, post_content);
        }
        .boxed()
    })
    .await;
}
```

8.3. Running Tests

To run the tests, navigate to the `my_forum_app/` folder and run the following command:

```bash
hc test
```

This will execute your tests and display the results in the terminal.

</div>

## 8. Next steps

Congratulations! You've learned how to create a new Holochain application, understand its layout, work with core concepts, and deploy and test the application.

Now that you have a basic understanding of Holochain development, you can continue exploring more advanced topics, such as:

    Implementing user authentication and authorization
    Integrating your Holochain application with a frontend user interface
    Building more complex data structures and relationships
    Optimizing your application for performance and scalability

### 8.1  Further exploration and resources

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
