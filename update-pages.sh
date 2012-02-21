echo "empty old files.."
rm -rf ../WebGL-from-Scratch-pages/*

echo "copying files.."
cp -r build/* ../WebGL-from-Scratch-pages/

echo "changing folder.."
cd ../WebGL-from-Scratch-pages

echo "checkout gh-pages.."
git checkout gh-pages

echo "add and commit.."
git add . -u
git add .
git commit -m "Build from master."

echo "push"
git push origin gh-pages
