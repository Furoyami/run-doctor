class Pathfinder {
    constructor() {
        this.openList = [];
        this.closedList = [];
        this.path = [];
    }

    init(grid, startPos, endPos) {
        this.grid = grid;
        this.startNode = { x: startPos[1], y: startPos[0] };
        this.endNode = { x: endPos[1], y: endPos[0] };
    }

    findPath(start, end) {
        let openList = [];
        let closedList = [];

        openList.push(start);

        while (openList.length > 0) {
            // Trouver le nœud avec le coût total le plus bas dans la liste ouverte
            let currentNode = openList[0];
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < currentNode.f || (openList[i].f === currentNode.f && openList[i].h < currentNode.h)) {
                    currentNode = openList[i];
                }
            }

            // Retirer le nœud actuel de la liste ouverte et l'ajouter à la liste fermée
            openList = openList.filter(node => node !== currentNode);
            closedList.push(currentNode);

            // Si le nœud actuel est le nœud d'arrivée, nous avons trouvé le chemin
            if (currentNode === end) {
                return this.reconstructPath(start, end);
            }

            // Explorer les voisins du nœud actuel
            let neighbors = this.grid.getNeighbors(currentNode);
            for (let neighbor of neighbors) {
                if (closedList.includes(neighbor) || neighbor.type === WALL) {
                    continue; // Ignorer les nœuds déjà traités ou les murs
                }

                let gScore = currentNode.g + this.calculateDistance(currentNode, neighbor);
                if (!openList.includes(neighbor) || gScore < neighbor.g) {
                    neighbor.g = gScore;
                    neighbor.h = this.heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = currentNode;

                    if (!openList.includes(neighbor)) {
                        openList.push(neighbor);
                    }
                }
            }
        }

        // Si la liste ouverte est vide et que nous n'avons pas trouvé de chemin, retourner une liste vide
        return [];
    }

    // Méthode pour estimer la distance entre deux nœuds
    heuristicCost(current, end) {
        let dx = Math.abs(current.col - end.col);
        let dy = Math.abs(current.row - end.row);
        return dx + dy;
    }

    // Méthode pour calculer la distance entre deux nœuds
    calculateDistance(nodeA, nodeB) {
        let dx = Math.abs(nodeB.col - nodeA.col);
        let dy = Math.abs(nodeB.line - nodeA.line);
        return dx + dy;
    }

    computeCost(current, neighbor) {
        // Coût du déplacement entre le nœud actuel et son voisin
        const dx = Math.abs(current.col - neighbor.col);
        const dy = Math.abs(current.row - neighbor.row);
        const diagonal = dx === 1 && dy === 1;
        const cost = diagonal ? DIAGONAL_COST : STRAIGHT_COST;

        return cost;
    }

    getNeighbors(current) {
        const neighbors = [];
        const { row, col } = current;

        // Voisin en haut
        if (row > 0) {
            neighbors.push(this.nodes[row - 1][col]);
        }
        // Voisin en bas
        if (row < this.rows - 1) {
            neighbors.push(this.nodes[row + 1][col]);
        }
        // Voisin à gauche
        if (col > 0) {
            neighbors.push(this.nodes[row][col - 1]);
        }
        // Voisin à droite
        if (col < this.cols - 1) {
            neighbors.push(this.nodes[row][col + 1]);
        }

        return neighbors;
    }

    reconstructPath(startNode, endNode) {
        let path = [];
        let currentNode = endNode;

        while (currentNode !== startNode) {
            path.unshift(currentNode);
            currentNode = currentNode.parent;
        }

        path.unshift(startNode);

        return path;
    }
}
