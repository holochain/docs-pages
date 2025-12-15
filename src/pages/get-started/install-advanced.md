---
title: Setup with Nix flakes
hide:
  - toc
---

::: intro
This guide assumes that you've already followed the [quick installation guide](/get-started/) and want to learn more about the development environment.
:::

## Holonix - the Holochain app development environment

Each Holochain application repository will contain its own setup of the development environment.
If you use the scaffolding to generate the project structure, this will already be taken care of in the scaffolded directory.

If you want to learn more about how this setup works and how to create it manually and how to maintain it, please find all the information below.

### Holonix's usage of Nix's flake feature

[Flakes](https://wiki.nixos.org/wiki/Flakes) is an experimental but well-supported feature of the Nix package manager that makes it easier to manage dependencies consistently. [Enable flakes on your system.](https://wiki.nixos.org/wiki/Flakes#Enabling_flakes_temporarily)

### Entering an ad-hoc shell

The flake-based one-liner to get you an ad-hoc Holonix shell (that is, not using a local flake file) looks like this:

<!-- TODO(upgrade): change following version number -->

```shell
nix develop "github:holochain/holonix?ref=main-0.6"
```

#### Specifying a certain release

<!-- TODO(upgrade): change following version numbers -->

The above one-liner will give you the latest **recommended** version of Holochain from the 0.5 release branch. To get an ad-hoc shell with a specific version of Holochain, change the `ref` parameter. For example, if you want to enter a Holochain 0.4 development shell, run:

```shell
nix develop "github:holochain/holonix?ref=main-0.5"
```

The options you should know about are:

* `main` or no `ref` parameter: The development version of Holochain, released weekly with no guarantee of stability (currently 0.6)
* `main-0.5`: The current recommended version of Holochain for everyday development
* `main-0.4`: The previous version of Holochain, which still receives maintenance releases

### Customizing the Holochain binary

If you want to enable or disable certain Holochain features, such as unstable features, it's best to do this in a local flake file. Read [Customized Holochain build](https://github.com/holochain/holonix?tab=readme-ov-file#customized-holochain-build) on the Holonix readme to find out how. Keep in mind that, because you'll be creating a custom Holochain binary, you won't be able to take advantage of the package cache, so it'll take a while to compile Holochain on your machine. The same will be true on CI, where you should consider setting up your own caching.

### A gotcha with Flakes and Git

The behavior of `nix` commands that rely on a `flake.nix` as its input such as `nix develop` can be counterintuitive in a git repository.

Specifically, if the `flake.nix` is not tracked in git, the command will fail altogether with a message that it cannot find a `flake.nix` file. Even though by design, this is a [known UX issue in Nix](https://github.com/NixOS/nix/issues/6642).

The simple solution to is to `git add flake.*` after your initial creation of your flake if you manually create a repository. In case of scaffolding a repository this is taken care of by the scaffolding process for you.

### Holonix inspection commands

Built into Holochain and holonix are a few commands that give insight about versions of Holochain components.

```shell
hn-introspect
```

This command displays versioning information about Holochain's main components. The output looks like this:

<!-- TODO(upgrade): change following version numbers -->

::: output-block
```text
hc-scaffold            : holochain_scaffolding_cli 0.600.0 (2d71d47)
Lair keystore          : lair_keystore 0.6.3 (8aa9ab1)
Kitsune2 bootstrap srv : kitsune2_bootstrap_srv 0.3.2 (22de6e4)
Holochain CLI          : holochain_cli 0.6.0 (a6d4e80)
Holochain terminal     : hcterm 0.6.0 (a6d4e80)
Holochain              : holochain 0.6.0 (a6d4e80)

Holochain build info: {
  "git_info": null,
  "cargo_pkg_version": "0.6.0",
  "hdk_version_req": "0.6.0",
  "hdi_version_req": "0.7.0",
  "lair_keystore_version_req": "0.6.3",
  "timestamp": "2025-11-19T15:33:04.246363130Z",
  "hostname": "localhost",
  "host": "x86_64-unknown-linux-gnu",
  "target": "x86_64-unknown-linux-gnu",
  "rustc_version": "rustc 1.88.0 (6b00bc388 2025-06-23)",
  "rustflags": "",
  "profile": "release"
}
```
:::

To get just the JSON build info from above, enter:

```shell
holochain --build-info
```

(Tip: piping the output to [`jq`](https://jqlang.org/), a command-line JSON processor, will format it and make it easier to read.)

### Reinstalling Holonix

If your installation didn't work or has become unusable, you'll need to do a couple things to get your system back to a clean state for reinstallation. Note that you should only do this if you're not using Nix for anything else.

1. Uninstall Nix by following the [**multi-user instructions** for your OS](https://nix.dev/manual/nix/2.32/installation/uninstall.html#multi-user).
2. Remove the folder `.config/nix` in your home folder.
3. [Follow the instructions in the Get Started Guide](/get-started/#2-3-set-up-development-environment).

### Repairing a corrupted `nix.conf` file

If you [ran the development environment setup script](/get-started/#2-3-set-up-development-environment) twice, or you've made manual modifications to your `~/.config/nix/nix.conf` file, running the script may corrupt that file. This is a known issue that we'll be fixing in the future. <!-- TODO: remove this when https://github.com/holochain/holochain/issues/5365 is resolved -->

To repair this, open up `~/.config/nix/nix.conf` in a text editor and look for the field `experimental-features`. It should only appear once, and in order for Holonix to work, it should at least contain these values (it's okay if it contains more):

```toml
experimental-features = nix-command flakes
```

### Installing on NixOS

To use Holonix on your NixOS system, you'll need to:

1. Enable the `nix-command` and `flakes` experimental features.
2. (Optional but strongly recommended) Add our Cachix server:
    1. Add `https://holochain-ci.cachix.org` to `nix.settings.substituters`.
    2. Add `holochain-ci.cachix.org-1:5IUSkZc0aoRS53rfkvH9Kid40NpyjwCMCzwRTXy+QN8=` to `nix.settings.trusted-public-keys`. <!-- cspell:ignore rfkv Npyjw -->

If you came here from the Quick Start Guide, you can continue on to the [Verify installation](/get-started/#2-4-verify-installation) step now.

## More info on Nix

The main Nix tool used in Holochain development workflows is `nix develop`, a program that overlays a new Bash environment and set of tools on top of your existing shell environment.

The full suite of Nix tooling is broad and deep. There's even a dedicated programming language, called [Nix expressions](https://nix.dev/manual/nix/stable/#functional-package-language). Learn more with the [NixOS Wiki](https://wiki.nixos.org/wiki/Main_Page) or the [Pills](https://nixos.org/nixos/nix-pills/) Tutorial. The [NixOS community chat on matrix.to](https://matrix.to/#/#community:nixos.org) is active and helpful.

## Fixing the SUID sandbox error in Ubuntu 24.04 and later

Ubuntu 24.04 [introduced an AppArmor security policy](https://discourse.ubuntu.com/t/ubuntu-24-04-lts-noble-numbat-release-notes/39890#p-99950-unprivileged-user-namespace-restrictions-15) that causes `hc-spin`, which is used to test applications and their UIs, to fail with a fatal error. If you try to run `hc-spin` (or `npm run start`/`npm run launch:happ` with a scaffolded hApp, which uses `hc-spin` under the hood), you may see this error message:

::: output-block
```
[FATAL:setuid_sandbox_host.cc(158)] The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now. You need to make sure that <path_to_your_application_project>/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755.
```
:::

You can fix the issue by entering the following command in your project's root directory:

```shell
sudo chown root:root node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

You'll have to do this for every hApp project that uses `hc-spin`.

There are other fixes [outlined in the Ubuntu 24.04 release notes](https://discourse.ubuntu.com/t/ubuntu-24-04-lts-noble-numbat-release-notes/39890#p-99950-unprivileged-user-namespace-restrictions-15) that can solve the problem; if you'd like to learn more, read through them all and choose the one that feels most appropriate for you.

### Redistributable applications created with [`holochain-kangaroo-electron`](https://github.com/holochain/kangaroo-electron) are also affected

Because the template repo `holochain-kangaroo-electron` also bundles Electron's chrome-sandbox in the binary that you'd distribute, your users will see the same error message when they try to run your application if you've used this repo. We're still researching the best solution, but since Ubuntu is recommending it, we recommend applying the first solution in the release notes, which involves creating an AppArmor profile for your app. This profile could then be distributed and installed alongside it. (Note: this won't work with portable application packages that aren't installed as root, such as `AppImage`s.)

## Opening your hApp's GUI in Ubuntu on WSL2 (Windows Subsystem for Linux) {#opening-your-happs-gui-in-ubuntu-on-wsl2}

There is one dev tool, `hc spin`, which starts your app's back end and opens its GUI in an [Electron](https://www.electronjs.org/) webview containers. Because the Ubuntu OS installed from the Microsoft Store doesn't come with GUI packages by default, you'll need to install just a few in order to get this tool to work:

```shell
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-dev libasound2t64
```