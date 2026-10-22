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
 * @module digitalCore/service/defaultDigitalBundleCompositionService
 * @description Projects bounded governed listing references after current participant admission; never
 * publishes, reserves or provisions.
 * @owner digitalCore
 * @layer service
 * @remarks Digital composition discovers governed listing contexts, not business IDs in configuration.
 * Store owns merchant placement and Loyalty owns program precision. Gift composition remains
 * independently available; choices never grant publication or holdings authority.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: settings, project, reward, records, choices, admit, read.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Complete mechanics are framework-owned; there are no business choices in configuration.
   * @returns {Object} Detached validated composition mechanics.
   * @remarks Effects: Reads framework-owned bounds/transports, not business selection defaults.
   * Failure behavior: Rejects missing/invalid owner definitions.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settings: function () {
    const policy = CONFIG.get('digitalCore')?.bundleListings, p = policy?.contexts;
    if (typeof policy?.enabled !== 'boolean' || !p || !Number.isSafeInteger(p.maximumConfiguredBound) || p.maximumConfiguredBound < 1 ||
        !['maximumRecords', 'maximumCategories'].every(key => Number.isSafeInteger(p[key]) && p[key] > 0 && p[key] < p.maximumConfiguredBound) ||
        typeof p.validation?.identifierPattern !== 'string' || !p.validation.identifierPattern.startsWith('^') || !p.validation.identifierPattern.endsWith('$') ||
        !Number.isSafeInteger(p.validation.maximumNameLength) || p.validation.maximumNameLength < 1 || p.validation.maximumNameLength > p.maximumConfiguredBound)
      throw new Error('Bundle composition configuration is incomplete');
    new RegExp(p.validation.identifierPattern);
    return structuredClone(policy);
  },
  /**
   * Explicit participant namespace is discovery scope, not merchant Store authority.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} row Original persisted owner record and retained evidence.
   * @param {Object} policy Validated effective framework policy.
   * @returns {Object} Safe governed context with code/revision/Store/categories/currency/book/reward
   * selections.
   * @remarks Effects: Pure allowlisted projection in participant discovery scope.
   * Failure behavior: Rejects malformed, inactive or foreign governed records.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  project: function (r, row, policy) {
    const p = policy.contexts, identifier = value => typeof value === 'string' && new RegExp(p.validation.identifierPattern).test(value);
    if (row?.tenant !== r.tenant || row.enterpriseCode !== r.enterpriseCode || row.active !== true || row.status !== 'ACTIVE' ||
        !identifier(row.code) || !Number.isSafeInteger(row.revision) || row.revision < 0 ||
        typeof row.name !== 'string' || !row.name.trim() || row.name.length > p.validation.maximumNameLength ||
        ![row.storeCode, row.currency, row.priceBookCode, row.reward?.programCode, row.reward?.rewardTypeCode].every(identifier) ||
        !Array.isArray(row.categoryCodes) || row.categoryCodes.length > p.maximumCategories || row.categoryCodes.some(code => !identifier(code)) ||
        new Set(row.categoryCodes).size !== row.categoryCodes.length || Object.keys(row.reward).sort().join(',') !== 'programCode,rewardTypeCode')
      throw new Error('Governed bundle listing context is invalid');
    return { code: row.code, revision: row.revision, name: row.name, storeCode: row.storeCode,
      categoryCodes: [...row.categoryCodes].sort(), currency: row.currency, priceBookCode: row.priceBookCode,
      reward: { programCode: row.reward.programCode, rewardTypeCode: row.reward.rewardTypeCode } };
  },
  /**
   * Canonical precision and program activity come only from Loyalty, independent of wallet funding.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} selected Exact governed selected context/reward reference.
   * @returns {Promise<Object>} Detached canonical active reward program/type/precision evidence.
   * @remarks Effects: Reads Loyalty reward definition independently of wallet balances.
   * Failure behavior: Rejects absent, inactive, mismatched or malformed reward evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  reward: async function (r, selected) {
    const owner = SERVICE.DefaultDigitalBundleSettlementService;
    const policy = structuredClone(owner.settings().loyalty);
    const evidence = await owner.loyalty(r, '/reward-unit-evidence', { enterpriseCode: r.enterpriseCode,
      programCode: selected.programCode, rewardTypeCode: selected.rewardTypeCode });
    if (!same(policy, owner.settings().loyalty) || evidence?.contractVersion !== 1 || evidence.tenant !== r.tenant ||
        evidence.enterpriseCode !== r.enterpriseCode || evidence.programCode !== selected.programCode ||
        evidence.rewardTypeCode !== selected.rewardTypeCode || !Number.isSafeInteger(evidence.scale) || evidence.scale < 0 ||
        ![evidence.programRevision, evidence.rewardTypeRevision].every(n => Number.isSafeInteger(n) && n >= 0))
      throw new Error('Canonical Loyalty reward unit is unconfirmed');
    return structuredClone(evidence);
  },
  /**
   * Reads a complete bounded set; arbitrary queries and partial/truncated choices are never exposed.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} policy Validated effective framework policy.
   * @param {string} code Exact original owner record code.
   * @returns {Promise<Object[]>} Complete bounded governed context records.
   * @remarks Effects: Private generated read under exact participant namespace; no arbitrary queries.
   * Failure behavior: Rejects truncated, duplicate, foreign or failed records.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  records: async function (r, policy, code) {
    const generated = SERVICE.DefaultDigitalBundleListingContextService, persistence = SERVICE.DefaultDigitalCommerceEntitlementService;
    if (!generated?.get) throw new Error('Bundle listing context repository is unavailable');
    const response = await generated.get({ tenant: r.tenant, authData: persistence.serviceAuthData(r),
      query: { tenant: r.tenant, enterpriseCode: r.enterpriseCode, active: true, status: 'ACTIVE', ...(code === undefined ? {} : { code }) },
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: policy.contexts.maximumRecords + 1, pageNumber: 1 } });
    persistence.assertPersistence(response);
    const rows = persistence.unwrap(response);
    if (!Array.isArray(rows) || rows.length > policy.contexts.maximumRecords || !Number.isSafeInteger(response.count) ||
        response.count !== rows.length || [response.total, response.totalCount].some(n => n !== undefined && n !== rows.length))
      throw new Error('Complete listing contexts are unavailable');
    const items = rows.map(row => this.project(r, row, policy));
    if (new Set(items.map(row => row.code)).size !== items.length) throw new Error('Ambiguous listing context');
    if (code !== undefined && (items.length !== 1 || items[0].code !== code)) throw new Error('Selected listing context is unavailable');
    return items;
  },
  /**
   * Projects selected references with owner-derived precision, not stored scale authority.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} policy Validated effective framework policy.
   * @returns {Promise<Object[]>} Stable ordered safe choices with owner-derived reward precision.
   * @remarks Effects: Reads governed choices and canonical reward definitions only.
   * Failure behavior: Rejects any incomplete/invalid selected owner evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  choices: async function (r, policy) {
    const items = await this.records(r, policy);
    // Reuse Product's existing canonical Store-owner handoff. No generic Store access is granted to the participant.
    for (const storeCode of new Set(items.map(row => row.storeCode)))
      await SERVICE.DefaultDigitalCommerceAuctionService.placement(r, storeCode);
    const units = new Map();
    for (const item of items) {
      const key = JSON.stringify(item.reward);
      if (!units.has(key)) units.set(key, await this.reward(r, item.reward));
      item.reward.scale = units.get(key).scale;
    }
    return items.sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
  },
  /**
   * Revalidates the exact governed revision and every non-user-editable term before publication can
   * reserve anything.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @param {Object} terms Immutable reviewed listing/reward terms.
   * @param {Object} ownerRef Canonical typed Profile purchasing/selling owner reference.
   * @returns {Promise<Object>} Canonical Store, exact context revision and reward evidence.
   * @remarks Effects: Rechecks fresh Profile owner and every non-user-editable governed term before
   * reservation.
   * Failure behavior: Rejects stale revision, foreign owner, changed selections or authority drift.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  admit: async function (r, input, terms, ownerRef) {
    const policy = this.settings(), ref = input.listingContextRef;
    if (!policy.enabled || !ref || Object.keys(ref).sort().join(',') !== 'code,revision' ||
        typeof ref.code !== 'string' || !new RegExp(policy.contexts.validation.identifierPattern).test(ref.code) ||
        !Number.isSafeInteger(ref.revision) || ref.revision < 0 || r.enterpriseCode !== (r.authData?.enterpriseCode || r.authData?.entCode))
      throw new Error('Exact governed listing context revision is required');
    const state = structuredClone({ tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: r.authData, authorization: r.authorization });
    const original = (await this.records(r, policy, ref.code))[0];
    if (original.revision !== ref.revision) throw new Error('Listing context revision changed');
    const rewardEvidence = await this.reward(r, original.reward);
    const expected = { storeCode: original.storeCode, categoryCodes: original.categoryCodes, currency: original.currency,
      priceBookCode: original.priceBookCode, reward: { ...original.reward, scale: rewardEvidence.scale } };
    if (!same(expected, Object.fromEntries(Object.keys(expected).map(key => [key, terms[key]]))))
      throw new Error('Listing terms conflict with governed context or canonical reward precision');
    const store = await SERVICE.DefaultDigitalCommerceAuctionService.placement(r, original.storeCode);
    if (!same(original, (await this.records(r, policy, ref.code))[0])) throw new Error('Listing context changed during admission');
    await SERVICE.DefaultDigitalBundleService.authorize(r, ownerRef, 'BUNDLE_LIST');
    if (!same(policy, this.settings()) || !same(state, { tenant: r.tenant, enterpriseCode: r.enterpriseCode,
      authData: r.authData, authorization: r.authorization })) throw new Error('Listing admission authority changed');
    return { store, contextRef: { code: ref.code, revision: ref.revision }, rewardEvidence };
  },
  /**
   * Gift composition is independent of listing activation/outages. Admission and drift failures still
   * reject the entire read.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Current typed owner and safe listing choices under contractVersion1.
   * @remarks Effects: Read-only composition admission; gift support is not coupled to listing
   * activation.
   * Failure behavior: Invalid authority or drift rejects the whole read; no partial unsafe choices.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  read: async function (r, input) {
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length ||
        Object.keys(r.query || {}).length || Object.keys(r.httpRequest?.query || {}).length)
      throw new Error('Composition context accepts no selectors');
    const b = SERVICE.DefaultDigitalBundleService, authority = SERVICE.DefaultDigitalBundleAuthorityService;
    b.scope(r);
    const auth = r.authData || {};
    if (r.enterpriseCode !== (auth.enterpriseCode || auth.entCode) ||
        auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode)
      throw new Error('Original participant namespace is required');
    const policy = this.settings(), snapshot = structuredClone({ tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: r.authData,
      authorization: r.authorization, headers: r.httpRequest?.headers });
    const check = () => {
      if (!same(policy, this.settings()) || !same(snapshot, { tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: r.authData,
        authorization: r.authorization, headers: r.httpRequest?.headers })) throw new Error('Composition authority changed');
    };
    const ownerRef = await authority.currentOwner(r); check();
    await b.authorize(r, ownerRef, 'BUNDLE_CREATE'); check();
    let listings = { state: 'DISABLED', items: [] };
    if (policy.enabled) {
      try {
        const pricing = SERVICE[policy.pricingService];
        if (!pricing?.publish || !pricing?.inspect) throw new Error('Pricing listing owner is unavailable');
        listings = { state: 'AVAILABLE', items: await this.choices(r, policy) };
      } catch (_) { listings = { state: 'UNAVAILABLE', items: [] }; }
    }
    check();
    await b.authorize(r, ownerRef, 'BUNDLE_CREATE'); check();
    return { contractVersion: 1, ownerRef, listings };
  },
};
