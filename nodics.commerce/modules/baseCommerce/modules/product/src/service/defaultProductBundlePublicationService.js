/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto"), { isDeepStrictEqual: same } = require("node:util");
const capability = Symbol("Product bundle publication admission"), admissions = new WeakMap();
/**
 * @module product/service/defaultProductBundlePublicationService
 * @description Publishes independently proven held bundles under an explicit automatic policy,
 * preserving exact Product graphs and nPublish audit/activation.
 * @layer service
 * @owner product
 * @remarks Product bundle publication is an explicit inert-by-default automatic policy over existing
 * Product/nPublish owners. Private capabilities remain nonserializable, and each result requires
 * original Digital proof and actual Online/withdrawal receipt.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: policy, admission, source, execute.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Reads complete framework definitions; automatic policy is disabled until intentionally selected.
   * @returns {Object} Detached validated effective automatic-publication policy.
   * @remarks Effects: Reads framework-owned properties only.
   * Failure behavior: Rejects disabled/incomplete policy or invalid bounds/target.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  policy: function () {
    const p = CONFIG.get("product")?.marketplaceAuthoring?.bundlePublication;
    if (p?.enabled !== true || p.source?.moduleName !== "digitalCore" || !p.source.connectionName ||
        p.source.targetAuthority?.runtimeRole !== "COMMERCE" || !Number.isSafeInteger(p.source.timeoutMs) ||
        p.source.timeoutMs < 1 || p.source.maxAttempts !== 1) throw new Error("Automatic bundle publication is not configured");
    return structuredClone(p);
  },
  /**
   * Private capabilities survive internal request composition, never serialization or caller flags.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {Object|undefined} Detached admitted scope and original command pins, or undefined outside
   * this path.
   * @remarks Effects: Reads private identity-bound capability; never accepts serialized flags.
   * Failure behavior: Rejects changed or expired continuation evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  admission: function (r) {
    const a = admissions.get(r?.[capability]);
    if (!a) return undefined;
    a.check();
    if (r.tenant !== a.scope.tenant || !same(r.authData, a.auth)) throw new Error("Automatic Product authority changed");
    return { scope: structuredClone(a.scope), command: structuredClone(a.command), productCode: a.productCode,
      publicationCode: a.publicationCode };
  },
  /**
   * Source proof is fetched with this Staged runtime's own identity at one fixed owner endpoint.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} selectors Exact original publication/source coordinates.
   * @returns {Promise<Object>} Detached original Digital source proof.
   * @remarks Effects: Calls one fixed owner endpoint with runtime identity; no human approval is
   * fabricated.
   * Failure behavior: Rejects unavailable, malformed, foreign or mismatched retained proof.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  source: async function (r, selectors) {
    const policy = this.policy(), token = NODICS.getInternalAuthToken?.(r.tenant);
    if (typeof token !== "string" || !token) throw new Error("Product source runtime authentication unavailable");
    let result = await SERVICE.DefaultModuleService.invokeModule({ ...policy.source, local: false, tenant: r.tenant,
      methodName: "POST", apiName: "/internal/bundle-listings/proof", requestBody: selectors,
      header: { Authorization: "Bearer " + token, tenant: r.tenant }, followRedirects: false, rejectUnauthorized: true });
    for (let depth = 0; depth < 8 && result; depth++) {
      if (result.error || result.success === false || result.acknowledged === false || /^ERR_/.test(result.code || "") ||
          result.errors && (!Array.isArray(result.errors) || result.errors.length)) throw new Error("Digital listing evidence failed");
      if (result.data !== undefined) result = result.data;
      else if (result.result !== undefined) result = result.result;
      else break;
    }
    if (!same(policy, this.policy()) || result?.confirmed !== true || result.tenant !== r.tenant ||
        result.operationCode !== selectors.operationCode || result.terms?.storeCode !== selectors.storeCode ||
        !/^[a-f0-9]{64}$/.test(result.termsDigest || "") || !result.ownerRef ||
        result.ownerRef.module !== "profile" || !["customer", "enterprise"].includes(result.ownerRef.schema) || !result.ownerRef.code ||
        !result.manifest?.code || !Number.isSafeInteger(result.manifest.revision) || result.manifest.revision < 0 ||
        !/^[a-f0-9]{64}$/.test(result.manifest.digest || "")) throw new Error("Original Digital listing proof is unavailable");
    return structuredClone(result);
  },
  /**
   * Executes only the original held publication; automatic approval is explicit audit evidence, never a
   * fabricated human task.
   * @param {Object} original Original admitted request or retained command, as described by this
   * operation.
   * @param {string} phase Fixed owner lifecycle phase; never arbitrary executable input.
   * @returns {Promise<Object>} Confirmed original prepared, ONLINE or WITHDRAWN Product
   * identity/receipt.
   * @remarks Effects: Uses existing immutable graph, publication and activation owners with explicit
   * automatic audit evidence.
   * Failure behavior: Rejects absent private admission, drift, partial owner effects or missing exact
   * activation/withdrawal receipt.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  execute: async function (original, phase) {
    if (!["prepare", "publish", "inspect", "withdraw"].includes(phase)) throw new Error("Unsupported bundle publication phase");
    const author = SERVICE.DefaultProductListingAuthoringService;
    const scope = author.runtimeScope(original), policy = this.policy(), auth = structuredClone(original.authData);
    const selectors = structuredClone(original.payload), state = author.requestState(original);
    if (!selectors || Object.keys(selectors).sort().join(',') !== 'operationCode,storeCode' ||
        !/^bundle-operation:[a-f0-9]{64}$/.test(selectors.operationCode || '') ||
        typeof selectors.storeCode !== 'string' || !selectors.storeCode || Object.keys(original.query || {}).length)
      throw new Error("Exact bundle publication selectors are required");
    const check = () => {
      if (!same(scope, author.runtimeScope(original)) || !same(policy, this.policy()) || !same(state, author.requestState(original)))
        throw new Error("Automatic Product command changed");
    };
    const proof = await this.source(original, selectors); check();
    if (proof.enterpriseCode !== scope.enterpriseCode) throw new Error("Bundle publication Enterprise changed");
    const sourceRef = { module: "digitalCore", schema: "digitalBundleManifest", code: proof.manifest.code };
    const command = { sourceRef, ownerRef: proof.ownerRef, name: proof.terms.name,
      ...(proof.terms.description !== undefined ? { description: proof.terms.description } : {}),
      idempotencyKey: proof.operationCode, bundleRef: { ...sourceRef, revision: proof.manifest.revision, digest: proof.manifest.digest },
      listingWindow: { startsAt: proof.terms.startsAt, endsAt: proof.terms.endsAt }, categoryCodes: proof.terms.categoryCodes,
      saleMode: proof.terms.saleMode, biddingEnabled: proof.terms.saleMode === "AUCTION", publicationCode: proof.operationCode };
    author.listingTerms(command);
    const productCode = "LISTING_" + crypto.createHash("sha256")
      .update(original.tenant + ":digitalCore:" + proof.manifest.code + ":" + proof.operationCode).digest("hex").slice(0, 24).toUpperCase();
    const token = {}, r = { ...original, authData: auth, [capability]: token };
    admissions.set(token, { scope, auth, command, productCode, publicationCode: proof.operationCode, check });
    try {
      // Store placement is independently re-read through its existing configured owner and original runtime admission.
      const savedPayload = original.payload;
      let placement;
      try { original.payload = { contractVersion: 1, storeCode: selectors.storeCode };
        placement = await author.storeContext(original);
      } finally { original.payload = savedPayload; }
      check();
      if (placement.store.enterpriseCode !== scope.enterpriseCode) throw new Error("Bundle Store placement changed");
      if (phase === "prepare") {
        if (proof.release) throw new Error("Released listing cannot be authored");
        const product = await author.create(r); check();
        if (!same(await this.source(original, selectors), proof)) throw new Error("Bundle proof changed during authoring");
        return { confirmed: true, publicationCode: proof.operationCode, ...product };
      }
      const product = proof.product;
      if (product?.productCode !== productCode || product.variantCode !== productCode + "_VARIANT" ||
          product.sku !== productCode + "_SKU" || !Number.isSafeInteger(product.versionId) || product.versionId < 0)
        throw new Error("Retained Product authoring receipt is required");
      const lifecycle = SERVICE.DefaultPublicationLifecycleService, provider = SERVICE.DefaultProductPublicationVersionProviderService;
      let publication;
      if (phase === "publish") {
        if (proof.release || proof.price?.confirmed !== true || proof.price.operationCode !== proof.operationCode ||
            proof.price.productCode !== productCode || proof.price.variantCode !== product.variantCode ||
            proof.price.amount !== proof.terms.amount || proof.price.currency !== proof.terms.currency ||
            proof.price.storeCode !== selectors.storeCode || !proof.price.receiptCode)
          throw new Error("Independent Pricing publication evidence is required");
        publication = await SERVICE.DefaultProductGovernedPublicationService.create(r, {
          publicationCode: proof.operationCode, productCode, storeCode: selectors.storeCode, versionId: product.versionId });
        if (publication.state === 'FAILED') publication = await lifecycle.retry({ ...r, publicationCode: publication.code,
          expectedRevision: publication.revision, reason: 'Recover original immutable bundle publication' });
        if (publication.state === 'VALIDATING') publication = await lifecycle.validate({ ...r, publicationCode: publication.code,
          expectedRevision: publication.revision });
        if (publication.state === "VALIDATED") {
          if (!same(await this.source(original, selectors), proof)) throw new Error("Listing proof changed before automatic admission");
          publication = await lifecycle.transition(publication, "APPROVED", { ...r, expectedRevision: publication.revision }, {}, {
            automatic: { policy: "HELD_BUNDLE_LISTING", operationCode: proof.operationCode,
              termsDigest: proof.termsDigest, manifestDigest: proof.manifest.digest, priceReceiptCode: proof.price.receiptCode } });
        }
        if (["APPROVED", "ACTIVATING"].includes(publication.state))
          publication = await lifecycle.activate({ ...r, publicationCode: publication.code, expectedRevision: publication.revision });
      } else publication = await lifecycle.get({ ...r, publicationCode: proof.operationCode });
      check();
      const automatic = publication.auditTrail?.find(entry => entry.toState === "APPROVED" && entry.details?.automatic);
      if (!automatic || automatic.details.automatic.operationCode !== proof.operationCode ||
          automatic.details.automatic.termsDigest !== proof.termsDigest) throw new Error("Original automatic publication audit is required");
      if (phase === "withdraw") {
        if (!proof.release?.roundCode || !proof.release.idempotencyKey) throw new Error("Digital release fence is required");
        if (publication.state === "ONLINE") publication = await lifecycle.transition(publication, "WITHDRAWING",
          { ...r, expectedRevision: publication.revision, reason: "Original auction closed" }, {}, { automatic: proof.release });
        if (publication.state === "WITHDRAWING") {
          // An uncertain target response retains the original fence for recovery, never becomes permission to release holdings.
          const result = await provider.withdraw(publication, r);
          const adapter = lifecycle.getDomainAdapter(publication.domain);
          if (adapter.afterWithdraw) await adapter.afterWithdraw(publication, result, r);
          publication = await lifecycle.transition(publication, "WITHDRAWN", { ...r, expectedRevision: publication.revision }, {}, result);
        }
        if (publication.state !== "WITHDRAWN") throw new Error("Product withdrawal requires reconciliation");
        const manifest = await provider.getVersion(publication, r);
        const key = provider.operationKey(publication, "withdraw", publication.targetVersion);
        const status = await provider.transport().getStatus({ scope: manifest.scope, operationKey: key }, r);
        if (status.version !== null || status.receipt?.committed !== true || status.receipt.operationKey !== key ||
            status.receipt.publicationCode !== publication.code || status.receipt.operation !== "WITHDRAW")
          throw new Error("Exact Product withdrawal receipt is unavailable");
        check();
        return { confirmed: true, status: "WITHDRAWN", publicationCode: publication.code, activeVersion: null, receiptCode: key };
      }
      if (publication.state !== "ONLINE") throw new Error("Product publication requires reconciliation");
      const manifest = await provider.getVersion(publication, r), status = await provider.reconcile(publication, r);
      if (manifest.root.code !== productCode || status.version !== manifest.version || status.receipt?.committed !== true ||
          status.receipt.operationKey !== publication.activationOperation?.key || status.receipt.publicationCode !== publication.code ||
          status.receipt.targetVersion !== manifest.version || status.receipt.sourceVersion !== publication.sourceVersion)
        throw new Error("Exact Online Product activation is unconfirmed");
      check();
      return { confirmed: true, status: "ONLINE", publicationCode: publication.code, productCode, variantCode: product.variantCode,
        storeCode: selectors.storeCode, targetVersion: manifest.version, receiptCode: status.receipt.operationKey };
    } finally { admissions.delete(token); }
  },
};
