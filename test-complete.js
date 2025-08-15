// Test completo para login + historial en modo producción
process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';

const { loginIQOption, obtenerHistorialIQOption } = require('./utils/iqApi');

async function testCompleteFlow() {
    console.log('🧪 Iniciando prueba completa: Login + Historial...');
    
    try {
        // Test 1: Login
        console.log('\n1️⃣ Probando login...');
        const loginResult = await loginIQOption('test@example.com', 'test123');
        console.log('📊 Login result:', loginResult);
        
        if (!loginResult.success) {
            console.log('❌ Login falló, abortando prueba');
            return;
        }
        
        // Test 2: Historial
        console.log('\n2️⃣ Probando historial...');
        const historialResult = await obtenerHistorialIQOption(
            'test@example.com', 
            'test123',
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
        
        if (historialResult.success) {
            console.log('\n✅ Prueba completa exitosa - Todo funciona en producción! 🎉');
        } else {
            console.log('\n❌ Error en historial:', historialResult.error);
        }
        
    } catch (error) {
        console.error('\n💥 Error en prueba completa:', error.message);
    }
}

testCompleteFlow();
