// 1️⃣ Import Supabase client for Node.js
const { createClient } = require('@supabase/supabase-js');

// 2️⃣ Initialize Supabase client
const supabaseUrl = 'https://peexuuzunrhbimpemdwz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZXh1dXp1bnJoYmltcGVtZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzk3MjYsImV4cCI6MjA3NTcxNTcyNn0.sOOZfxsQvBF35vijxgO3K5nedKww0fyWKBXiebyfAB0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3️⃣ Function to check if a student exists
async function checkStudent(name) {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('full_name', name);

    if (error) {
        console.error('Error querying database:', error.message);
    } else if (data.length > 0) {
        console.log(`Student "${name}" exists in the database:`, data);
    } else {
        console.log(`Student "${name}" was not found in the database.`);
    }
}

// 4️⃣ Test the function
(async () => {
    await checkStudent('Sipho Dlamini');
    await checkStudent('Nonexistent Name');
})();
