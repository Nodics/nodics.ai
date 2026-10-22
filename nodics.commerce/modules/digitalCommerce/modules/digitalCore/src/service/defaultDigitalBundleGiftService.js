/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/**
 * @module digitalCore/service/defaultDigitalBundleGiftService
 * @description Coordinates pending gifts, participant decisions and scheduler expiry using the bundle owner.
 * Inputs: Original manifests/operations, current sender/recipient authority and reviewed decision revisions.
 * Outputs: Redacted original operations, bounded gift pages, expiry outcomes and effective participation
 * settings.
 * Effects: Reserves/transfers/finalizes/releases through bundle owners and separately invokes postcommit
 * notification.
 * Failure behavior: Conflicts, denial or uncertain component effects reject; sweep records individual
 * recovery needs, messaging cannot undo ownership.
 * Exported members: bundles, policy, admit, send, afterCommit, list, decide, expire, sweepExpired,
 * configure.
 * @owner digitalCore
 * @layer service
 * @override Override service members without bypassing CAS decision fences, independent participation or
 * original component keys.
 * @see ../../llm/contracts/bundle-holdings-and-gifts.md
 */
const configuration = require("../utils/configuration");
module.exports = {
  /**
   * Resolves the effective bundle owner.
   * @returns {Object|undefined} Effective DefaultDigitalBundleService registry member.
   * @remarks Effects: Registry lookup only.
   * Failure behavior: Does not validate registration; missing owner is returned as undefined.
   * @override Use the effective loader owner rather than importing a second bundle implementation.
   */
  bundles: function () { return SERVICE.DefaultDigitalBundleService; },
  /**
   * Reads independent Enterprise preferences, using only framework defaults when no governed selection
   * exists.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} ownerRef Canonical Profile Customer or Enterprise reference.
   * @returns {Promise<Object>} Customer gift/receive flags, or Enterprise effective governed participation.
   * @remarks Effects: Normalizes owner and reads policy for Enterprises; no policy write.
   * Failure behavior: Invalid owner or unavailable participation owner rejects.
   * @override Keep independent outgoing/incoming Enterprise choices with participation, not actor
   * identities.
   */
  policy: async function (r, ownerRef) {
    const bundles = this.bundles(), owner = bundles.owner(ownerRef);
    if (owner.schema === "customer") return { giftingEnabled: true, receivingEnabled: true };
    const participation = SERVICE.DefaultDigitalParticipationService;
    return participation.projection(owner, await participation.policy(r, owner)).effective;
  },
  /**
   * Verifies an existing Profile recipient and new-gift preferences before reserving any components.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} ownerRef Canonical sender owner.
   * @param {Object} recipientRef Existing canonical Profile recipient owner.
   * @param {Object} command Original operation code and immutable command digest.
   * @returns {Promise<void>} Resolves only after recipient/new-gift admission succeeds.
   * @remarks Effects: Reads current recipient and records Enterprise participation admission when either
   * side is Enterprise.
   * Failure behavior: Rejects missing/inactive/substituted recipient or denied governed participation.
   * @override Perform admission before holds; do not provision a recipient or alter pending-gift terms.
   */
  admit: async function (r, ownerRef, recipientRef, command) {
    const bundles = this.bundles(), profile = SERVICE[bundles.settings().ownerAuthorityService];
    if (!profile?.resolveRecipient) throw new Error("Profile recipient authority is unavailable");
    const recipient = await profile.resolveRecipient(r, { ownerRef: recipientRef });
    if (recipient?.active !== true || !isDeepStrictEqual(recipient.ownerRef, recipientRef)) throw new Error("Existing gift recipient is unavailable");
    if (ownerRef.schema === 'enterprise' || recipientRef.schema === 'enterprise')
      await SERVICE.DefaultDigitalParticipationService.admit(r, { kind: 'GIFT', ownerRef, recipientRef,
        key: command.code, identity: { commandDigest: command.digest } });
  },
  /**
   * Confirms the complete retained package and selected recipient, reserving before returning PENDING.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} input Confirmed original manifest/revision, recipientRef and idempotencyKey.
   * @returns {Promise<Object>} Reserved original gift with postcommit notification plans redacted.
   * @remarks Effects: Reserves the complete package via bundle owner, then notification-only afterCommit.
   * Failure behavior: Unconfirmed input, denied owner/recipient or uncertain holds rejects.
   * @override Return pending only after all holds; messaging must not imply acceptance.
   */
  send: async function (r, input) {
    if (input.confirmed !== true) throw new Error("Review and confirm the complete gift");
    const row = await this.bundles().reserve(r, { ...input, purpose: "GIFT" });
    return this.afterCommit(r, row, row.status === "PENDING" ? "PENDING" : null);
  },
  /**
   * Messaging cannot undo committed holdings. Refresh revision after pointer CAS and never expose private
   * recipient selections.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} row Committed original gift operation to preserve on messaging failure.
   * @param {string} event Proven PENDING/terminal notification event.
   * @returns {Promise<Object>} Clone of latest readable operation, or original row, without private
   * giftNotifications.
   * @remarks Effects: May notify and reread operation revision after notification pointer CAS; does not
   * alter holdings.
   * Failure behavior: Notification/readback errors are contained; committed ownership remains authoritative.
   * @override Keep latest revision when available and always redact private notification selections.
   */
  afterCommit: async function (r, row, event) {
    let current = row;
    try {
      if (event && CONFIG.get("digitalCore")?.giftNotifications?.enabled === true) {
        await SERVICE.DefaultDigitalBundleGiftNotificationService.notify({ ...r, enterpriseCode: row.enterpriseCode }, row.code, event);
        current = await this.bundles().read({ ...r, enterpriseCode: row.enterpriseCode }, "DefaultDigitalBundleOperationService", row.code) || row;
      }
    } catch (_) { /* Original owner outcome remains authoritative even when notification admission/readback fails. */ }
    const result = structuredClone(current);
    delete result.evidence.giftNotifications;
    return result;
  },
  /**
   * Reads bounded sent/received owner pages without disclosing component receipts, financial data or
   * employee identifiers.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} input ownerRef, SENT/RECEIVED direction and optional page/pageSize.
   * @returns {Promise<Object>} Versioned bounded page with manifest components, allowed actions, recovery
   * flags and total.
   * @remarks Effects: Authorizes current participant and reads matching gifts/manifests; no receipt or
   * financial mutation.
   * Failure behavior: Rejects invalid bounds, owner mismatch, failed persistence or changed manifest
   * identity.
   * @override Keep typed participant filtering and safe projections; pages do not certify mutation success.
   */
  list: async function (r, input) {
    const bundles = this.bundles(), ownerRef = bundles.owner(input.ownerRef), p = bundles.settings();
    if (!['SENT', 'RECEIVED'].includes(input.direction)) throw new Error('Gift direction is required');
    await bundles.authorize(r, ownerRef, input.direction === 'SENT' ? 'GIFT_SEND' : 'GIFT_RECEIVE');
    const page = input.page ?? 1, pageSize = input.pageSize ?? p.giftPageSize;
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > p.maximumGiftPageSize)
      throw new Error('Gift pagination is invalid');
    const field = input.direction === 'SENT' ? 'ownerRef' : 'recipientRef';
    const query = { tenant: r.tenant, active: true, purpose: 'GIFT',
      [field + '.module']: ownerRef.module, [field + '.schema']: ownerRef.schema, [field + '.code']: ownerRef.code };
    const persistence = SERVICE.DefaultDigitalCommerceEntitlementService;
    const response = await SERVICE.DefaultDigitalBundleOperationService.get({ tenant: r.tenant,
      authData: persistence.serviceAuthData(r), query, options: { recursive: false, skipItemCache: true },
      searchOptions: { pageNumber: page, pageSize, sort: { created: -1, code: 1 } } });
    persistence.assertPersistence(response);
    const rows = persistence.unwrap(response);
    if (!Array.isArray(rows) || rows.length > pageSize || !Number.isSafeInteger(response.count) || response.count < rows.length)
      throw new Error('Gift page is unconfirmed');
    const items = [];
    for (const row of rows) {
      if (row.tenant !== r.tenant || row.purpose !== 'GIFT' || row.active !== true || !isDeepStrictEqual(row[field], ownerRef))
        throw new Error('Gift page owner changed');
      const manifest = bundles.manifest(await bundles.read({ ...r, enterpriseCode: row.enterpriseCode }, 'DefaultDigitalBundleManifestService', row.manifestCode));
      if (manifest.digest !== row.evidence.manifestDigest || manifest.revision !== row.manifestRevision) throw new Error('Gift manifest changed');
      const pending = row.status === 'PENDING' && Number.isFinite(new Date(row.deadline).getTime()) && new Date(row.deadline).getTime() > Date.now();
      items.push({ code: row.code, revision: row.revision, status: row.status, decision: row.evidence.decision || null,
        ownerRef: row.ownerRef, recipientRef: row.recipientRef, deadline: row.deadline,
        manifestRef: { module: 'digitalCore', schema: 'digitalBundleManifest', code: manifest.code, revision: manifest.revision, digest: manifest.digest },
        components: manifest.components, allowedActions: pending ? input.direction === 'SENT' ? ['CANCEL'] : ['ACCEPT', 'DECLINE'] : [],
        recoveryRequired: ['RESERVING', 'TRANSFERRING', 'TRANSFERRED', 'RELEASING'].includes(row.status) });
    }
    return { contractVersion: 1, ownerRef, direction: input.direction, items, page, pageSize, total: response.count };
  },
  /**
   * Fences recipient acceptance against sender cancellation, decline and deadline expiry using generated
   * CAS.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} input operationCode, expectedRevision, confirmed:true and ACCEPT/DECLINE/CANCEL.
   * @returns {Promise<Object>} Original operation after transfer/finalize or release and redacted postcommit
   * handoff.
   * @remarks Effects: CAS-fences a pending decision, resumes only that decision, then invokes component
   * owner phases.
   * Failure behavior: Rejects expired/stale/competing decisions, current denial or uncertain component
   * progress.
   * @override Retain first decision and exact original operation on partial failure; do not unlock partial
   * transfers.
   */
  decide: async function (r, input) {
    const bundles = this.bundles();
    let row = await bundles.participantOperation(r, input.operationCode);
    if (!row || row.purpose !== "GIFT" || !["ACCEPT", "DECLINE", "CANCEL"].includes(input.decision) || input.confirmed !== true)
      throw new Error("Exact confirmed gift decision is required");
    const ownerRef = input.decision === "CANCEL" ? row.ownerRef : row.recipientRef;
    await bundles.authorize(r, ownerRef, input.decision === "CANCEL" ? "GIFT_CANCEL" : "GIFT_RECEIVE");
    r = { ...r, enterpriseCode: row.enterpriseCode };
    if (row.evidence.decision && row.evidence.decision !== input.decision) throw new Error("Another gift decision already won");
    if (row.status === "PENDING") {
      if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision !== row.revision)
        throw new Error("Gift revision changed");
      if (!Number.isFinite(new Date(row.deadline).getTime()) || new Date(row.deadline).getTime() <= Date.now())
        throw new Error("Gift acceptance deadline has passed or is invalid");
      row = await bundles.update(r, row, { status: input.decision === "ACCEPT" ? "TRANSFERRING" : "RELEASING",
        evidence: { ...row.evidence, decision: input.decision, decidedAt: new Date().toISOString() } });
    }
    const result = input.decision === "ACCEPT" ? await bundles.transfer(r, row.code) : await bundles.release(r, row.code);
    return this.afterCommit(r, result, { ACCEPT: "ACCEPTED", DECLINE: "DECLINED", CANCEL: "CANCELLED" }[input.decision]);
  },
  /**
   * Scheduler-only expiry command; no client-selected deadline or automatic release of uncertain transfers.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {string} operationCode Original gift operation in the signed scheduler namespace.
   * @returns {Promise<Object>} Released original gift with EXPIRED postcommit handoff.
   * @remarks Effects: Requires service expiry permission, CAS-selects EXPIRE after deadline and releases
   * original holds.
   * Failure behavior: Rejects human/foreign callers, future deadline or another selected decision; uncertain
   * release rejects.
   * @override Never override acceptance/cancellation or use a caller-supplied deadline.
   */
  expire: async function (r, operationCode) {
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (r.authData?.principalType !== 'service' || r.authData?.tokenType !== 'service' || r.authData.tenant !== r.tenant ||
        !security?.isPermissionGranted('commerce.digital.bundle.expire', security.getGrantedPermissions(r), {}))
      throw new Error('Authorized gift expiry scheduler is required');
    const bundles = this.bundles();
    let row = await bundles.read(r, "DefaultDigitalBundleOperationService", operationCode);
    if (!row || row.purpose !== "GIFT") throw new Error("Gift is unavailable");
    if (row.status === "PENDING") {
      if (!Number.isFinite(Date.parse(row.deadline)) || Date.parse(row.deadline) > Date.now()) throw new Error("Gift is not expired");
      row = await bundles.update(r, row, { status: "RELEASING", evidence: { ...row.evidence, decision: "EXPIRE", decidedAt: new Date().toISOString() } });
    }
    if (row.evidence.decision !== "EXPIRE") throw new Error("Gift cannot expire after another decision");
    return this.afterCommit(r, await bundles.release(r, row.code), "EXPIRED");
  },
  /**
   * Runs a bounded keyset sweep for the existing Cron internal HTTP contract; never starts a timer or
   * activates a job.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} [input={}] Optional afterCode keyset cursor; no other filters accepted.
   * @returns {Promise<Object>} Version1 scanned count, per-operation statuses, nextCursor and
   * schedulerActivated:false.
   * @remarks Effects: Boundedly reads due/original EXPIRE operations and invokes expiry; does not start a
   * timer or activate a job.
   * Failure behavior: Admission/page corruption rejects; individual expiry races/failures return
   * RECOVERY_REQUIRED.
   * @override Preserve signed partition, sorted bounded keyset continuation and uncertain-hold recovery.
   */
  sweepExpired: async function (r, input = {}) {
    SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(r, "digitalCore");
    const security = SERVICE.DefaultSecuredRequestPipelineService, settings = this.bundles().settings(), policy = settings.giftExpirySweep;
    if (r.authData?.principalType !== "service" || r.authData.tokenType !== "service" || r.authData.tenant !== r.tenant ||
        r.enterpriseCode !== (r.authData.enterpriseCode || r.authData.entCode) ||
        !security?.isPermissionGranted("commerce.digital.bundle.expire", security.getGrantedPermissions(r), {}))
      throw new Error("Authorized gift expiry scheduler is required");
    if (![policy?.maximumOperations, policy?.pageSize].every(value => configuration.integer(value, settings.validation?.capacity)) ||
        policy.pageSize > policy.maximumOperations ||
        Object.keys(input).some(key => key !== "afterCode") || input.afterCode !== undefined &&
        !/^bundle-operation:[a-f0-9]{64}$/.test(input.afterCode)) throw new Error("Gift expiry sweep bounds are invalid");
    const cutoff = new Date(), results = [], persistence = SERVICE.DefaultDigitalCommerceEntitlementService;
    let afterCode = input.afterCode, more = true;
    while (more && results.length < policy.maximumOperations) {
      const pageSize = Math.min(policy.pageSize, policy.maximumOperations - results.length);
      const response = await SERVICE.DefaultDigitalBundleOperationService.get({ tenant: r.tenant,
        authData: persistence.serviceAuthData(r), query: { ...this.bundles().scope(r), active: true, purpose: "GIFT",
          ...(afterCode ? { code: { $gt: afterCode } } : {}),
          $or: [{ status: "PENDING", deadline: { $lte: cutoff } }, { status: "RELEASING", "evidence.decision": "EXPIRE" }] },
        options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize, pageNumber: 1, sort: { code: 1 } } });
      persistence.assertPersistence(response);
      const rows = persistence.unwrap(response);
      if (!Array.isArray(rows) || rows.length > pageSize || !Number.isSafeInteger(response.count) || response.count < rows.length)
        throw new Error("Gift expiry page is unconfirmed");
      for (const row of rows) {
        if (row.tenant !== r.tenant || row.enterpriseCode !== r.enterpriseCode || row.active !== true || row.purpose !== "GIFT" ||
            !/^bundle-operation:[a-f0-9]{64}$/.test(row.code) || afterCode && row.code <= afterCode ||
            !(row.status === "RELEASING" && row.evidence.decision === "EXPIRE" || row.status === "PENDING" &&
              Number.isFinite(new Date(row.deadline).getTime()) && new Date(row.deadline).getTime() <= cutoff.getTime()))
          throw new Error("Gift expiry page scope changed");
        try {
          const released = await this.expire(r, row.code);
          results.push({ operationCode: row.code, status: released.status });
        } catch (_) {
          // Acceptance and expiry race on the original revision; a failed release remains owner recovery, never presumed success.
          results.push({ operationCode: row.code, status: "RECOVERY_REQUIRED" });
        }
        afterCode = row.code;
      }
      more = rows.length === pageSize;
    }
    return { contractVersion: 1, scanned: results.length, results, nextCursor: more ? afterCode : null,
      schedulerActivated: false };
  },
  /**
   * Persists an authorized independent Enterprise selection; pending gifts never reread it during decisions.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} input Reviewed participation settings command with original key/revision.
   * @returns {Promise<Object>} Audited governed participation result.
   * @remarks Effects: Delegates policy persistence to DefaultDigitalParticipationService.
   * Failure behavior: Current authority, revision or validation errors propagate.
   * @override New-gift preferences cannot retroactively change retained pending decisions.
   */
  configure: async function (r, input) {
    return SERVICE.DefaultDigitalParticipationService.configure(r, input);
  },
};
