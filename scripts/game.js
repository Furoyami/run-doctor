class Game {
    constructor() {

    }
}

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ------------------------ Initialisations ------------------------

let lstSprites = [];
let lstEnemies = [];

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

// ------------------------ Gestion des images ------------------------

let imageLoader = new ImageLoader();

let spritePlayer;
let spriteEnemy;

// debug

let debug = false;

// Chargement son et musique

let sndKey = new Sound("sounds/key.wav", 0.35);

// ------------------------ FONCTIONS UTILITAIRES ------------------------

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// ------------------------ GESTION DES TOUCHES CLAVIER ------------------------

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

    imageLoader.start(startGame);
}

function startGame() {
    if (debug) console.log("StartGame");

    myGrid.InitGrid();
    myMap.InitMap();


    // ----- creation joueur -----
    player.CreatePlayer();
    lstSprites.push(spritePlayer);


    // ----- creation ennemis -----
    // boucle de création des ennemis
    let nbEnemies = myMap.getNbEnemiesInLevel();
    // ----- REMETTRE LA BOUCLE AVEC LE BON PARAM APRES DEBUG !!!! -----
    for (let i = 0; i < nbEnemies; i++) {
        let enemyPos = myMap.getEnemiesStartPos()[i];

        let enemy = new Enemy(enemyPos.line, enemyPos.col, player.getPlayerPos()[1], player.getPlayerPos()[0], myMap);
        lstEnemies.push(enemy);
        lstSprites.push(enemy.spriteEnemy);
        if (debug) console.log("----- Ennemi ajouté à la liste des ennemis -----");
    }

    gameReady = true;
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

    lstEnemies.forEach(enemy => {
        enemy.Update(dt, player.getPlayerPos()[1], player.getPlayerPos()[0],);
    });
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
    myGrid.DrawGrid(pCtx);
    myMap.Draw(pCtx);

    lstSprites.forEach(sprite => {
        sprite.draw(pCtx);
    });
}