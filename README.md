# Star Hotel

Star Hotel es el sistema de catálogo y reservas del hotel. Permite consultar habitaciones, compararlas por fecha, capacidad, precio y servicios, y revisar la ficha de cada una antes de confirmar una estadía.

## Producto

El catálogo público presenta seis tipos de habitación, con fotografía, capacidad, amenidades y tarifa por noche en quetzales. El visitante filtra la oferta y abre el detalle, donde encuentra la galería, la descripción, los servicios y la selección de fechas.

| Habitación | Tipo | Capacidad | Tarifa |
|---|---|---|---:|
| Habitación Sencilla | Sencilla | 1 adulto, 1 niño | Q85 |
| Habitación Sencilla Deluxe | Sencilla | 1 adulto, 1 niño | Q110 |
| Habitación Doble | Doble | 2 adultos, 2 niños | Q130 |
| Habitación Ejecutiva | Sencilla | 1 adulto | Q150 |
| Habitación Doble Vista al Mar | Doble | 2 adultos, 2 niños | Q195 |
| Suite Familiar | Suite | 4 adultos, 3 niños | Q260 |

## Arquitectura

```text
frontend/   Aplicación web del catálogo y del panel
backend/    API de cuentas, habitaciones y amenidades
docs/       Documentación del proyecto
```

La aplicación web consulta la API. La API persiste el catálogo y las cuentas en MongoDB Atlas, base `starhotel`. Las fotografías cargadas desde el panel se guardan en el servicio de la API, carpeta `uploads`.

| Capa | Tecnología |
|---|---|
| Aplicación web | Next.js, TypeScript |
| API | Node.js, Express, TypeScript |
| Datos | MongoDB Atlas |
| Contenedores | Docker |

## API

La API escucha en el puerto 4000.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servicio |
| GET | `/api/habitaciones` | Catálogo de habitaciones |
| GET | `/api/habitaciones/:codigo` | Ficha de una habitación |
| GET | `/api/amenidades` | Catálogo de amenidades |
| POST | `/api/auth/registro` | Registro de huésped |
| POST | `/api/auth/sesion` | Inicio de sesión |
| POST | `/api/habitaciones` | Alta de habitación (administrador) |
| PATCH | `/api/habitaciones/:codigo` | Edición, precio, descripción y estado |
| POST | `/api/habitaciones/:codigo/fotos` | Alta de fotografía |
| DELETE | `/api/habitaciones/:codigo/fotos` | Retiro de fotografía |

`GET /api/habitaciones` acepta `tipo`, `huespedes`, `precioMin`, `precioMax` y `amenidades`. El catálogo público omite las habitaciones deshabilitadas. No existe borrado de habitaciones.

## Operación local

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

- Catálogo: http://localhost:3000
- API: http://localhost:4000

La conexión a MongoDB Atlas se define en `backend/.env` mediante `MONGODB_URI`. El archivo no se versiona.
