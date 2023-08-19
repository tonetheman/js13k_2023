#!/bin/bash

# remove build dir no matter what
rm -rf ./build
# remove final zip no matter what
rm -f final.zip

# makes the dirs all the way down
mkdir -p build/node_modules/kontra

cp index.html build
cp main.js build
cp *.png build
cp node_modules/kontra/kontra.min.mjs build/node_modules/kontra

cd build
zip ../final.zip *
echo "done"
