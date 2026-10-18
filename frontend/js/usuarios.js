/* usuarios.js */
const colors = ['#F5E642','#1DB954','#FF2D7A','#3b82f6','#f97316'];
const getColor = id => colors[(id-1) % colors.length];

let editingId  = null;
let deletingId = null;

function loadProfOptions() {
  const sel = document.getElementById('fProf');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Selecione um profissional</option>';
  API.professionals.getAll().forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = `${p.name} — ${p.specialty}`;
    sel.appendChild(opt);
  });
  sel.value = cur;
}

function renderTable() {
  const q     = document.getElementById('searchInput').value.toLowerCase();
  const users = API.users.getAll().filter(u =>
    !q || u.name.toLowerCase().includes(q) || (u.condition||'').toLowerCase().includes(q)
  );
  const profs = API.professionals.getAll();
  const tbody = document.getElementById('tbody');
  document.getElementById('countLabel').textContent = `${users.length} registro(s)`;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><span class="empty-icon">👤</span><h3>${document.getElementById('searchInput').value ? 'Nenhum resultado' : 'Nenhum usuário cadastrado'}</h3><p>Clique em "+ Novo Usuário" para começar.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const prof = profs.find(p => p.id === u.professionalId);
    const color = getColor(u.id);
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-family:var(--font-syne);font-weight:700;font-size:11px;color:var(--black);flex-shrink:0">${escapeHtml(getInitials(u.name))}</div>
            <div>
              <div class="td-primary">${escapeHtml(u.name)}</div>
              <div class="td-sub">ID #${u.id}</div>
            </div>
          </div>
        </td>
        <td style="font-family:var(--font-mono);font-size:13px">${u.age === null ? '—' : `${u.age} anos`}</td>
        <td><span class="badge badge-gray">${escapeHtml(u.gender||'—')}</span></td>
        <td style="max-width:200px;font-size:13px">${escapeHtml(u.condition||'—')}</td>
        <td>${prof ? `<div class="td-primary" style="font-size:12.5px">${escapeHtml(prof.name)}</div><div class="td-sub">${escapeHtml(prof.specialty)}</div>` : '<span class="badge badge-gray">Não atribuído</span>'}</td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">${fmtDate(u.createdAt)}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-sm btn-ghost btn-icon" title="Editar" onclick="openModal(${u.id})">✎</button>
            <button class="btn btn-sm btn-danger btn-icon" title="Remover" onclick="openDelete(${u.id})">✕</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openModal(id = null) {
  editingId = id;
  loadProfOptions();
  document.getElementById('formError').style.display = 'none';
  if (id) {
    const u = API.users.getById(id);
    document.getElementById('modalTitle').textContent = 'Editar Usuário';
    document.getElementById('fName').value       = u.name;
    document.getElementById('fBirthDate').value  = u.birthDate ? u.birthDate.slice(0,10) : '';
    document.getElementById('fGender').value     = u.gender;
    document.getElementById('fCondition').value  = u.condition;
    document.getElementById('fProf').value       = u.professionalId || '';
  } else {
    document.getElementById('modalTitle').textContent = 'Novo Usuário';
    ['fName','fBirthDate','fCondition'].forEach(f => document.getElementById(f).value = '');
    document.getElementById('fGender').value = 'Masculino';
    document.getElementById('fProf').value   = '';
  }
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('fName').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  editingId = null;
}

async function saveUser() {
  const name      = document.getElementById('fName').value.trim();
  const birthDate = document.getElementById('fBirthDate').value;
  const gender    = document.getElementById('fGender').value;
  const condition = document.getElementById('fCondition').value.trim();
  const profId    = parseInt(document.getElementById('fProf').value) || null;
  const errEl     = document.getElementById('formError');

  if (!name)            { errEl.textContent = 'Nome é obrigatório.';              errEl.style.display='block'; return; }
  if (!birthDate || new Date(birthDate) > new Date()) { errEl.textContent = 'Informe uma data de nascimento válida.'; errEl.style.display='block'; return; }
  if (!condition)       { errEl.textContent = 'Condição/objetivo é obrigatório.'; errEl.style.display='block'; return; }

  errEl.style.display = 'none';
  const data = { name, birthDate, gender, condition, professionalId: profId };

  try {
    if (editingId) {
      await API.users.update(editingId, data);
      showToast('Usuário atualizado com sucesso');
    } else {
      await API.users.create(data);
      showToast('Usuário cadastrado com sucesso');
    }
    closeModal();
    renderTable();
  } catch (error) {
    errEl.textContent = error.message;
    errEl.style.display = 'block';
  }
}

function openDelete(id) {
  deletingId = id;
  document.getElementById('deleteUserName').textContent = API.users.getById(id)?.name || 'este usuário';
  document.getElementById('deleteOverlay').classList.add('active');
}

function closeDelete() {
  document.getElementById('deleteOverlay').classList.remove('active');
  deletingId = null;
}

async function confirmDelete() {
  try {
    await API.users.delete(deletingId);
    showToast('Usuário removido', 'warning');
    closeDelete();
    renderTable();
  } catch (error) { showToast(error.message, 'error'); }
}

async function init() {
  const user = await API.auth.requireAuth();
  if (!user) return;
  setTopbarUser(user);
  try { await API.load('users', 'professionals'); renderTable(); }
  catch (error) { showToast(error.message, 'error'); }
}
init();
