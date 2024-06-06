class Hole {
    constructor() {
        this.timerLeft = 3;
        this.timerRight = 3;
    }

    CreatHole(pOffsetX, pOffsetY) {
        let playerPos = myPlayer.getPlayerPos();
        let playerLine = playerPos[0] + pOffsetY;
        let playerCol = playerPos[1] + pOffsetX;
        let imgHole = imageLoader.getImage("images/hole_tile.png");
        spriteHole = new Sprite(imgHole);
        spriteHole.currentHole = "here";
        spriteHole.setTileSheet(40, 40);
        spriteHole.x = playerCol * myGrid.cellSize;
        spriteHole.y = playerLine * myGrid.cellSize;
        spriteHole.addAnimation("DIG", [1, 2, 3, 4, 5, 6], 0.1, false);
        spriteHole.startAnimation("DIG");

        lstHoles.push(spriteHole);
    }

    FillHole() {
        spriteHole.addAnimation("FILL", [6, 5, 4, 3, 2, 1, 0], 0.1, false);
        spriteHole.startAnimation("FILL");
    }

    Update(dt) {
        lstHoles.forEach(hole => {
            hole.update(dt);
            if (hole.currentAnimation.name == "DIG" && hole.currentAnimation.end == true) {
                this.timerLeft -= dt;
                this.timerRight -= dt;
                if (this.timerLeft <= 0) {
                    this.timerLeft = 3;
                    this.FillHole();
                }
                if (this.timerRight <= 0) {
                    this.timerRight = 3;
                    this.FillHole();
                }
            }

            if (hole.currentAnimation.name == "FILL" && hole.currentAnimation.end == true && !myMap.isWall(-1, 1)) {
                myMap.FillBrick(-1, 1);
                lstHoles.splice(0, 1);
            }
            else if (hole.currentAnimation.name == "FILL" && hole.currentAnimation.end == true && !myMap.isWall(1, 1)) {
                myMap.FillBrick(1, 1);
                lstHoles.splice(0, 1);
            }
        });
    }

    Draw(pCtx) {
        lstHoles.forEach(hole => {
            hole.draw(pCtx);
        });
    }
}