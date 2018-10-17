#!/bin/sh
emcc src/filter.c -o dist/filter.wasm -s WASM=1 -s ONLY_MY_CODE=1 -s SIDE_MODULE=1 -Oz -g