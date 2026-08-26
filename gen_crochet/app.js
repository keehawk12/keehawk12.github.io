// ============================================================
// CROCHET PATTERN GENERATOR
// ============================================================


// ============================================================
// GLOBAL SETTINGS
// ============================================================

let nx = 60;
let ny = 30;

let backgroundColor = "#e2e922";

let canvas;
let ctx;


// ============================================================
// IMAGE LIBRARY
// ============================================================
//
// Each entry represents an AVAILABLE image.
//
// Default images:
//
// {
//     id: "default-...",
//     name: "flower.png",
//     source: "default",
//     src: "default/flower.png",
//     image: Image
// }
//
// Uploaded images are added directly to the object selector.
// ============================================================

let objectLibrary = [];


// ============================================================
// OBJECTS ACTUALLY PLACED IN THE PATTERN
// ============================================================

let flowers = [];

let selectedFlower = -1;


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
// OBJECT SELECTOR ELEMENTS
// ============================================================
//
// The new selector consists of:
//
// objectSelector
//     The outer selector container.
//
// objectSelectorButton
//     The visible button showing the selected object.
//
// objectSelectorMenu
//     The dropdown/folder menu.
//
// ============================================================

const objectSelector =
    document.getElementById(
        "objectSelector"
    );

const objectSelectorButton =
    document.getElementById(
        "objectSelectorButton"
    );

const objectSelectorMenu =
    document.getElementById(
        "objectSelectorMenu"
    );


// ============================================================
// CURRENT OBJECT SELECTION
// ============================================================

let selectedObjectId = "";


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
         * Load all default images.
         */
        await loadDefaultImages();


        /*
         * If the user selected a PNG on the
         * startup screen, add it to the library.
         */
        if (
            pngInput.files.length > 0
        ) {

            const object =
                await loadPNG(
                    pngInput.files[0]
                );


            if (object) {

                /*
                 * Preserve previous behavior:
                 * automatically place uploaded PNG.
                 */
                flowers.push(
                    createFlower(
                        object.id
                    )
                );


                selectedFlower =
                    flowers.length - 1;


                selectedObjectId =
                    object.id;
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
// LOAD DEFAULT IMAGES
// ============================================================
//
// Default images are located in:
//
//     default/
//
// Their filenames are specified by:
//
//     default/images.json
//
// Example:
//
// [
//     "flower.png",
//     "star.png",
//     "heart.png"
// ]
//
// No list needs to be maintained in app.js.
// ============================================================

async function loadDefaultImages() {

    try {

        const response =
            await fetch(
                "default/images.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load default/images.json"
            );
        }


        const filenames =
            await response.json();


        if (
            !Array.isArray(filenames)
        ) {

            throw new Error(
                "images.json must contain an array."
            );
        }


        /*
         * Load every filename.
         */
        for (
            const filename of filenames
        ) {

            if (
                typeof filename !== "string"
            ) {

                continue;
            }


            await addImageToLibrary(
                "default/" + filename,
                filename,
                "default"
            );
        }


    } catch (error) {

        console.warn(
            "Default image loading failed:",
            error
        );
    }
}


// ============================================================
// ADD IMAGE TO LIBRARY
// ============================================================

async function addImageToLibrary(
    src,
    name,
    source
) {

    /*
     * Prevent duplicate entries.
     */
    const existing =
        objectLibrary.find(
            obj =>
                obj.src === src
        );


    if (existing) {

        return existing;
    }


    try {

        const image =
            await loadImage(src);


        const object = {

            id:
                source +
                "-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2),

            name:
                name,

            source:
                source,

            src:
                src,

            image:
                image
        };


        objectLibrary.push(
            object
        );


        updateObjectDropdown();


        return object;


    } catch (error) {

        console.error(
            "Could not load image:",
            src,
            error
        );


        return null;
    }
}


// ============================================================
// LOAD IMAGE PROMISE
// ============================================================

function loadImage(src) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const img =
                new Image();


            img.onload =
                () => {

                    resolve(img);
                };


            img.onerror =
                () => {

                    reject(
                        new Error(
                            "Failed to load " +
                            src
                        )
                    );
                };


            img.src =
                src;
        }
    );
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


        invalidateDiscretization();

        draw();
    }
);


