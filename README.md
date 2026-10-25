# Star Hotel

Sistema de catálogo y reservas de habitaciones. La página de inicio presenta el hotel y permite buscar una estancia; en Habitaciones se explora el catálogo, se aplican filtros y se abre el detalle antes de reservar.

El proyecto permite explorar el catálogo, consultar disponibilidad, reservar de una a cuatro habitaciones y completar un pago simulado, con los datos guardados en MongoDB. La referencia visual es el prototipo [star-hotel-catalog.lovable.app](https://star-hotel-catalog.lovable.app/).

Se utilizará **el clúster original del equipo en MongoDB Atlas**, con la base **`starthotel_db`** preparada durante el Sprint 3. La base anterior `starhotel` se conserva por separado; el clúster alternativo que se creó para una demostración no se utilizará. [docs/atlas.md](docs/atlas.md) explica cómo seleccionar el perfil privado y comprobar la conexión.

Las funciones del **Sprint 4** se probaron en local y la estructura de `starthotel_db` se comprobó en Atlas mediante una consulta de solo lectura, con resultado compatible. Queda iniciar y probar esta versión con Atlas y adjuntar a Jira las capturas de la base en el panel del clúster original, como pidió el ingeniero. [docs/despliegue.md](docs/despliegue.md) contiene las variables, los pasos de publicación y las comprobaciones pendientes de realizar en la nube.

**Para recibir y continuar esta entrega, empezar por [docs/entrega-sprint4.md](docs/entrega-sprint4.md).** Incluye preparación local, cuentas, recorrido de demo, comprobación de la base y diferencias con la otra versión del equipo. La rama `sprint4` conserva nuestro Sprint 3 e incorpora el inicio inspirado en `sprint-3-marvin`, con el estilo actual. La unión completa de ambas versiones sigue pendiente.

## Qué incluye ahora

- Inicio con portada, buscador de fechas y huéspedes, información del hotel, experiencias y preguntas frecuentes.
- Habitaciones destacadas y amenidades tomadas del catálogo, con los colores burdeos y la tipografía actuales.
- Encabezado con accesos a Inicio (`/`) y al catálogo completo en Habitaciones (`/habitaciones`), con filtros laterales y dos columnas en escritorio.
- Seis tipos de habitación, de Q85 a Q260 por noche, con foto, capacidad y amenidades.
- Filtros por fecha, huéspedes, tipo, precio y amenidades.
- Detalle con galería, descripción, servicios y selección de fechas.
- API que sirve el catálogo desde MongoDB.
- Registro, inicio/cierre de sesión y acceso por rol.
- Panel administrativo de catálogo, fotos, precios y 60 habitaciones físicas de demostración.
- Retiro temporal de habitaciones sin borrarlas y consulta de estados para recepción y mantenimiento.
- Gestión de amenidades con nombre y descripción, asignación a modelos y etiquetas y filtros actualizados desde la base.
- Disponibilidad real por fechas y creación de reservas de una a cuatro habitaciones físicas, sin solapar reservas.
- Reservas propias en la cuenta del cliente y pago del 100 % con crédito o débito **simulado**, con confirmación y reintento ante un rechazo.

El pago no cobra dinero ni acepta tarjetas reales. Temporadas, correo de confirmación, reservas de invitados, cancelaciones, reembolsos y operaciones de estancia corresponden a otras tareas del backlog.

## Estructura

```text
frontend/   Next.js. Inicio, catálogo y reservas que consumen la API.
backend/    API en Node.js y modelos de MongoDB.
docs/       Guía compartida de ejecución y conexión a Atlas.
```

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Next.js y TypeScript |
| Backend | Node.js, Express y TypeScript |
| Base de datos | MongoDB |
| Despliegue preparado | Dos servicios Node.js; guía y configuración de Railway. Publicación pendiente del equipo |

## Cómo ejecutarlo

La demostración local requiere **Node.js 22 o superior y Docker con Docker Compose**. No necesita credenciales de Atlas. En una carpeta nueva del proyecto, ejecutar desde la raíz:

```bash
node scripts/preparar-local.cjs
```

El comando instala las dependencias de ambas partes, selecciona la base local, inicia MongoDB y agrega los datos de demostración que falten. Conserva las cuentas y datos ya existentes. Al terminar, iniciar la API con `npm run dev` desde `backend/` y la web con `npm run dev` desde `frontend/`, en dos terminales. Abrir http://localhost:3000.

Si la terminal o los archivos privados apuntan a otros servidores, la preparación pide usar una carpeta nueva para conservar esas configuraciones. Para usar Atlas, seguir primero la comprobación de compatibilidad de la [guía de entrega](docs/entrega-sprint4.md) y después la [guía de despliegue](docs/despliegue.md).

<details>
<summary>Preparación local paso a paso, como alternativa al comando anterior</summary>

Los pasos siguientes permiten preparar cada parte manualmente.

En una terminal, levanta la base y la API:

```bash
cd backend
npm ci
npm run db:local
docker compose -f docker-compose.local.yml up -d
npm run setup:local
npm run dev
```

La API queda en http://localhost:4000. El entorno local usa el puerto MongoDB 27018 y la base `starhotel_sprint3`, separada de Atlas. Para preparar los datos de demostración sin sobrescribir los existentes:

```bash
npm run setup:local
```

En otra terminal, la web:

```bash
cd frontend
npm ci
npm run dev
```

Abre http://localhost:3000 para ver el inicio y http://localhost:3000/habitaciones para el catálogo completo. El buscador lleva fechas y huéspedes a los filtros del catálogo; las fechas se conservan al continuar al detalle y la reserva. Un detalle de ejemplo es http://localhost:3000/habitacion/sencilla.

</details>

Abre http://localhost:3000/reservar para consultar disponibilidad. Las cuentas locales son `admin@starhotel.test`, `recepcion@starhotel.test`, `mantenimiento@starhotel.test` y `cliente@starhotel.test`, con contraseña de demostración `DemoStar2026!`. Estas contraseñas **solo corresponden al entorno local**. En Atlas se utilizan los accesos privados del equipo.

Para probar el pago, usar `4242424242424242` (aprobado) o `4000000000000002` (rechazado), un vencimiento futuro y un CVV ficticio. La reserva queda pendiente durante un máximo de 15 minutos y se confirma cuando se aprueba el pago simulado.

`backend/.env.local` selecciona MongoDB local y tiene prioridad sobre `.env`:

```text
MONGODB_URI=mongodb://127.0.0.1:27018/starhotel_sprint3
REQUIRE_LOCAL_DB=true
```

El `.env` existente se conserva; no se modifica Atlas para probar este sprint. Ambos archivos privados están excluidos de Git. Las variables ya exportadas en la terminal tienen prioridad sobre los archivos.

## API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/health` | Comprueba que la API responde |
| GET | `/api/habitaciones` | Lista el catálogo |
| GET | `/api/habitaciones/:codigo` | Devuelve una habitación |
| GET | `/api/amenidades` | Lista las amenidades |
| POST / PATCH / DELETE | `/api/amenidades` y `/api/amenidades/:codigo` | Gestiona amenidades, solo administrador |
| GET | `/api/disponibilidad?ingreso=AAAA-MM-DD&salida=AAAA-MM-DD` | Consulta habitaciones físicas libres |
| GET / POST | `/api/reservas` | Consulta reservas propias o crea una, solo cliente |
| GET | `/api/reservas/:id` | Consulta una reserva propia |
| POST | `/api/reservas/:id/pago` | Pago simulado de una reserva propia |

El listado acepta `tipo`, `huespedes`, `precioMin`, `precioMax` y `amenidades`.

Ejemplo: http://localhost:4000/api/habitaciones?tipo=Suite

## Datos del catálogo

| Código | Habitación | Tipo | Capacidad | Precio |
|---|---|---|---|---:|
| sencilla | Habitación Sencilla | Sencilla | 1 adulto, 1 niño | Q85 |
| sencilla-deluxe | Habitación Sencilla Deluxe | Sencilla | 1 adulto, 1 niño | Q110 |
| doble | Habitación Doble | Doble | 2 adultos, 2 niños | Q130 |
| ejecutiva | Habitación Ejecutiva | Sencilla | 1 adulto | Q150 |
| doble-vista-al-mar | Habitación Doble Vista al Mar | Doble | 2 adultos, 2 niños | Q195 |
| suite-familiar | Suite Familiar | Suite | 4 adultos, 3 niños | Q260 |

Cada habitación guarda nombre, tipo, capacidad, precio por noche en quetzales, amenidades, fotos y descripción.

## Comprobar el Sprint 4

Para comprobar **sin modificar datos** si la base seleccionada es compatible con esta versión:

```bash
cd backend
npm run db:check
```

El resultado revisa catálogo, inventario físico, formatos de usuarios y reservas. No muestra la conexión ni las contraseñas. Una base incompatible requiere revisar la integración antes de usarla; cambiar solamente el `.env` no adapta ni copia sus datos.

Con MongoDB local en marcha, ejecutar en `backend`:

```bash
npm run typecheck
npm test
npm run build
```

Las pruebas utilizan únicamente las bases locales desechables `starhotel_test`, `starhotel_test_amenidades`, `starhotel_test_reservas` y `starhotel_test_entrega` en el puerto 27018. No prueban sobre Atlas ni borran los datos de la demo.

En `frontend`:

```bash
npm run lint
npm run build
```

Después de compilar ambos proyectos se puede iniciar cada uno con `npm start` en su carpeta. Para desarrollo se mantiene `npm run dev`. La web mantiene el proxy de la API; si se cambia `API_URL`, debe definirse también antes de compilar. El estado de la API se consulta en `http://localhost:4000/api/health` y el del frontend en `http://localhost:3000/api/health`.
