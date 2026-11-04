# TheLoop · web del club privado

Landing estática (HTML + CSS + JS, **sin build ni dependencias**) con lista de espera conectada a **Firebase Firestore**. Se publica tal cual en **GitHub Pages**.

Lo más llamativo: al hacer scroll, la **estrella azul crece hasta llenar la pantalla**, los ojos **se cierran y se abren** y, con la pantalla ya llena, **aparecen la L y la P** formando LOOP. Está dibujado con los contornos vectorizados de tus imágenes reales (`brand/`).

```
index.html            página principal
styles.css            estilos (paleta de marca en :root)
app.js                formulario, Firebase, efectos
stage.js              animación de scroll estrella → LOOP
firebase-config.js    ← AQUÍ pegas tus datos de Firebase
firestore.rules       reglas de seguridad de Firestore (listas para publicar)
firebase.json         para publicar las reglas con la CLI (opcional)
privacidad.html       política de privacidad (hay que completar el responsable)
404.html              página de error
assets/               iconos, estrellas SVG, og-image, brand-paths.js (trazos de la marca)
brand/                imágenes originales de la estrella y del logo LOOP
tools/trace_brand.py  regenera assets/brand-paths.js si cambias el logo
```

## 1 · Configurar Firebase (10 minutos)

1. Entra en <https://console.firebase.google.com> → **Añadir proyecto** (puedes desactivar Google Analytics).
2. **Compilación → Firestore Database → Crear base de datos** → modo **producción** → elige región (p. ej. `eur3` o `europe-west`).
3. **Configuración del proyecto (⚙) → Tus apps → `</>` Web** → registra la app (no hace falta Hosting). Copia el objeto `firebaseConfig`.
4. Abre `firebase-config.js` y pega los valores en `firebaseConfig`.
   > La `apiKey` de una app web **no es secreta**: la seguridad la dan las reglas del paso 5.
5. **Firestore → Reglas** → pega el contenido de `firestore.rules` → **Publicar**.
   (O con la CLI: `npm i -g firebase-tools && firebase login && firebase use --add && firebase deploy --only firestore:rules`).

Mientras `firebase-config.js` tenga valores `TU_...`, la web va en **modo demo**: el formulario simula el alta y avisa por la consola del navegador, pero no guarda nada.

### Dónde ves los emails
Firebase Console → Firestore → colección **`waitlist`**. Cada documento tiene `email`, `consent`, `source`, `lang` y `createdAt`. El ID es un hash del email, así que **un mismo email no se duplica**. Para exportar: Firestore → «Exportar» o un pequeño script con el SDK de administración.

## 2 · Subir a GitHub y publicar

1. Crea un repositorio en GitHub (por ejemplo `theloop`) y sube **todo el contenido de esta carpeta** (arrastrando los archivos en «uploading an existing file», o con git).
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save.**
3. En 1-2 minutos estará en `https://TU_USUARIO.github.io/theloop/`.
4. **Dominio propio** (opcional): Settings → Pages → *Custom domain* y apunta el DNS según indica GitHub.

Después de publicar, edita en `index.html` las metas `og:image` y `canonical` poniendo la **URL absoluta** (por ejemplo `https://tudominio.com/assets/og-image.png`), para que las vistas previas al compartir enlaces (TikTok, WhatsApp, X…) funcionen bien.

## 3 · Personalizar

- **Redes**: en `firebase-config.js` → `siteConfig` (`instagram`, `tiktok`, `contactEmail`). Si `tiktok` está vacío, el enlace no se muestra.
- **Textos**: están directamente en `index.html`.
- **Colores**: variables `--loop-blue`, etc. al inicio de `styles.css`.
- **Velocidad/duración de la escena de scroll**: `height:520vh` en `.stage` (`styles.css`) y las fases `p` en `stage.js`.
- **Cambiar el logo**: sustituye `brand/estrella.png` y `brand/loop-logo.png` y ejecuta `python tools/trace_brand.py`.

## 4 · Antes de publicar (importante)

- **Política de privacidad**: en `privacidad.html` hay un aviso amarillo. Rellena el responsable del tratamiento (nombre, NIF, domicilio). **Si el proyecto lo lleva un menor de edad, el responsable debe ser una persona adulta** (madre, padre o tutor). Revisa el texto con alguien que entienda de RGPD/LOPDGDD: es una plantilla, no asesoramiento legal.
- La web no usa cookies ni analítica; si añades TikTok Pixel, Google Analytics, etc., tendrás que añadir un banner de cookies y actualizar la política.
- El texto de las FAQ dice que apuntarse es gratis y no compromete: cámbialo si no es cierto.

## 5 · Seguridad y solución de problemas

- Las reglas solo permiten **crear** un documento con un email válido + consentimiento; nadie puede leer, editar ni borrar desde la web.
- Para frenar abuso de bots, activa **App Check** (Firebase Console → App Check → reCAPTCHA v3) y, cuando quieras, exige App Check en Firestore.
- Si todos los alta muestran «No hemos podido completar el alta…», casi seguro es que **las reglas no están publicadas** o `projectId` está mal. Abre la consola del navegador (F12) para ver el error exacto.
- Si un email repetido intenta apuntarse, Firestore lo rechaza (permiso denegado): la web muestra el mensaje genérico de arriba.
- Para probar en local: `python3 -m http.server 8000` y abre <http://localhost:8000> (los módulos JS no funcionan abriendo el archivo con doble clic).
