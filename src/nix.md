# More Info on Nix

We use the NixOS toolkit to build consistent development, testing, and deployment environments for Holochain Core and apps.

NixOS development tools run on many operating systems. NixOS is also the OS we use in our automated testing and our HoloPorts.

The main components of the tooling for Holochain development are:

* The [Rust](https://holochain.love) programming language
* [NodeJS](https://holochain.love) and [npm](https://holochain.love)
* Cryptographic libraries
* Common automations and scripts

It is important that these remain consistent across compatible apps and the Holochain Core.

The Holonix repository tracks standard, shared dependencies for all of the scenarios in which we use NixOS. Typically you won’t need to interact with Holonix directly.

The main Nix tool used in Holochain development workflows is <code>nix-shell</code>, a managed Bash shell that overlays a new environment and set of tools on top of your existing environment.

Many popular package management tools only target a single OS. NixOS package management supports most OSes.

The full suite of Nix tooling is broad and deep. There’s even a dedicated OS and functional programming language. Learn more with the [NixOS Wiki](https://nixos.wiki/wiki/Main_Page) or the [Pills](https://nixos.org/nixos/nix-pills/) Tutorial. The community IRC chat at <code>#nixos</code> on freenode is active and helpful.

## nix-shell

While working on Holochain, you will usually have an active <code>nix-shell</code> to run commands. All the extra dependencies and environment variables will be cleaned up automatically when you close the shell.

<code>nix-shell</code> will give you the latest releases every time you enter it. Nix is configured by <code>default.nix</code> files; these set all dependencies and variables that are added to your terminal.

You can extend the master <code>default.nix</code> file or use it directly from [https://holochain.love](https://holochain.love). Opening a shell from holochain.love downloads updates automatically. The initial run will take some time to download and build. It gets much faster on subsequent runs.

<code>nix-shell</code> cleans up everything it added when you exit. You need to re-enter the shell each time you want to work.

> Note: The files are cached locally on your machine, so they will not be re-downloaded or rebuilt the next time you enter the shell.
