var sys = require("sys");
var fs = require("fs");
var pegjs = require("pegjs");


fs.readFile("JS.pegjs", function (err, data) {
    var parser = pegjs.buildParser("" + data);
    var src = parser.toSource();
    src = src.replace(/^.*\n/, "timotuominen.createParser = function (parseHandler) {\n");
    src = src.replace(/\n.*$/, "\n};");

    fs.writeFile("createParser.js", src);
});
