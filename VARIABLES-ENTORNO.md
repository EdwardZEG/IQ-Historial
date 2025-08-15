# 🚀 GUÍA COMPLETA DE VARIABLES DE ENTORNO

## 📋 Variables para Vercel (Producción)

### 🔐 **VARIABLES CRÍTICAS (Obligatorias):**

```bash
SESSION_SECRET=tu_clave_super_segura_aqui_diferente_a_la_de_desarrollo
```
> ⚠️ **MUY IMPORTANTE:** Genera una clave única y segura para producción

### 🌐 **VARIABLES OPCIONALES (Tienen valores por defecto):**

```bash
# Timeouts y red
HTTP_TIMEOUT=15000

# UI y paginación  
ITEMS_PER_PAGE=10

# Seguridad adicional
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Regional
TIMEZONE=America/Mexico_City
LOCALE=es-ES

# Debug (solo para troubleshooting)
DEBUG_MODE=false
LOG_LEVEL=info
```

---

## 🛠️ **CÓMO CONFIGURAR EN VERCEL:**

### Paso 1: Ir al Dashboard de Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `IQ-Historial`
3. Ve a la pestaña **Settings**
4. Busca la sección **Environment Variables**

### Paso 2: Agregar Variables
```
Key: SESSION_SECRET
Value: [tu clave super segura aquí]
Environment: Production, Preview, Development
```

### Paso 3: Variables Adicionales (Opcionales)
Solo agrega estas si quieres cambiar los valores por defecto:
- `HTTP_TIMEOUT` → `15000`
- `ITEMS_PER_PAGE` → `10`
- `TIMEZONE` → `America/Mexico_City`

---

## 🏠 **DESARROLLO LOCAL (.env):**

Crea o edita el archivo `.env` en tu proyecto:

```bash
# Obligatoria
SESSION_SECRET=una_clave_diferente_para_desarrollo

# Opcional - Python path
PYTHON_PATH=python

# Opcional - Puerto local
PORT=3000
```

---

## ✅ **CONFIGURACIÓN MÍNIMA FUNCIONAL:**

### Para Vercel (Solo esto es obligatorio):
```
SESSION_SECRET=tu_clave_segura_de_produccion
```

### Para Local (Solo esto es obligatorio):
```bash
SESSION_SECRET=tu_clave_de_desarrollo
```

---

## 🔧 **VALORES POR DEFECTO:**

El sistema funciona perfectamente con solo `SESSION_SECRET`. Los demás valores tienen estos defaults:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto local |
| `HTTP_TIMEOUT` | `15000` | Timeout para APIs |
| `IQ_API_URL` | `https://auth.iqoption.com/api/v2.0` | URL de IQ Option |
| `ITEMS_PER_PAGE` | `10` | Operaciones por página |
| `DEBUG_MODE` | `false` | Modo debug |
| `TIMEZONE` | `America/Mexico_City` | Zona horaria |

---

## 🚨 **IMPORTANTE:**

1. **NUNCA** subas tu archivo `.env` a GitHub
2. **SIEMPRE** usa claves diferentes para desarrollo y producción
3. El archivo `.env.example` SÍ se sube a GitHub (sin valores reales)
4. En Vercel, `VERCEL=1` y `NODE_ENV=production` se configuran automáticamente

---

## 🎯 **CONFIGURACIÓN RECOMENDADA:**

### Vercel (Mínima):
```
SESSION_SECRET=mi-super-clave-de-produccion-2025-muy-segura
```

### Local (.env):
```bash
SESSION_SECRET=mi-clave-de-desarrollo-local
PYTHON_PATH=python
DEBUG_MODE=true
```

¡Con esto tu aplicación funcionará perfectamente! 🚀
