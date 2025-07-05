class Pathfinding {
    constructor() {
        this.costMap = null;
    }

    // estime le cout pour atteindre la cible
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    findPath(start, goal, map, forbiddenTiles = []) {
        const startNode = new Node(start.x, start.y);
        const openSet = [startNode];
        const closedSet = [];

        while (openSet.length > 0) {
            let current = openSet.reduce((prev, node) => (node.f < prev.f ? node : prev), openSet[0]);


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
                const tentative_g = current.g + moveCost;

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
            console.log("line: ", line, "col: ", col, "cost: ", this.costMap.matrix[line][col].cost)
            line--;
        }

    }

    // met à jour les timers de pénalité de coûts de costMap
    updateCostMapTimers(dt) {
        for (let line = 0; line < this.costMap.matrix.length; line++) {
            for (let col = 0; col < this.costMap.matrix[line].length; col++) {
                const cell = this.costMap.matrix[line][col];
                if (cell.cost > 1) {
                    cell.elapsedTime += dt;
                    if (cell.elapsedTime >= 10) {
                        cell.cost = 1;
                        cell.elapsedTime = 0;
                        console.log("timer reinit line: ", line, "col: ", col, "cost: ", cell.cost);
                        
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
        const solidTiles = [CONST.WALL, CONST.METAL, CONST.LADDER];

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

            // si le voisin direct est le joueur, toujours accessible
            if (neighbor.x === goal.x && neighbor.y === goal.y) return true;

            // Verif montée
            if (neighbor.y < current.y) {
                // Vérifier si la case actuelle est une échelle
                if (map[current.y][current.x] !== CONST.LADDER) {
                    return false;
                }
            }

            // Gestion du VOID
            if (targetTile === CONST.VOID) {
                // Autoriser les trous actifs (pièges) comme des cases accessibles
                if (game.lstHoles.some(hole => hole.isTrap)) return true;
                // joueur en dessous
                if (tileBelow === CONST.VOID && goal.y > current.y) return true;
                // Autoriser VOID au-dessus d'une TRAP pour permettre la descente
                if (tileBelow === CONST.TRAP) return true;
                // Interdire les cases VOID non soutenues (sauf si chute)
                if (!solidTiles.includes(tileBelow)) {
                    const currentTile = map[current.y][current.x];
                    const isHorizontalMove = neighbor.y === current.y;
                    const isVerticalMove = neighbor.y > current.y;
                    const isFall = (isHorizontalMove && (solidTiles.includes(currentTile) || currentTile === CONST.VOID || currentTile === CONST.TRAP) && tileBelow === CONST.VOID) ||
                        (isVerticalMove && (solidTiles.includes(currentTile) || currentTile === CONST.TRAP) && tileBelow === CONST.VOID);
                    if (!isFall) return false;
                }
                return true; // Autoriser si soutenu ou chute
            }

            // Gestion des traps
            if (targetTile === CONST.TRAP) {
                if (neighbor.y <= current.y) return false; // Bloquer les déplacements latéraux ou montants
                return true; // Autoriser les déplacements verticaux descendants
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

