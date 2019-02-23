#!/bin/sh
PATH='/Applications/Wine Staging.app/Contents/Resources/start/bin:/Applications/Wine Staging.app/Contents/Resources/wine/bin:'$PATH
cd ./dist
 ./node_modules/.bin/electron-packager . --platform=all --arch=all -out ../out/