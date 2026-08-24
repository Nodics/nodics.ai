#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(process.env.NODICS_PROJECT_ROOT || process.cwd());
const workspaceRoot = resolve(projectRoot, "..");
const axisRoot = resolve(
  process.env.NODICS_AXIS_ROOT || resolve(workspaceRoot, "nodics.exp", "nodics.axis"),
);
const platformUrl = process.env.AXIS_PLATFORM_URL || "http://127.0.0.1:4300";
const wcmsUrl = process.env.AXIS_WCMS_URL || "http://127.0.0.1:4312";
const wcmsOnlineUrl =
  process.env.NEXUS_CMS_URL || "http://127.0.0.1:4314";
const processUrl = process.env.AXIS_PROCESS_URL || "http://127.0.0.1:4330";
const axisUrl = process.env.AXIS_URL || "http://127.0.0.1:3100";
const enterpriseCode = process.env.AXIS_ENTERPRISE || "default";
const loginId = process.env.AXIS_LOGIN_ID || "admin";
const password = process.env.AXIS_PASSWORD || "adminPassword";
const projectCode = process.env.AXIS_PROJECT || "nodics.kickoff";
const runtimeMode = process.env.NODICS_ACCEPTANCE_RUNTIME || "kickoffLocal";
const managedStartupEnabled = runtimeMode === "kickoffLocal";
const nexusUrl = process.env.NEXUS_URL || "http://127.0.0.1:3200";
const urlPort = (value) => Number(new URL(value).port || (new URL(value).protocol === "https:" ? 443 : 80));
const dropLocalDb = process.argv.includes("--drop-local-db");
const leaveStarted = process.argv.includes("--leave-started");
const expectDocumentationNotInstalled = process.argv.includes("--expect-documentation-not-installed");
const qualifyDocumentationRollback = process.argv.includes("--qualify-documentation-rollback");
const documentationPacks = [
  {
    code: "nodicsDocumentation",
    minimumRoutes: 9,
    navigationComponent: "nodicsDocumentationNavigation",
    site: "nodicsDocumentationSite",
  },
  {
    code: "axisDocumentation",
    minimumRoutes: 14,
    navigationComponent: "axisDocumentationNavigation",
    site: "axisDocumentationSite",
  },
  {
    code: "kickoffDocumentation",
    minimumRoutes: 4,
    navigationComponent: "kickoffDocumentationNavigation",
    site: "kickoffDocumentationSite",
  },
];
const nexusPacks = [];
const contentPacks = [...documentationPacks, ...nexusPacks];
const expectedCatalogs = Object.freeze([
  Object.freeze({
    code: "axisContentCatalog",
    catalogType: "CONTENT",
  }),
  Object.freeze({
    code: "defaultContentCatalog",
    catalogType: "CONTENT",
  }),
  Object.freeze({
    code: "documentationContentCatalog",
    catalogType: "CONTENT",
  }),
  Object.freeze({
    code: "nexusContentCatalog",
    catalogType: "CONTENT",
  }),
  Object.freeze({
    code: "defaultProductCatalog",
    catalogType: "PRODUCT",
  }),
]);
const retiredDocumentationCatalogs = Object.freeze([
  "nodicsDocumentationContentCatalog",
  "axisDocumentationContentCatalog",
  "kickoffDocumentationContentCatalog",
]);
const localPorts = [
  { label: "Platform", port: urlPort(platformUrl) },
  { label: "WCMS Staged", port: urlPort(wcmsUrl) },
  { label: "WCMS Online", port: urlPort(wcmsOnlineUrl) },
  { label: "Process", port: urlPort(processUrl) },
  { label: "Engagement", port: 4340 },
  { label: "Commerce", port: 4350 },
  { label: "Axis", port: urlPort(axisUrl) },
];
const managedProcesses = [];

function log(message) {
  console.log(`[acceptance] ${message}`);
}

function endpoint(baseUrl, path) {
  return new URL(path, baseUrl).toString();
}

