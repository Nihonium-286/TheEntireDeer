
const SIZE = 4;
const ANIMATION_MS = 180;

let board = [];
let score = 0;
let gameStatus = "playing";
let boardInitialized = false;
let isAnimating = false;
let nextTileId = 0;
let hasWon = false;

function createBoard() {
    board = [];

    for (let y = 0; y < SIZE; y++) {
        board.push(Array(SIZE).fill(null));
    }
}

function getEmptyCells() {
    const emptyCells = [];

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            if (board[y][x] === null) {
                emptyCells.push({ x, y });
            }
        }
    }

    return emptyCells;
}

function spawnTile() {
    const emptyCells = getEmptyCells();

    if (emptyCells.length === 0) return false;

    const cell = emptyCells[
        Math.floor(Math.random() * emptyCells.length)
    ];

    board[cell.y][cell.x] = {
        id: nextTileId++,
        value: Math.random() < 0.9 ? 2 : 4,
        x: cell.x,
        y: cell.y,
        element: null
    };

    return true;
}

function createTileElement(tile) {
    const element = document.createElement("div");

    element.classList.add("tile");
    element.textContent = tile.value;
    element.dataset.tileId = tile.id;

    tile.element = element;
    return element;
}

function getTileColorClass(value) {
    if (value <= 64) {
        return "tile-" + value;
    }

    const colors = [
        "tile-large-1",
        "tile-large-2",
        "tile-large-3",
        "tile-large-4",
        "tile-large-5",
        "tile-large-6"
    ];

    // 128 is palette index 0, 256 is index 1, etc.
    const exponent = Math.log2(value);
    const index = (exponent - 7) % colors.length;

    return colors[index];
}

function updateTileAppearance(tile) {
    const element = tile.element;

    element.textContent = tile.value;

    for (const className of [...element.classList]) {
        if (className.startsWith("tile-")) {
            element.classList.remove(className);
        }
    }

	element.classList.add(getTileColorClass(tile.value));
}

function renderBoard(removedTiles = [], animate = false) {
    const boardElement = document.getElementById("game-board");

    if (!boardInitialized) {
        boardElement.innerHTML = "";

        // These 16 background cells never move.
        for (let i = 0; i < SIZE * SIZE; i++) {
            const cell = document.createElement("div");
            cell.classList.add("board-cell");
            boardElement.appendChild(cell);
        }

        const tileLayer = document.createElement("div");
        tileLayer.id = "tile-layer";
        boardElement.appendChild(tileLayer);

        boardInitialized = true;
    }

    const tileLayer = document.getElementById("tile-layer");
    const activeTiles = board.flat().filter(tile => tile !== null);
    const allTiles = [...activeTiles, ...removedTiles];

    // Remember each existing tile's screen position.
    const oldPositions = new Map();

    for (const tile of allTiles) {
        if (tile.element && tile.element.isConnected) {
            oldPositions.set(
                tile.id,
                tile.element.getBoundingClientRect()
            );
        }
    }

    // Create elements only for tiles that don't have one yet.
    for (const tile of allTiles) {
        if (!tile.element) {
            createTileElement(tile);
        }

        updateTileAppearance(tile);

        tile.element.style.gridRow = tile.y + 1;
        tile.element.style.gridColumn = tile.x + 1;
        tile.element.style.opacity = "1";
        tile.element.style.transform = "translate(0, 0)";

        if (!tile.element.isConnected) {
            tileLayer.appendChild(tile.element);
        }
    }

    // Put existing tiles back at their old visual positions,
    // then let CSS transition them to their new grid positions.
    if (animate) {
        for (const tile of allTiles) {
            const oldRect = oldPositions.get(tile.id);
            if (!oldRect) continue;

            const newRect = tile.element.getBoundingClientRect();

            const dx = oldRect.left - newRect.left;
            const dy = oldRect.top - newRect.top;

            tile.element.style.transition = "none";
            tile.element.style.transform =
                `translate(${dx}px, ${dy}px)`;
        }

        // Apply the starting transforms before enabling transitions.
        void tileLayer.offsetWidth;

        requestAnimationFrame(() => {
            for (const tile of allTiles) {
                tile.element.style.transition =
                    `transform ${ANIMATION_MS}ms ease-in-out, ` +
                    `opacity ${ANIMATION_MS}ms ease-in-out`;

                tile.element.style.transform = "translate(0, 0)";

                if (removedTiles.includes(tile)) {
                    tile.element.style.opacity = "0";
                }
            }
        });
    } else {
        for (const tile of allTiles) {
            tile.element.style.transition = "none";
            tile.element.style.transform = "translate(0, 0)";
        }
    }

    document.getElementById("score").textContent = score;
}

