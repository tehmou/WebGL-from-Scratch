(function () {

    /**
     * Asynchronous canvas fill
     * ------------------------
     *
     * This is a little utility for filling a canvas with the results from
     * a function asynchronously. It runs options.processPixel on all pixels
     * on the canvas and can also render a little status text to the top-left
     * corner. It draws everything asynchronously one column at a
     * time, lest the function be slow.
     */
    timotuominen.define("html5.fillCanvasGrayscale", function (options) {
        var canvas = options.canvas;
        var processPixel = options.processPixel;
        var finishCallback = options.finishCallback;

        var w = canvas.width, h = canvas.height, ctx = canvas.getContext("2d");
        var imgData = ctx.createImageData(w, h);

        var x = 0;
        killDrawingProcessesStack.push(function () { x = w; });
        function processNextColumn () {
            if (x < w) {
                for (var y = 0; y < h; y++) {
                    var idx = (x + y * w) * 4;
                    var c = processPixel(x, y);
                    imgData.data[idx+0] = imgData.data[idx+1] = imgData.data[idx+2] = c;
                    imgData.data[idx+3] = 255;
                }
                ctx.putImageData(imgData, 0, 0);
                x++;
                setTimeout(processNextColumn, 0);
            } else if (finishCallback) {
                finishCallback();
            }
        }
        processNextColumn();
    });

    // Collect here all ongoing asynchronous drawing processes so
    // we can kill them if we want to redraw.
    var killDrawingProcessesStack = [];

    // End all ongoing asynchronous drawing.
    timotuominen.html5.fillCanvasGrayscale.killDrawingProcesses = function () {
        var killCallback;
        while (killCallback = killDrawingProcessesStack.pop()) {
            killCallback();
        }
    };

})();
