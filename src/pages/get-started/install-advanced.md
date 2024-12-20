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

[Flakes](https://wiki.nixos.org/wiki/Flakes) is an experimental but well-supported feature of the Nix package manager that makes it easier to manage dependencies consistently. [Enable flakes on your system.](https://wiki.nixos.org/wiki/Flakes#Enable_flakes_temporarily)

### Entering an ad-hoc shell

The flake-based one-liner to get you an ad-hoc Holonix shell (that is, not using a local flake file) looks like this:

```shell
nix develop github:holochain/holonix?ref=main-0.4
```

#### Specifying a certain release

The above one-liner will give you the latest **recommended** version of Holochain from the 0.4 release branch. To get an ad-hoc shell with a specific version of Holochain, change the `ref` parameter. For example, if you want to enter a Holochain 0.4 development shell, run:

```shell
nix develop github:holochain/holonix?ref=main-0.3
```

The options you should know about are:

* `main` or no `ref` parameter: The development version of Holochain, released weekly with no guarantee of stability (currently 0.5)
* `main-0.4`: The current recommended version of Holochain for everyday development
* `main-0.3`: The previous version of Holochain, which still receives maintenance releases

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

::: output-block
```text
hc-scaffold     : holochain_scaffolding_cli 0.4000.0 (cda8433)
hc-launch       : holochain_cli_launch 0.400.0 (holochain 0.4.0) (ca59803)
Lair keystore   : lair_keystore 0.5.3 (e829375)
Holo dev server : not installed
Holochain       : holochain 0.4.0 (f931190)

Holochain build info: {
  "git_info": null,
  "cargo_pkg_version": "0.4.0",
  "hdk_version_req": "0.4.0",
  "hdi_version_req": "0.5.0",
  "lair_keystore_version_req": "0.5.3",
  "timestamp": "2024-12-18T19:25:03.915833743Z",
  "hostname": "localhost",
  "host": "x86_64-unknown-linux-gnu",
  "target": "x86_64-unknown-linux-gnu",
  "rustc_version": "rustc 1.80.0 (051478957 2024-07-21)",
  "rustflags": "",
  "profile": "release"
}
```
:::

Another Holochain command that inspects the platform information and outputs the compatible HDK version is

```shell
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

## More info on Nix

The main Nix tool used in Holochain development workflows is `nix develop`, a program that overlays a new Bash environment and set of tools on top of your existing shell environment.

The full suite of Nix tooling is broad and deep. There's even a dedicated programming language, called [Nix expressions](https://nixos.org/manual/nix/stable/#functional-package-language). Learn more with the [NixOS Wiki](https://nixos.wiki) or the [Pills](https://nixos.org/nixos/nix-pills/) Tutorial. The [NixOS community chat on matrix.to](https://matrix.to/#/#community:nixos.org) is active and helpful.

## Fixing the SUID sandbox error in Ubuntu 24.04 and later

Ubuntu 24.04 [introduced an AppArmor security policy](https://discourse.ubuntu.com/t/ubuntu-24-04-lts-noble-numbat-release-notes/39890#unprivileged-user-namespace-restrictions-15) that causes `hc spin`, which is used to test applications and their UIs, to fail with a fatal error. If you have a `package.json` that lists `@holochain/hc-spin` as a dev dependency, you may see this error message:

::: output-block
```
[FATAL:setuid_sandbox_host.cc(158)] The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now. You need to make sure that <path_to_your_application_project>/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755.
```
:::

You can fix the issue by entering the following command in your project's root directory:

```shell
sudo chown root:root node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

You'll have to do this for every hApp project that uses `@holochain/hc-spin`.

There are other fixes [outlined in the Ubuntu 24.04 release notes](https://discourse.ubuntu.com/t/ubuntu-24-04-lts-noble-numbat-release-notes/39890#unprivileged-user-namespace-restrictions-15) that can solve the problem; if you'd like to learn more, read through them all and choose the one that feels most appropriate for you.

### Redistributable applications created with [`holochain-kangaroo-electron`](https://github.com/holochain-apps/holochain-kangaroo-electron) are also affected

Because the template repo `holochain-kangaroo-electron` also bundles Electron's chrome-sandbox in the binary that you'd distribute, your users will see the same error message when they try to run your application if you've used this repo. We're still researching the best solution, but since Ubuntu is recommending it, we recommend applying the first solution in the release notes, which involves creating an AppArmor profile for your app. This profile could then be distributed and installed alongside it. (Note: this won't work with portable application packages that aren't installed as root, such as `AppImage`s.)

## Opening your hApp's GUI in Ubuntu on WSL2 (Windows Subsystem for Linux) {#opening-your-happs-gui-in-ubuntu-on-wsl2}

There are two dev tools, `hc spin` and `hc launch`, which start your app's back end and open its GUI in [Electron](https://www.electronjs.org/) or [Tauri](https://tauri.app/) webview containers, respectively. Because the Ubuntu OS installed from the Microsoft Store doesn't come with GUI packages by default, you'll need to install just a few in order to get these tools to work.

If you're only using `hc launch`, which uses the Tauri webview, install this package, which resolves a GDK error about cursors:

```shell
sudo apt install -y adwaita-icon-theme
```

If you're only using the more modern `hc spin`, which uses the Electron webview, install these missing packages that are needed by the `chrome-sandbox` binary:

```shell
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-dev libasound2t64
```