// Implementación JavaScript para Vercel (sin dependencia de Python)
const { IQOptionAPI } = require('./iqApiJS');

// Instancia global para reutilizar conexiones
let apiInstance = null;

function getAPIInstance() {
  if (!apiInstance) {
    apiInstance = new IQOptionAPI();
  }
  return apiInstance;
}

exports.loginIQOption = async (email, password) => {
  try {
    console.log('🔐 [JS] Iniciando login para:', email);
    const api = getAPIInstance();
    const result = await api.login(email, password);
    
    if (result.success) {
      console.log('✅ [JS] Login exitoso:', result.simulated ? '(modo simulado)' : '(conexión real)');
    } else {
      console.log('❌ [JS] Login fallido:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('💥 [JS] Error en login:', error.message);
    return { 
      success: false, 
      error: `Error de conexión: ${error.message}` 
    };
  }
};

exports.obtenerHistorialIQOption = async (email, password, accountType = 'REAL', fechaInicio = null, fechaFin = null, instrumento = 'all') => {
  try {
    console.log('📊 [JS] Obteniendo historial con parámetros:', {
      email: email,
      accountType,
      fechaInicio,
      fechaFin,
      instrumento
    });
    
    const api = getAPIInstance();
    const result = await api.getHistorial(email, password, accountType, fechaInicio, fechaFin, instrumento);
    
    if (result.success) {
      console.log('✅ [JS] Historial obtenido:', {
        operaciones: result.history?.length || 0,
        balance: result.balance,
        simulado: result.simulated || false
      });
    } else {
      console.log('❌ [JS] Error obteniendo historial:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('💥 [JS] Error obteniendo historial:', error.message);
    return { 
      success: false, 
      error: `Error obteniendo historial: ${error.message}` 
    };
  }
};
