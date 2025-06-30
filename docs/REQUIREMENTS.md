# Requerimientos de la Aplicación Principal K2600X Finance

## Objetivo
Construir la aplicación principal de administración financiera basándose en la integración funcional con Strapi ya implementada en la página de diagnósticos, utilizando una arquitectura profesional y reutilizable.

## Arquitectura Base Identificada
La aplicación actual ya cuenta con:
- Integración completa con Strapi 5 y autenticación JWT
- `SmartDataTable` component reutilizable con CRUD completo
- Sistema de formularios dinámicos (`DynamicStrapiForm`)
- Design system (`@k2600x/design-system`) con componentes base
- API routes funcionales para operaciones CRUD con Strapi

## Componentes Principales

### 1. Sistema de Autenticación
- **Splash Screen / Login único** que redirige al dashboard principal
- Manejo de sesiones JWT existente
- Protección de rutas

### 2. Navegación Principal
- **Navbar principal** con acceso a:
  - Finance Dashboard (vacío inicialmente)
  - Admin (sistema completo de administración)
  - Logout/perfil de usuario

### 3. Finance Dashboard
- **Estado inicial**: Página vacía preparada para futuras funcionalidades
- Layout base con navegación
- Espacio reservado para widgets financieros

### 4. Admin System (Prioridad Alta)
Basado en la funcionalidad probada de `/admin/diagnostics`:

#### 4.1 Sidebar de Administración
- **Lista de colecciones** dinámicamente cargada desde Strapi
- Filtrado automático de colecciones API (`api::*`)
- Navegación entre diferentes tipos de contenido
- Indicadores de estado (cantidad de registros, etc.)

#### 4.2 Tabla Principal Editable
Reutilizar el `SmartDataTable` existente con:
- **CRUD completo** (Create, Read, Update, Delete)
- **Formularios dinámicos** basados en esquemas de Strapi
- **Paginación** integrada
- **Búsqueda y filtros**
- **Validación** automática de campos

#### 4.3 Características Técnicas
- **Esquemas dinámicos**: Auto-generación de formularios basada en schema de Strapi
- **Optimistic updates**: Actualizaciones inmediatas en UI
- **Error handling**: Manejo robusto de errores con feedback visual
- **Performance**: Lazy loading y cache de queries con React Query

## Stack Tecnológico Confirmado
- **Frontend**: Next.js 14+ con App Router
- **UI Components**: `@k2600x/design-system`
- **State Management**: React Query (TanStack Query)
- **Backend Integration**: Strapi 5 con JWT authentication
- **Form Management**: Formularios dinámicos personalizados
- **Styling**: Tailwind CSS (integrado en design system)

## Prioridades de Implementación

### Fase 1: Core Admin (Inmediata)
1. Crear layout base de admin con sidebar
2. Implementar navegación entre colecciones
3. Integrar `SmartDataTable` para administración general
4. Sistema de routing interno del admin

### Fase 2: Navegación Principal
1. Splash screen/login unificado
2. Navbar principal con navegación
3. Finance dashboard placeholder
4. Protección de rutas

### Fase 3: Mejoras y Optimizaciones
1. Mejoras UX en formularios dinámicos
2. Filtros avanzados en tablas
3. Exportación de datos
4. Dashboard analytics básico

## Casos de Uso Principal

### Administrador
- Accede directamente al admin tras login
- Gestiona cualquier colección de Strapi de forma intuitiva
- Crea, edita y elimina registros con formularios auto-generados
- Navega entre diferentes tipos de contenido via sidebar

### Usuario Financiero (Futuro)
- Accede al finance dashboard tras login
- Visualiza métricas y reportes financieros
- Acceso limitado a funciones de admin según permisos

## Notas Técnicas

### Componentes Reutilizables Disponibles
- `SmartDataTable`: Tabla completa con CRUD (probada en diagnostics)
- `DynamicStrapiForm`: Formularios auto-generados
- `AppLayout`: Layout base con sidebar
- API routes: `/api/strapi/*` completamente funcionales

### Patrones de Desarrollo
- Componentes presentacionales vs. contenedores
- Custom hooks para lógica de estado
- Tipado estricto con TypeScript
- Error boundaries para manejo de errores

### Consideraciones de Seguridad
- Validación de permisos en frontend y backend
- Sanitización de datos de entrada
- Manejo seguro de tokens JWT
- Protección CSRF integrada

## Entregables Esperados
1. Admin funcional con gestión completa de colecciones Strapi
2. Navegación principal implementada
3. Finance dashboard base (vacío pero navegable)
4. Documentación de componentes reutilizables
5. Tests básicos de funcionalidad CRUD