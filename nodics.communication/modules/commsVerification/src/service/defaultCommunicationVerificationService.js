/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
const definitions = require("../utils/statusDefinitions");
const defaults = require("../../config/properties").communicationVerification;
/**
 * @module commsVerification/service/defaultCommunicationVerificationService
 * @description Reuses Communication challenge mechanics and the generated challenge repository for bound, revisioned verification and one-use consumption. Never grants identity access or sends email.
 * @layer service @owner commsVerification
 * @override Later layers may tighten policy or replace documented members. Preserve trusted binding, fresh reads, acknowledged compare-and-set writes and the existing schema owner.
 */
module.exports = {
  /** Throws a stable, recipient-safe capability error. */
  fail: function (code) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError) throw new CLASSES.NodicsError(code);
    throw Object.assign(new Error(definitions[code].message), { code });
  },
  /** Returns server time; tests and supported clock adapters override this member, never a public command. */
  now: function () { return new Date(); },
  /** Validates a finite date without silently accepting missing or invalid expiry. */
  time: function (value) {
    if (!(value instanceof Date) && typeof value !== "string") this.fail("ERR_COMMS_VERIFY_INPUT");
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) this.fail("ERR_COMMS_VERIFY_INPUT");
    return time;
  },
  /** Bounds non-empty scalar inputs before hashing or persistence. */
  text: function (value) {
    if (typeof value !== "string" || !value.trim() || value.length > 512) this.fail("ERR_COMMS_VERIFY_INPUT");
    return value;
  },
  /** Hashes stable tuples without punctuation-lossy identifiers. */
  digest: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /** Hashes a challenge secret with its per-record salt; preserves the established digest format. */
  hash: function (secret, salt) { return crypto.createHash("sha256").update(String(salt) + ":" + String(secret)).digest("hex"); },
  /** Compares validated SHA-256 hex digests without unequal-length exceptions. */
  equalDigest: function (left, right) {
    return typeof left === "string" && typeof right === "string" && /^[a-f0-9]{64}$/.test(left) && /^[a-f0-9]{64}$/.test(right) &&
      crypto.timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
  },
  /** Resolves existing challenge defaults and rejects unsafe numeric settings instead of coercing them. */
  challengePolicy: function (policy = {}) {
    const effective = typeof CONFIG !== "undefined" && CONFIG.get ? CONFIG.get("communicationVerification") : undefined;
    const values = { ...defaults, ...effective, ...policy };
    if (values.enabled === false || ![values.ttlSeconds, values.maximumAttempts, values.secretBytes].every(Number.isSafeInteger) ||
        values.ttlSeconds < 1 || values.ttlSeconds > 86400 || values.maximumAttempts < 1 || values.maximumAttempts > 100 ||
        values.secretBytes < 6 || values.secretBytes > 64) this.fail("ERR_COMMS_VERIFY_POLICY");
    return values;
  },
  /** Creates challenge evidence and returns the transient secret separately. The explicit secret is for trusted callers/tests, never public input. */
  create: function (command, policy) {
    policy = this.challengePolicy(policy);
    if (!command || typeof command !== "object" || Array.isArray(command)) this.fail("ERR_COMMS_VERIFY_INPUT");
    for (const key of ["tenant", "purpose", "subjectReference", "channel", "destination"]) this.text(command[key]);
    const now = new Date(this.time(command.now === undefined ? this.now() : command.now));
    const secret = command.secret === undefined ? crypto.randomBytes(policy.secretBytes).toString("hex") : this.text(command.secret);
    const salt = crypto.randomBytes(16).toString("hex");
    return { secret, challenge: {
      tenant: command.tenant, purpose: command.purpose, subjectReference: command.subjectReference,
      channel: command.channel, destinationHash: crypto.createHash("sha256").update(command.destination).digest("hex"),
      secretHash: salt + ":" + this.hash(secret, salt), attempt: 0, maximumAttempts: policy.maximumAttempts,
      status: "PENDING", expiresAt: new Date(now.getTime() + policy.ttlSeconds * 1000), correlationId: command.correlationId,
    } };
  },
  /** Calculates a verification transition; callers of this pure helper must persist it before trusting success. */
  verify: function (challenge, secret, now) {
    const at = new Date(this.time(now === undefined ? this.now() : now));
    if (!challenge || !["PENDING", "DELIVERED"].includes(challenge.status)) this.fail("ERR_COMMS_VERIFY_STATE");
    const expiry = this.time(challenge.expiresAt);
    if (!Number.isSafeInteger(challenge.attempt) || challenge.attempt < 0 || !Number.isSafeInteger(challenge.maximumAttempts) || challenge.maximumAttempts < 1 ||
        typeof challenge.secretHash !== "string" || !/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(challenge.secretHash)) this.fail("ERR_COMMS_VERIFY_INPUT");
    if (expiry <= at.getTime()) return { ...challenge, status: "EXPIRED" };
    if (challenge.attempt >= challenge.maximumAttempts) return { ...challenge, status: "LOCKED" };
    const [salt, hash] = challenge.secretHash.split(":");
    if (typeof secret === "string" && secret.length > 0 && secret.length <= 512 && this.equalDigest(hash, this.hash(secret, salt)))
      return { ...challenge, status: "VERIFIED", verifiedAt: at };
    const attempt = challenge.attempt + 1;
    return { ...challenge, attempt, status: attempt >= challenge.maximumAttempts ? "LOCKED" : challenge.status };
  },
  /** Requires explicit rollout policy for persisted operations; pure-helper compatibility does not enable public registration. */
  storedPolicy: function (sourceModule) {
    const policy = this.challengePolicy(typeof CONFIG !== "undefined" ? CONFIG.get("communicationVerification") || {} : {});
    const stored = policy.stored || {};
    if (stored.enabled !== true || !Array.isArray(stored.trustedSourceModules) || !stored.trustedSourceModules.includes(sourceModule) ||
        ![stored.proofTtlSeconds, stored.resendCooldownSeconds, stored.maximumIssues].every(Number.isSafeInteger) ||
        stored.proofTtlSeconds < 1 || stored.proofTtlSeconds > policy.ttlSeconds || stored.resendCooldownSeconds < 1 ||
        stored.maximumIssues < 1 || stored.maximumIssues > 100) this.fail("ERR_COMMS_VERIFY_POLICY");
    return { ...policy, stored };
  },
  /** Keeps caller authorization intact; these internal methods are not HTTP handlers and never synthesize system privileges. */
  context: function (request, command) {
    const auth = request && request.authData;
    if (!auth || auth.principalType !== "service" || !auth.tenant || request.tenant !== auth.tenant || !(auth.principalId || auth.loginId))
      this.fail("ERR_COMMS_VERIFY_CONTEXT");
    this.text(request.tenant);
    if (!command || typeof command !== "object" || Array.isArray(command)) this.fail("ERR_COMMS_VERIFY_INPUT");
    for (const key of ["sourceModule", "purpose", "subjectReference", "channel", "destination", "bindingReference"]) this.text(command[key]);
    this.storedPolicy(command.sourceModule);
    return { tenant: request.tenant, authData: auth };
  },
  /** Binds the purpose, subject, destination and owner-authenticated continuation without persisting the raw continuation. */
  binding: function (context, command) {
    return this.digest([context.tenant, command.sourceModule, command.purpose, command.subjectReference, command.channel, command.destination, command.bindingReference]);
  },
  /** Selects the existing generated repository; there is no local-memory or direct-database fallback. */
  repository: function () {
    const repository = typeof SERVICE !== "undefined" && SERVICE.DefaultCommsVerificationChallengeService;
    if (!repository || !["get", "save", "update"].every(method => typeof repository[method] === "function")) this.fail("ERR_COMMS_VERIFY_STORAGE");
    return repository;
  },
  /** Rejects failed/malformed generated read envelopes rather than treating them as an absent challenge. */
  rows: function (response) {
    if (!response || response.success === false || response.error || (typeof response.code === "string" && response.code.startsWith("ERR_")) || !Array.isArray(response.result))
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    return response.result;
  },
  /** Reads an exact challenge with tenant isolation and uncached owner storage. */
  readStored: async function (context, code) {
    if (typeof code !== "string" || !/^CV_[a-f0-9]{64}$/.test(code)) this.fail("ERR_COMMS_VERIFY_INPUT");
    const rows = this.rows(await this.repository().get({ ...context, query: { code, tenant: context.tenant },
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } }));
    if (rows.length > 1 || (rows[0] && (rows[0].code !== code || rows[0].tenant !== context.tenant || rows[0].active !== true))) this.fail("ERR_COMMS_VERIFY_STORAGE");
    return rows[0];
  },
  /** Checks an existing private record against the current trusted binding and managed revision. */
  boundRecord: async function (request, command) {
    const context = this.context(request, command), current = await this.readStored(context, command.challengeCode);
    if (!current || !this.equalDigest(current.bindingHash, this.binding(context, command))) this.fail("ERR_COMMS_VERIFY_CONTEXT");
    if (!Number.isSafeInteger(current.revision) || current.revision < 0 || !Number.isSafeInteger(current.generation) || current.generation < 1)
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    for (const key of ["sourceModule", "purpose", "subjectReference", "channel"]) {
      if (current[key] !== command[key]) this.fail("ERR_COMMS_VERIFY_CONTEXT");
    }
    if (current.destinationHash !== crypto.createHash("sha256").update(command.destination).digest("hex")) this.fail("ERR_COMMS_VERIFY_CONTEXT");
    return { context, current };
  },
  /** Projects only safe challenge progress. Hashes, attempt internals and consumed-command identifiers never enter this DTO. */
  project: function (record) {
    return { challengeCode: record.code, status: record.status, revision: record.revision, generation: record.generation,
      expiresAt: record.expiresAt, nextIssueAt: record.nextIssueAt };
  },
  /** Confirms supplied persisted fields without logging private material or accepting a submitted model as stored evidence. */
  assertValues: function (saved, expected) {
    for (const [key, value] of Object.entries(expected)) {
      const actual = saved[key];
      if (value instanceof Date ? this.time(actual) !== value.getTime() : JSON.stringify(actual) !== JSON.stringify(value)) this.fail("ERR_COMMS_VERIFY_STORAGE");
    }
  },
  /** Rejects an explicit persistence failure even when the server may have applied the write. */
  assertWrite: function (response) {
    if (!response || response.success === false || response.error || (typeof response.code === "string" && response.code.startsWith("ERR_")))
      this.fail("ERR_COMMS_VERIFY_STORAGE");
  },
  /** Writes through managed optimistic concurrency and proves this exact mutation by fresh owner readback. No acknowledgement is accepted as proof. */
  transition: async function (context, current, patch, guard = {}) {
    const mutationId = crypto.randomBytes(32).toString("hex");
    const response = await this.repository().update({ ...context,
      query: { ...guard, code: current.code, tenant: context.tenant, revision: current.revision, status: current.status, bindingHash: current.bindingHash },
      model: { ...patch, code: current.code, revision: current.revision, lastMutationId: mutationId },
      options: { recursive: false, upsert: false } });
    this.assertWrite(response);
    const saved = await this.readStored(context, current.code);
    if (!saved || saved.revision !== current.revision + 1 || saved.lastMutationId !== mutationId || saved.bindingHash !== current.bindingHash)
      this.fail("ERR_COMMS_VERIFY_CONFLICT");
    this.assertValues(saved, patch);
    return saved;
  },
  /** Issues one persisted challenge per trusted continuation. Retry returns progress, not another secret or another send. */
  issueStored: async function (request, command) {
    const context = this.context(request, command), policy = this.storedPolicy(command.sourceModule);
    if (command.secret !== undefined || command.now !== undefined) this.fail("ERR_COMMS_VERIFY_INPUT");
    const bindingHash = this.binding(context, command), code = "CV_" + this.digest([context.tenant, bindingHash]);
    const existing = await this.readStored(context, code);
    if (existing) {
      if (!this.equalDigest(existing.bindingHash, bindingHash)) this.fail("ERR_COMMS_VERIFY_CONTEXT");
      return { ...this.project(existing), replayed: true };
    }
    const now = this.now(), prepared = this.create({ tenant: context.tenant, purpose: command.purpose, subjectReference: command.subjectReference,
      channel: command.channel, destination: command.destination, correlationId: request.correlationId || code, now }, policy);
    const mutationId = crypto.randomBytes(32).toString("hex");
    const model = { ...prepared.challenge, code, sourceModule: command.sourceModule, bindingHash, revision: 0, generation: 1,
      issuedAt: now, nextIssueAt: new Date(now.getTime() + policy.stored.resendCooldownSeconds * 1000), lastMutationId: mutationId, active: true };
    this.assertWrite(await this.repository().save({ ...context, model, options: { recursive: false, upsert: false } }));
    const saved = await this.readStored(context, code);
    if (!saved || saved.lastMutationId !== mutationId || saved.bindingHash !== bindingHash || saved.revision !== 1 || saved.status !== "PENDING" || saved.secretHash !== model.secretHash)
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    this.assertValues(saved, { ...model, revision: 1 });
    if (this.time(saved.expiresAt) <= this.time(this.now())) this.fail("ERR_COMMS_VERIFY_STATE");
    return { ...this.project(saved), secret: prepared.secret, replayed: false };
  },
  /** Verifies the current generation and persists success/failure before returning a transient continuation proof. */
  verifyStored: async function (request, command) {
    const { context, current } = await this.boundRecord(request, command), policy = this.storedPolicy(command.sourceModule);
    if (command.generation !== current.generation) this.fail("ERR_COMMS_VERIFY_CONFLICT");
    const now = this.now(), next = this.verify(current, command.secret, now);
    const patch = { status: next.status, attempt: next.attempt };
    let proof;
    if (next.status === "VERIFIED") {
      proof = crypto.randomBytes(32).toString("hex");
      Object.assign(patch, { verifiedAt: now, proofHash: this.digest(proof),
        proofExpiresAt: new Date(Math.min(this.time(current.expiresAt), now.getTime() + policy.stored.proofTtlSeconds * 1000)) });
    }
    const guard = next.status === "VERIFIED" ? { expiresAt: { $gt: now } } : {};
    const saved = await this.transition(context, current, patch, guard);
    if (proof && (this.time(saved.proofExpiresAt) <= this.time(this.now()) || this.time(saved.expiresAt) <= this.time(this.now()))) this.fail("ERR_COMMS_VERIFY_STATE");
    return { ...this.project(saved), ...(proof ? { proof, proofExpiresAt: saved.proofExpiresAt } : {}) };
  },
  /** Consumes verified proof for one owner command. Replays never return another grant, even for the same command identifier. */
  consumeStored: async function (request, command) {
    const { context, current } = await this.boundRecord(request, command), now = this.now();
    this.text(command.operationReference);
    if (current.status !== "VERIFIED" || command.generation !== current.generation || typeof command.proof !== "string" ||
        !/^[a-f0-9]{64}$/.test(command.proof) || !this.equalDigest(current.proofHash, this.digest(command.proof)) ||
        this.time(current.proofExpiresAt) <= now.getTime() || this.time(current.expiresAt) <= now.getTime()) this.fail("ERR_COMMS_VERIFY_STATE");
    const saved = await this.transition(context, current, { status: "CONSUMED", consumedAt: now,
      consumedOperationHash: this.digest([command.sourceModule, command.operationReference]), consumedProofHash: current.proofHash, proofHash: "" },
    { proofExpiresAt: { $gt: now }, expiresAt: { $gt: now } });
    if (this.time(saved.proofExpiresAt) <= this.time(this.now()) || this.time(saved.expiresAt) <= this.time(this.now())) this.fail("ERR_COMMS_VERIFY_STATE");
    return { ...this.project(saved), consumedAt: saved.consumedAt };
  },
  /**
   * Reads evidence of an earlier consumption without consuming again or granting
   * another business execution. The purpose owner must inspect its own outcome.
   * Requires the original high-entropy proof and exact command/binding/generation;
   * expired proof cannot become a new account-recovery authentication method.
   * @param {Object} request Authorised internal caller in the original tenant.
   * @param {Object} command Original bound consume command, including proof.
   * @returns {Promise<Object>} Safe immutable consumption receipt; never a grant.
   */
  readConsumptionReceiptStored: async function (request, command) {
    const { current } = await this.boundRecord(request, command);
    const now = this.time(this.now());
    this.text(command.operationReference);
    if (current.status !== "CONSUMED" || command.generation !== current.generation ||
        typeof command.proof !== "string" || !/^[a-f0-9]{64}$/.test(command.proof) ||
        !this.equalDigest(current.consumedProofHash, this.digest(command.proof)) ||
        !this.equalDigest(current.consumedOperationHash, this.digest([command.sourceModule, command.operationReference])) ||
        this.time(current.proofExpiresAt) <= now || this.time(current.expiresAt) <= now ||
        this.time(current.consumedAt) > now) this.fail("ERR_COMMS_VERIFY_STATE");
    return { ...this.project(current), consumedAt: current.consumedAt, executionGranted: false };
  },
  /** Replaces a challenge in-place so delayed codes/proofs cannot survive a resend. Limits and revision come from owner policy/state. */
  replaceStored: async function (request, command) {
    const { context, current } = await this.boundRecord(request, command), policy = this.storedPolicy(command.sourceModule), now = this.now();
    if (command.expectedRevision !== current.revision || !["PENDING", "DELIVERED", "VERIFIED", "EXPIRED", "LOCKED"].includes(current.status)) this.fail("ERR_COMMS_VERIFY_STATE");
    if (current.generation >= policy.stored.maximumIssues || this.time(current.nextIssueAt) > now.getTime()) this.fail("ERR_COMMS_VERIFY_RATE");
    if (command.secret !== undefined || command.now !== undefined) this.fail("ERR_COMMS_VERIFY_INPUT");
    const prepared = this.create({ tenant: context.tenant, purpose: command.purpose, subjectReference: command.subjectReference,
      channel: command.channel, destination: command.destination, now, correlationId: request.correlationId || current.code }, policy);
    const saved = await this.transition(context, current, { status: "PENDING", secretHash: prepared.challenge.secretHash, attempt: 0,
      maximumAttempts: prepared.challenge.maximumAttempts, generation: current.generation + 1, expiresAt: prepared.challenge.expiresAt,
      issuedAt: now, nextIssueAt: new Date(now.getTime() + policy.stored.resendCooldownSeconds * 1000),
      proofHash: "", proofExpiresAt: new Date(0) });
    return { ...this.project(saved), secret: prepared.secret };
  },
  /** Cancels unused proof only; cancellation cannot erase a consumed-command receipt or reopen a terminal challenge. */
  cancelStored: async function (request, command) {
    const { context, current } = await this.boundRecord(request, command);
    if (current.status === "CANCELLED") return this.project(current);
    if (!["PENDING", "DELIVERED", "VERIFIED", "EXPIRED", "LOCKED"].includes(current.status) || command.expectedRevision !== current.revision) this.fail("ERR_COMMS_VERIFY_STATE");
    const saved = await this.transition(context, current, { status: "CANCELLED", proofHash: "", proofExpiresAt: new Date(0) });
    return this.project(saved);
  },
};
