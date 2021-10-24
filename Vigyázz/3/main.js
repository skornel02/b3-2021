/////////////////////////////////////////////////////////////////////////////////
// flags
/////////////////////////////////////////////////////////////////////////////////

const BOX_WIDTH = 100;
const BOX_HEIGHT = 35;
const BOUNDING_WIDTH = 120;
const BOUNDING_HEIGHT = 60;

const RENDER_BOUNDING_BOXES = false;

/////////////////////////////////////////////////////////////////////////////////
// backend
/////////////////////////////////////////////////////////////////////////////////

const colors = ["black", "green", "blue"]

/**
 * @typedef {object} Code
 * @property {number} x
 * @property {number} y
 * @property {string} label
 * @property {string} color
 * @property {number} timeLeft
 * @property {boolean} worthy
 */

class Game {

    /**
     * @type {number}
     */
    canvasWidth;

    /**
     * @type {number}
     */
    canvasHeight;

    /**
     * @type {boolean}
     */
    finished = false;

    /**
     * Total time to run in ms
     * @type {number} 
     */
    totalTime;

    /**
     * Time left in ms
     * @type {number}
     */
    timeLeft;

    /**
     * @type {number}
     */
    difficulty;

    /**
     * Ticker id
     * @type {number | undefined}
     */
    intId;

    /**
     * Next element id
     * @type {number | undefined}
     */
    nextId;

    /**
     * @type {Code[]}
     */
    activeCodes = [];

    /**
     * @type {number}
     */
    totalCorrectCodes = 0;

    /**
     * @type {number}
     */
    correctCodesFound = 0;

    /**
     * @type {number}
     */
    incorrectCodesFound = 0;    

    /**
     * @param {number?} width canvas dimension
     * @param {number?} height canvas dimension
     * @param {number?} initialTime in seconds, >= 1
     * @param {number?} difficulty amount of colors, <= 3 && >= 1
     */
    constructor(width = 600, height = 600, initialTime = 30, difficulty = 1) {
        this.canvasHeight = height;
        this.canvasWidth = width;
        this.totalTime = this.timeLeft = Math.max(1, initialTime) * 1000;
        this.difficulty = Math.max(1, Math.min(3, difficulty));

        this.intId = setInterval(this.handleTick, 100);
        setTimeout(() => {
            this.addNewElementToGame();
        }, 300);
        console.log(this);
    }

    get difficultyTime() {
        return (3 / this.difficulty);
    }

    /**
     * @type {number} Time to next in ms
     */
    get defaultNextTime() {
        return this.difficultyTime * 1000;
    }

    get clickTime() {
        return 2000 + (750 * this.difficultyTime)
    }

    get canvasSafeHeight() {
        return this.canvasHeight - BOUNDING_HEIGHT;
    }

    get canvasSafeWidth() {
        return this.canvasWidth - BOUNDING_WIDTH;
    }

    /**
     * @returns {number | undefined} returns undefined if none.
     */
    getNextTime = () => {
        const def = this.defaultNextTime;
        const randomizer = 1.2 - (Math.random() / 4);
        const nextTime = def * randomizer;
        if (nextTime >= this.timeLeft + this.clickTime) {
            return undefined;
        }
        return nextTime;
    }

    /**
     * Ticks 10 times every second
     * @returns {void}
     */
    handleTick = () => {
        // console.log(`Tick! Time: ${this.timeLeft / 1000}/${this.totalTime / 1000}`)
        if (this.timeLeft <= 0) {
            this.stopGame();
            return;
        }
        this.timeLeft -= 100;

        this.tickNextCode();
        this.tickActiveCodes();
        this.render();
    }

    tickNextCode = () => {
        if (this.nextId === undefined) {
            const nextTime = this.getNextTime();
            if (nextTime !== undefined) {
                this.nextId = setTimeout(() => {
                    this.nextId = undefined;
                    this.addNewElementToGame();
                }, nextTime)
            }
        }
    }

    tickActiveCodes = () => {
        this.activeCodes.forEach(code => {
            code.timeLeft -= 100;
        })
        this.activeCodes = this.activeCodes.filter(code => code.timeLeft > 0);
    }

    stopGame = () => {
        console.log(`Stopping game! correct: ${this.correctCodesFound}/${this.totalCorrectCodes} wrong: ${this.incorrectCodesFound}`);
        this.finished = true;
        if (this.intId !== undefined) clearInterval(this.intId);
        if (this.nextId !== undefined) clearTimeout(this.nextId);
    }

