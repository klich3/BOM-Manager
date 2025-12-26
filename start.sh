#!/bin/bash

# 🚀 Inicio Rápido BOM Manager

echo "╔═══════════════════════════════════════════╗"
echo "║     BOM Manager - Inicio Rápido          ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Verificar si Rust está instalado
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust no está instalado."
    echo ""
    echo "🔧 Para instalar Rust, ejecuta:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "   source \$HOME/.cargo/env"
    echo ""
    echo "📝 Luego vuelve a ejecutar este script"
    exit 1
fi

echo "✅ Rust instalado: $(rustc --version)"
echo ""

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    cd ..
    echo ""
fi

echo "🎯 Iniciando BOM Manager..."
echo ""
npm run tauri:dev
