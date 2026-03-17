# 🏥 SGA - Sistema de Gestión de Atenciones

### Salud Pereira

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**SGA** es una plataforma web moderna, interactiva y robusta diseñada para la **ESE Salud Pereira**. Su objetivo principal es centralizar y optimizar la gestión de atenciones médicas e institucionales, permitiendo un seguimiento en tiempo real de las metas de productividad de los profesionales de la salud.

---

## 🚀 Características Principales

### 📊 Dashboard Interactivo

- **Métricas en Tiempo Real**: Visualización dinámica de cumplimiento de metas y atenciones diarias.
- **Ránking de Productividad**: Top 10 de profesionales con algoritmos de desempate justos basados en fecha de registro.
- **Gráficos Avanzados**: Implementación con Recharts para una experiencia visual premium.

### 🔐 Seguridad y Control (RBAC)

- **Roles Definidos**: SuperAdmin, Admin y Profesional con permisos estrictamente controlados.
- **Autenticación Robusta**: Implementación segura con Bcryptjs y JWT.
- **Protección de Datos**: Middleware dedicado para la protección de rutas y operaciones sensibles.

### 📱 Experiencia Mobile-First

- Interfaz 100% responsiva utilizando `100dvh` y técnicas modernas de CSS.
- Tablas con _sticky headers_ y truncado dinámico de texto para dispositivos móviles.

### 📧 Automatización y Herramientas

- **Nodemailer Integration**: Recuperación de contraseñas automatizada vía SMTP.
- **Importación/Exportación**: Soporte para carga masiva de usuarios vía CSV y exportación de reportes detallados a Excel.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [TailwindCSS](https://tailwindcss.com/)
- **Backend**: Next.js API Routes, [Prisma ORM](https://www.prisma.io/)
- **Base de Datos**: PostgreSQL / Supabase
- **Visualización**: [Recharts](https://recharts.org/)
- **Comunicación**: Nodemailer (SMTP)
- **Formato**: Lucide React Icons, Radix UI

---

## ⚙️ Configuración e Instalación

### Requisitos Previos

- Node.js v18+
- PostgreSQL (Local o Supabase)

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/dev-juantag/proyecto-aps-pereira.git
   cd proyecto-aps-pereira
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (`.env`):
   ```env
   DATABASE_URL="tu_url_de_postgres"
   JWT_SECRET="tu_secreto_jwt"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMTP_USER="tu_correo"
   SMTP_PASS="tu_clave_app"
   ```
4. Sincronizar Base de Datos:
   ```bash
   npx prisma db push
   ```
5. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## 📖 Manual de Gestión

El sistema ha sido diseñado pensando en la facilidad de mantenimiento:

- **Metas**: Configurables globalmente en `lib/config.ts` o individualmente por programa.
- **Usuarios Inactivos**: Bloqueo automático tras 3 meses de inactividad con reactivación automática por documento.
- **Recuperación**: Generación de claves temporales seguras enviadas directamente al correo profesional.

---

## 📄 Licencia

Este proyecto se encuentra bajo la licencia MIT.

---

**Desarrollado por Juan Taguado**  
_Impulsando la transformación digital en salud._
