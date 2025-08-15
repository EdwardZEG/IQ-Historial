const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');

const app = express();

// Configuración para Vercel y producción
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para manejar JSON requests

// Configuración de sesiones mejorada para producción
app.use(session({
  secret: process.env.SESSION_SECRET || 'iqoption_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.VERCEL === '1' ? 'auto' : false, // Auto-detectar HTTPS en Vercel
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true, // Protección XSS
    sameSite: 'lax' // Compatibilidad con Vercel
  }
}));

// Middleware para logs y debug de sesiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Debug de sesiones en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔑 Sesión:', {
      sessionID: req.sessionID?.substring(0, 8) + '...',
      user: req.session.user ? req.session.user.email : 'no-user',
      cookies: req.headers.cookie ? 'present' : 'missing'
    });
  }
  
  next();
});

// Rutas
app.use('/', routes);

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render('error', { 
    error: 'Página no encontrada', 
    message: `La ruta ${req.url} no existe.` 
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', { 
    error: 'Error interno del servidor', 
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error interno.' 
      : err.message 
  });
});

const PORT = process.env.PORT || 3000;

// Configuración específica para diferentes plataformas
const isVercel = process.env.VERCEL === '1';
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_NAME;

// Para Railway y desarrollo local, iniciar servidor normalmente
if (!isVercel) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`� Configuración del sistema:`);
    console.log(`- VERCEL: ${process.env.VERCEL === '1' ? '✅' : '❌'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`- RAILWAY: ${isRailway ? '✅' : '❌'}`);
    console.log(`- Python disponible: ✅`);
    
    if (isRailway) {
      console.log(`- Método a usar: Python (real) en Railway`);
    } else {
      console.log(`- Método a usar: Python (real)`);
    }
    
    console.log(`�🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📱 Versión móvil: http://localhost:${PORT}/historial-mobile`);
    
    if (isRailway) {
      console.log(`🚄 Railway deployment successful!`);
    }
  });
}

module.exports = app;
