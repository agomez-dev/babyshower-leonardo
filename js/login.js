const SUPABASE_URL = "https://bnptvlupfrexmiinbbbj.supabase.co/rest/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHR2bHVwZnJleG1paW5iYmJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYwMjQ3MywiZXhwIjoyMDc4MTc4NDczfQ.HX5Z-VdWamwRD_Tz3Eq-tJ9Gd7csKnhii410yJkpIP4";

/**
 * Inicia sesión validando usuario y contraseña (hash SHA-256).
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña ingresada.
 */
async function login(username, password) {
  try {
    const url = `${SUPABASE_URL}/login_user?name=eq.${encodeURIComponent(username)}&select=*`;

    const res = await fetch(url, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`
      }
    });

    // ⚠️ Si Supabase devuelve error
    if (!res.ok) {
      const text = await res.text();
      console.error("Error HTTP al consultar usuario:", text);
      alert("Error consultando usuario.");
      return false;
    }

    const data = await res.json();

    // ⚠️ Si data no es un array o está vacío
    if (!Array.isArray(data) || data.length === 0) {
      alert("Usuario no encontrado");
      return false;
    }

    const user = data[0];

    // ✅ Verificar contraseña (comparando hash)
    const match = await verifyPassword(password, user.password);
    if (!match) {
      alert("Contraseña incorrecta");
      return false;
    }

    // ✅ Guardar sesión local
    localStorage.setItem("isUserLoggedIn", "true");
    localStorage.setItem("currentUser", user.name);
    console.log("✅ Login correcto:", user.name);
    return true;

  } catch (err) {
    console.error("Error ejecutando login:", err);
    alert("Error inesperado durante el login.");
    return false;
  }
}
