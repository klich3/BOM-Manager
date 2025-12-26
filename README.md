# BOM Manager

Es una app para gestionar BOM "Build Of Material" list of build de los items que ya tengo y los items que he de comprar.

> **Estado Actual**: Prototipo base configurado y listo para desarrollo en macOS ✅

## 🔥 Comenzar Ahora

**Antes de ejecutar la app, necesitas instalar Rust:**

```bash
# 1. Instalar Rust (solo la primera vez)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 2. Ejecutar el script de setup
chmod +x setup.sh
./setup.sh
```

O si ya tienes Rust instalado:

```bash
npm run tauri:dev
```

## 🚀 Quick Start

### Opción 1: Setup Automático (Recomendado)

```bash
chmod +x setup.sh
./setup.sh
```

El script automáticamente:
- Verificará e instalará Rust si es necesario
- Verificará Xcode Command Line Tools
- Instalará todas las dependencias de npm

### Opción 2: Setup Manual

#### Requisitos Previos

1. **Node.js** (v18 o superior)
2. **Rust** (requerido para Tauri)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```
3. **Xcode Command Line Tools** (macOS)
   ```bash
   xcode-select --install
   ```

#### Instalación y Ejecución

```bash
npm install
npm run tauri:dev
```

## 📚 Estructura del Proyecto

```
BOM-Manager/
├── components/      # Componentes Vue reutilizables
├── composables/     # Lógica reutilizable (useDatabase, etc.)
├── pages/           # Páginas/rutas de la app
├── types/           # Tipos TypeScript
├── plugins/         # Plugins de Nuxt
├── src-tauri/       # Backend Rust de Tauri
│   ├── src/        # Código fuente Rust
│   └── Cargo.toml  # Dependencias Rust
└── nuxt.config.ts   # Configuración de Nuxt
├── public/                # Archivos públicos/MyLibrary
├── setup.sh               # Script de instalación automático
└── README.md              # Este archivo
```

## Tecnologia
- Typescript
- Vue3 / Nuxt3
- Cross platform con Tauri
    * sample 1: https://github.com/midday-ai/midday/blob/main/package.json
    * sample 2: https://github.com/tonyantony300/alt-sendme
- TailwindCSS
- SQLLite


# Funcionalidad Features

## Implementado (Prototipo Inicial)

- [x] Configuración base del proyecto Nuxt3 + Tauri
- [x] Integración de TailwindCSS
- [x] Base de datos SQLite configurada
- [x] Dashboard principal con estadísticas
- [x] Sistema de tipos TypeScript
- [x] Estructura de carpetas y componentes




