const { obtenerHistorialIQOption, loginIQOption } = require('./utils/iqApi');

async function testRealAPI() {
  console.log('🧪 Probando nueva API REAL de JavaScript...');
  console.log('🔍 Forzando entorno para usar JavaScript...');
  
  // Forzar entorno de producción para usar JavaScript (ANTES de importar)
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  
  // Re-importar después de cambiar variables para que tome efecto
  delete require.cache[require.resolve('./utils/iqApi')];
  delete require.cache[require.resolve('./utils/iqApiJS')];
  
  const { obtenerHistorialIQOption: getHistorial, loginIQOption: doLogin } = require('./utils/iqApi');

  try {
    console.log('\n1️⃣ Probando login con nueva API real...');
    const loginResult = await doLogin('ciberkali777iq@gmail.com', 'zaldivar1234');
    
    console.log('📊 Resultado de login:', {
      success: loginResult.success,
      message: loginResult.message,
      balance: loginResult.balance,
      real: loginResult.real,
      simulated: loginResult.simulated
    });

    if (loginResult.success) {
      console.log('\n2️⃣ Probando historial con nueva API real...');
      const historialResult = await getHistorial(
        'ciberkali777iq@gmail.com',
        'zaldivar1234',
        'REAL',
        '2025-04-01',
        '2025-08-15',
        'all'
      );

      console.log('📈 Resultado de historial:', {
        success: historialResult.success,
        operaciones: historialResult.history?.length || 0,
        balance: historialResult.balance,
        real: historialResult.real,
        simulated: historialResult.simulated
      });

      if (historialResult.history && historialResult.history.length > 0) {
        console.log('\n🔍 Muestra de operaciones:');
        historialResult.history.slice(0, 3).forEach((op, index) => {
          console.log(`Op ${index + 1}:`, {
            id: op.id,
            activo: op.activo,
            inversion: op.inversion,
            resultado: op.resultado,
            ganancia: op.ganancia,
            fecha: op.tiempo_compra
          });
        });
        
        // Mostrar si es real o simulado
        if (historialResult.real) {
          console.log('\n🎉 ¡DATOS REALES DE IQ OPTION OBTENIDOS!');
        } else if (historialResult.simulated) {
          console.log('\n⚠️ Datos simulados utilizados como fallback');
        }
      }

      console.log('\n✅ Test completado exitosamente!');
      return true;
    } else {
      console.log('\n❌ Test falló en login');
      return false;
    }

  } catch (error) {
    console.error('\n💥 Error en test:', error.message);
    return false;
  }
}

if (require.main === module) {
  testRealAPI().then(success => {
    console.log(`\n🎯 Test ${success ? 'EXITOSO' : 'FALLÓ'}`);
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testRealAPI };
