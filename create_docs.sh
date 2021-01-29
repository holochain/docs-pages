#!/bin/bash
set -e
rm -fr docs
cp -r src docs
mkdocs build -d build/docs