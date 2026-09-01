#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { execFile, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { readProjectEnvironmentProfile } from "./defaultProjectEnvironmentProfileService.mjs";

/**
 * @module nTooling/service/project/defaultProjectWasteBackofficeDiscoveryAcceptanceService
 * @description Proves a project Waste runtime contributes module-owned BackOffice metadata through the live Platform discovery path.
 * @layer tooling
 * @owner nTooling
 */

const execFileAsync = promisify(execFile);
const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const manifestPath = path.join(projectRoot, "nodics.project.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
const environmentProfile = readProjectEnvironmentProfile(projectRoot, process.env.ENV || "");
const config = environmentProfile.acceptance?.wasteBackofficeDiscovery ||
  manifest.acceptance?.wasteBackofficeDiscovery ||
  {};
const enterprise = process.env.AXIS_ENTERPRISE || "default";
const project = process.env.AXIS_PROJECT || environmentProfile.projectCode;
const platformUrl = process.env.AXIS_PLATFORM_URL || "http://127.0.0.1:4300";
const axisUrl = process.env.AXIS_URL || "http://127.0.0.1:3100";
const functionalModule = config.functionalModule || "nodics.waste";
const providerModule = config.providerModule || "wasteCore";
const expectedCapabilityId = config.capabilityId || "waste-management";
const expectedGroupId = config.groupId || "sustainability-operations";
const expectedObservedServer = config.observedServer || "kickoffLocal:wasteServer:default";
const platformRuntime = config.platform || { label: "Platform", port: 4300, script: "start:platform" };
const wasteRuntime = config.waste || { label: "Waste", port: 4370, script: "start:waste" };
const managed = [];
const expectedNavigationIds = config.navigationIds || [
  "waste-management",
  "waste-taxonomy",
  "waste-families",
  "waste-categories",
  "waste-materials",
  "waste-evidence-policies",
  "waste-collections",
  "waste-acceptance-rules",
  "waste-submissions",
  "waste-verification",
  "waste-receipts",
  "waste-impact",
  "waste-assets",
  "waste-asset-types",
  "waste-asset-creation-policies",
  "waste-asset-ownership-events",
  "waste-asset-marketplace-projections",
  "waste-asset-transfer-policies",
  "waste-marketplace-policies",
  "waste-reward-settlement-policies",
  "waste-carbon-settlement-policies",
  "waste-coupon-redemption-policies",
  "waste-movement",
  "waste-compliance",
];

function log(message) {
  console.log(`[waste-backoffice-discovery] ${message}`);
}

function restorableState(state) {
  return {
    registrationState: state.registrationState,
    enabled: state.registrationState === "REGISTERED" ? state.enabled : false,
  };
}

async function listening(port) {
  const result = await execFileAsync("lsof", [
    "-nP",
    `-iTCP:${String(port)}`,
    "-sTCP:LISTEN",
  ]).catch(() => ({ stdout: "" }));
  return result.stdout.includes(`:${String(port)} `);
}

async function request(baseUrl, route, options = {}) {
  const response = await fetch(new URL(route, baseUrl), {
    ...options,
    headers: {
      Accept: "application/json",
      "x-enterprise-code": enterprise,
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(`${route} returned a non-JSON response`);
  }
  if (!response.ok) {
    throw new Error(`${route} returned HTTP ${String(response.status)}: ${text.slice(0, 500)}`);
  }
  return body?.data ?? body?.result ?? body;
}

async function waitReady(baseUrl, label) {
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < 90000) {
    try {
      const health = await request(baseUrl, "/nodics/system/v0/health/ready");
      if (health?.status === "UP") {
        log(`${label} ready`);
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`${label} did not become ready: ${lastError?.message || "timeout"}`);
}

async function ensureRuntime(runtime, baseUrl) {
  if (!(await listening(runtime.port))) {
    const child = spawn("npm", ["run", runtime.script], {
      cwd: projectRoot,
      env: process.env,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", chunk => process.stdout.write(`[${runtime.label}] ${chunk}`));
    child.stderr.on("data", chunk => process.stderr.write(`[${runtime.label}] ${chunk}`));
    managed.push(child);
  }
  await waitReady(baseUrl, runtime.label);
}

function stopManagedRuntime(child) {
  if (child.killed) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {}
  }
}

async function authenticate() {
  const result = await request(platformUrl, "/nodics/profile/v0/employee/browser/authenticate", {
    method: "POST",
    headers: { Origin: axisUrl },
    body: JSON.stringify({
      loginId: process.env.AXIS_LOGIN_ID || "admin",
      password: process.env.AXIS_PASSWORD || "adminPassword",
    }),
  });
  if (!result?.authToken) throw new Error("Platform authentication returned no token");
  return { Authorization: `Bearer ${result.authToken}` };
}

function decodeAccessToken(headers) {
  const token = String(headers.Authorization || "").replace(/^Bearer\s+/u, "");
  const payload = token.split(".")[1];
  if (!payload) return {};
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

async function ensureWasteViewPermission(headers) {
  const permissions = [].concat(decodeAccessToken(headers).permissions || []);
  if (permissions.includes("*") || permissions.includes("waste.backoffice.view")) return headers;
  log("admin token is missing waste.backoffice.view; applying governed identity migration");
  const preview = await request(platformUrl, "/nodics/profile/v0/identity/migration/preview", {
    method: "POST",
    headers,
    body: JSON.stringify({ reason: "Refresh local bootstrap permissions for Waste BackOffice discovery acceptance" }),
  });
  const hasWasteGroupChange = (preview.changes || []).some(change =>
    change.schema === "userGroup" &&
    [].concat(change.to?.permissions || []).includes("waste.backoffice.view"));
  if (!hasWasteGroupChange && preview.idempotent !== true) {
    throw new Error("Identity migration preview did not include the Waste BackOffice permission refresh");
  }
  await request(platformUrl, "/nodics/profile/v0/identity/migration/apply", {
    method: "POST",
    headers,
    body: JSON.stringify({ reason: "Refresh local bootstrap permissions for Waste BackOffice discovery acceptance" }),
  });
  const refreshed = await authenticate();
  const refreshedPermissions = [].concat(decodeAccessToken(refreshed).permissions || []);
  if (!refreshedPermissions.includes("*") && !refreshedPermissions.includes("waste.backoffice.view")) {
    throw new Error("Governed identity migration did not grant waste.backoffice.view to the authenticated admin");
  }
  return refreshed;
}

async function detail(headers) {
  return request(
    platformUrl,
    `/nodics/backoffice/v0/runtime/modules/registrations/${encodeURIComponent(functionalModule)}?project=${encodeURIComponent(project)}`,
    { headers },
  );
}

async function waitForRegistration(headers, expected) {
  let registration;
  let lastError;
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      registration = await detail(headers);
      if (!expected || (
        registration.registrationState === expected.registrationState &&
        registration.enabled === expected.enabled
      )) {
        return registration;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (expected && registration) return registration;
  throw lastError || new Error(`Functional module ${functionalModule} was not registered`);
}

async function transition(headers, action, revision) {
  return request(
    platformUrl,
    `/nodics/backoffice/v0/runtime/modules/registrations/${encodeURIComponent(functionalModule)}/${action}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        project,
        expectedRevision: revision,
        reason: "Kickoff Waste BackOffice discovery acceptance",
      }),
    },
  );
}

async function ensureWasteEnabled(headers, registration) {
  let current = registration;
  let registeredByTest = false;
  let activatedByTest = false;
  if (current.registrationState !== "REGISTERED") {
    current = await transition(headers, "register", current.catalogueRevision);
    registeredByTest = true;
  }
  if (current.enabled !== true) {
    current = await transition(headers, "activate", current.catalogueRevision);
    activatedByTest = true;
  }
  return { registration: current, registeredByTest, activatedByTest };
}

function validateRegistration(registration) {
  if (registration.functionalModule !== functionalModule) {
    throw new Error(`Expected ${functionalModule} registration, received ${registration.functionalModule}`);
  }
  if (registration.runtimeState !== "ACTIVE") {
    throw new Error(`${functionalModule} must be active before BackOffice discovery`);
  }
  if (!registration.observedServers.includes(expectedObservedServer)) {
    throw new Error(`${functionalModule} must be observed through ${expectedObservedServer}`);
  }
  [providerModule, "wasteApi", "wasteMaterial", "wasteCollection", "wasteSubmission"].forEach(moduleName => {
    if (!registration.technicalModules.includes(moduleName)) {
      throw new Error(`${functionalModule} registration must include ${moduleName}`);
    }
  });
}

function requireNavigation(navigation, id) {
  const item = navigation.find(entry => entry.id === id);
  if (!item) throw new Error(`Waste BackOffice navigation is missing ${id}`);
  return item;
}

async function validateBootstrap(headers) {
  const bootstrap = await request(platformUrl, "/nodics/backoffice/v0/bootstrap", {
    headers: {
      ...headers,
      "x-nodics-client-contract-version": "1",
    },
  });
  const metadata = bootstrap.catalogue?.[providerModule];
  if (!metadata) throw new Error(`${providerModule} was not exposed in the authorized BackOffice bootstrap catalogue`);
  if (metadata.capabilityId !== expectedCapabilityId) {
    throw new Error(`Expected capability ${expectedCapabilityId}, received ${metadata.capabilityId}`);
  }
  if (!metadata.requiredPermissions?.includes("waste.backoffice.view")) {
    throw new Error("Waste BackOffice metadata must require waste.backoffice.view");
  }
  if (metadata.activeModuleLeases < 1) {
    throw new Error("Waste BackOffice metadata must come from at least one active runtime lease");
  }
  expectedNavigationIds.forEach(id => requireNavigation(metadata.navigation || [], id));
  const root = requireNavigation(metadata.navigation || [], "waste-management");
  if (root.group?.id !== expectedGroupId) throw new Error(`Waste root navigation must be grouped under ${expectedGroupId}`);
  if (root.workbenchTarget?.moduleName !== providerModule || root.workbenchTarget?.schemaName !== "wasteLifecyclePolicy") {
    throw new Error("Waste root navigation must point at the generic waste lifecycle policy workbench");
  }
  const submissions = requireNavigation(metadata.navigation || [], "waste-submissions");
  if (submissions.workbenchTarget?.moduleName !== "wasteSubmission" ||
      submissions.workbenchTarget?.schemaName !== "wasteSubmission") {
    throw new Error("Waste submissions navigation must use the generic Waste submission schema workbench");
  }
  const assets = requireNavigation(metadata.navigation || [], "waste-assets");
  if (assets.workbenchTarget?.moduleName !== providerModule || assets.workbenchTarget?.schemaName !== "wasteAsset") {
    throw new Error("Waste assets navigation must use the generic Waste asset schema workbench");
  }
  const assetCreationPolicies = requireNavigation(metadata.navigation || [], "waste-asset-creation-policies");
  const marketplaceProjections = requireNavigation(metadata.navigation || [], "waste-asset-marketplace-projections");
  const transferPolicies = requireNavigation(metadata.navigation || [], "waste-asset-transfer-policies");
  const couponPolicies = requireNavigation(metadata.navigation || [], "waste-coupon-redemption-policies");
  if (assetCreationPolicies.workbenchTarget?.schemaName !== "wasteAssetCreationPolicy" ||
      marketplaceProjections.workbenchTarget?.schemaName !== "wasteAssetMarketplaceProjection" ||
      transferPolicies.workbenchTarget?.schemaName !== "wasteAssetTransferPolicy" ||
      couponPolicies.workbenchTarget?.schemaName !== "wasteCouponRedemptionSettlementPolicy") {
    throw new Error("Waste asset policy navigation must expose schema-driven creation, projection, transfer, and coupon settlement workbenches");
  }
  const movement = requireNavigation(metadata.navigation || [], "waste-movement");
  const compliance = requireNavigation(metadata.navigation || [], "waste-compliance");
  if (movement.featureState !== "PREVIEW" || compliance.featureState !== "PREVIEW") {
    throw new Error("Waste movement and compliance must remain preview navigation entries");
  }
  (metadata.navigation || []).forEach(item => {
    if (!item.requiredPermissions?.includes("waste.backoffice.view")) {
      throw new Error(`${item.id} must be filtered by waste.backoffice.view`);
    }
    if (!String(item.route || "").startsWith("/waste")) {
      throw new Error(`${item.id} must stay inside the Waste route namespace`);
    }
  });

  const effectiveGroup = (bootstrap.effectiveNavigationComposition?.groups || [])
    .find(group => group.id === expectedGroupId);
  if (!effectiveGroup) throw new Error(`Effective navigation must expose ${expectedGroupId}`);
  const effectiveRoot = (bootstrap.effectiveNavigationComposition?.navigation || [])
    .find(item => item.moduleName === providerModule && item.id === "waste-management");
  if (!effectiveRoot) throw new Error("Effective navigation must include the Waste Management workspace");
  if (effectiveRoot.routeOwner?.ownerType !== "WORKBENCH") {
    throw new Error("Waste Management workspace must resolve through the generic schema workbench");
  }
  if (bootstrap.modules?.[providerModule]?.[0]?.endpoint !== undefined) {
    throw new Error("Schema-backed Waste metadata must not invent a direct module endpoint for wasteCore");
  }
  return bootstrap;
}

async function restore(headers, state) {
  let current = await detail(headers);
  if (state.activatedByTest && current.enabled === true) {
    current = await transition(headers, "deactivate", current.catalogueRevision);
  }
  if (state.registeredByTest && current.registrationState === "REGISTERED") {
    current = await transition(headers, "deregister", current.catalogueRevision);
  }
  const restored = await waitForRegistration(headers, restorableState(state.original));
  if (
    restored.registrationState !== restorableState(state.original).registrationState ||
    restored.enabled !== restorableState(state.original).enabled
  ) {
    throw new Error(`Waste functional module state was not restored: ${JSON.stringify(restored)}`);
  }
}

async function main() {
  await ensureRuntime(platformRuntime, platformUrl);
  await ensureRuntime(wasteRuntime, process.env.NODICS_WASTE_URL || "http://127.0.0.1:4370");
  const headers = await ensureWasteViewPermission(await authenticate());
  const original = await waitForRegistration(headers);
  validateRegistration(original);
  const enabledState = await ensureWasteEnabled(headers, original);
  try {
    validateRegistration(enabledState.registration);
    const bootstrap = await validateBootstrap(headers);
    log(`discovered ${expectedCapabilityId} via ${providerModule} with ${bootstrap.catalogue[providerModule].navigation.length} navigation entries`);
  } finally {
    await restore(headers, Object.assign({ original }, enabledState));
  }
  log("Waste BackOffice discovery acceptance passed");
}

main()
  .catch(error => {
    console.error(`Waste BackOffice discovery acceptance failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    managed.reverse().forEach(stopManagedRuntime);
  });
