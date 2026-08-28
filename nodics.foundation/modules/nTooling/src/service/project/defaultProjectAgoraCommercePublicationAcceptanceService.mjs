#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const platformUrl = process.env.NODICS_PLATFORM_URL || "http://127.0.0.1:4300";
const commerceStagedUrl = process.env.NODICS_COMMERCE_STAGED_URL || "http://127.0.0.1:4352";
const commerceOnlineUrl = process.env.NODICS_COMMERCE_ONLINE_URL || process.env.NODICS_COMMERCE_URL || "http://127.0.0.1:4350";
const wcmsOnlineUrl = process.env.NODICS_WCMS_ONLINE_URL || "http://127.0.0.1:4314";
const axisOrigin = process.env.AXIS_ORIGIN || "http://127.0.0.1:3100";
const managed = [];
const composition = require(path.join(projectRoot, "config", "agora-domain-composition.js")).resolve();
const domainByPack = Object.freeze({
  "agora.apparel": { folder: "apparel", prefix: "agoraApparel" },
  "agora.electronics": { folder: "electronics", prefix: "agoraElectronics" },
  "agora.telco": { folder: "telco", prefix: "agoraTelco" },
});

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
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.exitPromise = new Promise((resolve) => child.once("close", resolve));
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

async function authenticateServicePrincipal() {
  const suppliedToken = process.env.NODICS_SERVICE_PRINCIPAL_AUTH_TOKEN;
  if (suppliedToken) return { Authorization: `Bearer ${suppliedToken}` };
  const suppliedApiKey = process.env.NODICS_SERVICE_API_KEY || process.env.NODICS_API_KEY;
  const projectServiceApiKey = function () {
    try {
      const properties = require(path.join(projectRoot, "envs", "kickoffLocal", "config", "properties.js"));
      return properties?.bootstrapIdentity?.serviceApiKey;
    } catch {
      return undefined;
    }
  }();
  const apiKey = suppliedApiKey || projectServiceApiKey;
  if (!apiKey) {
    throw new Error("NODICS_SERVICE_API_KEY is required when the project bootstrap service API key is not available");
  }
  return { "x-api-key": apiKey };
}

async function authenticateService(servicePrincipalHeaders) {
  const suppliedToken = process.env.NODICS_SERVICE_AUTH_TOKEN || process.env.NODICS_INTERNAL_AUTH_TOKEN;
  if (suppliedToken) return { Authorization: `Bearer ${suppliedToken}` };
  const tenant = process.env.NODICS_TENANT || "default";
  const result = await request(platformUrl, `/nodics/profile/v0/auth/token/${encodeURIComponent(tenant)}`, {
    method: "GET",
    headers: {
      ...servicePrincipalHeaders,
      Origin: axisOrigin,
      "x-enterprise-code": process.env.NODICS_ENTERPRISE_CODE || "default",
      "x-nodics-runtime-instance": "agora-commerce-publication-acceptance",
      "x-nodics-modules": "media,product,pricing,inventory,tax",
    },
  });
  const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken || result?.data?.result?.authToken;
  if (!authToken) {
    throw new Error(`Platform internal service authentication returned no token: ${JSON.stringify(result)}`);
  }
  return { Authorization: `Bearer ${authToken}` };
}

async function importRecords(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    return [];
  }
  const module = await import(pathToFileURL(filePath).href);
  const records = module.default || module;
  return Object.values(records);
}

async function assetRecords() {
  const assetsByCode = new Map();
  for (const pack of composition.projectPacks) {
    const domain = domainByPack[pack];
    const module = await import(pathToFileURL(path.join(projectRoot, "modules", pack, "data", "sample-v001", "content", "assets", "agora-cms-media", "assetManifest.js")).href);
    const assets = module.default || module;
    for (const asset of assets) {
      if (!assetsByCode.has(asset.mediaCode)) {
        assetsByCode.set(asset.mediaCode, { ...asset, pack });
      }
    }
  }
  return [...assetsByCode.values()];
}

async function domainDataRecords(fileSuffix) {
  const records = [];
  for (const pack of composition.projectPacks) {
    const domain = domainByPack[pack];
    const filePath = path.join(projectRoot, "modules", pack, "data", "sample-v001", "commerce", "records", `${domain.prefix}${fileSuffix}`);
    records.push(...await importRecords(filePath));
  }
  return records;
}