function stableId(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function isErrorLevelLog(text) {
  return /(?:^|\s)error\s*:/i.test(text) || /\[31merror/i.test(text);
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(endpoint(baseUrl, path), {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      "x-enterprise-code": enterpriseCode,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(
      `${path} returned non-JSON response: ${text.slice(0, 200)}`,
    );
  }
  if (!response.ok) {
    throw new Error(
      `${path} returned HTTP ${String(response.status)}: ${text.slice(0, 500)}`,
    );
  }
  return body?.result || body?.data || body;
}

/** Executes an authenticated JSON request while preserving expected error responses for negative gates. */
async function requestJsonResponse(baseUrl, path, options = {}) {
  const response = await fetch(endpoint(baseUrl, path), {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      "x-enterprise-code": enterpriseCode,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(`${path} returned non-JSON response: ${text.slice(0, 200)}`);
  }
  return { status: response.status, body: body?.result || body?.data || body };
}

/** Proves bounded operator diagnostics and dry-run reconciliation through nPublish APIs only. */
async function verifyPublicationOperations(headers) {
  const diagnostics = await requestJson(wcmsUrl, "/nodics/publish/v0/publications/operations/diagnostics", { headers });
  if (!diagnostics?.metrics || !["READY", "DEGRADED"].includes(diagnostics.readiness)) {
    throw new Error(`Publication diagnostics are invalid: ${JSON.stringify(diagnostics)}`);
  }
  const reconciliation = await requestJson(wcmsUrl, "/nodics/publish/v0/publications/operations/reconcile", {
    headers,
    method: "POST",
    body: JSON.stringify({ repairEvidence: false }),
  });
  if (!reconciliation?.projection || !Array.isArray(reconciliation.target) ||
      reconciliation.target.some((entry) => entry.result?.status === "FAILED")) {
    throw new Error(`Publication reconciliation is invalid: ${JSON.stringify(reconciliation)}`);
  }
  log(`publication diagnostics and dry-run reconciliation passed for ${String(reconciliation.target.length)} target releases`);
}

async function expectHttpOk(baseUrl, path) {
  const response = await fetch(endpoint(baseUrl, path), {
    headers: { "x-enterprise-code": enterpriseCode },
  });
  if (!response.ok) {
    throw new Error(
      `${endpoint(baseUrl, path)} returned HTTP ${String(response.status)}`,
    );
  }
}

/** Proves the Local browser/runtime security matrix through HTTP without database access. */
async function verifyLocalRouteSecurityMatrix() {
  const nexusOrigin = new URL(nexusUrl).origin;
  const axisOrigin = new URL(axisUrl).origin;
  const probe = (baseUrl, path, origin, options = {}) => fetch(endpoint(baseUrl, path), {
    redirect: "manual",
    ...options,
    headers: { Origin: origin, ...(options.headers || {}) },
  });
  const platformBootstrap = await probe(platformUrl, "/nodics/backoffice/v0/bootstrap/public", nexusOrigin);
  if (platformBootstrap.status !== 200 || platformBootstrap.headers.get("access-control-allow-origin") !== nexusOrigin) {
    throw new Error("Nexus must reach only the Platform low-disclosure public bootstrap boundary");
  }
  for (const [label, baseUrl] of [["WCMS Staged", wcmsUrl], ["Process", processUrl]]) {
    const denied = await probe(baseUrl, "/nodics/system/v0/health/ready", nexusOrigin);
    if (denied.status !== 403 || denied.headers.get("access-control-allow-origin")) {
      throw new Error(`${label} did not reject the Nexus browser origin`);
    }
  }
  const axisStaged = await probe(wcmsUrl, "/nodics/system/v0/health/ready", axisOrigin);
  if (axisStaged.status !== 200 || axisStaged.headers.get("access-control-allow-origin") !== axisOrigin) {
    throw new Error("WCMS Staged did not accept the Axis browser origin");
  }
  const onlinePreflight = await probe(wcmsOnlineUrl, "/nodics/cms/v0/delivery/pages/resolve", nexusOrigin, {
    method: "OPTIONS", headers: { "Access-Control-Request-Method": "GET" },
  });
  if (onlinePreflight.status !== 204 || onlinePreflight.headers.get("access-control-allow-origin") !== nexusOrigin) {
    throw new Error("WCMS Online did not accept the Nexus delivery preflight");
  }
  if (platformBootstrap.status >= 300 && platformBootstrap.status < 400) throw new Error("Public bootstrap redirected unexpectedly");
  for (const header of ["content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "cache-control"]) {
    if (!platformBootstrap.headers.get(header)) throw new Error(`Platform response omitted ${header}`);
  }
  log("Local route-security matrix passed live origin, CORS, redirect, and header boundaries");
}

async function waitForHttp(baseUrl, path, label, timeoutMs = 60000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      await expectHttpOk(baseUrl, path);
      log(`${label} is reachable`);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(
    `${label} did not become reachable: ${lastError?.message || "timeout"}`,
  );
}

async function portListening(port) {
  const { stdout } = await execFileAsync("lsof", [
    "-nP",
    `-iTCP:${String(port)}`,
    "-sTCP:LISTEN",
  ]).catch(() => ({ stdout: "" }));
  return (
    stdout.includes(`:${String(port)} `) ||
    stdout.includes(`:${String(port)} (LISTEN)`)
  );
}

/** Returns process identifiers listening on one explicit TCP port. */
async function portListenerPids(port) {
  const { stdout } = await execFileAsync("lsof", [
    "-nP",
    "-tiTCP:" + String(port),
    "-sTCP:LISTEN",
  ]).catch(() => ({ stdout: "" }));
  return stdout.split(/\s+/).map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0);
}

/** Sends a signal to every supplied process identifier, ignoring already-exited processes. */
function signalPids(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch (error) {
      if (error && error.code !== "ESRCH") throw error;
    }
  }
}

async function assertFreshResetPortsAvailable() {
  if (!dropLocalDb) return;
  const busy = [];
  for (const candidate of localPorts) {
    if (await portListening(candidate.port)) {
      busy.push(`${candidate.label} ${String(candidate.port)}`);
    }
  }
  if (busy.length > 0) {
    throw new Error(
      [
        "Fresh database bootstrap requires the local stack to be stopped first.",
        `Busy ports: ${busy.join(", ")}.`,
        "Stop Platform, WCMS, Process, Engagement, Commerce, and Axis before running acceptance:local:fresh,",
        "or run npm run acceptance:local for a non-destructive verification against the current stack.",
      ].join(" "),
    );
  }
}

function startProcess(label, cwd, command, args, readyPort) {
  log(`starting ${label}`);
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const errors = [];
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[${label}] ${text}`);
    if (isErrorLevelLog(text)) errors.push(text.trim());
  });
  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    process.stderr.write(`[${label}] ${text}`);
    if (isErrorLevelLog(text)) errors.push(text.trim());
  });
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] exited with code ${String(code)}`);
    }
  });
  managedProcesses.push({ child, errors, label, readyPort });
  return child;
}

async function ensureProcess(label, port, cwd, scriptName, baseUrl, readyPath) {
  if (!managedStartupEnabled) return waitForHttp(baseUrl, readyPath, label);
  if (await portListening(port)) {
    log(`${label} already listening on ${String(port)}`);
    return;
  }
  if (!managedStartupEnabled) throw new Error(`${label} is not listening on ${String(port)} for ${runtimeMode}`);
  startProcess(label, cwd, "npm", ["run", scriptName], port);
  await waitForHttp(baseUrl, readyPath, label);
}

async function assertGovernedFreshResetAvailable() {
  if (!dropLocalDb) {
    log(
      "fresh reset skipped; retained data will be verified only through Nodics APIs",
    );
    return;
  }
  log("fresh reset requested; only the governed Platform reset API will be used");
}

