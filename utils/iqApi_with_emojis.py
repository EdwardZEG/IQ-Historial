import sys
import json
import time
import datetime
from iqoptionapi.stable_api import IQ_Option

class IQOptionAPI:
    def __init__(self):
        self.api = None
        self.connected = False

    def connect(self, email, password):
        try:
            self.api = IQ_Option(email, password)
            check, reason = self.api.connect()
            
            if check:
                self.connected = True
                balance = self.api.get_balance()
                return {
                    "success": True, 
                    "message": "Conectado correctamente a IQ Option",
                    "balance": balance
                }
            else:
                return {"success": False, "error": f"Fallo en conexión: {reason}"}
        except Exception as e:
            return {"success": False, "error": f"Error de conexión: {str(e)}"}

    def get_history(self, account_type="PRACTICE", start_date=None, end_date=None, instrument="all"):
        try:
            if not self.connected:
                return {"success": False, "error": "No conectado a IQ Option"}

            # Cambiar tipo de cuenta
            self.api.change_balance(account_type)
            
            # Configurar fechas
            if not end_date:
                end_date = int(time.time())
            else:
                # Convertir fecha string a timestamp
                try:
                    end_date = int(
                        datetime.datetime.strptime(end_date, "%Y-%m-%d").timestamp()
                    )
                except:
                    end_date = int(time.time())

            if not start_date:
                start_date = end_date - (30 * 24 * 60 * 60)  # 30 días atrás
            else:
                try:
                    start_date = int(
                        datetime.datetime.strptime(start_date, "%Y-%m-%d").timestamp()
                    )
                except:
                    start_date = end_date - (30 * 24 * 60 * 60)

            print(f"🔍 Buscando operaciones desde {datetime.datetime.fromtimestamp(start_date)} hasta {datetime.datetime.fromtimestamp(end_date)}")

            # Intentar diferentes métodos para obtener historial REAL
            history = []
            methods_tried = []
            
            try:
                print("🔄 Intentando método: get_position_history_v2")
                success, data = self.api.get_position_history_v2("binary-option", 1000, 0, start_date, end_date)
                methods_tried.append("get_position_history_v2")
                if success and data:
                    history = data if isinstance(data, list) else []
                    print(f"✅ get_position_history_v2 devolvió {len(history)} operaciones")
                else:
                    print(f"⚠️ get_position_history_v2 no devolvió datos: success={success}")
            except Exception as e:
                print(f"❌ get_position_history_v2 falló: {e}")
                
            if not history:
                try:
                    print("🔄 Intentando método: get_position_history")
                    success, data = self.api.get_position_history("binary-option")
                    methods_tried.append("get_position_history")
                    if success and data:
                        all_positions = data if isinstance(data, list) else []
                        # Filtrar por fecha
                        history = [pos for pos in all_positions if pos.get('created', 0) >= start_date and pos.get('created', 0) <= end_date]
                        print(f"✅ get_position_history filtrado devolvió {len(history)} de {len(all_positions)} operaciones")
                    else:
                        print(f"⚠️ get_position_history no devolvió datos: success={success}")
                except Exception as e:
                    print(f"❌ get_position_history falló: {e}")
                    
            if not history:
                try:
                    print("🔄 Intentando método: get_positions")
                    success, data = self.api.get_positions("binary-option")
                    methods_tried.append("get_positions")
                    if success and data:
                        all_positions = data if isinstance(data, list) else []
                        # Filtrar por fecha
                        history = [pos for pos in all_positions if pos.get('created', 0) >= start_date and pos.get('created', 0) <= end_date]
                        print(f"✅ get_positions filtrado devolvió {len(history)} de {len(all_positions)} operaciones")
                    else:
                        print(f"⚠️ get_positions no devolvió datos: success={success}")
                except Exception as e:
                    print(f"❌ get_positions falló: {e}")

            if history is None:
                history = []

            print(f"📊 Total de métodos intentados: {methods_tried}")
            print(f"📊 Operaciones encontradas: {len(history)}")

            # Formatear los datos REALES
            formatted_history = []
            current_balance = self.api.get_balance()
            
            print(f"💰 Balance actual: ${current_balance}")

            for i, trade in enumerate(history):
                try:
                    # Depurar la primera operación para ver la estructura
                    if i == 0:
                        print(f"🔍 Estructura de la primera operación:")
                        print(f"Keys disponibles: {list(trade.keys())}")
                        print(f"Trade completo: {trade}")
                    
                    formatted_trade = {
                        "id": trade.get("id", f"trade_{i}"),
                        "activo": f"{trade.get('instrument', trade.get('active', 'N/A'))}-op",
                        "instrument": trade.get("instrument", trade.get("active", "N/A")),
                        "amount": float(trade.get("amount", trade.get("invest", 0))),
                        "inversion": float(trade.get("amount", trade.get("invest", 0))),
                        "direccion": trade.get("direction", "call"),
                        "direction": trade.get("direction", "call"),
                        "profit": float(trade.get("profit", trade.get("win", 0))),
                        "ganancia_bruta": float(trade.get("profit", trade.get("win", 0))),
                        "ganancia": float(trade.get("profit", trade.get("win", 0))),
                        "porcentaje": (
                            (float(trade.get("profit", trade.get("win", 0))) / float(trade.get("amount", trade.get("invest", 1)))) * 100
                            if trade.get("amount", trade.get("invest", 0)) > 0 else 0
                        ),
                        "capital": current_balance,
                        "created": trade.get("created", trade.get("from_time", int(time.time()))),
                        "closed": trade.get("closed", trade.get("to_time", int(time.time()))),
                        "resultado": "win" if float(trade.get("profit", trade.get("win", 0))) > 0 else "loss",
                        "result": "win" if float(trade.get("profit", trade.get("win", 0))) > 0 else "loss",
                        "profit_amount": float(trade.get("profit", trade.get("win", 0))),
                        "fecha": datetime.datetime.fromtimestamp(
                            trade.get("created", trade.get("from_time", int(time.time())))
                        ).strftime("%Y-%m-%d %H:%M:%S"),
                        "hora": datetime.datetime.fromtimestamp(
                            trade.get("created", trade.get("from_time", int(time.time())))
                        ).strftime("%H:%M:%S"),
                    }
                    formatted_history.append(formatted_trade)
                except Exception as e:
                    print(f"❌ Error al formatear operación {i}: {e}")
                    print(f"Operación problemática: {trade}")
            
            print(f"✅ Operaciones REALES formateadas: {len(formatted_history)}")
            
            # Aplicar filtro por instrumento si se especifica
            if instrument != "all" and instrument:
                original_count = len(formatted_history)
                formatted_history = [
                    trade for trade in formatted_history 
                    if trade["instrument"].lower() == instrument.lower()
                ]
                print(f"🔍 Filtro de instrumento '{instrument}': {original_count} → {len(formatted_history)} operaciones")

            # Calcular estadísticas REALES
            if formatted_history:
                total_investment = sum(op["inversion"] for op in formatted_history)
                total_profit = sum(op["ganancia"] for op in formatted_history)
                winning_trades = [op for op in formatted_history if op["resultado"] == "win"]
                losing_trades = [op for op in formatted_history if op["resultado"] == "loss"]
                
                estadisticas = {
                    "total_operaciones": len(formatted_history),
                    "inversion_total": total_investment,
                    "beneficio_bruto_total": total_profit,
                    "capital_total": sum(op["inversion"] for op in winning_trades),
                    "operaciones_ganadoras": len(winning_trades),
                    "operaciones_perdedoras": len(losing_trades),
                    "porcentaje_exito": (len(winning_trades) / len(formatted_history)) * 100 if formatted_history else 0
                }
                
                print(f"📈 Estadísticas calculadas:")
                print(f"   - Total operaciones: {estadisticas['total_operaciones']}")
                print(f"   - Inversión total: ${estadisticas['inversion_total']:.2f}")
                print(f"   - Beneficio total: ${estadisticas['beneficio_bruto_total']:.2f}")
                print(f"   - Operaciones ganadoras: {estadisticas['operaciones_ganadoras']}")
                print(f"   - Operaciones perdedoras: {estadisticas['operaciones_perdedoras']}")
                print(f"   - Porcentaje de éxito: {estadisticas['porcentaje_exito']:.1f}%")
            else:
                estadisticas = {
                    "total_operaciones": 0,
                    "inversion_total": 0,
                    "beneficio_bruto_total": 0,
                    "capital_total": 0,
                    "operaciones_ganadoras": 0,
                    "operaciones_perdedoras": 0,
                    "porcentaje_exito": 0
                }
                print("⚠️ No se encontraron operaciones reales en el período especificado")
                print("💡 Sugerencia: Verifica las fechas o realiza algunas operaciones en IQ Option")

            return {
                "success": True,
                "history": formatted_history,
                "count": len(formatted_history),
                "balance": current_balance,
                "estadisticas": estadisticas,
                "account_type": account_type,
                "periodo": {
                    "fecha_inicio": datetime.datetime.fromtimestamp(start_date).strftime("%Y-%m-%d"),
                    "fecha_fin": datetime.datetime.fromtimestamp(end_date).strftime("%Y-%m-%d")
                }
            }

        except Exception as e:
            print(f"[ERROR] Error critico en get_history: {str(e)}")
            return {"success": False, "error": f"Error obteniendo historial: {str(e)}"}

    def disconnect(self):
        if self.api and self.connected:
            try:
                self.connected = False
                print("🔌 Desconectado de IQ Option")
            except:
                pass

