var sys = require("sys");
var fs = require("fs");
var pegjs = require("pegjs");
var loadFiles = require("./loadFiles");

loadFiles.loadFiles(
    [ "grammar_parser.pegjs", "javascript.pegjs" ],
    function (files) {
        sys.print("Generating grammar parser...\n");
        var grammarParser = pegjs.buildParser("" + files[0]);

        sys.print("Generating grammar...\n");
        var grammar = grammarParser.parse("" + files[1]);
        //fs.writeFile("grammar.txt", grammar); return;

        sys.print("Generating parser...\n");
        var parser = pegjs.buildParser("" + grammar);
        //var parser = pegjs.buildParser("" + files[1]);

        var src = parser.toSource();
        src = src.replace(/^.*\n/, "timotuominen.createParser = function (parseHandler) {\n");
        src = src.replace(/\n.*$/, "\n};");
        fs.writeFile("createParser.js", src);
    }
);