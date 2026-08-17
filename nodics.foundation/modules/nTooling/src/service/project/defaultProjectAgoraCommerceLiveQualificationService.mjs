#!/usr/bin/env node
import { spawn } from "node:child_process";

const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...options.env },
      stdio: "inherit",
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  console.log("[agora-commerce-live-qualification] expected flow: data folder -> Staged schemas -> Online schemas -> search indexing -> Agora frontend");
  console.log("[agora-commerce-live-qualification] starting local topology preflight");
  await run("npm", ["run", "topology:preflight"]);
  console.log("[agora-commerce-live-qualification] validating staged agoraCommonData release contracts");
  await run("npm", ["run", "test:agora-commerce"]);
  console.log("[agora-commerce-live-qualification] validating staged data import acceptance");
  await run("npm", ["run", "acceptance:agora-commerce-data"]);
  console.log("[agora-commerce-live-qualification] validating Staged to Online publication acceptance");
  await run("npm", ["run", "acceptance:agora-commerce-publication"]);
  console.log("[agora-commerce-live-qualification] validating Online customer journey acceptance");
  await run("npm", ["run", "acceptance:agora-commerce"]);
  console.log("[agora-commerce-live-qualification] PASS");
}

main().catch((error) => {
  console.error(`[agora-commerce-live-qualification] FAIL ${error.stack || error.message}`);
  process.exitCode = 1;
});
