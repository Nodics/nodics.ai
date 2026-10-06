/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/acceptance/defaultApplicationBootstrapAcceptanceService @description Cross-capability application administration acceptance through owning APIs. @owner backoffice @layer tooling */
import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { completeAcceptanceWorkflow, parseAcceptanceResponse, stopAcceptanceChildren } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { readProjectEnvironmentConfiguration, projectRuntimeAcceptance, projectRuntime, projectEndpointUrl, projectCorsOrigin } from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';
import localRuntimeCredentialService from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectLocalRuntimeCredentialService.js';
import configurationProbe from '../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectConfigurationProbeService.js';
import { runRuntimeDeploymentGrantAcceptance } from '../../../../profile/src/service/acceptance/defaultRuntimeDeploymentGrantAcceptanceService.mjs';

/** Validates customer selections before credentials, runtime startup or API mutation. */
export function validateBootstrapSelection(selection = {}) {
  if (!selection.platformInitializationProfile || !selection.publicOriginKey)
    throw new Error('Select a Platform initialization profile and public origin');
  for (const key of ['applicationBundles', 'applicationUpdates']) {
    if (selection[key] !== undefined && !Array.isArray(selection[key])) throw new Error(key + ' must be an array');
    for (const fixture of selection[key] || []) {
      if (!fixture?.profileCode || !fixture.deliveryProbe?.site || !fixture.deliveryProbe?.path ||
          (key === 'applicationUpdates' && (typeof fixture.marker !== 'string' || !fixture.marker.trim())))
        throw new Error('Incomplete ' + key + ' fixture');
    }
  }
  return selection;
}

