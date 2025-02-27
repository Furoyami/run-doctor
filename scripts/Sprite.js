class Sprite {
    constructor(pImg, pX = 0, pY = 0) {
        this.img = pImg;
        this.x = pX;
        this.y = pY;
        this.scaleX = 1;
        this.scaleY = 1;

        this.currentFrame = 0;
        this.currentFrameInAnimation = 0;
        this.currentAnimation = null;
        this.frameTimer = 0;

        this.tileSize = {
            x: 0,
            y: 0
        };
        this.tileSheet = false;
        this.animations = [];
    }

    addAnimation(pName, pFrames, pSpeed, pDelay = 0, pLoop = true) {
        let animation = {
            name: pName,
            frames: pFrames,
            speed: pSpeed,
            delay: pDelay,
            loop: pLoop,
            end: false
        };
        this.animations.push(animation);
    }

    startAnimation(pName) {
        if (this.currentAnimation != null) {
            if (this.currentAnimation.name == pName) {
                return;
            }
        }
        this.animations.forEach(animation => {
            if (animation.name == pName) {
                this.currentAnimation = animation;
                this.currentFrameInAnimation = 0;
                this.currentFrame = this.currentAnimation.frames[this.currentFrameInAnimation]; // récupère la première frame de l'animation
                this.currentAnimation.end = false;
                this.timeSinceLastFrame = 0; // Gère le timing des frames
                this.delayTimer = 0; // Gère le timing de la pause
                this.isInDelay = false; // Décide si l'anim joue ou est en pause
            }
        });
    }

    setTileSheet(pSizeX, pSizeY) {
        this.tileSheet = true;
        this.tileSize.x = pSizeX;
        this.tileSize.y = pSizeY;
    }

    setScale(pX, pY) {
        this.scaleX = pX;
        this.scaleY = pY;
    }

    update(dt) {
        if (!this.currentAnimation || this.currentAnimation.end) return;

        if (this.isInDelay) {
            this.delayTimer += dt;
            if (this.delayTimer >= this.currentAnimation.delay) {
                // si on atteint le delai fixé, on sort de la pause et on réinit
                this.isInDelay = false;
                this.currentFrameInAnimation = 0;
                this.timeSinceLastFrame = 0;
                this.currentFrame = this.currentAnimation.frames[this.currentFrameInAnimation];
            }
        } else {
            this.timeSinceLastFrame += dt;
            if (this.timeSinceLastFrame >= this.currentAnimation.speed) {
                this.currentFrameInAnimation++;
                if (this.currentFrameInAnimation >= this.currentAnimation.frames.length) {
                    if (this.currentAnimation.loop) {
                        if (this.currentAnimation.delay > 0) {
                            // si on a défini une pause, on l'initialise
                            this.isInDelay = true;
                            this.delayTimer = 0;
                        } else {
                            this.currentFrameInAnimation = 0;
                        }
                    } else {
                        this.currentAnimation.end = true;
                    }
                }
                if (!this.currentAnimation.end && !this.isInDelay) {
                    this.currentFrame = this.currentAnimation.frames[this.currentFrameInAnimation];
                    this.timeSinceLastFrame = 0;
                }
            }
        }
    }

    draw(pCtx) {
        if (!this.tileSheet) {
            pCtx.drawImage(this.img, this.x, this.y, this.img.naturalWidth * this.scaleX, this.img.naturalHeight * this.scaleY);
        }
        else {
            let nbCol = this.img.width / this.tileSize.x;
            let col = 0, line = 1;
            line = Math.floor(this.currentFrame / nbCol);
            col = this.currentFrame - (line * nbCol);

            //calcul position dans la tileSheet
            let x = col * this.tileSize.x;
            let y = line * this.tileSize.y;

            pCtx.drawImage(this.img, x, y, this.tileSize.x, this.tileSize.y, this.x, this.y, this.tileSize.x * this.scaleX, this.tileSize.y * this.scaleY);
        }
    }
}