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
            map.EmptyBrick(this.spriteHole.offsetX, this.spriteHole.offsetY);
            this.spriteHole.startAnimation("DIG");
            this.isDigging = false;
            this.timerStart = true;
        }
    }

    UpdateTimer(dt) {
        if (this.timerStart) {
            this.timer += dt;
            console.log("Timer pos :", this.spriteHole.x, this.spriteHole.y, "timer :", this.timer, "anim :", this.spriteHole.currentAnimation?.name);
        }
        if (this.timer >= 3) {
            this.spriteHole.startAnimation("FILL");
            console.log("FILL démarré, pos :", this.spriteHole.x, this.spriteHole.y);
            // reinitialisations pour le prochain cycle
            this.timer = 0;
            this.timerStart = false;
            this.isFilled = false;
        }
        if (this.spriteHole.currentAnimation &&
            this.spriteHole.currentAnimation.name === "FILL" &&
            this.spriteHole.currentFrameInAnimation >= 6 &&
            !this.isFilled &&
            !map.isWall(this.spriteHole.offsetX, this.spriteHole.offsetY)) {
            map.FillBrick(this.spriteHole.offsetX, this.spriteHole.offsetY);
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
    setLeftHoleOffset() {
        this.spriteHole.offsetX = -1;
        this.spriteHole.offsetY = 1;
        this.updatePosition();
        this.spriteHole.visible = true;
        this.isDigging = true;
    }

    setRightHoleOffset() {
        this.spriteHole.offsetX = 1;
        this.spriteHole.offsetY = 1;
        this.updatePosition();
        this.spriteHole.visible = true;
        this.isDigging = true;
    }

    // place le trou à la bonne position
    updatePosition() {
        // Récupère la position actuelle du joueur
        let [playerLine, playerCol] = player.getPlayerPos();
        // positions en px pour l'affichage
        this.spriteHole.x = (playerCol + this.spriteHole.offsetX) * grid.cellSize;
        this.spriteHole.y = (playerLine + this.spriteHole.offsetY) * grid.cellSize;
    }
}