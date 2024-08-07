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

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, lstEnemies) {
        //----- Récupération de la position du joueur -----
        let playerPos = player.getPlayerPos();
        let playerY = playerPos[0] * myGrid.cellSize;
        let playerX = playerPos[1] * myGrid.cellSize;

    }
}