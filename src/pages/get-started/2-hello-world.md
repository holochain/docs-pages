---
title: "Scaffold a Simple Hello World Application"
---

In this section, we’ll use Holochain’s scaffolding tool to generate a simple “Hello World!” application.

For this tutorial, we'll be working in `~/Holochain`. Create that folder now and move into it:

```shell
mkdir ~/Holochain
```
```shell
cd ~/Holochain
```

When getting started, seeing a simple but fully-functional app can be very helpful. You can have Holochain's scaffolding tool generate a "Hello World!" application (but for a distributed multi-agent world) by typing the following in your command line terminal:

```shell
nix run github:holochain/holonix?ref=main-0.4#hc-scaffold -- example hello-world
```

The scaffolding tool will ask you one question --- what JavaScript package manager you'd like to use in your project. If in doubt, just choose `npm`.

After doing a bit of work, it'll print out these four commands for you to run in order to compile and run the app. Copy them from your terminal or from below:

```shell
cd hello-world
```
```shell
nix develop
```

Nix will then download all the packages you need to build and test Holochain apps. It might take a few minutes the first time.

```shell
npm install
```

!!! info Warning for Ubuntu 24.04 and later
Ubuntu Linux 24.04 [introduces security policy changes](https://discourse.ubuntu.com/t/ubuntu-24-04-lts-noble-numbat-release-notes/39890#unprivileged-user-namespace-restrictions-15) that cause the following command to fail. Here's a simple fix. In your terminal, run this command:

```shell
sudo chown root:root node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

You'll need to do this once (but only once) for every new project you scaffold. You can find out more [here](/get-started/install-advanced/#fixing-the-suid-sandbox-error-in-ubuntu-24-04-and-later).
!!!

```shell
npm start
```

After you run the last of these commands, you'll see the Rust compiler doing its thing (which may take a while). Then three windows will open:

![A screenshot showing two hApp windows in front of the Playground](/assets/img/get-started/1-running-app-first-look.png)

* A web browser window with the Holochain Playground, which displays a visual representation of the app's state data across all the peers
* Two windows showing the UI for two agents, both of which will have published a `hello` entry to the network

The first thing the app does upon initialization is create a `hello` entry and store it to the shared application state (this is called the application's [DHT](/concepts/4_dht/)). Remember that, because each participant runs the app on their device, a greeting will be stored for each person.

Click on the "Look for Hellos" button, and you'll see a greeting from both participants:

![A screenshot showing one app window, with hello messages in different languages retrieved from the DHT](/assets/img/get-started/2-look-for-hellos.png)

When you're done checking out this app, you can go back to the terminal and stop both agents by pressing <kbd><kbd>Ctrl</kbd>+<kbd>C</kbd></kbd> (Linux) or <kbd><kbd>Cmd</kbd>+<kbd>C</kbd></kbd> (macOS).

!!! dig-deeper Understanding the layout of a scaffolded project

Let's explore the different files and folders that make up the structure of the "Hello World!" hApp that you just created.

List the folders and files in our `hello-world/` folder by entering:

```shell
ls
```

This table includes everything in the `hello-world/` folder as well as details of the contents of the `dnas/` subfolder since that makes up the bulk of the "Holochain" part of an application. For certain working folders, like `node_modules/`, `target/`, `tests/`, and `ui/`, the table only contains a high-level overview.

| File/folder                           | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <pre> ├── hello-world/         </pre> | Root folder of the application. All other files and folders will reside here.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <pre> ├┬─ dnas/                </pre> | This folder contains the DNA configuration and source code for the application. DNAs are one of the most important building blocks in Holochain. Simply put, **a DNA is the executable code for the game you are playing with your peers in Holochain.** And here is the twist: in Holochain, **every DNA creates its own peer-to-peer network** for the validation, storage, and serving of content. Every Holochain application contains at least one DNA. In this example hApp, we have just one: `hello_world`. |
| <pre> │└┬─ hello_world/        </pre> | Folder for the `hello_world` DNA. It contains the source code and other artifacts for the modules of the DNA (zomes) that define the rules and API of this application.                                                                                                                                                                                                                                                                                                                                                                                                    |
| <pre> │ ├┬─ workdir/           </pre> | A working folder containing a bundle manifest for the DNA, as well as the bundled DNA file once it's been built.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <pre> │ │├── dna.yaml          </pre> | DNA manifest file. A YAML file that defines the properties and zomes of the DNA. YAML is a human-readable data serialization language.                                                                                                                                                                                                                                                                                                                                                                              |
| <pre> │ │└── hello_world.dna   </pre> | The compiled DNA file, which includes both the integrity and coordinator zomes. This file contains the back-end code needed to participate in a single component of the hApp, and will be bundled into the `.happ` file.                                                                                                                                                                                                                                                                                                                                                                                     |
| <pre> │ └┬─ zomes/             </pre> | The source code for zomes (short for chromosomes), which are the executable packages in a DNA. Each zome has its own name like `profile` or `chat`. Zomes define the core logic in a DNA, and can be composed together to create more powerful functionality. DNAs in Holochain are always composed out of one or more zomes. This folder contains zomes for the `hello_world` DNA.                                                                                                                                 |
| <pre> │  ├┬─ coordinator/      </pre> | This folder contains the coordinator zomes, which are responsible for this DNA's controller layer, such as reading/writing data and handling communication between peers. The public functions defined in these zomes' code become the DNA's API available to the UI and, depending on the needs of your app, to other peers in the same network.                                                                                                                                                           |
| <pre> │  │└┬─ hello_world/     </pre> | Folder containing the source code for the package that will become the `hello_world` coordinator zome binary. Rust packages are called crates, and they have the following structure.                                                                                                                                                                                                                                                                                                                               |
| <pre> │  │ ├┬─ src/            </pre> | Source code folder for the `hello_world` crate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| <pre> │  │ │└── lib.rs         </pre> | The main source code file for the `hello_world` crate. In Rust, `lib.rs` is the entry point for a library crate, which is the kind of crate that a zome needs to be written as. If you have nothing else in here, you should have this file.                                                                                                                                                                                                                                                                        |
| <pre> │  │ └── Cargo.toml      </pre> | The manifest file for the crate that will become the `hello_world` coordinator zome, containing metadata, dependencies, and build options. This file tells Cargo, Rust's package manager, how to build the crate into a binary.                                                                                                                                                                                                                                                                                     |
| <pre> │  └┬─ integrity/        </pre> | This folder contains the integrity zomes, which are responsible for the application's model layer, which define data structures and validation rules for application data.                                                                                                                                                                                                                                                                                                                                          |
| <pre> │   └┬─ hello_world/     </pre> | Folder containing the `hello_world_integrity` crate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <pre> │    ├┬─ src/            </pre> | Source code folder for the `hello_world_integrity` crate.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <pre> │    │└── lib.rs         </pre> | The main source code file for the `hello_world_integrity` crate.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <pre> │    └── Cargo.toml      </pre> | The Cargo manifest file for the `hello_world_integrity` crate.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| <pre> ├── node_modules/        </pre> | A folder containing cached JavaScript packages and dependencies for the user interface, tests, and build scripts.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| <pre> ├── target/              </pre> | A folder containing the compiled output from the Rust build process.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <pre> ├── tests/               </pre> | A folder containing JavaScript test code for the application.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| <pre> ├── ui/                  </pre> | A folder containing the source code and assets for the web-based user interface of the "Hello World!" application. This user interface will get distributed along with the application.                                                                                                                                                                                                                                                                                                                            |
| <pre> ├┬─ workdir/             </pre> | A working folder containing bundle manifest for the whole hApp, as well as the hApp file once it's built.                                                                                                                                                                                                                                                                                                                                                                                                  |
| <pre> │├── happ.yaml           </pre> | The manifest file for the hApp. It references the DNA files to be included, along with the roles they play in the application. In this case, there's only one DNA file, `hello_world`.                                                                                                                                                                                                                                                                                                                              |
| <pre> │├── hello_world.happ    </pre> | The compiled hApp bundle, which includes all the DNAs (in this case, just the one).                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <pre> │├── hello_world.webhapp </pre> | The compiled web hApp bundle, which includes the hApp bundle plus the zipped UI.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| <pre> │└── web-happ.yaml       </pre> | The manifest file for the hApp plus the UI. It references the compiled hApp bundle and zipped UI folder to be included.                                                                                                                                                                                                                                                                                                                                                                                             |
| <pre> ├── Cargo.lock           </pre> | A file generated by Cargo, Rust's package manager, that lists the exact versions of dependencies used in the project.                                                                                                                                                                                                                                                                                                                                                                                               |
| <pre> ├── Cargo.toml           </pre> | The main configuration file for the Rust project, containing dependencies, build options, and other metadata for all crates.                                                                                                                                                                                                                                                                                                                                                                                        |
| <pre> ├── flake.lock           </pre> | A file generated by Nix, the package manager we use to distribute the Holochain development tools, that lists the exact versions of dependencies used in the project.                                                                                                                                                                                                                                                                                                                                               |
| <pre> ├── flake.nix            </pre> | A Nix file that defines the project's build environment and dependencies.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <pre> ├── package.json         </pre> | The configuration file for the JavaScript portions of the project, containing dependencies, scripts, and other metadata for the application's user interface and tests, as well certain build tools.                                                                                                                                                                                                                                                                                                           |
| <pre> ├── package-lock.json    </pre> | A file generated by npm, Node.js package manager, that lists the exact versions of dependencies used by Node.JS.                                                                                                                                                                                                                                                                                                                                                                                                    |
| <pre> └── README.md            </pre> | A Markdown file containing the documentation and instructions for the application, including how to build, run, and test the project.                                                                                                                                                                                                                                                                                                                                                                               |

These files and folders make up the structure of a Holochain application, with the main logic defined in the zomes (in the `dnas/<dna>/zomes/` folders) and the user interface defined in the `ui/` folder. The manifest files bring all the Holochain and UI assets together, allowing the `hc` tool to bundle them into a single hApp file ready for distribution.

!!!

### Next up

Now it's time to try scaffolding your own application. Follow the instructions in the next guide to learn how to generate back-end and UI code.

[Forum app tutorial →](/get-started/3-forum-app-tutorial/){.btn-purple}