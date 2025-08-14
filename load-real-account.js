// Script simple para activar la API con tu cuenta real
const http = require('http');

console.log('🔄 Cargando historial de cuenta REAL (ciberkali777iq@gmail.com)...');

// Hacer petición GET a la ruta mobile que carga por defecto REAL account
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/mobile',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = http.request(options, (res) => {
  console.log('✅ Página cargada, status:', res.statusCode);
  console.log('📊 Los logs aparecerán en el terminal del servidor...');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('🎯 Carga completa. Revisa los logs del servidor para ver las estadísticas de DOJIs.');
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
