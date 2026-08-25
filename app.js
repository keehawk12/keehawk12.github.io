// ============================================================
// CROCHET PATTERN GENERATOR
// ============================================================

let nx = 58;
let ny = 30;

let backgroundColor = "#e2e922";

let canvas;
let ctx;

let flowers = [];

let selectedFlower = -1;

let showRunCounts = false;

let runDirection = "left";

let discretizedPattern = null;

let uploadedImage = null;


// ============================================================
// STARTUP ELEMENTS
// ============================================================

const setupScreen =
    document.getElementById("setupScreen");

const app =
    document.getElementById("app");

const startButton =
    document.getElementById("startButton");

const nxInput =
    document.getElementById("nxInput");

const nyInput =
    document.getElementById("nyInput");

const backgroundColorInput =
    document.getElementById("backgroundColorInput");

const pngInput =
    document.getElementById("pngInput");


// ============================================================
// MAIN ELEMENTS
// ============================================================

canvas =
    document.getElementById("canvas");

ctx =
    canvas.getContext("2d");


// ============================================================
// START APPLICATION
// ============================================================

startButton.addEventListener("click", () => {

    nx = parseInt(nxInput.value);

    ny = parseInt(nyInput.value);

    backgroundColor =
        backgroundColorInput.value;

    if (!Number.isFinite(nx) || nx < 1) {
        alert("nx must be a positive integer.");
        return;
    }

    if (!Number.isFinite(ny) || ny < 1) {
        alert("ny must be a positive integer.");
        return;
    }

    nx = Math.round(nx);
    ny = Math.round(ny);

    initializeCanvas();

    setupScreen.classList.add("hidden");

    app.classList.remove("hidden");

    document.getElementById("nxDisplay")
        .textContent = nx;

    document.getElementById("nyDisplay")
        .textContent = ny;

    document.getElementById("backgroundColor")
        .value = backgroundColor;

    /*
     * If a PNG was selected on the startup screen,
     * load it now.
     */

    if (pngInput.files.length > 0) {

        loadPNG(
            pngInput.files[0]
        );
    }

    draw();
});


// ============================================================
// INITIALIZE CANVAS
// ============================================================

function initializeCanvas() {

    const canvasWidth = 1200;

    const canvasHeight =
        Math.round(
            canvasWidth * ny / nx
        );

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}


// ============================================================
// BACKGROUND COLOR
// ============================================================

const backgroundColorControl =
    document.getElementById("backgroundColor");

backgroundColorControl.addEventListener(
    "input",
    () => {

        backgroundColor =
            backgroundColorControl.value;

        discretizedPattern = null;

        draw();
    }
);


// ============================================================
// PNG UPLOAD
// ============================================================

const objectUpload =
    document.getElementById("objectUpload");

objectUpload.addEventListener(
    "change",
    () => {

        if (objectUpload.files.length === 0) {
            return;
        }

        loadPNG(
            objectUpload.files[0]
        );
    }
);


// ============================================================
// LOAD PNG
// ============================================================

