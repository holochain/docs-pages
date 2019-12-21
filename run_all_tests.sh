#!/bin/bash

sim2h_server &
./build_test_cc.sh hello_holo && ./build_test_cc.sh hello_test && ./build_test_cc.sh hello_gui && ./build_test_cc.sh hello_me && ./build_test_cc.sh hello_world && ./build_test_cc.sh simple_micro_blog
