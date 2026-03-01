INFORME FINAL DE DESARROLLO - PROYECTO SGA (SISTEMA DE GESTIÓN DE ATENCIONES)
ESE SALUD PEREIRA - DESARROLLADO POR JUAN TAGUADO

---

1. PROBLEMA
La ESE Salud Pereira requería un sistema digital moderno, seguro y centralizado para la gestión y seguimiento de las atenciones médicas/institucionales realizadas por sus profesionales. Anteriormente, el control de metas, la medición de productividad y la organización de la información por programas carecía de una plataforma interactiva que permitiera tanto a los directivos (SuperAdmins/Admins) como a los profesionales de la salud, visualizar su progreso en tiempo real. Otro obstáculo era la correcta visualización en dispositivos móviles (responsividad) debido a la naturaleza dinámica del trabajo del personal, y la carencia de restricciones de seguridad que impidieran la manipulación accidental de usuarios vitales.

---

2. OBJETIVOS
- General: Desarrollar e implementar una plataforma web App (SGA) altamente interactiva y responsiva para centralizar los registros de atenciones y el cálculo de cumplimiento de metas de la ESE Salud Pereira.
- Específicos:
  * Implementar un sistema de autenticación seguro basado en roles estables (SuperAdmin, Admin, Profesional).
  * Construir un panel de indicadores (Dashboard) que en tiempo real refleje métricas, atenciones diarias, y genere un Ránking de productividad con algoritmos de desempate justos.
  * Diseñar una interfaz Mobile-First que garantice que ninguna tabla, gráfico o menú se rompa o entorpezca la experiencia de usuario en tablets o celulares.
  * Dotar a la aplicación de un sistema automatizado de recuperación de contraseñas vía correo electrónico.

---

3. REQUERIMIENTOS
3.1. Funcionales:
- Autenticación: Sistema de Login, encriptación de contraseñas con Bcrypt, protección de rutas y un flujo de recuperación de contraseña con token al correo y generador de contraseñas seguras temporales.
- Gestión de Usuarios (CRUD): Creación de usuarios donde el SuperAdmin controla a los Admins y Profesionales, y el Admin solo controla a Profesionales. Restricción lógica para evitar la auto-eliminación o la supresión del SuperAdmin base.
- Listado Paginado y Búsqueda: Filtros funcionales para todas las tablas de datos (Pacientes, Atenciones, Programas, Usuarios).
- Registro de Datos: Formularios para la captura de atenciones con validación en base de datos.
- Panel de Control (Dashboard) / Reportes: Cálculos automáticos de barras de progreso basados en una "Meta General" o "Metas Individuales" de los programas, listado de "Top 10 Profesionales" y Distribución de registros organizados alfabéticamente.

3.2. No Funcionales:
- Responsividad (UI/UX): La interfaz debe aplicar propiedades de anchos dinámicos, `100dvh` para pantallas de celulares, manejo de comportamientos de desbordamiento de tablas (`overflow-hidden`) e interfaces amigables ("sticky header", división de nombres largos en vista miniatura).
- Seguridad: Hasheo de credenciales y autorización (JWT/Context) en lado del cliente y del servidor.
- Rendimiento: Peticiones a Prisma y Next.js App Router optimizadas con carga paralela (`Promise.all()`) para acelerar la muestra de gráficos Recharts.

---

4. DISEÑO
- Arquitectura: Se utilizó un enfoque basado en componentes bajo React y Next.js, apoyado en el framework de CSS TailwindCSS para la maquetación.
- Base de Datos: Esquema relacional montado bajo Prisma ORM para gestionar los vínculos directos entre Programa, Usuario (Profesional) y Atenciones.
- UX/UI: Paleta de colores institucional, modo claro, iconografía mediante `lucide-react`, y priorización visual. Se implementaron filtros Invert en CSS para acoplar el logo de ESE Salud Pereira correctamente a los menús oscuros (Sidebar).

---

5. DESARROLLO
Se dividió el desarrollo en Módulos (Inicio, Atenciones, Usuarios, Reportes, Programas, Pacientes). 
- Se construyó la API de backend de manera adyacente en la carpeta `app/api/`. 
- El Frontend se protegió usando un `auth-context.tsx`.
- Se abordaron retos de renderizado creando algoritmos complejos usando `.sort()` y `.filter()`, tales como la lógica del Top 10 que prioriza a quien alcanzo la meta primero (cálculo por `createdAtISO`).
- Se estableció un módulo `mailer.ts` utilizando SMTP (Nodemailer) para enviar de forma fiable los correos con la aplicación integrada.

