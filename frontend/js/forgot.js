function checkEmail() {
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("msg");

  msg.innerText = "";

  if (!email) {
    msg.innerText = "Please enter your email";
    return;
  }

  fetch(`${API_BASE}/api/password/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(async (res) => {
      const data = await res.json();
      return { status: res.status, data };
    })
    .then(({ status, data }) => {

      if (status === 404 || status === 400) {
        msg.innerText = data.message || "Email not registered";
        return;
      }

      if (status === 429) {
        msg.innerText = data.message;
        return;
      }

      if (status === 200 && data.email) {
        localStorage.setItem("resetEmail", data.email);
        window.location.href = "reset-success.html";
      } else {
        msg.innerText = "Unexpected response from server";
      }
    })
    .catch(() => {
      msg.innerText = "Server not reachable";
    });
}
