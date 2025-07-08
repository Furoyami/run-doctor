class LevelEditorScene {
    constructor() {
        this.getMouseBound = this.getMouseCoordinates.bind(this);
        this.preventContextMenuBound = this.preventContextMenu.bind(this);
        this.handleWheelBound = this.handleWheel.bind(this);
        this.handleMouseMoveBound = this.handleMouseMove.bind(this);
        this.handleMouseUpBound = this.handleMouseUp.bind(this);
        this.tileTypes = [
            CONST.WALL,
            CONST.METAL,
            CONST.TRAP,
            CONST.LADDER,
            CONST.ITEM,
            CONST.TARDIS_LT,
            CONST.TARDIS_RT,
            CONST.TARDIS_LB,
            CONST.TARDIS_RB,
            CONST.STARTPOSENEMY,
            CONST.STARTPOSPLAYER,
        ];
        this.currentTileIndex = 0;
        this.editorTextures = [];
        this.isPainting = false;
        this.isErasing = false;
    }

    preventContextMenu(e) {
        e.preventDefault(); // Bloque menu contextuel
    }

    handleWheel(e) {
        e.preventDefault(); // Evite le scroll de la page

        if (e.deltaY > 0) {
            //bas
            this.currentTileIndex = (this.currentTileIndex + 1) % this.tileTypes.length;
        } else if (e.deltaY < 0) {
            // haut
            this.currentTileIndex = (this.currentTileIndex - 1 + this.tileTypes.length) % this.tileTypes.length;
        }
        console.log("[LevelEditorScene] Tuile sélectionnée:", this.tileTypes[this.currentTileIndex], "Index:", this.currentTileIndex);
    }

    setEventListener(mode) {
        if (mode === "add") {
            canvas.addEventListener("mousedown", this.getMouseBound);
            canvas.addEventListener("mousemove", this.handleMouseMoveBound);
            canvas.addEventListener("mouseup", this.handleMouseUpBound);
            canvas.addEventListener("contextmenu", this.preventContextMenuBound);
            canvas.addEventListener("wheel", this.handleWheelBound);
        } else if (mode === "remove") {
            canvas.removeEventListener("mousedown", this.getMouseBound);
            canvas.removeEventListener("mousemove", this.handleMouseMoveBound);
            canvas.removeEventListener("mouseup", this.handleMouseUpBound);
            canvas.removeEventListener("contextmenu", this.preventContextMenuBound);
            canvas.removeEventListener("wheel", this.handleWheelBound);
        }
    }

    keyDownLevelEditor(e) {
        switch (e.code) {
            case CONST.KEYE:
                this.setEventListener("remove");
                game.state = CONST.TITLE;
                break;
            case CONST.KEYR:
                // reset sur une map vierge
                this.setEventListener("remove");
                game.map.createEmptyMap();
                this.setEventListener("add");
                break;
            case CONST.KEYS:
                const json = this.buildLevelJson();
                const jsonString = JSON.stringify(json);
                const fileName = `level-000.json`;
                this.downloadJson(jsonString, fileName);
                break;
        }
    }

    startLevelEditor() {
        console.log("init level editor");

        game.grid.InitGrid(); // être sûr de repartir d'une grille vierge
        game.map.nbLines = game.grid.getGridNbLines();
        game.map.nbColumns = game.grid.getGridNbColumns();
        game.map.cellSize = game.grid.getGridCellSize();
        game.map.createEmptyMap();

        this.setEventListener("add");

        [CONST.TARDIS_LT, CONST.TARDIS_RT, CONST.TARDIS_LB, CONST.TARDIS_RB].forEach(id => {
            let texture = game.map.tileTextures[id];
            if (texture instanceof Sprite) {
                let anim = texture.animations.find(a => a.name === "APPEAR");
                if (anim) {
                    texture.currentFrame = anim.frames[anim.frames.length - 1]; // Dernière frame
                }
            }
        });

        this.editorTextures[CONST.STARTPOSENEMY] = new Image();
        this.editorTextures[CONST.STARTPOSENEMY].name = "DALEK";
        this.editorTextures[CONST.STARTPOSENEMY].src = "images/dalek.png";
        this.editorTextures[CONST.STARTPOSPLAYER] = new Image();
        this.editorTextures[CONST.STARTPOSPLAYER].name = "DOCTOR";
        this.editorTextures[CONST.STARTPOSPLAYER].src = "images/doctor.png";
    }

    updateLevelEditor(dt) { }

    drawLevelEditor(pCtx) {
        // wip test
        pCtx.fillStyle = "#FFF";
        pCtx.font = "75px Pixel";
        game.centerText(pCtx, "Level Editor", game.width / 2, game.height / 2 - 50);

        game.map.Draw(pCtx);
        // grid
        game.grid.DrawGrid(pCtx);
    }

    // récup les coords de la souris en ligne / colonne
    getTileCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // conversion en tile 
        const tileCol = Math.trunc(x / game.grid.cellSize);
        const tileLine = Math.trunc(y / game.grid.cellSize);
        return { tileLine, tileCol };
    }

    getMouseCoordinates(e) {
        const { tileLine, tileCol } = this.getTileCoordinates(e);
        if (e.button === 0) {
            this.isPainting = true;
            this.changeTileValue(e, tileLine, tileCol);
        } else if (e.button === 2) {
            this.isErasing = true;
            this.changeTileValue(e, tileLine, tileCol);
        }
    }

    handleMouseMove(e) {
        if (!this.isPainting && !this.isErasing) return;
        const { tileLine, tileCol } = this.getTileCoordinates(e);
        if (tileLine >= 0 && tileLine <= game.map.getMapNbLines() && tileCol >= 0 && tileCol <= game.map.getMapNbColumns()) {
            if (this.isPainting) {
                game.map.level.matrix[tileLine][tileCol] = this.tileTypes[this.currentTileIndex];
            } else if (this.isErasing) {
                game.map.level.matrix[tileLine][tileCol] = CONST.VOID;
            }
        }
    }

    handleMouseUp(e) {
        if (e.button === 0) {
            this.isPainting = false;
            console.log("Peinture arrêtée");
        } else if (e.button === 2) {
            this.isErasing = false;
            console.log("Effacement arrêté");
        }
    }

    // modifie la valeur de la case cliquée
    changeTileValue(e, pTileLine, pTileCol) {
        if (e.button === 0) {
            if (pTileLine >= 0 && pTileLine < game.map.getMapNbLines()) {
                if (pTileCol >= 0 && pTileCol < game.map.getMapNbColumns()) {
                    game.map.level.matrix[pTileLine][pTileCol] = this.tileTypes[this.currentTileIndex];
                }
            }
        } else if (e.button === 2) {
            if (pTileLine >= 0 && pTileLine < game.map.getMapNbLines()) {
                if (pTileCol >= 0 && pTileCol < game.map.getMapNbColumns()) {
                    game.map.level.matrix[pTileLine][pTileCol] = CONST.VOID;
                }
            }
        }
    }

    buildLevelJson() {
        let matrix = JSON.parse(JSON.stringify(game.map.level.matrix));
        let items = 0;
        let enemies = 0;
        let playerCount = 0;

        for (let line = 0; line < game.map.nbLines; line++) {
            for (let col = 0; col < game.map.nbColumns; col++) {
                let id = matrix[line][col];
                switch (id) {
                    case CONST.ITEM:
                        items++;
                        break;
                    case CONST.STARTPOSENEMY:
                        enemies++;
                        break;
                    case CONST.STARTPOSPLAYER:
                        playerCount++;
                        if (playerCount > 1) matrix[line][col] = CONST.VOID;
                        break;
                }
            }
        }

        if (playerCount > 1) {
            alert(`Attention : ${playerCount} positions de joueur détectées. Les supplémentaires ont été remplacées par VOID.`);
        } else if (playerCount === 0) {
            alert("Attention : Aucune position de joueur (STARTPOSPLAYER) détectée !");
        }

        return {
            matrix: matrix,
            items: items,
            enemies: enemies,
            forbiddenPathTiles: [],
            isSpecial : false
        };
    }

    downloadJson(jsonString, fileName) {
        const blob = new Blob([jsonString], { type: 'application/json' }); // crée le fichier qui sera dl par le navigateur
        const url = URL.createObjectURL(blob); // crée l'url temp ver le blob en mémoire
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click(); // simule le click sur le bouton download
        URL.revokeObjectURL(url);
    }
}