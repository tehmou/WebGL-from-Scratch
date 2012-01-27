precision mediump float; /* required */

// The 'original' content rendering in a texture.
uniform sampler2D s_texture;

// ================ Shader parameters ======================== //
uniform float amplitude; /* unused in this fragment shader */
uniform float amount;
// ============== End shader parameters ====================== //

varying vec2 v_texCoord;

// The desired 'color swipe' color.
const vec4 swipeColor = vec4(1.0, 1.0, 1.0, 1.0); 

vec4 grayscale(vec4 color) {
    ...; 
    return gray;
}

void main() {
    vec4 color = texture2D(s_texture, v_texCoord);
    vec4 gray = grayscale(color);
    vec2 pos = v_texCoord;

    float p = 1.0 - pos.y; /* progress from bottom to top */
    
    vec4 sc = swipeColor * color.a;
    float threshold = amount * 1.2;
    if (p < threshold) {
        float a = min(abs(threshold - p) / 0.2, 1.0);    
        gl_FragColor = mix(sc, color, a);
    } else {
        float a = min(abs(threshold - p) / 0.005, 1.0);
        gl_FragColor = mix(sc, gray, a);
    }
}