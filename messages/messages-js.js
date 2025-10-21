// DOM Elements
const messageList = document.getElementById("messageList");
const messageForm = document.getElementById("messageForm");
const recipientInput = document.getElementById("recipientId");
const messageText = document.getElementById("messageText");

const messageModal = document.getElementById("messageModal");
const modalSubject = document.getElementById("modalSubject");
const modalBody = document.getElementById("modalBody");
const modalMeta = document.getElementById("modalMeta");
const closeBtn = document.querySelector(".close-btn");
const replyForm = document.getElementById("replyForm");
const replyText = document.getElementById("replyText");
const toast = document.getElementById("toast");
const badge = document.getElementById("unreadCount");
const searchInput = document.getElementById("searchInput");

// Load messages from localStorage or use default
let messages = JSON.parse(localStorage.getItem("messages")) || [
  {
    id: 1,
    sender: "Admin",
    recipientId: "student123",
    subject: "Welcome to EDUCARE",
    body: "Your dashboard is now active. Explore courses, results, and more.",
    date: new Date().toLocaleDateString(),
    unread: true,
    hidden: false
  }
];

// Render visible messages
function renderMessages() {
  messageList.innerHTML = "";
  const visibleMessages = messages.filter(msg => !msg.hidden);

  visibleMessages.forEach(msg => {
    if (!msg || !msg.body || !msg.subject || !msg.sender || !msg.date) return;

    const li = document.createElement("li");
    li.className = `message-item ${msg.unread ? "unread" : ""}`;
    li.innerHTML = `
      <h3>${msg.subject}</h3>
      <p>${msg.body.substring(0, 80)}...</p>
      <span class="meta">From: ${msg.sender} • ${msg.date}</span>
      <button onclick="event.stopPropagation(); hideMessage(${msg.id})" class="hide-btn">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;
    li.onclick = () => openModal(msg);
    messageList.appendChild(li);
  });

  updateUnreadCount();
}

// Open modal
function openModal(msg) {
  modalSubject.textContent = msg.subject;
  modalBody.textContent = msg.body;
  modalMeta.textContent = `From: ${msg.sender} • ${msg.date}`;
  messageModal.classList.remove("hidden");

  msg.unread = false;
  localStorage.setItem("messages", JSON.stringify(messages));
  renderMessages();

  replyForm.onsubmit = function (e) {
    e.preventDefault();
    const reply = replyText.value.trim();
    if (reply) {
      alert(`Reply sent to ${msg.sender}:/n/n${reply}`);
      replyForm.reset();
      messageModal.classList.add("hidden");
      showToast("Message sent successfully!");
    }
  };
}

// Close modal
if (closeBtn) {
  closeBtn.onclick = () => {
    messageModal.classList.add("hidden");
  };
}

// Send message
if (messageForm) {
  messageForm.onsubmit = function (e) {
    e.preventDefault();

    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      recipientId: recipientInput.value.trim(),
      subject: "New Message",
      body: messageText.value.trim(),
      date: new Date().toLocaleDateString(),
      unread: true,
      hidden: false
    };

    if (newMessage.recipientId && newMessage.body) {
      messages.unshift(newMessage);
      localStorage.setItem("messages", JSON.stringify(messages));
      messageForm.reset();
      renderMessages();
      showToast("Message sent successfully!");
    }
  };
}

// Toast
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("visible");

  setTimeout(() => {
    toast.classList.remove("visible");
    toast.classList.add("hidden");
  }, 3000);
}

// Badge
function updateUnreadCount() {
  if (!badge) return;
  const count = messages.filter(msg => msg.unread && !msg.hidden).length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-block" : "none";
}

// Hide message
function hideMessage(id) {
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.hidden = true;
    localStorage.setItem("messages", JSON.stringify(messages));
    renderMessages();
    showToast("Message deleted.");
  }
}

// Unhide message
function unhideMessage(id) {
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.hidden = false;
    localStorage.setItem("messages", JSON.stringify(messages));
    renderMessages();
    showToast("Message recovred.");
  }
}

// Show hidden messages
function showHiddenMessages() {
  messageList.innerHTML = "";

  const hiddenMessages = messages.filter(msg => msg.hidden);

  if (hiddenMessages.length === 0) {
    messageList.innerHTML = `<li class="message-item"><p>No Deleted messages.</p></li>`;
    return;
  }

  hiddenMessages.forEach(msg => {
    const li = document.createElement("li");
    li.className = "message-item hidden-msg";
    li.innerHTML = `
      <h3>${msg.subject}</h3>
      <p>${msg.body.substring(0, 80)}...</p>
      <span class="meta">From: ${msg.sender} • ${msg.date}</span>
      <button onclick="unhideMessage(${msg.id})" class="hide-btn"><i class="fas fa-trash-restore"></i> Recover</button>
    `;
    messageList.appendChild(li);
  });
}

// Mark all as read
function markAllAsRead() {
  messages.forEach(msg => {
    if (!msg.hidden) msg.unread = false;
  });
  localStorage.setItem("messages", JSON.stringify(messages));
  renderMessages();
  showToast("All messages marked as read.");
}

// Search messages
function searchMessages() {
  const query = searchInput.value.toLowerCase();
  const filtered = messages.filter(msg =>
    !msg.hidden &&
    (msg.subject.toLowerCase().includes(query) ||
     msg.body.toLowerCase().includes(query) ||
     msg.sender.toLowerCase().includes(query))
  );

  renderFilteredMessages(filtered);
}

function renderFilteredMessages(filteredMessages) {
  messageList.innerHTML = "";

  if (filteredMessages.length === 0) {
    messageList.innerHTML = `<li class="message-item"><p>No matching messages.</p></li>`;
    return;
  }

  filteredMessages.forEach(msg => {
    const li = document.createElement("li");
    li.className = `message-item ${msg.unread ? "unread" : ""}`;
    li.innerHTML = `
      <h3>${msg.subject}</h3>
      <p>${msg.body.substring(0, 80)}...</p>
      <span class="meta">From: ${msg.sender} • ${msg.date}</span>
      <button onclick="hideMessage(${msg.id})" class="hide-btn"><i class="fas fa-trash"></i>Delete</button>
    `;
    li.onclick = () => openModal(msg);
    messageList.appendChild(li);
  });
}

// Initialize
window.addEventListener("load", () => {
  messages = JSON.parse(localStorage.getItem("messages")) || messages;
  renderMessages();
});

const showHiddenBtn = document.getElementById("showHiddenBtn");
const inboxBtn = document.getElementById("inboxBtn");

// Highlight active button
function setActiveButton(activeBtn) {
  [showHiddenBtn, inboxBtn].forEach(btn => btn.classList.remove("active-btn"));
  activeBtn.classList.add("active-btn");
}

// Show hidden messages
if (showHiddenBtn) {
  showHiddenBtn.onclick = () => {
    showHiddenMessages();
    setActiveButton(showHiddenBtn);
  };
}

// Show inbox (visible messages)
if (inboxBtn) {
  inboxBtn.onclick = () => {
    renderMessages();
    setActiveButton(inboxBtn);
  };
}

