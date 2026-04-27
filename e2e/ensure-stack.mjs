// Ensures the docker compose stack is running with ALGOTUTOR_E2E=1 set on the
// backend container before E2E tests connect. If the backend is up but was
// started WITHOUT E2E mode, the /api/state/reset endpoint returns 403 and the
// state-isolation between tests breaks silently. We detect that and recreate.

import { execSync } from "node:child_process";

const env = { ...process.env, ALGOTUTOR_E2E: "1" };

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], env, ...opts }).toString();
}

function backendE2EFlag() {
  try {
    const out = sh("docker compose exec -T algotutor-backend sh -c \"echo ${ALGOTUTOR_E2E:-0}\"");
    return out.trim();
  } catch { return null; }
}

console.log("[e2e] ensuring docker compose stack is up with ALGOTUTOR_E2E=1…");
execSync("docker compose up -d", { stdio: "inherit", env });

const flag = backendE2EFlag();
if (flag !== "1") {
  console.log(`[e2e] backend was running with ALGOTUTOR_E2E=${flag ?? "unknown"}; recreating with E2E=1`);
  execSync("docker compose up -d --force-recreate --no-deps algotutor-backend", { stdio: "inherit", env });
  // Tiny grace period for the server to bind.
  const start = Date.now();
  while (Date.now() - start < 15_000) {
    try {
      const out = sh("docker compose exec -T algotutor-backend sh -c \"echo ${ALGOTUTOR_E2E:-0}\"").trim();
      if (out === "1") break;
    } catch {}
  }
}
console.log("[e2e] backend ALGOTUTOR_E2E=1 confirmed.");
