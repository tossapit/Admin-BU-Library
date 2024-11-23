function toggleForm(form) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (form === "register") {
    loginForm.classList.remove("block");
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    registerForm.classList.add("block");
  } else {
    registerForm.classList.remove("block");
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    loginForm.classList.add("block");
  }
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log("Login attempt");
}

function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log("Register attempt");
}
