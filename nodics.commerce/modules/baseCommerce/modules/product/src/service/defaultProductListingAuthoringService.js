/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
/** @module product/service/defaultProductListingAuthoringService @description Authors a source-referenced listing using Product-owned records without taking ownership of prices or inventory. @layer service @owner product */
module.exports = {
  /** Authors immutable listing identity after a trusted application confirmed its source asset. */
  create: async function (request) {
    const policy = (CONFIG.get("product") || {}).marketplaceAuthoring || {},
      p = request.payload || {};
    if (policy.enabled !== true)
      throw new Error("Marketplace authoring is not enabled on this runtime");
    if (
      !p.sourceRef ||
      !p.sourceRef.module ||
      !p.sourceRef.schema ||
      !p.sourceRef.code ||
      !p.ownerRef ||
      !p.ownerRef.code ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      p.name.length > 180 ||
      !p.idempotencyKey
    )
      throw new Error(
        "A source, owner, title and listing reference are required",
      );
    const code =
        "LISTING_" +
        crypto
          .createHash("sha256")
          .update(
            request.tenant +
              ":" +
              p.sourceRef.module +
              ":" +
              p.sourceRef.code +
              ":" +
              p.idempotencyKey,
          )
          .digest("hex")
          .slice(0, 24)
          .toUpperCase(),
      variantCode = code + "_VARIANT",
      sku = code + "_SKU";
    const context = {
      tenant: request.tenant,
      authData: request.authData,
      options: { recursive: false },
    };
    const now = new Date(),
      base = {
        tenant: request.tenant,
        enterpriseCode:
          request.authData.entCode ||
          request.authData.enterpriseCode ||
          request.tenant,
        active: true,
        revision: 1,
        created: now,
        updated: now,
        status: "ACTIVE",
      };
    const product = Object.assign({}, base, {
      code,
      name: p.name.trim(),
      catalogVersion: policy.catalogVersion,
      productType: "DIGITAL",
      fulfillmentStrategy: "DIGITAL_COMMERCE",
    });
    await SERVICE.DefaultProductService.save(
      Object.assign({}, context, { query: { code }, model: product }),
    );
    const attributes = {
      kind: "ASSET",
      assetCode: p.sourceRef.code,
      sourceRef: p.sourceRef,
      ownerRef: p.ownerRef,
      ...(p.biddingEnabled === true
        ? { commerceBidding: { enabled: true, sellerRef: p.ownerRef } }
        : {}),
      issuer: p.issuer || "Community asset",
      imageUrl: p.imageUrl,
      sample: p.sample === true,
    };
    await SERVICE.DefaultProductVariantService.save(
      Object.assign({}, context, {
        query: { code: variantCode },
        model: Object.assign({}, base, {
          code: variantCode,
          productCode: code,
          sku,
          attributes,
        }),
      }),
    );
    for (const locale of policy.locales || ["en"]) {
      const localization = Object.assign({}, base, {
        code: code + "-" + locale,
        productCode: code,
        locale,
        name: p.name.trim(),
        description: String(p.description || "").slice(0, 2000),
        slug: code.toLowerCase(),
        attributes,
        status: "READY",
      });
      await SERVICE.DefaultProductLocalizationService.save(
        Object.assign({}, context, {
          query: { code: localization.code },
          model: localization,
        }),
      );
      const variantLocalization = Object.assign({}, base, {
        code: variantCode + "-" + locale,
        variantCode,
        productCode: code,
        locale,
        attributes,
        status: "READY",
      });
      await SERVICE.DefaultProductVariantLocalizationService.save(
        Object.assign({}, context, {
          query: { code: variantLocalization.code },
          model: variantLocalization,
        }),
      );
    }
    return {
      productCode: code,
      variantCode,
      sku,
      catalogVersion: policy.catalogVersion,
    };
  },
};
