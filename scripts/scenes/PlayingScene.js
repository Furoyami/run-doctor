class PlayingScene {
    constructor() {
        this.isLevelCompleted = false; // verrou pour assurer qu'un seule niveau soit passé en cas de contact avec le tardis
    }

    keyDownPlaying(e) {
        switch (e.code) {
            case CONST.ARROWUP:
            case CONST.KEYW:
                if (!game.activeKeys.has(CONST.ARROWUP)) {
                    game.activeKeys.add(CONST.ARROWUP);
                    game.keyOrder.unshift(CONST.ARROWUP); // Ajoute en tête
                }
                break;
            case CONST.ARROWRIGHT:
            case CONST.KEYD:
                if (!game.activeKeys.has(CONST.ARROWRIGHT)) {
                    game.activeKeys.add(CONST.ARROWRIGHT);
                    game.keyOrder.unshift(CONST.ARROWRIGHT);
                }
                break;
            case CONST.ARROWDOWN:
            case CONST.KEYS:
                if (!game.activeKeys.has(CONST.ARROWDOWN)) {
                    game.activeKeys.add(CONST.ARROWDOWN);
                    game.keyOrder.unshift(CONST.ARROWDOWN);
                }
                break;
            case CONST.ARROWLEFT:
            case CONST.KEYA:
                if (!game.activeKeys.has(CONST.ARROWLEFT)) {
                    game.activeKeys.add(CONST.ARROWLEFT);
                    game.keyOrder.unshift(CONST.ARROWLEFT);
                }
                break;
            // animation de creusage
            case CONST.KEYQ:
                    this.handleDigging("left", CONST.OFFSET_LEFT, "DIG_LEFT");
                break;

            case CONST.KEYE:
                    this.handleDigging("right", CONST.OFFSET_RIGHT, "DIG_RIGHT");
                break;
            case CONST.KEYVOLDOWN:
                game.adjustAllVolumes("down");
                break;
            case CONST.KEYVOLUP:
                game.adjustAllVolumes("up");
                break;
            case CONST.KEYVOLMUTE:
                game.muteAll();
                break;
            case CONST.KEYP:
                game.state = CONST.PAUSE;
                game.mscTheme.pause();
                console.log(game.state);
                break;
            case CONST.KEYF1:
                if (game.timeLord) game.isPathVisible = !game.isPathVisible;
                break;
            case CONST.KEYF2:
                if (game.timeLord) game.isCoordsVisible = !game.isCoordsVisible;
                break;
            case CONST.KEYF3:
                if (game.timeLord) game.isUnkillable = !game.isUnkillable;
                break;
            case CONST.KEYF4:
                if (game.timeLord) game.isFrozen = !game.isFrozen;
                break;
            case CONST.KEYF6:
                if (game.timeLord) game.isAccelerated = !game.isAccelerated;
                    break;
        }
    }

    keyUpPlaying(e) {
        switch (e.code) {
            case CONST.ARROWUP:
            case CONST.KEYW:
                game.activeKeys.delete(CONST.ARROWUP);
                game.keyOrder = game.keyOrder.filter(k => k !== CONST.ARROWUP);
                break;
            case CONST.ARROWRIGHT:
            case CONST.KEYD:
                game.activeKeys.delete(CONST.ARROWRIGHT);
                game.keyOrder = game.keyOrder.filter(k => k !== CONST.ARROWRIGHT);
                if (game.player.isAligned()) game.spritePlayer.startAnimation("IDLE_RIGHT");
                break;
            case CONST.ARROWDOWN:
            case CONST.KEYS:
                game.activeKeys.delete(CONST.ARROWDOWN);
                game.keyOrder = game.keyOrder.filter(k => k !== CONST.ARROWDOWN);
                break;
            case CONST.ARROWLEFT:
            case CONST.KEYA:
                game.activeKeys.delete(CONST.ARROWLEFT);
                game.keyOrder = game.keyOrder.filter(k => k !== CONST.ARROWLEFT);
                if (game.player.isAligned()) game.spritePlayer.startAnimation("IDLE_LEFT");
                break;
            case CONST.KEYQ:
                    game.spritePlayer.startAnimation("IDLE_LEFT");
                    game.isDiggingDirection = null;
                break;
            case CONST.KEYE:
                    game.spritePlayer.startAnimation("IDLE_RIGHT");
                    game.isDiggingDirection = null;
                break;
        }
    }

    async updatePlaying(dt) {
        if (!game.gameReady) return;
        game.map.Update(dt);
        game.lstSprites.forEach(sprite => sprite.update(dt));

        game.player.Update(dt);

        if (game.timeLord && game.isFrozen) {
            return;
        } else {
            game.lstEnemies.forEach(enemy => {

                let enemyPos = enemy.getEnemyPos();
                let enemyLine = enemyPos[0];
                let enemyCol = enemyPos[1];

                let playerPos = game.player.getPlayerPos();
                let playerLine = playerPos[0];
                let playerCol = playerPos[1];

                enemy.Update(dt, playerCol, playerLine);

                /* reduit la vitesse des ennemis au respawn du joueur ou sur une échelle
                    pour lui permettre de se replacer */
                if (game.player.isInvincible || (game.map.getUnderEnemyID(enemy, 0, 0) === CONST.LADDER)) {
                    enemy.spriteEnemy.speed = enemy.spriteEnemy.baseSpeed;
                } else {
                    // augmente la vitesse en fonction du nombre de clés ramassé
                    const SPEEDMUTLIPLIER = Math.min(1 + game.map.getItemsCollected() * 0.25, CONST.MAX_SPEED_COEFF);
                    enemy.spriteEnemy.speed = enemy.spriteEnemy.baseSpeed * SPEEDMUTLIPLIER;
                }

                /* vérifie la direction dans laquelle va le joueur et applique un offset s'il va vers la gauche
                l'offset ajoute une tolérance pour rendre la collsion plus précise dans ce sens */
                let playerDir = game.player.spritePlayer.offsetX;
                if (playerDir) playerCol - 1;
                
                // Tue le joueur s'il entre en collision avec un ennemi
                if (!game.player.isInvincible &&
                    playerCol === enemyCol &&
                    playerLine === enemyLine) {
                    enemy.hasReachedTarget = false;
                    game.sndDalek.play();
                    game.player.playerDies();
                }

                this.handleTraps(dt, enemy, enemyCol, enemyLine);
            });
        }
        if (this.isLevelCompleted) return;

        // level up si le joueur touche le tardis
        if ((game.map.getUnderPlayerID(0, 0) === CONST.TARDIS_LT || game.map.getUnderPlayerID(0, 0) === CONST.TARDIS_RT ||
            game.map.getUnderPlayerID(0, 0) === CONST.TARDIS_LB || game.map.getUnderPlayerID(0, 0) === CONST.TARDIS_RB)
            && game.spritePlayer.vX === 0 && game.map.getNbItemsInLevel() === 0) {
            this.isLevelCompleted = true;
            game.map.currentLevelId += 1;

            let result = await game.map.LoadLevelOnDemand(game.map.currentLevelId, CONST.CLASSIC);
            if (result.success) {
                await game.initLevel(false);
                console.log("TARDIS touché, niveau chargé :", game.map.currentLevelId);
            } else if (result.reason === CONST.NO_MORE_LEVELS) {
                game.state = CONST.GAMEWIN;
                game.mscTheme.stop();
                console.log("Victoire ! Tous les niveaux terminés !");
            } else {
                console.error("Erreur de chargement du niveau, retour au niveau 1");
                game.map.currentLevelId = 1;
                await game.initLevel(true);
            }
            this.isLevelCompleted = false;
        }

        game.lstHoles.forEach(hole => {
            if (hole.isDigging) hole.Update(dt);
            hole.UpdateTimer(dt);
        });
        // permet de retirer le trou de la liste une fois que son timer est terminé
        while (game.lstHoles.length > 0 && game.lstHoles[0].isDone) {
            let finishedHole = game.lstHoles.shift();
            let spriteIndex = game.lstSprites.indexOf(finishedHole.spriteHole);
            if (spriteIndex !== -1) game.lstSprites.splice(spriteIndex, 1);
        }

        game.pathfinding.updateCostMapTimers(dt);
    }

    drawPlaying(pCtx) {
        game.map.Draw(pCtx);
        game.lstSprites.forEach(sprite => sprite.draw(pCtx));
        this.drawHUD();
        if (game.timeLord && game.isPathVisible) {
            game.grid.DrawGrid(pCtx);
            game.lstEnemies.forEach(enemy => enemy.drawPath(pCtx)); // path des ennemis
        }
    }

    drawHUD() {
        // Fond
        hudCtx.fillStyle = "#020509";
        hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
        hudCtx.fillStyle = "#DFDFDF";
        hudCtx.font = "35px Pixel";
        // Blocs
        CONST.BLOCKS.forEach(block => {
            // Icone
            if (block.icon) {
                const width = block.iconWidth;
                const height = block.iconHeight;
                hudCtx.drawImage(game.imageLoader.getImage(block.icon),
                    block.x + block.iconOffset,
                    5,
                    width,
                    height
                );
            }
            // Texte
            let textValue;
            // verifie si le bloc texte est statique ou une fonction dynamique. typeof retourne le type de chaine
            if (typeof block.text === "function") {
                textValue = block.text(game);
            } else {
                textValue = block.text;
            }
            hudCtx.fillText(textValue, block.x + block.textOffset, 30);
        });
        hudCtx.fillText("P : Pause", 910, 30);

        if (game.timeLord) {
            hudCtx.fillStyle = "#FFD700";
            hudCtx.font = "10px Arial";
            game.centerText(hudCtx, "Numpad + ou - : changer niveau    Numpad / ou * : changer vie    F1: afficher path des ennemis    F2: afficher coords des tiles    F3: mode invincible    F4: freeze ennemis et creusage   F6: Speed Boost", hudCanvas.width / 2, hudCanvas.height - 5);
        }
    }

    handleDigging(direction, offsetX, animation) {
        if (game.isDiggingDirection === null) {
            game.spritePlayer.startAnimation(animation);
            game.sndScrewdriver.play();
            game.isDiggingDirection = direction;
            let hole = new Hole();
            hole.startDigging(offsetX, CONST.OFFSET_DOWN);
            if (hole.isDigging) {
                game.lstHoles.push(hole);
                game.lstSprites.push(hole.spriteHole);
                game.isDiggingDirection = direction;
                let playerCol = Math.round(game.spritePlayer.x / game.grid.cellSize);
                if ((game.spritePlayer.lastVx < 0 && offsetX < 0 && hole.col === playerCol - 1) ||
                    (game.spritePlayer.lastVx > 0 && offsetX > 0 && hole.col === playerCol + 1)) {
                    game.spritePlayer.vX = 0;
                    game.spritePlayer.vY = 0;
                    game.spritePlayer.dist = 0;
                }
            }
        }
    }

    // gère les pieges
    handleTraps(dt, enemy, enemyCol, enemyLine) {
        // Verification du piegeage
        let trapHole = game.lstHoles.find(hole =>
            hole.isTrap &&
            hole.col === enemyCol &&
            hole.line === enemyLine
        );

        if (!enemy.isTrapped && trapHole) {
            // devient piégé
            if (enemy.spriteEnemy.currentAnimation.name.endsWith("_LEFT")) {
                enemy.spriteEnemy.startAnimation("LEFT");
            } else if (enemy.spriteEnemy.currentAnimation.name.endsWith("_RIGHT")) {
                enemy.spriteEnemy.startAnimation("RIGHT");
            }
            enemy.isTrapped = true;
            enemy.trappedTimer = game.rnd(3, 8);
            enemy.trappedAt = { col: enemyCol, line: enemyLine };
            enemy.path = [];
            enemy.isFalling = false;
            game.map.ChangeToUnwalkable(enemyCol, enemyLine); // change la case en unwalkable pour que le joueur puisse marcher dessus

            enemy.dropItem();
        } else if (enemy.isTrapped && enemy.trappedTimer <= 0) {
            // libération
            let targetLine = enemy.trappedAt.line - 1;
            let targetY = targetLine * game.grid.cellSize;

            if (enemy.spriteEnemy.y > targetY) {
                enemy.spriteEnemy.y -= enemy.spriteEnemy.speed * dt;

                if (enemy.spriteEnemy.y <= targetY) {
                    enemy.spriteEnemy.y = targetY;
                    enemy.spriteEnemy.line = targetLine;
                    enemy.isTrapped = false;
                    enemy.justFreed = true;
                    enemy.updatePath();

                    // Vérifier et ramasser la clé au-dessus
                    let currentTile = game.map.getUnderEnemyID(enemy, 0, 0); // Case où il arrive
                    if (currentTile === CONST.ITEM) {
                        enemy.pickupItem();
                    }
                }
            }
        } else if (enemy.isTrapped && !game.lstHoles.some(hole =>
            // enterré → respawn
            hole.isTrap &&
            hole.col === enemy.trappedAt.col &&
            hole.line === enemy.trappedAt.line)) {
            enemy.respawnAtTop();
            enemy.isTrapped = false;
            enemy.trappedTimer = 0;
            enemy.trappedAt = null;
        }
    }
}