/**
 * Basic renderer
 * --------------
 *
 * Another utility class; this time for initializing and continuously rendering the view. It tries to run at 60 fps,
 * and does not have any funny optimizations regarding this. In real life you may want to use the experimental feature
 * some browsers have, [requestAnimationFrame], or reduce fps in case the browser cannot handle it.
 *
 *  [requestAnimationFrame]: https://developer.mozilla.org/en/DOM/window.requestAnimationFrame
 *
 */
timotuominen.define("html5.Runner", function (options) {
    options = options || {};
    return {

        // Hold the canvas element.
        el: options.el,

        // Initialize should be called to start the loop.
        initialize: function () {
            // First we create the WebGL object by requesting "experimental-webgl" context.
            // If WebGL is not supported, this will either throw an error or result null.
            // For this example we will not handle these scenarios.
            this.gl = this.el.getContext("experimental-webgl");

            this.updateSize = this.updateSize.bind(this);
            this.updateSize();

            // Color that is used to clear the whole canvas before starting to
            // draw the frame. We use rgba here, in which all four components
            // are from 0.0 to 1.0.
            this.gl.clearColor(0.3, 0.3, 0.3, 1.0);

            // Bind the renderLoop to this object. Since we will be using a timeout to
            // call renderLoop continually, it would otherwise be the window object.
            var realRenderLoop = this.renderLoop;
            var self = this;
            this.renderLoop = function () {
                realRenderLoop.apply(self);
            };
        },

        updateSize: function () {
            // Store the size of the canvas. DOM operation are in general expensive,
            // and we certainly don't want to do this on every frame.
            this.viewportWidth = this.el.width;
            this.viewportHeight = this.el.height;
        },

        // The rendering loop that repeatedly call itself 60 times a second.
        renderLoop: function() {
            setTimeout(this.renderLoop, 1000/60);
            this.render && this.render();
        }

    };
});

/**
 * Shader utilities
 * ----------------
 *
 * Unfortunately we have to prepare our shader with some boilerplate code, of which cannot really go around. Here is a
 * small utilities that help us to initialize the shaders. Usually this would be buried in some library code you are
 * using, but I find it helpful to see what is actually going on.
 *
 * Or, the very least, how much is going on.
 *
 */
timotuominen.define("html5.shaderUtils", {

    // A shader program is basically vertex shader + fragment shader
    // compiled into a bytecode that the graphics card can execute.
    createProgram: function (gl, vsCode, fsCode) {
        var i, vs, fs, tmpProgram = gl.createProgram();
        try {
            vs = this.compileShader(gl, vsCode, gl.VERTEX_SHADER);
            fs = this.compileShader(gl, fsCode, gl.FRAGMENT_SHADER);
        } catch (e) {
            gl.deleteProgram( tmpProgram );
            throw e;
        }
        gl.attachShader(tmpProgram, vs);
        gl.deleteShader(vs);
        gl.attachShader(tmpProgram, fs);
        gl.deleteShader(fs);
        gl.linkProgram(tmpProgram);
        return tmpProgram;
    },

    // Compiles a single shader into bytecode.
    compileShader: function (gl, code, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw "SHADER ERROR: " + gl.getShaderInfoLog(shader);
        }
        return shader;
    },

    // Create a texture from a loaded Image. The image is simply a
    // reference to a DOM element, which has finished loading.
    createTexture: function (gl, image) {
        var texture = gl.createTexture();

        // Tell WebGL we want to load activate our texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the texture to match our image. Understanding the magic is not
        // important, unless you know what you are doing with the image bytes.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Set the filters to use if the texture needs to be scaled up or down.
        // These are the simplest ones you would want to use, and work predictably.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // What should happen if we run out of texture? CLAMP_TO_EDGE makes
        // WebGL repeat the edge pixels for the empty area.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // We are ready, release the texture.
        gl.bindTexture(gl.TEXTURE_2D, null);

        // Return our processed texture.
        return texture;
    }
});

// Polyfil for bind function on Safari.
Function.prototype.bind = Function.prototype.bind || function (obj) {
    var fnc = this;
    return function () {
        fnc.apply(obj, arguments);
    };
};