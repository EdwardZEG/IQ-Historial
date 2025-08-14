const { loginIQOption } = require('../utils/iqApi');

exports.renderLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Credenciales requeridas' });
  }
  try {
    const result = await loginIQOption(email, password);
    if (result.success) {
      req.session.user = { email, password };
      
      // Detectar si es dispositivo móvil
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(userAgent);
      
      // Redirigir a la versión correspondiente
      if (isMobile) {
        console.log('📱 Dispositivo móvil detectado, redirigiendo a versión mobile');
        return res.redirect('/historial-mobile');
      } else {
        console.log('💻 Dispositivo desktop detectado, redirigiendo a versión desktop');
        return res.redirect('/historial');
      }
    } else {
      return res.render('login', { error: result.error || 'Credenciales inválidas' });
    }
  } catch (e) {
    console.error('Error en login:', e);
    return res.render('login', { error: `Error de conexión: ${e}` });
  }
};
