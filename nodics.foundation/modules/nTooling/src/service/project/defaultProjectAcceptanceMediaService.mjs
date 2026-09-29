/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectAcceptanceMediaService
 * @description Builds acceptance uploads for the Media-owned storage API.
 * @owner nTooling
 * @layer tooling
 * Projects supply URL, headers, metadata and business purpose, and interpret
 * the HTTP outcome. Importing performs no filesystem or network operations.
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/** @param {string} fileName Asset filename. @returns {string} Upload MIME type. */
export function acceptanceMediaMimeType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

/**
 * Read a local asset and submit the Media multipart contract without JSON headers.
 * @param {object} options URL, headers, asset, assetFilesRoot, businessPurpose
 * and optional fetchImpl for isolated tests or a caller-owned transport. A
 * prevalidated buffer preserves the exact bytes checked by the owning suite.
 * @returns {Promise<Response>} Unconsumed response; missing files and I/O reject.
 */
export async function uploadAcceptanceMedia({
  url, headers, asset, assetFilesRoot, businessPurpose, buffer: suppliedBuffer, fetchImpl = fetch,
}) {
  const filePath = path.join(assetFilesRoot, asset.fileName);
  if (!existsSync(filePath)) throw new Error(`Asset file is missing: ${filePath}`);
  const buffer = suppliedBuffer || await fs.readFile(filePath);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: acceptanceMediaMimeType(asset.fileName) }), asset.fileName);
  form.append("folderCode", asset.folderCode || "cmsAssets");
  form.append("formatCode", asset.formatCode || "original");
  form.append("mediaCode", asset.mediaCode);
  form.append("name", asset.name || asset.mediaCode);
  form.append("description", asset.description || asset.name || asset.mediaCode);
  form.append("moduleName", "media");
  form.append("schemaName", "media");
  form.append("businessPurpose", businessPurpose);
  form.append("ownerType", asset.ownerType || "CMS_COMPONENT");
  form.append("ownerReference", asset.ownerCode || asset.ownerReference || asset.mediaCode);
  return fetchImpl(url, {
    method: "POST",
    headers: {
      ...headers,
    },
    body: form,
  });
}
