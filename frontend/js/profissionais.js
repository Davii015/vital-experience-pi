/* profissionais.js */
const user = API.auth.requireAuth();
if (user) setTopbarUser(user);

const specColors = { 'Fisioterapia':'#1DB954', 'Educação Física':'#F5E642', 'Fisioterapia Esportiva':'#3b82f6', 'Fisioterapia Neurológica':'#f97316', 'Esporte Adaptado':'#FF2D7A', 'Ortopedia':'#8b5cf6' };
const getSpecColor = s => specColors[s] || '#9E9E9A';

let editingId = null, deletingId = null;

function renderTable() {
  const q     = document.getElementById('searchInput').value.toLowerCase();
  const profs = API.professionals.getAll().filter(p =>
    !q || p.name.toLowerCase().includes(q) || (p.specialty||'').toLowerCase().includes(q)
  );
  const users = API.users.getAll();
  const tbody = document.getElementById('tbody');
  document.getElementById('countLabel').textContent = `${profs.length} registro(s)`;

  if (!profs.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><span class="empty-icon">🩺</span><h3>${document.getElementById('searchInput').value ? 'Nenhum resultado' : 'Nenhum profissional cadastrado'}</h3><p>Clique em "+ Novo Profissional" para começar.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = profs.map(p => {
    const patientCount = users.filter(u => u.professionalId === p.id).length;
    const color = getSpecColor(p.specialty);
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-family:var(--font-syne);font-weight:700;font-size:11px;color:var(--black);flex-shrink:0">${getInitials(p.name)}</div>
            <div><div class="td-primary">${p.name}</div><div class="td-sub">ID #${p.id}</div></div>
          </div>
        </td>
        <td><span class="badge" style="background:${color}22;color:${color}">${p.specialty||'—'}</span></td>
        <td style="font-size:13px">${p.email||'—'}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${p.phone||'—'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-family:var(--font-syne);font-weight:700;font-size:16px">${patientCount}</span>
            <span style="font-size:11px;color:var(--gray-400)">paciente(s)</span>
          </div>
        </td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">${fmtDate(p.createdAt)}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-sm btn-ghost btn-icon" title="Editar" onclick="openModal(${p.id})">✎</button>
            <button class="btn btn-sm btn-danger btn-icon" title="Remover" onclick="openDelete(${p.id},'${p.name.replace(/'/g,"\\'")}')">✕</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openModal(id = null) {
  editingId = id;
  document.getElementById('formError').style.display = 'none';
  if (id) {
    const p = API.professionals.getById(id);
    document.getElementById('modalTitle').textContent = 'Editar Profissional';
    document.getElementById('fName').value      = p.name;
    document.getElementById('fSpecialty').value = p.specialty;
    document.getElementById('fEmail').value     = p.email;
    document.getElementById('fPhone').value     = p.phone || '';
  } else {
    document.getElementById('modalTitle').textContent = 'Novo Profissional';
    ['fName','fEmail','fPhone'].forEach(f => document.getElementById(f).value = '');
    document.getElementById('fSpecialty').value = '';
  }
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('fName').focus();
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); editingId = null; }

function saveProf() {
  const name      = document.getElementById('fName').value.trim();
  const specialty = document.getElementById('fSpecialty').value;
  const email     = document.getElementById('fEmail').value.trim();
  const phone     = document.getElementById('fPhone').value.trim();
  const errEl     = document.getElementById('formError');

  if (!name)      { errEl.textContent = 'Nome é obrigatório.';          errEl.style.display='block'; return; }
  if (!specialty) { errEl.textContent = 'Especialidade é obrigatória.'; errEl.style.display='block'; return; }
  if (!email)     { errEl.textContent = 'E-mail é obrigatório.';        errEl.style.display='block'; return; }

  errEl.style.display = 'none';
  const data = { name, specialty, email, phone };

  if (editingId) { API.professionals.update(editingId, data); showToast('Profissional atualizado'); }
  else           { API.professionals.create(data);            showToast('Profissional cadastrado'); }

  closeModal(); renderTable();
}

function openDelete(id, name) {
  deletingId = id;
  document.getElementById('deleteProfName').textContent = name;
  document.getElementById('deleteOverlay').classList.add('active');
}

function closeDelete() { document.getElementById('deleteOverlay').classList.remove('active'); deletingId = null; }

function confirmDelete() {
  API.professionals.delete(deletingId);
  showToast('Profissional removido', 'warning');
  closeDelete(); renderTable();
}

renderTable();
