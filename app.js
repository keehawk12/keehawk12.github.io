// ============================================================
// Crochet Pattern Generator
// JavaScript application
// ============================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const nx = 58;
const ny = 30;

const backgroundColor = "rgb(226, 233, 34)";
const foregroundColor = "black";

let flowers = [];
let selectedFlower = -1;

let showRunCounts = false;
let runDirection = "left";

let discretizedPattern = null;

// ------------------------------------------------------------
// Canvas dimensions
// ------------------------------------------------------------

const canvasWidth = 1200;
const canvasHeight = Math.round(canvasWidth * ny / nx);

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// ------------------------------------------------------------
// DOM elements
// ------------------------------------------------------------

const flowerSelect = document.getElementById("flowerSelect");
const addFlowerButton = document.getElementById("addFlower");
const deleteFlowerButton = document.getElementById("deleteFlower");

const xSlider = document.getElementById("xPosition");
const ySlider = document.getElementById("yPosition");
const rotationSlider = document.getElementById("rotation");
const scaleSlider = document.getElementById("scale");

const xValue = document.getElementById("xValue");
const yValue = document.getElementById("yValue");
const rotationValue = document.getElementById("rotationValue");
const scaleValue = document.getElementById("scaleValue");

const showRunCountsCheckbox = document.getElementById("showRunCounts");
const runDirectionSelect = document.getElementById("runDirection");

const discretizeButton = document.getElementById("discretizePattern");

// ------------------------------------------------------------
// Flower images
// ------------------------------------------------------------

const flowerImages = {};

const flowerSources = {
    flower: "flower.png"
};

for (const [name, src] of Object.entries(flowerSources)) {
    const img = new Image();

    img.onload = function () {
        flowerImages[name] = img;
        draw();
    };

    img.src = src;
}

// ------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// ------------------------------------------------------------
// Flower object
// ------------------------------------------------------------

function createFlower(type = "flower") {
    return {
        type: type,
        x: 0.5,
        y: 0.5,
        rotation: 0,
        scale: 1.0
    };
}

// ------------------------------------------------------------
// Add flower
// ------------------------------------------------------------

addFlowerButton.addEventListener("click", () => {

    const type = flowerSelect.value;

    flowers.push(createFlower(type));

    selectedFlower = flowers.length - 1;

    updateControls();

    draw();
});

// ------------------------------------------------------------
// Delete flower
// ------------------------------------------------------------

deleteFlowerButton.addEventListener("click", () => {

    if (selectedFlower < 0 || selectedFlower >= flowers.length) {
        return;
    }

    flowers.splice(selectedFlower, 1);

    if (flowers.length === 0) {
        selectedFlower = -1;
    } else {
        selectedFlower = Math.min(
            selectedFlower,
            flowers.length - 1
        );
    }

    updateControls();
    draw();
});

// ------------------------------------------------------------
// Flower selection
// ------------------------------------------------------------

flowerSelect.addEventListener("change", () => {

    if (selectedFlower >= 0) {
        flowers[selectedFlower].type = flowerSelect.value;
        draw();
    }
});

// ------------------------------------------------------------
// Slider handling
// ------------------------------------------------------------

xSlider.addEventListener("input", () => {

    if (selectedFlower < 0) return;

    flowers[selectedFlower].x =
        parseFloat(xSlider.value);

    updateValueDisplays();
    draw();
});

ySlider.addEventListener("input", () => {

    if (selectedFlower < 0) return;

    flowers[selectedFlower].y =
        parseFloat(ySlider.value);

    updateValueDisplays();
    draw();
});

rotationSlider.addEventListener("input", () => {

    if (selectedFlower < 0) return;

    flowers[selectedFlower].rotation =
        parseFloat(rotationSlider.value);

    updateValueDisplays();
    draw();
});

scaleSlider.addEventListener("input", () => {

    if (selectedFlower < 0) return;

    flowers[selectedFlower].scale =
        parseFloat(scaleSlider.value);

    updateValueDisplays();
    draw();
});

// ------------------------------------------------------------
// Run count controls
// ------------------------------------------------------------

