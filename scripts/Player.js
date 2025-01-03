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
        spritePlayer.addAnimation("IDLE_RIGHT", [0, 1], 0.75);
        spritePlayer.addAnimation("IDLE_LEFT", [8, 9], 0.75);
        spritePlayer.addAnimation("RUN_RIGHT", [2, 3, 4], 0.1);
        spritePlayer.addAnimation("RUN_LEFT", [5, 6, 7], 0.1);
        spritePlayer.startAnimation("IDLE_RIGHT");


        return spritePlayer;
    }

    Update(dt) {
        // Récupère la position du joueur en cases
        const playerPos = this.getPlayerPos();
        const playerCol = playerPos[1];
        const playerLine = playerPos[0];

        // Vérifie les cases sous le joueur
        const tileUnderPlayer = myMap.getUnderPlayerID(0, 1);
        const FALLVOID = tileUnderPlayer === CONST.VOID;

        // CHUTE : Le joueur tombe uniquement si la case directement sous lui est vide
        if (FALLVOID && spritePlayer.vX === 0 && spritePlayer.vY === 0) {
            spritePlayer.vY = spritePlayer.speed; // Déclenche la chute
        }

        // Déplacements horizontaux (droite et gauche)
        if (k_right && spritePlayer.vX === 0 && spritePlayer.vY === 0
            && spritePlayer.x < WIDTH - myGrid.cellSize
            && myMap.getUnderPlayerID(0, 1) !== CONST.VOID && myMap.getUnderPlayerID(1, 0) !== CONST.WALL) {

            spritePlayer.startAnimation("RUN_RIGHT");
            spritePlayer.vX = spritePlayer.speed;
            spritePlayer.dist = 0;
        }

        if (k_left && spritePlayer.vX === 0 && spritePlayer.vY === 0
            && spritePlayer.x > 0
            && myMap.getUnderPlayerID(0, 1) !== CONST.VOID && myMap.getUnderPlayerID(-1, 0) !== CONST.WALL) {

            spritePlayer.startAnimation("RUN_LEFT");
            spritePlayer.vX = -spritePlayer.speed;
            spritePlayer.dist = 0;
        }

        // Grimpe les échelles
        if (k_up && spritePlayer.vX === 0 && spritePlayer.vY === 0 && myMap.isLadder(0, 0)) {
            spritePlayer.vY = -spritePlayer.speed;
        }

        if (k_down && spritePlayer.vX === 0 && spritePlayer.vY === 0 && myMap.isLadder(0, 1)) {
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
    }




    getPlayerPos() {
        // retourne la case et ligne actuelles du joueur
        let playerCol = Math.floor(spritePlayer.x / myGrid.cellSize);
        let playerLine = Math.floor(spritePlayer.y / myGrid.cellSize);
        return [playerLine, playerCol];
    }
}