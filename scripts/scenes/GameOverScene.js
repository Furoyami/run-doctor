class GameOverScene {
    constructor() { }

    keyDownGameOver(e) {
        if (e.code === CONST.KEYR) game.restartGame();
    }

    updateGameOver(dt) {
        game.mscTheme.stop();
        game.mscSpecialTheme.stop();
    }

    drawGameOver(pCtx) {
        pCtx.fillStyle = "#FFF";
        pCtx.font = "75px Pixel";
        game.centerText(pCtx, "Perdu !", game.width / 2, game.height / 2 - 50);
        game.centerText(pCtx, "R pour rejouer !", game.width / 2, game.height / 2 + 25);
    }
}