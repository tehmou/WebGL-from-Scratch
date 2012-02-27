// Polyfill for requesting the drawing time for the next frame.
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (f) {
        window.setTimeout(f, 1000 / 60);
    };