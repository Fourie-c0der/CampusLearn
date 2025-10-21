// ==============================
// CampusLearn™ Resource Manager
// ==============================

// ✅ Define environment FIRST
window.__ENV__ = {
  SUPABASE_URL: "https://peexuuzunrhbimpemdwz.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0"
};

// ✅ Import Supabase client (ESM)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ✅ Initialize Supabase
const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.__ENV__;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase initialized:", SUPABASE_URL);

// ==============================
// Upload Form Logic
// ==============================
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");

if (!form) {
  console.error("❌ Upload form not found in DOM.");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const moduleCode = document.getElementById("moduleCode").value.trim();
    const fileType = document.getElementById("fileType").value.trim();
    const visibility = document.getElementById("visibility").value.trim();

    if (!file) {
      uploadStatus.textContent = "⚠️ Please select a file to upload.";
      return;
    }

    uploadStatus.textContent = "📤 Uploading file... please wait.";

    // Try to get user (optional, if auth exists)
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch (err) {
      console.warn("⚠️ No Supabase auth session found — continuing anonymously.");
    }

    // Choose bucket based on visibility
    const bucket = visibility === "public" ? "student-public" : "student-private";
    const filePath = `student-${userId || "guest"}/${moduleCode}/${file.name}`;

    console.log(`🪣 Uploading to bucket: ${bucket}`);
    console.log(`📂 Path: ${filePath}`);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("❌ Upload Error:", uploadError);
      uploadStatus.textContent = `❌ Upload failed: ${uploadError.message}`;
      return;
    }

    console.log("✅ File uploaded successfully:", uploadData);

    // Insert metadata into database
    const { data: insertData, error: dbError } = await supabase
      .from("learning_materials")
      .insert([
        {
          user_id: userId,
          title: file.name,
          module_code: moduleCode,
          file_path: filePath,
          file_type: fileType,
          visibility: visibility
        }
      ])
      .select();

    if (dbError) {
      console.error("⚠️ Database Insert Error:", dbError);
      uploadStatus.textContent = `⚠️ File stored but DB insert failed: ${dbError.message}`;
      return;
    }

    console.log("✅ Database insert success:", insertData);
    uploadStatus.textContent = `✅ File uploaded and saved to ${visibility.toUpperCase()} storage successfully.`;
    form.reset();
  });
}
