const { spawn } = require('child_process');
const path = require('path');

function getPythonCmd() {
  // En Windows puede ser python o python3
  return 'python';
}

function getScriptPath() {
  return path.join(__dirname, 'iqApi.py');
}

// Función para verificar que el script Python existe
function verifyPythonScript() {
  const fs = require('fs');
  const scriptPath = getScriptPath();
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Python script not found at: ${scriptPath}`);
  }
  return scriptPath;
}

exports.loginIQOption = async (email, password) => {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = verifyPythonScript();
      console.log('Using Python script:', scriptPath);
      
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
        console.log('Python script finished with code:', code);
        console.log('Python stdout:', data);
        console.log('Python stderr:', errorData);
        
        if (code !== 0) {
          reject(`Python script failed with code ${code}: ${errorData}`);
          return;
        }
        
        if (!data || data.trim() === '') {
          reject('Python script returned empty response');
          return;
        }
        
        try {
          const result = JSON.parse(data.trim());
          resolve(result);
        } catch (e) {
          reject(`Error parseando JSON: ${e.message}. Raw data: ${data}`);
        }
      });
      
      py.on('error', (err) => {
        reject(`Error ejecutando Python: ${err.message}`);
      });
      
      // Timeout después de 30 segundos
      setTimeout(() => {
        py.kill();
        reject('Timeout: Python script took too long');
      }, 30000);
      
    } catch (error) {
      reject(`Setup error: ${error.message}`);
    }
  });
};

exports.obtenerHistorialIQOption = async (email, password, accountType = 'PRACTICE', fechaInicio, fechaFin, instrumento = 'all') => {
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
    
    console.log('Python args:', args);
    
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
      console.log('History Python script finished with code:', code);
      console.log('History Python stdout:', data.substring(0, 200) + '...');
      console.log('History Python stderr:', errorData);
      
      if (code !== 0) {
        reject(`Python script failed with code ${code}: ${errorData}`);
        return;
      }
      
      if (!data || data.trim() === '') {
        reject('Python script returned empty response');
        return;
      }
      
      try {
        const result = JSON.parse(data.trim());
        resolve(result);
      } catch (e) {
        reject(`Error parseando JSON: ${e.message}. Raw data: ${data.substring(0, 200)}`);
      }
    });
    
    py.on('error', (err) => {
      reject(`Error ejecutando Python: ${err.message}`);
    });
    
    // Timeout después de 60 segundos para historial
    setTimeout(() => {
      py.kill();
      reject('Timeout: Python script took too long');
    }, 60000);
  });
};
