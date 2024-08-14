
class Enemy {
    constructor(pLine = 0, pCol = 0, pTargetCol, pTargetLine, pMap) {
        this.map = pMap;
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

        this.path = [];
        this.pathfinding = new Pathfinding(this.map);

        if (debug) console.log("----- Enemy créé -----");
    }

    Update(dt, pTargetCol, pTargetLine) {
        // console.log("----- Update -----");

        this.targetCol = pTargetCol;
        this.targetLine = pTargetLine;

        // console.log("position actuelle enemy: ", "col: ", this.spriteEnemy.col, "line: ", this.spriteEnemy.line);
        // console.log("position actuelle cible: ", "col: ", this.targetCol, "line: ", this.targetLine);

        console.log("here:", this.path);
        //  >>> 1er log vide à voir pourquoi 

        if (this.path.length === 0) {
            // lance un calcul pour trouver un chemin
            console.log("Aucun chemin existant, calcul en cours");
            this.path = this.pathfinding.findPath(
                { x: this.spriteEnemy.col, y: this.spriteEnemy.line },
                { x: this.targetCol, y: this.targetLine }
            );

            if (this.path.length > 0) {
                console.log("Chemin trouvé !", this.path);
            } else {
                console.log("Aucun chemin trouvé");
            }
        } else {
            // suit le chemin calculé
            let nextStep = this.path.shift();
            console.log(`Prochain déplacement: ${nextStep.x}, ${nextStep.y}`);

            // nextStep est en col / line
            this.spriteEnemy.x = (nextStep.x * myGrid.cellSize);
            this.spriteEnemy.y = (nextStep.y * myGrid.cellSize);
        }

    }
}