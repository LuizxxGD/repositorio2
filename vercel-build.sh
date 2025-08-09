#!/bin/bash

# Script de build para Vercel
echo "🚀 Iniciando build para Vercel..."

# Verificar se os arquivos principais existem
if [ ! -f "index.html" ]; then
    echo "❌ Erro: index.html não encontrado!"
    exit 1
fi

if [ ! -d "css" ]; then
    echo "❌ Erro: pasta css não encontrada!"
    exit 1
fi

if [ ! -d "js" ]; then
    echo "❌ Erro: pasta js não encontrada!"
    exit 1
fi

if [ ! -d "images" ]; then
    echo "❌ Erro: pasta images não encontrada!"
    exit 1
fi

echo "✅ Todos os arquivos principais encontrados!"
echo "📁 Estrutura do projeto:"
ls -la

echo "🎯 Build concluído com sucesso!"
echo "🌐 Projeto pronto para deploy no Vercel!"
