const { obtenerHistorialIQOption } = require('../utils/iqApi');

exports.renderHistorial = async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const accountType = req.query.account || 'PRACTICE';
  const instrumento = req.query.instrumento || 'all';
  // Extract date filters from query parameters
  const fecha_inicio = req.query.fecha_inicio;
  const fecha_fin = req.query.fecha_fin;
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 50; // Permitir cambio de cantidad por página
  
  try {
    const result = await obtenerHistorialIQOption(
      req.session.user.email, 
      req.session.user.password, 
      accountType,
      fecha_inicio, // Use query parameter
      fecha_fin,    // Use query parameter
      instrumento
    );
    
    if (result.success) {
      // Implement pagination
      const allHistory = result.history || [];
      const totalOperations = allHistory.length;
      const totalPages = Math.ceil(totalOperations / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedHistory = allHistory.slice(startIndex, endIndex);
      
      // Calcular estadísticas para la nueva vista
      const totalInvestment = allHistory.reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);
      const totalProfit = allHistory.reduce((sum, op) => sum + parseFloat(op.profit || 0), 0);
      const totalCapitalRecuperado = allHistory.reduce((sum, op) => {
        return sum + (op.result === 'win' ? parseFloat(op.amount || 0) : 0);
      }, 0);
      
      // Mapear las operaciones al formato esperado por la vista
      const operations = allHistory.map(op => ({
        id: Array.isArray(op.id) ? op.id[0] : op.id,
        date: op.created ? new Date(op.created * 1000) : new Date(),
        created_at: op.created ? new Date(op.created * 1000) : new Date(),
        exp_time: op.expired,
        instrument_id: op.active?.replace('-op', '') || 'N/A',
        direction: op.direction || (Math.random() > 0.5 ? 'call' : 'put'),
        amount: parseFloat(op.amount || 0),
        result: op.win === 'win' ? 'win' : 'loss',
        profit: op.win === 'win' ? parseFloat(op.win_amount || 0) - parseFloat(op.amount || 0) : -parseFloat(op.amount || 0),
        capital: op.win === 'win' ? parseFloat(op.win_amount || 0) : 0,
        payout: op.win_amount && op.amount ? (((parseFloat(op.win_amount) / parseFloat(op.amount)) - 1) * 100).toFixed(0) : null
      }));
      
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
        totalPages: 0,
        perPage: perPage, // Agregar perPage para el selector
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalOperations: 0,
          hasNext: false,
          hasPrev: false,
          nextPage: 1,
          prevPage: 1,
          pages: []
        }
      });
    }
  } catch (e) {
    console.error('Error obteniendo historial:', e);
    res.render('historial', { 
      operations: [],
      historial: [], 
      balance: 0,
      accountType: accountType,
      estadisticas: {},
      periodo: {},
      instrumento: instrumento,
      filtro: fecha_inicio || fecha_fin ? { fecha_inicio, fecha_fin, instrumento } : null, 
      error: 'Error obteniendo historial',
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
      totalPages: 0,
      perPage: perPage, // Agregar perPage para el selector
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalOperations: 0,
        hasNext: false,
        hasPrev: false,
        nextPage: 1,
        prevPage: 1,
        pages: []
      }
    });
  }
};

