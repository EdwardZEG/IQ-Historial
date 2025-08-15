// Test para verificar el funcionamiento en modo producción
const { loginIQOption } = require('./utils/iqApi');

async function testLogin() {
    console.log('🧪 Iniciando prueba de login...');
    
    // Simular entorno de producción
    process.env.NODE_ENV = 'production';
    process.env.VERCEL = '1';
    
    console.log('🔍 Configuración de prueba:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- VERCEL:', process.env.VERCEL);
    
    try {
        const result = await loginIQOption('test@example.com', 'test123');
        console.log('📊 Resultado:', result);
        
        if (result.success) {
            console.log('✅ Prueba exitosa - Login funciona en producción');
        } else {
            console.log('❌ Prueba fallida - Error en login');
        }
    } catch (error) {
        console.error('💥 Error en prueba:', error.message);
    }
}

testLogin();
