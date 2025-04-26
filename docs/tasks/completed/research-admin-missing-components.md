# Investigación: Nuevos Componentes para Admin

- **Título:** Investigación y diseño de nuevos componentes para el admin
- **Fecha de creación:** 2025-04-26
- **Autor:** christianLB

## Descripción
El objetivo de esta tarea es investigar, analizar y proponer la creación de nuevos componentes reutilizables que faltan en el panel de administración, tanto para formularios como para tablas. Esto permitirá mejorar la experiencia de usuario, la mantenibilidad y la coherencia visual del admin.

### Formulario
- **Selector de relación:**
  - Actualmente existe un placeholder básico no funcional.
  - Se requiere investigar UX/UI y lógica para seleccionar y mostrar relaciones (1:1, 1:N, N:M) de manera amigable.

### Tabla
- **Celda tags:**
  - Ya existe en tablas obsoletas (`FullStrapiTable.tsx`, `OperationTable`).
  - Investigar cómo portar o mejorar la celda para mostrar arrays de tags/chips de forma clara y editable si aplica.
- **Celda relación:**
  - Investigar cómo mostrar entidades relacionadas (nombre, enlace, etc.) en celdas de tabla de forma reutilizable.
- **Celda media upload:**
  - Proponer un componente de celda que muestre archivos media (imagen, pdf, etc.) de forma visual, similar al uploader de formularios.

## Criterios de investigación
- Analizar componentes existentes (en legacy y en el nuevo admin).
- Proponer APIs y props reutilizables para cada celda/componente.
- Referenciar buenas prácticas de UI/UX para admin panels.
- Identificar dependencias o bloqueos técnicos.
- Documentar ejemplos visuales o wireframes si es posible.

## Acceptance Criteria
- [ ] Documento de análisis con propuestas para cada componente.
- [ ] Referencias a código legacy y sugerencias de refactor/migración.
- [ ] Mockups o ejemplos visuales para cada celda/componente.
- [ ] Plan de acción para la implementación.

## Referencias
- `src/components/FullStrapiTable.tsx`
- `src/components/OperationTable.tsx`
- Formularios del nuevo admin (DynamicStrapiForm, etc.)

---

> **Nota:** Esta tarea es únicamente de investigación/diseño. La implementación se realizará en tareas separadas según el plan propuesto.
