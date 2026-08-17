#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { createRequire } from "node:module";
import path from "node:path";

const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const platformUrl = process.env.NODICS_PLATFORM_URL || "http://127.0.0.1:4300";
const commerceStagedUrl = process.env.NODICS_COMMERCE_STAGED_URL || "http://127.0.0.1:4352";
const axisOrigin = process.env.AXIS_ORIGIN || "http://127.0.0.1:3100";
const executeInstall = process.env.NODICS_STOREFRONT_COMMERCE_DATA_EXECUTE === "true";
const managed = [];
const require = createRequire(import.meta.url);
const composition = require("../config/agora-domain-composition").resolve();
const groupByPack = Object.freeze({ agoraApparelData: "agora.apparel", agoraElectronicsData: "agora.electronics", agoraTelcoData: "agora.telco" });
const requiredReleaseCodes = Object.freeze(composition.projectPacks.flatMap((pack) => {
  const manifest = require(path.join(projectRoot, "modules", groupByPack[pack], "modules", pack, "data", "manifest.json"));
  return Object.entries(manifest.sections)
    .filter(([, section]) => section.destinationRole === "COMMERCE_STAGED")
    .map(([sectionCode]) => `${pack}:${sectionCode}`);
}));

function log(message) {
  console.log(`[agora-commerce-data-acceptance] ${message}`);
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch (error) {
    throw new Error(`${path} returned non-JSON HTTP ${response.status}: ${text}`);
  }
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}: ${text}`);
  }
  return body;
}

async function listening(port) {
  return new Promise((resolve) => {
    const child = spawn("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], {
      stdio: ["ignore", "ignore", "ignore"],
    });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

async function waitReady(baseUrl, label) {
  const deadline = Date.now() + Number(process.env.NODICS_ACCEPTANCE_READY_TIMEOUT_MS || 90000);
  let lastError;
  while (Date.now() < deadline) {
    try {
      const health = await request(baseUrl, "/nodics/system/v0/health/ready");
      if (health?.status === "UP" || health?.data?.status === "UP" || health?.ready === true || health?.success === true) {
        log(`${label} ready`);
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await delay(1000);
  }
  throw new Error(`${label} did not become ready: ${lastError?.message || "unknown readiness failure"}`);
}

async function ensureRuntime(label, port, script, baseUrl) {
  if (!(await listening(port))) {
    const child = spawn("npm", ["run", script], {
      cwd: projectRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => process.stdout.write(`[${label}] ${chunk}`));
    child.stderr.on("data", (chunk) => process.stderr.write(`[${label}] ${chunk}`));
    managed.push(child);
  }
  await waitReady(baseUrl, label);
}

function portOf(baseUrl, fallback) {
  try {
    const url = new URL(baseUrl);
    return Number(url.port || (url.protocol === "https:" ? 443 : 80));
  } catch {
    return fallback;
  }
}

async function authenticateEmployee() {
  const suppliedToken = process.env.AXIS_AUTH_TOKEN || process.env.NODICS_AUTH_TOKEN;
  if (suppliedToken) return { Authorization: `Bearer ${suppliedToken}` };
  const credentials = {
    loginId: process.env.AXIS_LOGIN_ID || "admin",
    password: process.env.AXIS_PASSWORD || "adminPassword",
  };
  const headers = {
    Origin: axisOrigin,
    "x-enterprise-code": process.env.NODICS_ENTERPRISE_CODE || "default",
  };
  let lastError;
  for (const path of ["/nodics/profile/v0/employee/browser/authenticate", "/nodics/profile/v0/employee/authenticate"]) {
    try {
      const result = await request(platformUrl, path, {
        method: "POST",
        headers,
        body: JSON.stringify(credentials),
      });
      const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken;
      if (authToken) return { Authorization: `Bearer ${authToken}` };
      lastError = new Error(`${path} returned no employee auth token`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Platform employee authentication returned no token");
}

async function resolveImportRoutes(headers) {
  const contract = await request(commerceStagedUrl, "/nodics/system/v0/contract/openapi", { headers });
  const paths = contract?.paths || contract?.openapi?.paths || {};
  const has = (route, method) => Boolean(paths[route]?.[method]);
  const routes = {
    catalogue: "/nodics/import/v0/sample",
    validate: "/nodics/import/v0/sample/validate",
    install: "/nodics/import/v0/sample/install",
  };
  const missing = [
    ["catalogue", "get"],
    ["validate", "post"],
    ["install", "post"],
  ].filter(([name, method]) => !has(routes[name], method));
  if (missing.length > 0) {
    const importPaths = Object.keys(paths).filter((route) => route.includes("/nodics/import/")).sort();
    throw new Error(`Commerce Staged data-import contract is missing ${missing.map(([name]) => routes[name]).join(", ")}; effective import paths: ${importPaths.join(", ") || "none"}`);
  }
  log("Commerce Staged sample catalogue, validate, and gated install routes are effective");
  return routes;
}

function releaseList(body) {
  const data = body?.data ?? body?.result ?? body;
  return Array.isArray(data) ? data : Array.isArray(data?.releases) ? data.releases : [];
}

function releaseVersionMap(releases) {
  return Object.fromEntries(requiredReleaseCodes.map((releaseCode) => {
    const release = releases.find((item) => item.releaseCode === releaseCode);
    return [releaseCode, release?.version || "1.0.0"];
  }));
}

async function validateCatalogue(headers, routes) {
  const body = await request(commerceStagedUrl, routes.catalogue, { headers });
  const releases = releaseList(body);
  const releaseCodes = releases.map((item) => item.releaseCode).sort();
  const missing = requiredReleaseCodes.filter((releaseCode) => !releaseCodes.includes(releaseCode));
  if (missing.length > 0) {
    throw new Error(`Commerce Staged sample catalogue is missing Agora releases: ${missing.join(", ")}; found: ${releaseCodes.join(", ") || "none"}`);
  }
  for (const release of releases.filter((item) => requiredReleaseCodes.includes(item.releaseCode))) {
    if (release.dataType !== "sample") throw new Error(`${release.releaseCode} should be sample, got ${release.dataType}`);
    if (release.destinationRole !== "COMMERCE_STAGED") throw new Error(`${release.releaseCode} should target COMMERCE_STAGED, got ${release.destinationRole}`);
  }
  log(`catalogue exposes ${requiredReleaseCodes.length} Agora Commerce staged releases`);
  return releases;
}

async function preflight(headers, routes, releases) {
  const releaseRequest = {
    dataType: "sample",
    releaseCodes: requiredReleaseCodes,
    expectedReleases: releaseVersionMap(releases),
  };
  const body = await request(commerceStagedUrl, routes.validate, {
    method: "POST",
    headers,
    body: JSON.stringify(releaseRequest),
  });
  const validation = body?.data?.validation || body?.validation;
  if (validation?.validationOnly !== true || validation?.importExecuted !== false) {
    throw new Error(`sample validate route must remain preflight-only by default: ${JSON.stringify(validation)}`);
  }
  const responseReleaseCodes = releaseList(body).map((item) => item.releaseCode).sort();
  const missing = requiredReleaseCodes.filter((releaseCode) => !responseReleaseCodes.includes(releaseCode));
  if (missing.length > 0) {
    throw new Error(`sample validate response is missing Agora releases: ${missing.join(", ")}`);
  }
  log("preflight validated the full Agora Commerce data-release plan without importing data");
  return releaseRequest;
}

async function installIfExplicitlyEnabled(headers, routes, releaseRequest) {
  if (!executeInstall) {
    log("install skipped; set NODICS_STOREFRONT_COMMERCE_DATA_EXECUTE=true to run the mutating sample install route");
    return;
  }
  const installed = [];
  for (const releaseCode of releaseRequest.releaseCodes) {
    const singleReleaseRequest = {
      dataType: releaseRequest.dataType,
      releaseCodes: [releaseCode],
      expectedReleases: { [releaseCode]: releaseRequest.expectedReleases[releaseCode] },
    };
    try {
      const body = await request(commerceStagedUrl, routes.install, {
        method: "POST",
        headers,
        body: JSON.stringify(singleReleaseRequest),
      });
      const statuses = releaseList(body).map((release) => `${release.releaseCode}:${release.status}`).join(", ");
      installed.push(statuses || `${releaseCode}:UNKNOWN`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("ERR_IMP_00003")) {
        log(`install already current for ${releaseCode}; immutable data-release guard returned ERR_IMP_00003`);
        continue;
      }
      throw error;
    }
  }
  log(`install executed through gated route; release statuses: ${installed.join(", ") || "all releases already current"}`);
}

async function cleanup() {
  for (const child of managed.reverse()) child.kill("SIGTERM");
}

async function run() {
  try {
    await ensureRuntime("Platform", portOf(platformUrl, 4300), "start:platform", platformUrl);
    await ensureRuntime("CommerceStaged", portOf(commerceStagedUrl, 4352), "start:commerce:staged", commerceStagedUrl);
    const employeeHeaders = await authenticateEmployee();
    const routes = await resolveImportRoutes(employeeHeaders);
    const releases = await validateCatalogue(employeeHeaders, routes);
    const releaseRequest = await preflight(employeeHeaders, routes, releases);
    await installIfExplicitlyEnabled(employeeHeaders, routes, releaseRequest);
    log("Agora Commerce data acceptance passed");
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
