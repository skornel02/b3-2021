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

    history = [];

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
     * @returns {import("./main").GameNode | undefined} 
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
                this.handleAction();
                break;
            default:
                this.handleMove(action);
                break;
        }
        this.history.push(action);
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
        const respData = await resp.json();
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
        const respData = await resp.json();
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
        const respData = await resp.json();
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
     * @param {import("./main").GameNode} node
     * @returns {number} 
     */
    getCostForNode = (node) => Math.max(1, (node.isFirewall ? 5 : 1) - (this.sneakHelp * 2));

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
        let actionPoints = this.getCostForNode(node);
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

    isGameFinished = () => !this.getActiveGoalNodes().some(node => node.isTarget);

    ///////////////////////////////////////////////////////////////////////

    /**
     * 
     * @param {import("./main").GameNode} node
     * @returns {{cost: number, movements: Direction[]}}
     */
    createPathFindingForNode = (node) => {
        this.board.forEach(node => node.pathCost = Infinity);
        this.pathFind(node, 0, "up");
        const result = {
            cost: this.getNode(this.playerX, this.playerY).pathCost,
            movements: [],
        }
        let pointerX = this.playerX;
        let pointerY = this.playerY;
        while (pointerX !== node.column || pointerY !== node.row) {
            const nextNode = this.getNode(pointerX, pointerY);
            result.movements.push(nextNode.pathDirection);
            const [nextX, nextY] = getNextCoordinate(pointerX, pointerY, nextNode.pathDirection);
            pointerX = nextX;
            pointerY = nextY;
        }
        return result;
    }

    /**
     * @param {import("./main").GameNode} node 
     * @param {number} cost 
     * @param {Direction} direction
     */
    pathFind = (node, cost, direction) => {
        if (cost >= node.pathCost) return;
        node.pathCost = cost;
        node.pathDirection = direction;
        const costOfNode = this.getCostForNode(node);
        directions.forEach(direction => {
            const [nextX, nextY] = getNextCoordinate(node.column, node.row, direction);
            const nextNode = this.getNode(nextX, nextY);
            if (nextNode !== undefined) {
                this.pathFind(nextNode, costOfNode + cost, getOppositeDirection(direction));
            }
        })
    }

    ///////////////////////////////////////////////////////////////////////

    /**
     * @returns {Game}
     */
    solve = () => {
        if (this.isGameFinished()) return this;

        const games = this.getActiveGoalNodes().map(goalNode => {
            // console.log("Goal node: ", goalNode.id);
            const pathFinding = this.createPathFindingForNode(goalNode);
            // console.log("path: ", pathFinding);
            const nextGame = deserializeGame(serializeGame(this));
            nextGame.taskId = undefined;
            pathFinding.movements.forEach(movement => {
                nextGame.handleInput(movement);
            })
            nextGame.handleInput("activate");
            return nextGame.solve();
        });
        games.sort((a, b) => a.actionsUsed - b.actionsUsed);
        return games[0];
    }

    getActiveGoalNodes = () => {
        return this.board.filter(node => node.id !== undefined && !node.isActivated);
    }
}

const serializeGame = (game) => JSON.stringify(game);

const deserializeGame = (gameText) => {
    const game = new Game();
    var parsed = JSON.parse(gameText);
    Object.assign(game, parsed);
    return game;
}

/**
 * @param {number} column
 * @param {number} row
 * @param {Direction} direction
 * @returns {[number, number]} [column, row]
 */
const getNextCoordinate = (column, row, direction) => {
    switch (direction) {
        case 'up':
            return [column, row - 1];
        case 'down':
            return [column, row + 1];
        case 'left':
            return [column - 1, row];
        case 'right':
            return [column + 1, row];
    }
}

/**
 * @param {Direction} direction
 * @returns {Direction} opposite direction
 */
const getOppositeDirection = (direction) => {
    switch (direction) {
        case 'up':
            return 'down';
        case 'down':
            return 'up';
        case 'left':
            return 'right';
        case 'right':
            return 'left';
    }
}