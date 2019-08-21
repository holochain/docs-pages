#!/bin/bash
cd src
cargo build --release
cd ..
if test -f "regenerate_html_bin"; then
    rm regenerate_html_bin
fi
mv src/target/release/regenerate_html_bin regenerate_html_bin
./regenerate_html_bin