function loadPNG(file) {

    if (!file.type.includes("png")) {

        alert(
            "Please select a PNG image."
        );

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function (event) {

        const img =
            new Image();

        img.onload = function () {

            uploadedImage = img;

            document.getElementById(
                "uploadedFileName"
            ).textContent = file.name;

            /*
             * Clear the existing objects because
             * they were based on the previous image.
             */

            flowers = [];

            selectedFlower = -1;

            /*
             * Automatically create one object
             * using the uploaded image.
             */

            flowers.push(
                createFlower()
            );

            selectedFlower = 0;

            updateControls();

            discretizedPattern = null;

            draw();
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}


// ============================================================
// CREATE FLOWER / OBJECT
// ============================================================

function createFlower() {

    return {

        type: "uploaded",

        x: 0.5,

        y: 0.5,

        rotation: 0,

        scale: 1.0
    };
}


// ============================================================
// ADD OBJECT
// ============================================================

const addFlowerButton =
    document.getElementById("addFlower");

addFlowerButton.addEventListener(
    "click",
    () => {

        if (!uploadedImage) {

            alert(
                "Please upload a PNG first."
            );

            return;
        }

        flowers.push(
            createFlower()
        );

        selectedFlower =
            flowers.length - 1;

        discretizedPattern = null;

        updateControls();

        draw();
    }
);


// ============================================================
// DELETE OBJECT
// ============================================================

const deleteFlowerButton =
    document.getElementById("deleteFlower");

deleteFlowerButton.addEventListener(
    "click",
    () => {

        if (
            selectedFlower < 0 ||
            selectedFlower >= flowers.length
        ) {
            return;
        }

        flowers.splice(
            selectedFlower,
            1
        );

        if (flowers.length === 0) {

            selectedFlower = -1;

        } else {

            selectedFlower =
                Math.min(
                    selectedFlower,
                    flowers.length - 1
                );
        }

        discretizedPattern = null;

        updateControls();

        draw();
    }
);


// ============================================================
// POSITION / ROTATION / SCALE
// ============================================================

const xSlider =
    document.getElementById("xPosition");

const ySlider =
    document.getElementById("yPosition");

const rotationSlider =
    document.getElementById("rotation");

const scaleSlider =
    document.getElementById("scale");


xSlider.addEventListener(
    "input",
    () => {

        if (selectedFlower < 0) {
            return;
        }

        flowers[selectedFlower].x =
            parseFloat(xSlider.value);

        discretizedPattern = null;

        updateValueDisplays();

        draw();
    }
);


ySlider.addEventListener(
    "input",
    () => {

        if (selectedFlower < 0) {
            return;
        }

        flowers[selectedFlower].y =
            parseFloat(ySlider.value);

        discretizedPattern = null;

        updateValueDisplays();

        draw();
    }
);


rotationSlider.addEventListener(
    "input",
    () => {

        if (selectedFlower < 0) {
            return;
        }

        flowers[selectedFlower].rotation =
            parseFloat(
                rotationSlider.value
            );

        discretizedPattern = null;

        updateValueDisplays();

        draw();
    }
);


scaleSlider.addEventListener(
    "input",
    () => {

        if (selectedFlower < 0) {
            return;
        }

        flowers[selectedFlower].scale =
            parseFloat(
                scaleSlider.value
            );

        discretizedPattern = null;

        updateValueDisplays();

        draw();
    }
);


// ============================================================
// UPDATE CONTROLS
// ============================================================

function updateControls() {

    const disabled =
        selectedFlower < 0;

    xSlider.disabled = disabled;
    ySlider.disabled = disabled;
    rotationSlider.disabled = disabled;
    scaleSlider.disabled = disabled;

    deleteFlowerButton.disabled =
        disabled;

    if (disabled) {
        return;
    }

    const flower =
        flowers[selectedFlower];

    xSlider.value =
        flower.x;

    ySlider.value =
        flower.y;

    rotationSlider.value =
        flower.rotation;

    scaleSlider.value =
        flower.scale;

    updateValueDisplays();
}


// ============================================================
// DISPLAY VALUES
// ============================================================

function updateValueDisplays() {

    if (selectedFlower < 0) {
        return;
    }

    const flower =
        flowers[selectedFlower];

    document.getElementById("xValue")
        .textContent =
        Number(flower.x).toFixed(2);

    document.getElementById("yValue")
        .textContent =
        Number(flower.y).toFixed(2);

    document.getElementById("rotationValue")
        .textContent =
        Number(flower.rotation)
        .toFixed(0) + "°";

    document.getElementById("scaleValue")
        .textContent =
        Number(flower.scale)
        .toFixed(2);
}


// ============================================================
// DRAW
// ============================================================

function draw() {

    if (!ctx) {
        return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /*
     * Draw background.
     */

    ctx.fillStyle =
        backgroundColor;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
     * If a discretized pattern exists,
     * draw that instead of the original objects.
     */

    if (discretizedPattern) {

        drawDiscretizedPattern();

        return;
    }


    /*
     * Draw all objects.
     */

    for (
        let i = 0;
        i < flowers.length;
        i++
    ) {

        drawFlower(
            flowers[i],
            i === selectedFlower
        );
    }


    /*
     * Draw grid.
     */

    drawGrid();
}


// ============================================================
// DRAW OBJECT
// ============================================================

function drawFlower(
    flower,
    selected
) {

    if (!uploadedImage) {
        return;
    }

    const img =
        uploadedImage;

    const x =
        flower.x *
        canvas.width;

    const y =
        flower.y *
        canvas.height;

    const width =
        img.width *
        flower.scale;

    const height =
        img.height *
        flower.scale;


    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.rotate(
        degToRad(
            flower.rotation
        )
    );


    ctx.drawImage(
        img,

        -width / 2,
        -height / 2,

        width,
        height
    );


    /*
     * Selection rectangle.
     */

    if (selected) {

        ctx.strokeStyle =
            "red";

        ctx.lineWidth = 3;

        ctx.strokeRect(

            -width / 2,
            -height / 2,

            width,
            height
        );
    }

    ctx.restore();
}


// ============================================================
// DRAW GRID
// ============================================================

function drawGrid() {

    const cellWidth =
        canvas.width / nx;

    const cellHeight =
        canvas.height / ny;

    ctx.strokeStyle =
        "rgba(0,0,0,0.35)";

    ctx.lineWidth = 1;

    ctx.beginPath();


    for (
        let i = 0;
        i <= nx;
        i++
    ) {

        const x =
            i * cellWidth;

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );
    }


    for (
        let j = 0;
        j <= ny;
        j++
    ) {

        const y =
            j * cellHeight;

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );
    }

    ctx.stroke();
}


// ============================================================
// DISCRETIZE BUTTON
// ============================================================

document
    .getElementById("discretizePattern")
    .addEventListener(
        "click",
        () => {

            if (!uploadedImage) {

                alert(
                    "Please upload a PNG first."
                );

                return;
            }

            discretizedPattern =
                discretizePattern();

            draw();
        }
    );


// ============================================================
// DISCRETIZE PATTERN
// ============================================================

function discretizePattern() {

    const offscreen =
        document.createElement(
            "canvas"
        );

    offscreen.width =
        canvas.width;

    offscreen.height =
        canvas.height;

    const offCtx =
        offscreen.getContext("2d");


    /*
     * Fill with selected background.
     */

    offCtx.fillStyle =
        backgroundColor;

    offCtx.fillRect(
        0,
        0,
        offscreen.width,
        offscreen.height
    );


    /*
     * Render objects.
     */

    for (
        const flower of flowers
    ) {

        const img =
            uploadedImage;

        const x =
            flower.x *
            canvas.width;

        const y =
            flower.y *
            canvas.height;

        const width =
            img.width *
            flower.scale;

        const height =
            img.height *
            flower.scale;


        offCtx.save();

        offCtx.translate(
            x,
            y
        );

        offCtx.rotate(
            degToRad(
                flower.rotation
            )
        );

        offCtx.drawImage(
            img,

            -width / 2,
            -height / 2,

            width,
            height
        );

        offCtx.restore();
    }


    const imageData =
        offCtx.getImageData(
            0,
            0,
            offscreen.width,
            offscreen.height
        );


    const cellWidth =
        canvas.width / nx;

    const cellHeight =
        canvas.height / ny;


    const pattern =
        Array.from(
            { length: ny },
            () => Array(nx).fill(0)
        );


    /*
     * Convert RGB background color to numbers.
     */

    const bg =
        hexToRgb(
            backgroundColor
        );


    /*
     * Determine whether each grid cell is
     * sufficiently covered by the PNG object.
     */

    for (
        let row = 0;
        row < ny;
        row++
    ) {

        for (
            let col = 0;
            col < nx;
            col++
        ) {

            const x0 =
                Math.floor(
                    col * cellWidth
                );

            const x1 =
                Math.floor(
                    (col + 1) *
                    cellWidth
                );

            const y0 =
                Math.floor(
                    row * cellHeight
                );

            const y1 =
                Math.floor(
                    (row + 1) *
                    cellHeight
                );


            let foregroundPixels = 0;
            let totalPixels = 0;


            for (
                let y = y0;
                y < y1;
                y++
            ) {

                for (
                    let x = x0;
                    x < x1;
                    x++
                ) {

                    const index =
                        (
                            y *
                            canvas.width +
                            x
                        ) * 4;


                    const r =
                        imageData.data[index];

                    const g =
                        imageData.data[index + 1];

                    const b =
                        imageData.data[index + 2];

                    const a =
                        imageData.data[index + 3];


                    /*
                     * Transparent PNG pixels should
                     * be considered background.
                     */

                    if (a < 20) {
                        totalPixels++;
                        continue;
                    }


                    const distance =
                        Math.sqrt(

                            Math.pow(
                                r - bg.r,
                                2
                            ) +

                            Math.pow(
                                g - bg.g,
                                2
                            ) +

                            Math.pow(
                                b - bg.b,
                                2
                            )
                        );


                    if (distance > 50) {
                        foregroundPixels++;
                    }

                    totalPixels++;
                }
            }


            const coverage =
                foregroundPixels /
                totalPixels;


            pattern[row][col] =
                coverage > 0.5
                    ? 1
                    : 0;
        }
    }


    /*
     * Match MATLAB flipud(alpha).
     */

    pattern.reverse();


    return pattern;
}


// ============================================================
// DRAW DISCRETIZED PATTERN
// ============================================================

function drawDiscretizedPattern() {

    const cellWidth =
        canvas.width / nx;

    const cellHeight =
        canvas.height / ny;


    /*
     * Draw cells.
     */

    for (
        let row = 0;
        row < ny;
        row++
    ) {

        for (
            let col = 0;
            col < nx;
            col++
        ) {

            if (
                discretizedPattern[row][col]
                === 1
            ) {

                ctx.fillStyle =
                    "black";

                ctx.fillRect(

                    col * cellWidth,
                    row * cellHeight,

                    cellWidth,
                    cellHeight
                );
            }
        }
    }


    /*
     * Grid.
     */

    ctx.strokeStyle =
        "rgba(255,255,255,0.35)";

    ctx.lineWidth = 1;

    ctx.beginPath();


    for (
        let i = 0;
        i <= nx;
        i++
    ) {

        const x =
            i * cellWidth;

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );
    }


    for (
        let j = 0;
        j <= ny;
        j++
    ) {

        const y =
            j * cellHeight;

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );
    }

    ctx.stroke();


    /*
     * Row numbers.
     */

    ctx.fillStyle =
        "black";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";


    for (
        let row = 0;
        row < ny;
        row++
    ) {

        const y =
            row * cellHeight +
            cellHeight / 2;

        ctx.fillText(

            String(row + 1),

            cellWidth * 0.02 - 5,

            y
        );
    }


    /*
     * Column numbers.
     */

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "top";


    for (
        let col = 0;
        col < nx;
        col++
    ) {

        const x =
            col * cellWidth +
            cellWidth / 2;

        ctx.fillText(

            String(col + 1),

            x,

            canvas.height + 5
        );
    }


    /*
     * Run counts.
     */

    if (showRunCounts) {
        drawRunCounts();
    }
}


