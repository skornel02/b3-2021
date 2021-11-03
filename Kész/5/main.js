const bomb = document.querySelector("table");
const colors = ["green", "yellow", "red", "blue", "black"];
let solution = [];
let cutCount = 0;
let difficulty = 8;

const generate = () => {
    bomb.innerHTML = "";
    const tableRow = document.createElement("tr");
    for (let x = 0; x < difficulty; x++) {
        const tableCol = document.createElement("td");
        tableCol.className = pickRandomColor();
        tableCol.id = x;
        tableCol.addEventListener("click", cut)
        tableRow.appendChild(tableCol);
    }
    bomb.appendChild(tableRow);

    calculateSolution();
}

const cut = (event) => {
    if (event.target.id !== solution[cutCount]) {
        alert("A bomba felrobbant!");
        bomb.innerHTML = "";
        return;
    }
    event.target.className = "grey";
    event.target.removeEventListener("click", cut);
    cutCount++;
    if (cutCount >= difficulty) {
        setTimeout(() => {
            alert("Hatástalanítva! Ügyes!");
        })
    }
}

const pickRandomColor = () => {
    return colors[Math.floor(Math.random()*colors.length)]
}

const calculateSolution = () => {
    solution = [];
    colors.forEach(color => {
        const cables = Array.from(document.querySelectorAll(`.${color}`));
        if (!cables) return;
        cables.sort((a, b) => a.id - b.id);
        cables.forEach(cable => {
            solution.push(cable.id);
        });
    });

    console.log(solution);
}

const changeDifficulty = () => {
    const newDiff = document.querySelector("#difficulty");
    difficulty = Number(newDiff.value);
    bomb.innerHTML = "";
}