class Player {
    constructor() {
    }

    CreatePlayer() {
        // création du joueur
        let imgPlayer = imageLoader.getImage("images/doctor_tile.png");
        spritePlayer = new Sprite(imgPlayer);
        spritePlayer.setTileSheet(40, 40);
        spritePlayer.x = (WIDTH / 2) - (3 * myGrid.cellSize);// <-- nombre de case retirées du placement original
        spritePlayer.y = HEIGHT - (2 * myGrid.cellSize);//  2* pour ne pas le placer dans le sol
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
        spritePlayer.addAnimation("CLIMB", [10, 11, 12, 13], 0.1);
        spritePlayer.addAnimation("FALL_RIGHT", [14, 15, 16, 17], 0.15);
        spritePlayer.addAnimation("FALL_LEFT", [18, 19, 20, 21], 0.15);

        spritePlayer.startAnimation("IDLE_RIGHT");


        return spritePlayer;
    }

    Update(dt) {
        // Vérifie les cases sous le joueur
        const tileUnderPlayer = myMap.getUnderPlayerID(0, 1);
        const FALLVOID = tileUnderPlayer === CONST.VOID;

        this.setOffsetX();

        const isLadderCurrent = myMap.isLadder(spritePlayer.offsetX, 0);
        const isLadderBelow = myMap.isLadder(0, 1); // Échelle sous le joueur
        const isLadderNext = myMap.isLadder(spritePlayer.offsetX, 0); // echelle dans la direction de déplacement

        // Ignorer les touches haut et bas si le joueur n'est pas sur ou proche d'une échelle
        if (!isLadderBelow && !isLadderCurrent && !isLadderNext) {
            k_up = false;
            k_down = false;
        }

        // CHUTE : Le joueur tombe uniquement si la case directement sous lui est vide
        if (FALLVOID && spritePlayer.vX === 0 && spritePlayer.vY === 0) {
            spritePlayer.vY = spritePlayer.speed; // Déclenche la chute
            if (spritePlayer.currentAnimation.name === "IDLE_RIGHT" || spritePlayer.currentAnimation.name === "RUN_RIGHT") {
                spritePlayer.startAnimation("FALL_RIGHT");
            } else if (spritePlayer.currentAnimation.name === "IDLE_LEFT" || spritePlayer.currentAnimation.name === "RUN_LEFT") {
                spritePlayer.startAnimation("FALL_LEFT");
            }
        }

        // Déplacements horizontaux (droite et gauche)
        if (k_right
            && spritePlayer.vX === 0
            && spritePlayer.vY === 0
            && spritePlayer.x < WIDTH - myGrid.cellSize
            && myMap.getUnderPlayerID(0, 1) !== CONST.VOID && myMap.getUnderPlayerID(1, 0) !== CONST.WALL) {

            spritePlayer.startAnimation("RUN_RIGHT");
            spritePlayer.vX = spritePlayer.speed;
            spritePlayer.dist = 0;
        }

        if (k_left
            && spritePlayer.vX === 0
            && spritePlayer.vY === 0
            && spritePlayer.x > 0
            && myMap.getUnderPlayerID(0, 1) !== CONST.VOID && myMap.getUnderPlayerID(-1, 0) !== CONST.WALL) {

            spritePlayer.startAnimation("RUN_LEFT");
            spritePlayer.vX = -spritePlayer.speed;
            spritePlayer.dist = 0;
        }

        // Grimpe les échelles
        if ((isLadderCurrent || isLadderNext) && k_up && spritePlayer.vX === 0 && spritePlayer.vY === 0) {
            spritePlayer.startAnimation("CLIMB");
            spritePlayer.vY = -spritePlayer.speed;
        }

        if (isLadderBelow && k_down && spritePlayer.vX === 0 && spritePlayer.vY === 0) {
            spritePlayer.startAnimation("CLIMB");
            spritePlayer.vY = spritePlayer.speed;
        }

        // Mise à jour des coordonnées du joueur 
        spritePlayer.dist += (Math.abs(spritePlayer.vX) + Math.abs(spritePlayer.vY)) * dt * 30;
        if (spritePlayer.vX !== 0) {
            spritePlayer.lastVx = spritePlayer.vX;
            spritePlayer.x += spritePlayer.vX * dt * 30;
        }
        spritePlayer.y += spritePlayer.vY * dt * 30;

        // Limite les mouvements à une case
        if (spritePlayer.dist >= myGrid.cellSize) {
            spritePlayer.vX = 0;
            spritePlayer.vY = 0;
            spritePlayer.dist = 0;

            // Réaligne le joueur sur une case
            spritePlayer.x = Math.round(spritePlayer.x / myGrid.cellSize) * myGrid.cellSize;
            spritePlayer.y = Math.round(spritePlayer.y / myGrid.cellSize) * myGrid.cellSize;



            // Stoppe l'animation "CLIMB" 
            if ((spritePlayer.currentAnimation.name === "CLIMB" && myMap.getUnderPlayerID(0, 0) !== CONST.LADDER) || // si le joueur est au dessus d'une échelle
                (spritePlayer.currentAnimation.name === "CLIMB" && myMap.getUnderPlayerID(0, 0) === CONST.LADDER && myMap.getUnderPlayerID(0, 1) === CONST.WALL)) { //si le joueur est en bas d'une échelle
                this.selectIdleDirection();
            }

            // Stoppe les animations "FALL" une fois au sol
            if (spritePlayer.currentAnimation.name.startsWith("FALL") && myMap.getUnderPlayerID(0, 1) !== CONST.VOID) {
                this.selectIdleDirection();
            }


            // Déclenche le "IDLE" si aucune touche active
            if (!k_right &&
                !k_left &&
                !k_up &&
                !k_down &&
                // empêche les activations du idle pendant la chute
                spritePlayer.currentAnimation.name !== "FALL_RIGHT" &&
                spritePlayer.currentAnimation.name !== "FALL_LEFT"
            ) {
                this.selectIdleDirection();
            }
        }

        // Ramasse les clés
        if (myMap.getUnderPlayerID(0, 0) === CONST.KEY && spritePlayer.vX === 0) {
            myMap.CollectKey(spritePlayer.x, spritePlayer.y);
            sndKey.play();
        }

        // Charge le niveau suivant si le joueur atteint le TARDIS
        if ((myMap.getUnderPlayerID(0, 0) === 4 || myMap.getUnderPlayerID(0, 0) === 5 ||
            myMap.getUnderPlayerID(0, 0) === 6 || myMap.getUnderPlayerID(0, 0) === 7)
            && spritePlayer.vX === 0 && myMap.getNbKeysInLevel() === 0) {

            // Reinit le jeu
            restartGame();
        }

        // Réinitialise le niveau si le joueur tombe hors écran
        if ((spritePlayer.y / myGrid.cellSize) >= (HEIGHT - myGrid.cellSize) / myGrid.cellSize) {
            myMap.InitMap(1);
            spritePlayer.x = (WIDTH / 2) - (3 * myGrid.cellSize);
            spritePlayer.y = HEIGHT - (2 * myGrid.cellSize);
        }

        console.log(spritePlayer.currentAnimation.name);

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
        return myMap.isLadder(spritePlayer.offsetX, 0);
    }

    // Retourne true si le joueur peut descendre (échelle sous le joueur)
    canMoveDown() {
        return myMap.isLadder(0, 1);
    }

    // retourne la case et ligne actuelles du joueur
    getPlayerPos() {
        let playerCol = Math.floor(spritePlayer.x / myGrid.cellSize);
        let playerLine = Math.floor(spritePlayer.y / myGrid.cellSize);
        return [playerLine, playerCol];
    }

    // renvoie si le joueur a fini son mouvement (après réalignement éventuel)
    isAligned() {
        return (
            spritePlayer.x % myGrid.cellSize === 0 &&
            spritePlayer.y % myGrid.cellSize === 0
        );
    }
}