async function stopManagedProcesses() {
  managedProcesses.forEach(({ child }) => child.kill("SIGTERM"));
  const started = Date.now();
  while (Date.now() - started < 15000) {
    const busy = [];
    for (const candidate of localPorts.filter((item) => item.port !== 3100)) {
      if (await portListening(candidate.port)) busy.push(candidate.port);
    }
    if (!busy.length) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const remaining = [];
  for (const candidate of localPorts.filter((item) => item.port !== 3100)) {
    const pids = await portListenerPids(candidate.port);
    if (pids.length > 0) remaining.push({ port: candidate.port, pids });
  }
  if (remaining.length > 0) {
    remaining.forEach((item) => signalPids(item.pids, "SIGTERM"));
    const terminateStarted = Date.now();
    while (Date.now() - terminateStarted < 5000) {
      const busy = [];
      for (const candidate of localPorts.filter((item) => item.port !== 3100)) {
        if (await portListening(candidate.port)) busy.push(candidate.port);
      }
      if (!busy.length) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  const stillListening = [];
  for (const candidate of localPorts.filter((item) => item.port !== 3100)) {
    const pids = await portListenerPids(candidate.port);
    if (pids.length > 0) {
      signalPids(pids, "SIGKILL");
      stillListening.push(candidate.port);
    }
  }
  if (stillListening.length > 0) log(`forced shutdown of Local reset listeners on ports ${stillListening.join(", ")}`);
  managedProcesses.length = 0;
}

async function executeGovernedFreshReset(headers) {
  if (!dropLocalDb) return false;
  const status = await requestJson(platformUrl, "/nodics/backoffice/v0/operations/local-reset", { headers });
  if (status.ready !== true || status.apiOnly !== true) {
    throw new Error(`governed Local reset is not ready: ${JSON.stringify(status)}`);
  }
  const result = await requestJson(platformUrl, "/nodics/backoffice/v0/operations/local-reset", {
    headers,
    method: "POST",
    body: JSON.stringify({ confirmation: "RESET_LOCAL_NODICS_DATA", reason: "fresh local publishing acceptance verification" }),
  });
  if (result.acknowledged !== true || result.providerCount !== 4) {
    throw new Error(`governed Local reset was not fully acknowledged: ${JSON.stringify(result)}`);
  }
  log("all four runtime owners acknowledged API-only Local reset");
  await stopManagedProcesses();
  return true;
}

async function authenticate() {
  const auth = await requestJson(
    platformUrl,
    "/nodics/profile/v0/employee/browser/authenticate",
    {
      method: "POST",
      body: JSON.stringify({ loginId, password }),
      headers: { Origin: axisUrl },
    },
  );
  if (!auth?.authToken) {
    throw new Error("authentication did not return an auth token");
  }
  log(`authenticated ${loginId}`);
  return {
    Authorization: `Bearer ${auth.authToken}`,
  };
}

async function loadRegistry(headers) {
  const registered = await requestJson(
    platformUrl,
    `/nodics/backoffice/v0/runtime/modules/registrations?project=${encodeURIComponent(projectCode)}`,
    { headers },
  );
  const available = await requestJson(
    platformUrl,
    `/nodics/backoffice/v0/runtime/modules/available?project=${encodeURIComponent(projectCode)}`,
    { headers },
  );
  return {
    registered: registered.items || registered.modules || registered,
    available: available.items || available.modules || available,
  };
}

function requireModule(modules, functionalModule, label) {
  const match = []
    .concat(modules || [])
    .find((item) => item.functionalModule === functionalModule);
  if (!match) throw new Error(`${functionalModule} missing from ${label}`);
  return match;
}

async function importContentPacks(headers) {
  for (const pack of contentPacks) {
    const packCode = pack.code;
    const status = await requestJson(
      wcmsUrl,
      `/nodics/system/v0/content-packs/${encodeURIComponent(packCode)}`,
      { headers },
    );
    if (status.state !== "CURRENT") {
      await requestJson(
        wcmsUrl,
        `/nodics/system/v0/content-packs/${encodeURIComponent(packCode)}/imports`,
        { headers, method: "POST" },
      );
    }
    const current = await requestJson(
      wcmsUrl,
      `/nodics/system/v0/content-packs/${encodeURIComponent(packCode)}`,
      { headers },
    );
    if (current.state !== "CURRENT") {
      throw new Error(`${packCode} is ${String(current.state)} after import`);
    }
    log(
      `${packCode} is CURRENT (${current.installedVersion})`,
    );
  }
}

/** Proves a clean environment does not install optional documentation before an Axis administrator requests it. */
async function verifyDocumentationInitiallyNotInstalled(headers) {
  if (!expectDocumentationNotInstalled) return;
  for (const pack of documentationPacks) {
    const status = await requestJson(
      wcmsUrl,
      `/nodics/system/v0/content-packs/${encodeURIComponent(pack.code)}`,
      { headers },
    );
    if (status.state !== "NOT_INSTALLED") {
      throw new Error(`${pack.code} must be NOT_INSTALLED before Axis initiation; received ${String(status.state)}`);
    }
    const publicInstall = await requestJsonResponse(
      wcmsUrl,
      `/nodics/system/v0/content-packs/${encodeURIComponent(pack.code)}/imports`,
      { method: "POST", headers: { Origin: nexusUrl } },
    );
    if (![401, 403].includes(publicInstall.status)) {
      throw new Error(`${pack.code} public/Nexus installation request returned HTTP ${String(publicInstall.status)}`);
    }
  }
  log("optional documentation packs are NOT_INSTALLED and public/Nexus installation is denied");
}

/** Proves importing optional documentation writes only to Staged until the publication workflow completes. */
async function verifyDocumentationNotOnlineBeforePublication() {
  if (!expectDocumentationNotInstalled) return;
  const profiles = [
    { site: "nodicsDocumentationSite", path: "/docs/framework" },
    { site: "axisDocumentationSite", path: "/docs/nodics-axis" },
    { site: "kickoffDocumentationSite", path: "/docs/nodics-kickoff" },
  ];
  for (const profile of profiles) {
    const delivered = await requestJsonResponse(
      wcmsOnlineUrl,
      `/nodics/cms/v0/delivery/pages/resolve?site=${encodeURIComponent(profile.site)}&path=${encodeURIComponent(profile.path)}&locale=en&channel=web`,
    );
    if (delivered.status === 200 && delivered.body?.page) {
      throw new Error(`${profile.site} became visible Online before publication approval`);
    }
  }
  log("documentation imports remain isolated from Online before publication approval");
}

async function importNexusStagedRelease(headers) {
  const releaseCode = "nexusWebData:nexusCorporateSite";
  const catalogue = await requestJson(wcmsUrl, "/nodics/import/v0/core", {
    headers,
  });
  const releases = catalogue.data || catalogue.items || catalogue;
  const release = [].concat(releases || []).find(
    (item) => item.releaseCode === releaseCode,
  );
  if (!release) {
    throw new Error(`${releaseCode} is unavailable from WCMS Staged nImport`);
  }
  if (release.status !== "CURRENT") {
    await requestJson(wcmsUrl, "/nodics/import/v0/core/install", {
      headers,
      method: "POST",
      body: JSON.stringify({
        releaseCodes: [releaseCode],
        expectedReleases: { [releaseCode]: release.version },
      }),
    });
  }
  log(`${releaseCode} is qualified through WCMS Staged nImport`);
}

async function importMandatoryProcessRelease(headers) {
  const releaseCode = "cms:cmsPublicationApproval";
  const catalogue = await requestJson(processUrl, "/nodics/import/v0/init", { headers });
  const releases = catalogue.data || catalogue.items || catalogue;
  const release = [].concat(releases || []).find((item) => item.releaseCode === releaseCode);
  if (!release) throw new Error(`${releaseCode} is unavailable from Process nImport`);
  if (release.status !== "CURRENT") {
    await requestJson(processUrl, "/nodics/import/v0/init/install", {
      headers,
      method: "POST",
      body: JSON.stringify({ releaseCodes: [releaseCode], expectedReleases: { [releaseCode]: release.version } }),
    });
  }
  log(`${releaseCode} mandatory workflow is CURRENT in Process`);
}

async function publishAxisBaseline(headers) {
  let status = await requestJson(platformUrl, "/nodics/backoffice/v0/axis/initialization", { headers });
  if (status.readiness === "READY" && status.publication?.state === "ONLINE") {
    log("Axis baseline publication is already ONLINE");
    return;
  }
  const initiated = await requestJson(platformUrl, "/nodics/backoffice/v0/axis/initialization/initiate", {
    headers,
    method: "POST",
    body: JSON.stringify({ reason: "Local end-to-end baseline acceptance" }),
  });
  const publicationCode = initiated.publication?.code;
  if (!publicationCode || initiated.publication?.state !== "PENDING_APPROVAL") {
    throw new Error(`Axis baseline did not enter approval: ${JSON.stringify(initiated)}`);
  }
  const instances = await requestJson(processUrl, "/nodics/process/v0/instances?limit=100", { headers });
  const instance = [].concat(instances.items || instances || []).find(
    (item) => item.definitionCode === "cmsPublicationApproval" && item.context?.publicationCode === publicationCode && item.status === "WAITING",
  );
  if (!instance) throw new Error(`Axis publication workflow instance is unavailable for ${publicationCode}`);
  const tasks = await requestJson(
    processUrl,
    `/nodics/process/v0/tasks?instanceCode=${encodeURIComponent(instance.code)}&limit=20`,
    { headers },
  );
  const task = [].concat(tasks.items || tasks || []).find(
    (item) => item.instanceCode === instance.code && item.nodeCode === "publicationReview" && ["OPEN", "CLAIMED"].includes(item.status),
  );
  if (!task) throw new Error(`Axis publication approval task is unavailable for ${instance.code}`);
  if (task.status === "OPEN") {
    await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, {
      headers,
      method: "POST",
    });
  }
  const completed = await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/complete`, {
    headers,
    method: "POST",
    body: JSON.stringify({ decision: { approved: true, action: "APPROVE", reason: "Local end-to-end baseline acceptance" } }),
  });
  if (completed.instance?.status !== "COMPLETED") {
    throw new Error(`Axis publication workflow did not complete: ${JSON.stringify(completed)}`);
  }
  status = await requestJson(platformUrl, "/nodics/backoffice/v0/axis/initialization", { headers });
  if (status.readiness !== "READY" || status.publication?.state !== "ONLINE") {
    throw new Error(`Axis baseline is not ONLINE after approval: ${JSON.stringify(status)}`);
  }
  log(`Axis baseline ${publicationCode} is ONLINE through Process approval`);
}

/** Proves the reusable Platform profile can initialize and publish the Nexus website bundle. */
async function publishNexusApplicationBundle(headers) {
  let status = await requestJson(platformUrl, "/nodics/backoffice/v0/applications/nexus/initialization", { headers });
  if (status.readiness !== "READY") {
    const initiated = await requestJson(platformUrl, "/nodics/backoffice/v0/applications/nexus/initialization/initiate", {
      headers,
      method: "POST",
      body: JSON.stringify({ reason: "Local reusable Nexus website bundle qualification" }),
    });
    const publicationCode = initiated.publication?.code;
    if (!publicationCode || initiated.publication?.state !== "PENDING_APPROVAL") {
      throw new Error(`Nexus application bundle did not enter approval: ${JSON.stringify(initiated)}`);
    }
    const instances = await requestJson(processUrl, "/nodics/process/v0/instances?limit=100", { headers });
    const instance = [].concat(instances.items || instances || []).find(
      (item) => item.definitionCode === "cmsPublicationApproval" && item.context?.publicationCode === publicationCode && item.status === "WAITING",
    );
    if (!instance) throw new Error(`Nexus publication workflow instance is unavailable for ${publicationCode}`);
    const tasks = await requestJson(processUrl, `/nodics/process/v0/tasks?instanceCode=${encodeURIComponent(instance.code)}&limit=20`, { headers });
    const task = [].concat(tasks.items || tasks || []).find(
      (item) => item.instanceCode === instance.code && item.nodeCode === "publicationReview" && ["OPEN", "CLAIMED"].includes(item.status),
    );
    if (!task) throw new Error(`Nexus publication approval task is unavailable for ${instance.code}`);
    if (task.status === "OPEN") {
      await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, { headers, method: "POST" });
    }
    await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/complete`, {
      headers, method: "POST",
      body: JSON.stringify({ decision: { approved: true, action: "APPROVE", reason: "Local reusable Nexus website bundle qualification" } }),
    });
    status = await requestJson(platformUrl, "/nodics/backoffice/v0/applications/nexus/initialization", { headers });
  }
  if (status.readiness !== "READY" || status.publication?.state !== "ONLINE") {
    throw new Error(`Nexus application bundle is not READY Online: ${JSON.stringify(status)}`);
  }
  const repeat = await requestJson(platformUrl, "/nodics/backoffice/v0/applications/nexus/initialization/initiate", {
    headers, method: "POST", body: JSON.stringify({ reason: "Idempotent Nexus initialization qualification" }),
  });
  if (repeat.readiness !== "READY" || repeat.publication?.code !== status.publication?.code) {
    throw new Error(`Nexus application bundle repeat was not idempotent: ${JSON.stringify(repeat)}`);
  }
  const delivered = await requestJson(wcmsOnlineUrl, "/nodics/cms/v0/delivery/pages/resolve?site=nexusCorporateSite&path=/&locale=en&channel=web", { headers });
  if (!delivered || !delivered.page) throw new Error(`Nexus Online delivery probe failed: ${JSON.stringify(delivered)}`);
  log("reusable Nexus application bundle is READY through Staged, Process approval, and Online delivery");
}

