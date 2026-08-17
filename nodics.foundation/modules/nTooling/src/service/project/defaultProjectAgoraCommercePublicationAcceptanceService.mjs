#!/usr/bin/env node
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const platformUrl = process.env.NODICS_PLATFORM_URL || "http://127.0.0.1:4300";
const commerceStagedUrl = process.env.NODICS_COMMERCE_STAGED_URL || "http://127.0.0.1:4352";
const commerceOnlineUrl = process.env.NODICS_COMMERCE_ONLINE_URL || process.env.NODICS_COMMERCE_URL || "http://127.0.0.1:4350";
const axisOrigin = process.env.AXIS_ORIGIN || "http://127.0.0.1:3100";
const managed = [];

function log(message) {
  console.log(`[agora-commerce-publication-acceptance] ${message}`);
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

async function dataRecords(relativePath) {
  const module = await import(pathToFileURL(path.join(projectRoot, "modules", "agora.common", "modules", "agoraCommonData", relativePath)).href);
  const records = module.default || module;
  return Object.values(records);
}

async function validatePublicationContract(headers) {
  const stagedContract = await request(commerceStagedUrl, "/nodics/system/v0/contract/openapi", { headers });
  const stagedPaths = stagedContract?.paths || stagedContract?.openapi?.paths || {};
  const stagedRequired = {
    "/nodics/product/v0/operator/products/publication/search": "post",
  };
  const stagedMissing = Object.entries(stagedRequired).filter(([route, method]) => !stagedPaths[route]?.[method]);
  if (stagedMissing.length > 0) {
    const productPaths = Object.keys(stagedPaths).filter((route) => route.includes("/nodics/product/")).sort();
    throw new Error(`Commerce Staged Product publication contract is missing ${stagedMissing.map(([route]) => route).join(", ")}; effective product paths: ${productPaths.join(", ") || "none"}`);
  }

  const onlineContract = await request(commerceOnlineUrl, "/nodics/system/v0/contract/openapi", { headers });
  const onlinePaths = onlineContract?.paths || onlineContract?.openapi?.paths || {};
  const onlineRequired = {
    "/nodics/product/v0/internal/products/publication/search/restore": "post",
    "/nodics/pricing/v0/internal/pricing/publication/operational/restore": "post",
    "/nodics/inventory/v0/internal/inventory/publication/operational/restore": "post",
    "/nodics/tax/v0/internal/tax/publication/operational/restore": "post",
    "/nodics/product/v0/customer/products/discovery": "get",
    "/nodics/product/v0/customer/products/{productCode}": "get",
  };
  const onlineMissing = Object.entries(onlineRequired).filter(([route, method]) => !onlinePaths[route]?.[method]);
  if (onlineMissing.length > 0) {
    const productPaths = Object.keys(onlinePaths).filter((route) => route.includes("/nodics/product/")).sort();
    throw new Error(`Commerce Online Product publication contract is missing ${onlineMissing.map(([route]) => route).join(", ")}; effective product paths: ${productPaths.join(", ") || "none"}`);
  }
  log("Product publication is effective on Commerce Staged; restore, discovery, and PDP are effective on Commerce Online");
}

async function publishSearch(headers) {
  const catalogVersion = process.env.NODICS_STOREFRONT_CATALOG_VERSION || "agoraStaged";
  const storeCode = process.env.NODICS_STOREFRONT_STORE_CODE || "agoraMainStore";
  const body = await request(commerceStagedUrl, "/nodics/product/v0/operator/products/publication/search", {
    method: "POST",
    headers,
    body: JSON.stringify({ catalogVersion, storeCode, includeProjectionSnapshots: true }),
  });
  const summary = body?.data || body?.result || body;
  if (!summary || Number(summary.published || 0) <= 0 || Number(summary.projectionCount || 0) <= 0) {
    throw new Error(`Product publication produced no projections. Run NODICS_STOREFRONT_COMMERCE_DATA_EXECUTE=true npm run acceptance:agora-commerce-data first. Response: ${JSON.stringify(body)}`);
  }
  if (!Array.isArray(summary.projectionSnapshots) || summary.projectionSnapshots.length === 0) {
    throw new Error(`Product publication did not return Online handoff snapshots: ${JSON.stringify(body)}`);
  }
  log(`published ${summary.published} Products into ${summary.projectionCount} localized search projections`);
  return { catalogVersion, storeCode, summary };
}

async function restoreOnline(headers, publication) {
  const body = await request(commerceOnlineUrl, "/nodics/product/v0/internal/products/publication/search/restore", {
    method: "POST",
    headers,
    body: JSON.stringify({
      storeCode: publication.storeCode,
      projectionSnapshots: publication.summary.projectionSnapshots,
    }),
  });
  const summary = body?.data || body?.result || body;
  if (!summary || Number(summary.restored || 0) <= 0 || Number(summary.projectionCount || 0) <= 0) {
    throw new Error(`Commerce Online search restoration produced no projections: ${JSON.stringify(body)}`);
  }
  log(`restored ${summary.restored} Products into ${summary.projectionCount} Commerce Online search projections`);
}

async function restoreOperationalOnline(headers) {
  const priceBooks = await dataRecords("data/staged/pricing/data/agoraPriceBookData.js");
  const priceRows = await dataRecords("data/staged/pricing/data/agoraPriceRowData.js");
  const warehouses = await dataRecords("data/staged/inventory/data/agoraWarehouseData.js");
  const inventoryBalances = await dataRecords("data/staged/inventory/data/agoraInventoryBalanceData.js");
  const taxPolicies = await dataRecords("data/staged/tax/data/agoraTaxPolicyData.js");
  const pricing = await request(commerceOnlineUrl, "/nodics/pricing/v0/internal/pricing/publication/operational/restore", {
    method: "POST",
    headers,
    body: JSON.stringify({ priceBooks, priceRows }),
  });
  const inventory = await request(commerceOnlineUrl, "/nodics/inventory/v0/internal/inventory/publication/operational/restore", {
    method: "POST",
    headers,
    body: JSON.stringify({ warehouses, inventoryBalances }),
  });
  const tax = await request(commerceOnlineUrl, "/nodics/tax/v0/internal/tax/publication/operational/restore", {
    method: "POST",
    headers,
    body: JSON.stringify({ taxPolicies }),
  });
  const pricingCount = Number((pricing?.data || pricing?.result || pricing)?.restored || 0);
  const inventoryCount = Number((inventory?.data || inventory?.result || inventory)?.restored || 0);
  const taxCount = Number((tax?.data || tax?.result || tax)?.restored || 0);
  if (pricingCount <= 0 || inventoryCount <= 0 || taxCount <= 0) {
    throw new Error(`Commerce Online operational restoration was incomplete: ${JSON.stringify({ pricing, inventory, tax })}`);
  }
  log(`restored Online operational Pricing (${pricingCount}), Inventory (${inventoryCount}), and Tax (${taxCount}) records`);
}

async function validateDiscovery(headers, storeCode) {
  const locale = process.env.NODICS_STOREFRONT_LOCALE || "en";
  const body = await request(commerceOnlineUrl, `/nodics/product/v0/customer/products/discovery?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}&pageSize=12`, {
    headers,
  });
  const data = body?.data || body?.result || body;
  const products = data?.products || [];
  if (products.length === 0) {
    throw new Error(`Product discovery returned no cards after publication: ${JSON.stringify(body)}`);
  }
  const first = products[0];
  if (!first.productCode || !first.name || first.sku || first.warehouseCode || first.priceRowCode) {
    throw new Error(`Product discovery returned an unsafe or incomplete card: ${JSON.stringify(first)}`);
  }
  const detailBody = await request(commerceOnlineUrl, `/nodics/product/v0/customer/products/${encodeURIComponent(first.productCode)}?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}`, {
    headers,
  });
  const detail = detailBody?.data?.product || detailBody?.product;
  if (!detail || detail.productCode !== first.productCode || detail.sku || detail.warehouseCode || detail.priceRowCode) {
    throw new Error(`Product PDP returned an unsafe or unexpected detail: ${JSON.stringify(detailBody)}`);
  }
  log(`Commerce Online customer discovery returned ${products.length} safe Product cards and PDP resolved ${first.productCode}`);
}

async function cleanup() {
  for (const child of managed.reverse()) child.kill("SIGTERM");
}

async function run() {
  try {
    await ensureRuntime("Platform", portOf(platformUrl, 4300), "start:platform", platformUrl);
    await ensureRuntime("CommerceStaged", portOf(commerceStagedUrl, 4352), "start:commerce:staged", commerceStagedUrl);
    await ensureRuntime("CommerceOnline", portOf(commerceOnlineUrl, 4350), "start:commerce", commerceOnlineUrl);
    const employeeHeaders = await authenticateEmployee();
    await validatePublicationContract(employeeHeaders);
    const publication = await publishSearch(employeeHeaders);
    await restoreOnline(employeeHeaders, publication);
    await restoreOperationalOnline(employeeHeaders);
    await validateDiscovery(employeeHeaders, publication.storeCode);
    log("Agora Commerce publication acceptance passed");
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
