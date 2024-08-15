class Enemy {
    constructor(pLine = 0, pCol = 0, pTargetCol, pTargetLine, pMap) {
        this.map = pMap.getCurrentMapLevel();
        let imgEnemy = imageLoader.getImage("images/dalek_tile.png");
        this.spriteEnemy = new Sprite(imgEnemy);
        this.spriteEnemy.setTileSheet(40, 41);
        this.spriteEnemy.col = pCol;
        this.spriteEnemy.line = pLine;
        this.spriteEnemy.x = this.spriteEnemy.col * myGrid.cellSize;
        this.spriteEnemy.y = this.spriteEnemy.line * myGrid.cellSize;
        this.spriteEnemy.speed = myGrid.cellSize;
        this.spriteEnemy.vX = 0;
        this.spriteEnemy.vY = 0;
        this.spriteEnemy.dist = 0;
        this.spriteEnemy.lastVx = 0;
        this.spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        this.spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);

        // ----- propriétés utilisées pour le pathfinding -----
        this.targetCol = pTargetCol;
        this.targetLine = pTargetLine;

        this.path;
        this.pathfinding = new Pathfinding(this.map);

        this.hasReachedTarget = false;

        // Garder une trace de l'ancienne position de la cible
        this.previousTargetCol = pTargetCol;
        this.previousTargetLine = pTargetLine;

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, pTargetCol, pTargetLine) {
        // Si l'ennemi a déjà atteint sa cible, ne pas mettre à jour
        if (this.hasReachedTarget) return;

        // Si la cible a changé de position, recalculer un nouveau chemin depuis la position actuelle
        if (this.previousTargetCol !== pTargetCol || this.previousTargetLine !== pTargetLine) {
            this.targetCol = pTargetCol;
            this.targetLine = pTargetLine;

            // Recalculer le chemin à partir de la position actuelle de l'ennemi
            this.path = this.pathfinding.findPath(
                { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                { x: this.targetCol, y: this.targetLine }
            );

            // Mettre à jour les positions cibles précédentes
            this.previousTargetCol = pTargetCol;
            this.previousTargetLine = pTargetLine;
        }

        if (!this.path || this.path.length === 0) {
            // Calcule un chemin s'il n'y en a pas
            this.path = this.pathfinding.findPath(
                { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                { x: this.targetCol, y: this.targetLine }
            );
        } else {
            let nextStep = this.path[0];
            let targetX = nextStep.x * myGrid.cellSize;
            let targetY = nextStep.y * myGrid.cellSize;

            // Distance à parcourir cette frame (calée sur le delta time)
            let moveDistance = this.spriteEnemy.speed * dt;

            // Distance actuelle vers la prochaine cellule
            let dx = targetX - this.spriteEnemy.x;
            let dy = targetY - this.spriteEnemy.y;

            let distToNextCell = Math.sqrt(dx * dx + dy * dy);

            if (moveDistance > distToNextCell) {
                // Aligner exactement sur la cellule suivante
                this.spriteEnemy.x = targetX;
                this.spriteEnemy.y = targetY;
                this.path.shift();  // On retire le prochain step une fois atteint

                // Vérifie si le chemin est vide
                if (this.path.length === 0) this.hasReachedTarget = true;
            } else {
                // Déplacement proportionnel à la distance restante
                this.spriteEnemy.x += (dx / distToNextCell) * moveDistance;
                this.spriteEnemy.y += (dy / distToNextCell) * moveDistance;
            }

            // Mettre à jour la position du sprite en termes de grille (col/line)
            this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
        }
    }
}
