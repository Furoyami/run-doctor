class Game {
    constructor() {
        // Machine à états
        this.state = CONST.LOADING;

        // Initialisations
        this.width = CONST.WIDTH;
        this.height = CONST.HEIGHT;
        this.lstSprites = [];
        this.lstEnemies = [];
        this.lstHoles = [];
        this.activeKeys = new Set();
        this.keyOrder = [];
        this.isDiggingDirection = null;
        this.gameReady = false;
        this.debug = false;

        // Objets principaux
        this.grid = new Grid();
        this.map = new Map();
        this.player = new Player();
        this.imageLoader = new ImageLoader();

        //pathfinding
        this.pathfinding = new Pathfinding();

        // Sons
        this.sndKey = new Sound("sounds/key.wav", 0.35);

        // Sprites
        this.spritePlayer = null;
        this.spriteEnemy = null;
        this.spriteHole = null;
    }

    startGame() {
        if (this.debug) console.log("StartGame");
        this.state = CONST.PLAYING;

        this.grid.InitGrid();
        this.map.InitMap();

        this.player.CreatePlayer();
        this.spritePlayer = this.player.CreatePlayer(); // Assume que Player initialise sprite
        this.lstSprites.push(this.spritePlayer);

        let nbEnemies = this.map.getNbEnemiesInLevel();
        for (let i = 0; i < nbEnemies; i++) {
            let enemyPos = this.map.getEnemiesStartPos()[i];
            let enemy = new Enemy(enemyPos.line, enemyPos.col, this.player.getPlayerPos()[1], this.player.getPlayerPos()[0], this.map, this.pathfinding);
            this.lstEnemies.push(enemy);
            this.lstSprites.push(enemy.spriteEnemy);
            if (this.debug) console.log("----- Ennemi ajouté -----");
        }

        this.gameReady = true;
    }

    keyDown(e) {
        if (e.code === CONST.KEYF5) return;
        if (e.repeat) return;
        e.preventDefault();

        switch (this.state) {
            case CONST.PLAYING:
                switch (e.code) {
                    case CONST.ARROWUP:
                    case CONST.KEYW:
                        if (!this.activeKeys.has(CONST.ARROWUP)) {
                            this.activeKeys.add(CONST.ARROWUP);
                            this.keyOrder.unshift(CONST.ARROWUP); // Ajoute en tête
                        }
                        break;
                    case CONST.ARROWRIGHT:
                    case CONST.KEYD:
                        if (!this.activeKeys.has(CONST.ARROWRIGHT)) {
                            this.activeKeys.add(CONST.ARROWRIGHT);
                            this.keyOrder.unshift(CONST.ARROWRIGHT);
                        }
                        break;
                    case CONST.ARROWDOWN:
                    case CONST.KEYS:
                        if (!this.activeKeys.has(CONST.ARROWDOWN)) {
                            this.activeKeys.add(CONST.ARROWDOWN);
                            this.keyOrder.unshift(CONST.ARROWDOWN);
                        }
                        break;
                    case CONST.ARROWLEFT:
                    case CONST.KEYA:
                        if (!this.activeKeys.has(CONST.ARROWLEFT)) {
                            this.activeKeys.add(CONST.ARROWLEFT);
                            this.keyOrder.unshift(CONST.ARROWLEFT);
                        }
                        break;
                    // animation de creusage
                    case CONST.KEYQ:
                        this.handleDigging("left", CONST.OFFSET_LEFT, "DIG_LEFT");
                        break;

                    case CONST.KEYE:
                        this.handleDigging("right", CONST.OFFSET_RIGHT, "DIG_RIGHT");
                        break;
                }
            // !!! a modifier pour répondre aux conditions de win / lose
            case CONST.GAMEOVER:
                if (e.code === CONST.KEYR) this.restartGame();
                break;
        }
    }

    keyUp(e) {
        e.preventDefault();
        if (this.state !== CONST.PLAYING) return;

        switch (e.code) {
            case CONST.ARROWUP:
            case CONST.KEYW:
                this.activeKeys.delete(CONST.ARROWUP);
                this.keyOrder = this.keyOrder.filter(k => k !== CONST.ARROWUP);
                break;
            case CONST.ARROWRIGHT:
            case CONST.KEYD:
                this.activeKeys.delete(CONST.ARROWRIGHT);
                this.keyOrder = this.keyOrder.filter(k => k !== CONST.ARROWRIGHT);
                if (this.player.isAligned()) this.spritePlayer.startAnimation("IDLE_RIGHT");
                break;
            case CONST.ARROWDOWN:
            case CONST.KEYS:
                this.activeKeys.delete(CONST.ARROWDOWN);
                this.keyOrder = this.keyOrder.filter(k => k !== CONST.ARROWDOWN);
                break;
            case CONST.ARROWLEFT:
            case CONST.KEYA:
                this.activeKeys.delete(CONST.ARROWLEFT);
                this.keyOrder = this.keyOrder.filter(k => k !== CONST.ARROWLEFT);
                if (this.player.isAligned()) this.spritePlayer.startAnimation("IDLE_LEFT");
                break;
            case CONST.KEYQ:
                this.spritePlayer.startAnimation("IDLE_LEFT");
                this.isDiggingDirection = null;
                break;
            case CONST.KEYE:
                this.spritePlayer.startAnimation("IDLE_RIGHT");
                this.isDiggingDirection = null;
                break;
        }
    }

    handleDigging(direction, offsetX, animation) {
        if (this.isDiggingDirection === null) {
            this.spritePlayer.startAnimation(animation);
            this.isDiggingDirection = direction;
            let hole = new Hole();
            hole.startDigging(offsetX, CONST.OFFSET_DOWN);
            if (hole.isDigging) {
                this.lstHoles.push(hole);
                this.lstSprites.push(hole.spriteHole);
                this.isDiggingDirection = direction;
                let playerCol = Math.round(this.spritePlayer.x / this.grid.cellSize);
                if ((this.spritePlayer.lastVx < 0 && offsetX < 0 && hole.col === playerCol - 1) ||
                    (this.spritePlayer.lastVx > 0 && offsetX > 0 && hole.col === playerCol + 1)) {
                    this.spritePlayer.vX = 0;
                    this.spritePlayer.vY = 0;
                    this.spritePlayer.dist = 0;
                }
            }
        }
    }

    restartGame() {
        this.lstSprites = [];
        this.lstEnemies = [];
        this.lstHoles = [];
        this.activeKeys = new Set();
        this.map.tardisVisible = false;
        this.player.resetPlayer();
        this.startGame();
    }

    // Récupères les trous consommés
    getConsumedTraps() {
        return this.lstEnemies
            .filter(enemy => enemy.trappedAt && enemy.trappedTimer <= 0 && !enemy.isTrapped) // Trou consommé
            .map(enemy => ({ x: enemy.trappedAt.col, y: enemy.trappedAt.line }));
    }

    // gère les pieges
    handleTraps(dt, enemy, enemyCol, enemyLine) {
        // Verification du piegeage
        let trapHole = this.lstHoles.find(hole =>
            hole.isTrap &&
            hole.col === enemyCol &&
            hole.line === enemyLine
        );

        if (!enemy.isTrapped && trapHole) {
            // on passe en état de piège
            if (enemy.spriteEnemy.currentAnimation.name.endsWith("_LEFT")) {
                enemy.spriteEnemy.startAnimation("LEFT");
            } else if (enemy.spriteEnemy.currentAnimation.name.endsWith("_RIGHT")) {
                enemy.spriteEnemy.startAnimation("RIGHT");
            }
            enemy.isTrapped = true;
            enemy.trappedTimer = this.rnd(3, 8);
            enemy.trappedAt = { col: enemyCol, line: enemyLine };
            enemy.path = [];
            enemy.isFalling = false;
            console.log("piégé !");
            this.map.ChangeToUnwalkable(enemyCol, enemyLine); // change la case en unwalkable pour que le joueur puisse marcher dessus
        } else if (enemy.isTrapped && enemy.trappedTimer <= 0) {
            let targetLine = enemy.trappedAt.line - 1;
            let targetY = targetLine * this.grid.cellSize;

            if (enemy.spriteEnemy.y > targetY) {
                enemy.spriteEnemy.y -= enemy.spriteEnemy.speed * dt;
                if (enemy.spriteEnemy.y <= targetY) {
                    enemy.spriteEnemy.y = targetY;
                    enemy.spriteEnemy.line = targetLine;
                    enemy.isTrapped = false;
                    enemy.justFreed = true;
                    enemy.updatePath();
                    console.log("libéré");
                }
            }
        } else if (enemy.isTrapped && !this.lstHoles.some(hole =>
            hole.isTrap &&
            hole.col === enemy.trappedAt.col &&
            hole.line === enemy.trappedAt.line)) {
            enemy.respawnAtTop();
            enemy.isTrapped = false;
            enemy.trappedTimer = 0;
            enemy.trappedAt = null;
            if (this.debug) console.log("enterré vivant !");
        }
    }
    // ------------------------------------------------------------- GAMELOOP -------------------------------------------------------------

    load() {
        document.addEventListener("keydown", (e) => this.keyDown(e), false);
        document.addEventListener("keyup", (e) => this.keyUp(e), false);

        this.imageLoader.add("images/doctor_tile.png");
        this.imageLoader.add("images/hole_tile.png");
        this.imageLoader.add("images/dalek_tile.png");
        this.imageLoader.add("images/key_tile.png");
        this.imageLoader.add("images/tardis_rt_tile.png");
        this.imageLoader.add("images/tardis_lt_tile.png");
        this.imageLoader.add("images/tardis_rb_tile.png");
        this.imageLoader.add("images/tardis_lb_tile.png");

        this.imageLoader.start(() => this.startGame());
    }

    update(dt) {
        switch (this.state) {
            case CONST.LOADING:
                break;
            case CONST.PLAYING:
                if (!this.gameReady) return;
                this.map.Update(dt);
                this.lstSprites.forEach(sprite => sprite.update(dt));

                this.player.Update(dt);

                this.lstEnemies.forEach(enemy => {

                    let enemyPos = enemy.getEnemyPos();
                    let enemyLine = enemyPos[0];
                    let enemyCol = enemyPos[1];

                    let playerPos = this.player.getPlayerPos();
                    let playerLine = playerPos[0];
                    let playerCol = playerPos[1];

                    enemy.Update(dt, playerCol, playerLine);

                    // Tue le joueur s'il entre en collision avec un ennemi
                    if (!this.player.isInvincible &&
                        playerCol === enemyCol &&
                        playerLine === enemyLine) {
                        this.player.playerDies();
                    }

                    this.handleTraps(dt, enemy, enemyCol, enemyLine);
                });

                this.lstHoles.forEach(hole => {
                    if (hole.isDigging) hole.Update(dt);
                    hole.UpdateTimer(dt);
                });
                // permet de retirer le trou de la liste une fois que son timer est terminé
                while (this.lstHoles.length > 0 && this.lstHoles[0].isDone) {
                    let finishedHole = this.lstHoles.shift();
                    let spriteIndex = this.lstSprites.indexOf(finishedHole.spriteHole);
                    if (spriteIndex !== -1) this.lstSprites.splice(spriteIndex, 1);
                }
                break;
        }
    }

    draw(pCtx) {
        pCtx.clearRect(0, 0, this.width, this.height);
        switch (this.state) {
            case CONST.LOADING:
                let ratio = this.imageLoader.getLoadedRatio();
                pCtx.fillStyle = "rgb(255,255,255)";
                pCtx.fillRect(this.width / 2 - 200, this.height / 2 - 25, 400, 50);
                pCtx.fillStyle = "rgb(0,255,255)";
                pCtx.fillRect(this.width / 2 - 200, this.height / 2 - 25, 400 * ratio, 50);
                break;
            case CONST.PLAYING:
                if (!this.gameReady) return;
                this.map.Draw(pCtx);
                this.lstSprites.forEach(sprite => sprite.draw(pCtx));
                this.drawHUD();
                if (debug) {
                    this.grid.DrawGrid(pCtx);
                    this.lstEnemies.forEach(enemy => enemy.drawPath(pCtx)); // path des ennemis
                }
                break;
            case CONST.GAMEOVER:
                pCtx.fillStyle = "#FFF";
                pCtx.font = "75px Pixel";
                this.centerText(pCtx, "Perdu !", game.width / 2, game.height / 2 - 50);
                this.centerText(pCtx, "R pour rejouer !", game.width / 2, game.height / 2 + 25);
                break;
        }
    }

    drawHUD() {
        hudCtx.fillStyle = "#020509";
        hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
        hudCtx.fillStyle = "#FFF";
        hudCtx.font = "35px Pixel";
        hudCtx.fillText("ZQSD / ↑←↓→ : Déplacement", 10, 30);
        hudCtx.fillText("A / E : Creuser", 400, 30);
        hudCtx.fillText("Vies: " + this.player.lives, game.width - 80, 30);
    }


    //utilitaire
    rnd(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    centerText(pCtx, text, x, y) {
        pCtx.textAlign = "left"; // Reset pour éviter des conflits
        const textWidth = pCtx.measureText(text).width; // Largeur du texte
        const centeredX = x - (textWidth / 2); // Décalage pour centrer
        pCtx.fillText(text, centeredX, y); // Dessiner
    }
}

// export pour conserver le main intact
const game = new Game();

function load() {
    game.load();
}

function update(dt) {
    game.update(dt);
}

function draw(pCtx) {
    game.draw(pCtx);
}