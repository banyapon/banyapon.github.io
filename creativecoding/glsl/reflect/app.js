let wiggleShader;

let vertSrc = `
precision highp float;

attribute vec3 aPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vVertexColor;

uniform float time;

void main() {
  vec3 position = aPosition;

  // Add an offset per vertex. There will be a time delay based
  // on the texture coordinates.
  position.y += 20.0 * sin(time * 0.01 + position.y * 0.1);

  // Apply the transformations that have been set in p5
  vec4 viewModelPosition = uModelViewMatrix * vec4(position, 1.0);

  // Tell WebGL where the vertex should be drawn
  gl_Position = uProjectionMatrix * viewModelPosition;  

  // Pass along the color of the vertex to the fragment shader
  vVertexColor = aVertexColor;
}
`;

let fragSrc = `
precision highp float;

// Receive the vertex color from the vertex shader
varying vec4 vVertexColor;

void main() {
  // Color the pixel with the vertex color
  gl_FragColor = vVertexColor;
}
`;

let ribbons = [];
let angle = 0;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("canvas-container");
  wiggleShader = createShader(vertSrc, fragSrc);

  // Add ribbons with different colors
  ribbons.push(createRibbon(color('#FF5733'), color('#FFC300'), color('#DAF7A6'))); // Ribbon 1: Orange → Yellow → Light Green
  ribbons.push(createRibbon(color('#C70039'), color('#900C3F'), color('#581845'))); // Ribbon 2: Red → Purple → Dark Purple
  ribbons.push(createRibbon(color('#154360'), color('#1F618D'), color('#85C1E9'))); // Ribbon 3: Dark Blue → Blue → Sky Blue
  ribbons.push(createRibbon(color('#F39C12'), color('#F1C40F'), color('#27AE60'))); // Ribbon 4: Gold → Yellow → Green
  ribbons.push(createRibbon(color('#6C3483'), color('#A569BD'), color('#EBDEF0'))); // Ribbon 5: Purple → Lavender → Light Pink
}

function createRibbon(startColor, midColor, endColor) {
  const detail = 50; // Number of points along the ribbon
  let vertices = [];

  // Generate vertices for the ribbon
  for (let i = 0; i < detail; i++) {
    let t = map(i, 0, detail - 1, 0, TWO_PI); // Parameter for the helix

    // Create helix shape
    let x = cos(t) * (width / 4); // Circular motion in X
    let y = map(i, 0, detail - 1, -height / 3, height / 3); // Linear movement in Y
    let z = sin(t) * (width / 4); // Circular motion in Z

    // Gradient logic for the colors
    let col;
    if (i < detail / 2) {
      col = lerpColor(startColor, midColor, i / (detail / 2));
    } else {
      col = lerpColor(midColor, endColor, (i - detail / 2) / (detail / 2));
    }

    vertices.push({ x, y, z, col });
  }

  return vertices;
}

function drawRibbon(vertices) {
  noStroke();

  beginShape(QUAD_STRIP);
  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];
    fill(v.col);
    vertex(v.x, v.y, v.z - 50); // Near side
    vertex(v.x, v.y, v.z + 50); // Far side
  }
  endShape();
}

function draw() {
  background(30);
  noStroke();

  // Automatic orbit control
  angle += 0.01;
  camera(cos(angle) * 1000, sin(angle) * 1000, 600, 0, 0, 0, 0, 1, 0);

  rotateX(PI * 0.1);

  // Use the vertex shader
  shader(wiggleShader);

  // Pass the shader the current time
  wiggleShader.setUniform('time', millis());

  // Draw each ribbon at a different Y-offset
  for (let i = 0; i < ribbons.length; i++) {
    push();
    translate(0, -200 + i * 100, 0); // Offset each ribbon in the Y-direction
    drawRibbon(ribbons[i]);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
