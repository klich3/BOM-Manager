# Integración con LCSC API

## Descripción General
LCSC Electronics proporciona una API para socios que desean integrar sus sistemas con LCSC. Esta API permite automatizar tareas como búsqueda de componentes, obtención de detalles de productos, creación de órdenes y seguimiento de envíos.

## Requisitos para el Acceso
1. Crear una cuenta en LCSC.COM
2. Enviar documentación comercial (sitio web de la empresa, licencia comercial, información de contacto, volumen estimado de pedidos, etc.)
3. Solicitar una clave API a través de support@lcsc.com

## APIs Disponibles

### 1. Category API
- **Descripción**: Permite navegar por la información de categorías de componentes
- **Uso potencial**: Organizar componentes por categorías en nuestra aplicación

### 2. Manufacturer API
- **Descripción**: Recupera información de marcas/fabricantes
- **Uso potencial**: Mostrar información de fabricantes de componentes

### 3. Categorical Item List API
- **Descripción**: Muestra productos por categoría
- **Uso potencial**: Listar componentes por categorías específicas

### 4. Item Details API
- **Descripción**: Obtiene información detallada sobre productos específicos
- **Uso potencial**: Obtener especificaciones técnicas detalladas de componentes

### 5. Keyword Search List API
- **Descripción**: Busca productos usando palabras clave
- **Uso potencial**: Sistema de búsqueda de componentes por nombre o descripción

### 6. Order Create API
- **Descripción**: Envía pedidos directamente
- **Uso potencial**: Integración de compra directa desde nuestra aplicación

### 7. Check Order API
- **Descripción**: Monitorea el estado de los pedidos
- **Uso potencial**: Seguimiento de pedidos realizados a través de nuestra aplicación

### 8. Get Shipment API
- **Descripción**: Obtiene costos de envío
- **Uso potencial**: Cálculo de costos de envío para pedidos

## Validación de Solicitudes
Todas las solicitudes a la API requieren cuatro parámetros para verificación:
- `key`: ID de usuario obtenido de LCSC
- `nonce`: Valor aleatorio de 16 bits
- `timestamp`: Marca de tiempo de la solicitud
- `signature`: Firma generada con el algoritmo SHA1

### Algoritmo de Firma
```
signature = SHA1(key=xxx&nonce=xxx&secret=xxxx&timestamp=xxx)
```

## Formato de Respuesta
Todas las APIs responden en el siguiente formato:
```json
{
  "success": true,
  "code": 200,
  "message": "",
  "result": {}
}
```

## Posibilidades de Integración en Nuestra Aplicación

### 1. Búsqueda de Componentes
- Implementar búsqueda directa de componentes en LCSC
- Mostrar información detallada de componentes desde LCSC
- Previsualización de componentes con imágenes y especificaciones

### 2. Integración de Compra
- Botón de compra directa desde la aplicación
- Sincronización de precios desde LCSC
- Seguimiento de pedidos realizados

### 3. Actualización de Datos
- Verificación de disponibilidad de stock
- Actualización automática de precios
- Notificaciones de disponibilidad de componentes

### 4. Validación de Part Numbers
- Verificación de números de parte LCSC
- Validación de componentes antes de agregarlos al inventario

## Consideraciones de Seguridad y Uso
- No se permite el uso para captura masiva de datos
- No se debe alojar ni proporcionar a terceros material obtenido vía API
- No se debe vender la información obtenida de la API
- No se debe compartir la clave de API fuera de la empresa
- Se debe identificar a LCSC como fuente de la información
- No se debe compartir aspectos técnicos o documentación de las APIs con terceros
- No se debe amenazar la integridad, rendimiento o confiabilidad de las APIs
- Se debe cumplir con todas las leyes y regulaciones aplicables

## Errores Comunes
- 424: Key es requerida
- 425: Nonce es requerido
- 426: Timestamp es requerido
- 427: Signature es requerida
- 428: Timestamp expirado
- 429: Producto no encontrado
- 430: Verificación de secret fallida
- 437: Límite de solicitudes excedido (reintente en 1 minuto)
- 438: Límite de solicitudes excedido (reintente en 1 día)