---

6. PRUEBAS
Se realizaron validaciones consecutivas en los endpoints de Next.js:
- Pruebas Funcionales: Se verificó la imposibilidad de crear usuarios sin un Programa asociado, se verificó el registro exitoso del usuario "Superadmin".
- Pruebas de Despliegue Responsivo: Simulación del dispositivo móvil para corroborar que la tabla del Top 10 contrajera la columna de Programa y recortara el texto dinámicamente.
- Pruebas de Estrés/Casos Borde: Se evaluó la tabla de Ránking en caso de que existiese un empate perfecto de atenciones o un registro igual a "0".

---

7. IMPLEMENTACIÓN
El proyecto resultó en un aplicativo con una interfaz pulida y limpia, lista para ser desplegada en un servicio de Cloud moderno (Vercel, AWS o VPS propio). El sistema de configuración (`lib/config.ts`) se estructuró para dejar el mantenimiento a un toque de distancia (modificable a la medida respecto a las "Metas" sin requerir grandes reestructuraciones y alteración de env. variables de SMTP).

---

8. MANUAL DE USUARIO Y GUÍA DE CONFIGURACIÓN

Este apartado te guiará sobre cómo realizar cambios futuros en la plataforma de manera fácil y rápida, sin miedo a romper el código fuente:

8.1. CÓMO MODIFICAR LAS METAS (Global e Individual)
- Meta Global: Por defecto, el sistema exige una meta de 80. Si necesitas cambiar este número, abre el archivo `lib/config.ts` y modifica el valor de `META_INDIVIDUAL_POR_DEFECTO: 80`. Automáticamente todo el Panel de Reportes y Dashboards usará este nuevo número base.
- Meta Individual: Si algún programa (por ejemplo, "Enfermería") necesita una meta distinta a la global (ej: 120), ve al panel de "Administración > Programas", dale a crear/editar, y colócale ese número en el campo "Meta". El sistema le dará prioridad a esta meta específica por encima de la global.

8.2. CÓMO CAMBIAR LOS LOGOTIPOS E ICONOS
- Asegúrate de que tus nuevas imágenes (logos) estén dentro de la carpeta `/public` y preferiblemente en formato `.png`.
- Favicon (Icono del Navegador Web): Para cambiarlo, abre el archivo `app/layout.tsx`. Busca la línea que dice `icons: { icon: '/icono-ese-salud-pereira.png' }` y reemplaza el nombre del archivo.
- Logo de Pantalla de Inicio de Sesión: Ve a `components/login-page.tsx` y busca la imagen (`<img src="/logo-ese-salud-pereira.png" ... />`).
- Logo del Panel (Sidebar & Móvil): Ve a `components/dashboard.tsx` y busca `<img src="/icono-ese-salud-pereira.png" ... />`. Nota: Estos logos usan un filtro (`brightness-0 invert`) para dibujarse en color blanco.

8.3. CÓMO CAMBIAR EL NOMBRE DE LA APP O INFORMACIÓN SEO (Para Buscadores)
- Abre el archivo clave: `app/layout.tsx`.
- En la constante `export const metadata = { ... }`, veras comentario de "cambiar". Ahí podrás editar el campo `title` (Título), `description` (Descripción general), y `keywords` (Palabras de búsqueda en Google/borde web). 
- Modificar el título de `metadata` actualizará automáticamente el texto que sale en la pestañita del navegador cuando un usuario ingresa y los enlaces pre-visualizados de WhatsApp.

8.4. CÓMO CONFIGURAR O ARREGLAR LA RECUPERACIÓN DE CONTRASEÑA POR CORREO
El reseteo de claves envía una "contraseña temporal" por email al instante.
1. Para que esto funcione en Producción o en otro equipo, debes configurar tu archivo oculto `.env` (.env).
2. Agrega allí tus variables reales:
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=tu-correo.institucional@gmail.com
   SMTP_PASS=tu-contraseña-de-aplicación-segura
   APP_URL=http://localhost:3000
3. Si utilizas Gmail, recuerda que debes encender la "Verificación en 2 pasos" en tu cuenta y generar una "Contraseña de aplicación" para ponerla allí. (El sistema utiliza 'Nodemailer' en el archivo `lib/mailer.ts` para conectar la magia de forma segura).

