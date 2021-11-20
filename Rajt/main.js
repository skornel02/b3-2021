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
 * @typedef {object} MapStatus
 * @property {string} field
 * @property {number} rowcount
 * @property {number} colcount
 */

/**
 * @typedef {object} PlayerStatus
 * @property {number} posx
 * @property {number} posy
 * @property {number} actionsused
 * @property {number} targets
 * @property {number} sneakhelp
 * @property {number} decodehelp
 */

/**
 * @typedef {object} MapObject
 * @property {number} ID
 * @property {string} type
 * @property {number} posx
 * @property {number} posy
 * @property {bool} activated
 */

/**
 * @typedef {object} GameStatus
 * @property {MapStatus} map
 * @property {PlayerStatus} player
 * @property {MapObject[]} objects
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
    width = task.map.colcount;
    height = task.map.rowcount;

    for (let rowI = 0; rowI < height; rowI++) {
        const row = [];
        for (let colI = 0; colI < width; colI++) {
            row[colI] = {
                row: rowI,
                col: colI,
                isFirewall: false,
                isTarget: false,
                isPlayer: false,
                isDecodeHelp: false,
                isSneakHelp: false,
                isActivated: false
            };
        }
        game[rowI] = [...row];
    }
    main.innerHTML = "";
    const table = generateTable();
    main.appendChild(table);
    console.log(task.map.field);
    refreshPlayer();
    refreshTargets();

    //console.log(game);
};

const generateTable = () => {
    const table = document.createElement("table");

    table.innerHTML = "";
    for (let rowI = 0; rowI < height; rowI++) {
        const tableRow = document.createElement("tr");
        for (let colI = 0; colI < width; colI++) {
            const tableCol = document.createElement("td");
            if(game[rowI][colI].isPlayer){
                tableCol.classList.add("player");
            } 

            if (game[rowI][colI].isTarget) {
                tableCol.classList.add("target");
            } 

            if (game[rowI][colI].isFirewall) {
                tableCol.classList.add("firewall");
                tableCol.innerText += "firewall ";
            } 

            if (game[rowI][colI].isDecodeHelp) {
                tableCol.classList.add("target");
                tableCol.innerText += "decode ";
            } 

            if (game[rowI][colI].isSneakHelp) {
                tableCol.classList.add("target");
                tableCol.innerText += "sneak ";
            } 
            
            if (game[rowI][colI].isActivated) {
                tableCol.classList.add("target");
                tableCol.innerText += "active ";
            }
            tableRow.appendChild(tableCol);
        }
        table.appendChild(tableRow);
    }

    return table;
};

/**
 * 
 * @param {number} taskId 
 * @returns {GameStatus}
 */
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

    return (await resp.json()).data;
};

const refreshPlayer = () => {
    const posX = task.player.posx;
    const posY = task.player.posy;

    game[posY][posX].isPlayer = true;
    console.log(game);
    main.innerHTML = "";
    const table = generateTable();
    main.appendChild(table);
}

const refreshTargets = () => {
    task.objects.forEach(object => {
        const posX = object.posx;
        const posY = object.posy;

        switch (object.type) {
            case "target": {
                game[posY][posX].isTarget = true;
                break;
            }
            case "decodehelp": {
                game[posY][posX].isDecodeHelp = true;
                break;
            }
            case "sneakhelp": {
                game[posY][posX].isSneakHelp = true;
                break;
            }
        }
        main.innerHTML = "";
    });

    let row = 0;
    task.map.field.split("\n").forEach(line => {
        let col = 0;
        line.split("").forEach(char => {
            if (char === ".") {
                col++;
                return;
            }
            if (char === "o") {
                game[row][col].isFirewall = true;
                col++;
            }
        })
        row++;
    })
    const table = generateTable();
    main.appendChild(table);
}

startGame(7);

