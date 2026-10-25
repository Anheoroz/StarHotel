# Despliegue del Sprint 4 — guía para el equipo

El código se prepara para publicar la API y la web como **dos servicios Node.js del mismo repositorio**. Se utilizará **`starthotel_db` del clúster original de Atlas**, preparada durante el Sprint 3; no se utilizará el clúster alternativo de demostración. La estructura de esa base se comprobó mediante `db:check`, con resultado compatible y sin modificar sus datos. La publicación sigue pendiente de la cuenta del compañero y de iniciar y probar esta versión con Atlas. Esta guía y los archivos `railway.toml` no crean servicios ni generan cobros.

La [guía de entrega](entrega-sprint4.md) reúne lo que está terminado, la instalación local y las diferencias que debe conservar quien integre la versión del compañero.

## 1. Confirmar antes de publicar

- Usar la rama `sprint4`, ya publicada en GitHub, y revisar esta entrega.
- Usar el perfil privado de `starthotel_db` del clúster original del equipo. La base anterior `starhotel` se conserva para la versión anterior; no cambiar a ella al seleccionar el clúster original. Crear otro clúster o cambiar un `.env` **no traslada los datos**.
- Respaldar la base que se vaya a usar antes de integrar el sprint. No ejecutar `seed` ni `setup:local` en Atlas; están protegidos para uso local.
- Conservar las contraseñas existentes al copiar usuarios. Las cuentas de la web son distintas del usuario que conecta con MongoDB.
- Ejecutar `npm run db:check` desde backend con el perfil aprobado y `EXPECTED_DB_NAME` correcto. Esta comprobación solo lee la base. Si detecta usuarios de otra versión, inventario incompleto o reservas incompatibles, seguir el apartado de integración de la guía de entrega antes de publicar.

## 2. API en Railway

Crear un servicio desde el repositorio, con raíz `/backend` y la rama acordada. En la configuración del servicio, indicar también **Config File Path: `/backend/railway.toml`**; esa ruta se cuenta desde el repositorio, independientemente de la raíz elegida. Se incluye la compilación a JavaScript:

| Opción | Valor |
|---|---|
| Versión de Node.js | 22 o superior compatible con las dependencias |
| Instalación | `npm ci` con dependencias de desarrollo durante la compilación |
| Compilación | `npm run build` |
| Inicio | `npm start` |
| Comprobación de arranque | `/api/health` |

Definir **en el panel privado del servicio** las variables indicadas en `backend/.env.production.example`:

```text
NODE_ENV=production
MONGODB_URI=CONEXION_PRIVADA_A_LA_BASE_DEL_EQUIPO
EXPECTED_DB_NAME=NOMBRE_REAL_DE_ESA_BASE
REQUIRE_LOCAL_DB=false
CORS_ORIGIN=https://DOMINIO_FINAL_DE_LA_WEB
TRUST_PROXY=1
```

`CORS_ORIGIN` debe ser el origen exacto, sin ruta ni barra final. Railway entrega `PORT`; la API lo lee y escucha en `0.0.0.0`. `TRUST_PROXY=1` presupone un proxy inverso de confianza delante del servicio. No definirlo si se publica la API directamente sin ese proxy.

Autorizar la conexión de red del servicio en Atlas según la configuración del equipo. Mantener las credenciales fuera del repositorio, capturas y Jira. Publicar el dominio HTTPS de la API y comprobar `/api/health`: debe indicar la base esperada. El arranque prepara los índices de reservas, necesarios para impedir que dos reservas ocupen la misma habitación y noche; no reemplaza habitaciones ni usuarios.

## 3. Frontend en Railway

Crear el segundo servicio desde el mismo repositorio con raíz `/frontend` y **Config File Path: `/frontend/railway.toml`**.

| Opción | Valor |
|---|---|
| Instalación | `npm ci` |
| Compilación | `npm run build` |
| Inicio | `npm start` |
| Comprobación de arranque | `/api/health` |

Definir `API_URL=https://DOMINIO_DE_LA_API` **antes de compilar y también durante la ejecución**. No agregar `/api` al final. Si cambia esta URL, volver a compilar: las reglas de proxy se generan durante esa etapa. El frontend escucha en `PORT` mediante Next.js.

El navegador llama a `/api/backend/...` en el dominio de la web y Next.js reenvía la solicitud a la API. Así la sesión usa la cookie del dominio de la web; no hay que exponer la conexión MongoDB al navegador. `MONGODB_URI` nunca se coloca en el frontend ni en una variable `NEXT_PUBLIC_`.

