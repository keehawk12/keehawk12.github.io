// ============================================================
// CROCHET PATTERN GENERATOR
// ============================================================

let nx = 60;
let ny = 30;

let backgroundColor = "#e2e922";

let canvas;
let ctx;


// ============================================================
// OBJECT LIBRARY
// ============================================================
//
// uploadedObjects contains every PNG uploaded by the user.
//
// Each object looks like:
//
// {
//     id: 0,
//     name: "flower.png",
//     image: Image
// }
//
// ============================================================

let uploadedObjects = [];

let nextObjectId = 0;


// ============================================================
// PATTERN OBJECT INSTANCES
// ============================================================
//
// flowers contains objects that have actually been placed
// on the pattern.
//
// Each flower looks like:
//
// {
//     objectId: 0,
//     x: 0.5,
//     y: 0.5,
//     rotation: 0,
//     scale: 1
// }
//
// ============================================================

let flowers = [];

let selectedFlower = -1;

let selectedObjectId = null;


// ============================================================
// OTHER STATE
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
    async () => {

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
         * Load every PNG selected during startup.
         */
        if (
            pngInput.files.length > 0
        ) {

            for (
                const file of pngInput.files
            ) {

                await loadPNG(file);
            }
        }


        updateObjectDropdown();

        updateControls();

        updateDiscretizeButton();

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
    async () => {

        if (
            objectUpload.files.length === 0
        ) {

            return;
        }


        /*
         * IMPORTANT:
         *
         * We DO NOT clear uploadedObjects.
         *
         * Every newly uploaded PNG is appended
         * to the existing object library.
         */
        for (
            const file of objectUpload.files
        ) {

            await loadPNG(file);
        }


        updateObjectDropdown();

        updateControls();

        updateDiscretizeButton();

        draw();


        /*
         * Reset the input so selecting the same file
         * again will still trigger the change event.
         */
        objectUpload.value = "";
    }
);


// ============================================================
// LOAD PNG
// ============================================================

function loadPNG(file) {

    return new Promise(
        (resolve, reject) => {

            if (
                !file.type.includes("png")
            ) {

                alert(
                    `"${file.name}" is not a PNG image.`
                );

                reject(
                    new Error(
                        "Invalid PNG file."
                    )
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
                             * Create a permanent entry
                             * in the object library.
                             */
                            const object = {

                                id:
                                    nextObjectId++,

                                name:
                                    file.name,

                                image:
                                    img
                            };


                            uploadedObjects.push(
                                object
                            );


                            /*
                             * Make the newly uploaded
                             * image the selected image
                             * in the dropdown.
                             */
                            selectedObjectId =
                                object.id;


                            document.getElementById(
                                "uploadedFileName"
                            ).textContent =
                                `${uploadedObjects.length} PNG` +
                                (
                                    uploadedObjects.length === 1
                                        ? ""
                                        : "s"
                                ) +
                                " uploaded";


                            updateObjectDropdown();


                            resolve();
                        };


                    img.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Could not load PNG."
                                )
                            );
                        };


                    img.src =
                        event.target.result;
                };


            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Could not read PNG."
                        )
                    );
                };


            reader.readAsDataURL(file);
        }
    );
}


// ============================================================
// OBJECT DROPDOWN
// ============================================================

const flowerSelect =
    document.getElementById(
        "flowerSelect"
    );


flowerSelect.addEventListener(
    "change",
    () => {

        if (
            flowerSelect.value === ""
        ) {

            selectedObjectId = null;

            return;
        }


        selectedObjectId =
            Number(
                flowerSelect.value
            );
    }
);


// ============================================================
// UPDATE OBJECT DROPDOWN
// ============================================================

function updateObjectDropdown() {

    flowerSelect.innerHTML = "";


    if (
        uploadedObjects.length === 0
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value = "";

        option.textContent =
            "No PNGs uploaded";


        flowerSelect.appendChild(
            option
        );


        flowerSelect.disabled = true;

        return;
    }


    flowerSelect.disabled = false;


    for (
        const object of uploadedObjects
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(object.id);


        option.textContent =
            object.name;


        flowerSelect.appendChild(
            option
        );
    }


    /*
     * Make sure the selected object still exists.
     */
    const selectedExists =
        uploadedObjects.some(
            object =>
                object.id === selectedObjectId
        );


    if (
        !selectedExists
    ) {

        selectedObjectId =
            uploadedObjects[0].id;
    }


    flowerSelect.value =
        String(
            selectedObjectId
        );
}


// ============================================================
// GET OBJECT BY ID
// ============================================================

function getObjectById(id) {

    return uploadedObjects.find(
        object =>
            object.id === id
    );
}


// ============================================================
// CREATE OBJECT INSTANCE
// ============================================================

function createFlower(
    objectId
) {

    return {

        objectId: objectId,

        x: 0.5,

        y: 0.5,

        rotation: 0,

        scale: 1.0
    };
}


// ============================================================
// ADD OBJECT TO PATTERN
// ============================================================

const addFlowerButton =
    document.getElementById(
        "addFlower"
    );


addFlowerButton.addEventListener(
    "click",
    () => {

        if (
            uploadedObjects.length === 0
        ) {

            alert(
                "Please upload a PNG first."
            );

            return;
        }


        if (
            selectedObjectId === null
        ) {

            selectedObjectId =
                uploadedObjects[0].id;
        }


        const newFlower =
            createFlower(
                selectedObjectId
            );


        flowers.push(
            newFlower
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
// DELETE OBJECT FROM PATTERN
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
     * Draw every object instance.
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

    const object =
        getObjectById(
            flower.objectId
        );


    if (!object) {

        return;
    }


    const img =
        object.image;


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

        ctx.lineWidth =
            3;


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

    ctx.lineWidth =
        1;

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
// DISCRETIZE / EDIT BUTTON
// ============================================================

document
    .getElementById(
        "discretizePattern"
    )
    .addEventListener(
        "click",
        () => {

            /*
             * Return to editable mode.
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
                    "Please add at least one object to the pattern."
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

        const object =
            getObjectById(
                flower.objectId
            );


        if (!object) {

            continue;
        }


        const img =
            object.image;


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
     * DO NOT reverse the rows.
     *
     * This preserves the original PNG's
     * top-to-bottom orientation.
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

    ctx.lineWidth =
        1;

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
     * Number style.
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
             * For a one-cell run, only write the
             * number once because both ends are
             * the same cell.
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


            col = end;
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


        const object =
            getObjectById(
                flower.objectId
            );


        if (!object) {

            return;
        }


        const hitRadius =
            Math.max(
                object.image.width,
                object.image.height
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
            isDiscretized
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


        /*
         * Search backwards so that objects
         * drawn later are selected first.
         */
        for (
            let i = flowers.length - 1;
            i >= 0;
            i--
        ) {

            const flower =
                flowers[i];


            const object =
                getObjectById(
                    flower.objectId
                );


            if (!object) {

                continue;
            }


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
                Math.max(
                    object.image.width,
                    object.image.height
                ) *
                flower.scale /
                2;


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