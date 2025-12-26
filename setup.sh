#!/bin/bash

# Script de configuración inicial para BOM Manager
echo "🚀 Configurando BOM Manager..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar Rust
if ! command -v rustc &> /dev/null; then
    echo "⚠️  Rust no está instalado."
    echo "📦 Instalando Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    echo "✅ Rust instalado correctamente"
else
    echo "✅ Rust encontrado: $(rustc --version)"
fi

# Verificar Xcode Command Line Tools (solo macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! xcode-select -p &> /dev/null; then
        echo "⚠️  Xcode Command Line Tools no están instalados."
        echo "📦 Instalando Xcode Command Line Tools..."
        xcode-select --install
        echo "⏳ Por favor completa la instalación de Xcode CLI Tools y ejecuta este script nuevamente."
        exit 0
    fi
    echo "✅ Xcode Command Line Tools encontradas"
fi

# Instalar dependencias
echo "📦 Instalando dependencias de npm..."
npm install

echo ""
echo "✨ ¡Configuración completada!"
echo ""
echo "Para iniciar la aplicación, ejecuta:"
echo "  npm run tauri:dev"
echo ""
