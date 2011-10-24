var sys = require("sys");
var fs = require("fs");
var pegjs = require("pegjs");


fs.readFile("parser.pegjs", function (err, grammarParserGrammar) {
    fs.readFile("javascript.pegjs", function (err, javascriptGrammar) {
        fs.readFile("")

        var grammarParser = pegjs.buildParser("" + grammarParserGrammar);
        var grammar = grammarParser.parse("" + javascriptGrammar);
        //fs.writeFile("gg", grammar);
        var parser = pegjs.buildParser(grammar);
        var src = parser.toSource();
        src = src.replace(/^.*\n/, "timotuominen.createParser = function (parseHandler) {\n");
        src = src.replace(/\n.*$/, "\n};");
        fs.writeFile("createParser.js", src);
    });
});
