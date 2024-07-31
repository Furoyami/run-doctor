const VOID = 0;
const WALL = 1;
const LADDER = 2;
const KEY = 3;

class Enemy {
    constructor(pLine = 0, pCol = 0) {
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

        console.log("----- Enemy créé -----");
    }

    CreateEnemy() {

    }

    Update(dt) {
        if (this.spriteEnemy === null) {
            console.log("spriteEnemy is null in Update function");
        }

        //----- Récupération de la position du joueur -----
        let playerPos = player.getPlayerPos();
        let playerY = playerPos[0] * myGrid.cellSize;
        let playerX = playerPos[1] * myGrid.cellSize;

        let enemyPos = this.getEnemyPos();
        if (enemyPos === null) {
            console.error("Failed to get enemy position in Update method");
            return;
        }

        let enemyLine = enemyPos[0];
        let enemyCol = enemyPos[1];

        // si le joueur est à droite
        const RIGHTSCREENBORDER = WIDTH - myGrid.cellSize;
        if (playerX > this.spriteEnemy.x &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.x < RIGHTSCREENBORDER &&
            myMap.getUnderEnemyID(enemyLine, enemyCol + 1) != VOID &&
            myMap.getUnderEnemyID(enemyLine + 1, enemyCol) != WALL) {

            this.spriteEnemy.startAnimation("RIGHT");
            this.spriteEnemy.vX = 1.25;
            this.spriteEnemy.dist = 0;
        }

        // si le joueur est à gauche
        if (playerX < this.spriteEnemy.x &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.x > 0 &&
            myMap.getUnderEnemyID(enemyLine, enemyCol + 1) != VOID &&
            myMap.getUnderEnemyID(enemyLine - 1, enemyCol) != WALL) {

            this.spriteEnemy.startAnimation("LEFT");
            this.spriteEnemy.vX = -1.25;
            this.spriteEnemy.dist = 0;
        }

        // si le joueur est plus bas que l'ennemi
        if (playerY > this.spriteEnemy.y &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.y < HEIGHT - 2 * myGrid.cellSize &&
            myMap.getUnderEnemyID(enemyLine, enemyCol + 1) == LADDER) {
            this.spriteEnemy.vY = 1.25;
            this.spriteEnemy.dist = 0;
        }

        // si le joueur est plus haut que l'ennemi
        if (playerY < this.spriteEnemy.y &&
            this.spriteEnemy.vX == 0 &&
            this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.y > 0 &&
            myMap.getUnderEnemyID(enemyLine, enemyCol) == LADDER) {
            this.spriteEnemy.vY = -1.25;
            this.spriteEnemy.dist = 0;
        }

        // permet à l'ennemi de prendre une échelle pour descendre
        if (this.spriteEnemy.y < playerY &&
            myMap.getUnderEnemyID(enemyLine, enemyCol + 1) == LADDER &&
            this.spriteEnemy.x % myGrid.cellSize == 0 &&
            this.spriteEnemy.y % myGrid.cellSize == 0) {
            this.spriteEnemy.vY = 1.25;
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.dist = 0;
        }

        //permet à l'ennemi de prendre une échelle pour monter
        if (this.spriteEnemy.y > playerY &&
            myMap.getUnderEnemyID(enemyLine, enemyCol - 1) == LADDER &&
            this.spriteEnemy.x % myGrid.cellSize == 0 &&
            this.spriteEnemy.y % myGrid.cellSize == 0) {
            this.spriteEnemy.vY = -1.25;
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.dist = 0;
        }

        // empêche l'ennemi de passer au travers du sol
        if (this.spriteEnemy.vY > 0 && myMap.getUnderEnemyID(enemyLine, enemyCol + 1) == WALL) {
            this.spriteEnemy.vY = 0;
        }

        // évite à la vX et vY de switcher et d'osciller entre les anims
        if (playerX == this.spriteEnemy.x) {
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.dist = 0;
        }

        if (playerY == this.spriteEnemy.y) {
            this.spriteEnemy.vY = 0;
            this.spriteEnemy.dist = 0;
        }

        // fais tomber l'ennemi s'il a du vide sous lui
        if (myMap.getUnderEnemyID(enemyLine, enemyCol + 1) == VOID &&
            this.spriteEnemy.vX == 0 && this.spriteEnemy.vY == 0 &&
            this.spriteEnemy.x % myGrid.cellSize == 0 &&
            this.spriteEnemy.y % myGrid.cellSize == 0) {
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.vY = 1.25;
        }

        // gère le déplacement case par case
        this.spriteEnemy.dist += Math.abs(this.spriteEnemy.vX) + Math.abs(this.spriteEnemy.vY);
        if (this.spriteEnemy.vX != 0) {
            this.spriteEnemy.lastVx = this.spriteEnemy.vX;
            this.spriteEnemy.x += this.spriteEnemy.vX;
        }
        this.spriteEnemy.y += this.spriteEnemy.vY;
        if (this.spriteEnemy.dist >= myGrid.cellSize && this.spriteEnemy.y % myGrid.cellSize == 0) {
            this.spriteEnemy.vX = 0;
            this.spriteEnemy.vY = 0;
            this.spriteEnemy.dist = 0;
        }

        if (debug) console.log("id sous le dalek: " + myMap.getUnderEnemyID(enemyLine, enemyCol + 1));
        console.log("----- Ennemi updated ----- : ", this.spriteEnemy.id);
    }

    getEnemyPos() {
        if (this.spriteEnemy === null) {
            return null;
        }
        let enemyCol = Math.floor(this.spriteEnemy.x / myGrid.cellSize);
        let enemyLine = Math.floor(this.spriteEnemy.y / myGrid.cellSize);
        return [enemyLine, enemyCol];
    }
}