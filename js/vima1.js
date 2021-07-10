main();

function main() {
    const canvas = document.querySelector('#main_canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Εάν δεν επιστρέψει το webgl module, τότε το πρόγραμμα κλείνει
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
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
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

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
    const buffers = initBuffers(gl);

    // Rendering
    function render(cameraPosition) {
        drawScene(gl, programInfo, buffers, cameraPosition);
    }
    requestAnimationFrame(render([5, 5, 5]));
}

function initBuffers(gl) {
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
    const faceColors = [
        [0.3, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.4, 1.0],
        [0.5, 1.0, 0.2, 1.0],
        [0.1, 1.0, 0.1, 1.0],
        [0.3, 1.0, 0.3, 1.0],
        [0.35, 1.0, 0.2, 1.0],
    ];

    // Μετατρόπη των χρωμάτων σε πίνακα για όλα τα σήμεια.
    let colors = [];
    for (let j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

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
        color: colorBuffer,
        indices: indexBuffer,
    };
}

function drawScene(gl, programInfo, buffers, cameraPosition) {
    gl.clearColor(0.17, 0.18, 0.2, 1.0) // Γεμίζει το background με σκούρο γκρι
    gl.clearDepth(1.0); // Καθαρίζει τα πάντα
    gl.enable(gl.DEPTH_TEST); // Ενεργοποίει το βάθος
    gl.depthFunc(gl.LEQUAL); // Τα κοντινά αντικείμενα εμποδίζουν τα μακρινά.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Δημιουργία πίνακα οπτικής της κάμερας με τα εξής χαρακτηριστίκα:
    const fieldOfView = Math.PI / 2; // Γωνία θέασης
    const aspect = 1; // Αναλογία διαστάσεων
    const zNear = 0.01; // Κοντινό κατώφλι
    const zFar = 20.0; // Μακρινό κατώφλι
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
    glMatrix.mat4.lookAt(modelViewMatrix, cameraPosition, [0, 0, 0], [1, 0, 0]);

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
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
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

function initShaderProgram(gl, vsSource, fsSource) {
    // Μεταγλώττιση των shaders
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

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

function loadShader(gl, type, source) {
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