document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase;

  // --- FETCH TOP TUTORS ---
  async function fetchTopTutors() {
    // Step 1: Fetch tutors
    const { data: tutors, error: tutorError } = await supabase
      .from('students')
      .select('student_id, full_name, profile_photo')
      .eq('is_tutor', true)
      .limit(4);

    if (tutorError) {
      console.error('Error fetching tutors:', tutorError);
      return;
    }

    const tutorsContainer = document.querySelector('#clFeaturedTutors .row');
    tutorsContainer.innerHTML = ''; // Clear any existing content

    // Step 2: For each tutor, fetch details and programme
    for (let tutor of tutors) {
      const { data: details } = await supabase
        .from('tutor_details')
        .select('rating, expertise')
        .eq('student_id', tutor.student_id)
        .single();

      const { data: programmes } = await supabase
        .from('tutor_programmes')
        .select('programme_id, programmes(name)')
        .eq('student_id', tutor.student_id);

      const profilePhoto = tutor.profile_photo_url || 'https://via.placeholder.com/150';
      const expertise = details?.expertise || 'General Tutoring';
      const rating = details?.rating ? `⭐ ${details.rating.toFixed(1)}` : '';
      const programmeName = programmes?.[0]?.programmes?.name || 'Unknown Programme';

      const tutorCard = `
        <div class="col-md-3">
          <div class="card h-100">
            <img src="${profilePhoto}" class="card-img-top" alt="Tutor ${tutor.full_name}">
            <div class="card-body">
              <h5 class="card-title">${tutor.full_name}</h5>
              <p class="card-text">${programmeName}, specializing in ${expertise} ${rating}</p>
              <a href="pages/tutor-profile.html?id=${tutor.student_id}" class="btn btn-outline-primary btn-sm">View Profile</a>
            </div>
          </div>
        </div>
      `;
      tutorsContainer.insertAdjacentHTML('beforeend', tutorCard);
    }
  }

  // --- FETCH TESTIMONIALS (unchanged) ---
  async function fetchTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('content, student_id')
      .limit(3);

    if (error) {
      console.error('Error fetching testimonials:', error);
      return;
    }

    const testimonialsContainer = document.querySelector('#clTestimonials .row');
    testimonialsContainer.innerHTML = '';

    data.forEach(testimonial => {
      const testimonialCard = `
        <div class="col-md-4">
          <blockquote class="blockquote p-3 bg-light rounded">
            <p>${testimonial.content}</p>
            <footer class="blockquote-footer">
              Student ID: ${testimonial.student_id}
            </footer>
          </blockquote>
        </div>
      `;
      testimonialsContainer.insertAdjacentHTML('beforeend', testimonialCard);
    });
  }

  // Load both
  await Promise.all([fetchTopTutors(), fetchTestimonials()]);
});
