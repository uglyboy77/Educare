const API_BASE = "https://educare-students-hub-eadz.onrender.com";

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

async function updateMessage(id, unread, hidden) {
  try {
    await fetch(`${API_BASE}/update-message/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unread, hidden })
    });
    renderMessages();
  } catch (err) {
    console.error("❌ Failed to update message:", err);
  }
}

async function renderMessages() {
  const studentId = localStorage.getItem("studentId");
  try {
    const res = await fetch(`${API_BASE}/messages/${studentId}`);
    const data = await res.json();
    messageList.innerHTML = "";
    if (!data.messages || data.messages.length === 0) {
      messageList.innerHTML = `<li class="message-item"><p>No messages yet.</p></li>`;
      return;
    }
    data.messages.forEach(msg => {
      const li = document.createElement("li");
      li.className = `message-item ${msg.unread ? "unread" : ""}`;
      li.innerHTML = `
        <h3>${msg.subject}</h3>
        <p>${msg.body.substring(0, 80)}...</p>
        <span class="meta">From: ${msg.studentId} • ${msg.sentAt}</span>
      `;
      li.onclick = () => openModal(msg);
      messageList.appendChild(li);
    });
    updateUnreadCount(data.messages);
  } catch (err) {
    console.error("❌ Failed to load inbox:", err);
  }
}
window.addEventListener("load", () => {
  renderMessages();
});

function openModal(msg) {
  modalSubject.textContent = msg.subject;
  modalBody.textContent = msg.body;
  modalMeta.textContent = `From: ${msg.studentId} • ${msg.sentAt}`;
  messageModal.classList.remove("hidden");
  msg.unread = false;
  updateMessage(msg.id, 0, msg.hidden ? 1 : 0);
  renderMessages();
  replyForm.onsubmit = async function (e) {
    e.preventDefault();
    const reply = replyText.value.trim();
    if (reply) {
      const studentId = localStorage.getItem("studentId");
      const email = localStorage.getItem("email");
      const replyMessage = {
        studentId,
        email,
        recipientId: msg.studentId,
        subject: "Reply",
        body: reply
      };

      try {
        await fetch(`${API_BASE}/send-message`,{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(replyMessage)
        });
        replyForm.reset();
        messageModal.classList.add("hidden");
        showToast("Reply sent successfully!");
        renderMessages();
      } catch (err) {
        console.error("❌ Failed to send reply:", err);
      }
    }
  };
}

async function renderSentMessages() {
  const studentId = localStorage.getItem("studentId");
  try {
    const res = await fetch(`${API_BASE}/sent-messages/${studentId}`);
    const data = await res.json();

    messageList.innerHTML = "";

    if (!data.messages || data.messages.length === 0) {
      messageList.innerHTML = `<li class="message-item"><p>No sent messages yet.</p></li>`;
      return;
    }
    data.messages.forEach(msg => {
      const li = document.createElement("li");
      li.className = "message-item";
      li.innerHTML = `
        <h3>${msg.subject}</h3>
        <p>${msg.body.substring(0, 80)}...</p>
        <span class="meta">To: ${msg.recipientId} • ${msg.sentAt}</span>
      `;
      messageList.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Failed to load sent messages:", err);
  }
}

if (closeBtn) {
  closeBtn.onclick = () => {
    messageModal.classList.add("hidden");
  };
}

if (messageForm) {
  messageForm.onsubmit = async function (e) {
    e.preventDefault();

    const studentId = localStorage.getItem("studentId");
    const email = localStorage.getItem("email");
    const recipientId = recipientInput.value.trim();
    const body = messageText.value.trim();

    const newMessage = {
      studentId,
      email,
      recipientId,
      subject: "New Message",
      body
    };

    try {
      const res = await fetch(`${API_BASE}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage)
      });
      const data = await res.json();
      console.log("📨 DB response:", data.message);

      messageForm.reset();
      showToast("Message sent successfully!");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("visible");

  setTimeout(() => {
    toast.classList.remove("visible");
    toast.classList.add("hidden");
  }, 10000);
}

