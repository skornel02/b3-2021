/////////////////////////////////////////////////////////////////////////////////
// flags
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// backend
/////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {object} Cell
 * This is a cell of the game.
 * @property {boolean} sensor
 * @property {boolean} player
 * @property {number} column alt. x
 * @property {number} row alt. y
 * @property {boolean} reachable If reachable without tripping
 * @property {number} visitAmount 
 */

/**
 * @typedef {'up' | 'down' | 'left' | 'right'} Direction
 */

/**
 * @type {Move[]} contains all legal moves
 */
const directions = ['down', 'right', 'up', 'left'];

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
     * @param {number?} columnsAmount min(3)
     * @param {number?} rowsAmount min(3)
     */
    constructor(columnsAmount = 12, rowsAmount = 12, difficulty = 20) {
        columnsAmount = Math.max(columnsAmount, 3);
        rowsAmount = Math.max(rowsAmount, 3);

        this.columns = columnsAmount;
        this.rows = rowsAmount;

        // Generate map

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
                    player: false,
                    sensor: false,
                    visitAmount: 0
                }
                if (columnI === 0 && rowI === 0) {
                    item.player = true;
                    item.visitAmount = 1;
                }
                column.push(item);
            }
            map.push(column);
        }
        this.map = map;

        // Generate walls
        {
            const totalCells = rowsAmount * columnsAmount;
            let wallAmount = Math.max(totalCells / difficulty, 1);
            console.debug("walls amount:", wallAmount);

            while (wallAmount > 0) {
                const randomX = Math.floor(Math.random() * columnsAmount);
                const randomY = Math.floor(Math.random() * rowsAmount);
                const cell = this.getCell(randomX, randomY);
                if (cell.sensor) continue;
                if (isSafeZone(columnsAmount, rowsAmount, randomX, randomY)) continue;
                cell.sensor = true;

                this.updateReachable();

                if (this.map.some(row => row.some(cell => !cell.sensor && !cell.reachable))) {
                    cell.sensor = false;
                    continue;
                }

                wallAmount--;
            }
        }

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
     * @returns {Direction}
     */
    getNextCellDirection() {
        const player = this.getPlayer();
        const nextData = directions.flatMap(direction => {
            const [nextColumn, nextRow] = getNextCoordinate(player.column, player.row, direction);
            const cell = this.getCell(nextColumn, nextRow);
            if (cell === undefined || cell.sensor) {
                return [];
            } else {
                return [{ cell, direction }];
            }
        }).sort((a, b) => a.cell.visitAmount - b.cell.visitAmount)[0];
        return nextData.direction;
    }

    updateReachable() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const cell = this.getCell(x, y);
                cell.reachable = false;
            }
        }
        const { column: playerX, row: playerY } = this.getPlayer();
        this.updateReachableReal(playerX, playerY);
    }

    updateReachableReal(column, row) {
        const cell = this.getCell(column, row);
        if (cell.sensor) return;
        if (cell.reachable) return;
        cell.reachable = true;
        directions.forEach(direction => {
            const [nextX, nextY] = getNextCoordinate(cell.column, cell.row, direction);
            const nextCell = this.getCell(nextX, nextY);
            if (nextCell === undefined) return;
            this.updateReachableReal(nextCell.column, nextCell.row);
        })
    }

    /**
     * @param {Direction} direction
     * @returns {boolean} success
     */
    movePlayer(direction) {
        if (this.finished) throw "Játék már véget ért!";

        const { column: playerX, row: playerY } = this.getPlayer();
        const [nextX, nextY] = getNextCoordinate(playerX, playerY, direction);
        //console.log(`(${playerX};${playerY}) -${direction}-> (${nextX};${nextY})`)
        const nextCell = this.getCell(nextX, nextY);
        if (nextCell === undefined) return false;
        this.totalSteps += 1;
        this.getCell(playerX, playerY).player = false;
        this.getCell(nextX, nextY).player = true;
        ++this.getCell(nextX, nextY).visitAmount;

        return true;
    }

    printGame() {
        console.group();
        console.log("Játék jelenlegi állapota - ", this.finished ? "vége" : "fut", " - összlépések: ", this.totalSteps);
        const { column: playerX, row: playerY } = this.getPlayer();
        console.log(`Játékos poziciója: (${playerX};${playerY})`);
        console.log("%cv".padEnd(this.columns + 3, '—') + "v", "font-family:monospace");
        for (let y = 0; y < this.rows; y++) {
            let line = "%c|";
            for (let x = 0; x < this.columns; x++) {
                const cell = this.getCell(x, y);
                if (cell.player) {
                    line += "C";
                } else if (cell.sensor) {
                    line += "W";
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

    render() {
        const main = document.querySelector("#main");
        const table = document.createElement("table");
        for (let y = 0; y < this.rows; y++) {
            const row = document.createElement("tr");
            for (let x = 0; x < this.columns; x++) {
                const tableCell = document.createElement("td");
                const cell = this.getCell(x, y);
                if (cell.player) {
                    tableCell.className = "player";
                } else if (cell.sensor) {
                    tableCell.className = "wall";
                } else {
                    tableCell.innerText = cell.visitAmount;
                }
                row.appendChild(tableCell);
            }
            table.appendChild(row);
        }
        main.innerHTML = "";
        main.appendChild(table);
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
 * Returns whether a position is considered a safe place. 
 * @param {number} columns unused
 * @param {number} rows unused
 * @param {number} column 
 * @param {number} row 
 * @returns {boolean}
 */
const isSafeZone = (columns, rows, column, row) => {
    if (column < 3 && row < 3) return true;
    return false;
}

/////////////////////////////////////////////////////////////////////////////////
// frontend
/////////////////////////////////////////////////////////////////////////////////

/**
 * @type {Game | undefined}
 */
let game = undefined;

game = new Game(10, 10, 4);
game.printGame();
game.render();

const tick = () => {
    if (game === undefined) return;
    const nextStep = game.getNextCellDirection();
    game.movePlayer(nextStep);
    game.render();
    
    let nextTick = parseInt(document.querySelector("#speed").value);
    if (isNaN(nextTick)) nextTick = 100;

    setTimeout(tick, nextTick * 10)
}

tick();