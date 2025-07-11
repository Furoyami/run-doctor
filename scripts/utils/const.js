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
    KEYP: "KeyP",
    KEYSPACE:"Space",

    KEYF1: "F1",
    KEYF2: "F2",
    KEYF3: "F3",
    KEYF4: "F4",
    KEYF5: "F5",
    KEYF6: "F6",

    // Clés de gestion du son
    KEYVOLUP: "KeyV",
    KEYVOLDOWN: "KeyC",
    KEYVOLMUTE: "Semicolon",

    // States
    LOADING: "loading",
    TITLE: "title",
    PLAYING: "playing",
    PAUSE: "pause",
    GAMEWIN: "gamewin",
    GAMEOVER: "gameover",
    LEVELEDITOR: "leveleditor",

    // Max speed pour l'acceleration des ennemis
    MAX_SPEED_COEFF: 2.25,

    // Type de niveau (prévision lvl custom pour l'éditeur)
    CLASSIC: "classic",

    // Valeurs de success.reason pour les passage de niveaux
    NO_MORE_LEVELS: "no_more_levels",
    LOAD_ERROR: "load_error",

    // ---------- TILES ----------

    OUT_OF_BOUNDS: -1,
    VOID: 0,
    TRAP: 12, // chute au travers mais bloquée en horizontal
    // infranchissable
    WALL: 1,
    METAL: 11,
    // unwalkable pour passer sur un ennemi piégé
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
    STARTPOSPLAYER: 10,

    // franchissable ou permettant la chute
    WALKABLE: Object.freeze([
        -1, // OUT_OF_BOUNDS
        0,  // VOID
        12, // TRAP
        3,  // ITEM
        4,  // TARDIS_LT
        5,  // TARDIS_RT
        6,  // TARDIS_LB
        7,  // TARDIS_RB
        8,   // STARTPOSENEMY
        10 //STARTPOSPLAYER
    ]),

    // ---------- HUD BLOCKS ----------
    BLOCKS: Object.freeze([

        // déplacement
        {
            icon: "images/icons/move.png",
            text: " : Déplacement",
            x: 10,
            iconOffset: 0,
            textOffset: 80,
            iconWidth: 80,
            iconHeight: 40
        },

        // creusage
        {
            icon: "images/icons/dig.png",
            text: " : A/E",
            x: 280,
            iconOffset: 0,
            textOffset: 30,
            iconWidth: 30,
            iconHeight: 30
        },

        //clés
        {
            icon: "images/icons/keyIcon.png",
            // syntaxe pour que les changement se répercutent pour le rendu
            text: (game) => ": " + game.map.getNbItemsInLevel(),
            x: 550,
            iconOffset: 0,
            textOffset: 30,
            iconWidth: 30,
            iconHeight: 30
        },

        // vies
        {
            icon: "images/icons/heart.png",
            text: (game) => ": " + game.player.lives,
            x: 650,
            iconOffset: 0,
            textOffset: 35,
            iconWidth: 30,
            iconHeight: 30
        },

        // energy (à modif avec les données d'energie)
        // {
        //     icon: "images/icons/heart.png",
        //     text: (game) => ": " + game.player.lives,
        //     x: 750,
        //     iconOffset: 0,
        //     textOffset: 35,
        //     iconWidth: 30,
        //     iconHeight: 30
        // },

        // son
        {
            icon: "images/icons/volMute.png",
            text: ": M",
            x: canvas.width - 80,
            iconOffset: 0,
            textOffset: 30,
            iconWidth: 30,
            iconHeight: 30
        },

        {
            icon: "images/icons/volDown.png",
            text: ": C",
            x: canvas.width - 160,
            iconOffset: 0,
            textOffset: 30,
            iconWidth: 30,
            iconHeight: 30
        },
        {
            icon: "images/icons/volUp.png",
            text: ": V",
            x: canvas.width - 240,
            iconOffset: 0,
            textOffset: 30,
            iconWidth: 30,
            iconHeight: 30
        }
    ])
});