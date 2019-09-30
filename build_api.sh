#!/bin/bash

releases=$(<holochain-rust-releases.txt)
SAVEIFS=$IFS   # Save current IFS
IFS=$','      # Change IFS to new line
release_arr=($releases) # split to array $names
IFS=$SAVEIFS   # Restore IFS

n=0
for i in "${release_arr[@]}"
do
  if [ ! -d "build/api/$i" ]; then
    rm -fr holochain-rust
    git clone --depth 1 --branch $i https://github.com/holochain/holochain-rust.git
    cargo doc --no-deps --manifest-path holochain-rust/Cargo.toml --target-dir build/api/$i
    rm -rf build/api/$i/debug
    mv -v build/api/$i/doc/* build/api/$i/
    rm -rf build/api/$i/doc
    if [ "$n" -eq 0 ]; then
      rm -rf build/api/latest
      cp -r build/api/latest
    fi
    n=$((n+1))
  fi
done
