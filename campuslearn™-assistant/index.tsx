/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Chat } from '@google/genai';
import { marked } from 'marked';

const API_KEY = process.env.API_KEY;

const SYSTEM_INSTRUCTION = `You are Dalmatian, a friendly, loyal, and helpful AI assistant for CampusLearn™, a web-based Learning Management System for a university. Your goal is to provide a digital environment where teaching and learning can take place efficiently, reducing manual tasks and improving communication.

Your personality is friendly, supportive, and you speak in a clear, student-friendly tone.

Here is the context about CampusLearn™:
- **Users**: Students, lecturers, and administrators.
- **Student Features**: Students can view enrolled courses, download learning materials, submit assignments, check their grades, and read announcements from their dashboard.
- **Lecturer Features**: Lecturers can create and manage courses, upload materials, set assignments, grade submissions, and send announcements.
- **Administrator Features**: Administrators handle user management, generate reports, and ensure system stability.
- **Your Role as Dalmatian**: You are a virtual tutor and support companion. You assist users by:
  - Answering common questions like "How do I submit my assignment?" or "When is my next quiz due?".
  - Reminding students of upcoming deadlines.
  - Helping users locate information like grades or course materials.
  - Suggesting study materials.
  - Assisting lecturers with routine tasks like posting announcements.
  - Generating quick summaries for administrators.
- **Example Interaction**: If a student asks for a due date, you might say, "Your next Database Systems assignment is due on 12 October 2025." You provide specific, helpful information in a conversational tone.

Your task is to answer user questions based on this context. Be helpful and embody the Dalmatian persona.`;

class DalmatianChat {
  private ai: GoogleGenAI;
  private chat: Chat;
  private chatContainer: HTMLElement;
  private chatForm: HTMLFormElement;
  private chatInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    this.chatContainer = document.getElementById('chat-container')!;
    this.chatForm = document.getElementById('chat-form') as HTMLFormElement;
    this.chatInput = document.getElementById('chat-input') as HTMLInputElement;
    this.submitButton = this.chatForm.querySelector('button[type="submit"]')!;
    
    this.setupEventListeners();
    this.displayWelcomeMessage();
  }
  
  private setupEventListeners() {
    this.chatForm.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  private async displayWelcomeMessage() {
    const welcomeMessage = "Hello! I'm Dalmatian, your friendly AI assistant for CampusLearn™. How can I help you today?";
    await this.appendMessage('bot', welcomeMessage);
  }
  
  private async handleFormSubmit(event: Event) {
    event.preventDefault();
    const userInput = this.chatInput.value.trim();
    if (!userInput) return;

    this.chatInput.value = '';
    this.setLoading(true);

    await this.appendMessage('user', userInput);
    
    const botMessageElement = await this.appendMessage('bot', '<div class="thinking"><span></span><span></span><span></span></div>', true);

    try {
      const responseStream = await this.chat.sendMessageStream({ message: userInput });
      
      let fullResponse = '';
      botMessageElement.innerHTML = ''; // Clear thinking animation

      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        botMessageElement.innerHTML = await marked.parse(fullResponse) as string;
        this.scrollToBottom();
      }
    } catch (error) {
        botMessageElement.innerHTML = "Sorry, I encountered an error. Please try again later.";
        console.error('Error sending message:', error);
    } finally {
        this.setLoading(false);
    }
  }

  private async appendMessage(sender: 'user' | 'bot', content: string, isStreaming: boolean = false): Promise<HTMLElement> {
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message', sender);
    
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');

    if (isStreaming) {
        messageBubble.innerHTML = content;
    } else {
        messageBubble.innerHTML = await marked.parse(content) as string;
    }
    
    messageWrapper.appendChild(messageBubble);
    this.chatContainer.appendChild(messageWrapper);
    
    this.scrollToBottom();
    return messageBubble;
  }
  
  private scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  private setLoading(isLoading: boolean) {
    this.submitButton.disabled = isLoading;
    this.chatInput.disabled = isLoading;
  }
}

function main() {
  if (!API_KEY) {
    document.body.innerHTML = `
      <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
        <h1>API Key Not Found</h1>
        <p>Please provide your Gemini API key in the environment variables to use this application.</p>
      </div>
    `;
    return;
  }
  new DalmatianChat();
}

main();
