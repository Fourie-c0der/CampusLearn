// nav.js - Complete Navigation Handler
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = localStorage.getItem('currentUser');
  const storedUser = localStorage.getItem("loggedInUser");
  const isLoggedIn = !!(currentUser || storedUser);

  // ========== UPDATE BRAND LINK TO DASHBOARD ==========
  const brandLinks = document.querySelectorAll('.navbar-brand');
  brandLinks.forEach(brandLink => {
    if (isLoggedIn) {
      // User is logged in - link to dashboard
      brandLink.href = 'student-dashboard.html';
      console.log('✅ Brand link updated to dashboard for logged-in user');
    } else {
      // User is not logged in - link to topics or index
      const currentPath = window.location.pathname;
      if (currentPath.includes('/pages/')) {
        brandLink.href = 'topics.html';
      } else {
        brandLink.href = '../index.html';
      }
      console.log('ℹ️ Brand link set for logged-out user');
    }
  });

  // ========== UPDATE NAVIGATION BUTTONS ==========
  const navRight = document.querySelector(".navbar .d-flex");
  
  if (navRight && storedUser) {
    const user = JSON.parse(storedUser);
    const fullName = user.full_name || user.name || user.email || "Profile";

    // Clear existing buttons
    navRight.innerHTML = "";

    // Create profile dropdown container
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";

    // Profile button
    const profileBtn = document.createElement("a");
    profileBtn.href = "#";
    profileBtn.className = "btn btn-outline-primary btn-sm dropdown-toggle";
    profileBtn.textContent = fullName;
    profileBtn.setAttribute("role", "button");
    profileBtn.setAttribute("data-bs-toggle", "dropdown");
    profileBtn.setAttribute("aria-expanded", "false");

    // Dropdown menu
    const menu = document.createElement("ul");
    menu.className = "dropdown-menu dropdown-menu-end";
    menu.innerHTML = `
      <li><a class="dropdown-item" href="profile.html">View Profile</a></li>
      <li><a class="dropdown-item" href="student-dashboard.html">Dashboard</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item" href="#" id="logoutBtn">Log out</a></li>
    `;

    dropdown.appendChild(profileBtn);
    dropdown.appendChild(menu);
    navRight.appendChild(dropdown);

    // Logout functionality
    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("currentUser");
      
      // Redirect to login page
      window.location.href = "login.html";
    });

    console.log('👤 User is logged in:', fullName);
  } else if (navRight && !storedUser) {
    // User is not logged in - show default login/register buttons
    console.log('🔓 No user logged in - showing login buttons');
  }
});

// Export utility function to check login status
window.checkLoginStatus = () => {
  return !!(localStorage.getItem('currentUser') || localStorage.getItem('loggedInUser'));
};

// Export utility function to get current user
window.getCurrentUser = () => {
  const storedUser = localStorage.getItem('loggedInUser');
  const currentUser = localStorage.getItem('currentUser');
  
  if (storedUser) {
    return JSON.parse(storedUser);
  } else if (currentUser) {
    return { email: currentUser };
  }
  return null;
};