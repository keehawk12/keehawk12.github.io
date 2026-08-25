javascript
// ============================================================
// CROCHET PATTERN GENERATOR
// ============================================================

let nx = 60;
let ny = 30;

let backgroundColor = "#e2e922";

let canvas;
let ctx;

// ------------------------------------------------------------
// PNG LIBRARY
// ------------------------------------------------------------
// Every uploaded PNG is stored here.
//
// Example:
// pngObjects = [
//     {
//         id: 0,
//         name: "flower.png",
//         image: Image()
//     },
//     {
//         id: 1,
//         name: "leaf.png",
//         image: Image()
//     }
// ]
// ------------------------------------------------------------

let pngObjects = [];


// ------------------------------------------------------------
// OBJECTS ON THE PATTERN
// ------------------------------------------------------------
// Each object stores which PNG it uses.
//
// Example:
//
// {
//     pngId: 0,
//     x: 0.5,
//     y: 0.5,
//     rotation: 0,
//     scale: 1
// }
// ------------------------------------------------------------//

let flowers = [];

let selectedFlower = -1;

let showRunCounts = false;

let runDirection = "left";

let discretizedPattern = null;

let isDiscretized = false;


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


        nx =
            Math.round(nx);

        ny =
            Math.round(ny);


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
         * If PNGs were selected on the
         * startup screen, load them.
         */

        if (
            pngInput.files.length > 0
        ) {

            for (
                const file of pngInput.files
            ) {

                loadPNG(file);
            }
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

        isDiscretized = false;

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


        /*
         * IMPORTANT:
         *
         * Do NOT clear pngObjects.
         *
         * Every uploaded PNG is added
         * to the existing library.
         */

        for (
            const file of objectUpload.files
        ) {

            loadPNG(file);
        }


        /*
         * Reset the input so selecting
         * the same file again works.
         */

        objectUpload.value = "";
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

                    /*
                     * Create a unique ID.
                     */

                    const id =
                        pngObjects.length;


                    pngObjects.push({

                        id: id,

                        name: file.name,

                        image: img

                    });


                    /*
                     * Add the PNG to the
                     * dropdown.
                     */

                    addPNGToDropdown(
                        id,
                        file.name
                    );


                    /*
                     * Show the most recently
                     * uploaded filename.
                     */

                    document.getElementById(
                        "uploadedFileName"
                    ).textContent =
                        file.name;


                    /*
                     * Automatically select
                     * the newly uploaded PNG.
                     */

                    document.getElementById(
                        "flowerSelect"
                    ).value =
                        String(id);


                    discretizedPattern = null;

                    isDiscretized = false;

                    draw();
                };


            img.src =
                event.target.result;
        };


    reader.readAsDataURL(file);
}


// ============================================================
// ADD PNG TO DROPDOWN
// ============================================================

function addPNGToDropdown(
    id,
    filename
) {

    const select =
        document.getElementById(
            "flowerSelect"
        );


    const option =
        document.createElement(
            "option"
        );


    option.value =
        String(id);


    option.textContent =
        filename;


    select.appendChild(
        option
    );
}


// ============================================================
// CREATE OBJECT
// ============================================================

function createFlower(
    pngId
) {

    return {

        pngId: pngId,

        x: 0.5,

        y: 0.5,

        rotation: 0,

        scale: 1.0
    };
}


// ============================================================
// PNG SELECTION
// ============================================================

const flowerSelect =
    document.getElementById(
        "flowerSelect"
    );