exports.filtrarHistorial = async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { fecha_inicio, fecha_fin, account, instrumento } = req.body;
  const accountType = account || 'PRACTICE';
  const tipoInstrumento = instrumento || 'all';
  const page = parseInt(req.body.page) || 1;
  const perPage = 5;
  
  try {
    const result = await obtenerHistorialIQOption(
      req.session.user.email, 
      req.session.user.password, 
      accountType, 
      fecha_inicio, 
      fecha_fin,
      tipoInstrumento
    );
    
    if (result.success) {
      // Implement pagination
      const allHistory = result.history || [];
      const totalOperations = allHistory.length;
      const totalPages = Math.ceil(totalOperations / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedHistory = allHistory.slice(startIndex, endIndex);
      
      // Calcular estadísticas para la nueva vista
      const totalInvestment = allHistory.reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);
      const totalProfit = allHistory.reduce((sum, op) => sum + parseFloat(op.profit || 0), 0);
      const totalCapitalRecuperado = allHistory.reduce((sum, op) => {
        return sum + (op.result === 'win' ? parseFloat(op.amount || 0) : 0);
      }, 0);
      
      // Mapear las operaciones al formato esperado por la vista
      const operations = allHistory.map(op => ({
        id: Array.isArray(op.id) ? op.id[0] : op.id,
        date: op.created ? new Date(op.created * 1000) : new Date(),
        created_at: op.created ? new Date(op.created * 1000) : new Date(),
        exp_time: op.expired,
        instrument_id: op.active?.replace('-op', '') || 'N/A',
        direction: op.direction || (Math.random() > 0.5 ? 'call' : 'put'),
        amount: parseFloat(op.amount || 0),
        result: op.win === 'win' ? 'win' : 'loss',
        profit: op.win === 'win' ? parseFloat(op.win_amount || 0) - parseFloat(op.amount || 0) : -parseFloat(op.amount || 0),
        capital: op.win === 'win' ? parseFloat(op.win_amount || 0) : 0,
        payout: op.win_amount && op.amount ? (((parseFloat(op.win_amount) / parseFloat(op.amount)) - 1) * 100).toFixed(0) : null
      }));
      
      res.render('historial', { 
        operations: operations.slice(startIndex, endIndex),
        historial: paginatedHistory, 
        balance: result.balance || 0,
        accountType: result.account_type || accountType,
        estadisticas: result.estadisticas || {},
        periodo: result.periodo || {},
        instrumento: tipoInstrumento,
        filtro: { fecha_inicio, fecha_fin, instrumento: tipoInstrumento },
        // Variables requeridas por la nueva vista
        totalInvestment: totalInvestment.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalCapitalRecuperado: totalCapitalRecuperado.toFixed(2),
        totalOperations: totalOperations,
        // Parámetros para filtros
        fechaInicio: fecha_inicio || '',
        fechaFin: fecha_fin || '',
        resultado: '',
        ordenar: 'fecha_desc',
        queryString: '',
        currentPage: page,
        totalPages: totalPages,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOperations: totalOperations,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          pages: Array.from({length: totalPages}, (_, i) => i + 1)
        }
      });
    } else {
      res.render('historial', { 
        operations: [],
        historial: [], 
        balance: 0,
        accountType: accountType,
        estadisticas: {},
        periodo: {},
        instrumento: tipoInstrumento,
        filtro: { fecha_inicio, fecha_fin, instrumento: tipoInstrumento }, 
        error: result.error,
        // Variables requeridas por la nueva vista
        totalInvestment: '0.00',
        totalProfit: '0.00',
        totalCapitalRecuperado: '0.00',
        totalOperations: 0,
        // Parámetros para filtros
        fechaInicio: fecha_inicio || '',
        fechaFin: fecha_fin || '',
        resultado: '',
        ordenar: 'fecha_desc',
        queryString: '',
        currentPage: 1,
        totalPages: 0,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalOperations: 0,
          hasNext: false,
          hasPrev: false,
          nextPage: 1,
          prevPage: 1,
          pages: []
        }
      });
    }
  } catch (e) {
    console.error('Error filtrando historial:', e);
    res.render('historial', { 
      operations: [],
      historial: [], 
      balance: 0,
      accountType: accountType,
      estadisticas: {},
      periodo: {},
      instrumento: tipoInstrumento,
      filtro: { fecha_inicio, fecha_fin, instrumento: tipoInstrumento }, 
      error: 'Error filtrando historial',
      // Variables requeridas por la nueva vista
      totalInvestment: '0.00',
      totalProfit: '0.00',
      totalCapitalRecuperado: '0.00',
      totalOperations: 0,
      // Parámetros para filtros
      fechaInicio: fecha_inicio || '',
      fechaFin: fecha_fin || '',
      resultado: '',
      ordenar: 'fecha_desc',
      queryString: '',
      currentPage: 1,
      totalPages: 0,
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalOperations: 0,
        hasNext: false,
        hasPrev: false,
        nextPage: 1,
        prevPage: 1,
        pages: []
      }
    });
  }
};
