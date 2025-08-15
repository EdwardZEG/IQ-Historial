// Sistema híbrido: Python en local, JavaScript en Vercel
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { IQOptionAPI } = require('./iqApiJS');

// Detectar si estamos en Vercel o producción
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';
const pythonAvailable = fs.existsSync(path.join(__dirname, 'iqApi.py'));

// Usar JavaScript si estamos en Vercel O en producción
const useJavaScript = isVercel || isProduction;

console.log('🔍 Configuración del sistema:');
console.log(`- VERCEL: ${isVercel ? '✅' : '❌'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`- Python disponible: ${pythonAvailable ? '✅' : '❌'}`);
console.log(`- Método a usar: ${useJavaScript ? 'JavaScript (simulado)' : 'Python (real)'}`);

// Instancia global para reutilizar conexiones JavaScript
let jsApiInstance = null;

function getJSAPIInstance() {
  if (!jsApiInstance) {
    jsApiInstance = new IQOptionAPI();
  }
  return jsApiInstance;
}

function getPythonCmd() {
  // En Windows puede ser python o python3
  return 'python';
}

function getScriptPath() {
  return path.join(__dirname, 'iqApi.py');
}

// Función para verificar que el script Python existe
function verifyPythonScript() {
  const scriptPath = getScriptPath();
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python script not found at: ${scriptPath}`);
  }
  return scriptPath;
}

// Función Python para login
async function loginWithPython(email, password) {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = verifyPythonScript();
      console.log('🐍 Usando Python script:', scriptPath);
      
      const py = spawn(getPythonCmd(), [
        scriptPath,
        'login',
        email,
        password
      ], { cwd: process.cwd() });
      
      let data = '';
      let errorData = '';
      
      py.stdout.on('data', chunk => {
        data += chunk.toString();
      });
      
      py.stderr.on('data', chunk => {
        errorData += chunk.toString();
      });
      
      py.on('close', (code) => {
        console.log('🐍 Python script finished with code:', code);
        console.log('🐍 Python stdout:', data);
        if (errorData) console.log('🐍 Python stderr:', errorData);
        
        if (code !== 0) {
          resolve({ success: false, error: `Python script failed with code ${code}: ${errorData}` });
          return;
        }
        
        if (!data || data.trim() === '') {
          resolve({ success: false, error: 'Python script returned empty response' });
          return;
        }
        
        try {
          const result = JSON.parse(data.trim());
          resolve(result);
        } catch (e) {
          resolve({ success: false, error: `Error parseando JSON: ${e.message}. Raw data: ${data}` });
        }
      });
      
      py.on('error', (err) => {
        resolve({ success: false, error: `Error ejecutando Python: ${err.message}` });
      });
      
      // Timeout después de 30 segundos
      setTimeout(() => {
        py.kill();
        resolve({ success: false, error: 'Timeout: Python script took too long' });
      }, 30000);
      
    } catch (error) {
      resolve({ success: false, error: `Setup error: ${error.message}` });
    }
  });
}

// Función Python para historial
async function getHistoryWithPython(email, password, accountType = 'PRACTICE', fechaInicio, fechaFin, instrumento = 'all') {
  return new Promise((resolve, reject) => {
    const args = [
      getScriptPath(),
      'history',
      email,
      password,
      accountType,
      fechaInicio || '',
      fechaFin || '',
      instrumento || 'all'
    ];
    
    console.log('🐍 Python args:', args);
    
    const py = spawn(getPythonCmd(), args, { cwd: process.cwd() });
    let data = '';
    let errorData = '';
    
    py.stdout.on('data', chunk => {
      data += chunk.toString();
    });
    
    py.stderr.on('data', chunk => {
      errorData += chunk.toString();
    });
    
    py.on('close', (code) => {
      console.log('🐍 History Python script finished with code:', code);
      console.log('🐍 History Python stdout:', data.substring(0, 200) + '...');
      if (errorData) console.log('🐍 History Python stderr:', errorData);
      
      if (code !== 0) {
        resolve({ success: false, error: `Python script failed with code ${code}: ${errorData}` });
        return;
      }
      
      if (!data || data.trim() === '') {
        resolve({ success: false, error: 'Python script returned empty response' });
        return;
      }
      
      try {
        const result = JSON.parse(data.trim());
        resolve(result);
      } catch (e) {
        resolve({ success: false, error: `Error parseando JSON: ${e.message}. Raw data: ${data.substring(0, 500)}` });
      }
    });
    
    py.on('error', (err) => {
      resolve({ success: false, error: `Error ejecutando Python: ${err.message}` });
    });
    
    // Timeout después de 60 segundos para historial
    setTimeout(() => {
      py.kill();
      resolve({ success: false, error: 'Timeout: Python script took too long' });
    }, 60000);
  });
}

