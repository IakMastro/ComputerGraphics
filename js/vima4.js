const canvas = document.querySelector('#main_canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

let cameraRotation = [0.0, 0.0];
let rotate = false;

// Εάν δεν επιστρέψει το webgl module, τότε το πρόγραμμα κλείνει
if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
}

// Vertex shader program
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying highp vec2 vTextureCoord;
void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`;

// Fragment shader program
const fsSource = `
varying highp vec2 vTextureCoord;
uniform sampler2D uSample;
void main(void) {
  gl_FragColor = texture2D(uSample, vTextureCoord);
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
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSample: gl.getUniformLocation(shaderProgram, 'uSample'),
    }
};

// Αρχικοποίηση των buffers
const buffers = initBuffers();

let woodTexture = loadTexture("../img/wood.png");
let fabricTexture = loadTexture("../img/fabric.png");
let skyboxTexture = loadTexture("../img/skybox.png");
let floorTexture = loadTexture("../img/floor.png");

let direction = "";
let prevX = 0;
let prevY = 0;
let mouseDown = false;

let wheelDirection = "";
let prevDirection = "down";
let numbersFallenDown = 0;
let level = 0;

document.addEventListener("wheel", function(event) {
    if (event.pageY <= canvas.height && event.pageX <= canvas.width) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.deltaY > 0 && prevDirection !== "up") {
            prevDirection = wheelDirection;
            wheelDirection = "up";

            if (level <= 2) {
                level++;
            }

            if (numbersFallenDown < 4 && level === 2) {
                numbersFallenDown++;
            }
        } else if (event.deltaY < 0 && prevDirection !== "down") {
            prevDirection = wheelDirection;
            wheelDirection = "down";
            if (level >= 0) {
                level--;
            }
        }
    }
}, {passive: false});

document.onmousedown = function(event) {
    mouseDown = true;
}

document.onmouseup = function(event) {
    mouseDown = false;
}

document.onmousemove = function(event) {
    if (event.pageY <= canvas.height && event.pageX <= canvas.width && mouseDown) {
        if (event.pageX < prevX) {
            direction = "left";
            prevX = event.pageX;
        } else if (event.pageX > prevX) {
            direction = "right";
            prevX = event.pageX;
        }

        if (event.pageY < prevY) {
            direction = "top";
            prevY = event.pageY;
        } else if (event.pageY > prevY) {
            direction = "down";
            prevY = event.pageY;
        }
    }
}

main();

function start() {
    rotate = true;
}

function stop() {
    rotate = false;
    console.log("ΚΑΝΕ ΑΚΡΗ ΡΕΕΕΕ");
}

function goToMove3() {
    window.location = "vima3.html";
}

function main() {
    // Rendering
    function render() {
        drawScene(60, 25, [25, 25, 25]);
        requestAnimationFrame(render);
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

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
        // Front
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Back
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Top
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Bottom
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Right
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Left
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

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
        textureCoord: textureCoordBuffer,
        indices: indexBuffer
    };
}

function loadTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image
        );

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
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
    const zFar = 6 * viewDistance; // Μακρινό κατώφλι
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
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, cameraRotation[0], [0, 0, 1]);
    glMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, cameraRotation[1], [1, 0, 0]);

    if (rotate) {
        cameraRotation[0] += 0.001;
    }

    if (mouseDown && direction === "right") {
        cameraRotation[0] += 0.1;
        direction = "";
    } else if (mouseDown && direction === "left") {
        cameraRotation[0] -= 0.1;
        direction = "";
    }

    if (mouseDown && direction === "top") {
        cameraRotation[1] += 0.1;
        direction = "";
    } else if (mouseDown && direction === "down") {
        cameraRotation[1] -= 0.1;
        direction = "";
    }

    drawTable(projectionMatrix, modelViewMatrix, woodTexture, gl.TEXTURE0);

    if (level == 0) {
        const chairMatrix = glMatrix.mat4.clone(modelViewMatrix);
        glMatrix.mat4.scale(chairMatrix, chairMatrix, [0.5, 0.5, 0.5]);
        glMatrix.mat4.translate(chairMatrix, chairMatrix, [-19.5, 0, -20]);
        drawTable(projectionMatrix, chairMatrix, fabricTexture, gl.TEXTURE0);

        const chairBack = glMatrix.mat4.clone(modelViewMatrix);
        if (numbersFallenDown > 3) {
            glMatrix.mat4.scale(chairBack, chairBack, [5, 5, 0.25]);
            glMatrix.mat4.translate(chairBack, chairBack, [-3, 0, -75]);
            glMatrix.mat4.rotate(chairBack, chairBack, 180, [0, 0, 1]);
            glMatrix.mat4.translate(chairBack, chairBack, [1, -3, 0]);
        } else {
            glMatrix.mat4.scale(chairBack, chairBack, [0.25, 5, 5]);
            glMatrix.mat4.translate(chairBack, chairBack, [-60, 0, -1]);
        }

        drawCube(projectionMatrix, chairBack, fabricTexture, gl.TEXTURE1);
    }

    else if (level == 1) {
        const chairMatrix = glMatrix.mat4.clone(modelViewMatrix);
        glMatrix.mat4.scale(chairMatrix, chairMatrix, [0.5, 0.5, 0.5]);
        glMatrix.mat4.translate(chairMatrix, chairMatrix, [-19.5, 0, -20]);
        glMatrix.mat4.rotate(chairMatrix, chairMatrix, 50, [0, 1, 0])
        drawTable(projectionMatrix, chairMatrix, fabricTexture, gl.TEXTURE0);

        const chairBack = glMatrix.mat4.clone(modelViewMatrix);
        if (numbersFallenDown > 3){
            glMatrix.mat4.scale(chairBack, chairBack, [5, 5, 0.25]);
            glMatrix.mat4.translate(chairBack, chairBack, [-3, 0, -75]);
            glMatrix.mat4.rotate(chairBack, chairBack, 180, [0, 0, 1]);
            glMatrix.mat4.translate(chairBack, chairBack, [1, -3, 0]);
        } else {
            glMatrix.mat4.scale(chairBack, chairBack, [0.25, 5, 5]);
            glMatrix.mat4.translate(chairBack, chairBack, [-60, 0, -1]);
        }
        drawCube(projectionMatrix, chairBack, fabricTexture, gl.TEXTURE1);
    }

    else if (level == 2) {
        const chairMatrix = glMatrix.mat4.clone(modelViewMatrix);
        glMatrix.mat4.scale(chairMatrix, chairMatrix, [0.5, 0.5, 0.5]);
        glMatrix.mat4.translate(chairMatrix, chairMatrix, [-19.5, 0, -29]);
        glMatrix.mat4.rotate(chairMatrix, chairMatrix, 80, [0, 1, 0]);
        drawTable(projectionMatrix, chairMatrix, fabricTexture, gl.TEXTURE0);

        const chairBack = glMatrix.mat4.clone(modelViewMatrix);
        glMatrix.mat4.scale(chairBack, chairBack, [5, 5, 0.25]);
        glMatrix.mat4.translate(chairBack, chairBack, [-3, 0, -75]);

        if (numbersFallenDown > 3){
            glMatrix.mat4.rotate(chairBack, chairBack, 180, [0, 0, 1]);
            glMatrix.mat4.translate(chairBack, chairBack, [1, -3, 0]);
        }
        drawCube(projectionMatrix, chairBack, fabricTexture, gl.TEXTURE1);
    }

    const skyboxMatrix = glMatrix.mat4.clone(modelViewMatrix);
    glMatrix.mat4.scale(skyboxMatrix, skyboxMatrix, [60, 60, 60]);
    drawCube(projectionMatrix, skyboxMatrix, skyboxTexture, gl.TEXTURE0);

    const floorMatrix = glMatrix.mat4.clone(modelViewMatrix);
    glMatrix.mat4.scale(floorMatrix, floorMatrix, [25, 25, 0.5]);
    glMatrix.mat4.translate(floorMatrix, floorMatrix, [0, 0, -40]);
    drawCube(projectionMatrix, floorMatrix, floorTexture, gl.TEXTURE0);
}

function drawTable(projectionMatrix, modelViewMatrix, texture, index) {
    // Σχεδιασμός δαπέδου
    const headMatrix = glMatrix.mat4.clone(modelViewMatrix);
    glMatrix.mat4.scale(headMatrix, headMatrix, [10, 10, 0.5]);
    glMatrix.mat4.translate(headMatrix, headMatrix, [0, 0, 0.5]);
    drawCube(projectionMatrix, headMatrix, texture, index);
    
    // Σχεδιασμός ποδιών
    for (let xPoss = -19; xPoss < 21; xPoss += 38)
        for (let yPoss = -19; yPoss < 21; yPoss += 38) {
            const feetMatrix = glMatrix.mat4.clone(modelViewMatrix);
            glMatrix.mat4.scale(feetMatrix, feetMatrix, [0.5, 0.5, 10]);
            glMatrix.mat4.translate(feetMatrix, feetMatrix, [xPoss, yPoss, -1.02]);
            drawCube(projectionMatrix, feetMatrix, texture, index);
        }
}

function drawCube(projectionMatrix, modelViewMatrix, texture, index) {
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
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.textureCoord);
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

    gl.activeTexture(index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSample, 0);

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