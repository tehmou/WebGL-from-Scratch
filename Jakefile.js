var fs = require("fs");
var exec = require('child_process').exec;

var SRC_DIR = "src";
var BUILD_DIR = "build";
var SAMPLES_DIR = BUILD_DIR + "/samples";


task ("default", ["reset-build-directory", "process-samples", "clean-samples"], function () {
    startLog("default");

    endLog();
});

task ("reset-build-directory", function () {
    startLog("reset-build-directory");

    log("Removing '" + BUILD_DIR + "'..");
    exec("rm -rf " + BUILD_DIR, function () {
        log("Creating '" + BUILD_DIR + "'..");
        exec("cp -r " + SRC_DIR + " " + BUILD_DIR, function () {
            endLog();
            complete();
        });
    });
}, true);

task ("process-samples", function () {
    startLog("process-samples");

    fs.readdirSync(SAMPLES_DIR).forEach(function (filename) {
        var filetype = getFileType(filename);
        startLog("Found file " + filename + " of type " + filetype);
        if (filetype === "html") {
            processSample(filename);
        }
        endLog();
    });

    endLog();
});

task ("clean-samples", function () {
    startLog("clean-samples");

    endLog();
});

function processSample (filename) {
    log("Writing sample " + filename + "..");
    var path = SAMPLES_DIR + "/" + filename,
        fileContents = fs.readFileSync(path, "utf-8");
    fileContents = expandScripts(fileContents);
    fileContents = expandCSS(fileContents);
    fs.writeFileSync(path, fileContents, "utf-8");
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
        var src = SAMPLES_DIR + "/" + scriptTag[1];
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

function startLog (msg) {
    log(msg);
    logIntend++;
}

function endLog () {
    logIntend--;
}