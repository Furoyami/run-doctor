class Node {
    constructor(x, y, g = 0, h = 0, f = 0, parent = null) {
        this.x = x;       // Position X dans la grille
        this.y = y;       // Position Y dans la grille
        this.g = g;       // Coût du chemin depuis le nœud de départ jusqu'à ce nœud
        this.h = h;       // Heuristique (estimation du coût du chemin restant jusqu'au but)
        this.f = f;       // Coût total (g + h)
        this.parent = parent; // Référence au nœud parent pour retracer le chemin
    }
}
