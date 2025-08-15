# 🔐 CONFIGURACIÓN DE VARIABLES DE ENTORNO

## 📋 VARIABLES REQUERIDAS PARA VERCEL

### 1. **SESSION_SECRET** (⚠️ OBLIGATORIO)

**¿Qué es?** Un string secreto para firmar las cookies de sesión.

**¿Cómo configurar?**
- Genera un secreto seguro: https://passwordsgenerator.net/
- Mínimo 32 caracteres, usa letras, números y símbolos

**En Vercel Dashboard:**
```
Nombre: SESSION_SECRET
Valor: tu_secreto_super_seguro_de_32_caracteres_minimo
```

**Ejemplo:**
```
SESSION_SECRET=kJ8#mP2$vL9@nQ5&rT1^uW4*eR6!zA3%xC7+bN0-fG2#
```

### 2. **NODE_ENV** (⚠️ IMPORTANTE)

**¿Qué es?** Define el entorno de ejecución.

**En Vercel Dashboard:**
```
Nombre: NODE_ENV
Valor: production
```

### 3. **Variables de API IQ Option** (🔧 OPCIONAL)

Solo necesarias si quieres cambiar las URLs por defecto:

```
IQ_API_URL=https://auth.iqoption.com/api/v2.0
IQ_TRADE_API_URL=https://iqoption.com/api  
IQ_SOCKET_URL=wss://iqoption.com/echo/websocket
```

**❌ NO configures estas a menos que sepas lo que haces**

## 🚀 CÓMO CONFIGURAR EN VERCEL

### Método 1: Dashboard Web

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Click en **Settings**
3. Click en **Environment Variables**
4. Agrega cada variable:

```
SESSION_SECRET = tu_secreto_seguro_aqui
NODE_ENV = production
```

5. Click **Save**
6. **Redeploy** tu aplicación

### Método 2: Vercel CLI

```bash
vercel env add SESSION_SECRET
# Ingresa tu secreto cuando te pregunte

vercel env add NODE_ENV
# Ingresa: production

# Redeploy
vercel --prod
```

## 🔧 CONFIGURACIÓN LOCAL (DESARROLLO)

Para desarrollo local, crea un archivo `.env`:

```bash
# Copia el ejemplo
cp .env.example .env

# Edita el archivo .env
SESSION_SECRET=mi_secreto_local_desarrollo
NODE_ENV=development
PORT=3000
```

## ⚡ VARIABLES QUE VERCEL MANEJA AUTOMÁTICAMENTE

Estas variables están disponibles automáticamente en Vercel:

- **`PORT`**: Puerto del servidor (Vercel lo asigna)
- **`VERCEL`**: Indica que estás en Vercel (valor: "1")
- **`VERCEL_URL`**: URL de tu deployment
- **`VERCEL_ENV`**: Entorno (production/preview/development)

## 🧪 VERIFICAR CONFIGURACIÓN

Después de configurar las variables, verifica con:

```bash
# Health check
curl https://tu-app.vercel.app/api/health

# Debe responder:
{
  "status": "OK",
  "environment": "production",
  ...
}
```

## 🚨 ERRORES COMUNES

### Error: "Session secret required"
```
❌ Solución: Configura SESSION_SECRET en Vercel
```

### Error: "Cannot set headers after they are sent"  
```
❌ Problema: Falta NODE_ENV=production
✅ Solución: Configura NODE_ENV en Vercel
```

### Error: "CORS issues"
```
❌ Problema: URLs de API incorrectas
✅ Solución: Usa las URLs por defecto (no configures IQ_* vars)
```

## 📊 CONFIGURACIÓN MÍNIMA RECOMENDADA

Para que tu app funcione en Vercel, solo necesitas:

```
SESSION_SECRET=tu_secreto_seguro_minimo_32_caracteres
NODE_ENV=production
```

¡Eso es todo! 🎉

## 🔍 VERIFICACIÓN PASO A PASO

1. ✅ **SESSION_SECRET configurado**: No errores de sesión
2. ✅ **NODE_ENV=production**: Cookies seguras habilitadas  
3. ✅ **App deployed**: Funciona en https://tu-app.vercel.app
4. ✅ **Health check**: `/api/health` responde OK

---

**💡 Tip:** Usa un generador de contraseñas para SESSION_SECRET, no uses palabras comunes.
