

// ---------------------------
// authutils.js
// ---------------------------

/**
 * Genera un hash SHA-256 en formato hexadecimal.
 * @param {string} password - Contraseña a encriptar.
 * @returns {Promise<string>} - Hash hexadecimal.
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compara una contraseña con su hash almacenado.
 * @param {string} password - Contraseña ingresada.
 * @param {string} storedHash - Hash guardado en la base de datos.
 * @returns {Promise<boolean>} true si coinciden.
 */
async function verifyPassword(password, storedHash) {
  const hash = await hashPassword(password);
  return hash === storedHash;
}


(async () => {
  const name = "admin";
  const password = "MiContraseñaSegura";
  const hash = await hashPassword(password);
  console.log("Hash generado:", hash);
})();
