const table = document.querySelector("table");
const input = document.querySelector("textarea");

let height, width;

const draw = () => {
    const lines = input.value.split('\n');
    height = lines[0].split(' ')[0];
    width = lines[0].split(' ')[1];

    generateTable();

    let x = 0;
    let y = 0;
    lines.slice(1).forEach(line => {
        const helper = line.split(" ");
        helper.forEach(char => {
            if (char === "0")
                document.getElementById(`${x}/${y}`).className = "white";
            else if (char === "1")
                document.getElementById(`${x}/${y}`).className = "black";
            x++;
        })
        y++;
        x = 0;
    })
}

const generateTable = () => {
    table.innerHTML = "";
    for (let y = 0; y < width; y++) {
        const tableRow = document.createElement("tr");
        for (let x = 0; x < height; x++) {
            const tableCol = document.createElement("td");
            tableCol.id = x + "/" + y;
            tableRow.appendChild(tableCol);
        }
        table.appendChild(tableRow);
    }
}