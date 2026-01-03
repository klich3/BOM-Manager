# Manejo de Archivos en BOM Manager

## Almacenamiento de Imágenes y PDFs

### Tauri (Escritorio)
- Las imágenes y PDFs se almacenan como Data URLs en la base de datos
- En producción, se puede usar `tauri-plugin-fs` para guardar en directorios del sistema

### Web (Navegador)
- Utiliza **OPFS** (Origin Private File System) para almacenamiento persistente
- Los archivos se guardan localmente en el navegador
- Disponible en navegadores modernos (Chrome 86+, Firefox 111+, Safari 15.2+)

## Limitaciones de OPFS

### Espacio de almacenamiento
- **Cuota típica**: 60% del espacio libre en disco
- **Mínimo garantizado**: 100MB
- **Máximo recomendado**: Depende del dispositivo del usuario

### Ejemplo de uso:
```javascript
// Verificar espacio disponible
const storageInfo = await getStorageInfo();
console.log(`Disponible: ${(storageInfo.available / 1024 / 1024).toFixed(2)} MB`);

// Guardar archivo
const fileUrl = await saveFile(imageFile, 'thumbnail.jpg');

// Eliminar archivo
await deleteFile(fileUrl);
```

## Buenas Prácticas

1. **Compresión de imágenes**: Reducir tamaño antes de guardar
2. **Formatos eficientes**: Preferir WebP para imágenes
3. **Limpieza periódica**: Eliminar archivos antiguos no utilizados
4. **Fallback**: Manejar casos donde OPFS no esté disponible

## Consideraciones de Seguridad

- Los archivos en OPFS son privados al origen (dominio)
- No se pueden compartir entre diferentes sitios web
- Las URLs generadas con `URL.createObjectURL()` son temporales
- Se recomienda implementar políticas de retención de datos