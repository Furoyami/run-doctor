class LoadingScene {
    constructor() { }

    drawLoading(pCtx) {
        let ratio = game.imageLoader.getLoadedRatio();
        pCtx.fillStyle = "rgb(255,255,255)";
        pCtx.fillRect(game.width / 2 - 200, game.height / 2 - 25, 400, 50);
        pCtx.fillStyle = "rgb(0,255,255)";
        pCtx.fillRect(game.width / 2 - 200, game.height / 2 - 25, 400 * ratio, 50);
    }
}