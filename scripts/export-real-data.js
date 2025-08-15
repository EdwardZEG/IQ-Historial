// Script para exportar datos reales desde local y subirlos para Railway
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function exportRealData() {
    console.log('🔍 Exportando datos reales desde local...');
    
    try {
        // Ejecutar script Python para obtener datos reales
        const result = execSync('python utils/iqApi.py history ciberkali777iq@gmail.com tu_password PRACTICE', {
            encoding: 'utf8',
            timeout: 30000
        });
        
        const data = JSON.parse(result);
        
        if (data.success) {
            // Guardar datos reales para Railway
            const realData = {
                exported_at: new Date().toISOString(),
                balance: data.balance,
                operations: data.operations,
                history: data.history.map(op => ({
                    id: op.id,
                    created: op.created,
                    expired: op.expired,
                    activo: op.activo,
                    inversion: op.inversion,
                    resultado: op.resultado,
                    ganancia: op.ganancia,
                    ganancia_bruta: op.ganancia_bruta,
                    capital: op.capital,
                    porcentaje: op.porcentaje,
                    tipo_instrumento: op.tipo_instrumento,
                    tiempo_compra: op.tiempo_compra,
                    tiempo_cierre: op.tiempo_cierre,
                    fecha_simple: op.fecha_simple
                }))
            };
            
            // Escribir archivo de datos reales
            fs.writeFileSync(
                path.join(__dirname, '../data/real_data.json'), 
                JSON.stringify(realData, null, 2)
            );
            
            console.log(`✅ Datos reales exportados: ${data.operations} operaciones, balance: $${data.balance}`);
            console.log('📁 Archivo guardado en: data/real_data.json');
            
        } else {
            console.error('❌ Error obteniendo datos:', data.error);
        }
        
    } catch (error) {
        console.error('❌ Error ejecutando script:', error.message);
    }
}

if (require.main === module) {
    exportRealData();
}

module.exports = { exportRealData };
