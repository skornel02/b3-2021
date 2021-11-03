const table = document.getElementById("game");
let lastClicked = 0;
let time = 0;
let interval;

const resetGame = () => {
    table.innerHTML = "";
    for (let y = 0; y < 10; y++){
        const tableRow = document.createElement("tr");
        for (let x = 0; x < 10; x++){
            const tableCol = document.createElement("td");
            tableCol.id = x + "/" + y;
            tableCol.innerText = "";
            tableRow.appendChild(tableCol);
        }
        table.appendChild(tableRow);
    }

    clearInterval(interval);
    time = 0;
    lastClicked = 0;
}



const clicked = event => {
    console.log(lastClicked);
    if (Number(event.target.innerText) === (lastClicked + 1)){
        lastClicked++;
        event.target.classList.add("success");
        if (lastClicked === 7) {
            setTimeout(() => {
                alert(`Gratulálunk sikerült hiba nélkül megcsinálni a feladatot. ${time} másodpercbe telt.`);
            }, 100)
            clearInterval(interval);
            time = 0;
            lastClicked = 0;
        }
    }else{
        event.target.classList.add("fail");
        for(let element of document.querySelectorAll(".selected")) {
            element.removeEventListener("click", clicked);
        }
        clearInterval(interval);
        time = 0;
        lastClicked = 0;
        setTimeout(() => {
            alert("A feladatot nem sikerült teljesíteni. Próbálja újra!")
        }, 100)
    }
};

const start = () => {
    resetGame();
    interval = setInterval(()=>{time++}, 1000);

    for (let i = 0; i < 7; i++){
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        if (document.getElementById(x + "/" + y).innerText === ""){
            const selected = document.getElementById(x + "/" + y);
            selected.innerText=(i + 1).toString();
            selected.classList.add("selected");
            selected.addEventListener("click", clicked)
        }
        else
            i--;
    }
};

document.getElementById("start").addEventListener("click", start);

resetGame();