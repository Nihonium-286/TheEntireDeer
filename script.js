const menus = [
    {
        name: "Desmos Projects",
        description: "My Desmos projects",
        link: "desmos.html"
    }
];


const desmosProjects = [
    {
        name: "Renderer",
        description: "My custom Desmos renderer.",
        link: "https://www.desmos.com/calculator/5cb6ada23e"
    },

    {
        name: "Enigma",
        description: "Desmos Enigma Machine Emulator",
        link: "https://www.desmos.com/calculator/f59a72f2ed"
    },

    {
        name: "Minesweeper",
        description: "Desmos Minesweeper",
        link: "https://www.desmos.com/calculator/e27ec502d6"
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


const menuContainer = document.getElementById("menus");

if (menuContainer) {
    for (const menu of menus) {
        const box = createMenuBox(menu);
        menuContainer.appendChild(box);
    }
}


const projectContainer = document.getElementById("desmos-projects");

if (projectContainer) {
    for (const project of desmosProjects) {
        const box = createProjectBox(project);
        projectContainer.appendChild(box);
    }
}
