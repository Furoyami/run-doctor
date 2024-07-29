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

    // init des listes 
    globalThis.lstSprites = [];
    globalThis.lstEnemies = [];

    imageLoader.start(startGame);
}

function startGame() {
    if (debug) console.log("StartGame");

    gameReady = true;
    myGrid.InitGrid();
    myMap.InitMap();
    player.CreatePlayer();

    let nbEnemies = myMap.getNbEnemiesInLevel();

    // boucle de creation des ennemis
    for (let i = 0; i < nbEnemies; i++) {
        enemy = new Enemy();
        lstEnemies.push(enemy);
        // ----- console.log(enemy); ----- <-- ce log est bizarre même si tout fonctionne, à creuser
    }

    // boucle d'ajout des sprites ennemis à la liste de sprite
    for (let i = 0; i < lstEnemies.length; i++) {
        // récupère les coordonnées de départ de l'ennemi depuis la map
        let enemyCoords = myMap.getEnemiesStartPos()[i];
        enemy.CreateEnemy(enemyCoords.y, enemyCoords.x);
        lstSprites.push(spriteEnemy);
    }

    lstSprites.push(spritePlayer);

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
        enemy.Update(dt);
        // update à rework 1 seul dalek bouge et il déconne
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
    //myGrid.DrawGrid(pCtx);
    myMap.Draw(pCtx);

    lstSprites.forEach(sprite => {
        sprite.draw(pCtx);
    });

}
