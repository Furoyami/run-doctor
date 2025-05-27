class LevelEditorScene {
    constructor() { }

    keyDownLevelEditor(e) {
        if (e.code === CONST.KEYE) game.state = CONST.TITLE;
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
}