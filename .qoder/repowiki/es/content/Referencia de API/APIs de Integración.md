# APIs de Integración

<cite>
**Archivos referenciados en este documento**
- [wiki/LCSC_API_INTEGRATION.md](file://wiki/LCSC_API_INTEGRATION.md)
- [wiki/EASYEDA_API_INTEGRATION.md](file://wiki/EASYEDA_API_INTEGRATION.md)
- [useLCSC.ts](file://composables/useLCSC.ts)
- [LCSCPreview.vue](file://components/LCSCPreview.vue)
- [useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts)
- [EasyEDAImporter.vue](file://components/EasyEDAImporter.vue)
- [images.get.ts](file://server/api/images.get.ts)
- [proxy-file.post.ts](file://server/api/proxy-file.post.ts)
- [setHeaders.ts](file://server/middleware/setHeaders.ts)
- [useItemsDatabase.ts](file://composables/useItemsDatabase.ts)
- [useFilesDatabase.ts](file://composables/useFilesDatabase.ts)
- [useFileManager.ts](file://composables/useFileManager.ts)
- [bom.ts](file://types/bom.ts)
- [package.json](file://package.json)
</cite>

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Componentes Principales](#componentes-principales)
4. [Arquitectura General](#arquitectura-general)
5. [Análisis Detallado de Componentes](#análisis-detallado-de-componentes)
6. [Análisis de Dependencias](#análisis-de-dependencias)
7. [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)
8. [Guía de Solución de Problemas](#guía-de-solución-de-problemas)
9. [Conclusión](#conclusión)

## Introducción
Este documento proporciona una guía completa de las APIs de integración implementadas en BOM Manager, enfocándose en dos principales integraciones:

- **LCSC API**: Integración para búsqueda de componentes, obtención de imágenes, descarga de datasheets y validación de números de parte
- **EasyEDA API**: Integración para importación de plantillas de diseño y extracción de componentes

El sistema combina una interfaz frontend Vue 3 con composable functions, un backend Nuxt API server y una base de datos local SQLite/WASM, con soporte para Tauri en entornos nativos.

## Estructura del Proyecto
La solución se organiza en módulos bien definidos:

```mermaid
graph TB
subgraph "Frontend"
UI[Vue Components]
Composables[Composable Functions]
Types[Type Definitions]
end
subgraph "Backend"
API[API Routes]
Middleware[Server Middleware]
end
subgraph "Datos"
DB[SQLite/WASM Database]
Files[File Storage]
end
subgraph "Sistemas Externos"
LCSC[LCSC API]
EasyEDA[EasyEDA API]
end
UI --> Composables
Composables --> API
API --> DB
API --> Files
Composables --> LCSC
Composables --> EasyEDA
UI --> Types
```

**Diagrama fuente**
- [useLCSC.ts](file://composables/useLCSC.ts#L1-L353)
- [useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts#L1-L187)
- [images.get.ts](file://server/api/images.get.ts#L1-L120)
- [proxy-file.post.ts](file://server/api/proxy-file.post.ts#L1-L78)

**Sección fuente**
- [package.json](file://package.json#L1-L50)

## Componentes Principales

### Integración LCSC
La integración LCSC se implementa a través de un composable que maneja toda la lógica de búsqueda, descarga y almacenamiento de componentes:

```mermaid
classDiagram
class LCSCComponent {
+string partNumber
+string name
+string description
+string image
+string[] images
+string datasheet
+number price
+number stock
+string manufacturer
+string category
+Record parameters
}
class LCSCService {
+isLoading : Ref<boolean>
+error : Ref<string|null>
+searchComponent(partNumber, itemId) LCSCComponent
+getComponentImages(partNumber, itemId) string[]
+getPurchaseLink(partNumber) string
+validatePartNumber(partNumber) boolean
}
class ImageProxy {
+extractImages(url) Promise<object>
}
class FileProxy {
+downloadFile(url, filename, type) Promise<object>
}
LCSCService --> LCSCComponent : "crea"
LCSCService --> ImageProxy : "usa"
LCSCService --> FileProxy : "usa"
```

**Diagrama fuente**
- [useLCSC.ts](file://composables/useLCSC.ts#L6-L18)
- [useLCSC.ts](file://composables/useLCSC.ts#L20-L353)
- [images.get.ts](file://server/api/images.get.ts#L19-L120)
- [proxy-file.post.ts](file://server/api/proxy-file.post.ts#L8-L78)

### Integración EasyEDA
La integración EasyEDA permite importar plantillas JSON y extraer componentes para su procesamiento:

```mermaid
classDiagram
class EasyEDAImporter {
+isLoading : Ref<boolean>
+error : Ref<string|null>
+importTemplate(file) Promise<object>
+convertToInternalFormat(components) any[]
}
class TemplateValidator {
+isValidEasyEDATemplate(data) boolean
+extractComponentsFromTemplate(jsonData) any[]
+extractMetadata(jsonData) any
}
class FileProcessor {
+readFileAsText(file) Promise<string>
}
EasyEDAImporter --> TemplateValidator : "usa"
EasyEDAImporter --> FileProcessor : "usa"
```

**Diagrama fuente**
- [useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts#L3-L187)

**Sección fuente**
- [useLCSC.ts](file://composables/useLCSC.ts#L1-L353)
- [useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts#L1-L187)

## Arquitectura General

### Flujo de Integración LCSC
```mermaid
sequenceDiagram
participant UI as "Interfaz de Usuario"
participant LCSC as "useLCSC"
participant Proxy as "Proxy de Imágenes"
participant Server as "Servidor Nuxt"
participant LCSC_API as "LCSC API"
participant Files as "Almacenamiento de Archivos"
UI->>LCSC : searchComponent(partNumber, itemId)
LCSC->>LCSC : Buscar imágenes locales
alt Imágenes no encontradas
LCSC->>Proxy : getComponentImages(partNumber, itemId)
Proxy->>Server : GET /api/images?url=...
Server->>LCSC_API : $fetch(product-detail-page)
LCSC_API-->>Server : HTML con imágenes
Server-->>Proxy : URLs de imágenes
Proxy-->>LCSC : Array de URLs
LCSC->>Files : Guardar imágenes localmente
end
LCSC->>LCSC : Buscar datasheet local
alt Datasheet no encontrado
LCSC->>Server : POST /api/proxy-file
Server->>LCSC_API : Descargar PDF
LCSC_API-->>Server : PDF en base64
Server-->>LCSC : Data URL del PDF
LCSC->>Files : Guardar PDF localmente
end
LCSC-->>UI : Componente completo con imágenes y datasheet
```

**Diagrama fuente**
- [useLCSC.ts](file://composables/useLCSC.ts#L26-L261)
- [images.get.ts](file://server/api/images.get.ts#L23-L97)
- [proxy-file.post.ts](file://server/api/proxy-file.post.ts#L8-L70)

### Flujo de Integración EasyEDA
```mermaid
sequenceDiagram
participant UI as "Interfaz de Usuario"
participant Importer as "useEasyEDAImporter"
participant Parser as "JSON Parser"
participant DB as "Base de Datos"
UI->>Importer : importTemplate(file)
Importer->>Importer : Validar tipo de archivo
Importer->>Parser : readFileAsText(file)
Parser-->>Importer : Contenido JSON
Importer->>Importer : isValidEasyEDATemplate(data)
alt Válido
Importer->>Importer : extractComponentsFromTemplate(data)
Importer->>Importer : extractMetadata(data)
Importer-->>UI : Resultado con componentes y metadatos
UI->>Importer : convertToInternalFormat(components)
Importer-->>UI : Componentes en formato interno
else Inválido
Importer-->>UI : Error de validación
end
```

**Diagrama fuente**
- [useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts#L7-L48)
- [EasyEDAImporter.vue](file://components/EasyEDAImporter.vue#L291-L304)

## Análisis Detallado de Componentes

### Composable LCSC (useLCSC)
El composable LCSC implementa una estrategia de caché inteligente combinando almacenamiento local con descargas remotas:

#### Estructura de Datos
```typescript
interface LCSCComponent {
    partNumber: string;
    name?: string;
    description?: string;
    image?: string;
    images?: string[];
    datasheet?: string;
    price?: number;
    stock?: number;
    manufacturer?: string;
    category?: string;
    parameters?: Record<string, any>;
}
```

#### Funciones Principales

##### Búsqueda de Componentes
La función `searchComponent` implementa un flujo de búsqueda con múltiples niveles de caché:

```mermaid
flowchart TD
Start([Inicio de búsqueda]) --> LoadLocal["Buscar imágenes locales"]
LoadLocal --> HasLocal{"Imágenes encontradas?"}
HasLocal --> |Sí| LoadPDF["Buscar PDF local"]
HasLocal --> |No| DownloadImages["Descargar imágenes remotas"]
DownloadImages --> SaveImages["Guardar imágenes localmente"]
SaveImages --> LoadPDF
LoadPDF --> HasPDF{"PDF encontrado?"}
HasPDF --> |Sí| BuildComponent["Construir componente"]
HasPDF --> |No| DownloadPDF["Descargar PDF remoto"]
DownloadPDF --> ProxyCheck{"Usar proxy?"}
ProxyCheck --> |Sí| UseProxy["POST /api/proxy-file"]
ProxyCheck --> |No| DirectDownload["Descarga directa"]
UseProxy --> SavePDF["Guardar PDF localmente"]
DirectDownload --> SavePDF
SavePDF --> BuildComponent
BuildComponent --> End([Componente completo])
```

**Diagrama fuente**
- [useLCSC.ts](file://composables/useLCSC.ts#L26-L261)

##### Gestión de Archivos
El sistema maneja archivos de manera diferente según el entorno:

```mermaid
flowchart TD
FileOperation[Operación de Archivo] --> CheckEnv{"Entorno Tauri?"}
CheckEnv --> |Sí| TauriOps[Tauri File Operations]
CheckEnv --> |No| WebOps[Web/OPFS Operations]
TauriOps --> TauriSave["saveFileToTauri"]
TauriSave --> TauriDelete["deleteTauriFile"]
WebOps --> OPSFSave["saveFileToOPFS"]
OPSFSave --> OPFSDelete["Eliminar archivo OPFS"]
TauriDelete --> Cleanup[Revisión de URLs]
OPFSDelete --> Cleanup
Cleanup --> Complete[Operación completada]
```

**Diagrama fuente**
- [useFileManager.ts](file://composables/useFileManager.ts#L111-L192)

#### Validación de Números de Parte
La implementación incluye validación de números de parte LCSC:

```mermaid
flowchart TD
Validate[Validar Part Number] --> PatternCheck{"Coincide patrón LCSC?"}
PatternCheck --> |Sí| Valid[Part Number Válido]
PatternCheck --> |No| Invalid[Part Number Inválido]
PatternCheck --> Pattern[/^[A-Z]\\d{6,}$/i/]
```

**Diagrama fuente**
- [useLCSC.ts](file://composables/useLCSC.ts#L337-L343)

### Composable EasyEDA (useEasyEDAImporter)
El composable EasyEDA implementa un parser flexible para diferentes formatos de plantillas:

#### Estructura de Componentes
```typescript
interface EasyEDAComponent {
    id: string;
    name: string;
    type: string;
    properties?: any;
}
```

#### Procesamiento de Plantillas
El sistema puede manejar múltiples formatos de EasyEDA:

```mermaid
flowchart TD
Template[Plantilla JSON] --> CheckHead{"Contiene head?"}
CheckHead --> |Sí| ParseHead["Parsear head.symbols"]
CheckHead --> |No| CheckModules{"Contiene modules?"}
CheckModules --> |Sí| ParseModules["Parsear modules.symbols"]
CheckModules --> |No| CheckShapes{"Contiene shapes?"}
CheckShapes --> |Sí| ParseShapes["Parsear shapes (lib)"]
CheckShapes --> |No| CheckParts{"Contiene parts?"}
CheckParts --> |Sí| ParseParts["Parsear parts"]
CheckParts --> |No| Error[Formato inválido]
ParseHead --> Merge[Unir componentes]
ParseModules --> Merge
ParseShapes --> Merge
ParseParts --> Merge
Merge --> Success[Extracción exitosa]
```

**Diagrama fuente**
- [useEasyEDAImporter.ts](file://composables/useEasyEDAImporter.ts#L70-L138)

### Componentes de Interfaz

#### Vista Previa LCSC
El componente LCSCPreview proporciona una interfaz completa para mostrar información de componentes:

```mermaid
classDiagram
class LCSCPreview {
+show : boolean
+itemData : any
+partNumber : string
+itemId : string
+lcscData : any
+isLoading : boolean
+error : string
+imageError : boolean
+imageErrorIndexes : number[]
+closePreview()
+handleImageError(index)
+openDatasheet(url)
}
class LCSCService {
+searchComponent(partNumber, itemId)
+getPurchaseLink(partNumber)
}
LCSCPreview --> LCSCService : "usa"
```

**Diagrama fuente**
- [LCSCPreview.vue](file://components/LCSCPreview.vue#L152-L230)

#### Importador EasyEDA
El componente EasyEDAImporter implementa una interfaz drag-and-drop para importación de plantillas:

```mermaid
stateDiagram-v2
[*] --> EsperandoArchivo
EsperandoArchivo --> Procesando : Archivo seleccionado
Procesando --> Exito : Validación exitosa
Procesando --> Error : Validación fallida
Exito --> VistaPrevia : Mostrar componentes
VistaPrevia --> Importando : Confirmar importación
Importando --> Exito : Importación completada
Error --> EsperandoArchivo : Reiniciar
```

**Diagrama fuente**
- [EasyEDAImporter.vue](file://components/EasyEDAImporter.vue#L236-L310)

**Sección fuente**
- [LCSCPreview.vue](file://components/LCSCPreview.vue#L1-L230)
- [EasyEDAImporter.vue](file://components/EasyEDAImporter.vue#L1-L311)

## Análisis de Dependencias

### Dependencias Externas
El proyecto depende de varias bibliotecas clave:

```mermaid
graph LR
subgraph "Frontend"
Vue[Vue 3]
Nuxt[Nuxt 4]
Pinia[Pinia State Management]
end
subgraph "Bibliotecas"
Cheerio[Cheerio HTML Parser]
Sqlite[SQLite/WASM]
Tauri[Tauri Framework]
end
subgraph "APIs Externas"
LCSC[LCSC API]
EasyEDA[EasyEDA API]
end
Vue --> Nuxt
Nuxt --> Pinia
Nuxt --> Cheerio
Nuxt --> Sqlite
Vue --> Tauri
Nuxt --> LCSC
Nuxt --> EasyEDA
```

**Diagrama fuente**
- [package.json](file://package.json#L16-L29)

### Middleware de Seguridad
El servidor implementa políticas de seguridad CORS:

```mermaid
flowchart TD
Request[Petición Entrante] --> CheckCOOP{"Validar COOP"}
CheckCOOP --> CheckCOEP{"Validar COEP"}
CheckCOOP --> SetHeaders["Establecer cabeceras"]
CheckCOEP --> SetHeaders
SetHeaders --> Allow[Permitir petición]
```

**Diagrama fuente**
- [setHeaders.ts](file://server/middleware/setHeaders.ts#L3-L6)

**Sección fuente**
- [package.json](file://package.json#L16-L49)

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
1. **Caché Inteligente**: Las imágenes y PDFs se almacenan localmente para evitar descargas repetidas
2. **Descarga Asíncrona**: Las operaciones de descarga no bloquean la interfaz de usuario
3. **Validación Temprana**: Los formatos de archivo se validan antes del procesamiento completo
4. **Gestión de Memoria**: Los componentes de imagen manejan errores de carga sin afectar el rendimiento general

### Límites de Tasa y Manejo de Errores
- **LCSC API**: Implementar límites de tasa basados en el tiempo de espera de las respuestas
- **CORS Proxy**: El proxy de archivos evita problemas de CORS y limita descargas a dominios LCSC
- **Fallbacks**: Implementación de mecanismos de fallback cuando las descargas directas fallan

### Mejores Prácticas
1. **Almacenamiento Local**: Utilizar OPFS en navegadores modernos para almacenamiento persistente
2. **Validación de Entrada**: Verificar siempre los formatos de entrada antes del procesamiento
3. **Manejo de Errores**: Implementar bloques try-catch para operaciones críticas
4. **Optimización de Imágenes**: Reducir el tamaño de las imágenes antes de almacenarlas

## Guía de Solución de Problemas

### Errores Comunes en LCSC API
- **424-438**: Errores de autenticación y límites de tasa según la documentación oficial
- **Timeout de Descarga**: Implementar reintentos con backoff exponencial
- **Formato de URL Inválido**: Validar URLs antes de realizar solicitudes

### Errores en EasyEDA Importer
- **Formato JSON Inválido**: Verificar estructura antes de parsear
- **Archivos No Soportados**: Validar extensiones permitidas (.json)
- **Componentes Sin Nombre**: Proporcionar valores por defecto

### Diagnóstico de Problemas
1. **Verificar Conexión**: Confirmar acceso a internet y dominios LCSC/EasyEDA
2. **Revisar Almacenamiento**: Verificar espacio disponible en OPFS/Tauri
3. **Monitorear Errores**: Revisar consola del navegador para mensajes de error
4. **Pruebas Unitarias**: Implementar pruebas para validaciones críticas

**Sección fuente**
- [wiki/LCSC_API_INTEGRATION.md](file://wiki/LCSC_API_INTEGRATION.md#L99-L108)

## Conclusión

La implementación de las APIs de integración en BOM Manager demuestra un enfoque robusto y escalable para trabajar con servicios externos:

### Logros Alcanzados
- **Integración Completa**: Implementación funcional de ambas APIs con manejo de errores adecuado
- **Almacenamiento Inteligente**: Estrategias de caché que mejoran el rendimiento
- **Interfaz Amigable**: Componentes de UI que facilitan la experiencia del usuario
- **Seguridad**: Implementación de políticas de seguridad y validación de datos

### Consideraciones Futuras
1. **Mejoras de Rendimiento**: Implementar cacheado más avanzado y prefetching
2. **Monitoreo**: Agregar métricas de rendimiento y monitoreo de errores
3. **Escalabilidad**: Considerar implementación de workers para procesamiento pesado
4. **Documentación**: Expandir la documentación técnica con ejemplos completos

La arquitectura actual proporciona una base sólida para futuras expansiones y mejora continua de las capacidades de integración.