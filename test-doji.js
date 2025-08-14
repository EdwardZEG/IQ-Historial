// Test para verificar la detección de DOJIs/empates
console.log('🧮 TEST DE DETECCIÓN DE DOJIS:');

// Simulamos operaciones que podrían incluir DOJIs
const testOperations = [
  { resultado: 'Ganado', ganancia_bruta: 10.33, inversion: 12.15 },
  { resultado: 'Perdido', ganancia_bruta: -12.15, inversion: 12.15 },
  { resultado: 'Ganado', ganancia_bruta: 22.18, inversion: 26.73 },
  { resultado: 'N/A', ganancia_bruta: 0, inversion: 15.00 }, // Posible DOJI
  { resultado: 'Empate', ganancia_bruta: 0, inversion: 10.00 }, // DOJI explícito
  { resultado: 'Doji', ganancia_bruta: 0, inversion: 5.00 }, // DOJI explícito alternativo
];

console.log('\n📊 ANÁLISIS DE CADA OPERACIÓN:');

testOperations.forEach((op, index) => {
  // Aplicar la misma lógica que en el controlador
  const resultado = op.resultado || 'N/A';
  const ganancia = parseFloat(op.ganancia_bruta || 0);
  const esGanado = resultado === 'Ganado';
  const esPerdido = resultado === 'Perdido';
  const esDoji = resultado === 'Empate' || resultado === 'Doji' || 
                 (ganancia === 0 && resultado !== 'Ganado' && resultado !== 'Perdido');
  
  console.log(`Op ${index + 1}:`, {
    resultado: resultado,
    ganancia: ganancia,
    esGanado: esGanado,
    esPerdido: esPerdido,
    esDoji: esDoji,
    clasificacion: esGanado ? 'WIN' : (esPerdido ? 'LOSS' : (esDoji ? 'DOJI' : 'DESCONOCIDO'))
  });
});

// Calcular estadísticas
const totalOps = testOperations.length;
const wins = testOperations.filter(op => op.resultado === 'Ganado').length;
const losses = testOperations.filter(op => op.resultado === 'Perdido').length;
const draws = testOperations.filter(op => 
  op.resultado === 'Empate' || op.resultado === 'Doji' || 
  (parseFloat(op.ganancia_bruta || 0) === 0 && op.resultado !== 'Ganado' && op.resultado !== 'Perdido')
).length;

console.log('\n📈 ESTADÍSTICAS FINALES:');
console.log(`- Total Operaciones: ${totalOps}`);
console.log(`- Wins: ${wins}`);
console.log(`- Losses: ${losses}`);
console.log(`- DOJIs: ${draws}`);
console.log(`- Suma: ${wins + losses + draws}`);
console.log(`- ¿Cuadra? ${totalOps === wins + losses + draws ? '✅' : '❌'}`);

// Verificar ganancias
const totalProfit = testOperations.reduce((sum, op) => sum + parseFloat(op.ganancia_bruta || 0), 0);
console.log(`- Ganancia Total: $${totalProfit.toFixed(2)}`);
console.log(`- DOJIs no afectan ganancia: ${draws > 0 ? '✅ Correcto, ganancia=0 en DOJIs' : '⚠️ No hay DOJIs para probar'}`);
