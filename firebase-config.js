/* ============================================================
   TheLoop · configuración de Firebase
   ------------------------------------------------------------
   1) Firebase Console → Configuración del proyecto → "Tus apps" → app Web (</>)
   2) Copia los valores de `firebaseConfig` y pégalos aquí abajo.
   3) Publica las reglas de `firestore.rules` (ver README.md).

   NOTA: la apiKey de una app web de Firebase NO es un secreto; la seguridad
   la dan las reglas de Firestore (ya incluidas en este proyecto).
   Mientras los valores empiecen por "TU_", la web funciona en MODO DEMO:
   el formulario simula el alta pero no guarda nada.
   ============================================================ */

export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

export const siteConfig = {
  /* Colección de Firestore donde se guardan los emails de la lista privada */
  collection: "waitlist",
  /* Redes y contacto (se muestran en el pie de página) */
  instagram: "https://instagram.com/the_loop_oficial",
  tiktok: "",            // pega aquí la URL de tu TikTok (ej. "https://tiktok.com/@tuusuario"); si está vacío, no se muestra
  contactEmail: "the.loop.club.oficial@gmail.com"
};
