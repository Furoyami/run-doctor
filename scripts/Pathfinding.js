class Pathfinding {
    constructor(map) {
        this.map = map;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    // findPath(start, goal) {
    //     const openSet = [start];
    //     const closedSet = [];

    //     const isTargetOnFallOnlyVoid = () => {
    //         const targetTile = this.map[goal.y]?.[goal.x];
    //         return targetTile === CONST.FALL_ONLY_VOID;
    //     };

    //     while (openSet.length > 0) {
    //         let current = openSet.reduce((prev, node) => (node.f < prev.f ? node : prev), openSet[0]);

    //         if (current.x === goal.x && current.y === goal.y) {
    //             let path = [];
    //             while (current.parent) {
    //                 path.push(current);
    //                 current = current.parent;
    //             }
    //             path.reverse();
    //             return path;
    //         }

    //         openSet.splice(openSet.indexOf(current), 1);
    //         closedSet.push(current);

    //         const potentialNeighbors = [
    //             { x: current.x - 1, y: current.y },
    //             { x: current.x + 1, y: current.y },
    //             { x: current.x, y: current.y - 1 },
    //             { x: current.x, y: current.y + 1 }
    //         ];

    //         const neighbors = [];
    //         for (let n of potentialNeighbors) {
    //             if (n.x >= 0 && n.x < this.map[0].length && n.y >= 0 && n.y < this.map.length) {
    //                 const targetTile = this.map[n.y][n.x];

    //                 // Règles spécifiques aux types de tuiles
    //                 if (targetTile === CONST.WALL) {
    //                     continue; // Toujours ignorer les murs
    //                 }

    //                 if (targetTile === CONST.FALL_ONLY_VOID && !isTargetOnFallOnlyVoid()) {
    //                     continue; // Ignorer FALL_ONLY_VOID si la cible n'est pas dessus
    //                 }

    //                 neighbors.push(n);
    //             }
    //         }

    //         for (let neighbor of neighbors) {
    //             if (closedSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
    //                 continue;
    //             }

    //             const neighborNode = new Node(neighbor.x, neighbor.y);
    //             const tentative_g = current.g + 1;

    //             if (!openSet.some(n => n.x === neighborNode.x && n.y === neighborNode.y) || tentative_g < neighborNode.g) {
    //                 neighborNode.g = tentative_g;
    //                 neighborNode.h = this.heuristic(neighborNode, goal);
    //                 neighborNode.f = neighborNode.g + neighborNode.h;
    //                 neighborNode.parent = current;

    //                 if (!openSet.some(n => n.x === neighborNode.x && n.y === neighborNode.y)) {
    //                     openSet.push(neighborNode);
    //                 }
    //             }
    //         }
    //     }

    //     return [];
    // }

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

            const potentialNeighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 }
            ];

            const neighbors = [];
            for (let n of potentialNeighbors) {
                if (n.x >= 0 && n.x < this.map[0].length && n.y >= 0 && n.y < this.map.length) {
                    const targetTile = this.map[n.y][n.x];

                    // Vérifier si la case est accessible
                    if (this.isTileAccessible(targetTile, goal)) {
                        neighbors.push(n);
                    }
                }
            }

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
     * Vérifie si une tuile est accessible selon sa nature et la position de la cible.
     * @param {number} tile - Type de tuile (e.g., WALL, WALKABLE_VOID, FALL_ONLY_VOID).
     * @param {Object} goal - Position cible { x, y }.
     * @returns {boolean} - True si la tuile est accessible, false sinon.
     */
    isTileAccessible(tile, goal) {
        if (tile === CONST.WALL) {
            return false; // Toujours infranchissable
        }

        if (tile === CONST.FALL_ONLY_VOID) {
            const goalTile = this.map[goal.y]?.[goal.x];
            return goalTile === CONST.FALL_ONLY_VOID; // Accessible si la cible est en chute
        }

        return true; // WALKABLE_VOID ou autres cas franchissables
    }


}
