class Grid {
    constructor() {
        this.offsetX = 0;
        this.width = 32;
        this.height = 18;
        this.cellSize = 0;
        this.cells = [];
    }
    reset() {
        for (let l = 0; l < this.height; l++) {
            this.cells[l] = [];
            for (let c = 0; c < this.width; c++) {
                this.cells[l][c] = 7;
            }
        }
    }
    InitGrid() {
        if (debug) console.log("Init Grid");

        let cellHeight = HEIGHT / this.height;
        if (debug) console.log("cellHeight =", cellHeight);

        this.cellSize = cellHeight; // pour avoir une cellule carré

        this.offsetX = (WIDTH / 2) - ((this.cellSize * this.width) / 2); // centre la grille
        // remplissage de la grille
        for (let l = 0; l < this.height; l++) {
            this.cells[l] = [];
            for (let c = 0; c < this.width; c++) {
                this.cells[l][c] = 7;
            }

        }
    }

    DrawGrid(pCtx) {

        let h = this.cellSize,
            w = h;

        let x, y;

        for (let l = 0; l < this.height; l++) {
            for (let c = 0; c < this.width; c++) {
                x = c * w;
                y = l * h;
                x += this.offsetX;
                let id = this.cells[l][c];
                if (id == 7) {
                    pCtx.fillStyle = "#fff1";
                } else {

                }
                pCtx.fillRect(x, y, w - 1, h - 1);
            }

        }

    }


    // GETTERS



    getGridOffset() {
        return this.offsetX = (WIDTH / 2) - ((this.cellSize * this.width) / 2);
    }

    getGridCellSize() {
        return this.cellSize = HEIGHT / this.height;
    }

    getGridWidth() {
        return this.width * this.cellSize;
    }

    getGridHeight() {
        return this.height * this.cellSize;;
    }

    getGridNbLines() {
        return this.height;
    }

    getGridNbColumns() {
        return this.width;
    }
}
