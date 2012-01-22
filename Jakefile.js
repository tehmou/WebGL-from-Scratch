var fs = require("fs");

task ("default", function () {
    console.log("Building...");

    var buildDirStat = fs.statSync("build");
    if (buildDirStat && buildDirStat.isDirectory()) {
        var files = fs.readdirSync("build");
        for (var i = 0; i < files.length; i++) {
            fs.unlinkSync("build/" + files[i]);
        }
        fs.rmdirSync("build");
    }
    
    fs.mkdirSync("build", 0777);

    var samples = fs.readdirSync("samples");
    for (var i = 0; i < samples.length; i++) {
        var filename = samples[i];
        if (filename.substr(filename.length-5) === ".html") {
            processSample(samples[i]);
        } else {
            copyFile(samples[i]);
        }
    }

    function copyFile (filename) {
        console.log("Copying file " + filename + "..");
        fs.sendfileSync("samples/" + filename, "build/" + filename);
    }

    function processSample (name) {
        console.log("Writing sample " + name + "..");

        var fileContents = fs.readFileSync("samples/" + name, "utf-8");
        var scriptMatch = /<script src="([a-zA-Z.\/]*)"><\/script>/g;
        var scriptTag, matchArray = [];

        while (scriptTag = scriptMatch.exec(fileContents)) {
            var tag = scriptTag[0];
            var src = scriptTag[1].replace("..", ".");
            matchArray.push({
                pos: fileContents.indexOf(tag),
                tag: tag,
                src: src
            });
        }

        var scriptStart = '\n<script type="text/javascript">\n\n';
        var scriptEnd = '\n</script>';
        for (var i = matchArray.length-1; i >= 0; i--) {
            var match = matchArray[i];
            var content = fs.readFileSync(match.src);
            fileContents = fileContents.substr(0, match.pos) + scriptStart + content + scriptEnd + fileContents.substr(match.pos + match.tag.length);
        }

        fs.writeFileSync("build/" + name, fileContents, "utf-8");
    }
});