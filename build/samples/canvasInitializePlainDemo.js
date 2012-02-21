/**
 * Show results
 * ------------
 *
 * Initialize a 2D canvas and use the function defined in
 * timotuominen.webgl.canvasGeneratorFunction to fill the screen.
 *
 * The timeout is a workaround for a strange "INDEX_SIZE_ERR: DOM Exception 1"
 * but that happened only the first time the full screen link was opened.
 *
 */
window.onload = function initialize () {
    setTimeout(function () {
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var w = canvas.width = window.innerWidth;
        var h = canvas.height = window.innerHeight;
        var imageData = ctx.createImageData(w, h);

        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                var idx = (x + y * w) * 4;
                var c = (timotuominen.webgl.canvasGeneratorFunction(x, y) + 1)*128;
                imageData.data[idx + 0] = c;
                imageData.data[idx + 1] = c;
                imageData.data[idx + 2] = c;
                imageData.data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }, 100);
};