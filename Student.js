class Student {
  constructor(studentId, name, email, course) {
    this.studentId = studentId;
    this.name = name;
    this.email = email; // must be @belgiumcampus.ac.za
    this.course = course;
  }

  register() {
    console.log(`${this.name} has registered.`);
  }

  updateProfile(newCourse) {
    this.course = newCourse;
  }

  subscribeToTopic(topic) {
    console.log(`${this.name} subscribed to ${topic.title}`);
  }

  askQuestion(question) {
    console.log(`${this.name} asked: ${question}`);
  }
}

module.exports = Student;

