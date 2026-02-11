const email = localStorage.getItem("resetEmail");

function generate() {
  fetch("http://localhost:5000/api/password/generate", {
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
  fetch("https://stack-overflow-full.onrender.com/api/password/update", {
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
