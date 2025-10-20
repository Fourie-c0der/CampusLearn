// --------------- Supabase client ---------------
const supabaseUrl = 'your-supabase-url';
const supabaseAnonKey = 'your-supabase-anon-key';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// --------------- DOM refs ---------------
const container = document.getElementById('resourceContainer');
const searchInput = document.getElementById('searchInput');
const moduleFilter = document.getElementById('moduleFilter');
const typeFilter = document.getElementById('typeFilter');
const uploadForm = document.getElementById('uploadForm');

// Upload fields
const titleInput = document.getElementById('titleInput');
const typeInput  = document.getElementById('typeInput');
const urlInput   = document.getElementById('urlInput');
const fileInput  = document.getElementById('fileInput');

// State
let session = null;
let role = 'student'; // default
let paging = { page: 1, pageSize: 12, total: 0 };

// --------------- Helpers ---------------
function setUploadVisibility() {
  const canUpload = role === 'tutor' || role === 'admin';
  uploadForm.parentElement.style.display = canUpload ? 'block' : 'none';
}

function cardHTML(r) {
  const badge = r.type.toUpperCase();
  const linkHref = r.storage === 'external' ? r.url : r.url; // url contains public URL for storage objects
  return `
    <div class="card shadow-sm border-0 h-100">
      <div class="card-body">
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge text-bg-secondary">${badge}</span>
          ${r.module ? `<span class="badge text-bg-light">${r.module}</span>` : ''}
        </div>
        <h5 class="card-title">${r.title}</h5>
        ${Array.isArray(r.tags) && r.tags.length ? `
          <div class="small text-muted mb-2">${r.tags.map(t => `#${t}`).join(' ')}</div>` : ''
        }
        <a href="${linkHref}" class="btn btn-outline-primary btn-sm" target="_blank" rel="noreferrer">Open</a>
      </div>
      <div class="card-footer text-muted small">
        Uploaded by ${r.uploader ?? 'Unknown'} • ${new Date(r.created_at).toLocaleDateString()}
      </div>
    </div>
  `;
}

function renderResources(rows) {
  container.innerHTML = '';
  if (!rows.length) {
    container.innerHTML = `<p class="text-muted text-center mt-5">No resources found 😢</p>`;
    return;
  }
  rows.forEach(r => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = cardHTML(r);
    container.appendChild(col);
  });
}

// --------------- Fetch list ---------------
async function loadResources() {
  const q = (searchInput.value || '').trim();
  const moduleVal = moduleFilter.value || null;
  const typeVal = typeFilter.value || null;

  let query = supabase
    .from('resources')
    .select('*', { count: 'exact' });

  if (q) {
    // search in title (ilike) – simple prototype search
    query = query.ilike('title', `%${q}%`);
  }
  if (moduleVal) query = query.eq('module', moduleVal);
  if (typeVal)   query = query.eq('type', typeVal);

  // order newest
  query = query.order('created_at', { ascending: false });

  // basic paging
  const from = (paging.page - 1) * paging.pageSize;
  const to   = from + paging.pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error(error);
    container.innerHTML = `<div class="alert alert-danger">Failed to load resources.</div>`;
    return;
  }
  paging.total = count ?? 0;
  renderResources(data || []);
}

// --------------- Upload flow ---------------
async function handleUpload(e) {
  e.preventDefault();
  if (!(role === 'tutor' || role === 'admin')) {
    return alert('You do not have permission to upload.');
  }

  const title = (titleInput.value || '').trim();
  const type  = typeInput.value;
  const url   = (urlInput.value || '').trim();
  const file  = fileInput.files?.[0];

  if (!title) return alert('Please add a title.');
  if (!type)  return alert('Please choose a type.');

  let storageType = 'external';
  let finalUrl = url;

  // For pdf/video, prefer file upload if provided; else external link
  if ((type === 'pdf' || type === 'video') && file) {
    try {
      // Compose a path: <user-email>/<timestamp>_<filename>
      const email = session?.user?.email ?? 'unknown';
      const path = `${email}/${Date.now()}_${file.name}`;

      // Upload
      const { error: upErr } = await supabase.storage.from('resources').upload(path, file, {
        upsert: false,
        cacheControl: '3600'
      });
      if (upErr) throw upErr;

      // Get public URL (bucket is public in prototype)
      const { data: pub } = supabase.storage.from('resources').getPublicUrl(path);
      finalUrl = pub.publicUrl;
      storageType = 'storage';
    } catch (err) {
      console.error(err);
      return alert('Upload failed. Check bucket/public settings.');
    }
  } else if (type === 'link') {
    if (!url) return alert('Please provide an external URL for a link resource.');
    storageType = 'external';
    finalUrl = url;
  } else if ((type === 'pdf' || type === 'video') && !file && !url) {
    return alert('Provide a file or an external URL.');
  }

  // Insert DB row
  const email = session?.user?.email ?? null;
  const { error: insErr } = await supabase.from('resources').insert({
    title,
    module: document.getElementById('moduleFilter').value || null, // reuse current module filter as module tag if you want
    type,
    url: finalUrl,
    storage: storageType,
    tags: [], // add a tags UI later
    uploader: email
  });

  if (insErr) {
    console.error(insErr);
    return alert('Could not save resource (RLS/role?)');
  }

  uploadForm.reset();
  alert('Resource uploaded ✅');
  await loadResources();
}

// --------------- Auth/session boot ---------------
async function init() {
  const { data: { session: s } } = await supabase.auth.getSession();
  session = s;

  // Require login to view page (optional: you can relax this)
  if (!session) {
    // redirect to login
    window.location.href = 'login.html';
    return;
  }

  // derive role
  role = session.user?.user_metadata?.role ?? 'student';
  setUploadVisibility();

  // events
  searchInput.addEventListener('input', debounce(loadResources, 250));
  moduleFilter.addEventListener('change', loadResources);
  typeFilter.addEventListener('change', loadResources);
  uploadForm.addEventListener('submit', handleUpload);

  await loadResources();

  // keep session fresh
  supabase.auth.onAuthStateChange((_event, s2) => {
    session = s2;
    role = s2?.user?.user_metadata?.role ?? 'student';
    setUploadVisibility();
  });
}

// small debounce to reduce queries while typing
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

init();
