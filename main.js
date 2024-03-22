"use strict";

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
    if(!canvas)
    {
        console.log("Error: Canvas not found");
        return;
    }

    const gl = canvas.getContext("webgl2");
    if (!gl)
    {
        console.log("WebGL2 not supported");
        return;
    }


    // set up program
    const program = createProgramFromSources(gl, v_shader, f_shader); // create program from shaders
    if(program == null)
    {
        console.log("Error: Program not created");
        return;
    }

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    if(positionAttributeLocation == -1)
    {
        console.log("Error: Attribute not found");
        return;
    }
    console.log("Attribute location: " + positionAttributeLocation);

    // create set of attributes
    const vao = gl.createVertexArray(); // create vertex array object; contains vertex data, buffer objects, index buffer objects...
    if (!vao) 
    {
        console.error('Failed to create vertex array object (VAO).');
        return;
    }

    gl.bindVertexArray(vao); // bind vertex array object

    // create buffer
    const positionBuffer = gl.createBuffer(); // create buffer
    if (!positionBuffer) 
    {
        console.error('Failed to create buffer object.');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // bind buffer

    // final error check
    const error = gl.getError();
    if (error !== gl.NO_ERROR) 
    {
        console.error('WebGL Error occurred:', error);
        gl.deleteBuffer(positionBuffer);
        gl.deleteVertexArray(vao);
        return;
    }
    
    let intervalId = setInterval(() => 
    {
        const count = loadData(gl, positionAttributeLocation);
        drawScene(gl, program, vao, canvas, count);
    }, 100);
}

function drawScene(gl, program, vao, canvas, count)
{
    if(resizeCanvasToDisplaySize(canvas))
    {
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // set viewport; area of canvas to draw to


    console.log("Viewport set");

    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    console.log("Canvas cleared");

    gl.useProgram(program); // use program
    console.log("Program set")

    // set the resolution uniform (after resizing the canvas and after useProgram)
    const canvasSizeLocation = gl.getUniformLocation(program, "u_resolution");
    if(canvasSizeLocation == null)
    {
        console.log("Error: Uniform not found");
        return;
    }

    gl.uniform2f(canvasSizeLocation, canvas.width, canvas.height);

    // bind vertex array object
    gl.bindVertexArray(vao);
    console.log("Vertex array object set");

    const offset = 0;
    gl.drawArrays(gl.LINE_STRIP, offset, count); // parameters: mode, first, count
    console.log("Drawn");
}

// write function to resize the canvas to display size

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


function loadData(gl, positionAttributeLocation)
{
    // set up geometry
    const count = set_geometry(gl);

    // tell position attribute how to get data out of position buffer
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position, mostly used for interleaved data
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset); // turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    // draw
    console.log("Count: " + count);


    return count
}
