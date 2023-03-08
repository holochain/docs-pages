---
title: Dev Tools Setup
hide:
  - toc
---

::: coreconcepts-intro
This guide assumes that you've already followed the [quick installation guide](/quick-start/) and want to learn more about the set up. It describes how to manually recreate and maintain the development environment, use your default shell and preferred code editor with Nix, explains how to install specific versions of Holochain, and discusses why we use `nix develop` in the first place.
:::

## Holonix - the Holochain app development environment

Each Holochain application repository will contain its own setup of the development environment.
If you use the scaffolding to generate the project structure, this will already be taken care of in the scaffolded directory.

If you want to learn more about how this setup works and how to create it manually and how to maintain it, please find all the information below.


### Holonix' usage of [Nix' Flakes](https://nixos.wiki/wiki/Flakes) features

As of [holochain#1863](https://github.com/holochain/holochain/pull/1863) Holonix is implemented as Holochain's [flake.nix](https://github.com/holochain/holochain/blob/develop/flake.nix) output named _#holonix_ a.k.a. _devShells.${system}.holonix_.

The flake-based one-liner to get you an ad-hoc Holonix shell looks like this:

```shell
nix develop github:holochain/holochain#holonix
```
#### Enabling Flake features on your system

At the time of writing, flakes are still considered an experimental in the nix world and thus require being enabled. This happens either ad-hoc on the command itself or permanently via Nix's configuration.

If you've completed the [quick installation guide](/quick-start/), including the scaffolding example, then you'll likely already had the scaffolding configure it for you via the file at _~/.config/nix/nix.conf_.

To manually configure it via this file you can run the following commands:

```shell
mkdir -p ~/.config/nix
echo "extra-experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

To learn more, please see the [Enable flakes section on the NixOS Wiki](https://nixos.wiki/wiki/Flakes#Enable_flakes).

### The anatomy of a `flake.nix`

In the root directory of your app's code, you will either find the scaffolded one, or you can manually create the `flake.nix` file. Here's an example `flake.nix` that is inspired by the scaffolding template:

```nix
{
  description = "Flake for Holochain app development";

  inputs = {
    holochain-flake = {
      url = "github:holochain/holochain";
      inputs.versions.url = "github:holochain/holochain?dir=versions/0_1";
    };

    nixpkgs.follows = "holochain-flake/nixpkgs";
  };

  outputs = inputs @ { ... }:
    inputs.holochain-flake.inputs.flake-parts.lib.mkFlake { inherit inputs; }
    {
        systems = builtins.attrNames inputs.holochain-flake.devShells;
        perSystem = { config, pkgs, system, ... }: {
            devShells.default = pkgs.mkShell {
                inputsFrom = [
                    inputs.holochain-flake.devShells.${system}.holonix
                ];
                packages = [
                    pkgs.nodejs-18_x
                ];
            };
        };
    };
}
```

In principle a flake implements a function that produces a set of _outputs_ from a given set of _inputs_, keeping the side-effects to an absolute minimum if not at zero.

#### `inputs`
This flake declares one input named `holochain-flake` that the Holochain Github repository. This input will look for a `flake.nix` in the default branch of the remote repository.
The `versions` input of the `holochain-flake` input is explicitly specified to track the _0_1_ series, which refers to Holochain's Beta 0.1 and its compatible tools.

The flake follows (think inherits) the `nixpkgs` input of the `holochain-flake` input. This ensures that your development environment passes all the same buildinputs to the component packages, giving you very high chances to make use of our Cachix binary cache.

#### `outputs`
In the `outputs` set, this flake composes a devShell that inherits its inputs from the `holonix` devShell and adds the NodeJS package.
To find the names of the packages you're interested in, the [nixos.org package search](https://search.nixos.org/packages?channel=unstable&) can be used.

### `flake.lock` file

Once the `flake.nix` is created (and added to the git repo), the lockfile can be initiliazed by running `nix flake udpate`.
The resulting `flake.lock` records pinned references to all the `inputs` at the given point in time, in our case to the the `holochain-flake` and of all its inputs transitively; altogether keeping track of all the dependencies of your app's development environment.

### A Gotcha with Flakes and Git

The behavior of `nix` commands that rely on a `flake.nix` as its input such as `nix develop` can be counterintuitive in a git repository.

Specifically, if the `flake.nix` is not tracked in git, the command will fail altogether with a message that it cannot find a `flake.nix` file. Even though by design, this is a [known UX issue in Nix](https://github.com/NixOS/nix/issues/6642).

The simple solution to is to `git add flake.*` after your initial creation of your flake if you manually create a repository. In case of scaffolding a repository this is taken care of by the scaffolding process for you.

#### Updating the component versions

Each time the following command is run, it looks up the most recent revisions of the inputs and locks them in the `flake.lock` file.

```
$ nix flake update
```

If you want to only update a specific input, you can use the following command. Here it shows updating only the _holochain_ input:

```shell
$ nix flake lock --update-input holochain
```

_Note that if your directory is a git repository it is recommended to `git commit flake.lock` to ensure consistency between the development environment and your app's source code._


### Holonix inspection commands

Built into Holochain and holonix are a few commands that give insight about versions of Holochain components.

```shell
hn-introspect
```

This command displays versioning information about Holochain's main components. The output looks like this:

```shell
$ hn-introspect
holochain (holochain 0.1.3): ed5b7bb461c2a8bfd4d2633bad604a20b8f2da03
lair-keystore (lair_keystore 0.2.3): cbfbefefe43073904a914c8181a450209a74167b
hc-launch (holochain_cli_launch 0.0.11): 3bcd14e81cda07e015071b070c2ef032aa1d1193
hc-scaffold (holochain_scaffolding_cli 0.1.6): 0d84d09a9a3f41d3b7d7330a0797a789c42fd57f
```

Another Holochain command that inspects the platform information and outputs the compatible HDK version is

```bash
holochain --build-info
```

A sample output of this command looks like this (JSON formatted using `jq` i.e. `holochain --build-info | jq .`):

```json
{
  "git_info": null,
  "cargo_pkg_version": "0.1.3",
  "hdk_version_req": "0.1.1",
  "hdi_version_req": "0.2.1",
  "timestamp": "2023-02-09T13:16:50.812160339Z",
  "hostname": "localhost",
  "host": "x86_64-unknown-linux-gnu",
  "target": "x86_64-unknown-linux-gnu",
  "rustc_version": "rustc 1.66.1 (90743e729 2023-01-10)",
  "rustflags": "",
  "profile": "release"
}
```

### Using a specific version of the development tools

Here's an example of how to override the inputs of the flake to pick a different version of the `holochain` component, which includes the `holochain` conductor binary and the `hc` CLI tool:

```nix
inputs = {
    holochain-flake = {
      url = "github:holochain/holochain";
      inputs.versions.url = "github:holochain/holochain?dir=versions/0_1";
      inputs.holochain.url = "github:holochain/holochain/<whichever-git-branch-tag-or-commit>";
    };
...
```

You can override the versions of four different Holochain components: `holochain`, `lair`, `launcher`, and `scaffolding`. The `inputs.versions.url` field points to a file in the `holochain/holochain` GitHub repo containing versions of each of these, which are known to be mutually compatible. As you can see in the snippet above, the URLs of any of those components can be overridden. Take a look at the [versions file](https://github.com/holochain/holochain/blob/develop/versions/0_1/flake.nix) for an example of how we specify their URLs using Git tags.

_Note that by specifying custom component URLs, you will probably get a binary cache miss when entering the shell, and it will have to compile the custom component versions ad-hoc._

### Using your default `$SHELL`

Many developers have their shell set up just the way they like it, whether a custom-formatted prompt or a completely different shell such as `zsh` and `fish`. If you don't want Holonix to clobber your carefully-crafted environment, try adding `--command $SHELL` to the end of your `nix develop` command:

```shell
nix develop github:holochain/holochain#holonix --command "$SHELL"
```

### Using your favorite text editor or IDE

In most cases you can run your editor as you normally would. However, if you are using a text editor or integrated development environment (IDE) that needs to communicate with the Rust compiler for real-time syntax checks, then you should launch it from inside the `nix develop`. This is because Holonix comes with its own version of Rust that might be different from what you may already have installed.

To do this, just open your editor from the command line while you are in the `nix develop` (this example uses Vim):

```shell
nix develop github:holochain/holochain#holonix
cd my_project
vim my_file.rs
```

## More info on Nix

We use the Nix/NixOS toolkit to build consistent development, testing, and deployment environments for Holochain Core and apps. It consists of two systems:

* NixOS, a tool for reliably building Linux-based systems from a set of configuration files (we use NixOS in our HoloPorts and automated testing VMs)
* Nix, a package manager that works on many OSes and uses the same configuration file format as NixOS

The main components of the tooling for Holochain development are:

* The [Rust](https://rust-lang.org) programming language
* [Node.JS](https://nodejs.org) and [npm](https://npmjs.com)
* Cryptographic libraries
* Common automations and scripts

It is important that these remain consistent, so you can get your work done without fighting package and compiler issues. And when it comes time to compile and distribute your application, it's **very important to have a deterministic build system** so the same DNA source code always results in the same hash.

The main Nix tool used in Holochain development workflows is `nix develop`, a program that overlays a new Bash environment and set of tools on top of your existing shell environment.

The full suite of Nix tooling is broad and deep. There’s even a dedicated programming language, called [Nix expressions](https://nixos.org/manual/nix/stable/#functional-package-language). Learn more with the [NixOS Wiki](https://nixos.wiki) or the [Pills](https://nixos.org/nixos/nix-pills/) Tutorial. The [NixOS community chat on matrix.to](https://matrix.to/#/#community:nixos.org) is aactive and helpful.

### `nix develop`

While working on Holochain, you will usually have an active `nix develop` to run commands. This shell overlays Holochain-specific configuration on top of your existing shell - environment variables, Rust toolchains, binaries, libraries, and development tools - giving you a consistent development environment to build Holochain apps. The shell environment is only set up in the current shell session, and will be reset automatically when you `exit` the shell.

If you want to re-enter the shell to do more work, or create multiple terminals to work in, you'll need to re-enter the `nix develop` in each new instance. The packages are cached locally on your machine, so they will be ready the next time you enter the shell. You do need to get the package configuration files from somewhere, though. If you use the Holochain repo cloning method, they're cached on your machine too, but the ['quick install'](/quick-start/) and ['using a specific version'](#using-a-specific-version-of-the-development-tools) methods require an internet connection every time you want to enter the shell.

## Uninstalling Nix

You usually don't need to uninstall anything, because `nix develop` leaves your familiar user environment alone and makes all of its own changes disappear once you exit the shell. But it does keep binaries and other packages on your device. On macOS it adds users and a user group too. If you want to free up some space, run these commands:

```bash
nix-collect-garbage -d
```

If you want to uninstall Nix as well, run these commands (you might need root privileges for the first line):

```bash
rm -rf /nix
rm ~/.nix-profile
```
[Detailed uninstallation instructions for macOS](https://gist.github.com/chriselsner/3ebe962a4c4bd1f14d39897fc5619732#uninstalling-nix)
