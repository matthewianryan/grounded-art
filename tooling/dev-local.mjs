import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const root = new URL("..", import.meta.url).pathname;
const apiDir = new URL("../apps/api", import.meta.url).pathname;
const children = new Set();

function log(message) {
  process.stdout.write(`[dev:local] ${message}\n`);
}

function run(command, args, options = {}) {
  log(`${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function tryRun(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    stdio: options.stdio ?? "ignore",
    env: process.env,
  });
  return result.status === 0;
}

function start(command, args, options = {}) {
  log(`starting ${command} ${args.join(" ")}`);
  const child = spawn(command, args, {
    cwd: options.cwd ?? root,
    stdio: "inherit",
    env: process.env,
  });
  children.add(child);
  child.on("exit", (code) => {
    children.delete(child);
    if (!shuttingDown && code !== 0 && code !== null) {
      log(`${command} exited with ${code}`);
      shutdown(code);
    }
  });
  return child;
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

async function waitForPort(port, label, timeoutMs = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (await isPortOpen(port)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${label} did not open port ${port}`);
}

async function waitForOk(url, label, timeoutMs = 30000) {
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

async function ensureDb() {
  await ensureDocker();
  run("docker", ["compose", "up", "-d", "db"]);
  await waitForPort(5432, "Postgres");
}

async function ensureApi() {
  run("uv", ["run", "alembic", "upgrade", "head"], { cwd: apiDir });
  run("uv", ["run", "python", "-m", "app.seed"], { cwd: apiDir });

  if (await isPortOpen(8000)) {
    log("API already listening on 8000");
  } else {
    start("uv", ["run", "uvicorn", "app.main:app", "--reload", "--port", "8000"], {
      cwd: apiDir,
    });
  }

  await waitForOk("http://localhost:8000/health", "API health");
  await waitForOk("http://localhost:8000/galleries?limit=1", "API galleries");
}

async function ensureFrontend() {
  const landingOpen = await isPortOpen(3000);
  const webOpen = await isPortOpen(3001);
  if (landingOpen && webOpen) {
    log("frontend already listening on 3000 and 3001");
  } else {
    start("pnpm", ["dev"]);
  }
  await waitForOk("http://localhost:3000/app/map", "web app map", 60000);
}

let shuttingDown = false;

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of children) {
    child.kill("SIGINT");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

try {
  await ensureDb();
  await ensureApi();
  await ensureFrontend();
  log("ready: http://localhost:3000/app/map");
  if (children.size === 0) {
    log("all services were already running; exiting");
  } else {
    log("press Ctrl-C to stop API/frontend processes started by this command");
    await new Promise(() => {});
  }
} catch (error) {
  log(error instanceof Error ? error.message : String(error));
  shutdown(1);
}
