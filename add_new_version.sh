#!/bin/bash

export HC_VERSION=$1
export HC_VERSION_FOR_URL=$2
export HC_RUST_VERSION=$3

./build_docs $HC_VERSION
node add_version_to_json.js $HC_VERSION $HC_VERSION
./regenerate_html_bin