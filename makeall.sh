#!/bin/sh
PATH='/Applications/Wine Staging.app/Contents/Resources/start/bin:/Applications/Wine Staging.app/Contents/Resources/wine/bin:'$PATH
./node_modules/.bin/electron-packager ./dist --platform=all --arch=all --out ./packages
#./node_modules/.bin/electron-packager ./dist  -out ../out/ --out ./packages