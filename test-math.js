// Test simple para verificar el problema matemático
console.log('🧮 SIMULANDO EL PROBLEMA DE CONTEO:');

// Datos simulados basados en logs anteriores
const operations = [
  { resultado: 'Ganado', ganancia: 10.33 },
  { resultado: 'Ganado', ganancia: 22.18 },
  { resultado: 'Perdido', ganancia: -12.15 },
  { resultado: 'Ganado', ganancia: 105.26 },
  { resultado: 'Perdido', ganancia: -56.95 },
  { resultado: 'N/A', ganancia: 0 }, // Esta sería la operación problemática
];

console.log('📊 ANÁLISIS DE RESULTADOS:');
const totalOps = operations.length;
const ganadas = operations.filter(op => op.resultado === 'Ganado').length;
const perdidas = operations.filter(op => op.resultado === 'Perdido').length;
const otras = operations.filter(op => op.resultado !== 'Ganado' && op.resultado !== 'Perdido').length;

console.log(`- Total operaciones: ${totalOps}`);
console.log(`- Ganadas: ${ganadas}`);
console.log(`- Perdidas: ${perdidas}`);
console.log(`- Otras: ${otras}`);
console.log(`- Ganadas + Perdidas: ${ganadas + perdidas}`);
console.log(`- ¿Cuadra? ${totalOps === ganadas + perdidas + otras ? '✅' : '❌'}`);

// ANTES (método incorrecto)
const winsIncorrect = operations.filter(op => op.resultado === 'Ganado' || (op.resultado === 'Ganado' ? 'win' : 'loss') === 'win').length;
const lossesIncorrect = operations.filter(op => op.resultado === 'Perdido' || (op.resultado === 'Ganado' ? 'win' : 'loss') === 'loss').length;

console.log('\n❌ MÉTODO ANTERIOR (INCORRECTO):');
console.log(`- Wins: ${winsIncorrect}`);
console.log(`- Losses: ${lossesIncorrect}`);
console.log(`- Total: ${winsIncorrect + lossesIncorrect} vs ${totalOps}`);

// DESPUÉS (método correcto)
const winsCorrect = operations.filter(op => op.resultado === 'Ganado').length;
const lossesCorrect = operations.filter(op => op.resultado === 'Perdido').length;

console.log('\n✅ MÉTODO NUEVO (CORRECTO):');
console.log(`- Wins: ${winsCorrect}`);
console.log(`- Losses: ${lossesCorrect}`);
console.log(`- Other: ${totalOps - winsCorrect - lossesCorrect}`);
console.log(`- Total: ${winsCorrect + lossesCorrect + (totalOps - winsCorrect - lossesCorrect)} vs ${totalOps}`);
