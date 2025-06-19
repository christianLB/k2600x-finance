## 📘 Prompt maestro para Codex — k2600x-finance

---

### 🔧 CONTEXTO DEL PROYECTO

Estás trabajando en un frontend modular, robusto y expansible llamado `k2600x-finance`, desarrollado en Next.js (App Router), TypeScript y Tailwind. Este frontend está conectado a un backend en Strapi 5 y sirve como núcleo administrativo del sistema.

Tu tarea es generar código completo y funcional que respete las reglas estructurales del proyecto, siga las buenas prácticas establecidas, y garantice robustez y extensibilidad a futuro.

Además, **deberás utilizar nuestro propio Design System**, que ya está bien avanzado y funcional. Está disponible en [https://github.com/christianLB/design-system](https://github.com/christianLB/design-system) y debe importarse como base para cualquier componente visual. Los componentes deben derivarse exclusivamente de nuestro sistema de diseño (basado en Shadcn UI y extendido con componentes propios).

---

### 📦 ESTRUCTURA DEL REPO

El proyecto está organizado en módulos independientes dentro de `/src/modules`. Cada módulo representa una funcionalidad completa como `finance-dashboard`, `documents`, `crm`, etc. Todo debe ser autocontenido.

```
/src
  /app                       ← rutas principales
  /modules                   ← módulo funcional (uno por feature)
    /finance-dashboard
    /documents
    /crm
  /components                ← UI global reutilizable
  /lib                       ← helpers, hooks compartidos
  /services                  ← clientes de API (ej. strapiService)
  /config                    ← constantes globales
  /types                     ← tipos globales con Zod
  /tests                     ← mocks y utils de testing
```

---

### 🧭 REGLAS INQUEBRANTABLES

1. No se puede usar `fetch` directo: toda comunicación con APIs debe pasar por `/services`.
2. Todo dato debe ser validado con `zod`.
3. Los hooks deben estar tipados y validados.
4. Cada componente o hook nuevo debe tener al menos un test (`vitest` o `playwright`).
5. Las rutas deben montarse en `/src/app/(admin)/[modulo]/page.tsx`.
6. El layout global es `<AppShellLayout />`. Todo debe encajar ahí.
7. Commit-style y estructura deben cumplir convenciones estrictas (ej. nombres, imports, estructura de carpeta).
8. Codex no puede romper nada que ya esté funcionando.
9. Todos los componentes visuales deben utilizar exclusivamente el **Design System del proyecto**.

---

### 🧩 CONFIGURACIÓN ESTRUCTURAL PARA GENERACIÓN

```ts
// codex.config.ts
export const codexConfig = {
  basePaths: {
    modules: "src/modules",
    components: "src/components",
    services: "src/services",
    types: "src/types",
    tests: "src/tests",
  },
  moduleTemplate: {
    folders: ["components", "hooks", "routes", "schemas", "types"],
    defaultFiles: [
      { path: "routes/page.tsx", template: "PageComponent" },
      { path: "hooks/useData.ts", template: "UseDataHook" },
    ],
  },
  naming: {
    componentSuffix: "",
    serviceSuffix: "Service",
    hookPrefix: "use",
  },
  testPolicy: {
    required: true,
    framework: "vitest",
    path: "src/modules/{module}/__tests__/{file}.test.ts",
  },
  zodSchemaConvention: {
    inputSuffix: "InputSchema",
    outputSuffix: "OutputSchema",
  },
  routePolicy: {
    baseLayout: "AppShellLayout",
    routeFile: "src/app/(admin)/[module]/page.tsx",
  },
  forbiddenPatterns: ["fetch(", "any"],
};
```

---

### 🔨 INSTRUCCIONES DE GENERACIÓN

Cuando se solicite **crear un módulo**, debés generar:

* carpeta en `/src/modules/[nombre]`
* subcarpetas: `components`, `hooks`, `routes`, `schemas`, `types`
* una ruta de página en `/routes/page.tsx` que use `<AppShellLayout />`
* hooks de datos validados con Zod
* servicio centralizado en `/services/`
* validaciones con `zod`
* tests en `/__tests__/` para cada hook y componente
* (opcional) un test E2E en `/e2e/[modulo].spec.ts` con Playwright

Cuando se solicite **crear un componente**, debés:

* ubicarlo en `src/modules/[modulo]/components`
* usar solo props tipados
* importar estilos desde **nuestro Design System** (basado en Shadcn UI)
* incluir test unitario si tiene lógica interna
* no duplicar lógica de hooks

Cuando se solicite **crear un servicio**, debés:

* ubicarlo en `src/services`
* tipar inputs/outputs con Zod
* evitar el uso de `fetch` directo sin validación
* usar `strapiService`, `axiosInstance`, o cliente existente

---

### 💥 RECORDÁ:

Tu output debe ser 100% funcional, estructuralmente correcto, validado, y probado. No podés dejar nada a medias. No se permite código frágil, sin validación o sin tests.
