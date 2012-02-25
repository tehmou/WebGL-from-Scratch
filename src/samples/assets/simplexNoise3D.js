/**
 *
 * Simplex Noise 3D
 * -----------------------
 *
 * For a more detailed Simplex Noise sample, see [Simplex Noise 2D].
 *
 *   [Simplex Noise 2D]: simplex_noise.html
 *
 */
(function () {

    function dot3D (a, b) {
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }

    function skew45degree3D (coord, factor) {
        var s = (coord[0]+coord[1]+coord[2]) * factor;
        return [coord[0]+s, coord[1]+s, coord[2]+s];
    }

    function GradientKernel (random) {
        random = random || Math.random;

        var GRADIENTS_3D = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
        var NUM_GRADIENTS_3D = GRADIENTS_3D.length;

        var randomKernel = [];
        for(var i = 0; i < 512; i++) {
            randomKernel[i] = ~~(random()*256);
        }

        return {
            get3DGradientsAt: function (tileIndex, triangleFactor) {
                var ii = tileIndex[0] % 255;
                var jj = tileIndex[1] % 255;
                var kk = tileIndex[2] % 255;
                var index0 = randomKernel[ii+randomKernel[jj+randomKernel[kk]]] % 12;
                var index1 = randomKernel[ii+triangleFactor[0][0]+randomKernel[jj+triangleFactor[0][1]+randomKernel[kk+triangleFactor[0][2]]]] % 12;
                var index2 = randomKernel[ii+triangleFactor[1][0]+randomKernel[jj+triangleFactor[1][1]+randomKernel[kk+triangleFactor[1][2]]]] % 12;
                var index3 = randomKernel[ii+1+randomKernel[jj+1+randomKernel[kk+1]]] % 12;
                return [
                    GRADIENTS_3D[index0 % NUM_GRADIENTS_3D],
                    GRADIENTS_3D[index1 % NUM_GRADIENTS_3D],
                    GRADIENTS_3D[index2 % NUM_GRADIENTS_3D],
                    GRADIENTS_3D[index3 % NUM_GRADIENTS_3D],
                ];
            }
        };
    }

    timotuominen.define("html5.simplexNoise.SimplexNoise3D", function(options) {
        options = options || {};

        var SKEW_PIXEL_TO_GRID_3D = 1/3;
        var SKEW_GRID_TO_PIXEL_3D = -1/6;

        var gradientKernel = new GradientKernel(options.random);

        function calculateEffect3D (delta, grad) {
            var magnitude = 0.6 - dot3D(delta, delta);
            if (magnitude < 0) {
                return 0;
            } else {
                return Math.pow(magnitude, 4) * dot3D(delta, grad);
            }
        }

        function calculateTriangleFactor3D (pixDeltaFromOrigin) {
            if (pixDeltaFromOrigin[0]>=pixDeltaFromOrigin[1]) {
                if (pixDeltaFromOrigin[1]>=pixDeltaFromOrigin[2]) {
                    return [[1,0,0],[1,1,0]];
                } else if (pixDeltaFromOrigin[0]>=pixDeltaFromOrigin[2]) {
                    return [[1,0,0],[1,0,1]];
                } else {
                    return [[0,0,1],[1,0,1]];
                }
            } else {
                if (pixDeltaFromOrigin[1]<pixDeltaFromOrigin[2]) {
                    return [[0,0,1],[0,1,1]];
                } else if (pixDeltaFromOrigin[0]<pixDeltaFromOrigin[2]) {
                    return [[0,1,0],[0,1,1]];
                } else {
                    return [[0,1,0],[1,1,0]];
                }
            }
        }

        return {
            processPixel: function (xin, yin, zin) {
                var posOnTileGrid = skew45degree3D([xin, yin, zin], SKEW_PIXEL_TO_GRID_3D);
                var tileOrigin = [~~posOnTileGrid[0], ~~posOnTileGrid[1], ~~posOnTileGrid[2]];
                var pixOrigin = skew45degree3D(tileOrigin, SKEW_GRID_TO_PIXEL_3D);
                var pixDeltaFromOrigin = [xin-pixOrigin[0], yin-pixOrigin[1], zin-pixOrigin[2]];

                var triangleFactor = calculateTriangleFactor3D(pixDeltaFromOrigin);

                var x1 = pixDeltaFromOrigin[0] - triangleFactor[0][0] - SKEW_GRID_TO_PIXEL_3D;
                var y1 = pixDeltaFromOrigin[1] - triangleFactor[0][1] - SKEW_GRID_TO_PIXEL_3D;
                var z1 = pixDeltaFromOrigin[2] - triangleFactor[0][2] - SKEW_GRID_TO_PIXEL_3D;

                var x2 = pixDeltaFromOrigin[0] - triangleFactor[1][0] - 2.0*SKEW_GRID_TO_PIXEL_3D;
                var y2 = pixDeltaFromOrigin[1] - triangleFactor[1][1] - 2.0*SKEW_GRID_TO_PIXEL_3D;
                var z2 = pixDeltaFromOrigin[2] - triangleFactor[1][2] - 2.0*SKEW_GRID_TO_PIXEL_3D;

                var x3 = pixDeltaFromOrigin[0] - 1.0 - 3.0*SKEW_GRID_TO_PIXEL_3D;
                var y3 = pixDeltaFromOrigin[1] - 1.0 - 3.0*SKEW_GRID_TO_PIXEL_3D;
                var z3 = pixDeltaFromOrigin[2] - 1.0 - 3.0*SKEW_GRID_TO_PIXEL_3D;

                var cornerGradients = gradientKernel.get3DGradientsAt(tileOrigin, triangleFactor);
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