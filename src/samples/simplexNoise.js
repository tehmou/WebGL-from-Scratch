var SimplexNoise = function(random) {
    random = random || Math.random;

    var SQRT_3 = Math.sqrt(3);
    var F2 = .5 * (SQRT_3 - 1);
    var G2 = (3 - SQRT_3) / 6;

    var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    var perm = [];

    for(var i = 0; i < 512; i++) {
        perm[i] = ~~(random()*256);
    }

    function dot (g, x, y, z) {
        return g[0]*(x||0) + g[1]*(y||0) + g[2]*(z||0);
    }

    function getGradientAt (i, j, i1, j1) {
        var ii = i % 255;
        var jj = j % 255;
        return [
            perm[ii+perm[jj]] % 12,
            perm[ii+i1+perm[jj+j1]] % 12,
            perm[ii+1+perm[jj+1]] % 12
        ];
    }

    function calculateEffect (x0, y0, g) {
        var t0 = 0.5 - x0*x0-y0*y0;
        if(t0 < 0) {
            return 0.0;
        } else {
            t0 *= t0;
            return t0 * t0 * dot(grad3[g], x0, y0);
        }
    }

    function noise2D (xin, yin) {
        var s = (xin+yin)*F2;
        var i = ~~(xin+s);
        var j = ~~(yin+s);
        var t = (i+j)*G2;

        var X0 = i-t;
        var Y0 = j-t;
        var x0 = xin-X0;
        var y0 = yin-Y0;

        var i1, j1;
        if (x0 > y0) {
            i1=1;
            j1=0;
        } else {
            i1=0;
            j1=1;
        }

        var x1 = x0 - i1 + G2;
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2;
        var y2 = y0 - 1.0 + 2.0 * G2;

        var g = getGradientAt(i, j, i1, j1);

        var n0 = calculateEffect(x0, y0, g[0]);
        var n1 = calculateEffect(x1, y1, g[1]);
        var n2 = calculateEffect(x2, y2, g[2]);

        return 70.0 * (n0 + n1 + n2);
    }
    
    return {
        noise2D: noise2D
    };
};