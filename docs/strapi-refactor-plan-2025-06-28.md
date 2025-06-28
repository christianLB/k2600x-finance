# Plan de Refactorización de la Capa de Acceso a Strapi (2025-06-28)

## Visión General de la Arquitectura Propuesta

La arquitectura actual, que utiliza rutas API de Next.js como intermediarias, es conceptualmente correcta para la seguridad (ocultando el token de Strapi del cliente). Sin embargo, carece de centralización y manejo de errores robusto.

La nueva arquitectura se basará en un **Servicio de Strapi Centralizado (`strapiService`)** que encapsulará toda la lógica de comunicación. Las rutas API de Next.js se convertirán en *wrappers* delgados y seguros alrededor de este servicio.

### Componentes Clave:

1.  **Cliente Strapi Centralizado (`src/services/strapiService.ts`):** Un único módulo responsable de todas las interacciones con la API de Strapi.
2.  **Tipos de TypeScript Autogenerados (`src/types/strapi-generated.ts`):** Para garantizar la seguridad de tipos en todo el proyecto, generaremos tipos directamente desde el esquema de Strapi.
3.  **Rutas API Delgadas (`src/app/api/strapi/...`):** Su única responsabilidad será la autenticación/autorización de la solicitud del cliente y la invocación del `strapiService`.
4.  **Estrategia de Pruebas (Unitarias y de Integración):** Para verificar que cada parte de la capa de acceso funciona como se espera.

---

## Plan de Implementación Detallado

### Fase 0: Auditoría Pre-refactorización y Configuración

El objetivo de esta fase es identificar y preparar el terreno para la refactorización, asegurando una transición segura y completa.

*   **Paso 0.1: Auditoría de Interacciones con Strapi**
    *   **Acción:** Identificar todas las interacciones directas actuales con Strapi en el frontend (hooks, funciones de utilidad, rutas API que no son wrappers delgados).
    *   **Detalles:** Esto incluye buscar usos de `fetch` directos a la API de Strapi, hooks personalizados como `useStrapiSchema`, y cualquier otra lógica que acceda a Strapi sin pasar por el `strapiService` o las rutas API intermedias.

*   **Paso 0.2: Mapeo de Dependencias de UI**
    *   **Acción:** Mapear qué componentes de la interfaz de usuario dependen de las interacciones con Strapi identificadas en el Paso 0.1.
    *   **Detalles:** Esto ayudará a planificar la migración de la UI en fases posteriores y asegurar que ningún componente se quede sin actualizar.

*   **Paso 0.3: Asegurar la Red de Seguridad de Pruebas**
    *   **Acción:** Asegurar que existe un conjunto robusto de pruebas para las funcionalidades críticas que interactúan con Strapi.
    *   **Detalles:** Si no existen pruebas adecuadas, priorizar su adición antes de iniciar la refactorización para garantizar la estabilidad del sistema.

*   **Paso 0.4: Configuración del Entorno de Desarrollo**
    *   **Acción:** Crear una rama de características (`feature branch`) para esta refactorización.
    *   **Detalles:** Esto aislará los cambios y permitirá un desarrollo y revisión seguros.

### Fase 1: Diseño de Arquitectura y Centralización

El objetivo de esta fase es sentar las bases de la nueva arquitectura sin modificar aún la UI.

*   **Paso 1.1: Implementar el `strapiService` Centralizado**
    *   **Acción:** Crear un nuevo archivo `src/services/strapiService.ts`.
    *   **Detalles:** Este servicio utilizará el cliente oficial `@strapi/strapi` o una instancia de `axios` preconfigurada. Se encargará de:
        *   Obtener la URL de Strapi y el token de API desde variables de entorno (`process.env.STRAPI_API_URL`, `process.env.STRAPI_API_TOKEN`).
        *   Encapsular métodos para las operaciones CRUD estándar: `find`, `findOne`, `create`, `update`, `delete`.
        *   Implementar un método para obtener los esquemas: `getSchemas`.
        *   **Manejo de Errores:** Implementar un parser de errores de Strapi que extraiga los detalles (`error.details`) y los convierta en excepciones personalizadas y claras (ej. `StrapiValidationError`, `StrapiForbiddenError`).
        *   **Manejo de Autenticación:** Clarificar cómo se pasarán de forma segura los tokens de autenticación desde las rutas API de Next.js al `strapiService` para las solicitudes autenticadas (ej., a través de un objeto `context` o encabezados HTTP).

