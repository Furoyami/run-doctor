class Map {
    constructor() {
        this.matrix = [];
        this.level;
        this.nbLines = 0;
        this.nbColumns = 0;
        this.cellSize = 0;
        this.x = 0;
        this.y = 0;
        this.tileTextures = [];
        this.lstEnemiesCoords = [];
        this.tardisVisible = false;
    }

    InitMap() {
        let grid = new Grid();

        if (debug) console.log("-------------------------------------------------- Map Init --------------------------------------------------");

        //attribution des valeurs de la grille
        this.nbLines = grid.getGridNbLines();
        this.nbColumns = grid.getGridNbColumns();
        this.cellSize = grid.getGridCellSize();
        // calcul de la taille totale de la map
        this.x = this.nbColumns * this.cellSize;
        this.y = this.nbLines * this.cellSize;

        this.LoadTextures();
        this.LoadLevel(1);
        this.Read();
    }

    LoadLevel(pLevel) {
        // l'id 8 dans les grille représente la position des ennemis, nécessaire pour pouvoir récuperer leur position de départ
        switch (pLevel) {
            case 1:
                this.level =
                    [
                        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
                        [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
                        [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
                        [9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9, 9, 9, 9, 9, 9, 9, 0, 9, 9, 9, 4, 5, 9, 9, 9, 9, 9, 9, 9, 9, 9],
                        [9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9, 9, 9, 0, 0, 0, 0, 0, 9, 9, 0, 6, 7, 0, 0, 0, 0, 3, 0, 0, 0, 0],
                        [9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9, 9, 9, 0, 1, 1, 2, 0, 9, 9, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1],
                        [9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9, 9, 9, 0, 1, 1, 2, 0, 9, 9, 0, 9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9],
                        [0, 0, 0, 0, 0, 0, 8, 0, 2, 0, 9, 9, 9, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 8, 0, 2, 0, 0],
                        [1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 9, 9, 9, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
                        [9, 9, 0, 2, 0, 9, 9, 9, 9, 0, 9, 9, 9, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9, 9, 9, 9, 9, 9],
                        [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 2, 0, 9, 9, 9, 9, 9, 9],
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 9, 9, 9, 9, 9, 9],
                        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 2, 0, 9, 9, 9, 9, 9, 9],
                        [9, 9, 9, 9, 0, 0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 9, 9, 9, 9, 9, 9, 9, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0],
                        [9, 9, 9, 9, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 9, 9, 9, 9, 9, 9, 9, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2],
                        [9, 9, 9, 9, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 0, 9, 9, 9, 9, 9, 9, 9, 0, 2],
                        [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
                        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                    ];
                this.level.items = 0;
                this.level.enemies = 3;
                if (debug) console.log("Map lvl 1 chargée");
                break;
            case 2:
                this.level =
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
                this.level.items = 0;
                this.level.enemies = null;
                if (debug) console.log("Map lvl 2 chargée");
                break;

            default:
                break;
        }
    }

    LoadTextures() {
        if (debug) console.log("Chargement textures...");

        // Textures fixes
        this.tileTextures[0] = new Image();
        this.tileTextures[0].name = "BGTILE";
        this.tileTextures[0].src = "images/bgTile.png";
        this.tileTextures[1] = new Image();
        this.tileTextures[1].name = "BRICK";
        this.tileTextures[1].src = "images/brick.png";
        this.tileTextures[2] = new Image();
        this.tileTextures[2].name = "LADDER";
        this.tileTextures[2].src = "images/ladder.png";

        // Tiles animées
        let imgKey = game.imageLoader.getImage("images/key_tile.png");
        this.tileTextures[3] = new Sprite(imgKey);
        this.tileTextures[3].name = "KEY";
        this.tileTextures[3].setTileSheet(40, 40);
        this.tileTextures[3].addAnimation("KEY_ANIM", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.15, 1);
        this.tileTextures[3].startAnimation("KEY_ANIM");

        // LT
        this.tileTextures[4] = new Sprite(game.imageLoader.getImage("images/tardis_lt_tile.png"));
        this.tileTextures[4].name = "TARDIS_LT";
        this.tileTextures[4].setTileSheet(40, 40);
        this.tileTextures[4].addAnimation("APPEAR", [0, 1, 2, 3], 0.5, 0, false); // Sans boucle
        // RT
        this.tileTextures[5] = new Sprite(game.imageLoader.getImage("images/tardis_rt_tile.png"));
        this.tileTextures[5].name = "TARDIS_RT";
        this.tileTextures[5].setTileSheet(40, 40);
        this.tileTextures[5].addAnimation("APPEAR", [0, 1, 2, 3], 0.5, 0, false);
        //LB
        this.tileTextures[6] = new Sprite(game.imageLoader.getImage("images/tardis_lb_tile.png"));
        this.tileTextures[6].name = "TARDIS_LB";
        this.tileTextures[6].setTileSheet(40, 40);
        this.tileTextures[6].addAnimation("APPEAR", [0, 1, 2, 3], 0.5, 0, false);
        //RB
        this.tileTextures[7] = new Sprite(game.imageLoader.getImage("images/tardis_rb_tile.png"));
        this.tileTextures[7].name = "TARDIS_RB";
        this.tileTextures[7].setTileSheet(40, 40);
        this.tileTextures[7].addAnimation("APPEAR", [0, 1, 2, 3], 0.5, 0, false);


        if (debug) console.log("Toutes les textures sont chargées !");

    }

    getUnderPlayerID(pOffsetX, pOffsetY) {
        let playerPos = game.player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;

        // Vérification des limites
        if (playerLine < 0 || playerLine >= this.nbLines || playerCol < 0 || playerCol >= this.nbColumns) {
            return CONST.OUT_OF_BOUNDS;
        }

        let id = this.level[playerLine][playerCol];

        return id;
    }

    getUnderEnemyID(enemy, pOffsetX, pOffsetY) {
        let enemyPos = enemy.getEnemyPos();
        let enemyLine = Math.round(enemyPos[0] + pOffsetY);
        let enemyCol = Math.round(enemyPos[1] + pOffsetX);

        // Vérification des limites
        if (enemyLine < 0 || enemyLine >= this.nbLines || enemyCol < 0 || enemyCol >= this.nbColumns) {
            return CONST.OUT_OF_BOUNDS;
        }

        let id = this.level[enemyLine][enemyCol];

        return id;
    }

    isLadder(pOffsetX, pOffsetY) {
        let id = this.getUnderPlayerID(pOffsetX, pOffsetY);
        if (id === CONST.LADDER) {
            return true;
        }
        return false;
    }

    isWall(pOffsetX, pOffsetY) {
        let id = this.getUnderPlayerID(pOffsetX, pOffsetY);
        if (id === CONST.WALL) {
            return true;
        }
        return false;
    }

    EmptyBrick(pOffsetX, pOffsetY) {
        let playerPos = game.player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        this.level[playerLine][playerCol] = CONST.VOID;
    }

    FillBrick(pOffsetX, pOffsetY) {
        let playerPos = game.player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        this.level[playerLine][playerCol] = CONST.WALL;
    }

    ChangeToUnwalkable(pLine, pCol) {
        this.level[pCol][pLine] = CONST.UNWALKABLE_VOID;
    }

    CollectKey(pX, pY) {
        let line = pY / game.grid.cellSize;
        let col = pX / game.grid.cellSize;
        if (this.level[line][col] == CONST.KEY) {
            this.level[line][col] = CONST.VOID; // remplace les clés par du vide
        }
        this.level.items -= 1;
    }


    /** 
     *  Lis la map du niveau et compte le nombre de clés
     */
    Read() {
        for (let line = 0; line < this.nbLines; line++) {
            for (let col = 0; col < this.nbColumns; col++) {
                let id = this.level[line][col];
                if (id === CONST.KEY) {
                    this.level.items += 1;
                }
                else if (id === 8 && this.lstEnemiesCoords.length != this.level.enemies) {
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

    Update(dt) {
        if (this.level.items === 0 && !this.tardisVisible) {
            for (let tileID in this.tileTextures) {
                let texture = this.tileTextures[tileID];
                if (texture instanceof Sprite &&
                    (tileID == 4 || tileID == 5 || tileID == 6 || tileID == 7)) {
                    texture.startAnimation("APPEAR");
                }
            }
            this.tardisVisible = true;
        }

        // Mise à jour des sprites après
        for (let tileID in this.tileTextures) {
            let texture = this.tileTextures[tileID];
            if (texture instanceof Sprite) {
                texture.update(dt);
            }
        }
    }

    Draw(pCtx) {
        for (let line = 0; line < this.nbLines; line++) {
            for (let col = 0; col < this.nbColumns; col++) {
                let x = (col * this.cellSize) + game.grid.getGridOffset();
                let y = (line * this.cellSize);

                let backgroundTexture = this.tileTextures[0];
                if (this.backgroundTexture !== null) pCtx.drawImage(backgroundTexture, x, y);

                let id = this.level[line][col];
                // Masque le TARDIS tant que les clés ne sont pas ramassées
                if (this.level.items != 0) {
                    if (id === CONST.TARDIS_LT || id === CONST.TARDIS_RT ||
                        id === CONST.TARDIS_LB || id === CONST.TARDIS_RB) {
                        id = CONST.VOID;
                    }
                }
                let texture = this.tileTextures[id];
                if (texture != null) {
                    if (texture instanceof Sprite) {
                        texture.x = x;
                        texture.y = y;
                        texture.draw(pCtx);
                    } else {
                        pCtx.drawImage(texture, x, y);
                    }
                }
                // Dessine les sprites TARDIS quand ils apparaissent
                if (this.tardisVisible && (id === CONST.TARDIS_LT || id === CONST.TARDIS_RT ||
                    id === CONST.TARDIS_LB || id === CONST.TARDIS_RB)) {
                    let tardisTexture = this.tileTextures[id];
                    tardisTexture.x = x;
                    tardisTexture.y = y;
                    tardisTexture.draw(pCtx);
                }
            }
        }
    }


    // ----- GETTERS -----

    getNbItemsInLevel() {
        return this.level.items;
    }

    getNbEnemiesInLevel() {
        return this.level.enemies;
    }

    /**
    * retourne la liste des positions de départ des ennemis pour pouvoir l'utiliser ailleurs
    */
    getEnemiesStartPos() {
        return this.lstEnemiesCoords;
    }

    getCurrentMapLevel() {
        return this.level;
    }

    getMapNbLines() {
        return this.nbLines;
    }

    getMapNbColumns() {
        return this.nbColumns;
    }
}
