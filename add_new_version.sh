#!/bin/bash

BRANCH_TAG=$1
export HC_VERSION=$2

# clone the repo and build the guidebook and api reference
./build_docs.sh $BRANCH_TAG $HC_VERSION
# add the new version to the list of versions in JSON files
node add_version_to_json.js $HC_VERSION $HC_VERSION
# rebuild the HTML files according to the environment variables and JSON files :)
./regenerate_html_bin
