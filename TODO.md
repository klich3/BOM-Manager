- [ ] - user settings -> https://v2.tauri.app/plugin/window-state/
- [x] home hay que modificar el items cuentas

### 1. Importación de Archivos CSV/XLSX
- [x] Instalar `papaparse` para CSV
- [x] Instalar `xlsx` para Excel
- [x] Crear componente de upload de archivos
- [x] Implementar parseo y mapeo de columnas
- [x] Validación de datos importados
- [x] Import: modal de importacion al subir el archivo lo ha de leer y tiene que pasar por proceso de parsing de columnas
-> - [ ] - import mapeo no es preciso hay que poner las columnas que hay en csv y mostrarlas completamente
- [x] - import definir al cual Proyecto pertenece el BOM
- [x] - Cargar CSV
- [ ] - Cargar XLSX
- [ ] - Import - Leer -> Templates de easyeda.com
- [ ] - Import -> cuadrar las columnas 
- [ ] - Import -> decidir si en una lista nueva si pertenece a algun proyecto, definir si ya tienes este stock o es por pedir
- [ ] - Si es para pedir hay que cotejar con los que hay para decidir los que faltan para comprar

### 2. Vista de Inventario
- [x] Crear página `/pages/inventory.vue`
- [x] Componente de tabla con búsqueda y filtros
- [x] CRUD completo de items
- [x] Exportar a CSV/XLSX
- [x] tablas poner seleccionar todos o unos cuantos para eliminar
-> - [ ] - seleccion varios, opcion modal asignar a un proyecto
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
- [ ] cargar gerber para saber cuantas partes se usan por pcb
- [ ] al cargar gerber hacer un ayudante en donde van los compoenentes marcando el sitio, puede ser como figma una panel libre una pizzara...


### 4. Integración LCSC
- [ ] Investigar API de LCSC
- [ ] Preview de componentes
- [ ] Link directo para compra

### 5. Sistema de Notificaciones
- [x] Alertas de stock bajo
- [x] Composable `useNotifications`
- [x] Toast notifications


### 6. Export
- [ ] Posibilidad de exportar la DB -> para importar en osx o otro device

### 7. Local storage
- [ ] cuando se cargan imagenes de lscs -> hay que guardarlas en carpeta tmp para que sea offline
- [ ] lo mismo cuando se carga los detalles de productos tambien seria bueno guardar + doc/pdf