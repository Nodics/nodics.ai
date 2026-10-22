/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto"), { isDeepStrictEqual: same } = require("node:util");
/**
 * @module digitalCore/service/defaultDigitalCouponReminderDeliveryService
 * @description Connects source-proven coupon reminders to Profile recipients and existing Communication
 * intents.
 * Inputs: Original expiry candidates, reviewed transport policy and frozen Communication retry inputs.
 * Outputs: Opaque recipient proofs, stable source/intent keys, submission outcomes and dispatch eligibility.
 * Effects: Private runtime RPC reads Profile and requests Communication intents; no local queue, contacts or
 * Commerce mutation.
 * Failure behavior: Malformed/private owner evidence rejects; notify contains failures as UNCONFIRMED rather
 * than false delivery.
 * Exported members: fail, settings, digest, rpc, recipients, sourceCode, key, notify, isDispatchEligible.
 * @owner digitalCore
 * @layer service
 * @override Override effective delivery members while preserving stable keys, frozen addressing and current
 * opt-in/source checks.
 * @see ../../llm/contracts/coupon-expiry-reminders.md
 */
const configuration = require("../utils/configuration");
module.exports = {
  /**
   * Refuses unavailable evidence without substituting a recipient or reporting delivery.
   * @returns {never} Always throws the bounded reminder delivery evidence error.
   * @remarks Effects: No message or recipient effects.
   * Failure behavior: Throws Coupon reminder delivery is unconfirmed.
   * @override Do not replace unavailable proof with recipient fallback or delivery success.
   */
  fail: function () { throw new Error("Coupon reminder delivery is unconfirmed"); },
  /**
   * Reads complete centrally owned transport, bounds and presentation selections.
   * @returns {Object} Cloned enabled IN_APP delivery policy with validated
   * connection/template/locale/bounds.
   * @remarks Effects: Reads owner config only.
   * Failure behavior: Throws when disabled or policy/transport/template/recipient limits are invalid.
   * @override Keep reusable transport definitions in Digital and explicit resource selection separate from
   * activation.
   */
  settings: function () {
    const owner = CONFIG.get("digitalCore")?.couponReminders, p = owner?.delivery;
    if (owner?.enabled !== true || !p || p.channel !== "IN_APP" ||
        [p.profileConnectionName, p.communicationConnectionName, p.templateCode].some(v => typeof v !== "string" || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(v)) ||
        !configuration.integer(p.timeoutMs, p.validation?.timeoutMs) ||
        !configuration.integer(p.maximumRecipients, p.validation?.maximumRecipients) ||
        typeof p.allowInsecureLoopback !== "boolean" || !/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(p.locale || "")) this.fail();
    return structuredClone(p);
  },
  /**
   * Hashes a stable occurrence/recipient identity, independent of scan time and attempt.
   * @param {*} value JSON-serializable stable identity tuple.
   * @returns {string} Lowercase SHA256 hex of JSON serialization.
   * @remarks Effects: Pure hashing; no persistence.
   * Failure behavior: Serialization of cyclic/unsupported input or hashing undefined throws.
   * @override Preserve tuple ordering and exact serialization for retry identity.
   */
  digest: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /**
   * Uses existing runtime credential transport; no original actor token or business enterprise header.
   * @param {Object} r Tenant-only source context; no caller credential is forwarded.
   * @param {string} moduleName Internal profile or commsApi owner selection.
   * @param {string} apiName Fixed private recipient, intent creation or inspect endpoint.
   * @param {Object} requestBody Original source selector or frozen Communication request.
   * @param {Object} p Validated connection names, timeout and secure-loopback selection.
   * @returns {Promise<Object>} Unwrapped successful private owner response.
   * @remarks Effects: Performs one sensitive internal-auth RPC with response bound, no redirects and no
   * retries.
   * Failure behavior: Rejects absent/malformed/failed envelope or excessive nesting; transport failures
   * propagate.
   * @override Do not add business Enterprise headers, actor tokens or a second delivery outbox.
   */
  rpc: async function (r, moduleName, apiName, requestBody, p) {
    const call = { local: false, moduleName, connectionName: moduleName === "profile" ? p.profileConnectionName : p.communicationConnectionName,
      targetAuthority: { runtimeRole: moduleName === "profile" ? "PLATFORM" : "ENGAGEMENT" }, tenant: r.tenant, request: { tenant: r.tenant },
      apiName, methodName: "POST", requestBody, requireInternalAuth: true, timeoutMs: p.timeoutMs, maxAttempts: 1,
      maxResponseBytes: 32768, followRedirects: false, secureTransport: { required: true, allowInsecureLoopback: p.allowInsecureLoopback } };
    let response = await SERVICE.DefaultLoggerService.runSensitiveOperation(call, () => SERVICE.DefaultModuleService.invokeModule(call));
    for (let depth = 0; depth < 6; depth++) {
      if (!response || typeof response !== "object" || Array.isArray(response) || response.error || response.success === false ||
          /^ERR_/.test(response.code || "") || response.errors && (!Array.isArray(response.errors) || response.errors.length)) this.fail();
      if (response.data !== undefined) response = response.data;
      else if (response.result !== undefined) response = response.result;
      else return response;
    }
    this.fail();
  },
  /**
   * Requests only the persisted source coordinates; Profile must independently callback to Digital before
   * resolving recipients.
   * @param {Object} r Tenant context for private Profile selection.
   * @param {Object} source Exact enterpriseCode, entitlementCode and occurrenceKey coordinates.
   * @param {Object} p Validated transport and maximumRecipients policy.
   * @returns {Promise<Object>} Validated current Profile eligibility proof and opaque inbox recipient
   * roster.
   * @remarks Effects: Profile independently checks source and preferences; no contacts or messages are
   * created.
   * Failure behavior: Rejects foreign source/channel/tenant or malformed, duplicate or over-bound
   * recipients.
   * @override An eligible empty selection is explicit; unavailable selection never falls back to
   * buyer/actor.
   */
  recipients: async function (r, source, p) {
    const result = await this.rpc(r, "profile", "/internal/coupons/notification-recipients", { source, channel: "IN_APP" }, p);
    if (result.contractVersion !== 1 || result.tenant !== r.tenant || !same(result.source, source) ||
        result.channel !== "IN_APP" || typeof result.eligible !== "boolean" || !Array.isArray(result.recipients) ||
        result.recipients.length > p.maximumRecipients || !result.eligible && result.recipients.length ||
        new Set(result.recipients.map(v => v.recipientId)).size !== result.recipients.length ||
        result.recipients.some(v => !v || Object.keys(v).sort().join(",") !== "recipientAddressReference,recipientId" ||
          typeof v.recipientId !== "string" || !/^[A-Za-z0-9_.:@|-]{1,256}$/.test(v.recipientId) ||
          !/^profile-inbox:[a-f0-9]{64}$/.test(v.recipientAddressReference))) this.fail();
    return result;
  },
  /**
   * Encodes business placement and entitlement in a reversible source selector, not an authorization token.
   * @param {Object} source Retained enterpriseCode and entitlementCode.
   * @returns {string} Reversible base64url JSON pair, not a credential.
   * @remarks Effects: Pure selector encoding; occurrence is separately bound in the intent key.
   * Failure behavior: Assumes valid source shape; does not authorize or validate ownership itself.
   * @override Keep selector separate from current source and recipient admission.
   */
  sourceCode: function (source) { return Buffer.from(JSON.stringify([source.enterpriseCode, source.entitlementCode])).toString("base64url"); },
  /**
   * Stable occurrence, recipient and channel identity survives repeated sweeps and lost acknowledgement.
   * @param {Object} source Original COUPON_EXPIRY occurrenceKey.
   * @param {string} recipientId Profile-selected opaque recipient identity.
   * @returns {string} Occurrence key plus digest of recipient and IN_APP.
   * @remarks Effects: Pure stable identity generation; no intent write.
   * Failure behavior: Malformed source shape/unsupported serialization may throw; callers validate
   * coordinates.
   * @override Exclude scan time, attempts and mutable message text from identity.
   */
  key: function (source, recipientId) { return source.occurrenceKey + ":" + this.digest([recipientId, "IN_APP"]); },
  /**
   * Requests one occurrence using only current owner-proven recipients; Communication persists and retries
   * the original intent.
   * @param {Object} r Trusted tenant source context.
   * @param {Object} candidate Owner-proven expiry sourceCode/enterpriseCode/occurrenceKey, ownerRef and
   * expiresAt.
   * @returns {Promise<Object>} SKIPPED, RECORDED or UNCONFIRMED with occurrenceKey/deliveryAttempted and any
   * per-intent outcomes.
   * @remarks Effects: Rechecks current Profile source/roster before each original Communication intent
   * submission; Communication owns durable retries.
   * Failure behavior: Source ineligibility/empty roster returns SKIPPED; transport/proof/config errors
   * return UNCONFIRMED, retaining attempted flag.
   * @override Never infer delivery from submission, resend with a new key or substitute current actor
   * contacts.
   */
  notify: async function (r, candidate) {
    let attempted = false;
    try {
      const p = this.settings(), source = { enterpriseCode: candidate.enterpriseCode, entitlementCode: candidate.sourceCode,
        occurrenceKey: candidate.occurrenceKey }, proof = await this.recipients(r, source, p);
      if (!proof.eligible) return { occurrenceKey: source.occurrenceKey, status: "SKIPPED", reason: "SOURCE_INELIGIBLE", deliveryAttempted: false };
      if (!same(proof.ownerRef, candidate.ownerRef) || proof.expiresAt !== candidate.expiresAt || !same(p, this.settings())) this.fail();
      if (!proof.recipients.length) return { occurrenceKey: source.occurrenceKey, status: "SKIPPED", reason: "NO_ELIGIBLE_RECIPIENT", deliveryAttempted: false };
      const outcomes = [];
      for (const recipient of proof.recipients) {
        if (!same(p, this.settings())) this.fail();
        const current = await this.recipients(r, source, p);
        if (!current.eligible || !same(current.ownerRef, proof.ownerRef) || current.expiresAt !== proof.expiresAt ||
            !current.recipients.some(v => same(v, recipient))) { outcomes.push({ status: "SKIPPED", reason: "RECIPIENT_OR_SOURCE_CHANGED" }); continue; }
        attempted = true;
        const result = await this.rpc(r, "commsApi", "/internal/communications", { sourceModule: "digitalCore",
          sourceType: "DIGITAL_COUPON_EXPIRING", sourceCode: this.sourceCode(source), templateCode: p.templateCode,
          ...recipient, purpose: "DIGITAL_COUPON_EXPIRING", channel: "IN_APP", locale: p.locale,
          idempotencyKey: this.key(source, recipient.recipientId), expiresAt: proof.expiresAt, requiresSourceEligibility: true,
          variables: { entitlementReference: source.entitlementCode, expiresAt: proof.expiresAt } }, p);
        if (!/^COMM_[a-f0-9]{64}$/.test(result?.intentCode || "") || !["ACCEPTED", "QUEUED", "DELIVERING", "DELIVERED", "RETRY_PENDING",
          "UNCERTAIN", "SUPPRESSED", "FAILED", "CANCELLED", "DEAD_LETTER", "UNCONFIGURED"].includes(result.status)) this.fail();
        outcomes.push({ intentCode: result.intentCode, status: result.status });
      }
      return { occurrenceKey: source.occurrenceKey, status: "RECORDED", deliveryAttempted: attempted, outcomes };
    } catch (_) { return { occurrenceKey: candidate.occurrenceKey, status: "UNCONFIRMED", deliveryAttempted: attempted }; }
  },
  /**
   * Communication's pre-send/retry hook rechecks source state and Profile preferences without readdressing
   * frozen content.
   * @param {Object} input Frozen Communication source/type/purpose/channel/key/expiry and exact
   * recipient/inbox coordinates.
   * @returns {Promise<Object>} Original tenant/source/recipient references plus current eligible flag.
   * @remarks Effects: Revalidates source and opt-in before send/retry; sends nothing and does not change
   * frozen addressing.
   * Failure behavior: Explicit disabled returns false; malformed identity, unavailable Profile proof or
   * drift rejects.
   * @override Require same occurrence/recipient and unexpired fixed rights; suppress stale or opted-out
   * retries.
   */
  isDispatchEligible: async function (input) {
    const result = { tenant: input.tenant, sourceCode: input.sourceCode, recipientId: input.recipientId,
      recipientAddressReference: input.recipientAddressReference };
    if (CONFIG.get("digitalCore")?.couponReminders?.enabled === false) return { ...result, eligible: false };
    const p = this.settings();
    if (input.sourceModule !== "digitalCore" || input.sourceType !== "DIGITAL_COUPON_EXPIRING" ||
        input.purpose !== "DIGITAL_COUPON_EXPIRING" || input.channel !== "IN_APP" ||
        typeof input.sourceCode !== "string" || input.sourceCode.length > 512 ||
        !/^COUPON_EXPIRY_[a-f0-9]{64}:[a-f0-9]{64}$/.test(input.idempotencyKey)) this.fail();
    let pair;
    try { pair = JSON.parse(Buffer.from(input.sourceCode, "base64url").toString()); } catch (_) { this.fail(); }
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(v => typeof v !== "string" || !/^[A-Za-z0-9_.:@|-]{1,128}$/.test(v))) this.fail();
    const source = { enterpriseCode: pair[0], entitlementCode: pair[1], occurrenceKey: input.idempotencyKey.split(":")[0] };
    if (this.sourceCode(source) !== input.sourceCode || this.key(source, input.recipientId) !== input.idempotencyKey) this.fail();
    const proof = await this.recipients(input, source, p);
    if (!same(p, this.settings())) this.fail();
    return { ...result, eligible: proof.eligible && proof.expiresAt === input.expiresAt && Date.parse(proof.expiresAt) > Date.now() &&
      proof.recipients.some(v => v.recipientId === input.recipientId && v.recipientAddressReference === input.recipientAddressReference) };
  },
};
