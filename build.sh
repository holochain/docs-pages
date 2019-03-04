#!/bin/bash

# TODO allow passing in version number, commit, etc as an argument
git clone https://github.com/holochain/holochain-rust.git
cd holochain-rust
SHA="$(git rev-parse HEAD)"
cd ..

# latest api reference
rm -rf api/latest
mkdir api/latest
cargo doc --no-deps --manifest-path holochain-rust/Cargo.toml --target-dir api/latest
rm -rf api/latest/debug
mv -v api/latest/doc/* api/latest/
rm -rf api/latest/doc
rm api/.rustc_info.json

# latest guidebook
rm -rf guide/latest
mkdir guide/latest
mdbook build holochain-rust/doc/holochain_101 --dest-dir ../../../guide/latest

rm -rf holochain-rust

if [ [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == 'master' ] ]; then
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"

    git add .
    git commit -m "update to docs for ${SHA}"

    git remote add origin-pages https://${GH_TOKEN}@github.com/holochain/docs-pages.git > /dev/null 2>&1
    git push --quiet --set-upstream origin-pages master
fi