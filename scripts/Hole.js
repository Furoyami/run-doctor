class Hole {
    constructor() {
        let imgHole = imageLoader.getImage("images/hole_tile.png");
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
        if (this.isDigging && map.isWall(this.spriteHole.offsetX, this.spriteHole.offsetY)) {
            // remplacer le mur par du vide
            map.EmptyBrick(this.col - player.getPlayerPos()[1], this.line - player.getPlayerPos()[0]); // Utilise la position absolue
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
        if (this.timer >= 3) {
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
            !map.isWall(this.col - player.getPlayerPos()[1], this.line - player.getPlayerPos()[0])) {
            map.FillBrick(this.col - player.getPlayerPos()[1], this.line - player.getPlayerPos()[0]); // Utilise la position absolue
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

        // Nouvelle vérification : la tile doit être un WALL
        let [playerLine, playerCol] = player.getPlayerPos();
        let targetCol = playerCol + pOffsetX;
        let targetLine = playerLine + pOffsetY;
        if (!map.isWall(targetCol - playerCol, targetLine - playerLine)) {
            console.log("Impossible de creuser : la case n’est pas un mur");
            return;
        }

        // Si tout est OK, on continue
        this.reset();
        this.spriteHole.offsetX = pOffsetX;
        this.spriteHole.offsetY = pOffsetY;
        this.updatePosition();
        this.line = playerLine + this.spriteHole.offsetY;
        this.col = playerCol + this.spriteHole.offsetX;
        this.spriteHole.visible = true;
        this.isDigging = true;
    }

    // Vérifie si un trou actif existe déjà à la position cible
    checkPosition(newOffsetX, newOffsetY) {
        let [playerLine, playerCol] = player.getPlayerPos();
        let targetX = (playerCol + newOffsetX) * grid.cellSize;
        let targetY = (playerLine + newOffsetY) * grid.cellSize;

        for (let hole of lstHoles) {
            if (!hole.isDone &&
                hole.spriteHole.visible &&
                hole.spriteHole.x === targetX &&
                hole.spriteHole.y === targetY) {
                return false; // position occupée par un trou actif
            }
        }

        return true;
    }

    // place le trou à la bonne position
    updatePosition() {
        // Récupère la position actuelle du joueur
        let [playerLine, playerCol] = player.getPlayerPos();
        // positions en px pour l'affichage
        this.spriteHole.x = (playerCol + this.spriteHole.offsetX) * grid.cellSize;
        this.spriteHole.y = (playerLine + this.spriteHole.offsetY) * grid.cellSize;
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