function selectedCatalogVersions() {
  const override = process.env.NODICS_STOREFRONT_CATALOG_VERSION;
  if (override) return [override];
  return composition.projectPacks.map((pack) => {
    const domain = domainByPack[pack];
    if (!domain) throw new Error(`Unsupported Agora publication pack: ${pack}`);
    return `${domain.prefix}Staged`;
  });
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
  const storeCode = process.env.NODICS_STOREFRONT_STORE_CODE || "agoraMainStore";
  const catalogVersions = selectedCatalogVersions();
  const summaries = [];
  for (const catalogVersion of catalogVersions) {
    const body = await request(commerceStagedUrl, "/nodics/product/v0/operator/products/publication/search", {
      method: "POST",
      headers,
      body: JSON.stringify({ catalogVersion, storeCode, includeProjectionSnapshots: true }),
    });
    const summary = body?.data || body?.result || body;
    if (!summary || Number(summary.published || 0) <= 0 || Number(summary.projectionCount || 0) <= 0) {
      throw new Error(`Product publication produced no projections for ${catalogVersion}. Run NODICS_STOREFRONT_COMMERCE_DATA_EXECUTE=true npm run acceptance:agora-commerce-data first. Response: ${JSON.stringify(body)}`);
    }
    if (!Array.isArray(summary.projectionSnapshots) || summary.projectionSnapshots.length === 0) {
      throw new Error(`Product publication did not return Online handoff snapshots for ${catalogVersion}: ${JSON.stringify(body)}`);
    }
    summaries.push({ catalogVersion, summary });
    log(`published ${summary.published} ${catalogVersion} Products into ${summary.projectionCount} localized search projections`);
  }
  const summary = {
    requested: summaries.reduce((sum, item) => sum + Number(item.summary.requested || 0), 0),
    published: summaries.reduce((sum, item) => sum + Number(item.summary.published || 0), 0),
    projectionCount: summaries.reduce((sum, item) => sum + Number(item.summary.projectionCount || 0), 0),
    products: summaries.flatMap((item) => item.summary.products || []),
    projectionSnapshots: summaries.flatMap((item) => item.summary.projectionSnapshots || []),
  };
  return { catalogVersions, storeCode, summary };
}

