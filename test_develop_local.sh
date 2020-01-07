#!/bin/bash

create_testing_dir() {
    mkdir testing
    cd testing
    echo "init package"
    hc init cc_tuts
    if [ "${?}" -gt 0 ]; then
        echo "failed init package"
        exit 1
    fi
    cd cc_tuts
    echo "generate zome"
    hc generate zomes/hello rust-proc
    if [ "${?}" -gt 0 ]; then
        echo "failed generate zome"
        exit 1
    fi
}

test_tutorial() {
    ./play_with.sh $1 testing/cc_tuts/
    cd testing/cc_tuts
    echo "packaging: ${1}"
    hc package
    if [ "${?}" -gt 0 ]; then
        echo "${1} failed to compile"
        exit 1
    fi

    echo "testing: ${1}"

    timeout --preserve-status 120 hc test 
    if [ "${?}" -gt 0 ]; then
        echo "${1} failed test"
        exit 1
    fi
    cd ../../
}
if [ ! -d "testing/cc_tuts" ]; then
    create_testing_dir
    cd ../../
fi
test_tutorial hello_holo &&
test_tutorial hello_test &&
test_tutorial hello_gui &&
test_tutorial hello_me &&
test_tutorial hello_world &&
test_tutorial simple_micro_blog 