// ============================================================
// UPLOAD PNG
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


        const file =
            objectUpload.files[0];


        const object =
            await loadPNG(file);


        if (object) {

            const uploadedFileName =
                document.getElementById(
                    "uploadedFileName"
                );


            if (uploadedFileName) {

                uploadedFileName.textContent =
                    file.name;
            }


            /*
             * Automatically add the uploaded
             * image as an object.
             */
            flowers.push(
                createFlower(
                    object.id
                )
            );


            selectedFlower =
                flowers.length - 1;


            selectedObjectId =
                object.id;


            invalidateDiscretization();

            updateObjectDropdown();

            updateControls();

            updateDiscretizeButton();

            draw();
        }
    }
);


// ============================================================
// LOAD PNG
// ============================================================
//
// Uploaded PNGs go directly into the object library.
// They are NOT placed inside an "Uploaded" folder.
// ============================================================

async function loadPNG(file) {

    if (
        !file.type.includes("png")
    ) {

        alert(
            "Please select a PNG image."
        );

        return null;
    }


    return new Promise(
        (resolve) => {

            const reader =
                new FileReader();


            reader.onload =
                async function(event) {

                    const src =
                        event.target.result;


                    try {

                        const img =
                            await loadImage(src);


                        const object = {

                            id:
                                "uploaded-" +
                                Date.now() +
                                "-" +
                                Math.random()
                                    .toString(36)
                                    .substring(2),

                            name:
                                file.name,

                            source:
                                "uploaded",

                            src:
                                src,

                            image:
                                img
                        };


                        objectLibrary.push(
                            object
                        );


                        updateObjectDropdown();


                        resolve(object);


                    } catch (error) {

                        console.error(
                            error
                        );


                        alert(
                            "Could not load the PNG."
                        );


                        resolve(null);
                    }
                };


            reader.readAsDataURL(file);
        }
    );
}


// ============================================================
// OBJECT DROPDOWN / FOLDER SELECTOR
// ============================================================

function updateObjectDropdown() {

    if (
        !objectSelectorMenu ||
        !objectSelectorButton
    ) {

        return;
    }


    /*
     * Clear the menu.
     */
    objectSelectorMenu.innerHTML = "";


    /*
     * --------------------------------------------------------
     * DEFAULT FOLDER
     * --------------------------------------------------------
     */

    const defaultObjects =
        objectLibrary.filter(
            object =>
                object.source === "default"
        );


    if (
        defaultObjects.length > 0
    ) {

        const defaultFolder =
            document.createElement(
                "div"
            );


        defaultFolder.className =
            "object-folder";


        /*
         * Folder header.
         */
        const folderHeader =
            document.createElement(
                "button"
            );


        folderHeader.type =
            "button";


        folderHeader.className =
            "object-folder-header";


        folderHeader.innerHTML =
            '<span class="folder-arrow">▶</span>' +
            '<span>Default</span>';


        /*
         * Folder contents.
         */
        const folderContents =
            document.createElement(
                "div"
            );


        folderContents.className =
            "object-folder-contents";


        /*
         * Start CLOSED.
         */
        folderContents.classList.add(
            "collapsed"
        );


        /*
         * Toggle folder.
         */
        folderHeader.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                const isCollapsed =
                    folderContents.classList.contains(
                        "collapsed"
                    );


                if (
                    isCollapsed
                ) {

                    folderContents.classList.remove(
                        "collapsed"
                    );

                    folderHeader
                        .querySelector(
                            ".folder-arrow"
                        )
                        .textContent =
                        "▼";

                } else {

                    folderContents.classList.add(
                        "collapsed"
                    );

                    folderHeader
                        .querySelector(
                            ".folder-arrow"
                        )
                        .textContent =
                        "▶";
                }
            }
        );


        /*
         * Add default objects.
         */
        for (
            const object of defaultObjects
        ) {

            const item =
                createObjectMenuItem(
                    object
                );


            folderContents.appendChild(
                item
            );
        }


        defaultFolder.appendChild(
            folderHeader
        );


        defaultFolder.appendChild(
            folderContents
        );


        objectSelectorMenu.appendChild(
            defaultFolder
        );
    }


    /*
     * --------------------------------------------------------
     * UPLOADED OBJECTS
     * --------------------------------------------------------
     *
     * Uploaded objects are placed directly in
     * the main object selector.
     */

    const uploadedObjects =
        objectLibrary.filter(
            object =>
                object.source === "uploaded"
        );


    for (
        const object of uploadedObjects
    ) {

        const item =
            createObjectMenuItem(
                object
            );


        objectSelectorMenu.appendChild(
            item
        );
    }


    /*
     * --------------------------------------------------------
     * NO OBJECTS
     * --------------------------------------------------------
     */

    if (
        objectLibrary.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "object-menu-empty";


        empty.textContent =
            "No PNGs available";


        objectSelectorMenu.appendChild(
            empty
        );


        objectSelectorButton.textContent =
            "No PNGs available";


        return;
    }


    /*
     * --------------------------------------------------------
     * RESTORE CURRENT SELECTION
     * --------------------------------------------------------
     */

    if (
        selectedObjectId
    ) {

        const selected =
            getLibraryObject(
                selectedObjectId
            );


        if (
            selected
        ) {

            updateObjectSelectorButton(
                selected
            );

            return;
        }
    }


    /*
     * If there is no selection yet,
     * use the first object.
     */
    const firstObject =
        objectLibrary[0];


    selectedObjectId =
        firstObject.id;


    updateObjectSelectorButton(
        firstObject
    );
}


