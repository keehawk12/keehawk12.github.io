// ============================================================
// CROCHET PATTERN GENERATOR
// ============================================================

let nx = 60;
let ny = 30;

let backgroundColor = "#e2e922";

let canvas;
let ctx;

// ------------------------------------------------------------
// Object types
//
// Each uploaded PNG gets its own entry here.
// ------------------------------------------------------------

let objectTypes = [];

// ------------------------------------------------------------
// Objects currently placed on the canvas.
//
// Each object contains:
// typeIndex -> which PNG it uses
// x, y      -> normalized position
// rotation  -> degrees
// scale     -> scale factor
// ------------------------------------------------------------

let flowers = [];

let selectedFlower = -1;

let showRunCounts = false;

let runDirection = "left";

let discretizedPattern = null;

let isDiscretizedView = false;

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
     * If a PNG was selected on the
     * startup screen, add it as a new
     * object type.
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


const canvasWidth = 1200;

const canvasHeight =
    Math.round(
        canvasWidth *
        ny /
        nx
    );


canvas.width =
    canvasWidth;

canvas.height =
    canvasHeight;


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

    isDiscretizedView = false;

    updateViewButton();

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


    /*
     * Reset the file input so that
     * uploading the same file again
     * will still trigger "change".
     */

    objectUpload.value = "";
}


);

// ============================================================
// LOAD PNG
// ============================================================

function loadPNG(file) {


if (
    file.type !== "image/png"
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

                /*
                 * Add a NEW object type.
                 *
                 * IMPORTANT:
                 * Nothing currently on the
                 * canvas is deleted.
                 */

                const typeIndex =
                    objectTypes.length;


                objectTypes.push({

                    name:
                        file.name,

                    image:
                        img

                });


                /*
                 * Automatically select
                 * the newly uploaded image.
                 */

                updateObjectSelect(
                    typeIndex
                );


                document.getElementById(
                    "uploadedFileName"
                ).textContent =
                    file.name;


                /*
                 * Add one new object using
                 * the newly uploaded PNG.
                 */

                flowers.push(
                    createFlower(
                        typeIndex
                    )
                );


                selectedFlower =
                    flowers.length - 1;


                discretizedPattern =
                    null;

                isDiscretizedView =
                    false;


                updateControls();

                updateViewButton();

                draw();
            };


        img.src =
            event.target.result;
    };


reader.readAsDataURL(file);


}

// ============================================================
// UPDATE OBJECT TYPE DROPDOWN
// ============================================================

function updateObjectSelect(
selectedIndex = null
) {


const select =
    document.getElementById(
        "flowerSelect"
    );


select.innerHTML = "";


if (
    objectTypes.length === 0
) {

    const option =
        document.createElement(
            "option"
        );

    option.value = "";

    option.textContent =
        "No objects uploaded";

    select.appendChild(
        option
    );

    return;
}


for (
    let i = 0;
    i < objectTypes.length;
    i++
) {

    const option =
        document.createElement(
            "option"
        );

    option.value =
        String(i);

    option.textContent =
        objectTypes[i].name;

    select.appendChild(
        option
    );
}


if (
    selectedIndex !== null &&
    selectedIndex >= 0 &&
    selectedIndex <
    objectTypes.length
) {

    select.value =
        String(selectedIndex);
}


}

// ============================================================
// OBJECT TYPE SELECTION
// ============================================================

const flowerSelect =
document.getElementById(
"flowerSelect"
);

flowerSelect.addEventListener(
"change",
() => {


    if (
        selectedFlower < 0 ||
        selectedFlower >= flowers.length
    ) {

        return;
    }


    const typeIndex =
        parseInt(
            flowerSelect.value
        );


    if (
        !Number.isFinite(typeIndex)
    ) {
        return;
    }


    flowers[
        selectedFlower
    ].typeIndex =
        typeIndex;


    discretizedPattern =
        null;

    isDiscretizedView =
        false;

    updateViewButton();

    draw();
}


);

// ============================================================
// CREATE OBJECT
// ============================================================

