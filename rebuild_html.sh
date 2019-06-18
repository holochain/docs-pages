#!/bin/bash
cd src
cargo build --release
cd ..
rm regenerate_html_bin
mv src/target/release/regenerate_html_bin regenerate_html_bin
./regenerate_html_bin