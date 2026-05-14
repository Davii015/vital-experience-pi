/* auth.js — Vital Experience login page logic */

// Redirecionar se já estiver logado
(function() {
  if (API.auth.getUser()) {
    window.location.href = 'pages/dashboard.html';
  }
})();

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('btnLogin');

  errEl.style.display = 'none';
  btn.textContent = 'Entrando...';
  btn.disabled = true;

  // Simula delay de rede
  setTimeout(() => {
    const res = API.auth.login(email, password);
    if (res.ok) {
      btn.textContent = '✓ Redirecionando...';
      btn.style.background = '#1DB954';
      btn.style.color = 'white';
      setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 500);
    } else {
      errEl.textContent = res.error;
      errEl.style.display = 'block';
      btn.textContent = 'Entrar';
      btn.disabled = false;
    }
  }, 600);
}

function logout() {
  API.auth.logout();
}
