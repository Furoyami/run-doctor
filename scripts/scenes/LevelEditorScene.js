class LevelEditorScene {
    constructor() {
        this.getMouseBound = this.getMouseCoordinates.bind(this);
        this.preventContextMenuBound = this.preventContextMenu.bind(this);
        this.handleWheelBound = this.handleWheel.bind(this);
        this.tileTypes = [
            CONST.WALL,
            CONST.LADDER,
            CONST.ITEM,
            CONST.TARDIS_LT,
            CONST.TARDIS_RT,
            CONST.TARDIS_LB,
            CONST.TARDIS_RB,
            CONST.STARTPOSENEMY,
            CONST.STARTPOSPLAYER
        ];
        this.currentTileIndex = 0;
        this.editorTextures = [];
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
            canvas.addEventListener("contextmenu", this.preventContextMenuBound);
            canvas.addEventListener("wheel", this.handleWheelBound);
        } else if (mode === "remove") {
            canvas.removeEventListener("mousedown", this.getMouseBound);
            canvas.removeEventListener("contextmenu", this.preventContextMenuBound);
            canvas.removeListener("wheel", this.handleWheelBound);
        }
    }

    keyDownLevelEditor(e) {
        if (e.code === CONST.KEYE) {
            this.setEventListener("remove");
            game.state = CONST.TITLE;
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
        game.centerText(pCtx, "Level Editor WIP", game.width / 2, game.height / 2 - 50);

        game.map.Draw(pCtx);

        // dessin des placehoolder dalek / doctor
        for (let line = 0; line < game.map.nbLines; line++) {
            for (let col = 0; col < game.map.nbColumns; col++) {
                let x = (col * game.grid.cellSize) + game.grid.getGridOffset();
                let y = (line * game.grid.cellSize);

                let id = game.map.level.matrix[line][col];

                let texture = this.editorTextures[id];
                if (texture != null) {
                    if (texture instanceof Sprite) {
                        texture.x = x;
                        texture.y = y;
                        texture.draw(pCtx);
                    } else {
                        pCtx.drawImage(texture, x, y);
                    }
                }
            }
        }
        // grid
        game.grid.DrawGrid(pCtx);

        //retour titre sans sauver
        // sauver et ajouter aux lvl custom
        // jouer le lvl

        // menu d'edition( canvas supplementaire)
    }

    // récup les coords de la souris en ligne / colonne
    getMouseCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // conversion en tile 
        const tileCol = Math.trunc(x / game.grid.cellSize);
        const tileLine = Math.trunc(y / game.grid.cellSize);

        this.changeTileValue(e, tileLine, tileCol)
    }

    // modifie la valeur de la case cliquée
    changeTileValue(e, pTileLine, pTileCol) {
        
        if (e.button === 0) {
            if (pTileLine >= 0 && pTileLine <= game.map.getMapNbLines()) {
                if (pTileCol >= 0 && pTileCol <= game.map.getMapNbColumns()) {
                    game.map.level.matrix[pTileLine][pTileCol] = this.tileTypes[this.currentTileIndex];
                    console.log(game.map.level.matrix);
                    
                }
            }
        }
        if (e.button === 2) {
            if (pTileLine >= 0 && pTileLine <= game.map.getMapNbLines()) {
                if (pTileCol >= 0 && pTileCol <= game.map.getMapNbColumns()) {
                    game.map.level.matrix[pTileLine][pTileCol] = CONST.VOID;
                }
            }
        }
    }
}