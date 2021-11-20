import { Game } from "./game.js";

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

const div = document.querySelector("div");
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
            };
            flatBoard.push(node);
        }
    }

    game = new Game(width, height, flatBoard, playerX, playerY, 7);
    window.game = game;

    console.log(game);
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


const renderGameOnCanvas = () => {
    const ctx = canvas.getContext("2d");
    if (game === undefined) {
        window.requestAnimationFrame(renderGameOnCanvas);
        return;
    } 
    canvas.width = game.columns * 50;
    canvas.height = game.rows * 50;

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

            if (currentNode.isPlayer) {
                ctx.drawImage(playerImage, colI*50, rowI*50, 50, 50);
            }
        }
    }

    window.requestAnimationFrame(renderGameOnCanvas)
};


startGame(7);
renderGameOnCanvas();
div.appendChild(canvas);
