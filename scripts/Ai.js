document.addEventListener("DOMContentLoaded", () => {
  // Utility to sanitize HTML to prevent XSS
  function sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- AI Launcher Button ----------
  const aiButton = document.createElement("button");
  aiButton.id = "aiLauncher";
  aiButton.title = "Open AI Assistant";
  aiButton.setAttribute("aria-label", "Toggle AI Assistant");
  aiButton.innerHTML = "🤖";
  Object.assign(aiButton.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "30px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    zIndex: "999999",
    transition: "transform 0.2s",
  });
  aiButton.addEventListener("mouseover", () => (aiButton.style.transform = "scale(1.1)"));
  aiButton.addEventListener("mouseout", () => (aiButton.style.transform = "scale(1)"));
  document.body.appendChild(aiButton);

  // ---------- Chat Container ----------
  const chatContainer = document.createElement("div");
  chatContainer.setAttribute("role", "dialog");
  Object.assign(chatContainer.style, {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "350px",
    height: "500px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    display: "none",
    flexDirection: "column",
    zIndex: "999999",
    overflow: "hidden",
  });
  document.body.appendChild(chatContainer);

  // Header
  const header = document.createElement("div");
  header.textContent = "Gemini AI Assistant";
  Object.assign(header.style, {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
    fontWeight: "bold",
    textAlign: "center",
  });
  chatContainer.appendChild(header);

  // Response area
  const responseArea = document.createElement("div");
  responseArea.setAttribute("aria-live", "polite");
  Object.assign(responseArea.style, {
    flex: "1",
    overflowY: "auto",
    padding: "10px",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
  });
  chatContainer.appendChild(responseArea);

  // Input wrapper
  const inputWrapper = document.createElement("div");
  Object.assign(inputWrapper.style, {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
    backgroundColor: "#fff",
  });

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "Ask AI...";
  inputField.setAttribute("aria-describedby", "chat-instructions");
  Object.assign(inputField.style, {
    flex: "1",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none",
  });

  const sendButton = document.createElement("button");
  sendButton.textContent = "Send";
  Object.assign(sendButton.style, {
    marginLeft: "8px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
  });

  inputWrapper.appendChild(inputField);
  inputWrapper.appendChild(sendButton);
  chatContainer.appendChild(inputWrapper);

  // Hidden instructions for accessibility
  const instructions = document.createElement("div");
  instructions.id = "chat-instructions";
  instructions.textContent = "Type your question and press Enter or click Send to ask the AI.";
  Object.assign(instructions.style, {
    display: "none",
  });
  chatContainer.appendChild(instructions);

  // Toggle chat
  aiButton.addEventListener("click", () => {
    chatContainer.style.display = chatContainer.style.display === "none" ? "flex" : "none";
    if (chatContainer.style.display === "flex") inputField.focus();
  });

  // ---------- Gemini API ----------
  const GEMINI_API_KEY = 'AIzaSyCRnCmSuLKSihDj0Q5bjlC_Y8S0_hgw1QY'; // Replace with your actual Google Generative AI API key
  const PRIMARY_MODEL = 'gemini-2.5-flash'; // Latest model as of Oct 2025
  const FALLBACK_MODEL = 'gemini-1.5-flash'; // Fallback if primary fails

 async function sendMessage(model = PRIMARY_MODEL) {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  responseArea.innerHTML += `<div><strong>You:</strong> ${sanitizeHTML(userMessage)}</div>`;
  inputField.value = "";
  responseArea.scrollTop = responseArea.scrollHeight;

  // Add context about Campus Learn
  const campusLearnContext = `
Campus Learn is an educational platform for students, providing learning resources, courses, and dashboards to track their academic progress. 
Please answer user questions in the context of Campus Learn.
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: campusLearnContext + "\n\nUser: " + userMessage }
              ]
            }
          ]
        }),
      }
    );

    if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
    const data = await res.json();
    console.log(`Gemini Response (${model}):`, data);

    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from Gemini.";
    responseArea.innerHTML += `<div><strong>AI:</strong> ${sanitizeHTML(aiResponse)}</div>`;
    responseArea.scrollTop = responseArea.scrollHeight;
  } catch (err) {
    console.error(`Gemini API Error (${model}):`, err);
    responseArea.innerHTML += `<div style="color:red;"><strong>Error:</strong> ${sanitizeHTML(err.message)}</div>`;
    responseArea.scrollTop = responseArea.scrollHeight;
  }
}


  sendButton.addEventListener("click", () => sendMessage());
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});