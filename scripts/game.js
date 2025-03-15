class Game {
    constructor() { }
}

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ------------------------ Initialisations ------------------------

let lstSprites = [];
let lstEnemies = [];
let lstHoles = [];

let activeKeys = new Set();

let gameReady = false;
let grid = new Grid();
let map = new Map();
let player = new Player();

// ------------------------ Gestion des images ------------------------

let imageLoader = new ImageLoader();

let spritePlayer;
let spriteEnemy;
let spriteHole;

let isDiggingDirection = null; //permet de bloquer deux creusage simultanés si on appuie sur A/E en même temps

// debug

let debug = false;

// Chargement son et musique

let sndKey = new Sound("sounds/key.wav", 0.35);

// ------------------------ GESTION DES TOUCHES CLAVIER ------------------------

function keyDown(e) {
    if (e.code === CONST.KEYF5) return; // ignorer F5
    if (e.repeat) return; // Ignore les événements répétés si la touche est maintenue
    e.preventDefault();

    let hole;
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
            handleDigging("left", CONST.OFFSET_LEFT, "DIG_LEFT");
            break;

        case CONST.KEYE:
            handleDigging("right", CONST.OFFSET_RIGHT, "DIG_RIGHT");
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
            if (isDiggingDirection === "left") {
                spritePlayer.startAnimation("IDLE_LEFT");
                isDiggingDirection = null;
            }
            break;

        case CONST.KEYE:
            if (isDiggingDirection === "right") {
                spritePlayer.startAnimation("IDLE_RIGHT");
                isDiggingDirection = null;

            }
            break;

        default:
            break;
    }
}
// ------------------------ FONCTION LIEE AU KEYDOWN / KEYUP ------------------------

function handleDigging(direction, offsetX, animation) {
    if (isDiggingDirection === null) {
        spritePlayer.startAnimation(animation);
        let hole = new Hole();
        hole.startDigging(offsetX, CONST.OFFSET_DOWN);
        if (hole.isDigging) {
            lstHoles.push(hole);
            lstSprites.push(hole.spriteHole);
            isDiggingDirection = direction;
            let playerCol = Math.round(spritePlayer.x / grid.cellSize);
            if ((spritePlayer.lastVx < 0 && offsetX < 0 && hole.col === playerCol - 1) ||
                (spritePlayer.lastVx > 0 && offsetX > 0 && hole.col === playerCol + 1)) {
                spritePlayer.vX = 0;
                spritePlayer.vY = 0;
                spritePlayer.dist = 0;
            }
        }
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

    grid.InitGrid();
    map.InitMap();

    // ----- creation joueur -----
    player.CreatePlayer();
    lstSprites.push(spritePlayer);


    // ----- creation ennemis -----
    // boucle de création des ennemis
    let nbEnemies = map.getNbEnemiesInLevel();
    for (let i = 0; i < nbEnemies; i++) {
        let enemyPos = map.getEnemiesStartPos()[i];
        let enemy = new Enemy(enemyPos.line, enemyPos.col, player.getPlayerPos()[1], player.getPlayerPos()[0], map);
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
    lstHoles = [];

    activeKeys = new Set();

    map.tardisVisible = false;

    startGame();

}


function update(dt) {
    if (!gameReady) {
        return;
    }

    // si le jeu est prêt
    map.Update(dt);

    // Joueur
    lstSprites.forEach(sprite => {
        sprite.update(dt);
    });
    player.Update(dt);

    // Ennemis
    lstEnemies.forEach(enemy => {
        enemy.Update(dt, player.getPlayerPos()[1], player.getPlayerPos()[0]);
    });

    // Trous 
    lstHoles.forEach(hole => {
        if (hole.isDigging) hole.Update(dt);
        hole.UpdateTimer(dt);
    });
    while (lstHoles.length > 0 && lstHoles[0].isDone) {
        let finishedHole = lstHoles.shift(); //supprime le 1er trou créé
        let spriteIndex = lstSprites.indexOf(finishedHole.spriteHole);
        if (spriteIndex !== -1) lstSprites.splice(spriteIndex, 1); // Supprime le sprite associé 
    }
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
    if (debug) grid.DrawGrid(pCtx);
    map.Draw(pCtx);

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

    // Texte
    hudCtx.fillText("ZQSD / ↑←↓→ : Déplacement", 10, 30);
    hudCtx.fillText("A / E : Creuser", 400, 30);
}