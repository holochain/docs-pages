#!/bin/bash

# https://stackoverflow.com/a/22644006/183350
trap "exit" INT TERM
trap "kill 0" EXIT

build="mkdocs build -d build/docs"

run_on_update() {
	files="${@:1:$#-1}"
	script="${@: -1}"
	fswatch --event Created --event Updated --event Removed $files | xargs -n 1 $script &
}

rebuild_on_update() {
	run_on_update docs/ "-I{} $build"
}

#run_on_update src/tutorials/coreconcepts/ ./cc_tuts_build.sh
run_on_update src/ ./dev_build_misc_static.sh
if [ "$1" == "sync" ]; then
	rebuild_on_update
	cd build && browser-sync start -s -f . --port 9000 --reload-delay 10000 --reload-debounce 10000
elif [ "$1" == "netlify" ]; then
	rebuild_on_update
	cd build && netlify dev -p 8003 -l
elif [ "$1" == "serve" ]; then
	mkdocs serve
elif [ "$1" == "watch" ]; then
	rebuild_on_update
	# This makes the script wait until Ctrl+C.
	# It's necessary because run_on_update's fswatch is put into the background,
	# which would cause this script to return to the bash prompt and then start spewing out build messages,
	# which is awfully confusing.
	read -r -d '' _ </dev/tty
elif [ "$1" == "once" ]; then
	$build
else
	echo "Please specify a build method for the documentation site:"
	echo "  sync:    use browser-sync to serve and live reload changes"
	echo "  netlify: serve publicly from workstation via netlify"
	echo "  serve:   use mkdocs' built in server"
	echo "  watch:   rebuild on changes but do not start an HTTP server"
	echo "  once:    don't watch for changes; just rebuild"
	echo "For netlify, watch, and once, the build can be found in the 'build' folder."
fi
