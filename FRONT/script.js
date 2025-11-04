document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const usuarioLogadoSpan = document.getElementById("usuarioLogado");
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");

  // Exibe o nome do usuário se estiver logado
  if (usuario) {
    usuarioLogadoSpan.textContent = `👋 Olá, ${usuario.username}`;
    loginLink.style.display = "none";
    logoutLink.style.display = "inline";
  }

  // Logout
  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });

  // --- Mural ---
  const form = document.getElementById("contactForm");
  const mensagensSalvas = document.getElementById("mensagensSalvas");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // 🔒 Se o usuário não estiver logado, redireciona para login.html
      const usuarioAtual = JSON.parse(localStorage.getItem("usuarioLogado"));
      if (!usuarioAtual) {
        alert("Você precisa estar logado para publicar!");
        window.location.href = "login.html";
        return;
      }

      const mensagem = document.getElementById("mensagem").value.trim();
      if (!mensagem) return;

      const novaMensagem = {
        autor: usuarioAtual.username,
        conteudo: mensagem,
        data: new Date().toLocaleString("pt-BR"),
      };

      let mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
      mensagens.unshift(novaMensagem);
      localStorage.setItem("mensagens", JSON.stringify(mensagens));

      form.reset();
      mostrarMensagens();
    });

    function mostrarMensagens() {
      mensagensSalvas.innerHTML = "";
      const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];

      if (mensagens.length === 0) {
        mensagensSalvas.innerHTML = "<li>Nenhuma mensagem publicada.</li>";
        return;
      }

      mensagens.forEach((msg) => {
        const li = document.createElement("li");
        li.classList.add("mensagem-item");
        li.innerHTML = `
          <div class="mensagem">
            <h3>${msg.autor}</h3>
            <p>${msg.conteudo}</p>
            <small>Publicado em ${msg.data}</small>
          </div>
        `;
        mensagensSalvas.appendChild(li);
      });
    }

    mostrarMensagens();
  }
});
