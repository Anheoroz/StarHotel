# Entrega del Sprint 4 — Grupo No. 1

Esta rama entrega amenidades, disponibilidad, reservas y pago simulado funcionando en local. Incorpora además una página de inicio adaptada al diseño actual. Incluye preparación para publicar y una guía para continuar sin depender de la computadora del autor. **Se utilizará `starthotel_db` del clúster original de Atlas; su estructura se comprobó mediante una consulta de solo lectura, con resultado compatible. Falta iniciar y probar esta versión con Atlas, adjuntar las evidencias de su panel y publicar el proyecto.** La integración completa con la otra versión del equipo se explica por separado.

La rama es **`sprint4`**, publicada en GitHub y basada en nuestro Sprint 3 (`a18f6e0`); las funciones del Sprint 4 se guardaron inicialmente en `28cc939`. Los remotos `sprint3` y `sprint-3-marvin` contienen el avance `b4bde3b` del compañero. Se tomó su estructura de inicio y sus imágenes como referencia para una adaptación visual puntual, conservando el burdeos y la tipografía Geist de esta versión. No se fusionaron su backend, sus cuentas ni su configuración de datos. La rama publicada permite descargarla y revisarla, pero no publica la web ni cambia la base de datos.

## Qué se entrega y qué falta

| Jira | Entrega | Trabajo que continúa el equipo |
|---|---|---|
| SCRUM-17 · Atlas | `starthotel_db` del clúster original, preparada en el Sprint 3; comprobación de estructura con `db:check` compatible y de solo lectura. | Iniciar y probar esta versión con Atlas; adjuntar en Jira capturas de la base en el panel del clúster original, como pidió el ingeniero. |
| SCRUM-30 · Amenidades | Crear, editar y eliminar desde administración, con nombre y descripción. | Repetir la comprobación en la versión integrada y publicada. |
| SCRUM-31 · Asignación | Seleccionar amenidades de cada modelo y reflejarlas en detalle y filtros. | Repetir la comprobación después de integrar. |
| SCRUM-32 · Despliegue | Compilación e inicio de ambos servicios, archivos Railway, ejemplos de variables y [guía de despliegue](despliegue.md). | Publicar, guardar ambas URL y verificar desde otra computadora. |
| SCRUM-33 · Acta y evidencias | Informe escrito del **Grupo No. 1**, Word/PDF y 22 capturas por tarea, preparados como material aparte. | Adjuntar los archivos a Jira. La tarea menciona Sprint 2 en su descripción, aunque está asignada al Sprint 4; dejar esa aclaración. |
| SCRUM-35 · Disponibilidad | Consulta por fechas sobre habitaciones físicas libres y habilitadas. | Repetir la comprobación con los datos definitivos. |
| SCRUM-36 · Reservas | Cliente identificado, contacto, fechas y de una a cuatro habitaciones; identificador e historial propio. | Repetir la comprobación después de integrar y publicar. |
| SCRUM-38 · Pago | Simulación del importe completo, rechazo con reintento y confirmación persistida. | Repetir la simulación publicada; no se conecta a un banco. |

Las cinco tareas funcionales están implementadas y comprobadas en local. La documentación está preparada; los estados y adjuntos de Jira no se actualizan automáticamente. No hace falta organizar una reunión para utilizar el registro escrito.

Como complemento visual, `/` muestra el inicio con portada, buscador, información del hotel, experiencias, habitaciones destacadas, amenidades actuales y preguntas frecuentes. **Habitaciones** abre `/habitaciones`, donde se conserva el catálogo completo con sus filtros laterales y dos columnas en escritorio. El buscador lleva fechas y huéspedes a los filtros del catálogo; las fechas se conservan al continuar al detalle y la reserva. Este complemento no se presenta como una tarea adicional de Jira ni cambia el conteo de las 22 evidencias de las tareas.

Se comprobaron siete recorridos del inicio y la navegación: datos reales del catálogo, imágenes, preguntas desplegables, búsqueda con fechas y huéspedes, continuidad hasta reservar, avisos de fechas inválidas y accesos por rol. Se revisaron anchos de 390 y 320 px, sin desbordamiento horizontal ni errores de JavaScript. La revisión de código y la compilación del frontend pasaron; el inicio, el catálogo y la búsqueda móvil se comprobaron también con la aplicación compilada.

