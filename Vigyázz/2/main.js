/**
 * @typedef {object} Cell
 * This is a cell of the game.
 * @property {boolean} sensor
 * @property {boolean} player
 * @property {boolean} exit
 * @property {boolean} sensorHidden if false, then sensor or sensor range is rendered.
 * @property {boolean} sensorInRange
 * @property {number} column alt. x
 * @property {number} row alt. y
 * @property {number} distanceFromPlayer Infinity when player is not placed.
 */

/**
 * @typedef {'up' | 'down' | 'left' | 'right' | 'left-up' | 'left-down' | 'right-up' | 'right-down'} Direction
 */

/**
 * @type {Move[]} contains all legal moves
 */
const directions = ['up', 'down', 'left', 'right', 'left-up', 'left-down', 'right-up', 'right-down'];

class Game {

    /**
     * @type {boolean}
     */
    finished = false;

    /**
     * @type {Cell[][]} map
     */
    map = [];

    /**
     * @type {number} columns
     */
    columns = 0;
    /**
     * @type {number} rows
     */
    rows = 0;

    /**
     * @type {number}
     */
    totalSteps = 0;

    /**
     * 
     * @param {number?} columnsAmount 
     * @param {number?} rowsAmount 
     */
    constructor(columnsAmount = 15, rowsAmount = 12) {
        this.columns = columnsAmount;
        this.rows = rowsAmount;
        /**
          * @type {Cell[][]}
          */
        const map = [];
        for (let columnI = 0; columnI < columnsAmount; columnI++) {
            /** 
             * @type {Cell[]}
             */
            const column = [];
            for (let rowI = 0; rowI < rowsAmount; rowI++) {
                /**
                 * @type {Cell}
                 */
                const item = {
                    column: columnI,
                    row: rowI,
                    distanceFromPlayer: Infinity,
                    player: false,
                    exit: false,
                    sensor: false,
                    sensorHidden: false,
                    sensorInRange: false,
                }
                if (columnI === 0 && rowI === 0) {
                    item.player = true;
                }
                if (columnI === columnsAmount - 1 && rowI === rowsAmount - 1) {
                    item.exit = true;
                }
                column.push(item);
            }
            map.push(column);
        }
        this.map = map;
        this.updatePlayerDistance();
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y
     * @returns {Cell | undefined} 
     */
    getCell(x, y) {
        if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return undefined;
        return this.map[x][y];
    }

    /**
     * @returns {Cell}
     */
    getPlayer() {
        const cell = this.map.flatMap(col => col.filter(item => item.player))[0];
        return cell;
    }

    /**
     * @returns {Cell}
     */
    getGoal() {
        const cell = this.map.flatMap(col => col.filter(item => item.exit))[0];
        return cell;
    }

    updatePlayerDistance() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const cell = this.getCell(x, y);
                cell.distanceFromPlayer = Infinity;
            }
        }
        const { column: playerX, row: playerY } = this.getPlayer();
        this.updatePlayerDistanceReal(playerX, playerY, 0);
    }

    checkGameEndCondition() {
        const goal = this.getGoal();
        if (goal.distanceFromPlayer === 0) {
            console.log("Játék véget ért, nyert!");
            this.finished = true;
        }
    }

    updatePlayerDistanceReal(column, row, distance) {
        const cell = this.getCell(column, row);
        if (cell.distanceFromPlayer > distance) {
            cell.distanceFromPlayer = distance;
            directions.forEach(direction => {
                const [nextX, nextY] = getNextCoordinate(cell.column, cell.row, direction);
                const nextCell = this.getCell(nextX, nextY);
                if (nextCell === undefined) return;
                this.updatePlayerDistanceReal(nextCell.column, nextCell.row, distance + 1);
            })
        }
    }

    /**
     * @param {Direction} direction
     * @returns {boolean} success
     */
    movePlayer(direction) {
        if (this.finished) throw "Játék már véget ért!";

        const { column: playerX, row: playerY } = this.getPlayer();
        const [nextX, nextY] = getNextCoordinate(playerX, playerY, direction);
        console.log(`(${playerX};${playerY}) -${direction}-> (${nextX};${nextY})`)
        const nextCell = this.getCell(nextX, nextY);
        if (nextCell === undefined) return false;
        this.totalSteps += 1;
        this.getCell(playerX, playerY).player = false;
        this.getCell(nextX, nextY).player = true;

        this.updatePlayerDistance();
        this.checkGameEndCondition();

        return true;
    }

    printGame() {
        console.group();
        console.log("Játék jelenlegi állapota - ", this.finished ? "vége" : "fut", " - összlépések: ", this.totalSteps);
        const { column: playerX, row: playerY } = this.getPlayer();
        const { column: goalX, row: goalY, distanceFromPlayer: goalDistance } = this.getGoal();
        console.log(`Játékos poziciója: (${playerX};${playerY}); Cél pozíciója: (${goalX};${goalY}) - ${goalDistance} távra`);
        console.log("%cv".padEnd(this.columns + 3, '—') + "v", "font-family:monospace");
        for (let y = 0; y < this.rows; y++) {
            let line = "%c|";
            for (let x = 0; x < this.columns; x++) {
                const cell = this.getCell(x, y);
                if (cell.player) {
                    line += "C";
                } else if (cell.exit) {
                    line += "E";
                } else if (cell.sensor && !cell.sensorHidden) {
                    line += "S";
                } else if (cell.sensorInRange && !cell.sensorHidden) {
                    line += "R";
                } else {
                    line += ' ';
                }
            }
            line += `| (${y})`;
            console.log(line, "font-family:monospace");
        }
        console.log("%cv".padEnd(this.columns + 3, '—') + "v", "font-family:monospace");
        console.groupEnd();
    }
}

/**
 * @type {Game | undefined}
 */
let game = undefined;

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
        case 'left-up':
            return 'right-down';
        case 'left-down':
            return 'right-up';
        case 'right-up':
            return 'left-down';
        case 'right-down':
            return 'left-up';
    }
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
        case 'left-up':
            return [column - 1, row - 1];
        case 'left-down':
            return [column - 1, row + 1];
        case 'right-up':
            return [column + 1, row - 1];
        case 'right-down':
            return [column + 1, row + 1];
    }
}

game = new Game();
game.printGame();