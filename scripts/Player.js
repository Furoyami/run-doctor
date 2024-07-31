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
        spritePlayer.lastVx = 0; // enregistre la dernière direction horizontale du perso
        spritePlayer.addAnimation("IDLE_RIGHT", [0, 1], 0.75);
        spritePlayer.addAnimation("IDLE_LEFT", [8, 9], 0.75);
        spritePlayer.addAnimation("RUN_RIGHT", [2, 3, 4], 0.1);
        spritePlayer.addAnimation("RUN_LEFT", [5, 6, 7], 0.1);
        spritePlayer.startAnimation("IDLE_RIGHT");

        return spritePlayer;
    }

    Update(dt) {
        //Creuser à gauche
        if (k_v && spritePlayer.vX == 0 && spritePlayer.vY == 0 && !myMap.isLadder(-1, 0)) {
            if (myMap.isWall(-1, 1)) {
                myMap.EmptyBrick(-1, 1);
                hole.CreatHole(-1, 1);
                return;
            };
        }

        //Creuser à droite
        if (k_b && spritePlayer.vX == 0 && spritePlayer.vY == 0 && !myMap.isLadder(1, 0)) {
            if (myMap.isWall(1, 1)) {
                myMap.EmptyBrick(1, 1);
                hole.CreatHole(1, 1);
                return;
            };
        }
        // Déplacement
        if (k_right && spritePlayer.vX == 0 && spritePlayer.vY == 0
            && spritePlayer.x < WIDTH - myGrid.cellSize
            && myMap.getUnderPlayerID(0, 1) != 0 && myMap.getUnderPlayerID(1, 0) != 1) {

            spritePlayer.startAnimation("RUN_RIGHT");
            spritePlayer.vX = 2.5;
            spritePlayer.dist = 0;
        }

        if (k_left && spritePlayer.vX == 0 && spritePlayer.vY == 0
            && spritePlayer.x > 0
            && myMap.getUnderPlayerID(0, 1) != 0 && myMap.getUnderPlayerID(-1, 0) != 1) {

            spritePlayer.startAnimation("RUN_LEFT");
            spritePlayer.vX = - 2.5;
            spritePlayer.dist = 0;
        }

        if (k_up && spritePlayer.vX == 0 && spritePlayer.vY == 0 && myMap.isLadder(0, 0)) {
            spritePlayer.vY = -2.5;
        }

        if (k_down && spritePlayer.vX == 0 && spritePlayer.vY == 0 && myMap.isLadder(0, 1)) {
            spritePlayer.vY = 2.5;
        }
        // gère la chute
        if (myMap.getUnderPlayerID(0, 1) == 0 && spritePlayer.vX == 0 && spritePlayer.vY == 0) {
            spritePlayer.vX = 0;
            spritePlayer.vY = 2.5;
        }
        // gère le déplacement case par case
        spritePlayer.dist += Math.abs(spritePlayer.vX) + Math.abs(spritePlayer.vY);
        if (spritePlayer.vX != 0) {
            spritePlayer.lastVx = spritePlayer.vX;
            spritePlayer.x += spritePlayer.vX;
        }
        spritePlayer.y += spritePlayer.vY;
        if (spritePlayer.dist >= myGrid.cellSize) {
            spritePlayer.vX = 0;
            spritePlayer.vY = 0;
            spritePlayer.dist = 0;
        }
        // ramasse les clés
        if (myMap.getUnderPlayerID(0, 0) == 3 && spritePlayer.vX == 0) {
            myMap.CollectKey(spritePlayer.x, spritePlayer.y);
            sndKey.play();
        }
        // charge le niveau suivant si le joueur atteint le TARDIS
        if ((myMap.getUnderPlayerID(0, 0) == 4 || myMap.getUnderPlayerID(0, 0) == 5 ||
            myMap.getUnderPlayerID(0, 0) == 6 || myMap.getUnderPlayerID(0, 0) == 7)
            && spritePlayer.vX == 0 && myMap.getNbKeysInLevel() == 0) {
            myMap.InitMap(1);
            spritePlayer.x = (WIDTH / 2) - (3 * myGrid.cellSize);// <-- nombre de case retirées du placement original
            spritePlayer.y = HEIGHT - (2 * myGrid.cellSize);//  2* pour ne pas le placer dans le sol
        }
        // réinit le lvl si on tombe hors écran
        if ((spritePlayer.y / myGrid.cellSize) >= (HEIGHT - myGrid.cellSize) / myGrid.cellSize) {
            myMap.InitMap(1);
            spritePlayer.x = (WIDTH / 2) - (3 * myGrid.cellSize);// <-- nombre de case retirées du placement original
            spritePlayer.y = HEIGHT - (2 * myGrid.cellSize);//  2* pour ne pas le placer dans le sol
        }
    }

    getPlayerPos() {
        // retourne la case et ligne actuelles du joueur
        let playerCol = Math.floor(spritePlayer.x / myGrid.cellSize);
        let playerLine = Math.floor(spritePlayer.y / myGrid.cellSize);
        return [playerLine, playerCol];
    }
}