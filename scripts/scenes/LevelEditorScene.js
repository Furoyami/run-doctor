class LevelEditorScene {
    constructor() {
        this.getMouseBound = this.getMouseCoordinates.bind(this);
    }

    keyDownLevelEditor(e) {
        if (e.code === CONST.KEYE) game.state = CONST.TITLE;
    }

    loadLevelEditor() {
        console.log("init level editor");
        game.grid.InitGrid(); // être sûr de repartir d'une grille vierge

        canvas.addEventListener("mousedown", this.getMouseBound)
    }

    updateLevelEditor(dt) { }

    drawLevelEditor(pCtx) {

        // wip test
        pCtx.fillStyle = "#FFF";
        pCtx.font = "75px Pixel";
        game.centerText(pCtx, "Level Editor WIP", game.width / 2, game.height / 2 - 50);

        // grid
        game.grid.DrawGrid(pCtx);

        // hud adapté
        //retour titre sans sauver
        // sauver et ajouter aux lvl custom
        // jouer le lvl

        // menu d'edition( canvas supplementaire)
    }

    getMouseCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // conversion en tile 
        const tileX = Math.trunc(x / game.grid.cellSize);
        const tileY = Math.trunc(y / game.grid.cellSize);

        if (debug) {
            console.log("rect : ", rect);
            console.log("x: ", tileX, "y: ", tileY);

            // Test : Dessine un point rouge à l’endroit du clic
            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, 5, 5); // Petit carré 5x5 pixels
        }
        
        
    }
}