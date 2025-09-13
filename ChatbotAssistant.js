class ChatbotAssistant {
  constructor() {
    this.knowledgeBase = [];
  }

  answerQuestion(question) {
    return "Answer from chatbot...";
  }

  escalateToTutor(topic, question) {
    console.log(`Escalating ${question} on ${topic.title} to tutor.`);
  }
}
module.exports = ChatbotAssistant;