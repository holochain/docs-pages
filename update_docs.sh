#!/bin/bash

git add docs
CHANGE=$(git diff --name-only --cached)
MIN=0

if [ "${#CHANGE}" -gt "$MIN" ]; then
  git commit -m "[skip ci] pushing generated files" && git push origin v2_develop
fi
  
