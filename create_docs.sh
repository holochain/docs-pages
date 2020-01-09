#!/bin/bash

rm -fr docs
cp -r src docs
rm -fr docs/tutorials/coreconcepts/*
cp src/tutorials/coreconcepts/index.md docs/tutorials/coreconcepts/index.md
