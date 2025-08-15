# IQ Historial

Aplicación web para consultar el historial de operaciones de IQ Option, con inicio de sesión y filtrado por fechas. 

🚀 **Optimizada para deployment en Vercel**

## ✨ Características

- 🔐 Autenticación con credenciales de IQ Option
- 📊 Visualización de historial de operaciones
- 📱 Interfaz responsive (móvil y desktop)
- 🎯 Filtrado por fechas, instrumentos y resultados
- 📈 Estadísticas de rendimiento (ganancias, pérdidas, empates)
- 🔄 Paginación de resultados
- 💰 Balance de cuenta en tiempo real

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, Bootstrap 5, Tailwind CSS
- **Estilos**: CSS personalizado con animaciones
- **Deployment**: Vercel-ready
- **API**: Integración JavaScript con IQ Option

## 🚀 Deploy en Vercel

### Opción 1: Deploy directo desde GitHub

1. Sube tu proyecto a GitHub
2. Ve a [Vercel](https://vercel.com/)
3. Conecta tu repositorio
4. Vercel detectará automáticamente la configuración
5. ¡Deploy completado!

### Opción 2: Deploy usando Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Deploy
vercel

# Para deploy de producción
vercel --prod
```

## 🔧 Instalación Local

```bash
# Clonar repositorio
git clone <tu-repo>
cd IQ-Historial

# Instalar dependencias
npm install

# Crear archivo de entorno (opcional)
cp .env.example .env

# Iniciar servidor
npm start

# Para desarrollo
npm run dev
```

## 🌐 Uso

1. Accede a la aplicación web
2. Ingresa tus credenciales de IQ Option
3. Selecciona el tipo de cuenta (REAL/PRACTICE)
4. Filtra por fechas o instrumentos
5. Visualiza tus estadísticas de trading

### URLs disponibles:
- `/` - Página de login
- `/historial` - Vista desktop del historial
- `/historial-mobile` - Vista móvil optimizada

## ⚙️ Configuración

### Variables de entorno (opcionales):

```env
PORT=3000
SESSION_SECRET=tu_secreto_seguro
NODE_ENV=production
```

### Archivos de configuración:

- `vercel.json` - Configuración de Vercel
- `package.json` - Dependencias y scripts
- `.gitignore` - Archivos ignorados por Git

## 📦 Estructura del proyecto

```
IQ-Historial/
├── app.js              # Servidor principal
├── package.json        # Dependencias
├── vercel.json         # Config de Vercel
├── controllers/        # Lógica de negocio
├── routes/            # Rutas de la app
├── views/             # Templates EJS
├── public/            # Archivos estáticos
├── utils/             # Utilidades y API
└── README.md          # Este archivo
```

## 🔒 Seguridad

- Sesiones seguras con cookies httpOnly
- Headers de seguridad para producción
- Validación de entrada de usuario
- Manejo seguro de errores

## 📱 Responsive Design

- ✅ Optimizado para móviles
- ✅ Interfaz adaptativa
- ✅ Touch-friendly en dispositivos móviles
- ✅ Iconos SVG personalizados

## 🐛 Resolución de problemas

### Error "Cannot find module"
```bash
npm install
```

### La aplicación no inicia
```bash
# Verificar versión de Node.js
node --version  # Debe ser >= 16

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problemas de conexión con IQ Option
La aplicación incluye un modo simulado que funciona sin conexión real a IQ Option para testing y desarrollo.

## 📄 Licencia

Este proyecto es de uso personal. No redistribuir sin autorización.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

⭐ **¿Te gustó el proyecto? ¡Dale una estrella en GitHub!**
