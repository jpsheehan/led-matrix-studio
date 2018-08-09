
const M = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const textbox = document.getElementById("output");

class CanvasOptions {
    constructor(id, foreColor, backColor, width, height) {
        this.canvas = document.getElementById(id);
        this.foreColor = foreColor;
        this.backColor = backColor;
        this.width = width;
        this.height = height;
        this.context = this.canvas.getContext("2d");
    }
}

class CodeGenerator {
    generateCode(matrix) {
        let code = "char graphic[] = { ";
    
        for (let i = 0; i < M.length; i++) {
            code += "0x" + M[i].toString(16).toUpperCase().padLeft(2, 0);
            if (i !== M.length - 1) {
               code += ", ";
            }
        }
    
        code += " };";

        return code;
    }
}

class MatrixDesigner {

    constructor(canvasOptions, defaultMatrix) {
        this.matrix = defaultMatrix || [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.canvasOptions = canvasOptions;
        this.codeGen = new CodeGenerator();
        this.canvasOptions.addEventListener("click", this.handleCanvasClick);
    }

    handleCanvasClick(event) {

        const x = M.length - 1 - Math.floor(ev.offsetX / drawOptions.width * M.length);
        const y = Math.floor(ev.offsetY / drawOptions.height * M.length);
    
        M[y] = 0xFF & ~(M[y] ^ (0xFF ^ Math.pow(2, x)));

    }

    refresh() {
        this.drawMatrix();
        this.codeGen.generateCode(this.matrix);
    }

    drawMatrix() {
    
        this.canvasOptions.context.fillStyle = this.canvasOptions.backColor;
        this.canvasOptions.context.fillRect(0, 0, this.canvasOptions.width, this.canvasOptions.height);
    
        for (let i = 0; i < this.matrix.length; i++) {
    
            for (let j = 0; j < this.matrix.length; j++) {
    
                if ((this.matrix[i] & Math.pow(2, (this.matrix.length - 1) - j)) == 0) {
    
                    this.canvasOptions.context.fillStyle = this.canvasOptions.backColor;
    
                } else {
                    
                    this.canvasOptions.context.fillStyle = this.canvasOptions.foreColor;
                    
                }
    
                if (this.canvasOptions.context.fillStyle) {
                    this.canvasOptions.context.fillRect(
                        j * this.canvasOptions.width / this.matrix.length,
                        i * this.canvasOptions.height / this.matrix.length,
                        this.canvasOptions.width / this.matrix.length,
                        this.canvasOptions.height / this.matrix.length);
                }
    
            }
    
        }
    }

}

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

String.prototype.padLeft = function(width, character) {
    let newString = this;
    while (newString.length < width) {
        newString = character + newString;
    }
    return newString;
}

init();