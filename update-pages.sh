jake
cp -r build/* ../WebGL-from-Scratch-pages/*
cd ../WebGL-from-Scratch-pages
git checkout gh-pages
git add .
git commit -m "Build from master."
git push origin gh-pages
