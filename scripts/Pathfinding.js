class Pathfinding {
    constructor(map) {
        this.map = map;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    findPath(start, goal) {
        const openSet = [start];
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

            const neighbors = this.getValidNeighbors(current);

            for (let neighbor of neighbors) {
                if (closedSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    continue;
                }

                const neighborNode = new Node(neighbor.x, neighbor.y);
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

        return [];
    }

    /**
     * 
     * @param {object} current entité courante
     * @returns un tableau filtré des voisins poteniels valides
     */
    getValidNeighbors(current) {
        const potentialNeighbors = [
            { x: current.x - 1, y: current.y },
            { x: current.x + 1, y: current.y },
            { x: current.x, y: current.y - 1 },
            { x: current.x, y: current.y + 1 }
        ];

        return potentialNeighbors.filter(neighbor => {
            // Vérifier si le voisin est dans les limites de la carte
            if (neighbor.x < 0 || neighbor.x >= this.map[0].length || neighbor.y < 0 || neighbor.y >= this.map.length) {
                return false;
            }

            // Récupérer le type de tuile de la carte
            const targetTile = this.map[neighbor.y][neighbor.x];

            //Empecher les montées par le VOID si aucune case solide dessous
            let tileBelow;
            if (neighbor.y + 1 < this.map.length) {
                tileBelow = this.map[neighbor.y + 1][neighbor.x];
            } else {
                tileBelow = CONST.WALL;
            }

            if (targetTile === CONST.VOID && neighbor.y < current.y && tileBelow === CONST.VOID) return false;

            // Cases infranchissable
            if (targetTile === CONST.WALL ||
                targetTile === CONST.UNWALKABLE_VOID) return false;

            // Ajoutez d'autres contraintes ici si nécessaire

            return true; // Si aucune contrainte n'est enfreinte
        });
    }

}

