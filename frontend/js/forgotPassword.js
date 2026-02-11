// function checkEmail() {
//   const email = document.getElementById("email").value;

//   fetch("http://localhost:5000/api/password/forgot", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email }),
//   })
//     .then((r) => r.json())
//     .then((d) => {
//       if (d.email) {
//         localStorage.setItem("resetEmail", email);
//         window.location.href = "reset-success.html";
//       } else document.getElementById("msg").innerText = d.message;
//     });
// }
