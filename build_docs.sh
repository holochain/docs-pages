#!/bin/bash

BRANCH=$1
FOLDER=$2

rm -rf holochain-rust
git clone --depth 1 --branch $BRANCH https://github.com/holochain/holochain-rust.git

# api reference
rm -rf api/$FOLDER
mkdir api/$FOLDER
cargo doc --no-deps --manifest-path holochain-rust/Cargo.toml --target-dir api/$FOLDER
rm -rf api/$FOLDER/debug
mv -v api/$FOLDER/doc/* api/$FOLDER/
rm -rf api/$FOLDER/doc
rm api/.rustc_info.json

# guidebook
rm -rf guide/$FOLDER
mkdir guide/$FOLDER
mdbook build holochain-rust/doc/holochain_101 --dest-dir ../../../guide/$FOLDER