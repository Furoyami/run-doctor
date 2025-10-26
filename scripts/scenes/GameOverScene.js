class GameOverScene {
    constructor() { 
        this.loseScreenTimer = 0 // timer global de la scene
        this.lstExplosions = [];
        this.tardisX = canvas.width / 2 - 40;
        this.tardisY = canvas.height / 2 - 40;
        this.showTardis = true;
        this.showText = false;
    }

    keyDownGameOver(e) {
        if (e.code === CONST.KEYR) game.restartGame();
    }

    createExplosion() {
        let imgExplosion = game.imageLoader.getImage("images/explosion.png");
        let explosion = new Sprite(imgExplosion);
        explosion.setTileSheet(40, 40);
        // randimoize l'explosion à partir du centre réel du tardis      
        explosion.x = this.tardisX + 20 + game.rnd (-40, 40);
        explosion.y = this.tardisY + 20 + game.rnd(-40, 40);
        explosion.life = 1;
        explosion.startTime = this.loseScreenTimer + game.rnd(0, 2.5);
        explosion.hasPlayedSound = false;

        explosion.addAnimation("EXPLOSION", [0, 1, 2, 3, 4, 5], .15, 0,false);
        explosion.startAnimation("EXPLOSION");

        return explosion;
    }

    addExplosion() {
        const maxExplosion = 7;
        this.lstExplosions = [];
        // vider les sprites de la scene de jeu pour eviter des affichage parasites
        game.lstSprites = []; 

        for (let i = 0; i < maxExplosion; i++){
            let explosion = this.createExplosion();
            this.lstExplosions.push(explosion);
            game.lstSprites.push(explosion);
        }
    }

    handleAudio() {
        game.mscTheme.stop();
        game.mscSpecialTheme.stop();
        game.mscLoseTheme.play();
    }

    updateGameOver(dt) {
        this.loseScreenTimer += dt;

        // parcours inverse pour éviter les bug d'index
        for (let i = this.lstExplosions.length - 1; i >= 0; i--){
            let explosion = this.lstExplosions[i];
            if (this.loseScreenTimer >= explosion.startTime) {
                if (!explosion.hasPlayedSound) {
                    game.sndExplosion.play(); // Joue son au démarrage
                    explosion.hasPlayedSound = true;
                }
                explosion.update(dt);
                explosion.life -= dt;
                if (explosion.life <= 0) {
                    this.lstExplosions.splice(i, 1);
                    // virer les explsions finies de lst sprites
                    let spriteIndex = game.lstSprites.indexOf(explosion);
                    if (spriteIndex !== -1) game.lstSprites.splice(spriteIndex, 1);
                }
            }
        }

        if (this.lstExplosions.length === 0) {
            this.showTardis = false;
            this.showText = true;
        } else {
            this.showTardis = true;
            this.showText = false;
        }
    }

    drawGameOver(pCtx) {
        if (this.showTardis) {
            let tardis = game.imageLoader.getImage("images/tardis.png");
            pCtx.drawImage(tardis, this.tardisX, this.tardisY);

            pCtx.fillStyle = "#DFDFDF";
            pCtx.font = "25px Pixel";
            pCtx.fillText("R : Skip animation et relancer", game.width - 250, 0 + 25);
        }

        game.lstSprites.forEach(explosion => {
            if(this.loseScreenTimer >= explosion.startTime) explosion.draw(pCtx);
        });

        if (this.showText) {
            pCtx.fillStyle = "#DFDFDF";
            pCtx.font = "75px Pixel";
            game.centerText(pCtx, "Perdu !", game.width / 2, game.height / 2 - 40);
            game.centerText(pCtx, "R pour rejouer !", game.width / 2, game.height / 2 + 20);
        }
        
    }
}