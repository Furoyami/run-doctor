class Player {
    constructor() {
    }

    CreatePlayer() {
        // création du joueur
        let imgPlayer = imageLoader.getImage("images/doctor_tile.png");
        spritePlayer = new Sprite(imgPlayer);
        spritePlayer.setTileSheet(40, 40);
        spritePlayer.x = (WIDTH / 2) - (3 * grid.cellSize);// <-- nombre de case retirées du placement original
        spritePlayer.y = HEIGHT - (2 * grid.cellSize);//  2* pour ne pas le placer dans le sol
        spritePlayer.vX = 0;
        spritePlayer.vY = 0;
        spritePlayer.dist = 0;
        spritePlayer.speed = 2.5;
        spritePlayer.lastVx = 0; // enregistre la dernière direction horizontale du perso
        spritePlayer.offsetX = null;
        // ---------------------------- ANIMATIONS -------------------------------
        spritePlayer.addAnimation("IDLE_RIGHT", [0, 1], 0.75);
        spritePlayer.addAnimation("IDLE_LEFT", [8, 9], 0.75);
        spritePlayer.addAnimation("RUN_RIGHT", [2, 3, 4], 0.1);
        spritePlayer.addAnimation("RUN_LEFT", [5, 6, 7], 0.1);
        spritePlayer.addAnimation("CLIMB", [10, 11, 12, 13], 0.1, 0);
        spritePlayer.addAnimation("FALL_RIGHT", [14, 15, 16, 17], 0.075);
        spritePlayer.addAnimation("FALL_LEFT", [18, 19, 20, 21], 0.075);
        spritePlayer.addAnimation("DIG_RIGHT", [22, 23], 0.05);
        spritePlayer.addAnimation("DIG_LEFT", [24, 25], 0.05);

        spritePlayer.startAnimation("IDLE_RIGHT");

        return spritePlayer;
    }

    Update(dt) {
        // Vérifie les cases sous le joueur
        const tileUnderPlayer = map.getUnderPlayerID(0, 1);
        const FALLVOID = tileUnderPlayer === CONST.VOID;

        this.setOffsetX();

        // CHUTE : Le joueur tombe uniquement si la case directement sous lui est vide
        if (FALLVOID && spritePlayer.vX === 0 && spritePlayer.vY === 0) {
            spritePlayer.vY = spritePlayer.speed; // Déclenche la chute
            if (spritePlayer.currentAnimation.name === "IDLE_RIGHT" || spritePlayer.currentAnimation.name === "RUN_RIGHT") {
                spritePlayer.startAnimation("FALL_RIGHT");
            } else if (spritePlayer.currentAnimation.name === "IDLE_LEFT" || spritePlayer.currentAnimation.name === "RUN_LEFT") {
                spritePlayer.startAnimation("FALL_LEFT");
            }
        }

        const isLadderCurrent = map.isLadder(spritePlayer.offsetX, 0);
        const isLadderBelow = map.isLadder(0, 1); // Échelle sous le joueur
        const isLadderNext = map.isLadder(spritePlayer.offsetX, 0); // echelle dans la direction de déplacement

        if (debug) console.log("Détection échelles - isLadderCurrent:", isLadderCurrent, "isLadderBelow:", isLadderBelow, "isLadderNext:", isLadderNext, "offsetX:", spritePlayer.offsetX, "x:", spritePlayer.x, "y:", spritePlayer.y);

        // Vérification et application des mouvements
        if (isDiggingDirection === null) {
            if (activeKeys.has("ArrowDown")) {
                if (player.canMoveDown()) player.moveDown(dt);
            }
            if (activeKeys.has("ArrowUp")) {
                if (player.canMoveUp()) player.moveUp(dt);
            }
            if (activeKeys.has("ArrowRight")) {
                if (spritePlayer.vX === 0 && spritePlayer.vY === 0 && spritePlayer.x < WIDTH - grid.cellSize) {
                    player.moveRight(dt);
                }
            }
            if (activeKeys.has("ArrowLeft")) {
                if (spritePlayer.vX === 0 && spritePlayer.vY === 0 && spritePlayer.x > 0) {
                    player.moveLeft(dt);
                }
            }
        }

        // Mise à jour des coordonnées du joueur 
        spritePlayer.dist += (Math.abs(spritePlayer.vX) + Math.abs(spritePlayer.vY)) * dt * 30;
        if (spritePlayer.vX !== 0) {
            spritePlayer.lastVx = spritePlayer.vX;
            spritePlayer.x += spritePlayer.vX * dt * 30;
        }
        spritePlayer.y += spritePlayer.vY * dt * 30;

        // Limite les mouvements à une case
        if (spritePlayer.dist >= grid.cellSize) {
            spritePlayer.vX = 0;
            spritePlayer.vY = 0;
            spritePlayer.dist = 0;

            // Réaligne le joueur sur une case
            spritePlayer.x = Math.round(spritePlayer.x / grid.cellSize) * grid.cellSize;
            spritePlayer.y = Math.round(spritePlayer.y / grid.cellSize) * grid.cellSize;

            // Stoppe l'animation "CLIMB" 
            if ((spritePlayer.currentAnimation.name === "CLIMB" && map.getUnderPlayerID(0, 0) !== CONST.LADDER) || // si le joueur est au dessus d'une échelle
                (spritePlayer.currentAnimation.name === "CLIMB" && map.getUnderPlayerID(0, 0) === CONST.LADDER && map.getUnderPlayerID(0, 1) === CONST.WALL)) { //si le joueur est en bas d'une échelle
                this.selectIdleDirection();
            }

            // Stoppe les animations "FALL" une fois au sol
            if (spritePlayer.currentAnimation.name.startsWith("FALL") && map.getUnderPlayerID(0, 1) !== CONST.VOID) {
                this.selectIdleDirection();
            }

            // Déclenche le "IDLE" si droite/auche inactif
            if (!activeKeys.has("ArrowRight") &&
                !activeKeys.has("ArrowLeft") &&
                // empêche les activations du idle pendant la chute
                spritePlayer.currentAnimation.name !== "FALL_RIGHT" &&
                spritePlayer.currentAnimation.name !== "FALL_LEFT" &&
                // empêche le idle de s'activer pendant une montée/ descente
                spritePlayer.currentAnimation.name !== "CLIMB"
            ) {
                this.selectIdleDirection();
            }
        }

        // Ramasse les clés
        if (map.getUnderPlayerID(0, 0) === CONST.KEY && spritePlayer.vX === 0) {
            map.CollectKey(spritePlayer.x, spritePlayer.y);
            sndKey.play();
        }

        // Charge le niveau suivant si le joueur atteint le TARDIS
        if ((map.getUnderPlayerID(0, 0) === 4 || map.getUnderPlayerID(0, 0) === 5 ||
            map.getUnderPlayerID(0, 0) === 6 || map.getUnderPlayerID(0, 0) === 7)
            && spritePlayer.vX === 0 && map.getNbKeysInLevel() === 0) {

            // Reinit le jeu
            restartGame();
        }

        // Réinitialise le niveau si le joueur tombe hors écran
        if ((spritePlayer.y / grid.cellSize) >= (HEIGHT - grid.cellSize) / grid.cellSize) {
            map.InitMap(1);
            spritePlayer.x = (WIDTH / 2) - (3 * grid.cellSize);
            spritePlayer.y = HEIGHT - (2 * grid.cellSize);
        }

    }

    // Déplacement à droite
    moveRight() {
        if (spritePlayer.vX === 0
            && spritePlayer.vY === 0
            && spritePlayer.x < WIDTH - grid.cellSize
            && map.getUnderPlayerID(0, 1) !== CONST.VOID && map.getUnderPlayerID(1, 0) !== CONST.WALL) {

            spritePlayer.startAnimation("RUN_RIGHT");
            spritePlayer.vX = spritePlayer.speed;
            spritePlayer.dist = 0;
        }
    }

    // Déplacement à gauche
    moveLeft() {
        if (spritePlayer.vX === 0
            && spritePlayer.vY === 0
            && spritePlayer.x > 0
            && map.getUnderPlayerID(0, 1) !== CONST.VOID && map.getUnderPlayerID(-1, 0) !== CONST.WALL) {

            spritePlayer.startAnimation("RUN_LEFT");
            spritePlayer.vX = -spritePlayer.speed;
            spritePlayer.dist = 0;
        }
    }

    // Descente d'une échelle
    moveDown() {
        if (spritePlayer.vX === 0 && spritePlayer.vY === 0) {
            spritePlayer.startAnimation("CLIMB");
            spritePlayer.vY = spritePlayer.speed;
            spritePlayer.vX = 0;
        }
    }

    // Montée d'une échelle
    moveUp() {
        if (spritePlayer.vX === 0 && spritePlayer.vY === 0) {
            spritePlayer.startAnimation("CLIMB");
            spritePlayer.vY = -spritePlayer.speed;
        }
    }

    // selectionne la direction du idle en fonction de la dernière direction connue
    selectIdleDirection() {
        if (spritePlayer.lastVx > 0) {
            spritePlayer.startAnimation("IDLE_RIGHT");
        } else {
            spritePlayer.startAnimation("IDLE_LEFT");
        }
    }

    // Ajuste l'offsetX pour compenser la différence de détection des tiles dûe à l'emplacement de l'origine du sprite (en haut a gauche)
    setOffsetX() {
        spritePlayer.offsetX;
        if (spritePlayer.vX > 0) {
            spritePlayer.offsetX = 1;
        } else {
            spritePlayer.offsetX = 0;
        }
    }

    // Retourne true si le joueur peut monter (case actuelle est une échelle)
    canMoveUp() {
        this.setOffsetX();
        return map.isLadder(spritePlayer.offsetX, 0);
    }

    // Retourne true si le joueur peut descendre (échelle sous le joueur)
    canMoveDown() {
        this.setOffsetX();
        return map.isLadder(spritePlayer.offsetX, 1);
    }

    // retourne la case et ligne actuelles du joueur
    getPlayerPos() {
        let playerCol = Math.floor(spritePlayer.x / grid.cellSize);
        let playerLine = Math.floor(spritePlayer.y / grid.cellSize);
        return [playerLine, playerCol];
    }

    // renvoie si le joueur a fini son mouvement (après réalignement éventuel)
    isAligned() {
        return (
            spritePlayer.x % grid.cellSize === 0 &&
            spritePlayer.y % grid.cellSize === 0
        );
    }
}
