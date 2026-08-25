// ============================================================
// CROCHET PATTERN GENERATOR
// ============================================================

let nx = 60;
let ny = 30;

let backgroundColor = "#e2e922";

let canvas;
let ctx;


// ============================================================
// PNG IMAGE LIBRARY
// ============================================================
//
// Each uploaded PNG is stored here permanently during the
// current browser session.
//
// Example:
//
// images = [
//     {
//         id: 0,
//         name: "flower.png",
//         image: Image object
//     },
//     {
//         id: 1,
//         name: "heart.png",
//         image: Image object
//     }
// ];
//
// Each flower/object then stores imageId so different PNGs
// can coexist in the same pattern.
// ============================================================

let images = [];

let nextImageId = 0;


// ============================================================
// PATTERN OBJECTS
// ============================================================
//
// Each object has:
//     imageId
//     x
//     y
//     rotation
//     scale
// ============================================================

let flowers = [];

let selectedFlower = -1;


// ============================================================
// DISPLAY SETTINGS
// ============================================================

let showRunCounts = false;

let runDirection = "left";

let discretizedPattern = null;

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
         * If the user selected a PNG on the startup screen,
         * load that PNG.
         *
         * Otherwise use flower.png.
         */
        if (
            pngInput.files.length > 0
        ) {

            loadPNG(
                pngInput.files[0],
                true
            );

        } else {

            loadDefaultPNG();
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
            objectUpload.files[0],
            false
        );


        /*
         * Reset the file input so that the user can
         * select the same file again later if desired.
         */
        objectUpload.value = "";
    }
);


// ============================================================
// LOAD DEFAULT PNG
// ============================================================

function loadDefaultPNG() {

    /*
     * Check whether flower.png has already been loaded.
     */
    const existing =
        images.find(
            item =>
                item.name === "flower.png"
        );


    if (existing) {

        updateImageSelector();

        if (flowers.length === 0) {

            flowers.push(
                createFlower(existing.id)
            );

            selectedFlower = 0;
        }

        updateControls();

        draw();

        return;
    }


    const img =
        new Image();


    img.onload =
        function() {

            const imageRecord = {

                id:
                    nextImageId++,

                name:
                    "flower.png",

                image:
                    img
            };


            images.push(
                imageRecord
            );


            updateImageSelector();


            /*
             * Automatically create one flower object
             * using the default image.
             */
            if (
                flowers.length === 0
            ) {

                flowers.push(
                    createFlower(
                        imageRecord.id
                    )
                );

                selectedFlower = 0;
            }


            document.getElementById(
                "uploadedFileName"
            ).textContent =
                "flower.png";


            updateControls();

            updateDiscretizeButton();

            draw();
        };


    img.onerror =
        function() {

            console.warn(
                "Could not load flower.png. " +
                "Make sure flower.png is in the same folder " +
                "as index.html."
            );


            document.getElementById(
                "uploadedFileName"
            ).textContent =
                "flower.png not found";
        };


    img.src =
        "flower.png";
}


// ============================================================
// LOAD USER PNG
// ============================================================