def main():
    try:
        if len(sys.argv) < 2:
            result = {"success": False, "error": "No action specified"}
            print(json.dumps(result))
            return

        action = sys.argv[1]
        iq_api = IQOptionAPI()

        if action == "login":
            if len(sys.argv) < 4:
                result = {"success": False, "error": "Email and password required"}
                print(json.dumps(result))
                return

            email = sys.argv[2]
            password = sys.argv[3]

            result = iq_api.connect(email, password)
            print(json.dumps(result))

        elif action == "history":
            if len(sys.argv) < 4:
                result = {"success": False, "error": "Email and password required"}
                print(json.dumps(result))
                return

            email = sys.argv[2]
            password = sys.argv[3]
            account_type = sys.argv[4] if len(sys.argv) > 4 else "PRACTICE"
            start_date = sys.argv[5] if len(sys.argv) > 5 else None
            end_date = sys.argv[6] if len(sys.argv) > 6 else None
            instrument = sys.argv[7] if len(sys.argv) > 7 else "all"

            # Primero conectar
            connect_result = iq_api.connect(email, password)
            if not connect_result["success"]:
                print(json.dumps(connect_result))
                return

            # Obtener historial REAL
            history_result = iq_api.get_history(
                account_type, start_date, end_date, instrument
            )
            print(json.dumps(history_result))

        else:
            result = {"success": False, "error": f"Unknown action: {action}"}
            print(json.dumps(result))

    except Exception as e:
        result = {"success": False, "error": f"Script error: {str(e)}"}
        print(json.dumps(result))

    finally:
        if "iq_api" in locals():
            iq_api.disconnect()

if __name__ == "__main__":
    main()
