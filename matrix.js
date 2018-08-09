
const M = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const textbox = document.getElementById("output");

const drawOptions = {
    context: ctx,
    foreColor: "#FF0000",
    backColor: "#000000",
    width: 400,
    height: 400
};

function init() {

    canvas.addEventListener("click", handleCanvasMouseEvent, false);

    drawMatrix(M, drawOptions);
    generateCCode();

}

function handleCanvasMouseEvent(ev) {

    const x = M.length - 1 - Math.floor(ev.offsetX / drawOptions.width * M.length);
    const y = Math.floor(ev.offsetY / drawOptions.height * M.length);

    M[y] = 0xFF & ~(M[y] ^ (0xFF ^ Math.pow(2, x)));

    drawMatrix(M, drawOptions);
    generateCCode();

}

function generateCCode() {

    textbox.innerHTML = "char graphic[] = { ";
    
    for (let i = 0; i < M.length; i++) {
        textbox.innerHTML += "0x" + M[i].toString(16).toUpperCase().padLeft(2, 0);
        if (i !== M.length - 1) {
            textbox.innerHTML += ", ";
        }
    }

    textbox.innerHTML += " };";

}

String.prototype.padLeft = function(width, character) {
    let newString = this;
    while (newString.length < width) {
        newString = character + newString;
    }
    return newString;
}

function drawMatrix(matrix, options) {

    let ctx = options.context || null;
    let foreColor = options.foreColor || null;
    let backColor = options.backColor || null;
    let width = options.width || matrix.length * 10;
    let height = options.height || matrix.length * 10;

    ctx.fillStyle = backColor;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < matrix.length; i++) {

        for (let j = 0; j < matrix.length; j++) {

            if ((matrix[i] & Math.pow(2, (matrix.length - 1) - j)) == 0) {

                ctx.fillStyle = backColor;

            } else {
                
                ctx.fillStyle = foreColor;
                
            }

            if (ctx.fillStyle) {
                ctx.fillRect(j * width / matrix.length, i * height / matrix.length,
                    width / matrix.length, height / matrix.length);
            }

        }

    }

}

init();