Una vez conocido el dominio de la web, actualizar `CORS_ORIGIN` en la API y reiniciarla. En producción ambos dominios deben usar HTTPS porque la cookie de sesión es segura.

## Alternativa con Cloudflare

La web usa renderizado en servidor, sesiones y un proxy; requiere una ejecución de Next.js compatible. No basta publicar los archivos como una página estática. Si el compañero elige Cloudflare, deberá preparar y probar la integración de Workers compatible con la versión de Next.js del proyecto. No se ha cambiado el proyecto a otro adaptador ni se ha validado un despliegue en Cloudflare.

La documentación oficial de [Cloudflare para Next.js](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) describe las opciones vigentes. La guía de [Next.js para servidores Node.js](https://nextjs.org/docs/app/getting-started/deploying) permite mantener el funcionamiento actual. Consultar también [Railway: monorepos](https://docs.railway.com/deployments/monorepo) y [comprobaciones de arranque](https://docs.railway.com/deployments/healthchecks).

## 4. Comprobaciones para cerrar SCRUM-32

1. Guardar las URL reales de la web y de la API en Jira y en el acta.
2. Abrir el catálogo, filtros y detalle desde otra computadora.
3. Probar los cuatro roles con los accesos compartidos por privado; comprobar que cerrar sesión y recargar conserva el comportamiento correcto.
4. Como administrador, crear, editar y eliminar una amenidad de prueba; comprobar su asignación y sus etiquetas públicas.
5. Como cliente, consultar fechas, crear una reserva y efectuar un **pago simulado**. Comprobar que esa habitación ya no se ofrece en las mismas fechas.
6. Conservar capturas sin credenciales. Separar estas evidencias remotas de las pruebas realizadas en local.

El pago de este sprint es una demostración: solo admite los números de prueba `4242424242424242` (éxito) y `4000000000000002` (rechazo), un vencimiento futuro y un código de seguridad ficticio. No se cobra dinero ni se deben ingresar tarjetas reales. Se registra el resultado y solo los últimos cuatro dígitos.

## Endpoints principales

| Método | Ruta de la API | Uso |
|---|---|---|
| GET | `/api/health` | Estado del servicio y base conectada |
| POST | `/api/auth/registro`, `/api/auth/login`, `/api/auth/logout` | Cuenta y sesión |
| GET | `/api/auth/me` | Cuenta actual |
| GET | `/api/habitaciones`, `/api/habitaciones/:codigo` | Catálogo público |
| GET | `/api/amenidades` | Amenidades activas |
| POST | `/api/amenidades` | Crear amenidad, solo administrador |
| PATCH / DELETE | `/api/amenidades/:codigo` | Editar o retirar amenidad, solo administrador |
| GET | `/api/disponibilidad?ingreso=AAAA-MM-DD&salida=AAAA-MM-DD` | Habitaciones físicas libres para esas noches |
| GET / POST | `/api/reservas` | Listar reservas propias o crear una, solo cliente |
| GET | `/api/reservas/:id` | Consultar una reserva propia |
| POST | `/api/reservas/:id/pago` | Pagar una reserva propia mediante simulación |
| GET | `/api/admin/catalogo`, `/api/admin/inventario`, `/api/admin/usuarios` | Administración, permisos del sprint 3 |
| GET | `/api/operacion` | Consulta de habitaciones por personal autorizado |

## Datos y retorno a la versión anterior

Trabajar localmente no sincroniza datos con Atlas. Cambiar la rama tampoco mueve la base. El Sprint 4 añade reservas y campos opcionales de amenidades; conserva catálogo, inventario y usuarios. El pago se guarda dentro de la reserva, asociado al importe calculado por la API.

Las reservas sin pagar apartan las habitaciones durante 15 minutos. Al vencer se liberan las noches en la siguiente consulta o acción; el registro histórico permanece. Una reserva solo queda confirmada después del pago aprobado. Las fechas de ingreso admiten hasta tres meses de anticipación; la salida debe ser posterior. Como límite técnico de esta versión, se admiten estancias de hasta 365 noches.

Si hay que volver a `sprint3`, hacerlo con una copia de la base anterior o con una integración acordada: esa versión no consulta las reservas nuevas ni conoce las amenidades añadidas. Conservar el respaldo previo evita perder datos o presentar una disponibilidad incorrecta.
