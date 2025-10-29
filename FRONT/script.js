const toggleBtn = document.getElementById("toggleBtn");
const menu = document.getElementById("menu");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("show");
  });
}

const form = document.getElementById("contactForm");
const mensagensSalvas = document.getElementById("mensagensSalvas");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const mensagem = document.getElementById("mensagem").value;

    const novaMensagem = { nome, email, mensagem };

    let mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];
    mensagens.push(novaMensagem);

    localStorage.setItem("mensagens", JSON.stringify(mensagens));

    mostrarMensagens();
    form.reset();
  });

  function mostrarMensagens() {
    mensagensSalvas.innerHTML = "";
    const mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];

    mensagens.forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = `${msg.nome} (${msg.email}): ${msg.mensagem}`;
      mensagensSalvas.appendChild(li);
    });
  }

  mostrarMensagens();
}
