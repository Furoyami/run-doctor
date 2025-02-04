class Enemy {
    constructor(pLine = 0, pCol = 0, pTargetCol, pTargetLine, pMap) {
        this.map = pMap.getCurrentMapLevel();
        let imgEnemy = imageLoader.getImage("images/dalek_tile.png");
        this.spriteEnemy = new Sprite(imgEnemy);
        this.spriteEnemy.setTileSheet(40, 45);
        this.spriteEnemy.col = pCol;
        this.spriteEnemy.line = pLine;
        this.spriteEnemy.x = this.spriteEnemy.col * myGrid.cellSize;
        this.spriteEnemy.y = this.spriteEnemy.line * myGrid.cellSize;
        this.spriteEnemy.speed = myGrid.cellSize;

        // ----- ANIMATIONS -----
        this.spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        this.spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);
        this.spriteEnemy.addAnimation("LEVITATE_RIGHT", [4, 5], 0.15);
        this.spriteEnemy.addAnimation("LEVITATE_LEFT", [6, 7], 0.15);

        // ----- propriétés utilisées pour le pathfinding -----
        this.targetCol = pTargetCol;
        this.targetLine = pTargetLine;

        this.path;
        this.pathfinding = new Pathfinding(this.map);

        this.hasReachedTarget = false;
        this.isFalling = false;
        this.lockedX = this.spriteEnemy.x;

        // Garder une trace de l'ancienne position de la cible
        this.previousTargetCol = pTargetCol;
        this.previousTargetLine = pTargetLine;

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, pTargetCol, pTargetLine) {
        if (this.hasReachedTarget) return;

        if (!this.isFalling) {
            // Recalculer le chemin si la cible a changé de position et n'est pas en chute
            if (this.previousTargetCol !== pTargetCol || this.previousTargetLine !== pTargetLine) {
                this.targetCol = pTargetCol;
                this.targetLine = pTargetLine;

                this.updatePath();

                this.previousTargetCol = pTargetCol;
                this.previousTargetLine = pTargetLine;

                this.facePathDirection();
            }
            // Si aucun chemin ou chemin vide, recalculer pour éviter un blocage
            if (!this.path || this.path.length === 0) {
                this.updatePath();
            }
        }

        // Gestion des chutes et vérifications des VOID
        let belowTile = myMap.getUnderEnemyID(this, 0, 1);

        //Vérifie si l'ennemi est bien centré sur la colonne actuelle
        const centerX = this.spriteEnemy.col * myGrid.cellSize;
        const isAlignedToColumn = Math.abs(this.spriteEnemy.x - centerX) < 0.1; // Tolérance pour éviter des imprécisions flottantes

        if (belowTile === CONST.VOID && isAlignedToColumn && !this.isFalling) {
            this.startFalling();
        }

        if (this.isFalling) {
            this.handleFall(dt);
        } else {
            this.followPath(dt);
        }
    }

    /**
     * Met à jour le chemin
     */
    updatePath() {
        this.path = this.pathfinding.findPath(
            { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
            { x: this.targetCol, y: this.targetLine }
        );
    }

    /**
     * Gère le mouvement en état de chute
     */
    startFalling() {
        this.isFalling = true;

        this.lockedX = this.spriteEnemy.x; // Verrou pour l'alignement pendant la chute
        this.spriteEnemy.x = this.lockedX;

        // Réalignement précis sur la grille
        this.spriteEnemy.x = Math.round(this.spriteEnemy.x / myGrid.cellSize) * myGrid.cellSize;
        this.spriteEnemy.y = Math.round(this.spriteEnemy.y / myGrid.cellSize) * myGrid.cellSize;

        if (debug) console.log("Enemy starts falling at", this.spriteEnemy.col, this.spriteEnemy.line);

        if (this.spriteEnemy.currentAnimation.name === "RIGHT") {
            this.spriteEnemy.startAnimation("LEVITATE_RIGHT");
        }
        else if (this.spriteEnemy.currentAnimation.name === "LEFT") {
            this.spriteEnemy.startAnimation("LEVITATE_LEFT");
        }

    }

    /**
     * 
     * gère l'état de chute 
     */
    handleFall(dt) {
        const belowTile = myMap.getUnderEnemyID(this, 0, 1);

        if (belowTile === CONST.VOID) {
            // Continuer à tomber
            this.spriteEnemy.x = this.lockedX;
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

            // Coordonnées cibles en pixels
            let targetX = nextStep.x * myGrid.cellSize;
            let targetY = nextStep.y * myGrid.cellSize;

            let dx = targetX - this.spriteEnemy.x;
            let dy = targetY - this.spriteEnemy.y;
            let moveDistance = this.spriteEnemy.speed * dt;

            // Alignement sur X ou Y avant tout déplacement dans une autre direction
            let isAlignedX = Math.abs(dx) < 0.1; // Tolérance pour considérer l'alignement
            let isAlignedY = Math.abs(dy) < 0.1;

            if (!isAlignedX) {
                // Mouvement prioritaire sur l'axe X
                this.spriteEnemy.x += Math.sign(dx) * Math.min(Math.abs(dx), moveDistance);
            } else if (!isAlignedY) {
                // Mouvement sur l'axe Y une fois aligné sur X
                this.spriteEnemy.y += Math.sign(dy) * Math.min(Math.abs(dy), moveDistance);
            }

            // Vérifier si le déplacement sur la cellule cible est terminé
            if (isAlignedX && isAlignedY) {
                // Passage à la case suivante
                this.spriteEnemy.x = targetX;
                this.spriteEnemy.y = targetY;
                this.path.shift();

                // Mise à jour des coordonnées de la grille
                this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
                this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / myGrid.cellSize);

                let currentTile = myMap.getUnderEnemyID(this, 0, 0);
                let belowTile = myMap.getUnderEnemyID(this, 0, 1);
                let aboveTile = myMap.getUnderEnemyID(this, 0, -1);
                if (currentTile === CONST.LADDER || belowTile === CONST.LADDER || aboveTile === CONST.LADDER) {
                    if (this.spriteEnemy.currentAnimation.name === "RIGHT") {
                        this.spriteEnemy.startAnimation("LEVITATE_RIGHT");
                    }
                    else if (this.spriteEnemy.currentAnimation.name === "LEFT") {
                        this.spriteEnemy.startAnimation("LEVITATE_LEFT");
                    }
                }

                // Ajuster l'animation pour la prochaine direction
                if (this.path.length > 0) {
                    this.facePathDirection();
                } else {
                    this.hasReachedTarget = true; // Si le chemin est vide, la cible est atteinte
                }
            }
        }
    }


    /**
     * 
     * gère le changemen de l'animation en fonction de la direction prise par l'ennemi
     */
    // facePathDirection() {
    //     if (!this.path || this.path.length === 0) {
    //         // si aucun chemin on sort de la fonction
    //         return;
    //     }

    //     // Vérification directionnelle
    //     const currentStep = this.path[0];
    //     const nextStep = this.path[1];

    //     if (!nextStep) return; // Pas d'étape suivante, pas besoin de changer la direction

    //     const dx = nextStep.x - currentStep.x;

    //     if (dx > 0) {
    //         this.spriteEnemy.startAnimation("RIGHT");
    //     } else if (dx < 0) {
    //         this.spriteEnemy.startAnimation("LEFT");
    //     }

    // }

    facePathDirection() {
        if (!this.path || this.path.length <= 1) {
            // si aucun chemin ou une seule étape, on sort de la fonction
            return;
        }

        // Vérification directionnelle
        const currentStep = this.path[0];
        const nextStep = this.path[1];

        const dx = nextStep.x - currentStep.x;

        // Vérifier si l'ennemi est sur une échelle
        let currentTile = myMap.getUnderEnemyID(this, 0, 0);
        let belowTile = myMap.getUnderEnemyID(this, 0, 1);
        let aboveTile = myMap.getUnderEnemyID(this, 0, -1);
        if (currentTile === CONST.LADDER || belowTile === CONST.LADDER || aboveTile === CONST.LADDER) {
            if (dx > 0) {
                this.spriteEnemy.startAnimation("LEVITATE_RIGHT");
            } else if (dx < 0) {
                this.spriteEnemy.startAnimation("LEVITATE_LEFT");
            }
        } else {
            // Si l'ennemi n'est pas sur une échelle, utiliser les animations normales
            if (dx > 0) {
                this.spriteEnemy.startAnimation("RIGHT");
            } else if (dx < 0) {
                this.spriteEnemy.startAnimation("LEFT");
            }
        }
    }

    /**
     * 
     * @returns renvoie un tableau contenant la ligne et la colonne de l'ennemi
     */
    getEnemyPos() {
        return [this.spriteEnemy.line, this.spriteEnemy.col];
    }


    /**
     *  Dessine le PF pour debug 
     */
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