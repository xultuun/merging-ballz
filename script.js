const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const balls = [];
const gravity = 0.3;
const floorY = canvas.height - 150; // Tinggi garis pembatas

let pickedBall = null;

const sizeProbabilities = [0.9, 0.03333333333, 0.03333333333, 0.03333333333];
const sizeColors = new Map();
const sizeNumbers = new Map();

// Background
document.body.style.backgroundColor = '#76BDF7';
const backgroundImage = new Image();
backgroundImage.src = 'background.png';
backgroundImage.style.position = 'fixed';
backgroundImage.style.top = '0';
backgroundImage.style.left = '0';
backgroundImage.style.width = '100vw';
backgroundImage.style.height = '100vh'; 
backgroundImage.style.zIndex = '-1'; 
backgroundImage.style.opacity = '0.5';

document.body.appendChild(backgroundImage);

// Audio
const mergeSound = new Audio('merge.mp3');
const fallSound = new Audio('fall.mp3');
const backgroundMusic = new Audio('background.mp3');
const clickSound = new Audio('click.mp3');

backgroundMusic.loop = true;

document.body.addEventListener('click', () => {
    backgroundMusic.play();
    // ...
});

function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play();
}

// Event listener (bola diklik)
canvas.addEventListener('click', function(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    for (const ball of balls) {
        const distance = Math.sqrt((mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2);

        if (distance < ball.size) {
            playClickSound();
            break;
        }
    }
});

function getRandomSize() {
    const rand = Math.random();
    let cumulativeProb = 0;

    for (let i = 0; i < sizeProbabilities.length; i++) {
        cumulativeProb += sizeProbabilities[i];
        if (rand <= cumulativeProb) {
            return (i + 1) * 10;
        }
    }
}

function getRandomColor() {
    return `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
}

// Tombol "mek"
const mekButton = document.createElement('button');
mekButton.innerHTML = 'mek';
document.body.appendChild(mekButton);

mekButton.style.position = 'absolute';
mekButton.style.top = '10px';
mekButton.style.right = '10px';
mekButton.style.borderRadius = '10px';
mekButton.style.padding = '10px';
mekButton.style.cursor = 'pointer';
mekButton.style.background = '#76BDF7';
mekButton.style.display = 'none';

mekButton.addEventListener('mouseover', () => {
    mekButton.style.background = '#66B0EC';
});

mekButton.addEventListener('mouseout', () => {
    mekButton.style.background = '#76BDF7';
});

mekButton.style.cursor = 'pointer';

function mergeBalls() {
    const mergedSizes = new Set();

    for (let i = 0; i < balls.length; i++) {
        if (!mergedSizes.has(balls[i].size)) {
            for (let j = i + 1; j < balls.length; j++) {
                if (balls[i].size === balls[j].size) {
                    balls[i].size += 5;
                    balls[i].color = sizeColors.has(balls[i].size) ? sizeColors.get(balls[i].size) : getRandomColor();
                    sizeColors.set(balls[i].size, balls[i].color);
                    balls[i].number += 1;
                    sizeNumbers.set(balls[i].size, balls[i].number);

                    mergeSound.currentTime = 0;
                    mergeSound.play();

                    balls.splice(j, 1);
                    j--;
                }
            }

            mergedSizes.add(balls[i].size);
        }
    }
}

function toggleMekButtonVisibility() {
    const userInput = document.getElementById('contentEditableDiv').innerText;
    const showButton = userInput && userInput.toLowerCase().includes('mekgaming');

    mekButton.style.display = showButton ? 'block' : 'none';

    // contentEditableDiv setelah mengetik "MEKGAMING"
    if (showButton) {
        contentEditableDiv.style.display = 'none';
    }
}

const contentEditableDiv = document.createElement('div');
contentEditableDiv.id = 'contentEditableDiv';
document.body.appendChild(contentEditableDiv);

contentEditableDiv.style.position = 'absolute';
contentEditableDiv.style.top = '10px';
contentEditableDiv.style.left = '10px';
contentEditableDiv.style.borderRadius = '10px';
contentEditableDiv.style.padding = '10px';
contentEditableDiv.style.cursor = 'text';
contentEditableDiv.style.background = '#76BDF7';
contentEditableDiv.setAttribute('contenteditable', 'true');
contentEditableDiv.innerText = '';

toggleMekButtonVisibility();

// Event listener "mek" hilang
contentEditableDiv.addEventListener('input', toggleMekButtonVisibility);

mekButton.addEventListener('click', mergeBalls);

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.size = getRandomSize();
    this.color = sizeColors.has(this.size) ? sizeColors.get(this.size) : getRandomColor();
    this.number = sizeNumbers.has(this.size) ? sizeNumbers.get(this.size) + 1 : 1;
    sizeColors.set(this.size, this.color);
    sizeNumbers.set(this.size, this.number);
    this.isPickedUp = false;
    this.isFalling = false;
}

Ball.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Angka di tengah bola
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.number.toString(), this.x, this.y);
};

Ball.prototype.checkCollision = function () {
    for (const otherBall of balls) {
        if (otherBall !== this && this.size !== otherBall.size) {
            const dx = otherBall.x - this.x;
            const dy = otherBall.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size + otherBall.size) {
                const angle = Math.atan2(dy, dx);
                const overlap = (this.size + otherBall.size) - distance;
                const moveX = overlap * Math.cos(angle);
                const moveY = overlap * Math.sin(angle);

                this.x -= moveX / 2;
                this.y -= moveY / 2;
                otherBall.x += moveX / 2;
                otherBall.y += moveY / 2;
            }
        }
    }
};

Ball.prototype.update = function () {
    if (!this.isPickedUp) {
        this.y += gravity;

        if (this.y + this.size > floorY) {
            this.y = floorY - this.size;

            // Efek suara saat bola jatuh ke lantai
            if (!this.isFalling) {
                fallSound.currentTime = 0;
                fallSound.play();
                this.isFalling = true;
            }
        } else {
            this.isFalling = false;
        }

        this.checkCollision();
    } else if (this === pickedBall) {
        this.x = mouseX;
        this.y = mouseY;
    }
};

function update() {
    for (const ball of balls) {
        ball.update();
    }

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const dx = balls[j].x - balls[i].x;
            const dy = balls[j].y - balls[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < balls[i].size && balls[i].size === balls[j].size) {
                balls[i].size += 5;
                balls[i].color = sizeColors.has(balls[i].size) ? sizeColors.get(balls[i].size) : getRandomColor();
                sizeColors.set(balls[i].size, balls[i].color);
                balls[i].number += 1;
                sizeNumbers.set(balls[i].size, balls[i].number);

                // Efek suara saat bola bergabung
                mergeSound.currentTime = 0;
                mergeSound.play();

                balls.splice(j, 1);
                j--;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();

    for (const ball of balls) {
        ball.draw();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
    const clickX = e.clientX;
    const clickY = e.clientY;

    for (const ball of balls) {
        const dx = clickX - ball.x;
        const dy = clickY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.size) {
            ball.isPickedUp = !ball.isPickedUp;
            pickedBall = ball.isPickedUp ? ball : null;
            break;
        }
    }
});

function spawnBall() {
    const spawnX = canvas.width / 2 + Math.random() * 200 - 100;
    const spawnY = canvas.height / 4;
    balls.push(new Ball(spawnX, spawnY));
}

setInterval(spawnBall, 950);

let mouseX, mouseY;

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

gameLoop();