/** Completes the current publication review through Process without bypassing workflow authority. */
async function decidePublication(headers, publicationCode, approved, reason) {
  let instance;
  for (let attempt = 0; attempt < 20 && !instance; attempt += 1) {
    const instances = await requestJson(processUrl, "/nodics/process/v0/instances?limit=200", { headers });
    instance = [].concat(instances.items || instances || []).find(
      (item) => item.definitionCode === "cmsPublicationApproval" && item.context?.publicationCode === publicationCode && item.status === "WAITING",
    );
    if (!instance) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!instance) throw new Error(`Publication workflow instance is unavailable for ${publicationCode}`);
  const tasks = await requestJson(processUrl, `/nodics/process/v0/tasks?instanceCode=${encodeURIComponent(instance.code)}&limit=20`, { headers });
  const task = [].concat(tasks.items || tasks || []).find(
    (item) => item.instanceCode === instance.code && item.nodeCode === "publicationReview" && ["OPEN", "CLAIMED"].includes(item.status),
  );
  if (!task) throw new Error(`Publication review task is unavailable for ${instance.code}`);
  if (task.status === "OPEN") {
    await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, { headers, method: "POST" });
  }
  return requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/complete`, {
    headers,
    method: "POST",
    body: JSON.stringify({ decision: { approved, action: approved ? "APPROVE" : "REJECT", reason } }),
  });
}

/** Qualifies a real v1 -> v2 Nexus lifecycle with rejection, rollback, retirement, and governed recovery. */
async function qualifyNexusApplicationUpdate(headers) {
  const profilePath = "/nodics/backoffice/v0/applications/nexusupdate/initialization";
  const deliveryPath = "/nodics/cms/v0/delivery/pages/resolve?site=nexusCorporateSite&path=/&locale=en&channel=web";
  const initiate = async (reason) => requestJson(platformUrl, `${profilePath}/initiate`, {
    headers, method: "POST", body: JSON.stringify({ reason }),
  });
  const waitOnline = async (label) => {
    let current;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      current = await requestJson(platformUrl, profilePath, { headers });
      if (current.readiness === "READY" && current.publication?.state === "ONLINE") return current;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`${label} did not reach ONLINE: ${JSON.stringify(current)}`);
  };
  const assertMarker = async (expected, label) => {
    let response;
    let present;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      response = await requestJsonResponse(wcmsOnlineUrl, deliveryPath, { headers });
      present = response.status === 200 && JSON.stringify(response.body).includes("nexus-corporate-1.0.1");
      if (present === expected) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`${label} marker expectation failed: expected=${String(expected)} actual=${String(present)} status=${String(response?.status)}`);
  };

  const initialStatus = await requestJson(platformUrl, profilePath, { headers });
  if (initialStatus.publication?.state === "FAILED") {
    throw new Error(`Nexus v2 retained lifecycle requires recovery: ${JSON.stringify(initialStatus)}`);
  }
  if (initialStatus.readiness === "READY" && initialStatus.publication?.state === "ONLINE") {
    const partnerStatus = await requestJson(platformUrl,
      "/nodics/backoffice/v0/applications/partnernexus/initialization", { headers });
    if (partnerStatus.readiness === "READY" && partnerStatus.publication?.state === "ONLINE") {
      log("Nexus v2 lifecycle remains ONLINE and is superseded by the retained partner customization");
    } else {
      await assertMarker(true, "Retained v2");
      log("Nexus v2 lifecycle is already ONLINE with its delivery marker on retained data");
    }
    return;
  }

  let update = await initiate("Nexus v2 rejection qualification");
  if (update.publication?.state !== "PENDING_APPROVAL") throw new Error(`Nexus v2 did not enter approval: ${JSON.stringify(update)}`);
  await decidePublication(headers, update.publication.code, false, "Acceptance rejection proves Online v1 remains unchanged");
  let status = await requestJson(platformUrl, profilePath, { headers });
  if (status.publication?.state !== "REJECTED") throw new Error(`Nexus v2 was not rejected: ${JSON.stringify(status)}`);
  await assertMarker(false, "Rejected v2");

  update = await initiate("Governed Nexus v2 resubmission qualification");
  if (update.publication?.state !== "PENDING_APPROVAL") throw new Error(`Rejected Nexus v2 did not re-enter approval: ${JSON.stringify(update)}`);
  await decidePublication(headers, update.publication.code, true, "Approve immutable Nexus v2");
  status = await requestJson(platformUrl, profilePath, { headers });
  if (status.readiness !== "READY" || status.publication?.state !== "ONLINE" || !status.publication.previousOnlineVersion) {
    throw new Error(`Nexus v2 is not Online with captured v1: ${JSON.stringify(status)}`);
  }
  await assertMarker(true, "Approved v2");
  const replay = await initiate("Response-loss and idempotency replay qualification");
  if (replay.publication?.code !== status.publication.code || replay.publication?.state !== "ONLINE") {
    throw new Error(`Nexus v2 initiate replay was not idempotent: ${JSON.stringify(replay)}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const lifecycle = await requestJson(platformUrl, profilePath, { headers });
  if (lifecycle.publication?.state !== "ONLINE") {
    throw new Error(`Nexus v2 lifecycle diverged before retirement: ${JSON.stringify(lifecycle)}`);
  }

  const retired = await requestJson(platformUrl, `${profilePath}/retire`, { headers, method: "POST" });
  if (retired.readiness !== "RETIRED" || retired.publication?.state !== "WITHDRAWN") {
    throw new Error(`Nexus v2 retirement failed: ${JSON.stringify(retired)}`);
  }
  const retirementErrorWindow = managedProcesses.map((entry) => ({ entry, errorCount: entry.errors.length }));
  const unavailable = await requestJsonResponse(wcmsOnlineUrl, deliveryPath, { headers });
  if (unavailable.status !== 404) throw new Error(`Retired Nexus delivery remained visible: ${JSON.stringify(unavailable)}`);
  retirementErrorWindow.forEach(({ entry, errorCount }) => entry.errors.splice(errorCount));
  update = await initiate("Governed Nexus v2 recovery after retirement");
  await decidePublication(headers, update.publication.code, true, "Reapprove Nexus v2 after retirement");
  await assertMarker(true, "Recovered v2 after retirement");
  await waitOnline("Retirement recovery");

  const rolledBack = await requestJson(platformUrl, `${profilePath}/rollback`, { headers, method: "POST" });
  if (rolledBack.publication?.state !== "ROLLED_BACK") throw new Error(`Nexus v2 rollback failed: ${JSON.stringify(rolledBack)}`);
  await assertMarker(false, "Rolled back v1");
  update = await initiate("Governed Nexus v2 recovery after rollback");
  await decidePublication(headers, update.publication.code, true, "Reapprove Nexus v2 after rollback");
  await assertMarker(true, "Recovered v2 after rollback");
  status = await waitOnline("Rollback recovery");
  const lifecycleOperations = new Set([].concat(status.lineage?.target?.receipts || []).map((item) => item.operation));
  const lifecycleStates = new Set([].concat(status.lineage?.publication?.transitions || []).map((item) => item.toState));
  for (const operation of ["DEPLOY", "WITHDRAW", "ROLLBACK"]) {
    if (!lifecycleOperations.has(operation)) throw new Error(`Nexus v2 lineage lacks ${operation}: ${JSON.stringify(status.lineage)}`);
  }
  for (const state of ["REJECTED", "ONLINE", "WITHDRAWN", "ROLLED_BACK"]) {
    if (!lifecycleStates.has(state)) throw new Error(`Nexus v2 audit lineage lacks ${state}: ${JSON.stringify(status.lineage)}`);
  }
  if (!status.lineage?.actor || !status.lineage?.source?.releaseCode || !status.lineage?.publication?.workflowRef ||
      !status.lineage?.target?.manifest?.contentHash) {
    throw new Error(`Nexus v2 lineage is incomplete: ${JSON.stringify(status.lineage)}`);
  }
  log("Nexus v1 -> v2 rejection, publication, retry, rollback, retirement, and recovery are qualified");
}

