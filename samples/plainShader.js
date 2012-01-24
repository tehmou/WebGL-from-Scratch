timotuominen.webgl.PlainShader = function (options) {
    options = options || {};

    return {
        __proto__: new timotuominen.webgl.Runner(options),

        shader: null,
        vertexBuffer: null,
        texture: null,
        vertices: null,
        particles: null,

        initialize: function () {
            this.__proto__.initialize.apply(this);

            var shaderUtils = timotuominen.webgl.shaderUtils,
                vsCode = options.vsCode,
                fsCode = options.fsCode;

            this.vertices = new Float32Array([
                -1.0,-1.0, 1.0,-1.0, -1.0,1.0,
                1.0,-1.0, 1.0,1.0, -1.0,1.0
            ]);
            this.shader = shaderUtils.createProgram(this.gl, vsCode, fsCode);
            this.gl.enableVertexAttribArray(
                    this.gl.getAttribLocation(this.shader, "position"));
            this.texture = shaderUtils.createTexture(this.gl, options.image1);
            this.vertexBuffer = this.gl.createBuffer();
            this.startTime = new Date().getTime();
            this.gl.useProgram(this.shader);
            this.renderLoop();
        },

        render: function () {
            this.prepareShader();
            this.draw();
        },

        prepareShader: function () {
            var gl = this.gl,
                shader = this.shader;

            gl.vertexAttribPointer(
                    gl.getAttribLocation(shader, "position"),
                    2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.getUni("tex0"), 0);
            gl.uniform2f(this.getUni("resolution"), this.viewportWidth, this.viewportHeight);
        },

        getUni: function (uniformName) {
            return this.gl.getUniformLocation(this.shader, uniformName);
        },

        draw: function () {
            var gl = this.gl;
            gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length/2);
        }
    };
};