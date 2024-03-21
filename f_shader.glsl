#version 300 es // the version of GLSL used by WebGL 2.0

precision highp float; // set the default precision of floating point numbers

in vec4 v_color; // the color of the vertex from the vertex shader
out vec4 out_color; // the color of the fragment to be output

void main() 
{
    out_color = v_color; // set the color of the fragment to the color of the vertex
}







