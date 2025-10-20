(() => {
  // ---------- DOM helpers ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    navMount: () => $('clNavMount'),
    root:     () => $('pageRoot'),
    list:     () => $('resourceContainer'),
    pager:    () => $('pager'),
    search:   () => $('searchInput'),
    mod:      () => $('moduleFilter'),
    typ:      () => $('typeFilter'),
    hint:     () => $('tutorHint'),
    form:     () => $('uploadForm'),
    title:    () => $('titleInput'),
    typeSel:  () => $('typeInput'),
    url:      () => $('urlInput'),
    file:     () => $('fileInput'),
    toast:    () => $('clToast'),
    toastTitle: () => $('clToastTitle'),
    toastBody:  () => $('clToastBody'),
    quickMenu: () => document.getElementById('quickModuleMenu'),
  moduleInput: () => document.getElementById('moduleInput'),
  };

  // ---------- Toast ----------
  function notify(title, msg) {
    if (!el.toast()) return alert(`${title}\n${msg}`);
    el.toastTitle().textContent = title || 'Notice';
    el.toastBody().textContent = msg || '';
    new bootstrap.Toast(el.toast()).show();
  }

  // ---------- Utils ----------
  const debounce = (fn, ms=250) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

  // ---------- Nav partial ----------
  async function loadNav() {
    try {
      const html = await fetch('./partials/nav.html').then(r => r.text());
      el.navMount().innerHTML = html;
    } catch {
      el.navMount().innerHTML = '';
    }
  }

  // ---------- Populate modules in filter + quick menu + upload select ----------
function populateModules(mods) {
  const uniq = [...new Set((mods || []).filter(Boolean))].sort();

  // Filter select
  const sel = el.mod();
  sel.innerHTML = '<option value="">All Modules</option>';
  uniq.forEach(m => {
    const o = document.createElement('option');
    o.value = o.textContent = m;
    sel.appendChild(o);
  });

  // Quick dropdown
  const menu = el.quickMenu();
  if (menu) {
    menu.innerHTML = '<li><a class="dropdown-item" href="#" data-mod="">All Modules</a></li>';
    uniq.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `<a class="dropdown-item" href="#" data-mod="${m}">${m}</a>`;
      menu.appendChild(li);
    });
    // click-to-apply
    menu.querySelectorAll('[data-mod]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const val = a.getAttribute('data-mod') || '';
        el.mod().value = val;
        paging.page = 1;
        if (window.supabase) loadResourcesSupabase(); else loadResourcesDemo();
      });
    });
  }

  // Upload select
  const upSel = el.moduleInput?.();
  if (upSel) {
    upSel.innerHTML = '<option value="">Select module</option>';
    uniq.forEach(m => {
      const o = document.createElement('option');
      o.value = o.textContent = m;
      upSel.appendChild(o);
    });
  }
}


  // ---------- Card ----------
  function cardHTML(r) {
    const badge = (r.type || '').toUpperCase();
    const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString() : '';
    const downloads = r.download_count ?? 0;
    const moduleBadge = r.module ? `<span class="badge text-bg-light">${r.module}</span>` : '';
    return `
      <div class="col-md-4">
        <div class="card resource-card h-100 shadow-sm border-0">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge text-bg-secondary">${badge}</span>
              ${moduleBadge}
            </div>
            <h5 class="card-title">${r.title}</h5>
            <button class="btn btn-outline-primary btn-sm" data-open="${r.id}" aria-label="Open ${r.title}">Open</button>
          </div>
          <div class="card-footer text-muted small">
            ${r.uploader ?? 'Unknown'} • ${dateStr}
            <span class="float-end">${downloads} downloads</span>
          </div>
        </div>
      </div>
    `;
  }

  // ---------- Demo data (used if Supabase not configured) ----------
  const DEMO = [
    { id: 'd1', title: 'Database Normalization Cheatsheet', module: 'DB101', type: 'pdf', url: 'https://example.com/db101.pdf', created_at: Date.now(), download_count: 5, uploader: 'demo@campus' },
    { id: 'd2', title: 'Understanding UML Diagrams', module: 'SE202', type: 'video', url: 'https://example.com/uml.mp4', created_at: Date.now(), download_count: 7, uploader: 'demo@campus' },
    { id: 'd3', title: 'Git & GitHub for Beginners', module: 'CSL101', type: 'link', url: 'https://docs.github.com/en/get-started', created_at: Date.now(), download_count: 3, uploader: 'demo@campus' },
  ];

  // ---------- Paging state ----------
  const paging = { page: 1, size: 12, total: 0 };
  function renderPager() {
    const totalPages = Math.max(1, Math.ceil(paging.total / paging.size));
    el.pager().innerHTML = `
      <button class="btn btn-outline-secondary btn-sm" ${paging.page<=1?'disabled':''} id="pgPrev">Prev</button>
      <span class="mx-2 small">${paging.page} / ${totalPages}</span>
      <button class="btn btn-outline-secondary btn-sm" ${paging.page>=totalPages?'disabled':''} id="pgNext">Next</button>
    `;
    document.getElementById('pgPrev')?.addEventListener('click', ()=>{ paging.page--; loadResources(); });
    document.getElementById('pgNext')?.addEventListener('click', ()=>{ paging.page++; loadResources(); });
  }

  // ---------- Data loaders ----------
  async function loadResourcesDemo() {
    const q = (el.search().value || '').toLowerCase();
    const m = el.mod().value;
    const t = el.typ().value;

    let arr = [...DEMO];
    if (q) arr = arr.filter(x => x.title.toLowerCase().includes(q));
    if (m) arr = arr.filter(x => x.module === m);
    if (t) arr = arr.filter(x => x.type === t);

    paging.total = arr.length;
    el.list().innerHTML = arr.map(cardHTML).join('') || `<p class="text-muted text-center mt-5">No resources found.</p>`;

    // open handlers
    el.list().querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.getAttribute('data-open');
        const item = DEMO.find(x => x.id === id);
        if (item?.url) window.open(item.url, '_blank', 'noopener,noreferrer');
      });
    });

    renderPager();
  }

  async function loadResourcesSupabase() {
    const q = (el.search().value || '').trim();
    let query = supabase.from('resources').select('*', { count: 'exact' });
    if (q) query = query.ilike('title', `%${q}%`);
    if (el.mod().value) query = query.eq('module', el.mod().value);
    if (el.typ().value) query = query.eq('type', el.typ().value);
    query = query.order('created_at', { ascending: false });

    const from = (paging.page-1)*paging.size;
    const to   = from + paging.size - 1;
    const { data, count, error } = await query.range(from, to);
    if (error) { console.error(error); notify('Error','Failed to load resources'); return; }

    paging.total = count || 0;
    el.list().innerHTML = (data || []).map(cardHTML).join('') || `<p class="text-muted text-center mt-5">No resources found.</p>`;

    // open handlers
    el.list().querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-open');
        try { await supabase.rpc('inc_download', { _id: id }); } catch {}
        const { data: one } = await supabase.from('resources').select('url').eq('id', id).single();
        if (one?.url) window.open(one.url, '_blank', 'noopener,noreferrer');
      });
    });

    renderPager();
  }

  async function loadModulesDemo() {
  const mods = DEMO.map(x => x.module);
  populateModules(mods);
}

