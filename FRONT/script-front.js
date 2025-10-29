document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const text = document.getElementById("username").value;
  const senha = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ text, senha })
    });

    const data = await response.json();

    if (response.ok) {
      errorMsg.style.color = "green";
      errorMsg.textContent = "✅ Login realizado com sucesso!";
      setTimeout(() => {
        window.location.href = "/pagina/index.html";
      }, 1000);
    } else {
      errorMsg.style.color = "red";
      errorMsg.textContent = `❌ ${data.erro}`;
    }
  } catch (error) {
    errorMsg.style.color = "red";
    errorMsg.textContent = "❌ Erro ao conectar com o servidor";
  }
});
