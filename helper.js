// write function to generate geometry
function set_geometry(gl)
{
    const positions = [];

    // necessary variables
    let ratio = 3000;
    let angle = -(Math.PI + Math.random() * Math.PI);
    let radius = 2;

    // create a spiral pattern
    let count = 0;
    while(radius > 1)
    {
        radius = ratio;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        console.log(x, y);

        positions.push(x, y);

        ratio *= .99;
        angle += 1;
        count++;
    }

    console.log(positions);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // load data into buffer

    return count;
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


function createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource) 
{
    function compileShader(gl, source, type) 
    {
        const shader = gl.createShader(type);
        if (!shader) 
        {
            console.error('Error creating shader.');
            return null;
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
        {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    if (!vertexShader) 
    {
        // Vertex shader compilation failed, no need to proceed further.
        return null;
    }

    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!fragmentShader) 
    {
        // Fragment shader compilation failed, cleanup vertex shader before exiting.
        gl.deleteShader(vertexShader);
        return null;
    }

    const program = gl.createProgram();
    if (!program) 
    {
        console.error('Error creating shader program.');
        // Cleanup shaders before exiting.
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check the link status
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        // Cleanup resources before exiting.
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
    }

    // At this point, the shaders are linked to the program and can be deleted to clean up resources.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
}