## Descargar y ejecutar esta versión

Requisitos: **Node.js 22**, npm y Docker con Docker Compose. Ejecutar los comandos desde la raíz del repositorio salvo donde se indique. Los datos de demostración se preparan en una base local separada de Atlas.

La rama `sprint4` ya está publicada. En una carpeta nueva:

```bash
git clone --branch sprint4 https://github.com/Anheoroz/StarHotel.git StarHotel-sprint4
cd StarHotel-sprint4
```

Si ya se trabaja en otra rama, conservar primero los cambios propios; usar una carpeta nueva evita mezclarlos para probar esta entrega. No es necesario copiar archivos privados de Atlas para la demostración local. Con Docker iniciado, ejecutar desde la raíz:

```bash
node scripts/preparar-local.cjs
```

El comando instala las dependencias de ambos proyectos con `npm ci --include=dev`, selecciona el perfil local, inicia MongoDB en el puerto 27018, agrega los datos que falten y ejecuta la comprobación de compatibilidad de la base. No consulta Atlas, no restablece contraseñas ni inicia las aplicaciones.

Si detecta variables exportadas de otro entorno, un perfil privado distinto o `frontend/.env.local` apuntando a otra API, se detiene y conserva los valores privados. Usar una terminal sin esas variables y una carpeta nueva permite probar la entrega sin alterar otra configuración.

Al terminar, iniciar cada aplicación en su propia terminal, desde la raíz:

```bash
# Terminal 1
cd backend
npm run dev
```

```bash
# Terminal 2
cd frontend
npm run dev
```

Abrir **http://localhost:3000** para ver el inicio; **Habitaciones** lleva a **http://localhost:3000/habitaciones**. Comprobar **http://localhost:4000/api/health**: debe mostrar `ok: true`, `entorno: "local"` y `baseDeDatos: "starhotel_sprint3"`. El nombre conserva el del Sprint 3 para continuar sus datos; también admite las funciones nuevas.

`db:local` selecciona el perfil privado local si existe o el ejemplo local incluido en el repositorio. No modifica el `.env` original ni copia datos desde Atlas. Las variables exportadas en una terminal tienen prioridad sobre los archivos: si el estado no indica la base local esperada, revisar esa configuración antes de preparar datos. `setup:local` solo admite la base local y agrega los datos que falten; conserva los registros existentes.

En una instalación nueva se preparan seis modelos, 60 habitaciones físicas y estas cuatro cuentas:

| Rol | Correo local |
|---|---|
| Administrador | `admin@starhotel.test` |
| Recepción | `recepcion@starhotel.test` |
| Mantenimiento | `mantenimiento@starhotel.test` |
| Cliente | `cliente@starhotel.test` |

Contraseña inicial **solo local**: `DemoStar2026!`. Preparar de nuevo los datos no restablece contraseñas de cuentas ya existentes. Estas cuentas no son el usuario de conexión a MongoDB ni garantizan el acceso a otro clúster de Atlas.

Para detener la aplicación, usar `Ctrl+C` en ambas terminales. Docker conserva los datos entre ejecuciones; `docker compose -f docker-compose.local.yml stop`, desde `backend`, detiene la base sin borrar su volumen.

<details>
<summary>Alternativa: preparar los componentes manualmente</summary>

Desde la raíz, preparar primero la API y la base:

```bash
cd backend
npm ci --include=dev
npm run db:local
docker compose -f docker-compose.local.yml up -d
npm run setup:local
npm run db:check
```

Desde la raíz, en otra terminal:

```bash
cd frontend
npm ci --include=dev
```

Para la demo local, el frontend debe utilizar `API_URL=http://localhost:4000`, o su valor predeterminado si no está definida. Revisar sus archivos `.env*` y las variables exportadas antes de iniciar. Después ejecutar `npm run dev` en ambas carpetas, en terminales distintas.

</details>

## Resolver los problemas más frecuentes

