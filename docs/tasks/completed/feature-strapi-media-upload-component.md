---
title: Crear componente StrapiMediaUpload para forms
fecha_creacion: 2025-04-26
autor: k2600x
descripcion: >-
  Analizar y diseñar un nuevo componente `StrapiMediaUpload` que reemplace el actual mapeo de file upload en los formularios, permitiendo subir archivos a Strapi antes de guardar el registro, con previsualización y opción de eliminar archivos subidos.

## Descripción del problema
Actualmente, los formularios usan un mapeo de file upload que no permite subir archivos a Strapi de forma anticipada ni ofrece una experiencia de previsualización ni gestión de archivos subidos antes de guardar el registro padre.

## Objetivo
Crear un componente `StrapiMediaUpload` reutilizable y compatible con el design system, que permita:
- Subir archivos a Strapi de inmediato (antes de guardar el registro padre)
- Previsualizar los archivos subidos
- Eliminar archivos subidos (antes de asociarlos al registro padre)
- Asociar los archivos al registro padre al guardar el formulario
- Soporte para uno o varios archivos (según configuración)

## Opciones y consideraciones de implementación
- Utilizar componentes de UI compatibles con el design system actual (ej: radix-ui, shadcn, mantine, etc.)
- Reutilizar lógica y hooks existentes para uploads si es posible
- El componente debe exponer una API sencilla para integración en formularios (ej: react-hook-form, formik, etc.)
- Permitir configuración de restricciones (tipos de archivo, tamaño, múltiple/single, etc.)
- Manejar el borrado de archivos subidos a Strapi si el usuario los elimina antes de guardar el padre
- Exponer callbacks para integración con el flujo de guardado del formulario padre

## Propuesta de diseño técnico inicial

### 1. API del componente `StrapiMediaUpload`

```tsx
<StrapiMediaUpload
  name="justificante"
  label="Justificante de pago"
  value={value} // array de archivos o archivo
  onChange={(newFiles) => setValue(newFiles)}
  multiple={true} // o false
  accept="image/*,application/pdf"
  maxSize={5 * 1024 * 1024} // 5MB
  disabled={false}
/>
```

- **name:** nombre del campo en el formulario.
- **label:** etiqueta visible.
- **value:** archivos actuales (pueden ser objetos Strapi Media o archivos locales).
- **onChange:** callback al agregar/quitar archivos.
- **multiple:** permite varios archivos.
- **accept:** tipos MIME permitidos.
- **maxSize:** tamaño máximo.
- **disabled:** estado deshabilitado.

### 2. Flujo de usuario

1. El usuario selecciona uno o varios archivos.
2. Los archivos se suben inmediatamente a Strapi vía la API `/upload`.
3. Se muestra previsualización (imagen/pdf/nombre/ícono).
4. El usuario puede eliminar archivos subidos antes de guardar el formulario padre (esto debería borrar el archivo en Strapi).
5. Al guardar el formulario padre, se asocian los IDs de los archivos subidos al registro correspondiente.

### 3. Integración con formularios

- Compatible con `react-hook-form` o integración controlada.
- El componente maneja el estado de archivos subidos y pendientes de asociación.
- Expone los IDs de archivos subidos para enviar en el payload del registro padre.

### 4. Compatibilidad visual (Design System)

- Usar componentes base de Radix UI, shadcn/ui, o el design system propio.
- Soporte para estados de carga, error, éxito.
- Botón de "Agregar archivo", lista de archivos, botón de eliminar, previsualización.

### 5. Hooks y utilidades sugeridas

- `useStrapiUpload`: hook para manejar la subida y borrado de archivos en Strapi.
- Utilidades para transformar la respuesta de Strapi y normalizar los datos para el formulario.

### 6. Ejemplo de integración

```tsx
const { control, handleSubmit } = useForm();

<FormProvider {...methods}>
  <form onSubmit={handleSubmit(onSubmit)}>
    <StrapiMediaUpload
      name="justificante"
      label="Justificante de pago"
      value={watch('justificante')}
      onChange={val => setValue('justificante', val)}
      multiple={false}
      accept="image/*,application/pdf"
    />
    <button type="submit">Guardar</button>
  </form>
</FormProvider>
```

### 7. Consideraciones adicionales

- Manejar errores de subida y borrado.
- Permitir customización de estilos y layout.
- Soporte para internacionalización.
- Documentar el flujo de asociación/desasociación con el registro padre.

## Implementación actual de subida de archivos a Strapi

### Función `uploadPdfToStrapi`

- Ubicación: `src/lib/uploadPdfToStrapi.ts`
- Permite subir archivos PDF (desde navegador o Node.js) a Strapi utilizando una ruta API interna (`/api/strapi-upload`).
- Utiliza `FormData` para enviar el archivo y espera la respuesta de Strapi (array de archivos subidos).
- Maneja tanto `File` (browser) como `Buffer` (Node.js).
- Retorna el primer archivo subido según la respuesta de Strapi.

```ts
export async function uploadPdfToStrapi(pdfFile: File | Buffer, fileName: string) {
  // ...
  const response = await fetch("/api/strapi-upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Error uploading file to Strapi");
  const result = await response.json();
  return result[0] || result;
}
```

### API route `/api/strapi-upload`

- Ubicación: `src/app/api/strapi-upload/route.ts`
- Expone un endpoint POST que recibe archivos vía `FormData` (campo `file`).
- Autentica contra Strapi usando un JWT (helper `authenticate`).
- Reenvía el archivo a la API `/upload` de Strapi usando el JWT y `FormData` (campo `files`).
- Devuelve la respuesta de Strapi (array de archivos subidos o error).

```ts
export async function POST(req: NextRequest) {
  // ...
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  // ...
  const jwt = await authenticate();
  const strapiForm = new FormData();
  strapiForm.append("files", file, file.name);
  const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: strapiForm,
  });
  // ...
}
```

#### Observaciones
- El flujo actual sube archivos a Strapi de forma autenticada y devuelve la metadata del archivo subido.
- El endpoint soporta un solo archivo por request, pero Strapi puede recibir múltiples archivos en el campo `files`.
- El borrado de archivos subidos debe implementarse aparte (no está cubierto en este flujo).

### Implicaciones para el nuevo componente
- El nuevo `StrapiMediaUpload` puede reutilizar esta lógica para subir archivos y obtener la metadata necesaria para previsualización y asociación.
- Es recomendable generalizar el endpoint y el hook para soportar múltiples archivos y otros tipos de media.
- Se debe agregar lógica para eliminar archivos subidos a Strapi si el usuario los descarta antes de guardar el registro padre.

## Próximos pasos sugeridos

1. Validar este diseño con el equipo.
2. Elegir librerías base (Radix, shadcn/ui, etc.).
3. Implementar el hook de subida y borrado (`useStrapiUpload`).
4. Crear el componente base y ejemplos de uso.
5. Documentar integración y edge cases.

## Criterios de aceptación
- El componente permite subir archivos a Strapi y previsualizarlos antes de guardar el registro
- Es posible eliminar archivos subidos antes de asociarlos al registro padre
- El componente es reutilizable y configurable para distintos formularios
- Compatible visualmente y funcionalmente con el design system
- Documentación de uso y ejemplos de integración

## Referencias
- [Strapi Upload API](https://docs.strapi.io/dev-docs/api/rest/upload)
- [Radix UI File Upload RFC](https://github.com/radix-ui/primitives/discussions/1807)
- [shadcn/ui File Upload Example](https://ui.shadcn.com/docs/components/file-upload)