// ============================================================
// CREATE OBJECT MENU ITEM
// ============================================================

function createObjectMenuItem(
    object
) {

    const item =
        document.createElement(
            "button"
        );


    item.type =
        "button";


    item.className =
        "object-menu-item";


    item.dataset.objectId =
        object.id;


    /*
     * Thumbnail.
     */
    const thumbnail =
        document.createElement(
            "img"
        );


    thumbnail.src =
        object.src;


    thumbnail.alt =
        object.name;


    thumbnail.className =
        "object-menu-thumbnail";


    /*
     * Filename.
     */
    const name =
        document.createElement(
            "span"
        );


    name.className =
        "object-menu-name";


    name.textContent =
        object.name;


    item.appendChild(
        thumbnail
    );


    item.appendChild(
        name
    );


    /*
     * Select object.
     */
    item.addEventListener(
        "click",
        () => {

            selectedObjectId =
                object.id;


            updateObjectSelectorButton(
                object
            );


            closeObjectSelector();


            /*
             * If an object is currently selected
             * in the pattern, changing the selector
             * should NOT alter that object.
             *
             * It only determines which image is
             * used when Add Object is clicked.
             */
            if (
                selectedFlower >= 0
            ) {

                /*
                 * Leave existing object unchanged.
                 */
            }
        }
    );


    return item;
}


// ============================================================
// UPDATE SELECTOR BUTTON
// ============================================================

function updateObjectSelectorButton(
    object
) {

    if (
        !objectSelectorButton
    ) {

        return;
    }


    objectSelectorButton.innerHTML = "";


    const thumbnail =
        document.createElement(
            "img"
        );


    thumbnail.src =
        object.src;


    thumbnail.alt =
        object.name;


    thumbnail.className =
        "object-selector-thumbnail";


    const name =
        document.createElement(
            "span"
        );


    name.className =
        "object-selector-name";


    name.textContent =
        object.name;


    const arrow =
        document.createElement(
            "span"
        );


    arrow.className =
        "object-selector-arrow";


    arrow.textContent =
        "▼";


    objectSelectorButton.appendChild(
        thumbnail
    );


    objectSelectorButton.appendChild(
        name
    );


    objectSelectorButton.appendChild(
        arrow
    );
}


// ============================================================
// OPEN / CLOSE OBJECT SELECTOR
// ============================================================

function openObjectSelector() {

    if (
        !objectSelectorMenu
    ) {

        return;
    }


    objectSelectorMenu.classList.add(
        "open"
    );


    objectSelector.classList.add(
        "open"
    );
}


