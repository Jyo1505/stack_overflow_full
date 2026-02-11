// const BASE = API_BASE;

const token = localStorage.getItem("token");

function loadProfile() {
  fetch(`${API_BASE}/api/users/me`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => {
  document.getElementById("myName").textContent = data.name;
  // document.getElementById("myEmail").textContent = data.email;
  document.getElementById("myPoints").textContent = data.points ?? 0;
});

}
function loadUsers() {
fetch(`${API_BASE}/api/users/list`, {
    headers: { Authorization: "Bearer " + token }
  })
  .then(res => res.json())
  .then(data => {
    const select = document.getElementById("userSelect");
    select.innerHTML = `<option value="">Select user</option>`;

    data.users.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      select.appendChild(opt);
    });
  });
}


function transferPoints() {
  const toUserId = document.getElementById("userSelect").value;
  const points = parseInt(document.getElementById("pointsToSend").value);
  const msg = document.getElementById("msg");

  if (!toUserId || !points) {
    msg.textContent = "Select user and enter points";
    return;
  }

 fetch(`${API_BASE}/api/points/transfer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ toUserId, points })
  })
  .then(res => res.json())
  .then(data => {
    msg.textContent = data.message;
    loadProfile();
  })
  .catch(() => {
    msg.textContent = "Transfer failed";
  });
}


function logout() {
  localStorage.removeItem("token");
  location.href = "/";
}

loadProfile();
loadUsers();

