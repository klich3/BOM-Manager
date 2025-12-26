# Integración con EasyEDA API

## Descripción General
EasyEDA proporciona una API que permite interactuar con su plataforma de diseño de PCB. Esta API permite a los desarrolladores automatizar tareas de diseño, importar/exportar proyectos y manipular elementos de diseño mediante código.

## APIs Disponibles

### 1. getSource
- **Descripción**: Obtiene el código fuente de un proyecto de EasyEDA en diferentes formatos
- **Tipos disponibles**:
  - `json`: Obtiene objetos JSON de EasyEDA
  - `compress`: Obtiene una cadena comprimida (usada en la base de datos de EasyEDA)
  - `svg`: Obtiene una cadena SVG

### 2. applySource
- **Descripción**: Aplica código fuente a un editor de EasyEDA
- **Uso**: Puede aplicar cadenas comprimidas o objetos JSON a proyectos nuevos o existentes

### 3. getShape
- **Descripción**: Obtiene un objeto de EasyEDA por su ID
- **Uso**: `api('getShape', {id:'gge13'})`

### 4. deleteShapes
- **Descripción**: Elimina formas del diseño

### 5. updateShape
- **Descripción**: Modifica un objeto de EasyEDA existente
- **Parámetros**: shapeType, jsonCache (con propiedades como gId, net, shape, etc.)

### 6. createShape
- **Descripción**: Crea nuevas formas en el diseño
- **Parámetros**: shapeType, shortUrl, from, title, x, y, jsonCache (con propiedades específicas)

## Formatos de Archivo

### Formato JSON de Esquemáticos
- EasyEDA utiliza un formato JSON estructurado para representar esquemáticos
- Incluye claves para diferentes unidades gráficas como "wire", "Symbol", "junction", etc.
- Utiliza una clave "itemOrder" para mantener el orden de los elementos
- Soporta delimitadores especiales (`~`, `` ` ``, `^^`, `#@$`) para separar atributos

## Posibilidades de Importación de Templates

### Importación de Archivos JSON
1. **Desde EasyEDA Standard a Pro**:
   - Exportar proyecto como archivo .json desde EasyEDA Pro
   - Importar en EasyEDA Standard usando "File -> Import -> EasyEDA (standard)"

2. **Importación Directa**:
   - Si hay un proyecto abierto, se puede importar un archivo JSON individual
   - Si no hay proyecto abierto, usar la opción "Migrate to Standard Version"

3. **Archivos de Librería**:
   - Exportar librería en formato EasyEDA Standard
   - Durante importación, elegir generar dispositivos o símbolos

### Consideraciones Importantes
- Si un esquemático incluye un PCB, ambos archivos deben comprimirse juntos antes de importar
- Algunos componentes pueden necesitar actualización o reemplazo después de importar
- El formato JSON incluye información sobre coordenadas, capas, y propiedades de componentes

## Integración con Nuestra Aplicación

### 1. Importación de Templates
- Permitir a los usuarios importar archivos JSON de EasyEDA como templates
- Parsear el formato JSON para extraer información de componentes
- Convertir componentes a nuestro formato interno de inventario

### 2. Manipulación de Diseños
- Crear componentes programáticamente usando createShape
- Actualizar propiedades de componentes existentes
- Organizar componentes en el diseño mediante coordenadas

### 3. Conversión de Formatos
- Convertir entre formatos de EasyEDA y nuestro formato interno
- Mapear componentes de EasyEDA a entradas de nuestro inventario
- Validar la compatibilidad de componentes entre sistemas

## API de Extensiones

### UI Elements
- createToolbarButton: Crear botones en la barra de herramientas
- createExtensionMenu: Crear menús de extensión
- createDialog: Crear diálogos personalizados

### Comandos de Transformación
- clone: Clonar objetos
- delete: Eliminar objetos
- rotate, rotate_left, rotate_right: Rotar objetos
- fliph, flipv: Voltear objetos horizontal o verticalmente
- align_left, align_right, align_top, align_bottom: Alinear objetos

### Selección y Movimiento
- select, selectNone, getSelectedIds: Manejar selección de objetos
- moveObjs: Mover objetos en coordenadas relativas
- moveObjsTo: Mover objetos a coordenadas absolutas

## Consideraciones Técnicas

### Coordenadas
- EasyEDA usa un sistema de coordenadas con origen en 0,0
- Se pueden convertir entre coordenadas reales y de lienzo
- Soporta unidades como mm, mil, inch, y píxeles

### Conversión de Valores
- Se pueden convertir valores entre diferentes unidades
- Soporta mm, mil, inch, y píxeles como unidades
- Útil para establecer propiedades como tamaño de pads o ancho de tracks

## Limitaciones y Consideraciones
- El formato de archivo está optimizado para transferencia eficiente
- Algunos elementos visuales pueden diferir ligeramente después de la importación
- Es importante mantener la compatibilidad entre versiones de EasyEDA
- Los componentes personalizados pueden requerir adaptación especial