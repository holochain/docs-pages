#!/bin/bash
NIX=$(./nix.sh) &&
PAT='hc [[:digit:]\.]{6}-alpha[[:digit:]]{1,2}[[:space:]]holochain [[:digit:]\.]{6}-alpha[[:digit:]]{1,2}' &&
if [[ $NIX =~ $PAT ]]; then
    echo "nix OK"
else
    echo "nix command failed"
    echo ${NIX}
    exit 1
fi
