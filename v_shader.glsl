#version 300 es // the version of GLSL used by WebGL 2.0

precision highp float; // set the default precision of floating point numbers

uniform vec2 u_resolution; // the resolution of the canvas

in vec2 a_position; // the input variable from the vertex buffer
out vec4 v_color; // the output variable from the vertex shader (input to the fragment shader)

void main() 
{
    vec2 clipSpace = (a_position / u_resolution);

    // Flip y coordinate because WebGL's y axis is opposite to pixel coordinates
    clipSpace.y = -clipSpace.y;

    gl_Position = vec4(clipSpace, 0.0, 1.0);
    v_color = gl_Position * 0.5 + 0.5; // Example coloring based on position
}
