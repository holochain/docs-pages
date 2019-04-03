[![Build Status](https://travis-ci.com/holochain/docs-pages.svg?branch=master)](https://travis-ci.com/holochain/docs-pages)

# Docs pages

The static html files, Guidebook, and the API references, are all built.

The templates for `/start.html`, `/index.html`, `/api/index.html`, and `/guide/index.html` are [here](./src/src).
These also draw from files containing version information, [api_versions.json](./api_versions.json) and [guide_versions.json](./guide_versions.json), to generate the /api/index.html and /guide/index.html.
[regenerate_html.sh](./regenerate_html.sh) is the script used (Mac only at this moment) to regenerate those files, based on the data (environment variables and json files) available to it at the time.

The Guidebook source files are [here](https://github.com/holochain/holochain-rust/tree/develop/doc/holochain_101/src).
The API Reference source files are the [source code](https://github.com/holochain/holochain-rust) of course.

## Local serving

### NixOS

`nix-shell --run docs-serve`
