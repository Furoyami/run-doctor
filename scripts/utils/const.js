const CONST = Object.freeze({

    // Taille canvas
    WIDTH: canvas.width,
    HEIGHT: canvas.height,

    // Valeurs possibles pour les offset X et Y
    OFFSET_LEFT: -1,
    OFFSET_RIGHT: 1,
    OFFSET_DOWN: 1,
    OFFSET_UP: -1,

    // Valeurs pour le activeKeys
    ARROWUP: "ArrowUp",
    ARROWRIGHT: "ArrowRight",
    ARROWDOWN: "ArrowDown",
    ARROWLEFT: "ArrowLeft",

    // Clés d'interactions clavier
    KEYW: "KeyW",
    KEYD: "KeyD",
    KEYS: "KeyS",
    KEYA: "KeyA",
    KEYR: "KeyR",
    KEYQ: "KeyQ",
    KEYE: "KeyE",

    KEYF5: "F5",

    // States
    LOADING: "loading",
    PLAYING: "playing",
    PAUSE: "pause",
    GAMEOVER: "gameover",

    // Max speed pour l'acceleration des ennemis
    MAX_SPEED_COEFF: 2.5,

    // ---------- TILES ----------

    OUT_OF_BOUNDS: -1,
    VOID: 0,
    // infranchissable
    WALL: 1,
    // unwalkable pour le calcul de PF uniquement. Les ennemis peuvent le traverser en retombant après respawn
    UNWALKABLE_VOID: 9,
    // interactions
    LADDER: 2,
    ITEM: 3,
    TARDIS_LT: 4,
    TARDIS_RT: 5,
    TARDIS_LB: 6,
    TARDIS_RB: 7,
    // uniquement présente pour utilisation dans les détéctions de cases franchissables
    STARTPOSENEMY: 8,

    // franchissable ou permettant la chute
    WALKABLE: [0, 3, 4, 5, 6, 7, 8]
});