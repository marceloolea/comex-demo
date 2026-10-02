# COMEX · Prototipo de importaciones

Demostración web de Marcelo Olea. HTML, CSS y JavaScript sin dependencias de servidor ni proceso de compilación.

## Qué muestra

- Maestros de producto y cliente con aprobación simulada.
- Generación automática de una PO de demostración desde el maestro aprobado.
- Circuito de aprobación, rechazo, revisión y envío simulado.
- Expedientes, checklist, documentos temporales y ficha de importación.
- Registro manual de referencia en MANAGER.

Los datos de ejemplo son ficticios. Los cambios y archivos adjuntos se conservan solamente en memoria mientras la pestaña está abierta; se pierden al recargar. No hay autenticación, base de datos, correo, OCR, IA ni conexión activa a M365 o MANAGER. Cada visitante tiene su propia sesión temporal. No cargar documentos reales de la empresa para presentar la demo pública.

## Publicar en GitHub Pages

1. Crear un repositorio vacío, por ejemplo `comex-demo`. GitHub Free permite Pages en repositorios públicos.
2. Descomprimir este ZIP y subir sus archivos a la raíz del repositorio. `index.html` debe quedar en la raíz, no dentro de una carpeta adicional. Conservar `.nojekyll` si se sube mediante Git; su ausencia no impide esta demo de archivos simples.
3. En el repositorio, abrir **Settings → Pages**.
4. En **Build and deployment**, elegir **Deploy from a branch**.
5. Elegir la rama que contenga los archivos (normalmente `main`), carpeta **/(root)**, y guardar.
6. Esperar a que GitHub complete la publicación y copiar el enlace que aparece en Pages.

Si el propietario es `marceloolea` y el repositorio se llama `comex-demo`, el enlace esperado es `https://marceloolea.github.io/comex-demo/`. Solo queda activo después de publicar. La demo funciona con rutas relativas, también cuando Pages la sirve debajo del nombre del repositorio.

## Publicar en Vercel desde GitHub

1. En Vercel, crear un proyecto e importar el repositorio que contiene estos archivos.
2. Seleccionar **Framework Preset: Other** y mantener la raíz del repositorio.
3. Dejar **Build Command** vacío. No se necesita **Install Command**. La carpeta de salida es la raíz (`.`); no hay carpeta `public` ni compilación.
4. Desplegar y copiar la URL de producción. Comprobar que el destinatario puede abrirla sin iniciar sesión; si existe protección de acceso, configurar el acceso requerido antes de compartir.

## Ejecutar localmente

Desde esta carpeta: `python3 -m http.server 8000`. Abrir `http://localhost:8000/`.

## Archivos

`index.html`, `style.css`, `app.js` y `workflow.js` componen la demo. `jszip.min.js` y `JSZIP-LICENSE.txt` incluyen JSZip y su licencia. `plantilla_po.xlsx` es una plantilla ficticia del importador anterior, conservado como código de referencia; el flujo principal actual genera la PO desde el maestro aprobado.

## Verificación de esta exportación

Se verificaron la sintaxis de JavaScript, la presencia de los recursos locales y la integridad del ZIP. Esta exportación conserva los archivos de la demo existente; no implica validación de integraciones reales ni publicación efectiva en GitHub o Vercel.

## Referencias de publicación

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://vercel.com/docs/builds/configure-a-build
