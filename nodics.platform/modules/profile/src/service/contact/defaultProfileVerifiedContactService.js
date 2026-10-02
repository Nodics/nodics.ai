/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require("node:crypto");
const privateReads = new WeakSet();
const privateWrites = new WeakSet();
const marker = "profileVerifiedContact";

/**
 * @module profile/service/contact/DefaultProfileVerifiedContactService
 * @description Owns canonical Customer-associated Contact verification evidence,
 * explicit transactional notification consent and suppression on existing Contact
 * records. Uses generated owners and Communication proof RPC, never login/email
 * inference, a new registry, schema or queue. Delivery reuses Communication's owner.
 * All rollout gates are closed
 * when absent; main must install schema retention and private CRUD/read hooks.
 * @layer service
 * @owner profile
 * @override Later Profile layers may narrow purpose/transport policy or individual
 * helpers while preserving exact admission, canonical association, CAS/readback,
 * original-command receipt recovery and independent explicit consent.
 */
module.exports = {
  /** Throws an existing credential-free refusal. @returns {never} Throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_AUTH_00003");
  },

  /** Hashes fixed ordered owner facts, not an identity lookup key. @param {*} value Facts. @returns {string} Digest. */
  digest: function (value) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(value))
      .digest("hex");
  },

  /** Reads the owner clock. @returns {number} Current milliseconds. */
  now: function () {
    return Date.now();
  },

  /** Validates safe opaque references without accepting email as a principal ID. @param {*} value Reference. @returns {string} Bounded reference. */
  reference: function (value) {
    if (
      typeof value !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value)
    )
      this.fail();
    return value;
  },

  /** Requires independently qualified existing schema, hooks and CAS; omission is false. @returns {Object} Effective owner policy. */
  policy: function () {
    const p = CONFIG.get("profileVerifiedContacts") || {};
    if (
      [
        "enabled",
        "qualified",
        "contactCasQualified",
        "crudProtectionQualified",
        "readPrivacyQualified",
        "verificationTransportQualified",
      ].some((key) => p[key] !== true) ||
      !Number.isSafeInteger(p.maximumContacts) ||
      p.maximumContacts < 1 ||
      p.maximumContacts > 100 ||
      !Number.isSafeInteger(p.maximumVerifiedAgeSeconds) ||
      p.maximumVerifiedAgeSeconds < 1 ||
      p.maximumVerifiedAgeSeconds > 31536000 ||
      !Number.isSafeInteger(p.clockSkewSeconds) ||
      p.clockSkewSeconds < 0 ||
      p.clockSkewSeconds > 60 ||
      !p.purposes ||
      Object.getPrototypeOf(p.purposes) !== Object.prototype ||
      !Object.keys(p.purposes).length ||
      Object.keys(p.purposes).length > 32
    )
      this.fail();
    return p;
  },

  /** Resolves an explicitly reviewed transactional purpose; category never creates consent. @param {string} purpose Purpose. @param {string} channel Channel. @returns {Object} Frozen descriptor. */
  purpose: function (purpose, channel) {
    this.reference(purpose);
    const p = this.policy(),
      entry = Object.hasOwn(p.purposes, purpose) && p.purposes[purpose];
    if (
      !entry ||
      Object.keys(entry).sort().join(",") !==
        "category,channels,requiresConsent,version" ||
      entry.category !== "TRANSACTIONAL" ||
      entry.requiresConsent !== true ||
      !Number.isSafeInteger(entry.version) ||
      entry.version < 1 ||
      entry.version > 2147483647 ||
      !Array.isArray(entry.channels) ||
      !entry.channels.length ||
      entry.channels.length > 2 ||
      new Set(entry.channels).size !== entry.channels.length ||
      entry.channels.some((value) => !["EMAIL", "SMS"].includes(value)) ||
      !entry.channels.includes(channel)
    )
      this.fail();
    return {
      category: entry.category,
      channels: [...entry.channels],
      requiresConsent: true,
      version: entry.version,
    };
  },

  /** Checks a bounded exact DTO. @param {Object} command DTO. @param {string[]} keys Permitted keys. @returns {void} Refuses extras. */
  input: function (command, keys) {
    if (
      !command ||
      Object.getPrototypeOf(command) !== Object.prototype ||
      Object.keys(command).some((key) => !keys.includes(key))
    )
      this.fail();
  },

  /** Reads only through generated owners with exact transient read admission. @param {string} service Owner. @param {string} tenant Partition. @param {Object} query Fixed selector. @param {number} limit Hard read bound. @returns {Promise<Object[]>} Uncached records. */
  records: async function (service, tenant, query, limit = 2) {
    this.reference(tenant);
    const owner = SERVICE[service];
    if (typeof owner?.get !== "function") this.fail();
    const request = {
      tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query,
      options: { recursive: false, skipItemCache: true, limit },
      searchOptions: { pageSize: limit, pageNumber: 1 },
    };
    privateReads.add(request);
    try {
      const response = await owner.get(request);
      if (
        !response ||
        !/^SUC_/.test(response.code || "") ||
        response.success === false ||
        response.error ||
        (response.errors !== undefined &&
          (!Array.isArray(response.errors) || response.errors.length)) ||
        !Array.isArray(response.result) ||
        response.result.length > limit
      )
        this.fail();
      return response.result;
    } finally {
      privateReads.delete(request);
    }
  },

  /** Reads exactly one associated Contact, never falling back to a login or supplied address. @param {string} tenant Canonical partition. @param {string} code Stored Contact reference. @returns {Promise<Object>} Current Contact. */
  contact: async function (tenant, code) {
    const rows = await this.records("DefaultContactService", tenant, {
      code: this.reference(code),
    });
    if (rows.length !== 1 || rows[0].code !== code) this.fail();
    return rows[0];
  },

  /** Validates and preserves the stored destination; no arbitrary Customer login is used. @param {Object} contact Contact. @param {string} channel Channel. @returns {string} EMAIL or E.164 destination. */
  destination: function (contact, channel) {
    if (
      contact.active !== true ||
      typeof contact.value !== "string" ||
      contact.value !== contact.value.trim() ||
      /[\u0000-\u0020\u007f]/.test(contact.value)
    )
      this.fail();
    if (
      channel === "EMAIL" &&
      contact.type === "EMAIL" &&
      contact.value.length <= 254 &&
      /^[^@]+@[^@]+\.[^@]+$/.test(contact.value)
    )
      return contact.value;
    const phone = (contact.prefix || "") + contact.value;
    if (
      channel === "SMS" &&
      contact.type === "PHONE" &&
      /^\+[1-9][0-9]{7,14}$/.test(phone)
    )
      return phone;
    this.fail();
  },

  /** Freshly resolves an active canonical Customer and its uniquely selected associated contact. @param {Object} input Trusted owner selector. @returns {Promise<Object>} Current private selection and binding. */
  select: async function (input) {
    const p = this.policy();
    this.reference(input.tenant);
    this.reference(input.ownerId);
    if (!["EMAIL", "SMS"].includes(input.channel)) this.fail();
    const rows = await this.records("DefaultCustomerService", input.tenant, {
      _id: input.ownerId,
    });
    if (
      rows.length !== 1 ||
      SERVICE.DefaultEnterpriseMembershipService.recordId(rows[0]._id) !==
        input.ownerId ||
      rows[0].active !== true ||
      rows[0].principalType !== "customer"
    )
      this.fail();
    const canonical = await SERVICE.DefaultEnterpriseMembershipService.resolve(
      rows[0],
      input.tenant,
      "CUSTOMER",
    );
    if (!["CUSTOMER", "EMPLOYEE"].includes(canonical.identity.recordKind))
      this.fail();
    if (rows[0].authenticationIdentity) {
      const policy =
        SERVICE.DefaultCustomerRegistrationService.participationPolicy();
      const participation = rows[0].customerParticipation;
      if (
        participation?.phase !== "COMPLETE" ||
        participation.termsVersion !== policy.terms.version ||
        participation.termsDigest !== policy.terms.digest ||
        participation.termsDocumentCode !== policy.terms.documentCode ||
        !Number.isSafeInteger(participation.revision) ||
        participation.revision < 1
      )
        this.fail();
    }
    return this.selectContacts(canonical, input);
  },

  /** Selects only contacts attached to the original typed anchor, without recursive eligibility evaluation. @param {Object} canonical Fresh existing membership anchor. @param {Object} input Owner selector. @returns {Promise<Object>} Bound canonical Contact. */
  selectContacts: async function (canonical, input) {
    const p = this.policy();
    const refs = canonical.person.contacts;
    if (
      !Array.isArray(refs) ||
      !refs.length ||
      refs.length > p.maximumContacts ||
      refs.some((value) => typeof value !== "string")
    )
      this.fail();
    const codes = refs.map((value) => this.reference(value)).sort();
    if (new Set(codes).size !== codes.length) this.fail();
    const contacts = await this.records(
      "DefaultContactService",
      canonical.identity.tenantCode,
      { code: { $in: codes } },
      codes.length + 1,
    );
    if (
      contacts.length !== codes.length ||
      new Set(contacts.map((value) => value.code)).size !== contacts.length ||
      contacts.some((value) => !codes.includes(value.code))
    )
      this.fail();
    const candidates = contacts.filter(
      (value) =>
        value.active === true &&
        value.type === (input.channel === "EMAIL" ? "EMAIL" : "PHONE"),
    );
    if (
      !candidates.length ||
      candidates.some(
        (value) =>
          !Number.isSafeInteger(value.priority) ||
          value.priority < 0 ||
          value.priority > 1000000,
      )
    )
      this.fail();
    candidates.sort((a, b) => a.priority - b.priority);
    if (
      candidates.length > 1 &&
      candidates[0].priority === candidates[1].priority
    )
      this.fail();
    const contact = candidates[0],
      destination = this.destination(contact, input.channel);
    const identity = SERVICE.DefaultEnterpriseMembershipService.identity(
      canonical.identity,
    );
    const contactId = SERVICE.DefaultEnterpriseMembershipService.recordId(
      contact._id,
    );
    const binding = this.digest([
      identity,
      codes,
      contactId,
      contact.code,
      contact.type,
      contact.value,
      contact.prefix || "",
      contact.priority,
      input.channel,
    ]);
    return {
      identity,
      contact,
      contactId,
      binding,
      destination,
      channel: input.channel,
      tenant: input.tenant,
      ownerId: input.ownerId,
    };
  },

  /** Admits only a live self Customer actor, never a runtime/admin or arbitrary login. @param {Object} request Signed private request. @param {Object} command Owner DTO. @param {string[]} keys Allowed fields. @returns {Promise<Object>} Fresh self-owned selection. */
  self: async function (request, command, keys) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    if (request.authData?.principalType !== "customer") this.fail();
    this.input(command, keys);
    const selected = await this.select({
      tenant: request.tenant,
      ownerId: command.ownerId,
      channel: command.channel,
    });
    const actor =
      await SERVICE.DefaultEnterpriseMembershipService.actor(request);
    if (this.digest(actor.identity) !== this.digest(selected.identity))
      this.fail();
    if (
      selected.identity.recordKind === "EMPLOYEE" &&
      request.authData.sessionContext?.owner !== "profile.customerParticipation"
    )
      this.fail();
    return selected;
  },

  /** Validates the retained private marker rather than promoting legacy flags. @param {Object} selected Fresh selection. @param {boolean} [absent] Allows uninitialized state. @returns {Object|null} Private state. */
  state: function (selected, absent = false) {
    const value = selected.contact[marker];
    if (value === undefined && absent) return null;
    if (
      !value ||
      value.version !== 1 ||
      !Number.isSafeInteger(value.revision) ||
      value.revision < 1 ||
      value.revision >= 2147483647 ||
      value.binding !== selected.binding ||
      this.digest(value.owner) !== this.digest(selected.identity) ||
      !/^[a-f0-9]{48}$/.test(value.mutationId || "") ||
      !value.verification ||
      !Array.isArray(value.notificationConsent) ||
      value.notificationConsent.length > 32 ||
      !value.suppression ||
      typeof value.suppression.all !== "boolean" ||
      !value.suppression.purposes ||
      Object.keys(value.suppression.purposes).length > 32 ||
      Object.values(value.suppression.purposes).some(
        (v) => typeof v !== "boolean",
      )
    )
      this.fail();
    const cp = value.verification;
    if (
      ![
        "ISSUE_PENDING",
        "ISSUE_UNRECOVERABLE",
        "DELIVERY_PENDING",
        "ISSUED",
        "VERIFY_PENDING",
        "PROOF_READY",
        "CONSUME_PENDING",
        "VERIFIED",
      ].includes(cp.phase) ||
      !/^[a-f0-9]{64}$/.test(cp.commandId || "") ||
      !/^[a-f0-9]{64}$/.test(cp.bindingReference || "") ||
      Object.hasOwn(cp, "secret") ||
      Object.hasOwn(cp, "proof") ||
      (cp.phase !== "ISSUE_PENDING" &&
        (!/^CV_[a-f0-9]{64}$/.test(cp.challengeCode || "") ||
          !Number.isSafeInteger(cp.generation) ||
          cp.generation < 1 ||
          !Number.isFinite(Date.parse(cp.expiresAt))))
    )
      this.fail();
    return value;
  },

  /** Requires the expected private revision, including zero only before initialization. @param {Object|null} state Existing marker. @param {*} expected Caller-observed revision. @returns {void} Exact CAS prerequisite. */
  revision: function (state, expected) {
    if (!Number.isSafeInteger(expected) || expected !== (state?.revision || 0))
      this.fail();
  },

  /** Commits one actual Contact CAS and requires exactly one acknowledgement plus full own-command readback. @param {Object} selected Fresh original selection. @param {Object} proposed Intended state. @param {Function} [validate] Owner-only fresh policy assertion before write and after readback. @returns {Promise<Object>} Matching reread selection. */
  persist: async function (selected, proposed, validate) {
    this.policy();
    if (validate !== undefined && typeof validate !== "function") this.fail();
    validate?.();
    const old = this.state(selected, true);
    const state = {
      ...proposed,
      version: 1,
      owner: selected.identity,
      binding: selected.binding,
      revision: (old?.revision || 0) + 1,
      mutationId: crypto.randomBytes(24).toString("hex"),
    };
    const eligibility =
      SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
    if (
      (CONFIG.get("profileCustomerEligibility") || {}).enabled === true &&
      (typeof eligibility?.prepareCanonicalContactChange !== "function" ||
        typeof eligibility.completeCanonicalContactChange !== "function")
    )
      this.fail();
    const evidenceChange = await eligibility?.prepareCanonicalContactChange?.(
      selected.identity,
      {
        contactCode: selected.contact.code,
        beforeRevision: old?.revision || 0,
        afterRevision: state.revision,
        beforePhase: old?.verification?.phase || "ABSENT",
        afterPhase: state.verification.phase,
      },
    );
    const request = {
      tenant: selected.identity.tenantCode,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: {
        _id: selected.contact._id,
        code: selected.contact.code,
        active: true,
        type: selected.contact.type,
        value: selected.contact.value,
        priority: selected.contact.priority,
        prefix:
          selected.contact.prefix === undefined
            ? { $exists: false }
            : selected.contact.prefix,
        [marker]: old || { $exists: false },
      },
      model: { [marker]: state },
      options: { recursive: false, upsert: false, returnModified: false },
    };
    privateWrites.add(request);
    try {
      validate?.();
      const response = await SERVICE.DefaultContactService.update(request);
      if (
        !response ||
        !/^SUC_/.test(response.code || "") ||
        response.success === false ||
        response.error ||
        (response.errors !== undefined &&
          (!Array.isArray(response.errors) || response.errors.length)) ||
        response.result?.matchedCount !== 1
      )
        this.fail();
    } catch {
      this.fail();
    } finally {
      privateWrites.delete(request);
    }
    const current = await this.select(selected);
    if (
      current.binding !== selected.binding ||
      this.digest(current.contact[marker]) !== this.digest(state)
    )
      this.fail();
    validate?.();
    if (evidenceChange)
      await eligibility.completeCanonicalContactChange(
        evidenceChange,
        current.identity,
        current.contact[marker].revision,
      );
    validate?.();
    return current;
  },

  /** Applies the existing distributed limiter with stable canonical/destination keys. @param {Object} selected Canonical selection. @param {string} operation Fixed operation. @returns {Promise<void>} Admission. */
  rate: async function (selected, operation) {
    const value = this.policy().rates?.[operation];
    if (
      !value ||
      !Number.isSafeInteger(value.limit) ||
      value.limit < 1 ||
      value.limit > 100 ||
      !Number.isSafeInteger(value.windowSeconds) ||
      value.windowSeconds < 1 ||
      value.windowSeconds > 86400 ||
      typeof SERVICE.DefaultRateLimitService?.enforce !== "function"
    )
      this.fail();
    await SERVICE.DefaultRateLimitService.enforce({
      moduleName: "profile",
      channelName: "rateLimit",
      tenant: selected.identity.tenantCode,
      capability: "profile.verifiedContact",
      operation,
      identity: [
        this.digest(selected.identity),
        this.digest([selected.channel, selected.destination]),
      ],
      limit: value.limit,
      windowSeconds: value.windowSeconds,
      requireDistributed: true,
    });
  },

  /** Builds the exact stored verification command with a fixed Profile purpose. @param {Object} selected Selection. @param {Object} checkpoint Original checkpoint. @param {string} operation Fixed RPC operation. @param {Object} [extra] Transient proof/code only. @returns {Object} Bound DTO. */
  verificationCommand: function (selected, checkpoint, operation, extra = {}) {
    const command = {
      operation,
      sourceModule: "profile",
      purpose: "PROFILE_CANONICAL_CONTACT",
      subjectReference: "profile-contact:" + selected.binding,
      channel: selected.channel,
      destination: selected.destination,
      bindingReference: checkpoint.bindingReference,
    };
    if (operation !== "ISSUE")
      Object.assign(command, {
        challengeCode: checkpoint.challengeCode,
        generation: checkpoint.generation,
      });
    if (["CONSUME", "RECEIPT"].includes(operation))
      command.operationReference = "profile-contact:" + checkpoint.commandId;
    return { ...command, ...extra };
  },

  /** Executes the actual service-authenticated Communication RPC once, never delivery or automatic replay. @param {Object} request Private self request. @param {Object} selected Owner selection. @param {Object} command Fixed verification DTO. @returns {Promise<Object>} Strict versioned owner reply. */
  rpc: async function (request, selected, command) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    if (request.authData?.principalType !== "customer") this.fail();
    const actor =
      await SERVICE.DefaultEnterpriseMembershipService.actor(request);
    if (this.digest(actor.identity) !== this.digest(selected.identity))
      this.fail();
    const p = this.policy(),
      t = p.transport;
    if (
      !t ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(t.connectionName || "") ||
      !Number.isSafeInteger(t.timeoutMs) ||
      t.timeoutMs < 1 ||
      t.timeoutMs > 60000 ||
      typeof SERVICE.DefaultModuleService?.invokeModule !== "function"
    )
      this.fail();
    const envelope = { tenant: selected.identity.tenantCode };
    let value;
    try {
      value = await SERVICE.DefaultLoggerService.runSensitiveOperation(
        envelope,
        () =>
          SERVICE.DefaultModuleService.invokeModule({
            local: false,
            moduleName: "commsApi",
            connectionName: t.connectionName,
            targetAuthority: t.targetAuthority || undefined,
            apiName: "/internal/verification/commands",
            methodName: "POST",
            tenant: envelope.tenant,
            request: envelope,
            header: { "X-Enterprise-Code": request.authData.entCode },
            requestBody: command,
            requireInternalAuth: true,
            maxAttempts: 1,
            timeoutMs: t.timeoutMs,
            maxResponseBytes: 8192,
            followRedirects: false,
            secureTransport: {
              required: true,
              allowInsecureLoopback: t.allowInsecureLoopback === true,
            },
          }),
      );
    } catch {
      this.fail();
    }
    for (let depth = 0; depth < 6; depth++) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value.success === false ||
        value.error ||
        /^ERR_/.test(value.code || "") ||
        (value.errors !== undefined &&
          (!Array.isArray(value.errors) || value.errors.length))
      )
        this.fail();
      if (value.contractVersion === 1) break;
      if (Object.hasOwn(value, "data") === Object.hasOwn(value, "result"))
        this.fail();
      value = Object.hasOwn(value, "data") ? value.data : value.result;
    }
    if (
      value.contractVersion !== 1 ||
      !/^CV_[a-f0-9]{64}$/.test(value.challengeCode || "") ||
      (command.challengeCode &&
        value.challengeCode !== command.challengeCode) ||
      !Number.isSafeInteger(value.revision) ||
      value.revision < 1 ||
      !Number.isSafeInteger(value.generation) ||
      value.generation < 1 ||
      (command.generation && value.generation !== command.generation) ||
      !Number.isFinite(Date.parse(value.expiresAt)) ||
      Object.hasOwn(value, "data") ||
      Object.hasOwn(value, "result")
    )
      this.fail();
    if (
      command.operation === "ISSUE" &&
      (value.status !== "PENDING" ||
        typeof value.replayed !== "boolean" ||
        (!value.replayed && !/^[a-f0-9]{12,128}$/.test(value.secret || "")) ||
        (value.replayed && value.secret !== undefined))
    )
      this.fail();
    if (
      command.operation === "VERIFY" &&
      (!["PENDING", "DELIVERED", "VERIFIED", "EXPIRED", "LOCKED"].includes(
        value.status,
      ) ||
        (value.status === "VERIFIED" &&
          (!/^[a-f0-9]{64}$/.test(value.proof || "") ||
            !Number.isFinite(Date.parse(value.proofExpiresAt)))))
    )
      this.fail();
    if (
      ["CONSUME", "RECEIPT"].includes(command.operation) &&
      (value.status !== "CONSUMED" ||
        value.executionGranted !== (command.operation === "CONSUME") ||
        !Number.isFinite(Date.parse(value.consumedAt)))
    )
      this.fail();
    return value;
  },

  /** Returns content-free progress, never code, proof, destination or private state. @param {Object} selected Current state. @returns {Object} Owner progress. */
  progress: function (selected) {
    const state = this.state(selected);
    return {
      commandId: state.verification.commandId,
      revision: state.revision,
      status: state.verification.phase,
      verified: state.verification.phase === "VERIFIED",
    };
  },

  /** Starts one self-owned Contact command and delegates delivery without exposing the code. @param {Object} request Private signed Customer request. @param {Object} command ownerId/channel/expectedRevision. @returns {Promise<Object>} Content-free progress. */
  beginVerification: async function (request, command) {
    let selected = await this.self(request, command, [
      "ownerId",
      "channel",
      "expectedRevision",
    ]);
    this.deliveryPolicy();
    const old = this.state(selected, true);
    this.revision(old, command.expectedRevision);
    if (old && old.verification.phase !== "VERIFIED") this.fail();
    await this.rate(selected, "ISSUE");
    const checkpoint = {
      phase: "ISSUE_PENDING",
      commandId: crypto.randomBytes(32).toString("hex"),
      bindingReference: crypto.randomBytes(32).toString("hex"),
    };
    selected = await this.persist(selected, {
      verification: checkpoint,
      notificationConsent: old?.notificationConsent || [],
      suppression: old?.suppression || { all: false, purposes: {} },
    });
    return this.issuePending(request, selected);
  },

  /** Resumes only the retained original issue; Communication replay yields no recovered secret or new send. @param {Object} request Private self request. @param {Object} command Exact original command/revision. @returns {Promise<Object>} Private handoff or replay progress. */
  resumeIssue: async function (request, command) {
    const selected = await this.self(request, command, [
      "ownerId",
      "channel",
      "expectedRevision",
      "commandId",
    ]);
    const state = this.state(selected);
    this.revision(state, command.expectedRevision);
    if (
      state.verification.phase !== "ISSUE_PENDING" ||
      state.verification.commandId !== command.commandId
    )
      this.fail();
    await this.rate(selected, "ISSUE");
    return this.issuePending(request, selected);
  },

  /** Issues only the stored binding and hands a fresh transient code directly to Communication. @param {Object} request Private self request. @param {Object} selected Pending selection. @returns {Promise<Object>} Content-free delivery progress. */
  issuePending: async function (request, selected) {
    this.deliveryPolicy();
    const state = this.state(selected),
      checkpoint = state.verification;
    if (checkpoint.phase !== "ISSUE_PENDING") this.fail();
    const result = await this.rpc(
      request,
      selected,
      this.verificationCommand(selected, checkpoint, "ISSUE"),
    );
    const saved = await this.persist(selected, {
      ...state,
      verification: {
        ...checkpoint,
        phase: result.replayed ? "ISSUE_UNRECOVERABLE" : "DELIVERY_PENDING",
        challengeCode: result.challengeCode,
        generation: result.generation,
        expiresAt: result.expiresAt,
      },
    });
    if (result.replayed) return this.progress(saved);
    return this.deliverVerification(request, saved, result.secret);
  },

  /** Requires separately approved delivery and bounded transport; never configures a sender. @returns {Object} Effective transport. */
  deliveryPolicy: function () {
    const p = this.policy(),
      t = p.transport;
    if (
      p.deliveryQualified !== true ||
      !t ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(t.connectionName || "") ||
      !Number.isSafeInteger(t.timeoutMs) ||
      t.timeoutMs < 1 ||
      t.timeoutMs > 60000
    )
      this.fail();
    return t;
  },

  /** Sends once through existing signed-source Communication with fixed Contact resources. @param {Object} request Protected self request. @param {Object} selected Held delivery checkpoint. @param {string} secret Transient issued code. @returns {Promise<Object>} Safe progress, no secret handoff. */
  deliverVerification: async function (request, selected, secret) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    if (request.authData?.principalType !== "customer") this.fail();
    const t = this.deliveryPolicy(),
      state = this.state(selected),
      cp = state.verification;
    if (
      cp.phase !== "DELIVERY_PENDING" ||
      !/^[a-f0-9]{12,128}$/.test(secret || "") ||
      Date.parse(cp.expiresAt) <= this.now()
    )
      this.fail();
    const actor =
      await SERVICE.DefaultEnterpriseMembershipService.actor(request);
    if (this.digest(actor.identity) !== this.digest(selected.identity))
      this.fail();
    const idempotencyKey = "profile-contact:" + cp.commandId;
    const intentCode =
      "COMM_" + this.digest([selected.identity.tenantCode, idempotencyKey]);
    const command = {
      sourceModule: "profile",
      sourceType: "PROFILE_CONTACT_VERIFICATION",
      sourceCode: cp.commandId,
      templateCode:
        selected.channel === "EMAIL"
          ? "profile.contact.emailVerification"
          : "profile.contact.smsVerification",
      purpose: "PROFILE_CANONICAL_CONTACT",
      channel: selected.channel,
      locale: "en",
      recipientId: "profile-customer:" + this.digest(selected.identity),
      recipientAddressReference: selected.destination,
      variables: { verificationCode: secret, expiresAt: cp.expiresAt },
      idempotencyKey,
    };
    selected = await this.persist(selected, {
      ...state,
      verification: {
        ...cp,
        delivery: {
          intentCode,
          status: "REQUEST_PENDING",
          commandDigest: this.digest(command),
        },
      },
    });
    const envelope = { tenant: selected.identity.tenantCode };
    let value;
    try {
      value = await SERVICE.DefaultLoggerService.runSensitiveOperation(
        envelope,
        () =>
          SERVICE.DefaultModuleService.invokeModule({
            local: false,
            moduleName: "commsApi",
            connectionName: t.connectionName,
            targetAuthority: t.targetAuthority || undefined,
            apiName: "/internal/communications",
            methodName: "POST",
            tenant: envelope.tenant,
            request: envelope,
            header: { "X-Enterprise-Code": request.authData.entCode },
            requestBody: command,
            requireInternalAuth: true,
            maxAttempts: 1,
            timeoutMs: t.timeoutMs,
            maxResponseBytes: 8192,
            followRedirects: false,
            secureTransport: {
              required: true,
              allowInsecureLoopback: t.allowInsecureLoopback === true,
            },
          }),
      );
    } catch {
      this.fail();
    }
    value = this.deliveryResult(value, intentCode);
    const current = this.state(selected);
    const saved = await this.persist(selected, {
      ...current,
      verification: {
        ...current.verification,
        phase: "ISSUED",
        delivery: {
          ...current.verification.delivery,
          status: value.status,
          revision: value.revision,
        },
      },
    });
    return this.progress(saved);
  },

  /** Projects only real durable Communication statuses from bounded wrappers. @param {Object} value Owner reply. @param {string} intentCode Bound intent. @returns {Object} Content-free owner outcome. */
  deliveryResult: function (value, intentCode) {
    for (let depth = 0; depth < 6; depth++) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value.success === false ||
        value.error ||
        /^ERR_/.test(value.code || "") ||
        (value.errors !== undefined &&
          (!Array.isArray(value.errors) || value.errors.length))
      )
        this.fail();
      if (value.intentCode) break;
      if (Object.hasOwn(value, "data") === Object.hasOwn(value, "result"))
        this.fail();
      value = Object.hasOwn(value, "data") ? value.data : value.result;
    }
    if (
      value.intentCode !== intentCode ||
      ![
        "ACCEPTED",
        "SUPPRESSED",
        "QUEUED",
        "DELIVERING",
        "DELIVERED",
        "FAILED",
        "CANCELLED",
        "RETRY_PENDING",
        "UNCERTAIN",
        "DEAD_LETTER",
        "UNCONFIGURED",
      ].includes(value.status) ||
      !Number.isSafeInteger(value.revision) ||
      value.revision < 0
    )
      this.fail();
    return { intentCode, status: value.status, revision: value.revision };
  },

  /** Browser begin entry; issuance and delivery are one owner chain. @param {Object} request Protected self request. @param {Object} command Exact begin DTO. @returns {Promise<Object>} Safe progress. */
  beginAndDeliver: async function (request, command) {
    return this.beginVerification(request, command);
  },

  /** Browser verify entry; consumes the transient proof internally without returning it. @param {Object} request Protected self request. @param {Object} command Original command and code. @returns {Promise<Object>} Safe verified progress. */
  verifyAndConfirm: async function (request, command) {
    const result = await this.verifyContact(request, command);
    if (!result.proof) return result;
    return this.confirmVerification(request, {
      ownerId: command.ownerId,
      channel: command.channel,
      expectedRevision: result.revision,
      commandId: result.commandId,
      proof: result.proof,
    });
  },

  /** Browser inspection observes held checkpoints without replay, proof disclosure or grants. @param {Object} request Protected self request. @param {Object} command ownerId/channel only. @returns {Promise<Object>} Safe progress and held delivery status. */
  inspectVerification: async function (request, command) {
    let selected = await this.self(request, command, ["ownerId", "channel"]);
    let state = this.state(selected, true);
    if (!state) return { revision: 0, status: "NOT_STARTED", verified: false };
    if (state.verification.delivery) {
      const t = this.deliveryPolicy(),
        intentCode = state.verification.delivery.intentCode;
      if (!/^COMM_[a-f0-9]{64}$/.test(intentCode || "")) this.fail();
      const envelope = { tenant: selected.identity.tenantCode };
      let value;
      try {
        value = await SERVICE.DefaultLoggerService.runSensitiveOperation(
          envelope,
          () =>
            SERVICE.DefaultModuleService.invokeModule({
              local: false,
              moduleName: "commsApi",
              connectionName: t.connectionName,
              targetAuthority: t.targetAuthority || undefined,
              apiName: "/internal/communications/" + intentCode + "/inspect",
              methodName: "POST",
              tenant: envelope.tenant,
              request: envelope,
              header: { "X-Enterprise-Code": request.authData.entCode },
              requestBody: {},
              requireInternalAuth: true,
              maxAttempts: 1,
              timeoutMs: t.timeoutMs,
              maxResponseBytes: 8192,
              followRedirects: false,
              secureTransport: {
                required: true,
                allowInsecureLoopback: t.allowInsecureLoopback === true,
              },
            }),
        );
      } catch {
        this.fail();
      }
      value = this.deliveryResult(value, intentCode);
      if (
        state.verification.delivery.revision !== undefined &&
        value.revision < state.verification.delivery.revision
      )
        this.fail();
      if (
        state.verification.phase === "DELIVERY_PENDING" ||
        value.status !== state.verification.delivery.status ||
        value.revision !== state.verification.delivery.revision
      ) {
        selected = await this.persist(selected, {
          ...state,
          verification: {
            ...state.verification,
            phase:
              state.verification.phase === "DELIVERY_PENDING"
                ? "ISSUED"
                : state.verification.phase,
            delivery: {
              ...state.verification.delivery,
              status: value.status,
              revision: value.revision,
            },
          },
        });
        state = this.state(selected);
      }
    }
    return {
      ...this.progress(selected),
      ...(state.verification.delivery
        ? { deliveryStatus: state.verification.delivery.status }
        : {}),
    };
  },

  /** Verifies through actual Communication evidence after a held attempt checkpoint. @param {Object} request Private self request. @param {Object} command Original command and transient code. @returns {Promise<Object>} Private proof handoff after readback. */
  verifyContact: async function (request, command) {
    let selected = await this.self(request, command, [
      "ownerId",
      "channel",
      "expectedRevision",
      "commandId",
      "secret",
    ]);
    let state = this.state(selected);
    this.revision(state, command.expectedRevision);
    if (
      state.verification.phase !== "ISSUED" ||
      state.verification.commandId !== command.commandId ||
      typeof command.secret !== "string" ||
      command.secret.length > 128 ||
      !/^[a-f0-9]{12,128}$/.test(command.secret) ||
      Date.parse(state.verification.expiresAt) <= this.now()
    )
      this.fail();
    await this.rate(selected, "VERIFY");
    selected = await this.persist(selected, {
      ...state,
      verification: {
        ...state.verification,
        phase: "VERIFY_PENDING",
        attemptDigest: this.digest(command.secret),
      },
    });
    state = this.state(selected);
    const result = await this.rpc(
      request,
      selected,
      this.verificationCommand(selected, state.verification, "VERIFY", {
        secret: command.secret,
      }),
    );
    const verified = result.status === "VERIFIED";
    const saved = await this.persist(selected, {
      ...state,
      verification: {
        ...state.verification,
        phase: verified ? "PROOF_READY" : "ISSUED",
        status: result.status,
        ...(verified
          ? {
              proofDigest: this.digest(result.proof),
              proofExpiresAt: result.proofExpiresAt,
            }
          : {}),
      },
    });
    return {
      ...this.progress(saved),
      ...(verified ? { proof: result.proof } : {}),
    };
  },

  /** Consumes only after original Contact completion facts are CAS-held and read back. @param {Object} request Private self request. @param {Object} command Original command and transient proof. @returns {Promise<Object>} Verification evidence, never consent. */
  confirmVerification: async function (request, command) {
    let selected = await this.self(request, command, [
      "ownerId",
      "channel",
      "expectedRevision",
      "commandId",
      "proof",
    ]);
    let state = this.state(selected);
    this.revision(state, command.expectedRevision);
    if (state.verification.phase !== "PROOF_READY") this.fail();
    this.proof(state.verification, command);
    await this.rate(selected, "CONSUME");
    const at = this.now(),
      checkpoint = {
        ...state.verification,
        phase: "CONSUME_PENDING",
        completion: {
          verifiedAt: new Date(at).toISOString(),
          verifiedExpiresAt: new Date(
            at + this.policy().maximumVerifiedAgeSeconds * 1000,
          ).toISOString(),
        },
      };
    checkpoint.commandDigest = this.digest(
      this.verificationCommand(selected, checkpoint, "CONSUME", {
        proof: checkpoint.proofDigest,
      }),
    );
    selected = await this.persist(selected, {
      ...state,
      verification: checkpoint,
    });
    state = this.state(selected);
    this.proof(state.verification, command);
    const result = await this.rpc(
      request,
      selected,
      this.verificationCommand(selected, state.verification, "CONSUME", {
        proof: command.proof,
      }),
    );
    return this.complete(selected, result);
  },

  /** Repairs only the saved pending command using read-only RECEIPT; never retries CONSUME or extends frozen facts. @param {Object} request Private self request. @param {Object} command Original pending revision/command/proof. @returns {Promise<Object>} Original completion readback only. */
  repairConsumedVerification: async function (request, command) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    if (
      (CONFIG.get("profileVerifiedContacts") || {}).receiptRepairQualified !==
      true
    )
      this.fail();
    const selected = await this.self(request, command, [
      "ownerId",
      "channel",
      "expectedRevision",
      "commandId",
      "proof",
    ]);
    const state = this.state(selected);
    this.revision(state, command.expectedRevision);
    if (state.verification.phase !== "CONSUME_PENDING") this.fail();
    this.proof(state.verification, command);
    if (
      state.verification.commandDigest !==
      this.digest(
        this.verificationCommand(selected, state.verification, "CONSUME", {
          proof: state.verification.proofDigest,
        }),
      )
    )
      this.fail();
    const result = await this.rpc(
      request,
      selected,
      this.verificationCommand(selected, state.verification, "RECEIPT", {
        proof: command.proof,
      }),
    );
    if (result.executionGranted !== false) this.fail();
    return this.complete(selected, result);
  },

  /** Requires the original transient proof and live frozen deadlines. @param {Object} checkpoint Saved checkpoint. @param {Object} command Original user command. @returns {void} Refuses changed/expired proof. */
  proof: function (checkpoint, command) {
    if (
      checkpoint.commandId !== command.commandId ||
      !/^[a-f0-9]{64}$/.test(command.proof || "") ||
      this.digest(command.proof) !== checkpoint.proofDigest ||
      !Number.isFinite(Date.parse(checkpoint.proofExpiresAt)) ||
      !Number.isFinite(Date.parse(checkpoint.expiresAt)) ||
      Math.min(
        Date.parse(checkpoint.proofExpiresAt),
        Date.parse(checkpoint.expiresAt),
      ) <= this.now()
    )
      this.fail();
  },

  /** Finishes only immutable held completion facts and leaves consent unchanged. @param {Object} selected Original pending selection. @param {Object} receipt Consumption evidence. @returns {Promise<Object>} Original verified checkpoint. */
  complete: async function (selected, receipt) {
    const state = this.state(selected),
      cp = state.verification,
      completion = cp.completion;
    const consumed = Date.parse(receipt.consumedAt),
      at = Date.parse(completion?.verifiedAt),
      expires = Date.parse(completion?.verifiedExpiresAt);
    if (
      cp.phase !== "CONSUME_PENDING" ||
      cp.commandDigest !==
        this.digest(
          this.verificationCommand(selected, cp, "CONSUME", {
            proof: cp.proofDigest,
          }),
        ) ||
      receipt.challengeCode !== cp.challengeCode ||
      receipt.generation !== cp.generation ||
      !Number.isFinite(at) ||
      !Number.isFinite(expires) ||
      expires <= this.now() ||
      consumed < at - this.policy().clockSkewSeconds * 1000 ||
      expires <= at ||
      expires - at > this.policy().maximumVerifiedAgeSeconds * 1000 ||
      consumed >=
        Math.min(Date.parse(cp.expiresAt), Date.parse(cp.proofExpiresAt)) ||
      !Number.isFinite(consumed)
    )
      this.fail();
    const saved = await this.persist(selected, {
      ...state,
      verification: {
        ...cp,
        phase: "VERIFIED",
        ...completion,
        consumedAt: receipt.consumedAt,
      },
    });
    return this.progress(saved);
  },

  /** Requires actual consumed evidence, current destination and a non-expired frozen marker. @param {Object} selected Selection. @param {Object} state Marker. @returns {void} Valid evidence or refusal. */
  verified: function (selected, state) {
    const v = state.verification;
    if (
      v.phase !== "VERIFIED" ||
      !/^CV_[a-f0-9]{64}$/.test(v.challengeCode || "") ||
      !/^[a-f0-9]{64}$/.test(v.commandId || "") ||
      !/^[a-f0-9]{64}$/.test(v.commandDigest || "") ||
      !Number.isSafeInteger(v.generation) ||
      v.generation < 1 ||
      !Number.isFinite(Date.parse(v.consumedAt)) ||
      !Number.isFinite(Date.parse(v.verifiedAt)) ||
      Date.parse(v.verifiedAt) >
        this.now() + this.policy().clockSkewSeconds * 1000 ||
      !Number.isFinite(Date.parse(v.verifiedExpiresAt)) ||
      Date.parse(v.verifiedExpiresAt) <= this.now() ||
      state.binding !== selected.binding ||
      v.verifiedAt !== v.completion?.verifiedAt ||
      v.verifiedExpiresAt !== v.completion?.verifiedExpiresAt ||
      Date.parse(v.verifiedExpiresAt) <= Date.parse(v.verifiedAt) ||
      Date.parse(v.verifiedExpiresAt) - Date.parse(v.verifiedAt) >
        this.policy().maximumVerifiedAgeSeconds * 1000 ||
      !/^[a-f0-9]{64}$/.test(v.proofDigest || "") ||
      v.commandDigest !==
        this.digest(
          this.verificationCommand(selected, v, "CONSUME", {
            proof: v.proofDigest,
          }),
        )
    )
      this.fail();
  },

  /** Returns a genuine current Contact fact for trusted Rule providers, independently of notification consent. @param {Object} input Exact private tenant/ownerId/channel envelope. @returns {Promise<Object>} Boolean evidence only. */
  getCanonicalVerificationFact: async function (input) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(input);
    this.input(input, ["tenant", "ownerId", "channel", "identity"]);
    if (!["EMAIL", "SMS"].includes(input.channel)) this.fail();
    if (
      input.identity &&
      (input.tenant !== undefined || input.ownerId !== undefined)
    )
      this.fail();
    const read = async () =>
      input.identity
        ? this.selectContacts(
            await SERVICE.DefaultEnterpriseMembershipService.anchor(
              input.identity,
            ),
            input,
          )
        : this.select(input);
    const selected = await read(),
      state = this.state(selected, true);
    if (!state || state.verification.phase !== "VERIFIED")
      return { verified: false };
    this.verified(selected, state);
    const current = await read();
    if (
      current.binding !== selected.binding ||
      this.digest(this.state(current)) !== this.digest(state)
    )
      this.fail();
    this.verified(current, this.state(current));
    return { verified: true };
  },

  /** Records explicit self consent for exactly one reviewed transactional purpose/version. @param {Object} request Private self request. @param {Object} command Exact purpose decision and revision. @returns {Promise<Object>} Content-free consent receipt. */
  setNotificationConsent: async function (request, command) {
    const selected = await this.self(request, command, [
      "ownerId",
      "channel",
      "expectedRevision",
      "purpose",
      "purposeVersion",
      "granted",
      "operationReference",
    ]);
    const state = this.state(selected);
    this.revision(state, command.expectedRevision);
    const reviewedPurpose = command.purpose,
      reviewedVersion = command.purposeVersion;
    const purpose = this.purpose(reviewedPurpose, selected.channel);
    if (
      !Number.isSafeInteger(reviewedVersion) ||
      reviewedVersion < 1 ||
      reviewedVersion > 2147483647 ||
      reviewedVersion !== purpose.version
    )
      this.fail();
    const assertReviewedPurpose = () => {
      const current = this.purpose(reviewedPurpose, selected.channel);
      if (
        current.version !== reviewedVersion ||
        this.digest(current) !== this.digest(purpose)
      )
        this.fail();
    };
    this.reference(command.operationReference);
    if (typeof command.granted !== "boolean") this.fail();
    if (command.granted) {
      this.verified(selected, state);
      if (state.suppression.all || state.suppression.purposes[command.purpose])
        this.fail();
    }
    const consent = {
      purpose: reviewedPurpose,
      purposeVersion: reviewedVersion,
      granted: command.granted,
      binding: selected.binding,
      actor: this.digest(selected.identity),
      operationReference: command.operationReference,
      at: new Date(this.now()).toISOString(),
    };
    const entries = state.notificationConsent.filter(
      (value) => value.purpose !== reviewedPurpose,
    );
    if (entries.length >= 32) this.fail();
    const saved = await this.persist(
      selected,
      {
        ...state,
        notificationConsent: [...entries, consent],
      },
      assertReviewedPurpose,
    );
    return {
      revision: this.state(saved).revision,
      purpose: reviewedPurpose,
      purposeVersion: reviewedVersion,
      granted: command.granted,
    };
  },

  /** Changes self suppression independently of consent; clearing it never grants anything. @param {Object} request Private self request. @param {Object} command ALL or exact purpose suppression. @returns {Promise<Object>} Content-free suppression receipt. */
  setSuppression: async function (request, command) {
    const selected = await this.self(request, command, [
      "ownerId",
      "channel",
      "expectedRevision",
      "purpose",
      "suppressed",
    ]);
    const state = this.state(selected);
    this.revision(state, command.expectedRevision);
    if (typeof command.suppressed !== "boolean") this.fail();
    const suppression = {
      all: state.suppression.all,
      purposes: { ...state.suppression.purposes },
    };
    if (command.purpose === "ALL") suppression.all = command.suppressed;
    else {
      this.purpose(command.purpose, selected.channel);
      suppression.purposes[command.purpose] = command.suppressed;
    }
    const saved = await this.persist(selected, { ...state, suppression });
    return {
      revision: this.state(saved).revision,
      suppressed: command.suppressed,
      purpose: command.purpose,
    };
  },

  /** Resolves only main's protected stored-order-proved owner, with fresh selected-contact/evidence/consent readback. @param {Object} input Exact protected tenant/ownerId/channel/purpose envelope. @returns {Promise<Object>} Private real recipient, no proof/state data. */
  resolveCanonicalContact: async function (input) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(input);
    this.input(input, [
      "tenant",
      "ownerId",
      "channel",
      "purpose",
      "enterpriseCode",
    ]);
    const descriptor = this.purpose(input.purpose, input.channel);
    const selected = await this.select(input),
      state = this.state(selected);
    this.verified(selected, state);
    const grants = state.notificationConsent.filter(
      (value) => value.purpose === input.purpose,
    );
    if (
      state.suppression.all ||
      state.suppression.purposes[input.purpose] ||
      grants.length !== 1 ||
      grants[0].granted !== true ||
      grants[0].purposeVersion !== descriptor.version ||
      grants[0].binding !== selected.binding ||
      grants[0].actor !== this.digest(selected.identity) ||
      !Number.isFinite(Date.parse(grants[0].at)) ||
      Date.parse(grants[0].at) >
        this.now() + this.policy().clockSkewSeconds * 1000
    )
      this.fail();
    const current = await this.select(input);
    if (
      current.binding !== selected.binding ||
      this.digest(this.state(current)) !== this.digest(state) ||
      this.digest(this.purpose(input.purpose, input.channel)) !==
        this.digest(descriptor)
    )
      this.fail();
    this.verified(current, this.state(current));
    return {
      verified: true,
      recipientId: "profile-customer:" + this.digest(current.identity),
      recipientAddressReference: current.destination,
    };
  },

  /** Recognizes only exact generated owner writes. @param {Object} request Generated command. @returns {boolean} Private write admission. */
  ownsWrite: function (request) {
    return privateWrites.has(request);
  },

  /** Inherits only exact owner-held generated admission into a derived pipeline object. @param {Object} target Derived request. @param {Object} source Actual parent. @returns {boolean} Whether admitted. */
  inheritContactAdmission: function (target, source) {
    if (!target || typeof target !== "object" || target === source)
      return false;
    if (privateReads.has(source)) {
      privateReads.add(target);
      return true;
    }
    if (privateWrites.has(source)) {
      privateWrites.add(target);
      return true;
    }
    return false;
  },

  /** Detects private selectors/updates under bounded traversal, including dotted/operator paths. @param {*} value Command fragment. @param {number} [depth] Traversal depth. @param {Object} [budget] Shared ceiling. @returns {boolean} Whether unsafe/private material is present. */
  privateField: function (value, depth = 0, budget = { entries: 0 }) {
    if (depth > 16 || ++budget.entries > 1024) return true;
    if (typeof value === "string") return value.includes(marker);
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(
      ([key, item]) =>
        key.includes(marker) || this.privateField(item, depth + 1, budget),
    );
  },

  /** Rejects generic private evidence filters/projections regardless of rollout enablement. @param {Object} request Generic Contact read/count/export. @returns {boolean} Read guard. */
  guardContactRead: function (request) {
    if (privateReads.has(request)) return true;
    if (
      this.privateField([request.query, request.options, request.searchOptions])
    )
      this.fail();
    return true;
  },

  /** Restricts generic mutations to complete bounded identity selectors. @param {Object} request Generated command. @returns {Object} Exact _id/code selector. */
  mutationSelector: function (request) {
    if (request.query) {
      if (
        Object.keys(request.query).length !== 1 ||
        !["_id", "code"].includes(Object.keys(request.query)[0])
      )
        this.fail();
      const [key, value] = Object.entries(request.query)[0];
      if (typeof value === "string") return { [key]: this.reference(value) };
      if (
        !value ||
        Object.keys(value).join(",") !== "$in" ||
        !Array.isArray(value.$in) ||
        !value.$in.length ||
        value.$in.length > 100
      )
        this.fail();
      return {
        [key]: { $in: value.$in.map((value) => this.reference(value)) },
      };
    }
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model];
    if (
      !models.length ||
      models.length > 100 ||
      models.some((value) => !value || typeof value.code !== "string")
    )
      this.fail();
    return { code: { $in: models.map((value) => this.reference(value.code)) } };
  },

  /** Protects private evidence without blocking genuine unmarked inserts before code allocation. @param {Object} request Generic Contact command. @param {string} [operation] Trusted hook INSERT or MUTATE, never caller data; INSERT must be a proven non-upsert provider insert. @returns {Promise<boolean>} Exact owner admission or unmarked-record mutation. */
  guardContactMutation: async function (request, operation = "MUTATE") {
    if (privateWrites.has(request)) return true;
    if (!["INSERT", "MUTATE"].includes(operation)) this.fail();
    if (this.privateField([request.model, request.query, request.options]))
      this.fail();
    let query = request.query;
    if (operation === "INSERT") {
      if (query || request.options?.upsert === true) this.fail();
      const models = Array.isArray(request.model)
        ? request.model
        : [request.model];
      if (
        !models.length ||
        models.length > 100 ||
        models.some(
          (value) =>
            !value || Object.getPrototypeOf(value) !== Object.prototype,
        )
      )
        this.fail();
      const clauses = [];
      for (const value of models) {
        if (value.code !== undefined)
          clauses.push({ code: this.reference(value.code) });
        if (value._id !== undefined)
          clauses.push({
            _id: SERVICE.DefaultEnterpriseMembershipService.recordId(value._id),
          });
      }
      if (!clauses.length) return true;
      query = { $or: clauses };
    } else if (!query) query = this.mutationSelector(request);
    if (!query || Object.getPrototypeOf(query) !== Object.prototype)
      this.fail();
    const records = await this.records(
      "DefaultContactService",
      request.tenant,
      { $and: [query, { [marker]: { $exists: true } }] },
      2,
    );
    if (records.length) this.fail();
    return true;
  },

  /** Blocks contact reassociation and canonical identity/retirement changes once retained evidence exists, including privately owned historical mutations. @param {Object} request Generated association mutation. @param {string} [operation] Trusted INSERT/PATCH/REPLACE/REMOVE hook. @param {string} [schemaName] Trusted Customer/Employee owner, not request data. @returns {Promise<boolean>} Unprotected association edit only. */
  guardCustomerAssociationMutation: async function (
    request,
    operation = "REPLACE",
    schemaName = "Customer",
  ) {
    if (
      !["INSERT", "PATCH", "REPLACE", "REMOVE"].includes(operation) ||
      !["Customer", "Employee"].includes(schemaName)
    )
      this.fail();
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    if (
      !models.length ||
      models.length > 100 ||
      models.some(
        (value) => !value || Object.getPrototypeOf(value) !== Object.prototype,
      )
    )
      this.fail();
    let entries = 0;
    const mentions = (value, depth = 0) => {
      if (depth > 16 || ++entries > 1024) this.fail();
      return (
        value &&
        typeof value === "object" &&
        Object.entries(value).some(
          ([key, item]) =>
            /(^|\.)(contacts|authenticationIdentity|identityLinkRetirement|active|disabled|registrationSuspended)(\.|$)/.test(
              key,
            ) ||
            (key === "$rename" &&
              item &&
              typeof item === "object" &&
              Object.values(item).some(
                (target) =>
                  typeof target === "string" &&
                  /(^|\.)(contacts|authenticationIdentity|identityLinkRetirement|active|disabled|registrationSuspended)(\.|$)/.test(
                    target,
                  ),
              )) ||
            mentions(item, depth + 1),
        )
      );
    };
    // Canonical identity changes invalidate the original proof owner even without a contacts patch.
    // Historical/private write admission does not transfer or exempt retained Contact evidence.
    const touched = models.some((value) => mentions(value));
    if (operation === "PATCH" && !touched) return true;
    let rows = [];
    if (operation === "INSERT") {
      // Only the trusted provider insert path may select this operation.
      if (
        request.query ||
        request.options?.upsert === true ||
        models.some((value) =>
          Object.keys(value).some((key) => key.startsWith("$")),
        )
      )
        this.fail();
    } else {
      const query = request.query || this.mutationSelector(request);
      if (
        Object.getPrototypeOf(query) !== Object.prototype ||
        this.privateField(query)
      )
        this.fail();
      rows = await this.records(
        schemaName === "Employee"
          ? "DefaultEmployeeService"
          : "DefaultCustomerService",
        request.tenant,
        query,
        101,
      );
      if (rows.length > 100) this.fail();
    }
    const refs = new Set();
    for (const row of rows) {
      if (row.contacts !== undefined) {
        if (
          !Array.isArray(row.contacts) ||
          row.contacts.length > 100 ||
          row.contacts.some((value) => typeof value !== "string")
        )
          this.fail();
        row.contacts.forEach((value) => refs.add(this.reference(value)));
      }
    }
    const add = (value, depth = 0) => {
      if (depth > 8 || ++entries > 1024) this.fail();
      if (typeof value === "string") refs.add(this.reference(value));
      else if (Array.isArray(value) && value.length <= 100)
        value.forEach((item) => add(item, depth + 1));
      else if (
        value &&
        Object.getPrototypeOf(value) === Object.prototype &&
        Object.keys(value).length === 1 &&
        ["$each", "$in"].includes(Object.keys(value)[0])
      )
        add(Object.values(value)[0], depth + 1);
      else this.fail();
    };
    const incoming = (model, operator = "", depth = 0) => {
      if (depth > 8 || ++entries > 1024) this.fail();
      for (const [key, value] of Object.entries(model)) {
        if (/^contacts(\.|$)/.test(key)) {
          if (["$unset", "$pop"].includes(operator)) continue;
          if (
            ![
              "",
              "$set",
              "$setOnInsert",
              "$push",
              "$addToSet",
              "$pull",
              "$pullAll",
            ].includes(operator)
          )
            this.fail();
          add(value);
        } else if (
          key.startsWith("$") &&
          value &&
          Object.getPrototypeOf(value) === Object.prototype
        ) {
          if (
            key === "$rename" &&
            Object.entries(value).some(
              ([from, to]) =>
                /^contacts(\.|$)/.test(from) ||
                (typeof to === "string" && /^contacts(\.|$)/.test(to)),
            )
          )
            this.fail();
          incoming(value, key, depth + 1);
        }
      }
    };
    models.forEach((value) => incoming(value));
    if (refs.size > 100) this.fail();
    if (refs.size) {
      const contacts = await this.records(
        "DefaultContactService",
        request.tenant,
        { code: { $in: [...refs] } },
        101,
      );
      if (contacts.some((value) => value[marker] !== undefined)) this.fail();
    }
    return true;
  },

  /** Fixed Employee hook wrapper cannot accidentally inspect Customer associations. @param {Object} request Exact generated Employee mutation. @param {string} [operation] Trusted hook operation. @returns {Promise<boolean>} Original Employee association guard. */
  guardEmployeeAssociationMutation: async function (
    request,
    operation = "REPLACE",
  ) {
    return this.guardCustomerAssociationMutation(
      request,
      operation,
      "Employee",
    );
  },

  /** Removes private markers recursively from public/recursive reads without accepting caller flags. @param {Object} request Exact generated read. @param {Object} response Existing pipeline or owner envelope. @returns {boolean} Redacted projection. */
  redactContactRead: function (request, response) {
    if (privateReads.has(request)) return true;
    const seen = new WeakSet(),
      budget = { entries: 0 };
    const redact = (value, depth = 0) => {
      if (depth > 16 || ++budget.entries > 4096) return "[REDACTED]";
      if (
        !value ||
        typeof value !== "object" ||
        value instanceof Date ||
        typeof value.toHexString === "function"
      )
        return value;
      if (seen.has(value)) return "[REDACTED]";
      seen.add(value);
      if (Array.isArray(value))
        return value.length > 4096 - budget.entries
          ? "[REDACTED]"
          : value.map((item) => redact(item, depth + 1));
      if (Object.keys(value).length > 4096 - budget.entries)
        return "[REDACTED]";
      return Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => !key.includes(marker))
          .map(([key, item]) => [key, redact(item, depth + 1)]),
      );
    };
    const projection = redact(response);
    if (!projection || typeof projection !== "object") this.fail();
    if (Array.isArray(response))
      response.splice(0, response.length, ...projection);
    else {
      for (const key of Object.keys(response)) delete response[key];
      Object.assign(response, projection);
    }
    return true;
  },
};
