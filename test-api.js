const http = require('http');

console.log('🔄 Activando API para generar logs...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/historial/mobile?accountType=REAL',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('✅ API call successful, status:', res.statusCode);
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Total operations:', response.totalOperations);
    } catch (error) {
      console.log('Raw response:', data.substring(0, 200));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ API call failed:', error.message);
});

req.end();