8.5. CÓMO ELIMINAR O REFRESCAR UN USUARIO INACTIVO
- Política de los 3 meses: Si un profesional pasa más de 3 meses sin Iniciar Sesión, el sistema lo bloquea preventivamente (aparece Inactivo al intentar entrar).
- Solución Admin: Si esto ocurre y deseas reactivarlo, un Administrador o SuperAdmin solo debe ir a la tabla de "Usuarios", ubicar aquel usuario reportado e intentar crear/importar un usuario con su *misma cédula*. El sistema reconocerá automáticamente que el usuario estaba inactivo y lo "Revivirá", permitiéndole acceder nuevamente al portal con normalidad. No importa si es de forma manual individual, o subiendo un archivo Excel/CSV completo.

8.6. INSTRUCCIONES PARA LA IMPORTACIÓN MASIVA DE USUARIOS (Excel/CSV)
El sistema permite la creación masiva de usuarios mediante la subida de un archivo.
- Formato: Suba un archivo CSV en formato (Valores Separados por Comas).
- Orden de columnas (Obligatorio):
  1. Nombre Completo
  2. Documento
  3. Email
  4. Contraseña (columna ignorada)
  5. Rol (admin o profesional)
  6. Programa (Enfermería, odontología etc) si es admin, dejar vacio

- Notas Importantes a Considerar:
  * Lo ideal es que en el campo nombre sea solo el primer nombre con los apellidos.
  * La columna de contraseña siempre es ignorada a la hora de procesarse la base de datos. El sistema la genera sola (1ra letra del nombre en mayúscula + documento) y todas las contraseñas estan encriptadas con Bcrypt.
  * Debes colocar el nombre del programa tal cual como aparece en la lista de programas (texto exacto).
  * Como precaución, la primera fila de tu Excel o CSV siempre será ignorada asumiendo que son los títulos.
  * El sistema ignorará a usuarios cuyo documento ya exista, pero reactivará a los que estén Inactivos.

8.7. EXPORTACIÓN DE DATOS (Descargas en formato Excel)
El aplicativo provee potentes motores de generación de informes para llevar el registro externo de la operación:
- Descarga de Reportes Estadísticos: Desde la pestaña "Atenciones" cualquier directivo tiene acceso al botón "Exportar Atenciones". 
  * Puedes elegir "Todo el historial" o delimitar la descarga por "Filtrar por rango de fechas" usando los calendarios interactivos.
  * También puedes realizar búsquedas por nombre de paciente, o aplicar filtros rápidos de "Barrio" o "Etnia" antes de darle a exportar.
  * ¿Qué se descarga?: Un archivo `.csv` compatible 100% con Microsoft Excel ordenado cronológicamente. Posee absolutamente todas las columnas (campos) con las que el profesional llenó el formulario, desde fechas hasta diagnósticos y direcciones estructuradas, ideal para cruce de datos con la Secretaría de Salud o el MSPS.
- Tabla de Reportes Gráficos (Dashboard): Los resúmenes visuales del dashboard te permiten ver consolidadamente la "Meta vs Registros". Aunque están de forma visual, la propia lógica del Excel en bruto descargable desde Atenciones es la que surte estos gráficos, por lo que las exportaciones son la pura "Base de Datos" intacta.

8.8. MODIFICAR CANTIDAD DE PROFESIONALES EN EL "TOP" DEL DASHBOARD
En el archivo `components/dashboard-home.tsx`, si deseas ajustar cuántos profesionales se ven en la tabla de ranking (por ejemplo, pasar de Top 10 a Top 5):
1. Abre el archivo mencionado en tu editor.
2. Busca en las primeras líneas del componente la siguiente variable constante:
   `const TOP_N_PROFESIONALES = 10;`
3. Modifica ese número por la cantidad que desees mostrar (por ejemplo, 5). 
4. El título de la tabla y la cantidad mostrada en pantalla se actualizarán de forma automática.

8.9. REINICIAR ESTADÍSTICAS / NUEVA ETAPA
En caso de que inicie un nuevo mes, semestre o etapa de trabajo para la ESE Salud Pereira, existe la función de "Reiniciar Estadísticas" localizada en la vista de Reportes (solo disponible para Administradores):
1. Dirígete a la pestaña "Reportes".
2. Ubica el botón rojo que dice "Reiniciar Estadísticas" y haz clic allí.
3. Se mostrará una alerta de riesgo advirtiendo las consecuencias.
4. Al confirmar, ocurrirán dos cosas estructurales:
   - Se desactivarán todos los usuarios con rol de "Profesional" en la base de datos (se deberán re-activar para continuar el nuevo proceso).
   - "La Etapa Actual" en el Dashboard, Métricas de Reportes, y el Top iniciará completamente desde "CERO", calculando únicamente las Atenciones generadas a partir de la fecha y hora de la reiniciación.