flowerSelect.addEventListener(
    "change",
    () => {

        const id =
            parseInt(
                flowerSelect.value
            );


        if (
            Number.isFinite(id)
        ) {

            const png =
                pngObjects.find(
                    p => p.id === id
                );


            if (png) {

                document.getElementById(
                    "uploadedFileName"
                ).textContent =
                    png.name;
            }
        }
    }
);


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
            pngObjects.length === 0
        ) {

            alert(
                "Please upload a PNG first."
            );

            return;
        }


        const pngId =
            parseInt(
                flowerSelect.value
            );


        if (
            !Number.isFinite(pngId)
        ) {

            alert(
                "Please select a PNG."
            );

            return;
        }


        /*
         * Add a new object WITHOUT
         * removing any existing objects.
         */

        flowers.push(
            createFlower(
                pngId
            )
        );


        selectedFlower =
            flowers.length - 1;


        discretizedPattern = null;

        isDiscretized = false;

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

        isDiscretized = false;

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


        flowers[selectedFlower].x =
            parseFloat(
                xSlider.value
            );


        discretizedPattern = null;

        isDiscretized = false;

        updateValueDisplays();

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


        flowers[selectedFlower].y =
            parseFloat(
                ySlider.value
            );


        discretizedPattern = null;

        isDiscretized = false;

        updateValueDisplays();

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


        flowers[selectedFlower].rotation =
            parseFloat(
                rotationSlider.value
            );


        discretizedPattern = null;

        isDiscretized = false;

        updateValueDisplays();

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


        flowers[selectedFlower].scale =
            parseFloat(
                scaleSlider.value
            );


        discretizedPattern = null;

        isDiscretized = false;

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


    if (
        disabled
    ) {

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
// GET PNG FOR OBJECT
// ============================================================

function getPNGForFlower(
    flower
) {

    return pngObjects.find(
        png =>
            png.id === flower.pngId
    );
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
     * Discretized mode.
     */

    if (
        isDiscretized &&
        discretizedPattern
    ) {

        drawDiscretizedPattern();

        return;
    }


    /*
     * Editable object mode.
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

    const png =
        getPNGForFlower(
            flower
        );


    if (!png) {

        return;
    }


    const img =
        png.image;


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

    if (
        selected
    ) {

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
        canvas.width /
        nx;

    const cellHeight =
        canvas.height /
        ny;


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
    .getElementById(
        "discretizePattern"
    )
    .addEventListener(
        "click",
        () => {

            if (
                flowers.length === 0
            ) {

                alert(
                    "Please add at least one object."
                );

                return;
            }


            discretizedPattern =
                discretizePattern();


            isDiscretized = true;

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
        offscreen.getContext(
            "2d"
        );


    /*
     * IMPORTANT:
     *
     * Discretized background is ALWAYS WHITE.
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
     * Draw every object.
     */

    for (
        const flower of flowers
    ) {

        const png =
            getPNGForFlower(
                flower
            );


        if (!png) {

            continue;
        }


        const img =
            png.image;


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
        canvas.width /
        nx;

    const cellHeight =
        canvas.height /
        ny;


    const pattern =
        Array.from(
            {
                length: ny
            },
            () =>
                Array(nx).fill(0)
        );


    /*
     * Since the discretized canvas has a WHITE
     * background, compare against white.
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
                        ) * 4;


                    const r =
                        imageData.data[
                            index
                        ];

                    const g =
                        imageData.data[
                            index + 1
                        ];

                    const b =
                        imageData.data[
                            index + 2
                        ];


                    const a =
                        imageData.data[
                            index + 3
                        ];


                    if (
                        a < 20
                    ) {

                        totalPixels++;

                        continue;
                    }


                    /*
                     * Distance from white.
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
     * IMPORTANT:
     *
     * DO NOT reverse the pattern here.
     *
     * The previous flipud-equivalent operation:
     *
     *     pattern.reverse()
     *
     * was causing the discretized image to
     * appear upside-down.
     *
     * The canvas coordinate system and the
     * displayed grid use the same top-to-bottom
     * row ordering, so the pattern should remain
     * exactly as generated.
     */


    return pattern;
}


// ============================================================
// DRAW DISCRETIZED PATTERN
// ============================================================

function drawDiscretizedPattern() {

    const cellWidth =
        canvas.width /
        nx;

    const cellHeight =
        canvas.height /
        ny;


    /*
     * WHITE BACKGROUND
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
     * BLACK CELLS
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
     * GRAY GRIDLINES
     *
     * These are drawn AFTER the cells so
     * they are visible over both black and
     * white cells.
     */

    ctx.strokeStyle =
        "rgba(128,128,128,0.65)";

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
     * ROW NUMBERS
     *
     * Both LEFT and RIGHT.
     */

    ctx.fillStyle =
        "black";

    ctx.font =
        "bold 12px Arial";

    ctx.textBaseline =
        "middle";


    /*
     * LEFT
     */

    ctx.textAlign =
        "right";


    for (
        let row = 0;
        row < ny;
        row++
    ) {

        const y =
            row *
            cellHeight +
            cellHeight / 2;


        ctx.fillText(

            String(row + 1),

            cellWidth * 0.02 - 5,

            y
        );
    }


    /*
     * RIGHT
     */

    ctx.textAlign =
        "left";


    for (
        let row = 0;
        row < ny;
        row++
    ) {

        const y =
            row *
            cellHeight +
            cellHeight / 2;


        ctx.fillText(

            String(row + 1),

            canvas.width -
                cellWidth * 0.02 +
                5,

            y
        );
    }


    /*
     * COLUMN NUMBERS
     *
     * Both TOP and BOTTOM.
     */

    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "bottom";


    /*
     * TOP
     */

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

            String(col + 1),

            x,

            -5
        );
    }


    /*
     * BOTTOM
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

            String(col + 1),

            x,

            canvas.height + 5
        );
    }


    /*
     * RUN COUNTS
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
        canvas.width /
        nx;

    const cellHeight =
        canvas.height /
        ny;


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
             * Left / Right / Both
             */

            let displayColumns = [];


            if (
                runDirection ===
                "left"
            ) {

                displayColumns = [
                    col
                ];

            } else if (
                runDirection ===
                "right"
            ) {

                displayColumns = [
                    end - 1
                ];

            } else if (
                runDirection ===
                "both"
            ) {

                displayColumns = [
                    col,
                    end - 1
                ];
            }


            /*
             * Draw the run count.
             */

            ctx.textAlign =
                "center";


            for (
                const displayCol
                of displayColumns
            ) {

                const x =
                    displayCol *
                    cellWidth +
                    cellWidth / 2;


                const y =
                    row *
                    cellHeight +
                    cellHeight / 2;


                ctx.fillText(

                    String(runLength),

                    x,

                    y
                );
            }


            col =
                end;

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
            selectedFlower < 0
        ) {

            return;
        }


        if (
            isDiscretized
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


        const png =
            getPNGForFlower(
                flower
            );


        if (!png) {
            return;
        }


        const hitRadius =
            Math.max(
                png.image.width,
                png.image.height
            ) *
            flower.scale /
            2;


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


// ============================================================
// MOUSE MOVE
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


        discretizedPattern = null;

        updateControls();

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


            const png =
                getPNGForFlower(
                    flower
                );


            if (!png) {
                continue;
            }


            const hitRadius =
                Math.max(
                    png.image.width,
                    png.image.height
                ) *
                flower.scale /
                2;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


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


            /*
             * Automatically update the
             * PNG dropdown to show which
             * PNG this object uses.
             */

            const flower =
                flowers[
                    selectedFlower
                ];


            flowerSelect.value =
                String(
                    flower.pngId
                );


            const png =
                getPNGForFlower(
                    flower
                );


            if (png) {

                document.getElementById(
                    "uploadedFileName"
                ).textContent =
                    png.name;
            }


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

