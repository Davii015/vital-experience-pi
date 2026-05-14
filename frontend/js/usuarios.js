/* usuarios.js */
const user = API.auth.requireAuth();
if (user) setTopbarUser(user);

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
            <div style="width:34px;height:34px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-family:var(--font-syne);font-weight:700;font-size:11px;color:var(--black);flex-shrink:0">${getInitials(u.name)}</div>
            <div>
              <div class="td-primary">${u.name}</div>
              <div class="td-sub">ID #${u.id}</div>
            </div>
          </div>
        </td>
        <td style="font-family:var(--font-mono);font-size:13px">${u.age} anos</td>
        <td><span class="badge badge-gray">${u.gender||'—'}</span></td>
        <td style="max-width:200px;font-size:13px">${u.condition||'—'}</td>
        <td>${prof ? `<div class="td-primary" style="font-size:12.5px">${prof.name}</div><div class="td-sub">${prof.specialty}</div>` : '<span class="badge badge-gray">Não atribuído</span>'}</td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">${fmtDate(u.createdAt)}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-sm btn-ghost btn-icon" title="Editar" onclick="openModal(${u.id})">✎</button>
            <button class="btn btn-sm btn-danger btn-icon" title="Remover" onclick="openDelete(${u.id},'${u.name.replace(/'/g,"\\'")}')">✕</button>
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
    document.getElementById('fAge').value        = u.age;
    document.getElementById('fGender').value     = u.gender;
    document.getElementById('fCondition').value  = u.condition;
    document.getElementById('fProf').value       = u.professionalId || '';
  } else {
    document.getElementById('modalTitle').textContent = 'Novo Usuário';
    ['fName','fAge','fCondition'].forEach(f => document.getElementById(f).value = '');
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

function saveUser() {
  const name      = document.getElementById('fName').value.trim();
  const age       = parseInt(document.getElementById('fAge').value);
  const gender    = document.getElementById('fGender').value;
  const condition = document.getElementById('fCondition').value.trim();
  const profId    = parseInt(document.getElementById('fProf').value) || null;
  const errEl     = document.getElementById('formError');

  if (!name)            { errEl.textContent = 'Nome é obrigatório.';              errEl.style.display='block'; return; }
  if (!age || age < 1)  { errEl.textContent = 'Informe uma idade válida.';        errEl.style.display='block'; return; }
  if (!condition)       { errEl.textContent = 'Condição/objetivo é obrigatório.'; errEl.style.display='block'; return; }

  errEl.style.display = 'none';
  const data = { name, age, gender, condition, professionalId: profId };

  if (editingId) {
    API.users.update(editingId, data);
    showToast('Usuário atualizado com sucesso');
  } else {
    API.users.create(data);
    showToast('Usuário cadastrado com sucesso');
  }
  closeModal();
  renderTable();
}

function openDelete(id, name) {
  deletingId = id;
  document.getElementById('deleteUserName').textContent = name;
  document.getElementById('deleteOverlay').classList.add('active');
}

function closeDelete() {
  document.getElementById('deleteOverlay').classList.remove('active');
  deletingId = null;
}

function confirmDelete() {
  API.users.delete(deletingId);
  showToast('Usuário removido', 'warning');
  closeDelete();
  renderTable();
}

renderTable();