showRunCountsCheckbox.addEventListener("change", () => {

    showRunCounts =
        showRunCountsCheckbox.checked;

    draw();
});

runDirectionSelect.addEventListener("change", () => {

    runDirection =
        runDirectionSelect.value;

    draw();
});

// ------------------------------------------------------------
// Update controls
// ------------------------------------------------------------

function updateControls() {

    if (selectedFlower < 0) {
        xSlider.disabled = true;
        ySlider.disabled = true;
        rotationSlider.disabled = true;
        scaleSlider.disabled = true;
        deleteFlowerButton.disabled = true;

        return;
    }

    xSlider.disabled = false;
    ySlider.disabled = false;
    rotationSlider.disabled = false;
    scaleSlider.disabled = false;
    deleteFlowerButton.disabled = false;

    const flower = flowers[selectedFlower];

    flowerSelect.value = flower.type;

    xSlider.value = flower.x;
    ySlider.value = flower.y;
    rotationSlider.value = flower.rotation;
    scaleSlider.value = flower.scale;

    updateValueDisplays();
}

// ------------------------------------------------------------
// Update numerical slider values
// ------------------------------------------------------------

function updateValueDisplays() {

    if (selectedFlower < 0) {
        return;
    }

    const flower = flowers[selectedFlower];

    xValue.textContent =
        Number(flower.x).toFixed(2);

    yValue.textContent =
        Number(flower.y).toFixed(2);

    rotationValue.textContent =
        Number(flower.rotation).toFixed(0) + "°";

    scaleValue.textContent =
        Number(flower.scale).toFixed(2);
}

// ------------------------------------------------------------
// Draw entire canvas
// ------------------------------------------------------------

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Background
    ctx.fillStyle = backgroundColor;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Draw flowers
    for (let i = 0; i < flowers.length; i++) {

        drawFlower(
            flowers[i],
            i === selectedFlower
        );
    }

    // Grid
    drawGrid();

    // Discretized pattern
    if (discretizedPattern !== null) {
        drawDiscretizedPattern();
    }
}

// ------------------------------------------------------------
// Draw flower
// ------------------------------------------------------------

