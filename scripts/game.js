class Game {
    constructor() {

    }
}

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ------------------------ Initialisations ------------------------


let k_right = false;
let k_left = false;
let k_up = false;
let k_down = false;
// b, v controles pour les trous droite / gauche
let k_b = false;
let k_v = false;

let gameReady = false;
let myGrid = new Grid();
let myMap = new Map();
let player = new Player();
let hole = new Hole();
let enemy = new Enemy();

let pathfinder = new Pathfinder();

// ------------------------ Gestion des images ------------------------

let imageLoader = new ImageLoader();

let lstSprites = [];
let lstEnemies = [];
let lstHoles = [];
let spritePlayer;
let spriteEnemy;
let spriteHole;

// Chargement son et musique

let sndKey = new Sound("sounds/key.wav", 0.35);

// ------------------------ FONCTIONS UTILITAIRES ------------------------

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// ------------------------ GESTION DES TOUCHES CLAVIER ------------------------

// --------------------- gère l'appui des touches clavier ---------------------

function enableUpKey() {
    k_up = true;
    k_right = false;
    k_down = false;
    k_left = false;
}

function enableRightKey() {
    k_up = false;
    k_right = true;
    k_down = false;
    k_left = false;
}
function enableDownKey() {
    k_up = false;
    k_right = false;
    k_down = true;
    k_left = false;
}
function enableLeftKey() {
    k_up = false;
    k_right = false;
    k_down = false;
    k_left = true;
}

function keyDown(e) {
    if (e.code === 116) {
        // Si c'est F5, laisse le comportement par défaut
        return;
    }
    e.preventDefault();

    switch (e.code) {
        case CONST.ARROWUP:
        case CONST.KEYW:
            enableUpKey();
            break;

        case CONST.ARROWRIGHT:
        case CONST.KEYD:
            enableRightKey();

            break;

        case CONST.ARROWDOWN:
        case CONST.KEYS:
            enableDownKey();
            break;

        case CONST.ARROWLEFT:
        case CONST.KEYA:
            enableLeftKey();
            break;

        // !!! a modifier pour répondre aux conditions de win / lose
        case CONST.KEYR:
            if (e.code === CONST.KEYR) {
                restartGame();
            }
            break;

        default:
            k_up = false;
            k_right = false;
            k_down = false;
            k_left = false;
            break;
    }
}

function keyUp(e) {
    e.preventDefault();

    switch (e.code) {
        case CONST.ARROWUP:
        case CONST.KEYW:
            k_up = false;
            break;

        case CONST.ARROWRIGHT:
        case CONST.KEYD:
            k_right = false;
            spritePlayer.startAnimation("IDLE_RIGHT");
            break;

        case CONST.ARROWDOWN:
        case CONST.KEYS:
            k_down = false;
            break;

        case CONST.ARROWLEFT:
        case CONST.KEYA:
            k_left = false;
            spritePlayer.startAnimation("IDLE_LEFT");
            break;

        default:
            break;
    }

}

// ------------------------ GAMELOOP ------------------------

function load() {
    //récupération des évènements claviers
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);

    // chargement images
    imageLoader.add("images/doctor_tile.png");
    imageLoader.add("images/hole_tile.png");
    imageLoader.add("images/dalek_tile.png");

    // réinit des listes 
    lstSprites = [];
    lstEnemies = [];
    lstHoles = [];

    imageLoader.start(startGame);
}

function startGame() {
    console.log("StartGame");

    gameReady = true;
    lstSprites = [];
    myGrid.InitGrid();
    myMap.InitMap();
    player.CreatePlayer();

    enemy.CreateEnemy(10, 10);

    lstSprites.push(spritePlayer);

    pathfinder.init(myGrid, player.getPlayerPos(), enemy.getEnemyPos());
}

function update(dt) {
    if (!gameReady) {
        return;
    }
    // si le jeu est prêt
    lstSprites.forEach(sprite => {
        sprite.update(dt);
    });
    player.Update(dt);
    enemy.Update(dt);
    hole.Update(dt);

    pathfinder.findPath();
}

function draw(pCtx) {
    if (!gameReady) {
        // barre de prog si le chargement n'est pas fini
        let ratio = imageLoader.getLoadedRatio();
        pCtx.fillStyle = "rgb(255,255,255)";
        pCtx.fillRect(WIDTH / 2, HEIGHT / 2, 400, 50);
        pCtx.fillStyle = "rgb(0,255,255)";
        pCtx.fillRect(1, 1, 400 * ratio, 100);
        return;
    }
    // si le jeu est prêt
    //myGrid.DrawGrid(pCtx);
    myMap.Draw(pCtx);
    enemy.Draw(pCtx);
    hole.Draw(pCtx);
    lstSprites.forEach(sprite => {
        sprite.draw(pCtx);
    });

}
