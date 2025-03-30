class Enemy {
    constructor(pLine = 0, pCol = 0, pTargetCol, pTargetLine, pMap, pPathfinding) {
        this.map = pMap.getCurrentMapLevel();
        let imgEnemy = game.imageLoader.getImage("images/dalek_tile.png");
        this.spriteEnemy = new Sprite(imgEnemy);
        this.spriteEnemy.setTileSheet(40, 45);
        this.spriteEnemy.col = pCol;
        this.spriteEnemy.line = pLine;
        this.spriteEnemy.x = this.spriteEnemy.col * game.grid.cellSize;
        this.spriteEnemy.y = this.spriteEnemy.line * game.grid.cellSize;
        this.spriteEnemy.speed = game.grid.cellSize;

        this.imgHeight = imgEnemy.height;

        // ----- ANIMATIONS -----
        this.spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        this.spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);
        this.spriteEnemy.addAnimation("LEVITATE_RIGHT", [4, 5], 0.5);
        this.spriteEnemy.addAnimation("LEVITATE_LEFT", [6, 7], 0.5);

        // ----- propriétés utilisées pour le pathfinding -----
        this.targetCol = pTargetCol;
        this.targetLine = pTargetLine;

        this.path;
        this.pathfinding = pPathfinding;

        this.hasReachedTarget = false;
        this.isFalling = false;
        this.lockedX = this.spriteEnemy.x;

        // Garder une trace de l'ancienne position de la cible
        this.previousTargetCol = pTargetCol;
        this.previousTargetLine = pTargetLine;

        // Gestion de piège
        this.isTrapped = false;
        this.trappedTimer = 0;
        this.trappedAt = null;
        this.justFreed = false; // Flag pour protéger la sortie. "sécurité" pour garantir une frame entre enemy.Update et game.update

        // propriétés pour le gestion du ramassage des objets
        this.isCarryingItem = false;
        this.spriteKey = null;

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, pTargetCol, pTargetLine) {

        if (this.isTrapped) {
            this.trappedTimer -= dt;
            if (this.trappedTimer <= 0) {
                this.trappedTimer = 0;
            }
            return;
        }

        if (this.hasReachedTarget) return;

        if (!this.isFalling) {
            // Recalculer le chemin si la cible a changé de position et que l'ennemi n'est pas en chute
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
        let belowTile = game.map.getUnderEnemyID(this, 0, 1);

        //Vérifie si l'ennemi est bien centré sur la colonne actuelle
        const centerX = this.spriteEnemy.col * game.grid.cellSize;
        const isAlignedToColumn = Math.abs(this.spriteEnemy.x - centerX) < 0.1; // Tolérance pour éviter des imprécisions flottantes

        if ((belowTile === CONST.VOID || belowTile === CONST.OUT_OF_BOUNDS)
            && isAlignedToColumn && !this.isFalling && !this.justFreed) {
            this.startFalling();
        }

        // Mettre à jour spriteKey à chaque frame, avant et pendant tout mouvement
        if (this.spriteKey) {
            this.spriteKey.x = this.spriteEnemy.x;
            this.spriteKey.y = this.spriteEnemy.y;
        }

        if (this.isFalling) {
            this.handleFall(dt);
        } else {
            this.followPath(dt);
            this.justFreed = false;
        }
    }

    /**
     * Met à jour le chemin
     */
    updatePath() {
        // si hors du haut de l'écran ne rien faire
        if (this.spriteEnemy.y < 0) {
            this.path = []; // le chemin reste vide
            return;
        }

        this.path = this.pathfinding.findPath(
            { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
            { x: this.targetCol, y: this.targetLine },
            this.map,
            game.getConsumedTraps() // Passe les trous consommés
        );

        this.facePathDirection();
    }

    /**
     * Gère le mouvement en état de chute
     */
    startFalling() {
        this.isFalling = true;

        this.lockedX = this.spriteEnemy.x; // Verrou pour l'alignement pendant la chute
        this.spriteEnemy.x = this.lockedX;

        // Réalignement précis sur la grille
        this.spriteEnemy.x = Math.round(this.spriteEnemy.x / game.grid.cellSize) * game.grid.cellSize;
        this.spriteEnemy.y = Math.round(this.spriteEnemy.y / game.grid.cellSize) * game.grid.cellSize;


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
        const belowTile = game.map.getUnderEnemyID(this, 0, 1);

        if (belowTile === CONST.VOID || belowTile === CONST.OUT_OF_BOUNDS || this.spriteEnemy.y < 0) {
            // Continuer à tomber
            this.spriteEnemy.x = this.lockedX;
            this.spriteEnemy.y += this.spriteEnemy.speed * dt;
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / game.grid.cellSize);

            // Respawn si hors écran
            if (this.spriteEnemy.y >= game.map.y) {
                this.respawnAtTop();
            }
        } else {
            // Arrêter la chute si une case solide est atteinte
            this.isFalling = false;
            this.spriteEnemy.y = Math.round(this.spriteEnemy.y / game.grid.cellSize) * game.grid.cellSize;
            this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / game.grid.cellSize);
            this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / game.grid.cellSize);

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
            let targetX = nextStep.x * game.grid.cellSize;
            let targetY = nextStep.y * game.grid.cellSize;

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
                this.spriteEnemy.col = Math.floor(this.spriteEnemy.x / game.grid.cellSize);
                this.spriteEnemy.line = Math.floor(this.spriteEnemy.y / game.grid.cellSize);

                let currentTile = game.map.getUnderEnemyID(this, 0, 0);
                let belowTile = game.map.getUnderEnemyID(this, 0, 1);
                let aboveTile = game.map.getUnderEnemyID(this, 0, -1);

                // ramasser les items s'il y'en a
                if (currentTile === CONST.ITEM && !this.isCarryingItem) {
                    this.pickupItem();
                }

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

    pickupItem() {
        if (!this.isCarryingItem) {
            this.isCarryingItem = true;
            this.spriteKey = new Sprite(
                game.imageLoader.getImage("images/key.png"),
                this.spriteEnemy.x,
                this.spriteEnemy.y
            );
            let naturalWidth = this.spriteKey.img.naturalWidth;
            let naturalHeight = this.spriteKey.img.naturalHeight;
            this.spriteKey.setScale(15 / naturalWidth, 15 / naturalHeight);
            game.lstSprites.push(this.spriteKey);
            game.map.CollectItem(this.spriteEnemy.x, this.spriteEnemy.y);
            game.sndKey.play();
        }
    }

    dropItem() {
        if (this.isCarryingItem) {
            let dropTargetTile = game.map.getUnderEnemyID(this, 0, -1);
            game.map.DropItem(this.spriteEnemy.x, this.spriteEnemy.y, dropTargetTile);
            this.isCarryingItem = false;
            let index = game.lstSprites.indexOf(this.spriteKey);
            if (index !== -1) game.lstSprites.splice(index, 1);
            this.spriteKey = null;
        }
    }


    /**
     * 
     * gère le changement de l'animation en fonction de la direction prise par l'ennemi
     */

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
        let currentTile = game.map.getUnderEnemyID(this, 0, 0);
        let belowTile = game.map.getUnderEnemyID(this, 0, 1);
        let aboveTile = game.map.getUnderEnemyID(this, 0, -1);
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
     * gère la réaffectation des propriétés pour la réapparition de l'ennemi en haut de l'écran
     */
    respawnAtTop() {
        this.spriteEnemy.x = game.rnd(0, game.map.getMapNbColumns()) * game.grid.cellSize;
        this.lockedX = this.spriteEnemy.x;
        this.spriteEnemy.y = -this.imgHeight;
        this.isFalling = true;
        this.path = [];
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
                let targetX = step.x * game.grid.cellSize;
                let targetY = step.y * game.grid.cellSize;

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