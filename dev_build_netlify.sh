#!/bin/bash

trap 'kill %1; kill %2; kill %3; kill %4;' SIGINT
fswatch coreconcepts/ | xargs -n 1 ./dev_build_art.sh &
fswatch coreconcepts/ | xargs -n 1 ./cc_tuts_build.sh &
fswatch art_game/ | xargs -n 1 ./dev_build_ag.sh &
fswatch coreconcepts/ art_game/ | xargs -n 1 -I{} mkdocs build -d build/docs &
cd build && netlify dev -p 8003 -l
