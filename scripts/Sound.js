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
}