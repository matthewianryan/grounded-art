import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const root = new URL("..", import.meta.url).pathname;
let composeChild;
let composeEnv = process.env;

function log(message) {
  process.stdout.write(`[dev:local] ${message}\n`);
}

function run(command, args) {
  log(`${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: composeEnv,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function tryRun(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "ignore",
    env: process.env,
  });
  return result.status === 0;
}

function start(command, args) {
  log(`starting ${command} ${args.join(" ")}`);
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: composeEnv,
  });
  child.on("exit", (code) => {
    if (!shuttingDown && code !== 0 && code !== null) {
      process.exit(code);
    }
  });
  return child;
}

async function waitForOk(url, label, timeoutMs = 90000) {
  const startTime = Date.now();
  let lastStatus = "no response";
  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      lastStatus = `${response.status} ${response.statusText}`;
      if (response.ok) return;
    } catch (error) {
      lastStatus = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`${label} was not ready at ${url}: ${lastStatus}`);
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function choosePort(envName, preferred, fallback) {
  if (process.env[envName]) return process.env[envName];
  if (await isPortOpen(preferred)) {
    log(`port ${preferred} is busy; using ${fallback} for ${envName}`);
    return String(fallback);
  }
  return String(preferred);
}

async function ensureDocker() {
  if (tryRun("docker", ["info"])) return;

  if (process.platform === "darwin") {
    log("Docker is not running; opening Docker Desktop");
    tryRun("open", ["-a", "Docker"]);
  }

  const startTime = Date.now();
  while (Date.now() - startTime < 120000) {
    if (tryRun("docker", ["info"])) return;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Docker daemon did not become available. Open Docker Desktop and try again.");
}

let shuttingDown = false;

function shutdown(code = 0) {
  shuttingDown = true;
  if (composeChild) {
    composeChild.kill("SIGINT");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

try {
  await ensureDocker();
  const webPort = await choosePort("WEB_PORT", 3001, 3101);
  const proxyPort = await choosePort("CADDY_HTTP_PORT", 8080, 8180);
  composeEnv = {
    ...process.env,
    WEB_PORT: webPort,
    CADDY_HTTP_PORT: proxyPort,
  };

  run("docker", ["compose", "up", "-d", "db"]);
  run("docker", ["compose", "build", "api", "web"]);
  run("docker", ["compose", "run", "--rm", "api", "alembic", "upgrade", "head"]);
  run("docker", ["compose", "run", "--rm", "api", "python", "-m", "app.seed"]);

  composeChild = start("docker", ["compose", "up", "api", "web", "caddy"]);

  await waitForOk("http://localhost:8000/health", "API health");
  await waitForOk("http://localhost:8000/galleries?limit=1", "API galleries");
  await waitForOk(`http://localhost:${webPort}/map`, "web app map");
  await waitForOk(`http://localhost:${webPort}/feed`, "web app feed");
  await waitForOk(`http://localhost:${proxyPort}/map`, "proxy map");

  log("ready:");
  log(`  app:   http://localhost:${webPort}/feed`);
  log(`  map:   http://localhost:${webPort}/map`);
  log("  api:   http://localhost:8000/health");
  log(`  proxy: http://localhost:${proxyPort}/feed`);
  log("press Ctrl-C to stop API/web/proxy containers; db keeps its Docker volume");

  await new Promise(() => {});
} catch (error) {
  log(error instanceof Error ? error.message : String(error));
  shutdown(1);
}
