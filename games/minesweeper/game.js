
const WIDTH = 9;
const HEIGHT = 9;
const MINE_COUNT = 10;

// Each cell will eventually track its mine status,
// neighboring mine count, and whether it is revealed.
let board = [];
let gameStarted = false;
let gameStatus = "ready";
// Possible values: "ready", "playing", "won", "lost"

function startGame(firstX, firstY) {
    gameStarted = true;
    gameStatus = "playing";

    placeMines(firstX, firstY);
    calculateNumbers();
    updateGameStatus();
}

function createBoard() {
    board = [];

    for (let y = 0; y < HEIGHT; y++) {
        const row = [];

        for (let x = 0; x < WIDTH; x++) {
            row.push({
                mine: false,
                adjacentMines: 0,
                revealed: false
            });
        }

        board.push(row);
    }
}

function placeMines(firstX, firstY) {
    let placed = 0;

    while (placed < MINE_COUNT) {
        const x = Math.floor(Math.random() * WIDTH);
        const y = Math.floor(Math.random() * HEIGHT);

        // Never place a mine on the first clicked cell.
        if (x === firstX && y === firstY) {
            continue;
        }

        if (board[y][x].mine) {
            continue;
        }

        board[y][x].mine = true;
        placed++;
    }
}

function calculateNumbers() {
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (board[y][x].mine) {
                continue;
            }

            let count = 0;

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) {
                        continue;
                    }

                    const nx = x + dx;
                    const ny = y + dy;

                    if (
                        nx >= 0 && nx < WIDTH &&
                        ny >= 0 && ny < HEIGHT &&
                        board[ny][nx].mine
                    ) {
                        count++;
                    }
                }
            }

            board[y][x].adjacentMines = count;
        }
    }
}

function renderBoard() {
    const container = document.getElementById("game-board");

    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns =
        `repeat(${WIDTH}, 1fr)`;
    container.style.gap = "3px";

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const cell = document.createElement("button");

            cell.className = "mine-cell";
            const data = board[y][x];

			if (data.revealed) {
				cell.disabled = true;
				cell.style.background = "#252525";

				if (data.mine) {
					cell.textContent = "Ow";
				} else if (data.adjacentMines > 0) {
					cell.textContent = data.adjacentMines;
				}
			}
            cell.type = "button";
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.setAttribute(
                "aria-label",
                `Row ${y + 1}, column ${x + 1}`
            );
            cell.addEventListener("click", function() {
				handleCellClick(x, y);
			});

            container.appendChild(cell);
        }
    }
}

function handleCellClick(x, y) {
    if (gameStatus === "won" || gameStatus === "lost") {
		return;
	}
    
    updateGameStatus();
    
    if (!gameStarted) {
        startGame(x, y);
    }

    const cell = board[y][x];

    if (cell.revealed) {
        return;
    }

    if (cell.mine) {
		cell.revealed = true;
		gameStatus = "lost";
		renderBoard();
		updateGameStatus();
		return;
	}

    revealCell(x, y);
    
    if (checkWin()) {
		gameStatus = "won";
	}

	renderBoard();
	updateGameStatus();
}

function revealCell(x, y) {
    // Ignore coordinates outside the board.
    if (
        x < 0 || x >= WIDTH ||
        y < 0 || y >= HEIGHT
    ) {
        return;
    }

    const cell = board[y][x];

    // Don't process cells we've already revealed.
    if (cell.revealed) {
        return;
    }

    cell.revealed = true;

    // Only empty cells spread the reveal.
    if (!cell.mine && cell.adjacentMines === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }

                revealCell(x + dx, y + dy);
            }
        }
    }
}

function checkWin() {
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const cell = board[y][x];

            if (!cell.mine && !cell.revealed) {
                return false;
            }
        }
    }

    return true;
}

function updateGameStatus() {
    const status = document.getElementById("game-status");

    if (gameStatus === "ready") {
        status.textContent = "Click a tile";
    } else if (gameStatus === "playing") {
        status.textContent = "Playing";
    } else if (gameStatus === "won") {
        status.textContent = "You won!";
    } else if (gameStatus === "lost") {
        status.textContent = "Game over";
    }
}

function resetGame() {
    gameStarted = false;
    gameStatus = "ready";

    createBoard();
    renderBoard();
    updateGameStatus();
}

document
    .getElementById("restart-button")
    .addEventListener("click", resetGame);

// Generate the first board.
createBoard();

renderBoard();
