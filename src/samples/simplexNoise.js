(function () {

    function calculateEffect (coord, grad) {
        var contribution = .5 - coord[0]*coord[0] - coord[1]*coord[1];
        if (contribution < 0) {
            return 0;
        } else {
            return Math.pow(contribution, 4) * (grad[0]*coord[0] + grad[1]*coord[1]);
        }
    }
    function floor (x) {
        return ~~x;
    }
    function skew (x, y, factor) {
        var s = (x+y) * factor;
        return [x+s, y+s];
    }

    (function () {
        
        SimplexNoise = function(options) {
            options = options || {};

            var getGradientsAt = (function (random) {
                var GRADIENTS_2D = [[1,1],[-1,1],[1,-1],[-1,-1],[0,1],[1,0],[0,-1],[-1,0]];
                var NUM_GRADIENTS_2D = GRADIENTS_2D.length;
                var randomKernel = [];

                for(var i = 0; i < 512; i++) {
                    randomKernel[i] = floor(random()*256);
                }

                return function (tileIndex, triangleFactor) {
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
                };
            })(options.random || Math.random);

            return {
                noise2D: (function (triangleSize) {
                    var SQRT_3 = Math.sqrt(3);
                    var SKEW_PIXEL_TO_GRID_2D = (SQRT_3 - 1) / 2;
                    var SKEW_GRID_TO_PIXEL_2D = (SQRT_3 - 3) / 6;
                    var scaleFactor = SKEW_PIXEL_TO_GRID_2D / triangleSize;

                    return function (xin, yin) {
                        xin *= scaleFactor;
                        yin *= scaleFactor;

                        var posOnTileGrid = skew(xin, yin, SKEW_PIXEL_TO_GRID_2D);
                        var tileOrigin = [floor(posOnTileGrid[0]), floor(posOnTileGrid[1])];
                        var pixOrigin = skew(tileOrigin[0], tileOrigin[1], SKEW_GRID_TO_PIXEL_2D);

                        var pixDeltaFromOrigin = [xin-pixOrigin[0], yin-pixOrigin[1]];
                        var triangleFactor = pixDeltaFromOrigin[0] > pixDeltaFromOrigin[1] ? [1,0] : [0,1];

                        var corners = [
                            [
                                pixDeltaFromOrigin[0],
                                pixDeltaFromOrigin[1]
                            ],
                            [
                                pixDeltaFromOrigin[0] - triangleFactor[0] - SKEW_GRID_TO_PIXEL_2D,
                                pixDeltaFromOrigin[1] - triangleFactor[1] - SKEW_GRID_TO_PIXEL_2D
                            ],
                            [
                                pixDeltaFromOrigin[0] - 1.0 + 2.0*-SKEW_GRID_TO_PIXEL_2D,
                                pixDeltaFromOrigin[1] - 1.0 + 2.0*-SKEW_GRID_TO_PIXEL_2D
                            ]
                        ];
                        var cornerGradients = getGradientsAt(tileOrigin, triangleFactor);
                        
                        var totalMagnitude = 0;
                        for (var i = 0; i < corners.length; i++) {
                            totalMagnitude += calculateEffect(corners[i], cornerGradients[i]);
                        }
                        return 70.0 * totalMagnitude;
                    }
                })(options.triangleSize || 64)
            };
        };
    })();

})();