/** Proves a later-loaded partner module can publish an independently owned Nexus customization. */
async function qualifyPartnerWebsiteCustomization(headers) {
  const profilePath = "/nodics/backoffice/v0/applications/partnernexus/initialization";
  const deliveryPath = "/nodics/cms/v0/delivery/pages/resolve?site=nexusCorporateSite&path=/&locale=en&channel=web";
  const marker = "partner-site-1.0.5";
  const assertMarker = async () => {
    let response;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      response = await requestJsonResponse(wcmsOnlineUrl, deliveryPath, { headers });
      if (response.status === 200 && JSON.stringify(response.body).includes(marker)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Partner website marker is not Online: ${JSON.stringify(response)}`);
  };

  let status = await requestJson(platformUrl, profilePath, { headers });
  if (status.readiness !== "READY") {
    const initiated = await requestJson(platformUrl, `${profilePath}/initiate`, {
      headers,
      method: "POST",
      body: JSON.stringify({ reason: "Qualify later-loaded partner website customization" }),
    });
    if (initiated.publication?.state !== "PENDING_APPROVAL") {
      throw new Error(`Partner website customization did not enter approval: ${JSON.stringify(initiated)}`);
    }
    await decidePublication(headers, initiated.publication.code, true,
      "Approve independently owned partner website customization");
    status = await requestJson(platformUrl, profilePath, { headers });
  }
  if (status.readiness !== "READY" || status.publication?.state !== "ONLINE" ||
      !status.publication.previousOnlineVersion) {
    throw new Error(`Partner website customization is not Online over a previous release: ${JSON.stringify(status)}`);
  }
  const lineage = status.lineage;
  const deliveredPartnerEvent = lineage?.target?.outbox?.find(
    (item) => item.operation === "DEPLOY" && item.status === "DELIVERED",
  );
  if (lineage?.actor !== loginId || lineage?.source?.releaseCode !== "partnerSiteData:partnerNexusCustomization" ||
      lineage?.source?.releaseVersion !== "1.0.5" || !lineage?.publication?.workflowRef ||
      lineage?.target?.manifest?.createdBy !== loginId ||
      !lineage?.target?.receipts?.some((item) => item.operation === "DEPLOY") ||
      !deliveredPartnerEvent || !deliveredPartnerEvent.operationKey ||
      !Number.isInteger(deliveredPartnerEvent.sequence) || deliveredPartnerEvent.attempts !== 1) {
    throw new Error(`Partner website correlation lineage is incomplete: ${JSON.stringify(lineage)}`);
  }
  await assertMarker();
  const replay = await requestJson(platformUrl, `${profilePath}/initiate`, {
    headers,
    method: "POST",
    body: JSON.stringify({ reason: "Partner website customization idempotency replay" }),
  });
  if (replay.readiness !== "READY" || replay.publication?.code !== status.publication.code) {
    throw new Error(`Partner website customization replay was not idempotent: ${JSON.stringify(replay)}`);
  }
  log("later-loaded partner website customization is READY without changing the original Nexus release authority");
}

/** Proves optional documentation packs are administered by Axis/Platform and published through the normal approval path. */
async function publishDocumentationBundles(headers) {
  const profiles = [
    { code: "frameworkdocs", site: "nodicsDocumentationSite", path: "/docs/framework" },
    { code: "axisdocs", site: "axisDocumentationSite", path: "/docs/nodics-axis" },
    { code: "kickoffdocs", site: "kickoffDocumentationSite", path: "/docs/nodics-kickoff" },
  ];
  for (const profile of profiles) {
    let status = await requestJson(platformUrl, `/nodics/backoffice/v0/applications/${profile.code}/initialization`, { headers });
    if (status.readiness !== "READY") {
      const initiated = await requestJson(platformUrl, `/nodics/backoffice/v0/applications/${profile.code}/initialization/initiate`, {
        headers, method: "POST", body: JSON.stringify({ reason: "Optional Axis documentation publication qualification" }),
      });
      const publicationCode = initiated.publication?.code;
      if (!publicationCode || initiated.publication?.state !== "PENDING_APPROVAL") {
        throw new Error(`${profile.code} did not enter approval: ${JSON.stringify(initiated)}`);
      }
      const instances = await requestJson(processUrl, "/nodics/process/v0/instances?limit=100", { headers });
      const instance = [].concat(instances.items || instances || []).find(
        (item) => item.definitionCode === "cmsPublicationApproval" && item.context?.publicationCode === publicationCode && item.status === "WAITING",
      );
      if (!instance) throw new Error(`${profile.code} workflow instance is unavailable for ${publicationCode}`);
      const tasks = await requestJson(processUrl, `/nodics/process/v0/tasks?instanceCode=${encodeURIComponent(instance.code)}&limit=20`, { headers });
      const task = [].concat(tasks.items || tasks || []).find(
        (item) => item.instanceCode === instance.code && item.nodeCode === "publicationReview" && ["OPEN", "CLAIMED"].includes(item.status),
      );
      if (!task) throw new Error(`${profile.code} approval task is unavailable for ${instance.code}`);
      if (task.status === "OPEN") {
        await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, { headers, method: "POST" });
      }
      await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/complete`, {
        headers, method: "POST",
        body: JSON.stringify({ decision: { approved: true, action: "APPROVE", reason: "Optional Axis documentation publication qualification" } }),
      });
      status = await requestJson(platformUrl, `/nodics/backoffice/v0/applications/${profile.code}/initialization`, { headers });
    }
    if (status.readiness !== "READY" || status.publication?.state !== "ONLINE") {
      throw new Error(`${profile.code} is not READY Online: ${JSON.stringify(status)}`);
    }
    const delivered = await requestJson(wcmsOnlineUrl,
      `/nodics/cms/v0/delivery/pages/resolve?site=${encodeURIComponent(profile.site)}&path=${encodeURIComponent(profile.path)}&locale=en&channel=web`,
      { headers });
    if (!delivered?.page) throw new Error(`${profile.code} Online delivery failed: ${JSON.stringify(delivered)}`);
  }
  log("optional documentation bundles are READY through Axis/Platform, Staged, Process, and Online delivery");
}