// Función principal de login (híbrida)
exports.loginIQOption = async (email, password) => {
  try {
    if (useJavaScript) {
      console.log('🌐 [JS] Iniciando login en modo producción/simulado para:', email);
      const api = getJSAPIInstance();
      const result = await api.login(email, password);
      
      if (result.success) {
        console.log('✅ [JS] Login exitoso:', result.simulated ? '(modo simulado)' : '(conexión real)');
      } else {
        console.log('❌ [JS] Login fallido:', result.error);
      }
      
      return result;
    } else if (pythonAvailable) {
      console.log('🐍 [PYTHON] Iniciando login real para:', email);
      const result = await loginWithPython(email, password);
      
      if (result.success) {
        console.log('✅ [PYTHON] Login exitoso (conexión real)');
      } else {
        console.log('❌ [PYTHON] Login fallido:', result.error);
      }
      
      return result;
    } else {
      console.log('� [JS] Iniciando login (modo simulado) para:', email);
      const api = getJSAPIInstance();
      const result = await api.login(email, password);
      
      if (result.success) {
        console.log('✅ [JS] Login exitoso:', result.simulated ? '(modo simulado)' : '(conexión real)');
      } else {
        console.log('❌ [JS] Login fallido:', result.error);
      }
      
      return result;
    }
  } catch (error) {
    console.error('💥 Error en login:', error.message);
    return { 
      success: false, 
      error: `Error de conexión: ${error.message}` 
    };
  }
};

// Función principal de historial (híbrida)
exports.obtenerHistorialIQOption = async (email, password, accountType = 'REAL', fechaInicio = null, fechaFin = null, instrumento = 'all') => {
  try {
    console.log('📊 Obteniendo historial con parámetros:', {
      email: email,
      accountType,
      fechaInicio,
      fechaFin,
      instrumento,
      method: useJavaScript ? 'JavaScript (simulado)' : 'Python (real)'
    });
    
    if (useJavaScript) {
      console.log('🌐 [JS] Obteniendo historial simulado para producción...');
      const api = getJSAPIInstance();
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
    } else if (pythonAvailable) {
      console.log('� [PYTHON] Obteniendo historial real...');
      const result = await getHistoryWithPython(email, password, accountType, fechaInicio, fechaFin, instrumento);
      
      if (result.success) {
        console.log('✅ [PYTHON] Historial obtenido:', {
          operaciones: result.history?.length || 0,
          balance: result.balance,
          real: true
        });
      } else {
        console.log('❌ [PYTHON] Error obteniendo historial:', result.error);
      }
      
      return result;
    } else {
      // Fallback a JavaScript si no hay Python disponible
      console.log('⚠️ [FALLBACK] Python no disponible, usando JavaScript');
      const api = getJSAPIInstance();
      return await api.getHistorial(email, password, accountType, fechaInicio, fechaFin, instrumento);
    }
  } catch (error) {
    console.error('💥 Error obteniendo historial:', error.message);
    return { 
      success: false, 
      error: `Error obteniendo historial: ${error.message}` 
    };
  }
};
