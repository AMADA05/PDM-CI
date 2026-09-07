// ==========================================================
// PDM-CI — AUTHENTIFICATION CONNECTÉE À POSTGRESQL
// ==========================================================

const API_AUTH_URL = "http://localhost:5000/api/auth";

const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const goRegister = document.getElementById("go-register");
const goLogin = document.getElementById("go-login");
const authMessage = document.getElementById("auth-message");

// ==========================================================
// BASCULEMENT DES FORMULAIRES
// ==========================================================

function showLogin() {
  loginTab?.classList.add("active");
  registerTab?.classList.remove("active");
  loginForm?.classList.add("active");
  registerForm?.classList.remove("active");
  clearMessage();
}

function showRegister() {
  registerTab?.classList.add("active");
  loginTab?.classList.remove("active");
  registerForm?.classList.add("active");
  loginForm?.classList.remove("active");
  clearMessage();
}

loginTab?.addEventListener("click", showLogin);
registerTab?.addEventListener("click", showRegister);
goRegister?.addEventListener("click", showRegister);
goLogin?.addEventListener("click", showLogin);

// ==========================================================
// AFFICHER / MASQUER MOT DE PASSE
// ==========================================================

document.querySelectorAll(".toggle-password").forEach(button => {
  button.addEventListener("click", function () {
    const target = document.getElementById(this.dataset.target);
    if (!target) return;

    if (target.type === "password") {
      target.type = "text";
      this.textContent = "Masquer";
    } else {
      target.type = "password";
      this.textContent = "Afficher";
    }
  });
});

// ==========================================================
// AFFICHER UN MESSAGE
// ==========================================================

function showMessage(message, type = "error") {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

function clearMessage() {
  if (!authMessage) return;
  authMessage.textContent = "";
  authMessage.className = "auth-message";
}

// ==========================================================
// CONNEXION
// ==========================================================

loginForm?.addEventListener("submit", async function (event) {
  event.preventDefault();

  const identifier = document.getElementById("login-identifier")?.value.trim();
  const password = document.getElementById("login-password")?.value;

  if (!identifier || !password) {
    showMessage("Veuillez remplir tous les champs de connexion.", "error");
    return;
  }

  try {
    showMessage("Connexion en cours...", "success");

    const response = await fetch(`${API_AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: identifier.toLowerCase(),
        mot_de_passe: password
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.erreur || data.message || "Identifiants incorrects.", "error");
      return;
    }

    const user = data.utilisateur || data.user;

    // Stockage de la session active
    localStorage.setItem("pdm_token", data.token);
    localStorage.setItem("pdm_user", JSON.stringify(user));

    showMessage("Connexion réussie ! Redirection...", "success");

    setTimeout(() => {
      // Redirection si admin ou utilisateur standard
      if (user?.email === "admin@pdmci.com" || user?.role === "administrateur" || user?.role === "admin") {
        window.location.href = "administration.html";
      } else {
        window.location.href = "../index.html";
      }
    }, 600);

  } catch (error) {
    console.error("Erreur de connexion :", error);
    showMessage("Impossible de se connecter au serveur backend PDM-CI.", "error");
  }
});

// ==========================================================
// INSCRIPTION
// ==========================================================

registerForm?.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nom = document.getElementById("register-nom")?.value.trim();
  const prenom = document.getElementById("register-prenom")?.value.trim();
  const telephone = document.getElementById("register-telephone")?.value.trim();
  const email = document.getElementById("register-email")?.value.trim().toLowerCase();
  const ville = document.getElementById("register-ville")?.value.trim();
  const password = document.getElementById("register-password")?.value;
  const confirmation = document.getElementById("register-confirm")?.value;
  const terms = document.getElementById("register-terms")?.checked;

  if (!nom || !email || !password) {
    showMessage("Veuillez renseigner tous les champs obligatoires.", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("Le mot de passe doit comporter au moins 8 caractères.", "error");
    return;
  }

  if (password !== confirmation) {
    showMessage("Les deux mots de passe ne correspondent pas.", "error");
    return;
  }

  if (!terms) {
    showMessage("Veuillez accepter les conditions d'utilisation.", "error");
    return;
  }

  try {
    showMessage("Création de votre compte...", "success");

    const response = await fetch(`${API_AUTH_URL}/inscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: `${nom} ${prenom}`.trim(),
        telephone,
        email,
        ville,
        mot_de_passe: password
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      showMessage(data.erreur || data.message || "Erreur lors de l'enregistrement du compte.", "error");
      return;
    }

    registerForm.reset();
    showMessage("Compte créé avec succès ! Connectez-vous.", "success");

    setTimeout(() => {
      showLogin();
      const loginIdentifier = document.getElementById("login-identifier");
      if (loginIdentifier) loginIdentifier.value = email;
    }, 1000);

  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    showMessage("Impossible de joindre le serveur PDM-CI.", "error");
  }
});