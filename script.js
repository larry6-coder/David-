const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
    throw new Error("WebGL not supported");
}

// Resize
function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

// Vertex Shader
const vertexShaderSource = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Fragment Shader
const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform vec2 resolution;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    uv -= 0.5;

    uv.x *= resolution.x / resolution.y;

    float x = uv.x;
    float y = uv.y;

    float heart =
        pow(x*x + y*y - 0.3, 3.0)
        - x*x*y*y*y;

    float glow = 0.01 / abs(heart);

    vec3 color = vec3(
        glow * 1.0,
        glow * 0.2,
        glow * 0.5
    );

    gl_FragColor = vec4(color, 1.0);
}
`;

// Compile shader
function createShader(type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        console.error(gl.getShaderInfoLog(shader));

        gl.deleteShader(shader);

        return null;
    }

    return shader;
}

const vertexShader = createShader(
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);

// Program
const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);

// Rectangle
const vertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1
]);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Attribute
const position = gl.getAttribLocation(program, "position");

gl.enableVertexAttribArray(position);

gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

// Uniforms
const timeLocation = gl.getUniformLocation(program, "time");
const resolutionLocation = gl.getUniformLocation(program, "resolution");

// Animation
let time = 0;

function animate() {

    time += 0.01;

    gl.uniform1f(timeLocation, time);

    gl.uniform2f(
        resolutionLocation,
        canvas.width,
        canvas.height
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(animate);
}

animate();
