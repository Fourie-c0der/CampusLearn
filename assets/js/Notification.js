class Notification {
  constructor(type, message) {
    this.type = type; // email, sms, whatsapp
    this.message = message;
  }

  sendNotification(student) {
    console.log(`Sent ${this.type} to ${student.name}: ${this.message}`);
  }
}
module.exports = Notification;