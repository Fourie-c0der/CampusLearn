let session = null;
let role = 'student';
let paging = { page: 1, size: 12, total: 0 };

// ---- DOM shortcuts ----
const $ = (id) => document.getElementById(id);
const mount = {
  nav: () => $('clNavMount'),
  root: () => $('pageRoot'),
  list: () => $('resourceContainer'),
  pager: () => $('pager'),
  search: () => $('searchInput'),
  mod: () => $('moduleFilter'),
  typ: () => $('typeFilter'),
  hint: () => $('tutorHint'),
  upForm: () => $('uploadForm'),
  title: () => $('titleInput'),
  type: () => $('typeInput'),
  url:  () => $('urlInput'),
  file: () => $('fileInput'),
};

// ---- Toasts ----
function notify(title, msg) {
  $('clToastTitle').textContent = title || 'Notice';
  $('clToastBody').textContent = msg || '';
  new bootstrap.Toast($('clToast')).show();
}

// ---- Utilities ----
const debounce = (fn, ms = 250) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

// ---- Partials ----
async function loadNav() {
  try {
    const html = await fetch('partials/nav.html').then(r => r.text());
    mount.nav().innerHTML = html;
  } catch { /* ignore */ }
}

// ---- Cards ----
function cardHTML(r) {
  const badge = (r.type || '').toUpperCase();
  const tags = Array.isArray(r.tags) ? r.tags : [];
  const tagHtml = tags.map(t => `<span class="badge text-bg-light me-1">#${t}</span>`).join('');
  const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString() : '';
  return `
    <div class="card shadow-sm border-0 h-100">
      <div class="card-body">
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge text-bg-secondary">${badge}</span>
          ${r.module ? `<span class="badge text-bg-light">${r.module}</span>` : ''}
        </div>
        <h5 class="card-title">${r.title}</h5>
        ${tagHtml ? `<div class="small text-muted mb-2">${tagHtml}</div>` : ''}
        <button class="btn btn-outline-primary btn-sm" data-open="${r.id}">Open</button>
      </div>
      <div class="card-footer text-muted small">
        Uploaded by ${r.uploader ?? 'Unknown'} • ${dateStr} • ${r.download_count ?? 0} downloads
      </div>
    </div>
  `;
}

// ---- Pager ----
function renderPager() {
  const totalPages = Math.max(1, Math.ceil(paging.total / paging.size));
  mount.pager().innerHTML = `
    <button class="btn btn-outline-secondary btn-sm" ${paging.page<=1?'disabled':''} id="prevPg">Prev</button>
    <span class="mx-2 small">${paging.page} / ${totalPages}</span>
    <button class="btn btn-outline-secondary btn-sm" ${paging.page>=totalPages?'disabled':''} id="nextPg">Next</button>
  `;
  $('prevPg')?.addEventListener('click', () => { paging.page--; loadResources(); });
  $('nextPg')?.addEventListener('click', () => { paging.page++; loadResources(); });
}

// ---- Listing ----
async function loadResources() {
  const q = (mount.search().value || '').trim();

  let query = supabase.from('resources').select('*', { count: 'exact' });
  if (q) query = query.ilike('title', `%${q}%`);
  if (mount.mod().value) query = query.eq('module', mount.mod().value);
  if (mount.typ().value) query = query.eq('type', mount.typ().value);
  query = query.order('created_at', { ascending: false });

  const from = (paging.page - 1) * paging.size;
  const to   = from + paging.size - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) { console.error(error); notify('Error', 'Failed to load resources'); return; }
  paging.total = count || 0;

  const list = mount.list();
  list.innerHTML = '';
  if (!data || !data.length) {
    list.innerHTML = `<p class="text-muted text-center mt-5">No resources found 😢</p>`;
  } else {
    data.forEach(r => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = cardHTML(r);
      list.appendChild(col);
    });
    // open handlers
    list.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-open');
        try { await supabase.rpc('inc_download', { _id: id }); } catch {}
        const { data: one } = await supabase.from('resources').select('url').eq('id', id).single();
        if (one?.url) window.open(one.url, '_blank', 'noopener,noreferrer');
      });
    });
  }
  renderPager();
}

// ---- Dynamic module filter ----
async function loadModules() {
  const { data, error } = await supabase
    .from('resources')
    .select('module')
    .not('module','is',null);
  if (error) return;
  const uniq = [...new Set((data || []).map(x => x.module))].sort();
  const sel = mount.mod();
  uniq.forEach(m => {
    const o = document.createElement('option');
    o.value = o.textContent = m;
    sel.appendChild(o);
  });
}

// ---- Upload ----
async function handleUpload(e) {
  e.preventDefault();
  if (!(role === 'tutor' || role === 'admin')) return;

  const title = mount.title().value.trim();
  const type  = mount.type().value;
  const extUrl = (mount.url().value || '').trim();
  const file  = mount.file().files?.[0];

  if (!title) return notify('Error','Title is required');
  if (!type)  return notify('Error','Choose a type');

  let storage = 'external';
  let finalUrl = extUrl;

  if ((type === 'pdf' || type === 'video') && file) {
    const path = `${session.user.email}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase
      .storage.from('resources')
      .upload(path, file, { upsert: false, cacheControl: '3600' });
    if (upErr) return notify('Upload failed', upErr.message);
    const { data: pub } = supabase.storage.from('resources').getPublicUrl(path);
    finalUrl = pub.publicUrl;
    storage = 'storage';
  } else if (type === 'link') {
    try { new URL(extUrl); } catch { return notify('Error','Enter a valid URL'); }
  } else if (!file && !extUrl) {
    return notify('Error','Provide a file or an external URL');
  }

  const moduleVal = mount.mod().value || null;
  const { error: insErr } = await supabase.from('resources').insert({
    title, module: moduleVal, type, url: finalUrl, storage, tags: [], uploader: session.user.email
  });
  if (insErr) return notify('Error', insErr.message);

  mount.upForm().reset();
  notify('Success','Resource uploaded');
  await loadResources();
}

// ---- Auth gate + boot ----
async function boot() {
  const { data: { session: s } } = await supabase.auth.getSession();
  if (!s) { location.href = 'login.html'; return; }
  session = s;
  role = session.user?.user_metadata?.role ?? 'student';

  await loadNav();                           // nav only after auth
  mount.root().classList.remove('d-none');   // reveal page

  // Role UI
  if (role === 'student') mount.hint().classList.remove('d-none');
  const canUpload = (role === 'tutor' || role === 'admin');
  mount.upForm().closest('.mt-5').style.display = canUpload ? 'block' : 'none';

  // Events
  mount.search().addEventListener('input', debounce(() => { paging.page = 1; loadResources(); }));
  mount.mod().addEventListener('change', () => { paging.page = 1; loadResources(); });
  mount.typ().addEventListener('change', () => { paging.page = 1; loadResources(); });
  mount.upForm().addEventListener('submit', handleUpload);

  await loadModules();
  await loadResources();

  // If session changes (logout), bounce to login
  supabase.auth.onAuthStateChange((_evt, s2) => {
    if (!s2) location.href = 'login.html';
  });
}

boot();
