const BASE = API_BASE;
const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const questionId = params.get("id");



/* ===============================
   LOAD QUESTION
================================ */
function loadQuestion() {
  fetch(`${API_BASE}/api/questions/${questionId}`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("questionTitle").textContent = data.title;
    loadAnswers();
  });
}

/* ===============================
   LOAD ANSWERS
================================ */
function loadAnswers() {
  fetch(`${API_BASE}/api/answers/${questionId}/answers`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("answers");
    container.innerHTML = "";

    if (!data.answers.length) {
      container.innerHTML = "<p>No answers yet</p>";
      return;
    }

    data.answers.forEach(a => {
      const div = document.createElement("div");
      div.className = "answer-card";

     div.innerHTML = `
  <strong>Answered by: ${a.name}</strong><br><br>

  <button onclick="toggleAnswer(${a.id})" class="toggle-btn">
    Show Answer ▼
  </button>

  <div id="answer-text-${a.id}" class="answer-text" style="display:none;">
    <p>${a.content}</p>

    <small>👍 ${a.upvotes} | 👎 ${a.downvotes}</small><br>

    <button onclick="upvote(${a.id})">Upvote</button>
    <button onclick="downvote(${a.id})">Downvote</button>
    ${a.mine ? `<button onclick="deleteAnswer(${a.id})">Delete</button>` : ""}
  </div>
`;


      container.appendChild(div);
    });
  });
}


/* ===============================
   ADD ANSWER
================================ */
function submitAnswer() {
  const content = document.getElementById("answerInput").value.trim();
  if (!content) return alert("Write an answer");

  fetch(`${API_BASE}/api/answers/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ questionId, content })
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById("answerInput").value = "";
    loadAnswers();
  });
}

/* ===============================
   VOTES
================================ */
function upvote(id) {
  fetch(`${API_BASE}/api/answers/upvote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ answerId: id })
  }).then(loadAnswers);
}

function downvote(id) {
  fetch(`${API_BASE}/api/answers/downvote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ answerId: id })
  }).then(loadAnswers);
}
function deleteAnswer(id) {
  if (!confirm("Delete this answer?")) return;

  fetch(`${API_BASE}/api/answers/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ answerId: id })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || "Answer deleted");
    loadAnswers();
  });
}

loadQuestion();


function toggleAnswer(id) {
  const box = document.getElementById(`answer-text-${id}`);
  const btn = box.previousElementSibling;

  if (box.style.display === "none") {
    box.style.display = "block";
    btn.textContent = "Hide Answer ▲";
  } else {
    box.style.display = "none";
    btn.textContent = "Show Answer ▼";
  }
}
