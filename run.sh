#/bin/sh
cd /volume1/web/NestRestApi
git pull
rm -Rf dist
npm install
npm run start
