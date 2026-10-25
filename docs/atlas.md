# Atlas — base independiente del Sprint 3

Esta guía describe la preparación anterior de Atlas. Para la entrega actual se utiliza la rama **`sprint4`**; empezar por [la guía de entrega](entrega-sprint4.md). Si el equipo creó otro clúster o cambió la versión de usuarios, confirmar su compatibilidad mediante `npm run db:check` antes de iniciar la API. No se ha verificado aquí ese nuevo destino.

La base de pruebas del sprint se llama **`starthotel_db`**, dentro del clúster existente del equipo. Es independiente de la base anterior `starhotel`: esta última se conserva y no se reemplaza.

El frontend y el backend siguen ejecutándose en la computadora. Únicamente los datos se alojan en Atlas. Esto no es el despliegue web de SCRUM-32.

## Qué se preparó

- Copia del catálogo, amenidades, habitaciones físicas y usuarios del entorno local que ya se probó.
- Sesiones nuevas: no se trasladan sesiones de la computadora a Atlas.
- Índices únicos de códigos, números de cuarto y correos; índices de sesiones y vencimiento.
- Contraseñas nuevas y distintas para las cuatro cuentas de demostración en Atlas. La cuenta adicional creada en local conserva su contraseña elegida.
- Comprobación de la copia y de que la base original `starhotel` conserva sus documentos e índices.

Antes de preparar el destino se renovó el respaldo de `starhotel` y se comprobó su restauración en una base local aparte. Los respaldos, los informes detallados y los accesos están en `backend/.local/`, excluido de Git.

La base nueva parte del catálogo local de seis modelos y 60 habitaciones físicas, no de la habitación adicional de QA ni de los usuarios antiguos observados en `starhotel`. Esos usuarios antiguos usan otro formato de contraseña y permanecen sin cambios en la base anterior. No se reemplazaron sus contraseñas.

## Elegir dónde trabajar

Desde `backend/`:

```bash
npm run db:atlas
```

Selecciona el perfil privado de Atlas para `starthotel_db`. Para volver a los datos locales:

```bash
npm run db:local
```

Estos comandos cambian únicamente la configuración privada de esta computadora. No copian, borran ni sincronizan datos. Si `npm run dev` está activo, se solicita su reinicio automático; si se utiliza `npm start`, reiniciarlo manualmente. Las variables exportadas en la terminal conservan prioridad sobre los archivos.

Comprobar después en http://localhost:4000/api/health:

- Atlas: `entorno` debe ser `atlas` y `baseDeDatos` debe ser `starthotel_db`.
- Local: `entorno` debe ser `local` y `baseDeDatos` debe ser `starhotel_sprint3`.

`EXPECTED_DB_NAME` impide arrancar con una base distinta a la del perfil seleccionado. `setup:local` y `seed` conservan la protección que les impide operar sobre Atlas.

## Accesos de esta PC

Las cuentas y contraseñas nuevas de la web en Atlas están en:

```text
backend/.local/config/ACCESOS-ATLAS.txt
```

Ese archivo es privado. No adjuntarlo al informe ni a Jira ni subirlo a GitHub. Las cuentas locales conservan sus contraseñas de demostración anteriores; cambiar de perfil no cambia esas contraseñas.

Las cuentas de la web y el usuario de conexión a MongoDB son accesos distintos. Las credenciales de conexión de Atlas permanecen en los archivos privados, nunca en el código del frontend.

## Para que otro compañero haga la demo con Atlas

1. Descargar la rama **`sprint4`** de esta entrega e instalar las dependencias con `npm ci` dentro de `backend` y de `frontend`. La preparación local automatizada se explica en la guía de entrega; no es necesaria para seleccionar un perfil Atlas ya preparado.
2. Recibir por el canal privado del equipo **dos archivos**: `atlas.env`, con la conexión autorizada a **`starthotel_db`**, y `ACCESOS-ATLAS.txt`, con las cuatro cuentas web de administrador, recepción, mantenimiento y cliente. El acceso de red de Atlas también debe permitir la conexión de su computadora; si no la permite, el administrador del clúster debe revisar ese acceso.
3. Desde `backend/`, crear la carpeta privada:

```bash
mkdir -p .local/config
```

Colocar los dos archivos recibidos dentro de esa carpeta, conservando sus nombres. No es necesario editar `atlas.env` si ya tiene la conexión correcta. En Linux, proteger ambos archivos:

```bash
chmod 600 .local/config/atlas.env .local/config/ACCESOS-ATLAS.txt
```

Si se configura la conexión manualmente, `.env.atlas.example` muestra este formato; el marcador debe sustituirse por la cadena real, conservando sus opciones:

```text
PORT=4000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=CADENA_PRIVADA_CON_BASE_starthotel_db
REQUIRE_LOCAL_DB=false
EXPECTED_DB_NAME=starthotel_db
```

4. Ejecutar `npm run db:atlas` y `npm run db:check` desde backend. Continuar con `npm run dev` en backend y frontend solo si la comprobación indica una base compatible. El comprobador no modifica los datos ni sus índices; el arranque de la API prepara los índices de reservas.
5. Abrir http://localhost:3000 e ingresar con cualquiera de las cuatro cuentas indicadas en el archivo privado `ACCESOS-ATLAS.txt`.

No hace falta Docker para esta modalidad. Docker se utiliza para los datos locales y las pruebas automáticas locales. No ejecutar `setup:local` sobre el perfil de Atlas ni intentar recrear la base compartida desde otra computadora.

## Cómo volver atrás

- Para continuar probando solo en la computadora: `npm run db:local`.
- La base anterior `starhotel` permanece disponible para la versión anterior del código. No conectar automáticamente la versión nueva a ella: es una integración diferente que necesita revisar modelos, usuarios e inventario.
- Los cambios posteriores a esta preparación en local y en Atlas son independientes; no se sincronizan automáticamente.
- Esta preparación no incluye una orden automática de borrado de bases ni de restauración sobre la original.

Las capturas previas del sprint corresponden al entorno local. Se añadieron dos capturas y un informe de verificación en la carpeta privada de evidencias de SCRUM-17, identificados como Atlas y sin credenciales. Se comprobaron en la nueva base los cuatro roles, registro, permisos, edición de fotos/descripción/precio, retiro y reingreso de habitaciones y revocación de sesiones al cambiar de rol. Los datos editados se restauraron y la cuenta temporal de QA se eliminó. Las siete pruebas automáticas del backend siguen ejecutándose en una base local desechable, incluso con el perfil Atlas seleccionado.
