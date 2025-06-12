---
title: "hApps"
---

::: intro
A **hApp** (short for 'Holochain application') is a package for distributing a full application. It bundles of one or more [**DNAs**](/build/dnas/), along with an optional web-based user interface.
:::

## hApps: delivering a full package of functionality

As we described in [Application Structure](/build/application-structure/#happ), a hApp is like a collection of microservices, each microservice's role being filled by a DNA. A DNA may or may not be able to run independent from other DNAs, but a hApp should be able to be installed on a user's computer and give them a fully working experience.

## Create a hApp {#create-a-happ}

The [scaffolding tool](/get-started/3-forum-app-tutorial/) is the easiest way to build out a full hApp with multiple DNAs and an optional GUI. Once you've [got the Holochain dev shell working](/get-started/), open a terminal and enter this command:

<!-- TODO(upgrade): change following version numbers -->

```bash
nix run "github:/holochain/holonix?ref=main-0.5#hc-scaffold" -- web-app movies_happ
```

The tool will guide you through every step, from creating a bare working folder to creating individual [data types and CRUD functions](/build/working-with-data/).

If you want to create your own project structure, enter this command in a dev shell:

```bash
hc app init movies_happ
```

This will prompt you for a name and description for your new hApp, then creates a folder called `movies_happ` that contains a basic `happ.yaml` file from your responses to the prompts.

### Specify a hApp manifest

A hApp manifest is written in [YAML](https://yaml.org/). It contains metadata about the hApp, along with a list of roles filled by DNAs.

If you want to write your own, name it `happ.yaml` and give it the following structure. This example assumes that all of your [bundled DNAs](/build/dnas/#bundle-a-dna) are in a folder called `dnas/`.

```yaml
manifest_version: '1'
name: movies_happ
description: A movie encyclopedia and mutual lending application
roles:
- name: movies
  provisioning:
    strategy: create
    deferred: false
  dna:
    bundled: ./dnas/movies/movies.dna
    modifiers:
      network_seed: null
      properties: null
    installed_hash: null
    clone_limit: 0
- name: lending
  provisioning:
    strategy: create
    deferred: false
  dna:
    bundled: ./dnas/lending/lending.dna
    modifiers:
      network_seed: null
      properties: null
    installed_hash: null
    # The maximum number of clones, which is u32::MAX
    clone_limit: 4_294_967_295
allow_deferred_memproofs: false
```

#### hApp manifest structure at a glance

* `name`: A string for humans to read. This might get used in the admin panel of Holochain [conductors](/concepts/2_application_architecture/#conductor) like [Holochain Launcher](https://github.com/holochain/launcher) or [Moss](https://theweave.social/moss/).
* `description`: A long description of the hApp for conductors to display.
* `roles`: The roles to be filled by DNAs. Think of each role as a microservice that may have multiple instances.
    * `name`: The name the role will be referred to in back-end and front-end code when its DNA's functions are being called
    * `provisioning`: The way cells are provisioned from the DNA that fills this role. Currently the only provisioning strategy is

        ```yaml
        strategy: create
        deferred: false
        ```

        Which creates a cell from the DNA immediately on hApp activation.
    * `dna`: The DNA that fills the role.
        * Location: The place to find the DNA bundle. The three options are:
            * `bundled`: Expect the file to be part of this [bundle](#package-a-happ-for-distribution). The value is a path relative to the manifest file.
            * `path`: Get the file from the local filesystem. The value is a filesystem path.
            * `url`: Get the file from the web. The value is a URL, of course.
        * `modifiers`: Optional [integrity modifiers](/build/dnas/#integrity-section) that change the DNA hash at install time.
        * `installed_hash`: The expected hash of the DNA at the specified location. If it doesn't match the actual installed hash, hApp installation will fail.
        * `clone_limit`: The number of **clone cells** that can be created from the DNA in this role. {#clone-limit}
* `allow_deferred_memproofs`: If true, this hApp will be kept in a disabled state until **membrane proofs** are provided for its cells. This is an advanced topic which we'll write about in the future, <!-- TODO: write about deferred memproofs https://github.com/holochain/docs-pages/issues/579 --> and this can be left `false` for most hApps.

## Create a web hApp

Most Holochain runtimes can serve a web-based GUI along with your hApp. You can design your front end any way you like, but it must have an `index.html` file and be packaged as a `.zip` file.

As usual, the scaffolding tool can handle this for you, and will build components for your entries, links, and collections using React, Svelte, Lit, Vue, or plain JavaScript. If you want to create your own folder structure, though, you can use the `hc` command. In a dev shell, enter:

```bash
hc web-app init movies_webhapp/
```

It'll prompt you for a name, then create a folder with a `web-happ.yaml`.

### Specify a web hApp manifest

If you want to write your own manifest, name it `web-happ.yaml` and give it the following structure.

```yaml
manifest_version: '1'
name: movies_webhapp
ui:
  bundled: ./ui/ui.zip
happ_manifest:
  bundled: ./happ/movies_happ.happ
```

#### Web hApp manifest structure at a glance

* `name`: A human-readable name.
* `ui`: The location of the UI zip file. You can use `bundled`, `path`, or `url`, just like you can with DNAs.
* `happ-manifest`: The location of the hApp back end.

## Package a hApp for distribution {#package-a-happ-for-distribution}

The first step to distributing your hApp is to bundle it into a `.happ` file, then bundle that file and a GUI into a `.webhapp` file. After that, you can go on to packaging it as a standalone binary or distributing it for runtimes that support multiple hApps.

To roll a hApp manifest and all its DNAs into a **hApp bundle**, use the `hc` command on a folder that contains a `happ.yaml` file:

```bash
hc app pack movies_happ/
```

This will create a file in the same folder as the `happ.yaml`, called `<name>.happ`, where `<name>` comes from the `name` field at the top of the manifest.

The next step, if you have a GUI, is to package the `.happ` file into a `.webhapp`:

```bash
hc web-app pack movies_webhapp/
```

### Distributing for Holochain runtimes that support `.hApp` bundles

Your hApp is now ready to be distributed to people who run [Holochain Launcher](https://github.com/holochain/launcher). If you turn on developer mode in the launcher's settings, you can upload the bundle to the devHub and publish it on the hApp store. You can also offer it on the web for download and manual installation.

### As a standalone binary

If you want to package a hApp as a standalone binary, along with the Holochain core library, you've got two options.

* If you would like to use Electron and **only need to support Windows, macOS, and Linux**, the [`holochain/kangaroo-electron`](https://github.com/holochain/kangaroo-electron/) repo gives you a template to get started. Read the repo's readme for instructions.
* If you **also need to support Android** along with the desktop OSes, darksoil studio's [p2p Shipyard](https://darksoil.studio/p2p-shipyard/) tool packages your web hApp into cross-platform binaries. (Note that p2p Shipyard is currently 'source-available' and they're raising funds to open-source it and cover development costs.)

## Reference

* [`holochain_types::app::AppManifestCurrent`](https://docs.rs/holochain_types/latest/holochain_types/app/struct.AppManifestCurrent.html), the underlying type that the hApp manifest gets parsed into. It has a lot of good documentation on the manifest format.
* [`holochain_types::app:WebAppManifestCurrent`](https://docs.rs/holochain_types/latest/holochain_types/web_app/struct.WebAppManifestCurrent.html), for the web app manifest format.

## Further reading

* [Core Concepts: Application Architecture](/concepts/2_application_architecture/)
* [Build Guide: DNAs](/build/dnas/)
* [Build Guide: Zomes](/build/zomes/)