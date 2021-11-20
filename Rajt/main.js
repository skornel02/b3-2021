/**
 * @typedef {object} GameNode
 * @property {number} row
 * @property {number} column
 * @property {bool} isFirewall
 * @property {bool} isTarget
 * @property {bool} isPlayer
 * @property {bool} isDecodeHelp
 * @property {bool} isSneakHelp
 * @property {bool} isActivated
 */

/**
 * @type {Node[][]}
 */
const game = [];
const main = document.querySelector("main");
let task = null;
let width = null;
let height = null;

const startGame = async taskId => {
    task = await getTask(taskId);
    width = task.data.map.colcount;
    height = task.data.map.rowcount;

    for (let y = 0; y < width; y++) {
        const row = [];
        for (let x = 0; x < height; x++) {
            row[x] = "";
        }
        game[y] = [...row];
    }
    main.innerHTML = "";
    const table = generateTable();
    main.appendChild(table);
    console.log(task.data.map.field);
    refreshPlayer();
    refreshTargets();

    //console.log(game);
};

const generateTable = () => {
    const table = document.createElement("table");

    table.innerHTML = "";
    for (let y = 0; y < width; y++) {
        const tableRow = document.createElement("tr");
        for (let x = 0; x < height; x++) {
            const tableCol = document.createElement("td");
            if(game[y][x] === "player"){
                tableCol.classList.add("player");
            } else {
                tableCol.innerText = game[y][x];
            }
            tableRow.appendChild(tableCol);
        }
        table.appendChild(tableRow);
    }

    return table;
};

const getTask = async taskId => {
    const requestBody = {
        action: "starttask",
        teamcode: "3712283f4c7855862533",
        taskid: taskId,
    };
    const resp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
        method: "POST",
        body: JSON.stringify(requestBody),
    });

    return resp.json();
};

const refreshPlayer = () => {
    const posX = task.data.player.posx;
    const posY = task.data.player.posy;

    game[posY][posX] = "player";
    console.log(game);
    main.innerHTML = "";
    const table = generateTable();
    main.appendChild(table);
}

const refreshTargets = () => {
    task.data.objects.forEach(object => {
        const posX = object.posx;
        const posY = object.posy;

        game[posY][posX] = object.type;
        main.innerHTML = "";
    });
    const table = generateTable();
    main.appendChild(table);
}

startGame(7);

