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
    generateCode(matrices) {
        let code = `unsigned char graphic[${matrices.length}][${matrices[0].length}] = { `;
        
        for (let i = 0; i < matrices.length; i++) {
            code += "\n\t{ ";
            for (let j = 0; j < matrices[i].length; j++) {
                code += "0x" + matrices[i][j].toString(16).toUpperCase().padLeft(2, 0);
                if (j !== matrices[i].length - 1) {
                    code += ", ";
                }
            }
            code += " }";
            if (i !== matrices.length - 1) {
                code += ",";
            } else {
                code += "\n";
            }
        }
        code += "};";

        return code;
    }
}

class MatrixDesigner {

    constructor(canvasOptions, textbox, framePreviousButton, frameNextButton, frameNewButton, frameDisplay, animationFPS, animationPlayPauseButton, frameFirstButton, frameLastButton) {
        this.matrices = [[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]];
        this.canvasOptions = canvasOptions;
        this.codeGen = new CodeGenerator();
        this.textbox = textbox;
        this.canvasOptions.canvas.addEventListener("click", (event) => {
            this.handleCanvasClick(event);
        });

        this.buttons = {
            frameFirst: frameFirstButton,
            frameLast: frameLastButton,
            framePrevious: framePreviousButton,
            frameNext: frameNextButton,
            frameNew: frameNewButton,
            frameDisplay: frameDisplay,
            animationFPS: animationFPS,
            animationPlayPause: animationPlayPauseButton
        };

        this.buttons.frameFirst.addEventListener("click", () => {
            this.currentFrame = 0;
            this.refresh();
            this.refreshButtons();
        });

        this.buttons.framePrevious.addEventListener("click", () => {
            if (this.currentFrame > 0) {
                this.currentFrame -= 1;
                this.refreshButtons();
                this.refresh();
            }
        });

        this.buttons.frameNext.addEventListener("click", () => {
            if (this.currentFrame < this.matrices.length - 1) {
                this.currentFrame += 1;
                this.refreshButtons();
                this.refresh();
            }
        });
        
        this.buttons.frameLast.addEventListener("click", () => {
            this.currentFrame = this.matrices.length - 1;
            this.refresh();
            this.refreshButtons();
        });

        this.buttons.frameNew.addEventListener("click", () => {
            this.matrices.push([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            this.currentFrame = this.matrices.length - 1;
            this.refreshButtons();
            this.refresh();
        });

        this.buttons.animationPlayPause.addEventListener("click", () => {
            if (this.animationState == "paused") {
                this.animationState = "playing";
                this.buttons.animationPlayPause.innerText = "Pause";
                
                this.currentFrame = 0;
                this.refresh();
                this.refreshButtons();

                this.timer = setInterval(() => {
                    if (this.currentFrame == this.matrices.length - 1) {
                        this.currentFrame = 0; // loop the animation
                    } else {
                        this.currentFrame += 1;
                    }
                    this.refresh();
                    this.refreshButtons();
                }, 1000 / this.buttons.animationFPS.value);
            } else {
                this.animationState = "paused";
                this.buttons.animationPlayPause.innerText = "Play";
                this.refreshButtons();
                clearInterval(this.timer);
                this.timer = null;
            }
        });

        this.animationState = "paused";
        this.timer = null;

        this.currentFrame = 0;
        this.refresh();
        this.refreshButtons();
    }

    handleCanvasClick(event) {
        
        // extract the x and y coordinates in terms of indices of the matrix
        const x = this.matrices[this.currentFrame].length - 1 - Math.floor(event.offsetX / this.canvasOptions.width * this.matrices[this.currentFrame].length);
        const y = Math.floor(event.offsetY / this.canvasOptions.height * this.matrices[this.currentFrame].length);
        
        // toggle the value of the matrix
        this.matrices[this.currentFrame][y] = 0xFF & ~(this.matrices[this.currentFrame][y] ^ (0xFF ^ Math.pow(2, x)));

        this.refresh(x, y);

    }

    refresh(x, y) {
        if (x !== null && typeof(x) != "undefined" && y !== null && typeof(y) != "undefined") {
            this.drawSingleCircle(x, y);
        } else {
            this.drawMatrix();
        }
        this.textbox.innerText = this.codeGen.generateCode(this.matrices);
    }

    refreshButtons() {
        this.buttons.framePrevious.disabled = (this.currentFrame == 0 || this.animationState == "playing");
        this.buttons.frameFirst.disabled = (this.currentFrame == 0 || this.animationState == "playing");
        this.buttons.frameNext.disabled = (this.currentFrame == this.matrices.length - 1 || this.animationState == "playing");
        this.buttons.frameLast.disabled = (this.currentFrame == this.matrices.length - 1 || this.animationState == "playing");
        this.buttons.frameDisplay.innerText = `Frame #${this.currentFrame + 1}`;
        this.buttons.animationFPS.disabled = (this.animationState == "playing");
        this.buttons.frameNew.disabled = (this.animationState == "playing");
    }

    drawMatrix() {
        for (let i = 0; i < this.matrices[this.currentFrame].length; i++) {
            for (let j = 0; j < this.matrices[this.currentFrame].length; j++) {
                this.drawSingleCircle(j, i);
            }
        }
    }

    drawSingleCircle(x, y) {
        x = 7 - x;
        
        // fill the target area in black to prevent artifacts from appearing
        this.canvasOptions.context.fillStyle = "#000000";
        this.canvasOptions.context.fillRect(
            x * this.canvasOptions.width / this.matrices[this.currentFrame].length,
            y * this.canvasOptions.height / this.matrices[this.currentFrame].length,
            this.canvasOptions.width / this.matrices[this.currentFrame].length,
            this.canvasOptions.height / this.matrices[this.currentFrame].length);

        // set the color of the circle to draw
        this.canvasOptions.context.fillStyle = ((this.matrices[this.currentFrame][y] & Math.pow(2, (this.matrices[this.currentFrame].length - 1) - x)) == 0)
            ? this.canvasOptions.backColor
            : this.canvasOptions.foreColor;

        // draw the circle
        this.canvasOptions.context.beginPath();
        this.canvasOptions.context.arc(
            (x + 0.5) * this.canvasOptions.width / this.matrices[this.currentFrame].length,
            (y + 0.5) * this.canvasOptions.height / this.matrices[this.currentFrame].length,
            this.canvasOptions.width / this.matrices[this.currentFrame].length / 2 * 0.70,
            0, 2 * Math.PI, true);
        this.canvasOptions.context.closePath();
        this.canvasOptions.context.fill();

    }

}

function init() {

    new MatrixDesigner(
        new CanvasOptions("canvas", "#FF0000", "#555555", 400, 400),
        document.getElementById("output"),
        document.getElementById("frame-previous"),
        document.getElementById("frame-next"),
        document.getElementById("frame-new"),
        document.getElementById("frame-display"),
        document.getElementById("anim-fps"),
        document.getElementById("anim-play-pause"),
        document.getElementById("frame-first"),
        document.getElementById("frame-last")
    );

}

String.prototype.padLeft = function(width, character) {
    let newString = this;
    while (newString.length < width) {
        newString = character + newString;
    }
    return newString;
}

init();