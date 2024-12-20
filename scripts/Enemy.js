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
        if (this.hasReachedTarget) return;

        // Recalculer le chemin si la cible a changé de position et n'est pas en chute
        if (this.previousTargetCol !== pTargetCol || this.previousTargetLine !== pTargetLine) {
            this.targetCol = pTargetCol;
            this.targetLine = pTargetLine;

            this.path = this.pathfinding.findPath(
                { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                { x: this.targetCol, y: this.targetLine }
            );

            this.previousTargetCol = pTargetCol;
            this.previousTargetLine = pTargetLine;

            this.facePlayerDirection();
        }
        // Si aucun chemin ou chemin vide, recalculer pour éviter un blocage
        if (!this.path || this.path.length === 0) {
            this.path = this.pathfinding.findPath(
                { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                { x: this.targetCol, y: this.targetLine }
            );
        }

        // Gestion des chutes et vérifications des VOID
        let belowTile = myMap.getUnderEnemyID(this, 0, 1);

        if ((belowTile === CONST.FALL_ONLY_VOID || belowTile === CONST.WALKABLE_VOID) && !this.isFalling) {
            if (belowTile === CONST.FALL_ONLY_VOID) {
                this.startFalling();
            } else if (belowTile === CONST.WALKABLE_VOID) {
                const supportTile = myMap.getUnderEnemyID(this, 0, 2); // Vérifie la case sous la case VOID
                if (supportTile === CONST.WALL) {
                    // WALKABLE_VOID franchissable, continuer
                } else {
                    this.startFalling();
                }
            }
        }

        if (this.isFalling) {
            this.handleFall(dt);
        } else {
            this.handlePathfinding(dt);
        }
    }

    startFalling() {
        this.isFalling = true;
        this.fallingCoords = this.getEnemyPos();
        this.lockedX = this.spriteEnemy.x;
        this.spriteEnemy.startAnimation("FALL");
    }

    handleFall(dt) {
        let belowTile = myMap.getUnderEnemyID(this, 0, 1);

        if (belowTile === CONST.FALL_ONLY_VOID || belowTile === CONST.WALKABLE_VOID) {
            this.spriteEnemy.x = this.lockedX;
            this.spriteEnemy.y += this.spriteEnemy.speed * dt;
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
        } else {
            this.isFalling = false;
            this.spriteEnemy.y = Math.round(this.spriteEnemy.y / myGrid.cellSize) * myGrid.cellSize;
            this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);

            this.facePlayerDirection();

            this.path = this.pathfinding.findPath(
                { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                { x: this.targetCol, y: this.targetLine }
            );
        }
    }

    handlePathfinding(dt) {
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
                this.path.shift();

                if (this.path.length === 0) this.hasReachedTarget = true;
            } else {
                this.spriteEnemy.x += (dx / distToNextCell) * moveDistance;
                this.spriteEnemy.y += (dy / distToNextCell) * moveDistance;
            }

            this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
        }
    }

    facePlayerDirection() {
        if (this.spriteEnemy.col > this.targetCol) {
            this.spriteEnemy.startAnimation("LEFT");
        } else if (this.spriteEnemy.col < this.targetCol) {
            this.spriteEnemy.startAnimation("RIGHT");
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
