# Desarrollo: Documento técnico y componentes admin

- **Título:** Documento técnico y desarrollo de componentes admin: selector relación, celda tags, celda relación, celda media
- **Fecha de creación:** 2025-04-26
- **Autor:** christianLB

## Descripción
Esta tarea abarca la redacción del documento técnico detallado y la implementación progresiva de los nuevos componentes para el admin:
- Selector de relación (formulario)
- Celda tags (tabla)
- Celda relación (tabla)
- Celda media upload (tabla)

## Documento técnico
### 1. Selector de relación (Form)
- **Función:** Permite seleccionar entidades relacionadas (1:1, 1:N, N:M) en formularios.
- **Requisitos:**
  - Soporte para búsqueda/autocompletado.
  - Visualización clara de la entidad seleccionada.
  - Soporte para limpiar la selección.
  - Accesibilidad (teclado, screen readers).
  - API: `<RelationSelect value={...} onChange={...} relationType="manyToOne|oneToMany|manyToMany" ... />`

### 2. Celda tags (Tabla)
- **Función:** Muestra arrays de tags/chips en una celda de tabla.
- **Requisitos:**
  - Visualización compacta, con overflow controlado (ej: máximo 3 tags + "+N").
  - Tooltip con lista completa al pasar el mouse.
  - Editable (opcional, según props).
  - API: `renderTagsCell(tags: string[] | TagType[])`
  - **Nota:** Investigar la lógica y reutilización del componente `TagsSelector.tsx` existente. El mismo selector de tags funciona tanto en formularios como en tabla, desplegado en un `Popover`.

### 3. Celda relación (Tabla)
- **Función:** Muestra una entidad relacionada en la tabla (nombre, enlace, etc.).
- **Requisitos:**
  - Soporte para mostrar nombre, icono, o link a detalle.
  - Manejo de relaciones nulas o múltiples.
  - API: `renderRelationCell(relation: Entity | Entity[])`

### 4. Celda media upload (Tabla)
- **Función:** Muestra archivos media (imagen, pdf, etc.) en una celda de tabla.
- **Requisitos:**
  - Miniatura para imágenes, icono para otros tipos.
  - Link para abrir/descargar el archivo.
  - API: `renderMediaCell(media: MediaType | MediaType[])`

## Plan de implementación
1. Redactar y validar el documento técnico (este archivo).
2. Implementar y testear cada componente por separado.
3. Integrar en formularios/tablas reales del admin.
4. Documentar ejemplos de uso y props.
5. Validación funcional y feedback UX.

## Ejemplos de uso y props de los nuevos componentes

### TagsCell
```tsx
import { TagsCell } from "@/components/admin/TagsCell";
<TagsCell value={tags} onChange={setTags} appliesTo="operation" />
```
- **Props:**
  - `value: string[]` — Tags seleccionados
  - `onChange: (tags: string[]) => void` — Callback al cambiar selección
  - `appliesTo: string` — Contexto para filtrar tags

### RelationCell
```tsx
import { RelationCell } from "@/components/admin/RelationCell";
<RelationCell value={rel} onChange={setRel} target="users" isMulti={false} />
```
- **Props:**
  - `value: any` — Valor actual (entidad o array)
  - `onChange: (value: any) => void` — Callback cambio
  - `target: string` — Colección destino
  - `isMulti?: boolean` — Selección múltiple
  - `disabled?: boolean`
  - `placeholder?: string`
  - `displayField?: string`
  - `apiUrl?: string`

### MediaUploadCell
```tsx
import { MediaUploadCell } from "@/components/admin/MediaUploadCell";
<MediaUploadCell value={media} onChange={setMedia} multiple={false} accept="image/*" />
```
- **Props:**
  - `value: any` — Archivo(s) actual(es)
  - `onChange: (value: any) => void` — Callback
  - `multiple?: boolean` — Permite múltiples archivos
  - `accept?: string` — Tipos permitidos
  - `maxSize?: number`
  - `disabled?: boolean`
  - `label?: string`

---

**Progreso:**
- [x] Skeletons de TagsCell, RelationCell y MediaUploadCell creados en `src/components/admin/`.
- [ ] Integración en tablas y formularios reales pendiente.
- [ ] Validación funcional y feedback UX pendiente.

## Acceptance Criteria
- [ ] Documento técnico detallado y validado.
- [ ] Componentes implementados y probados.
- [ ] Ejemplos/documentación incluidos.
- [ ] Integración en el admin y validación funcional.

## Referencias
- Tareas upstream/downstream
- Código legacy: FullStrapiTable.tsx, OperationTable.tsx
- Diseño UI/UX admin

---

> Esta tarea se da por finalizada cuando el documento técnico y al menos un componente están implementados y validados en el admin.