| Qué ocurre | Qué revisar y hacer |
|---|---|
| Docker no inicia o el puerto ya está ocupado. | Iniciar Docker y comprobar `docker compose version`. Los puertos de esta demo son 3000 (web), 4000 (API) y 27018 (MongoDB). Detener la instancia anterior de StarHotel con `Ctrl+C` o identificar el proceso que usa el puerto; después repetir la preparación. No borrar el volumen para resolverlo. |
| La preparación detecta otro entorno, o la web muestra error al consultar la API. | Abrir una terminal sin variables de otros entornos y probar un clon nuevo. Comprobar `http://localhost:4000/api/health`; si no responde, iniciar el backend y revisar su terminal. Si responde pero la web falla, revisar `frontend/.env*`, `API_URL` y que la API sea `http://localhost:4000`; si se cambia después de compilar, volver a compilar el frontend. Un HTTP 500 se revisa en la terminal del backend, sin compartir la conexión privada. |
| `db:check` informa datos incompatibles o no conecta. | Verificar el nombre esperado y la configuración seleccionada. Seguir el diagnóstico de colecciones, roles, contraseñas o referencias; encargar la integración al responsable de datos. Cambiar solo `.env` no corrige formatos incompatibles. No restablecer usuarios ni ejecutar semillas sobre Atlas para resolverlo. |

## Comprobar y presentar

Con MongoDB local en marcha, desde `backend`:

```bash
npm run typecheck
npm run db:check
npm test
npm run build
```

Desde `frontend`:

```bash
npm run lint
npm run build
```

Las pruebas preparan y eliminan datos únicamente en las bases locales desechables `starhotel_test`, `starhotel_test_amenidades`, `starhotel_test_reservas` y `starhotel_test_entrega`, en el puerto 27018. No borran la base de demostración ni operan sobre Atlas. Para comprobar el modo compilado, detener los procesos de desarrollo y ejecutar `npm start` en cada carpeta después de compilar; no mantener dos procesos en el mismo puerto.

**Validación de esta entrega:** pasaron **26 pruebas** del backend (7 del Sprint 3, 7 de amenidades, 9 de reservas y 3 de entrega), la comprobación de tipos, ambas compilaciones y la revisión de código del frontend. Las pruebas de entrega verifican el modo de solo lectura y la protección del nombre esperado de la base.

También se ejecutó `node scripts/preparar-local.cjs` con éxito en una copia de los archivos públicos, sin `.git`, dependencias ni configuraciones privadas copiadas. Se instalaron ambos proyectos, se encontraron las cuatro cuentas de demostración y `db:check` devolvió compatibilidad. **Se reutilizaron MongoDB local y sus datos existentes**; esta comprobación no representa una base vacía ni una conexión a Atlas.

En navegador se comprobó además volver a crear un servicio eliminado y el vencimiento automático de una reserva: la vista deja de ofrecer el formulario de pago y permite consultar nuevas fechas. Para probar ese vencimiento sin esperar quince minutos se acortó únicamente el plazo de una reserva temporal de QA local; después se retiró ese registro. La aplicación conserva el plazo normal de quince minutos. Los materiales personales reúnen **22 capturas**, compartidas por separado.

| Paso de la demo | Resultado esperado |
|---|---|
| Abrir `/api/health` en el backend y `/` en la web. | API conectada a la base local; inicio con portada, buscador e información del hotel. |
| En el inicio, buscar fechas y huéspedes o pulsar **Habitaciones**. | Se abre `/habitaciones` con el catálogo completo, filtros y dos columnas en escritorio. El buscador lleva fechas y huéspedes a los filtros; las fechas se conservan al continuar al detalle y la reserva. |
| Ingresar como administrador en `/acceso` → **Amenidades**. | Crear un servicio con nombre y descripción, editarlo y verlo en la lista. |
| **Catálogo y fotografías** → **Editar información** → asignar ese servicio y guardar. | Al volver a editar sigue seleccionado; aparece en el detalle y en los filtros públicos. |
| Eliminar el servicio de prueba. | Desaparece de filtros y asignaciones sin borrar las habitaciones. |
| Volver a crear ese servicio con el mismo nombre. | Se crea como un servicio nuevo, sin recuperar las asignaciones eliminadas. |
| Cerrar sesión e ingresar como cliente → `/reservar`. Elegir ingreso futuro y salida posterior. | Se muestran los cuartos disponibles para esas noches; se conservan las fechas al navegar. |
| Seleccionar hasta cuatro cuartos e intentar un quinto. | Se respeta el máximo de cuatro; para reservar basta con uno. |
| Completar nombre, correo y teléfono; guardar la reserva. | Aparecen código, fechas, cuartos, noches y total; estado pendiente de pago. |
| Probar primero rechazo y luego aprobación. | Se informa el rechazo y permite reintentar; al aprobar se confirma y queda pagada. |
| Abrir `/cuenta` → **Mis reservas** y volver a consultar las mismas fechas. | La reserva sigue guardada; los cuartos reservados dejan de ofrecerse para esas noches. |
| Ingresar como recepción o mantenimiento. | Se mantiene la consulta de habitaciones del Sprint 3; no permite administrar amenidades ni pagar reservas ajenas. |

