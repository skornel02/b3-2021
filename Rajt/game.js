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
     * @type {GameNode[]}
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

    constructor(columns, rows, board, playerX, playerY) {
        this.columns = columns;
        this.rows = rows;
        this.board = board;
        this.playerX = playerX;
        this.playerY = playerY;
    }

    /**
     * @param {number} x 
     * @param {number} y
     * @returns {GameNode} 
     */
    getNode = (x, y) => {
        return this.board.filter(node => node.column = x && node.row == y)[0];
    }

    /**
     * 
     * @param {Action} action 
     */
    handleAction = (action) => {
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
        } else if (node.isDecodeHelp) {
            this.decodeHelp++;
        } else if (node.isSneakHelp) {
            this.sneakHelp++;
        }
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
                if (this.playerX == this.rows - 1) throw "Can't move down";
                this.playerY++;
                break;
        }
        const node = this.getNode(this.playerX, this.playerY);
        node.isPlayer = true;
        let actionPoints = Math.max(1, (node.isFirewall ? 5 : 1) - (this.sneakHelp * 2));
        this.actionsUsed += actionPoints;
    }
}

const serializeGame = (game) => JSON.stringify(game);

const deserializeGame = (gameText) => {
    const game = new Game();
    var parsed = JSON.parse(gameText);
    Object.assign(game, parsed);
    return game;
}