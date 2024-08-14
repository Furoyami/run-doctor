class Pathfinding {
    constructor(map) {
        this.map = map;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
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

            const neighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 }
            ];


            for (let neighbor of neighbors) {
                if (neighbor.x < 0 || neighbor.x >= this.map.length || neighbor.y < 0 || neighbor.y >= this.map[0].length || this.map[neighbor.x][neighbor.y] === 1) {
                    continue;
                }

                const neighborNode = new Node(neighbor.x, neighbor.y);
                if (closedSet.some(n => n.x === neighborNode.x && n.y === neighborNode.y)) {
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

        return [];
    }
}
