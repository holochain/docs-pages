[![Build Status](https://travis-ci.com/holochain/docs-pages.svg?branch=master)](https://travis-ci.com/holochain/docs-pages)

# Docs pages

The static html files, Guidebook, and the API references, are all built.

The templates for `/start.html`, `/index.html`, `/api/index.html`, and `/guide/index.html` are [here](./src/src).
These also draw from files containing version information, [api_versions.json](./api_versions.json) and [guide_versions.json](./guide_versions.json), to generate the /api/index.html and /guide/index.html.

The Guidebook source files are [here](https://github.com/holochain/holochain-rust/tree/develop/doc/holochain_101/src).
The API Reference source files are the [source code](https://github.com/holochain/holochain-rust) of course.

# Building the docs

To rebuild the `latest` versions of the guidebook and api reference, which is the `develop` branch of holochain-rust, run
```shell
./build_docs.sh develop latest
```
The first argument is the branch/tag, the second is the folder name to put it in.

> nodejs is a dependency for adding a new version

To add a new version, run something like (making the appropriate changes)
```shell
./add_new_version.sh v0.0.11-alpha1 0.0.11-alpha1 2019-01-24
```
The first argument is exactly the git tag of the version, the second is the git tag without the `v` prefix, and the third is the current nightly version of Rust.

> this is Mac only at the moment, unless you compile the code in `src` on a different platform, and overwrite the `regenerate_html_bin` file in this folder with the compiled binary.


## Local serving

### NixOS

`nix-shell --run docs-serve`
