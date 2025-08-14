const { obtenerHistorialIQOption } = require('../utils/iqApi');

exports.renderHistorial = async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const accountType = req.query.account || 'PRACTICE';
  const instrumento = req.query.instrumento || 'all';
  // Extract date filters from query parameters
  const fecha_inicio = req.query.fecha_inicio;
  const fecha_fin = req.query.fecha_fin;
  // Pagination parameters - 5 registros por página como solicitado
  const page = parseInt(req.query.page) || 1;
  const perPage = 5; // Fijo en 5 registros por página
  
  try {
    console.log('🔍 Obteniendo historial con parámetros:', {
      email: req.session.user.email,
      accountType,
      fecha_inicio,
      fecha_fin,
      instrumento
    });

    const result = await obtenerHistorialIQOption(
      req.session.user.email, 
      req.session.user.password, 
      accountType,
      fecha_inicio, // Use query parameter
      fecha_fin,    // Use query parameter
      instrumento
    );
    
    console.log('📊 Resultado de API:', {
      success: result.success,
      historyCount: result.history ? result.history.length : 0,
      balance: result.balance,
      error: result.error
    });
    
    if (result.success) {
      // Obtener todas las operaciones
      const allHistory = result.history || [];
      console.log('📋 Operaciones recibidas:', allHistory.length);
      
      if (allHistory.length > 0) {
        console.log('🔍 Primera operación de ejemplo:', allHistory[0]);
      }

      // ORDENAR POR FECHA DESCENDENTE (más recientes primero)
      allHistory.sort((a, b) => {
        const dateA = a.created || a.from_time || 0;
        const dateB = b.created || b.from_time || 0;
        return dateB - dateA; // Descendente
      });

      // Implementar paginación
      const totalOperations = allHistory.length;
      const totalPages = Math.ceil(totalOperations / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedHistory = allHistory.slice(startIndex, endIndex);
      
      // Calcular estadísticas usando los campos correctos de la API de Python
      const totalInvestment = allHistory.reduce((sum, op) => sum + parseFloat(op.inversion || op.amount || 0), 0);
      const totalProfit = allHistory.reduce((sum, op) => sum + parseFloat(op.ganancia || op.profit || 0), 0);
      const totalCapitalRecuperado = allHistory.reduce((sum, op) => {
        return sum + ((op.resultado || op.result) === 'win' ? parseFloat(op.inversion || op.amount || 0) : 0);
      }, 0);
      
      // Mapear las operaciones al formato esperado por la vista usando campos correctos
      const operations = allHistory.map(op => ({
        id: Array.isArray(op.id) ? op.id[0] : op.id,
        date: op.created ? new Date(op.created * 1000) : new Date(),
        created_at: op.created ? new Date(op.created * 1000) : new Date(),
        exp_time: op.closed,
        instrument_id: (op.instrument || op.activo || 'N/A').replace('-op', ''),
        direction: op.direccion || op.direction || 'call',
        amount: parseFloat(op.inversion || op.amount || 0),
        result: op.resultado || op.result || 'loss',
        profit: parseFloat(op.ganancia || op.profit || 0),
        capital: parseFloat(op.capital || 0),
        payout: op.porcentaje || 0
      }));
      
      console.log('✅ Operaciones mapeadas para la vista:', operations.length);
      
      res.render('historial', { 
        operations: operations.slice(startIndex, endIndex),
        historial: paginatedHistory, 
        balance: result.balance || 0,
        accountType: result.account_type || accountType,
        estadisticas: result.estadisticas || {},
        periodo: result.periodo || {},
        instrumento: instrumento,
        filtro: fecha_inicio || fecha_fin ? { fecha_inicio, fecha_fin, instrumento } : null,
        // Variables requeridas por la nueva vista
        totalInvestment: totalInvestment.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalCapitalRecuperado: totalCapitalRecuperado.toFixed(2),
        totalOperations: totalOperations,
        // Parámetros para filtros
        fechaInicio: fecha_inicio || '',
        fechaFin: fecha_fin || '',
        resultado: req.query.resultado || '',
        ordenar: req.query.ordenar || 'fecha_desc',
        queryString: req.url.includes('?') ? '&' + req.url.split('?')[1] : '',
        currentPage: page,
        totalPages: totalPages,
        perPage: perPage, // Agregar perPage para el selector
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalOperations,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          pages: Array.from({length: totalPages}, (_, i) => i + 1)
        }
      });
    } else {
      console.log('❌ Error en obtener historial:', result.error);
      res.render('historial', { 
        operations: [],
        historial: [], 
        balance: 0,
        accountType: accountType,
        estadisticas: {},
        periodo: {},
        instrumento: instrumento,
        filtro: fecha_inicio || fecha_fin ? { fecha_inicio, fecha_fin, instrumento } : null, 
        error: result.error,
        // Variables requeridas por la nueva vista
        totalInvestment: '0.00',
        totalProfit: '0.00',
        totalCapitalRecuperado: '0.00',
        totalOperations: 0,
        // Parámetros para filtros
        fechaInicio: fecha_inicio || '',
        fechaFin: fecha_fin || '',
        resultado: req.query.resultado || '',
        ordenar: req.query.ordenar || 'fecha_desc',
        queryString: '',
        currentPage: 1,
        totalPages: 1,
        perPage: perPage,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
          nextPage: 2,
          prevPage: 0,
          pages: [1]
        }
      });
    }
  } catch (error) {
    console.log('💥 Error en renderHistorial:', error.message);
    res.render('historial', { 
      operations: [],
      historial: [], 
      balance: 0,
      accountType: accountType,
      estadisticas: {},
      periodo: {},
      instrumento: instrumento,
      filtro: fecha_inicio || fecha_fin ? { fecha_inicio, fecha_fin, instrumento } : null, 
      error: `Error interno: ${error.message}`,
      // Variables requeridas por la nueva vista
      totalInvestment: '0.00',
      totalProfit: '0.00',
      totalCapitalRecuperado: '0.00',
      totalOperations: 0,
      // Parámetros para filtros
      fechaInicio: fecha_inicio || '',
      fechaFin: fecha_fin || '',
      resultado: req.query.resultado || '',
      ordenar: req.query.ordenar || 'fecha_desc',
      queryString: '',
      currentPage: 1,
      totalPages: 1,
      perPage: perPage,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
        nextPage: 2,
        prevPage: 0,
        pages: [1]
      }
    });
  }
};

