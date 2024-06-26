let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let interval;

let lastUpdate = Date.now();

function run() {
    let now = Date.now();
    let dt = (now - lastUpdate) / 1000;     //on divise par 1000 car on a un temps en millisecondes
    lastUpdate = now;
    update(dt);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
    draw(ctx);
}

function init() {
    console.log("Init");
    load();
    interval = setInterval(run, 1000 / 60); // remplace le delta time
}

init();