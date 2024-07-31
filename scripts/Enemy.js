const VOID = 0;
const WALL = 1;
const LADDER = 2;
const KEY = 3;

class Enemy {
    constructor() {
        this.spriteEnemy = null;
    }

    CreateEnemy(pLine = 0, pCol = 0, pindex) {
        let imgEnemy = imageLoader.getImage("images/dalek_tile.png");
        this.spriteEnemy = new Sprite(imgEnemy);
        this.spriteEnemy.setTileSheet(40, 41);
        this.spriteEnemy.x = pCol * myGrid.cellSize;
        this.spriteEnemy.y = pLine * myGrid.cellSize;
        this.spriteEnemy.vX = 0;
        this.spriteEnemy.vY = 0;
        this.spriteEnemy.dist = 0;
        this.spriteEnemy.lastVx = 0;
        this.spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        this.spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);
        this.spriteEnemy.id = pindex;

        console.log("----- Enemy créé -----");
        return this.spriteEnemy;
    }

    Update(dt) {

        // ---------- DEPLACEMENT ----------
        // recupère les posisitions du joueur pour indiquer à l'ennmi où aller
        let playerPos = player.getPlayerPos();
        let playerX = playerPos[1] * myGrid.cellSize;
        let playerY = playerPos[0] * myGrid.cellSize;

        // droite
        if (playerX > this.spriteEnemy.x &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.x < WIDTH - myGrid.cellSize &&
            myMap.getUnderEnemyID(0, 1) != VOID && myMap.getUnderEnemyID(1, 0) != WALL) {
            this.spriteEnemy.startAnimation("RIGHT");
            this.spriteEnemy.vX = 1.25;
            this.spriteEnemy.dist = 0;
        }

        //gauche
        if (playerX < this.spriteEnemy.x &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.x > 0 &&
            myMap.getUnderEnemyID(0, 1) != VOID &&
            myMap.getUnderEnemyID(-1, 0) != WALL) {
            this.spriteEnemy.startAnimation("LEFT");
            this.spriteEnemy.vX = -1.25;
            this.spriteEnemy.dist = 0;
        }

        //bas
        if (playerY > this.spriteEnemy.y &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.y < HEIGHT - 2 * myGrid.cellSize &&
            myMap.getUnderEnemyID(0, 1) == LADDER) {
            this.spriteEnemy.vY = 1.25;
            this.spriteEnemy.dist = 0;
        }

        //haut
        if (playerY < this.spriteEnemy.y &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.y > 0 &&
            myMap.getUnderEnemyID(0, 0) == LADDER) {
            this.spriteEnemy.vY = -1.25;
            this.spriteEnemy.dist = 0;
        }

        // fais en sorte que le dalek prenne une échelle sous lui
        if (this.spriteEnemy.y < playerY &&
            myMap.getUnderEnemyID(0, 1) == LADDER &&
            this.spriteEnemy.x % myGrid.cellSize == 0 &&
            this.spriteEnemy.y % myGrid.cellSize == 0) {
            this.spriteEnemy.vY = 1.25;
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.dist = 0;
        }

        // fais en sorte que le dalek prenne une échelle au dessus de lui
        if (this.spriteEnemy.y > playerY &&
            myMap.getUnderEnemyID(0, -1) == LADDER &&
            this.spriteEnemy.x % myGrid.cellSize == 0 &&
            this.spriteEnemy.y % myGrid.cellSize == 0) {
            this.spriteEnemy.vY = -1.25;
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.dist = 0;
        }

        // force le dalek à s'arrêter sur les sols
        if (this.spriteEnemy.vY > 0 && myMap.getUnderEnemyID(0, 1) == WALL) {
            this.spriteEnemy.vY = 0;
        }

        // fais en sorte que le dalek change de sens s'il croise la player de trop près(lignes à virer en prod vu que le joueur meurt si il croise un ennemi)
        // if (this.spriteEnemy.vX > 0 && this.spriteEnemy.x > playerX && this.spriteEnemy.x % myGrid.cellSize == 0) {
        //     this.spriteEnemy.startAnimation("LEFT");
        //     this.spriteEnemy.vX = -1.25;
        //     this.spriteEnemy.dist = 0;
        // }

        // if (this.spriteEnemy.vX < 0 && this.spriteEnemy.x < playerX) {
        //     this.spriteEnemy.startAnimation("RIGHT");
        //     this.spriteEnemy.vX = 1.25;
        //     this.spriteEnemy.dist = 0;
        // }

        /*
            pour que le dalek "cherche" une solution, il faut que si sa distance verticale est différente de celle du joueur il continue d'avancer sur la ligne où il se trouve jusqu'à une échelle 
            et que s'il rencontre un vide, il fasse demi-tour au lieu de sauter
        */

        // évite à la vX et vY de switcher et d'osciller entre les anims
        if (playerX == this.spriteEnemy.x) {
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.dist = 0;
        }

        if (playerY == this.spriteEnemy.y) {
            this.spriteEnemy.vY = 0;
            this.spriteEnemy.dist = 0;
        }
        // gère la chute
        if (myMap.getUnderEnemyID(0, 1) == VOID &&
            this.spriteEnemy.vX == 0 && this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.x % myGrid.cellSize == 0 &&
            this.spriteEnemy.y % myGrid.cellSize == 0) {
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.vY = 1.25;
        }

        // case par case
        this.spriteEnemy.dist += Math.abs(this.spriteEnemy.vX) + Math.abs(this.spriteEnemy.vY);
        if (this.spriteEnemy.vX != 0) {
            this.spriteEnemy.lastVx = this.spriteEnemy.vX;
            this.spriteEnemy.x += this.spriteEnemy.vX;
        }
        this.spriteEnemy.y += this.spriteEnemy.vY;
        if (this.spriteEnemy.dist >= myGrid.cellSize && this.spriteEnemy.y % myGrid.cellSize == 0) { // le modulo assure que le dalek ait fini de monter l'échelle avant de suivre à nouveau
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.vY = 0;
            this.spriteEnemy.dist = 0;
        }

        if (debug) console.log("id sous le dalek: " + myMap.getUnderEnemyID(0, 1));

        console.log("----- Ennemi updated ----- : ", this.spriteEnemy.id);
    }

    Draw(pCtx) {
        lstEnemies.forEach(enemy => {
            enemy.draw(pCtx);
        });
    }

    getEnemyPos() {
        // retourne la colonne et la ligne actuelle de l'ennemi
        let enemyCol = Math.floor(this.spriteEnemy.x / myGrid.cellSize);// colonnes
        let enemyLine = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
        return [enemyLine, enemyCol];
    }
}