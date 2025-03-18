class Hole {
    constructor() {
        let imgHole = game.imageLoader.getImage("images/hole_tile.png");
        this.spriteHole = new Sprite(imgHole);
        this.spriteHole.setTileSheet(40, 40);
        this.spriteHole.offsetX = 0;
        this.spriteHole.offsetY = 0;
        this.spriteHole.x = 0;
        this.spriteHole.y = 0;
        this.spriteHole.visible = false;
        this.spriteHole.addAnimation("DIG", [0, 1, 2, 3, 4, 5, 6, 7], 0.1, 0, false);
        this.spriteHole.addAnimation("FILL", [7, 6, 5, 4, 3, 2, 1, 0], 0.1, 0, false);

        this.isDigging = false;
        this.timerStart = false;
        this.timer = 0;
        this.isFilled = false; // sert à s'assurer que FillBrick n'est appelé qu'une fois par cycle "FILL"
        this.isDone = false; // Permet de savoir si un trou doit être retiré de la liste
    }

    Update(dt) {
        // vérifie si le trou demandé est un mur
        if (this.isDigging && game.map.isWall(this.spriteHole.offsetX, this.spriteHole.offsetY)) {
            // remplacer le mur par du vide
            game.map.EmptyBrick(this.col - game.player.getPlayerPos()[1], this.line - game.player.getPlayerPos()[0]); // Utilise la position absolue
            this.spriteHole.startAnimation("DIG");
            this.isDigging = false;
            this.timerStart = true;
        }
    }

    UpdateTimer(dt) {
        // gestion du timer
        if (this.timerStart) {
            this.timer += dt;
        }
        if (this.timer >= 10) {
            this.spriteHole.startAnimation("FILL");
            console.log("FILL démarré, pos :", this.spriteHole.x, this.spriteHole.y);
            // reinitialisations pour le prochain cycle
            this.timer = 0;
            this.timerStart = false;
            this.isFilled = false;
        }
        // cycle de remplissage du WALL
        if (this.spriteHole.currentAnimation &&
            this.spriteHole.currentAnimation.name === "FILL" &&
            this.spriteHole.currentFrameInAnimation >= 6 &&
            !this.isFilled &&
            !game.map.isWall(this.col - game.player.getPlayerPos()[1], this.line - game.player.getPlayerPos()[0])) {
            game.map.FillBrick(this.col - game.player.getPlayerPos()[1], this.line - game.player.getPlayerPos()[0]); // Utilise la position absolue
            this.isFilled = true; // Marque la brique remplie
        }

        // Vérifie la fin de l’animation FILL
        if (this.spriteHole.currentAnimation &&
            this.spriteHole.currentAnimation.name === "FILL" &&
            this.spriteHole.currentFrameInAnimation >= 7) {
            this.isDone = true; // Le trou est terminé
            console.log("Trou terminé, pos :", this.spriteHole.x, this.spriteHole.y);
        }
    }

    // positionne l'emplacement du trou demandé en fonction de la touche enfoncée
    startDigging(pOffsetX, pOffsetY) {
        // Vérifie si la position est déjà occupée
        if (!this.checkPosition(pOffsetX, pOffsetY)) {
            console.log("Position déjà occupée par un trou actif, ignoré");
            return;
        }

        // Utilise la position visuelle arrondie
        let playerCol = Math.round(game.spritePlayer.x / game.grid.cellSize);
        let playerLine = Math.round(game.spritePlayer.y / game.grid.cellSize);
        let targetCol = playerCol + pOffsetX;
        let targetLine = playerLine + pOffsetY;

        if (!game.map.isWall(targetCol - playerCol, targetLine - playerLine)) {
            console.log("Impossible de creuser : la case n’est pas un mur");
            return;
        }

        // Si tout est OK, on continue
        // reset pour être sûr d'avoir un trou initialisé de 0
        this.reset();
        this.spriteHole.offsetX = pOffsetX;
        this.spriteHole.offsetY = pOffsetY;
        this.line = targetLine;
        this.col = targetCol;
        this.spriteHole.x = targetCol * game.grid.cellSize;
        this.spriteHole.y = targetLine * game.grid.cellSize;
        this.spriteHole.visible = true;
        this.isDigging = true;
    }

    // Vérifie si un trou actif existe déjà à la position cible
    checkPosition(newOffsetX, newOffsetY) {
        let [playerLine, playerCol] = game.player.getPlayerPos();
        let targetX = (playerCol + newOffsetX) * game.grid.cellSize;
        let targetY = (playerLine + newOffsetY) * game.grid.cellSize;

        for (let hole of game.lstHoles) {
            if (!hole.isDone &&
                hole.spriteHole.visible &&
                hole.spriteHole.x === targetX &&
                hole.spriteHole.y === targetY) {
                return false; // position occupée par un trou actif
            }
        }

        return true;
    }

    reset() {
        this.spriteHole.visible = false;
        this.isDigging = false;
        this.timerStart = false;
        this.timer = 0;
        this.isFilled = false;
        this.isDone = false;
        this.spriteHole.x = 0;
        this.spriteHole.y = 0;
        this.spriteHole.currentAnimation = null;
    }
}