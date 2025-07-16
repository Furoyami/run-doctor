class Map {
    constructor() {
        this.level = null;
        this.nbLines = 0;
        this.nbColumns = 0;
        this.cellSize = 0;
        this.x = 0;
        this.y = 0;
        this.tileTextures = [];
        this.lstEnemiesCoords = [];
        this.playerStartCoords = null;
        this.tardisVisible = false;
        this.originaleTile = null;
        this.maxItemsInLevel = 0;

        // chargement des levels
        this.levels = {}; //cache pour les JSON chargés.
        this.currentLevelId = 1; // niveau actuel
    }

    async InitMap() {
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
        await this.LoadLevelOnDemand(this.currentLevelId); //charge le lvl 1
        this.Read();
    }

    createEmptyMap() {
        this.level = {
            matrix: [],
            items: 0,
            enemies: 0,
            forbiddenPathTiles: []
        };

        for (let l = 0; l < this.nbLines; l++) {
            this.level.matrix[l] = [];
            for (let c = 0; c < this.nbColumns; c++) {
                this.level.matrix[l][c] = 0;
            }
        }

        console.log("Map vide créée:", this.level.matrix);
    }

    createEmptyCostMap() {
        let costMap = {
            matrix: []
        };

        for (let l = 0; l < this.nbLines; l++) {
            costMap.matrix[l] = [];
            for (let c = 0; c < this.nbColumns; c++) {
                costMap.matrix[l][c] = {
                    cost: 1,
                    elapsedTime: 0,
                    tileType: this.level.matrix[l][c]
                };
            }
        }

        console.log("Map de coûts créée:", costMap.matrix);

        return costMap;
    }

    // charge les levels en lazy loading
    async LoadLevelOnDemand(pLevelId,) {
        // Vérifie le cache
        if (this.levels[pLevelId]) {
            this.LoadLevel(pLevelId);
            return { success: true };
        }

        const formattedId = pLevelId.toString().padStart(3, "0");
        const file = `scripts/levels/level-${formattedId}.json`;

        try {
            const response = await fetch(file);
            if (!response.ok) {
                console.log(`Niveau ${pLevelId} introuvable, fin du jeu !`);
                return { success: false, reason: CONST.NO_MORE_LEVELS };
            }
            const data = await response.json();
            this.levels[pLevelId] = data;
            this.LoadLevel(pLevelId);
            this.currentLevelId = pLevelId; // met à jour le niveau courant
            if (debug) console.log(`Niveau ${pLevelId} chargé depuis ${file}`);
            return { success: true };
        } catch (error) {
            console.error(`Erreur chargement ${file}:`, error);
            return { success: false, reason: CONST.LOAD_ERROR };
        }

    }

    // charge les données depuis le JSON
    LoadLevel(pLevelId) {
        const levelData = this.levels[pLevelId];
        if (!levelData) {
            console.error(`Aucun niveau" ${pLevelId} trouvé`);
            return;
        }

        this.level = {
            matrix: levelData.matrix,
            items: levelData.items,
            enemies: levelData.enemies,
            forbiddenPathTiles: levelData.forbiddenPathTiles
        };

        // Validation des dimensions
        if (!Array.isArray(levelData.matrix) ||
            levelData.matrix.length !== this.nbLines ||
            levelData.matrix[0].length !== this.nbColumns) {
            console.error(`Mauvaises dimensions pour le niveau ${pLevelId}`);
            return;
        }

        // Réinit pour le nouveau niveau
        this.tardisVisible = false;
        if (debug) console.log(`Niveau ${pLevelId} chargé`);

    }

    // réinit la map du jeu au lvl 1
    resetLevel() {
        this.level = null;
        this.tardisVisible = false;
        this.lstEnemiesCoords = [];
        this.currentLevelId = 1;
        this.levels = {}; // Vide le cache
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
        this.tileTextures[11] = new Image();
        this.tileTextures[11].name = "METAL";
        this.tileTextures[11].src = "images/metal.png";
        this.tileTextures[12] = new Image();
        this.tileTextures[12].name = "TRAP";
        this.tileTextures[12].src = "images/trap.png";

        // Tiles animées
        let imgKey = game.imageLoader.getImage("images/key_tile.png");
        this.tileTextures[3] = new Sprite(imgKey);
        this.tileTextures[3].name = "KEY";
        this.tileTextures[3].setTileSheet(40, 40);
        this.tileTextures[3].addAnimation("KEY_ANIM", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.15, 1);
        this.tileTextures[3].startAnimation("KEY_ANIM");

        let imgEnergy = game.imageLoader.getImage("images/energy_tile.png");
        this.tileTextures[13] = new Sprite(imgEnergy);
        this.tileTextures[13].name = "ENERGY";
        this.tileTextures[13].setTileSheet(40, 40);
        this.tileTextures[13].addAnimation("ENERGY_ANIM", [0, 1, 2, 3], 0.3);
        this.tileTextures[13].startAnimation("ENERGY_ANIM");

        this.LoadTardisTextures();

        if (debug) console.log("Toutes les textures sont chargées !");
    }

    LoadTardisTextures() {
        // Tardis
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
    }

    getUnderPlayerID(pOffsetX, pOffsetY) {
        let playerPos = game.player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;

        // Vérification des limites
        if (playerLine < 0 || playerLine >= this.nbLines || playerCol < 0 || playerCol >= this.nbColumns) {
            return CONST.OUT_OF_BOUNDS;
        }

        let id = this.level.matrix[playerLine][playerCol];

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

        let id = this.level.matrix[enemyLine][enemyCol];

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
        this.level.matrix[playerLine][playerCol] = CONST.VOID;
    }

    FillBrick(pOffsetX, pOffsetY) {
        let playerPos = game.player.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        if (this.level.matrix[playerLine][playerCol] === CONST.ITEM) this.level.items - +1;
        this.level.matrix[playerLine][playerCol] = CONST.WALL;
    }

    ChangeToUnwalkable(pLine, pCol) {
        if (this.level.matrix[pCol][pLine] === CONST.ITEM) this.level.items -= 1;
        this.level.matrix[pCol][pLine] = CONST.UNWALKABLE_VOID;
    }

    CollectItem(pX, pY, isPlayer = false) {
        let line = Math.floor(pY / game.grid.cellSize);
        let col = Math.floor(pX / game.grid.cellSize);
        if (this.level.matrix[line][col] === CONST.ITEM) {
            if (this.originaleTile !== null && this.originaleTile.col === col && this.originaleTile.line === line) {
                this.level.matrix[line][col] = this.originaleTile.tileId; // Restaure la tile originale
                this.originaleTile = null; // Reset
            } else {
                this.level.matrix[line][col] = CONST.VOID; // Cas des clés initiales
            }
            if (isPlayer && this.level.items > 0) {
                this.level.items -= 1;
            }
        }
    }

    DropItem(pX, pY, dropTargetTile) {
        let line = Math.floor(pY / game.grid.cellSize);
        let col = Math.floor(pX / game.grid.cellSize);
        if ((line - 1) >= 0 && this.level.matrix[line - 1][col] === CONST.ITEM) this.level.items -= 1;
        this.originaleTile = { col, line: line - 1, tileId: dropTargetTile }; // Stocke position + ID
        this.level.matrix[line - 1][col] = CONST.ITEM; // Pose la clé au-dessus
    }


    /** 
     *  Lis la map du niveau et compte le nombre d'entités
     */
    Read() {
        this.level.items = 0;
        this.lstEnemiesCoords = [];

        for (let line = 0; line < this.nbLines; line++) {
            for (let col = 0; col < this.nbColumns; col++) {
                let id = this.level.matrix[line][col];
                switch (id) {
                    case CONST.ITEM:
                        this.level.items += 1;
                        break;
                    case CONST.STARTPOSENEMY:
                        if (this.lstEnemiesCoords.length != this.level.enemies) {
                            //position de départ d'un ennemi
                            //quand on trouve l'id 8, on stocke les coordonnées de l'id dans la liste
                            let enemyStartCoords = {
                                col: col,
                                line: line
                            };
                            this.lstEnemiesCoords.push(enemyStartCoords);
                        }
                        break;
                    case CONST.STARTPOSPLAYER:
                        this.playerStartCoords = {
                            col: col,
                            line: line
                        };
                        break;
                }
            }
        }
        this.maxItemsInLevel = this.level.items;
    }

    Update(dt) {
        // Apparition du tardis
        if (this.level.items === 0 && !this.tardisVisible) {
            for (let tileID in this.tileTextures) {
                let texture = this.tileTextures[tileID];
                if (texture instanceof Sprite &&
                    (tileID == 4 || tileID == 5 || tileID == 6 || tileID == 7)) {
                    texture.startAnimation("APPEAR");
                }
            }
            this.tardisVisible = true;
            game.sndTardis.play();
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

                let id = this.level.matrix[line][col];
                // Masque le TARDIS tant que les clés ne sont pas ramassées
                if (this.level.items != 0) {
                    if (id === CONST.TARDIS_LT || id === CONST.TARDIS_RT ||
                        id === CONST.TARDIS_LB || id === CONST.TARDIS_RB) {
                        id = CONST.VOID;
                    }
                }

                // Dessine les sprite animées
                let texture;
                // permet les dessin des placeholder dalek / doctor
                if (game.state === CONST.LEVELEDITOR && (id === CONST.STARTPOSENEMY || id === CONST.STARTPOSPLAYER)) {
                    texture = game.levelEditorScene.editorTextures[id];
                } else {
                    texture = this.tileTextures[id];
                }
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

                // dessine les valeurs des cases en godmod
                if (game.timeLord && game.isCoordsVisible) {
                    pCtx.font = "10px Arial";
                    pCtx.fillStyle = "#FFF";
                    pCtx.fillText("x: " + col, x, y + 10);
                    pCtx.fillText("y: " + line, x, y + 20);

                }
            }
        }
    }


    // ----- GETTERS -----

    getNbItemsInLevel() {
        return this.level.items;
    }
    getNbItemsCollected() {
        return this.maxItemsInLevel - this.level.items;
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

    getPlayerStartPos() {
        return this.playerStartCoords;
    }

    getCurrentMapLevel() {
        return this.level.matrix;
    }

    getMapNbLines() {
        return this.nbLines;
    }

    getMapNbColumns() {
        return this.nbColumns;
    }

    // pour récupérer les cases interdites
    getForbiddenPathTiles() {
        return this.level.forbiddenPathTiles;
    }

    // Pour récupérer currentLevelId
    getCurrentLevelId() {
        return this.currentLevelId;
    }
}
