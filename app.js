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
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true // Protección XSS
  }
}));

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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

// Exportar app para Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📱 Versión móvil: http://localhost:${PORT}/historial-mobile`);
  });
}

module.exports = app;
