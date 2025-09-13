class LearningMaterial {
  constructor(type, url) {
    this.type = type; // pdf, video, audio
    this.url = url;
  }

  upload() {
    console.log(`Uploaded ${this.type} at ${this.url}`);
  }

  download() {
    console.log(`Downloading ${this.url}`);
  }
}
module.exports = LearningMaterial;