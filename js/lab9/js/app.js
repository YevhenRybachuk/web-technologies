document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".form")
      .forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

document.querySelectorAll(".toggle").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.textContent = isPassword ? "🔒" : "🔓";
  });
});

function getErrorElement(input) {
  const parent = input.closest(".password-box") || input;
  let el = parent.nextElementSibling;
  while (el && el.classList.contains("hint")) {
    el = el.nextElementSibling;
  }
  return el && el.classList.contains("error") ? el : null;
}

function setError(input, message) {
  input.classList.add("invalid");
  input.classList.remove("valid");
  const errEl = getErrorElement(input);
  if (errEl) errEl.textContent = message;
}

function setSuccess(input) {
  input.classList.remove("invalid");
  const errEl = getErrorElement(input);
  if (errEl) errEl.textContent = "";
  if (input.value.trim() !== "") {
    input.classList.add("valid");
  } else {
    input.classList.remove("valid");
  }
}

function clearValidation(form) {
  form.querySelectorAll(".valid, .invalid").forEach((el) => {
    el.classList.remove("valid", "invalid");
  });
  form.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+380\d{9}$/;

document.getElementById("register").addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  const firstName = document.getElementById("firstName");
  if (firstName.value.trim().length < 3 || firstName.value.trim().length > 15) {
    setError(firstName, "3-15 symbols");
    valid = false;
  } else {
    setSuccess(firstName);
  }

  const lastName = document.getElementById("lastName");
  if (lastName.value.trim().length < 2 || lastName.value.trim().length > 20) {
    setError(lastName, "2-20 symbols");
    valid = false;
  } else {
    setSuccess(lastName);
  }

  const email = document.getElementById("regEmail");
  if (!emailRegex.test(email.value.trim())) {
    setError(email, "Invalid email");
    valid = false;
  } else {
    setSuccess(email);
  }

  const password = document.getElementById("regPassword");
  if (password.value.length < 6) {
    setError(password, "Min 6 symbols");
    valid = false;
  } else {
    setSuccess(password);
  }

  const confirm = document.getElementById("confirmPassword");
  if (confirm.value === "") {
    setError(confirm, "Required");
    valid = false;
  } else if (confirm.value !== password.value) {
    setError(confirm, "Passwords do not match");
    valid = false;
  } else {
    setSuccess(confirm);
  }

  const phone = document.getElementById("phone");
  if (!phoneRegex.test(phone.value.trim())) {
    setError(phone, "Invalid phone (+380XXXXXXXXX)");
    valid = false;
  } else {
    setSuccess(phone);
  }

  const birthInput = document.getElementById("birth");
  if (birthInput.value === "") {
    setError(birthInput, "Required");
    valid = false;
  } else {
    const birthDate = new Date(birthInput.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (age < 12 || isNaN(age)) {
      setError(birthInput, "You must be at least 12 years old");
      valid = false;
    } else {
      setSuccess(birthInput);
    }
  }

  if (valid) {
    alert("Registration successful!");
    e.target.reset();
    clearValidation(e.target);
  }
});

document.getElementById("login").addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  const username = document.getElementById("loginUsername");
  if (username.value.trim() === "") {
    setError(username, "Username is required");
    valid = false;
  } else {
    setSuccess(username);
  }

  const password = document.getElementById("loginPassword");
  if (password.value.length < 6) {
    setError(password, "Min 6 symbols");
    valid = false;
  } else {
    setSuccess(password);
  }

  if (valid) {
    alert("Login success");
    e.target.reset();
    clearValidation(e.target);
  }
});

const cities = {
  ua: ["Kyiv", "Lviv", "Chernivtsi", "Odesa", "Kharkiv", "Dnipro"],
  pl: ["Warsaw", "Krakow", "Gdansk", "Wroclaw", "Poznan"],
  de: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"],
  fr: ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"],
  us: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  gb: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow"],
};

document.getElementById("country").addEventListener("change", function () {
  const citySelect = document.getElementById("city");
  citySelect.innerHTML = '<option value="">City</option>';

  if (this.value && cities[this.value]) {
    citySelect.disabled = false;
    cities[this.value].forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city.toLowerCase().replace(/\s+/g, "-");
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  } else {
    citySelect.disabled = true;
  }
});
