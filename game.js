#!/usr/bin/env node
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const groundSymbols = ['-', '='];



function displayMenu() {
    console.clear();
    console.log("THE-DINO-CLI v0.0.4-alpha");
    console.log("======================================");
    console.log("\nGame instructions:");
    console.log("Spacebar - jump");
    console.log("Left arrowkey or 'A' - move left");
    console.log("Right arrowkey or 'D' - move right");
    console.log("\nChoose option:");
    console.log("1. Start Game");
    console.log("2. Quit");

    rl.question("Enter: ", (answer) => {
        switch (answer) {
            case '1':
                gameLoop();
                break;
            case '2':
                console.log("Thanks for playing!");
                rl.close();
                process.exit();
                break;
            default:
                console.log("Unknown option. Are you sure you're trying the correct one?");
                displayMenu();
        }
    });
}

let position = 0;
let score = 0;
let obstaclePosition = 120;
let dinosaurHeight = 0;
const dinosaurLength = 3;
const maxJumpHeight = 4;
let isJumpingUp = false;
let isJumpingDown = false;
const gameFieldHeight = 15;
const screenWidth = 100;
const minDistanceBetweenObstacles = 20;
let gameSpeed = 100;
let obstaclesPassed = 0;
let obstacleHeights = [1, 2];
let obstacleHeight = obstacleHeights[Math.floor(Math.random() * obstacleHeights.length)];
let isInNightmareModeTransition = false;
let isNightmareModeActive = false;

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

function draw() {
    console.clear();

    for (let i = 0; i < gameFieldHeight; i++) {
        let line = ' '.repeat(screenWidth);

        if (i >= gameFieldHeight - dinosaurHeight - dinosaurLength && i < gameFieldHeight - dinosaurHeight) {
            line = line.substr(0, position) + 'D' + line.substr(position + 1);
        }

    for (let h = 0; h < obstacleHeight; h++) {
        if (i === gameFieldHeight - obstacleHeight - 1 + h && obstaclePosition < screenWidth && obstaclePosition >= 0) {
        line = line.substr(0, obstaclePosition) + 'O' + line.substr(obstaclePosition + 1);
    }
}


    if (i === gameFieldHeight - 1 && obstaclePosition < screenWidth && obstaclePosition >= 0) {
        line = line.substr(0, obstaclePosition) + '|' + line.substr(obstaclePosition + 1);
    }



        console.log(line);
    }


    console.log(currentGroundPattern);


    console.log(`Score: ${score}`);
}


function jump() {
    isJumpingUp = true;

    let jumpInterval = setInterval(() => {
        if (dinosaurHeight < maxJumpHeight && isJumpingUp) {
            dinosaurHeight++;

            if (position === obstaclePosition) {
                obstaclePosition = -1;
            }

            draw();
        } else {
            clearInterval(jumpInterval);
            isJumpingUp = false;
            isJumpingDown = true;
            fall();
        }
    }, 50);
}

function fall() {
    let fallInterval = setInterval(() => {
        if (dinosaurHeight > 0 && isJumpingDown) {
            dinosaurHeight--;
            draw();
        } else {
            clearInterval(fallInterval);
            isJumpingDown = false;
        }
    }, 50);
}

let currentGroundPattern = Array(screenWidth).fill(0).map(() => groundSymbols[Math.floor(Math.random() * groundSymbols.length)]).join('');


async function gameLoop() {
    obstaclePosition--;
    score++;

    

    currentGroundPattern = currentGroundPattern.substring(1) + groundSymbols[Math.floor(Math.random() * groundSymbols.length)];

    if (obstaclePosition < 0) {
        obstaclesPassed++;
        generateObstacle();
    }

    if (obstaclesPassed === 5) {
        await showNightmareModeMessage();
        obstaclesPassed++;
    }

    if (obstaclePosition === position && dinosaurHeight < obstacleHeight) {
        console.log('GAME OVER');
        process.exit();
    }

    draw();

    setTimeout(gameLoop, gameSpeed);
}

function generateObstacle() {
    let randomDistance = Math.floor(Math.random() * 20) + minDistanceBetweenObstacles;
    obstaclePosition = screenWidth + randomDistance; 
    obstacleHeight = obstacleHeights[Math.floor(Math.random() * obstacleHeights.length)];


    if (isNightmareModeActive) {
        gameSpeed *= 0.95;
    } else {
        gameSpeed /= 1.5;
    }
}


function drawCenteredMessage(message) {
    console.clear();

    const middleLine = Math.floor(gameFieldHeight / 2);
    const paddingWidth = Math.floor((screenWidth - message.length) / 2);

    for (let i = 0; i < gameFieldHeight; i++) {
        if (i === middleLine) {
            console.log(' '.repeat(paddingWidth) + message);
        } else {
            console.log('');
        }
    }
}

function drawCenteredNightmareModeWithCountdown(countdown) {
    console.clear();

    const nightmareMessage = 'NIGHTMARE MODE';
    const paddingWidthForNightmare = Math.floor((screenWidth - nightmareMessage.length) / 2);
    const paddingWidthForCountdown = Math.floor((screenWidth - countdown.toString().length) / 2);

    const middleLineForNightmare = Math.floor(gameFieldHeight / 2) - 1;
    const middleLineForCountdown = Math.floor(gameFieldHeight / 2);

    for (let i = 0; i < gameFieldHeight; i++) {
        if (i === middleLineForNightmare) {
            console.log(' '.repeat(paddingWidthForNightmare) + nightmareMessage);
        } else if (i === middleLineForCountdown) {
            console.log(' '.repeat(paddingWidthForCountdown) + countdown);
        } else {
            console.log('');
        }
    }
}

async function showNightmareModeMessage() {
    isInNightmareModeTransition = true;

    for (let i = 5; i > 0; i--) {
        drawCenteredNightmareModeWithCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    isNightmareModeActive = true;
    isInNightmareModeTransition = false;
}

process.stdin.on('keypress', (str, key) => {
    if (isInNightmareModeTransition) return;

    if (key.name === 'q' || key.ctrl && key.name === 'c') {
        process.exit();
    }
    if (key.name === 'space' && !isJumpingUp && !isJumpingDown) {
        jump();
    }
    if ((key.name === 'left' || key.name === 'a') && position > 0) {
        position--;
        draw();
    }
    if ((key.name === 'right' || key.name === 'd') && position < screenWidth - 1) {
        position++;
        draw();
    }
});

displayMenu();
