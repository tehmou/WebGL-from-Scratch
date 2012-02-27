        var TRIANGLE_HEIGHT = Math.sqrt(2)/2;

        // The side we can calculate from the height, and the knowledge
        // we have an equilateral triangle. Our old friend [Pythagoras]
        // helps us here, or you can check [Equilater triangle].
        //
        //   [Equilater triangle]: http://en.wikipedia.org/wiki/Equilateral_triangle
        //   [Pythagoras]: http://en.wikipedia.org/wiki/Pythagorean_theorem
        //
        var TRIANGLE_SIDE = 2*TRIANGLE_HEIGHT/Math.sqrt(3);

        // The value with which we have to multiply each pixel to get the
        // requested size of the effect. The default here is 64, since at that
        // level one can usually see the effect clearly.
        var SCALE_FACTOR = TRIANGLE_SIDE / 100;