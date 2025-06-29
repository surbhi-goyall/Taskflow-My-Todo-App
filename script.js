document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  const nameInput = document.getElementById("name");
  const dobInput = document.getElementById("dob");
  const errorDiv = document.getElementById("error");

  // Auto-redirect if user already registered
  const userData = JSON.parse(localStorage.getItem("taskflowUser"));
  if (userData && userData.name && userData.dob) {
    window.location.href = "app.html";
  }

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const dob = dobInput.value;

    // Validate inputs
    if (!name || !dob) {
      showError("Please fill in all fields.");
      return;
    }

    const age = calculateAge(new Date(dob));
    if (age <= 10) {
      showError("You must be over 10 years old to continue.");
      return;
    }

    // Save user data
    const user = {
      name,
      dob,
      age
    };

    localStorage.setItem("taskflowUser", JSON.stringify(user));
    window.location.href = "app.html";
  });

  //Age calculation function
  function calculateAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  // Show error messages
  function showError(message) {
    errorDiv.textContent = message;
  }
});
