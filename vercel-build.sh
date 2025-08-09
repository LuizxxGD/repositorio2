#!/bin/bash

echo "🚀 Iniciando build do Vercel..."

# Limpar cache
echo "🧹 Limpando cache..."

# Verificar arquivos
echo "📁 Verificando arquivos..."
ls -la

# Forçar rebuild
echo "🔨 Forçando rebuild..."
touch index.html
touch css/styles.css
touch js/script.js

echo "✅ Build concluído!"
echo "🌐 Faça deploy com: vercel --prod"
