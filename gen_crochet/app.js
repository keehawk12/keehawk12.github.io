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
// CANVAS LAYOUT
// ============================================================
//
// The actual crochet grid occupies the center of the canvas.
// Extra space is included around it for:
//
//   - left/right row numbers
//   - top/bottom column numbers
//
// ============================================================

const PATTERN_WIDTH = 1200;

const LEFT_MARGIN = 45;
const RIGHT_MARGIN = 45;
const TOP_MARGIN = 30;
const BOTTOM_MARGIN = 30;


// These are calculated when the pattern is initialized.
let patternWidth = PATTERN_WIDTH;
let patternHeight = 0;

let patternX = LEFT_MARGIN;
let patternY = TOP_MARGIN;


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

startButton.addEventListener(
    "click",
    () => {

        nx =
            parseInt(
                nxInput.value
            );

        ny =
            parseInt(
                nyInput.value
            );

        backgroundColor =
            backgroundColorInput.value;


        if (
            !Number.isFinite(nx) ||
            nx < 1
        ) {

            alert(
                "nx must be a positive integer."
            );

            return;
        }


        if (
            !Number.isFinite(ny) ||
            ny < 1
        ) {

            alert(
                "ny must be a positive integer."
            );

            return;
        }


        nx = Math.round(nx);
        ny = Math.round(ny);


        initializeCanvas();


        setupScreen.classList.add(
            "hidden"
        );

        app.classList.remove(
            "hidden"
        );


        document.getElementById(
            "nxDisplay"
        ).textContent = nx;


        document.getElementById(
            "nyDisplay"
        ).textContent = ny;


        document.getElementById(
            "backgroundColor"
        ).value =
            backgroundColor;


        /*
         * If a PNG was selected on the startup
         * screen, load it now.
         */
        if (
            pngInput.files.length > 0
        ) {

            loadPNG(
                pngInput.files[0]
            );
        }


        draw();
    }
);


// ============================================================
// INITIALIZE CANVAS
// ============================================================

function initializeCanvas() {

    patternWidth =
        PATTERN_WIDTH;


    patternHeight =
        Math.round(
            patternWidth * ny / nx
        );


    /*
     * The actual canvas is larger than the grid
     * so that labels fit inside the canvas.
     */
    canvas.width =
        patternWidth +
        LEFT_MARGIN +
        RIGHT_MARGIN;


    canvas.height =
        patternHeight +
        TOP_MARGIN +
        BOTTOM_MARGIN;


    patternX =
        LEFT_MARGIN;

    patternY =
        TOP_MARGIN;
}


// ============================================================
// BACKGROUND COLOR
// ============================================================

const backgroundColorControl =
    document.getElementById(
        "backgroundColor"
    );


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
    document.getElementById(
        "objectUpload"
    );


