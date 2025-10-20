document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://peexuuzunrhbimpemdwz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0";

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ---------- NAVBAR UPDATE ----------
  function updateNavbar(user) {
    const navbarButtons = document.querySelector(".d-flex.gap-2");
    if (!navbarButtons) return;

    // Clear existing buttons
    navbarButtons.innerHTML = '';

    // Create a single button showing the user's name
    const userBtn = document.createElement("a");
    userBtn.className = "btn btn-primary btn-sm";
    userBtn.href = "#"; // optionally link to profile/dashboard
    userBtn.textContent = user.name || user.email;

    navbarButtons.appendChild(userBtn);
  }

  // ---------- ON PAGE LOAD: CHECK IF USER IS LOGGED IN ----------
  const storedUser = localStorage.getItem("loggedInUser");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    updateNavbar(user);
  }

  // ---------- LOGIN FORM ----------
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("email").value.trim();
      const passwordInput = document.getElementById("password").value.trim();

      if (!emailInput || !passwordInput) {
        alert("Please enter both email and password.");
        return;
      }

      try {
        const TABLE_NAME = 'students'; // <-- your table
        const EMAIL_COLUMN = 'email';   // <-- email column
        const PASSWORD_COLUMN = 'password'; // <-- password column

        const { data, error } = await supabaseClient
          .from(TABLE_NAME)
          .select('*')
          .eq(EMAIL_COLUMN, emailInput)
          .eq(PASSWORD_COLUMN, passwordInput);

        if (error) {
          console.error("Database error:", error.message);
          alert("Login failed due to database error.");
        } else if (data.length === 0) {
          alert("❌ Invalid email or password.");
        } else {
          const user = data[0];
          // Save the user info in localStorage
          localStorage.setItem("loggedInUser", JSON.stringify(user));

          // Update navbar immediately
          updateNavbar(user);

          // Redirect after login
          window.location.href = "student-dashboard.html";
          localStorage.setItem("loggedInUserEmail", emailInput);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        alert("Unexpected error: " + err.message);
      }
    });
  }
});

