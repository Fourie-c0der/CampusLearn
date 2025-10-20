// assets/js/resources.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://peexuuzunrhbimpemdwz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  const moduleCode = document.getElementById("moduleCode").value;
  const fileType = document.getElementById("fileType").value;

  if (!file) {
    uploadStatus.textContent = "Please select a file to upload.";
    return;
  }

  uploadStatus.textContent = "Uploading file... ⏳";

  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    uploadStatus.textContent = "You must be logged in to upload files.";
    return;
  }

  const filePath = `student-${user.data.user.id}/${moduleCode}/${file.name}`;

  const { data, error } = await supabase.storage
    .from("student-uploads")
    .upload(filePath, file, { upsert: true });

  if (error) {
    uploadStatus.textContent = `❌ Upload failed: ${error.message}`;
  } else {
    uploadStatus.textContent = `✅ File uploaded successfully!`;
  }
});
