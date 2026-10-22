/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual: same } = require('node:util');
/**
 * @module digitalCore/service/defaultDigitalBundleRecoveryService
 * @description Exact participant recovery over existing immutable manifests and operations. No
 * parallel workflow, credential retention or absence-based replacement.
 * @owner digitalCore
 * @layer service
 * @remarks Bundle recovery uses exact original keys and immutable manifest composition, never browser
 * credentials or a new journal. Generated reads are count-qualified; absence means UNCONFIRMED, not
 * permission to replace the command.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: settings, key, composition, exact, fence, retained, query, resume, inspectGift.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Framework mechanics only; business instructions remain in the original manifest.
   * @returns {Object} Validated effective recovery key/read mechanics.
   * @remarks Effects: Reads only implementing bundle policy.
   * Failure behavior: Rejects missing/invalid key length or exact-read bounds.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settings: function () {
    const p = CONFIG.get('digitalCore')?.bundles?.commandRecovery;
    if (!Number.isSafeInteger(p?.maximumKeyLength) || p.maximumKeyLength < 1 ||
        !Number.isSafeInteger(p.exactReadPageSize) || p.exactReadPageSize < 2)
      throw new Error('Bundle recovery configuration is incomplete');
    return p;
  },
  /**
   * Validates an opaque original key using owner-defined mechanics.
   * @param {*} value Value being validated, normalized or hashed according to this member's contract.
   * @returns {string} Unchanged valid original command key.
   * @remarks Effects: Delegates to effective Bundle.commandKey; no separate bound/default.
   * Failure behavior: Rejects blank/over-bound keys or invalid shared policy.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  key: function (value) {
    this.settings();
    return SERVICE.DefaultDigitalBundleService.commandKey(value);
  },
  /**
   * Normalize only the reviewed original instruction. This grants no hold, gift or publication
   * authority.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @param {Object} ownerRef Canonical typed Profile purchasing/selling owner reference.
   * @returns {Object} Normalized original GIFT/FIXED/AUCTION composition.
   * @remarks Effects: Pure reviewed-instruction validation; does not hold, gift or publish.
   * Failure behavior: Rejects extra fields, invalid key/recipient/mode or changed governed context.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  composition: function (input, ownerRef) {
    const b = SERVICE.DefaultDigitalBundleService;
    if (!input || !['GIFT', 'FIXED', 'AUCTION'].includes(input.mode) ||
        Object.keys(input).sort().join(',') !== (input.mode === 'GIFT' ? 'mode,operationKey,recipientRef' : 'mode,operationKey,terms'))
      throw new Error('Exact reviewed composition is required');
    const operationKey = this.key(input.operationKey);
    if (input.mode === 'GIFT') {
      const recipientRef = b.owner(input.recipientRef);
      if (same(recipientRef, ownerRef)) throw new Error('Same-owner gift is prohibited');
      return { mode: input.mode, operationKey, recipientRef };
    }
    if (input.terms?.saleMode !== input.mode) throw new Error('Listing mode changed');
    const terms = SERVICE.DefaultDigitalCommerceAuctionService.terms(input.terms), ref = input.terms.listingContextRef;
    this.key(ref?.code);
    if (!Number.isSafeInteger(ref?.revision) || ref.revision < 0 || Object.keys(ref).sort().join(',') !== 'code,revision')
      throw new Error('Original listing context is required');
    return { mode: input.mode, operationKey, terms: { ...terms, listingContextRef: { code: ref.code, revision: ref.revision } } };
  },
  /**
   * Exact count-qualified generated read; never scans a recent-history page for absence.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} service Effective generated owner service; not a caller-selected executable.
   * @param {Object} query Owner-scoped lookup selectors; never permission authority.
   * @returns {Promise<Object|undefined>} Single exact complete owner record or confirmed absence.
   * @remarks Effects: Private bounded count-qualified read, not recent-history search.
   * Failure behavior: Rejects failed, incomplete, duplicate or foreign rows.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  exact: async function (r, service, query) {
    const policy = this.settings();
    const p = SERVICE.DefaultDigitalCommerceEntitlementService, expected = structuredClone({ ...query, tenant: r.tenant, active: true });
    const input = { tenant: r.tenant, authData: p.serviceAuthData(r), query: structuredClone(expected),
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: policy.exactReadPageSize, pageNumber: 1 } };
    const auth = structuredClone(input.authData), response = await SERVICE[service].get(input);
    p.assertPersistence(response);
    const rows = p.unwrap(response);
    const page = { pageSize: policy.exactReadPageSize, pageNumber: 1 };
    if (input.tenant !== r.tenant || !same(input.authData, auth) || !same(input.query, expected) ||
        !same(input.options, { recursive: false, skipItemCache: true }) ||
        ![page, { ...page, limit: policy.exactReadPageSize, skip: 0, snapshot: false }].some(p => same(p, input.searchOptions)) ||
        !Array.isArray(rows) || rows.length > 1 || response.count !== rows.length ||
        [response.total, response.totalCount].some(n => n !== undefined && n !== rows.length) ||
        rows.some(row => Object.entries(expected).some(([k, v]) => !same(row[k], v))))
      throw new Error('Exact original bundle evidence is unavailable');
    return rows[0];
  },
  /**
   * Pins original request credentials and policy around async owner reads.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {function():void} Private recheck closure for the original request/policy snapshot.
   * @remarks Effects: Captures credential/policy pins only; closure creates no new authority or effect.
   * Failure behavior: Returned check throws on any original authority/policy drift.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  fence: function (r) {
    const snapshot = () => ({ tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: r.authData,
      authorization: r.authorization, headers: r.httpRequest?.headers, query: r.query, body: r.httpRequest?.body,
      policy: CONFIG.get('digitalCore')?.bundles?.commandRecovery });
    const before = structuredClone(snapshot());
    return () => { if (!same(before, snapshot())) throw new Error('Bundle recovery authority changed'); };
  },
  /**
   * Reads by the original create key in its authorized owner namespace, not a caller-selected merchant
   * partition.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Authorized owner, original manifest key and retained manifest if present.
   * @remarks Effects: Fresh owner admission plus exact original namespace lookup.
   * Failure behavior: Rejects foreign owner, changed composition or authority drift.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  retained: async function (r, input) {
    const b = SERVICE.DefaultDigitalBundleService, ownerRef = b.owner(input.ownerRef), manifestKey = this.key(input.manifestKey), check = this.fence(r);
    await b.authorize(r, ownerRef, 'BUNDLE_CREATE'); check();
    const code = 'bundle:' + b.digest([r.tenant, r.enterpriseCode, ownerRef, manifestKey]);
    const row = await this.exact(r, 'DefaultDigitalBundleManifestService', { enterpriseCode: r.enterpriseCode, code }); check();
    if (row) {
      b.manifest(row);
      if (!same(row.ownerRef, ownerRef) || row.idempotencyKey !== manifestKey || !row.composition ||
          !same(row.composition, this.composition(row.composition, ownerRef)) || row.compositionDigest !== b.digest(row.composition))
        throw new Error('Original reviewed composition is unavailable');
    }
    await b.authorize(r, ownerRef, 'BUNDLE_CREATE'); check();
    return { ownerRef, manifestKey, row };
  },
  /**
   * Projects a bounded exact owner status without secrets, retained intents or an inferred success from
   * missing history.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Bounded exact manifest/operation status and qualified continuation hints.
   * @remarks Effects: Read-only current owner evidence; no secrets, retries or absence-based success.
   * Failure behavior: Rejects malformed/inconsistent retained evidence or post-read authority drift.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  query: async function (r, input) {
    if (Object.keys(input).sort().join(',') !== 'manifestKey,ownerRef' || Object.keys(r.query || {}).length)
      throw new Error('Exact original reference is required');
    const check = this.fence(r), retained = await this.retained(r, input); check();
    const { ownerRef, manifestKey, row } = retained;
    const base = { contractVersion: 1, ownerRef, manifestKey, status: 'UNCONFIRMED', canResume: false };
    if (!row) return base;
    const c = row.composition, b = SERVICE.DefaultDigitalBundleService;
    const operation = await this.exact(r, 'DefaultDigitalBundleOperationService', { manifestCode: row.code, idempotencyKey: c.operationKey }); check();
    await b.authorize(r, ownerRef, c.mode === 'GIFT' ? 'GIFT_SEND' : 'BUNDLE_LIST'); check();
    if (!operation) return { ...base, status: 'PREPARED', canResume: true };
    if (!same(operation.ownerRef, ownerRef) || operation.manifestRevision !== row.revision || operation.evidence?.manifestDigest !== row.digest ||
        operation.evidence.manifestEnterpriseCode !== row.enterpriseCode ||
        operation.code !== 'bundle-operation:' + b.digest([r.tenant, operation.enterpriseCode, ownerRef, c.operationKey]) ||
        operation.purpose !== (c.mode === 'GIFT' ? 'GIFT' : 'LISTING')) throw new Error('Original operation binding changed');
    if (c.mode === 'GIFT') {
      if (operation.enterpriseCode !== row.enterpriseCode || !same(operation.recipientRef, c.recipientRef)) throw new Error('Original gift recipient changed');
      if (['PENDING', 'COMPLETED', 'RELEASED'].includes(operation.status))
        return { ...base, status: operation.status, code: operation.code, deadline: operation.deadline };
      return { ...base, status: operation.status, code: operation.code, canResume: operation.status === 'RESERVING' };
    }
    const listing = operation.evidence.listing, terms = SERVICE.DefaultDigitalCommerceAuctionService.terms(c.terms);
    if (!listing || listing.termsDigest !== b.digest(terms) || !same(listing.terms, terms) || !same(listing.contextRef, c.terms.listingContextRef))
      throw new Error('Original listing terms changed');
    if (operation.status === 'RELEASED') return { ...base, status: 'RELEASED', code: operation.code };
    if (listing.phase === 'PUBLISHED' && !listing.release && listing.price?.confirmed === true && listing.price.receiptCode &&
        listing.publication?.confirmed === true && listing.publication.receiptCode && (c.mode !== 'AUCTION' || listing.auction?.roundCode)) {
      SERVICE.DefaultDigitalCommerceAuctionService.published(operation, listing.publication);
      return { ...base, status: 'PUBLISHED', code: operation.code, productCode: listing.product.productCode,
        ...(listing.auction ? { roundCode: listing.auction.roundCode } : {}) };
    }
    return { ...base, status: operation.status, code: operation.code, canResume: !listing.release && ['RESERVING', 'HELD'].includes(operation.status) };
  },
  /**
   * Explicit continuation uses only the persisted original instruction and the existing owner commands.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Status after explicit continuation of the persisted original instruction.
   * @remarks Effects: Calls existing gift/listing commands with original keys; no new workflow.
   * Failure behavior: Rejects missing confirmation, unqualified action or changed original instruction.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  resume: async function (r, input) {
    if (input.confirmed !== true || Object.keys(input).sort().join(',') !== 'confirmed,manifestKey,ownerRef')
      throw new Error('Confirm original bundle continuation');
    const ref = { ownerRef: input.ownerRef, manifestKey: input.manifestKey }, state = await this.query(r, ref);
    if (!state.canResume) return state;
    const check = this.fence(r), { row } = await this.retained(r, ref); check();
    if (!row) throw new Error('Original manifest is unavailable');
    const c = row.composition, command = { manifestCode: row.code, manifestRevision: row.revision, idempotencyKey: c.operationKey, confirmed: true };
    if (c.mode === 'GIFT') await SERVICE.DefaultDigitalBundleGiftService.send(r, { ...command, recipientRef: c.recipientRef });
    else await SERVICE.DefaultDigitalCommerceAuctionService.publish(r, { ...command, ...c.terms });
    check();
    return this.query(r, ref);
  },
  /**
   * Exact gift lookup survives page movement. Only server-retained decisions may be resumed after a
   * reload.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Exact authorized gift status, retained decision and resume qualification.
   * @remarks Effects: Read-only operation lookup and participant admission.
   * Failure behavior: Rejects foreign participant, missing exact operation or changed authority.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  inspectGift: async function (r, input) {
    if (Object.keys(input).sort().join(',') !== 'operationCode,ownerRef' || Object.keys(r.query || {}).length)
      throw new Error('Exact gift reference is required');
    const b = SERVICE.DefaultDigitalBundleService, check = this.fence(r), ownerRef = b.owner(input.ownerRef);
    await b.authorize(r, ownerRef, 'BUNDLE_CREATE'); check();
    const row = await this.exact(r, 'DefaultDigitalBundleOperationService', { code: this.key(input.operationCode) }); check();
    if (!row || row.purpose !== 'GIFT' || ![row.ownerRef, row.recipientRef].some(o => same(o, ownerRef)))
      throw new Error('Original gift is unavailable');
    const sender = same(row.ownerRef, ownerRef);
    await b.authorize(r, ownerRef, sender ? 'GIFT_CANCEL' : 'GIFT_RECEIVE'); check();
    const decision = row.evidence?.decision;
    return { contractVersion: 1, ownerRef, operationCode: row.code, status: row.status, revision: row.revision,
      decision: decision || null, canResume: (sender ? decision === 'CANCEL' : ['ACCEPT', 'DECLINE'].includes(decision)) &&
        ['TRANSFERRING', 'TRANSFERRED', 'RELEASING'].includes(row.status) };
  },
};
