# Docs
This repo builds the documentation for developer.holochain.org.

## Local Development
To run the server locally use:

> This requires browser-sync `npm install -g browser-sync`.

```bash
./dev_build.sh
```
This will open a live reload server which is great for development. It will also build mkdocs and run single_source.
However the netlify redirects will not work so you will need to go to `http://localhost:9000/docs/` to see the site.

If you want to test netlify redirects you can run:

> This requires netlify cli `npm install netlify-cli -g`.

```bash
./dev_build_netlify.sh
```
But you will have to manually reload pages.
