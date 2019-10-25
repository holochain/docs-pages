#!/bin/bash

CONCEPT=$1
CC_PATH=$2

[ -z "$CONCEPT" ] && echo "first argument must be core concept name eg. hello_holo" && exit 1

if [ ! $CC_PATH ]; then
  hc init
  CC_PATH=cc_tuts
fi

single_source code coreconcepts/tutorials/$CONCEPT.md ${CC_PATH}zomes/hello/code/src/lib.rs rust
single_source code coreconcepts/tutorials/$CONCEPT.md ${CC_PATH}test/index.js javascript test

