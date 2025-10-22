class GameWinScene {
    constructor() { 
        this.lstStars = [];
        // distance des étoiles à l'écran
        this.far = 1;
        this.near = 2.5;
        this.tardisTimer = 0;
        this.tardisX = canvas.width / 2 - 40;
        this.tardisY = canvas.height / 2 - 40;
        this.tardisScale = 1;
        this.textScale = 0;
    }

    keyDownGameWin(e) {
        if (e.code === CONST.KEYR) game.restartGame();
    }

    // génère les étoiles de fond
    CreateStarField() {
        // max étoiles à l'écran
        const maxStars = 250;

        for (let i = 0; i < maxStars; i++){
            let star = {};
            star.x = game.rnd(0, canvas.width);
            star.y = game.rnd(0, canvas.height);
            star.distance = game.rnd(this.far, this.near);  
            star.alpha = 0;

            this.lstStars.push(star);
        }
        console.log(this.lstStars);       
    }

    handleAudio() {
        game.mscTheme.stop();
        game.mscSpecialTheme.stop();
        game.mscWinTheme.play();
    }

    updateGameWin(dt) {
        // animation des positions des étoiles
        for (let i = 0; i < this.lstStars.length; i++){
            let star = this.lstStars[i];
            star.x += dt * 2.5;
            star.y += dt * 2.5;

            // si l'étoile dépasse on la repositionne dans l'écran
            if (star.x > canvas.width || star.y > canvas.height) {
                star.x = game.rnd(-100, canvas.width);
                star.y = game.rnd(-100, canvas.height);
                star.distance = game.rnd(this.far, this.near);
                star.alpha = 0;
            } 
        }

        this.tardisTimer += dt * 2.5;
        let radius = 200 * (1 - this.tardisTimer / 5); // animation totale ~ 5s
        this.tardisX = canvas.width / 2 + Math.cos(this.tardisTimer * 2) * radius;
        this.tardisY = canvas.height / 2 + Math.sin(this.tardisTimer * 2) * radius;
        this.tardisScale = Math.max(0, 1 - this.tardisTimer / 5); // Rétrécit

        // Grossissement texte (basé sur le temps d'animation du tardis)
        if (this.tardisTimer < 4.8) {
            this.textScale = 0; // Texte invisible avant 2s
        } else {
            this.textScale = Math.min(1, (this.tardisTimer - 4.8) * 5); // Grossit en ~0.1s
        }
    }

    drawGameWin(pCtx) {
        // dessin du fond étoilé
        pCtx.fillStyle = "#070718ff";
        pCtx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.lstStars.length; i++) {
            let star = this.lstStars[i];
            if (star.distance < 1.5) {
                star.alpha = 0.25;
            } else {
                star.alpha = 1;
            }
            // dessin de l'étoile
            pCtx.fillStyle = `rgba(224, 224, 224, ${star.alpha})`;
            pCtx.fillRect(star.x, star.y, star.distance, star.distance);
        }

        // dessin tardis
        let tardis = game.imageLoader.getImage("images/tardis.png");
        pCtx.save();
        pCtx.translate(this.tardisX, this.tardisY); // Centre TARDIS
        pCtx.scale(this.tardisScale, this.tardisScale); // Rétrécit
        pCtx.drawImage(tardis, -40, -40, 80, 80);
        pCtx.restore();

        // dessin du texte
        pCtx.save();
        pCtx.translate(canvas.width / 2, canvas.height / 2);
        pCtx.scale(this.textScale, this.textScale);
        pCtx.fillStyle = "#DFDFDF";
        pCtx.font = "75px Pixel";
        game.centerText(pCtx, "Le tardis rejoint les étoiles !", 0, - 40);
        game.centerText(pCtx, "R pour recommencer l'aventure !", 0, 40);
        pCtx.restore();
    }
}