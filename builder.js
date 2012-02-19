(function () {

    var fs = require("fs");
    
    function expandScripts (inputString, directory) {
        startLog("Expanding all script tags..");
        inputString = expandFileReferences({
            inputString: inputString,
            regex: /<script src="([a-zA-Z\.\/]*)".*?><\/script>/g,
            addStart: '\n<script type="text/javascript">\n\n',
            addEnd: '\n</script>',
            directory: directory
        });
        endLog();
        return inputString;
    }

    function expandCSS (inputString, directory) {
        startLog("Expanding linked CSS..");
        inputString = expandFileReferences({
            inputString: inputString,
            regex: /<link href="([a-zA-Z\.\/]*)" rel="stylesheet" type="text\/css">/g,
            addStart: '\n<style type="text/css">\n\n',
            addEnd: '\n</style>',
            directory: directory
        });
        endLog();
        return inputString;
    }

    function expandFileReferences (options) {
        options = options || {};
        var inputString = options.inputString,
            regex = options.regex,
            addStart = options.addStart,
            addEnd = options.addEnd,
            directory = options.directory;
        var scriptTag, matchArray = [];

        while (scriptTag = regex.exec(inputString)) {
            var tag = scriptTag[0];
            var src = directory + "/" + scriptTag[1];
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

    exports.processSample = function (filename, directory) {
        var path = directory + "/" + filename;
        log("Writing sample " + path + "..");
        var fileContents = fs.readFileSync(path, "utf-8");
        fileContents = expandScripts(fileContents, directory);
        fileContents = expandCSS(fileContents, directory);
        fs.writeFileSync(path, fileContents, "utf-8");
    };


})();
