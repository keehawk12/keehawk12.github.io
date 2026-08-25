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


/*
 * This controls whether we are currently looking
 * at the discretized crochet grid.
 *
 * false = editable PNG/object view
 * true  = discretized crochet grid
 */
let isDiscretized = false;


// ============================================================
// CANVAS LAYOUT
// ============================================================

const PATTERN_WIDTH = 1200;

const LEFT_MARGIN = 45;
const RIGHT_MARGIN = 45;

const TOP_MARGIN = 30;
const BOTTOM_MARGIN = 30;

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
    document.getElementById(
        "backgroundColorInput"
    );

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
            patternWidth *
            ny /
            nx
        );


    /*
     * The canvas is larger than the pattern itself
     * so the row/column labels fit inside the canvas.
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


        /*
         * Changing the background invalidates
         * the discretized representation.
         */
        discretizedPattern = null;

        isDiscretized = false;

        updateDiscretizeButton();

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
                     * Loading a new PNG returns us
                     * to editable mode.
                     */
                    discretizedPattern = null;

                    isDiscretized = false;


                    /*
                     * Clear existing objects because
                     * they belonged to the previous PNG.
                     */
                    flowers = [];

                    selectedFlower = -1;


                    /*
                     * Automatically create one object.
                     */
                    flowers.push(
                        createFlower()
                    );


                    selectedFlower = 0;


                    updateControls();

                    updateDiscretizeButton();

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


        /*
         * Changing the object means the old
         * discretization is no longer valid.
         */
        discretizedPattern = null;

        isDiscretized = false;


        updateControls();

        updateDiscretizeButton();

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

        isDiscretized = false;


        updateControls();

        updateDiscretizeButton();

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


// X POSITION

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

        isDiscretized = false;


        updateValueDisplays();

        updateDiscretizeButton();

        draw();
    }
);


// Y POSITION

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

        isDiscretized = false;


        updateValueDisplays();

        updateDiscretizeButton();

        draw();
    }
);


// ROTATION

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

        isDiscretized = false;


        updateValueDisplays();

        updateDiscretizeButton();

        draw();
    }
);


// SCALE

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

        isDiscretized = false;


        updateValueDisplays();

        updateDiscretizeButton();

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
        ).toFixed(0) +
        "°";


    document.getElementById(
        "scaleValue"
    ).textContent =
        Number(
            flower.scale
        ).toFixed(2);
}


// ============================================================
// UPDATE DISCRETIZE BUTTON
// ============================================================

function updateDiscretizeButton() {

    const button =
        document.getElementById(
            "discretizePattern"
        );


    if (isDiscretized) {

        button.textContent =
            "Edit Pattern";

    } else {

        button.textContent =
            "Discretize Pattern";
    }
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
     * If we are viewing the discretized pattern,
     * draw ONLY that representation.
     */
    if (
        isDiscretized &&
        discretizedPattern
    ) {

        drawDiscretizedPattern();

        return;
    }


    /*
     * --------------------------------------------------------
     * EDITABLE VIEW
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
// DRAW EDITABLE GRID
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

            /*
             * ------------------------------------------------
             * EDIT MODE
             * ------------------------------------------------
             *
             * If currently showing the discretized pattern,
             * simply return to the editable object view.
             *
             * IMPORTANT:
             * We DO NOT delete discretizedPattern here.
             * This allows the user to return to the exact
             * same discretization later.
             */
            if (isDiscretized) {

                isDiscretized = false;

                updateDiscretizeButton();

                draw();

                return;
            }


            /*
             * ------------------------------------------------
             * DISCRETIZE MODE
             * ------------------------------------------------
             */

            if (!uploadedImage) {

                alert(
                    "Please upload a PNG first."
                );

                return;
            }


            discretizedPattern =
                discretizePattern();


            isDiscretized = true;


            updateDiscretizeButton();

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
     * IMPORTANT:
     *
     * The offscreen canvas represents ONLY the
     * actual crochet pattern area.
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
            {
                length: ny
            },
            () =>
                Array(nx).fill(0)
        );


    /*
     * --------------------------------------------------------
     * WHITE IS THE DISCRETIZATION BACKGROUND
     * --------------------------------------------------------
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
                     * Transparent pixels are background.
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
     * ========================================================
     * IMPORTANT — DO NOT FLIP THE PATTERN
     * ========================================================
     *
     * The previous version contained:
     *
     *     pattern.reverse();
     *
     * That was the source of the Y-direction flip.
     *
     * We intentionally DO NOT reverse the rows here.
     *
     * The discretized pattern therefore has the exact same
     * top-to-bottom orientation as the PNG/object view.
     * ========================================================
     */


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
     * GRAY GRIDLINES
     * --------------------------------------------------------
     *
     * These are intentionally gray rather than white.
     *
     * This makes the grid visible on BOTH:
     *
     *   - black cells
     *   - white cells
     *
     * --------------------------------------------------------
     */

    ctx.strokeStyle =
        "#999999";

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
     * ROW NUMBERS — LEFT AND RIGHT
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
     * COLUMN NUMBERS — TOP AND BOTTOM
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
     * Process every row.
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
             * Find end of run.
             */
            while (
                end < nx &&
                discretizedPattern[row][end] === value
            ) {

                end++;
            }


            const runLength =
                end - col;


            const y =
                patternY +
                row * cellHeight +
                cellHeight / 2;


            /*
             * ------------------------------------------------
             * ONE-CELL RUN WITH "BOTH"
             * ------------------------------------------------
             *
             * Only draw the number once because left and
             * right would be the exact same cell.
             */
            if (
                runDirection === "both" &&
                runLength === 1
            ) {

                const x =
                    patternX +
                    col * cellWidth +
                    cellWidth / 2;


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
             */
            else if (
                runDirection === "both"
            ) {

                const leftX =
                    patternX +
                    col * cellWidth +
                    cellWidth / 2;


                const rightX =
                    patternX +
                    (end - 1) *
                    cellWidth +
                    cellWidth / 2;


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
// CANVAS COORDINATE CONVERSION
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

        /*
         * Objects cannot be dragged while viewing
         * the discretized grid.
         */
        if (
            isDiscretized ||
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
            isDiscretized
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


        /*
         * The current discretization is now stale.
         */
        discretizedPattern = null;

        isDiscretized = false;


        updateControls();

        updateDiscretizeButton();

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
            isDiscretized ||
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
                !isDiscretized
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