var fs = require("fs");

task ("default", function () {
    log("Building...");
    logIntend++;

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
        var filename = samples[i],
            filetype = getFileType(filename);

        log("Found file " + filename + " of type " + filetype);
        logIntend++;
        if (filetype === "html") {
            processSample(filename);
        } else if (filetype) {
            copyFile(filename);
        }
        logIntend--;
    }

    logIntend--;
});

function copyFile (filename) {
    log("Copying file " + filename + "..");
    //fs.sendfileSync("samples/" + filename, "build/" + filename);
}

function processSample (name) {
    log("Writing sample " + name + "..");
    var fileContents = fs.readFileSync("samples/" + name, "utf-8");
    fileContents = expandScripts(fileContents);
    fileContents = expandCSS(fileContents);
    fs.writeFileSync("build/" + name, fileContents, "utf-8");
}

function expandScripts (inputString) {
    log("Expanding all script tags..");
    logIntend++;
    inputString = expandFileReferences({
        inputString: inputString,
        regex: /<script src="([a-zA-Z\.\/]*)"><\/script>/g,
        addStart: '\n<script type="text/javascript">\n\n',
        addEnd: '\n</script>'
    });
    logIntend--;
    return inputString;
}

function expandCSS (inputString) {
    log("Expanding linked CSS..");
    logIntend++;
    inputString = expandFileReferences({
        inputString: inputString,
        regex: /<link href="([a-zA-Z\.\/]*)" rel="stylesheet" type="text\/css">/g,
        addStart: '\n<style type="text/css">\n\n',
        addEnd: '\n</style>'
    });
    logIntend--;
    return inputString;
}

function expandFileReferences (options) {
    options = options || {};
    var inputString = options.inputString,
        regex = options.regex,
        addStart = options.addStart,
        addEnd = options.addEnd;
    var scriptTag, matchArray = [];

    while (scriptTag = regex.exec(inputString)) {
        var tag = scriptTag[0];
        var src = "samples/" + scriptTag[1];
        matchArray.push({
            pos: inputString.indexOf(tag),
            tag: tag,
            src: src
        });
    }

    for (var i = matchArray.length-1; i >= 0; i--) {
        var match = matchArray[i];
        log(match.src);
        var content = fs.readFileSync(match.src);
        inputString = inputString.substr(0, match.pos) + addStart + content + addEnd + inputString.substr(match.pos + match.tag.length);
    }

    return inputString;
}

function getFileType (filename) {
    var matches = filename.match(/\.(.*)$/);
    return matches ? matches[1] : null;
}

var logIntend = 0;
function log (msg) {
    var intend = "";
    for (var i = 0; i < logIntend; i++) { intend += "  "; }
    console.log(intend + msg);
}