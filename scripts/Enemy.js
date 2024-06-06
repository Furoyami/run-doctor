const VOID = 0;
const WALL = 1;
const LADDER = 2;
const KEY = 3;

class Enemy {
    constructor() {
        this.spriteEnemy = null;
        /* en créant le sprite comme ça ça évite de se retrouver au moment de l'update avec un seul zombie qui bouge car
        les autres valeurs de speed et velocity ont été écrasées par les dernières générées
        */
    }

    CreateEnemy(pLine = 0, pCol = 0) {
        let imgEnemy = imageLoader.getImage("images/dalek_tile.png");
        spriteEnemy = new Sprite(imgEnemy);
        spriteEnemy.setTileSheet(40, 41);
        spriteEnemy.x = pCol * myGrid.cellSize;
        spriteEnemy.y = pLine * myGrid.cellSize;
        spriteEnemy.vX = 0;
        spriteEnemy.vY = 0;
        spriteEnemy.dist = 0;
        spriteEnemy.lastVx = 0;
        spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);

        lstEnemies.push(spriteEnemy);
    }

    Update(dt) {
        lstEnemies.forEach(enemy => {
            enemy.update(dt);
        });

        // ---------- DEPLACEMENT ----------
        let playerPos = player.getPlayerPos();
        let playerX = playerPos[1] * myGrid.cellSize;
        let playerY = playerPos[0] * myGrid.cellSize;

        // droite
        if (playerX > spriteEnemy.x &&
            spriteEnemy.vX == 0 &&
            spriteEnemy.vY == 0 &&
            spriteEnemy.x < WIDTH - myGrid.cellSize &&
            myMap.getUnderEnemyID(0, 1) != VOID && myMap.getUnderEnemyID(1, 0) != WALL) {
            spriteEnemy.startAnimation("RIGHT");
            spriteEnemy.vX = 1.25;
            spriteEnemy.dist = 0;
        }

        //gauche
        if (playerX < spriteEnemy.x &&
            spriteEnemy.vX == 0 &&
            spriteEnemy.vY == 0 &&
            spriteEnemy.x > 0 &&
            myMap.getUnderEnemyID(0, 1) != VOID &&
            myMap.getUnderEnemyID(-1, 0) != WALL) {
            spriteEnemy.startAnimation("LEFT");
            spriteEnemy.vX = -1.25;
            spriteEnemy.dist = 0;
        }

        //bas
        if (playerY > spriteEnemy.y &&
            spriteEnemy.vX == 0 &&
            spriteEnemy.vY == 0 &&
            spriteEnemy.y < HEIGHT - 2 * myGrid.cellSize &&
            myMap.getUnderEnemyID(0, 1) == LADDER) {
            spriteEnemy.vY = 1.25;
            spriteEnemy.dist = 0;
        }

        //haut
        if (playerY < spriteEnemy.y &&
            spriteEnemy.vX == 0 &&
            spriteEnemy.vY == 0 &&
            spriteEnemy.y > 0 &&
            myMap.getUnderEnemyID(0, 0) == LADDER) {
            spriteEnemy.vY = -1.25;
            spriteEnemy.dist = 0;
        }

        // fais en sorte que le dalek prenne une échelle sous lui
        if (spriteEnemy.y < playerY &&
            myMap.getUnderEnemyID(0, 1) == LADDER &&
            spriteEnemy.x % myGrid.cellSize == 0 &&
            spriteEnemy.y % myGrid.cellSize == 0) {
            spriteEnemy.vY = 1.25;
            spriteEnemy.vX = 0;
            spriteEnemy.dist = 0;
        }

        // fais en sorte que le dalek prenne une échelle au dessus de lui
        if (spriteEnemy.y > playerY &&
            myMap.getUnderEnemyID(0, -1) == LADDER &&
            spriteEnemy.x % myGrid.cellSize == 0 &&
            spriteEnemy.y % myGrid.cellSize == 0) {
            spriteEnemy.vY = -1.25;
            spriteEnemy.vX = 0;
            spriteEnemy.dist = 0;
        }

        // force le dalek à s'arrêter sur les sols
        if (spriteEnemy.vY > 0 && myMap.getUnderEnemyID(0, 1) == WALL) {
            spriteEnemy.vY = 0;
        }

        // fais en sorte que le dalek change de sens s'il croise la player de trop près(lignes à virer en prod vu que le joueur meurt si il croise un ennemi)
        // if (spriteEnemy.vX > 0 && spriteEnemy.x > playerX && spriteEnemy.x % myGrid.cellSize == 0) {
        //     spriteEnemy.startAnimation("LEFT");
        //     spriteEnemy.vX = -1.25;
        //     spriteEnemy.dist = 0;
        // }

        // if (spriteEnemy.vX < 0 && spriteEnemy.x < playerX) {
        //     spriteEnemy.startAnimation("RIGHT");
        //     spriteEnemy.vX = 1.25;
        //     spriteEnemy.dist = 0;
        // }

        /*
            pour que le dalek "cherche" une solution, il faut que si sa distance verticale est différente de celle du joueur il continue d'avancer sur la ligne où il se trouve jusqu'à une échelle 
            et que s'il rencontre un vide, il fasse demi-tour au lieu de sauter
        */

        // évite à la vX et vY de switcher et d'osciller entre les anims
        if (playerX == spriteEnemy.x) {
            spriteEnemy.vX = 0;
            spriteEnemy.dist = 0;
        }

        if (playerY == spriteEnemy.y) {
            spriteEnemy.vY = 0;
            spriteEnemy.dist = 0;
        }
        // gère la chute
        if (myMap.getUnderEnemyID(0, 1) == VOID &&
            spriteEnemy.vX == 0 && spriteEnemy.vY == 0 &&
            spriteEnemy.x % myGrid.cellSize == 0 &&
            spriteEnemy.y % myGrid.cellSize == 0) {
            spriteEnemy.vX = 0;
            spriteEnemy.vY = 1.25;
        }

        // case par case
        spriteEnemy.dist += Math.abs(spriteEnemy.vX) + Math.abs(spriteEnemy.vY);
        if (spriteEnemy.vX != 0) {
            spriteEnemy.lastVx = spriteEnemy.vX;
            spriteEnemy.x += spriteEnemy.vX;
        }
        spriteEnemy.y += spriteEnemy.vY;
        if (spriteEnemy.dist >= myGrid.cellSize && spriteEnemy.y % myGrid.cellSize == 0) { // le modulo assure que le dalek ait fini de monter l'échelle avant de suivre à nouveau
            spriteEnemy.vX = 0;
            spriteEnemy.vY = 0;
            spriteEnemy.dist = 0;
        }

        console.log("id sous le dalek: " + myMap.getUnderEnemyID(0, 1));

    }

    Draw(pCtx) {
        lstEnemies.forEach(enemy => {
            enemy.draw(pCtx);
        });
    }

    getEnemyPos() {
        // retourne la colonne et la ligne actuelle de l'ennemi
        let enemyCol = Math.floor(spriteEnemy.x / myGrid.cellSize);// colonnes
        let enemyLine = Math.floor(spriteEnemy.y / myGrid.cellSize);
        return [enemyLine, enemyCol];
    }
}