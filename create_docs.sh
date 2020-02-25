#!/bin/bash
set -e
rm -fr docs
cp -r src docs
rm -fr docs/tutorials/coreconcepts/*
rm -fr docs/install.md
cp src/tutorials/coreconcepts/index.md docs/tutorials/coreconcepts/index.md
