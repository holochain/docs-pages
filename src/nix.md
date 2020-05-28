# More Info on Nix

We use the NixOS toolkit to build consistent development, testing, and deployment environments for Holochain Core and apps.

The Nix package manager runs on many operating systems. NixOS is also the OS we use in our automated testing and our HoloPorts.

The main components of the tooling for Holochain development are:

* The [Rust](https://rust-lang.org) programming language
* [Node.JS](https://nodejs.org) and [npm](https://npmjs.com)
* Cryptographic libraries
* Common automations and scripts

It is important that these remain consistent across compatible apps and the Holochain Core, so you can get your work done without fighting package and compiler issues.

The Holonix repository tracks standard, shared dependencies for all of the scenarios in which we use NixOS. Typically you won’t need to interact with Holonix directly; all you need to do is [install Nix](https://nixos.org/nix/download.html) and start Holonix using the quick install command `nix-shell https://holochain.love`.

The main Nix tool used in Holochain development workflows is `nix-shell`, a managed Bash shell that overlays a new environment and set of tools on top of your existing environment.

Many popular package management tools only target a single OS. Nix package management supports most OSes.

The full suite of Nix tooling is broad and deep. There’s even a dedicated OS and functional programming language. Learn more with the [NixOS Wiki](https://nixos.wiki/wiki/Main_Page) or the [Pills](https://nixos.org/nixos/nix-pills/) Tutorial. The community IRC chat at `#nixos` on freenode is active and helpful.

## nix-shell

While working on Holochain, you will usually have an active `nix-shell` to run commands. This shell overlays Holochain-specific configuration on top of your existing shell---environment variables, binaries, and libraries---giving you a consistent development environment to build Holochain apps. All this setup will be cleaned up automatically when you close the shell.

If you want to re-enter the shell to do more work, or create multiple terminals to work in, you'll need to re-enter the `nix-shell`. The files are cached locally on your machine, so they will not be re-downloaded or rebuilt the next time you enter the shell.

## Three ways to install and enter the Holonix environment

Nix is configured by `default.nix` files. Running the command

```bash
nix-shell <path_or_url_to_nix_config_file>
```

will configure the environment and enter the newly created shell for you. On the initial run, and any time a component has been updated, it will take some time to download and build. It gets much faster on subsequent runs.

### The 'blessed' release---always up-to-date with stable tools

Holochain development is moving fast, so we regularly make breaking changes, introduce testing and debugging plumbing, and discover bugs. If you want a reasonably stable environment, stick with the blessed releases. They've gone through automated and manual testing and are considered ready for day-to-day use (though with a level of stability that you can expect from an alpha release).

The website [https://holochain.love](https://holochain.love) always has the newest blessed `default.nix` file from the Holonix project, so all you need to do to install or update is enter your terminal and run:

```bash
nix-shell https://holochain.love
```

If we announce a new release and you would like to use it, remember to exit your nix-shell and re-enter it.

### Unblessed releases

If you need certain functionality sooner or just want to track the bleeding edge, you can use the `default.nix` file directly from the [Holonix repository](https://github.com/holochain/holonix). The `master` branch always contains the newest release of Holochain, whether blessed or unblessed. Here's how to use an unblessed release:

```bash
nix-shell https://github.com/holochain/holonix/archive/master.zip
```

If you want to install a specific version of Holochain or the developer tools, it's a bit more tricky. You'll need to know the specific Holonix release version number that contains your desired tooling, and enter this command:

```bash
nix-shell https://github.com/holochain/holonix/archive/release-<x.x.x>.tar.gz

### Per-project pinned releases

Every DNA project you create with `hc init` has its own `default.nix` file that targets the version of Holochain and the HDK that it was created with. To start `nix-shell` with that specific version, go into the project directory and type:

```bash
nix-shell
```