class TitleScene {
    constructor() {
        // clignotement du titre
        this.blinkTitle = 0;
        this.blinkLimit = 0.5;
        this.blinkVisible = true;
        this.alpha = 1;
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
            case CONST.KEYX:
                game.state = CONST.CREDITS;
                break;
        }
    }

    updateTitle(dt) {
        
        this.blinkTitle += dt;
        if (this.blinkTitle >= this.blinkLimit) {
            this.blinkVisible = !this.blinkVisible;
            this.blinkTitle = 0;
        }

        // animation de l'alpha écran titre
        this.alpha -= dt / 2;
        if (this.alpha <= 0) this.alpha = 0;
        
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
        let imgTitle = game.imageLoader.getImage("images/title_screen.png");
        pCtx.drawImage(imgTitle, 0, 0);
        pCtx.font = "75px Pixel";
        if (this.blinkVisible) game.centerText(pCtx, "Espace pour jouer", game.width / 2, game.height / 2 + 300);
        if (game.timeLord) {
            pCtx.fillStyle = "#FFD700";
            pCtx.font = "100px Pixel";
            game.centerText(pCtx, "Mode Time Lord", game.width / 2, game.height / 2 - 100);
        }
        pCtx.font = "50px Pixel";
        pCtx.fillText("X : Crédits", game.width - 200, game.height - 25)

        // rectangle noir fondu
        pCtx.fillStyle = `rgba(2, 5, 9, ${this.alpha})`;
        pCtx.fillRect(0, 0, 1280, 720);
    }
}