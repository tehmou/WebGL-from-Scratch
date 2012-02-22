/**
 *
 * Simplex Noise 2D + 3D
 * -----------------------
 *
 * For a detailed Simplex Noise sample, see [Simplex Noise 2D].
 *
 *   [Simplex Noise 2D]: simplex_noise.html
 *
 */
(function () {

    function dot2D (a, b) {
        return a[0]*b[0] + a[1]*b[1];
    }

    function dot3D (a, b) {
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }

    function skew45degree2D (x, y, factor) {
        var s = (x+y) * factor;
        return [x+s, y+s];
    }

    function skew45degree3D (coord, factor) {
        var s = (coord[0]+coord[1]+coord[2]) * factor;
        return [coord[0]+s, coord[1]+s, coord[2]+s];
    }

    (function () {

        timotuominen.define("webgl.simplexNoise.SimplexNoise", function(options) {
            options = options || {};
            var TRIANGLE_HEIGHT = Math.sqrt(2)/2;
            var TRIANGLE_HEIGHT_SQUARED = .5;
            var TRIANGLE_SIDE = 2*TRIANGLE_HEIGHT/Math.sqrt(3);
            var SCALE_FACTOR = TRIANGLE_SIDE / (options.requestedTriangleSize || 64);

            var SKEW_PIXEL_TO_GRID_2D = (Math.sqrt(3) - 1) / 2;
            var SKEW_GRID_TO_PIXEL_2D = (Math.sqrt(3) - 3) / 6;

            var SKEW_PIXEL_TO_GRID_3D = 1/3;
            var SKEW_GRID_TO_PIXEL_3D = -1/6;

            var gradientKernel = new timotuominen.webgl.simplexNoise.GradientKernel(options.random);

            function calculateEffect2D (delta, grad) {
                var magnitude = TRIANGLE_HEIGHT_SQUARED - dot2D(delta, delta);
                if (magnitude < 0) {
                    return 0;
                } else {
                    return Math.pow(magnitude, 4) * dot2D(delta, grad);
                }
            }

            function calculateEffect3D (delta, grad) {
                var magnitude = 0.6 - dot3D(delta, delta);
                if (magnitude < 0) {
                    return 0;
                } else {
                    return Math.pow(magnitude, 4) * dot3D(delta, grad);
                }
            }

            return {
                processPixel2D: function (xin, yin) {
                    xin *= SCALE_FACTOR;
                    yin *= SCALE_FACTOR;

                    var posOnTileGrid = skew45degree2D(xin, yin, SKEW_PIXEL_TO_GRID_2D);
                    var tileOrigin = [~~(posOnTileGrid[0]), ~~(posOnTileGrid[1])];
                    var pixOrigin = skew45degree2D(tileOrigin[0], tileOrigin[1], SKEW_GRID_TO_PIXEL_2D);
                    var pixDeltaFromOrigin = [xin-pixOrigin[0], yin-pixOrigin[1]];
                    var triangleFactor = pixDeltaFromOrigin[0] > pixDeltaFromOrigin[1] ? [1,0] : [0,1];

                    var pixDeltaFromTriangleCorner = [
                        pixDeltaFromOrigin[0] - triangleFactor[0] - SKEW_GRID_TO_PIXEL_2D,
                        pixDeltaFromOrigin[1] - triangleFactor[1] - SKEW_GRID_TO_PIXEL_2D
                    ];
                    var pixDeltaFromOpposingCorner = [
                        pixDeltaFromOrigin[0] - 1.0 + 2.0*-SKEW_GRID_TO_PIXEL_2D,
                        pixDeltaFromOrigin[1] - 1.0 + 2.0*-SKEW_GRID_TO_PIXEL_2D
                    ];

                    var cornerGradients = gradientKernel.get2DGradientsAt(tileOrigin, triangleFactor);
                    var totalMagnitude = 0;
                    totalMagnitude += calculateEffect2D(pixDeltaFromOrigin, cornerGradients[0]);
                    totalMagnitude += calculateEffect2D(pixDeltaFromTriangleCorner, cornerGradients[1]);
                    totalMagnitude += calculateEffect2D(pixDeltaFromOpposingCorner, cornerGradients[2]);
                    return 60 * totalMagnitude;
                },
                processPixel3D: function (xin, yin, zin) {
                    xin *= SCALE_FACTOR;
                    yin *= SCALE_FACTOR;
                    zin *= SCALE_FACTOR;

                    var posOnTileGrid = skew45degree3D([xin, yin, zin], SKEW_PIXEL_TO_GRID_3D);
                    var tileOrigin = [~~posOnTileGrid[0], ~~posOnTileGrid[1], ~~posOnTileGrid[2]];
                    var pixOrigin = skew45degree3D(tileOrigin, SKEW_GRID_TO_PIXEL_3D);
                    var pixDeltaFromOrigin = [xin-pixOrigin[0], yin-pixOrigin[1], zin-pixOrigin[2]];

                    var i1, j1, k1;
                    var i2, j2, k2;
                    if (pixDeltaFromOrigin[0]>=pixDeltaFromOrigin[1]) {
                        if (pixDeltaFromOrigin[1]>=pixDeltaFromOrigin[2]) {
                            i1=1; j1=0; k1=0; i2=1; j2=1; k2=0;
                        } else if (pixDeltaFromOrigin[0]>=pixDeltaFromOrigin[2]) {
                            i1=1; j1=0; k1=0; i2=1; j2=0; k2=1;
                        } else {
                            i1=0; j1=0; k1=1; i2=1; j2=0; k2=1;
                        }
                    } else {
                        if (pixDeltaFromOrigin[1]<pixDeltaFromOrigin[2]) {
                            i1=0; j1=0; k1=1; i2=0; j2=1; k2=1;
                        } else if (pixDeltaFromOrigin[0]<pixDeltaFromOrigin[2]) {
                            i1=0; j1=1; k1=0; i2=0; j2=1; k2=1;
                        } else {
                            i1=0; j1=1; k1=0; i2=1; j2=1; k2=0;
                        }
                    }

                    var x1 = pixDeltaFromOrigin[0] - i1 - SKEW_GRID_TO_PIXEL_3D;
                    var y1 = pixDeltaFromOrigin[1] - j1 - SKEW_GRID_TO_PIXEL_3D;
                    var z1 = pixDeltaFromOrigin[2] - k1 - SKEW_GRID_TO_PIXEL_3D;

                    var x2 = pixDeltaFromOrigin[0] - i2 - 2.0*SKEW_GRID_TO_PIXEL_3D;
                    var y2 = pixDeltaFromOrigin[1] - j2 - 2.0*SKEW_GRID_TO_PIXEL_3D;
                    var z2 = pixDeltaFromOrigin[2] - k2 - 2.0*SKEW_GRID_TO_PIXEL_3D;

                    var x3 = pixDeltaFromOrigin[0] - 1.0 - 3.0*SKEW_GRID_TO_PIXEL_3D;
                    var y3 = pixDeltaFromOrigin[1] - 1.0 - 3.0*SKEW_GRID_TO_PIXEL_3D;
                    var z3 = pixDeltaFromOrigin[2] - 1.0 - 3.0*SKEW_GRID_TO_PIXEL_3D;

                    var cornerGradients = gradientKernel.get3DGradientsAt(tileOrigin, i1, j1, k1, i2, j2, k2);
                    var totalMagnitude = 0;
                    totalMagnitude += calculateEffect3D(pixDeltaFromOrigin, cornerGradients[0]);
                    totalMagnitude += calculateEffect3D([x1, y1, z1], cornerGradients[1]);
                    totalMagnitude += calculateEffect3D([x2, y2, z2], cornerGradients[2]);
                    totalMagnitude += calculateEffect3D([x3, y3, z3], cornerGradients[3]);
                    return 32.0*totalMagnitude;
                }
            };
        });
    })();

})();

