const SUPABASE_URL = 'https://peexuuzunrhbimpemdwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // same as before
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const loggedInEmail = localStorage.getItem("loggedInStudentEmail");

  // Navbar cleanup (hide login/register if logged in)
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutLink = document.getElementById("logoutLink");

  if (loginLink && registerLink && logoutLink) {
    if (loggedInEmail) {
      loginLink.style.display = "none";
      registerLink.style.display = "none";
      logoutLink.classList.remove("d-none");

      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedInStudentEmail");
        alert("You’ve been logged out.");
        window.location.href = "login.html";
      });
    } else {
      logoutLink.classList.add("d-none");
    }
  }

  // Only fetch details if a user is logged in
  if (loggedInEmail) {
    try {
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", loggedInEmail)
        .single();

      if (error) throw error;

      // Fill profile form with data
      document.getElementById("firstName").value = student.first_name || "";
      document.getElementById("middleName").value = student.middle_name || "";
      document.getElementById("lastName").value = student.last_name || "";
      document.getElementById("gender").value = student.gender || "";
      document.getElementById("phone").value = student.phone || "";
      document.getElementById("profileImage").src = student.profile_pic || "../assets/images/default-avatar.png";

      console.log(`Profile loaded for ${loggedInEmail}`);
    } catch (err) {
      console.error("Error fetching student profile:", err);
    }
  } else {
    console.warn("No logged-in user detected — showing empty profile.");
  }

  // Handle profile picture change
  const profilePicInput = document.getElementById("profilePicInput");
  if (profilePicInput) {
    profilePicInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          document.getElementById("profileImage").src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Save updated info to Supabase
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!loggedInEmail) {
        alert("No logged-in user found. Please log in first.");
        return;
      }

      const updates = {
        first_name: document.getElementById("firstName").value.trim(),
        middle_name: document.getElementById("middleName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
        gender: document.getElementById("gender").value,
        phone: document.getElementById("phone").value.trim(),
        profile_pic: document.getElementById("profileImage").src
      };

      const { error: updateError } = await supabase
        .from("students")
        .update(updates)
        .eq("email", loggedInEmail);

      if (updateError) {
        console.error(updateError);
        alert("Error updating profile.");
      } else {
        alert("Profile updated successfully!");
      }
    });
  }
});
