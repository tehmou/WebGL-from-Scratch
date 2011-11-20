var sys = require("sys");
var fs = require("fs");
var pegjs = require("pegjs");
var loadFiles = require("./loadFiles");

loadFiles.loadFiles(
    [ "html_parser.pegjs", "../demo.html" ],
    function (files) {
        sys.print("Generating html parser...\n");
        var htmlParser = pegjs.buildParser("" + files[0]);
        var html = htmlParser.parse("" + files[1]);
        //fs.writeFile("grammar.txt", html);
        sys.print(html);
    }
);