import {Game} from './game.js'

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
 * @type {Game | undefined}
 */
let game = undefined;

/**
 * @type {Node[][]}
 */
const board = [];
const main = document.querySelector("main");
let task = null;
let width = null;
let height = null;

const startGame = async taskId => {
    task = await getTask(taskId);
    width = task.map.colcount;
    height = task.map.rowcount;
    const playerX = task.player.posx;
    const playerY = task.player.posy;

    const flatBoard = [];

    for (let rowI = 0; rowI < height; rowI++) {
        for (let colI = 0; colI < width; colI++) {
            /**
             * @type {GameNode}
             */
            const node = {
                row: rowI,
                col: colI,
                isFirewall: task.map.field.split("\n")[rowI][colI] === 'o',
                isTarget: task.objects.some(obj => obj.posx === colI && obj.posy === rowI && obj.type === "target"),
                isPlayer: rowI == playerY && colI == playerX,
                isDecodeHelp: task.objects.some(obj => obj.posx === colI && obj.posy === rowI && obj.type === "decodehelp"),
                isSneakHelp: task.objects.some(obj => obj.posx === colI && obj.posy === rowI && obj.type === "sneakhelp"),
                isActivated: false
            };
            flatBoard.push(node);
        }
    }

    game = new Game(width, height, flatBoard, playerX, playerY);

    console.log(game);

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
            if(board[rowI][colI].isPlayer){
                tableCol.classList.add("player");
            } 

            if (board[rowI][colI].isTarget) {
                tableCol.classList.add("target");
            } 

            if (board[rowI][colI].isFirewall) {
                tableCol.classList.add("firewall");
                tableCol.innerText += "firewall ";
            } 

            if (board[rowI][colI].isDecodeHelp) {
                tableCol.classList.add("target");
                tableCol.innerText += "decode ";
            } 

            if (board[rowI][colI].isSneakHelp) {
                tableCol.classList.add("target");
                tableCol.innerText += "sneak ";
            } 
            
            if (board[rowI][colI].isActivated) {
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
    console.log(board);
    main.innerHTML = "";
    const table = generateTable();
    main.appendChild(table);
}

const refreshTargets = () => {
    const table = generateTable();
    main.appendChild(table);
}

startGame(7);

