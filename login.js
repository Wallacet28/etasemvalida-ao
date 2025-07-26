const AUTH_KEY = "usuario_autenticado";
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Simulação simples — substitua com verificação real se desejar
  if (usuario === "admin" && senha === "1234") {
    localStorage.setItem(AUTH_KEY, "true");
    window.location.href = "index.html"; // redireciona para a página principal
  } else {
    document.getElementById("erro-login").style.display = "block";
  }
});

