class CreditsScene {
    constructor() {
        this.credits = [
            "Un grand merci à ma famille pour m’avoir soutenu dans ce marathon d’un an !",
            "À David et Gamecodeur pour les cours et la motivation qui m’ont porté.",
            "À Epixhel, Alexaze, Draziel, Eluwen, Rigoleo, Kiki pour vos tests précieux.",
            "Au clan des Gamecodeurs et à tous ceux qui ont partagé retours et idées.",
            "Aux créateurs des jeux et œuvres qui m’ont inspiré pour ce projet.",
            "Et à toi, qui joues et lis ceci.",
            "Merci !"
        ];
    }

    keyDownCredits(e) {
        if (e.code === CONST.KEYX) game.state = CONST.TITLE;
    }

    drawCredits(pCtx) {
        pCtx.fillStyle = "#020509";
        pCtx.fillRect(0, 0, canvas.width, canvas.height);
        pCtx.fillStyle = "#DFDFDF";
        pCtx.font = "75px Pixel";
        game.centerText(pCtx, "Remerciements", game.width / 2, game.height / 2 - 300);
        pCtx.font = "35px Pixel";

        this.credits.forEach((msg, index) => {
            game.centerText(pCtx, msg, game.width / 2, 175 + index * 45); // 45 car 35px de police + 10 px d'espacement
        });

        pCtx.font = "25px Pixel";
        let avatar = game.imageLoader.getImage("images/shinpool.png");
        pCtx.drawImage(avatar, game.width / 2 - 40, game.height - 175); // 40 = avatar (80px) / 2
        game.centerText(pCtx, "Réalisé par Furo en JS/Canvas, Audacity, Photoshop.", game.width / 2, game.height - 60);

        pCtx.font = "50px Pixel";
        pCtx.fillText("X : Titre", game.width - 200, game.height - 25)
    }
}