Pago **simulado**: `4000000000000002` representa rechazo y `4242424242424242` aprobación. Completar titular ficticio, vencimiento futuro en formato `MM/AA` y CVV ficticio. Se puede elegir crédito o débito. No ingresar tarjetas reales: esta versión no realiza cobros.

Los apartados vencen a los **15 minutos** sin pago; la vista comprueba el estado automáticamente y al volver a la pestaña. Al vencer oculta el formulario de pago, informa del plazo terminado y ofrece consultar otra estancia. Las noches se liberan al actualizar el estado y se conserva el registro vencido. Si no hay conexión, se informa de que no pudo actualizarse el estado. Repetir un pago ya aprobado no duplica la operación. Para repetir la demo se pueden elegir otras fechas o cuartos; la cantidad disponible puede ser menor de 60 si ya existen reservas o habitaciones retiradas.

## Datos y contratos para quien integre

**Modelo de catálogo y cuarto físico son distintos.** `habitaciones` contiene los modelos públicos (por ejemplo, Sencilla); `unidades` identifica los cuartos por número (por ejemplo, 101). La disponibilidad y las reservas requieren ambos. Tener seis tarjetas del catálogo no equivale a tener seis cuartos físicos.

| Colección | Campos y relaciones que utiliza esta rama |
|---|---|
| `habitaciones` | `codigo`, `nombre`, `tipo`, `capacidad.adultos/ninos`, `precioPorNoche`, `moneda`, `amenidades` (códigos), `fotos`, `descripcion`, `orden`, `activa`. |
| `amenidades` | `codigo` único, `nombre`, `descripcion`, `activa`. Los registros antiguos sin descripción se leen como texto vacío. Eliminar desactiva el registro y retira sus asignaciones. |
| `unidades` | `numero` único, `catalogo` (código de `habitaciones`), `activa`, `estado`: `disponible`, `ocupada`, `pendiente-limpieza` o `mantenimiento`. |
| `usuarios` | `nombre`, `correo` único, `contrasenaHash` en formato scrypt y `rol`: `cliente`, `administrador`, `recepcion` o `mantenimiento`. |
| `sesiones` | `tokenHash`, `usuario` (ObjectId) y `expira`; se usa una cookie `starhotel_session`, HttpOnly, de ocho horas. |
| `reservas` | `codigo` único, `usuario` (ObjectId), `ingreso`, `salida`, `noches`, contacto, `habitaciones` con ObjectId de unidad y copia de número/nombre/tarifa; `totalCentavos`, `moneda`, `estado`, `expira`, `nochesOcupadas` y resultado de `pago` simulado. |

El servidor calcula los importes en centavos y devuelve los importes públicos en quetzales. No confiar en precios o totales enviados por el navegador. Al arrancar se crean los índices de reservas, incluido el índice único por cuarto y noche que impide reservas simultáneas sobre las mismas noches. Un conflicto de reserva devuelve HTTP 409 y exige consultar de nuevo la disponibilidad.

Antes de integrar una base existente, ejecutar **`npm run db:check` desde `backend`**, con el perfil que corresponda. El verificador utiliza la misma prioridad de configuración que la API y exige `EXPECTED_DB_NAME`. Revisa en modo de **solo lectura** colecciones, formatos de usuarios y roles, inventario, referencias e índices; no migra, no cambia contraseñas y no muestra la URI ni los hashes. Salida `0`: compatible; `2`: incompatibilidades de datos o índices; `1`: error de configuración o conexión. El diagnóstico identifica qué debe atenderse antes de usarla.

