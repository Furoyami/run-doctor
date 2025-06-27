class Pathfinding {
    constructor() {
        this.costMap = null;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    findPath(start, goal, map, forbiddenTiles = []) {
        const startNode = new Node(start.x, start.y);
        const openSet = [startNode];
        const closedSet = [];

        while (openSet.length > 0) {
            let current = openSet.reduce((prev, node) => (node.f < prev.f ? node : prev), openSet[0]);
            console.log("current", current);
            

            if (current.x === goal.x && current.y === goal.y) {
                let path = [];
                while (current.parent) {
                    path.push(current);
                    current = current.parent;
                }
                path.reverse();
                return path;
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.push(current);

            const neighbors = this.getValidNeighbors(current, map, forbiddenTiles, goal);

            for (let neighbor of neighbors) {
                if (closedSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    continue;
                }

                const neighborNode = new Node(neighbor.x, neighbor.y);
                let moveCost = Number(this.costMap.matrix[neighbor.y][neighbor.x].cost) || 1;
                // console.log("moveCost :", moveCost);
                const tentative_g = current.g + moveCost;
                // console.log("tentative_g :", tentative_g);
                

                if (!openSet.some(n => n.x === neighborNode.x && n.y === neighborNode.y) || tentative_g < neighborNode.g) {
                    neighborNode.g = tentative_g;
                    neighborNode.h = this.heuristic(neighborNode, goal);
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    neighborNode.parent = current;

                    if (!openSet.some(n => n.x === neighborNode.x && n.y === neighborNode.y)) {
                        openSet.push(neighborNode);
                    }
                }
            }
        }

        return [];
    }

    /**
     * applique des pénalités de chute aux cases par lesquelles l'ennemi est passé pour le forcer à chercher un autre chemin
     * @param {*} position coordonnées x/y de l'ennemi
     */
    raiseCost(position) {
        let col = position.x;
        let line = position.y - 1; // commence à la case au dessus de l'ennemi

        while (line >= 0 && this.costMap.matrix[line][col].tileType === CONST.VOID) {
            this.costMap.matrix[line][col].cost = 100;
            this.costMap.matrix[line][col].elapsedTime = 0; // reinit timer
            line--;
        }

    }

    updateCostMapTimers(dt) {
        for (let line = 0; line < this.costMap.matrix.length; line++) {
            for (let col = 0; col < this.costMap.matrix[line].length; col++) {
                const cell = this.costMap.matrix[line][col];
                if (cell.cost > 1) {
                    cell.elapsedTime += dt;
                    if (cell.elapsedTime >= 10) {
                        cell.cost = 1;
                        cell.elapsedTime = 0;
                        console.log("timer et réinit pour col:", { col }, "line: ", { line });
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {object} current entité courante
     * @param {object} map du niveau en cours
     * @param {*} forbiddenTiles liste des trous ayant servi comme pieges
     * @returns un tableau filtré des voisins poteniels valides
     */
    getValidNeighbors(current, map, forbiddenTiles, goal) {
        const potentialNeighbors = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 }
        ];

        // Récupérer les cases interdites définies dans le niveau
        const levelForbiddenTiles = game.map.getForbiddenPathTiles();
        const tardisTiles = [CONST.TARDIS_LB, CONST.TARDIS_LT, CONST.TARDIS_RB, CONST.TARDIS_RT];

        return potentialNeighbors.filter(neighbor => {

            // Vérifier si le voisin est dans les limites de la carte
            if (neighbor.x < 0 || neighbor.x >= map[0].length || neighbor.y < 0 || neighbor.y >= map.length) {
                return false;
            }

            // Récupérer le type de tuile de la carte
            const targetTile = map[neighbor.y][neighbor.x];

            //verifier la tuile du dessous
            let tileBelow;
            if (neighbor.y + 1 < map.length) {
                tileBelow = map[neighbor.y + 1][neighbor.x];
            } else {
                tileBelow = CONST.WALL;
            }

            // Gestion du VOID 
            if (targetTile === CONST.VOID) {
                // si la tile du dessous est void check la position du joueur
                if (tileBelow === CONST.VOID) {
                    // 1 - OK si c'est la case cible
                    if (neighbor.x === goal.x && neighbor.y === goal.y) return true;
                    // 2 - OK joueur en dessous
                    if (goal.y > current.y) return true;
                }

                // Bloquer montée si tileBelow n’est pas solide ou échelle
                if (targetTile === CONST.VOID && neighbor.y < current.y) {
                    if (![CONST.WALL, CONST.METAL, CONST.LADDER].includes(tileBelow)) {
                        return false;
                    }
                }
            }

            // Bloquer les montées sur les cases TARDIS si visible
            if (game.map.tardisVisible && tardisTiles.includes(targetTile) && neighbor.y < current.y) {
                return false;
            }

            // Cases infranchissable
            if (targetTile === CONST.WALL || targetTile === CONST.UNWALKABLE_VOID || targetTile === CONST.METAL) return false;

            // Exclure les cases interdites définies dans le niveau
            if (levelForbiddenTiles.some(tile => tile.x === neighbor.x && tile.y === neighbor.y)) {
                return false;
            }

            // Exclure les trous consommés
            if (forbiddenTiles.some(tile => tile.x === neighbor.x && tile.y === neighbor.y)) {
                return false;
            }

            return true; // Si aucune contrainte n'est enfreinte
        });
    }

}

