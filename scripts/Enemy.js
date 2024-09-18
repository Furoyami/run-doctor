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
        // this.spriteEnemy.vX = 0;
        // this.spriteEnemy.vY = 0;
        // this.spriteEnemy.dist = 0;
        // this.spriteEnemy.lastVx = 0;
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
        } else {
            let nextStep = this.path[0];
            let targetX = nextStep.x * myGrid.cellSize;
            let targetY = nextStep.y * myGrid.cellSize;

            // Distance à parcourir cette frame (calée sur le delta time)
            let moveDistance = this.spriteEnemy.speed * dt;

            // Vérifier si l'ennemi est aligné sur la grille en X
            let isAlignedOnGridX = (this.spriteEnemy.x % myGrid.cellSize === 0);

            // Vérifier la case sous l'ennemi
            let belowTile = myMap.getUnderEnemyID(this, 0, 1); // Case directement en dessous de l'ennemi

            // Si l'ennemi est en chute
            if (belowTile === CONST.VOID && !this.isFalling && isAlignedOnGridX) {
                this.isFalling = true;  // Activer l'état de chute
                this.fallingCoords = this.getEnemyPos(); // Sauvegarder la colonne lors de l'activation de la chute
                this.lockedX = this.spriteEnemy.x; // Verrouiller la position X
            }

            if (this.isFalling) {
                // Gestion de la chute : on vérifie continuellement la case sous l'ennemi
                belowTile = myMap.getUnderEnemyID(this, 0, 1); // Récupérer la case sous l'ennemi à chaque frame

                if (belowTile === CONST.VOID) {
                    // L'ennemi tombe verticalement
                    this.spriteEnemy.x = this.lockedX; // Bloquer la position X
                    this.spriteEnemy.y += this.spriteEnemy.speed * dt; // Mouvement en Y

                    // Actualiser la ligne actuelle pour éviter qu'il passe à travers une case solide
                    this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
                } else {
                    // Si une case solide est détectée, l'ennemi se stabilise
                    this.isFalling = false;
                    this.spriteEnemy.y = Math.floor(this.spriteEnemy.y / myGrid.cellSize) * myGrid.cellSize; // Alignement parfait sur la grille

                    // Mettre à jour la position de l'ennemi en grille (colonne et ligne)
                    this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
                    this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);

                    // Recalculer le pathfinding après stabilisation
                    this.path = this.pathfinding.findPath(
                        { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                        { x: this.targetCol, y: this.targetLine }
                    );
                }
            } else {
                // Mouvement normal selon le pathfinding
                let dx = targetX - this.spriteEnemy.x;
                let dy = targetY - this.spriteEnemy.y;
                let distToNextCell = Math.sqrt(dx * dx + dy * dy);

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