async function loadModulesSupabase() {
  const { data, error } = await supabase.from('resources').select('module').not('module', 'is', null);
  if (error) return;
  populateModules((data || []).map(x => x.module));
}


  // ---------- Upload (Supabase only) ----------
  async function handleUpload(ev) {
    ev.preventDefault();
    if (!window.supabase) { return notify('Unavailable','Upload requires Supabase configuration.'); }

    const { data: { session } } = await supabase.auth.getSession();
    const role = session?.user?.user_metadata?.role ?? 'student';
    if (!(role === 'tutor' || role === 'admin')) return;

    const title = el.title().value.trim();
    const type  = el.typeSel().value;
    const extUrl = (el.url().value || '').trim();
    const file  = el.file().files?.[0];
    if (!title) return notify('Error','Title is required');

    let storage = 'external';
    let finalUrl = extUrl;

    if ((type === 'pdf' || type === 'video') && file) {
      const path = `${session.user.email}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('resources').upload(path, file, { upsert: false, cacheControl: '3600' });
      if (upErr) return notify('Upload failed', upErr.message);
      const { data: pub } = supabase.storage.from('resources').getPublicUrl(path);
      finalUrl = pub.publicUrl;
      storage = 'storage';
    } else if (type === 'link') {
      try { new URL(extUrl); } catch { return notify('Error','Enter a valid URL'); }
    } else if (!file && !extUrl) {
      return notify('Error','Provide a file or an external URL');
    }

    const moduleVal = (el.moduleInput?.().value || el.mod().value || '').trim() || null;
    const { error: insErr } = await supabase.from('resources').insert({
      title, module: moduleVal, type, url: finalUrl, storage, tags: [], uploader: session.user.email
    });
    if (insErr) return notify('Error', insErr.message);

    el.form().reset();
    notify('Success','Resource uploaded');
    await loadResourcesSupabase();
  }

  // ---------- Boot ----------
  async function boot() {
    await loadNav();

    const hasSupabase = !!window.supabase;
    el.root().classList.remove('d-none');

    if (!hasSupabase) {
      // Demo mode: hide upload, show hint for configuration
      el.form().closest('section').style.display = 'none';
      el.hint().classList.remove('d-none');
      await loadModulesDemo();
      await loadResourcesDemo();
    } else {
      // Auth gate
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // friendly prompt to log in
        el.root().innerHTML = `
          <div class="py-5 text-center">
            <h4>You need to log in to view Resources</h4>
            <p class="text-muted">Use your @belgiumcampus.ac.za account.</p>
            <a href="login.html" class="btn btn-primary">Go to Login</a>
          </div>`;
        return;
      }
      const role = session.user?.user_metadata?.role ?? 'student';
      if (role === 'student') el.hint().classList.remove('d-none');
      const canUpload = (role === 'tutor' || role === 'admin');
      el.form().closest('section').style.display = canUpload ? 'block' : 'none';

      // Events & initial loads
      el.search().addEventListener('input', debounce(()=>{ paging.page=1; hasSupabase ? loadResourcesSupabase(): loadResourcesDemo(); }));
      el.mod().addEventListener('change', ()=>{ paging.page=1; hasSupabase ? loadResourcesSupabase(): loadResourcesDemo(); });
      el.typ().addEventListener('change', ()=>{ paging.page=1; hasSupabase ? loadResourcesSupabase(): loadResourcesDemo(); });
      el.form().addEventListener('submit', handleUpload);

      await loadModulesSupabase();
      await loadResourcesSupabase();

      supabase.auth.onAuthStateChange((_evt, s2) => {
        if (!s2) {
          const base = location.href.replace(/[^/]+$/, "");
          location.href = base + "login.html";
        }
      });
    }
  }

  // Initialize
  boot();
})();