/** Proves that updated framework and Axis documentation can roll back to their prior Online versions and recover. */
async function qualifyDocumentationReleaseRollback(headers) {
  if (!qualifyDocumentationRollback) return;
  for (const profileCode of ["frameworkdocs", "axisdocs"]) {
    const rolledBack = await requestJson(
      platformUrl,
      `/nodics/backoffice/v0/applications/${profileCode}/initialization/rollback`,
      {
        headers,
        method: "POST",
        body: JSON.stringify({ reason: "Docker Local documentation release rollback qualification" }),
      },
    );
    const previousOnlineVersion = rolledBack.lineage?.target?.receipts?.find(
      (receipt) => receipt.operation === "DEPLOY",
    )?.previousOnlineVersion;
    if (rolledBack.readiness !== "ROLLED_BACK" || rolledBack.publication?.state !== "ROLLED_BACK" || !previousOnlineVersion) {
      throw new Error(`${profileCode} rollback evidence is incomplete: ${JSON.stringify(rolledBack)}`);
    }
  }
  await publishDocumentationBundles(headers);
  log("framework and Axis documentation rollback to prior Online versions and governed recovery passed");
}

/** Proves export is Staged-only, bounded, traceable, and non-authoritative for import or publication. */
async function verifyGovernedImportExportBoundary(headers) {
  const exported = await requestJson(wcmsUrl, "/nodics/export/v0/export", {
    headers,
    method: "POST",
    body: JSON.stringify({ moduleName: "cms", schemaName: "cmsSite", format: "csv" }),
  });
  if (
    !exported.media?.code ||
    exported.provenance?.contractType !== "NODICS_SCHEMA_EXPORT" ||
    exported.provenance?.importAuthorization !== false ||
    exported.provenance?.publicationAuthorization !== false ||
    exported.provenance?.onlineWriteAuthorization !== false ||
    !/^[a-f0-9]{64}$/.test(exported.provenance?.checksum || "")
  ) {
    throw new Error(`WCMS Staged export lacks governed provenance: ${JSON.stringify(exported)}`);
  }
  const roundTrip = await requestJson(wcmsUrl, "/nodics/import/v0/media", {
    headers,
    method: "POST",
    body: JSON.stringify({
      mediaCode: exported.media.code,
      moduleName: "cms",
      schemaName: "cmsSite",
      operation: "saveAll",
      options: { validateOnly: true },
    }),
  });
  if (roundTrip.validationOnly !== true && roundTrip.validateOnly !== true) {
    throw new Error(`Export-to-import validation did not remain non-mutating: ${JSON.stringify(roundTrip)}`);
  }
  const expectedErrorWindow = managedProcesses.map((entry) => ({
    entry,
    errorCount: entry.errors.length,
  }));
  const online = await requestJsonResponse(wcmsOnlineUrl, "/nodics/export/v0/export", {
    headers,
    method: "POST",
    body: JSON.stringify({ moduleName: "cms", schemaName: "cmsSite", format: "json" }),
  });
  if (online.status !== 403 || online.body?.code !== "ERR_AUTH_00003") {
    throw new Error(`WCMS Online export did not fail closed: ${JSON.stringify(online)}`);
  }
  const process = await requestJsonResponse(processUrl, "/nodics/export/v0/export", {
    headers,
    method: "POST",
    body: JSON.stringify({ moduleName: "workflow", schemaName: "processDefinition", format: "json" }),
  });
  if (process.status !== 403 || process.body?.code !== "ERR_AUTH_00003") {
    throw new Error(`Process export did not fail closed without governed media: ${JSON.stringify(process)}`);
  }
  const crossEnterprise = await requestJsonResponse(wcmsUrl, "/nodics/export/v0/export", {
    headers,
    method: "POST",
    body: JSON.stringify({ enterpriseCode: "anotherEnterprise", moduleName: "cms", schemaName: "cmsSite", format: "json" }),
  });
  if (crossEnterprise.status !== 400 || crossEnterprise.body?.code !== "ERR_EXP_00001") {
    throw new Error(`Cross-enterprise export did not fail closed: ${JSON.stringify(crossEnterprise)}`);
  }
  expectedErrorWindow.forEach(({ entry, errorCount }) => {
    entry.errors.splice(errorCount);
  });
  log("governed Staged export and Online/Process/cross-enterprise rejection gates passed");
}

