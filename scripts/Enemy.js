class Enemy {
    constructor(pLine = 0, pCol = 0, pTargetCol, pTargetLine, pMap) {
        this.map = pMap.getCurrentMapLevel();
        let imgEnemy = imageLoader.getImage("images/dalek_tile.png");
        this.spriteEnemy = new Sprite(imgEnemy);
        this.spriteEnemy.setTileSheet(40, 41);
        this.spriteEnemy.col = pCol;
        this.spriteEnemy.line = pLine;
        this.spriteEnemy.x = this.spriteEnemy.col * myGrid.cellSize;
        this.spriteEnemy.y = this.spriteEnemy.line * myGrid.cellSize;
        this.spriteEnemy.vX = 0;
        this.spriteEnemy.vY = 0;
        this.spriteEnemy.dist = 0;
        this.spriteEnemy.lastVx = 0;
        this.spriteEnemy.addAnimation("RIGHT", [0, 1], 0.5);
        this.spriteEnemy.addAnimation("LEFT", [2, 3], 0.5);

        // ----- propriétés utilisées pour le pathfinding -----
        this.targetCol = pTargetCol;
        this.targetLine = pTargetLine;

        this.path;
        this.pathfinding = new Pathfinding(this.map);

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, pTargetCol, pTargetLine) {

        this.targetCol = pTargetCol;
        this.targetLine = pTargetLine;

        if (pTargetCol < 0 || pTargetCol >= 32 || pTargetLine < 0 || pTargetLine >= 18) {
            console.log("Cible hors des limites de la carte");
            return;
        }


        // console.log("here:", this.path);
        //  >>> 1 log vide à voir pourquoi
        // si la col d'un ennemi dépasse la pos 18 il ne fonctionne plus
        // la map est de 32 * 18 doit y avoir un lien

        if (!this.path || this.path.length === 0) {
            // lance un calcul pour trouver un chemin
            this.path = this.pathfinding.findPath(
                { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                { x: this.targetCol, y: this.targetLine }
            );

            if (this.path.length > 0) {
                // console.log("Chemin trouvé !", this.path);
            } else {
                // console.log("Aucun chemin trouvé");
            }
        } else {
            // suit le chemin calculé
            const nextStep = this.path.shift();
            // console.log(`Prochain déplacement: ${nextStep.x}, ${nextStep.y}`);

            // nextStep est en col / line
            this.spriteEnemy.x = nextStep.x * myGrid.cellSize;
            this.spriteEnemy.y = nextStep.y * myGrid.cellSize;
        }
    }
}