/**
 * Script para verificar eventos directamente en la base de datos PostgreSQL
 */

const { query } = require('./src/config/database');

async function checkEventos() {
  try {
    console.log('🔍 Consultando tabla eventos en PostgreSQL...\n');

    // Consultar todos los eventos
    const result = await query('SELECT * FROM eventos ORDER BY id');
    
    console.log(`📊 Total de eventos en la base de datos: ${result.rows.length}\n`);
    
    result.rows.forEach(evento => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`ID: ${evento.id}`);
      console.log(`Nombre: ${evento.nombre}`);
      console.log(`Descripción: ${evento.descripcion || 'N/A'}`);
      console.log(`Emoji: ${evento.emoji || 'N/A'}`);
      console.log(`Fecha: ${evento.fecha}`);
      console.log(`Color: ${evento.color}`);
      console.log(`Activo: ${evento.activo}`);
      console.log(`Creado: ${evento.created_at}`);
      console.log(`Actualizado: ${evento.updated_at}`);
      
      if (evento.metadata) {
        console.log(`\n📦 Metadata:`);
        const metadata = typeof evento.metadata === 'string' 
          ? JSON.parse(evento.metadata) 
          : evento.metadata;
        console.log(`   - Imagen: ${metadata.imagen || 'N/A'}`);
        console.log(`   - Precio Original: S/ ${metadata.precioOriginal || 0}`);
        console.log(`   - Precio Final: S/ ${metadata.precioFinal || 0}`);
        console.log(`   - Productos: ${metadata.productos?.length || 0}`);
        if (metadata.productos?.length > 0) {
          metadata.productos.forEach(p => {
            console.log(`      • ${p.nombre} (S/ ${p.precio})`);
          });
        }
      } else {
        console.log(`\n📦 Metadata: null (evento antiguo)`);
      }
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error);
  } finally {
    process.exit();
  }
}

checkEventos();
