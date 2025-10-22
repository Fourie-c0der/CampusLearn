document.addEventListener("DOMContentLoaded", () => {
  const aiButton = document.createElement("button");
  aiButton.id = "aiLauncher";
  aiButton.title = "Open AI Assistant";
  aiButton.innerHTML = "🤖";

  // Styles
  aiButton.style.position = "fixed";
  aiButton.style.bottom = "20px";
  aiButton.style.right = "20px";
  aiButton.style.width = "60px";
  aiButton.style.height = "60px";
  aiButton.style.borderRadius = "50%";
  aiButton.style.border = "none";
  aiButton.style.backgroundColor = "#007bff";
  aiButton.style.color = "#fff";
  aiButton.style.fontSize = "30px";
  aiButton.style.cursor = "pointer";
  aiButton.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  aiButton.style.zIndex = "1000";
  aiButton.style.transition = "transform 0.2s";

  // Hover
  aiButton.addEventListener("mouseover", () => {
    aiButton.style.transform = "scale(1.1)";
  });
  aiButton.addEventListener("mouseout", () => {
    aiButton.style.transform = "scale(1)";
  });

  // Click
  aiButton.addEventListener("click", () => {
    window.location.href = "/ai.html"; // replace with your AI page
  });

  document.body.appendChild(aiButton);
});