function loadPNG(
    file,
    startupImage = false
) {

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

                    /*
                     * Create a new image record.
                     */
                    const imageRecord = {

                        id:
                            nextImageId++,

                        name:
                            file.name,

                        image:
                            img
                    };


                    /*
                     * IMPORTANT:
                     *
                     * We PUSH the image into the library.
                     *
                     * We do NOT delete existing images.
                     */
                    images.push(
                        imageRecord
                    );


                    /*
                     * Update the dropdown.
                     */
                    updateImageSelector();


                    /*
                     * Select the newly uploaded image.
                     */
                    document.getElementById(
                        "flowerSelect"
                    ).value =
                        String(
                            imageRecord.id
                        );


                    document.getElementById(
                        "uploadedFileName"
                    ).textContent =
                        file.name;


                    /*
                     * If this was the startup image,
                     * create the first object automatically.
                     */
                    if (
                        startupImage &&
                        flowers.length === 0
                    ) {

                        flowers.push(
                            createFlower(
                                imageRecord.id
                            )
                        );

                        selectedFlower = 0;
                    }


                    /*
                     * If an image is uploaded after the
                     * application is already running, do NOT
                     * automatically replace existing objects.
                     *
                     * Instead, the user can click Add Object
                     * to add the newly uploaded PNG.
                     */
                    discretizedPattern = null;

                    isDiscretized = false;


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
// UPDATE IMAGE SELECTOR
// ============================================================

function updateImageSelector() {

    const select =
        document.getElementById(
            "flowerSelect"
        );


    select.innerHTML = "";


    for (
        const imageRecord of images
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(
                imageRecord.id
            );


        option.textContent =
            imageRecord.name;


        select.appendChild(
            option
        );
    }
}


// ============================================================
// IMAGE SELECTION
// ============================================================

document
    .getElementById(
        "flowerSelect"
    )
    .addEventListener(
        "change",
        () => {

            /*
             * Selecting a PNG here does not change existing
             * objects. It simply chooses which PNG will be used
             * the next time "Add Object" is clicked.
             */
            draw();
        }
    );


// ============================================================
// CREATE OBJECT
// ============================================================

function createFlower(
    imageId
) {

    /*
     * If no image ID was supplied, use the currently selected
     * image in the dropdown.
     */
    if (
        imageId === undefined
    ) {

        const select =
            document.getElementById(
                "flowerSelect"
            );


        imageId =
            parseInt(
                select.value
            );
    }


    return {

        imageId:
            imageId,

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
            images.length === 0
        ) {

            alert(
                "Please upload a PNG first."
            );

            return;
        }


        const select =
            document.getElementById(
                "flowerSelect"
            );


        const imageId =
            parseInt(
                select.value
            );


        if (
            !Number.isFinite(imageId)
        ) {

            alert(
                "Please select a PNG object."
            );

            return;
        }


        flowers.push(
            createFlower(
                imageId
            )
        );


        selectedFlower =
            flowers.length - 1;


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


// ============================================================
// X POSITION
// ============================================================

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


// ============================================================
// Y POSITION
// ============================================================

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


// ============================================================
// ROTATION
// ============================================================

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


// ============================================================
// SCALE
// ============================================================

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


    /*
     * Make the image used by the selected object appear
     * as the selected item in the PNG dropdown.
     */
    document.getElementById(
        "flowerSelect"
    ).value =
        String(
            flower.imageId
        );


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
     * Discretized view.
     */
    if (
        isDiscretized &&
        discretizedPattern
    ) {

        drawDiscretizedPattern();

        return;
    }


    /*
     * Editable view.
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

    const imageRecord =
        images.find(
            item =>
                item.id === flower.imageId
        );


    if (!imageRecord) {

        return;
    }


    const img =
        imageRecord.image;


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
             * Return to editable view.
             */
            if (isDiscretized) {

                isDiscretized = false;

                updateDiscretizeButton();

                draw();

                return;
            }


            /*
             * Need at least one object.
             */
            if (
                flowers.length === 0
            ) {

                alert(
                    "Please add at least one object first."
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
     * The offscreen canvas represents ONLY the
     * actual pattern area.
     */
    offscreen.width =
        patternWidth;

    offscreen.height =
        patternHeight;


    const offCtx =
        offscreen.getContext("2d");


    /*
     * White discretization background.
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
     * Render every object.
     */
    for (
        const flower of flowers
    ) {

        const imageRecord =
            images.find(
                item =>
                    item.id === flower.imageId
            );


        if (!imageRecord) {

            continue;
        }


        const img =
            imageRecord.image;


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
     * Read rendered pixels.
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


    const bg = {

        r: 255,
        g: 255,
        b: 255
    };


    /*
     * Determine each cell.
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
     * IMPORTANT:
     *
     * Do NOT reverse the rows.
     *
     * This preserves the same vertical orientation as
     * the editable PNG view.
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
     * Black cells.
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
     * Gray gridlines.
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
     * Numbers.
     */
    ctx.fillStyle =
        "black";

    ctx.font =
        "bold 12px Arial";


    /*
     * Row numbers.
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
         * Left.
         */
        ctx.textAlign =
            "right";


        ctx.fillText(

            String(row + 1),

            patternX - 7,

            y
        );


        /*
         * Right.
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
     * Column numbers.
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
         * Top.
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
         * Bottom.
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
// DRAW RUN COUNTS
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
     * Process each row.
     */
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
                discretizedPattern[row][col];


            let end =
                col + 1;


            /*
             * Find the end of this run.
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
             * LEFT
             */
            if (
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
             * RIGHT
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
             * BOTH
             *
             * For a one-cell run, only draw the number once.
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


                /*
                 * Don't draw the same number twice for
                 * a one-cell run.
                 */
                if (
                    runLength > 1
                ) {

                    ctx.fillText(

                        String(runLength),

                        rightX,
                        y
                    );
                }
            }


            col =
                end;
        }
    }
}


// ============================================================
// CANVAS COORDINATE CONVERSION
// ============================================================

function getCanvasCoordinates(
    event
) {

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
            isDiscretized ||
            selectedFlower < 0
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


// ============================================================
// MOUSE MOVEMENT
// ============================================================

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


        discretizedPattern = null;

        isDiscretized = false;


        updateControls();

        updateDiscretizeButton();

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
            isDiscretized
        ) {

            return;
        }


        const mouse =
            getCanvasCoordinates(
                event
            );


        let closest =
            -1;

        let closestDistance =
            Infinity;


        /*
         * Iterate backwards so objects added later
         * are selected first when they overlap.
         */
        for (
            let i = flowers.length - 1;
            i >= 0;
            i--
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


function hexToRgb(
    hex
) {

    hex =
        hex.replace(
            "#",
            ""
        );


    return {

        r:
            parseInt(
                hex.substring(0, 2),
                16
            ),

        g:
            parseInt(
                hex.substring(2, 4),
                16
            ),

        b:
            parseInt(
                hex.substring(4, 6),
                16
            )
    };
}