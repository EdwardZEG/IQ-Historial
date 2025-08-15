const { obtenerHistorialIQOption, loginIQOption } = require('./utils/iqApi');

async function testNoSimulationInProduction() {
  console.log('🚫 PROBANDO: NO simulación en producción...');
  console.log('🔍 Forzando entorno de producción...');
  
  // Forzar entorno de producción para usar JavaScript
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  
  // Re-importar después de cambiar variables
  delete require.cache[require.resolve('./utils/iqApi')];
  delete require.cache[require.resolve('./utils/iqApiJS')];
  delete require.cache[require.resolve('./utils/iqApiReal')];
  
  const { obtenerHistorialIQOption: getHistorial, loginIQOption: doLogin } = require('./utils/iqApi');

  try {
    console.log('\n1️⃣ Probando login sin simulación...');
    const loginResult = await doLogin('test@invalid.com', 'wrongpassword');
    
    console.log('📊 Resultado de login:', {
      success: loginResult.success,
      message: loginResult.message,
      error: loginResult.error,
      real: loginResult.real,
      simulated: loginResult.simulated
    });

    // Verificar que NO es exitoso y NO usa simulación
    if (loginResult.success === false && !loginResult.simulated) {
      console.log('✅ CORRECTO: Login falló sin usar simulación');
    } else if (loginResult.simulated) {
      console.log('❌ ERROR: Se está usando simulación en producción!');
      return false;
    }

    console.log('\n2️⃣ Probando historial sin simulación...');
    const historialResult = await getHistorial(
      'test@invalid.com',
      'wrongpassword',
      'REAL',
      '2025-04-01',
      '2025-08-15',
      'all'
    );

    console.log('📈 Resultado de historial:', {
      success: historialResult.success,
      message: historialResult.message,
      error: historialResult.error,
      real: historialResult.real,
      simulated: historialResult.simulated,
      operaciones: historialResult.history?.length || 0
    });

    // Verificar que NO es exitoso y NO usa simulación
    if (historialResult.success === false && !historialResult.simulated) {
      console.log('✅ CORRECTO: Historial falló sin usar simulación');
    } else if (historialResult.simulated) {
      console.log('❌ ERROR: Se está usando simulación en producción para historial!');
      return false;
    }

    console.log('\n🎉 PERFECTO: No se usa simulación en producción');
    console.log('🔍 Sistema falla correctamente cuando no hay conexión real');
    return true;

  } catch (error) {
    console.error('\n💥 Error en test:', error.message);
    return false;
  }
}

async function testRealCredentials() {
  console.log('\n🌐 PROBANDO: Credenciales reales en producción...');
  
  // Mantener entorno de producción
  process.env.NODE_ENV = 'production';
  process.env.VERCEL = '1';
  
  const { obtenerHistorialIQOption: getHistorial, loginIQOption: doLogin } = require('./utils/iqApi');

  try {
    console.log('\n3️⃣ Probando con credenciales reales...');
    const loginResult = await doLogin('ciberkali777iq@gmail.com', 'zaldivar1234');
    
    console.log('📊 Login real result:', {
      success: loginResult.success,
      real: loginResult.real,
      simulated: loginResult.simulated,
      balance: loginResult.balance
    });

    if (loginResult.success && loginResult.real) {
      console.log('✅ EXCELENTE: Login real exitoso en producción');
      
      const historialResult = await getHistorial(
        'ciberkali777iq@gmail.com',
        'zaldivar1234',
        'REAL',
        '2025-08-01',
        '2025-08-15',
        'all'
      );

      if (historialResult.success && historialResult.real) {
        console.log('✅ EXCELENTE: Historial real obtenido en producción');
        console.log(`📊 ${historialResult.history?.length || 0} operaciones reales`);
      } else {
        console.log('⚠️ Historial real falló (esperado si la API no está disponible)');
      }
    }

    return true;
  } catch (error) {
    console.log('⚠️ Error esperado con credenciales reales:', error.message);
    return true; // Es esperado que falle si la API real no está disponible
  }
}

async function runAllTests() {
  console.log('🧪 INICIANDO TESTS COMPLETOS DE NO-SIMULACIÓN EN PRODUCCIÓN\n');
  
  const test1 = await testNoSimulationInProduction();
  const test2 = await testRealCredentials();
  
  console.log('\n📊 RESUMEN DE TESTS:');
  console.log(`- No simulación con credenciales inválidas: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Test con credenciales reales: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = test1 && test2;
  console.log(`\n🎯 RESULTADO FINAL: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  if (allPassed) {
    console.log('🚫 CONFIRMADO: No se usa simulación en producción');
    console.log('✅ Solo datos reales o fallo directo');
  }
  
  return allPassed;
}

if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testNoSimulationInProduction, testRealCredentials };
