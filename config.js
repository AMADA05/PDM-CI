const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000"
  : "https://medequip-api.onrender.com"; // Ton URL publique Render

const API_AUTH_URL = `${API_BASE_URL}/api/auth`;