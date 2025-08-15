// Test para verificar que el sistema intenta conexiones REALES con IQ Option
process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';

const { loginIQOption, obtenerHistorialIQOption } = require('./utils/iqApi');

async function testRealConnection() {
    console.log('🧪 Probando conexión REAL con IQ Option (no simulado)...');
    
    try {
        // Test con credenciales reales (las tuyas)
        console.log('\n1️⃣ Probando login REAL...');
        const loginResult = await loginIQOption('ciberkali777iq@gmail.com', 'zaldivar1234');
        
        console.log('📊 Login result:', {
            success: loginResult.success,
            message: loginResult.message,
            balance: loginResult.balance,
            simulated: loginResult.simulated || false
        });
        
        if (loginResult.simulated) {
            console.log('⚠️ El login cayó en modo simulado (fallback)');
        } else {
            console.log('✅ Login REAL exitoso con IQ Option! 🎉');
        }
        
        // Test 2: Historial
        console.log('\n2️⃣ Probando historial...');
        const historialResult = await obtenerHistorialIQOption(
            'ciberkali777iq@gmail.com', 
            'zaldivar1234',
            'REAL',
            '2025-04-01',
            '2025-08-15',
            'all'
        );
        
        console.log('📊 Historial result:', {
            success: historialResult.success,
            operaciones: historialResult.history?.length || 0,
            balance: historialResult.balance,
            simulated: historialResult.simulated || false
        });
        
    } catch (error) {
        console.error('\n💥 Error en prueba:', error.message);
    }
}

testRealConnection();