El responsable de Atlas puede ejecutarlo después sobre el destino autorizado y respaldado; esta entrega no lo ha comprobado. Guardar la conexión en su configuración privada o en las variables del servicio, **sin pasar URI ni contraseñas como argumentos en la terminal**. Obtener un resultado compatible no publica la aplicación: todavía corresponde realizar la demo completa sobre el destino final.

| Método y ruta de la API | Acceso y contrato |
|---|---|
| `GET /api/health` | Público; servicio, entorno y base conectada. |
| `POST /api/auth/registro` | `nombre`, `correo`, `contrasena`; crea siempre un cliente y establece la cookie. |
| `POST /api/auth/login` | `correo`, `contrasena`; establece la cookie. |
| `GET /api/auth/me` · `POST /api/auth/logout` | Cuenta actual y revocación de sesión. |
| `GET /api/habitaciones` · `GET /api/habitaciones/:codigo` | Catálogo público; filtros y amenidades actuales. |
| `GET /api/amenidades` | Público; códigos, nombres y descripciones de servicios activos. |
| `POST /api/amenidades` | Administrador; `codigo`, `nombre`, `descripcion`. El código queda fijo. |
| `PATCH /api/amenidades/:codigo` · `DELETE /api/amenidades/:codigo` | Administrador; editar nombre y descripción o retirar servicio. |
| `GET /api/disponibilidad?ingreso=AAAA-MM-DD&salida=AAAA-MM-DD` | Público; devuelve fechas, noches y cuartos físicos libres con su `id`. |
| `POST /api/reservas` | Cliente; `ingreso`, `salida`, `habitaciones` (1–4 ObjectId de unidad), `nombre`, `correo`, `telefono`. Devuelve la reserva pendiente y su identificador. |
| `GET /api/reservas` · `GET /api/reservas/:id` | Cliente; únicamente reservas de la cuenta actual. `:id` es el ObjectId, distinto del código visible `SH-...`. |
| `POST /api/reservas/:id/pago` | Cliente propietario; `titular`, `tipoTarjeta` (`credito` o `debito`), `numero`, `vencimiento`, `cvv`. Solo números de prueba. Rechazo: HTTP 402; aprobado: reserva pagada. |
| `GET/POST /api/admin/catalogo` · `PATCH /api/admin/catalogo/:codigo` | Administración de modelos y asignación mediante `amenidades: [codigos]`. |
| `GET/POST /api/admin/inventario` · `PATCH /api/admin/inventario/:id` | Administración de cuartos físicos. |
| `GET /api/admin/usuarios` · `PATCH /api/admin/usuarios/:id/rol` | Administrador; consulta y cambio de rol, con revocación de sesiones afectadas. |
| `GET /api/operacion` | Administrador, recepción y mantenimiento; consulta del inventario. |

En el navegador, el cliente de esta rama llama a **`/api/backend/...`** en el dominio de la web. Next.js reenvía a la API y conserva la sesión mediante cookie. El servidor web utiliza `API_URL`; no requiere `NEXT_PUBLIC_API_URL` ni un token Bearer del navegador. La [guía de despliegue](despliegue.md) incluye los orígenes, HTTPS y variables de ambos servicios.

## Compatibilidad con el avance del compañero

La comparación corresponde a **`origin/sprint3` y `origin/sprint-3-marvin` en `b4bde3b`**, no a una promesa sobre cambios remotos posteriores. Los dos avances comparten `a18f6e0`, pero luego modifican las mismas áreas. Ya se incorporó una adaptación visual del inicio y sus imágenes; la unión del resto del código sigue pendiente. Una selección automática de todos los archivos de un lado perdería funciones del otro.

