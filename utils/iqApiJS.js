const WebSocket = require('ws');
const https = require('https');
const axios = require('axios');
const IQOptionRealAPI = require('./iqApiReal');

class IQOptionAPI {
  constructor() {
    this.apiUrl = process.env.IQ_API_URL || 'https://auth.iqoption.com/api/v2.0';
    this.tradeApiUrl = process.env.IQ_TRADE_API_URL || 'https://iqoption.com/api';
    this.socketUrl = process.env.IQ_SOCKET_URL || 'wss://iqoption.com/echo/websocket';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9'
    };
    this.cookies = '';
    this.balance = 0;
    this.isConnected = false;
    this.realAPI = new IQOptionRealAPI();
  }

  async login(email, password) {
    try {
      console.log('🔐 [JS] Intentando login REAL con nueva API...');
      
      // Usar la nueva API real
      const result = await this.realAPI.login(email, password);
      
      if (result.success && result.real) {
        console.log('✅ [JS] Login REAL exitoso con nueva API');
        this.isConnected = true;
        this.balance = result.balance || 0;
        return result;
      } else if (!result.success) {
        console.log('❌ [JS] Login real falló');
        
        // EN PRODUCCIÓN: NO usar simulación, fallar directamente
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
          console.log('🚫 [PRODUCCIÓN] No se permite simulación, fallando');
          return {
            success: false,
            message: 'No se pudo conectar con IQ Option. Datos reales requeridos en producción.',
            error: 'NO_REAL_CONNECTION'
          };
        }
        
        // Solo en desarrollo local: usar simulación
        console.log('🔧 [LOCAL] Usando fallback simulado para desarrollo');
        return this.getSimulatedLogin();
      }
      
      return result;
      
    } catch (error) {
      console.error('💥 [JS] Error en login real:', error.message);
      
      // EN PRODUCCIÓN: NO usar simulación, fallar directamente
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
        console.log('🚫 [PRODUCCIÓN] Error de conexión, no se permite simulación');
        return {
          success: false,
          message: `Error de conexión con IQ Option: ${error.message}`,
          error: 'CONNECTION_ERROR'
        };
      }
      
      // Solo en desarrollo local: usar simulación
      console.log('🔧 [LOCAL] Error de conexión, usando simulación para desarrollo');
      return this.getSimulatedLogin();
    }
  }

  getSimulatedLogin() {
    this.isConnected = true;
    this.balance = 10000;
    return { 
      success: true, 
      message: 'Login exitoso (modo demo - fallback)',
      balance: 10000,
      simulated: true
    };
  }

  async getBalance() {
    try {
      // En producción siempre devolver balance simulado
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
        return { success: true, balance: this.balance || 10000, simulated: true };
      }

      if (!this.isConnected) {
        return { success: true, balance: this.balance || 10000, simulated: true };
      }

      const response = await axios.get(`${this.tradeApiUrl}/profile`, {
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.result) {
        this.balance = response.data.result.balance;
        return { success: true, balance: this.balance };
      }
      
      return { success: true, balance: this.balance || 10000, simulated: true };
    } catch (error) {
      console.error('Error obteniendo balance, usando simulado:', error.message);
      return { success: true, balance: this.balance || 10000, simulated: true };
    }
  }

  generateSimulatedHistory(count = 50) {
    const instruments = ['EURUSD', 'GBPUSD', 'USDJPY', 'EURJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP'];
    const results = ['Ganado', 'Perdido', 'Empate'];
    const history = [];
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < count; i++) {
      const isWin = Math.random() > 0.45; // 55% probabilidad de ganar
      const isDraw = !isWin && Math.random() > 0.9; // 10% probabilidad de empate
      const amount = Math.floor(Math.random() * 100) + 10; // Entre $10 y $110
      const payout = 0.8 + Math.random() * 0.4; // Payout entre 80% y 120%
      const profit = isDraw ? 0 : (isWin ? amount * payout : -amount);
      const result = isDraw ? 'Empate' : (isWin ? 'Ganado' : 'Perdido');
      
      const operationTime = now - (i * 3600000) - Math.random() * oneDay; // Operaciones distribuidas en tiempo
      const date = new Date(operationTime);
      
      history.push({
        id: `sim_${i + 1}_${Date.now()}`,
        created: Math.floor(operationTime / 1000),
        expired: Math.floor(operationTime / 1000) + 300, // 5 minutos después
        activo: instruments[Math.floor(Math.random() * instruments.length)],
        inversion: amount,
        resultado: result,
        ganancia_bruta: isDraw ? amount : (isWin ? amount + profit : 0), // Devolución total
        ganancia: profit, // Ganancia neta
        capital: isWin ? amount : 0,
        porcentaje: Math.round(payout * 100),
        tipo_instrumento: Math.random() > 0.5 ? 'turbo' : 'binary',
        tiempo_compra: date.toLocaleString('es-ES').replace(/\//g, '.'),
        tiempo_cierre: new Date(operationTime + 300000).toLocaleString('es-ES').replace(/\//g, '.'),
        fecha_simple: date.toLocaleDateString('es-ES')
      });
    }
    
    return history.sort((a, b) => b.created - a.created); // Más recientes primero
  }

  async getHistorial(email, password, accountType = 'REAL', fechaInicio = null, fechaFin = null, instrumento = 'all') {
    try {
      console.log('📊 [JS] Obteniendo historial con nueva API REAL...');
      
      // Usar la nueva API real primero
      const result = await this.realAPI.getHistorial(email, password, accountType, fechaInicio, fechaFin, instrumento);
      
      if (result.success && result.real && result.history?.length > 0) {
        console.log('✅ [JS] Historial REAL obtenido:', result.history.length, 'operaciones');
        return {
          success: true,
          history: result.history,
          balance: result.balance,
          account_type: result.account_type,
          real: true,
          estadisticas: this.calculateStats(result.history)
        };
      } else {
        console.log('❌ [JS] Historial real falló o vacío');
        
        // EN PRODUCCIÓN: NO usar simulación, fallar directamente
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
          console.log('🚫 [PRODUCCIÓN] No se permite simulación, fallando');
          return {
            success: false,
            message: 'No se pudo obtener historial real de IQ Option. Datos reales requeridos en producción.',
            error: 'NO_REAL_DATA'
          };
        }
        
        // Solo en desarrollo local: usar simulación
        console.log('🔧 [LOCAL] Usando fallback simulado para desarrollo');
        return this.getSimulatedHistorial(accountType, fechaInicio, fechaFin, instrumento);
      }
      
    } catch (error) {
      console.error('💥 [JS] Error obteniendo historial real:', error.message);
      
      // EN PRODUCCIÓN: NO usar simulación, fallar directamente
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
        console.log('🚫 [PRODUCCIÓN] Error obteniendo historial, no se permite simulación');
        return {
          success: false,
          message: `Error obteniendo historial de IQ Option: ${error.message}`,
          error: 'HISTORY_ERROR'
        };
      }
      
      // Solo en desarrollo local: usar simulación
      console.log('🔧 [LOCAL] Error obteniendo historial, usando simulación para desarrollo');
      return this.getSimulatedHistorial(accountType, fechaInicio, fechaFin, instrumento);
    }
  }

  getSimulatedHistorial(accountType = 'REAL', fechaInicio = null, fechaFin = null, instrumento = 'all') {
    console.log('🔄 Generando historial simulado como fallback...');
    const simulatedHistory = this.generateSimulatedHistory(120);
    
    let filteredHistory = simulatedHistory;
      
    // Filtrar por fechas si se especifican
    if (fechaInicio || fechaFin) {
      const startDate = fechaInicio ? new Date(fechaInicio + 'T00:00:00').getTime() / 1000 : 0;
      const endDate = fechaFin ? new Date(fechaFin + 'T23:59:59').getTime() / 1000 : Date.now() / 1000;
      
      filteredHistory = filteredHistory.filter(op => 
        op.created >= startDate && op.created <= endDate
      );
    }
    
    // Filtrar por instrumento
    if (instrumento && instrumento !== 'all') {
      filteredHistory = filteredHistory.filter(op => 
        op.activo.toLowerCase().includes(instrumento.toLowerCase())
      );
    }
    
    return {
      success: true,
      history: filteredHistory,
      balance: this.balance || 10000,
      account_type: accountType,
      simulated: true,
      estadisticas: this.calculateStats(filteredHistory)
    };
  }

  calculateStats(history) {
    if (!history || history.length === 0) {
      return {
        totalOperations: 0,
        totalInvestment: 0,
        totalProfit: 0,
        winRate: 0,
        wins: 0,
        losses: 0,
        draws: 0
      };
    }

    const stats = {
      totalOperations: history.length,
      totalInvestment: history.reduce((sum, op) => sum + parseFloat(op.inversion || 0), 0),
      totalProfit: history.reduce((sum, op) => sum + parseFloat(op.ganancia || 0), 0),
      wins: history.filter(op => op.resultado === 'Ganado').length,
      losses: history.filter(op => op.resultado === 'Perdido').length,
      draws: history.filter(op => op.resultado === 'Empate').length
    };

    stats.winRate = stats.totalOperations > 0 
      ? Math.round((stats.wins / stats.totalOperations) * 100) 
      : 0;

    return stats;
  }
}

// Funciones exportadas para mantener compatibilidad con el código existente
exports.loginIQOption = async (email, password) => {
  const api = new IQOptionAPI();
  return await api.login(email, password);
};

exports.obtenerHistorialIQOption = async (email, password, accountType = 'REAL', fechaInicio = null, fechaFin = null, instrumento = 'all') => {
  const api = new IQOptionAPI();
  
  // Intentar login primero
  const loginResult = await api.login(email, password);
  if (!loginResult.success && !loginResult.simulated) {
    return loginResult;
  }
  
  // Obtener historial
  return await api.getHistorial(email, password, accountType, fechaInicio, fechaFin, instrumento);
};

// Exportar la clase también por si se necesita usar directamente
exports.IQOptionAPI = IQOptionAPI;