function drawFlower(flower, selected) {

    const img = flowerImages[flower.type];

    if (!img || !img.complete) {
        return;
    }

    const x =
        flower.x * canvas.width;

    const y =
        flower.y * canvas.height;

    const baseSize =
        Math.min(img.width, img.height);

    const width =
        img.width * flower.scale;

    const height =
        img.height * flower.scale;

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(
        degToRad(flower.rotation)
    );

    ctx.globalAlpha = 0.9;

    ctx.drawImage(
        img,
        -width / 2,
        -height / 2,
        width,
        height
    );

    ctx.globalAlpha = 1;

    // Selection box
    if (selected) {

        ctx.strokeStyle = "red";
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

// ------------------------------------------------------------
// Draw grid
// ------------------------------------------------------------

function drawGrid() {

    const cellWidth =
        canvas.width / nx;

    const cellHeight =
        canvas.height / ny;

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let i = 0; i <= nx; i++) {

        const x = i * cellWidth;

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for (let j = 0; j <= ny; j++) {

        const y = j * cellHeight;

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();
}

// ============================================================
// DISCRETIZATION
// ============================================================

discretizeButton.addEventListener("click", () => {

    discretizedPattern =
        discretizePattern();

    draw();
});

// ------------------------------------------------------------
// Create discretized pattern
// ------------------------------------------------------------

function discretizePattern() {

    const offscreen =
        document.createElement("canvas");

    offscreen.width = canvas.width;
    offscreen.height = canvas.height;

    const offCtx =
        offscreen.getContext("2d");

    // Background
    offCtx.fillStyle = backgroundColor;

    offCtx.fillRect(
        0,
        0,
        offscreen.width,
        offscreen.height
    );

    // Render flowers
    for (const flower of flowers) {

        const img =
            flowerImages[flower.type];

        if (!img) {
            continue;
        }

        const x =
            flower.x * canvas.width;

        const y =
            flower.y * canvas.height;

        const width =
            img.width * flower.scale;

        const height =
            img.height * flower.scale;

        offCtx.save();

        offCtx.translate(x, y);

        offCtx.rotate(
            degToRad(flower.rotation)
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

    // Determine each grid cell
    for (let row = 0; row < ny; row++) {

        for (let col = 0; col < nx; col++) {

            const x0 =
                Math.floor(col * cellWidth);

            const x1 =
                Math.floor((col + 1) * cellWidth);

            const y0 =
                Math.floor(row * cellHeight);

            const y1 =
                Math.floor((row + 1) * cellHeight);

            let foregroundPixels = 0;
            let totalPixels = 0;

            for (let y = y0; y < y1; y++) {

                for (let x = x0; x < x1; x++) {

                    const idx =
                        (y * canvas.width + x) * 4;

                    const r =
                        imageData.data[idx];

                    const g =
                        imageData.data[idx + 1];

                    const b =
                        imageData.data[idx + 2];

                    /*
                     * Determine whether pixel is sufficiently
                     * different from the yellow background.
                     */

                    const distance =
                        Math.sqrt(
                            Math.pow(r - 226, 2) +
                            Math.pow(g - 233, 2) +
                            Math.pow(b - 34, 2)
                        );

                    if (distance > 50) {
                        foregroundPixels++;
                    }

                    totalPixels++;
                }
            }

            const coverage =
                foregroundPixels / totalPixels;

            pattern[row][col] =
                coverage > 0.5 ? 1 : 0;
        }
    }

    /*
     * MATLAB used flipud(alpha), so flip the vertical
     * direction here to maintain the same orientation.
     */

    pattern.reverse();

    return pattern;
}

// ============================================================
// DRAW DISCRETIZED PATTERN
// ============================================================

function drawDiscretizedPattern() {

    if (!discretizedPattern) {
        return;
    }

    const cellWidth =
        canvas.width / nx;

    const cellHeight =
        canvas.height / ny;

    /*
     * Draw black cells.
     */

    for (let row = 0; row < ny; row++) {

        for (let col = 0; col < nx; col++) {

            if (discretizedPattern[row][col] === 1) {

                ctx.fillStyle = foregroundColor;

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
     * Draw grid over the black cells.
     */

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let i = 0; i <= nx; i++) {

        const x =
            i * cellWidth;

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for (let j = 0; j <= ny; j++) {

        const y =
            j * cellHeight;

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();

    /*
     * Row numbers on left.
     */

    ctx.fillStyle = "black";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let row = 0; row < ny; row++) {

        const y =
            row * cellHeight +
            cellHeight / 2;

        ctx.fillText(
            String(row + 1),
            -5 + cellWidth * 0.02,
            y
        );
    }

    /*
     * Column numbers along bottom.
     */

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let col = 0; col < nx; col++) {

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

    ctx.fillStyle = "red";
    ctx.font = "bold 12px Arial";
    ctx.textBaseline = "middle";

    /*
     * Count runs in each row.
     */

    for (let row = 0; row < ny; row++) {

        let col = 0;

        while (col < nx) {

            const value =
                discretizedPattern[row][col];

            let end = col + 1;

            while (
                end < nx &&
                discretizedPattern[row][end] === value
            ) {
                end++;
            }

            const runLength =
                end - col;

            /*
             * Only draw if there is a run.
             */

            let displayCol;

            const alternating =
                runDirection === "alternating";

            if (runDirection === "left") {

                displayCol = col;

            } else if (runDirection === "right") {

                displayCol = end - 1;

            } else if (
                runDirection === "alternating-left"
            ) {

                /*
                 * First run on left, second on right, etc.
                 */

                const runNumber =
                    countRunsBefore(
                        discretizedPattern[row],
                        col
                    );

                if (runNumber % 2 === 0) {
                    displayCol = col;
                } else {
                    displayCol = end - 1;
                }

            } else if (
                runDirection === "alternating-right"
            ) {

                const runNumber =
                    countRunsBefore(
                        discretizedPattern[row],
                        col
                    );

                if (runNumber % 2 === 0) {
                    displayCol = end - 1;
                } else {
                    displayCol = col;
                }

            } else {

                displayCol = col;
            }

            const x =
                displayCol * cellWidth +
                cellWidth / 2;

            const y =
                row * cellHeight +
                cellHeight / 2;

            /*
             * Put the number inside the cell.
             */

            ctx.textAlign = "center";

            ctx.fillText(
                String(runLength),
                x,
                y
            );

            col = end;
        }
    }
}

// ------------------------------------------------------------
// Determine run number
// ------------------------------------------------------------

function countRunsBefore(row, col) {

    let count = 0;

    let i = 0;

    while (i < col) {

        const value = row[i];

        let j = i + 1;

        while (
            j < col &&
            row[j] === value
        ) {
            j++;
        }

        count++;

        i = j;
    }

    return count;
}

// ============================================================
// Mouse interaction
// ============================================================

let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

canvas.addEventListener("mousedown", (event) => {

    if (selectedFlower < 0) {
        return;
    }

    const rect =
        canvas.getBoundingClientRect();

    const mouseX =
        event.clientX - rect.left;

    const mouseY =
        event.clientY - rect.top;

    const flower =
        flowers[selectedFlower];

    const fx =
        flower.x * canvas.width;

    const fy =
        flower.y * canvas.height;

    const dx = mouseX - fx;
    const dy = mouseY - fy;

    /*
     * Give a generous hit box.
     */

    const hitRadius =
        100 * flower.scale;

    if (
        Math.sqrt(dx * dx + dy * dy) <
        hitRadius
    ) {

        dragging = true;

        dragOffsetX =
            mouseX - fx;

        dragOffsetY =
            mouseY - fy;
    }
});

canvas.addEventListener("mousemove", (event) => {

    if (!dragging || selectedFlower < 0) {
        return;
    }

    const rect =
        canvas.getBoundingClientRect();

    const mouseX =
        event.clientX - rect.left;

    const mouseY =
        event.clientY - rect.top;

    const flower =
        flowers[selectedFlower];

    flower.x =
        clamp(
            (mouseX - dragOffsetX) /
            canvas.width,
            0,
            1
        );

    flower.y =
        clamp(
            (mouseY - dragOffsetY) /
            canvas.height,
            0,
            1
        );

    updateControls();
    draw();
});

canvas.addEventListener("mouseup", () => {
    dragging = false;
});

canvas.addEventListener("mouseleave", () => {
    dragging = false;
});

// ------------------------------------------------------------
// Select flower by clicking
// ------------------------------------------------------------

canvas.addEventListener("click", (event) => {

    if (dragging) {
        return;
    }

    const rect =
        canvas.getBoundingClientRect();

    const mouseX =
        event.clientX - rect.left;

    const mouseY =
        event.clientY - rect.top;

    let closest = -1;
    let closestDistance = Infinity;

    for (let i = 0; i < flowers.length; i++) {

        const flower = flowers[i];

        const fx =
            flower.x * canvas.width;

        const fy =
            flower.y * canvas.height;

        const dx =
            mouseX - fx;

        const dy =
            mouseY - fy;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        const hitRadius =
            100 * flower.scale;

        if (
            distance < hitRadius &&
            distance < closestDistance
        ) {

            closest = i;
            closestDistance = distance;
        }
    }

    if (closest >= 0) {

        selectedFlower = closest;

        updateControls();
        draw();
    }
});

// ============================================================
// Keyboard shortcuts
// ============================================================

document.addEventListener("keydown", (event) => {

    /*
     * Delete selected flower.
     */

    if (
        event.key === "Delete" ||
        event.key === "Backspace"
    ) {

        if (selectedFlower >= 0) {

            deleteFlowerButton.click();

            event.preventDefault();
        }
    }

    /*
     * Escape deselects.
     */

    if (event.key === "Escape") {

        selectedFlower = -1;

        updateControls();
        draw();
    }
});

// ============================================================
// Initialize
// ============================================================

updateControls();
draw();