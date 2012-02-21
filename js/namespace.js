// Define the basic namespace, and a way to safely define more.
var timotuominen = {
    defineWithRoot: function (root, path, obj) {
        var part, parts = path.split(".");
        while (part = parts.shift()) {
            root = root[part] = parts.length ? (root.hasOwnProperty(part) ? root[part] : {}) : obj;
        }
    },
    define: function (path, obj) {
        timotuominen.defineWithRoot(timotuominen, path, obj)
    }
};