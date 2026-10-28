const SIZE = 20;
const TICK_MS = 150;

const boardElement = document.getElementById("game-board");
const statusElement = document.getElementById("game-status");
const restartButton = document.getElementById("restart-button");

let snake = [];
let direction = { x: 1, y: 0 };
let hasStarted = false;
let gameOver = false;
let lastTick = 0;
let cells = [];
let moveQueue = [];
const MAX_QUEUE = 2;
const scoreElement = document.getElementById("score");

let apple = null;
let score = 0;

function createBoard() {
    boardElement.innerHTML = "";
    boardElement.classList.add("snake-board");
    cells = [];

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const cell = document.createElement("div");
            cell.classList.add("snake-cell");
            boardElement.appendChild(cell);
            cells.push(cell);
        }
    }
}

function spawnApple() {
    const emptyCells = [];

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const occupied = snake.some(
                segment => segment.x === x && segment.y === y
            );

            if (!occupied) {
                emptyCells.push({ x, y });
            }
        }
    }

    if (emptyCells.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[index];
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    hasStarted = false;
    gameOver = false;
    lastTick = 0;
    directionChanged = false;
    moveQueue = [];    
    score = 0;
	apple = null;

	scoreElement.textContent = "Score: 0";
	apple = spawnApple();

    statusElement.textContent = "Press an arrow key to start";
    render();
}

function render() {
    // Clear the previous appearance.
    for (const cell of cells) {
        cell.style.background = "";
    }
    
    // Draw the apple.
	if (apple) {
		const cell = cells[apple.y * SIZE + apple.x];
		cell.style.background = "#e74c3c";
	}

    // Draw the snake.
    snake.forEach((segment, index) => {
        const cell = cells[segment.y * SIZE + segment.x];

        if (cell) {
            cell.style.background =
                index === 0 ? "#8bd450" : "#438b35";
        }
    });
}

function changeDirection(newDirection) {
    if (gameOver || moveQueue.length >= MAX_QUEUE) return;

    // Compare against the last queued direction,
    // or the current direction if the queue is empty.
    const lastDirection = moveQueue.length > 0
        ? moveQueue[moveQueue.length - 1]
        : direction;

    // Prevent 180-degree reversals.
    if (
        newDirection.x === -lastDirection.x &&
        newDirection.y === -lastDirection.y
    ) {
        return;
    }

    // Ignore duplicate direction inputs.
    if (
        newDirection.x === lastDirection.x &&
        newDirection.y === lastDirection.y
    ) {
        return;
    }

    moveQueue.push(newDirection);

    if (!hasStarted) {
        hasStarted = true;
        statusElement.textContent = "Playing";
    }
}


function update() {
    if (!hasStarted || gameOver) return;

    if (moveQueue.length > 0) {
        direction = moveQueue.shift();
    }

    const head = snake[0];

    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };

    // Wall collision.
    if (
        newHead.x < 0 || newHead.x >= SIZE ||
        newHead.y < 0 || newHead.y >= SIZE
    ) {
        gameOver = true;
        statusElement.textContent = "Game over!";
        return;
    }

    const eating = apple &&
        newHead.x === apple.x &&
        newHead.y === apple.y;

    // If not eating, the tail moves away this tick.
    const bodyToCheck = eating ? snake : snake.slice(0, -1);

    // Self collision.
    if (bodyToCheck.some(
        segment => segment.x === newHead.x &&
                   segment.y === newHead.y
    )) {
        gameOver = true;
        statusElement.textContent = "Game over!";
        return;
    }

    // Move the head forward.
    snake.unshift(newHead);

    if (eating) {
        score++;
        scoreElement.textContent = "Score: " + score;

        // The snake fills the entire board.
        if (snake.length === SIZE * SIZE) {
            apple = null;
            gameOver = true;
            render();
            statusElement.textContent = "You win!";
            return;
        }

        apple = spawnApple();
    } else {
        // Remove the tail only when not growing.
        snake.pop();
    }

    render();
}


function gameLoop(timestamp) {
    if (hasStarted && !gameOver) {
        if (timestamp - lastTick >= TICK_MS) {
            update();
            lastTick = timestamp;
        }
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", event => {
    const directions = {
        ArrowUp:    { x: 0, y: -1 },
        ArrowDown:  { x: 0, y: 1 },
        ArrowLeft:  { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
    };

    if (!directions[event.key]) return;

    event.preventDefault();
    changeDirection(directions[event.key]);
});

restartButton.addEventListener("click", resetGame);

createBoard();
resetGame();
requestAnimationFrame(gameLoop);
