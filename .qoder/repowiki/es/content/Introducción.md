# Introducción

<cite>
**Archivos mencionados en esta introducción**
- [README.md](file://README.md)
- [nuxt.config.ts](file://nuxt.config.ts)
- [package.json](file://package.json)
- [src-tauri/Cargo.toml](file://src-tauri/Cargo.toml)
- [data/db/schema.json](file://data/db/schema.json)
- [types/bom.ts](file://types/bom.ts)
- [pages/index.vue](file://pages/index.vue)
- [components/ImportModal.vue](file://components/ImportModal.vue)
- [composables/useExport.ts](file://composables/useExport.ts)
- [composables/useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts)
- [wiki/LCSC_API_INTEGRATION.md](file://wiki/LCSC_API_INTEGRATION.md)
- [wiki/EASYEDA_API_INTEGRATION.md](file://wiki/EASYEDA_API_INTEGRATION.md)
</cite>

## Índice
1. [Introducción](#introducción)
2. [Propósito de BOM Manager](#propósito-de-bom-manager)
3. [Público objetivo y casos de uso](#público-objetivo-y-casos-de-uso)
4. [Características principales](#características-principales)
5. [Arquitectura tecnológica](#arquitectura-tecnológica)
6. [Solución de problemas y beneficios](#solución-de-problemas-y-beneficios)
7. [Resumen](#resumen)

## Introducción
BOM Manager es una aplicación de escritorio multiplataforma diseñada para ingeniería electrónica con el fin de gestionar listas de materiales (BOM), controlar inventario, rastrear proyectos y facilitar la adquisición de componentes. Basada en una arquitectura híbrida, combina una interfaz moderna y reactiva con capacidades nativas de escritorio, permitiendo integraciones locales y externas, así como operaciones de importación/exportación de datos.

## Propósito de BOM Manager
BOM Manager ayuda a ingenieros, técnicos y pequeñas empresas a:
- Consolidar y mantener un inventario de componentes electrónicos con control de stock y alertas.
- Gestionar proyectos de diseño electrónico, vinculando componentes a cada proyecto.
- Automatizar la adquisición de piezas mediante integración con proveedores.
- Importar/exportar fácilmente BOMs desde múltiples formatos y fuentes.

## Público objetivo y casos de uso
- Ingenieros electrónicos que necesitan rastrear componentes, stock y proyectos.
- Técnicos de producción que requieren acceso rápido a especificaciones y disponibilidad.
- Pequeñas empresas de electrónica que buscan centralizar su gestión de materiales y órdenes.

Casos de uso comunes:
- Importar BOMs desde proveedores o herramientas de diseño.
- Generar reportes de stock y alertas de reposición.
- Crear proyectos y asignarles componentes con cantidades precisas.
- Realizar búsquedas de componentes y órdenes a través de la API de un proveedor.

## Características principales
- Gestión de inventario: alta capacidad de control de stock, niveles mínimos y alertas.
- Gestión de proyectos: asociación de componentes a proyectos con cantidades y seguimiento de actividad.
- Control de stock: operaciones de consumo y reposición con validaciones y transacciones seguras.
- Importación/exportación: soporte para CSV/XLSX y plantillas de EasyEDA, con validaciones y mapeo de campos.
- Integración con API: preparación para integrar con APIs de proveedores (por ejemplo, LCSC) y herramientas de diseño (EasyEDA).
- Base de datos local: persistencia confiable mediante SQLite, con soporte para entornos web mediante SQLite WebAssembly.

**Sección sources**
- [pages/index.vue](file://pages/index.vue#L1-L120)
- [components/ImportModal.vue](file://components/ImportModal.vue#L1-L120)
- [composables/useExport.ts](file://composables/useExport.ts#L1-L80)
- [composables/useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts#L1-L80)
- [data/db/schema.json](file://data/db/schema.json#L1-L37)

## Arquitectura tecnológica
La solución adopta una arquitectura híbrida multiplataforma:
- Interfaz frontend: Vue 3/Nuxt 4 con componentes reutilizables y rutas definidas.
- Backend: Tauri/Rust para funcionalidades nativas de escritorio, plugins de sistema y base de datos local.
- Persistencia: SQLite local, con soporte adicional para SQLite en navegador mediante SQLite WebAssembly.
- Integraciones: preparación para APIs externas (proveedores y herramientas de diseño).

Ventajas de la arquitectura:
- Rendimiento nativo y seguridad de aplicaciones de escritorio.
- Portabilidad multiplataforma con un solo código base.
- Persistencia local robusta y fácil de desplegar sin servidor central.

**Sección sources**
- [README.md](file://README.md#L81-L101)
- [nuxt.config.ts](file://nuxt.config.ts#L1-L67)
- [package.json](file://package.json#L1-L50)
- [src-tauri/Cargo.toml](file://src-tauri/Cargo.toml#L1-L31)

## Solución de problemas y beneficios
BOM Manager resuelve problemas específicos de gestión de componentes electrónicos:
- Centralización de datos: todo el BOM y el historial de actividad en un solo lugar.
- Control de stock en tiempo real: actualizaciones automáticas y alertas configurables.
- Facilita la adquisición: integración con APIs de proveedores para búsqueda, precios y órdenes.
- Reducción de errores: validaciones en importaciones, mapeo de campos y revisiones previas.

Beneficios clave:
- Mejora la productividad al evitar múltiples sistemas dispersos.
- Facilita auditorías y trazabilidad gracias al registro de actividad.
- Optimiza costos mediante el control preciso de stock y alertas de reposición.

**Sección sources**
- [pages/index.vue](file://pages/index.vue#L120-L294)
- [components/ImportModal.vue](file://components/ImportModal.vue#L120-L300)
- [composables/useItemsDatabase.ts](file://composables/useItemsDatabase.ts#L180-L252)
- [composables/useProjectsDatabase.ts](file://composables/useProjectsDatabase.ts#L1-L128)

## Resumen
BOM Manager es una solución integral y multiplataforma para ingeniería electrónica. Gracias a su arquitectura híbrida, base de datos local, capacidades de importación/exportación y preparación para integraciones con APIs, permite a ingenieros, técnicos y pequeñas empresas gestionar eficientemente su inventario, proyectos y adquisiciones. Su diseño modular y su enfoque en la experiencia de usuario hacen de esta aplicación una herramienta práctica y escalable.