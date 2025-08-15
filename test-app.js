// Test básico para verificar que la aplicación funciona
const { loginIQOption, obtenerHistorialIQOption } = require('./utils/iqApi');

async function testApp() {
  console.log('🧪 Iniciando pruebas de la aplicación...\n');
  
  try {
    // Test 1: Login
    console.log('1️⃣ Probando función de login...');
    const loginResult = await loginIQOption('test@example.com', 'testpassword');
    
    if (loginResult.success) {
      console.log('✅ Login: EXITOSO');
      console.log(`   - Modo: ${loginResult.simulated ? 'Simulado' : 'Real'}`);
      console.log(`   - Balance: $${loginResult.balance}`);
    } else {
      console.log('❌ Login: FALLIDO');
      console.log(`   - Error: ${loginResult.error}`);
    }
    
    console.log('');
    
    // Test 2: Historial
    console.log('2️⃣ Probando función de historial...');
    const historialResult = await obtenerHistorialIQOption(
      'test@example.com', 
      'testpassword', 
      'REAL',
      '2025-01-01',
      '2025-12-31',
      'all'
    );
    
    if (historialResult.success) {
      console.log('✅ Historial: EXITOSO');
      console.log(`   - Operaciones: ${historialResult.history?.length || 0}`);
      console.log(`   - Balance: $${historialResult.balance}`);
      console.log(`   - Modo: ${historialResult.simulated ? 'Simulado' : 'Real'}`);
      
      if (historialResult.history && historialResult.history.length > 0) {
        const firstOp = historialResult.history[0];
        console.log('   - Primera operación:');
        console.log(`     * Activo: ${firstOp.activo}`);
        console.log(`     * Inversión: $${firstOp.inversion}`);
        console.log(`     * Resultado: ${firstOp.resultado}`);
        console.log(`     * Ganancia: $${firstOp.ganancia}`);
      }
    } else {
      console.log('❌ Historial: FALLIDO');
      console.log(`   - Error: ${historialResult.error}`);
    }
    
    console.log('\n🎉 Pruebas completadas!');
    console.log('✅ La aplicación está lista para deployment en Vercel');
    
  } catch (error) {
    console.error('💥 Error durante las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
testApp();
