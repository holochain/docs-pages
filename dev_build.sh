#!/bin/bash

trap 'kill %1; kill %2; kill %3; kill %4;' SIGINT
fswatch coreconcepts/tutorials/ | xargs -n 1 ./cc_tuts_build.sh &
fswatch coreconcepts/ | xargs -n 1 ./dev_build_art.sh &
fswatch art_game/ | xargs -n 1 ./dev_build_ag.sh &
fswatch docs/ | xargs -n 1 -I{} mkdocs build -d build/docs &
cd build && browser-sync start -s -f . --port 9000 --reload-delay 10000 --reload-debounce 10000
