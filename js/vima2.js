const canvas = document.querySelector('#main_canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

// Εάν δεν επιστρέψει το webgl module, τότε το πρόγραμμα κλείνει
if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
}

// Vertex shader program
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying lowp vec4 vColor;
void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vColor = aVertexColor;
}
`;

// Fragment shader program
const fsSource = `
varying lowp vec4 vColor;
void main(void) {
  gl_FragColor = vColor;
}
`;

// Αρχικοποίηση του shader προγράμματος.
const shaderProgram = initShaderProgram();
// Collect all the info needed to use the shader program.
// Look up which attributes our shader program is using
// for aVertexPosition, aVertexColor and also
// look up uniform locations.
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    }
};

// Αρχικοποίηση των buffers
const buffers = initBuffers();

main();

function goToMove1() {
    window.location = "vima1.html"
}

function goToMove3() {
    window.location = "vima3.html"
}

function changeCameraPosition() {
    const radiant = document.getElementById("radian").value;
    const viewDistance = document.getElementById("view_distance").value;
    const cameraOptions = document.querySelectorAll('input[name="camera_option"]');

    let cameraOption;
    for (const radioButton of cameraOptions) {
        if (radioButton.checked) {
            cameraOption = radioButton.value;
            break;
        }
    }

    let cameraPosition;
    switch (cameraOption) {
        case 'left_front_top':
            cameraPosition = [-viewDistance, -viewDistance, viewDistance];
            break;

        case 'left_front_bottom':
            cameraPosition = [-viewDistance, -viewDistance, -viewDistance];
            break;

        case 'left_back_top':
            cameraPosition = [-viewDistance, viewDistance, viewDistance];
            break;

        case 'left_back_bottom':
            cameraPosition = [-viewDistance, viewDistance, -viewDistance];
            break;

        case 'right_front_top':
            cameraPosition = [viewDistance, -viewDistance, viewDistance];
            break;

        case 'right_front_bottom':
            cameraPosition = [viewDistance, -viewDistance, -viewDistance];
            break;

        case 'right_back_top':
            cameraPosition = [viewDistance, viewDistance, viewDistance];
            break;

        case 'right_back_bottom':
            cameraPosition = [viewDistance, viewDistance, -viewDistance];
            break;

        default:
            alert("Παρακαλώ, επιλέξτε μία επιλογή");
    }

    drawScene(radiant, viewDistance, cameraPosition);
}

function main() {
    // Rendering
    function render() {
        drawScene(60, 25, [25, 25, 25]);
    }
    requestAnimationFrame(render);
}

function initBuffers() {
    // Η δημιουργία και η σύνδεση των buffers των συντεταγμένων
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Οι συντεταγμένες του κύβου
    const positions = [
        // Front face
        -1.0, -1.0, 1.0, // 0
        1.0, -1.0, 1.0, // 1
        1.0, 1.0, 1.0, // 2
        -1.0, 1.0, 1.0, // 3

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ];

    // Μετασχηματισμός των συντεταγμένων σε πίνακα που αποτελείται από 32 bit Float αριθμών
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Πίνακας που βάζει χρώματα σε κάθε όψη του κύβου. Όλα είναι αποχρώσεις του πράσινου
    // White
    const faceHeadColors = [
        [0.91, 0.91, 0.91, 1.0],
        [1.00, 1.00, 1.00, 1.0],
        [0.78, 0.78, 0.87, 1.0],
        [0.72, 0.72, 0.87, 1.0],
        [0.66, 0.66, 0.78, 1.0],
        [0.62, 0.60, 0.60, 1.0]
    ];

    // Red
    const faceFeetColors1 = [
        [0.88, 0.11, 0.16, 1.0],
        [0.69, 0.22, 0.23, 1.0],
        [0.78, 0.21, 0.13, 1.0],
        [0.69, 0.11, 0.16, 1.0],
        [0.55, 0.11, 0.16, 1.0],
        [0.54, 0.01, 0.01, 1.0]
    ];

    // Yellow
    const faceFeetColors2 = [
        [1.00, 1.00, 0.00, 1.0],
        [1.00, 1.00, 0.31, 1.0],
        [1.00, 0.91, 0.31, 1.0],
        [1.00, 0.81, 0.31, 1.0],
        [0.83, 0.60, 0.01, 1.0],
        [0.91, 0.76, 0.44, 1.0],
    ];

    // Green
    const faceFeetColors3 = [
        [0.14, 0.83, 0.09, 1.0],
        [0.13, 0.76, 0.43, 1.0],
        [0.13, 0.66, 0.43, 1.0],
        [0.01, 0.66, 0.25, 1.0],
        [0.00, 0.59, 0.00, 1.0],
        [0.33, 0.81, 0.43, 1.0],
    ];


    // Blue
    const faceFeetColors4 = [
        [0.05, 0.31, 0.96, 1.0],
        [0.04, 0.54, 0.96, 1.0],
        [0.04, 0.43, 0.79, 1.0],
        [0.01, 0.27, 0.74, 1.0],
        [0.28, 0.36, 0.75, 1.0],
        [0.01, 0.21, 0.62, 1.0]
    ];

    // Μετατρόπη των χρωμάτων σε πίνακα για όλα τα σήμεια.
    let headColors = [];
    for (let j = 0; j < faceHeadColors.length; ++j) {
        const c = faceHeadColors[j];
        headColors = headColors.concat(c, c, c, c);
    }

    const headColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, headColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headColors), gl.STATIC_DRAW);

    // Μετατρόπη των χρωμάτων σε πίνακα για όλα τα σήμεια.
    let feetColors1 = [];
    for (let j = 0; j < faceFeetColors1.length; ++j) {
        const c = faceFeetColors1[j];
        feetColors1 = feetColors1.concat(c, c, c, c);
    }

    let feetColors2 = [];
    for (let j = 0; j < faceFeetColors2.length; ++j) {
        const c = faceFeetColors2[j];
        feetColors2 = feetColors2.concat(c, c, c, c);
    }

    let feetColors3 = [];
    for (let j = 0; j < faceFeetColors3.length; ++j) {
        const c = faceFeetColors3[j];
        feetColors3 = feetColors3.concat(c, c, c, c);
    }

    let feetColors4 = [];
    for (let j = 0; j < faceFeetColors4.length; ++j) {
        const c = faceFeetColors4[j];
        feetColors4 = feetColors4.concat(c, c, c, c);
    }

    const feetColorBuffers = [];

    const feetColorBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, feetColorBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(feetColors1), gl.STATIC_DRAW);
    feetColorBuffers.push(feetColorBuffer1);

    const feetColorBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, feetColorBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(feetColors2), gl.STATIC_DRAW);
    feetColorBuffers.push(feetColorBuffer2);

    const feetColorBuffer3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, feetColorBuffer3);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(feetColors3), gl.STATIC_DRAW);
    feetColorBuffers.push(feetColorBuffer3);

    const feetColorBuffer4 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, feetColorBuffer4);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(feetColors4), gl.STATIC_DRAW);
    feetColorBuffers.push(feetColorBuffer4);

    // Δημιουργία indexBuffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Οι συνδέσεις του κύβου
    const indices = [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        headColor: headColorBuffer,
        feetColor: feetColorBuffers,
        indices: indexBuffer
    };
}

function drawScene(radiant, viewDistance, cameraPosition) {
    gl.clearColor(0.17, 0.18, 0.2, 1.0) // Γεμίζει το background με σκούρο γκρι
    gl.clearDepth(1.0); // Καθαρίζει τα πάντα
    gl.enable(gl.DEPTH_TEST); // Ενεργοποίει το βάθος
    gl.depthFunc(gl.LEQUAL); // Τα κοντινά αντικείμενα εμποδίζουν τα μακρινά.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Δημιουργία πίνακα οπτικής της κάμερας με τα εξής χαρακτηριστίκα:
    const fieldOfView = radiant * Math.PI / 180; // Γωνία θέασης
    const aspect = 1; // Αναλογία διαστάσεων
    const zNear = 0.01; // Κοντινό κατώφλι
    const zFar = 4 * viewDistance; // Μακρινό κατώφλι
    const projectionMatrix = glMatrix.mat4.create();

    // Χρήση της βιβλιοθήκης glMatrix
    glMatrix.mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Δημιουργία πίνακα που κρατάει τις συντεταγμένες της κάμερας
    const modelViewMatrix = glMatrix.mat4.create();

    // Μετακίνηση της κάμερας στο σημείο cameraPosition βλέποντας στο σημείο (0,0,0) προς τον άξονα z
    // Την πρώτη φόρα, η τιμή του cameraPosition είναι (5,5,5)
    glMatrix.mat4.lookAt(modelViewMatrix, cameraPosition, [0, 0, 0], [0, 0, 1]);

    drawTable(projectionMatrix, modelViewMatrix);

    const chairMatrix = glMatrix.mat4.clone(modelViewMatrix);
    glMatrix.mat4.scale(chairMatrix, chairMatrix, [0.5, 0.5, 0.5]);
    glMatrix.mat4.translate(chairMatrix, chairMatrix, [-19.5, 0, -20]);
    drawTable(projectionMatrix, chairMatrix);

    const chairBack = glMatrix.mat4.clone(modelViewMatrix);
    glMatrix.mat4.scale(chairBack, chairBack, [0.25, 5, 5]);
    glMatrix.mat4.translate(chairBack, chairBack, [-60, 0, -1]);
    drawCube(projectionMatrix, chairBack, buffers.feetColor[2]);
}

function drawTable(projectionMatrix, modelViewMatrix) {
    // Σχεδιασμός δαπέδου
    const headMatrix = glMatrix.mat4.clone(modelViewMatrix);
    glMatrix.mat4.scale(headMatrix, headMatrix, [10, 10, 0.5]);
    glMatrix.mat4.translate(headMatrix, headMatrix, [0, 0, 0.5]);
    drawCube(projectionMatrix, headMatrix, buffers.headColor);

    // Σχεδιασμός ποδιών
    let count = 0;
    for (let xPoss = -19; xPoss < 21; xPoss += 38)
        for (let yPoss = -19; yPoss < 21; yPoss += 38) {
            const feetMatrix = glMatrix.mat4.clone(modelViewMatrix);
            glMatrix.mat4.scale(feetMatrix, feetMatrix, [0.5, 0.5, 10]);
            glMatrix.mat4.translate(feetMatrix, feetMatrix, [xPoss, yPoss, -1.02]);
            drawCube(projectionMatrix, feetMatrix, buffers.feetColor[count++]);
        }
}

function drawCube(projectionMatrix, modelViewMatrix, colorBuffer) {
    // Αντιστοίχιση των συντεταγμένων από τον buffer στο vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Αντιστοίχηση χρωμάτων από τον buffer στο vertexColor attribute
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Αντιστοιχηση γραμμών με σημείων
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

function initShaderProgram() {
    // Μεταγλώττιση των shaders
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Ενσωμάτωση shaders στο πρόγραμμα
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Σε περίπτωση αποτυχίας της ενσωμάτωσης
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}