#!/bin/sh
emcc src/filter.c -o dist/filter-emscripten.js -s EXPORTED_FUNCTIONS='["_grayscale"]' -s ALLOW_MEMORY_GROWTH=1