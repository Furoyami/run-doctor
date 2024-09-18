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

        this.spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        this.spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);

        // ----- propriétés utilisées pour le pathfinding -----
        this.targetCol = pTargetCol;
        this.targetLine = pTargetLine;

        this.path;
        this.pathfinding = new Pathfinding(this.map);

        this.hasReachedTarget = false;
        this.isFalling = false;
        this.fallingCoords = { col: null, line: null };

        // Garder une trace de l'ancienne position de la cible
        this.previousTargetCol = pTargetCol;
        this.previousTargetLine = pTargetLine;

        this.facePlayerDirection();

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, pTargetCol, pTargetLine) {
        // Si l'ennemi a déjà atteint sa cible, ne pas mettre à jour
        if (this.hasReachedTarget) return;

        // On ne met à jour le pathfinding que si l'ennemi n'est pas en chute
        if (!this.isFalling) {
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

                this.facePlayerDirection();
            }

            // Si le chemin n'existe pas ou est vide, recalculer
            if (!this.path || this.path.length === 0) {
                this.path = this.pathfinding.findPath(
                    { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                    { x: this.targetCol, y: this.targetLine }
                );
            }
        }

        // Si l'ennemi est en chute, désactiver le pathfinding et forcer la chute uniquement
        let tolerance = 1; // Marge de tolérance pour la détection de la case sous l'ennemi
        let belowTile = myMap.getUnderEnemyID(this, 0, tolerance); // Case directement en dessous de l'ennemi

        if (belowTile === CONST.VOID && !this.isFalling) {
            this.isFalling = true;  // Activer l'état de chute
            this.fallingCoords = this.getEnemyPos(); // Sauvegarder la colonne lors de l'activation de la chute
            this.lockedX = this.spriteEnemy.x; // Verrouiller la position X
            this.spriteEnemy.startAnimation("FALL");  // Lancer l'animation de chute (si disponible)
        }

        if (this.isFalling) {
            belowTile = myMap.getUnderEnemyID(this, 0, tolerance); // Vérification continue de la case sous l'ennemi

            if (belowTile === CONST.VOID) {
                // L'ennemi tombe verticalement
                this.spriteEnemy.x = this.lockedX; // Bloquer la position X
                this.spriteEnemy.y += this.spriteEnemy.speed * dt; // Mouvement en Y

                // Mise à jour de la ligne actuelle
                this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
            } else {
                // Si une case solide est détectée, l'ennemi se stabilise
                this.isFalling = false;
                this.spriteEnemy.y = Math.round(this.spriteEnemy.y / myGrid.cellSize) * myGrid.cellSize; // Alignement sur la grille

                // Reprendre l'animation normale (en fonction de la direction)
                this.facePlayerDirection();

                // Mettre à jour la position de l'ennemi en grille (colonne et ligne)
                this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
                this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);

                // Recalculer le pathfinding après stabilisation uniquement si un chemin existe
                this.path = this.pathfinding.findPath(
                    { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                    { x: this.targetCol, y: this.targetLine }
                );
            }
        } else {
            // Mouvement normal selon le pathfinding
            if (this.path && this.path.length > 0) {
                let nextStep = this.path[0];
                let targetX = nextStep.x * myGrid.cellSize;
                let targetY = nextStep.y * myGrid.cellSize;

                let dx = targetX - this.spriteEnemy.x;
                let dy = targetY - this.spriteEnemy.y;
                let distToNextCell = Math.sqrt(dx * dx + dy * dy);
                let moveDistance = this.spriteEnemy.speed * dt;

                if (moveDistance > distToNextCell) {
                    this.spriteEnemy.x = targetX;
                    this.spriteEnemy.y = targetY;
                    this.path.shift();  // Supprimer le prochain step une fois atteint

                    if (this.path.length === 0) this.hasReachedTarget = true;
                } else {
                    this.spriteEnemy.x += (dx / distToNextCell) * moveDistance;
                    this.spriteEnemy.y += (dy / distToNextCell) * moveDistance;
                }

                // Mise à jour des coordonnées de la grille
                this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
                this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
            }
        }
    }


    /**
     * 
     * Déclenche l'animation de l'ennemi en fonction de sa position par rapport au joueur
     */
    facePlayerDirection() {
        if (this.spriteEnemy.col > this.targetCol) {
            this.spriteEnemy.startAnimation("LEFT");
        } else if (this.spriteEnemy.col < this.targetCol) {
            this.spriteEnemy.startAnimation("RIGHT");
        }
    }

    /**
     * 
     * @returns table with enmy col & line
     */
    getEnemyPos() {
        let enemyCol = this.spriteEnemy.col;
        let enemyLine = this.spriteEnemy.line;
        return [enemyLine, enemyCol];
    }

}
