# Docs pages

The static html files, Guidebook, and the API references, are all built from other source files and templates.

The Guidebook source files are [here](https://github.com/holochain/holochain-rust/tree/develop/doc/holochain_101/src).
The API Reference source files are the [source code](https://github.com/holochain/holochain-rust) of course.

## Developing

In order to develop any changes to the main pages, you will need to modify the template files, and rebuild the HTML from those templates.

The templates for `/start.html`, `/index.html`, `/api/index.html`, and `/guide/index.html` are [here](./src/src).
These also draw from files containing version information, [api_versions.json](./api_versions.json) and [guide_versions.json](./guide_versions.json), to generate the /api/index.html and /guide/index.html.

You will want to have two terminals open:
1. for running a simple web server
2. for rebuilding the HTML after making changes

For 1, you can skip to the [Local serving](#local-serving) section, and use any of the options it outlines.

For 2: open a terminal @ docs-pages.

**Prerequisite**
- Rust
- Make sure that the environment variable `HC_VERSION` is set, do this by running `export HC_VERSION=0.0.24-alpha2` or whatever tag you want to highlight in links as the latest released version.

Run the following, after you make changes to any of the templates:
```shell
./rebuild_html.sh
```


## Updating and Adding Versions

**Prerequisites**
- Rust and cargo
- nodejs

These prerequisites can be easily met by utilizing the nix-shell from the [holochain-rust](https://github.com/holochain/holochain-rust) repository. 

You will also need the `mdbook` command, which is used to build the Guide book. For that, run:
```shell
cargo install --version 0.2.2 mdbook
```

### Rebuilding "latest"/develop branch Guide and API Ref

To rebuild the `latest` versions of the guidebook and api reference, which is the `develop` branch of holochain-rust, run
```shell
./build_docs.sh develop latest
```
> The first argument is the branch/tag, the second is the folder name to put it in.

### Adding a New Version

To add a new version, run something like (making the appropriate changes)
```shell
./add_new_version.sh v0.0.11-alpha1 0.0.11-alpha1
```
> The first argument is exactly the git tag of the version, and the second is the git tag without the `v` prefix. _Note:_ As of v0.0.24, we dropped the `v` prefix in the release tag. Check the [current tag formatting practice](https://github.com/holochain/holochain-rust/releases) first.


## Local serving

### NixOS

`nix-shell --run docs-serve`

### Python

`python -m SimpleHTTPServer`

Then open the site at [localhost:8000](http://localhost:8000).
