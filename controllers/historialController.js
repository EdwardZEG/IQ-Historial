const { obtenerHistorialIQOption } = require('../utils/iqApi');

exports.renderHistorial = async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const accountType = req.query.account || 'PRACTICE';
  const instrumento = req.query.instrumento || 'all';
  const fecha_inicio = req.query.fecha_inicio;
  const fecha_fin = req.query.fecha_fin;
  const resultado = req.query.resultado;
  // Pagination parameters - 5 registros por página como solicitado
  const page = parseInt(req.query.page) || 1;
  const perPage = 5; // Fijo en 5 registros por página
  
  try {
    console.log('🔍 Obteniendo historial con parámetros:', {
      email: req.session.user.email,
      accountType,
      fecha_inicio,
      fecha_fin,
      instrumento,
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
    
    console.log('📊 Resultado de API:', {
      success: result.success,
      historyCount: result.history ? result.history.length : 0,
      balance: result.balance,
      error: result.error
    });
    
    if (result.success) {
      // Obtener todas las operaciones
      let allHistory = result.history || [];
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

      // Aplicar filtro por resultado si se especifica
      if (resultado && resultado !== 'all' && resultado !== '') {
        allHistory = allHistory.filter(op => {
          const opResult = op.resultado || op.result;
          if (resultado === 'win') {
            return opResult === 'win' || opResult === 'Ganado';
          } else if (resultado === 'loss') {
            return opResult === 'loss' || opResult === 'Perdido';
          }
          return true;
        });
        console.log('🎯 Después de filtro por resultado:', allHistory.length);
      }

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
      
      // Debug solo para empates si existen
      const empateOperations = allHistory.filter(op => op.resultado === 'Empate' || op.resultado === 'Doji');
      if (empateOperations.length > 0) {
        console.log('🟡 EMPATES DETECTADOS:', empateOperations.length);
        empateOperations.forEach((op, index) => {
          console.log(`Empate ${index + 1}:`, {
            resultado: op.resultado,
            ganancia: op.ganancia,
            ganancia_bruta: op.ganancia_bruta,
            inversion: op.inversion
          });
        });
      }
      
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
        filtro: fecha_inicio || fecha_fin || resultado ? { fecha_inicio, fecha_fin, instrumento, resultado } : null,
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
          pages: Array.from({length: Math.min(totalPages, 10)}, (_, i) => i + Math.max(1, page - 5))
        }
      });
    } else {
      console.log('❌ Error en renderHistorial:', result.error);
      res.render('historial', { 
        operations: [],
        historial: [], 
        balance: 0,
        accountType: accountType,
        estadisticas: {},
        periodo: {},
        instrumento: instrumento,
        filtro: fecha_inicio || fecha_fin ? { fecha_inicio, fecha_fin, instrumento } : null, 
        error: `Error interno: ${result.error}`,
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

// NUEVO MÉTODO CORREGIDO: Simplificar filtrarHistorial para usar redirección
exports.filtrarHistorial = async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  
  // Construir URL de redirección con parámetros
  const accountType = req.body.account || req.query.account || 'PRACTICE';
  const instrumento = req.body.instrumento || req.query.instrumento || 'all';
  const fecha_inicio = req.body.fecha_inicio || req.query.fecha_inicio;
  const fecha_fin = req.body.fecha_fin || req.query.fecha_fin;
  const resultado = req.body.resultado || req.query.resultado;
  
  // Construir query string
  let queryParams = [`account=${accountType}`];
  
  if (instrumento && instrumento !== 'all') {
    queryParams.push(`instrumento=${instrumento}`);
  }
  if (fecha_inicio) {
    queryParams.push(`fecha_inicio=${fecha_inicio}`);
  }
  if (fecha_fin) {
    queryParams.push(`fecha_fin=${fecha_fin}`);
  }
  if (resultado && resultado !== '') {
    queryParams.push(`resultado=${resultado}`);
  }
  
  const redirectUrl = `/historial?${queryParams.join('&')}`;
  
  console.log('🔀 Redirigiendo a:', redirectUrl);
  res.redirect(redirectUrl);
};

// NUEVO: Renderizar historial mobile con filtros por defecto
exports.renderHistorialMobile = async (req, res) => {
  // Datos de prueba temporal si no hay usuario autenticado
  if (!req.session.user) {
    req.session.user = {
      email: 'ciberkali777iq@gmail.com',
      password: 'zaldivar1234'
    };
  }
  const accountType = req.query.account || 'PRACTICE';
  const instrumento = req.query.instrumento || 'all';
  
  // Establecer fechas por defecto: desde abril 2025 si no se especifica otra cosa
  const fechaDefectoInicio = '2025-04-01';
  const fechaDefectoFin = new Date().toISOString().split('T')[0]; // Hoy
  
  const fecha_inicio = req.query.fecha_inicio || fechaDefectoInicio;
  const fecha_fin = req.query.fecha_fin || fechaDefectoFin;
  const resultado = req.query.resultado;
  
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;
  
  try {
    console.log('📱 Obteniendo historial MOBILE con parámetros:', {
      email: req.session.user.email,
      accountType,
      fecha_inicio,
      fecha_fin,
      instrumento,
      resultado,
      isDefaultFilter: !req.query.fecha_inicio && !req.query.fecha_fin
    });

    const result = await obtenerHistorialIQOption(
      req.session.user.email, 
      req.session.user.password, 
      accountType,
      fecha_inicio,
      fecha_fin,
      instrumento
    );
    
    console.log('📊 Resultado de API MOBILE:', {
      success: result.success,
      historyCount: result.history ? result.history.length : 0,
      balance: result.balance,
      error: result.error
    });
    
    if (result.success) {
      // Obtener todas las operaciones
      let allHistory = result.history || [];
      console.log('📋 Operaciones recibidas MOBILE:', allHistory.length);
      
      // Debug: revisar estructura de los datos
      if (allHistory.length > 0) {
        console.log('🔍 ESTRUCTURA DEL PRIMER ELEMENTO:', {
          keys: Object.keys(allHistory[0]),
          sample: allHistory[0]
        });
      }

      // ORDENAR POR FECHA DESCENDENTE (más recientes primero)
      allHistory.sort((a, b) => {
        const dateA = a.created || a.from_time || 0;
        const dateB = b.created || b.from_time || 0;
        return dateB - dateA;
      });

      // Aplicar filtro por resultado si se especifica
      if (resultado && resultado !== 'all' && resultado !== '') {
        allHistory = allHistory.filter(op => {
          const opResult = op.resultado || op.result;
          if (resultado === 'win') {
            return opResult === 'win' || opResult === 'Ganado';
          } else if (resultado === 'loss') {
            return opResult === 'loss' || opResult === 'Perdido';
          } else if (resultado === 'draw') {
            return opResult === 'draw' || opResult === 'Empate' || opResult === 'Doji' || 
                   (parseFloat(op.ganancia_bruta || 0) === 0 && opResult !== 'Ganado' && opResult !== 'Perdido');
          }
          return true;
        });
        console.log('🎯 MOBILE - Después de filtro por resultado:', allHistory.length);
      }

      // Ordenar por fecha más reciente primero (usando expired o created)
      allHistory.sort((a, b) => {
        const dateA = a.expired || a.created || 0;
        const dateB = b.expired || b.created || 0;
        return dateB - dateA; // Más reciente primero
      });
      
      // Implementar paginación después del ordenamiento
      const totalOperations = allHistory.length;
      const totalPages = Math.ceil(totalOperations / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      
      // PRIMERO: Mapear TODAS las operaciones para cálculo de estadísticas
      const allMappedHistory = allHistory.map(op => {
        // Extraer hora de apertura del campo tiempo_compra
        let horaApertura = 'N/A';
        let fechaApertura = 'N/A';
        let fechaCierre = 'N/A';
        
        if (op.tiempo_compra) {
          try {
            // Formato: "06.08.2025, 00:51:01.000"
            const [fechaPart, horaPart] = op.tiempo_compra.split(', ');
            if (fechaPart) {
              fechaApertura = fechaPart.replace(/\./g, '/');
            }
            if (horaPart) {
              horaApertura = horaPart.split('.')[0] || horaPart;
            }
          } catch (e) {
            console.warn('Error procesando tiempo_compra:', op.tiempo_compra);
          }
        }
        
        if (op.tiempo_cierre) {
          try {
            const [fechaPart] = op.tiempo_cierre.split(', ');
            if (fechaPart) {
              fechaCierre = fechaPart.replace(/\./g, '/');
            }
          } catch (e) {
            console.warn('Error procesando tiempo_cierre:', op.tiempo_cierre);
          }
        }
        
        // Crear timestamp para ordenamiento
        let timestamp = Date.now() / 1000;
        if (fechaApertura !== 'N/A' && horaApertura !== 'N/A') {
          try {
            const [dia, mes, año] = fechaApertura.split('/');
            const fechaCompleta = `${año}-${mes}-${dia} ${horaApertura}`;
            timestamp = new Date(fechaCompleta).getTime() / 1000;
          } catch (e) {
            console.warn('Error creando timestamp:', e);
          }
        }
        
        return {
          id: Array.isArray(op.id) ? op.id[0] : (op.id || Date.now()),
          activo: (op.activo || 'N/A').replace('-op', ''),
          inversion: parseFloat(op.inversion || 0),
          amount: parseFloat(op.inversion || 0),
          resultado: op.resultado || 'N/A',
          ganancia: (op.resultado === 'Empate' || op.resultado === 'Doji') 
                    ? 0 : parseFloat(op.ganancia_bruta || 0),
          profit: (op.resultado === 'Empate' || op.resultado === 'Doji') 
                  ? 0 : parseFloat(op.ganancia_bruta || 0),
          created: timestamp,
          hora_apertura: horaApertura,
          duracion: horaApertura
        };
      });
      
      // SEGUNDO: Paginar las operaciones originales
      const paginatedHistory = allHistory.slice(startIndex, endIndex);
      
      // TERCERO: Mapear solo las operaciones paginadas para mostrar
      const mappedHistory = paginatedHistory.map(op => {
        console.log('🔍 ESTRUCTURA OPERACIÓN ORIGINAL:', {
          keys: Object.keys(op),
          fullData: op
        });
        
        // Extraer hora de apertura del campo tiempo_compra
        let horaApertura = 'N/A';
        let fechaApertura = 'N/A';
        let fechaCierre = 'N/A';
        
        if (op.tiempo_compra) {
          try {
            // Formato: "06.08.2025, 00:51:01.000"
            const [fechaPart, horaPart] = op.tiempo_compra.split(', ');
            if (fechaPart) {
              // Convertir "06.08.2025" a formato español "06/08/2025"
              fechaApertura = fechaPart.replace(/\./g, '/');
            }
            if (horaPart) {
              // Extraer solo HH:MM:SS de "00:51:01.000"
              horaApertura = horaPart.split('.')[0] || horaPart;
            }
          } catch (e) {
            console.warn('Error procesando tiempo_compra:', op.tiempo_compra);
            fechaApertura = op.fecha_simple || 'N/A';
          }
        }
        
        if (op.tiempo_cierre) {
          try {
            const [fechaPart] = op.tiempo_cierre.split(', ');
            if (fechaPart) {
              fechaCierre = fechaPart.replace(/\./g, '/');
            }
          } catch (e) {
            fechaCierre = fechaApertura; // Usar misma fecha si falla
          }
        }
        
        // Crear timestamp para ordenamiento (convertir fecha española a timestamp)
        let timestamp = Date.now() / 1000;
        if (fechaApertura !== 'N/A' && horaApertura !== 'N/A') {
          try {
            // Convertir "06/08/2025 00:51:01" a timestamp
            const [dia, mes, año] = fechaApertura.split('/');
            const fechaCompleta = `${año}-${mes}-${dia} ${horaApertura}`;
            timestamp = new Date(fechaCompleta).getTime() / 1000;
          } catch (e) {
            console.warn('Error creando timestamp:', e);
          }
        }
        
        // Mapear usando la estructura real de los datos
        const mappedOp = {
          // ID
          id: Array.isArray(op.id) ? op.id[0] : (op.id || Date.now()),
          
          // Activo - usar el campo correcto y limpiar sufijo
          activo: (op.activo || 'N/A').replace('-op', ''),
          instrument_id: (op.activo || 'N/A').replace('-op', ''),
          
          // Fechas y horas - usar los datos procesados
          created: timestamp,
          fecha_apertura: fechaApertura,
          hora_apertura: horaApertura,
          fecha_cierre: fechaCierre,
          tiempo_compra: fechaApertura,
          tiempo_cierre: fechaCierre,
          
          // Montos - usar los campos correctos
          inversion: parseFloat(op.inversion || 0),
          amount: parseFloat(op.inversion || 0),
          
          // Resultado y ganancia - EMPATES con ganancia = 0
          resultado: op.resultado || 'N/A',
          result: op.resultado === 'Ganado' ? 'win' : 
                  (op.resultado === 'Perdido' ? 'loss' : 
                  (op.resultado === 'Empate' || op.resultado === 'Doji') ? 'draw' : 'unknown'),
          // CORRECCIÓN MEJORADA: Solo usar el resultado explícito de Python para empates
          ganancia: (op.resultado === 'Empate' || op.resultado === 'Doji') 
                    ? 0 : parseFloat(op.ganancia_bruta || 0),
          profit: (op.resultado === 'Empate' || op.resultado === 'Doji') 
                  ? 0 : parseFloat(op.ganancia_bruta || 0),
          
          // Datos originales para debug
          original: op,
          
          // Duración - mostrar hora de apertura como solicitaste
          duracion: horaApertura,
          option_type_id: op.tipo_instrumento === 'turbo' ? '60s' : (op.tipo_instrumento || 'N/A')
        };
        
        console.log('🔄 Operación mapeada:', {
          original: {
            id: op.id,
            active: op.active, 
            amount: op.amount,
            win: op.win,
            win_amount: op.win_amount,
            created: op.created,
            option_type: op.option_type
          },
          mapped: {
            id: mappedOp.id,
            activo: mappedOp.activo,
            inversion: mappedOp.inversion,
            resultado: mappedOp.resultado,
            ganancia: mappedOp.ganancia,
            created: mappedOp.created,
            duracion: mappedOp.duracion
          }
        });
        
        return mappedOp;
      });
      
      // Calcular estadísticas con TODAS las operaciones mapeadas INCLUYENDO DOJIS
      const totalInvestment = allMappedHistory.reduce((sum, op) => sum + parseFloat(op.amount || op.inversion || 0), 0);
      const totalProfit = allMappedHistory.reduce((sum, op) => sum + parseFloat(op.ganancia || op.profit || 0), 0);
      const totalWins = allMappedHistory.filter(op => op.resultado === 'Ganado').length;
      const totalLosses = allMappedHistory.filter(op => op.resultado === 'Perdido').length;
      const totalDraws = allMappedHistory.filter(op => 
        op.resultado === 'Empate' || op.resultado === 'Doji' || 
        (parseFloat(op.ganancia || 0) === 0 && op.resultado !== 'Ganado' && op.resultado !== 'Perdido')
      ).length;
      
      console.log('💰 ESTADÍSTICAS CALCULADAS CON EMPATES:');
      console.log('- Total Investment:', totalInvestment);
      console.log('- Total Profit:', totalProfit);
      console.log('- Total Wins:', totalWins);
      console.log('- Total Losses:', totalLosses);
      console.log('- Total Empates:', totalDraws);
      console.log('- Total Operations:', totalOperations);
      console.log('- Wins + Losses + Empates:', totalWins + totalLosses + totalDraws, '(should equal Total Operations)');
      console.log('- ¿Matemática correcta?', (totalWins + totalLosses + totalDraws === totalOperations) ? '✅' : '❌');
      
      // 🔍 INVESTIGAR DISCREPANCIA EN CONTEO
      console.log('🔍 INVESTIGANDO DISCREPANCIA EN CONTEO:');
      const resultadoStats = {};
      allMappedHistory.forEach(op => {
        const resultado = op.resultado || 'undefined';
        resultadoStats[resultado] = (resultadoStats[resultado] || 0) + 1;
      });
      console.log('- Distribución de resultados:', resultadoStats);
      
      // Mostrar operaciones con resultado raro
      const operacionesRaras = allMappedHistory.filter(op => 
        op.resultado !== 'Ganado' && op.resultado !== 'Perdido'
      );
      if (operacionesRaras.length > 0) {
        console.log('🚨 OPERACIONES CON RESULTADO EXTRAÑO:');
        operacionesRaras.forEach((op, i) => {
          console.log(`Rara ${i+1}:`, {
            id: op.id,
            resultado: op.resultado,
            ganancia: op.ganancia,
            inversion: op.inversion
          });
        });
      }
      
      // Debug: mostrar algunas operaciones para verificar ganancia
      console.log('🔍 MUESTRA DE GANANCIAS:');
      allMappedHistory.slice(0, 10).forEach((op, i) => {
        console.log(`Op ${i+1}:`, {
          ganancia: op.ganancia,
          profit: op.profit,
          resultado: op.resultado,
          inversion: op.inversion || op.amount
        });
      });
      
      console.log('🧮 VERIFICACIÓN DE SUMA:');
      const manualSum = allMappedHistory.slice(0, 10).reduce((sum, op) => sum + parseFloat(op.ganancia || 0), 0);
      console.log('- Suma manual de primeras 10 ops:', manualSum);
      
      // 🔍 BUSCAR LA OPERACIÓN PERDIDA (61+56≠118)
      console.log('🔍 ANÁLISIS DE RESULTADO POR OPERACIÓN:');
      const resultadoCount = {};
      allMappedHistory.forEach((op, index) => {
        const resultado = op.resultado;
        if (!resultadoCount[resultado]) {
          resultadoCount[resultado] = 0;
        }
        resultadoCount[resultado]++;
        
        // Mostrar operaciones con resultado inusual (posibles DOJIs)
        if (resultado !== 'Ganado' && resultado !== 'Perdido') {
          console.log(`❓ POSIBLE EMPATE #${index + 1}:`, {
            id: op.id,
            resultado: resultado,
            ganancia: op.ganancia,
            ganancia_bruta: op.original?.ganancia_bruta,
            inversion: op.inversion,
            capital: op.original?.capital,
            activo: op.activo,
            porcentaje: op.original?.porcentaje,
            isDoji: parseFloat(op.ganancia || 0) === 0,
            estructuraCompleta: op.original
          });
        }
      });
      
      console.log('📊 DISTRIBUCIÓN DE RESULTADOS:', resultadoCount);
      console.log('🧮 VERIFICACIÓN MATEMÁTICA COMPLETA:');
      console.log(`- Ganado: ${resultadoCount['Ganado'] || 0}`);
      console.log(`- Perdido: ${resultadoCount['Perdido'] || 0}`);
      console.log(`- DOJIs/Empates detectados: ${totalDraws}`);
      console.log(`- Otros: ${Object.keys(resultadoCount).filter(k => k !== 'Ganado' && k !== 'Perdido').map(k => `${k}: ${resultadoCount[k]}`).join(', ')}`);
      console.log(`- SUMA ANTERIOR: ${(resultadoCount['Ganado'] || 0) + (resultadoCount['Perdido'] || 0)} vs TOTAL: ${totalOperations}`);
      console.log(`- SUMA CON DOJIS: ${(resultadoCount['Ganado'] || 0) + (resultadoCount['Perdido'] || 0) + totalDraws} vs TOTAL: ${totalOperations}`);
      
      console.log('✅ MOBILE - Operaciones mapeadas y paginadas:', mappedHistory.length, '/', totalOperations);
      
      res.render('historial-mobile', { 
        historial: mappedHistory, 
        balance: result.balance || 0,
        accountType: result.account_type || accountType,
        estadisticas: result.estadisticas || {},
        periodo: result.periodo || {},
        instrumento: instrumento,
        filtro: { fecha_inicio, fecha_fin, instrumento, resultado },
        // Usuario requerido para el template
        user: req.session.user,
        // Variables requeridas por la vista mobile CON DOJIS
        totalInvestment: totalInvestment,
        totalProfit: totalProfit,
        totalWins: totalWins,
        totalLosses: totalLosses,
        totalDraws: totalDraws, // ← NUEVA estadística de DOJIs
        totalOperations: totalOperations,
        // Parámetros para filtros (mostrar valores reales usados)
        fechaInicio: fecha_inicio,
        fechaFin: fecha_fin,
        resultado: resultado || '',
        ordenar: req.query.ordenar || 'fecha_desc',
        currentPage: page,
        totalPages: totalPages,
        perPage: perPage,
        pagination: totalPages > 0 ? {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalOperations,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          pages: Array.from({length: Math.min(totalPages, 10)}, (_, i) => {
            const startPage = Math.max(1, page - 5);
            return startPage + i;
          }).filter(p => p <= totalPages)
        } : null
      });
    } else {
      console.log('❌ Error en renderHistorialMobile:', result.error);
      res.render('historial-mobile', { 
        historial: [], 
        balance: 0,
        accountType: accountType,
        estadisticas: {},
        periodo: {},
        instrumento: instrumento,
        filtro: { fecha_inicio, fecha_fin, instrumento, resultado }, 
        error: `Error al obtener historial: ${result.error}`,
        user: req.session.user,
        totalInvestment: 0,
        totalProfit: 0,
        totalCapitalRecuperado: 0,
        totalOperations: 0,
        fechaInicio: fecha_inicio,
        fechaFin: fecha_fin,
        resultado: resultado || '',
        ordenar: req.query.ordenar || 'fecha_desc',
        currentPage: 1,
        totalPages: 1,
        perPage: perPage,
        pagination: null
      });
    }
  } catch (error) {
    console.log('💥 Error en renderHistorialMobile:', error.message);
    res.render('historial-mobile', { 
      historial: [], 
      balance: 0,
      accountType: accountType,
      estadisticas: {},
      periodo: {},
      instrumento: instrumento,
      filtro: { fecha_inicio, fecha_fin, instrumento, resultado }, 
      error: `Error interno: ${error.message}`,
      user: req.session.user,
      totalInvestment: 0,
      totalProfit: 0,
      totalCapitalRecuperado: 0,
      totalOperations: 0,
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin,
      resultado: resultado || '',
      ordenar: req.query.ordenar || 'fecha_desc',
      currentPage: 1,
      totalPages: 1,
      perPage: perPage,
      pagination: null
    });
  }
};