async function restoreOnline(headers, publication) {
  const body = await request(commerceOnlineUrl, "/nodics/product/v0/internal/products/publication/search/restore", {
    method: "POST",
    headers,
    body: JSON.stringify({
      storeCode: publication.storeCode,
      replaceStore: true,
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
  const priceBooks = await domainDataRecords("PriceBookData.js");
  const priceRows = await domainDataRecords("PriceRowData.js");
  const warehouses = await domainDataRecords("WarehouseData.js");
  const inventoryBalances = await domainDataRecords("InventoryBalanceData.js");
  const taxPolicies = await domainDataRecords("TaxPolicyData.js");
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

function absoluteDeliveryUrl(deliveryUrl) {
  if (!deliveryUrl) return undefined;
  if (/^https?:\/\//i.test(deliveryUrl)) return deliveryUrl;
  return `${wcmsOnlineUrl}${deliveryUrl.startsWith("/") ? "" : "/"}${deliveryUrl}`;
}

async function deliveryAvailable(deliveryUrl, headers) {
  if (!deliveryUrl) return false;
  try {
    const response = await fetch(absoluteDeliveryUrl(deliveryUrl), { headers });
    return response.ok;
  } catch {
    return false;
  }
}

function mimeTypeOf(fileName) {
  const extension = path.extname(String(fileName || "")).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  if (extension === ".svg") return "image/svg+xml";
  return "image/jpeg";
}

async function productMediaPublicationAsset(asset) {
  const filePath = path.join(projectRoot, "modules", asset.pack, "data", "sample-v001", "content", "assets", "agora-cms-media", "files", asset.fileName);
  const buffer = await fs.readFile(filePath);
  const checksumAlgorithm = "sha256";
  return {
    code: asset.mediaCode,
    name: asset.name || asset.mediaCode,
    description: asset.description || asset.name || asset.mediaCode,
    folderCode: asset.folderCode || "productAssets",
    formatCode: asset.formatCode || "original",
    originalFileName: asset.fileName,
    mimeType: asset.mimeType || mimeTypeOf(asset.fileName),
    sizeBytes: buffer.length,
    checksum: crypto.createHash(checksumAlgorithm).update(buffer).digest("hex"),
    checksumAlgorithm,
    access: "PUBLIC",
    businessPurpose: asset.businessPurpose || "AGORA_PRODUCT_PRIMARY_IMAGE",
    ownerType: asset.ownerType || "PRODUCT",
    enterpriseCode: asset.enterpriseCode,
    ownerReference: asset.ownerCode || asset.ownerReference || asset.mediaCode,
    reusable: asset.reusable === true,
    contentBase64: buffer.toString("base64"),
  };
}

async function importPublishedProductMediaAssets(assets, headers) {
  const batchSize = 8;
  if (assets.length > batchSize) {
    const results = [];
    for (let index = 0; index < assets.length; index += batchSize) {
      results.push(await importPublishedProductMediaAssets(assets.slice(index, index + batchSize), headers));
    }
    return results;
  }
  const response = await fetch(`${wcmsOnlineUrl}/nodics/media/v0/publication/target/assets/import`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ mediaAssets: assets }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`/nodics/media/v0/publication/target/assets/import returned HTTP ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : undefined;
}

async function publishProductMedia(deliveryHeaders, publicationHeaders, products) {
  const discoveredMediaCodes = Array.from(new Set(products
    .map((product) => product.media?.primary?.mediaCode)
    .filter(Boolean)));
  if (discoveredMediaCodes.length === 0) {
    throw new Error("Product discovery returned no product media codes to publish");
  }
  const assetsByCode = new Map((await assetRecords())
    .filter((asset) => asset.ownerType === "PRODUCT")
    .map((asset) => [asset.mediaCode, asset]));
  const missingAssets = discoveredMediaCodes.filter((mediaCode) => !assetsByCode.has(mediaCode));
  if (missingAssets.length > 0) {
    throw new Error(`Product media assets are missing from selected Agora domain asset manifests: ${missingAssets.join(", ")}`);
  }
  const mediaCodes = Array.from(new Set([...assetsByCode.keys()])).sort();
  const publicationAssets = [];
  for (const mediaCode of mediaCodes) {
    const deliveryUrl = `/nodics/media/v0/content/${encodeURIComponent(mediaCode)}`;
    if (await deliveryAvailable(deliveryUrl, deliveryHeaders)) continue;
    publicationAssets.push(await productMediaPublicationAsset(assetsByCode.get(mediaCode)));
  }
  if (publicationAssets.length > 0) {
    await importPublishedProductMediaAssets(publicationAssets, publicationHeaders);
  }
  const stillMissing = [];
  for (const mediaCode of mediaCodes) {
    const deliveryUrl = `/nodics/media/v0/content/${encodeURIComponent(mediaCode)}`;
    if (!(await deliveryAvailable(deliveryUrl, deliveryHeaders))) stillMissing.push(mediaCode);
  }
  if (stillMissing.length > 0) {
    throw new Error(`WCMS Online product media delivery is still unavailable after publication: ${stillMissing.join(", ")}`);
  }
  log(`verified ${mediaCodes.length} product media delivery URLs on WCMS Online${publicationAssets.length ? `; published ${publicationAssets.length} missing media assets` : ""}`);
}

async function validateDiscovery(headers, serviceHeaders, storeCode) {
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
  const missingMedia = products.filter((product) => !product.media?.primary?.mediaCode || !product.media?.primary?.deliveryUrl);
  if (missingMedia.length > 0) {
    throw new Error(`Product discovery returned cards without renderable media: ${missingMedia.map((product) => product.productCode).join(", ")}`);
  }
  await publishProductMedia(headers, serviceHeaders, products);
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
  for (const child of managed.reverse()) {
    if (!child.pid || child.exitCode !== null) continue;
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
    await Promise.race([
      child.exitPromise,
      delay(Number(process.env.NODICS_ACCEPTANCE_SHUTDOWN_TIMEOUT_MS || 5000)).then(() => {
        if (child.exitCode !== null) return;
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
      }),
    ]);
  }
}

async function run() {
  try {
    await ensureRuntime("Platform", portOf(platformUrl, 4300), "start:platform", platformUrl);
    await ensureRuntime("WCMSOnline", portOf(wcmsOnlineUrl, 4314), "start:wcms:online", wcmsOnlineUrl);
    await ensureRuntime("CommerceStaged", portOf(commerceStagedUrl, 4352), "start:commerce:staged", commerceStagedUrl);
    await ensureRuntime("CommerceOnline", portOf(commerceOnlineUrl, 4350), "start:commerce", commerceOnlineUrl);
    const employeeHeaders = await authenticateEmployee();
    const servicePrincipalHeaders = await authenticateServicePrincipal();
    const serviceHeaders = await authenticateService(servicePrincipalHeaders);
    await validatePublicationContract(employeeHeaders);
    const publication = await publishSearch(employeeHeaders);
    await restoreOnline(employeeHeaders, publication);
    await restoreOperationalOnline(employeeHeaders);
    await validateDiscovery(employeeHeaders, serviceHeaders, publication.storeCode);
    log("Agora Commerce publication acceptance passed");
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