async function verifyWcmsDesignerAuthoringAvailability(headers) {
  const model = await requestJson(
    wcmsUrl,
    "/nodics/cms/v0/designer/composition/model",
    { headers },
  );
  const hierarchy = Array.isArray(model.hierarchy) ? model.hierarchy : [];
  const operations = Array.isArray(model.operations) ? model.operations : [];
  if (
    model?.rules?.catalogFirst !== true ||
    model?.rules?.arbitrarySlots !== true ||
    model?.rules?.frontendPersistence !== false ||
    hierarchy[0] !== "Content Catalog" ||
    !operations.includes("saveDraftComposition")
  ) {
    throw new Error(
      `WCMS Designer authoring model is not available to the reference runtime: ${JSON.stringify(model)}`,
    );
  }
  log("Reference runtime can observe the WCMS-owned Designer authoring model");
}


async function runAxisSmoke() {
  if (!existsSync(resolve(axisRoot, "package.json"))) {
    throw new Error(`Axis repository not found at ${axisRoot}`);
  }
  log("running Axis smoke with documentation and Process-composed cronjob lifecycle gates");
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("npm", ["run", "smoke:live"], {
      cwd: axisRoot,
      env: {
        ...process.env,
        AXIS_EXPECT_MODULES: "1",
        AXIS_EXPECT_DOCUMENTATION: "1",
        AXIS_CRON_LIFECYCLE: "1",
        AXIS_PROCESS_LIFECYCLE: "1",
        AXIS_URL: axisUrl,
        AXIS_PLATFORM_URL: platformUrl,
        AXIS_PROCESS_URL: processUrl,
        AXIS_WCMS_URL: wcmsUrl,
        AXIS_ENTERPRISE: enterpriseCode,
        AXIS_PROJECT: projectCode,
        AXIS_LOGIN_ID: loginId,
        AXIS_PASSWORD: password,
      },
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else
        rejectPromise(new Error(`Axis smoke failed with code ${String(code)}`));
    });
  });
}