timotuominen.define("webgl.simplexNoise.GradientKernel", function (random) {
    random = random || Math.random;

    var GRADIENTS_2D = [[1,1],[-1,1],[1,-1],[-1,-1],[0,1],[1,0],[0,-1],[-1,0]];
    var NUM_GRADIENTS_2D = GRADIENTS_2D.length;

    var GRADIENTS_3D = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    var NUM_GRADIENTS_3D = GRADIENTS_3D.length;

    var randomKernel = [];
    for(var i = 0; i < 512; i++) {
        randomKernel[i] = ~~(random()*256);
    }

    return {
        randomKernel: randomKernel,
        get2DGradientsAt: function (tileIndex, triangleFactor) {
            var ii = tileIndex[0] % 255;
            var jj = tileIndex[1] % 255;
            var index0 = randomKernel[ii+randomKernel[jj]];
            var index1 = randomKernel[ii+triangleFactor[0]+randomKernel[jj+triangleFactor[1]]];
            var index2 = randomKernel[ii+1+randomKernel[jj+1]];
            return [
                GRADIENTS_2D[index0 % NUM_GRADIENTS_2D],
                GRADIENTS_2D[index1 % NUM_GRADIENTS_2D],
                GRADIENTS_2D[index2 % NUM_GRADIENTS_2D]
            ];
        },
        get3DGradientsAt: function (tileIndex, i1, j1, k1, i2, j2, k2) {
            var ii = tileIndex[0] % 255;
            var jj = tileIndex[1] % 255;
            var kk = tileIndex[2] % 255;
            var index0 = randomKernel[ii+randomKernel[jj+randomKernel[kk]]] % 12;
            var index1 = randomKernel[ii+i1+randomKernel[jj+j1+randomKernel[kk+k1]]] % 12;
            var index2 = randomKernel[ii+i2+randomKernel[jj+j2+randomKernel[kk+k2]]] % 12;
            var index3 = randomKernel[ii+1+randomKernel[jj+1+randomKernel[kk+1]]] % 12;
            return [
                GRADIENTS_3D[index0 % NUM_GRADIENTS_3D],
                GRADIENTS_3D[index1 % NUM_GRADIENTS_3D],
                GRADIENTS_3D[index2 % NUM_GRADIENTS_3D],
                GRADIENTS_3D[index3 % NUM_GRADIENTS_3D],
            ];
        }
    };
});
