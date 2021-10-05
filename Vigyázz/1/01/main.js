let currentImage = 0;

const nextImage = () => {
    const images = document.querySelector("#images");
    images.children.item(currentImage).hidden = true;
    images.children.item(currentImage + 1 === 3 ? 0 : currentImage + 1).hidden = false;
    if (currentImage + 1 === 3) {
        currentImage = 0;
        return;
    }
    currentImage++;
};

const prevImage = () => {
    const images = document.querySelector("#images");
    images.children.item(currentImage).hidden = true;
    images.children.item(currentImage - 1 === -1 ? 2 : currentImage - 1).hidden = false;
    if (currentImage - 1 === -1) {
        currentImage = 2;
        return;
    }
    currentImage--;
};

const toggleText = toggleFor => {
    switch (toggleFor) {
        case "k":
            document.getElementById("kornel_desc").hidden = !document.getElementById("kornel_desc").hidden;
            break;
        case "g":
            document.getElementById("gergo_desc").hidden = !document.getElementById("gergo_desc").hidden;
            break;
        case "a":
            document.getElementById("avar_desc").hidden = !document.getElementById("avar_desc").hidden;
            break;
    }
};

setInterval(() => {
    const time = new Date();
    const span = document.getElementById("time");
    span.innerText = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}`;
}, 1000)
