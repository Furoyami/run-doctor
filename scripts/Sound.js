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

    pause() {
        this.audio.pause();
    }

    resume() {
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

    upVolume() {
        if (this.audio.volume < 1) { // Changé <= en < pour éviter d’augmenter à 1
            this.audio.volume = Math.min(1, this.audio.volume + 0.1);
            this.roundToNearest();
        }
        console.log(this.audio.volume);
    }

    downVolume() {
        if (this.audio.volume > 0) {
            this.audio.volume = Math.max(0, this.audio.volume - 0.1);
            this.roundToNearest();
        }
        console.log(this.audio.volume);
    }

    // permet de forcer des arrondis décimaux selon un pas
    roundToNearest() {
        // crée la liste des pas (ici de 0 à 1 avec un pas de .05)
        const volumes = [];
        for (let i = 0; i <= 20; i++) volumes.push(Number((i * 0.05).toFixed(2))); // tofixed force les arroondi a 2 déci max pour eviter les imprecisions

        let closest = volumes[0];
        let smallestDiff = Math.abs(this.audio.volume - closest);

        for (let i = 0; i < volumes.length; i++) {
            // calcul la diff la plus porhce pour déterminer la valeur a affecter
            let diff = Math.abs(this.audio.volume - volumes[i]);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closest = volumes[i];
            }
        }
        // affectation de la bonne valeur à audio.volume
        this.audio.volume = closest;
    }
}