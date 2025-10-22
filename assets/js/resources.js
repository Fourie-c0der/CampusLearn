// ---------- Initialize Supabase ----------
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = 'https://peexuuzunrhbimpemdwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0'; // replace with your anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const linkInput = document.getElementById("linkInput");
  const statusText = document.getElementById("uploadStatus");
  const resourceContainer = document.getElementById("resourceContainer");
  const fileTypeSelect = document.getElementById("fileType");
  const fileInputContainer = document.getElementById("fileInputContainer");
  const linkInputContainer = document.getElementById("linkInputContainer");

  // Toggle input fields based on file type
  fileTypeSelect.addEventListener("change", () => {
    if (fileTypeSelect.value === "link") {
      fileInputContainer.classList.add("d-none");
      linkInputContainer.classList.remove("d-none");
      fileInput.required = false;
      linkInput.required = true;
    } else {
      fileInputContainer.classList.remove("d-none");
      linkInputContainer.classList.add("d-none");
      fileInput.required = true;
      linkInput.required = false;
    }
  });

  // Load existing resources
  loadResources();

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const moduleCode = document.getElementById("moduleCode").value.trim();
    const fileType = document.getElementById("fileType").value.trim();
    const visibility = document.getElementById("visibility").value.trim();
    const bucketName = visibility === "public" ? "student-public" : "student-private";

    let fileUrl = "";

    if (fileType === "link") {
      const link = linkInput.value.trim();
      if (!link) {
        statusText.textContent = "⚠️ Please enter a link.";
        return;
      }
      fileUrl = link;
      // Store link in localStorage
      const links = JSON.parse(localStorage.getItem('submittedLinks') || '[]');
      links.push({ moduleCode, fileType, visibility, url: fileUrl, name: fileUrl, bucket: null });
      localStorage.setItem('submittedLinks', JSON.stringify(links));
      statusText.textContent = `✅ Link submitted successfully! URL: ${fileUrl}`;
      console.log("Submitted link info:", { moduleCode, fileType, visibility, fileUrl });
      uploadForm.reset();
      loadResources(); // Reload resources after submission
      return;
    }

    const file = fileInput.files[0];
    if (!file) {
      statusText.textContent = "⚠️ Please select a file first.";
      return;
    }

    statusText.textContent = "⏳ Uploading file...";

    try {
      // Sanitize file name (remove special chars)
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      const filePath = `${Date.now()}_${sanitizedFileName}`;

      // Upload to bucket
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      fileUrl = publicData.publicUrl;

      statusText.textContent = `✅ File uploaded successfully! URL: ${fileUrl}`;
      console.log("Uploaded file info:", { moduleCode, fileType, visibility, fileUrl });
      uploadForm.reset();
      loadResources(); // Reload resources after upload
    } catch (err) {
      console.error("Upload Error:", err);
      statusText.textContent = "❌ Upload failed. Check console.";
    }
  });

  async function loadResources() {
    resourceContainer.innerHTML = "<p>Loading resources...</p>";

    try {
      // Load public resources
      const { data: publicFiles, error: publicError } = await supabase.storage
        .from("student-public")
        .list("", { limit: 100 });

      if (publicError) throw publicError;

      // Load private resources (assuming user is authenticated, but for demo, show all)
      const { data: privateFiles, error: privateError } = await supabase.storage
        .from("student-private")
        .list("", { limit: 100 });

      if (privateError) throw privateError;

      // Load submitted links from localStorage
      const submittedLinks = JSON.parse(localStorage.getItem('submittedLinks') || '[]');

      const allFiles = [
        ...publicFiles.map(file => ({ ...file, bucket: "student-public", visibility: "public" })),
        ...privateFiles.map(file => ({ ...file, bucket: "student-private", visibility: "private" })),
        ...submittedLinks.map(link => ({ name: link.name, url: link.url, visibility: link.visibility, bucket: null, fileType: 'Link' }))
      ];

      if (allFiles.length === 0) {
        resourceContainer.innerHTML = "<p>No resources available.</p>";
        return;
      }

      resourceContainer.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Visibility</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="resourceTableBody">
          </tbody>
        </table>
      `;

      const tableBody = document.getElementById("resourceTableBody");
      allFiles.forEach(file => {
        let fileUrl = file.url;
        if (file.bucket) {
          const { data: publicData } = supabase.storage
            .from(file.bucket)
            .getPublicUrl(file.name);
          fileUrl = publicData.publicUrl;
        }

        const fileType = file.fileType || getFileType(file.name);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td><a href="${fileUrl}" target="_blank">${file.name}</a></td>
          <td>${fileType}</td>
          <td>${file.visibility}</td>
          <td><a href="${fileUrl}" target="_blank" class="btn btn-primary btn-sm">View</a></td>
        `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading resources:", err);
      resourceContainer.innerHTML = "<p>Error loading resources.</p>";
    }
  }

  function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'PDF';
    if (['mp4', 'avi', 'mov'].includes(ext)) return 'Video';
    if (['html', 'htm'].includes(ext)) return 'Interactive';
    return 'File';
  }
});
