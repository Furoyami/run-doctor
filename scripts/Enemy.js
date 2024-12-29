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

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, pTargetCol, pTargetLine) {
        // Vérifier si l'ennemi doit tomber
        const belowTile = myMap.getUnderEnemyID(this, 0, 1);
        if (belowTile === CONST.VOID && !this.isFalling) {
            this.startFalling();
        }

        // Si en chute, gérer la chute
        if (this.isFalling) {
            this.handleFall(dt);
            return; // Ne pas continuer le reste de l'update
        }

        // Logique de pathfinding si l'ennemi n'est pas en chute
        if (
            this.previousTargetCol !== pTargetCol ||
            this.previousTargetLine !== pTargetLine ||
            !this.currentPath ||
            this.currentPath.length === 0
        ) {
            this.targetCol = pTargetCol;
            this.targetLine = pTargetLine;
            this.updatePath();
        }

        this.followPath(dt);
    }


    updatePath() {
        this.path = this.pathfinding.findPath(
            { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
            { x: this.targetCol, y: this.targetLine }
        );
    }

    startFalling() {
        this.isFalling = true;

        // Réalignement précis sur la grille
        this.spriteEnemy.x = Math.round(this.spriteEnemy.x / myGrid.cellSize) * myGrid.cellSize;
        this.spriteEnemy.y = Math.round(this.spriteEnemy.y / myGrid.cellSize) * myGrid.cellSize;

        if (debug) console.log("Enemy starts falling at", this.spriteEnemy.col, this.spriteEnemy.line);

        // Ajouter une animation de chute si nécessaire
        this.spriteEnemy.startAnimation("FALL");
    }


    handleFall(dt) {
        const belowTile = myMap.getUnderEnemyID(this, 0, 1);

        if (belowTile === CONST.VOID) {
            // Continuer à tomber
            this.spriteEnemy.y += this.spriteEnemy.speed * dt;
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
        } else {
            // Arrêter la chute si une case solide est atteinte
            this.isFalling = false;
            this.spriteEnemy.y = Math.round(this.spriteEnemy.y / myGrid.cellSize) * myGrid.cellSize;
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
            this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);

            if (debug) console.log("Enemy stops falling at", this.spriteEnemy.col, this.spriteEnemy.line);

            // Recalculer le chemin après la chute
            this.updatePath();

            // Ajuster l'animation après la chute
            this.facePathDirection();
        }
    }


    /**
     * 
     * gère les contraintes de déplacement liées au pathfinding
     */
    followPath(dt) {
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

                // on retire l'étape terminée
                this.path.shift();

                // si au moins un element on verifie la direction pour ajuster le sens de l'animation
                if (this.path.length > 1) this.facePathDirection();

                if (this.path.length === 0) this.hasReachedTarget = true;
            } else {
                this.spriteEnemy.x += (dx / distToNextCell) * moveDistance;
                this.spriteEnemy.y += (dy / distToNextCell) * moveDistance;
            }

            this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
        }
    }

    facePathDirection() {
        if (!this.path || this.path.length < 2) return; //verifie qu'il y a au moins 2 éléments dans le path

        let currentStepX = this.path[0].x;
        let nextStepX = this.path[1].x;

        // gauche
        if (nextStepX < currentStepX) {
            this.spriteEnemy.startAnimation("LEFT", [2, 3], 0.5);
        }
        //droite
        if (nextStepX > currentStepX) {
            this.spriteEnemy.startAnimation("RIGHT", [0, 1], 0.5);
        }
    }

    getEnemyPos() {
        return [this.spriteEnemy.line, this.spriteEnemy.col];
    }

    /** Draw pathfinding for debug */
    drawPath(pCtx) {
        if (this.path && this.path.length > 0) {
            pCtx.save();
            pCtx.strokeStyle = 'red';
            pCtx.lineWidth = 2;
            pCtx.beginPath();

            for (let i = 0; i < this.path.length; i++) {
                let step = this.path[i];
                let targetX = step.x * myGrid.cellSize;
                let targetY = step.y * myGrid.cellSize;

                if (i === 0) {
                    pCtx.moveTo(this.spriteEnemy.x, this.spriteEnemy.y);
                } else {
                    pCtx.lineTo(targetX, targetY);
                }
            }

            pCtx.stroke();
            pCtx.restore();
        }
    }
}
