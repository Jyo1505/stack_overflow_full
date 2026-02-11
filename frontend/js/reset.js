// const BASE = API_BASE;
const email = localStorage.getItem("resetEmail");

function generate() {
  fetch(`${API_BASE}/api/password/generate`, {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (d.generatedPassword)
        document.getElementById("password").value = d.generatedPassword;
      else document.getElementById("msg").innerText = d.message;
    });
}

function update() {
 fetch(`${API_BASE}/api/password/update`, {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((r) => r.json())
    .then((d) => {
      alert(d.message);
      window.location.href = "index.html";
    });
}
