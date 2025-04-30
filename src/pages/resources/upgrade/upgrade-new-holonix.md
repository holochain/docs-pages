---
title: Upgrade to the new Holonix
---

::: intro
In the third quarter of 2024, we released a new [Holonix](/get-started/install-advanced/#holonix-the-holochain-app-development-environment), our development environment based on [Nix](https://nixos.org) that gives you all the dependencies to build hApps.

The new Holonix is simpler and more modular, which means that it's easier to configure it for your needs and preferences.
:::

## Upgrade an existing project

The previous and the new Holonix distributions are both based on Nix's [flakes](https://wiki.nixos.org/wiki/Flakes) feature. Fortunately, this means it's easy to upgrade. First back up and remove your project's existing flake files:

```bash
mv flake.nix flake.nix.backup
mv flake.lock flake.lock.backup
```

Then create a new flake file:

```bash
nix flake init -t github:holochain/holonix?ref=main-0.4
```

For most projects, that's all you need! If you have specific needs, such as targeting a specific Holochain version or release series, specifying build flags, or adding more Nix packages, read the [Holonix readme](https://github.com/holochain/holonix/tree/main/README.md).