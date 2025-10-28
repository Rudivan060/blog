document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");

  if (user === "admin" && pass === "1234") {
    errorMsg.style.color = "green";
    errorMsg.textContent = "✅ Login realizado com sucesso!";
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1000);
  } else {
    errorMsg.style.color = "red";
    errorMsg.textContent = "❌ Usuário ou senha incorretos!";
  }
});
