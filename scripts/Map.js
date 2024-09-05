class Map {
    constructor() {
        this.map = [];
        this.map.level;
        this.map.nbLines = 0;
        this.map.nbColumns = 0;
        this.map.cellSize = 0;
        this.map.x = 0;
        this.map.y = 0;
        this.tileTextures = [];
        this.lstEnemiesCoords = [];
    }

    InitMap() {
        let myGrid = new Grid();

        if (debug) console.log("-------------------------------------------------- Map Init --------------------------------------------------");

        //attribution des valeurs de la grille
        this.map.nbLines = myGrid.getGridNbLines();
        this.map.nbColumns = myGrid.getGridNbColumns();
        this.map.cellSize = myGrid.getGridCellSize();
        // calcul de la taille totale de la map
        this.map.x = this.map.nbColumns * this.map.cellSize;
        this.map.y = this.map.nbLines * this.map.cellSize;

        this.LoadTextures();
        this.LoadLevel(1);
        this.Read();
    }

    LoadLevel(pLevel) {
        // l'id 8 dans les grille représente la position des ennemis, nécessaire pour pouvoir récuperer leur position de départ
        switch (pLevel) {
            case 1:
                this.map.level =
                    [
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1],
                        [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
                        [0, 0, 0, 0, 0, 0, 8, 0, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 8, 0, 2, 0, 0],
                        [1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
                        [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0],
                        [0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
                        [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                        [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                    ];
                this.map.level.keys = 0;
                this.map.level.enemies = 3;
                if (debug) console.log("Map lvl 1 chargée");
                break;
            case 2:
                this.map.level =
                    [
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    ];
                this.map.level.keys = 0;
                this.map.level.enemies = null;
                if (debug) console.log("Map lvl 2 chargée");
                break;

            default:
                break;
        }
    }

    LoadTextures() {
        if (debug) console.log("Chargement textures...");
        this.tileTextures[0] = null;
        this.tileTextures[1] = new Image();
        this.tileTextures[1].name = "BRICK";
        this.tileTextures[1].src = "images/brick.png";
        this.tileTextures[2] = new Image();
        this.tileTextures[2].name = "LADDER";
        this.tileTextures[2].src = "images/ladder.png";
        this.tileTextures[3] = new Image();
        this.tileTextures[3].name = "KEY";
        this.tileTextures[3].src = "images/key.png";
        this.tileTextures[4] = new Image();
        this.tileTextures[4].name = "TARDIS_LT";
        this.tileTextures[4].src = "images/tardis_lt.png";
        this.tileTextures[5] = new Image();
        this.tileTextures[5].name = "TARDIS_RT";
        this.tileTextures[5].src = "images/tardis_rt.png";
        this.tileTextures[6] = new Image();
        this.tileTextures[6].name = "TARDIS_LB";
        this.tileTextures[6].src = "images/tardis_lb.png";
        this.tileTextures[7] = new Image();
        this.tileTextures[7].name = "TARDIS_RB";
        this.tileTextures[7].src = "images/tardis_rb.png";

        if (debug) console.log("Toutes les textures sont chargées !");

    }

    getUnderPlayerID(pOffsetX, pOffsetY) {
        let playerPos = player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;

        let id = this.map.level[playerLine][playerCol];

        return id;
    }

    getUnderEnemyID(enemy, pOffsetX, pOffsetY) {
        let enemyPos = enemy.getEnemyPos();
        let enemyLine = enemyPos[0] + pOffsetY;
        let enemyCol = enemyPos[1] + pOffsetX;

        let id = this.map.level[enemyLine][enemyCol];

        return id;
    }

    isSolid(pId) {
        let tileType = this.tileTextures[pId].name;
        if (tileType == "BRICK") {
            return true;
        }
        return false;
    }

    isLadder(pOffsetX, pOffsetY) {
        let id = this.getUnderPlayerID(pOffsetX, pOffsetY);
        if (id == CONST.LADDER) {
            return true;
        }
        return false;
    }

    isWall(pOffsetX, pOffsetY) {
        let id = this.getUnderPlayerID(pOffsetX, pOffsetY);
        if (id == CONST.WALL) {
            return true;
        }
        return false;
    }

    isEmpty(pOffsetX, pOffsetY) {
        let id = this.getUnderPlayerID(pOffsetX, pOffsetY);
        if (id == CONST.VOID) {
            return true;
        }
        return false;
    }

    EmptyBrick(pOffsetX, pOffsetY) {
        let playerPos = player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        this.map.level[playerLine][playerCol] = CONST.VOID;
    }

    FillBrick(pOffsetX, pOffsetY) {
        let playerPos = player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        this.map.level[playerLine][playerCol] = CONST.WALL;
    }

    CollectKey(pX, pY) {
        let line = pY / myGrid.cellSize;
        let col = pX / myGrid.cellSize;
        if (this.map.level[line][col] == CONST.KEY) {
            this.map.level[line][col] = CONST.VOID; // remplace les clés par du vide
        }
        this.map.level.keys -= 1;
    }


    /** 
     *  Lis la map du niveau et compte le nombre de clés
     */
    Read() {
        for (let line = 0; line < this.map.nbLines; line++) {
            for (let col = 0; col < this.map.nbColumns; col++) {
                let id = this.map.level[line][col];
                if (id == CONST.KEY) {
                    this.map.level.keys += 1;
                }
                else if (id == 8 && this.lstEnemiesCoords.length != this.map.level.enemies) {
                    //position de départ d'un ennemi
                    //quand on trouve l'id 8, on stocke les coordonnées de l'id dans la liste
                    let enemyStartCoords = {
                        col: col,
                        line: line
                    };
                    this.lstEnemiesCoords.push(enemyStartCoords);
                }
            }
        }
    }

    Draw(pCtx) {
        for (let line = 0; line < this.map.nbLines; line++) {
            for (let col = 0; col < this.map.nbColumns; col++) {
                let id = this.map.level[line][col];
                // Montre le TARDIS quand toutes les clés sont ramassées
                if (this.map.level.keys != 0) {
                    if (id == CONST.TARDIS_LT || id == CONST.TARDIS_RT || id == CONST.TARDIS_LB || id == CONST.TARDIS_RB) {
                        id = CONST.VOID;
                    }
                    else {
                        id = this.map.level[line][col];
                    }
                }
                let texture = this.tileTextures[id];
                if (texture != null) {
                    pCtx.drawImage(texture, (col * this.map.cellSize) + myGrid.getGridOffset(), (line * this.map.cellSize));
                }
            }
        }
    }


    // ----- GETTERS -----

    getNbKeysInLevel() {
        return this.map.level.keys;
    }

    getNbEnemiesInLevel() {
        return this.map.level.enemies;
    }

    /**
    * retourne la liste des positions de dpart des ennemis pour pouvoir l'utiliser ailleurs
    */
    getEnemiesStartPos() {
        return this.lstEnemiesCoords;
    }

    getCurrentMapLevel() {
        return this.map.level;
    }

    getMapNbLines() {
        return this.map.nbLines;
    }

    getMapNbColumns() {
        return this.map.nbColumns;
    }
}
