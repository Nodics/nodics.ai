/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/service/identity/DefaultProfileBootstrapIdentityAssessmentService
 * @description Compares installed identity metadata with approved layered Init sources and binds explicit read-only operator review.
 * @layer service
 * @owner profile
 * @override Later Profile layers may replace source comparison while preserving installation provenance, full findings, fresh operator admission and drift fences.
 */
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const reviewProofs = new WeakMap();

module.exports = {
  /** Resolves independently enabled read-only review policy; no setting is adopted or written here. @returns {Object} Bounded policy. */
  policy: function () {
    const p =
      SERVICE.DefaultIdentityGovernanceMigrationService.getPolicy().assessment
        .bootstrapReview;
    if (
      !p ||
      p.enabled !== true ||
      !Number.isSafeInteger(p.maximumAgeMs) ||
      p.maximumAgeMs < 1000 ||
      p.maximumAgeMs > 300000 ||
      !Array.isArray(p.sources) ||
      !p.sources.length ||
      p.sources.length > 16 ||
      p.sources.some(
        (s) =>
          Object.keys(s).sort().join() !== "releaseCode,version" ||
          !/^[A-Za-z][A-Za-z0-9._-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(
            s.releaseCode,
          ) ||
          !/^\d+\.\d+\.\d+$/.test(s.version),
      ) ||
      new Set(p.sources.map((s) => s.releaseCode)).size !== p.sources.length
    )
      this.reject();
    return p;
  },
  /** Returns a content-free assessment failure. @returns {never} Throws. */
  reject: function () {
    SERVICE.DefaultIdentityGovernanceMigrationService.rejectAssessment();
  },
  /** Domain-separates evidence authentication using the existing nAuth secret; this is not a login/session issuer. @param {*} value Private evidence. @returns {string} Authenticated opaque digest. */
  digest: function (value) {
    const key = SERVICE.DefaultAuthSecurityService.getJwtSecret(CONFIG);
    const canonical =
      SERVICE.DefaultIdentityGovernanceMigrationService.assessmentCanonical(
        value,
      );
    return crypto
      .createHmac("sha256", key)
      .update("profile.bootstrap-assessment.v1\0")
      .update(JSON.stringify(canonical))
      .digest("hex");
  },
  /** Checks current native operator metadata and security state without depending on unqualified membership activation. @param {Object} request Human request. @param {Object} state Fresh complete inventory. @returns {Promise<string>} Private operator binding. */
  operator: async function (request, state) {
    const auth = request.authData || {};
    if (
      auth.authenticationMethod !== "PASSWORD" ||
      auth.sessionContext ||
      auth.principalType !== "human" ||
      auth.tokenType !== "access" ||
      auth.isSystem
    )
      this.reject();
    await SERVICE.DefaultPrincipalSecurityStampService.validate(auth);
    SERVICE.DefaultAuthSecurityService.validateAuthorizationPolicy(auth);
    const partition = state.partitions.find((p) => p.tenant === request.tenant);
    const actors = (partition?.employees || []).filter(
      (p) => p.loginId === auth.loginId,
    );
    const actor = actors[0];
    const enterprise = state.enterprises.filter((e) => e.code === auth.entCode);
    if (
      actors.length !== 1 ||
      actor.active !== true ||
      actor.principalType !== "human" ||
      enterprise.length !== 1 ||
      enterprise[0].active !== true ||
      enterprise[0].tenant !== request.tenant ||
      actor.disabled === true ||
      actor.registrationSuspended === true ||
      actor["authenticationIdentity.recordId"] !== undefined ||
      Number(actor.authVersion || 1) !== Number(auth.authVersion) ||
      !actor.userGroups?.includes("runtimeConfigAdminUserGroup") ||
      actor.userGroups.includes("serviceAccountUserGroup")
    )
      this.reject();
    const userState = await SERVICE.DefaultUserStateService.findUserState({
      tenant: request.tenant,
      loginId: actor.loginId,
      _id: actor._id,
    });
    if (!userState || userState.locked) this.reject();
    return this.digest([
      NODICS.getEnvironmentName(),
      NODICS.getSelectedEnvironmentName(),
      NODICS.getServerName(),
      request.tenant,
      auth.entCode,
      actor._id,
      actor.loginId,
      actor.authVersion,
      actor.userGroups,
      auth.authorizationPolicyVersion,
      auth.permissions,
    ]);
  },
  /** Reads installed release metadata through its existing generated owner, with exact-one fresh acknowledgement. @param {string} tenant Authority tenant. @param {Object} release nImport descriptor. @returns {Promise<Object>} Installed provenance. */
  installation: async function (tenant, release) {
    const owner = SERVICE.DefaultIdentityGovernanceMigrationService;
    const code = SERVICE.DefaultDataReleaseService.installationCode(
      tenant,
      release,
    );
    const response = await SERVICE.DefaultDataInstallationService.get(
      owner.systemRequest(
        { tenant },
        {
          query: { code },
          options: { recursive: false, skipItemCache: true },
          searchOptions: {
            pageSize: 2,
            pageNumber: 1,
            projection: {
              code: 1,
              active: 1,
              status: 1,
              version: 1,
              checksum: 1,
              releaseCode: 1,
              environment: 1,
            },
          },
        },
      ),
    );
    const row = response?.result?.[0];
    if (
      !/^SUC_/.test(response?.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Array.isArray(response.result) ||
      response.result.length !== 1 ||
      row.code !== code ||
      row.active !== true ||
      row.status !== "CURRENT" ||
      row.version !== release.version ||
      row.checksum !== release.checksum ||
      row.releaseCode !== release.releaseCode ||
      row.environment !== NODICS.getSelectedEnvironmentName()
    )
      this.reject();
    return row;
  },
  /** Uses the canonical import owners for release discovery, file selection and layered record merging; never invokes a pipeline/import. @param {string} tenant Exact authority tenant. @returns {Promise<Object>} Secret-free expected metadata and bound release provenance. */
  sources: async function (tenant) {
    const policy = this.policy();
    const releaseOwner = SERVICE.DefaultDataReleaseService;
    const discovered = releaseOwner.discoverReleases("init");
    const releases = policy.sources.map((selector) => {
      const matches = discovered.filter(
        (r) => r.releaseCode === selector.releaseCode,
      );
      if (
        matches.length !== 1 ||
        matches[0].invalidManifest ||
        matches[0].installer ||
        matches[0].version !== selector.version ||
        matches[0].dataType !== "init" ||
        !releaseOwner.isDestinationCompatible(matches[0]) ||
        !/^[a-f0-9]{64}$/.test(matches[0].checksum || "")
      )
        this.reject();
      return matches[0];
    });
    const provenance = [];
    for (const release of releases)
      provenance.push(await this.installation(tenant, release));
    const modules = releases.map((r) => r.moduleName);
    const utility = SERVICE.DefaultImportUtilityService;
    const headers = await utility.getSystemDataHeaders(
      modules,
      "init",
      releases,
    );
    const data = await utility.getSystemDataFiles(modules, "init", releases);
    const sourceRequest = {
      dataReleasePlan: releases,
      data: { headerFiles: headers, dataFiles: data },
    };
    const initializer = SERVICE.DefaultSystemDataImportInitializerService;
    const continuation = { nextSuccess() {} };
    // Only pure source preparation: no import pipeline, output files, claim or mutation.
    initializer.resolveFileType(sourceRequest, {}, continuation);
    initializer.buildHeaderInstances(sourceRequest, {}, continuation);
    initializer.assignDataFilesToHeader(sourceRequest, {}, continuation);
    const expected = [];
    for (const header of Object.values(sourceRequest.data.headers || {})) {
      const options = header.options || {};
      if (!["employee", "customer"].includes(options.schemaName)) continue;
      const selector = SERVICE.DefaultFileDataImportProcessService;
      if (!selector || typeof selector.resolveTargetTenants !== "function") this.reject();
      if (!selector.resolveTargetTenants({ tenant }, header).includes(tenant)) continue;
      if (
        options.moduleName !== "profile" ||
        options.enabled !== true ||
        options.operation !== "saveAll" ||
        !options.dataFilePrefix ||
        (options.tenant && options.tenant !== tenant)
      )
        this.reject();
      if (!Object.keys(header.dataFiles).length) this.reject();
      for (const dataset of Object.values(header.dataFiles)) {
        if (dataset.type !== "js" || !dataset.list.length) this.reject();
        const records =
          await SERVICE.DefaultJsFileDataProcessService.handleFiles(
            {},
            {},
            dataset.list.slice(),
          );
        for (const record of Object.values(records)) {
          if (
            typeof record.loginId !== "string" ||
            !record.loginId ||
            typeof record.code !== "string" ||
            !record.code ||
            typeof record.active !== "boolean" ||
            !Array.isArray(record.userGroups) ||
            record.userGroups.some((g) => typeof g !== "string") ||
            record.authenticationIdentity ||
            record.registrationAssignmentCode ||
            record.principalType !==
              (options.schemaName === "employee" ? "human" : "customer")
          ) {
            if (
              record.principalType === "service" &&
              options.schemaName === "employee"
            )
              continue;
            this.reject();
          }
          if (
            !SERVICE.DefaultIdentityGovernanceMigrationService.assessmentEmail(
              record.loginId,
            )
          )
            expected.push({
              kind:
                options.schemaName === "employee" ? "employees" : "customers",
              code: record.code,
              loginId: record.loginId,
              active: record.active,
              principalType: record.principalType,
              userGroups: record.userGroups.slice().sort(),
            });
        }
      }
    }
    if (
      !expected.length ||
      expected.length > 100 ||
      new Set(expected.map((r) => JSON.stringify([r.kind, r.code]))).size !==
        expected.length
    )
      this.reject();
    // Re-discover byte-level source descriptors after evaluation to fence source changes during the read.
    const after = releaseOwner.discoverReleases("init");
    for (const release of releases) {
      const matches = after.filter(
        (r) => r.releaseCode === release.releaseCode,
      );
      if (
        matches.length !== 1 ||
        matches[0].version !== release.version ||
        matches[0].checksum !== release.checksum
      )
        this.reject();
    }
    const installationsAfter = [];
    for (const release of releases)
      installationsAfter.push(await this.installation(tenant, release));
    if (!isDeepStrictEqual(provenance, installationsAfter)) this.reject();
    return {
      expected,
      provenance,
      releases: releases.map((r) => ({
        releaseCode: r.releaseCode,
        version: r.version,
        checksum: r.checksum,
      })),
    };
  },
  /** Matches every non-email finding to one exact unlinked source principal in the authority tenant; no finding disappears. @param {Object} state Fresh inventory. @param {Object} report Existing classifier result. @param {Object} sources Approved Init metadata. @returns {void} Throws on any mismatch. */
  compare: function (state, report, sources) {
    const owner = SERVICE.DefaultIdentityGovernanceMigrationService;
    if (
      !report.findings.length ||
      report.findings.some(
        (f) =>
          f.code !== "RSN_PROFILE_IDENTITY_NON_EMAIL_LOGIN_REVIEW" ||
          f.references.length !== 1,
      )
    )
      this.reject();
    const actual = [];
    for (const partition of state.partitions)
      for (const kind of ["employees", "customers"]) {
        for (const row of partition[kind]) {
          if (
            owner.assessmentEmail(row.loginId) ||
            row.principalType === "service"
          )
            continue;
          if (
            partition.tenant !==
              SERVICE.DefaultEnterpriseManagementService.assignmentTenant() ||
            ["tenantCode", "recordKind", "recordId"].some(
              (key) => row["authenticationIdentity." + key] !== undefined,
            ) ||
            row.registrationAssignmentCode ||
            row.disabled === true ||
            row.registrationSuspended === true
          )
            this.reject();
          const credential = partition.passwords.filter(
            (p) =>
              owner.assessmentReference(p._id) ===
              owner.assessmentReference(row.password),
          );
          if (
            credential.length !== 1 ||
            credential[0].loginId !== row.loginId ||
            credential[0].active === false
          )
            this.reject();
          actual.push({
            kind,
            code: row.code,
            loginId: row.loginId,
            active: row.active,
            principalType: row.principalType,
            userGroups: row.userGroups.slice().sort(),
          });
        }
      }
    const sorted = (rows) =>
      rows
        .slice()
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (
      actual.length !== report.findings.length ||
      !isDeepStrictEqual(sorted(actual), sorted(sources.expected))
    )
      this.reject();
  },
  /** Produces a short-lived stateless review challenge bound to inventory, source bytes, installation records and current human authority. @param {Object} request Human request. @param {Object} state Complete inventory. @param {Object} report Existing findings. @returns {Promise<Object>} Opaque evidence only. */
  challenge: async function (request, state, report) {
    const policy = this.policy();
    const sources = await this.sources(request.tenant);
    this.compare(state, report, sources);
    const payload = {
      version: 1,
      issuedAt: Date.now(),
      maximumAgeMs: policy.maximumAgeMs,
      inventory: this.digest(state),
      source: this.digest(sources),
      operator: await this.operator(request, state),
      nonce: crypto.randomBytes(16).toString("hex"),
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return {
      version: 1,
      disposition: "REVIEW_REQUIRED",
      findingCount: report.findings.length,
      reviewToken: encoded + "." + this.digest(encoded),
    };
  },
  /** Rechecks original authority, fresh complete inventory and exact source binding; confirmation has no mutation/activation authority. @param {Object} request Explicit review. @param {Object} state Fresh inventory. @param {Object} report Preserved findings. @returns {Promise<Object>} Reviewed observation. */
  review: async function (request, state, report) {
    const input = request.identityMigration;
    const policy = this.policy();
    if (
      !input ||
      Object.keys(input).sort().join() !== "confirmed,reviewToken" ||
      input.confirmed !== true ||
      typeof input.reviewToken !== "string" ||
      input.reviewToken.length > 2048 ||
      !/^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/.test(input.reviewToken)
    )
      this.reject();
    const [encoded, signature] = input.reviewToken.split(".");
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(this.digest(encoded), "hex"),
      )
    )
      this.reject();
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    const now = Date.now();
    if (
      Object.keys(payload).sort().join() !==
        "inventory,issuedAt,maximumAgeMs,nonce,operator,source,version" ||
      payload.version !== 1 ||
      payload.maximumAgeMs !== policy.maximumAgeMs ||
      !Number.isSafeInteger(payload.issuedAt) ||
      payload.issuedAt > now ||
      now - payload.issuedAt > policy.maximumAgeMs ||
      payload.inventory !== this.digest(state) ||
      payload.operator !== (await this.operator(request, state))
    )
      this.reject();
    const sources = await this.sources(request.tenant);
    this.compare(state, report, sources);
    if (payload.source !== this.digest(sources)) this.reject();
    const reviewedAt = await this.assertReviewFresh(request, payload);
    const receipt = {
      version: 1,
      disposition: "REVIEWED_SOURCE_MATCH",
      findingCount: report.findings.length,
      reviewedAt: new Date(reviewedAt).toISOString(),
      reviewerDigest: payload.operator,
      evidenceDigest: this.digest({
        inventory: payload.inventory,
        source: payload.source,
        reviewer: payload.operator,
        nonce: payload.nonce,
        reviewedAt,
      }),
      effects: false,
      qualificationGranted: false,
    };
    reviewProofs.set(receipt, { request, payload });
    return receipt;
  },
  /** Rechecks original proof expiry and freshly inventoried operator authority after awaited work. @param {Object} request Original explicit command. @param {Object} payload Privately authenticated proof. @returns {Promise<number>} Final admitted clock boundary. */
  assertReviewFresh: async function (request, payload) {
    const owner = SERVICE.DefaultIdentityGovernanceMigrationService;
    const context = owner.assessmentContext(request, true);
    const expired = () => {
      const policy = this.policy();
      const now = Date.now();
      return (
        payload.maximumAgeMs !== policy.maximumAgeMs ||
        payload.issuedAt > now ||
        now - payload.issuedAt > policy.maximumAgeMs
      );
    };
    if (expired()) this.reject();
    const current = await owner.assessmentState(context);
    if (
      payload.inventory !== this.digest(current) ||
      payload.operator !== (await this.operator(request, current))
    )
      this.reject();
    // Inventory, stamp and lock-state reads can themselves outlast the proof.
    owner.assessmentContext(request, true);
    if (expired()) this.reject();
    return Date.now();
  },
  /** Records the bounded review after the final inventory fence through the existing nAuth audit owner. No identity or qualification is written. @param {Object} request Authenticated command. @param {Object} receipt Reviewed evidence. @returns {Promise<Object>} Audit-admitted receipt; persistence remains the selected audit publisher's contract. */
  recordReview: async function (request, receipt) {
    const proof = reviewProofs.get(receipt);
    if (!proof || proof.request !== request) this.reject();
    const audit = SERVICE.DefaultAuthAuditService;
    const configuration = CONFIG.get("authSecurity")?.audit;
    const publisher = configuration?.publisherService;
    if (
      !audit ||
      typeof audit.record !== "function" ||
      configuration?.enabled !== true ||
      (publisher != null &&
        (typeof publisher !== "string" ||
          !publisher ||
          typeof SERVICE[publisher]?.record !== "function")) ||
      receipt?.disposition !== "REVIEWED_SOURCE_MATCH" ||
      !/^[a-f0-9]{64}$/.test(receipt.reviewerDigest || "") ||
      !/^[a-f0-9]{64}$/.test(receipt.evidenceDigest || "")
    )
      this.reject();
    await this.assertReviewFresh(request, proof.payload);
    const recorded = await audit.record({
      eventType: "PROFILE_BOOTSTRAP_IDENTITY_REVIEW",
      outcome: "REVIEWED_SOURCE_MATCH",
      tenant: request.tenant,
      entCode: request.authData.entCode,
      principalId: receipt.reviewerDigest,
      correlationId: receipt.evidenceDigest,
      source: "profile.bootstrapIdentityAssessment",
      occurredAt: receipt.reviewedAt,
    });
    if (
      !recorded ||
      recorded.success === false ||
      recorded.error ||
      (recorded.code !== undefined && !/^SUC_/.test(recorded.code)) ||
      (recorded.errors !== undefined &&
        (!Array.isArray(recorded.errors) || recorded.errors.length))
    )
      this.reject();
    await this.assertReviewFresh(request, proof.payload);
    return { ...receipt, auditRecorded: true };
  },
};