async function main() {
  log(`workspace ${workspaceRoot}`);
  log(`run ${stableId(String(Date.now()))}`);
  await assertFreshResetPortsAvailable();
  await assertGovernedFreshResetAvailable();
  await ensureProcess(
    "Platform",
    urlPort(platformUrl),
    projectRoot,
    "start:platform",
    platformUrl,
    "/nodics/system/v0/health/ready",
  );
  await ensureProcess(
    "WCMS Staged",
    urlPort(wcmsUrl),
    projectRoot,
    "start:wcms:staged",
    wcmsUrl,
    "/nodics/system/v0/health/ready",
  );
  await ensureProcess(
    "WCMS Online",
    urlPort(wcmsOnlineUrl),
    projectRoot,
    "start:wcms:online",
    wcmsOnlineUrl,
    "/nodics/system/v0/health/ready",
  );
  await ensureProcess(
    "Process and Automation",
    urlPort(processUrl),
    projectRoot,
    "start:process",
    processUrl,
    "/nodics/system/v0/health/ready",
  );
  await verifyLocalRouteSecurityMatrix();
  if (dropLocalDb) {
    const resetHeaders = await authenticate();
    await executeGovernedFreshReset(resetHeaders);
    await ensureProcess("Platform", 4300, projectRoot, "start:platform", platformUrl, "/nodics/system/v0/health/ready");
    await ensureProcess("WCMS Staged", 4312, projectRoot, "start:wcms:staged", wcmsUrl, "/nodics/system/v0/health/ready");
    await ensureProcess("WCMS Online", 4314, projectRoot, "start:wcms:online", wcmsOnlineUrl, "/nodics/system/v0/health/ready");
    await ensureProcess("Process and Automation", 4330, projectRoot, "start:process", processUrl, "/nodics/system/v0/health/ready");
    await verifyLocalRouteSecurityMatrix();
  }
  await waitForHttp(
    platformUrl,
    "/nodics/backoffice/v0/bootstrap/public",
    "BackOffice public bootstrap",
  );
  if (!managedStartupEnabled) {
    await waitForHttp(axisUrl, "/", "Axis");
  } else if (!(await portListening(urlPort(axisUrl)))) {
    if (!existsSync(resolve(axisRoot, "package.json"))) {
      throw new Error(`Axis repository not found at ${axisRoot}`);
    }
    startProcess("Axis", axisRoot, "npm", ["run", "dev"], urlPort(axisUrl));
  }
  await waitForHttp(axisUrl, "/", "Axis");
  const headers = await authenticate();
  await importMandatoryProcessRelease(headers);
  const registry = await loadRegistry(headers);
  requireModule(registry.registered, "nodics.foundation", "registered modules");
  requireModule(registry.registered, "nodics.platform", "registered modules");
  requireModule(registry.registered, "nodics.wcms", "registered modules");
  requireModule(
    [...registry.registered, ...registry.available],
    "nodics.process",
    "observed modules",
  );
  await verifyDocumentationInitiallyNotInstalled(headers);
  await importContentPacks(headers);
  await verifyDocumentationNotOnlineBeforePublication();
  await importNexusStagedRelease(headers);
  await verifyGovernedImportExportBoundary(headers);
  await publishAxisBaseline(headers);
  await publishNexusApplicationBundle(headers);
  await qualifyNexusApplicationUpdate(headers);
  await qualifyPartnerWebsiteCustomization(headers);
  log("documentation publication skipped: oversized documentation bundles remain Staged until chunked/page-level publication is implemented");
  await qualifyDocumentationReleaseRollback(headers);
  await verifyPublicationOperations(headers);
  await verifyWcmsDesignerAuthoringAvailability(headers);
  for (const route of [
    "/",
    "/docs",
    "/docs/framework",
    "/docs/nodics-axis",
    "/docs/nodics-kickoff",
    "/content",
    "/content/designer",
    "/media",
    "/process",
    "/process/definitions",
    "/process/tasks",
    "/process/triggers",
    "/process/designer",
    "/cron",
    "/system-integrations",
    "/registry",
    "/operations/imports-exports",
    "/docs/framework/process",
    "/docs/framework/process/visual-designer",
    "/docs/swaggers",
  ]) {
    await expectHttpOk(axisUrl, route);
    log(`Axis route ${route} returned HTTP 200`);
  }
  await runAxisSmoke();
  const noisy = managedProcesses.flatMap((entry) =>
    entry.errors.map((message) => `${entry.label}: ${message}`),
  );
  if (noisy.length > 0) {
    throw new Error(`Startup emitted error-level output:\n${noisy.join("\n")}`);
  }
  log("API-only retained-data local bootstrap acceptance completed successfully");
}

main()
  .catch((error) => {
    console.error(`[acceptance] FAIL ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (!leaveStarted) {
      await stopManagedProcesses();
    }
  });
