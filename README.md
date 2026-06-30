# 🚗 CondoSaaS — Frontend

Interfaz web del sistema de gestión de condominios **CondoSaaS + ParkControl**, desarrollada en React + Vite.

---

## 🧰 Tecnologías

- React 18
- Vite
- Axios
- Bootstrap 5
- React Router DOM

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:8080` |

---

## 🚀 Correr el proyecto localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## 🔗 Conexión con el backend

El frontend consume la API REST del backend CondoSaaS. Asegúrate de tener el backend corriendo antes de levantar el frontend, o apunta `VITE_API_URL` al servidor desplegado en Render:
VITE_API_URL=https://parking-system-backend-0chy.onrender.com

---

## 📁 Estructura del proyecto

src/
├── components/        # Componentes por módulo
│   ├── infraestructura/   # Condominios, torres, pisos, apartamentos
│   ├── parking/           # Módulo ParkControl (mapa, entradas, historial)
│   ├── carritos/          # Gestión de carritos de carga
│   └── shared/            # Dashboard, Sidebar, Login
├── context/           # Estado global (AppContext)
├── hooks/             # Hooks reutilizables
├── services/          # Clientes HTTP hacia la API
├── utils/             # Helpers (JWT, permisos, paginación)
└── styles/            # CSS global y por módulo

---

## 🌐 Demo

Frontend desplegado: https://parking-system-frontend-il10.onrender.com