5. Todo el historial médico antiguo seguirá guardado en la base de datos.
6. Si deseas exportar o visualizar la historia pasada:
   - En la vista de "Reportes", puedes marcar la casilla "Ver todo el historial" para que los gráficos retornen a mostrar los totales históricos combinados.
   - En la vista de "Atenciones", la opción "Descargar Excel" mostrará la capacidad de descargar "Etapa Actual", "Todo el historial", o incluso filtrar fechas.

---

9. GUÍA DE INSTALACIÓN Y DESPLIEGUE DESDE CERO

Si necesitas trasladar este proyecto a un nuevo equipo, servidor o instancia web, hay una serie de tecnologías y pasos que debes tener en cuenta.

9.1. LIBRERÍAS Y TECNOLOGÍAS CLAVE DEL SISTEMA
El proyecto utiliza librerías modernas de React y Node.js. Las más importantes son:
- Next.js (Framework principal estilo App Router).
- Prisma ORM (Gestor de Base de Datos para comunicarse con PostgreSQL).
- TailwindCSS (Sistema de estilos para los diseños y responsividad).
- Recharts (Librería para los hermosos gráficos que se ven en Reportes y Dashboard).
- Nodemailer (Para el envío de emails con contraseñas temporales por SMTP).
- Bcrypt (Para el encriptado y validación segura de las contraseñas).
- JSONWebToken (JWT) (Para manejar la sesión e inicio firme de los usuarios).
- Radix UI & Lucide React (Componentes interactivas base y los iconos unificados).

9.2. PASO A PASO PARA INSTALAR EN UN ENTORNO NUEVO

PASO 1: Requisitos Previos del Entorno
- Instala Node.js (versión 18 o superior).
- Opcional pero recomendado: Descarga e instala Git, o Visual Studio Code.
- Debes tener una cuenta en algún servicio de Base de datos en la nube (ej: Supabase) para obtener una conexión PostgreSQL, o tener PostgreSQL instalado localmente.

PASO 2: Extraer el Proyecto
- Descomprime o clona la carpeta del código base del 'Proyecto-aps' en tu nuevo ordenador.
- Abre la terminal (o PowerShell) y navega a la carpeta exacta: `cd "C:\Ruta\Al\Proyecto-aps"`

PASO 3: Instalación de Dependencias
- Escribe el comando para descargar todas las librerías mencionadas:
  `npm install` (o `npm install --legacy-peer-deps` si arroja advertencias de versiones).

PASO 4: Configurar Variables de Entorno
- En la carpeta principal, debes crear un archivo llamado `.env` (si no existe, guíate del un archivo de ejemplo).
- Este archivo debe contener al menos:
  DATABASE_URL="postgres://usuario:pass@host:5432/tubasededatos?sslmode=require"
  JWT_SECRET="alguna_palabra_secreta_muy_larga"
  SMTP_HOST="smtp.gmail.com"
  SMTP_PORT="465"
  SMTP_USER="tucorreo@gmail.com"
  SMTP_PASS="tu_contraseña_de_app"

PASO 5: Sincronizar la Base de Datos
- Para crear todas las tablas (Pacientes, Usuarios, Atenciones, etc) que el código requiere en tu base de datos conectada en el .env, debes ejecutar el comando de Prisma:
  `npx prisma db push` o `npx prisma db migrate dev`

PASO 6: Inyectar el Primer Usuario (Semilla / Seed)
- Como la base de datos estará en blanco, necesitas un usuario "Superadmin" para poder ingresar y crear los demás desde la interfaz.
- Abre tu archivo `prisma/seed.ts`. Allí verás código con corchetes (ej: `[NOMBRE_AQUI]`, `[CONTRASEÑA_AQUI]`, etc).
- Reemplaza esos corchetes EXACTOS (con todo y las comillas) por tus datos reales.
- Luego en la consola, ejecuta este comando:
  `npx prisma db seed`
- Este script inyectará la contraseña ya encriptada de forma segura y dejará el login listo para entrar con ese correo.

PASO 7: Iniciar el Servidor de Desarrollo
- Si vas a seguir programando o simplemente encenderlo local, debes ejecutar:
  `npm run dev`
- Y acceder a `http://localhost:3000` en tu navegador.

PASO 8: Despliegue a Producción (Cloud como Vercel o Host)
- En un entorno definitivo el comando a ejecutar es para compilar el proyecto:
  `npm run build`
- Luego que termine su renderizado web, ejecutas el inicio de las operativas:
  `npm run start`
