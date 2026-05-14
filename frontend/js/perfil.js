/* perfil.js */
const user = API.auth.requireAuth();
if (user) setTopbarUser(user);

function loadProfile() {
  const stored = JSON.parse(localStorage.getItem('ve_profile') || '{}');
  const name   = stored.displayName || (user && user.name) || 'Admin';
  const email  = stored.email       || (user && user.email) || 'admin@vitalexperience.com';

  document.getElementById('fDisplayName').value = name;
  document.getElementById('fEmail').value       = email;
  if (stored.role) document.getElementById('fRole').value = stored.role;

  document.getElementById('profileAvatar').textContent = getInitials(name);
  document.getElementById('profileName').textContent   = name;
  document.getElementById('profileEmail').textContent  = email;
}

function saveProfile() {
  const name  = document.getElementById('fDisplayName').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const role  = document.getElementById('fRole').value.trim();
  const errEl = document.getElementById('profileError');
  const okEl  = document.getElementById('profileSuccess');

  if (!name)  { errEl.textContent = 'Nome é obrigatório.';  errEl.style.display='block'; okEl.style.display='none'; return; }
  if (!email) { errEl.textContent = 'E-mail é obrigatório.'; errEl.style.display='block'; okEl.style.display='none'; return; }

  localStorage.setItem('ve_profile', JSON.stringify({ displayName: name, email, role }));

  document.getElementById('profileAvatar').textContent = getInitials(name);
  document.getElementById('profileName').textContent   = name;
  document.getElementById('profileEmail').textContent  = email;

  if (document.getElementById('sidebarUserName')) document.getElementById('sidebarUserName').textContent = name;
  if (document.getElementById('topbarUserName'))  document.getElementById('topbarUserName').textContent  = name;

  errEl.style.display = 'none';
  okEl.textContent    = 'Perfil atualizado com sucesso!';
  okEl.style.display  = 'block';
  setTimeout(() => { okEl.style.display = 'none'; }, 3000);
}

function changePassword() {
  const cur     = document.getElementById('fCurrentPass').value;
  const nw      = document.getElementById('fNewPass').value;
  const confirm = document.getElementById('fConfirmPass').value;
  const errEl   = document.getElementById('passError');
  const okEl    = document.getElementById('passSuccess');

  if (!cur)            { errEl.textContent = 'Informe a senha atual.';           errEl.style.display='block'; okEl.style.display='none'; return; }
  if (cur !== 'admin') { errEl.textContent = 'Senha atual incorreta.';           errEl.style.display='block'; okEl.style.display='none'; return; }
  if (nw.length < 6)   { errEl.textContent = 'Nova senha deve ter 6+ caracteres.'; errEl.style.display='block'; okEl.style.display='none'; return; }
  if (nw !== confirm)  { errEl.textContent = 'Senhas não coincidem.';            errEl.style.display='block'; okEl.style.display='none'; return; }

  errEl.style.display = 'none';
  okEl.textContent    = 'Senha alterada com sucesso!';
  okEl.style.display  = 'block';
  ['fCurrentPass','fNewPass','fConfirmPass'].forEach(f => document.getElementById(f).value = '');
  setTimeout(() => { okEl.style.display = 'none'; }, 3000);
}

function loadSysInfo() {
  const users   = API.users.getAll().length;
  const profs   = API.professionals.getAll().length;
  const sensors = API.sensors.getAll().length;
  const sessions= API.sessions.getAll().length;
  const data    = API.sensorData.getAll().length;

  const items = [
    ['Versão do Sistema',    'v1.0.0 — Fase 2'],
    ['Usuários Monitorados', `${users} cadastrado(s)`],
    ['Profissionais',        `${profs} cadastrado(s)`],
    ['Sensores',             `${sensors} dispositivo(s)`],
    ['Sessões',              `${sessions} registro(s)`],
    ['Leituras de Sensor',   `${data} leitura(s)`],
    ['Armazenamento',        'localStorage (simulado)'],
  ];

  document.getElementById('sysInfo').innerHTML = items.map(([label, val]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--gray-200)">
      <span style="font-size:13px;color:var(--gray-600)">${label}</span>
      <span style="font-family:var(--font-mono);font-size:12px;font-weight:600">${val}</span>
    </div>`).join('');
}

function confirmReset() {
  document.getElementById('resetOverlay').classList.add('active');
}

function doReset() {
  const keys = ['ve_users','ve_professionals','ve_sensors','ve_sessions','ve_sensor_data','ve_alerts'];
  keys.forEach(k => localStorage.removeItem(k));
  document.getElementById('resetOverlay').classList.remove('active');
  showToast('Dados redefinidos — recarregando...', 'warning');
  setTimeout(() => location.reload(), 1500);
}

loadProfile();
loadSysInfo();
