class TitleScene {
    constructor() {
        // clignotement du titre
        this.blinkTitle = 0;
        this.blinkLimit = 0.5;
        this.blinkVisible = true;
    }

    updateTitle(dt) {
        this.blinkTitle += dt;
        if (this.blinkTitle >= this.blinkLimit) {
            this.blinkVisible = !this.blinkVisible;
            this.blinkTitle = 0;
        }
    }

    drawTitle(pCtx) {
        pCtx.fillStyle = "#020509";
        pCtx.fillRect(0, 0, canvas.width, canvas.height);
        pCtx.fillStyle = "#DFDFDF";
        pCtx.font = "200px Pixel";
        game.centerText(pCtx, "RUN DOCTOR!", game.width / 2, game.height / 2 - 200);
        pCtx.font = "75px Pixel";
        if (this.blinkVisible) game.centerText(pCtx, "Click pour jouer", game.width / 2, game.height / 2 + 200);
    }
}