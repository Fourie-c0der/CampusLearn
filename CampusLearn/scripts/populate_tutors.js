// Script to populate the 'tutors' table with data from 'students', 'tutor_details', and 'tutor_programmes' tables
// Run this script in the browser console on index.html or execute it in a Node.js environment with Supabase setup

(async () => {
  const supabase = window.supabase; // Assuming supabase is available globally

  try {
    // Fetch all students who are tutors
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('student_id, full_name, email, profile_photo')
      .eq('is_tutor', true);

    if (studentError) {
      console.error('Error fetching students:', studentError);
      return;
    }

    console.log(`Found ${students.length} tutors to add.`);

    for (const student of students) {
      // Fetch tutor details
      const { data: details } = await supabase
        .from('tutor_details')
        .select('rating, expertise')
        .eq('student_id', student.student_id)
        .single();

      // Fetch programmes
      const { data: programmes } = await supabase
        .from('tutor_programmes')
        .select('programme_id, programmes(name)')
        .eq('student_id', student.student_id);

      // Prepare data for tutors table
      const programe = programmes?.[0]?.programmes?.name || 'Unknown Programme';
      const modules = programmes?.map(p => p.programmes.name).join(', ') || 'No modules listed';
      const phone_number = 'N/A'; // Not available in current tables, set to N/A

      const tutorData = {
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        programe: programe,
        phone_number: phone_number,
        modules: modules,
        profile_photo: student.profile_photo || null
      };

      // Insert into tutors table
      const { error: insertError } = await supabase
        .from('tutors')
        .insert(tutorData);

      if (insertError) {
        console.error(`Error inserting tutor ${student.full_name}:`, insertError);
      } else {
        console.log(`Inserted tutor: ${student.full_name}`);
      }
    }

    console.log('Population complete.');
  } catch (error) {
    console.error('Error in populate_tutors:', error);
  }
})();
