#!/bin/bash
set -e

~/.cargo/bin/single_source md src/tutorials/coreconcepts/hello_holo.md docs/tutorials/coreconcepts/hello_holo.md
~/.cargo/bin/single_source md src/tutorials/coreconcepts/hello_test.md docs/tutorials/coreconcepts/hello_test.md
~/.cargo/bin/single_source md src/tutorials/coreconcepts/hello_gui.md docs/tutorials/coreconcepts/hello_gui.md
~/.cargo/bin/single_source md src/tutorials/coreconcepts/hello_me.md docs/tutorials/coreconcepts/hello_me.md
~/.cargo/bin/single_source md src/tutorials/coreconcepts/hello_world.md docs/tutorials/coreconcepts/hello_world.md
~/.cargo/bin/single_source md src/tutorials/coreconcepts/simple_micro_blog.md docs/tutorials/coreconcepts/simple_micro_blog.md
~/.cargo/bin/single_source md src/install.md docs/install.md