/* async function searchMessages() {
  const query = searchInput.value.toLowerCase();
  const studentId = localStorage.getItem("studentId");

  try {
    // Fetch inbox and sent messages in parallel
    const [inboxRes, sentRes] = await Promise.all([
      fetch(`http://127.0.0.1:3000/messages/${studentId}`),
      fetch(`http://127.0.0.1:3000/sent-messages/${studentId}`)
    ]);

    const inboxData = await inboxRes.json();
    const sentData = await sentRes.json();

    // Merge both arrays
    const allMessages = [
      ...(inboxData.messages || []),
      ...(sentData.messages || [])
    ];

    // Filter by query
    const filtered = allMessages.filter(msg =>
      !msg.hidden &&
      (
        msg.subject.toLowerCase().includes(query) ||
        msg.body.toLowerCase().includes(query) ||
        (msg.studentId && msg.studentId.toLowerCase().includes(query)) ||
        (msg.recipientId && msg.recipientId.toLowerCase().includes(query))
      )
    );

    renderFilteredMessages(filtered);
  } catch (err) {
    console.error("❌ Search failed:", err);
  }
} */


/*
function updateUnreadCount(messages) {
 const badge = document.getElementById("unreadCount");
 if (!badge) return;
 const count = messages.filter(msg => msg.unread && !msg.hidden).length;
 badge.textContent = count;
 badge.style.display = count > 0 ? "inline-block" : "none";
} 
*/

/*
function hideMessage(id) {
  updateMessage(id, 0, 1);
  showToast("Message deleted.");
 
}

// Unhide message
function unhideMessage(id) {
  updateMessage(id, 0, 0); 
  showToast("Message recovered.");
 
}
// Delete sent message
function deleteSentMessage(id) {
  updateMessage(id, 0, 1); 
  showToast("Sent message deleted.");   
}
*/

/*
async function showHiddenMessages() {
  const studentId = localStorage.getItem("studentId");
  try {
    const res = await fetch(`http://127.0.0.1:3000/messages/${studentId}`);
    const data = await res.json();

    const hiddenMessages = data.messages.filter(msg => msg.hidden);

    messageList.innerHTML = "";

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
        <span class="meta">From: ${msg.studentId} • ${msg.sentAt}</span>
        <button onclick="unhideMessage(${msg.id})" class="hide-btn">
          <i class="fas fa-trash-restore"></i> Recover
        </button>
      `;
      messageList.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Failed to load hidden messages:", err);
  }
}
*/

function markAllAsRead() {
  const studentId = localStorage.getItem("studentId");
  fetch(`${API_BASE}/messages/${studentId}`)
    .then(res => res.json())
    .then(data => {
      data.messages.forEach(msg => {
        if (!msg.hidden) updateMessage(msg.id, 0, msg.hidden ? 1 : 0);
      });
      showToast("All messages marked as read.");
    });
}


function searchMessages() {
  const query = searchInput.value.toLowerCase();
  const studentId = localStorage.getItem("studentId");
  fetch(`${API_BASE}/messages/${studentId}`)
    .then(res => res.json())
    .then(data => {
      const filtered = data.messages.filter(msg =>
        !msg.hidden &&
        (msg.subject.toLowerCase().includes(query) ||
          msg.body.toLowerCase().includes(query) ||
          msg.studentId.toLowerCase().includes(query))
      );
      renderFilteredMessages(filtered);
    })
    .catch(err => console.error("❌ Search failed:", err));
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
      <span class="meta">From: ${msg.studentId} • ${msg.sentAt}</span>
    `;
    li.onclick = () => openModal(msg);
    messageList.appendChild(li);
  });
}

window.addEventListener("load", () => {
  renderMessages();
});

// const showHiddenBtn = document.getElementById("showHiddenBtn");
const inboxBtn = document.getElementById("inboxBtn");

function setActiveButton(activeBtn) {
  [inboxBtn, sentBtn].forEach(btn => btn.classList.remove("active-btn"));
  activeBtn.classList.add("active-btn");
}

const sentBtn = document.getElementById("sentBtn");

if (sentBtn) {
  sentBtn.onclick = () => {
    renderSentMessages();
    setActiveButton(sentBtn);
  };
}
/*
if (showHiddenBtn) {
  showHiddenBtn.onclick = () => {
    showHiddenMessages();
    setActiveButton(showHiddenBtn);
  };
}
*/

if (inboxBtn) {
  inboxBtn.onclick = () => {
    renderMessages();
    setActiveButton(inboxBtn);
  };
}