| Área | Esta rama `sprint4` | Avance remoto `b4bde3b` | Tratamiento al integrar |
|---|---|---|---|
| Cuenta del visitante | Rol `cliente`. | Rol `huesped`. | Elegir un rol común y adaptar datos, validaciones y pantallas; cambiar solo la etiqueta visual no da acceso a reservas. |
| Contraseñas | scrypt; `contrasenaHash` con prefijo `scrypt:`. | bcrypt mediante `bcryptjs`, en el mismo campo. | Conservar los hashes originales. Preparar compatibilidad explícita para verificar ambos o una migración controlada; no reemplazarlos por contraseñas de demo. |
| Sesión | Cookie HttpOnly + colección `sesiones`; revocación en servidor. | JWT de 12 horas enviado como Bearer y guardado en `localStorage` (`starhotel-sesion`). | Unificar autenticación de frontend y API; los tokens de una versión no inician sesión en la otra. |
| Rutas de acceso | `/acceso`; API `/auth/login`, `/auth/me`, `/auth/logout`. | `/entrar`, `/registro`; API `/auth/sesion`, `/auth/yo`. | Adaptar enlaces, formularios y retorno a la reserva; no mezclar clientes de API de ambos sistemas. |
| Administración | `/admin`, `/operacion`, `/cuenta`; API `/admin/catalogo`, `/admin/inventario`, `/admin/usuarios`. | `/panel`; escritura en `/api/habitaciones` y creación de personal en `/api/usuarios`. | Preservar las capacidades útiles y aplicar una sola comprobación de permisos coherente. |
| Habitaciones | Modelos en `habitaciones`, cuartos en `unidades` y reservas por ObjectId de unidad. | Modelo `habitaciones`; no incluye el modelo `Unidad` de esta rama. | Mantener la separación de catálogo e inventario antes de habilitar disponibilidad y reservas. |
| Fotos | Enlaces o rutas de imágenes en el editor de catálogo. | Carga de archivos mediante `/api/habitaciones/:codigo/fotos`, servidos desde `/uploads`, además de URL. | Conservar la carga del compañero si se incorpora; adaptar permisos y prever almacenamiento persistente en el despliegue. |
| Portada y diseño | Inicio en `/`, adaptado a partir de la estructura e imágenes de Marvin con el burdeos y Geist actuales; catálogo completo en `/habitaciones`, con datos y amenidades de esta API. | Nueva portada, marca, imágenes, pie y componentes `home-story`, `site-footer`, `hotel-mark`, `reveal`. | La adaptación visual ya está incorporada. Conservarla al unir las demás funciones; no copiar de nuevo la portada completa ni reemplazar el catálogo y su flujo de reservas. |
| Conexión y comprobación | `.env.local` antes de `.env`, perfiles, guardas y `/health` con base real. | Otro arranque y configuración; `/health` informa servicio sin nombre de base. | Revisar arranque y variables juntos; comprobar el destino real antes de escribir datos. |

Archivos que conviene revisar juntos:

| Función | Archivos principales |
|---|---|
| Cuenta y permisos | `backend/src/auth.ts`, `models/usuario.ts`, `routes/auth.ts`; `frontend/src/lib/session.ts`, `components/auth-form.tsx`, `account-nav.tsx`. En remoto, revisar también `frontend/src/lib/sesion.ts` y `cuenta-form.tsx`. |
| Disponibilidad y reservas | `backend/src/models/unidad.ts`, `models/reserva.ts`, `reservas.ts`, `routes/reservas.ts`; `frontend/src/components/booking-flow.tsx`, `my-reservations.tsx`, `src/lib/reservas.ts`, `app/reservar/page.tsx`, `app/cuenta/page.tsx`. |
| Amenidades y catálogo | `backend/src/models/amenidad.ts`, `routes/amenidades.ts`, `routes/admin.ts`, `routes/habitaciones.ts`; `frontend/src/components/amenities-panel.tsx`, `admin-panel.tsx`, `catalog.tsx`, `room-filters.tsx`, `src/lib/amenities.ts`. |
| Inicio y navegación | `frontend/src/app/page.tsx`, `app/habitaciones/page.tsx`, `components/home-content.tsx`, `home-search.tsx`, `site-header.tsx`, `site-footer.tsx` e imágenes de `frontend/public/brand/`. |
| Arranque y publicación | `backend/src/app.ts`, `src/index.ts`, `src/env.ts`, `src/db.ts`, `tsconfig.build.json`, ambos `railway.toml`, `frontend/next.config.ts`, ejemplos de variables y [guía de despliegue](despliegue.md). |
| Comprobaciones | `backend/src/tests/sprint3.test.ts`, `sprint4-amenidades.test.ts`, `sprint4-reservas.test.ts`; pasos de demo de esta guía. |

