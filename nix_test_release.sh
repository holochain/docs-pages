#!/bin/bash
nix-shell https://github.com/holochain/holonix/archive/${RELEASE_VERSION_ENV}.tar.gz --run './run_all_release_tests.sh' 
