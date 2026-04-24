// ---------- Initialize Supabase ----------
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = 'https://peexuuzunrhbimpemdwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0'; // replace with your anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const bucketName = "student-public"; // your bucket name

document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const statusText = document.getElementById("uploadStatus");
  const dropZone = document.getElementById("dropZone");

  // Drag and drop functionality
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
  });

  // Handle file upload
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const moduleCode = document.getElementById("moduleCode").value.trim();
    const fileType = document.getElementById("fileType").value.trim();
    const visibility = document.getElementById("visibility").value.trim();
    const file = fileInput.files[0];

    if (!file) {
      showStatus("⚠️ Please select a file first.", "warning");
      return;
    }

    showStatus("⏳ Uploading file...", "info");

    try {
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      const filePath = `${Date.now()}_${sanitizedFileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const fileUrl = publicData.publicUrl;

      // Add to resources grid
      addResourceToGrid({
        moduleCode,
        fileType,
        visibility,
        fileUrl,
        fileName: file.name
      });

      showStatus("✅ File uploaded successfully!", "success");
      uploadForm.reset();
    } catch (err) {
      console.error("Upload Error:", err);
      showStatus("❌ Upload failed. Please try again.", "error");
    }
  });

  // Handle resource requests
  const requestForm = document.getElementById("requestForm");
  const requestsContainer = document.getElementById("requestsContainer");

  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const request = {
      moduleCode: document.getElementById("requestModuleCode").value.trim(),
      type: document.getElementById("requestType").value,
      priority: document.getElementById("requestPriority").value,
      description: document.getElementById("requestDescription").value.trim(),
      timestamp: new Date().toISOString(),
      status: "open"
    };

    try {
      const { data, error } = await supabase
        .from('resource_requests')
        .insert([request])
        .select();

      if (error) throw error;

      addRequestToList(request);
      requestForm.reset();
      showStatus("✅ Request submitted successfully!", "success");
    } catch (err) {
      console.error("Request Error:", err);
      showStatus("❌ Failed to submit request. Please try again.", "error");
    }
  });

  // Helper function to show status messages
  function showStatus(message, type) {
    statusText.textContent = message;
    statusText.className = `upload-status show alert alert-${type}`;
    setTimeout(() => {
      statusText.classList.remove('show');
    }, 5000);
  }

  // Helper function to add resource card to grid
  function addResourceToGrid(resource) {
    const grid = document.getElementById('resourcesGrid');
    const card = document.createElement('div');
    card.className = 'resource-card animate-fade-in';
    
    const typeIcon = getFileTypeIcon(resource.fileType);
    
    card.innerHTML = `
      <div class="card">
        <div class="card-body">
          <span class="resource-type-badge">${resource.fileType}</span>
          <h5 class="card-title">
            <i class="${typeIcon} me-2"></i>${resource.fileName}
          </h5>
          <p class="card-text">Module: ${resource.moduleCode}</p>
          <a href="${resource.fileUrl}" class="btn btn-sm btn-primary" target="_blank">
            <i class="fas fa-download me-1"></i>Download
          </a>
        </div>
      </div>
    `;
    
    grid.prepend(card);
  }

  // Helper function to get file type icon
  function getFileTypeIcon(fileType) {
    const icons = {
      pdf: 'fas fa-file-pdf',
      doc: 'fas fa-file-word',
      image: 'fas fa-file-image',
      video: 'fas fa-file-video',
      interactive: 'fas fa-file-code'
    };
    return icons[fileType] || 'fas fa-file';
  }

  function addRequestToList(request) {
    const requestCard = document.createElement('div');
    requestCard.className = `request-card priority-${request.priority} animate-fade-in`;
    
    requestCard.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <h6 class="mb-1">${request.moduleCode}
          <span class="request-badge bg-${getPriorityColor(request.priority)}">
            ${request.priority.toUpperCase()}
          </span>
        </h6>
        <small class="request-meta">
          ${new Date(request.timestamp).toLocaleDateString()}
        </small>
      </div>
      <p class="mb-1">${request.description}</p>
      <small class="request-meta">
        <i class="fas fa-folder me-1"></i>${request.type}
      </small>
    `;
    
    requestsContainer.prepend(requestCard);
  }

  function getPriorityColor(priority) {
    const colors = {
      high: 'danger',
      medium: 'warning',
      low: 'info'
    };
    return colors[priority] || 'secondary';
  }

  // Load existing requests on page load
  async function loadExistingRequests() {
    try {
      const { data, error } = await supabase
        .from('resource_requests')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) throw error;

      data.forEach(request => addRequestToList(request));
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  }

  loadExistingRequests();
});
