# Plataforma docente

La rama `docentes` incorpora una primera versión del acceso docente y de la biblioteca de materiales.

## Flujo

- El docente inicia sesión desde `aprendizaje/docentes/index.html`.
- Solo puede publicar en las áreas que el administrador le asigna.
- Los materiales se publican inmediatamente después de validar el archivo.
- Cada material vence dos meses calendario después de su publicación.
- La biblioteca pública oculta los materiales vencidos.
- La función programada `cleanup-materials` elimina diariamente los archivos vencidos de Netlify Blobs y sus metadatos.

## Configuración en Netlify

1. Activar Netlify Identity en el sitio.
2. Cambiar el registro a modo `Invite only`.
3. Invitar al administrador y a los docentes desde Identity.
4. Crear la variable de entorno `ADMIN_EMAILS` con uno o varios correos separados por comas.
5. Mantener HTTPS activo en el dominio del sitio.
6. Confirmar que Netlify utilice `netlify/functions` como directorio de Functions.

Los datos se guardan en Netlify Blobs. El nombre del almacén incluye el contexto de despliegue (`production`, `deploy-preview`, `branch-deploy` o `local`) para evitar que las pruebas mezclen materiales con producción.

## Primer acceso administrativo

El correo configurado en `ADMIN_EMAILS` puede entrar al panel y utilizar la sección **Asignar áreas a docentes**. El administrador escribe el correo de cada docente, marca una o varias áreas y guarda la asignación.

## Límites iniciales

- Tamaño máximo por archivo: 4 MB.
- Imágenes permitidas: JPG, PNG y WebP.
- Documentos permitidos: PDF, Word, PowerPoint, Excel y formatos OpenDocument.
- No se permiten macros ni archivos ejecutables.
- No se suben videos.

## Desarrollo local

El proyecto usa Node `22.12.0` o superior para mantener compatibilidad con la versión actual de Netlify Blobs.

Instalar las dependencias y ejecutar Netlify Dev para disponer del contexto de Functions:

```text
npm install
npx netlify-cli dev
```

El acceso de Identity y las subidas requieren configurar el sitio en Netlify. La web pública y la validación visual pueden revisarse sin iniciar sesión.
