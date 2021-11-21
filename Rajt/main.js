import { Game } from "./game.js";

/**
 * @typedef {object} GameNode
 * @property {string | undefined} id
 * @property {number} row
 * @property {number} column
 * @property {bool} isFirewall
 * @property {bool} isTarget
 * @property {bool} isPlayer
 * @property {bool} isDecodeHelp
 * @property {bool} isSneakHelp
 * @property {bool} isActivated
 * //////////////////////////////
 * @property {import("./game.js").Direction} pathDirection
 * @property {number} pathCost
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

const div = document.querySelector("div");
const main = document.querySelector("main");
const canvas = document.createElement("canvas");
const playerImage = new Image();
playerImage.src = "assets/drone_wo_floor.png";
const decodeImage = new Image();
decodeImage.src = "assets/decode_help.png";
const sneakImage = new Image();
sneakImage.src = "assets/sneak_help.png";
const targetImage = new Image();
targetImage.src = "assets/target.png";
const firewallImage = new Image();
firewallImage.src = "assets/firewall.png";
const tileImage = new Image();
tileImage.src = "assets/tile.png";
const checkImage = new Image();
checkImage.src = "assets/check.png";

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
                column: colI,
                id: task.objects.filter(obj => obj.posx === colI && obj.posy === rowI).map(obj => obj.ID)[0],
                isFirewall: task.map.field.split("\n")[rowI][colI] === "o",
                isTarget: task.objects.some(obj => obj.posx === colI && obj.posy === rowI && obj.type === "target"),
                isPlayer: rowI == playerY && colI == playerX,
                isDecodeHelp: task.objects.some(
                    obj => obj.posx === colI && obj.posy === rowI && obj.type === "decodehelp"
                ),
                isSneakHelp: task.objects.some(
                    obj => obj.posx === colI && obj.posy === rowI && obj.type === "sneakhelp"
                ),
                isActivated: false,
                pathDirection: "up",
                pathCost: Infinity,
            };
            if (node.id !== undefined) node.id = node.id.toString();
            flatBoard.push(node);
        }
    }

    game = new Game(width, height, flatBoard, playerX, playerY, taskId);
    window.game = game;

    console.log(game);
    game.printMap();
    console.log("Solving game...");
    main.hidden = false;
    const solved = game.solve();
    main.hidden = true;
    console.log("Optimal order: ", solved.history);

    let i = 0;
    if (true) {
        const next = () => {
            if (i >= solved.history.length) return;

            game.handleInput(solved.history[i]);
            console.log("Sending: ", solved.history[i]);
            ++i;
            setTimeout(next, 150);
        }
        next();
    }

    console.log(task.map.field);
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

let playerPos = {row: 0, col: 0};
let prevPlayerPos = {row: 0, col: 0};
let curPlayerPos = {row: 0, col: 0};
let initial = true;
let cooldown = 0;
const renderGameOnCanvas = () => {
    const ctx = canvas.getContext("2d");
    if (game === undefined) {
        window.requestAnimationFrame(renderGameOnCanvas);
        return;
    } 
    canvas.width = game.columns * 50;
    canvas.height = game.rows * 50;
    ctx.clearRect(0, 0, game.columns * 50, game.rows * 50)

    for (let rowI = 0; rowI < height; rowI++) {
        for (let colI = 0; colI < width; colI++) {
            const currentNode = game.getNode(colI, rowI);
            ctx.drawImage(tileImage, colI*50, rowI*50, 50, 50)
            if (currentNode.isTarget) {
                ctx.drawImage(targetImage, colI*50, rowI*50, 50, 50);
            }

            if (currentNode.isDecodeHelp) {
                ctx.drawImage(decodeImage, colI*50, rowI*50, 50, 50);
            }

            if (currentNode.isSneakHelp) {
                ctx.drawImage(sneakImage, colI*50, rowI*50, 50, 50);
            }

            if (currentNode.isFirewall) {
                ctx.drawImage(firewallImage, colI*50, rowI*50, 50, 50);
            }

            if (currentNode.isActivated) {
                ctx.drawImage(checkImage, colI*50, rowI*50, 50, 50);
            }

            if (currentNode.isPlayer) {
                playerPos = {
                    row: rowI*50,
                    col: colI*50
                }
            }
        }
    }

    let movementModifier = 50/60;
    if (initial) {
        movementModifier = 10;
        cooldown++;
    }
    if (playerPos.col !== curPlayerPos.col){
        if (playerPos.col > curPlayerPos.col) {
            curPlayerPos.col += movementModifier;
        } else {
            curPlayerPos.col -= movementModifier;
        }
    }

    if (playerPos.row !== curPlayerPos.row){
        if (playerPos.row > curPlayerPos.row) {
            curPlayerPos.row += movementModifier;
        } else {
            curPlayerPos.row -= movementModifier;
        }
    }

    if (prevPlayerPos.col !== curPlayerPos.col){
        prevPlayerPos.col = curPlayerPos.col;
    }
    if (prevPlayerPos.row !== curPlayerPos.row){
        prevPlayerPos.row = curPlayerPos.row;
    }

    ctx.drawImage(playerImage, curPlayerPos.col || playerPos.col, curPlayerPos.row || playerPos.row, 50, 50);
    if (initial && cooldown > 60*60) {
        initial = false;
    }
    window.requestAnimationFrame(renderGameOnCanvas);
};

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
console.log(params);

startGame(params.task);
renderGameOnCanvas();
div.appendChild(canvas);
