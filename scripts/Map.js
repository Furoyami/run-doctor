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
                    // la map comporte 33 colonnes alors qu'elle est definie à 32
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

    getUnderEnemyID(pOffsetX, pOffsetY, lstEnemies) {
        let id;

        lstEnemies.forEach(enemy => {
            let enemyPos = enemy.getEnemyPos();
            let enemyLine = enemyPos[0] + pOffsetY;
            let enemyCol = enemyPos[1] + pOffsetX;

            // Vérification des limites de la grille
            if (enemyLine >= 0 && enemyLine < this.map.nbLines &&
                enemyCol >= 0 && enemyCol < this.map.nbColumns) {

                id = this.map.level[enemyLine][enemyCol];
            } else {
                // console.error(`Position invalide: enemyLine = ${enemyLine}, enemyCol = ${enemyCol}`);
            }
        });

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
        if (id == 2) {
            return true;
        }
        return false;
    }

    isWall(pOffsetX, pOffsetY) {
        let id = this.getUnderPlayerID(pOffsetX, pOffsetY);
        if (id == 1) {
            return true;
        }
        return false;
    }

    isEmpty(pOffsetX, pOffsetY) {
        let id = this.getUnderPlayerID(pOffsetX, pOffsetY);
        if (id == 0) {
            return true;
        }
        return false;
    }

    EmptyBrick(pOffsetX, pOffsetY) {
        let playerPos = player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        this.map.level[playerLine][playerCol] = 0;
    }

    FillBrick(pOffsetX, pOffsetY) {
        let playerPos = player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        this.map.level[playerLine][playerCol] = 1;
    }

    CollectKey(pX, pY) {
        let line = pY / myGrid.cellSize;
        let col = pX / myGrid.cellSize;
        if (this.map.level[line][col] == 3) {
            this.map.level[line][col] = 0; // remplace les clés par du vide
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
                if (id == 3) {
                    this.map.level.keys += 1;
                }
                else if (id == 8 && this.lstEnemiesCoords.length != this.map.level.enemies) {
                    //position de départ d'un ennemi
                    //quand on trouve l'id 8, on stocke less coordonnées de l'id dans la liste
                    let enemyStartCoords = {
                        x: col,
                        y: line
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
                    if (id == 4 || id == 5 || id == 6 || id == 7) {
                        id = 0;
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
}
