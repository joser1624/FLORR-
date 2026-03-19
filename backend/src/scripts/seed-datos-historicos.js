/**
 * Script maestro para generar todos los datos históricos
 * Ejecuta los scripts de ventas y gastos en secuencia
 * 
 * Uso: node backend/src/scripts/seed-datos-historicos.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌸 Generación de Datos Históricos 🌸                   ║
║   Encantos Eternos - Sistema de Gestión                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

console.log('Este script generará datos sintéticos de los últimos 2 meses:\n');
console.log('  • Ventas históricas (~150 ventas)');
console.log('  • Gastos históricos (~50 gastos)');
console.log('  • Movimientos de capital\n');

console.log('⚠️  IMPORTANTE: Este proceso puede tardar unos minutos.\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('¿Deseas continuar? (s/n): ', (respuesta) => {
  readline.close();
  
  if (respuesta.toLowerCase() !== 's' && respuesta.toLowerCase() !== 'si') {
    console.log('\n❌ Proceso cancelado por el usuario.\n');
    process.exit(0);
  }
  
  console.log('\n🚀 Iniciando generación de datos...\n');
  
  try {
    // 1. Generar ventas históricas
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PASO 1: Generando ventas históricas');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    execSync('node backend/src/scripts/seed-ventas-historicas.js', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n');
    
    // 2. Generar gastos históricos
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PASO 2: Generando gastos históricos');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    execSync('node backend/src/scripts/seed-gastos-historicos.js', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📊 Datos generados:');
    console.log('   ✓ Ventas históricas de 2 meses');
    console.log('   ✓ Gastos históricos de 2 meses');
    console.log('   ✓ Movimientos de capital actualizados\n');
    
    console.log('🎯 Próximos pasos:');
    console.log('   1. Inicia el backend: npm run dev');
    console.log('   2. Abre el panel admin en el navegador');
    console.log('   3. Explora las secciones de Ventas, Gastos y Dashboard');
    console.log('   4. Prueba los filtros por fecha y otros criterios\n');
    
    console.log('🌸 ¡Disfruta explorando el sistema con datos reales! 🌸\n');
    
  } catch (error) {
    console.error('\n❌ Error durante la generación de datos:', error.message);
    console.error('\nPor favor, verifica que:');
    console.error('  • El backend esté configurado correctamente');
    console.error('  • La base de datos esté accesible');
    console.error('  • Existan productos y trabajadores en la base de datos\n');
    process.exit(1);
  }
});
