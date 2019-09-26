#!/bin/bash

CONCEPT=$1

[ -z "$CONCEPT" ] && echo "first argument must be core concept name eg. hello_holo" && exit 1

if [ ! -d "cc_tuts" ]; then
  git clone --depth 1 https://github.com/freesig/cc_tuts.git
fi

cd cc_tuts
../utility/single_source code ../coreconcepts/tutorials/$CONCEPT.md zomes/hello/code/src/lib.rs rust
../utility/single_source code ../coreconcepts/tutorials/$CONCEPT.md test/index.js javascript test

echo "packaging: ${CONCEPT}"

hc package
if [ "${?}" -gt 0 ]; then
  echo ${CONCEPT}
  exit 1
fi
#./update_hash.sh

echo "testing: ${CONCEPT}"

hc test 
if [ "${?}" -gt 0 ]; then
  echo "${CONCEPT} failed test"
fi

cd ..
utility/single_source md coreconcepts/tutorials/$CONCEPT.md docs/tutorials/coreconcepts/$CONCEPT.md
