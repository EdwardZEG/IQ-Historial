#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando proceso de deployment para Vercel...\n');

// Verificar archivos necesarios
const requiredFiles = [
  'package.json',
  'vercel.json',
  'app.js',
  'views',
  'controllers',
  'routes',
  'utils'
];

console.log('1️⃣ Verificando archivos necesarios...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - FALTANTE`);
    process.exit(1);
  }
}

console.log('\n2️⃣ Verificando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('   ✅ Dependencias instaladas');
} catch (error) {
  console.log('   ❌ Error instalando dependencias');
  process.exit(1);
}

console.log('\n3️⃣ Verificando configuración de Vercel...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (vercelConfig.version === 2 && vercelConfig.builds) {
  console.log('   ✅ vercel.json configurado correctamente');
} else {
  console.log('   ❌ vercel.json mal configurado');
  process.exit(1);
}

console.log('\n✨ ¡Proyecto listo para deployment!\n');
console.log('📋 Próximos pasos:');
console.log('');
console.log('   Opción 1 - Deploy directo:');
console.log('   1. Ve a https://vercel.com/');
console.log('   2. Conecta tu repositorio GitHub');
console.log('   3. Vercel detectará automáticamente la configuración');
console.log('');
console.log('   Opción 2 - Usar Vercel CLI:');
console.log('   1. npm i -g vercel');
console.log('   2. vercel login');
console.log('   3. vercel');
console.log('');
console.log('🎯 URLs de tu aplicación (después del deploy):');
console.log('   • Login: https://tu-app.vercel.app/');
console.log('   • Historial Desktop: https://tu-app.vercel.app/historial');
console.log('   • Historial Mobile: https://tu-app.vercel.app/historial-mobile');
console.log('');
console.log('⚡ Características incluidas:');
console.log('   ✅ Login de IQ Option');
console.log('   ✅ Historial simulado (para testing)');
console.log('   ✅ Interface responsive');
console.log('   ✅ Filtros por fecha/instrumento');
console.log('   ✅ Estadísticas de trading');
console.log('   ✅ Manejo de errores');
console.log('   ✅ Optimizado para producción');
console.log('');
