#!/usr/bin/env node
/**
 * Generador de SESSION_SECRET seguro para IQ Historial
 * Ejecuta: node generate-secret.js
 */

const crypto = require('crypto');

console.log('🔐 GENERADOR DE SESSION_SECRET\n');

// Generar secreto de 64 caracteres
const secret = crypto.randomBytes(32).toString('hex');

console.log('✅ SESSION_SECRET generado:\n');
console.log(`SESSION_SECRET=${secret}\n`);

console.log('📋 PASOS SIGUIENTES:\n');
console.log('1. Copia el valor de arriba');
console.log('2. Ve a Vercel Dashboard > Settings > Environment Variables');
console.log('3. Agrega: SESSION_SECRET = (pegar el valor)');
console.log('4. Agrega: NODE_ENV = production');
console.log('5. Deploy tu app\n');

console.log('💡 TIP: Guarda este secreto en un lugar seguro para futuras referencias');
console.log('🚨 NUNCA compartas este secreto públicamente\n');

// También mostrar formato para .env local
console.log('📝 Para desarrollo local (.env):');
console.log('SESSION_SECRET=' + secret);
console.log('NODE_ENV=development');
console.log('PORT=3000\n');
