# Strapi Media Upload Component (shadcn/ui)

- **Título:** Strapi Media Upload Component con shadcn/ui
- **Fecha de creación:** 2024-04-18
- **Autor:** christianLB

## Descripción del task

Se implementó un componente reutilizable `StrapiMediaUpload` integrado con shadcn/ui para formularios del admin, que permite:
- Subir archivos (uno o varios) a Strapi, con integración directa a la API.
- Previsualización de imágenes y representación con icono para otros tipos (PDF, texto, etc).
- Eliminación de archivos antes de guardar.
- Soporte drag & drop y selector visual moderno.
- Compatibilidad con rutas absolutas de Strapi (usando `NEXT_PUBLIC_STRAPI_URL`).
- Integración automática en formularios dinámicos (`DynamicStrapiForm`) y normalización de payload para enviar solo los IDs de media en updates/creates.

## Criterios de aceptación (definition of done)
- [x] El uploader funciona en todos los formularios del admin para campos media/file.
- [x] Soporta previsualización, borrado, subida múltiple y drag & drop.
- [x] El input nativo está oculto y la UI es clara, sin placeholders duplicados.
- [x] Los enlaces de archivos usan la URL absoluta de Strapi.
- [x] El payload para Strapi solo envía los IDs de media.
- [x] UX moderna, accesible y sin errores de compilación (`npx tsc --noEmit` OK).

## Notas y decisiones
- Para PDFs y archivos no-imagen, se usa iconografía de lucide-react.
- No se implementó preview real de PDFs, solo apertura en nueva pestaña.
- El componente es desacoplable y puede evolucionar para otros backends.

## Progreso y resolución
- Implementación completa, revisada y probada en formularios reales.
- Bugfixes: crash por value.map, rutas relativas, placeholders duplicados, error de icono PDF.
- Mejoras de UX: drag & drop, feedback visual, enlaces correctos.

## Referencias
- [src/components/StrapiMediaUpload.tsx]
- [src/hooks/useFormFactory.tsx]
- [src/utils/strapiToFormConfig.ts]

### Fecha de finalización
2025-04-26

### Resumen de cierre
Componente finalizado, probado y documentado. Listo para usarse en producción. Todos los criterios de aceptación cumplidos. Ver commits asociados para detalles técnicos.
