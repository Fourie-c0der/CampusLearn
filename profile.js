const SUPABASE_URL = 'https://peexuuzunrhbimpemdwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const profileForm = document.getElementById("profileForm");
  const profilePicInput = document.getElementById("profilePicInput");
  const profileImage = document.getElementById("profileImage");

  // Get logged-in tutor’s email from localStorage
  const tutorEmail = localStorage.getItem("loggedInTutorEmail");

  if (!tutorEmail) {
    alert("No logged-in user found. Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // Fetch tutor details from Supabase
  const { data: tutor, error } = await supabase
    .from("tutor")
    .select("*")
    .eq("email", tutorEmail)
    .single();

  if (error) {
    console.error("Error fetching tutor data:", error);
    alert("Error loading profile details.");
    return;
  }

  // Populate form fields
  document.getElementById("firstName").value = tutor.first_name || "";
  document.getElementById("middleName").value = tutor.middle_name || "";
  document.getElementById("lastName").value = tutor.last_name || "";
  document.getElementById("gender").value = tutor.gender || "";
  document.getElementById("phone").value = tutor.phone || "";
  if (tutor.profile_pic) profileImage.src = tutor.profile_pic;

  // Handle profile picture preview
  profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profileImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Save updates
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedData = {
      first_name: document.getElementById("firstName").value.trim(),
      middle_name: document.getElementById("middleName").value.trim(),
      last_name: document.getElementById("lastName").value.trim(),
      gender: document.getElementById("gender").value,
      phone: document.getElementById("phone").value.trim(),
      profile_pic: profileImage.src,
    };

    if (!/^\d{11}$/.test(updatedData.phone)) {
      alert("Phone number must be 11 digits.");
      return;
    }

    const { error: updateError } = await supabase
      .from("tutor")
      .update(updatedData)
      .eq("email", tutorEmail);

    if (updateError) {
      console.error(updateError);
      alert("Error updating profile.");
    } else {
      alert("Profile updated successfully!");
    }
  });
});
