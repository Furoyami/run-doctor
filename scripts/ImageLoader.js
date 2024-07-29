class ImageLoader {
    constructor() {
        this.lstPaths = [];
        this.lstImages = [];
        this.callBack = null;
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

    start(pCallback) {
        this.callBack = pCallback;
        this.lstPaths.forEach(path => {
            let img = new Image();
            img.onload = this.imageLoaded.bind(this);
            img.src = path;
            this.lstImages[path] = img;
        });
    }

    imageLoaded(e) {
        this.loadedImagesCount++;
        if (debug) console.log("Image chagée : ", e.target.currentSrc); // affiche le nom de l'image chargée
        if (this.loadedImagesCount == this.lstPaths.length) {
            if (debug) console.log("Tout a été chargé");
            this.callBack();
        }
    }
}