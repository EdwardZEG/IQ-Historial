const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const historialController = require('../controllers/historialController');

router.get('/', authController.renderLogin);
router.post('/login', authController.login);
router.get('/historial', historialController.renderHistorial);
router.get('/historial-mobile', historialController.renderHistorialMobile);
router.post('/filtrar', historialController.filtrarHistorial);
router.post('/cambiar-cuenta', historialController.renderHistorial);

// Rutas adicionales para móvil
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.json({ message: 'Perfil de usuario - En desarrollo', user: req.session.user.email });
});

router.get('/settings', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.json({ message: 'Configuración - En desarrollo' });
});

module.exports = router;
