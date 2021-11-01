/////////////////////////////////////////////////////////////////////////////////
// flags
/////////////////////////////////////////////////////////////////////////////////

const BOX_WIDTH = 100;
const BOX_HEIGHT = 35;
const BOUNDING_WIDTH = 120;
const BOUNDING_HEIGHT = 60;

const RENDER_BOUNDING_BOXES = false;

const FREEZE_LENGTH = 5000;
const BONUS_TIME_STREAK = 1500;
const STREAK_BONUS = 10;
const STREAK_PENALTY = 40;

/////////////////////////////////////////////////////////////////////////////////
// backend, requires canvas with id: canvas
/////////////////////////////////////////////////////////////////////////////////

/**
  * @type {HTMLCanvasElement}
  */
const canvas = document.querySelector("#canvas");

const colors = ["blue", "black", "green"]

/**
 * @typedef {object} Code
 * @property {number} x
 * @property {number} y
 * @property {string} label
 * @property {string} color
 * @property {number} timeLeft
 * @property {boolean} worthy
 * @property {boolean} showWorthy
 */

/**
 * @param {number} difficulty
 * @returns {[string, string]} label and color
 */
const generateCode = (difficulty) => {
    const label = (Math.round(Math.random() * 255).toString(2).padStart(8, "0"));
    const color = colors[Math.floor(Math.random() * (difficulty))];
    return [label, color];
}

/**
 * Determines whether the code is correct or not.
 * @param {string} label 
 * @param {string} color
 * @returns {boolean}
 */
const isCodeWorthy = (label, color) => {
    const value = parseInt(label, 2);
    switch (color) {
        case "blue":
            return value % 2 === 0;
        case "green":
            return value - 1 === value >> 1 << 1;
        case "black":
            return value >= 16;
        default:
            return false;
    }
}

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
     * @type {number}
     */
    bonusPoints = 0;

    /**
     * @type {boolean}
     */
    freezeUsed = false;

    /**
     * @type {number}
     */
    freezeTicksLeft = 0;

    /**
     * @type {boolean}
     */
    streakUsed = false;

    /**
     * @type {boolean}
     */
    streakActive = false;

    /**
     * @type {number}
     */
    streakCount = 0;

    /**
     * @type {boolean}
     */
    cheatUsed = false;

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
        this.difficulty = Math.max(1, Math.min(3, Math.round(difficulty)));

        this.intId = setInterval(this.handleTick, 100);
        setTimeout(() => {
            this.addNewElementToGame();
        }, 300);
        console.log(this);

        canvas.addEventListener('click', this.handleClick);
        document.querySelector("#freeze").disabled = false;
        document.querySelector("#streak").disabled = false;
        document.querySelector("#cheat").disabled = false;
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
        if (this.freezeTicksLeft >= 0) {
            this.freezeTicksLeft -= 100;
        } else {
            this.timeLeft -= 100;

            this.tickNextCode();
            this.tickActiveCodes();
        }
        requestAnimationFrame(this.render);
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
        canvas.removeEventListener('click', this.handleClick);
        requestAnimationFrame(this.finalRender);
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

        let label, color;
        do {
            [label, color] = generateCode(this.difficulty)
        } while (isCodeWorthy(label, color) !== worthy);

        /**
         * @type {Code}
         */
        const elem = {
            timeLeft: this.clickTime,
            label, color,
            x, y,
            worthy,
            showWorthy: false,
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
     * @param {MouseEvent} e
     */
    handleClick = (e) => {
        const x = e.pageX - canvas.offsetLeft - canvas.clientLeft;
        const y = e.pageY - canvas.offsetTop - canvas.clientTop;
        console.log(`click (${x};${y})`);

        if (this.finished) return;

        const element = this.getElementAtPosition(x, y);
        if (element === undefined) return;
        if (element.worthy) {
            ++this.correctCodesFound;
            if (this.streakActive) {
                this.totalTime += BONUS_TIME_STREAK;
                this.timeLeft += BONUS_TIME_STREAK;
                this.bonusPoints += STREAK_BONUS * ++this.streakCount;
            }
        } else {
            ++this.incorrectCodesFound;
            if (this.streakActive) {
                this.streakActive = false;
                this.bonusPoints -= STREAK_PENALTY;
            }
        }
        this.activeCodes = this.activeCodes.filter(match => match !== element);
    }

    render = () => {
        /**
         * @type {HTMLCanvasElement}
         */
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");

        // Background

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Time remaining

        ctx.fillStyle = this.streakActive ? "pink" : "lightgreen";
        ctx.strokeStyle = "black"
        const timePercentage = this.timeLeft / this.totalTime;
        ctx.fillRect(0, 0, timePercentage * this.canvasWidth, 10);

        if (this.freezeTicksLeft >= 0) {
            const freePercentage = this.freezeTicksLeft / FREEZE_LENGTH;
            ctx.fillStyle = "lightblue";
            ctx.fillRect(0, 0, timePercentage * this.canvasWidth * freePercentage, 10);
        }

        ctx.strokeRect(0, 0, timePercentage * this.canvasWidth, 10);

        // Boxes
        this.activeCodes.forEach(code => {
            if (RENDER_BOUNDING_BOXES) {
                const boundingX = code.x - ((BOUNDING_WIDTH - BOX_WIDTH) / 2);
                const boundingY = code.y - ((BOUNDING_HEIGHT - BOX_HEIGHT) / 2);
                ctx.fillStyle = "orange";
                ctx.fillRect(boundingX, boundingY, BOUNDING_WIDTH, BOUNDING_HEIGHT);
            }
            ctx.fillStyle = code.showWorthy && code.worthy ? "gold" : code.color;
            ctx.fillRect(code.x, code.y, BOX_WIDTH, BOX_HEIGHT);
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = "white";
            ctx.font = "20px monospace";
            ctx.fillText(code.label, code.x + (BOX_WIDTH / 2), code.y + (BOX_HEIGHT / 2))
        })
    }

    finalRender = () => {
        /**
         * @type {HTMLCanvasElement}
         */
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        let points = 200;
        if (this.totalCorrectCodes !== 0)
            points = (this.correctCodesFound / this.totalCorrectCodes * 200) - (this.incorrectCodesFound * 40) + this.bonusPoints;

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "black";
        ctx.font = "20px monospace";
        ctx.fillText(`Megszerzett pontok: ${points.toFixed(0)}`, this.canvasWidth / 2, this.canvasHeight / 2)
    }

    freeze = () => {
        if (this.freezeUsed) return;
        document.querySelector("#freeze").disabled = true;
        this.freezeUsed = true;
        this.freezeTicksLeft += FREEZE_LENGTH;
    }

    streak = () => {
        if (this.streakUsed) return;
        document.querySelector("#streak").disabled = true;
        this.streakUsed = true;
        this.streakActive = true;
    }

    cheat = () => {
        if (this.cheatUsed) return;
        document.querySelector("#cheat").disabled = true;
        this.activeCodes.forEach(code => code.showWorthy = true);
    }
}



