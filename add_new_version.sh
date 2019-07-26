#!/bin/bash

export HC_VERSION=$1

# clone the repo and build the guidebook and api reference
./build_docs.sh $HC_VERSION
# add the new version to the list of versions in JSON files
node add_version_to_json.js $HC_VERSION $HC_VERSION
# rebuild the HTML files according to the environment variables and JSON files :)
./regenerate_html_bin