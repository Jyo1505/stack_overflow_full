const token = localStorage.getItem("token");

fetch(`${API_BASE}/api/questions/all`, {
  headers: { Authorization: "Bearer " + token }
})
.then(res => res.json())
.then(data => {
  const ul = document.getElementById("questionList");

  if (!data.questions || data.questions.length === 0) {
    ul.innerHTML = "<li>No questions found</li>";
    return;
  }

  data.questions.forEach(q => {
    const li = document.createElement("li");
    li.className = "question-item";
    li.innerHTML = `
      <strong>${q.title}</strong><br>
      <small>Asked by ${q.asked_by}</small>
    `;
    li.onclick = () => {
      window.location.href = `question-detail.html?id=${q.id}`;
    };
    ul.appendChild(li);
  });
});

function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}
