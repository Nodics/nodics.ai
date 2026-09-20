/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");

/** @module media/service/defaultCustomerMediaService @description Stores immutable customer photos through existing multipart intake and provider storage, with owner-scoped reads. @layer service @owner media @override Customer upload limits and folders use layered media configuration. */
module.exports = {
  /** Returns the trusted customer identity. */
  owner: async function (request) {
    const auth = request.authData || {};
    if (auth.principalType !== "customer" || !auth.loginId || !auth.tenant ||
        (request.tenant && request.tenant !== auth.tenant) ||
        typeof request.authorization !== "string" || !/^Bearer \S+$/i.test(request.authorization))
      throw new CLASSES.NodicsError(
        "ERR_MED_00007",
        "A customer session is required",
      );
    let result = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      apiName: "/customer",
      methodName: "POST",
      tenant: auth.tenant,
      header: { Authorization: request.authorization },
      request: { tenant: auth.tenant },
      requestBody: {
        query: { loginId: auth.loginId },
        options: { recursive: false },
        searchOptions: { pageSize: 1 },
      },
    });
    for (let n = 0; n < 5 && result && !Array.isArray(result); n++) {
      if (result.data !== undefined) result = result.data;
      else if (result.result !== undefined) result = result.result;
      else break;
    }
    const customer = Array.isArray(result) ? result[0] : result;
    if (!customer || !customer.code || customer.loginId !== auth.loginId)
      throw new CLASSES.NodicsError(
        "ERR_MED_00007",
        "Customer identity is unavailable",
      );
    return customer.code;
  },
  /** Creates a generated-service context after customer authorization. */
  context: function (request) {
    return {
      tenant: request.authData.tenant,
      authData: Object.assign({}, request.authData, {
        principalType: "service",
        code: "customerMediaService",
        loginId: "customerMediaService",
        userGroups: ["serviceAccountUserGroup"],
        groups: ["serviceAccountUserGroup"],
      }),
    };
  },
  /** Copies safe descriptor fields; physical storage addresses stay private. */
  project: function (item) {
    return {
      code: item.code,
      mimeType: item.mimeType,
      originalFileName: item.originalFileName,
      sizeBytes: item.sizeBytes,
      checksum: item.checksum,
      ownerReference: item.ownerReference,
    };
  },
  /** Accepts bounded encoded bytes for service-orchestrated customer uploads after domain preparation. Storage remains Media-owned. */
  uploadEncoded: async function (request) {
    const owner = await this.owner(request), input = request.payload || {};
    const maximum = Number((CONFIG.get("media") || {}).customerUploads?.maximumBytes || 5242880);
    if (typeof input.contentBase64 !== "string" || input.contentBase64.length > Math.ceil(maximum / 3) * 4 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(input.contentBase64) || input.contentBase64.length % 4 ||
      !/^image\/(jpeg|png|webp)$/.test(input.mimeType || "") || typeof input.idempotencyKey !== "string" || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 200)
      throw new CLASSES.NodicsError("ERR_MED_00007", "A supported photo and upload reference are required");
    const buffer = Buffer.from(input.contentBase64, "base64");
    if (!buffer.length || buffer.length > maximum || buffer.toString("base64") !== input.contentBase64)
      throw new CLASSES.NodicsError("ERR_MED_00007", "Photo content is invalid or too large");
    const code = "PHOTO_" + crypto.createHash("sha256").update(owner + ":" + input.idempotencyKey).digest("hex").slice(0, 32).toUpperCase();
    let existing;
    try { existing = await SERVICE.DefaultMediaReferenceLookupService.loadReference(this.context(request), "MEDIA", code); }
    catch (error) { if (error.code !== "ERR_MED_00008") throw error; }
    if (existing) {
      const checksum = crypto.createHash(existing.checksumAlgorithm || "sha256").update(buffer).digest("hex");
      if (existing.ownerType !== "CUSTOMER" || existing.ownerReference !== owner || existing.checksum !== checksum)
        throw new CLASSES.NodicsError("ERR_MED_00007", "The upload reference is already in use");
      return this.project(existing);
    }
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[input.mimeType];
    const originalFileName = typeof input.originalFileName === "string" && input.originalFileName.length <= 255
      ? input.originalFileName.split(/[\\/]/).pop() : "item-photo." + extension;
    return this.upload({ ...request, mediaCode: code, files: [{ buffer, mimeType: input.mimeType, sizeBytes: buffer.length,
      originalFileName, fileName: originalFileName }] });
  },
  /** Persists exactly one original photo; callers cannot select the storage path or owner. */
  upload: async function (request) {
    const owner = await this.owner(request);
    const media = CONFIG.get("media") || {},
      policy = media.customerUploads || {};
    if (policy.enabled !== true)
      throw new CLASSES.NodicsError(
        "ERR_MED_00007",
        "Customer uploads are not enabled",
      );
    const files = Array.isArray(request.files)
      ? request.files
      : Object.values(request.files || {}).flat();
    const file = files[0];
    if (
      files.length !== 1 ||
      !file ||
      !/^image\/(jpeg|png|webp)$/.test(file.mimeType || file.mimetype || "") ||
      !Buffer.isBuffer(file.buffer) ||
      file.buffer.length > Number(policy.maximumBytes || 5242880)
    )
      throw new CLASSES.NodicsError(
        "ERR_MED_00007",
        "Choose one JPEG, PNG or WebP photo within the upload limit",
      );
    const result = await SERVICE.DefaultMediaUploadService.upload(
      Object.assign(this.context(request), {
        files: files,
        mediaCode:
          request.mediaCode || "PHOTO_" + crypto.randomUUID().replace(/-/g, "").toUpperCase(),
        folderCode: policy.folderCode,
        formatCode: "original",
        ownerType: "CUSTOMER",
        ownerReference: owner,
        businessPurpose: "CUSTOMER_SUBMISSION",
        reusable: false,
      }),
    );
    return this.project(result);
  },
  /** Reads one bounded photo for its owner or an authorized staff reviewer. */
  read: async function (request) {
    const auth = request.authData || {},
      groups = (auth.userGroups || auth.groups || []).map((g) =>
        typeof g === "string" ? g : g.code,
      );
    const staff =
      (auth.principalType !== "customer" &&
        groups.some((g) => ["adminGroup", "employeeUserGroup"].includes(g))) ||
      (request.internalEvidenceRead === true &&
        auth.principalType === "service" &&
        groups.includes("serviceAccountUserGroup"));
    const owner = staff ? undefined : await this.owner(request);
    const context = this.context(request);
    const item = await SERVICE.DefaultMediaReferenceLookupService.loadReference(
      context,
      "MEDIA",
      request.code,
    );
    const policy = (CONFIG.get("media") || {}).evidenceRead || {};
    const publicPreview =
      request.internalEvidenceRead === true &&
      auth.principalType === "service" &&
      groups.includes("serviceAccountUserGroup") &&
      item.ownerType !== "CUSTOMER" &&
      item.access === "PUBLIC" &&
      (policy.publicPreviewMimeTypes || []).includes(item.mimeType);
    if (!publicPreview && (
      item.ownerType !== "CUSTOMER" ||
      (!staff && item.ownerReference !== owner)
    ))
      throw new CLASSES.NodicsError("ERR_MED_00008", "Photo was not found");
    const buffer =
      await SERVICE.DefaultMediaStorageProviderRegistryService.read({
        tenant: context.tenant,
        providerCode: item.providerCode,
        storageKey: item.storageKey,
        maximumBytes: Number(policy.maximumBytes || 5242880),
      });
    return Object.assign(this.project(item), {
      previewType: publicPreview ? "PUBLIC_MEDIA" : "CUSTOMER_ORIGINAL",
      contentBase64: buffer.toString("base64"),
    });
  },
};
