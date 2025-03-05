class Game {
    constructor() {

    }
}

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ------------------------ Initialisations ------------------------

let lstSprites = [];
let lstEnemies = [];

let activeKeys = new Set();

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

function keyDown(e) {
    if (e.code === CONST.KEYF5) return; // ignorer F5
    e.preventDefault();

    switch (e.code) {
        case CONST.ARROWUP:
        case CONST.KEYW:
            activeKeys.add(CONST.ARROWUP);
            break;

        case CONST.ARROWRIGHT:
        case CONST.KEYD:
            activeKeys.add(CONST.ARROWRIGHT);
            break;

        case CONST.ARROWDOWN:
        case CONST.KEYS:
            activeKeys.add(CONST.ARROWDOWN);
            break;

        case CONST.ARROWLEFT:
        case CONST.KEYA:
            activeKeys.add(CONST.ARROWLEFT);
            break;

        // animation de creusage
        case CONST.KEYQ:
            spritePlayer.startAnimation("DIG_LEFT");
            break;

        case CONST.KEYE:
            spritePlayer.startAnimation("DIG_RIGHT");
            break;

        // !!! a modifier pour répondre aux conditions de win / lose
        case CONST.KEYR:
            if (e.code === CONST.KEYR) restartGame();
            break;
    }
}

function keyUp(e) {
    e.preventDefault();

    switch (e.code) {
        case CONST.ARROWUP:
        case CONST.KEYW:
            activeKeys.delete(CONST.ARROWUP);
            break;

        case CONST.ARROWRIGHT:
        case CONST.KEYD:
            activeKeys.delete(CONST.ARROWRIGHT);
            // Déclenche le idle
            if (player.isAligned()) spritePlayer.startAnimation("IDLE_RIGHT");
            break;

        case CONST.ARROWDOWN:
        case CONST.KEYS:
            activeKeys.delete(CONST.ARROWDOWN);
            break;

        case CONST.ARROWLEFT:
        case CONST.KEYA:
            activeKeys.delete(CONST.ARROWLEFT);
            // Déclenche le idle
            if (player.isAligned()) spritePlayer.startAnimation("IDLE_LEFT");
            break;

        // arret animation de creusage
        case CONST.KEYQ:
            spritePlayer.startAnimation("IDLE_LEFT");
            break;

        case CONST.KEYE:
            spritePlayer.startAnimation("IDLE_RIGHT");
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
    imageLoader.add("images/key_tile.png");
    imageLoader.add("images/tardis_rt_tile.png");
    imageLoader.add("images/tardis_lt_tile.png");
    imageLoader.add("images/tardis_rb_tile.png");
    imageLoader.add("images/tardis_lb_tile.png");

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
    for (let i = 0; i < nbEnemies; i++) {
        let enemyPos = myMap.getEnemiesStartPos()[i];
        let enemy = new Enemy(enemyPos.line, enemyPos.col, player.getPlayerPos()[1], player.getPlayerPos()[0], myMap);
        lstEnemies.push(enemy);
        lstSprites.push(enemy.spriteEnemy);
        if (debug) console.log("----- Ennemi ajouté à la liste des ennemis -----");
    }

    gameReady = true;
}

function restartGame() {

    // réinit listes
    lstSprites = [];
    lstEnemies = [];

    let activeKeys = new Set();

    myMap.tardisVisible = false;

    startGame();

}


function update(dt) {
    if (!gameReady) {
        return;
    }

    // Vérification et application des mouvements avec activeKeys uniquement, 
    // en ne conservant que canMoveUp et canMoveDown existants
    if (activeKeys.has("ArrowDown")) {
        console.log("Tentative moveDown - canMoveDown:", player.canMoveDown());
        if (player.canMoveDown()) player.moveDown(dt);
    }
    if (activeKeys.has("ArrowUp")) {
        console.log("Tentative moveUp - canMoveUp:", player.canMoveUp());
        if (player.canMoveUp()) player.moveUp(dt);
    }
    // Modification : Supprime les appels à canMoveRight et canMoveLeft, car ils n’existent pas dans Player.js
    if (activeKeys.has("ArrowRight")) {
        console.log("Tentative moveRight - vX:", spritePlayer.vX, "directionX:", spritePlayer.x < 480 ? "négatif" : "positif");
        if (spritePlayer.vX === 0 && spritePlayer.vY === 0 && spritePlayer.x < WIDTH - myGrid.cellSize) {
            player.moveRight(dt); // Appel direct à moveRight si aucune vitesse horizontale
        }
    }
    if (activeKeys.has("ArrowLeft")) {
        console.log("Tentative moveLeft - vX:", spritePlayer.vX, "directionX:", spritePlayer.x < 480 ? "négatif" : "positif");
        if (spritePlayer.vX === 0 && spritePlayer.vY === 0 && spritePlayer.x > 0) {
            player.moveLeft(dt); // Appel direct à moveLeft si aucune vitesse horizontale
        }
    }

    // si le jeu est prêt
    myMap.Update(dt);

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
    if (debug) myGrid.DrawGrid(pCtx);
    myMap.Draw(pCtx);

    lstSprites.forEach(sprite => {
        sprite.draw(pCtx);
    });

    if (debug) {
        lstEnemies.forEach(enemy => {
            enemy.drawPath(pCtx);
        });
    }

    // Rendu du HUD
    drawHUD();
}

function drawHUD() {
    hudCtx.fillStyle = "#020509"; // couleur Fond 
    hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
    hudCtx.fillStyle = "#FFF"; // couleur Texte 
    hudCtx.font = "35px Pixel";
    hudCtx.fillText("ZQSD / ↑←↓→ : Déplacement", 10, 30); // Texte
}