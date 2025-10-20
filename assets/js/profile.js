document.addEventListener("DOMContentLoaded", () => {
  const profilePicInput = document.getElementById("profilePicInput");
  const profileImage = document.getElementById("profileImage");
  const profileForm = document.getElementById("profileForm");

  // Show preview of uploaded picture
  profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profileImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Save profile info
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      firstName: document.getElementById("firstName").value.trim(),
      middleName: document.getElementById("middleName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      gender: document.getElementById("gender").value,
      phone: document.getElementById("phone").value.trim(),
      profilePic: profileImage.src,
    };

    if (!/^\d{11}$/.test(data.phone)) {
      alert("Phone number must be 11 digits.");
      return;
    }

    localStorage.setItem("tutorProfile", JSON.stringify(data));
    alert("Profile updated successfully!");
  });

  // Load saved data if available
  const saved = localStorage.getItem("tutorProfile");
  if (saved) {
    const data = JSON.parse(saved);
    document.getElementById("firstName").value = data.firstName || "";
    document.getElementById("middleName").value = data.middleName || "";
    document.getElementById("lastName").value = data.lastName || "";
    document.getElementById("gender").value = data.gender || "";
    document.getElementById("phone").value = data.phone || "";
    profileImage.src = data.profilePic || "../assets/images/default-avatar.png";
  }
});