objectUpload.addEventListener(
    "change",
    () => {

        if (
            objectUpload.files.length === 0
        ) {
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

    if (
        !file.type.includes("png")
    ) {

        alert(
            "Please select a PNG image."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            const img =
                new Image();


            img.onload =
                function() {

                    uploadedImage =
                        img;


                    document.getElementById(
                        "uploadedFileName"
                    ).textContent =
                        file.name;


                    /*
                     * Clear existing objects.
                     */
                    flowers = [];

                    selectedFlower = -1;


                    /*
                     * Automatically create one
                     * object from the uploaded PNG.
                     */
                    flowers.push(
                        createFlower()
                    );


                    selectedFlower = 0;


                    updateControls();


                    discretizedPattern =
                        null;


                    draw();
                };


            img.src =
                event.target.result;
        };


    reader.readAsDataURL(file);
}


// ============================================================
// CREATE OBJECT
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
    document.getElementById(
        "addFlower"
    );


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
    document.getElementById(
        "deleteFlower"
    );


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


        if (
            flowers.length === 0
        ) {

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
    document.getElementById(
        "xPosition"
    );

const ySlider =
    document.getElementById(
        "yPosition"
    );

const rotationSlider =
    document.getElementById(
        "rotation"
    );

const scaleSlider =
    document.getElementById(
        "scale"
    );


// X
xSlider.addEventListener(
    "input",
    () => {

        if (
            selectedFlower < 0
        ) {
            return;
        }


        flowers[selectedFlower].x =
            parseFloat(
                xSlider.value
            );


        discretizedPattern = null;

        updateValueDisplays();

        draw();
    }
);


// Y
ySlider.addEventListener(
    "input",
    () => {

        if (
            selectedFlower < 0
        ) {
            return;
        }


        flowers[selectedFlower].y =
            parseFloat(
                ySlider.value
            );


        discretizedPattern = null;

        updateValueDisplays();

        draw();
    }
);


// Rotation
rotationSlider.addEventListener(
    "input",
    () => {

        if (
            selectedFlower < 0
        ) {
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


// Scale
scaleSlider.addEventListener(
    "input",
    () => {

        if (
            selectedFlower < 0
        ) {
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


    xSlider.disabled =
        disabled;

    ySlider.disabled =
        disabled;

    rotationSlider.disabled =
        disabled;

    scaleSlider.disabled =
        disabled;


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

    if (
        selectedFlower < 0
    ) {
        return;
    }


    const flower =
        flowers[selectedFlower];


    document.getElementById(
        "xValue"
    ).textContent =
        Number(
            flower.x
        ).toFixed(2);


    document.getElementById(
        "yValue"
    ).textContent =
        Number(
            flower.y
        ).toFixed(2);


    document.getElementById(
        "rotationValue"
    ).textContent =
        Number(
            flower.rotation
        ).toFixed(0) + "°";


    document.getElementById(
        "scaleValue"
    ).textContent =
        Number(
            flower.scale
        ).toFixed(2);
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
     * --------------------------------------------------------
     * ORIGINAL PATTERN VIEW
     * --------------------------------------------------------
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
     * --------------------------------------------------------
     * DISCRETIZED VIEW
     * --------------------------------------------------------
     */

    if (
        discretizedPattern
    ) {

        drawDiscretizedPattern();

        return;
    }


    /*
     * --------------------------------------------------------
     * Draw original objects.
     * --------------------------------------------------------
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
     * Draw grid over the pattern area.
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


    /*
     * Object coordinates are relative to
     * the actual pattern area.
     */
    const x =
        patternX +
        flower.x *
        patternWidth;


    const y =
        patternY +
        flower.y *
        patternHeight;


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
        patternWidth / nx;

    const cellHeight =
        patternHeight / ny;


    ctx.strokeStyle =
        "rgba(0,0,0,0.35)";

    ctx.lineWidth = 1;

    ctx.beginPath();


    /*
     * Vertical grid lines.
     */
    for (
        let i = 0;
        i <= nx;
        i++
    ) {

        const x =
            patternX +
            i * cellWidth;


        ctx.moveTo(
            x,
            patternY
        );


        ctx.lineTo(
            x,
            patternY +
            patternHeight
        );
    }


    /*
     * Horizontal grid lines.
     */
    for (
        let j = 0;
        j <= ny;
        j++
    ) {

        const y =
            patternY +
            j * cellHeight;


        ctx.moveTo(
            patternX,
            y
        );


        ctx.lineTo(
            patternX +
            patternWidth,
            y
        );
    }


    ctx.stroke();
}


// ============================================================
// DISCRETIZE BUTTON
// ============================================================

document
    .getElementById(
        "discretizePattern"
    )
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


    /*
     * Only the actual pattern area needs
     * to be rendered for discretization.
     */
    offscreen.width =
        patternWidth;

    offscreen.height =
        patternHeight;


    const offCtx =
        offscreen.getContext("2d");


    /*
     * --------------------------------------------------------
     * ALWAYS WHITE BACKGROUND
     * --------------------------------------------------------
     */

    offCtx.fillStyle =
        "white";


    offCtx.fillRect(
        0,
        0,
        patternWidth,
        patternHeight
    );


    /*
     * --------------------------------------------------------
     * RENDER OBJECTS
     * --------------------------------------------------------
     */

    for (
        const flower of flowers
    ) {

        const img =
            uploadedImage;


        const x =
            flower.x *
            patternWidth;


        const y =
            flower.y *
            patternHeight;


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


    /*
     * Get rendered pixels.
     */
    const imageData =
        offCtx.getImageData(
            0,
            0,
            patternWidth,
            patternHeight
        );


    const cellWidth =
        patternWidth / nx;

    const cellHeight =
        patternHeight / ny;


    const pattern =
        Array.from(
            { length: ny },
            () =>
                Array(nx).fill(0)
        );


    /*
     * White is ALWAYS the discretization
     * background.
     */
    const bg = {
        r: 255,
        g: 255,
        b: 255
    };


    /*
     * --------------------------------------------------------
     * DETERMINE CELL VALUES
     * --------------------------------------------------------
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
                    col *
                    cellWidth
                );


            const x1 =
                Math.floor(
                    (col + 1) *
                    cellWidth
                );


            const y0 =
                Math.floor(
                    row *
                    cellHeight
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
                            patternWidth +
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
                     * Transparent pixels count
                     * as background.
                     */
                    if (
                        a < 20
                    ) {

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


                    if (
                        distance > 50
                    ) {

                        foregroundPixels++;
                    }


                    totalPixels++;
                }
            }


            const coverage =
                totalPixels > 0
                    ? foregroundPixels /
                      totalPixels
                    : 0;


            pattern[row][col] =
                coverage > 0.5
                    ? 1
                    : 0;
        }
    }


    /*
     * --------------------------------------------------------
     * FLIP Y DIRECTION
     * --------------------------------------------------------
     *
     * Canvas coordinates have Y increasing downward.
     *
     * Crochet grid coordinates are displayed with
     * the opposite Y orientation.
     *
     * Reverse the rows once here.
     * --------------------------------------------------------
     */

    pattern.reverse();


    return pattern;
}


// ============================================================
// DRAW DISCRETIZED PATTERN
// ============================================================

function drawDiscretizedPattern() {

    const cellWidth =
        patternWidth / nx;

    const cellHeight =
        patternHeight / ny;


    /*
     * --------------------------------------------------------
     * WHITE BACKGROUND
     * --------------------------------------------------------
     */

    ctx.fillStyle =
        "white";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
     * --------------------------------------------------------
     * BLACK CELLS
     * --------------------------------------------------------
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
                discretizedPattern[row][col] === 1
            ) {

                ctx.fillStyle =
                    "black";


                ctx.fillRect(

                    patternX +
                    col * cellWidth,

                    patternY +
                    row * cellHeight,

                    cellWidth,

                    cellHeight
                );
            }
        }
    }


    /*
     * --------------------------------------------------------
     * GRID
     * --------------------------------------------------------
     */

    ctx.strokeStyle =
        "rgba(255,255,255,0.35)";

    ctx.lineWidth = 1;

    ctx.beginPath();


    /*
     * Vertical lines.
     */
    for (
        let i = 0;
        i <= nx;
        i++
    ) {

        const x =
            patternX +
            i * cellWidth;


        ctx.moveTo(
            x,
            patternY
        );


        ctx.lineTo(
            x,
            patternY +
            patternHeight
        );
    }


    /*
     * Horizontal lines.
     */
    for (
        let j = 0;
        j <= ny;
        j++
    ) {

        const y =
            patternY +
            j * cellHeight;


        ctx.moveTo(
            patternX,
            y
        );


        ctx.lineTo(
            patternX +
            patternWidth,
            y
        );
    }


    ctx.stroke();


    /*
     * --------------------------------------------------------
     * NUMBER STYLE
     * --------------------------------------------------------
     */

    ctx.fillStyle =
        "black";

    ctx.font =
        "bold 12px Arial";


    /*
     * --------------------------------------------------------
     * ROW NUMBERS: LEFT + RIGHT
     * --------------------------------------------------------
     */

    ctx.textBaseline =
        "middle";


    for (
        let row = 0;
        row < ny;
        row++
    ) {

        const y =
            patternY +
            row * cellHeight +
            cellHeight / 2;


        /*
         * LEFT
         */
        ctx.textAlign =
            "right";


        ctx.fillText(

            String(row + 1),

            patternX - 7,

            y
        );


        /*
         * RIGHT
         */
        ctx.textAlign =
            "left";


        ctx.fillText(

            String(row + 1),

            patternX +
            patternWidth +
            7,

            y
        );
    }


    /*
     * --------------------------------------------------------
     * COLUMN NUMBERS: TOP + BOTTOM
     * --------------------------------------------------------
     */

    for (
        let col = 0;
        col < nx;
        col++
    ) {

        const x =
            patternX +
            col * cellWidth +
            cellWidth / 2;


        /*
         * TOP
         */
        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "bottom";


        ctx.fillText(

            String(col + 1),

            x,

            patternY - 7
        );


        /*
         * BOTTOM
         */
        ctx.textBaseline =
            "top";


        ctx.fillText(

            String(col + 1),

            x,

            patternY +
            patternHeight +
            7
        );
    }


    /*
     * --------------------------------------------------------
     * RUN COUNTS
     * --------------------------------------------------------
     */

    if (showRunCounts) {

        drawRunCounts();
    }
}


// ============================================================
// RUN COUNT CHECKBOX
// ============================================================

document
    .getElementById(
        "showRunCounts"
    )
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
    .getElementById(
        "runDirection"
    )
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

    if (
        !discretizedPattern
    ) {
        return;
    }


    const cellWidth =
        patternWidth / nx;

    const cellHeight =
        patternHeight / ny;


    ctx.fillStyle =
        "red";

    ctx.font =
        "bold 12px Arial";

    ctx.textBaseline =
        "middle";


    /*
     * --------------------------------------------------------
     * PROCESS EACH ROW
     * --------------------------------------------------------
     */

    for (
        let row = 0;
        row < ny;
        row++
    ) {

        let col = 0;

        let runNumber = 0;


        while (
            col < nx
        ) {

            const value =
                discretizedPattern[row][col];


            let end =
                col + 1;


            /*
             * Find end of current run.
             */
            while (
                end < nx &&
                discretizedPattern[row][end] === value
            ) {

                end++;
            }


            const runLength =
                end - col;


            /*
             * ------------------------------------------------
             * ONE-CELL RUN
             * ------------------------------------------------
             *
             * If the user selected BOTH, do not draw the
             * same number twice in the same cell.
             *
             * Instead, draw it once in the center.
             * ------------------------------------------------
             */

            if (
                runDirection === "both" &&
                runLength === 1
            ) {

                const x =
                    patternX +
                    col * cellWidth +
                    cellWidth / 2;


                const y =
                    patternY +
                    row * cellHeight +
                    cellHeight / 2;


                ctx.textAlign =
                    "center";


                ctx.fillText(

                    String(runLength),

                    x,
                    y
                );
            }


            /*
             * ------------------------------------------------
             * LEFT
             * ------------------------------------------------
             */

            else if (
                runDirection === "left"
            ) {

                const x =
                    patternX +
                    col * cellWidth +
                    cellWidth / 2;


                const y =
                    patternY +
                    row * cellHeight +
                    cellHeight / 2;


                ctx.textAlign =
                    "center";


                ctx.fillText(

                    String(runLength),

                    x,
                    y
                );
            }


            /*
             * ------------------------------------------------
             * RIGHT
             * ------------------------------------------------
             */

            else if (
                runDirection === "right"
            ) {

                const x =
                    patternX +
                    (end - 1) *
                    cellWidth +
                    cellWidth / 2;


                const y =
                    patternY +
                    row * cellHeight +
                    cellHeight / 2;


                ctx.textAlign =
                    "center";


                ctx.fillText(

                    String(runLength),

                    x,
                    y
                );
            }


            /*
             * ------------------------------------------------
             * ALTERNATING LEFT FIRST
             * ------------------------------------------------
             */

            else if (
                runDirection ===
                "alternating-left"
            ) {

                const displayCol =
                    runNumber % 2 === 0
                        ? col
                        : end - 1;


                const x =
                    patternX +
                    displayCol * cellWidth +
                    cellWidth / 2;


                const y =
                    patternY +
                    row * cellHeight +
                    cellHeight / 2;


                ctx.textAlign =
                    "center";


                ctx.fillText(

                    String(runLength),

                    x,
                    y
                );
            }


            /*
             * ------------------------------------------------
             * ALTERNATING RIGHT FIRST
             * ------------------------------------------------
             */

            else if (
                runDirection ===
                "alternating-right"
            ) {

                const displayCol =
                    runNumber % 2 === 0
                        ? end - 1
                        : col;


                const x =
                    patternX +
                    displayCol * cellWidth +
                    cellWidth / 2;


                const y =
                    patternY +
                    row * cellHeight +
                    cellHeight / 2;


                ctx.textAlign =
                    "center";


                ctx.fillText(

                    String(runLength),

                    x,
                    y
                );
            }


            /*
             * ------------------------------------------------
             * BOTH
             * ------------------------------------------------
             *
             * For runs >= 2, put the number at both ends.
             *
             * One-cell runs were already handled above.
             * ------------------------------------------------
             */

            else if (
                runDirection === "both"
            ) {

                /*
                 * LEFT number
                 */
                const leftX =
                    patternX +
                    col * cellWidth +
                    cellWidth / 2;


                /*
                 * RIGHT number
                 */
                const rightX =
                    patternX +
                    (end - 1) *
                    cellWidth +
                    cellWidth / 2;


                const y =
                    patternY +
                    row * cellHeight +
                    cellHeight / 2;


                ctx.textAlign =
                    "center";


                ctx.fillText(

                    String(runLength),

                    leftX,
                    y
                );


                ctx.fillText(

                    String(runLength),

                    rightX,
                    y
                );
            }


            col = end;

            runNumber++;
        }
    }
}


// ============================================================
// MOUSE COORDINATE CONVERSION
// ============================================================

function getCanvasCoordinates(event) {

    const rect =
        canvas.getBoundingClientRect();


    const scaleX =
        canvas.width /
        rect.width;


    const scaleY =
        canvas.height /
        rect.height;


    return {

        x:
            (
                event.clientX -
                rect.left
            ) * scaleX,

        y:
            (
                event.clientY -
                rect.top
            ) * scaleY
    };
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
            discretizedPattern ||
            selectedFlower < 0 ||
            !uploadedImage
        ) {

            return;
        }


        const mouse =
            getCanvasCoordinates(
                event
            );


        const flower =
            flowers[selectedFlower];


        const fx =
            patternX +
            flower.x *
            patternWidth;


        const fy =
            patternY +
            flower.y *
            patternHeight;


        const dx =
            mouse.x - fx;


        const dy =
            mouse.y - fy;


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
                mouse.x - fx;


            dragOffsetY =
                mouse.y - fy;
        }
    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (
            !dragging ||
            selectedFlower < 0 ||
            discretizedPattern
        ) {

            return;
        }


        const mouse =
            getCanvasCoordinates(
                event
            );


        const flower =
            flowers[selectedFlower];


        flower.x =
            clamp(

                (
                    mouse.x -
                    dragOffsetX -
                    patternX
                ) /
                patternWidth,

                0,
                1
            );


        flower.y =
            clamp(

                (
                    mouse.y -
                    dragOffsetY -
                    patternY
                ) /
                patternHeight,

                0,
                1
            );


        discretizedPattern =
            null;


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

        if (
            discretizedPattern ||
            !uploadedImage
        ) {

            return;
        }


        const mouse =
            getCanvasCoordinates(
                event
            );


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
                patternX +
                flower.x *
                patternWidth;


            const fy =
                patternY +
                flower.y *
                patternHeight;


            const dx =
                mouse.x - fx;


            const dy =
                mouse.y - fy;


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


        if (
            closest >= 0
        ) {

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
                selectedFlower >= 0 &&
                !discretizedPattern
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
        Math.min(
            max,
            value
        )
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