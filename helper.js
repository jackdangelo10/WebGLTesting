// write function to generate geometry
function set_geometry(gl)
{
    const positions = [];

    // necessary variables
    let ratio = Math.random() * 200 + 100;
    let angle = Math.random() * Math.PI * 2;
    let radius = 2;

    let count = 0;
    while(radius > 1)
    {
        radius = ratio * simplex.noise2D(angle,0);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        positions.push(x, y);

        ratio *= 0.99;
        angle += .01;
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
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}