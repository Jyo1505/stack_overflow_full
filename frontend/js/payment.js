const token = localStorage.getItem("token");
const plan = localStorage.getItem("selectedPlan");

if (!plan) {
  alert("No plan selected");
  window.location.href = "subscriptions.html";
}

/* =========================
   INPUT RESTRICTIONS
   ========================= */

const cardNumberInput = document.getElementById("cardNumber");
const cardNameInput = document.getElementById("cardName");
const cvvInput = document.getElementById("cvv");
const msg = document.getElementById("msg");

// Card Number → ONLY digits, max 16
cardNumberInput.addEventListener("input", () => {
  cardNumberInput.value = cardNumberInput.value
    .replace(/\D/g, "")       // remove non-digits
    .slice(0, 16);            // max 16 digits
});

// CVV → ONLY digits, max 3
cvvInput.addEventListener("input", () => {
  cvvInput.value = cvvInput.value
    .replace(/\D/g, "")
    .slice(0, 3);
});

// Card Name → ONLY CAPS + space
cardNameInput.addEventListener("input", () => {
  cardNameInput.value = cardNameInput.value
    .toUpperCase()            // force caps
    .replace(/[^A-Z ]/g, ""); // remove non-letters
});

/* =========================
   FINAL VALIDATION + PAY
   ========================= */

function pay() {
  const cardNumber = cardNumberInput.value.trim();
  const cardName = cardNameInput.value.trim();
  const cvv = cvvInput.value.trim();

  // Clear previous message
  msg.textContent = "";

  if (cardNumber.length !== 16) {
    msg.textContent = "Card number must be exactly 16 digits";
    return;
  }

  if (!cardName) {
    msg.textContent = "Card holder name is required";
    return;
  }

  if (cvv.length !== 3) {
    msg.textContent = "CVV must be exactly 3 digits";
    return;
  }

  msg.textContent = "Processing payment...";

  fetch("/api/subscriptions/buy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ plan })
  })
    .then(async res => {
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        msg.textContent = "Server error. Please try again.";
        return;
      }

      if (!res.ok) {
        msg.textContent = data.message;
        return;
      }

      msg.textContent = "Payment successful!";
      localStorage.removeItem("selectedPlan");

      setTimeout(() => {
        window.location.href = "questions.html";
      }, 1200);
    })
    .catch(() => {
      msg.textContent = "Network error. Please try again.";
    });
}
