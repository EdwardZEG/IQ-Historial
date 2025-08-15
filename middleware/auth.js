// Middleware de autenticación para proteger rutas
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    console.log(`🔒 Acceso denegado a ${req.url} - Usuario no autenticado`);
    return res.redirect('/?message=Debe iniciar sesión para acceder a esta página');
  }
  
  console.log(`✅ Usuario autenticado accediendo a ${req.url}:`, req.session.user.email);
  next();
};

// Middleware para verificar si el usuario ya está autenticado (para evitar login duplicado)
const requireGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/historial');
  }
  next();
};

module.exports = {
  requireAuth,
  requireGuest
};
