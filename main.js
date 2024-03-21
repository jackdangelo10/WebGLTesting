"use strict";

var simplex = new SimplexNoise();

function main()
{
    // retrieve shader glsl files
    const v_shader = get_shader("v_shader.glsl");
    if (v_shader == null)
    {
        console.log("Error: Vertex shader not found");
        return;
    }

    const f_shader = get_shader("f_shader.glsl");
    if (f_shader == null)
    {
        console.log("Error: Fragment shader not found");
        return;
    }

    // get canvas
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2");

    if (!gl)
    {
        console.log("WebGL2 not supported");
        return;
    }

    // set up program
    const program = webglUtils.createProgramFromSources(gl, [v_shader, f_shader]); // create program from shaders

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // look up uniform locations
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // create set of attributes
    const vao = gl.createVertexArray(); // create vertex array object; contains vertex data, buffer objects, index buffer objects...
    gl.bindVertexArray(vao); // bind vertex array object

    // create buffer
    const positionBuffer = gl.createBuffer(); // create buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // bind buffer

    // set up geometry
    set_geometry(gl);

    // tell position attribute how to get data out of position buffer
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position, mostly used for interleaved data
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset); // turn on the attribute

    // transformation variables
    const translation = [200, 150];
    const angleInRadians = 0;
    const scale = [1, 1];

    // draw
    drawScene(gl, program, vao, matrixLocation, translation, angleInRadians, scale);

    // UI
    webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
    webglLessonsUI.setupSlider("#angle",  {slide: updateAngle, max: 360});
    webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

}

function updatePosition(index)
{
    return function(event, ui)
    {
        translation[index] = ui.value;
        drawScene();
    };
}

function updateAngle(event, ui)
{
    const angleInDegrees = 360 - ui.value;
    const angleInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
}

function updateScale(index)
{
    return function(event, ui)
    {
        scale[index] = ui.value;
        drawScene();
    };
}


function drawScene(gl, program, vao, matrixLocation, translation, angleInRadians, scale)
{
    webglUtils.resizeCanvasToDisplaySize(gl.canvas); // resize canvas

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // set viewport; area of canvas to draw to

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // compute the matrix
    const matrix = m3.projection(gl.canvas.width, gl.canvas.height); // create projection matrix
    matrix = m3.translate(matrix, translation[0], translation[1]); // parameters: matrix, x, y
    matrix = m3.rotate(matrix, angleInRadians); // parameters: matrix, angle
    matrix = m3.scale(matrix, scale[0], scale[1]); // parameters: matrix, x, y

    gl.useProgram(program); // use program

    // bind vertex array object
    gl.bindVertexArray(vao);

    // set the matrix
    gl.uniformMatrix3fv(matrixLocation, false, matrix); // parameters: location, transpose, value

    const offset = 0;
    const count = 4;
    gl.drawArrays(gl.LINE_STRIP, offset, count); // parameters: mode, first, count


}

// write function to generate geometry
function set_geometry(gl)
{
    const positions = new Float32Array();

    // necessary variables
    let ratio = Math.random() * 100 + 100;
    let angle = Math.random() * Math.PI * 2;
    let radius = 2;


    while(radius > 1)
    {
        radius = ratio * simplex.noise1D(angle);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        positions.push(x, y);

        ratio *= 0.99;
        angle += .1;
    }

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW); // load data into buffer
}


// write function to get shaders from html
async function get_shader(url)
{
    try
    {
        const response = await fetch(url);
        if(!response.ok)
        {
            throw new Error("HTTP error, status = " + response.status);
        }

        const text = await response.text();
        return text;
    }
    catch(error)
    {
        console.log("Error: ", error);
        return null;
    }
}