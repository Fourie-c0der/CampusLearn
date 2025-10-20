// nav.js
document.addEventListener("DOMContentLoaded", () => {
  const navRight = document.querySelector(".navbar .d-flex");
  const storedUser = localStorage.getItem("loggedInUser");

  if (storedUser) {
    const user = JSON.parse(storedUser);
    const fullName = user.full_name || "Profile";

    // Clear existing buttons
    navRight.innerHTML = "";

    // Create profile dropdown container
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";

    // Profile button
    const profileBtn = document.createElement("a");
    profileBtn.href = "pages/profile.html";
    profileBtn.className = "btn btn-outline-primary btn-sm dropdown-toggle";
    profileBtn.textContent = fullName;
    profileBtn.setAttribute("role", "button");
    profileBtn.setAttribute("data-bs-toggle", "dropdown");
    profileBtn.setAttribute("aria-expanded", "false");

    // Dropdown menu (optional: add logout later)
    const menu = document.createElement("ul");
    menu.className = "dropdown-menu dropdown-menu-end";
    menu.innerHTML = `
      <li><a class="dropdown-item" href="profile.html">View Profile</a></li>
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
      window.location.reload(); // Refresh to show Log in / Register again
    });
  }
});
