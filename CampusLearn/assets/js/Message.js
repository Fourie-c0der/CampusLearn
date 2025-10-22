class Message {
  constructor(sender, receiver, content) {
    this.sender = sender;
    this.receiver = receiver;
    this.content = content;
    this.readStatus = false;
  }

  send() {
    console.log(`Message sent from ${this.sender.name} to ${this.receiver.name}`);
  }

  markAsRead() {
    this.readStatus = true;
  }
}

module.exports = Message;