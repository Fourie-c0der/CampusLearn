document.addEventListener('DOMContentLoaded', async () => {
  const { supabase } = window;

  // Hardcoded studentId for testing
  const studentId = 52;

  // Fetch student profile
  async function fetchProfile() {
    try {
      // 1️⃣ Fetch main student info
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('student_id, full_name, profile_photo, is_tutor, programme_id')
        .eq('student_id', studentId)
        .single();

      if (studentError || !studentData) {
        console.error('Error fetching student:', studentError);
        document.querySelector('#clProfileSummary .card-body').innerHTML = '<p>Error loading profile.</p>';
        return;
      }

      // 2️⃣ Fetch main programme name
      let programmeName = 'Unknown Programme';
      if (studentData.programme_id) {
        const { data: progData } = await supabase
          .from('programmes')
          .select('name')
          .eq('programme_id', studentData.programme_id)
          .single();
        programmeName = progData?.name || 'Unknown Programme';
      }

      // 3️⃣ Fetch tutor programmes if the student is a tutor
      let tutoredProgrammes = 'None';
      if (studentData.is_tutor) {
        const { data: tutorProgs } = await supabase
          .from('tutor_programmes')
          .select('programmes(name)')
          .eq('student_id', studentId);

        tutoredProgrammes = tutorProgs?.map(p => p.programmes?.name).filter(Boolean).join(', ') || 'None';
      }

      // 4️⃣ Render profile
      const profileContainer = document.querySelector('#clProfileSummary .card-body');
      const profilePhoto = studentData.profile_photo || 'https://via.placeholder.com/80';
      profileContainer.innerHTML = `
        <img src="${profilePhoto}" class="avatar" alt="Profile Avatar">
        <h5 class="card-title">Profile Summary</h5>
        <p><strong>Name:</strong> ${studentData.full_name}</p>
        <p><strong>Main Programme:</strong> ${programmeName}</p>
        ${studentData.is_tutor ? `
          <p><strong>Tutor Programmes:</strong> ${tutoredProgrammes}</p>
        ` : ''}
        <a href="profile.html" class="btn btn-outline-primary btn-sm">Edit Profile</a>
      `;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  }

  // Fetch marks
  async function fetchMarks() {
    try {
      const { data, error } = await supabase
        .from('marks')
        .select('module_id, mark, assessment_type, assessment_date, modules(module_code, name)')
        .eq('student_id', studentId)
        .order('assessment_date', { ascending: false });

      if (error) {
        console.error('Error fetching marks:', error);
        document.querySelector('#clProgressTracker .card-body').innerHTML = '<p>Error loading marks.</p>';
        return;
      }

      const progressContainer = document.querySelector('#clProgressTracker .card-body');
      if (!data || data.length === 0) {
        progressContainer.innerHTML = '<p>No marks available.</p>';
        return;
      }

      const moduleProgress = {};
      data.forEach(mark => {
        const moduleCode = mark.modules?.module_code || 'Unknown';
        const moduleName = mark.modules?.name || 'Unknown Module';
        const key = `${moduleCode}: ${moduleName}`;
        if (!moduleProgress[key]) {
          moduleProgress[key] = { marks: [], total: 0, count: 0 };
        }
        moduleProgress[key].marks.push({
          type: mark.assessment_type,
          mark: mark.mark,
          date: new Date(mark.assessment_date).toLocaleDateString('en-ZA')
        });
        moduleProgress[key].total += mark.mark;
        moduleProgress[key].count += 1;
      });

      progressContainer.innerHTML = `
        <h6>Module Marks</h6>
        ${Object.entries(moduleProgress).map(([module, { marks, total, count }]) => {
          const avg = (total / count).toFixed(1);
          const width = Math.min(avg, 100);
          const barClass = avg >= 70 ? 'bg-success' : avg >= 50 ? 'bg-info' : 'bg-warning';
          return `
            <h6 class="mt-3">${module}</h6>
            <div class="progress mb-2">
              <div class="progress-bar ${barClass}" role="progressbar" style="width: ${width}%;" 
                   aria-valuenow="${avg}" aria-valuemin="0" aria-valuemax="100">${avg}%</div>
            </div>
            <ul class="list-group list-group-flush small">
              ${marks.map(m => `<li class="list-group-item py-1">${m.type}: ${m.mark}% (Date: ${m.date})</li>`).join('')}
            </ul>
          `;
        }).join('')}
      `;
    } catch (err) {
      console.error('Unexpected error fetching marks:', err);
    }
  }

  // Fetch upcoming sessions
  async function fetchSessions() {
    try {
      const { data, error } = await supabase
        .from('tutoring_sessions')
        .select(`
          session_id,
          session_date,
          platform,
          modules(module_code, name),
          tutor:students!tutor_id(full_name)
        `)
        .or(`student_id.eq.${studentId},tutor_id.eq.${studentId}`)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        document.querySelector('#clUpcomingSessions .list-group').innerHTML = '<p>Error loading sessions.</p>';
        return;
      }

      const sessionsContainer = document.querySelector('#clUpcomingSessions .list-group');
      sessionsContainer.innerHTML = data.length === 0 ? '<p>No upcoming sessions.</p>' : '';

      data.forEach(session => {
        const tutorName = session.tutor?.full_name || 'Unknown Tutor';
        const moduleCode = session.modules?.module_code || 'Unknown';
        const moduleName = session.modules?.name || 'Unknown Module';
        const sessionDate = new Date(session.session_date).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
        sessionsContainer.insertAdjacentHTML('beforeend', `
          <div class="list-group-item">
            <h6 class="mb-1">${moduleCode}: ${moduleName}</h6>
            <p class="mb-1 small">Tutor: ${tutorName} | Date: ${sessionDate} | Platform: ${session.platform}</p>
            <a href="session-detail.html?id=${session.session_id}" class="btn btn-outline-primary btn-sm">Join Session</a>
          </div>
        `);
      });
    } catch (err) {
      console.error('Unexpected error fetching sessions:', err);
    }
  }

  // Fetch resources
  async function fetchResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('resource_id, title, description, url, modules(module_code, name)')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching resources:', error);
        document.querySelector('#clRecommendedResources .row').innerHTML = '<p>Error loading resources.</p>';
        return;
      }

      const resourcesContainer = document.querySelector('#clRecommendedResources .row');
      resourcesContainer.innerHTML = data.length === 0 ? '<p>No resources available.</p>' : '';

      data.forEach(resource => {
        const moduleCode = resource.modules?.module_code || 'Unknown';
        const moduleName = resource.modules?.name || 'Unknown Module';
        resourcesContainer.insertAdjacentHTML('beforeend', `
          <div class="col-md-4">
            <div class="card h-100">
              <img src="${resource.url}" class="card-img-top" alt="${resource.title}">
              <div class="card-body">
                <h5 class="card-title">${resource.title}</h5>
                <p class="card-text">${resource.description} (${moduleCode}: ${moduleName})</p>
                <a href="resource.html?id=${resource.resource_id}" class="btn btn-outline-secondary btn-sm">View Resource</a>
              </div>
            </div>
          </div>
        `);
      });
    } catch (err) {
      console.error('Unexpected error fetching resources:', err);
    }
  }

  // Fetch tutor responses
