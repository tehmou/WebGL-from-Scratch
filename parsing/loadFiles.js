var fs = require("fs");

module.exports = {
    loadFiles: function loadFiles (files, callback, loaded) {
        loaded = loaded || [];
        var file = files.pop();
        if (file) {
            fs.readFile(file, function (err, data) {
                loaded.splice(0, 0, data);
                loadFiles(files, callback, loaded);
            });
        } else {
            callback(loaded);
        }
    }
};