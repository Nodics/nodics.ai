/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual: same } = require("node:util");
const events = ["PENDING", "CANCELLED", "ACCEPTED", "DECLINED", "EXPIRED"], sides = ["SENDER", "RECIPIENT"];
/**
 * @module digitalCore/service/defaultDigitalBundleGiftNotificationService
 * @description Proves whole-gift events and freezes notification intent pointers on original operations.
 * Inputs: Persisted gift/manifest receipts, reviewed runtime grants and Profile opt-in selections.
 * Outputs: Source proofs, frozen plans, submission/inspection outcomes and current dispatch eligibility.
 * Effects: CAS-updates gift notification evidence and calls Profile/Communication; never repeats component
 * mutation.
 * Failure behavior: Invalid private proofs reject; postcommit messaging uncertainty is contained without
 * undoing holdings.
 * Exported members: fail, settings, selector, type, record, source, rpc, recipients, sourceCode, key,
 * variables, plan, save, notify, retry, isDispatchEligible.
 * @owner digitalCore
 * @layer service
 * @override Override effective service members while retaining complete receipts, original frozen plans and
 * postcommit isolation.
 * @see ../../llm/contracts/bundle-gift-notifications.md
 */
const configuration = require("../utils/configuration");
module.exports = {
  /**
   * Refuses incomplete evidence without exposing recipient data.
   * @returns {never} Always throws the bounded unconfirmed-evidence error.
   * @remarks Effects: No persistence or recipient disclosure.
   * Failure behavior: Throws Gift notification evidence is unconfirmed.
   * @override Keep uncertainty non-authorizing and avoid private evidence in error text.
   */
  fail: function () { throw new Error("Gift notification evidence is unconfirmed"); },
  /**
   * Reads complete framework-owned inert policy, independently of gift availability.
   * @returns {Object} Cloned enabled/qualified IN_APP policy with validated transports/templates/bounds.
   * @remarks Effects: Reads owner config; does not activate delivery.
   * Failure behavior: Throws for disabled/unqualified policy or invalid transport, recipient bound, template
   * or locale.
   * @override Preserve explicit activation/qualification and effective owner validation ranges.
   */
  settings: function () {
    const p = CONFIG.get("digitalCore")?.giftNotifications;
    if (p?.enabled !== true || p.qualified !== true || p.channel !== "IN_APP" || !Array.isArray(p.sourceCallers) ||
        [p.profileConnectionName, p.communicationConnectionName, ...events.map(e => p.templates?.[e])]
          .some(v => typeof v !== "string" || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(v)) ||
        !configuration.integer(p.timeoutMs, p.validation?.timeoutMs) ||
        !configuration.integer(p.maximumRecipients, p.validation?.maximumRecipients) ||
        typeof p.allowInsecureLoopback !== "boolean" || !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(p.locale || "")) this.fail();
    return structuredClone(p);
  },
  /**
   * Exact source coordinates select evidence, never grant owner access.
   * @param {Object} source Exact {enterpriseCode, operationCode, event, side} gift coordinates.
   * @returns {Object} The original validated selector, not a clone or grant.
   * @remarks Effects: No I/O or mutation.
   * Failure behavior: Throws for extra/missing fields, invalid operation identity, event or side.
   * @override Coordinates must never become runtime-to-business authorization.
   */
  selector: function (source) {
    if (!source || Object.keys(source).sort().join(",") !== "enterpriseCode,event,operationCode,side" ||
        typeof source.enterpriseCode !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(source.enterpriseCode) ||
        !/^bundle-operation:[a-f0-9]{64}$/.test(source.operationCode) || !events.includes(source.event) || !sides.includes(source.side)) this.fail();
    return source;
  },
  /**
   * Event purpose is explicit; pending delivery cannot assert acceptance.
   * @param {string} event One of PENDING, CANCELLED, ACCEPTED, DECLINED or EXPIRED.
   * @returns {string} DIGITAL_BUNDLE_GIFT_<event> Communication purpose/source type.
   * @remarks Effects: Pure purpose mapping.
   * Failure behavior: Throws on an unsupported gift event.
   * @override Keep pending and terminal event purposes distinct.
   */
  type: function (event) { if (!events.includes(event)) this.fail(); return "DIGITAL_BUNDLE_GIFT_" + event; },
  /**
   * Proves complete component receipts from durable owner records without contacting or mutating components.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} source Exact {enterpriseCode, operationCode, event, side} gift coordinates.
   * @returns {Promise<Object>} {row, eligible:false}, or row plus eligible/sourceDigest/typed ownerRef.
   * @remarks Effects: Reads persisted operation/manifest and verifies required component checkpoints; never
   * calls component effects.
   * Failure behavior: Rejects transaction context, corrupt operation/manifest or incomplete phase receipts.
   * @override Prove all reserve/transfer/finalize/release receipts appropriate to the exact event before
   * messaging.
   */
  record: async function (r, source) {
    this.selector(source);
    if (r.transactionContext !== undefined) this.fail();
    const b = SERVICE.DefaultDigitalBundleService, scope = { ...r, enterpriseCode: source.enterpriseCode };
    const row = await b.read(scope, "DefaultDigitalBundleOperationService", source.operationCode);
    if (!row || row.purpose !== "GIFT" || !Number.isSafeInteger(row.revision) || row.revision < 0 ||
        !Number.isFinite(Date.parse(row.deadline))) this.fail();
    const manifest = await b.operationManifest(scope, row);
    b.owner(row.ownerRef); b.owner(row.recipientRef);
    const decision = { CANCELLED: "CANCEL", ACCEPTED: "ACCEPT", DECLINED: "DECLINE", EXPIRED: "EXPIRE" }[source.event];
    const eligible = source.event === "PENDING" ? row.status === "PENDING" && !row.evidence.decision && Date.parse(row.deadline) > Date.now()
      : row.evidence.decision === decision && row.status === (source.event === "ACCEPTED" ? "COMPLETED" : "RELEASED");
    if (!eligible) return { row, eligible: false };
    if (decision && !Number.isFinite(Date.parse(row.evidence.decidedAt))) this.fail();
    const phases = source.event === "PENDING" ? [["reserve", "RESERVED"]] : source.event === "ACCEPTED"
      ? [["reserve", "RESERVED"], ["transfer", "TRANSFERRED"], ["finalize", "COMPLETED"]] : [["reserve", "RESERVED"], ["release", "RELEASED"]];
    for (const [index, component] of manifest.components.entries()) for (const [phase, status] of phases) {
      const receipt = row.checkpoints?.[index]?.[phase];
      if (receipt?.status !== status || receipt.operationKey !== row.code + ":" + index || !receipt.receiptCode ||
          receipt.quantity !== component.quantity || !same(receipt.reference, component.reference)) this.fail();
    }
    const owner = source.side === "SENDER" ? row.ownerRef : row.recipientRef;
    const sourceDigest = b.digest([r.tenant, row.enterpriseCode, row.code, source.event, row.ownerRef, row.recipientRef,
      row.manifestCode, row.manifestRevision, row.evidence.manifestDigest, row.deadline, decision ? row.evidence.decidedAt : null]);
    return { row, eligible: true, sourceDigest, ownerRef: { type: owner.schema.toUpperCase(), code: owner.code } };
  },
  /**
   * Private Profile callback checks exact reviewed runtime-to-business grants and every request alias across
   * awaits.
   * @param {Object} request Exact sensitive Profile runtime callback; body channel plus gift coordinates,
   * signed deployment claims and aliases.
   * @returns {Promise<Object>} Versioned current source eligibility and, when eligible, digest and typed
   * owner.
   * @remarks Effects: Performs two persisted proof reads with authority/policy checks; no recipient lookup
   * or mutation.
   * Failure behavior: Rejects missing private provenance/grant, alias drift, non-COMMERCE role or unstable
   * proofs.
   * @override Keep grant matching and original-object privacy separate from supplied source coordinates.
   */
  source: async function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    if (request.transactionContext !== undefined) this.fail();
    const p = this.settings(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "digitalCore");
    const input = request.body ?? request.payload ?? request.httpRequest?.body;
    if (!input || Object.keys(input).sort().join(",") !== "channel,enterpriseCode,event,operationCode,side" || input.channel !== "IN_APP" ||
        auth.principalType !== "service" || auth.isSystem || auth.tenant !== request.tenant ||
        !auth.modules?.includes("profile") || !auth.permissions?.includes("commerce.digital.notification.read")) this.fail();
    const { channel, ...coordinates } = input, source = structuredClone(this.selector(coordinates));
    const original = structuredClone(input), before = structuredClone(auth), tenant = request.tenant;
    const headers = structuredClone(request.httpRequest?.headers), principal = auth.enterpriseCode || auth.entCode;
    const bound = () => {
      if (!same(request.authData, before) || request.tenant !== tenant || !same(this.settings(), p) ||
          !same(input, original) || !same(headers, request.httpRequest?.headers) ||
          [request.body, request.payload, request.httpRequest?.body].some(v => v !== undefined && !same(v, original)) ||
          [request.enterpriseCode, request.entCode, auth.enterpriseCode, auth.entCode, headers?.["x-enterprise-code"]].some(v => v !== undefined && v !== principal) ||
          [request.tenantCode, auth.tenantCode, headers?.["x-tenant-code"]].some(v => v !== undefined && v !== tenant) ||
          Object.keys(request.query || {}).length || Object.keys(request.httpRequest?.query || {}).length) this.fail();
      const grants = p.sourceCallers.filter(g => g.tenant === tenant && g.principalEnterpriseCode === principal &&
        g.enterpriseCode === source.enterpriseCode && g.serviceId === auth.serviceId &&
        ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"].every(k =>
          typeof g[k] === "string" && g[k] && g[k] === auth.runtimeScope?.[k]) &&
        g.instanceCode === auth.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName());
      if (grants.length !== 1 || (CONFIG.get("runtimeRole")?.code || CONFIG.get("runtimeRole")) !== "COMMERCE") this.fail();
    };
    bound();
    const projection = async () => {
      const proof = await this.record({ tenant }, source); bound();
      return { contractVersion: 1, tenant, sourceModule: "digitalCore", sourceType: this.type(source.event), source, channel,
        eligible: proof.eligible, ...(proof.eligible ? { sourceDigest: proof.sourceDigest, ownerRef: proof.ownerRef } : {}) };
    };
    const first = await projection(), second = await projection();
    if (!same(first, second)) this.fail();
    return second;
  },
  /**
   * Reuses the established tenant-only private Communication/Profile RPC transport, not actor credentials.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {string} moduleName Fixed profile or commsApi owner selected by the calling member.
   * @param {string} path Fixed private recipient or Communication endpoint.
   * @param {Object} body Source selector, frozen intent request or empty inspect body.
   * @param {Object} p Validated frozen gift notification transport, template and recipient-bound policy.
   * @returns {Promise<Object>} Unwrapped private owner response from the reminder delivery transport.
   * @remarks Effects: Uses tenant-only internal runtime RPC; never forwards participant credentials.
   * Failure behavior: Transport/privacy or failed-envelope errors reject.
   * @override Reuse the existing qualified transport without adding retries or business authority headers.
   */
  rpc: function (r, moduleName, path, body, p) {
    return SERVICE.DefaultDigitalCouponReminderDeliveryService.rpc(r, moduleName, path, body, p);
  },
  /**
   * Requires exact source proof and bounded opaque inbox references; absence is not a fallback recipient.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} source Exact {enterpriseCode, operationCode, event, side} gift coordinates.
   * @param {Object} p Validated frozen gift notification transport, template and recipient-bound policy.
   * @returns {Promise<Object>} Validated Profile proof with eligibility, source digest/owner and opaque
   * inbox recipients.
   * @remarks Effects: Calls Profile's independent source verification and opt-in selection; no contacts are
   * returned.
   * Failure behavior: Rejects foreign source, malformed/duplicate/over-bound recipients or missing
   * eligible-owner proof.
   * @override An explicit empty roster is valid; never replace unavailable selection with an actor/admin
   * fallback.
   */
  recipients: async function (r, source, p) {
    const proof = await this.rpc(r, "profile", "/internal/bundles/gifts/notification-recipients", { source, channel: "IN_APP" }, p);
    if (proof?.contractVersion !== 1 || proof.tenant !== r.tenant || proof.sourceModule !== "digitalCore" ||
        proof.sourceType !== this.type(source.event) || !same(proof.source, source) || proof.channel !== "IN_APP" ||
        typeof proof.eligible !== "boolean" || !Array.isArray(proof.recipients) || proof.recipients.length > p.maximumRecipients ||
        !proof.eligible && proof.recipients.length || new Set(proof.recipients.map(v => v.recipientId)).size !== proof.recipients.length ||
        proof.recipients.some(v => !v || Object.keys(v).sort().join(",") !== "recipientAddressReference,recipientId" ||
          typeof v.recipientId !== "string" || !/^[A-Za-z0-9_.:@|-]{1,256}$/.test(v.recipientId) ||
          !/^profile-inbox:[a-f0-9]{64}$/.test(v.recipientAddressReference)) ||
        proof.eligible && (!/^[a-f0-9]{64}$/.test(proof.sourceDigest || "") ||
          !["CUSTOMER", "ENTERPRISE"].includes(proof.ownerRef?.type) || typeof proof.ownerRef.code !== "string" ||
          Object.keys(proof.ownerRef).sort().join(",") !== "code,type")) this.fail();
    return proof;
  },
  /**
   * Reversible source coordinates are selectors, never bearer authority.
   * @param {Object} source Exact {enterpriseCode, operationCode, event, side} gift coordinates.
   * @returns {string} Canonical base64url encoding of business partition, operation, event and side.
   * @remarks Effects: Pure reversible selector encoding after validation.
   * Failure behavior: Throws for invalid source coordinates.
   * @override Treat the code as a selector, not a bearer credential.
   */
  sourceCode: function (source) {
    this.selector(source);
    return Buffer.from(JSON.stringify([source.enterpriseCode, source.operationCode, source.event, source.side])).toString("base64url");
  },
  /**
   * Identity excludes clock, retry count, mutable presentation and current recipient selection.
   * @param {Object} source Exact {enterpriseCode, operationCode, event, side} gift coordinates.
   * @param {string} recipientId Opaque Profile-selected recipient identity.
   * @returns {string} Stable digital-gift digest over source, recipient and IN_APP.
   * @remarks Effects: Pure identity hashing; no intent creation.
   * Failure behavior: Invalid source or unavailable digest owner throws.
   * @override Exclude retry clock and mutable presentation so acknowledgements resume the same intent.
   */
  key: function (source, recipientId) {
    return "digital-gift:" + SERVICE.DefaultDigitalBundleService.digest([this.sourceCode(source), recipientId, "IN_APP"]);
  },
  /**
   * No carbon amounts, rewards, contact details or employee identity enter message bodies.
   * @param {Object} row Original gift operation with code and parseable deadline.
   * @returns {Object} Only giftReference and ISO deadline.
   * @remarks Effects: Pure template-variable projection; does not expose contacts or value balances.
   * Failure behavior: Invalid deadline throws during ISO conversion.
   * @override Keep messages free of token, reward/carbon and Employee identity fields.
   */
  variables: function (row) { return { giftReference: row.code, deadline: new Date(row.deadline).toISOString() }; },
  /**
   * Verifies the immutable plan before every original request or pointer inspect.
   * @param {Object} row Persisted gift operation with evidence.giftNotifications.
   * @param {Object} source Exact {enterpriseCode, operationCode, event, side} gift coordinates.
   * @param {string} digest Current proven event sourceDigest.
   * @param {Object} p Validated frozen gift notification transport, template and recipient-bound policy.
   * @returns {Object} Cloned validated frozen plan, or an empty version1 plan if none exists.
   * @remarks Effects: Validates without persisting; recipients/template/locale/key remain immutable.
   * Failure behavior: Throws on source mismatch, malformed bounds, substituted keys/variables or conflicting
   * intent pointers.
   * @override Do not reconstruct a stored plan from current presentation or current recipient choices.
   */
  plan: function (row, source, digest, p) {
    const plan = row.evidence.giftNotifications?.[source.event];
    if (!plan) return { version: 1, sourceDigest: digest, resolvedSides: [], entries: [] };
    if (plan.version !== 1 || plan.sourceDigest !== digest || !Array.isArray(plan.resolvedSides) || plan.resolvedSides.length > 2 ||
        new Set(plan.resolvedSides).size !== plan.resolvedSides.length || plan.resolvedSides.some(s => !sides.includes(s)) ||
        !Array.isArray(plan.entries) || plan.entries.length > p.maximumRecipients * 2 ||
        new Set(plan.entries.map(e => e.idempotencyKey)).size !== plan.entries.length) this.fail();
    for (const entry of plan.entries) {
      if (!plan.resolvedSides.includes(entry.side) || typeof entry.recipientId !== "string" ||
          !/^[A-Za-z0-9_.:@|-]{1,256}$/.test(entry.recipientId) || !/^profile-inbox:[a-f0-9]{64}$/.test(entry.recipientAddressReference) ||
          entry.idempotencyKey !== this.key({ ...source, side: entry.side }, entry.recipientId) ||
          entry.purpose !== this.type(source.event) || entry.channel !== "IN_APP" ||
          !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(entry.templateCode) || !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(entry.locale) ||
          !same(entry.variables, this.variables(row)) || entry.intentCode !== undefined && !/^COMM_[a-f0-9]{64}$/.test(entry.intentCode)) this.fail();
    }
    return structuredClone(plan);
  },
  /**
   * Saves only immutable intent pointers on the existing operation via generated CAS; no delivery queue or
   * timer.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} row Current persisted gift operation including its CAS revision.
   * @param {string} event Proven lifecycle event whose notification plan is being recorded.
   * @param {Object} plan Validated original recipient/message entries and intent pointers.
   * @returns {Promise<Object>} Updated original operation from the bundle CAS owner.
   * @remarks Effects: Writes only evidence.giftNotifications[event] on the existing operation.
   * Failure behavior: Revision/storage failures reject; never assume a lost acknowledgement is absent.
   * @override Preserve unrelated operation evidence and decisions; do not introduce another delivery queue.
   */
  save: function (r, row, event, plan) {
    return SERVICE.DefaultDigitalBundleService.update({ ...r, enterpriseCode: row.enterpriseCode }, row,
      { evidence: { ...row.evidence, giftNotifications: { ...row.evidence.giftNotifications, [event]: plan } } });
  },
  /**
   * Owner-internal postcommit handoff. Each failed side is independent; no transfer/release methods are
   * called here.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {string} operationCode Original persisted gift operation code.
   * @param {string} event Owner-confirmed lifecycle event.
   * @returns {Promise<Object>} NOT_REQUESTED when disabled, otherwise RECORDED/UNCONFIRMED with per-side
   * outcomes.
   * @remarks Effects: Freezes Profile-selected plans and creates/inspects original Communication intents
   * after receipt proof; no holdings effects.
   * Failure behavior: Messaging/proof/CAS failures are contained as UNCONFIRMED; stale events may be
   * SUPPRESSED.
   * @override Keep postcommit isolation, frozen replay and sender/recipient outcomes independent; RECORDED
   * is not delivered.
   */
  notify: async function (r, operationCode, event) {
    if (CONFIG.get("digitalCore")?.giftNotifications?.enabled !== true) return { status: "NOT_REQUESTED" };
    try {
      const p = this.settings(), base = this.selector({ enterpriseCode: r.enterpriseCode, operationCode, event, side: "SENDER" });
      if (r.transactionContext !== undefined) this.fail();
      return await SERVICE.DefaultLoggerService.runSensitiveOperation(r, async () => {
        const outcomes = [];
        for (const side of sides) {
          const source = { ...base, side };
          try {
            let evidence = await this.record(r, source);
            if (!evidence.eligible) { outcomes.push({ side, status: "SUPPRESSED" }); continue; }
            let plan = this.plan(evidence.row, source, evidence.sourceDigest, p);
            if (!plan.resolvedSides.includes(side)) {
              const proof = await this.recipients(r, source, p);
              if (!proof.eligible || proof.sourceDigest !== evidence.sourceDigest || !same(proof.ownerRef, evidence.ownerRef)) this.fail();
              evidence = await this.record(r, source);
              if (!evidence.eligible || proof.sourceDigest !== evidence.sourceDigest || !same(p, this.settings())) this.fail();
              plan = this.plan(evidence.row, source, evidence.sourceDigest, p);
              if (!plan.resolvedSides.includes(side)) {
                plan.resolvedSides.push(side);
                plan.entries.push(...proof.recipients.map(recipient => ({ ...recipient, side, templateCode: p.templates[event],
                  purpose: this.type(event), channel: "IN_APP", locale: p.locale,
                  idempotencyKey: this.key(source, recipient.recipientId), variables: this.variables(evidence.row) })));
                evidence.row = await this.save(r, evidence.row, event, plan);
              }
            }
            for (const frozen of plan.entries.filter(e => e.side === side)) {
              try {
                if (!same(p, this.settings())) this.fail();
                const message = { sourceModule: "digitalCore", sourceType: this.type(event), sourceCode: this.sourceCode(source),
                  ...Object.fromEntries(["templateCode", "recipientId", "recipientAddressReference", "purpose", "channel", "locale", "idempotencyKey", "variables"].map(k => [k, frozen[k]])),
                  requiresSourceEligibility: true };
                const result = await this.rpc(r, "commsApi", frozen.intentCode ? "/internal/communications/" + frozen.intentCode + "/inspect"
                  : "/internal/communications", frozen.intentCode ? {} : message, p);
                if (!/^COMM_[a-f0-9]{64}$/.test(result?.intentCode || "") || frozen.intentCode && frozen.intentCode !== result.intentCode ||
                    !["ACCEPTED", "DELIVERING", "DELIVERED", "RETRY_PENDING", "UNCERTAIN", "SUPPRESSED", "FAILED", "CANCELLED", "DEAD_LETTER", "UNCONFIGURED"].includes(result.status)) this.fail();
                if (!frozen.intentCode) {
                  const current = await this.record(r, source);
                  // A pending intent may have been accepted while the gift decision committed. Never overwrite that decision.
                  if (!current.eligible) this.fail();
                  const latest = this.plan(current.row, source, current.sourceDigest, p), entry = latest.entries.find(e => e.idempotencyKey === frozen.idempotencyKey);
                  if (!entry || entry.intentCode && entry.intentCode !== result.intentCode) this.fail();
                  if (!entry.intentCode) { entry.intentCode = result.intentCode; await this.save(r, current.row, event, latest); }
                }
                outcomes.push({ side, status: result.status });
              } catch (_) { outcomes.push({ side, status: "UNCONFIRMED" }); }
            }
            if (!plan.entries.some(e => e.side === side)) outcomes.push({ side, status: "NO_ELIGIBLE_RECIPIENT" });
          } catch (_) { outcomes.push({ side, status: "UNCONFIRMED" }); }
        }
        return { status: outcomes.some(o => o.status === "UNCONFIRMED") ? "UNCONFIRMED" : "RECORDED", outcomes };
      });
    } catch (_) { return { status: "UNCONFIRMED" }; }
  },
  /**
   * Separately authorized notification-only retry never re-enters gift decisions or component mutations.
   * @param {Object} r Original admitted tenant/business context; retains participant bearer or explicitly
   * qualified runtime authority.
   * @param {Object} input Exactly operationCode, event and SENDER/RECIPIENT side for fresh participant
   * admission.
   * @returns {Promise<Object>} notify outcome for the original event; notification handoff may cover both
   * frozen sides.
   * @remarks Effects: Reauthorizes selected participant side then reuses notification-only handoff; no gift
   * decision/transfer/release.
   * Failure behavior: Invalid selector or participant denial rejects; notify returns messaging uncertainty.
   * @override Selected side is the admission basis, not authority to change recipients or replay holdings.
   */
  retry: async function (r, input) {
    if (!input || Object.keys(input).sort().join(",") !== "event,operationCode,side" || !events.includes(input.event) || !sides.includes(input.side)) this.fail();
    const b = SERVICE.DefaultDigitalBundleService, row = await b.participantOperation(r, input.operationCode);
    await b.authorize(r, input.side === "SENDER" ? row.ownerRef : row.recipientRef, input.side === "SENDER" ? "GIFT_SEND" : "GIFT_RECEIVE");
    return this.notify({ ...r, enterpriseCode: row.enterpriseCode }, row.code, input.event);
  },
  /**
   * Communication pre-dispatch/retry hook rechecks the source and current Profile opt-in; never readdresses
   * frozen messages.
   * @param {Object} input Communication's frozen source/purpose/key and exact recipient/inbox references.
   * @returns {Promise<Object>} Original source/recipient references plus current eligible Boolean.
   * @remarks Effects: Rechecks Profile source and opt-in; does not send, mutate holdings or readdress the
   * intent.
   * Failure behavior: Disabled returns false; malformed frozen identity, unavailable proof or policy drift
   * rejects.
   * @override Match the original recipient and stable event key; source expiry/decision or opt-out must
   * suppress retries.
   */
  isDispatchEligible: async function (input) {
    const result = { tenant: input.tenant, sourceCode: input.sourceCode, recipientId: input.recipientId,
      recipientAddressReference: input.recipientAddressReference };
    if (CONFIG.get("digitalCore")?.giftNotifications?.enabled === false) return { ...result, eligible: false };
    const p = this.settings();
    if (input.sourceModule !== "digitalCore" || input.channel !== "IN_APP" || typeof input.sourceCode !== "string" || input.sourceCode.length > 768) this.fail();
    let parts;
    try { parts = JSON.parse(Buffer.from(input.sourceCode, "base64url").toString()); } catch (_) { this.fail(); }
    if (!Array.isArray(parts) || parts.length !== 4) this.fail();
    const source = this.selector({ enterpriseCode: parts[0], operationCode: parts[1], event: parts[2], side: parts[3] });
    if (input.sourceCode !== this.sourceCode(source) || input.sourceType !== this.type(source.event) || input.purpose !== this.type(source.event) ||
        input.idempotencyKey !== this.key(source, input.recipientId)) this.fail();
    const proof = await this.recipients(input, source, p);
    if (!same(p, this.settings())) this.fail();
    return { ...result, eligible: proof.eligible && proof.recipients.some(v => v.recipientId === input.recipientId && v.recipientAddressReference === input.recipientAddressReference) };
  },
};