function closeObjectSelector() {

    if (
        !objectSelectorMenu
    ) {

        return;
    }


    objectSelectorMenu.classList.remove(
        "open"
    );


    objectSelector.classList.remove(
        "open"
    );
}


function toggleObjectSelector() {

    if (
        objectSelectorMenu.classList.contains(
            "open"
        )
    ) {

        closeObjectSelector();

    } else {

        openObjectSelector();
    }
}


// ============================================================
// SELECTOR BUTTON CLICK
// ============================================================

if (
    objectSelectorButton
) {

    objectSelectorButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            toggleObjectSelector();
        }
    );
}


// ============================================================
// CLOSE SELECTOR WHEN CLICKING OUTSIDE
// ============================================================

document.addEventListener(
    "click",
    (event) => {

        if (
            objectSelector &&
            !objectSelector.contains(
                event.target
            )
        ) {

            closeObjectSelector();
        }
    }
);


// ============================================================
// CREATE OBJECT
// ============================================================

function createFlower(
    imageId
) {

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

        const imageId =
            selectedObjectId;


        if (
            !imageId
        ) {

            alert(
                "Please upload or select a PNG first."
            );

            return;
        }


        const imageObject =
            getLibraryObject(
                imageId
            );


        if (
            !imageObject
        ) {

            alert(
                "The selected PNG could not be found."
            );

            return;
        }


        /*
         * Add a NEW object.
         */
        flowers.push(
            createFlower(
                imageObject.id
            )
        );


        selectedFlower =
            flowers.length - 1;


        invalidateDiscretization();

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

            selectedFlower =
                -1;

        } else {

            selectedFlower =
                Math.min(
                    selectedFlower,
                    flowers.length - 1
                );
        }


        invalidateDiscretization();

        updateControls();

        updateDiscretizeButton();

        draw();
    }
);


// ============================================================
// GET LIBRARY OBJECT
// ============================================================

function getLibraryObject(
    id
) {

    return objectLibrary.find(
        object =>
            object.id === id
    );
}


// ============================================================
// GET IMAGE FOR OBJECT
// ============================================================

function getFlowerImage(
    flower
) {

    const object =
        getLibraryObject(
            flower.imageId
        );


    if (!object) {

        return null;
    }


    return object.image;
}


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


        invalidateDiscretization();

        updateValueDisplays();

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


        invalidateDiscretization();

        updateValueDisplays();

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


        invalidateDiscretization();

        updateValueDisplays();

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


        invalidateDiscretization();

        updateValueDisplays();

        draw();
    }
);


// ============================================================
// INVALIDATE DISCRETIZATION
// ============================================================

