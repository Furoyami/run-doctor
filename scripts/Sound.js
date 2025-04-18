class Sound {
    constructor(pSrc, pVolume = 1, pLoop = false) {
        this.audio = document.createElement("audio");
        this.audio.src = pSrc;
        this.audio.volume = pVolume;
        this.audio.loop = pLoop;
        this.audio.setAttribute("preload", "auto");
        this.audio.setAttribute("controls", "none");
        this.audio.style.display = "none";
        document.body.appendChild(this.audio);
        this.isStarted = false;
    }

    play() {
        this.audio.currentTime = 0;
        this.audio.pause();
        this.audio.play();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    mute() {
        //switch l'état muted / unmuted
        this.audio.muted = !this.audio.muted;
    }

    // permet de lancer la musique de fond à la 1ere interaction, sans avoir besoin de relancer le jeu
    startOnInteraction() {
        if (this.isStarted) return;

        this.isStarted = true;

        const handler = () => {
            this.play();
            document.removeEventListener("click", handler);
            document.removeEventListener("keydown", handler);
        };

        document.addEventListener("click", handler);
        document.addEventListener("keydown", handler);
    }
}