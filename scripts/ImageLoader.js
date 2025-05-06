class ImageLoader {
    constructor() {
        this.lstPaths = [];
        this.lstImages = [];
        this.loadedImagesCount = 0;
    }

    add(pImagePath) {
        this.lstPaths.push(pImagePath);
    }

    getTotalImages() {
        return this.lstPaths.length;
    }

    getTotalImagesLoaded() {
        return this.loadedImagesCount;
    }

    getListImages() {
        return this.lstImages;
    }

    getLoadedRatio() {
        return this.loadedImagesCount / this.getTotalImages();
    }

    getImage(pPath) {
        return this.lstImages[pPath];
    }

    start() {
        new Promise((resolve) => {
            // aucune image à charger
            if (this.lstPaths.length === 0) {
                resolve();
                return;
            }

            this.loadedImagesCount = 0; // reinit
            this.lstPaths.forEach(path => {
                let img = new Image();
                img.onload = this.imageLoaded.bind(this, resolve);
                img.src = path;
                this.lstImages[path] = img;
            });
        });
    }

    imageLoaded(resolve) {
        this.loadedImagesCount++;
        if (debug) console.log("Image chagée : ", e.target.currentSrc); // affiche le nom de l'image chargée
        if (this.loadedImagesCount == this.lstPaths.length) {
            if (debug) console.log("Tout a été chargé");
            resolve(); // resout la promise quand toutes les images sont chargées
        }
    }
}