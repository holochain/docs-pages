#!/bin/bash

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s - -y &&
source ~/.cargo/env &&
cargo install single_source &&
source ~/.cargo/bin/single_source