class GameWinScene {
    constructor() { }

    keyDownGameWin(e) {
        if (e.code === CONST.KEYR) game.restartGame();
    }

    updateGameWin(dt) {
        game.mscTheme.stop();
        game.mscSpecialTheme.stop();
    }

    drawGameWin(pCtx) {
        pCtx.fillStyle = "#FFF";
        pCtx.font = "75px Pixel";
        game.centerText(pCtx, "Bien joué, Seigneur du Temps, tu t'es échappé !", game.width / 2, game.height / 2 - 50);
        game.centerText(pCtx, "R pour rejouer depuis le début !", game.width / 2, game.height / 2 + 25);
    }
}