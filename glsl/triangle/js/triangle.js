const canvas = document.getElementById('glCanvas');
        let gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
            alert('WebGL is not supported by your browser.');
        } else {
            console.log('WebGL context successfully created.');

            // ตั้งค่าสีพื้นหลัง
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // สร้าง buffer สำหรับเก็บพิกัดของ vertices
            const vertices = new Float32Array([
                -0.5, -0.5, 0.0,
                 0.5, -0.5, 0.0,
                 0.0,  0.5, 0.0
            ]);

            // สร้าง buffer
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            // สร้าง shader
            const vertexShaderSource = `
                attribute vec3 a_position;
                varying vec3 v_position;
                uniform mat4 u_rotationMatrix;
                void main() {
                    gl_Position = u_rotationMatrix * vec4(a_position, 1.0);
                    v_position = a_position;
                }
            `;

            const fragmentShaderSource = `
                precision mediump float;
                varying vec3 v_position;
                void main() {
                    // คำนวณระยะห่างจากจุดศูนย์กลาง (0,0)
                    float distance = length(v_position.xy);

                    // กำหนดสี gradient จากส้มไปเหลือง
                    vec3 colorStart = vec3(1.0, 0.5, 0.0); // สีส้ม
                    vec3 colorEnd = vec3(1.0, 1.0, 0.0);   // สีเหลือง

                    // ผสมสีตามระยะห่าง
                    vec3 color = mix(colorStart, colorEnd, distance);
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

            // สร้างและลิงค์โปรแกรม
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            const positionLocation = gl.getAttribLocation(program, 'a_position');
            const rotationMatrixLocation = gl.getUniformLocation(program, 'u_rotationMatrix');

            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

            // ฟังก์ชันสร้างเมทริกซ์การหมุน
            function getRotationMatrix(angle) {
                const c = Math.cos(angle);
                const s = Math.sin(angle);
                return new Float32Array([
                    c, 0, s, 0,
                    0, 1, 0, 0,
                    -s, 0, c, 0,
                    0, 0, 0, 1
                ]);
            }

            // ฟังก์ชัน render เพื่อวาดและหมุนสามเหลี่ยม
            function render(time) {
                time *= 0.001; // แปลงเวลาเป็นวินาที

                // สร้างเมทริกซ์การหมุน
                const rotationMatrix = getRotationMatrix(time);
                gl.uniformMatrix4fv(rotationMatrixLocation, false, rotationMatrix);

                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                requestAnimationFrame(render);
            }

            requestAnimationFrame(render);
        }