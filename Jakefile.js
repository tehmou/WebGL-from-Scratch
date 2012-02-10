(function () {

    var fs = require("fs");
    var exec = require("child_process").exec;
    var builder = require("./builder.js");

    var SRC_DIR = "src";
    var BUILD_DIR = "build";
    var SAMPLES_DIR = BUILD_DIR + "/samples";

    desc("Triggers a build.");
    task ("default", ["build"]);

    desc("Build the samples into the build directory.");
    task("build", ["clean", "copy-samples", "process-samples"]);

    desc("Empties the build directory.");
    task("clean", function () {
        startLog("reset-build-directory");
        log("Removing '" + BUILD_DIR + "'..");
        exec("rm -rf " + BUILD_DIR, function () {
            endLog();
            complete();
        });
    }, true);

    desc("Copies samples to the output directory.");
    task("copy-samples", function () {
        log("Copying samples to '" + BUILD_DIR + "'..");
        exec("cp -r " + SRC_DIR + " " + BUILD_DIR, function () {
            endLog();
            complete();
        });
    }, true);

    desc("Goes through all the samples in the output directory and processes them.");
    task("process-samples", function () {
        startLog("process-samples");
        fs.readdirSync(SAMPLES_DIR).forEach(function (filename) {
            var filetype = getFileType(filename);
            startLog("Found file " + filename + " of type " + filetype);
            if (filetype === "html") {
                builder.processSample(filename, SAMPLES_DIR);
            }
            endLog();
        });

        endLog();
    });

    function getFileType (filename) {
        var matches = filename.match(/\.(.*)$/);
        return matches ? matches[1] : null;
    }

    var logIntend = 0;
    GLOBAL.log = function (msg) {
        var intend = "";
        for (var i = 0; i < logIntend; i++) { intend += "  "; }
        console.log(intend + msg);
    };

    GLOBAL.startLog = function (msg) {
        log(msg);
        logIntend++;
    };

    GLOBAL.endLog = function () {
        logIntend--;
    };
})();