Secuencia de integración: conservar ambas ramas; unir en una rama aparte; resolver primero usuarios, sesiones e inventario; incorporar amenidades y reservas junto con sus pantallas; conservar el inicio ya adaptado y revisar las otras capacidades del compañero; ejecutar las pruebas y la demo completa. No hace falta modificar `main` para probar esa integración.

## Atlas, publicación y material de presentación

Se utilizará **el clúster original del equipo**, con la base **`starthotel_db`** preparada en el Sprint 3 y documentada en la [guía de Atlas](atlas.md). El clúster alternativo creado para una demostración no se utilizará. `starhotel` es otra base del mismo clúster original, conservada para la versión anterior; elegir el clúster original no significa volver a esa base. El comando `db:atlas` selecciona el perfil privado de `starthotel_db`.

Se ejecutó `npm run db:check` sobre `starthotel_db` mediante el perfil privado del clúster original: el resultado fue compatible, sin modificar documentos ni índices. Esto comprueba la estructura actual, pero no sustituye el arranque de la API ni la prueba funcional del Sprint 4 en Atlas. La colección e índice de reservas aún no están preparados en ese destino; el arranque de la API prepara los índices necesarios. La base anterior `starhotel` conserva otro formato de usuarios y carece del inventario físico que necesita esta versión.

Antes de usar esta versión sobre Atlas, repetir `npm run db:check` si cambió la base y conservar un respaldo antes de realizar cambios. Para publicar se utilizan las variables de la [guía de despliegue](despliegue.md), con `EXPECTED_DB_NAME=starthotel_db` y la conexión privada correspondiente. **Cambiar la URI no convierte hashes, roles ni habitaciones, ni copia datos.** No ejecutar `seed` ni `setup:local` en Atlas; no trasladar sesiones ni usar las cuatro cuentas de demo como reemplazo de usuarios existentes.

Para SCRUM-17, el ingeniero pidió mostrar la base del proyecto en el panel de Atlas del clúster original: quien tenga acceso debe capturar `starthotel_db` y sus colecciones, sin credenciales, y adjuntar las imágenes a Jira. Las capturas de una base del clúster alternativo no corresponden a la base que utilizará esta entrega. La preparación del Sprint 3 y la comprobación de estructura no sustituyen la prueba funcional de esta versión.

Para dar por comprobada la parte de infraestructura, quien publique debe conservar:

1. Verificación del estado de la API conectada a `starthotel_db`, sin publicar la cadena de conexión.
2. URL HTTPS de la web y URL de la API.
3. Resultado de la demo completa desde otra computadora, con sesión, amenidades, reserva y pago simulado.
4. Capturas remotas y enlaces adjuntos a SCRUM-17 y SCRUM-32, distinguiéndolos de las pruebas locales.

El autor comparte **por separado** `Informe_Sprint_4_StarHotel.docx`, su PDF y la carpeta `docs/evidencias/sprint-4/`, con las 22 imágenes organizadas por Jira. El informe identifica al **Grupo No. 1** y contiene el registro escrito de SCRUM-33. Esos materiales personales, los respaldos, `.env`, `.local` y las credenciales permanecen excluidos de GitHub.

El informe incluye además un anexo del nuevo inicio con tres imágenes. La carpeta personal `INICIO-complemento/` conserva esas capturas, una vista completa y su verificación, separadas de las 22 evidencias por tarea.

No forman parte de esta entrega las temporadas y tarifas especiales, reservas de invitados, correo de confirmación, cancelaciones, reembolsos, check-in, check-out ni comentarios operativos. El resto del backlog puede continuar después sobre la versión integrada.

**Cierre de esta entrega:** código y documentación preparados para revisión y repetición local. El cierre del sprint completo depende de integrar las versiones, comprobar la infraestructura del equipo y adjuntar las evidencias a Jira; esas comprobaciones no se sustituyen por las capturas de `localhost`.
