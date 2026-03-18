#!/bin/bash
# Script para resetear productos/arreglos y poblar inventario

echo "🔄 Limpiando productos y arreglos..."
echo "📦 Poblando inventario con datos sintéticos..."

cd database
psql -U postgres -d floreria_system_core -f reset-and-seed-inventario.sql

echo ""
echo "✅ Proceso completado"
echo "📋 Ahora puedes:"
echo "   1. Abrir pages/admin/inventario.html para ver el inventario"
echo "   2. Abrir pages/admin/laboratorio.html para crear arreglos"
echo "   3. Abrir pages/admin/productos.html para ver los productos creados"
