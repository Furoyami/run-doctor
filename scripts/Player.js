class Player {
    constructor() {
        this.sprite = null;
        this.lives = 3;
        this.invincibilityTimer = 0; // Timer en secondes pour l’invincibilité
        this.isInvincible = false;   // État d’invincibilité
        this.blinkTimer = 0;
        this.blinkInterval = 0.2;   // clignotement
    }

    CreatePlayer() {
        // création du joueur
        let imgPlayer = game.imageLoader.getImage("images/doctor_tile.png");
        this.spritePlayer = new Sprite(imgPlayer);
        this.spritePlayer.setTileSheet(40, 40);
        this.spritePlayer.x = (game.width / 2) - (3 * game.grid.cellSize);// <-- nombre de case retirées du placement original
        this.spritePlayer.y = game.height - (2 * game.grid.cellSize);//  2* pour ne pas le placer dans le sol
        this.spritePlayer.startX = this.spritePlayer.x; // pour le resetPosition
        this.spritePlayer.startY = this.spritePlayer.y; // pour le resetPosition
        this.spritePlayer.vX = 0;
        this.spritePlayer.vY = 0;
        this.spritePlayer.dist = 0;
        this.spritePlayer.speed = 2.5;
        this.spritePlayer.lastVx = 0; // enregistre la dernière direction horizontale du perso
        this.spritePlayer.offsetX = null;

        // ---------------------------- ANIMATIONS -------------------------------
        this.spritePlayer.addAnimation("IDLE_RIGHT", [0, 1], 0.75);
        this.spritePlayer.addAnimation("IDLE_LEFT", [8, 9], 0.75);
        this.spritePlayer.addAnimation("RUN_RIGHT", [2, 3, 4], 0.1);
        this.spritePlayer.addAnimation("RUN_LEFT", [5, 6, 7], 0.1);
        this.spritePlayer.addAnimation("CLIMB", [10, 11, 12, 13], 0.1, 0);
        this.spritePlayer.addAnimation("FALL_RIGHT", [14, 15, 16, 17], 0.075);
        this.spritePlayer.addAnimation("FALL_LEFT", [18, 19, 20, 21], 0.075);
        this.spritePlayer.addAnimation("DIG_RIGHT", [22, 23], 0.05);
        this.spritePlayer.addAnimation("DIG_LEFT", [24, 25], 0.05);

        this.spritePlayer.startAnimation("IDLE_RIGHT");

        return this.spritePlayer;
    }

    Update(dt) {
        this.setOffsetX();

        // Vérifie les cases sous le joueur
        this.handleFall();

        // Si hors limites reset à la position de départ
        if (this.spritePlayer.y >= game.map.y) {
            this.playerDies();
        }
        this.setInvicibility(dt);

        // gestion clavier
        this.handleKeyOrder();

        // Mise à jour des coordonnées du joueur 
        this.updatePlayerCoords(dt);

        // Limite les mouvements à une case
        if (this.spritePlayer.dist >= game.grid.cellSize) {
            this.spritePlayer.vX = 0;
            this.spritePlayer.vY = 0;
            this.spritePlayer.dist = 0;

            // Réaligne le joueur sur une case
            this.spritePlayer.x = Math.round(this.spritePlayer.x / game.grid.cellSize) * game.grid.cellSize;
            this.spritePlayer.y = Math.round(this.spritePlayer.y / game.grid.cellSize) * game.grid.cellSize;

            this.handleAnimations();
        }

        this.getItems();

        // Charge le niveau suivant si le joueur atteint le TARDIS
        this.loadLevel();
    }

    handleFall() {
        const tileUnderPlayer = game.map.getUnderPlayerID(0, 1);
        const FALLVOID = tileUnderPlayer === CONST.VOID || tileUnderPlayer === CONST.OUT_OF_BOUNDS;

        // CHUTE : Le joueur tombe uniquement si la case directement sous lui est vide
        if (FALLVOID && this.spritePlayer.vX === 0 && this.spritePlayer.vY === 0) {
            this.spritePlayer.vY = this.spritePlayer.speed; // Déclenche la chute
            if (this.spritePlayer.currentAnimation.name === "IDLE_RIGHT" || this.spritePlayer.currentAnimation.name === "RUN_RIGHT") {
                this.spritePlayer.startAnimation("FALL_RIGHT");
            } else if (this.spritePlayer.currentAnimation.name === "IDLE_LEFT" || this.spritePlayer.currentAnimation.name === "RUN_LEFT") {
                this.spritePlayer.startAnimation("FALL_LEFT");
            }
        }
    }

    updatePlayerCoords(dt) {
        this.spritePlayer.dist += (Math.abs(this.spritePlayer.vX) + Math.abs(this.spritePlayer.vY)) * dt * 30;
        if (this.spritePlayer.vX !== 0) {
            this.spritePlayer.lastVx = this.spritePlayer.vX;
            this.spritePlayer.x += this.spritePlayer.vX * dt * 30;
        }
        this.spritePlayer.y += this.spritePlayer.vY * dt * 30;
    }

    handleKeyOrder() {
        if (game.isDiggingDirection === null && game.keyOrder.length > 0) {
            let moved = false;
            const topKey = game.keyOrder[0];

            // Tester la touche prioritaire 
            switch (topKey) {
                case "ArrowDown":
                    if (this.canMoveDown()) {
                        this.moveDown();
                        moved = true;
                    }
                    break;
                case "ArrowUp":
                    if (this.canMoveUp()) {
                        this.moveUp();
                        moved = true;
                    }
                    break;
                case "ArrowRight":
                    if (this.spritePlayer.vX === 0 && this.spritePlayer.vY === 0 && this.spritePlayer.x < game.width - game.grid.cellSize) {
                        this.moveRight();
                        moved = true;
                    }
                    break;
                case "ArrowLeft":
                    if (this.spritePlayer.vX === 0 && this.spritePlayer.vY === 0 && this.spritePlayer.x > 0) {
                        this.moveLeft();
                        moved = true;
                    }
                    break;
            }

            // Si topKey échoue, tester la touche suivante de keyOrder
            if (!moved && game.keyOrder.length > 1) {
                const nextKey = game.keyOrder[1];
                switch (nextKey) {
                    case "ArrowDown":
                        if (this.canMoveDown()) this.moveDown();
                        break;
                    case "ArrowUp":
                        if (this.canMoveUp()) this.moveUp();
                        break;
                    case "ArrowRight":
                        if (this.spritePlayer.vX === 0 && this.spritePlayer.vY === 0 && this.spritePlayer.x < game.width - game.grid.cellSize) {
                            this.moveRight();
                        }
                        break;
                    case "ArrowLeft":
                        if (this.spritePlayer.vX === 0 && this.spritePlayer.vY === 0 && this.spritePlayer.x > 0) {
                            this.moveLeft();
                        }
                        break;
                }
            }
        }
    }

    handleAnimations() {
        // Stoppe l'animation "CLIMB" 
        if ((this.spritePlayer.currentAnimation.name === "CLIMB" && game.map.getUnderPlayerID(0, 0) !== CONST.LADDER) || // si le joueur est au dessus d'une échelle
            (this.spritePlayer.currentAnimation.name === "CLIMB" && game.map.getUnderPlayerID(0, 0) === CONST.LADDER && game.map.getUnderPlayerID(0, 1) === CONST.WALL)) { //si le joueur est en bas d'une échelle
            this.selectIdleDirection();
        }

        // Stoppe les animations "FALL" une fois au sol
        if (this.spritePlayer.currentAnimation.name.startsWith("FALL") &&
            game.map.getUnderPlayerID(0, 1) !== CONST.VOID &&
            game.map.getUnderPlayerID(0, 1) !== CONST.OUT_OF_BOUNDS) {
            this.selectIdleDirection();
        }

        // Déclenche le "IDLE" si droite/gauche inactif
        if (!game.activeKeys.has("ArrowRight") &&
            !game.activeKeys.has("ArrowLeft") &&
            // empêche les activations du idle pendant la chute
            this.spritePlayer.currentAnimation.name !== "FALL_RIGHT" &&
            this.spritePlayer.currentAnimation.name !== "FALL_LEFT" &&
            // empêche le idle de s'activer pendant une montée/ descente
            this.spritePlayer.currentAnimation.name !== "CLIMB"
        ) {
            this.selectIdleDirection();
        }
    }

    getItems() {
        // Ramasse les clés
        if (game.map.getUnderPlayerID(0, 0) === CONST.ITEM && this.spritePlayer.vX === 0) {
            game.map.CollectItem(this.spritePlayer.x, this.spritePlayer.y);
            game.sndKey.play();
        }
    }

    loadLevel() {
        if ((game.map.getUnderPlayerID(0, 0) === 4 || game.map.getUnderPlayerID(0, 0) === 5 ||
            game.map.getUnderPlayerID(0, 0) === 6 || game.map.getUnderPlayerID(0, 0) === 7)
            && this.spritePlayer.vX === 0 && game.map.getNbItemsInLevel() === 0) {

            // Reinit le jeu
            game.restartGame();
        }
    }

    // Déplacement à droite
    moveRight() {
        if (this.spritePlayer.vX === 0
            && this.spritePlayer.vY === 0
            && this.spritePlayer.x < game.width - game.grid.cellSize
            && game.map.getUnderPlayerID(0, 1) !== CONST.VOID && game.map.getUnderPlayerID(1, 0) !== CONST.WALL) {

            this.spritePlayer.startAnimation("RUN_RIGHT");
            this.spritePlayer.vX = this.spritePlayer.speed;
            this.spritePlayer.dist = 0;
        }
    }

    // Déplacement à gauche
    moveLeft() {
        if (this.spritePlayer.vX === 0
            && this.spritePlayer.vY === 0
            && this.spritePlayer.x > 0
            && game.map.getUnderPlayerID(0, 1) !== CONST.VOID && game.map.getUnderPlayerID(-1, 0) !== CONST.WALL) {

            this.spritePlayer.startAnimation("RUN_LEFT");
            this.spritePlayer.vX = -this.spritePlayer.speed;
            this.spritePlayer.dist = 0;
        }
    }

    // Descente d'une échelle
    moveDown() {
        if (this.spritePlayer.vX === 0 && this.spritePlayer.vY === 0) {
            this.spritePlayer.startAnimation("CLIMB");
            this.spritePlayer.vY = this.spritePlayer.speed;
            this.spritePlayer.vX = 0;
        }
    }

    // Montée d'une échelle
    moveUp() {
        if (this.spritePlayer.vX === 0 && this.spritePlayer.vY === 0) {
            this.spritePlayer.startAnimation("CLIMB");
            this.spritePlayer.vY = -this.spritePlayer.speed;
        }
    }

    // selectionne la direction du idle en fonction de la dernière direction connue
    selectIdleDirection() {
        if (this.spritePlayer.lastVx > 0) {
            this.spritePlayer.startAnimation("IDLE_RIGHT");
        } else {
            this.spritePlayer.startAnimation("IDLE_LEFT");
        }
    }

    // Ajuste l'offsetX pour compenser la différence de détection des tiles dûe à l'emplacement de l'origine du sprite (en haut a gauche)
    setOffsetX() {
        this.spritePlayer.offsetX;
        if (this.spritePlayer.vX > 0) {
            this.spritePlayer.offsetX = 1;
        } else {
            this.spritePlayer.offsetX = 0;
        }
    }

    // Retourne true si le joueur peut monter (case actuelle est une échelle)
    canMoveUp() {
        this.setOffsetX();
        return game.map.isLadder(this.spritePlayer.offsetX, 0);
    }

    // Retourne true si le joueur peut descendre (échelle sous le joueur)
    canMoveDown() {
        this.setOffsetX();
        return game.map.isLadder(this.spritePlayer.offsetX, 1);
    }

    // retourne la case et ligne actuelles du joueur
    getPlayerPos() {
        if (this.spritePlayer !== undefined) {
            let playerCol = Math.floor(this.spritePlayer.x / game.grid.cellSize);
            let playerLine = Math.floor(this.spritePlayer.y / game.grid.cellSize);
            return [playerLine, playerCol];
        }
    }

    // renvoie si le joueur a fini son mouvement (après réalignement éventuel)
    isAligned() {
        return (
            this.spritePlayer.x % game.grid.cellSize === 0 &&
            this.spritePlayer.y % game.grid.cellSize === 0
        );
    }
    // remet le joueur à la position de départ en cas de mort
    resetPosition() {
        this.spritePlayer.x = this.spritePlayer.startX;
        this.spritePlayer.y = this.spritePlayer.startY;
        this.spritePlayer.vX = 0;
        this.spritePlayer.vY = 0;
        this.selectIdleDirection();
    }

    resetPlayer() {
        this.lives = 3;
        this.invincibilityTimer = 0; // Timer en secondes pour l’invincibilité
        this.isInvincible = false;   // État d’invincibilité
        this.blinkTimer = 0;
        this.blinkInterval = 0.2;   // clignotement
    }

    playerDies() {
        this.lives -= 1;
        if (this.lives >= 0) {
            this.isInvincible = true;
            this.blinkTimer = 0;
            this.resetPosition();
        } else {
            game.state = CONST.GAMEOVER;
        }
    }

    // gère l'état et le temps d'invicibilité
    setInvicibility(dt) {
        if (this.isInvincible) {
            this.invincibilityTimer += dt;      //timer invu
            this.blinkTimer += dt;              //timer de clignotement

            this.invincibilityBlink();

            if (this.invincibilityTimer >= 2) {
                this.isInvincible = false;
                this.invincibilityTimer = 0;
                this.blinkTimer = 0;
                this.spritePlayer.visible = true;
            }
        }

    }

    // gère l'anim de clignotement
    invincibilityBlink() {
        if (this.blinkTimer >= this.blinkInterval) {
            this.spritePlayer.visible = !this.spritePlayer.visible;
            this.blinkTimer = 0; // reset du timer
        }

    }
}
