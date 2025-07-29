class PauseScene {
    constructor() { }

    keyDownPause(e) {
        if (e.code === CONST.KEYP) {
            game.state = CONST.PLAYING;
            if (game.map.level.isSpecial) {
                game.mscSpecialTheme.resume();
            } else {
                game.mscTheme.resume();
            }
        }
    }

    drawPause(pCtx) {
        if (game.state === CONST.PAUSE) {
            pCtx.fillStyle = "#020509CC";
            pCtx.fillRect(0, 0, game.width, game.height);
            pCtx.fillStyle = "#DFDFDF";
            pCtx.font = "75px Pixel";
            game.centerText(pCtx, "PAUSE", game.width / 2, game.height / 2);
            game.centerText(pCtx, "P pour reprendre", game.width / 2, game.height / 2 + 100);
        }
    }
}