/////////////////////////////////////////////////////////////////////////////////
// frontend
/////////////////////////////////////////////////////////////////////////////////

/**
 * @type {Game | undefined}
 */
let game = undefined;

const easyRadio = document.querySelector("#easy");
const normalRadio = document.querySelector("#normal");
const hardRadio = document.querySelector("#hard");
const radios = [easyRadio, normalRadio, hardRadio];

const newGameButton = document.querySelector("#newGame");
const buttons = [newGameButton];

const main = document.querySelector("main");

const changeDifficulty = (difficulty) => {
    let gameTime;
    switch (difficulty){
        case "easy": {
            gameTime = 30;
            game = new Game(600, 400, gameTime, 1);
            break;
        }
        case "normal": {
            gameTime = 20;
            game = new Game(600, 400, gameTime, 2);
            break;
        }
        case "hard": {
            gameTime = 15;
            game = new Game(600, 400, gameTime, 3);
            break;
        }
    }

    radios.forEach(radio => radio.disabled = true);
    buttons.forEach(button => button.disabled = false);
    main.style.display = "flex";
}

const newGame = () => {
    radios.forEach(radio => radio.disabled = false);
    radios.forEach(radio => radio.checked = false);
    buttons.forEach(button => button.disabled = true);
    
    if (game.finished){
        game = undefined;
        return;
    }
    game.stopGame();
    game = undefined;
    main.style.display = "none";
}

const activateFreeze = () => {
    if (game !== undefined) {
        game.freeze();
    }
}

const activateStreak = () => {
    if (game !== undefined) {
        game.streak();
    }
}

const activateCheat = () => {
    if (game !== undefined) {
        game.cheat();
    }
}