// Ejecutar desde cualquier carpeta: node scripts/preparar-local.cjs
// Prepara la demo local. No consulta ni copia datos de Atlas.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const backend = path.join(root, "backend");
const frontend = path.join(root, "frontend");
const localUri = "mongodb://127.0.0.1:27018/starhotel_sprint3";
const webOrigin = "http://localhost:3000";
const apiUrl = "http://localhost:4000";
const windows = process.platform === "win32";
const npm = windows ? "npm.cmd" : "npm";

function run(command, args, cwd, taskEnv = process.env) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd,
    env: taskEnv,
    stdio: "inherit",
    shell: windows && command === npm,
  });
  if (result.error || result.status !== 0)
    throw new Error(
      `No se completó ${command} ${args.join(" ")}. Revisa el mensaje anterior y vuelve a ejecutar la preparación.`,
    );
}

function requireDocker() {
  const compose = spawnSync("docker", ["compose", "version"], {
    stdio: "ignore",
  });
  const daemon = spawnSync("docker", ["info"], { stdio: "ignore" });
  if (compose.error || compose.status !== 0 || daemon.status !== 0)
    throw new Error(
      "Inicia Docker con Docker Compose y vuelve a ejecutar este comando.",
    );
}

function checkExportedEnvironment() {
  if (
    (process.env.MONGODB_URI && process.env.MONGODB_URI !== localUri) ||
    (process.env.EXPECTED_DB_NAME &&
      process.env.EXPECTED_DB_NAME !== "starhotel_sprint3") ||
    (process.env.REQUIRE_LOCAL_DB && process.env.REQUIRE_LOCAL_DB !== "true") ||
    (process.env.API_URL && process.env.API_URL !== apiUrl) ||
    (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== webOrigin) ||
    process.env.PORT ||
    process.env.NODE_ENV === "production"
  )
    throw new Error(
      "La terminal tiene variables de otro entorno o un puerto exportado. Usa una terminal sin esas variables para preparar la demo local. No se cambió la configuración.",
    );
}

async function main() {
  if (Number(process.versions.node.split(".")[0]) < 22)
    throw new Error("Instala Node.js 22 o superior antes de preparar el proyecto.");
  checkExportedEnvironment();
  requireDocker();
  console.log(
    "Preparación local de Star Hotel: instala dependencias, selecciona la base local y agrega los datos de demostración que falten.",
  );
  run(npm, ["ci", "--include=dev", "--no-audit", "--no-fund"], backend);
  run(npm, ["ci", "--include=dev", "--no-audit", "--no-fund"], frontend);

  const dotenv = require(path.join(backend, "node_modules", "dotenv"));
  const parseFile = (file) =>
    fs.existsSync(file) ? dotenv.parse(fs.readFileSync(file)) : {};
  const profile = path.join(backend, ".local", "config", "local.env");
  const configuration = parseFile(
    fs.existsSync(profile)
      ? profile
      : path.join(backend, ".env.local.example"),
  );
  if (
    configuration.MONGODB_URI !== localUri ||
    configuration.EXPECTED_DB_NAME !== "starhotel_sprint3" ||
    configuration.REQUIRE_LOCAL_DB !== "true" ||
    (configuration.PORT && configuration.PORT !== "4000") ||
    (configuration.CORS_ORIGIN && configuration.CORS_ORIGIN !== webOrigin)
  )
    throw new Error(
      "El perfil local privado usa una configuración distinta de la demo. Conserva ese archivo y prueba esta entrega en una carpeta nueva, o sigue los pasos manuales de docs/entrega-sprint4.md.",
    );
  const frontendFile = path.join(frontend, ".env.local");
  const frontendConfig = parseFile(frontendFile);
  if (frontendConfig.API_URL && frontendConfig.API_URL !== apiUrl)
    throw new Error(
      "frontend/.env.local apunta a otro servidor. Se conservó el archivo. Prueba la demo en una carpeta nueva para mantener separados los entornos.",
    );

  run(npm, ["run", "db:local"], backend);
  if (!fs.existsSync(frontendFile))
    fs.writeFileSync(frontendFile, `API_URL=${apiUrl}\n`, {
      flag: "wx",
      mode: 0o600,
    });
  else if (!frontendConfig.API_URL)
    fs.appendFileSync(frontendFile, `\nAPI_URL=${apiUrl}\n`);

  run("docker", ["compose", "-f", "docker-compose.local.yml", "up", "-d"], backend);
  const { MongoClient } = require(path.join(backend, "node_modules", "mongoose")).mongo;
  const mongo = new MongoClient(localUri, { serverSelectionTimeoutMS: 15_000 });
  try {
    await mongo.connect();
  } catch {
    throw new Error(
      "MongoDB local no respondió en el puerto 27018. Comprueba Docker y que el puerto esté disponible; después repite el comando.",
    );
  } finally {
    await mongo.close();
  }
  const taskEnv = {
    ...process.env,
    MONGODB_URI: localUri,
    EXPECTED_DB_NAME: "starhotel_sprint3",
    REQUIRE_LOCAL_DB: "true",
  };
  run(npm, ["run", "setup:local"], backend, taskEnv);
  run(npm, ["run", "db:check"], backend, taskEnv);
  console.log(
    "\nDemo preparada. No se cambió Atlas ni se restablecieron contraseñas existentes.\n" +
      "Terminal 1: cd backend y npm run dev\n" +
      "Terminal 2: cd frontend y npm run dev\n" +
      "Abrir http://localhost:3000\n" +
      "Cuentas de la instalación nueva y recorrido de prueba: docs/entrega-sprint4.md\n" +
      "Repetir la preparación conserva los datos de demostración ya existentes.",
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
