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

        // Objets principaux
        this.grid = new Grid();
        this.map = new Map();
        this.player = new Player();
        this.imageLoader = new ImageLoader();

        // Scenes
        this.titleScene = new TitleScene();
        this.playingScene = new PlayingScene();
        this.pauseScene = new PauseScene();
        this.loadingScene = new LoadingScene();
        this.gameOverScene = new GameOverScene();

        // Pathfinding
        this.pathfinding = new Pathfinding();

        // Sons
        this.sounds = [
            this.sndKey = new Sound("sounds/key.wav", .45),
            this.sndDalek = new Sound("sounds/exterminate.wav", .5),
            this.sndDig = new Sound("sounds/dig.wav", .4),
            this.sndFill = new Sound("sounds/fill.wav", .35),
            this.sndScrewdriver = new Sound("sounds/screwdriver.wav", .4),
            this.sndTardis = new Sound("sounds/tardis.wav", .6),

            this.mscTheme = new Sound("sounds/theme.wav", .35, true)
        ];

        // Sprites
        this.spritePlayer = null;
        this.spriteEnemy = null;
        this.spriteHole = null;
    }

    startGame() {
        if (debug) console.log("StartGame");

        // état différent en fonction du premier lancement ou d'un retry
        if (this.state === CONST.LOADING) this.state = CONST.TITLE;
        else if (this.state === CONST.GAMEOVER) this.state = CONST.PLAYING;

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
            if (debug) console.log("----- Ennemi ajouté -----");
        }

        this.mscTheme.play();

        this.gameReady = true;
    }

    keyDown(e) {
        if (e.code === CONST.KEYF5) return;
        if (e.repeat) return;
        e.preventDefault();

        switch (this.state) {
            case CONST.PLAYING:
                this.playingScene.keyDownPlaying(e);
                break;
            case CONST.PAUSE:
                this.pauseScene.keyDownPause(e);
                break;
            case CONST.GAMEOVER:
                this.gameOverScene.keyDownGameOver(e);
                break;
        }
    }

    keyUp(e) {
        e.preventDefault();

        switch (this.state) {
            case !CONST.PLAYING:
                break;
            case CONST.PLAYING:
            case CONST.PAUSE:
                this.playingScene.keyUpPlaying(e);
                break;

        }

    }

    restartGame() {
        this.lstSprites = [];
        this.lstEnemies = [];
        this.lstHoles = [];
        this.activeKeys = new Set();
        this.keyOrder = [];
        this.isDiggingDirection = null; // Réinitialiser l'état de creusage
        this.map.tardisVisible = false;
        this.player.resetPlayer();
        this.startGame();
        this.map.itemsCollected = 0;
    }

    // Récupères les trous consommés
    getConsumedTraps() {
        return this.lstEnemies
            .filter(enemy => enemy.trappedAt && enemy.trappedTimer <= 0 && !enemy.isTrapped) // Trou consommé
            .map(enemy => ({ x: enemy.trappedAt.col, y: enemy.trappedAt.line }));
    }

    adjustAllVolumes(direction) {
        for (let sound of this.sounds) {
            if (direction === "up") {
                sound.upVolume();
            } else {
                sound.downVolume();
            }
        }
    }

    muteAll() {
        for (let sound of this.sounds) {
            sound.mute();
        }
    }
    // ------------------------------------------------------------- GAMELOOP -------------------------------------------------------------

    load() {
        document.addEventListener("keydown", (e) => this.keyDown(e), false);
        document.addEventListener("keyup", (e) => this.keyUp(e), false);
        document.querySelector("#canvas").addEventListener("click", () => {
            if (this.state === CONST.TITLE) this.state = CONST.PLAYING;
        });

        this.imageLoader.add("images/doctor_tile.png");
        this.imageLoader.add("images/hole_tile.png");
        this.imageLoader.add("images/dalek_tile.png");
        this.imageLoader.add("images/key_tile.png");
        this.imageLoader.add("images/key.png");
        this.imageLoader.add("images/tardis_rt_tile.png");
        this.imageLoader.add("images/tardis_lt_tile.png");
        this.imageLoader.add("images/tardis_rb_tile.png");
        this.imageLoader.add("images/tardis_lb_tile.png");

        this.imageLoader.add("images/icons/move.png");
        this.imageLoader.add("images/icons/dig.png");
        this.imageLoader.add("images/icons/heart.png");
        this.imageLoader.add("images/icons/keyIcon.png");
        this.imageLoader.add("images/icons/volDown.png");
        this.imageLoader.add("images/icons/volUp.png");
        this.imageLoader.add("images/icons/volMute.png");


        this.imageLoader.start(() => this.startGame());
    }

    update(dt) {

        switch (this.state) {
            case CONST.LOADING:
                break;
            case CONST.TITLE:
                this.mscTheme.startOnInteraction();     // start le theme du jeu à l'applui sur le click du titre
                this.titleScene.updateTitle(dt);
                break;
            case CONST.PLAYING:
                this.playingScene.updatePlaying(dt);
                break;
            case CONST.PAUSE:
                break;
            case CONST.GAMEOVER:
                this.gameOverScene.updateGameOver(dt);
                break;
        }
        console.log(this.state);
    }

    draw(pCtx) {
        pCtx.clearRect(0, 0, this.width, this.height);
        switch (this.state) {
            case CONST.LOADING:
                this.loadingScene.drawLoading(pCtx);
                break;
            case CONST.TITLE:
                this.titleScene.drawTitle(pCtx);
                break;
            case CONST.PLAYING:
            case CONST.PAUSE:
                this.playingScene.drawPlaying(pCtx);
                this.pauseScene.drawPause(pCtx);
                break;
            case CONST.GAMEOVER:
                this.gameOverScene.drawGameOver(pCtx);
                break;
        }
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