// ============================================================
// RUN COUNT CHECKBOX
// ============================================================

document
    .getElementById("showRunCounts")
    .addEventListener(
        "change",
        (event) => {

            showRunCounts =
                event.target.checked;

            draw();
        }
    );


// ============================================================
// RUN DIRECTION
// ============================================================

document
    .getElementById("runDirection")
    .addEventListener(
        "change",
        (event) => {

            runDirection =
                event.target.value;

            draw();
        }
    );


// ============================================================
// RUN COUNTS
// ============================================================

function drawRunCounts() {

    if (!discretizedPattern) {
        return;
    }

    const cellWidth =
        canvas.width / nx;

    const cellHeight =
        canvas.height / ny;


    ctx.fillStyle =
        "red";

    ctx.font =
        "bold 12px Arial";

    ctx.textBaseline =
        "middle";


    for (
        let row = 0;
        row < ny;
        row++
    ) {

        let col = 0;

        let runNumber = 0;


        while (col < nx) {

            const value =
                discretizedPattern[row][col];

            let end =
                col + 1;


            while (
                end < nx &&
                discretizedPattern[row][end]
                === value
            ) {

                end++;
            }


            const runLength =
                end - col;


            let displayCol;


            if (
                runDirection === "left"
            ) {

                displayCol = col;

            } else if (
                runDirection === "right"
            ) {

                displayCol = end - 1;

            } else if (
                runDirection ===
                "alternating-left"
            ) {

                displayCol =
                    runNumber % 2 === 0
                        ? col
                        : end - 1;

            } else {

                displayCol =
                    runNumber % 2 === 0
                        ? end - 1
                        : col;
            }


            const x =
                displayCol *
                cellWidth +
                cellWidth / 2;

            const y =
                row *
                cellHeight +
                cellHeight / 2;


            ctx.textAlign =
                "center";


            ctx.fillText(

                String(runLength),

                x,
                y
            );


            col = end;

            runNumber++;
        }
    }
}


