class Pathfinding {
    constructor(map) {
        this.map = map;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    isWalkable(x, y) {
        const tile = this.map[y][x];
        return tile !== CONST.WALL && tile !== CONST.FALL_ONLY_VOID;
    }

    simulateFall(x, y) {
        // Simule une chute et retourne la première case valide ou null si hors de portée
        let currentY = y + 1;
        while (currentY < this.map.length) {
            const tile = this.map[currentY][x];
            // Si on atteint une case non-VOID, on vérifie sa validité
            if (tile !== CONST.FALL_ONLY_VOID && tile !== CONST.WALKABLE_VOID) {
                return this.isWalkable(x, currentY) ? { x, y: currentY } : null;
            }
            currentY++;
        }
        return null; // Aucun sol valide trouvé
    }


    findPath(start, goal) {

        const openSet = [];
        const closedSet = [];

        openSet.push(start);

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

            // Liste des potentiels voisins (exclut les diagonales, uniquement déplacements verticaux et horizontaux)
            const potentialNeighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 }
            ];

            // Filtrer les voisins valides avant de les ajouter
            const neighbors = [];
            for (let n of potentialNeighbors) {
                // Vérifier que le voisin est dans les limites de la carte
                if (n.x >= 0 && n.x < this.map[0].length && n.y >= 0 && n.y < this.map.length) {

                    let currentTile = this.map[current.y][current.x];
                    let targetTile = this.map[n.y][n.x];

                    // Empêcher les mouvements impossibles

                    // Les murs sont infranchissables 
                    if (targetTile === CONST.WALL) {
                        continue; // Ignorer ce voisin
                    }

                    if (targetTile === CONST.FALL_ONLY_VOID) {
                        const fallTarget = this.simulateFall(n.x, n.y);
                        if (fallTarget) {
                            neighbors.push(fallTarget);
                        }
                        continue; // Ne pas traiter la case VOID comme un voisin direct
                    }


                    // Si on essaie de monter vers une case, il faut que la case actuelle ne soit pas vide
                    if (n.y < current.y && currentTile === (CONST.FALL_ONLY_VOID || CONST.WALKABLE_VOID)) continue; // Ignorer ce voisin

                    neighbors.push(n);
                } else {
                    // console.log(`Neighbor potentiel (${n.x}, ${n.y}) est hors limites et ne sera pas ajouté.`);
                }
            }

            for (let neighbor of neighbors) {
                if (neighbor.x < 0 || neighbor.x >= this.map[0].length || neighbor.y < 0 || neighbor.y >= this.map.length || this.map[neighbor.y][neighbor.x] === 1) {
                    continue;
                }

                const neighborNode = new Node(neighbor.x, neighbor.y);
                if (closedSet.some(n => n.x === neighborNode.x && n.y === neighborNode.y)) {
                    // console.log(`Neighbor (${neighbor.x}, ${neighbor.y}) est déjà dans closedSet`);
                    continue;
                }

                const tentative_g = current.g + 1;

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

        // console.warn('Aucun chemin trouvé');
        return [];
    }
}