*   **Paso 1.2: Generar y Configurar Tipos de Strapi**
    *   **Acción:** Utilizar una herramienta como `strapi-sdk-js` o `strapi-generate-types` para generar interfaces de TypeScript a partir de los esquemas de tu instancia de Strapi.
    *   **Detalles:**
        1.  Añadir el script de generación de tipos al `package.json` (ej. `"npm run generate-types"`).
        2.  Ejecutar el script para crear `src/types/strapi-generated.ts`.
        3.  Integrar estos tipos en las firmas de los métodos del `strapiService` para obtener autocompletado y seguridad de tipos.

*   **Paso 1.3: Rediseñar las Rutas API Intermedias**
    *   **Acción:** Refactorizar una ruta API existente (ej. `/api/strapi/schemas`) para que utilice el nuevo `strapiService`.
    *   **Detalles:** La ruta API ya no contendrá lógica de `fetch`. Su código se simplificará a:
        1.  Recibir la solicitud.
        2.  Llamar al método correspondiente del `strapiService` (ej. `strapiService.getSchemas()`).
        3.  Manejar los errores devueltos por el servicio y responder al cliente con el código de estado HTTP y el mensaje adecuados (ej. 400, 403, 500).
        4.  Devolver la respuesta del servicio en caso de éxito.

### Fase 2: Implementación y Refactorización

Ahora que la base está lista, aplicaremos el nuevo patrón al resto de la aplicación.

*   **Paso 2.1: Refactorizar Todas las Rutas API**
    *   **Acción:** Migrar la lógica de todas las rutas en `src/app/api/strapi/` para que usen exclusivamente el `strapiService`. Eliminar todo el código `fetch` duplicado.
    *   **Detalles:** Para cada ruta API refactorizada, asegurar una propagación adecuada de errores desde `strapiService` al cliente con los códigos de estado HTTP apropiados.

*   **Paso 2.2: Optimizar las Consultas de Datos**
    *   **Acción:** Modificar los métodos del `strapiService` y las llamadas desde la UI para evitar `populate=*`.
    *   **Detalles:** Los métodos del servicio deben aceptar un parámetro `populate` explícito. Las llamadas desde el frontend (a través de las rutas API) deberán especificar solo las relaciones necesarias para esa vista en particular. Esto mejorará drásticamente el rendimiento.

*   **Paso 2.3: Actualizar el Frontend (Página de Diagnóstico)**
    *   **Acción:** Refactorizar la página de diagnóstico (`src/app/admin/diagnostics/page.tsx`) para que se alinee con la nueva capa de servicio.
    *   **Detalles:** Aunque la página seguirá llamando a las rutas API de Next.js, el código de manejo de errores (`catch`) en los hooks de `react-query` deberá actualizarse para interpretar los nuevos objetos de error estructurados que devuelven las rutas API.

### Fase 3: Migración de Frontend y Eliminación de Redundancias

Esta fase se centra en la actualización de la interfaz de usuario y la eliminación de código obsoleto.

*   **Paso 3.1: Migración Sistemática de Componentes de UI**
    *   **Acción:** Para cada componente de UI identificado en la Fase 0 que interactúa con Strapi, refactorizar su lógica de obtención de datos para utilizar las nuevas rutas API delgadas.
    *   **Detalles:** Esto debe hacerse de manera incremental, componente por componente, para minimizar el riesgo y facilitar la depuración.