function invalidateDiscretization() {

    discretizedPattern =
        null;

    isDiscretized =
        false;


    updateDiscretizeButton();
}


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


    /*
     * Do NOT change selectedObjectId here.
     *
     * The selector represents the object that will
     * be added next, not necessarily the currently
     * selected object.
     */


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


    if (
        isDiscretized
    ) {

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


    if (
        isDiscretized &&
        discretizedPattern
    ) {

        drawDiscretizedPattern();

        return;
    }


    ctx.fillStyle =
        backgroundColor;


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


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

    const img =
        getFlowerImage(
            flower
        );


    if (!img) {

        return;
    }


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


    if (
        selected
    ) {

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
        patternWidth /
        nx;

    const cellHeight =
        patternHeight /
        ny;


    ctx.strokeStyle =
        "rgba(0,0,0,0.35)";

    ctx.lineWidth =
        1;

    ctx.beginPath();


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

            if (
                isDiscretized
            ) {

                isDiscretized =
                    false;


                updateDiscretizeButton();

                draw();

                return;
            }


            if (
                objectLibrary.length === 0 ||
                flowers.length === 0
            ) {

                alert(
                    "Please add at least one PNG object to the pattern."
                );

                return;
            }


            discretizedPattern =
                discretizePattern();


            isDiscretized =
                true;


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
        offscreen.getContext(
            "2d"
        );


    offCtx.fillStyle =
        "white";


    offCtx.fillRect(
        0,
        0,
        patternWidth,
        patternHeight
    );


    for (
        const flower of flowers
    ) {

        const img =
            getFlowerImage(
                flower
            );


        if (!img) {

            continue;
        }


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


    const imageData =
        offCtx.getImageData(
            0,
            0,
            patternWidth,
            patternHeight
        );


    const cellWidth =
        patternWidth /
        nx;

    const cellHeight =
        patternHeight /
        ny;


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


    const bg = {
        r: 255,
        g: 255,
        b: 255
    };


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


            let foregroundPixels =
                0;

            let totalPixels =
                0;


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


    return pattern;
}


// ============================================================
// DRAW DISCRETIZED PATTERN
// ============================================================

function drawDiscretizedPattern() {

    const cellWidth =
        patternWidth /
        nx;

    const cellHeight =
        patternHeight /
        ny;


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
     * GRIDLINES
     */
    ctx.strokeStyle =
        "#999999";

    ctx.lineWidth =
        1;

    ctx.beginPath();


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
     * NUMBERS
     */
    ctx.fillStyle =
        "black";

    ctx.font =
        "bold 12px Arial";

    ctx.textBaseline =
        "middle";


    /*
     * Row numbers.
     */
    for (
        let row = 0;
        row < ny;
        row++
    ) {

        const y =
            patternY +
            row * cellHeight +
            cellHeight / 2;


        ctx.textAlign =
            "right";


        ctx.fillText(
            String(row + 1),
            patternX - 7,
            y
        );


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


        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "bottom";


        ctx.fillText(
            String(col + 1),
            x,
            patternY - 7
        );


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
        patternWidth /
        nx;

    const cellHeight =
        patternHeight /
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


        while (
            col < nx
        ) {

            const value =
                discretizedPattern[row][col];


            let end =
                col + 1;


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


                if (
                    runLength === 1
                ) {

                    ctx.fillText(
                        String(runLength),
                        leftX,
                        y
                    );

                } else {

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
            }


            col =
                end;
        }
    }
}


// ============================================================
// CANVAS COORDINATES
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
            ) *
            scaleX,

        y:
            (
                event.clientY -
                rect.top
            ) *
            scaleY
    };
}


// ============================================================
// OBJECT HIT TEST
// ============================================================

function isPointInsideFlower(
    mouse,
    flower
) {

    const img =
        getFlowerImage(
            flower
        );


    if (!img) {

        return false;
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


    const angle =
        -degToRad(
            flower.rotation
        );


    const localX =
        dx * Math.cos(angle) -
        dy * Math.sin(angle);


    const localY =
        dx * Math.sin(angle) +
        dy * Math.cos(angle);


    const width =
        img.width *
        flower.scale;

    const height =
        img.height *
        flower.scale;


    return (

        localX >= -width / 2 &&
        localX <= width / 2 &&
        localY >= -height / 2 &&
        localY <= height / 2
    );
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


        if (
            isPointInsideFlower(
                mouse,
                flower
            )
        ) {

            dragging =
                true;


            dragOffsetX =
                mouse.x - fx;


            dragOffsetY =
                mouse.y - fy;
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


        invalidateDiscretization();

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

        dragging =
            false;
    }
);


canvas.addEventListener(
    "mouseleave",
    () => {

        dragging =
            false;
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


        /*
         * Iterate backwards so the object
         * on top gets selected first.
         */
        for (
            let i =
                flowers.length - 1;
            i >= 0;
            i--
        ) {

            const flower =
                flowers[i];


            const img =
                getFlowerImage(
                    flower
                );


            if (!img) {

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
                mouse.x -
                fx;


            const dy =
                mouse.y -
                fy;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const radius =
                Math.sqrt(

                    Math.pow(
                        img.width *
                        flower.scale /
                        2,
                        2
                    ) +

                    Math.pow(
                        img.height *
                        flower.scale /
                        2,
                        2
                    )
                );


            if (
                distance >
                radius
            ) {

                continue;
            }


            if (
                isPointInsideFlower(
                    mouse,
                    flower
                )
            ) {

                closest =
                    i;

                break;
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