class Game {
    constructor() {
        // Machine à états
        this.state = "loading";

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
        this.sndKey = new Sound("sounds/key.wav", 0.35);

        // Sprites
        this.spritePlayer = null;
        this.spriteEnemy = null;
        this.spriteHole = null;
    }

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

    startGame() {
        if (this.debug) console.log("StartGame");
        this.state = "playing";

        this.grid.InitGrid();
        this.map.InitMap();

        this.player.CreatePlayer();
        this.spritePlayer = this.player.CreatePlayer(); // Assume que Player initialise sprite
        this.lstSprites.push(this.spritePlayer);

        let nbEnemies = this.map.getNbEnemiesInLevel();
        for (let i = 0; i < nbEnemies; i++) {
            let enemyPos = this.map.getEnemiesStartPos()[i];
            let enemy = new Enemy(enemyPos.line, enemyPos.col, this.player.getPlayerPos()[1], this.player.getPlayerPos()[0], this.map);
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
            case "playing":
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

                    // !!! a modifier pour répondre aux conditions de win / lose
                    case CONST.KEYR:
                        if (e.code === CONST.KEYR) this.restartGame();
                        break;
                }
                break;
        }
    }

    keyUp(e) {
        e.preventDefault();
        if (this.state !== "playing") return;

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
        this.startGame();
    }

    update(dt) {
        switch (this.state) {
            case "loading":
                break;
            case "playing":
                if (!this.gameReady) return;
                this.map.Update(dt);
                this.lstSprites.forEach(sprite => sprite.update(dt));
                this.player.Update(dt);
                this.lstEnemies.forEach(enemy => enemy.Update(dt, this.player.getPlayerPos()[1], this.player.getPlayerPos()[0]));
                this.lstHoles.forEach(hole => {
                    if (hole.isDigging) hole.Update(dt);
                    hole.UpdateTimer(dt);
                });
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
            case "loading":
                let ratio = this.imageLoader.getLoadedRatio();
                pCtx.fillStyle = "rgb(255,255,255)";
                pCtx.fillRect(this.width / 2 - 200, this.height / 2 - 25, 400, 50);
                pCtx.fillStyle = "rgb(0,255,255)";
                pCtx.fillRect(this.width / 2 - 200, this.height / 2 - 25, 400 * ratio, 50);
                break;
            case "playing":
                if (!this.gameReady) return;
                if (this.debug) this.grid.DrawGrid(pCtx);
                this.map.Draw(pCtx);
                this.lstSprites.forEach(sprite => sprite.draw(pCtx));
                if (this.debug) this.lstEnemies.forEach(enemy => enemy.drawPath(pCtx));
                this.drawHUD();
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