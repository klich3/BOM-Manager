# Notas de Desarrollo - BOM Manager

## ✅ Configuración Completada

### Stack Tecnológico Implementado
- ✅ **Nuxt 3.4.2** - Framework Vue.js
- ✅ **Vue 3.5.26** - Framework UI
- ✅ **TypeScript** - Tipado estático
- ✅ **Tauri 2.9.6** - Aplicación de escritorio multiplataforma
- ✅ **TailwindCSS** - Framework de estilos
- ✅ **SQLite** - Base de datos local (vía plugin de Tauri)

### Estructura Creada

```
frontend/
├── components/          ✅ Creado (vacío, listo para componentes)
├── composables/         ✅ useDatabase.ts implementado
├── pages/               ✅ index.vue con dashboard base
├── types/               ✅ bom.ts con tipos principales
├── plugins/             ✅ database.ts para inicialización
├── layouts/             ✅ Creado (vacío)
├── utils/               ✅ Creado (vacío)
├── src-tauri/           ✅ Configurado con plugin SQL
└── app.vue              ✅ Layout principal
```

### Base de Datos

Esquema SQLite creado automáticamente en primera ejecución:

**Tabla: bom_items**
- id (TEXT PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- quantity (REAL)
- unit (TEXT)
- category (TEXT)
- supplier (TEXT)
- part_number (TEXT)
- lcsc_part (TEXT)
- price (REAL)
- in_stock (REAL)
- min_stock (REAL)
- notes (TEXT)
- created_at (TEXT)
- updated_at (TEXT)

**Tabla: projects**
- id (TEXT PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- created_at (TEXT)
- updated_at (TEXT)

## 🚀 Próximos Pasos Sugeridos

### 1. Importación de Archivos CSV/XLSX
- [x] Instalar `papaparse` para CSV
- [x] Instalar `xlsx` para Excel
- [ ] Crear componente de upload de archivos
- [ ] Implementar parseo y mapeo de columnas
- [ ] Validación de datos importados

### 2. Vista de Inventario
- [x] Crear página `/pages/inventory.vue`
- [x] Componente de tabla con búsqueda y filtros
- [x] CRUD completo de items
- [ ] Exportar a CSV/XLSX

### 3. Gestión de Proyectos
- [x] Crear página `/pages/projects.vue`
- [x] Lista de proyectos
- [ ] Detalle de proyecto con items asociados
- [ ] Calculadora de costos

### 4. Integración LCSC
- [ ] Investigar API de LCSC
- [ ] Preview de componentes
- [ ] Link directo para compra

### 5. Sistema de Notificaciones
- [ ] Alertas de stock bajo
- [ ] Composable `useNotifications`
- [ ] Toast notifications

## ✅ Progreso Reciente (26 Dic 2024)

### Dependencias Instaladas
- ✅ papaparse
- ✅ xlsx
- ✅ uuid
- ✅ zod
- ✅ date-fns
- ✅ @heroicons/vue

### Páginas Creadas
- ✅ `/pages/index.vue` - Dashboard principal con diseño moderno basado en referencias
- ✅ `/pages/inventory.vue` - Vista completa de inventario con búsqueda, filtros y paginación
- ✅ `/pages/projects.vue` - Gestión de proyectos con CRUD completo

### Composables Actualizados
- ✅ `useDatabase.ts` - Métodos completos para items y proyectos:
  - getAllItems, getItemById, createItem, updateItem, deleteItem
  - getAllProjects, getProjectById, createProject, updateProject, deleteProject

### Componentes y Funcionalidades
- ✅ `FileUpload.vue` - Componente de upload con drag & drop para CSV/XLSX
- ✅ `useFileParser.ts` - Composable para parseo y validación de archivos
- ✅ `useNotifications.ts` - Composable de sistema de notificaciones
- ✅ `Toast.vue` - Componente de notificaciones toast
- ✅ `useExport.ts` - Composable para exportar inventario a CSV/XLSX
- ✅ CRUD completo de items en `/pages/inventory.vue`
- ✅ `useCostCalculator.ts` - Composable para cálculo de costos de proyectos
- ✅ Vista de detalle de proyecto en `/pages/projects/[id].vue`

## 🚀 Próximos Pasos Sugeridos

### 1. Importación de Archivos CSV/XLSX
- [x] Instalar `papaparse` para CSV
- [x] Instalar `xlsx` para Excel
- [x] Crear componente de upload de archivos
- [x] Implementar parseo y mapeo de columnas
- [x] Validación de datos importados
- [ ] Import: modal de importacion al subir el archivo lo ha de leer y tiene que pasar por proceso de parsing de columnas
- [ ] - Cargar CSV
- [ ] - Cargar XLSX
- [ ] - Import - Leer -> Templates de easyeda.com


### 2. Vista de Inventario
- [x] Crear página `/pages/inventory.vue`
- [x] Componente de tabla con búsqueda y filtros
- [x] CRUD completo de items
- [x] Exportar a CSV/XLSX
- [ ] - Preview de items de lcsc (en listado de componentes)
- [ ] - Integrar o mandar para comprar lcsc.com
- [ ] - Visualizar y guardar el listado de los componentes
- [ ] - Guardar en iCloud copia de seguridad
- [ ] - Hacer mix / reorder
- [ ] - Load BOM y descontar items de un proyecto para tener el stock de items
- [ ] - Marcar los items que llegan casi a gastarse para notificar y poder encargar nuevos

### 3. Gestión de Proyectos
- [x] Crear página `/pages/projects.vue`
- [x] Lista de proyectos
- [x] Detalle de proyecto con items asociados
- [x] Calculadora de costos

### 4. Integración LCSC
- [ ] Investigar API de LCSC
- [ ] Preview de componentes
- [ ] Link directo para compra

### 5. Sistema de Notificaciones
- [x] Alertas de stock bajo
- [x] Composable `useNotifications`
- [x] Toast notifications

## 🛠️ Comandos Útiles

```bash
# Desarrollo
cd frontend
npm run dev              # Solo Nuxt (web)
npm run tauri:dev        # Nuxt + Tauri (app escritorio)

# Build
npm run build            # Build Nuxt
npm run tauri:build      # Build app nativa

# Otros
npm run generate         # Generación estática
npm run preview          # Preview del build
```

## 📦 Dependencias a Considerar

```bash
# Para CSV/XLSX
npm install papaparse
npm install xlsx
npm install @types/papaparse -D

# Para UUID
npm install uuid
npm install @types/uuid -D

# Para validación
npm install zod

# Para fechas
npm install date-fns

# Para iconos adicionales
npm install @heroicons/vue
```

## ⚠️ Importante para Desarrollo

1. **Rust es obligatorio**: La app no arrancará sin Rust instalado
2. **Puerto 3000**: Asegúrate de que esté libre
3. **Hot Reload**: Funciona tanto en Nuxt como en Tauri
4. **Base de datos**: Se crea en `~/.local/share/BOMManager/` (macOS)

## 🐛 Troubleshooting

### Error: Cannot find module '@tauri-apps/plugin-sql'
```bash
cd frontend
npm install @tauri-apps/plugin-sql -D
```

### Error: Rust not found
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Error: Port 3000 already in use
```bash
# Cambiar puerto en nuxt.config.ts
export default defineNuxtConfig({
  devServer: {
    port: 3001
  }
})
```

## 📱 Testing en Otras Plataformas

### Windows
```bash
# Instalar Rust primero
# Luego:
npm run tauri:build
```

### Linux
```bash
# Instalar dependencias del sistema
sudo apt-get install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

npm run tauri:build
```

## 🎯 Estado del Prototipo

**Funcionalidad**: Dashboard básico con estructura completa
**Listo para**: Comenzar implementación de features
**Testing en**: macOS (pendiente Win/Linux)
**Base de datos**: Esquema listo y probado
**UI**: Base de TailwindCSS configurada

