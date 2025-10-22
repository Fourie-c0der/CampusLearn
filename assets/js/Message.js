// messages.js — CampusLearn™ Real-Time Messaging for Belgium Campus
// Supabase client is loaded globally via script tag
const supabase = window.supabase;

let currentUser = null;
let currentRecipient = null;

const chatContainer = document.getElementById("chatContainer");
const chatPartnerName = document.getElementById("chatPartnerName");
const conversationList = document.getElementById("conversationList");

// ---------- 1️⃣ INIT CURRENT USER ----------
async function initUser() {
  // Check if user is logged in via localStorage
  const loggedInUser = localStorage.getItem('currentUser');
  if (loggedInUser) {
    currentUser = loggedInUser;
    console.log("✅ Logged in as:", currentUser);
  } else {
    // Fallback to selector for testing
    const userSelect = document.getElementById("userSelect");
    if (userSelect) {
      currentUser = userSelect.value;
      console.log("✅ Using selected user:", currentUser);
    } else {
      // Fallback to test user
      currentUser = "test@belgiumcampus.ac.za";
      console.log("✅ Using test user:", currentUser);
    }
  }
}

// ---------- 2️⃣ UI HELPERS ----------
function appendMessage(content, sender) {
  const isSent = sender === currentUser;
  const div = document.createElement("div");
  div.className = `message-bubble ${isSent ? "sent" : "received"}`;
  div.textContent = content;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function clearChat() {
  chatContainer.innerHTML = "";
}

function addConversationItem(partner, unread = false) {
  // Prevent duplicates
  let item = Array.from(conversationList.children).find((i) =>
    i.textContent.includes(partner)
  );
  if (item) return item;

  const link = document.createElement("a");
  link.href = "#";
  link.className =
    "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
  link.innerHTML = `
    <span>${partner}</span>
    ${unread ? '<span class="badge text-bg-primary">New</span>' : ""}
  `;
  conversationList.appendChild(link);
  return link;
}

function highlightConversation(partner) {
  Array.from(conversationList.children).forEach((el) =>
    el.classList.remove("active")
  );
  const item = Array.from(conversationList.children).find((el) =>
    el.textContent.includes(partner)
  );
  if (item) item.classList.add("active");
}

// ---------- 3️⃣ LOAD MESSAGES ----------
async function loadConversation(partner) {
  clearChat();
  chatPartnerName.textContent = partner;
  currentRecipient = partner;
  highlightConversation(partner);

  console.log(`📥 Loading messages between ${currentUser} and ${partner}...`);

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender.eq.${currentUser},recipient.eq.${partner}),and(sender.eq.${partner},recipient.eq.${currentUser})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error loading messages:", error);
    appendMessage("Error loading chat.", partner);
    return;
  }

  if (!data || data.length === 0) {
    appendMessage("No messages yet — start chatting!", partner);
    return;
  }

  data.forEach((m) => appendMessage(m.content, m.sender));
  console.log(`✅ Loaded ${data.length} messages.`);
}

// ---------- 4️⃣ SEND MESSAGE ----------
async function sendMessage(content, module = null) {
  if (!currentRecipient) {
    alert("Select or start a conversation first.");
    return;
  }
  if (!content.trim()) return;

  appendMessage(content, currentUser);

  const messageData = {
    sender: currentUser,
    recipient: currentRecipient,
    content,
  };
  if (module) messageData.module = module;

  const { error } = await supabase.from("messages").insert([messageData]);

  if (error) console.error("❌ Message send failed:", error);
  else console.log("📤 Message sent!");
}

// ---------- 5️⃣ REAL-TIME UPDATES ----------
function subscribeRealtime() {
  console.log("🔔 Subscribing to realtime channel...");

  supabase
    .channel("messages-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const msg = payload.new;
        console.log("📡 Incoming realtime message:", msg);

        // Incoming message for current user
        if (msg.recipient === currentUser) {
          if (msg.sender === currentRecipient) {
            appendMessage(msg.content, msg.sender);
          } else {
            const conv = addConversationItem(msg.sender, true);
            conv.classList.add("fw-bold");
          }
        }

        // Outgoing message by current user
        if (msg.sender === currentUser) {
          addConversationItem(msg.recipient);
        }
      }
    )
    .subscribe((status) => {
      console.log("🔌 Realtime connection:", status);
    });
}

// ---------- 6️⃣ LOAD CONVERSATIONS ----------
async function loadConversations() {
  console.log("📥 Loading conversations for:", currentUser);

  const { data, error } = await supabase
    .from("messages")
    .select("sender, recipient")
    .or(`sender.eq.${currentUser},recipient.eq.${currentUser}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading conversations:", error);
    return;
  }

  const uniquePartners = new Set();
  data.forEach((msg) => {
    const partner = msg.sender === currentUser ? msg.recipient : msg.sender;
    uniquePartners.add(partner);
  });

  uniquePartners.forEach((partner) => addConversationItem(partner));
  console.log(`✅ Loaded ${uniquePartners.size} conversations.`);
}

// ---------- 7️⃣ EVENT HANDLERS ----------
document.addEventListener("DOMContentLoaded", async () => {
  await initUser();
  await loadConversations();
  subscribeRealtime();

  const sendButton = document.getElementById("sendButton");
  const chatInput = document.getElementById("chatInput");
  const newMessageForm = document.getElementById("newMessageForm");

  // Send message from input
  sendButton.addEventListener("click", async () => {
    const msg = chatInput.value.trim();
    if (msg) {
      await sendMessage(msg);
      chatInput.value = "";
    }
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendButton.click();
    }
  });

  // Start a new conversation
  newMessageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const recipient = document.getElementById("recipientInput").value.trim();
    const message = document.getElementById("messageText").value.trim();
    const module = document.getElementById("moduleSelect").value;


    currentRecipient = recipient;
    addConversationItem(recipient);
    clearChat();
    chatPartnerName.textContent = recipient;

    if (message) await sendMessage(message, module);

    e.target.reset();
  });

  // Clicking a chat loads messages
  conversationList.addEventListener("click", (e) => {
    const item = e.target.closest(".list-group-item");
    if (item) {
      const partner = item.querySelector("span").textContent.trim();
      const badge = item.querySelector(".badge");
      if (badge) badge.remove();
      item.classList.remove("fw-bold");
      loadConversation(partner);
    }
  });

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // Display current user
  const currentUserDisplay = document.getElementById("currentUserDisplay");
  if (currentUserDisplay) {
    currentUserDisplay.textContent = currentUser;
  }

  // Refresh button
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      console.log("🔄 Refreshing conversations...");
      conversationList.innerHTML = "";
      await loadConversations();
      if (currentRecipient) {
        await loadConversation(currentRecipient);
      }
    });
  }
});