async function fetchTutorResponses() {
  try {
    const { data, error } = await supabase
      .from('tutor_responses')
      .select(`
        content,
        response_date,
        tutor:students!tutor_id(full_name)
      `)
      .eq('student_id', studentId)
      .order('response_date', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching tutor responses:', error);
      document.querySelector('#clTutorResponses .list-group').innerHTML = '<p>Error loading tutor responses.</p>';
      return;
    }

    const container = document.querySelector('#clTutorResponses .list-group');
    container.innerHTML = data.length === 0 ? '<p>No tutor responses yet.</p>' : '';

    data.forEach(resp => {
      const tutorName = resp.tutor?.full_name || 'Unknown Tutor';
      const date = new Date(resp.response_date).toLocaleDateString('en-ZA', { dateStyle: 'medium' });
      container.insertAdjacentHTML('beforeend', `
        <div class="list-group-item">
          <p>${resp.content}</p>
          <small class="text-muted">Tutor: ${tutorName} | Date: ${date}</small>
        </div>
      `);
    });
  } catch (err) {
    console.error('Unexpected error fetching tutor responses:', err);
  }
}

// Fetch recommended resources
async function fetchRecommendedResources() {
  try {
    const { data, error } = await supabase
    .from('resources')
    .select(`
      resource_id,
      title,
      description,
      url,
      modules!resources_module_id_fkey(module_code, name)
    `)
    .order('created_at', { ascending: false })
    .limit(3);

    if (error) {
      console.error('Error fetching recommended resources:', error);
      document.querySelector('#clRecommendedResources .row').innerHTML = '<p>Error loading resources.</p>';
      return;
    }

    const container = document.querySelector('#clRecommendedResources .row');
    container.innerHTML = data.length === 0 ? '<p>No resources available.</p>' : '';

    data.forEach(resource => {
      const moduleCode = resource.modules?.module_code || 'Unknown';
      const moduleName = resource.modules?.name || 'Unknown Module';
      const resourceUrl = resource.url || 'https://via.placeholder.com/150';

      container.insertAdjacentHTML('beforeend', `
        <div class="col-md-4">
          <div class="card h-100">
            <img src="${resourceUrl}" class="card-img-top" alt="${resource.title}">
            <div class="card-body">
              <h5 class="card-title">${resource.title}</h5>
              <p class="card-text">${resource.description} (${moduleCode}: ${moduleName})</p>
              <a href="resource.html?id=${resource.resource_id}" class="btn btn-outline-secondary btn-sm">View Resource</a>
            </div>
          </div>
        </div>
      `);
    });
  } catch (err) {
    console.error('Unexpected error fetching recommended resources:', err);
  }
}



  // Load all content concurrently
  await Promise.all([fetchProfile(), fetchMarks(), fetchSessions(), fetchResources() , fetchTutorResponses(), fetchRecommendedResources()]);
});