exports.filtrarHistorial = async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  
  // CORRIGIR: Tomar el accountType del cuerpo del formulario (POST) o query (GET)
  const accountType = req.body.account || req.query.account || 'PRACTICE';
  const instrumento = req.body.instrumento || req.query.instrumento || 'all';
  const fecha_inicio = req.body.fecha_inicio || req.query.fecha_inicio;
  const fecha_fin = req.body.fecha_fin || req.query.fecha_fin;
  const resultado = req.body.resultado || req.query.resultado;
  const page = parseInt(req.query.page) || 1;
  const perPage = 5; // Mantener consistencia con renderHistorial
  
  try {
    console.log('🔍 Filtrando historial con parámetros:', {
      accountType,
      instrumento,
      fecha_inicio,
      fecha_fin,
      resultado
    });

    const result = await obtenerHistorialIQOption(
      req.session.user.email, 
      req.session.user.password, 
      accountType,
      fecha_inicio,
      fecha_fin,
      instrumento
    );
    
    if (result.success) {
      let allHistory = result.history || [];
      console.log('📊 Operaciones antes de filtros adicionales:', allHistory.length);
      
      // ORDENAR POR FECHA DESCENDENTE (más recientes primero)
      allHistory.sort((a, b) => {
        const dateA = a.created || a.from_time || 0;
        const dateB = b.created || b.from_time || 0;
        return dateB - dateA; // Descendente
      });
      
      // Aplicar filtro por resultado si se especifica
      if (resultado && resultado !== 'all' && resultado !== '') {
        allHistory = allHistory.filter(op => {
          const opResult = op.resultado || op.result;
          return opResult === resultado;
        });
        console.log('🎯 Después de filtro por resultado:', allHistory.length);
      }
      
      // Implementar paginación
      const totalOperations = allHistory.length;
      const totalPages = Math.ceil(totalOperations / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedHistory = allHistory.slice(startIndex, endIndex);
      
      // Calcular estadísticas con campos correctos
      const totalInvestment = allHistory.reduce((sum, op) => sum + parseFloat(op.inversion || op.amount || 0), 0);
      const totalProfit = allHistory.reduce((sum, op) => sum + parseFloat(op.ganancia || op.profit || 0), 0);
      const totalCapitalRecuperado = allHistory.reduce((sum, op) => {
        return sum + ((op.resultado || op.result) === 'win' ? parseFloat(op.inversion || op.amount || 0) : 0);
      }, 0);
      
      // Mapear operaciones con campos correctos
      const operations = allHistory.map(op => ({
        id: Array.isArray(op.id) ? op.id[0] : op.id,
        date: op.created ? new Date(op.created * 1000) : new Date(),
        created_at: op.created ? new Date(op.created * 1000) : new Date(),
        exp_time: op.closed,
        instrument_id: (op.instrument || op.activo || 'N/A').replace('-op', ''),
        direction: op.direccion || op.direction || 'call',
        amount: parseFloat(op.inversion || op.amount || 0),
        result: op.resultado || op.result || 'loss',
        profit: parseFloat(op.ganancia || op.profit || 0),
        capital: parseFloat(op.capital || 0),
        payout: op.porcentaje || 0
      }));
      
      console.log('✅ Operaciones filtradas y mapeadas:', operations.length);
      
      res.render('historial', { 
        operations: operations.slice(startIndex, endIndex),
        historial: paginatedHistory, 
        balance: result.balance || 0,
        accountType: result.account_type || accountType,
        estadisticas: result.estadisticas || {},
        periodo: result.periodo || {},
        instrumento: instrumento,
        filtro: { fecha_inicio, fecha_fin, instrumento, resultado },
        // Variables requeridas por la nueva vista
        totalInvestment: totalInvestment.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalCapitalRecuperado: totalCapitalRecuperado.toFixed(2),
        totalOperations: totalOperations,
        // Parámetros para filtros
        fechaInicio: fecha_inicio || '',
        fechaFin: fecha_fin || '',
        resultado: resultado || '',
        ordenar: req.query.ordenar || 'fecha_desc',
        queryString: req.url.includes('?') ? '&' + req.url.split('?')[1] : '',
        currentPage: page,
        totalPages: totalPages,
        perPage: perPage,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalOperations,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          pages: Array.from({length: totalPages}, (_, i) => i + 1)
        }
      });
    } else {
      console.log('❌ Error en filtrar historial:', result.error);
      res.render('historial', { 
        operations: [],
        historial: [], 
        balance: 0,
        accountType: accountType,
        estadisticas: {},
        periodo: {},
        instrumento: instrumento,
        filtro: { fecha_inicio, fecha_fin, instrumento, resultado },
        error: result.error,
        // Variables por defecto
        totalInvestment: '0.00',
        totalProfit: '0.00',
        totalCapitalRecuperado: '0.00',
        totalOperations: 0,
        fechaInicio: fecha_inicio || '',
        fechaFin: fecha_fin || '',
        resultado: resultado || '',
        ordenar: req.query.ordenar || 'fecha_desc',
        queryString: '',
        currentPage: 1,
        totalPages: 1,
        perPage: perPage,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
          nextPage: 2,
          prevPage: 0,
          pages: [1]
        }
      });
    }
  } catch (error) {
    console.log('💥 Error en filtrarHistorial:', error.message);
    res.render('historial', { 
      operations: [],
      historial: [], 
      balance: 0,
      accountType: accountType,
      estadisticas: {},
      periodo: {},
      instrumento: instrumento,
      filtro: { fecha_inicio, fecha_fin, instrumento, resultado },
      error: `Error interno: ${error.message}`,
      totalInvestment: '0.00',
      totalProfit: '0.00',
      totalCapitalRecuperado: '0.00',
      totalOperations: 0,
      fechaInicio: fecha_inicio || '',
      fechaFin: fecha_fin || '',
      resultado: resultado || '',
      ordenar: req.query.ordenar || 'fecha_desc',
      queryString: '',
      currentPage: 1,
      totalPages: 1,
      perPage: perPage,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
        nextPage: 2,
        prevPage: 0,
        pages: [1]
      }
    });
  }
};
