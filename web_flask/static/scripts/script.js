// 1.
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 2.
const img = new Image();
const reader = new FileReader();

const greyscaleSlider = document.getElementById("greyscale");
const greyscaleLabel = document.getElementById("greyscaleLabel");
greyscaleSlider.addEventListener("input", slide);
let greyscaleValue = 0; // Initialize with 0% greyscale

class Cell {
    constructor(x, y, charr, color) {
        this.x = x;
        this.y = y;
        this.charr = charr;
        this.color = color;
    }
    
    draw(ctx) {
        //ctx.fillStyle = "white";
        //ctx.fillText(this.charr, this.x + 0.5, this.y + 0.5);
        ctx.fillStyle = this.color;
        ctx.fillText(this.charr, this.x, this.y);
    }
}

class AsciiEngine {
    #imageCells = [];
    #pixels = [];
    #ctx;
    #width;
    #height;
    constructor(ctx, width, height){
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height;
        this.#ctx.drawImage(img, 0, 0, this.#width, this.#height);
       // applyGreyscale();
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    }
    
    #convertPixel(avg){
        function mapa(n, start1, stop1, start2, stop2, withinBounds) {
    if (typeof withinBounds === 'undefined') {
        withinBounds = true;
    }

    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;

    if (!withinBounds) {
        return newval;
    }

    if (start2 < stop2) {
        return constrain(newval, start2, stop2);
    } else {
        return constrain(newval, stop2, start2);
    }
}

function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
}

        const chars = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
        const len = chars.length;
        let charr = Math.floor(mapa(avg, 0, 225, 0, len));
        if (!(chars[charr - 1])) {
            charr = 2;
           console.log("yes", charr, len)
        }
        console.log(chars[charr - 1])
        return chars[charr - 1];
    }
    
    #parseImg(cellSize) {
        this.#imageCells = [];
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
            for (let x = 0; x < this.#pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this.#pixels.width) + posX;
                
                // Check Pixel Opacity
                if (this.#pixels.data[pos + 3] > 128) {
                    const red = this.#pixels.data[pos];
                    const green = this.#pixels.data[pos + 1];
                    const blue = this.#pixels.data[pos + 2];
                    const sum = red + green + blue;
                    const avg = sum/3;
                    const color = `rgb(${red}, ${green}, ${blue})`
                    const charr = this.#convertPixel(avg);
                   this.#imageCells.push(new Cell(x, y, charr, color));
                    
                }
            }
        }
    }
    #drawAscii() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        for (let i = 0; i < this.#imageCells.length; i++) {
            this.#imageCells[i].draw(this.#ctx);
        }
    }
    
    draw(cellSize) {
        this.#parseImg(cellSize);
        this.#drawAscii();
    }
}

let engine;


function slide() {
    if (greyscaleSlider.value == 0) {
        greyscaleLabel.innerHTML = "Original Image";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    else {
        greyscaleLabel.innerHTML = `Resolution ${greyscaleSlider.value * 5}%`
        ctx.font = parseInt(greyscaleSlider.value) * `1.2px Verdana`;
        engine.draw(20 - parseInt(greyscaleSlider.value));
    }
}


// 3.

const uploadImage = (e) => {
    reader.onload = () => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            engine = new AsciiEngine(ctx, img.width, img.height)
            slide();
            //engine.draw(parseInt(greyscaleSlider.value));      
            //ctx.drawImage(img, 0, 0);
            //applyGreyscale();
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

// 4.
const imageLoader = document.getElementById("imageInput");
imageLoader.addEventListener("change", uploadImage);







/*

// 5.
const greyscaleSlider = document.getElementById("greyscale");
const greyscaleLabel = document.getElementById("greyscaleLabel");

greyscaleSlider.addEventListener("input", () => {
    greyscaleValue = greyscaleSlider.value;
    greyscaleLabel.textContent = `greyscale ${greyscaleValue}%`;
    applyGreyscale();
    //engine.draw(10);    
});




// 6.
function applyGreyscale() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] * (100 - greyscaleValue) + data[i + 1] * (100 - greyscaleValue) + data[i + 2] * (100 - greyscaleValue)) / 300;
        data[i] = avg + (data[i] * greyscaleValue) / 100; // Red channel
        data[i + 1] = avg + (data[i + 1] * greyscaleValue) / 100; // Green channel
        data[i + 2] = avg + (data[i + 2] * greyscaleValue) / 100; // Blue channel
    }
    ctx.putImageData(imageData, 0, 0);
}

*/
