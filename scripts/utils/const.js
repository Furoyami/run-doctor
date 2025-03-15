const CONST = {

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

    // Clés d'interactions' clavier
    KEYW: "KeyW",
    KEYD: "KeyD",
    KEYS: "KeyS",
    KEYA: "KeyA",
    KEYR: "KeyR",
    KEYQ: "KeyQ",
    KEYE: "KeyE",

    KEYF5: "F5",

    // ---------- TILES ----------

    // franchissable
    VOID: 0,

    // infranchissable
    WALL: 1,
    UNWALKABLE_VOID: 9,

    // interactions
    LADDER: 2,
    KEY: 3,

    TARDIS_LT: 4,
    TARDIS_RT: 5,
    TARDIS_LB: 6,
    TARDIS_RB: 7
};