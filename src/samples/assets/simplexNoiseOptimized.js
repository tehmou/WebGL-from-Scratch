/**
 *
 * Optimized Simplex Noise
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

    function skew45degree2D (x, y, factor) {
        var s = (x+y) * factor;
        return [x+s, y+s];
    }

    (function () {

        timotuominen.define("webgl.simplexNoise.SimplexNoise2D", function(options) {
            options = options || {};
            var TRIANGLE_HEIGHT = Math.sqrt(2)/2;
            var TRIANGLE_HEIGHT_SQUARED = .5;
            var TRIANGLE_SIDE = 2*TRIANGLE_HEIGHT/Math.sqrt(3);
            var SCALE_FACTOR = TRIANGLE_SIDE / (options.requestedTriangleSize || 64);
            var SKEW_PIXEL_TO_GRID_2D = (Math.sqrt(3) - 1) / 2;
            var SKEW_GRID_TO_PIXEL_2D = (Math.sqrt(3) - 3) / 6;

            var gradientKernel = new timotuominen.webgl.simplexNoise.GradientKernel(options.random);

            function calculateEffect (delta, grad) {
                var magnitude = TRIANGLE_HEIGHT_SQUARED - dot2D(delta, delta);
                if (magnitude < 0) {
                    return 0;
                } else {
                    return Math.pow(magnitude, 4) * dot2D(delta, grad);
                }
            }

            return {
                processPixel: function (xin, yin) {
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

                    var cornerGradients = gradientKernel.getGradientsAt(tileOrigin, triangleFactor);

                    var totalMagnitude = 0;
                    totalMagnitude += calculateEffect(pixDeltaFromOrigin, cornerGradients[0]);
                    totalMagnitude += calculateEffect(pixDeltaFromTriangleCorner, cornerGradients[1]);
                    totalMagnitude += calculateEffect(pixDeltaFromOpposingCorner, cornerGradients[2]);

                    return 60 * totalMagnitude;
                }
            };
        });
    })();

})();

timotuominen.define("webgl.simplexNoise.GradientKernel", function (random) {
    random = random || Math.random;

    var GRADIENTS_2D = [[1,1],[-1,1],[1,-1],[-1,-1],[0,1],[1,0],[0,-1],[-1,0]];
    var NUM_GRADIENTS_2D = GRADIENTS_2D.length;

    var randomKernel = [];
    for(var i = 0; i < 512; i++) {
        randomKernel[i] = ~~(random()*256);
    }

    return {
        getGradientsAt: function (tileIndex, triangleFactor) {
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
        }
    };
});
