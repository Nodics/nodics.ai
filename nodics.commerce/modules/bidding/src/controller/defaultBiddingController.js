/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module bidding/controller/defaultBiddingController
 * @description Maps authenticated participant commands into Commerce bidding without accepting
 * caller-owned identity or an executable service name.
 * @layer controller
 * @owner bidding
 * @remarks HTTP adapters preserve original signed requests and dispatch only fixed Bidding owner
 * operations. Controllers return owner envelopes; optional Node-style callbacks receive the same
 * result/error. Route admission never substitutes for participant, scheduler or source-proof checks.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: publicAuctionPublication, closeDueAuctions, auctionNotificationSource,
 * auctionNotificationEligibility, invoke, list, read, create, decide, openAuction, auctionPublication,
 * readAuction, listAuctions, commandAuction, auctionFundsEvidence.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Projects only public publication/round coordinates to authenticated owner adapters.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Read-only owner delegation; response remains bounded to the route's admitted
   * projection.
   * Failure behavior: Owner/normalization failures reject the Promise or reach the error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  publicAuctionPublication: function (request, callback) {
    request.httpResponse?.setHeader('Cache-Control', 'no-store');
    const promise = SERVICE.DefaultBiddingAuctionService.publicPublication(request).then(data => ({ data }));
    return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
  },
  /**
   * Runs bounded due work in Commerce using the original signed Cron runtime, never a substituted local
   * actor.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Delegates the fixed operation; the owner may persist round transitions and
   * qualified financial/notification intents.
   * Failure behavior: Owner admission, payload, persistence and recovery failures reject or reach the
   * error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  closeDueAuctions: function (request, callback) {
    request.httpResponse?.setHeader('Cache-Control', 'no-store');
    const http = request.httpRequest || {}, body = http.body || {};
    const promise = Promise.resolve().then(() => {
      if (Object.keys(body).sort().join(',') !== 'afterCode') throw new Error('Invalid auction sweep request');
      return SERVICE.DefaultBiddingCloseService.runDue({ tenant: request.tenant, authData: request.authData,
        authorization: http.headers?.authorization || http.headers?.Authorization, afterCode: body.afterCode });
    }).then(data => ({ data }));
    return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
  },
  /**
   * Keeps the original private request capture for Profile's exact committed source callback.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Read-only owner delegation; response remains bounded to the route's admitted
   * projection.
   * Failure behavior: Owner/normalization failures reject the Promise or reach the error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  auctionNotificationSource: function (request, callback) {
    request.httpResponse?.setHeader('Cache-Control', 'no-store');
    const promise = SERVICE.DefaultBiddingAuctionNotificationService.source(request).then(data => ({ data }));
    return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
  },
  /**
   * Communication rechecks frozen recipient eligibility without requesting another intent.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Read-only owner delegation; response remains bounded to the route's admitted
   * projection.
   * Failure behavior: Owner/normalization failures reject the Promise or reach the error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  auctionNotificationEligibility: function (request, callback) {
    request.httpResponse?.setHeader('Cache-Control', 'no-store');
    const promise = SERVICE.DefaultBiddingAuctionNotificationService.eligibility(request).then(data => ({ data }));
    return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
  },
  /**
   * Maps bounded HTTP fields while preserving the trusted authentication envelope.
   * @param {string} operation Fixed owner operation selected by the adapter.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Delegates the fixed operation; the owner may persist round transitions and
   * qualified financial/notification intents.
   * Failure behavior: Owner admission, payload, persistence and recovery failures reject or reach the
   * error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  invoke: function (operation, request, callback) {
    const http = request.httpRequest || {},
      body = http.body || {},
      headers = http.headers || {};
    const input = {
      tenant: request.tenant,
      authData: request.authData,
      authorization: headers.authorization || headers.Authorization,
      code: http.params?.code,
      storeCode: http.query?.storeCode,
      afterCode: http.query?.afterCode,
      payload: body,
      idempotencyKey: headers["idempotency-key"] || body.idempotencyKey,
      correlationId: headers["x-correlation-id"] || request.requestId,
    };
    const promise = Promise.resolve()
      .then(() => SERVICE.DefaultBiddingService[operation](input))
      .then((data) => ({ data }));
    return callback
      ? promise.then((value) => callback(null, value)).catch(callback)
      : promise;
  },
  /** Returns only the current participant's incoming and outgoing bids. */
  list: function (request, callback) {
    return this.invoke("list", request, callback);
  },
  /** Returns one current participant's bid. */
  read: function (request, callback) {
    return this.invoke("read", request, callback);
  },
  /** Persists confirmed bid terms. */
  create: function (request, callback) {
    return this.invoke("create", request, callback);
  },
  /** Applies a confirmed seller or buyer decision. */
  decide: function (request, callback) {
    return this.invoke("decide", request, callback);
  },
  /**
   * Creates one seller-authorized Product publication round.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Delegates the fixed operation; the owner may persist round transitions and
   * qualified financial/notification intents.
   * Failure behavior: Owner admission, payload, persistence and recovery failures reject or reach the
   * error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  openAuction: function (request, callback) { return this.invoke("openAuction", request, callback); },
  /**
   * Reads published round-opening terms under the original participant authority.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Read-only owner delegation; response remains bounded to the route's admitted
   * projection.
   * Failure behavior: Owner/normalization failures reject the Promise or reach the error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  auctionPublication: function (request, callback) { return this.invoke('auctionPublication', request, callback); },
  /**
   * Returns aggregate and role-scoped auction details.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Read-only owner delegation; response remains bounded to the route's admitted
   * projection.
   * Failure behavior: Owner/normalization failures reject the Promise or reach the error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  readAuction: function (request, callback) { return this.invoke("readAuction", request, callback); },
  /**
   * Pages only participant-owned or seller-managed rounds.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Read-only owner delegation; response remains bounded to the route's admitted
   * projection.
   * Failure behavior: Owner/normalization failures reject the Promise or reach the error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  listAuctions: function (request, callback) { return this.invoke("listAuctions", request, callback); },
  /**
   * Applies a confirmed round-fenced participant command.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Delegates the fixed operation; the owner may persist round transitions and
   * qualified financial/notification intents.
   * Failure behavior: Owner admission, payload, persistence and recovery failures reject or reach the
   * error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  commandAuction: function (request, callback) { return this.invoke("commandAuction", request, callback); },
  /**
   * Exposes a read-only exact funds command proof to the canonical Loyalty adapter.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {function(Error|null, *=):*} [callback] Optional error-first completion callback; receives
   * the same success/error as owner dispatch.
   * @returns {Promise<*>} Owner result envelope, or the callback's resulting value when supplied.
   * @remarks Effects: Read-only owner delegation; response remains bounded to the route's admitted
   * projection.
   * Failure behavior: Owner/normalization failures reject the Promise or reach the error-first callback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  auctionFundsEvidence: function (request, callback) {
    const http = request.httpRequest || {};
    const promise = SERVICE.DefaultBiddingAuctionFundsEvidenceService.authorize({ tenant: request.tenant,
      authData: request.authData, authorization: http.headers?.authorization || http.headers?.Authorization,
      payload: http.body }).then(data => ({ data }));
    return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
  },
};