// ============================================================
// MOUSE DRAGGING
// ============================================================

let dragging = false;

let dragOffsetX = 0;
let dragOffsetY = 0;


canvas.addEventListener(
    "mousedown",
    (event) => {

        if (
            selectedFlower < 0 ||
            !uploadedImage
        ) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        /*
         * Convert screen coordinates into
         * canvas coordinates.
         */

        const scaleX =
            canvas.width /
            rect.width;

        const scaleY =
            canvas.height /
            rect.height;


        const mouseX =
            (event.clientX -
             rect.left) *
            scaleX;

        const mouseY =
            (event.clientY -
             rect.top) *
            scaleY;


        const flower =
            flowers[selectedFlower];


        const fx =
            flower.x *
            canvas.width;

        const fy =
            flower.y *
            canvas.height;


        const dx =
            mouseX - fx;

        const dy =
            mouseY - fy;


        const hitRadius =
            100 *
            flower.scale;


        if (
            Math.sqrt(
                dx * dx +
                dy * dy
            ) < hitRadius
        ) {

            dragging = true;

            dragOffsetX =
                mouseX - fx;

            dragOffsetY =
                mouseY - fy;
        }
    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (
            !dragging ||
            selectedFlower < 0
        ) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const scaleX =
            canvas.width /
            rect.width;

        const scaleY =
            canvas.height /
            rect.height;


        const mouseX =
            (event.clientX -
             rect.left) *
            scaleX;

        const mouseY =
            (event.clientY -
             rect.top) *
            scaleY;


        const flower =
            flowers[selectedFlower];


        flower.x =
            clamp(

                (
                    mouseX -
                    dragOffsetX
                ) /
                canvas.width,

                0,
                1
            );


        flower.y =
            clamp(

                (
                    mouseY -
                    dragOffsetY
                ) /
                canvas.height,

                0,
                1
            );


        discretizedPattern = null;

        updateControls();

        draw();
    }
);


