// Test para verificar el funcionamiento en modo producción - SET DESDE INICIO
process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';

const { loginIQOption } = require('./utils/iqApi');

async function testLogin() {
    console.log('🧪 Iniciando prueba de login en modo producción...');
    
    console.log('🔍 Variables de entorno:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- VERCEL:', process.env.VERCEL);
    
    try {
        const result = await loginIQOption('test@example.com', 'test123');
        console.log('📊 Resultado:', result);
        
        if (result.success) {
            console.log('✅ Prueba exitosa - Login funciona en modo producción');
        } else {
            console.log('❌ Prueba fallida - Error en login');
        }
    } catch (error) {
        console.error('💥 Error en prueba:', error.message);
    }
}

testLogin();
