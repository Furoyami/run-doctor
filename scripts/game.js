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
        this.lstEffects = []; // pour les effets de +1 / +life
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
        this.gameWinScene = new GameWinScene();
        this.levelEditorScene = new LevelEditorScene();
        this.creditsScene = new CreditsScene();

        // Pathfinding
        this.pathfinding = new Pathfinding();

        // Sons
        this.sounds = [
            this.sndItem = new Sound("sounds/key.wav", .45),
            this.sndEnergy = new Sound("sounds/energy.wav", .4),
            this.sndLifeUp = new Sound("sounds/lifeUp.wav", .4),
            this.sndDalek = new Sound("sounds/exterminate.wav", .5),
            this.sndDig = new Sound("sounds/dig.wav", .4),
            this.sndFill = new Sound("sounds/fill.wav", .35),
            this.sndScrewdriver = new Sound("sounds/screwdriver.wav", .4),
            this.sndTardis = new Sound("sounds/tardis.wav", .6),

            this.mscTheme = new Sound("sounds/theme.wav", .35, true),
            this.mscSpecialTheme = new Sound("sounds/specialTheme.wav", .25, true)
        ];
        this.isMainThemePlaying = false;

        // Sprites
        this.spritePlayer = null;
        this.spriteEnemy = null;
        this.spriteHole = null;

        // GODMOD
        this.timeLord = false;
        this.cheatCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "B", "A"]; // Konami Code
        this.cheatInput = [];
        this.cheatTimer = 0;
        this.isCheatActive = false;
        this.isPathVisible = false;
        this.isCoordsVisible = false;
        this.isUnkillable = false;
        this.isFrozen = false;
        this.isAccelerated = false;
    }

    keyDown(e) {
        if (e.code === CONST.KEYF5) return;
        if (e.repeat) return;
        e.preventDefault();

        // Bindings pour godmod
        if (this.state === CONST.PLAYING && this.timeLord) {
            if (e.code === "NumpadAdd") {
                this.nextLevel();
                return;
            }
            if (e.code === "NumpadSubtract") {
                this.previousLevel();
                return;
            }
            if (e.code === "NumpadMultiply") {
                this.addLife();
                return;
            }
            if (e.code === "NumpadDivide") {
                this.removeLife();
                return;
            }
        }

        switch (this.state) {
            case CONST.TITLE:
                this.titleScene.keyDownTitle(e);
                break;
            case CONST.CREDITS:
                this.creditsScene.keyDownCredits(e);
                break;
            case CONST.PLAYING:
                this.playingScene.keyDownPlaying(e);
                break;
            case CONST.PAUSE:
                this.pauseScene.keyDownPause(e);
                break;
            case CONST.GAMEOVER:
                this.gameOverScene.keyDownGameOver(e);
                break;
            case CONST.GAMEWIN:
                this.gameWinScene.keyDownGameWin(e);
                break;
            case CONST.LEVELEDITOR:
                this.levelEditorScene.keyDownLevelEditor(e);
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

    async startGame() {
        if (debug) console.log("StartGame");

        if (this.state === CONST.LOADING) this.state = CONST.TITLE;

        // map init
        this.grid.InitGrid();
        await this.map.InitMap();
        await this.initLevel(true);
    }

    // restart completement le jeu au lvl 1 (après game over)
    async restartGame() {
        this.isCheatActive = false;
        this.lstSprites = [];
        this.lstEnemies = [];
        this.lstHoles = [];
        this.activeKeys = new Set();
        this.keyOrder = [];
        this.isDiggingDirection = null; // Réinitialiser l'état de creusage
        this.map.tardisVisible = false;
        this.map.resetLevel();
        this.map.currentLevelId = 1;
        await this.initLevel(true);
        this.state = CONST.PLAYING;
        this.mscTheme.play(); // Relance le thème pour un restart
    }

    async initLevel(resetLives = false) {
        this.lstSprites = [];
        this.lstEnemies = [];
        this.lstHoles = [];
        this.activeKeys = new Set();
        this.keyOrder = [];
        this.isDiggingDirection = null; // Réinitialiser l'état de creusage
        this.map.tardisVisible = false;
        this.spritePlayer = null; // Purge spritePlayer
        this.player.resetPlayer(resetLives); // Réinitialise l'état du joueur et conserve ses vies actuelles
        
        await this.map.LoadLevelOnDemand(this.map.currentLevelId);
        this.pathfinding.costMap = this.map.createEmptyCostMap();
        this.map.Read();
        this.selectMusicTheme();

        // player creation
        let playerPos = this.map.getPlayerStartPos();
        this.spritePlayer = this.player.CreatePlayer(playerPos.col, playerPos.line);
        this.lstSprites.push(this.spritePlayer);

        // enemies creation
        let nbEnemies = this.map.getNbEnemiesInLevel();        
        for (let i = 0; i < nbEnemies; i++) {
            let enemyPos = this.map.getEnemiesStartPos()[i];
            let enemy = new Enemy(enemyPos.line, enemyPos.col, this.player.getPlayerPos()[1], this.player.getPlayerPos()[0], this.map, this.pathfinding);
            this.lstEnemies.push(enemy);
            this.lstSprites.push(enemy.spriteEnemy);
            if (debug) console.log("----- Ennemi ajouté -----");
        }

        // reload les sprites du tardis pour rejouer l'animation
        this.map.LoadTardisTextures();
        console.log("this.map.level.isSpecial: ", this.map.level.isSpecial);
        

        this.gameReady = true;
    }

    // Récupères les trous consommés
    getConsumedTraps() {
        return this.lstEnemies
            .filter(enemy => enemy.trappedAt && enemy.trappedTimer <= 0 && !enemy.isTrapped) // Trou consommé
            .map(enemy => ({ x: enemy.trappedAt.col, y: enemy.trappedAt.line }));
    }

    // ------------------------------------------------------------- GESTION VOLUME -------------------------------------------------------------
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

    selectMusicTheme() {
        if (this.map.level.isSpecial) {
            if (this.isMainThemePlaying) {
                this.mscTheme.pause();
                this.isMainThemePlaying = false;
            }
            this.mscSpecialTheme.play();
        } else {
            this.mscSpecialTheme.stop();
            if (!this.isMainThemePlaying) {
                this.mscTheme.play();
                this.isMainThemePlaying = true;
            }
        }

    }
    // ------------------------------------------------------------- GOD MOD -------------------------------------------------------------
    async nextLevel() {
        if (this.state !== CONST.PLAYING) {
            console.log("[Game] nextLevel: Ignoré, pas en mode PLAYING");
            return;
        }
        this.map.currentLevelId += 1;
        console.log("[Game] Passage au niveau suivant:", this.map.currentLevelId);
        await this.initLevel(false); // Conserve les vies
    }

    async previousLevel() {
        if (this.state !== CONST.PLAYING) {
            console.log("[Game] previousLevel: Ignoré, pas en mode PLAYING");
            return;
        }
        if (this.map.currentLevelId <= 1) {
            console.log("[Game] previousLevel: Déjà au niveau 1");
            return;
        }
        this.map.currentLevelId -= 1;
        console.log("[Game] Retour au niveau précédent:", this.map.currentLevelId);
        await this.initLevel(false); // Conserve les vies
    }

    addLife() {
        if (this.state !== CONST.PLAYING) {
            console.log("[Game] addLife: Ignoré, pas en mode PLAYING");
            return;
        }
        
        if (this.player.lives < CONST.MAXLIVES) {
            this.player.lives += 1;
            console.log("[Game] Vie ajoutée: lives=", this.player.lives);
        } else {
            console.log("[Game] addLife: Maximum de vies atteint:", CONST.MAXLIVES);
        }
    }

    removeLife() {
        if (this.state !== CONST.PLAYING) {
            console.log("[Game] removeLife: Ignoré, pas en mode PLAYING");
            return;
        }
        if (this.player.lives > 0) {
            this.player.lives -= 1;
            console.log("[Game] Vie retirée: lives=", this.player.lives);
            if (this.player.lives <= 0) {
                this.state = CONST.GAMEOVER;
                console.log("[Game] GameOver déclenché");
            }
        } else {
            console.log("[Game] removeLife: Aucune vie restante");
        }
    }
    // ------------------------------------------------------------- GAMELOOP -------------------------------------------------------------

    async load() {
        const canvas = document.querySelector("#canvas");
        canvas.setAttribute("tabindex", "0");
        canvas.addEventListener("keydown", (e) => this.keyDown(e), { capture: true });
        canvas.addEventListener("keyup", (e) => this.keyUp(e), { capture: true });

        // Bloque le défilement des flèches globalement
        window.addEventListener("keydown", (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
        }, { capture: true });

        this.imageLoader.add("images/doctor_tile.png");
        this.imageLoader.add("images/doctor.png");  // pour le level editor
        this.imageLoader.add("images/hole_tile.png");
        this.imageLoader.add("images/dalek_tile.png");
        this.imageLoader.add("images/dalek.png");   // pour le level editor
        this.imageLoader.add("images/key_tile.png");
        this.imageLoader.add("images/key.png");
        this.imageLoader.add("images/tardis_rt_tile.png");
        this.imageLoader.add("images/tardis_lt_tile.png");
        this.imageLoader.add("images/tardis_rb_tile.png");
        this.imageLoader.add("images/tardis_lb_tile.png");
        this.imageLoader.add("images/metal.png");
        this.imageLoader.add("images/trap.png");
        this.imageLoader.add("images/energy_tile.png");
        this.imageLoader.add("images/pixelpool.png")
        this.imageLoader.add("images/bubblelvl5.png");
        this.imageLoader.add("images/bubblelvl15.png");
        this.imageLoader.add("images/bubblelvl25.png");
        this.imageLoader.add("images/bubblelvl35.png");
        this.imageLoader.add("images/bubblelvl50.png");
        this.imageLoader.add("images/bubblelvl77.png");

        this.imageLoader.add("images/icons/move.png");
        this.imageLoader.add("images/icons/dig.png");
        this.imageLoader.add("images/icons/heart.png");
        this.imageLoader.add("images/icons/energy.png");
        this.imageLoader.add("images/icons/keyIcon.png");
        this.imageLoader.add("images/icons/volDown.png");
        this.imageLoader.add("images/icons/volUp.png");
        this.imageLoader.add("images/icons/volMute.png");
        this.imageLoader.add("images/plus_one.png");
        this.imageLoader.add("images/plus_life.png");

        this.imageLoader.add("images/shinpool.png");
        this.imageLoader.add("images/title_screen.png");

        await this.imageLoader.start();
        await this.startGame();

        // timeout défensif au cas ou certains navigateurs bloquent focus si appelé trop tôt
        setTimeout(() => {
            canvas.focus();
        }, 100);
    }

    update(dt) {

        switch (this.state) {
            case CONST.LOADING:
                break;
            case CONST.TITLE:
                this.mscTheme.stop();
                this.mscSpecialTheme.stop();
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
            case CONST.GAMEWIN:
                this.gameWinScene.updateGameWin(dt);
                    break;
            case CONST.LEVELEDITOR:
                this.levelEditorScene.updateLevelEditor(dt);
                break;
        }
        console.log(this.state);        
    }

    draw(pCtx) {
        if (!this.gameReady) return;

        pCtx.clearRect(0, 0, this.width, this.height);
        switch (this.state) {
            case CONST.LOADING:
                this.loadingScene.drawLoading(pCtx);
                break;
            case CONST.TITLE:
                this.titleScene.drawTitle(pCtx);
                break;
            case CONST.CREDITS:
                this.creditsScene.drawCredits(pCtx);
                break;
            case CONST.PLAYING:
            case CONST.PAUSE:
                this.playingScene.drawPlaying(pCtx);
                this.pauseScene.drawPause(pCtx);
                break;
            case CONST.GAMEOVER:
                this.gameOverScene.drawGameOver(pCtx);
                break;
            case CONST.GAMEWIN:
                this.gameWinScene.drawGameWin(pCtx);
                break;
            case CONST.LEVELEDITOR:
                this.levelEditorScene.drawLevelEditor(pCtx);
                break;
        }
    }

    // ------------------------------------------------------------- UTILITAIRE -------------------------------------------------------------

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