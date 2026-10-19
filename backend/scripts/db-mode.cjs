const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

const root = path.resolve(__dirname, "..");
const mode = process.argv[2];
if (!["local", "atlas"].includes(mode)) {
  console.error("Usa npm run db:local o npm run db:atlas.");
  process.exit(1);
}
const profile = path.join(root, ".local", "config", `${mode}.env`);
const fallback = path.join(root, ".env.local.example");
if (mode === "atlas" && !fs.existsSync(profile)) {
  console.error(
    "Falta el perfil privado .local/config/atlas.env. Consulta docs/atlas.md.",
  );
  process.exit(1);
}
const content = fs.readFileSync(
  fs.existsSync(profile) ? profile : fallback,
  "utf8",
);
const config = dotenv.parse(content);
const expected = mode === "atlas" ? "starthotel_db" : "starhotel_sprint3";
const { MongoClient } = require("mongodb");
if (
  !config.MONGODB_URI ||
  new MongoClient(config.MONGODB_URI).db().databaseName !== expected ||
  config.EXPECTED_DB_NAME !== expected ||
  (mode === "local" && config.REQUIRE_LOCAL_DB !== "true")
) {
  console.error(
    "El perfil no corresponde a la base esperada. No se cambió la configuración.",
  );
  process.exit(1);
}
const target = path.join(root, ".env.local");
fs.writeFileSync(`${target}.tmp`, content, { mode: 0o600 });
fs.renameSync(`${target}.tmp`, target);
const entry = path.join(root, "src", "index.ts");
fs.utimesSync(entry, new Date(), new Date());
console.log(
  `Configuración seleccionada: ${mode} / ${expected}. El servidor dev se reinicia automáticamente; si usas start, reinícialo.`,
);
