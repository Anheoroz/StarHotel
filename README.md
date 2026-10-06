# Star Hotel

Sistema de catálogo y reservas de habitaciones. Un visitante explora las habitaciones del hotel, las filtra y abre el detalle de cada una antes de reservar.

La primera etapa entrega el catálogo: listado, filtros y ficha de habitación, con los datos guardados en MongoDB. La referencia visual es el prototipo [star-hotel-catalog.lovable.app](https://star-hotel-catalog.lovable.app/).

## Qué incluye ahora

- Encabezado con accesos a Inicio y Habitaciones.
- Seis tipos de habitación, de Q85 a Q260 por noche, con foto, capacidad y amenidades.
- Filtros por fecha, huéspedes, tipo, precio y amenidades.
- Detalle con galería, descripción, servicios y selección de fechas.
- API que sirve el catálogo desde MongoDB.

La reserva todavía no se guarda. Cuentas, panel administrativo, pagos y disponibilidad real por fechas vienen en etapas siguientes.

## Estructura

```text
frontend/   Next.js. Catálogo que consume la API.
backend/    API en Node.js y modelos de MongoDB.
docs/       Reporte de la primera entrega.
```

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Next.js y TypeScript |
| Backend | Node.js, Express y TypeScript |
| Base de datos | MongoDB |
| Despliegue previsto | Cloudflare. Docker queda como alternativa |

## Cómo ejecutarlo

Hacen falta Node.js y Docker.

En una terminal, levanta la base y la API:

```bash
cd backend
docker compose up -d
npm install
npm run dev
```

La API queda en http://localhost:4000. Si la base está vacía, carga sola las 6 habitaciones y las 10 amenidades. Para volver a cargarlas:

```bash
npm run seed
```

En otra terminal, el catálogo:

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:3000. Un detalle de ejemplo es http://localhost:3000/habitacion/sencilla.

`backend/.env` usa MongoDB local:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/starhotel
```

Para MongoDB Atlas, sustituye esa variable por la cadena del cluster. El formato está en `backend/.env.example`.

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
