/**
 * Initialize hook
 * ---------------
 *
 * This is simply the initialization code we will run after document as finished
 * loading. Mainly we just set up the demo instance and give it the necessary
 * argument, in order for it to do its job.
 *
 */
window.onload = function initialize () {
    var demo, image, canvas;

    // Create a canvas for ourselves.
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    // Point at which everything should be loaded and we can start the application.
    function start () {
        demo = new timotuominen.html5.FromScratchDemo({
            images: [image],
            vsCode: document.getElementById("vs-shader").innerHTML,
            fsCode: document.getElementById("fs-shader").innerHTML,
            el: canvas
        });
        demo.initialize();

        window.onresize = updateCanvasSize;
        updateCanvasSize();
    }

    // Call this whenever there are changes in canvas size.
    function updateCanvasSize () {
        // Set the canvas size to match the window size. Notice that canvas.width and canvas.height are not the
        // same as the CSS width and height of the canvas! If you use CSS to size your canvas, you will always have
        // to manually set the properties width and height of the canvas element accordingly.
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Tell the demo that its canvas has changed its size.
        demo.updateSize();
    }

    // Create a simple image DOM element and tell it to load an image. When it is loaded, start!
    image = new Image();
    image.onload = start;
    image.src = "IMG_2235.JPG";
};
