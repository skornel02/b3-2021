import { firstBreaker, secondBreaker, thirdBreaker } from "./codebreakers.js";

/**
 * @typedef {"left" | "right" | "up" | "down"} Direction
 */
const directions = ["left", "right", "up", "down"];

/**
 * @typedef {"left" | "right" | "up" | "down" | "activate"} Action
 */
const actions = [...directions, "activate"];

export class Game {

    /**
     * @type {number}
     */
    columns;
    /**
     * @type {number}
     */
    rows;

    /**
     * @type {import("./main").GameNode[]}
     */
    board;

    /**
     * @type {number}
     */
    playerX;
    /**
     * @type {number}
     */
    playerY;

    actionsUsed = 0;
    targets = 0;
    sneakHelp = 0;
    decodeHelp = 0;

    /**
     * @type {number | undefined}
     */
    taskId;

    constructor(columns, rows, board, playerX, playerY, taskId = undefined) {
        this.columns = columns;
        this.rows = rows;
        this.board = board;
        this.playerX = playerX;
        this.playerY = playerY;
        this.taskId = taskId;
    }

    /**
     * @param {number} x 
     * @param {number} y
     * @returns {import("./main").GameNode} 
     */
    getNode = (x, y) => {
        return this.board.filter(node => node.column === x && node.row === y)[0];
    }

    /**
     * 
     * @param {Action} action 
     */
    handleInput = (action) => {
        switch (action) {
            case "activate":
                return this.handleAction();
            default:
                return this.handleMove(action);
        }
    }

    handleAction = () => {
        const node = this.getNode(this.playerX, this.playerY);
        if (node.isActivated || !(node.isTarget || node.isDecodeHelp || node.isSneakHelp)) throw "This can't be activated";

        const actionPoints = Math.max(1, 10 - (3 * this.decodeHelp));
        this.actionsUsed += actionPoints;

        node.isActivated = true;
        if (node.isTarget) {
            this.targets++;
            if (this.taskId != undefined) {
                this.sendTarget();
            }
        } else if (node.isDecodeHelp) {
            this.decodeHelp++;
            if (this.taskId != undefined) {
                this.sendDecodeHelp();
            }
        } else if (node.isSneakHelp) {
            this.sneakHelp++;            
            if (this.taskId != undefined) {
                this.sendSneakHelp();
            }
        }
    }

    sendTarget = async () => {
        console.group();
        console.log("Sending target action!");
        const requestBody = {
            action: "performactions",
            teamcode: "3712283f4c7855862533",
            taskid: this.taskId,
            actions: ["activate"]
        };
        const resp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
        const respData= await resp.json();
        console.log(respData);
        const username = respData.data.activation_user;
        
        const passwordResp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/loginchecker.php", {
            method: "POST",
            body: JSON.stringify({
				action: "getuserhelp",
				username
			})
        })

        const password = firstBreaker((await passwordResp.json()).data.mixedpwd);

        const resp2 = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
            method: "POST",
            body: JSON.stringify({
                action: "activateobject",
                teamcode: "3712283f4c7855862533",
                taskid: this.taskId,
                pwd: password
            }),
        });
        console.log(await resp2.json());

        console.groupEnd();
    }

    sendDecodeHelp = async () => {
        console.group();
        console.log("Sending decode help action!");
        const requestBody = {
            action: "performactions",
            teamcode: "3712283f4c7855862533",
            taskid: this.taskId,
            actions: ["activate"]
        };
        const resp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
        const respData= await resp.json();
        console.log(respData);
        const username = respData.data.activation_user;
        
        const passwordResp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/advancedchecker.php", {
            method: "POST",
            body: JSON.stringify({
				action: "getuserhelp",
				username
			})
        })

        const passwordData = (await passwordResp.json());
        const password = secondBreaker(passwordData.data.mixedpwd, passwordData.data.saltvalue.toString());

        const resp2 = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
            method: "POST",
            body: JSON.stringify({
                action: "activateobject",
                teamcode: "3712283f4c7855862533",
                taskid: this.taskId,
                pwd: password
            }),
        });
        console.log(await resp2.json());

        console.groupEnd();
    }

    sendSneakHelp = async () => {
        console.group();
        console.log("Sending target action!");
        const requestBody = {
            action: "performactions",
            teamcode: "3712283f4c7855862533",
            taskid: this.taskId,
            actions: ["activate"]
        };
        const resp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
        const respData= await resp.json();
        console.log(respData);
        const username = respData.data.activation_user;
        
        const passwordResp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/uberchecker.php", {
            method: "POST",
            body: JSON.stringify({
				action: "getuserhelp",
				username
			})
        })

        const password = thirdBreaker((await passwordResp.json()).data.mixedpwd);

        const resp2 = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
            method: "POST",
            body: JSON.stringify({
                action: "activateobject",
                teamcode: "3712283f4c7855862533",
                taskid: this.taskId,
                pwd: password
            }),
        });
        console.log(await resp2.json());

        console.groupEnd();
    }

    /**
     * 
     * @param {Direction} direction 
     */
    handleMove = (direction) => {
        const lastNode = this.getNode(this.playerX, this.playerY);
        lastNode.isPlayer = false;
        switch (direction) {
            case "left":
                if (this.playerX == 0) throw "Can't move left";
                this.playerX--;
                break;
            case "right":
                if (this.playerX == this.columns - 1) throw "Can't move right";
                this.playerX++;
                break;
            case "up":
                if (this.playerY == 0) throw "Can't move up";
                this.playerY--;
                break;
            case "down":
                if (this.playerY == this.rows - 1) throw "Can't move down";
                this.playerY++;
                break;
        }
        const node = this.getNode(this.playerX, this.playerY);
        node.isPlayer = true;
        let actionPoints = Math.max(1, (node.isFirewall ? 5 : 1) - (this.sneakHelp * 2));
        this.actionsUsed += actionPoints;

        if (this.taskId != undefined) {
            this.sendMove(direction);
        }
    }

    sendMove = async (direction) => {
        console.group();
        console.log("Sending movement: ", direction);
        const requestBody = {
            action: "performactions",
            teamcode: "3712283f4c7855862533",
            taskid: this.taskId,
            actions: [direction]
        };
        const resp = await fetch("http://bitkozpont.mik.uni-pannon.hu/2021/gamehandler.php", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
        console.log(await resp.json());
        console.groupEnd();
    }

    printMap = () => {
        console.group();
        console.log(`Player pos: (${this.playerX};${this.playerY}), actions used: ${this.actionsUsed}`)
        console.log(`Active targets: ${this.targets}, active decoder: ${this.decodeHelp}, active sneak: ${this.sneakHelp}`);
        for (let y = 0; y < this.rows; y++) {
            let row = "";
            for (let x = 0; x < this.columns; x++) {
                const node = this.getNode(x, y);
                let char = "";
                if (node.isPlayer) {
                    char = "p";
                } else if (node.isDecodeHelp) {
                    char = "d";
                } else if (node.isSneakHelp) {
                    char = "s";
                } else if (node.isTarget) {
                    char = "t";
                } else {
                    char = "n";
                }
                char = node.isFirewall ? char.toUpperCase() : char;
                row += char;
            }
            console.log(`%c${row}`, "font-family: monospace");
        }
        console.groupEnd();
    }
}

const serializeGame = (game) => JSON.stringify(game);

const deserializeGame = (gameText) => {
    const game = new Game();
    var parsed = JSON.parse(gameText);
    Object.assign(game, parsed);
    return game;
}