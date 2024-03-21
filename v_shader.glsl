#version 300 es // the version of GLSL used by WebGL 2.0

precision highp float; // set the default precision of floating point numbers

uniform mat3 u_matrix; // the matrix to transform the position
in vec2 a_position; // the input variable from the vertex buffer
out vec4 v_color; // the output variable from the vertex shader (input to the fragment shader)

void main() 
{
    gl_Position = vgl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1); // set the position
    v_color = gl_Position * 0.5 + 0.5; // set the color to the position
}

