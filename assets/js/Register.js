// ---------- GLOBAL SUPABASE CLIENT ----------
const SUPABASE_URL = 'https://peexuuzunrhbimpemdwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ---------- FORM VALUES ----------
    const textInputs = form.querySelectorAll('input[type="text"]');
    const firstName = textInputs[0].value.trim();
    const lastName = textInputs[1].value.trim();

    const email = form.querySelector('input[type="email"]').value.trim();
    const programme = form.querySelector('select').value;

    const passwordInputs = form.querySelectorAll('input[type="password"]');
    const password = passwordInputs[0].value;
    const confirmPassword = passwordInputs[1].value;

    // ---------- VALIDATION ----------
    if (!email.endsWith('@belgiumcampus.ac.za')) {
      alert('Please use a valid Belgium Campus email address.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      // ---------- INSERT INTO STUDENTS TABLE ----------
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            full_name: `${firstName} ${lastName}`,
            email: email,
            programme: programme,
            password: password, 
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Database error:', error.message);
        alert('Registration failed: ' + error.message);
      } else {
        console.log('User registered:', data);
        alert('✅ Registration successful! Redirecting to login...');
        window.location.href = 'login.html';
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Unexpected error: ' + err.message);
    }
  });
});