canvas.addEventListener(
    "mouseup",
    () => {

        dragging = false;
    }
);


canvas.addEventListener(
    "mouseleave",
    () => {

        dragging = false;
    }
);


// ============================================================
// CLICK TO SELECT OBJECT
// ============================================================

canvas.addEventListener(
    "click",
    (event) => {

        if (!uploadedImage) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const scaleX =
            canvas.width /
            rect.width;

        const scaleY =
            canvas.height /
            rect.height;


        const mouseX =
            (event.clientX -
             rect.left) *
            scaleX;

        const mouseY =
            (event.clientY -
             rect.top) *
            scaleY;


        let closest = -1;

        let closestDistance =
            Infinity;


        for (
            let i = 0;
            i < flowers.length;
            i++
        ) {

            const flower =
                flowers[i];


            const fx =
                flower.x *
                canvas.width;

            const fy =
                flower.y *
                canvas.height;


            const dx =
                mouseX - fx;

            const dy =
                mouseY - fy;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const hitRadius =
                100 *
                flower.scale;


            if (
                distance <
                hitRadius &&
                distance <
                closestDistance
            ) {

                closest =
                    i;

                closestDistance =
                    distance;
            }
        }


        if (closest >= 0) {

            selectedFlower =
                closest;

            updateControls();

            draw();
        }
    }
);


// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Delete" ||
            event.key === "Backspace"
        ) {

            if (
                selectedFlower >= 0
            ) {

                deleteFlowerButton.click();

                event.preventDefault();
            }
        }


        if (
            event.key === "Escape"
        ) {

            selectedFlower = -1;

            updateControls();

            draw();
        }
    }
);


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function degToRad(
    degrees
) {

    return (
        degrees *
        Math.PI /
        180
    );
}


function hexToRgb(hex) {

    hex =
        hex.replace(
            "#",
            ""
        );


    return {

        r: parseInt(
            hex.substring(0, 2),
            16
        ),

        g: parseInt(
            hex.substring(2, 4),
            16
        ),

        b: parseInt(
            hex.substring(4, 6),
            16
        )
    };
}