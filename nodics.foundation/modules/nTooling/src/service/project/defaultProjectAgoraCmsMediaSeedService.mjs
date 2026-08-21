#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(process.env.NODICS_PROJECT_ROOT || process.cwd());
const platformUrl = process.env.AXIS_PLATFORM_URL || process.env.NODICS_PLATFORM_URL || "http://127.0.0.1:4300";
const wcmsStagedUrl = process.env.AXIS_WCMS_URL || process.env.NODICS_WCMS_STAGED_URL || "http://127.0.0.1:4312";
const axisOrigin = process.env.AXIS_ORIGIN || process.env.AXIS_URL || "http://127.0.0.1:3100";
const enterpriseCode = process.env.AXIS_ENTERPRISE || process.env.NODICS_ENTERPRISE_CODE || "default";
const loginId = process.env.AXIS_LOGIN_ID || "admin";
const password = process.env.AXIS_PASSWORD || "adminPassword";
const assetRoot = path.join(projectRoot, "modules", "agora.common", "modules", "agoraCommonData", "assets", "agora-cms-media");
const assetManifestPath = path.join(assetRoot, "assetManifest.js");
const assetFilesRoot = path.join(assetRoot, "files");

function log(message) {
  console.log(`[agora-cms-media-seed] ${message}`);
}

function endpoint(baseUrl, routePath) {
  return new URL(routePath, baseUrl).toString();
}

async function requestJson(baseUrl, routePath, options = {}) {
  const response = await fetch(endpoint(baseUrl, routePath), {
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
    throw new Error(`${routePath} returned non-JSON HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  if (!response.ok) {
    throw new Error(`${routePath} returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  return body?.result || body?.data || body;
}

async function authenticateEmployee() {
  const suppliedToken = process.env.AXIS_AUTH_TOKEN || process.env.NODICS_AUTH_TOKEN;
  if (suppliedToken) return { Authorization: `Bearer ${suppliedToken}` };
  const credentials = { loginId, password };
  const headers = { Origin: axisOrigin, "x-enterprise-code": enterpriseCode };
  let lastError;
  for (const routePath of ["/nodics/profile/v0/employee/browser/authenticate", "/nodics/profile/v0/employee/authenticate"]) {
    try {
      const result = await requestJson(platformUrl, routePath, {
        method: "POST",
        headers,
        body: JSON.stringify(credentials),
      });
      const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken;
      if (authToken) return { Authorization: `Bearer ${authToken}` };
      lastError = new Error(`${routePath} returned no auth token`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Platform employee authentication returned no auth token");
}

function mimeType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function uploadAsset(headers, asset) {
  const filePath = path.join(assetFilesRoot, asset.fileName);
  if (!existsSync(filePath)) throw new Error(`Asset file is missing: ${filePath}`);
  const buffer = await fs.readFile(filePath);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType(asset.fileName) }), asset.fileName);
  form.append("folderCode", asset.folderCode || "cmsAssets");
  form.append("formatCode", asset.formatCode || "original");
  form.append("mediaCode", asset.mediaCode);
  form.append("name", asset.name || asset.mediaCode);
  form.append("description", asset.description || asset.name || asset.mediaCode);
  form.append("moduleName", "media");
  form.append("schemaName", "media");
  form.append("businessPurpose", asset.businessPurpose || "AGORA_STOREFRONT_CONTENT");
  form.append("ownerType", asset.ownerType || "CMS_COMPONENT");
  form.append("ownerReference", asset.ownerCode || asset.mediaCode);
  const response = await fetch(endpoint(wcmsStagedUrl, "/nodics/media/v0/storage/upload"), {
    method: "POST",
    headers: {
      ...headers,
      "x-enterprise-code": enterpriseCode,
      Origin: axisOrigin,
    },
    body: form,
  });
  const text = await response.text();
  if (!response.ok) {
    if (/duplicate|already|exists|E11000/i.test(text)) {
      log(`current ${asset.mediaCode}`);
      return "current";
    }
    throw new Error(`Upload failed for ${asset.mediaCode}: HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  log(`reconciled ${asset.mediaCode}`);
  return "reconciled";
}

async function run() {
  if (!existsSync(assetManifestPath)) throw new Error(`Missing Agora media asset manifest: ${assetManifestPath}`);
  const assets = require(assetManifestPath);
  if (!Array.isArray(assets) || assets.length === 0) throw new Error("Agora media asset manifest is empty");
  const headers = await authenticateEmployee();
  let reconciled = 0;
  for (const asset of assets) {
    const result = await uploadAsset(headers, asset);
    if (result === "reconciled") reconciled += 1;
  }
  log(`PASS ${reconciled} reconciled, ${assets.length} total`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
