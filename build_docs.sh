#!/bin/bash

BRANCH = $1

git clone --branch $BRANCH https://github.com/holochain/holochain-rust.git

# api reference
rm -rf api/$BRANCH
mkdir api/$BRANCH
cargo doc --no-deps --manifest-path holochain-rust/Cargo.toml --target-dir api/$BRANCH
rm -rf api/$BRANCH/debug
mv -v api/$BRANCH/doc/* api/$BRANCH/
rm -rf api/$BRANCH/doc
rm api/.rustc_info.json

# guidebook
rm -rf guide/$BRANCH
mkdir guide/$BRANCH
mdbook build holochain-rust/doc/holochain_101 --dest-dir ../../../guide/$BRANCH

rm -rf holochain-rust