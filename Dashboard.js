document.addEventListener("DOMContentLoaded", async () => {
      // ✅ ENV VALUES (these come from your .env file)
      const SUPABASE_URL = "https://peexuuzunrhbimpemdwz.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0";

      // ✅ Initialize Supabase
      const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // ✅ Check login
      const email = localStorage.getItem("loggedInUserEmail");
      if (!email) {
        window.location.href = "login.html";
        return;
      }

      try {
        // ✅ Query Supabase using email
        const { data, error } = await supabase
          .from("students")
          .select("full_name, programme")
          .eq("email", email)
          .single();

        if (error) {
          console.error("Error fetching student:", error.message);
          return;
        }

        if (data) {
          // ✅ Update Welcome heading
          document.querySelector("h1.h4").textContent = `Welcome, ${data.full_name}`;

          // ✅ Update profile card
          document.querySelector("#clProfileSummary .card-body").innerHTML = `
            <h5 class="card-title">Profile Summary</h5>
            <p><strong>Name:</strong> ${data.full_name}</p>
            <p><strong>Program:</strong> ${data.programme}</p>
            <p><strong>Email:</strong> ${email}</p>
            <a href="profile.html" class="btn btn-outline-primary btn-sm">Edit Profile</a>
          `;
        }
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    });