*   **Paso 3.2: Eliminación de Hooks y Utilidades Redundantes**
    *   **Acción:** Una vez que un componente o un conjunto de componentes ya no dependa de `useStrapiSchema` o de cualquier otra lógica de interacción directa con Strapi, eliminar estos archivos obsoletos y sus importaciones.
    *   **Detalles:** Esto incluye cualquier ruta API que no haya sido refactorizada en un wrapper delgado y que ya no sea utilizada.

*   **Paso 3.3: Manejo de Errores de UI Integral**
    *   **Acción:** Implementar un mecanismo centralizado de manejo de errores en la UI (ej., un `ErrorBoundary` global o un sistema de notificaciones `toast`).
    *   **Detalles:** Este mecanismo debe ser capaz de interpretar los errores personalizados devueltos por el `strapiService` y mostrar mensajes amigables al usuario.

### Fase 4: Pruebas y Validación

Para garantizar la robustez, es crucial añadir un conjunto de pruebas automatizadas.

*   **Paso 4.1: Pruebas Unitarias para `strapiService`**
    *   **Acción:** Crear `src/services/strapiService.test.ts`.
    *   **Detalles:** Utilizando `jest` y un mock del cliente HTTP (ej. `msw` o `jest.mock`), escribir pruebas para:
        *   Verificar que cada método (find, create, etc.) construye la URL y los parámetros correctamente.
        *   Simular respuestas de error de Strapi (403, 404, 500) y asegurar que el servicio las parsea y lanza la excepción personalizada correcta.
        *   Confirmar que los datos se devuelven correctamente en caso de éxito.

*   **Paso 4.2: Pruebas de Integración para las Rutas API**
    *   **Acción:** Crear pruebas para las rutas API (ej. `src/app/api/strapi/collections.test.ts`).
    *   **Detalles:** Utilizando una herramienta como `supertest` o los helpers de prueba de Next.js, realizar peticiones a las rutas API (con el `strapiService` mockeado) para verificar:
        *   Que una solicitud válida llama al método correcto del servicio.
        *   Que los errores del servicio se traducen en los códigos de estado HTTP correctos.
        *   Que los parámetros de la solicitud (ej. `uid` de la colección) se pasan correctamente al servicio.

*   **Paso 4.3: Pruebas E2E (Opcional pero Recomendado)**
    *   **Acción:** Crear un flujo de prueba E2E para la página de diagnóstico.
    *   **Detalles:** Usando Cypress o Playwright, simular el flujo completo: cargar la página, seleccionar un modelo, crear un registro, verificar que aparece en la tabla, actualizarlo y finalmente eliminarlo.

### Fase 5: Documentación y Mantenimiento

Para que el equipo pueda utilizar y mantener esta nueva arquitectura de forma efectiva.

*   **Paso 5.1: Documentar el `strapiService`**
    *   **Acción:** Añadir comentarios JSDoc a todos los métodos del `strapiService`, explicando sus parámetros (especialmente las opciones de `populate` y `filters`), lo que devuelven y los errores que pueden lanzar.

*   **Paso 5.2: Crear una Guía de Integración con Strapi**
    *   **Acción:** Crear un nuevo documento en `docs/strapi-integration-guide.md`.
    *   **Detalles:** Este documento explicará las mejores prácticas para el equipo:
        *   "Para interactuar con Strapi, siempre se debe usar el `strapiService`."
        *   "Cómo añadir nuevos métodos al servicio."
        *   "La política sobre el uso de `populate`: ser explícito, evitar el `*`."
        *   "Cómo manejar los errores de Strapi en el frontend."
        *   "Cómo deprecate y eliminar código antiguo de interacción con Strapi."

*   **Paso 5.3: Limpieza de Código**
    *   **Acción:** Eliminar cualquier cliente o helper de Strapi antiguo que haya quedado obsoleto tras la implementación del `strapiService`.