    addNewElementToGame = () => {
        let x;
        let y;
        let failSafe = 0;
        while (x === undefined || y === undefined) {
            x = this.canvasSafeWidth * Math.random();
            y = this.canvasSafeHeight * Math.random();

            const collision = this.activeCodes.some(code => {
                const existingSafeX = code.x - ((BOUNDING_WIDTH - BOX_WIDTH) / 2);
                const existingSafeY = code.y - ((BOUNDING_HEIGHT - BOX_HEIGHT) / 2);
                const xCollision = (existingSafeX <= x && x <= (existingSafeX + BOUNDING_WIDTH))
                    || (x <= existingSafeX && existingSafeX <= (x + BOUNDING_WIDTH));
                const yCollision = (existingSafeY <= y && y <= (existingSafeY + BOUNDING_HEIGHT))
                    || (y <= existingSafeY && existingSafeY <= (y + BOUNDING_HEIGHT));
                return xCollision && yCollision;
            });
            if (collision) {
                x = undefined;
                y = undefined;
                failSafe += 1;

                if (failSafe > 200) {
                    console.groupEnd();
                    return;
                } else {
                    continue;
                }
            }
        }
        console.groupEnd();

        const worthy = Math.round(Math.random()) === 1;

        if (worthy) {
            ++this.totalCorrectCodes;
        }

        let color = colors[Math.round(Math.random() * 2)];
        let label = (Math.round(Math.random() * 255).toString(2).padStart(8, "0"));

        /**
         * @type {Code}
         */
        const elem = {
            timeLeft: this.clickTime,
            label, color,
            x, y,
            worthy,
        }
        this.activeCodes.push(elem);
        console.log("Adding new element!");
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {Code | undefined}
     */
    getElementAtPosition = (x, y) => {
        return this.activeCodes.filter(code => {
            const xCollision = (code.x <= x && x <= (code.x + BOX_WIDTH))
                || (x <= code.x && code.x <= (x + BOX_WIDTH));
            const yCollision = (code.y <= y && y <= (code.y + BOX_HEIGHT))
                || (y <= code.y && code.y <= (y + BOX_HEIGHT));
            return xCollision && yCollision;
        })[0];
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    handleClick = (x, y) => {
        if (this.finished) return;

        const element = this.getElementAtPosition(x, y);
        if (element === undefined) return;
        if (element.worthy) {
            ++this.correctCodesFound;
        } else {
            ++this.incorrectCodesFound;
        }
        this.activeCodes = this.activeCodes.filter(match => match !== element);
    }

    render = () => {
        const progressBar = document.querySelector("#timeRemaining");
        progressBar.max = this.totalTime;
        progressBar.value = this.timeLeft;

        /**
         * @type {HTMLCanvasElement}
         */
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.activeCodes.forEach(code => {
            if (RENDER_BOUNDING_BOXES || code.worthy) {
                const boundingX = code.x - ((BOUNDING_WIDTH - BOX_WIDTH) / 2);
                const boundingY = code.y - ((BOUNDING_HEIGHT - BOX_HEIGHT) / 2);
                ctx.fillStyle = "orange";
                ctx.fillRect(boundingX, boundingY, BOUNDING_WIDTH, BOUNDING_HEIGHT);
            }
            ctx.fillStyle = code.color;
            ctx.fillRect(code.x, code.y, BOX_WIDTH, BOX_HEIGHT);
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = "white";
            ctx.font = "20px monospace";
            ctx.fillText(code.label, code.x + (BOX_WIDTH / 2), code.y + (BOX_HEIGHT / 2))
        })
    }
}



/////////////////////////////////////////////////////////////////////////////////
// frontend
/////////////////////////////////////////////////////////////////////////////////

/**
 * @type {Game | undefined}
 */
let game = undefined;

/**
  * @type {HTMLCanvasElement}
  */
const canvas = document.querySelector("#canvas");
const canvasTop = canvas.offsetTop;
const canvasLeft = canvas.offsetLeft;
canvas.addEventListener('click', e => {
    const x = e.x - canvasLeft;
    const y = e.y - canvasTop;
    console.log(`click (${x};${y})`);
    if (game !== undefined) {
        game.handleClick(x, y);
    }
});

game = new Game(600, 600, 30, 2);