/** Full local administration qualification. Mutation, publication, owned startup and reset are independent explicit intents. */
export async function runApplicationBootstrapAcceptance({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  configuration, acceptanceConfiguration, configurationProjection, execute = false, approvePublications = false,
  startRuntimes = false, resetLocal = false, leaveStarted = false,
  expectDocumentationNotInstalled = false, qualifyDocumentationRollback = false,
  fetch: fetchRequest = globalThis.fetch,
} = {}) {
  if (execute !== true || approvePublications !== true) throw new Error('Explicit --execute --approve-publications is required');
  if (resetLocal && !startRuntimes) throw new Error('Fresh reset requires explicit --start-runtimes and exclusive owned runtime startup');
  const fetch = (url, options = {}) => fetchRequest(url, { ...options, signal: AbortSignal.timeout(30000) });
  const applicationDeliveryPath = fixture => {
    if (!fixture?.site || !fixture.path) throw new Error('Select an application delivery fixture');
    return '/nodics/cms/v0/delivery/pages/resolve?' + new URLSearchParams({ site: fixture.site, path: fixture.path, locale: fixture.locale || 'en', channel: fixture.channel || 'web' });
  };
  const execFileAsync = promisify(execFile);
  const workspaceRoot = resolve(projectRoot, "..");

  const environmentProfile = configuration || readProjectEnvironmentConfiguration(projectRoot, environment.ENV || environment.NODICS_ACCEPTANCE_RUNTIME || '');
  const acceptance = acceptanceConfiguration || projectRuntimeAcceptance(projectRoot, environmentProfile, { role: "PLATFORM" });
  const selection = validateBootstrapSelection(acceptance.localBootstrap);
  const platformRuntime = projectRuntime(environmentProfile, { role: "PLATFORM" });
  const effective = configurationProjection || configurationProbe.read({ projectRoot, environment: environmentProfile.environment, server: platformRuntime.server, inheritEnvironment: true }).properties;
  if (effective.environment?.class !== "LOCAL") throw new Error("Local bootstrap acceptance requires the LOCAL environment class");
  const platformUrl = environment.AXIS_PLATFORM_URL || projectEndpointUrl(environmentProfile, { role: 'PLATFORM' });
  const wcmsUrl = environment.AXIS_WCMS_URL || projectEndpointUrl(environmentProfile, { role: 'WCMS_STAGED' });
  const wcmsOnlineUrl = environment.NEXUS_CMS_URL || projectEndpointUrl(environmentProfile, { role: 'WCMS_ONLINE' });
  const processUrl = environment.AXIS_PROCESS_URL || projectEndpointUrl(environmentProfile, { role: 'PROCESS' });
  const locationUrl = selection.locationInitializationProfile || selection.verifyDefaultLocationMap
    ? environment.AXIS_LOCATION_URL || projectEndpointUrl(environmentProfile, { role: 'LOCATION' }) : undefined;
  const operatorOrigin = environment.NODICS_ACCEPTANCE_ORIGIN || projectCorsOrigin(environmentProfile, 'axis');
  const enterpriseCode = environment.AXIS_ENTERPRISE || "default";
  const loginId = environment.AXIS_LOGIN_ID || "admin";
  const runtimeMode = environmentProfile.environment;
  const password = localBootstrapAdminPassword();
  const clientContractVersion = environment.AXIS_CLIENT_CONTRACT_VERSION || "1";
  const packageDescriptor = readProjectPackageDescriptor();
  const projectCode = environment.AXIS_PROJECT || resolveProjectCode(packageDescriptor);
  const managedStartupEnabled = startRuntimes;
  const publicOrigin = environment.NODICS_ACCEPTANCE_PUBLIC_ORIGIN || projectCorsOrigin(environmentProfile, selection.publicOriginKey);
  const urlPort = (value) => Number(new URL(value).port || (new URL(value).protocol === "https:" ? 443 : 80));
  const dropLocalDb = resetLocal;
  let captureRuntimeErrorOutput = true;

  function localBootstrapAdminPassword() {
    const selectedEnvironment = environmentProfile.environment || runtimeMode;
    const credentials = startRuntimes ? localRuntimeCredentialService.ensureCredentials(projectRoot, selectedEnvironment) : {};
    return environment.AXIS_PASSWORD ||
      environment.NODICS_BOOTSTRAP_ADMIN_PASSWORD ||
      credentials.NODICS_BOOTSTRAP_ADMIN_PASSWORD;
  }

  function defaultLocalBootstrapCapabilities() {
    const selection = acceptance.localBootstrap || {};
    if (!Array.isArray(selection.documentationPackCodes) || !selection.documentationPackCodes.length)
      throw new Error("Select documentation pack codes for local bootstrap acceptance");
    return {
      documentationPacks: selection.documentationPackCodes.map(code => {
        const pack = selection.documentationPacks?.[code];
        if (!pack || pack.code !== code) throw new Error("Documentation acceptance descriptor is unavailable: " + code);
        return pack;
      }),
      contentPacks: [],
    };
  }

  function readProjectPackageDescriptor() {
    const packagePath = resolve(projectRoot, "package.json");
    if (!existsSync(packagePath)) throw new Error(`Missing package.json in project root: ${projectRoot}`);
    return JSON.parse(readFileSync(packagePath, "utf8"));
  }

  function resolveProjectCode(packageDescriptor) {
    const packageName = packageDescriptor.name;
    if (!packageName || !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(packageName)) {
      throw new Error("package.json requires a stable Nodics project name");
    }
    return packageName;
  }

  function validateLocalBootstrapCapabilities(capabilities) {
    const errors = [];
    const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
    const requireString = (value, pathName) => {
      if (typeof value !== "string" || !value.trim()) {
        errors.push(`${pathName} must be a non-empty string.`);
      }
    };
    if (!isObject(capabilities)) {
      return ["acceptance.localBootstrap must be an object."];
    }
    if (!Array.isArray(capabilities.documentationPacks)) {
      errors.push("acceptance.localBootstrap.documentationPacks must be an array.");
    } else {
      capabilities.documentationPacks.forEach((pack, index) => {
        const base = `acceptance.localBootstrap.documentationPacks[${index}]`;
        if (!isObject(pack)) {
          errors.push(`${base} must be an object.`);
          return;
        }
        requireString(pack.code, `${base}.code`);
        requireString(pack.profileCode, `${base}.profileCode`);
        requireString(pack.navigationComponent, `${base}.navigationComponent`);
        requireString(pack.site, `${base}.site`);
        requireString(pack.path, `${base}.path`);
        if (typeof pack.path === "string" && !pack.path.startsWith("/")) {
          errors.push(`${base}.path must start with /.`);
        }
        if (!Number.isInteger(pack.minimumRoutes) || pack.minimumRoutes < 0) {
          errors.push(`${base}.minimumRoutes must be a non-negative integer.`);
        }
      });
    }
    if (!Array.isArray(capabilities.contentPacks)) {
      errors.push("acceptance.localBootstrap.contentPacks must be an array.");
    }
    return errors;
  }

  function assertValidLocalBootstrapCapabilities(capabilities) {
    const errors = validateLocalBootstrapCapabilities(capabilities);
    if (errors.length) {
      throw new Error(`Invalid local bootstrap capabilities:\n- ${errors.join("\n- ")}`);
    }
  }

  function loadLocalBootstrapCapabilities() {
    const fallback = defaultLocalBootstrapCapabilities();
    assertValidLocalBootstrapCapabilities(fallback);
    return {
      documentationPacks: fallback.documentationPacks,
      contentPacks: fallback.contentPacks,
    };
  }

  const localBootstrapCapabilities = loadLocalBootstrapCapabilities();
  const documentationPacks = localBootstrapCapabilities.documentationPacks;
  const contentPacks = [...documentationPacks, ...localBootstrapCapabilities.contentPacks];
  const localPorts = environmentProfile.topology.groups.backends.filter(runtime => runtime.enabled !== false)
    .map(runtime => ({ label: runtime.label || runtime.code, port: urlPort(projectEndpointUrl(environmentProfile, { server: runtime.server })) }));
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

  function isExpectedNegativeGateLog(text) {
    return [
      "Access denied: API category is disabled for this runtime: dataExport",
      "Data export request is invalid or required export dependencies are unavailable: Cross-enterprise export is not permitted",
      "Media content is unavailable: Media content is missing or ambiguous",
    ].some((expected) => text.includes(expected));
  }

  function isExpectedFreshResetTransientLog(text) {
    return dropLocalDb &&
      text.includes("Invalid or expired authorization token") &&
      text.includes("token security stamp is stale");
  }

  function isExpectedAcceptanceLog(text) {
    return isExpectedNegativeGateLog(text) || isExpectedFreshResetTransientLog(text);
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
    return parseAcceptanceResponse(response, {
      route: path,
      errorLimit: 500,
      malformed: (response, text) => `${path} returned non-JSON response: ${text.slice(0, 200)}`,
      unwrap: body => body?.result || body?.data || body,
    });
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

  function isStaleAuthBody(body) {
    return body?.code === "ERR_AUTH_00001" ||
      String(body?.message || "").includes("token security stamp is stale") ||
      [].concat(body?.errors || []).some((error) =>
        String(error?.code || "") === "ERR_AUTH_00001" ||
        String(error?.message || "").includes("token security stamp is stale"),
      );
  }

  async function requestPublicDeliveryJson(path) {
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await requestJsonResponse(wcmsOnlineUrl, path);
      if (response.status < 500 || !isStaleAuthBody(response.body)) break;
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`${path} returned HTTP ${String(response.status)}: ${JSON.stringify(response.body).slice(0, 500)}`);
    }
    return response.body;
  }

  /** Proves bounded operator diagnostics and dry-run reconciliation through nPublish APIs only. */
  async function verifyPublicationOperations(headers) {
    const diagnostics = await requestJson(wcmsUrl, "/nodics/publish/v0/publications/operations/diagnostics", { headers });
    if (!diagnostics?.metrics || !["READY", "DEGRADED"].includes(diagnostics.readiness)) {
      throw new Error(`Publication diagnostics are invalid: ${JSON.stringify(diagnostics)}`);
    }
    const dryRun = await requestJson(wcmsUrl, "/nodics/publish/v0/publications/operations/reconcile", {
      headers,
      method: "POST",
      body: JSON.stringify({ repairEvidence: false }),
    });
    if (!dryRun?.projection || !Array.isArray(dryRun.target)) {
      throw new Error(`Publication dry-run reconciliation is invalid: ${JSON.stringify(dryRun)}`);
    }
    const repairNeeded = dryRun.target.some((entry) =>
      ["FAILED", "EVIDENCE_GAP"].includes(entry.result?.status) ||
      entry.result?.missingReceipt === true ||
      entry.result?.missingOutbox === true,
    );
    if (!repairNeeded) {
      log(`publication diagnostics and dry-run reconciliation passed for ${String(dryRun.target.length)} target releases`);
      return;
    }
    const repaired = await requestJson(wcmsUrl, "/nodics/publish/v0/publications/operations/reconcile", {
      headers,
      method: "POST",
      body: JSON.stringify({ repairEvidence: true }),
    });
    if (!repaired?.projection || !Array.isArray(repaired.target) ||
        repaired.target.some((entry) => entry.result?.status === "FAILED")) {
      throw new Error(`Publication repair reconciliation is invalid: ${JSON.stringify(repaired)}`);
    }
    log(`publication diagnostics, dry-run, and governed evidence repair passed for ${String(repaired.target.length)} target releases`);
  }

  async function expectHttpOk(baseUrl, path) {
    const response = await fetch(endpoint(baseUrl, path), {
      headers: {
        "x-enterprise-code": enterpriseCode,
        "x-nodics-client-contract-version": clientContractVersion,
      },
    });
    if (!response.ok) {
      throw new Error(
        `${endpoint(baseUrl, path)} returned HTTP ${String(response.status)}`,
      );
    }
  }

  /** Proves the Local browser/runtime security matrix through HTTP without database access. */
  async function verifyLocalRouteSecurityMatrix() {
    const applicationOrigin = new URL(publicOrigin).origin;
    const axisOrigin = new URL(operatorOrigin).origin;
    const probe = (baseUrl, path, origin, options = {}) => fetch(endpoint(baseUrl, path), {
      redirect: "manual",
      ...options,
      headers: {
        Origin: origin,
        "x-nodics-client-contract-version": clientContractVersion,
        ...(options.headers || {}),
      },
    });
    const platformBootstrap = await probe(platformUrl, "/nodics/backoffice/v0/bootstrap/public", applicationOrigin);
    if (platformBootstrap.status !== 200 || platformBootstrap.headers.get("access-control-allow-origin") !== applicationOrigin) {
      throw new Error("The application must reach only the Platform low-disclosure public bootstrap boundary");
    }
    for (const [label, baseUrl] of [["WCMS Staged", wcmsUrl], ["Process", processUrl]]) {
      const denied = await probe(baseUrl, "/nodics/system/v0/health/ready", applicationOrigin);
      if (denied.status !== 403 || denied.headers.get("access-control-allow-origin")) {
        throw new Error(`${label} did not reject the application browser origin`);
      }
    }
    const axisStaged = await probe(wcmsUrl, "/nodics/system/v0/health/ready", axisOrigin);
    if (axisStaged.status !== 200 || axisStaged.headers.get("access-control-allow-origin") !== axisOrigin) {
      throw new Error("WCMS Staged did not accept the Axis browser origin");
    }
    const onlinePreflight = await probe(wcmsOnlineUrl, "/nodics/cms/v0/delivery/pages/resolve", applicationOrigin, {
      method: "OPTIONS", headers: { "Access-Control-Request-Method": "GET" },
    });
    if (onlinePreflight.status !== 204 || onlinePreflight.headers.get("access-control-allow-origin") !== applicationOrigin) {
      throw new Error("WCMS Online did not accept the application delivery preflight");
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


  /** Sends a signal to every supplied process identifier, ignoring already-exited processes. */


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
          "Stop the selected backend runtimes before running acceptance:local:fresh,",
          "or run npm run acceptance:local for a non-destructive verification against the current stack.",
        ].join(" "),
      );
    }
  }

  function startProcess(label, cwd, command, args, readyPort) {
    log(`starting ${label}`);
    const child = spawn(command, args, {
      cwd,
      env: environment,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.exitPromise = new Promise(resolve => child.once("close", resolve));
    child.launchFailure = new Promise((resolve, reject) => child.once('error', reject));
    const errors = [];
    const entry = { child, errors, label, readyPort, active: true };
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      process.stdout.write(`[${label}] ${text}`);
      if (entry.active && captureRuntimeErrorOutput && isErrorLevelLog(text)) errors.push(text.trim());
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      process.stderr.write(`[${label}] ${text}`);
      if (entry.active && captureRuntimeErrorOutput && isErrorLevelLog(text)) errors.push(text.trim());
    });
    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`[${label}] exited with code ${String(code)}`);
      }
    });
    managedProcesses.push(entry);
    return child;
  }

  async function ensureProcess(label, port, cwd, scriptName, baseUrl, readyPath) {
    if (!managedStartupEnabled || await portListening(port)) return waitForHttp(baseUrl, readyPath, label);
    const runtime = environmentProfile.topology.groups.backends.find(item => item.enabled !== false && item.port === port);
    if (!runtime?.script) throw new Error('Select a declared runtime startup command for ' + label);
    const child = startProcess(label, projectRoot, 'npm', ['run', runtime.script], port);
    await Promise.race([child.launchFailure, waitForHttp(baseUrl, readyPath, label)]);
  }

  async function reconcileRuntimeDeploymentGrants() {
    await runRuntimeDeploymentGrantAcceptance({ projectRoot, environment: { ...environment, NODICS_BOOTSTRAP_ADMIN_PASSWORD: password }, configuration: environmentProfile, fetch });
  }

  async function runProjectAcceptance(scriptName, env = {}, args = []) {
    log(`running ${scriptName}`);
    await execFileAsync("npm", ["run", scriptName, ...args], {
      cwd: projectRoot,
      env: { ...environment, ...env },
      timeout: 600000,
      maxBuffer: 1024 * 1024 * 20,
    });
  }

  async function runSelectedApplicationJourneys() {
    for (const step of selection.journeyCommands || []) {
      if (typeof step.command !== 'string' || !Array.isArray(step.args)) throw new Error('Select explicit application journey commands and arguments');
      await runProjectAcceptance(step.command, {}, step.args.length ? ['--', ...step.args] : []);
    }
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

  function resolveExpectedResetProviderCount(status) {
    const count = Number(status && status.providerCount);
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error(`governed Local reset did not expose a valid provider count: ${JSON.stringify(status)}`);
    }
    return count;
  }

  async function stopManagedProcesses() {
    for (const entry of managedProcesses) entry.active = false;
    await stopAcceptanceChildren(managedProcesses.map(entry => entry.child), { timeoutMs: 5000 });
  }

  async function executeGovernedFreshReset(headers) {
    if (!dropLocalDb) return false;
    const status = await requestJson(platformUrl, "/nodics/backoffice/v0/operations/local-reset", { headers });
    if (status.ready !== true || status.apiOnly !== true) {
      throw new Error(`governed Local reset is not ready: ${JSON.stringify(status)}`);
    }
    const expectedProviderCount = resolveExpectedResetProviderCount(status);
    const result = await requestJson(platformUrl, "/nodics/backoffice/v0/operations/local-reset", {
      headers,
      method: "POST",
      body: JSON.stringify({ confirmation: "RESET_LOCAL_NODICS_DATA", reason: "fresh local publishing acceptance verification" }),
    });
    if (result.acknowledged !== true || result.providerCount !== expectedProviderCount) {
      throw new Error(`governed Local reset was not fully acknowledged: ${JSON.stringify(result)}`);
    }
    log(`all ${String(result.providerCount)} runtime owners acknowledged API-only Local reset`);
    await stopManagedProcesses();
    return true;
  }

  async function authenticate() {
    const suppliedToken = environment.AXIS_AUTH_TOKEN || environment.NODICS_AUTH_TOKEN;
    if (suppliedToken) return { Authorization: 'Bearer ' + suppliedToken };
    if (!password) throw new Error('Supply an employee bearer/password or explicitly start governed Local runtimes');
    const auth = await requestJson(
      platformUrl,
      "/nodics/profile/v0/employee/browser/authenticate",
      {
        method: "POST",
        body: JSON.stringify({ loginId, password }),
        headers: { Origin: operatorOrigin },
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

  async function startSplitRuntimes() {
    for (const runtime of environmentProfile.topology.groups.backends.filter(item => item.enabled !== false && item.role !== 'PLATFORM')) {
      const url = projectEndpointUrl(environmentProfile, { server: runtime.server });
      await ensureProcess(runtime.label, urlPort(url), projectRoot, runtime.script, url, '/nodics/system/v0/health/ready');
    }
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

  async function ensureFunctionalModuleActive(headers, functionalModule, reason) {
    const encodedModule = encodeURIComponent(functionalModule);
    let current = await requestJson(
      platformUrl,
      `/nodics/backoffice/v0/runtime/modules/registrations/${encodedModule}?project=${encodeURIComponent(projectCode)}`,
      { headers },
    );
    if (current.registrationState !== "REGISTERED") {
      current = await requestJson(
        platformUrl,
        `/nodics/backoffice/v0/runtime/modules/registrations/${encodedModule}/register`,
        {
          headers,
          method: "POST",
          body: JSON.stringify({
            project: projectCode,
            expectedRevision: current.catalogueRevision,
            reason,
          }),
        },
      );
    }
    if (current.enabled !== true) {
      current = await requestJson(
        platformUrl,
        `/nodics/backoffice/v0/runtime/modules/registrations/${encodedModule}/activate`,
        {
          headers,
          method: "POST",
          body: JSON.stringify({
            project: projectCode,
            expectedRevision: current.catalogueRevision,
            reason,
          }),
        },
      );
    }
    if (current.registrationState !== "REGISTERED" || current.enabled !== true) {
      throw new Error(`${functionalModule} did not become active: ${JSON.stringify(current)}`);
    }
    log(`${functionalModule} is registered and active for ${projectCode}`);
    return current;
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
        { method: "POST", headers: { Origin: publicOrigin } },
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
    for (const profile of documentationPacks) {
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

  function listFromResponse(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.data)) return value.data;
    return [];
  }

  async function ensureInitializationProfileCurrent(headers, baseUrl, profileCode, label) {
    const profiles = listFromResponse(await requestJson(baseUrl, "/nodics/import/v0/initialization-profiles", { headers }));
    const profile = profiles.find((item) => item.profileCode === profileCode);
    if (!profile) {
      throw new Error(`${label} initialization profile is unavailable: ${profileCode}`);
    }
    if (profile.status !== "CURRENT") {
      const validation = await requestJson(baseUrl, `/nodics/import/v0/initialization-profiles/${encodeURIComponent(profileCode)}/validate`, {
        headers,
        method: "POST",
        body: "{}",
      });
      if (validation.mode !== "VALIDATE") {
        throw new Error(`${label} initialization validation did not use validation-only mode: ${JSON.stringify(validation)}`);
      }
      const installation = await requestJson(baseUrl, `/nodics/import/v0/initialization-profiles/${encodeURIComponent(profileCode)}/install`, {
        headers,
        method: "POST",
        body: "{}",
      });
      if (installation.mode !== "INSTALL" || installation.profile?.status !== "CURRENT") {
        throw new Error(`${label} initialization did not become CURRENT: ${JSON.stringify(installation)}`);
      }
      if (![].concat(installation.profile.steps || []).flatMap((item) => item.releases || []).every((item) => item.status === "CURRENT")) {
        throw new Error(`${label} initialization has non-current releases: ${JSON.stringify(installation.profile)}`);
      }
    }
    const current = profiles.find((item) => item.profileCode === profileCode)?.status === "CURRENT" ?
      profile :
      await requestJson(baseUrl, `/nodics/import/v0/initialization-profiles/${encodeURIComponent(profileCode)}`, { headers });
    if (current.status !== "CURRENT") {
      throw new Error(`${label} initialization state did not persist: ${JSON.stringify(current)}`);
    }
    log(`${label} initialization profile ${profileCode} is CURRENT`);
  }

  async function verifyLocationMapDefaults(headers) {
    const effective = await requestJson(
      locationUrl,
      "/nodics/locationMap/v0/location/maps/configurations/effective?surfaceCode=AXIS&usageCode=COLLECTION_CENTRE_MAP",
      { headers },
    );
    const configured = effective.setupStatus === "ACTIVE" &&
      effective.configured === true && String(effective.publicAccessToken || "").startsWith("pk.");
    const fallbackReady = effective.setupStatus === "SETUP_REQUIRED" &&
      effective.configured === false && effective.fallbackAllowed === true &&
      effective.fallbackRenderer?.providerCode === "OSM" &&
      effective.fallbackRenderer?.rendererType === "XYZ_TILE" &&
      String(effective.fallbackRenderer?.tileUrlTemplate || "").startsWith("https://");
    if (
      effective.providerCode !== "MAPBOX" ||
      (!configured && !fallbackReady) ||
      effective.fallbackProviderCode !== "OSM" ||
      effective.fallbackPolicy !== "ALLOW_BASIC_MAP" ||
      !String(effective.styleUrl || "").includes("mapbox://styles/mapbox/streets-v12")
    ) {
      throw new Error(`Location Map defaults are not effective for Axis collection centres: ${JSON.stringify(effective)}`);
    }
    log(configured ? "Location Map defaults resolve Mapbox active with OSM fallback" :
      "Location Map defaults require a Mapbox key and expose the approved OSM fallback; external provider access is unqualified");
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
      body: JSON.stringify({ decision: { approved: true, reason: "Local end-to-end baseline acceptance" } }),
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



  /** Proves a configured application profile reaches Online through governed initialization and approval. */
  async function publishApplicationProfileBundle(headers, profileCode, reason, deliveryProbe) {
    const profilePath = `/nodics/backoffice/v0/applications/${encodeURIComponent(profileCode)}/initialization`;
    let status = await requestJson(platformUrl, profilePath, { headers });
    if (status.readiness !== "READY") {
      const initiated = await requestJson(platformUrl, `${profilePath}/initiate`, {
        headers,
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      const publicationCode = initiated.publication?.code;
      if (!publicationCode || initiated.publication?.state !== "PENDING_APPROVAL") {
        throw new Error(`${profileCode} application bundle did not enter approval: ${JSON.stringify(initiated)}`);
      }
      await decidePublication(headers, publicationCode, true, reason);
      status = await requestJson(platformUrl, profilePath, { headers });
    }
    if (status.readiness !== "READY" || status.publication?.state !== "ONLINE") {
      throw new Error(`${profileCode} application bundle is not READY Online: ${JSON.stringify(status)}`);
    }
    const repeated = await requestJson(platformUrl, `${profilePath}/initiate`, {
      headers, method: 'POST', body: JSON.stringify({ reason }),
    });
    if (repeated.publication?.code !== status.publication.code || repeated.publication?.state !== 'ONLINE')
      throw new Error(`${profileCode} repeat initialization did not retain the Online publication`);
    const delivered = await requestPublicDeliveryJson(
      `/nodics/cms/v0/delivery/pages/resolve?site=${encodeURIComponent(deliveryProbe.site)}&path=${encodeURIComponent(deliveryProbe.path)}&locale=${encodeURIComponent(deliveryProbe.locale || "en")}&channel=${encodeURIComponent(deliveryProbe.channel || "web")}`,
    );
    if (!delivered || !delivered.page) {
      throw new Error(`${profileCode} Online delivery probe failed: ${JSON.stringify(delivered)}`);
    }
    log(`${profileCode} application bundle is READY through Staged, Process approval, and Online delivery`);
  }



  /** Completes the current publication review through Process without bypassing workflow authority. */
  async function decidePublication(headers, publicationCode, approved, reason) {
    return completeAcceptanceWorkflow({
      request: requestJson, baseUrl: processUrl, headers,
      definitionCode: "cmsPublicationApproval",
      correlation: { key: "publicationCode", value: publicationCode },
      nodeCode: "publicationReview", attempts: 20, intervalMs: 250, instanceLimit: 200,
      decision: { approved, action: approved ? "APPROVE" : "REJECT", reason },
      instanceUnavailable: `Publication workflow instance is unavailable for ${publicationCode}`,
      taskUnavailable: instance => `Publication review task is unavailable for ${instance.code}`,
    });
  }

  /** Qualifies a real v1 -> v2 Nexus lifecycle with rejection, rollback, retirement, and governed recovery. */
  async function qualifyApplicationUpdate(headers, fixture) {
    const profilePath = "/nodics/backoffice/v0/applications/" + encodeURIComponent(fixture.profileCode) + "/initialization";
    const deliveryPath = applicationDeliveryPath(fixture.deliveryProbe);
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
        response = await requestJsonResponse(wcmsOnlineUrl, deliveryPath);
        present = response.status === 200 && JSON.stringify(response.body).includes(fixture.marker);
        if (present === expected) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error(`${label} marker expectation failed: expected=${String(expected)} actual=${String(present)} status=${String(response?.status)}`);
    };

    const initialStatus = await requestJson(platformUrl, profilePath, { headers });
    if (initialStatus.publication?.state === "FAILED") {
      throw new Error(`Application v2 retained lifecycle requires recovery: ${JSON.stringify(initialStatus)}`);
    }
    if (initialStatus.readiness === "READY" && initialStatus.publication?.state === "ONLINE") {
      await assertMarker(true, "Retained v2");
      log("Application v2 lifecycle is already ONLINE with its delivery marker on retained data");
      return;
    }

    let update = await initiate("Application v2 rejection qualification");
    if (update.publication?.state !== "PENDING_APPROVAL") throw new Error(`Application v2 did not enter approval: ${JSON.stringify(update)}`);
    await decidePublication(headers, update.publication.code, false, "Acceptance rejection proves Online v1 remains unchanged");
    let status = await requestJson(platformUrl, profilePath, { headers });
    if (status.publication?.state !== "REJECTED") throw new Error(`Application v2 was not rejected: ${JSON.stringify(status)}`);
    await assertMarker(false, "Rejected v2");

    update = await initiate("Governed Application v2 resubmission qualification");
    if (update.publication?.state !== "PENDING_APPROVAL") throw new Error(`Rejected Application v2 did not re-enter approval: ${JSON.stringify(update)}`);
    await decidePublication(headers, update.publication.code, true, "Approve immutable Application v2");
    status = await requestJson(platformUrl, profilePath, { headers });
    if (status.readiness !== "READY" || status.publication?.state !== "ONLINE" || !status.publication.previousOnlineVersion) {
      throw new Error(`Application v2 is not Online with captured v1: ${JSON.stringify(status)}`);
    }
    await assertMarker(true, "Approved v2");
    const replay = await initiate("Response-loss and idempotency replay qualification");
    if (replay.publication?.code !== status.publication.code || replay.publication?.state !== "ONLINE") {
      throw new Error(`Application v2 initiate replay was not idempotent: ${JSON.stringify(replay)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const lifecycle = await requestJson(platformUrl, profilePath, { headers });
    if (lifecycle.publication?.state !== "ONLINE") {
      throw new Error(`Application v2 lifecycle diverged before retirement: ${JSON.stringify(lifecycle)}`);
    }

    const retired = await requestJson(platformUrl, `${profilePath}/retire`, { headers, method: "POST" });
    if (retired.readiness !== "RETIRED" || retired.publication?.state !== "WITHDRAWN") {
      throw new Error(`Application v2 retirement failed: ${JSON.stringify(retired)}`);
    }
    const retirementErrorWindow = managedProcesses.map((entry) => ({ entry, errorCount: entry.errors.length }));
    const unavailable = await requestJsonResponse(wcmsOnlineUrl, deliveryPath);
    if (unavailable.status !== 404) throw new Error(`Retired Application delivery remained visible: ${JSON.stringify(unavailable)}`);
    retirementErrorWindow.forEach(({ entry, errorCount }) => entry.errors.splice(errorCount));
    update = await initiate("Governed Application v2 recovery after retirement");
    await decidePublication(headers, update.publication.code, true, "Reapprove Application v2 after retirement");
    await assertMarker(true, "Recovered v2 after retirement");
    await waitOnline("Retirement recovery");

    const rolledBack = await requestJson(platformUrl, `${profilePath}/rollback`, { headers, method: "POST" });
    if (rolledBack.publication?.state !== "ROLLED_BACK") throw new Error(`Application v2 rollback failed: ${JSON.stringify(rolledBack)}`);
    await assertMarker(false, "Rolled back v1");
    update = await initiate("Governed Application v2 recovery after rollback");
    await decidePublication(headers, update.publication.code, true, "Reapprove Application v2 after rollback");
    await assertMarker(true, "Recovered v2 after rollback");
    status = await waitOnline("Rollback recovery");
    const lifecycleOperations = new Set([].concat(status.lineage?.target?.receipts || []).map((item) => item.operation));
    const lifecycleStates = new Set([].concat(status.lineage?.publication?.transitions || []).map((item) => item.toState));
    for (const operation of ["DEPLOY", "WITHDRAW", "ROLLBACK"]) {
      if (!lifecycleOperations.has(operation)) throw new Error(`Application v2 lineage lacks ${operation}: ${JSON.stringify(status.lineage)}`);
    }
    for (const state of ["REJECTED", "ONLINE", "WITHDRAWN", "ROLLED_BACK"]) {
      if (!lifecycleStates.has(state)) throw new Error(`Application v2 audit lineage lacks ${state}: ${JSON.stringify(status.lineage)}`);
    }
    if (!status.lineage?.actor || !status.lineage?.source?.releaseCode || !status.lineage?.publication?.workflowRef ||
        !status.lineage?.target?.manifest?.contentHash) {
      throw new Error(`Application v2 lineage is incomplete: ${JSON.stringify(status.lineage)}`);
    }
    log("Application v1 -> v2 rejection, publication, retry, rollback, retirement, and recovery are qualified");
  }

  /** Proves optional documentation packs are administered by Axis/Platform and published through the normal approval path. */
  async function publishDocumentationBundles(headers) {
    for (const profile of documentationPacks) {
      let status = await requestJson(platformUrl, `/nodics/backoffice/v0/applications/${profile.profileCode}/initialization`, { headers });
      if (status.readiness !== "READY") {
        const initiated = await requestJson(platformUrl, `/nodics/backoffice/v0/applications/${profile.profileCode}/initialization/initiate`, {
          headers, method: "POST", body: JSON.stringify({ reason: "Optional Axis documentation publication qualification" }),
        });
        const publicationCode = initiated.publication?.code;
        if (!publicationCode || initiated.publication?.state !== "PENDING_APPROVAL") {
          throw new Error(`${profile.profileCode} did not enter approval: ${JSON.stringify(initiated)}`);
        }
        const instances = await requestJson(processUrl, "/nodics/process/v0/instances?limit=100", { headers });
        const instance = [].concat(instances.items || instances || []).find(
          (item) => item.definitionCode === "cmsPublicationApproval" && item.context?.publicationCode === publicationCode && item.status === "WAITING",
        );
        if (!instance) throw new Error(`${profile.profileCode} workflow instance is unavailable for ${publicationCode}`);
        const tasks = await requestJson(processUrl, `/nodics/process/v0/tasks?instanceCode=${encodeURIComponent(instance.code)}&limit=20`, { headers });
        const task = [].concat(tasks.items || tasks || []).find(
          (item) => item.instanceCode === instance.code && item.nodeCode === "publicationReview" && ["OPEN", "CLAIMED"].includes(item.status),
        );
        if (!task) throw new Error(`${profile.profileCode} approval task is unavailable for ${instance.code}`);
        if (task.status === "OPEN") {
          await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/claim`, { headers, method: "POST" });
        }
        await requestJson(processUrl, `/nodics/process/v0/tasks/${encodeURIComponent(task.code)}/complete`, {
          headers, method: "POST",
          body: JSON.stringify({ decision: { approved: true, reason: "Optional Axis documentation publication qualification" } }),
        });
        status = await requestJson(platformUrl, `/nodics/backoffice/v0/applications/${profile.profileCode}/initialization`, { headers });
      }
      if (status.readiness !== "READY" || status.publication?.state !== "ONLINE") {
        throw new Error(`${profile.profileCode} is not READY Online: ${JSON.stringify(status)}`);
      }
      const delivered = await requestPublicDeliveryJson(
        `/nodics/cms/v0/delivery/pages/resolve?site=${encodeURIComponent(profile.site)}&path=${encodeURIComponent(profile.path)}&locale=en&channel=web`);
      if (!delivered?.page) throw new Error(`${profile.code} Online delivery failed: ${JSON.stringify(delivered)}`);
    }
    log("optional documentation bundles are READY through Axis/Platform, Staged, Process, and Online delivery");
  }

  /** Proves that updated framework and Axis documentation can roll back to their prior Online versions and recover. */
  async function qualifyDocumentationReleaseRollback(headers) {
    if (!qualifyDocumentationRollback) return;
    for (const profileCode of selection.rollbackDocumentationProfiles || []) {
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
    if (dropLocalDb) {
      captureRuntimeErrorOutput = false;
      await reconcileRuntimeDeploymentGrants();
      await startSplitRuntimes();
      const resetHeaders = await authenticate();
      await executeGovernedFreshReset(resetHeaders);
      captureRuntimeErrorOutput = true;
      await ensureProcess("Platform", urlPort(platformUrl), projectRoot, "start:platform", platformUrl, "/nodics/system/v0/health/ready");
      const bootstrapHeaders = await authenticate();
      await ensureInitializationProfileCurrent(bootstrapHeaders, platformUrl, selection.platformInitializationProfile, "Platform foundation");
      await reconcileRuntimeDeploymentGrants();
      await startSplitRuntimes();
    } else {
      await reconcileRuntimeDeploymentGrants();
      await startSplitRuntimes();
    }
    await verifyLocalRouteSecurityMatrix();
    await waitForHttp(
      platformUrl,
      "/nodics/backoffice/v0/bootstrap/public",
      "BackOffice public bootstrap",
    );
    const headers = await authenticate();
    await ensureInitializationProfileCurrent(headers, platformUrl, selection.platformInitializationProfile, "Platform foundation");
    if (selection.locationInitializationProfile) await ensureInitializationProfileCurrent(headers, locationUrl, selection.locationInitializationProfile, "Location foundation");
    if (selection.verifyDefaultLocationMap === true) await verifyLocationMapDefaults(headers);
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
    for (const module of selection.requiredCapabilities || []) {
      await ensureFunctionalModuleActive(headers, module, 'Explicit application bootstrap capability selection');
    }
    const refreshedHeaders = await authenticate();
    await verifyDocumentationInitiallyNotInstalled(refreshedHeaders);
    await importContentPacks(refreshedHeaders);
    await verifyDocumentationNotOnlineBeforePublication();
    await verifyGovernedImportExportBoundary(refreshedHeaders);
    await publishAxisBaseline(refreshedHeaders);
    for (const fixture of selection.applicationBundles || []) {
      await publishApplicationProfileBundle(refreshedHeaders, fixture.profileCode, 'Governed application bootstrap acceptance', fixture.deliveryProbe);
    }
    await runSelectedApplicationJourneys();
    for (const fixture of selection.applicationUpdates || []) await qualifyApplicationUpdate(refreshedHeaders, fixture);
    await publishDocumentationBundles(refreshedHeaders);
    await qualifyDocumentationReleaseRollback(refreshedHeaders);
    await verifyPublicationOperations(refreshedHeaders);
    await verifyWcmsDesignerAuthoringAvailability(refreshedHeaders);
    const noisy = managedProcesses.flatMap((entry) =>
      entry.errors
        .filter((message) => {
          if (isExpectedAcceptanceLog(message)) return false;
          const hasExpectedAcceptanceLog = entry.errors.some((candidate) => isExpectedAcceptanceLog(candidate));
          const isCompanionPipelineError = /\[DefaultPipelineService\] Pipeline: .* has error/u.test(message);
          return !(hasExpectedAcceptanceLog && isCompanionPipelineError);
        })
        .map((message) => `${entry.label}: ${message}`),
    );
    if (noisy.length > 0) {
      throw new Error(`Startup emitted error-level output:\n${noisy.join("\n")}`);
    }
    log("API-only retained-data local bootstrap acceptance completed successfully");
  }

  try { return await main(); }
  finally { if (!leaveStarted) await stopManagedProcesses(); }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Application bootstrap requires selected Local fixtures, --execute --approve-publications. Startup: --start-runtimes. Reset: --drop-local-db plus owned startup. Only owned child processes are stopped.');
  else await runApplicationBootstrapAcceptance({
    execute: process.argv.includes('--execute'), approvePublications: process.argv.includes('--approve-publications'),
    startRuntimes: process.argv.includes('--start-runtimes'), resetLocal: process.argv.includes('--drop-local-db'),
    leaveStarted: process.argv.includes('--leave-started'), expectDocumentationNotInstalled: process.argv.includes('--expect-documentation-not-installed'),
    qualifyDocumentationRollback: process.argv.includes('--qualify-documentation-rollback'),
  });
}