function resetGame() {
    isAnimating = false;
    nextTileId = 0;
    score = 0;
    gameStatus = "playing";
    hasWon = false;

    createBoard();

    const tileLayer = document.getElementById("tile-layer");
    if (tileLayer) tileLayer.innerHTML = "";

    spawnTile();
    spawnTile();

    renderBoard();
    showGameStatus("Ready");
}

function mergeLine(line) {
    const values = line.filter(tile => tile !== null);
    const result = [];
    const removedTiles = [];

    let i = 0;

    while (i < values.length) {
        const first = values[i];
        const second = values[i + 1];

        if (second && first.value === second.value) {
            first.value *= 2;
            score += first.value;

            // The second tile travels to the first tile's destination,
            // then fades away.
            second.mergeInto = first;
            removedTiles.push(second);

            result.push(first);
            i += 2;
        } else {
            result.push(first);
            i++;
        }
    }

    while (result.length < SIZE) {
        result.push(null);
    }

    return { result, removedTiles };
}

function moveBoard(direction) {
    let moved = false;
    const removedTiles = [];

    for (let i = 0; i < SIZE; i++) {
        let line = [];

        // Read a row or column.
        for (let j = 0; j < SIZE; j++) {
            if (direction === "left" || direction === "right") {
                line.push(board[i][j]);
            } else {
                line.push(board[j][i]);
            }
        }

        const original = [...line];

        // Process every line toward the left.
        if (direction === "right" || direction === "down") {
            line.reverse();
        }

        const merged = mergeLine(line);
        line = merged.result;
        removedTiles.push(...merged.removedTiles);

        if (direction === "right" || direction === "down") {
            line.reverse();
        }

        // Write the resulting line back and update tile coordinates.
        for (let j = 0; j < SIZE; j++) {
            const tile = line[j];
            const x = direction === "left" || direction === "right"
                ? j : i;
            const y = direction === "left" || direction === "right"
                ? i : j;

            board[y][x] = tile;

            if (tile) {
                tile.x = x;
                tile.y = y;
            }
        }

        if (line.some((tile, index) => tile !== original[index])) {
            moved = true;
        }
    }

    // Move each merging-away tile to its partner's destination.
    for (const tile of removedTiles) {
        tile.x = tile.mergeInto.x;
        tile.y = tile.mergeInto.y;
    }

    return { moved, removedTiles };
}

function checkWin() {
    return board.some(row =>
        row.some(tile => tile !== null && tile.value >= 2048)
    );
}

function checkGameOver() {
    // Any empty cell means the game can continue.
    if (getEmptyCells().length > 0) {
        return false;
    }

    // Check whether any horizontally or vertically
    // adjacent tiles can merge.
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const tile = board[y][x];

            if (x + 1 < SIZE &&
                tile.value === board[y][x + 1].value) {
                return false;
            }

            if (y + 1 < SIZE &&
                tile.value === board[y + 1][x].value) {
                return false;
            }
        }
    }

    return true;
}

function showGameStatus(message, showKeepGoing = false) {
    document.getElementById("game-status").textContent = message;
    document.getElementById("keep-going-button").hidden =
        !showKeepGoing;
}

function handleMove(direction) {
    if (isAnimating || gameStatus !== "playing") return;

    const move = moveBoard(direction);

    if (!move.moved) {
        document.getElementById("score").textContent = score;
        return;
    }

    isAnimating = true;
    renderBoard(move.removedTiles, true);

    setTimeout(() => {
        for (const tile of move.removedTiles) {
            if (tile.element) tile.element.remove();
        }

        // Winning takes priority over game over.
        if (!hasWon && checkWin()) {
            hasWon = true;
            gameStatus = "won";
            renderBoard();
            showGameStatus("You reached 2048!", true);
            isAnimating = false;
            return;
        }

        spawnTile();
        renderBoard();

        if (checkGameOver()) {
            gameStatus = "over";
            showGameStatus("Game over!");
        } else if (gameStatus === "playing") {
            showGameStatus(hasWon ? "Keep going!" : "Playing");
        }

        isAnimating = false;
    }, ANIMATION_MS + 20);
}

document.addEventListener("keydown", event => {
    const directions = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down"
    };

    const direction = directions[event.key];
    if (!direction) return;

    event.preventDefault();
    handleMove(direction);
});

document.getElementById("restart-button")
    .addEventListener("click", resetGame);

document.getElementById("keep-going-button")
    .addEventListener("click", function() {
        if (gameStatus !== "won") return;

        gameStatus = "playing";
        showGameStatus("Keep going!");

        if (checkGameOver()) {
            gameStatus = "over";
            showGameStatus("Game over!");
        }
    });

resetGame();
