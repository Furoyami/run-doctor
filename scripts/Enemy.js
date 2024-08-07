class Enemy {
    constructor(pLine = 0, pCol = 0) {
        let imgEnemy = imageLoader.getImage("images/dalek_tile.png");
        this.spriteEnemy = new Sprite(imgEnemy);
        this.spriteEnemy.setTileSheet(40, 41);
        this.spriteEnemy.line = pLine;
        this.spriteEnemy.col = pCol;
        this.spriteEnemy.x = pCol * myGrid.cellSize;
        this.spriteEnemy.y = pLine * myGrid.cellSize;
        this.spriteEnemy.vX = 0;
        this.spriteEnemy.vY = 0;
        this.spriteEnemy.dist = 0;
        this.spriteEnemy.lastVx = 0;
        this.spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        this.spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, lstEnemies) {
        if (this.spriteEnemy === null) {
            if (debug) console.log("spriteEnemy is null in Update function");
        }

        //----- Récupération de la position du joueur -----
        let playerPos = player.getPlayerPos();
        let playerY = playerPos[0] * myGrid.cellSize;
        let playerX = playerPos[1] * myGrid.cellSize;

        let nbLines = myGrid.getGridNbLines();
        let nbCols = myGrid.getGridNbColumns();

        let enemyLine = this.spriteEnemy.line;
        let enemyCol = this.spriteEnemy.col;

        if (enemyLine >= 0 && enemyLine < nbLines
            && enemyCol >= 0 && enemyCol < nbCols
        ) {

        }
    }
}