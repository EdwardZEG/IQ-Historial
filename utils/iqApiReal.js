const axios = require('axios');
const crypto = require('crypto');

/**
 * API JavaScript REAL de IQ Option (sin simulación)
 * Esta clase implementa conexión real a IQ Option para usar en Vercel
 */
class IQOptionRealAPI {
  constructor() {
    this.baseUrl = 'https://auth.iqoption.com/api/v2.0';
    this.tradingUrl = 'https://iqoption.com/api';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Origin': 'https://iqoption.com',
      'Referer': 'https://iqoption.com/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site'
    };
    this.cookies = '';
    this.balance = 0;
    this.isConnected = false;
    this.sessionToken = null;
  }

  /**
   * Login real a IQ Option
   */
  async login(email, password) {
    try {
      console.log('🌐 [REAL-JS] Iniciando login REAL con IQ Option API...');
      
      // Paso 1: Obtener página de login para cookies iniciales
      const loginPageResponse = await axios.get('https://iqoption.com/en/login', {
        headers: this.headers,
        timeout: 15000
      });

      // Extraer cookies de sesión
      if (loginPageResponse.headers['set-cookie']) {
        this.cookies = loginPageResponse.headers['set-cookie']
          .map(cookie => cookie.split(';')[0])
          .join('; ');
        this.headers['Cookie'] = this.cookies;
      }

      // Paso 2: Realizar login
      const loginData = {
        email: email.trim(),
        password: password.trim(),
        remember: 1,
        platform: 'web'
      };

      console.log('🔐 Enviando credenciales a IQ Option...');
      const loginResponse = await axios.post(`${this.baseUrl}/v2.0/login`, loginData, {
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 20000
      });

      console.log('📡 Respuesta de login recibida:', {
        status: loginResponse.status,
        hasData: !!loginResponse.data,
        successful: loginResponse.data?.isSuccessful
      });

      if (loginResponse.status === 200 && loginResponse.data?.isSuccessful) {
        // Actualizar cookies con las nuevas de sesión
        if (loginResponse.headers['set-cookie']) {
          const newCookies = loginResponse.headers['set-cookie']
            .map(cookie => cookie.split(';')[0])
            .join('; ');
          this.cookies = this.cookies + '; ' + newCookies;
          this.headers['Cookie'] = this.cookies;
        }

        // Obtener token de sesión si está disponible
        this.sessionToken = loginResponse.data.token || loginResponse.data.session_token;
        this.balance = loginResponse.data.balance || 0;
        this.isConnected = true;

        console.log('✅ [REAL-JS] Login REAL exitoso con IQ Option');
        return {
          success: true,
          message: 'Login exitoso con IQ Option (conexión real)',
          balance: this.balance,
          real: true
        };
      } else {
        console.log('❌ [REAL-JS] Credenciales inválidas o respuesta inesperada');
        console.log('📄 Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
        
        return {
          success: false,
          message: 'Credenciales incorrectas o error de IQ Option',
          error: 'LOGIN_FAILED'
        };
      }
      
    } catch (error) {
      console.error('💥 [REAL-JS] Error en login real:', error.message);
      console.error('🔍 Detalles del error:', {
        code: error.code,
        response: error.response?.status,
        data: error.response?.data
      });
      
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
        error: 'CONNECTION_ERROR'
      };
    }
  }

  /**
   * Obtener balance real de la cuenta
   */
  async getBalance() {
    try {
      if (!this.isConnected) {
        return { success: false, error: 'No conectado' };
      }

      const response = await axios.get(`${this.tradingUrl}/profile`, {
        headers: this.headers,
        timeout: 10000
      });

      if (response.data?.result?.balance !== undefined) {
        this.balance = response.data.result.balance;
        return { success: true, balance: this.balance, real: true };
      }

      return { success: true, balance: this.balance, real: true };
    } catch (error) {
      console.error('❌ Error obteniendo balance:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener historial REAL de operaciones
   */
  async getHistorial(email, password, accountType = 'REAL', fechaInicio = null, fechaFin = null, instrumento = 'all') {
    try {
      console.log('📊 [REAL-JS] Obteniendo historial REAL de IQ Option...');

      if (!this.isConnected) {
        console.log('🔄 No conectado, intentando login automático...');
        const loginResult = await this.login(email, password);
        if (!loginResult.success) {
          return loginResult;
        }
      }

      // Convertir fechas a timestamps
      const startTime = fechaInicio ? Math.floor(new Date(fechaInicio + 'T00:00:00Z').getTime() / 1000) : Math.floor(Date.now() / 1000) - (30 * 24 * 3600); // 30 días atrás por defecto
      const endTime = fechaFin ? Math.floor(new Date(fechaFin + 'T23:59:59Z').getTime() / 1000) : Math.floor(Date.now() / 1000);

      console.log('📅 Buscando operaciones desde', new Date(startTime * 1000), 'hasta', new Date(endTime * 1000));

      // Obtener historial de diferentes tipos de operaciones
      const promises = [];
      
      // 1. Opciones Binarias
      promises.push(this.getBinaryOptions(startTime, endTime));
      
      // 2. Opciones Turbo  
      promises.push(this.getTurboOptions(startTime, endTime));
      
      // 3. Opciones Digitales
      promises.push(this.getDigitalOptions(startTime, endTime));

      const results = await Promise.allSettled(promises);
      
      let allOperations = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.length > 0) {
          allOperations = allOperations.concat(result.value);
          console.log(`✅ Tipo ${index + 1}: ${result.value.length} operaciones`);
        } else if (result.status === 'rejected') {
          console.log(`❌ Tipo ${index + 1}: ${result.reason}`);
        }
      });

      // Filtrar por instrumento si se especifica
      if (instrumento && instrumento !== 'all') {
        allOperations = allOperations.filter(op => 
          op.activo && op.activo.toLowerCase().includes(instrumento.toLowerCase())
        );
      }

      // Ordenar por fecha (más recientes primero)
      allOperations.sort((a, b) => b.created - a.created);

      console.log(`📊 [REAL-JS] Total operaciones reales encontradas: ${allOperations.length}`);

      return {
        success: true,
        history: allOperations,
        balance: this.balance,
        account_type: accountType,
        real: true
      };

    } catch (error) {
      console.error('💥 [REAL-JS] Error obteniendo historial:', error.message);
      return {
        success: false,
        message: `Error obteniendo historial: ${error.message}`,
        error: 'HISTORY_ERROR'
      };
    }
  }

  /**
   * Obtener opciones binarias
   */
  async getBinaryOptions(startTime, endTime) {
    try {
      const response = await axios.get(`${this.tradingUrl}/option`, {
        headers: this.headers,
        params: {
          limit: 100,
          offset: 0,
          from: startTime,
          to: endTime
        },
        timeout: 15000
      });

      if (response.data?.result) {
        return this.formatOperations(response.data.result, 'binary');
      }
      return [];
    } catch (error) {
      console.log('⚠️ Error obteniendo opciones binarias:', error.message);
      return [];
    }
  }

  /**
   * Obtener opciones turbo
   */
  async getTurboOptions(startTime, endTime) {
    try {
      const response = await axios.get(`${this.tradingUrl}/turbo-option`, {
        headers: this.headers,
        params: {
          limit: 100,
          offset: 0,
          from: startTime,
          to: endTime
        },
        timeout: 15000
      });

      if (response.data?.result) {
        return this.formatOperations(response.data.result, 'turbo');
      }
      return [];
    } catch (error) {
      console.log('⚠️ Error obteniendo opciones turbo:', error.message);
      return [];
    }
  }

  /**
   * Obtener opciones digitales
   */
  async getDigitalOptions(startTime, endTime) {
    try {
      const response = await axios.get(`${this.tradingUrl}/digital-option`, {
        headers: this.headers,
        params: {
          limit: 100,
          offset: 0,
          from: startTime,
          to: endTime
        },
        timeout: 15000
      });

      if (response.data?.result) {
        return this.formatOperations(response.data.result, 'digital');
      }
      return [];
    } catch (error) {
      console.log('⚠️ Error obteniendo opciones digitales:', error.message);
      return [];
    }
  }

  /**
   * Formatear operaciones al formato esperado
   */
  formatOperations(operations, type) {
    return operations.map(op => {
      const created = op.created_at || op.created || op.time_closed;
      const date = new Date((created || Date.now()) * 1000);
      
      const isWin = op.win === 'win' || op.result === 'win' || (op.win_amount && op.win_amount > op.amount);
      const isLoss = op.win === 'loss' || op.result === 'loss' || op.win_amount === 0;
      const isDraw = op.win === 'equal' || op.result === 'equal';
      
      let resultado = isDraw ? 'Empate' : (isWin ? 'Ganado' : 'Perdido');
      let ganancia = 0;
      
      if (isWin) {
        ganancia = (op.win_amount || 0) - (op.amount || 0);
      } else if (isLoss) {
        ganancia = -(op.amount || 0);
      }

      return {
        id: op.id || `${type}_${created}_${Math.random()}`,
        created: created || Math.floor(Date.now() / 1000),
        expired: op.expired || op.time_closed || created + 300,
        activo: (op.active || op.asset_name || 'UNKNOWN').replace('-op', ''),
        inversion: op.amount || 0,
        resultado: resultado,
        ganancia: ganancia,
        ganancia_bruta: op.win_amount || 0,
        capital: isWin ? (op.win_amount || 0) : 0,
        porcentaje: op.profit_percent || ((ganancia / (op.amount || 1)) * 100),
        tipo_instrumento: type,
        tiempo_compra: date.toLocaleString('es-ES'),
        tiempo_cierre: new Date(((op.expired || created + 300) * 1000)).toLocaleString('es-ES'),
        fecha_simple: date.toLocaleDateString('es-ES')
      };
    });
  }
}

module.exports = IQOptionRealAPI;
