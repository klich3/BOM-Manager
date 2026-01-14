- [x] - user settings -> https://v2.tauri.app/plugin/window-state/
- [x] home hay que modificar el items cuentas


### 1. Importación de Archivos CSV/XLSX
- [x] Instalar `papaparse` para CSV
- [x] Instalar `xlsx` para Excel
- [x] Crear componente de upload de archivos
- [x] Implementar parseo y mapeo de columnas
- [x] Validación de datos importados
- [x] Import: modal de importacion al subir el archivo lo ha de leer y tiene que pasar por proceso de parsing de columnas
- [x] - import mapeo no es preciso hay que poner las columnas que hay en csv y mostrarlas completamente
- [x] - import definir al cual Proyecto pertenece el BOM
- [x] - Cargar CSV
- [x] - Cargar XLSX
- [x] - Import - Leer -> Templates de easyeda.com
- [x] - Import -> cuadrar las columnas 
- [x] - Import stock min si se elecciona hay que poner un campo para poner un valor en la pantalla 3, tambien poner una nota informativa arriba
-> - [x] - Import -> decidir si en una lista nueva si pertenece a algun proyecto, definir si ya tienes este stock o es por pedir
-> - [x] - Si es para pedir hay que cotejar con los que hay para decidir los que faltan para comprar
-> - [x] - hay que hacer check si  ya hay un item con misma ref hay que sumar in_stock
-> - [x] - si se importa el mismo componente y no tienen precio o otra columna se completa con datos nuevos, si hay que preguntar si aumentar el stock o no
- [x] - Load BOM y descontar items de un proyecto para tener el stock de items
- [x] - al importar hay que pregunta si es nuevo proyecto, hay que cotejar las lscs referencias si hay y las unidades, si saltan marcar en rojo que hay que comprar, si estan marcar en verde y en blanco por pedir
- [x] **NUEVO**: Implementar "Modo Preview" de importación (ver cambios antes de aplicar a DB)
- [x] **NUEVO**: Detectar duplicados por Part Number o LCSC Ref automáticamente

### 2. Vista de Inventario
- [x] Crear página `/pages/inventory.vue`
- [x] Componente de tabla con búsqueda y filtros
- [x] CRUD completo de items
- [x] Exportar a XLSX
- [x] tablas poner seleccionar todos o unos cuantos para eliminar
- [x] - seleccion varios, opcion modal asignar a un proyecto
-> - [x] - Preview de items de lcsc (en listado de componentes)
- [x] - Integrar o mandar para comprar lcsc.com
- [x] - Visualizar y guardar el listado de los componentes
- [x] - Guardar en iCloud copia de seguridad (Implementado vía ZIP/Git Sync como alternativa universal)
-> - [x] - Marcar los items que llegan casi a gastarse para notificar y poder encargar nuevos
- [ ] - Hacer mix / reorder
- [x] - si se borra item hay que borrar tmp files de thumb + pdf

-> - [x] hay que hacer una funcion para cuando subo un listado poder comparar de los que ya hay y los que faltan
- [x] - **NUEVO**: Historial de movimientos de stock por item (entradas/salidas)
- [x] - **NUEVO**: Gestión de etiquetas (Tags) para organizar componentes (ej: "SMD", "0603", "Power")

### 3. Gestión de Proyectos
- [x] Crear página `/pages/projects.vue`
- [x] Lista de proyectos
- [x] Detalle de proyecto con items asociados
- [x] Calculadora de costos
- [x] cargar gerber para saber cuantas partes se usan por pcb (Visualizador Centroid/XY implementado)
- [x] al cargar gerber hacer un ayudante en donde van los compoenentes marcando el sitio, puede ser como figma una panel libre una pizzara...
- [x] en tarjeta poner $ coste por piezas
- [x] en tarjeta poner $ coste por pcb
- [x] en detalle de proyecto poner coste de PCB
- [x] en el bg hay que implementar el thumb
- [x] - **NUEVO**: Estado del proyecto (Borrador, Prototipo, Producción, Archivado)
- [ ] - **NUEVO**: Comparador de versiones de BOM dentro de un mismo proyecto

### 4. Integración LCSC
- [x] Investigar API de LCSC
- [x] Preview de componentes
- [-] Link directo para compra
- [x] - **NUEVO**: Actualización masiva de precios desde LCSC
- [x] - **NUEVO**: Visor de datasheets integrado (PDF Viewer)

### 5. Sistema de Notificaciones
- [x] Alertas de stock bajo
- [x] Composable `useNotifications`
- [x] Toast notifications
- [x] - **NUEVO**: Notificaciones push nativas (vía Tauri) para alertas críticas

### 6. Export y Backup
- [x] Posibilidad de exportar la DB -> para importar en osx o otro device
- [ ] - mejorar el importa da json diseño en modal de settings con avisos etc....
- [x] se tienen que crear un zip con files de OPFS en web para export 
- [x] import del zip para archivos temp
- [x] - **NUEVO**: Sincronización automática con repositorio Git (para compartir DB entre equipos)

### 7. Local Storage y Archivos
- [x] cuando se cargan imagenes de lscs -> hay que guardarlas en carpeta tmp para que sea offline
- [x] hay que cargar desde local si esta el file si no -> descargar
- [x] lo mismo cuando se carga los detalles de productos tambien seria bueno guardar + doc/pdf
- [x] - **NUEVO**: Limpieza automática de archivos huérfanos (imágenes/PDFs sin item asociado)

### 8. Settings
- [x] Poner cantidad de items por pagina
- [x] Poner decimal por pais
- [x] Slector de $ currency
- [x] Slector de pais
- [x] - **NUEVO**: Soporte multi-idioma (i18n)
- [x] - **NUEVO**: Personalización de temas (Dark/Light mode persistente)
