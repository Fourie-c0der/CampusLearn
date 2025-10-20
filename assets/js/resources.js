// assets/js/resources.js

const supabaseUrl = 'your-supabase-url';
const supabaseAnonKey = 'your-supabase-anon-key';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

const container = document.getElementById('resourceContainer');
const searchInput = document.getElementById('searchInput');
const moduleFilter = document.getElementById('moduleFilter');
const typeFilter = document.getElementById('typeFilter');
const uploadForm = document.getElementById('uploadForm');

// Example placeholder data (replace with Supabase fetch later)
let resources = [
  { title: 'DB101 - SQL Joins', module: 'DB101', type: 'pdf', url: '#', uploader: 'Tutor1' },
  { title: 'SE202 - UML Diagrams', module: 'SE202', type: 'video', url: '#', uploader: 'Tutor2' },
  { title: 'AI401 - Neural Networks', module: 'AI401', type: 'link', url: '#', uploader: 'Tutor3' },
];

// Render cards
function renderResources(list) {
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = `<p class="text-muted text-center mt-5">No resources found 😢</p>`;
    return;
  }
  list.forEach(r => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card shadow-sm border-0 h-100">
        <div class="card-body">
          <h5 class="card-title">${r.title}</h5>
          <p class="card-text small text-muted mb-1"><strong>Module:</strong> ${r.module}</p>
          <p class="card-text small text-muted"><strong>Type:</strong> ${r.type.toUpperCase()}</p>
          <a href="${r.url}" class="btn btn-outline-primary btn-sm mt-2" target="_blank">Open</a>
        </div>
        <div class="card-footer text-muted small">
          Uploaded by ${r.uploader}
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

// Apply filters
function filterResources() {
  const query = searchInput.value.toLowerCase();
  const moduleVal = moduleFilter.value;
  const typeVal = typeFilter.value;

  const filtered = resources.filter(r =>
    (!moduleVal || r.module === moduleVal) &&
    (!typeVal || r.type === typeVal) &&
    r.title.toLowerCase().includes(query)
  );
  renderResources(filtered);
}

// Event listeners
searchInput.addEventListener('input', filterResources);
moduleFilter.addEventListener('change', filterResources);
typeFilter.addEventListener('change', filterResources);

// Upload form (placeholder)
uploadForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('titleInput').value;
  const type = document.getElementById('typeInput').value;
  const url = document.getElementById('urlInput').value;

  const newResource = { title, type, url, module: 'N/A', uploader: 'You' };
  resources.push(newResource);
  renderResources(resources);
  uploadForm.reset();
  alert('Resource uploaded successfully ✅ (demo only)');
});

renderResources(resources);
