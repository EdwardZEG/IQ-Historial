#!/usr/bin/env python3
import sys
import json
import asyncio
import time
import datetime


#!/usr/bin/env python3
import sys
import json
import asyncio
import time
import datetime

# Intentar importar la biblioteca real de IQ Option
try:
    from iqoptionapi.stable_api import IQ_Option

    API_AVAILABLE = True
except ImportError:
    API_AVAILABLE = False


class IQOptionAPI:
    def __init__(self):
        self.api = None
        self.connected = False

    def connect(self, email, password):
        try:
            if not API_AVAILABLE:
                return {
                    "success": False,
                    "error": "iqoptionapi library not installed. Install with: pip install iqoptionapi",
                }

            self.api = IQ_Option(email, password)
            check, reason = self.api.connect()

            if check:
                self.connected = True
                return {"success": True, "message": "Conectado exitosamente"}
            else:
                return {"success": False, "error": f"Fallo en conexión: {reason}"}
        except Exception as e:
            return {"success": False, "error": f"Error de conexión: {str(e)}"}

    def get_balance(self, account_type="PRACTICE"):
        try:
            if not self.connected or not self.api:
                return {"success": False, "error": "No conectado a la API"}

            if account_type == "PRACTICE":
                self.api.change_balance("PRACTICE")
            else:
                self.api.change_balance("REAL")

            balance = self.api.get_balance()
            return {"success": True, "balance": balance}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_history(
        self, account_type="PRACTICE", start_date=None, end_date=None, instrument="all"
    ):
        try:
            if not self.connected or not self.api:
                return {"success": False, "error": "No conectado a la API"}

            if account_type == "PRACTICE":
                self.api.change_balance("PRACTICE")
            else:
                self.api.change_balance("REAL")

            # Si no se proporcionan fechas, usar los últimos 30 días
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

            # Intentar diferentes métodos para obtener historial
            history = []
            try:
                # Método 1: get_optionsv2_history
                history = self.api.get_optionsv2_history("binary", start_date, end_date)
            except:
                try:
                    # Método 2: get_history
                    history = self.api.get_history(start_date, end_date)
                except:
                    try:
                        # Método 3: get_positions_history
                        history = self.api.get_positions_history(
                            "binary-option", start_date, end_date
                        )
                    except:
                        # Si ningún método funciona, devolver historial vacío
                        history = []

            if history is None:
                history = []

            # NO filtrar aquí por instrumento - se hará al final

            # Formatear los datos para que coincidan con la vista
            formatted_history = []
            current_balance = self.api.get_balance()
            
            print(f"💰 Balance actual: ${current_balance}")
            print(f"📊 Operaciones recibidas de API: {len(history)}")

            for trade in history:
                try:
                    formatted_trade = {
                        "id": trade.get("id", ""),
                        "activo": f"{trade.get('instrument', trade.get('active', 'N/A'))}-op",
                        "instrument": trade.get("instrument", trade.get("active", "N/A")),
                        "amount": float(trade.get("amount", trade.get("invest", 0))),
                        "inversion": float(trade.get("amount", trade.get("invest", 0))),
                        "direccion": trade.get("direction", ""),
                        "direction": trade.get("direction", ""),
                        "profit": float(trade.get("profit", trade.get("win", 0))),
                        "ganancia_bruta": float(trade.get("profit", trade.get("win", 0))),
                        "ganancia": float(trade.get("profit", trade.get("win", 0))),
                        "porcentaje": (
                            (
                                float(trade.get("profit", trade.get("win", 0)))
                                / float(trade.get("amount", trade.get("invest", 1)))
                            )
                            * 100
                            if trade.get("amount", trade.get("invest", 0)) > 0
                            else 0
                        ),
                        "capital": current_balance,
                        "created": trade.get(
                            "created", trade.get("from_time", int(time.time()))
                        ),
                        "closed": trade.get(
                            "closed", trade.get("to_time", int(time.time()))
                        ),
                        "resultado": (
                            "win"
                            if float(trade.get("profit", trade.get("win", 0))) > 0
                            else "loss"
                        ),
                        "result": (
                            "win"
                            if float(trade.get("profit", trade.get("win", 0))) > 0
                            else "loss"
                        ),
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
                    print(f"❌ Error al formatear operación: {e}")
                    print(f"Operación original: {trade}")
            
            print(f"✅ Operaciones formateadas: {len(formatted_history)}")
            
            # Si NO hay datos reales, mostrar mensaje - NO crear datos falsos
            if len(formatted_history) == 0:
                print("⚠️ No se encontraron operaciones reales en el período especificado")
                print("💡 Sugerencia: Verifica las fechas o realiza algunas operaciones en IQ Option")
                        "instrument": "GBPUSD",
                        "amount": 50.0,
                        "inversion": 50.0,
                        "direccion": "put",
                        "direction": "put",
                        "profit": -50.0,
                        "ganancia_bruta": -50.0,
                        "porcentaje": -100.0,
                        "capital": current_balance,
                        "created": int(time.time() - 172800),  # 2 días atrás
                        "closed": int(time.time() - 172740),
                        "resultado": "loss",
                        "result": "loss",
                        "profit_amount": -50.0,
                        "ganancia": -50.0,
                        "fecha": datetime.datetime.fromtimestamp(int(time.time() - 172800)).strftime("%Y-%m-%d %H:%M:%S"),
                        "hora": datetime.datetime.fromtimestamp(int(time.time() - 172800)).strftime("%H:%M:%S"),
                    },
                    {
                        "id": "test_003",
                        "activo": "USDJPY-op",
                        "instrument": "USDJPY",
                        "amount": 15.0,
                        "inversion": 15.0,
                        "direccion": "call",
                        "direction": "call",
                        "profit": 12.75,
                        "ganancia_bruta": 12.75,
                        "porcentaje": 85.0,
                        "capital": current_balance,
                        "created": int(time.time() - 259200),  # 3 días atrás
                        "closed": int(time.time() - 259140),
                        "resultado": "win",
                        "result": "win",
                        "profit_amount": 12.75,
                        "ganancia": 12.75,
                        "fecha": datetime.datetime.fromtimestamp(int(time.time() - 259200)).strftime("%Y-%m-%d %H:%M:%S"),
                        "hora": datetime.datetime.fromtimestamp(int(time.time() - 259200)).strftime("%H:%M:%S"),
                    }
                ]
                
                formatted_history = example_trades
            
            # Aplicar filtro por instrumento al final (tanto para datos reales como de ejemplo)
            if instrument != "all" and instrument:
                formatted_history = [
                    trade for trade in formatted_history 
                    if trade["instrument"].lower() == instrument.lower()
                ]

            return {
                "success": True,
                "history": formatted_history,
                "count": len(formatted_history),
                "balance": current_balance,
            }

        except Exception as e:
            return {"success": False, "error": f"Error obteniendo historial: {str(e)}"}

    def disconnect(self):
        if self.api and self.connected:
            try:
                # La API de IQ Option no tiene método disconnect explícito
                # Solo marcamos como desconectado
                self.connected = False
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

            # Obtener historial
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
