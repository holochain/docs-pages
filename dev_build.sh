#!/bin/bash

# https://stackoverflow.com/a/22644006/183350
trap "exit" INT TERM
trap "kill 0" EXIT

run_on_update() {
	files="${@:1:$#-1}"
	script="${@: -1}"
	fswatch --event Created --event Updated --event Removed $files | xargs -n 1 $script &
}

rebuild_on_update() {
	run_on_update docs/ "-I{} mkdocs build -d build/docs"
	run_on_update coreconcepts/ art_game/ src/ "-I{} mkdocs build -d build/docs"
}

run_on_update coreconcepts/tutorials ./cc_tuts_build.sh
run_on_update coreconcepts/ ./dev_build_art.sh
run_on_update src/ ./dev_build_misc_static.sh
run_on_update art_game/ ./dev_build_ag.sh
if [ "$1" == "sync" ]; then
	rebuild_on_update
	cd build && browser-sync start -s -f . --port 9000
elif [ "$1" == "netlify" ]; then
	rebuild_on_update
	cd build && netlify dev -p 8003 -l
elif [ "$1" == "serve" ]; then
	mkdocs serve
else
	rebuild_on_update
fi