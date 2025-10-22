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

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const moduleCode = document.getElementById("moduleCode").value.trim();
    const fileType = document.getElementById("fileType").value.trim();
    const visibility = document.getElementById("visibility").value.trim();
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

      const fileUrl = publicData.publicUrl;

      statusText.textContent = `✅ File uploaded successfully! URL: ${fileUrl}`;
      console.log("Uploaded file info:", { moduleCode, fileType, visibility, fileUrl });
      uploadForm.reset();
    } catch (err) {
      console.error("Upload Error:", err);
      statusText.textContent = "❌ Upload failed. Check console.";
    }
  });
});
