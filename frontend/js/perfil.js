/* Perfil do administrador persistido no backend. */
function fillProfile(user) {
  document.getElementById('fDisplayName').value = user.name;
  document.getElementById('fEmail').value = user.email;
  document.getElementById('profileAvatar').textContent = getInitials(user.name);
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  setTopbarUser(user);
}

async function saveProfile() {
  const name = document.getElementById('fDisplayName').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const error = document.getElementById('profileError');
  const success = document.getElementById('profileSuccess');
  error.style.display = 'none';
  success.style.display = 'none';
  try {
    const user = await API.auth.update({ name, email });
    fillProfile(user);
    success.textContent = 'Perfil atualizado no banco de dados.';
    success.style.display = 'block';
  } catch (failure) {
    error.textContent = failure.message;
    error.style.display = 'block';
  }
}

async function changePassword() {
  const current = document.getElementById('fCurrentPass').value;
  const next = document.getElementById('fNewPass').value;
  const confirmation = document.getElementById('fConfirmPass').value;
  const error = document.getElementById('passError');
  const success = document.getElementById('passSuccess');
  error.style.display = 'none';
  success.style.display = 'none';
  if (next !== confirmation) {
    error.textContent = 'As novas senhas não coincidem.';
    error.style.display = 'block';
    return;
  }
  try {
    const result = await API.auth.changePassword(current, next);
    success.textContent = result.message;
    success.style.display = 'block';
    for (const id of ['fCurrentPass', 'fNewPass', 'fConfirmPass']) document.getElementById(id).value = '';
    setTimeout(() => { window.location.href = '/app/'; }, 1400);
  } catch (failure) {
    error.textContent = failure.message;
    error.style.display = 'block';
  }
}

function loadSysInfo(summary) {
  const items = [
    ['Versão da API', 'v2.1.0 — 6º período, Fase 02'],
    ['Usuários Monitorados', `${summary.users} cadastrado(s)`],
    ['Profissionais', `${summary.professionals} cadastrado(s)`],
    ['Sensores Ativos', `${summary.activeSensors} dispositivo(s)`],
    ['Sessões', `${summary.sessions} registro(s)`],
    ['Leituras de Sensor', `${summary.sensorReadings} leitura(s)`],
    ['Armazenamento', 'PostgreSQL via Prisma'],
  ];
  document.getElementById('sysInfo').innerHTML = items.map(([label, value]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--gray-200)">
      <span style="font-size:13px;color:var(--gray-600)">${escapeHtml(label)}</span>
      <span style="font-family:var(--font-mono);font-size:12px;font-weight:600">${escapeHtml(value)}</span>
    </div>`).join('');
}

async function init() {
  const user = await API.auth.requireAuth();
  if (!user) return;
  fillProfile(user);
  try { loadSysInfo(await API.reports.summary()); }
  catch (failure) { showToast(failure.message, 'error'); }
}
init();
