/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module digitalCore/controller/defaultDigitalBundleListingController
 * @description Dispatches participant bundle publication/recovery and runtime-only publication proof.
 * Inputs: Signed tenant/Enterprise/bearer and fixed route-specific body; optional callback.
 * Outputs: Owner {data} envelopes; callback mode returns undefined.
 * Effects: Sets no-store, preserves auth and calls fixed owner/member pairs; only explicit commands mutate
 * owners.
 * Failure behavior: Synchronous dispatch setup may throw; owner rejection propagates to Promise/callback.
 * Exported members: dispatch, commandStatus, commandResume, giftStatus, composition, publish, proof.
 * @owner digitalCore
 * @layer controller
 * @override Extend fixed member dispatch, not caller-selected service names; retain original auth and owner
 * reauthorization.
 * @see ../../llm/contracts/bundle-publication.md
 */
module.exports = {
  /**
   * Dispatches an owner-authorized private command with the current signed context.
   * @param {Object} request Routed request with authData, httpRequest.body and original bearer/header.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback.
   * @param {string} method Fixed member selected by this controller.
   * @param {string} [owner="DefaultDigitalCommerceAuctionService"] Fixed registered service selected by this
   * controller, not by body fields.
   * @returns {Promise<Object>|undefined} Owner result wrapped as {data}; callback mode returns undefined.
   * @remarks Effects: Sets no-store, copies signed tenant/Enterprise context and dispatches to the fixed
   * owner; effects depend on method.
   * Failure behavior: Malformed request/missing service can throw synchronously; owner rejection propagates
   * to Promise/callback.
   * @override Keep signed scope and bearer, fixed service/member selection and owner reauthorization.
   */
  dispatch: function (
    request,
    callback,
    method,
    owner = "DefaultDigitalCommerceAuctionService",
  ) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const auth = request.authData || {};
    const r = {
      ...request,
      tenant: auth.tenant,
      enterpriseCode: auth.enterpriseCode || auth.entCode,
      authorization:
        request.authorization || request.httpRequest?.headers?.authorization,
    };
    const promise = SERVICE[owner][method](
      r,
      request.httpRequest.body || {},
    ).then(function (data) {
      return { data };
    });
    if (!callback) return promise;
    promise
      .then(function (value) {
        callback(null, value);
      })
      .catch(callback);
  },
  /**
   * Read the exact original manifest/operation; never repeats a mutation.
   * @param {Object} r Routed request with signed authData/tenant, original bearer and httpRequest.body
   * containing ownerRef and manifestKey.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback; absent returns
   * the owner Promise.
   * @returns {Promise<Object>|undefined} Exact original command status, including UNCONFIRMED without
   * replacement authority. Wrapped in {data}; undefined in callback mode.
   * @remarks Effects: Reads the recovery owner; does not repeat a mutation. Dispatch sets no-store.
   * Failure behavior: Owner admission/evidence failures reject or call callback; synchronous dispatch setup
   * may throw.
   * @override Keep unknown state non-authorizing.
   */
  commandStatus: function (r, callback) {
    return this.dispatch(
      r,
      callback,
      "query",
      "DefaultDigitalBundleRecoveryService",
    );
  },
  /**
   * Explicitly continue only the owner-retained original command.
   * @param {Object} r Routed request with signed authData/tenant, original bearer and httpRequest.body
   * containing ownerRef, manifestKey and confirmed:true.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback; absent returns
   * the owner Promise.
   * @returns {Promise<Object>|undefined} Original resumed command result. Wrapped in {data}; undefined in
   * callback mode.
   * @remarks Effects: Explicitly resumes persisted gift/publication instructions and their owner side
   * effects. Dispatch sets no-store.
   * Failure behavior: Owner admission/evidence failures reject or call callback; synchronous dispatch setup
   * may throw.
   * @override Never accept a replacement manifest, terms or command key.
   */
  commandResume: function (r, callback) {
    return this.dispatch(
      r,
      callback,
      "resume",
      "DefaultDigitalBundleRecoveryService",
    );
  },
  /**
   * Exact current gift decision state, independent of list pagination.
   * @param {Object} r Routed request with signed authData/tenant, original bearer and httpRequest.body
   * containing operationCode and current ownerRef.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback; absent returns
   * the owner Promise.
   * @returns {Promise<Object>|undefined} Exact gift state and whether its retained decision can resume.
   * Wrapped in {data}; undefined in callback mode.
   * @remarks Effects: Reads one gift independently of list pagination. Dispatch sets no-store.
   * Failure behavior: Owner admission/evidence failures reject or call callback; synchronous dispatch setup
   * may throw.
   * @override Preserve participant admission and exact operation identity.
   */
  giftStatus: function (r, callback) {
    return this.dispatch(
      r,
      callback,
      "inspectGift",
      "DefaultDigitalBundleRecoveryService",
    );
  },
  /**
   * Current participant and governed composition choices; no mutation or provisioning.
   * @param {Object} r Routed request with signed authData/tenant, original bearer and httpRequest.body
   * containing empty body under the original participant token.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback; absent returns
   * the owner Promise.
   * @returns {Promise<Object>|undefined} Current owner and governed composition choices. Wrapped in {data};
   * undefined in callback mode.
   * @remarks Effects: Reads Profile, listing contexts and owner placement/evidence; creates no records.
   * Dispatch sets no-store.
   * Failure behavior: Owner admission/evidence failures reject or call callback; synchronous dispatch setup
   * may throw.
   * @override Keep Gift availability independent of listing qualification.
   */
  composition: function (r, callback) {
    return this.dispatch(
      r,
      callback,
      "read",
      "DefaultDigitalBundleCompositionService",
    );
  },
  /**
   * Owner-authorized confirmed listing command.
   * @param {Object} r Routed request with signed authData/tenant, original bearer and httpRequest.body
   * containing confirmed manifest/revision, listingContextRef, key and reviewed terms.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback; absent returns
   * the owner Promise.
   * @returns {Promise<Object>|undefined} Original publication receipt. Wrapped in {data}; undefined in
   * callback mode.
   * @remarks Effects: Reserves components and coordinates Product/Pricing/Bidding publication. Dispatch sets
   * no-store.
   * Failure behavior: Owner admission/evidence failures reject or call callback; synchronous dispatch setup
   * may throw.
   * @override Retain original terms and uncertain holds; never infer activation.
   */
  publish: function (r, callback) {
    return this.dispatch(r, callback, "publish");
  },
  /**
   * Exact runtime-only source evidence.
   * @param {Object} r Routed request with signed authData/tenant, original bearer and httpRequest.body
   * containing operationCode and storeCode under a qualified runtime principal.
   * @param {function(Error|null, Object=):*} [callback] Optional error-first {data} callback; absent returns
   * the owner Promise.
   * @returns {Promise<Object>|undefined} Retained runtime publication evidence. Wrapped in {data}; undefined
   * in callback mode.
   * @remarks Effects: Reads exact manifest, terms and component hold checkpoints. Dispatch sets no-store.
   * Failure behavior: Owner admission/evidence failures reject or call callback; synchronous dispatch setup
   * may throw.
   * @override Require runtime proof authority, not participant UI permission.
   */
  proof: function (r, callback) {
    return this.dispatch(r, callback, "proof");
  },
};
