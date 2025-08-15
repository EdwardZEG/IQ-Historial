const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const historialController = require('../controllers/historialController');
const { requireAuth, requireGuest } = require('../middleware/auth');

// Rutas principales
router.get('/', requireGuest, authController.renderLogin);
router.post('/login', authController.login);
router.get('/historial', requireAuth, historialController.renderHistorial);
router.get('/historial-mobile', requireAuth, historialController.renderHistorialMobile);
router.post('/filtrar', requireAuth, historialController.filtrarHistorial);
router.post('/cambiar-cuenta', requireAuth, historialController.renderHistorial);

// Health check para Vercel
router.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../package.json').version
    });
});

// API de estado del servicio
router.get('/api/status', (req, res) => {
    res.status(200).json({
        service: 'IQ Historial API',
        status: 'running',
        features: {
            login: 'enabled',
            historial: 'enabled',
            mobile: 'enabled',
            filtering: 'enabled',
            pagination: 'enabled'
        }
    });
});

// Rutas adicionales
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.get('/profile', requireAuth, (req, res) => {
    res.json({ 
        message: 'Perfil de usuario - En desarrollo', 
        user: req.session.user.email,
        sessionId: req.sessionID
    });
});

router.get('/settings', requireAuth, (req, res) => {
    res.json({ message: 'Configuración - En desarrollo' });
});

module.exports = router;
