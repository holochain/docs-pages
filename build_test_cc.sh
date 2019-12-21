#!/bin/bash

CONCEPT=$1

[ -z "$CONCEPT" ] && echo "first argument must be core concept name eg. hello_holo" && exit 1

if [ ! -d "cc_tuts" ]; then
  hc init cc_tuts
  cd cc_tuts
  hc generate zomes/hello rust-proc
  cd ..
fi

cd cc_tuts
single_source code ../src/tutorials/coreconcepts/$CONCEPT.md zomes/hello/code/src/lib.rs rust
single_source code ../src/tutorials/coreconcepts/$CONCEPT.md test/index.js javascript test

echo "packaging: ${CONCEPT}"

hc package
if [ "${?}" -gt 0 ]; then
  echo ${CONCEPT}
  echo "${CONCEPT} failed to compile"
  exit 1
fi
#./update_hash.sh

echo "testing: ${CONCEPT}"

timeout --preserve-status 120 hc test 
if [ "${?}" -gt 0 ]; then
  echo "${CONCEPT} failed test"
  exit 1
fi

cd ..
rm docs/tutorials/coreconcepts/$CONCEPT.md
single_source md src/tutorials/coreconcepts/$CONCEPT.md docs/tutorials/coreconcepts/$CONCEPT.md

