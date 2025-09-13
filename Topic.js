class Topic {
  constructor(title, description, createdBy) {
    this.title = title;
    this.description = description;
    this.createdBy = createdBy; // Student or Tutor
    this.materials = [];
    this.questions = [];
  }

  addMaterial(material) {
    this.materials.push(material);
  }

  postQuestion(student, question) {
    this.questions.push({ student, question });
  }
}
module.exports = Topic;