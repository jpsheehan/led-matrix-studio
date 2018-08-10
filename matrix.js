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
    
        for (let i = 0; i < matrix.length; i++) {
            code += "0x" + matrix[i].toString(16).toUpperCase().padLeft(2, 0);
            if (i !== matrix.length - 1) {
               code += ", ";
            }
        }
    
        code += " };";

        return code;
    }
}

class MatrixDesigner {

    constructor(canvasOptions, textbox, defaultMatrix) {
        this.matrix = defaultMatrix || [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.canvasOptions = canvasOptions;
        this.codeGen = new CodeGenerator();
        this.textbox = textbox;
        this.canvasOptions.canvas.addEventListener("click", (event) => {
            this.handleCanvasClick(event);
        });

        this.refresh();
    }

    handleCanvasClick(event) {

        const x = this.matrix.length - 1 - Math.floor(event.offsetX / this.canvasOptions.width * this.matrix.length);
        const y = Math.floor(event.offsetY / this.canvasOptions.height * this.matrix.length);
    
        this.matrix[y] = 0xFF & ~(this.matrix[y] ^ (0xFF ^ Math.pow(2, x)));

        this.refresh();

    }

    refresh() {
        this.drawMatrix();
        this.textbox.innerText = this.codeGen.generateCode(this.matrix);
    }

    drawMatrix() {
    
        this.canvasOptions.context.fillStyle = "#000000"; //this.canvasOptions.backColor;
        this.canvasOptions.context.fillRect(0, 0, this.canvasOptions.width, this.canvasOptions.height);
    
        for (let i = 0; i < this.matrix.length; i++) {
    
            for (let j = 0; j < this.matrix.length; j++) {
    
                if ((this.matrix[i] & Math.pow(2, (this.matrix.length - 1) - j)) == 0) {
    
                    this.canvasOptions.context.fillStyle = this.canvasOptions.backColor;
    
                } else {
                    
                    this.canvasOptions.context.fillStyle = this.canvasOptions.foreColor;
                    
                }
    
                if (this.canvasOptions.context.fillStyle) {

                    this.canvasOptions.context.beginPath();
                    this.canvasOptions.context.arc(
                        (j + 0.5) * this.canvasOptions.width / this.matrix.length,
                        (i + 0.5) * this.canvasOptions.height / this.matrix.length,
                        this.canvasOptions.width / this.matrix.length / 2 * 0.70,
                        0, 2 * Math.PI, true);
                    this.canvasOptions.context.closePath();
                    this.canvasOptions.context.fill();
                    
                }
    
            }
    
        }
    }

}

function init() {

    new MatrixDesigner(new CanvasOptions("canvas", "#FF0000", "#eaeaea", 400, 400), document.getElementById("output"));

}

String.prototype.padLeft = function(width, character) {
    let newString = this;
    while (newString.length < width) {
        newString = character + newString;
    }
    return newString;
}

init();