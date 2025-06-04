class TitleScene {
    constructor() {
        // clignotement du titre
        this.blinkTitle = 0;
        this.blinkLimit = 0.5;
        this.blinkVisible = true;
    }

    keyDownTitle(e) {
        // check cheat
        if (!game.isCheatActive && game.cheatInput.length === 0) game.isCheatActive = true;
        game.cheatTimer = 0; // reinit
        game.cheatInput.push(e.key); // ajout touche
        if (game.cheatInput.length > game.cheatCode.length) {
            game.cheatInput.shift();
        }
        // comparer le code saisi à la chaîne cheatCode
        if (game.cheatInput.join().toUpperCase() === game.cheatCode.join().toUpperCase()) {
            game.timeLord = true;
            game.cheatInput = [];
            game.isCheatActive = false;
        }

        switch (e.code) {
            case CONST.KEYSPACE:
                game.state = CONST.PLAYING;
                game.mscTheme.play();
                break;
            case CONST.KEYE:
                if (game.timeLord) {
                    game.state = CONST.LEVELEDITOR;
                    game.levelEditorScene.startLevelEditor();
                }
                break;
        }
    }

    updateTitle(dt) {
        
        this.blinkTitle += dt;
        if (this.blinkTitle >= this.blinkLimit) {
            this.blinkVisible = !this.blinkVisible;
            this.blinkTitle = 0;
        }
        
        if (game.isCheatActive) {
            game.cheatTimer += dt;

            if (game.cheatTimer >= 3) {
                console.log("Cheat input réinitialisé (3s sans touche)");
                game.cheatInput = [];
                game.isCheatActive = false;
                game.cheatTimer = 0;
            }
        }
    }

    drawTitle(pCtx) {
        pCtx.fillStyle = "#020509";
        pCtx.fillRect(0, 0, canvas.width, canvas.height);
        pCtx.fillStyle = "#DFDFDF";
        pCtx.font = "200px Pixel";
        game.centerText(pCtx, "RUN DOCTOR!", game.width / 2, game.height / 2 - 200);
        pCtx.font = "75px Pixel";
        if (this.blinkVisible) game.centerText(pCtx, "Espace pour jouer", game.width / 2, game.height / 2 + 200);
        if (game.timeLord) {
            pCtx.fillStyle = "#FFD700";
            pCtx.font = "100px Pixel";
            game.centerText(pCtx, "Mode Time Lord", game.width / 2, game.height / 2 - 100);
        }
    }
}