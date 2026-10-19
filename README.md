# Star Hotel

Sistema de catálogo y reservas de habitaciones. Un visitante explora las habitaciones del hotel, las filtra y abre el detalle de cada una antes de reservar.

La primera etapa entrega el catálogo: listado, filtros y ficha de habitación, con los datos guardados en MongoDB. La referencia visual es el prototipo [star-hotel-catalog.lovable.app](https://star-hotel-catalog.lovable.app/).

El **Sprint 3** tiene una base independiente **`starthotel_db` en MongoDB Atlas** para la demo. Consulta [docs/atlas.md](docs/atlas.md) para ejecutar el proyecto, elegir Atlas o local y compartir la configuración y las cuatro cuentas por privado. La base anterior `starhotel` se conserva.

## Qué incluye ahora

- Encabezado con accesos a Inicio y Habitaciones.
- Seis tipos de habitación, de Q85 a Q260 por noche, con foto, capacidad y amenidades.
- Filtros por fecha, huéspedes, tipo, precio y amenidades.
- Detalle con galería, descripción, servicios y selección de fechas.
- API que sirve el catálogo desde MongoDB.
- Registro, inicio/cierre de sesión y acceso por rol.
- Panel administrativo de catálogo, fotos, precios y 60 habitaciones físicas de demostración.
- Retiro temporal de habitaciones sin borrarlas y consulta de estados para recepción y mantenimiento.

La reserva todavía no se guarda. Temporadas, pagos, disponibilidad real por fechas y operaciones de estancia vienen en las tareas siguientes del backlog.

## Estructura

```text
frontend/   Next.js. Catálogo que consume la API.
backend/    API en Node.js y modelos de MongoDB.
docs/       Guía compartida de ejecución y conexión a Atlas.
```

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Next.js y TypeScript |
| Backend | Node.js, Express y TypeScript |
| Base de datos | MongoDB |
| Despliegue previsto | Cloudflare. Docker queda como alternativa |

## Cómo ejecutarlo

Para la demo con Atlas, sigue [docs/atlas.md](docs/atlas.md): solo hace falta Node.js y los dos archivos privados del equipo.

Los pasos siguientes son para la modalidad local, que requiere Node.js y Docker.

En una terminal, levanta la base y la API:

```bash
cd backend
cp .env.local.example .env.local
docker compose -f docker-compose.local.yml up -d
npm install
npm run setup:local
npm run dev
```

La API queda en http://localhost:4000. El entorno local usa el puerto MongoDB 27018 y la base `starhotel_sprint3`, separada de Atlas. Para preparar los datos de demostración sin sobrescribir los existentes:

```bash
npm run setup:local
```

En otra terminal, el catálogo:

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:3000. Un detalle de ejemplo es http://localhost:3000/habitacion/sencilla.

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
