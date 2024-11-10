const canvas = document.getElementById('glCanvas');
let gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

if (!gl) {
    alert('WebGL is not supported by your browser.');
} else {
    console.log('WebGL context successfully created.');
}

// Vertex Shader
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

// Fragment Shader (Sea Wave Effect with Organic Pattern)
// Fragment Shader (Sea Wave Effect with Higher Frequency)
const fragmentShaderSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;

    // ฟังก์ชัน Noise เพื่อสร้างการเคลื่อนไหวแบบสุ่ม
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) +
               (c - a) * u.y * (1.0 - u.x) +
               (d - b) * u.x * u.y;
    }

    // ฟังก์ชันสร้างคลื่นที่มีความถี่สูงขึ้น
    float waves(vec2 uv) {
        // เพิ่มความถี่ของคลื่น
        float wave1 = sin(uv.x * 12.0 + u_time) * 0.5; // ปรับจาก 6.0 เป็น 12.0
        float wave2 = cos(uv.y * 18.0 + u_time * 0.5) * 0.3; // ปรับจาก 9.0 เป็น 18.0
        return wave1 + wave2;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        uv = uv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;

        // สร้างคลื่นน้ำด้วย noise และเพิ่มความถี่
        float n = noise(uv * 10.0 + u_time * 0.2); // ปรับจาก 5.0 เป็น 10.0
        float wavePattern = waves(uv);

        // ปรับค่าของเส้นขอบคลื่น
        float border = smoothstep(0.08, 0.1, abs(n + wavePattern)); // ลดความกว้างของขอบเล็กน้อย

        // กำหนดสี 3 ระดับ
        vec3 color1 = vec3(0.16, 0.62, 0.63); // #289ea0
        vec3 color2 = vec3(0.16, 0.57, 0.63); // #2891a0
        vec3 color3 = vec3(0.16, 0.48, 0.63); // #287ba0

        // ผสมสีตามระดับความสูงของคลื่น
        vec3 color;
        if (border < 0.4) {
            color = mix(color1, color2, border / 0.4);
        } else {
            color = mix(color2, color3, (border - 0.4) / 0.6);
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;



// ฟังก์ชันสำหรับสร้างและคอมไพล์ shader
function createShader(gl, type, source) {
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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const positionLocation = gl.getAttribLocation(program, 'a_position');
const timeLocation = gl.getUniformLocation(program, 'u_time');
const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
]), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// ฟังก์ชัน render เพื่อสร้างการเคลื่อนไหว
function render(time) {
    time *= 0.001;
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
