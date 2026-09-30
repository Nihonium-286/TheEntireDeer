const menuSettings = {
    main: {
        width: 4,
        height: 3
    },

    desmos: {
        width: 4,
        height: 3
    },

    docs: {
        width: 3,
        height: 2
    },
    
    scratch: {
		width: 4,
		height: 3
	}
};

const menuName = document.body.dataset.menu;
const currentSettings = menuSettings[menuName];

const grid = [];

for (let y = 0; y < currentSettings.height; y++) {
    const row = [];

    for (let x = 0; x < currentSettings.width; x++) {
        row.push(null);
    }

    grid.push(row);
}

const menus = [
    {
        name: "Desmos Projects",
        description: "My Desmos projects",
        link: "desmos.html",
        width: 2,
        height: 1,
        x: 0,
        y: 0
    },
    
    {
        name: "Project Documents",
        description: "Links to Docs",
        link: "docs.html",
        width: 2,
        height: 2,
        x: 2,
        y: 0
    },
    
    {
        name: "Scratch Projects",
        description: "My Scratch Projects",
        link: "scratch.html",
        width: 1,
        height: 2,
        x: 0,
        y: 1
    }
];


const desmosProjects = [
    {
        name: "Renderer",
        description: "My custom Desmos renderer.",
        link: "https://www.desmos.com/calculator/5cb6ada23e",
        width: 2,
        height: 2,
        x: 0,
        y: 0
    },

    {
        name: "Enigma",
        description: "Desmos Enigma Machine Emulator",
        link: "https://www.desmos.com/calculator/f59a72f2ed",
        width: 1,
        height: 2,
        x: 2,
        y: 0
    },

    {
        name: "Minesweeper",
        description: "Desmos Minesweeper",
        link: "https://www.desmos.com/calculator/e27ec502d6",
        width: 2,
        height: 1,
        x: 0,
        y: 2
    }
];

const scratchProjects = [
    {
        name: "Boid Sim. 2",
        description: "Simulates the movement of birds.",
        link: "https://scratch.mit.edu/projects/787333573",
        width: 2,
        height: 1,
        x: 0,
        y: 0
    },
    
    {
        name: "Sunburst Diagram Generator",
        description: "Generates a radial doughnut dendrogram.",
        link: "https://scratch.mit.edu/projects/1272370059",
        width: 2,
        height: 2,
        x: 2,
        y: 0
    },

    {
        name: "Mandelbrot",
        description: "A Mandelbrot Explorer",
        link: "https://scratch.mit.edu/projects/1385787141",
        width: 2,
        height: 1,
        x: 0,
        y: 1
    }
];

const projectDocs = [
	{
        name: "Black Hollow",
        description: "A stand alone game",
        link: "https://docs.google.com/document/d/15DVJgwDVlHUEgDE2hS1kHFdQgyfbHjvyplt1CQFOE78/edit?usp=sharing",
        width: 1,
        height: 1,
        x: 0,
        y: 0
    }
];

function createMenuBox(menu) {
    const box = document.createElement("a");

    box.className = "project";
    box.href = menu.link;

    box.innerHTML = `
        <h2>${menu.name}</h2>
        <p>${menu.description}</p>
    `;

    return box;
}

function createProjectBox(project) {
    const box = document.createElement("a");

    box.className = "project";
    box.href = project.link;
    box.target = "_blank";

    box.innerHTML = `
        <h2>${project.name}</h2>
        <p>${project.description}</p>
    `;

    return box;
}

let currentBoxes;

if (menuName === "main") {
    currentBoxes = menus;
} else if (menuName === "desmos") {
    currentBoxes = desmosProjects;
} else if (menuName === "docs") {
    currentBoxes = projectDocs;
} else if (menuName === "scratch") {
    currentBoxes = scratchProjects;
}

function canPlaceBox(box, x, y) {
    // Check board boundaries
    if (x < 0 || y < 0) {
        return false;
    }

    if (x + box.width > currentSettings.width) {
        return false;
    }

    if (y + box.height > currentSettings.height) {
        return false;
    }

    // Check for occupied cells
    for (let gridY = y; gridY < y + box.height; gridY++) {
        for (let gridX = x; gridX < x + box.width; gridX++) {
            const occupant = occupiedGrid[gridY][gridX];

            if (occupant !== null && occupant !== box) {
                return false;
            }
        }
    }

    return true;
}

function moveBox(box, x, y) {
    // Try to move
    if (canPlaceBox(box, x, y)) {
        box.x = x;
        box.y = y;

        occupiedGrid = buildGrid();
        renderBoard();

        return true;
    }

    // Find what is blocking the destination
    for (let gridY = y; gridY < y + box.height; gridY++) {
        for (let gridX = x; gridX < x + box.width; gridX++) {

            // Ignore cells outside the board
            if (
                gridX < 0 ||
                gridY < 0 ||
                gridX >= currentSettings.width ||
                gridY >= currentSettings.height
            ) {
                continue;
            }

            const occupant = occupiedGrid[gridY][gridX];

            if (occupant !== null && occupant !== box) {
                selectedBox = occupant;
                renderBoard();
                return false;
            }
        }
    }

    return false;
}

function renderBoard() {
    const container =
        document.getElementById("menus") ||
        document.getElementById("desmos-projects") ||
        document.getElementById("project-documents") ||
        document.getElementById("scratch-projects");

    if (!container) {
        return;
    }

    container.innerHTML = "";
    container.className = "board";

    const CELL_SIZE = 120;
    const GAP = 10;

    container.style.gridTemplateColumns =
        `repeat(${currentSettings.width}, ${CELL_SIZE}px)`;

    container.style.gridTemplateRows =
        `repeat(${currentSettings.height}, ${CELL_SIZE}px)`;

    for (const boxData of currentBoxes) {
        
        let box;

        if (menuName === "main") {
            box = createMenuBox(boxData);
        } else {
            box = createProjectBox(boxData);
        }

        box.style.gridColumn =
            `${boxData.x + 1} / span ${boxData.width}`;

        box.style.gridRow =
            `${boxData.y + 1} / span ${boxData.height}`;

        box.style.width =
            `${boxData.width * CELL_SIZE + (boxData.width - 1) * GAP}px`;

        box.style.height =
            `${boxData.height * CELL_SIZE + (boxData.height - 1) * GAP}px`;

		if (boxData === selectedBox) {
			box.classList.add("selected");
		}

        container.appendChild(box);
    }
}

function buildGrid() {
    const newGrid = [];

    for (let y = 0; y < currentSettings.height; y++) {
        const row = [];

        for (let x = 0; x < currentSettings.width; x++) {
            row.push(null);
        }

        newGrid.push(row);
    }

    for (const box of currentBoxes) {
        for (let y = box.y; y < box.y + box.height; y++) {
            for (let x = box.x; x < box.x + box.width; x++) {
                newGrid[y][x] = box;
            }
        }
    }

    return newGrid;
}

let occupiedGrid = buildGrid();
let selectedBox = currentBoxes[0];

document.addEventListener("keydown", function(event) {
    if (!selectedBox) {
        return;
    }

    let newX = selectedBox.x;
    let newY = selectedBox.y;

    if (event.key === "ArrowLeft") {
        newX--;
    } else if (event.key === "ArrowRight") {
        newX++;
    } else if (event.key === "ArrowUp") {
        newY--;
    } else if (event.key === "ArrowDown") {
        newY++;
    } else {
        return;
    }

    event.preventDefault();

    moveBox(selectedBox, newX, newY);
});

renderBoard();
