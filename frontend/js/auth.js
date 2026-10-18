/* auth.js — Vital Experience login page logic */

API.auth.requireAuth().then((user) => {
  if (user) window.location.href = '/app/pages/dashboard.html';
});

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('btnLogin');

  errEl.style.display = 'none';
  btn.textContent = 'Entrando...';
  btn.disabled = true;

  try {
    await API.auth.login(email, password);
    window.location.href = '/app/pages/dashboard.html';
  } catch (error) {
    errEl.textContent = error.message;
    errEl.style.display = 'block';
    btn.textContent = 'Entrar';
    btn.disabled = false;
  }
}
