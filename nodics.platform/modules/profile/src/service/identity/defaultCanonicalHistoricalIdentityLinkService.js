/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const writes = new WeakSet();
const contexts = new WeakSet();
const commands = new WeakSet();
const reads = new WeakSet();

/**
 * @module profile/service/identity/DefaultCanonicalHistoricalIdentityLinkService
 * @description Stages explicitly dual-proved historical accounts into inactive canonical projections using existing principal, Password and migration-audit owners.
 * @layer service
 * @owner profile
 * @override Later Profile layers may tighten admission and inventory bounds; preserve dual proof, private admission, irreversible credential retirement and inactive output.
 */
module.exports = {
  /** Resolves independently qualified linking policy; source availability never enables migration. @returns {Object} Effective policy. */
  policy: function () {
    const p = CONFIG.get("identityGovernance.migration.canonicalLinking") || {};
    SERVICE.DefaultEnterpriseMembershipService.policy();
    for (const key of [
      "enabled",
      "inventoryQualified",
      "auditCodeIndexQualified",
      "mutationGuardsQualified",
      "credentialRetirementQualified",
      "consumerReconciliationQualified",
    ])
      if (p[key] !== true) this.fail();
    if (
      !Number.isSafeInteger(p.proofMaximumAgeMs) ||
      p.proofMaximumAgeMs < 1000 ||
      p.proofMaximumAgeMs > 300000
    )
      this.fail();
    return p;
  },
  /** Rejects without credential, identity or persistence diagnostics. @returns {never} Always throws. */
  fail: function () {
    throw new CLASSES.NodicsError("ERR_PROFILE_MEMBERSHIP_UNAVAILABLE");
  },
  /** Returns the existing strict canonical membership owner. @returns {Object} Effective service. */
  member: function () {
    return SERVICE.DefaultEnterpriseMembershipService;
  },
  /** Uses the existing migration fingerprint, excluding credentials from all supplied values. @param {*} value Non-secret metadata. @returns {string} Stable fingerprint. */
  digest: function (value) {
    return SERVICE.DefaultIdentityGovernanceMigrationService.planFingerprint(
      value,
    );
  },
  /** Admits a fresh original human PASSWORD platform operator with explicit migration permission. @param {Object} request Authenticated owner request. @returns {Promise<Object>} Operator anchor. */
  operator: async function (request) {
    this.policy();
    const m = this.member(),
      auth = request.authData || {};
    if (
      auth.authenticationMethod !== "PASSWORD" ||
      auth.principalType !== "human" ||
      auth.sessionContext ||
      auth.entCode !== CONFIG.get("defaultEnterprise") ||
      auth.tenant !== m.authority()
    )
      this.fail();
    const actor = await m.actor(request);
    await m.credential(actor);
    if (
      !SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(auth)
    )
      this.fail();
    m.permission(request, "identity.migration.apply");
    return actor;
  },
  /** Authenticates each selected original account at its own Password/UserState owners, not through email or OTP. @param {Object} identity Exact locator. @param {string} supplied Current password used only in memory. @returns {Promise<Object>} Fresh anchor and credential reference. */
  prove: async function (identity, supplied) {
    const m = this.member();
    if (
      !identity ||
      Array.isArray(identity) ||
      Object.keys(identity).sort().join(",") !==
        "recordId,recordKind,tenantCode"
    )
      this.fail();
    if (typeof supplied !== "string" || !supplied || supplied.length > 1024)
      this.fail();
    const anchor = await m.anchor(m.identity(identity)),
      original = await m.credential(anchor),
      credential = await this.readPasswordForRetirement(
        anchor.identity.tenantCode,
        m.recordId(original._id),
      );
    if (
      !credential ||
      credential.active !== true ||
      credential.loginId !== anchor.person.loginId ||
      typeof credential.password !== "string"
    )
      this.fail();
    if (!(await UTILS.compareHash(supplied, credential.password))) {
      await SERVICE.DefaultAuthenticationProviderService.updateFailedAuthData({
        state: anchor.state,
        tenant: anchor.identity.tenantCode,
      });
      this.fail();
    }
    return {
      ...anchor,
      credentialId: m.recordId(credential._id),
      credentialCode: credential.code,
      credentialRevision: credential.revision,
    };
  },
  /** Captures bounded complete inventory through the existing assessment owner, never a new scanner. @param {Object} request Admitted operator request. @returns {Promise<Object>} Matching observed state, not an atomic snapshot. */
  inventory: async function (request) {
    const owner = SERVICE.DefaultIdentityGovernanceMigrationService;
    const context = owner.assessmentContext({
      ...request,
      body: {},
      query: {},
      identityMigration: {},
      httpRequest: { body: {}, query: {} },
    });
    const first = await owner.assessmentState(context),
      second = await owner.assessmentState(context);
    if (this.digest(first) !== this.digest(second)) this.fail();
    return first;
  },
  /** Builds redacted immutable principal preconditions; credential bodies and lockout history are never persisted in audits. @param {Object} anchor Proved original principal. @returns {Object} Exact metadata. */
  facts: function (anchor) {
    const p = anchor.person;
    if (
      typeof p.loginId !== "string" ||
      !p.loginId ||
      p.loginId.length > 320 ||
      typeof p.code !== "string" ||
      !p.code ||
      p.code.length > 128 ||
      !Number.isSafeInteger(p.authVersion || 1) ||
      (p.authVersion || 1) < 1 ||
      !Array.isArray(p.userGroups || []) ||
      (p.userGroups || []).length > 100 ||
      (p.userGroups || []).some(
        (group) =>
          typeof group !== "string" || !/^[A-Za-z0-9._:-]{1,128}$/.test(group),
      ) ||
      typeof anchor.credentialCode !== "string" ||
      !anchor.credentialCode ||
      anchor.credentialCode.length > 128 ||
      !Number.isSafeInteger(anchor.credentialRevision) ||
      anchor.credentialRevision < 1 ||
      !Number.isSafeInteger(anchor.credentialRevision + 1)
    )
      this.fail();
    return {
      identity: anchor.identity,
      credentialId: anchor.credentialId,
      credentialCode: anchor.credentialCode,
      credentialRevision: anchor.credentialRevision,
      loginId: p.loginId,
      code: p.code,
      principalType: p.principalType,
      authVersion: p.authVersion || 1,
      active: p.active,
      disabled: p.disabled === true,
      groups: p.userGroups || [],
    };
  },
  /** Requires complete absence of historical API-key artifacts; this owner does not prove or retire service/API credentials. @param {Object} person Fresh historical principal. @returns {void} Supported password-only record or redacted refusal. */
  assertHistoricalCredentialArtifacts: function (person) {
    if (!person || Object.keys(person).some((key) => /^apiKey/i.test(key)))
      this.fail();
  },
  /** Fences known Profile API-key fields against concurrent introduction during original-principal retirement. @returns {Object} Owner-built absence conditions. */
  historicalCredentialExclusions: function () {
    return Object.fromEntries(
      [
        "apiKey",
        "apiKeyHash",
        "apiKeyPrefix",
        "apiKeyStatus",
        "apiKeyCreatedAt",
        "apiKeyExpiresAt",
        "apiKeyScopes",
      ].map((key) => [key, { $exists: false }]),
    );
  },
  /** Removes proof passwords from retained request/body aliases before any asynchronous owner work; JavaScript strings cannot be securely zeroized. @param {Object} request Owning request. @returns {void} Known plaintext DTO fields detached from request containers. */
  scrubRequestProof: function (request) {
    const ownValue = (object, key) => {
      try {
        return Object.getOwnPropertyDescriptor(object || {}, key)?.value;
      } catch {
        return undefined;
      }
    };
    const http = ownValue(request, "httpRequest");
    for (const [parent, key] of [
      [request, "body"],
      [request, "model"],
      [request, "query"],
      [http, "body"],
      [http, "query"],
    ]) {
      const value = ownValue(parent, key);
      if (!value || typeof value !== "object") continue;
      const secrets = [
        "canonicalPassword",
        "historicalPassword",
        "password",
        "confirmPassword",
      ];
      try {
        const descriptors = Object.getOwnPropertyDescriptors(value);
        for (const secret of secrets) {
          delete descriptors[secret];
          if (
            Object.getOwnPropertyDescriptor(value, secret)?.configurable ===
            true
          )
            delete value[secret];
        }
        const clean = Object.defineProperties(
          Array.isArray(value) ? [] : {},
          descriptors,
        );
        const slot = Object.getOwnPropertyDescriptor(parent, key);
        if (slot?.writable === true) parent[key] = clean;
        else if (slot?.configurable === true)
          Object.defineProperty(parent, key, { ...slot, value: clean });
      } catch {
        /* Malformed/frozen aliases cannot upgrade a rejected entry. */
      }
    }
  },
  /** Requires exact private Logger entry before copying proofs; rejected calls scrub known data aliases without evaluating accessors. @param {Object} request Exact protected request. @returns {void} Private capture authority or redacted refusal. */
  assertPrivateEntry: function (request) {
    try {
      const logger = SERVICE.DefaultLoggerService;
      if (typeof logger?.assertSensitiveRequest !== "function") this.fail();
      logger.assertSensitiveRequest(request);
    } catch {
      this.scrubRequestProof(request);
      this.fail();
    }
  },
  /** Copies fixed command proof into temporary local memory and scrubs the request even on malformed selectors. @param {Object} request Owner request. @param {string[]} allowed Fixed entry DTO. @returns {Object} Detached validated local input. */
  takeInput: function (request, allowed) {
    const body = request.body || {},
      queries = [request.query || {}, request.httpRequest?.query || {}];
    const input = { ...body },
      selectors = queries.map((query) => ({ ...query }));
    this.scrubRequestProof(request);
    try {
      if (
        typeof body !== "object" ||
        Array.isArray(body) ||
        queries.some(
          (query) => typeof query !== "object" || Array.isArray(query),
        )
      )
        this.fail();
      this.member().base().input(input, allowed);
      for (const query of selectors) this.member().base().input(query, []);
      return input;
    } catch {
      this.clearInputProof(input);
      this.fail();
    }
  },
  /** Drops known local proof references after completion/refusal without claiming secure memory erasure. @param {Object} input Temporary command input. @returns {void} References removed. */
  clearInputProof: function (input) {
    for (const key of [
      "canonicalPassword",
      "historicalPassword",
      "password",
      "confirmPassword",
    ])
      delete input[key];
  },
  /** Rejects shared credentials, target dependants and in-progress/accepted assignments instead of silently migrating their authority. @param {Object} state Complete observed inventory. @param {Object} canonical Canonical facts. @param {Object} historical Historical facts. @returns {void} Safe narrow inventory or rejection. */
  validateInventory: function (state, canonical, historical) {
    const m = this.member();
    for (const facts of [canonical, historical]) {
      const partition = state.partitions.find(
        (p) => p.tenant === facts.identity.tenantCode,
      );
      const users = (partition?.employees || []).concat(
        partition?.customers || [],
      );
      const references = users.filter(
        (p) => String(p.password) === facts.credentialId,
      );
      if (
        references.length !== 1 ||
        String(references[0]._id) !== facts.identity.recordId
      )
        this.fail();
    }
    for (const partition of state.partitions)
      for (const [kind, rows] of [
        ["EMPLOYEE", partition.employees],
        ["CUSTOMER", partition.customers],
      ])
        for (const row of rows || []) {
          if (
            row.authenticationIdentity &&
            this.digest(m.identity(row.authenticationIdentity)) ===
              this.digest(historical.identity)
          )
            this.fail();
          if (
            partition.tenant === historical.identity.tenantCode &&
            kind === historical.identity.recordKind &&
            String(row._id) === historical.identity.recordId &&
            (row.registrationAssignmentCode || row.authenticationIdentity)
          )
            this.fail();
        }
    if (
      (state.assignments || []).some(
        (a) =>
          (a.membership?.identity &&
            this.digest(m.identity(a.membership.identity)) ===
              this.digest(historical.identity)) ||
          (a.tenantCode === historical.identity.tenantCode &&
            a.registration?.employeeCode === historical.code),
      )
    )
      this.fail();
  },
  /** Refuses reinterpretation of a historical Customer's retained eligibility evidence through the private owning reader. @param {Object} identity Proved original locator. @returns {Promise<void>} No retained decision or refusal. */
  assertEligibilityDependency: async function (identity) {
    if (identity.recordKind !== "CUSTOMER") return;
    const owner = SERVICE.DefaultCustomerEligibilityDecisionGovernanceService;
    if (
      typeof owner?.hasRetainedDecision !== "function" ||
      (await owner.hasRetainedDecision(identity)) !== false
    )
      this.fail();
  },
  /** Issues owner-private generated writes; callers cannot forge admission using body flags. @param {string} name Generated owner. @param {string} operation Fixed mutation. @param {Object} request Exact owner-built request. @returns {Promise<Object>} Owner acknowledgement. */
  write: async function (name, operation, request) {
    if (!["save", "update", "remove"].includes(operation)) this.fail();
    writes.add(request);
    try {
      return await SERVICE[name][operation](request);
    } finally {
      writes.delete(request);
    }
  },
  /** Recognizes only the exact transient owner request. @param {Object} request Generated mutation. @returns {boolean} Private admission. */
  ownsWrite: function (request) {
    return writes.has(request);
  },
  /** Recognizes only a currently executing exact private generated-read request, never a body/header flag or copied object. @param {Object} request Generated get request. @returns {boolean} Transient read admission. */
  ownsRead: function (request) {
    return reads.has(request);
  },
  /** Reads through an existing generated owner under exact transient admission; cache bypass is mandatory and admission ends on settlement. @param {string} name Fixed generated owner. @param {Object} request Owner-built exact or bounded page request. @returns {Promise<Object>} Original generated envelope. */
  generatedRead: async function (name, request) {
    if (
      reads.has(request) ||
      ![
        "DefaultEmployeeService",
        "DefaultCustomerService",
        "DefaultPasswordService",
        "DefaultIdentityMigrationAuditService",
      ].includes(name) ||
      typeof SERVICE[name]?.get !== "function" ||
      request.options?.recursive !== false ||
      request.options?.skipItemCache !== true
    )
      this.fail();
    reads.add(request);
    try {
      return await SERVICE[name].get(request);
    } finally {
      reads.delete(request);
    }
  },
  /** Resolves one original linking record through its generated owner without exposing private read flags or using an alternate persistence path. @param {string} name Fixed generated owner. @param {string} tenant Owner partition. @param {Object} query Owner-built lookup. @returns {Promise<Object|null>} Exact original record including retirement evidence. */
  readRecord: async function (name, tenant, query) {
    const response = await this.generatedRead(
      name,
      this.storage(tenant, {
        query,
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 },
      }),
    );
    const rows = this.member().rows(response);
    if (
      rows.length > 1 ||
      (response.count !== undefined && response.count !== rows.length)
    )
      this.fail();
    return rows[0] || null;
  },
  /** Reads the original Password and qualifies the actual prepared generated revision primitive before disabling any principal. @param {string} tenant Original partition. @param {string} id Immutable credential reference. @returns {Promise<Object>} Fresh qualified original credential, never public evidence. */
  readPasswordForRetirement: async function (tenant, id) {
    const request = this.storage(tenant, {
      query: { _id: id },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    const response = await this.generatedRead(
      "DefaultPasswordService",
      request,
    );
    const primitive = SERVICE.DefaultModelConcurrencyService;
    if (
      !primitive?.assertCredentialRetirementModel ||
      !primitive.retireCredential
    )
      this.fail();
    const policy = primitive.assertCredentialRetirementModel(
      request.schemaModel,
    );
    if (
      policy.ownerService !== "DefaultCanonicalHistoricalIdentityLinkService" ||
      policy.revisionField !== "revision"
    )
      this.fail();
    const rows = this.member().rows(response),
      row = rows[0];
    if (
      rows.length !== 1 ||
      (response.count !== undefined && response.count !== 1) ||
      this.member().recordId(row?._id) !== id ||
      typeof row?.code !== "string" ||
      !row.code ||
      row.code.length > 128 ||
      !Number.isSafeInteger(row.revision) ||
      row.revision < 1 ||
      !Number.isSafeInteger(row.revision + 1)
    )
      this.fail();
    return row;
  },
  /** Builds system-authorized persistence context inside Profile, never from caller identity selectors. @param {string} tenant Owner partition. @param {Object} fields Owner-built operation. @returns {Object} Generated request. */
  storage: function (tenant, fields) {
    return {
      tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      ...fields,
    };
  },
  /** Reads one exact audit through the existing bounded generated reader. @param {string} code Deterministic historical-account audit code. @returns {Promise<Object|null>} Private audit. */
  audit: async function (code) {
    const response = await this.generatedRead(
      "DefaultIdentityMigrationAuditService",
      this.storage(this.member().authority(), {
        query: { code },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 },
      }),
    );
    const rows = this.member().rows(response);
    if (
      rows.length > 1 ||
      (response.count !== undefined && response.count !== rows.length)
    )
      this.fail();
    return rows[0] || null;
  },
  /** Prepares a reviewed link after fresh explicit proof of both selected original accounts. No principal or credential is mutated. @param {Object} request Fixed owner command. @returns {Promise<Object>} Redacted review handle. */
  prepare: async function (request) {
    this.assertPrivateEntry(request);
    const input = this.takeInput(request, [
      "canonicalIdentity",
      "historicalIdentity",
      "canonicalPassword",
      "historicalPassword",
      "confirmed",
    ]);
    const command = { request, input };
    commands.add(command);
    try {
      return await this.prepareCommand(command);
    } catch {
      this.fail();
    } finally {
      commands.delete(command);
      this.clearInputProof(input);
    }
  },
  /** Prepares only an entry-admitted command whose plaintext has been detached from all known request aliases. @param {Object} command Transient private command. @returns {Promise<Object>} Redacted retained review handle. */
  prepareCommand: async function (command) {
    if (!commands.has(command)) this.fail();
    const { request, input } = command;
    const actor = await this.operator(request),
      m = this.member();
    if (input.confirmed !== true) this.fail();
    const canonical = await this.prove(
        input.canonicalIdentity,
        input.canonicalPassword,
      ),
      historical = await this.prove(
        input.historicalIdentity,
        input.historicalPassword,
      );
    this.assertHistoricalCredentialArtifacts(historical.person);
    if (this.digest(canonical.identity) === this.digest(historical.identity))
      this.fail();
    const state = await this.inventory(request),
      a = this.facts(canonical),
      b = this.facts(historical);
    this.validateInventory(state, a, b);
    await this.assertEligibilityDependency(b.identity);
    // Employee retirement must be admitted by the existing last-administrator owner.
    if (b.identity.recordKind === "EMPLOYEE") {
      const owner = SERVICE.DefaultEnterpriseTeamAdministrationService;
      if (typeof owner?.assertHistoricalLinkRetirement !== "function")
        this.fail();
      await owner.assertHistoricalLinkRetirement(request, historical);
    }
    const plan = {
      contractVersion: 1,
      canonical: a,
      historical: b,
      inventoryFingerprint: this.digest(state),
      preparedBy: actor.identity,
      preparedAt: new Date().toISOString(),
    };
    const fingerprint = this.digest(plan),
      code = "canonical-link-" + this.digest(b.identity).slice(0, 40);
    if (await this.audit(code)) this.fail();
    let failure;
    try {
      await this.write(
        "DefaultIdentityMigrationAuditService",
        "save",
        this.storage(m.authority(), {
          query: {
            code,
            "snapshot.canonicalHistoricalLink": { $exists: false },
          },
          model: {
            code,
            active: true,
            tenant: m.authority(),
            migrationVersion: 1,
            status: "LINK_PREPARED",
            requestedBy: request.authData.loginId,
            snapshot: { canonicalHistoricalLink: plan },
            preview: { fingerprint },
            result: { phase: "PREPARED" },
          },
        }),
      );
    } catch (error) {
      failure = error;
    }
    const saved = await this.audit(code);
    if (
      !saved ||
      saved.status !== "LINK_PREPARED" ||
      saved.active !== true ||
      saved.tenant !== m.authority() ||
      saved.preview?.fingerprint !== fingerprint ||
      this.digest(saved.snapshot?.canonicalHistoricalLink) !== fingerprint
    ) {
      if (failure) throw failure;
      this.fail();
    }
    return {
      auditCode: code,
      fingerprint,
      phase: "PREPARED",
      targetWillRemainInactive: true,
      atomicSnapshot: false,
    };
  },
  /** Advances an audit with exact phase/fingerprint fences and private readback after lost acknowledgement. @param {Object} audit Retained audit. @param {string} from Current phase. @param {string} to Next phase. @returns {Promise<Object>} Confirmed audit. */
  advance: async function (audit, from, to) {
    let failure;
    try {
      const ack = await this.write(
        "DefaultIdentityMigrationAuditService",
        "update",
        this.storage(this.member().authority(), {
          query: {
            code: audit.code,
            status: from,
            "preview.fingerprint": audit.preview.fingerprint,
          },
          model: { $set: { status: to, result: { phase: to } } },
        }),
      );
      if (ack?.result?.acknowledged !== true || ack.result.matchedCount !== 1)
        this.fail();
    } catch (error) {
      failure = error;
    }
    const stored = await this.audit(audit.code);
    if (
      !stored ||
      stored.status !== to ||
      stored.preview?.fingerprint !== audit.preview.fingerprint ||
      this.digest(stored.snapshot?.canonicalHistoricalLink) !==
        this.digest(audit.snapshot.canonicalHistoricalLink)
    ) {
      if (failure) throw failure;
      this.fail();
    }
    return stored;
  },
  /** Commits a reviewed narrow link, or explicitly resumes its retained exact fence. Retired credentials are never restored and no access/consent is granted. @param {Object} request Reviewed command with in-memory passwords. @returns {Promise<Object>} Redacted stage, never credentials or locators. */
  commit: async function (request) {
    this.assertPrivateEntry(request);
    const input = this.takeInput(request, [
      "auditCode",
      "fingerprint",
      "confirmed",
      "canonicalPassword",
      "historicalPassword",
      "resume",
    ]);
    const command = { request, input };
    commands.add(command);
    try {
      return await this.commitCommand(command);
    } catch {
      this.fail();
    } finally {
      commands.delete(command);
      this.clearInputProof(input);
    }
  },
  /** Executes only an entry-admitted reviewed command; raw provider exceptions never leave the public service entry. @param {Object} command Transient private command. @returns {Promise<Object>} Redacted inactive outcome. */
  commitCommand: async function (command) {
    if (!commands.has(command)) this.fail();
    const { request, input } = command;
    await this.operator(request);
    const m = this.member(),
      p = this.policy();
    if (
      input.confirmed !== true ||
      !/^canonical-link-[a-f0-9]{40}$/.test(input.auditCode || "") ||
      !/^[a-f0-9]{64}$/.test(input.fingerprint || "")
    )
      this.fail();
    let audit = await this.audit(input.auditCode);
    const plan = audit?.snapshot?.canonicalHistoricalLink;
    if (
      !plan ||
      audit.preview?.fingerprint !== input.fingerprint ||
      this.digest(plan) !== input.fingerprint
    )
      this.fail();
    const canonical = await this.prove(
      plan.canonical.identity,
      input.canonicalPassword,
    );
    if (this.digest(this.facts(canonical)) !== this.digest(plan.canonical))
      this.fail();
    if (audit.status === "LINK_PREPARED") {
      if (
        input.resume === true ||
        Date.now() - Date.parse(plan.preparedAt) < 0 ||
        Date.now() - Date.parse(plan.preparedAt) > p.proofMaximumAgeMs
      )
        this.fail();
      const historical = await this.prove(
        plan.historical.identity,
        input.historicalPassword,
      );
      this.assertHistoricalCredentialArtifacts(historical.person);
      if (this.digest(this.facts(historical)) !== this.digest(plan.historical))
        this.fail();
      const state = await this.inventory(request);
      if (this.digest(state) !== plan.inventoryFingerprint) this.fail();
      this.validateInventory(state, plan.canonical, plan.historical);
      await this.assertEligibilityDependency(plan.historical.identity);
      if (plan.historical.identity.recordKind === "EMPLOYEE") {
        const owner = SERVICE.DefaultEnterpriseTeamAdministrationService;
        if (typeof owner?.assertHistoricalLinkRetirement !== "function")
          this.fail();
        await owner.assertHistoricalLinkRetirement(request, historical);
      }
      audit = await this.advance(audit, "LINK_PREPARED", "LINK_APPLYING");
    } else if (
      input.resume !== true ||
      p.recoveryQualified !== true ||
      ![
        "LINK_APPLYING",
        "LINK_DISABLED",
        "LINK_CREDENTIAL_RETIRED",
        "LINK_COMPLETE",
      ].includes(audit.status)
    )
      this.fail();
    const context = { audit, plan, input };
    contexts.add(context);
    try {
      if (plan.historical.identity.recordKind === "EMPLOYEE") {
        const owner = SERVICE.DefaultEnterpriseTeamAdministrationService;
        if (typeof owner?.withHistoricalLinkRetirement !== "function")
          this.fail();
        return await owner.withHistoricalLinkRetirement(
          request,
          plan.historical.identity,
          () => this.applyReviewedLink(context),
        );
      }
      return await this.applyReviewedLink(context);
    } finally {
      contexts.delete(context);
    }
  },
  /** Applies only a transient privately admitted plan while the Employee owner holds any required administrator-retirement fence. @param {Object} context Owner-private reviewed command. @returns {Promise<Object>} Inactive binding outcome. */
  applyReviewedLink: async function (context) {
    if (!contexts.has(context)) this.fail();
    let { audit } = context;
    const { plan, input } = context;
    const m = this.member();
    const h = plan.historical,
      tenant = h.identity.tenantCode,
      name = m.principalService(h.identity.recordKind);
    const marker = { auditCode: audit.code, fingerprint: input.fingerprint };
    this.assertHistoricalCredentialArtifacts(
      await this.readRecord(name, tenant, { _id: h.identity.recordId }),
    );
    const preflightCredential = await this.readPasswordForRetirement(
      tenant,
      h.credentialId,
    );
    if (
      preflightCredential.code !== h.credentialCode ||
      preflightCredential.loginId !== h.loginId ||
      !Number.isSafeInteger(h.credentialRevision) ||
      h.credentialRevision < 1 ||
      ![h.credentialRevision, h.credentialRevision + 1].includes(
        preflightCredential.revision,
      )
    )
      this.fail();
    const originalPreflight =
      preflightCredential.active === true &&
      preflightCredential.revision === h.credentialRevision &&
      !preflightCredential.identityLinkRetirement;
    const retiredPreflight =
      preflightCredential.active === false &&
      preflightCredential.revision === h.credentialRevision + 1 &&
      this.digest(preflightCredential.identityLinkRetirement) ===
        this.digest(marker);
    if (
      (!originalPreflight && !retiredPreflight) ||
      (audit.status === "LINK_APPLYING" && !originalPreflight)
    )
      this.fail();
    if (audit.status === "LINK_APPLYING") {
      await this.confirmWrite(
        name,
        tenant,
        {
          _id: h.identity.recordId,
          loginId: h.loginId,
          password: h.credentialId,
          active: true,
          authVersion: h.authVersion,
          authenticationIdentity: { $exists: false },
          identityLinkRetirement: { $exists: false },
          ...this.historicalCredentialExclusions(),
        },
        {
          $set: {
            active: false,
            disabled: true,
            identityLinkRetirement: marker,
          },
        },
        { _id: h.identity.recordId },
        (row) =>
          row.active === false &&
          row.disabled === true &&
          this.digest(row.identityLinkRetirement) === this.digest(marker) &&
          !row.authenticationIdentity &&
          String(row.password) === h.credentialId,
      );
      const disabled = await this.readRecord(name, tenant, {
        _id: h.identity.recordId,
      });
      this.assertHistoricalCredentialArtifacts(disabled);
      await this.confirmRetirementStamp(
        disabled,
        tenant,
        h.identity.recordKind,
        h.authVersion,
      );
      audit = await this.advance(audit, "LINK_APPLYING", "LINK_DISABLED");
    }
    const retired = await this.readRecord(name, tenant, {
      _id: h.identity.recordId,
    });
    this.assertHistoricalCredentialArtifacts(retired);
    if (
      !retired ||
      retired.active !== false ||
      retired.disabled !== true ||
      this.digest(retired.identityLinkRetirement) !== this.digest(marker)
    )
      this.fail();
    if (audit.status === "LINK_DISABLED") {
      const originalCredential = await this.readPasswordForRetirement(
        tenant,
        h.credentialId,
      );
      if (
        !originalCredential ||
        originalCredential.loginId !== h.loginId ||
        originalCredential.code !== h.credentialCode ||
        typeof originalCredential.password !== "string"
      )
        this.fail();
      const alreadyRetired =
        originalCredential.active === false &&
        originalCredential.revision === h.credentialRevision + 1 &&
        this.digest(originalCredential.identityLinkRetirement) ===
          this.digest(marker);
      if (
        !alreadyRetired &&
        (originalCredential.active !== true ||
          originalCredential.revision !== h.credentialRevision ||
          typeof input.historicalPassword !== "string" ||
          !input.historicalPassword ||
          input.historicalPassword.length > 1024 ||
          !(await UTILS.compareHash(
            input.historicalPassword,
            originalCredential.password,
          )))
      )
        this.fail();
      if (!alreadyRetired) await this.retirePassword(context, marker);
      audit = await this.advance(
        audit,
        "LINK_DISABLED",
        "LINK_CREDENTIAL_RETIRED",
      );
    }
    const credential = await this.readPasswordForRetirement(
      tenant,
      h.credentialId,
    );
    if (
      !credential ||
      credential.active !== false ||
      credential.loginId !== h.loginId ||
      credential.code !== h.credentialCode ||
      credential.revision !== h.credentialRevision + 1 ||
      this.digest(credential.identityLinkRetirement) !== this.digest(marker)
    )
      this.fail();
    if (audit.status === "LINK_CREDENTIAL_RETIRED") {
      await this.confirmWrite(
        name,
        tenant,
        {
          _id: h.identity.recordId,
          active: false,
          disabled: true,
          identityLinkRetirement: marker,
          password: h.credentialId,
          authenticationIdentity: { $exists: false },
          ...this.historicalCredentialExclusions(),
        },
        {
          $set: { authenticationIdentity: plan.canonical.identity },
          $unset: { password: 1 },
        },
        { _id: h.identity.recordId },
        (row) =>
          !row.password &&
          row.active === false &&
          row.disabled === true &&
          this.digest(row.authenticationIdentity) ===
            this.digest(plan.canonical.identity) &&
          this.digest(row.identityLinkRetirement) === this.digest(marker),
      );
      audit = await this.advance(
        audit,
        "LINK_CREDENTIAL_RETIRED",
        "LINK_COMPLETE",
      );
    }
    const final = await this.readRecord(name, tenant, {
      _id: h.identity.recordId,
    });
    this.assertHistoricalCredentialArtifacts(final);
    if (
      audit.status !== "LINK_COMPLETE" ||
      final?.password ||
      final?.active !== false ||
      final?.disabled !== true ||
      this.digest(final?.authenticationIdentity) !==
        this.digest(plan.canonical.identity)
    )
      this.fail();
    await this.confirmRetirementStamp(
      final,
      tenant,
      h.identity.recordKind,
      h.authVersion,
    );
    if (
      this.digest(
        this.facts(
          await this.prove(plan.canonical.identity, input.canonicalPassword),
        ),
      ) !== this.digest(plan.canonical)
    )
      this.fail();
    return {
      auditCode: audit.code,
      fingerprint: input.fingerprint,
      phase: "LINK_COMPLETE",
      targetInactive: true,
      accessGranted: false,
      customerConsentGranted: false,
      credentialRestorationAllowed: false,
    };
  },
  /** Executes the actual generated revision-fenced Password primitive with no plaintext/hash in its query, patch or provider return projection. @param {Object} context Exact privately admitted reviewed link. @param {Object} marker Original audit marker. @returns {Promise<void>} Exact owner readback; uncertainty never advances another operation. */
  retirePassword: async function (context, marker) {
    if (!contexts.has(context)) this.fail();
    const h = context.plan.historical,
      tenant = h.identity.tenantCode;
    const request = this.storage(tenant, {
      query: {
        _id: h.credentialId,
        code: h.credentialCode,
        loginId: h.loginId,
        revision: h.credentialRevision,
        active: true,
        identityLinkRetirement: { $exists: false },
      },
      model: { active: false, identityLinkRetirement: marker },
      options: { recursive: false, skipItemCache: true },
    });
    const primitive = SERVICE.DefaultModelConcurrencyService;
    if (!primitive?.retireCredential) this.fail();
    const receipt = await primitive.retireCredential(request, () =>
      this.write("DefaultPasswordService", "update", request),
    );
    if (receipt?.attempted !== true) this.fail();
    const row = await this.readPasswordForRetirement(tenant, h.credentialId);
    if (
      row.active !== false ||
      row.code !== h.credentialCode ||
      row.loginId !== h.loginId ||
      row.revision !== h.credentialRevision + 1 ||
      this.digest(row.identityLinkRetirement) !== this.digest(marker)
    )
      this.fail();
  },
  /** Reconciles only this exact private mutation after owner acknowledgement uncertainty; no arbitrary target replay. @param {string} name Generated service. @param {string} tenant Partition. @param {Object} query Exact preimage. @param {Object} model Owner mutation. @param {Object} lookup Exact readback. @param {Function} matches Private post-state verifier. @returns {Promise<void>} Confirmed state. */
  confirmWrite: async function (name, tenant, query, model, lookup, matches) {
    let failure;
    try {
      const ack = await this.write(
        name,
        "update",
        this.storage(tenant, { query, model }),
      );
      if (ack?.result?.acknowledged !== true || ack.result.matchedCount !== 1)
        this.fail();
    } catch (error) {
      failure = error;
    }
    const row = await this.readRecord(name, tenant, lookup);
    if (name === "DefaultEmployeeService" || name === "DefaultCustomerService")
      this.assertHistoricalCredentialArtifacts(row);
    if (!row || !matches(row)) {
      if (failure) throw failure;
      this.fail();
    }
    if (name === "DefaultEmployeeService" || name === "DefaultCustomerService")
      await this.confirmRetirementStamp(
        row,
        tenant,
        name === "DefaultEmployeeService" ? "EMPLOYEE" : "CUSTOMER",
        0,
      );
  },
  /** Confirms both existing login and typed identity stamps after a possibly interrupted post-write hook. @param {Object} person Retired record. @param {string} tenant Original partition. @param {string} kind Original kind. @param {number} previous Minimum retired version. @returns {Promise<void>} Stamps confirmed or rejection. */
  confirmRetirementStamp: async function (person, tenant, kind, previous) {
    if (
      !Number.isSafeInteger(person.authVersion) ||
      person.authVersion <= previous ||
      !person.loginId
    )
      this.fail();
    const owner = SERVICE.DefaultPrincipalSecurityStampService;
    await owner.register(tenant, person.loginId, person.authVersion);
    await owner.register(
      tenant,
      "identity:" + kind + ":" + this.member().recordId(person._id),
      person.authVersion,
    );
  },
  /** Inspects only retained private linking progress under current operator authority; inspection never resumes or unlocks it. @param {Object} request Reviewed handle. @returns {Promise<Object>} Redacted recovery state. */
  inspect: async function (request) {
    this.assertPrivateEntry(request);
    const input = this.takeInput(request, ["auditCode", "fingerprint"]);
    const command = { request, input };
    commands.add(command);
    try {
      return await this.inspectCommand(command);
    } catch {
      this.fail();
    } finally {
      commands.delete(command);
      this.clearInputProof(input);
    }
  },
  /** Projects only entry-admitted private audit progress, normalizing provider errors at the inspection entry. @param {Object} command Transient private inspection. @returns {Promise<Object>} Redacted recovery state. */
  inspectCommand: async function (command) {
    if (!commands.has(command)) this.fail();
    const { request, input } = command;
    await this.operator(request);
    if (
      !/^canonical-link-[a-f0-9]{40}$/.test(input.auditCode || "") ||
      !/^[a-f0-9]{64}$/.test(input.fingerprint || "")
    )
      this.fail();
    const audit = await this.audit(input.auditCode);
    if (
      !audit?.snapshot?.canonicalHistoricalLink ||
      this.digest(audit.snapshot.canonicalHistoricalLink) !==
        input.fingerprint ||
      audit.preview?.fingerprint !== input.fingerprint
    )
      this.fail();
    return {
      auditCode: audit.code,
      fingerprint: input.fingerprint,
      phase: audit.status,
      mutationPerformed: false,
      targetActivationAllowed: false,
      credentialRestorationAllowed: false,
    };
  },
  /** Detects reserved evidence in structured models, including nested objects and rename destinations. @param {*} value Mutation value. @param {number} [depth] Internal bounded traversal. @returns {boolean} Reserved evidence present. */
  containsEvidence: function (value, depth = 0) {
    if (depth > 32) this.fail();
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(
      ([key, child]) =>
        /(^|\.)(identityLinkRetirement|canonicalHistoricalLink)(\.|$)/.test(
          key,
        ) ||
        (key === "$rename" &&
          Object.values(child || {}).some(
            (path) =>
              typeof path === "string" &&
              /(^|\.)(identityLinkRetirement|canonicalHistoricalLink)(\.|$)/.test(
                path,
              ),
          )) ||
        this.containsEvidence(child, depth + 1),
    );
  },
  /** Rejects generic audit/principal changes that manufacture or alter linking evidence; main owner wires this before all generated mutations. @param {Object} request Generated request. @returns {Promise<boolean>} Admission or denial. */
  protectMutation: async function (request) {
    if (this.ownsWrite(request)) return true;
    const name = request.schemaModel?.schemaName;
    const service =
      name === "identityMigrationAudit"
        ? "DefaultIdentityMigrationAuditService"
        : name === "employee"
          ? "DefaultEmployeeService"
          : name === "customer"
            ? "DefaultCustomerService"
            : name === "password"
              ? "DefaultPasswordService"
              : undefined;
    if (!service) this.fail();
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    if (models.length > 100 || this.containsEvidence(models)) this.fail();
    const query = this.member().mutationLookup(request, models);
    if (query) {
      const rows =
        await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
          { get: (page) => this.generatedRead(service, page) },
          request.tenant,
          query,
        );
      if (
        rows.some(
          (row) =>
            row.identityLinkRetirement || row.snapshot?.canonicalHistoricalLink,
        )
      )
        this.fail();
    }
    if (request.query)
      request.query = {
        $and: [
          request.query,
          name === "identityMigrationAudit"
            ? { "snapshot.canonicalHistoricalLink": { $exists: false } }
            : { identityLinkRetirement: { $exists: false } },
        ],
      };
    else if (
      (CONFIG.get("identityGovernance.migration.canonicalLinking") || {})
        .enabled === true
    )
      this.fail(); // Save/upsert is paused during the approved linking window; no atomic replacement fence is implied.
    return true;
  },
  /** Excludes private link audits from ordinary generated reads; owner inspection uses exact transient request admission and redacted projection. @param {Object} request Generated audit read. @returns {boolean} Safe selection. */
  protectRead: function (request) {
    if (this.ownsRead(request)) return true;
    request.query = {
      $and: [
        request.query || {},
        { "snapshot.canonicalHistoricalLink": { $exists: false } },
      ],
    };
    return true;
  },
  /** Removes retirement evidence from public generated postGet envelopes without mutating cached/private documents; exact active private reads retain it. @param {Object} request Exact generated get request. @param {Object} response Pipeline wrapper with success envelope. @returns {boolean} Completed response projection. */
  redactRetirement: function (request, response) {
    if (this.ownsRead(request)) return true;
    if (!response || !response.success || typeof response.success !== "object")
      this.fail();
    response.success = this.redactRetirementValue(response.success);
    return true;
  },
  /** Creates a cycle-aware public copy with retirement markers removed at every structured level, preserving ordinary BSON/date/binary scalar values. @param {*} value Generated result value. @param {WeakMap} [seen] Internal copy map. @param {number} [depth] Internal recursion bound. @returns {*} Detached public value. */
  redactRetirementValue: function (value, seen = new WeakMap(), depth = 0) {
    if (!value || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);
    if (depth > 64) this.fail();
    if (
      value instanceof Date ||
      Buffer.isBuffer(value) ||
      (typeof value._bsontype === "string" &&
        typeof value.toExtendedJSON === "function")
    ) {
      this.assertRetirementScalar(value);
      return value;
    }
    const output = Array.isArray(value) ? [] : {};
    seen.set(value, output);
    for (const key of Object.keys(value)) {
      if (/(^|\.)identityLinkRetirement(?:\.|$)/.test(key)) continue;
      Object.defineProperty(output, key, {
        value: this.redactRetirementValue(value[key], seen, depth + 1),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return output;
  },
  /** Preserves BSON scalar prototypes only when their attached structured fields contain no private retirement evidence, including Code scopes and DBRef fields. @param {*} value Scalar or attached value. @param {WeakSet} [seen] Traversal identities. @param {number} [depth] Bounded attached graph depth. @returns {boolean} Safe scalar representation. */
  assertRetirementScalar: function (value, seen = new WeakSet(), depth = 0) {
    if (!value || typeof value !== "object" || seen.has(value)) return true;
    if (depth > 64) this.fail();
    seen.add(value);
    for (const key of Object.keys(value)) {
      if (/(^|\.)identityLinkRetirement(?:\.|$)/.test(key)) this.fail();
      this.assertRetirementScalar(value[key], seen, depth + 1);
    }
    return true;
  },
};
