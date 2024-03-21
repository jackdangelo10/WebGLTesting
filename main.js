"use strict";

var simplex = new SimplexNoise();

try
{
    main();
}
catch(error)
{
    console.log("Error: ", error);
}



async function main()
{
    // retrieve shader glsl files
    const v_shader = await get_shader("v_shader.glsl");
    if (v_shader == null)
    {
        console.log("Error: Vertex shader not found");
        return;
    }

    const f_shader = await get_shader("f_shader.glsl");
    if (f_shader == null)
    {
        console.log("Error: Fragment shader not found");
        return;
    }

    console.log(v_shader);
    console.log(f_shader);

    // get canvas
    const canvas = document.querySelector("#webglCanvas");
    const gl = canvas.getContext("webgl2");

    if (!gl)
    {
        console.log("WebGL2 not supported");
        return;
    }


    // set up program
    const program = createProgramFromSources(gl, v_shader, f_shader); // create program from shaders

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // create set of attributes
    const vao = gl.createVertexArray(); // create vertex array object; contains vertex data, buffer objects, index buffer objects...
    gl.bindVertexArray(vao); // bind vertex array object

    // create buffer
    const positionBuffer = gl.createBuffer(); // create buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // bind buffer

    // set up geometry
    const count = set_geometry(gl);

    // tell position attribute how to get data out of position buffer
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position, mostly used for interleaved data
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset); // turn on the attribute
    // draw
    console.log("Count: " + count);
    drawScene(gl, program, vao, canvas, count);

}

function drawScene(gl, program, vao, canvas, count)
{
    if(resizeCanvasToDisplaySize(canvas))
    {
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // set viewport; area of canvas to draw to




    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program); // use program

    // uniform resolution
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // bind vertex array object
    gl.bindVertexArray(vao);

    const offset = 0;
    gl.drawArrays(gl.LINE_STRIP, offset, count); // parameters: mode, first, count
}

// write functino to resize the canvas to display size

function resizeCanvasToDisplaySize(canvas)
{
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

    if (needResize)
    {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}