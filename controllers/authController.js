const { loginIQOption } = require('../utils/iqApi');

exports.renderLogin = (req, res) => {
  const message = req.query.message;
  res.render('login', { 
    error: null,
    message: message || null
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Email y contraseña son requeridos', message: null });
  }
  
  try {
    console.log('🔐 Intentando login para:', email);
    const result = await loginIQOption(email, password);
    
    if (result && result.success) {
      console.log('✅ Login exitoso para:', email);
      req.session.user = { email, password };
      
      // Forzar el guardado de la sesión antes de redirigir
      req.session.save((err) => {
        if (err) {
          console.error('❌ Error guardando sesión:', err);
          return res.render('login', { 
            error: 'Error interno del servidor. Intente nuevamente.',
            message: null 
          });
        }
        
        // Detectar si es dispositivo móvil
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent);
        
        // Log del tipo de login
        if (result.simulated) {
          console.log('🎯 Login simulado exitoso para entorno de producción');
        }
        
        console.log('💾 Sesión guardada exitosamente para:', email);
        
        // Redirigir después de guardar la sesión
        if (isMobile) {
          console.log('📱 Dispositivo móvil detectado, redirigiendo a /historial-mobile');
          return res.redirect('/historial-mobile');
        } else {
          console.log('💻 Dispositivo desktop detectado, redirigiendo a /historial');
          return res.redirect('/historial');
        }
      });
    } else {
      console.log('❌ Login fallido para:', email, '- Error:', result?.error);
      return res.render('login', { 
        error: result?.error || 'Credenciales inválidas. Verifique su email y contraseña.',
        message: null 
      });
    }
  } catch (error) {
    console.error('💥 Error crítico en login:', error.message);
    console.error('Stack trace:', error.stack);
    return res.render('login', { 
      error: 'Error interno del servidor. Por favor intente nuevamente.',
      message: null 
    });
  }
};