function createFlower(
typeIndex
) {


return {

    typeIndex:
        typeIndex,

    x:
        0.5,

    y:
        0.5,

    rotation:
        0,

    scale:
        1.0
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


    if (
        objectTypes.length === 0
    ) {

        alert(
            "Please upload a PNG first."
        );

        return;
    }


    const typeIndex =
        parseInt(
            flowerSelect.value
        );


    if (
        !Number.isFinite(typeIndex)
    ) {
        return;
    }


    flowers.push(
        createFlower(
            typeIndex
        )
    );


    selectedFlower =
        flowers.length - 1;


    discretizedPattern =
        null;

    isDiscretizedView =
        false;


    updateControls();

    updateViewButton();

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


    discretizedPattern =
        null;

    isDiscretizedView =
        false;


    updateControls();

    updateViewButton();

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

// ------------------------------------------------------------
// X
// ------------------------------------------------------------

xSlider.addEventListener(
"input",
() => {


    if (
        selectedFlower < 0
    ) {
        return;
    }


    flowers[
        selectedFlower
    ].x =
        parseFloat(
            xSlider.value
        );


    discretizedPattern =
        null;

    isDiscretizedView =
        false;


    updateValueDisplays();

    updateViewButton();

    draw();
}


);

// ------------------------------------------------------------
// Y
// ------------------------------------------------------------

ySlider.addEventListener(
"input",
() => {


    if (
        selectedFlower < 0
    ) {
        return;
    }


    flowers[
        selectedFlower
    ].y =
        parseFloat(
            ySlider.value
        );


    discretizedPattern =
        null;

    isDiscretizedView =
        false;


    updateValueDisplays();

    updateViewButton();

    draw();
}


);

// ------------------------------------------------------------
// ROTATION
// ------------------------------------------------------------

rotationSlider.addEventListener(
"input",
() => {


    if (
        selectedFlower < 0
    ) {
        return;
    }


    flowers[
        selectedFlower
    ].rotation =
        parseFloat(
            rotationSlider.value
        );


    discretizedPattern =
        null;

    isDiscretizedView =
        false;


    updateValueDisplays();

    updateViewButton();

    draw();
}


);

// ------------------------------------------------------------
// SCALE
// ------------------------------------------------------------

scaleSlider.addEventListener(
"input",
() => {


    if (
        selectedFlower < 0
    ) {
        return;
    }


    flowers[
        selectedFlower
    ].scale =
        parseFloat(
            scaleSlider.value
        );


    discretizedPattern =
        null;

    isDiscretizedView =
        false;


    updateValueDisplays();

    updateViewButton();

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
    flowers[
        selectedFlower
    ];


xSlider.value =
    flower.x;

ySlider.value =
    flower.y;

rotationSlider.value =
    flower.rotation;

scaleSlider.value =
    flower.scale;


/*
 * Update selected object type.
 */

if (
    flower.typeIndex >= 0 &&
    flower.typeIndex <
    objectTypes.length
) {

    flowerSelect.value =
        String(
            flower.typeIndex
        );


    document.getElementById(
        "uploadedFileName"
    ).textContent =
        objectTypes[
            flower.typeIndex
        ].name;
}


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
    flowers[
        selectedFlower
    ];


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
 * Discretized view.
 */

if (
    isDiscretizedView &&
    discretizedPattern
) {

    drawDiscretizedPattern();

    return;
}


/*
 * Editable view background.
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


drawGrid();


}

// ============================================================
// DRAW OBJECT
// ============================================================

function drawFlower(
flower,
selected
) {


if (
    flower.typeIndex < 0 ||
    flower.typeIndex >= objectTypes.length
) {
    return;
}


const img =
    objectTypes[
        flower.typeIndex
    ].image;


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
// DRAW EDITABLE GRID
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
        i *
        cellWidth;


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
        j *
        cellHeight;


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
.getElementById(
"discretizePattern"
)
.addEventListener(
"click",
() => {


        if (
            objectTypes.length === 0 ||
            flowers.length === 0
        ) {

            alert(
                "Please add at least one PNG object."
            );

            return;
        }


        discretizedPattern =
            discretizePattern();


        isDiscretizedView =
            true;


        updateViewButton();

        draw();
    }
);


// ============================================================
// TOGGLE VIEW
// ============================================================

const toggleViewButton =
document.getElementById(
"toggleView"
);

toggleViewButton.addEventListener(
"click",
() => {


    if (
        !discretizedPattern
    ) {
        return;
    }


    isDiscretizedView =
        !isDiscretizedView;


    updateViewButton();

    draw();
}


);

// ============================================================
// UPDATE VIEW BUTTON
// ============================================================

function updateViewButton() {


if (
    !discretizedPattern
) {

    toggleViewButton.disabled =
        true;

    toggleViewButton.textContent =
        "Return to Editable Pattern";

    return;
}


toggleViewButton.disabled =
    false;


if (
    isDiscretizedView
) {

    toggleViewButton.textContent =
        "Return to Editable Pattern";

} else {

    toggleViewButton.textContent =
        "View Discretized Pattern";
}


}

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
    offscreen.getContext(
        "2d"
    );


/*
 * ========================================================
 * IMPORTANT:
 *
 * The discretized image ALWAYS starts with WHITE.
 *
 * This is independent of the editable background color.
 * ========================================================
 */

offCtx.fillStyle =
    "white";

offCtx.fillRect(
    0,
    0,
    offscreen.width,
    offscreen.height
);


/*
 * Draw all objects.
 */

for (
    const flower of flowers
) {

    if (
        flower.typeIndex < 0 ||
        flower.typeIndex >= objectTypes.length
    ) {
        continue;
    }


    const img =
        objectTypes[
            flower.typeIndex
        ].image;


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
        {
            length: ny
        },
        () =>
            Array(
                nx
            ).fill(0)
    );


/*
 * ========================================================
 * IMPORTANT:
 *
 * There is NO pattern.reverse() here.
 *
 * Canvas coordinates already use:
 *
 * row 0 = top
 * row ny-1 = bottom
 *
 * Therefore reversing the rows would cause the
 * discretized pattern to flip vertically.
 * ========================================================
 */


/*
 * Determine whether each grid cell contains
 * more than 50% foreground pixels.
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
                        canvas.width +
                        x
                    ) *
                    4;


                const r =
                    imageData
                        .data[index];

                const g =
                    imageData
                        .data[index + 1];

                const b =
                    imageData
                        .data[index + 2];

                const a =
                    imageData
                        .data[index + 3];


                /*
                 * Transparent pixels are background.
                 */

                if (
                    a < 20
                ) {

                    totalPixels++;

                    continue;
                }


                /*
                 * Compare against WHITE,
                 * because the discretization
                 * canvas uses a white background.
                 */

                const distance =
                    Math.sqrt(

                        Math.pow(
                            r - 255,
                            2
                        ) +

                        Math.pow(
                            g - 255,
                            2
                        ) +

                        Math.pow(
                            b - 255,
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
 * DO NOT FLIP THE PATTERN.
 */

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
 * White background.
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
 * Draw black cells.
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

                col *
                cellWidth,

                row *
                cellHeight,

                cellWidth,

                cellHeight
            );
        }
    }
}


/*
 * ========================================================
 * GRAY GRIDLINES
 *
 * These are deliberately drawn AFTER the cells so that
 * they appear over both the black and white cells.
 * ========================================================
 */

ctx.strokeStyle =
    "rgba(128,128,128,0.7)";

ctx.lineWidth = 1;

ctx.beginPath();


for (
    let i = 0;
    i <= nx;
    i++
) {

    const x =
        i *
        cellWidth;


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
        j *
        cellHeight;


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
 * ========================================================
 * ROW NUMBERS
 *
 * Both left and right.
 * ========================================================
 */

ctx.fillStyle =
    "black";

ctx.font =
    "bold 12px Arial";

ctx.textBaseline =
    "middle";


for (
    let row = 0;
    row < ny;
    row++
) {

    const y =
        row *
        cellHeight +
        cellHeight / 2;


    /*
     * Left.
     */

    ctx.textAlign =
        "right";


    ctx.fillText(

        String(
            row + 1
        ),

        cellWidth * 0.02 - 5,

        y
    );


    /*
     * Right.
     */

    ctx.textAlign =
        "left";


    ctx.fillText(

        String(
            row + 1
        ),

        canvas.width -
        cellWidth * 0.02 +
        5,

        y
    );
}


/*
 * ========================================================
 * COLUMN NUMBERS
 *
 * Both top and bottom.
 * ========================================================
 */

ctx.textAlign =
    "center";


/*
 * Top.
 */

ctx.textBaseline =
    "bottom";


for (
    let col = 0;
    col < nx;
    col++
) {

    const x =
        col *
        cellWidth +
        cellWidth / 2;


    ctx.fillText(

        String(
            col + 1
        ),

        x,

        -5
    );
}


/*
 * Bottom.
 */

ctx.textBaseline =
    "top";


for (
    let col = 0;
    col < nx;
    col++
) {

    const x =
        col *
        cellWidth +
        cellWidth / 2;


    ctx.fillText(

        String(
            col + 1
        ),

        x,

        canvas.height + 5
    );
}


/*
 * Run counts.
 */

if (
    showRunCounts
) {

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


    while (
        col < nx
    ) {

        const value =
            discretizedPattern[
                row
            ][
                col
            ];


        let end =
            col + 1;


        /*
         * Find the end of this run.
         */

        while (
            end < nx &&
            discretizedPattern[
                row
            ][
                end
            ] === value
        ) {

            end++;
        }


        const runLength =
            end - col;


        /*
         * =================================================
         * LEFT
         * =================================================
         */

        if (
            runDirection === "left" ||
            runDirection === "both"
        ) {

            ctx.textAlign =
                "right";


            const leftX =
                col *
                cellWidth -
                4;


            const y =
                row *
                cellHeight +
                cellHeight / 2;


            ctx.fillText(

                String(
                    runLength
                ),

                leftX,

                y
            );
        }


        /*
         * =================================================
         * RIGHT
         * =================================================
         */

        if (
            runDirection === "right" ||
            runDirection === "both"
        ) {

            ctx.textAlign =
                "left";


            const rightX =
                end *
                cellWidth +
                4;


            const y =
                row *
                cellHeight +
                cellHeight / 2;


            ctx.fillText(

                String(
                    runLength
                ),

                rightX,

                y
            );
        }


        /*
         * Move to next run.
         *
         * A one-cell run has:
         *
         * end = col + 1
         *
         * runLength = 1
         *
         * so it is correctly displayed as "1".
         */

        col =
            end;
    }
}


}

// ============================================================
// MOUSE DRAGGING
// ============================================================

let dragging = false;

let dragOffsetX = 0;
let dragOffsetY = 0;

// ============================================================
// MOUSE DOWN
// ============================================================

canvas.addEventListener(
"mousedown",
(event) => {


    /*
     * Don't manipulate objects while
     * looking at the discretized grid.
     */

    if (
        isDiscretizedView
    ) {

        return;
    }


    if (
        selectedFlower < 0 ||
        selectedFlower >= flowers.length
    ) {

        return;
    }


    if (
        flowers.length === 0
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
        (
            event.clientX -
            rect.left
        ) *
        scaleX;


    const mouseY =
        (
            event.clientY -
            rect.top
        ) *
        scaleY;


    const flower =
        flowers[
            selectedFlower
        ];


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
        ) <
        hitRadius
    ) {

        dragging = true;


        dragOffsetX =
            mouseX - fx;

        dragOffsetY =
            mouseY - fy;
    }
}


);

// ============================================================
// MOUSE MOVE
// ============================================================

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
        (
            event.clientX -
            rect.left
        ) *
        scaleX;


    const mouseY =
        (
            event.clientY -
            rect.top
        ) *
        scaleY;


    const flower =
        flowers[
            selectedFlower
        ];


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


    discretizedPattern =
        null;

    isDiscretizedView =
        false;


    updateControls();

    updateViewButton();

    draw();
}


);

// ============================================================
// MOUSE UP
// ============================================================

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
        isDiscretizedView
    ) {

        return;
    }


    if (
        flowers.length === 0
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
        (
            event.clientX -
            rect.left
        ) *
        scaleX;


    const mouseY =
        (
            event.clientY -
            rect.top
        ) *
        scaleY;


    let closest =
        -1;

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
            !isDiscretizedView
        ) {

            deleteFlowerButton.click();

            event.preventDefault();
        }
    }


    if (
        event.key === "Escape"
    ) {

        selectedFlower =
            -1;


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
