class Tutor extends Student {
  constructor(studentId, name, email, course, moduleSpecialization) {
    super(studentId, name, email, course);
    this.moduleSpecialization = moduleSpecialization;
  }

  createTopic(title, description) {
    return new Topic(title, description, this);
  }

  respondToQuestion(topic, response) {
    console.log(`${this.name} responded to ${topic.title}: ${response}`);
  }

  uploadMaterial(material) {
    console.log(`${this.name} uploaded ${material.type}`);
  }
}
const Student = require('./Student');
const Topic = require('./Topic');