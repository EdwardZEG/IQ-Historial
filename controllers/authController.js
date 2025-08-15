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
    return res.render('login', { error: 'Credenciales requeridas' });
  }
  try {
    console.log('🔐 Intentando login para:', email);
    const result = await loginIQOption(email, password);
    
    if (result.success) {
      console.log('✅ Login exitoso para:', email);
      req.session.user = { email, password };
      
      // Detectar si es dispositivo móvil
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent);
      
      // Redirigir directamente sin doble redirección
      if (isMobile) {
        console.log('📱 Dispositivo móvil detectado, redirigiendo a /historial-mobile');
        return res.redirect('/historial-mobile');
      } else {
        console.log('💻 Dispositivo desktop detectado, redirigiendo a /historial');
        return res.redirect('/historial');
      }
    } else {
      console.log('❌ Login fallido para:', email, '- Error:', result.error);
      return res.render('login', { error: result.error || 'Credenciales inválidas' });
    }
  } catch (e) {
    console.error('Error en login:', e);
    return res.render('login', { error: `Error de conexión: ${e}` });
  }
};
