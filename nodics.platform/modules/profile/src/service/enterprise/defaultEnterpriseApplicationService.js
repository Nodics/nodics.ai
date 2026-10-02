/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const applicationWrites = new WeakSet();
/**
 * @module profile/service/enterprise/DefaultEnterpriseApplicationService
 * @description Saves mailbox-proven employee applications in the existing access
 * assignment owner, preserves corrected attempts and closes pending applications
 * through proof-bound withdrawal or frozen-deadline expiry. Does not approve requests,
 * issue credentials, grant scopes, start Process as a user, or send notifications.
 * @layer service
 * @owner profile
 * @sideEffects Consumes purpose-bound proof, persists private assignment application
 * evidence and delegates optional review start to the existing Profile review owner.
 * @throws {CLASSES.NodicsError} ERR_PROFILE_APP_* or existing owner failures;
 * submitted application evidence survives an unconfirmed review start.
 * @override Later layers may narrow eligibility, limits and presentation while
 * preserving proof, immutable submission, tenant isolation and no-access semantics.
 */
module.exports = {
  /**
   * Recognizes private owner request identity, never a JSON/header authorization flag.
   * @param {Object} request Exact generated mutation request.
   * @returns {boolean} Whether the current request belongs to an application owner write.
   */
  ownsWrite: function (request) {
    return applicationWrites.has(request);
  },
  /**
   * Delegates a private owner mutation to the existing generated assignment service.
   * @param {string} operation Fixed internal save/update operation, never an HTTP selector.
   * @param {Object} request Owner-built generated-service request.
   * @returns {Promise<Object>} Original persistence result with interceptor protection intact.
   */
  write: async function (operation, request) {
    if (!["save", "update"].includes(operation)) this.fail("INPUT");
    applicationWrites.add(request);
    try {
      return await SERVICE.DefaultEnterpriseAccessAssignmentService[operation](
        request,
      );
    } finally {
      applicationWrites.delete(request);
    }
  },
  /**
   * Returns the existing continuation and generated-read owner.
   * @returns {Object} Effective loader-merged registration owner rather than a copied implementation.
   */
  base: function () {
    return SERVICE.DefaultEnterpriseRegistrationService;
  },
  /**
   * Uses the existing Profile error vocabulary with no reflected private data.
   * @param {string} code Stable owner error suffix.
   * @returns {never} Throws the stable redacted owner error.
   */
  fail: function (code) {
    throw new CLASSES.NodicsError("ERR_PROFILE_APP_" + code);
  },
  /**
   * Validates independently qualified lifecycle limits; null expiry leaves existing policy unchanged.
   * @returns {Object|undefined} Effective later-layer lifecycle policy, or disabled.
   */
  lifecyclePolicy: function () {
    const p = (CONFIG.get("enterpriseManagement") || {}).applications
      ?.lifecycle;
    if (!p || p.qualified !== true) return undefined;
    this.policy(false);
    if (
      !Number.isSafeInteger(p.maximumAttempts) ||
      p.maximumAttempts < 1 ||
      p.maximumAttempts > 20 ||
      !Number.isSafeInteger(p.maximumHistoryBytes) ||
      p.maximumHistoryBytes < 1024 ||
      p.maximumHistoryBytes > 262144 ||
      (p.expiryDays !== null &&
        (!Number.isSafeInteger(p.expiryDays) ||
          p.expiryDays < 1 ||
          p.expiryDays > 365))
    )
      this.fail("UNAVAILABLE");
    return p;
  },
  /**
   * Identifies resubmittable outcomes without treating inactivity or invitations as consent.
   * @param {Object} record Current authoritative assignment.
   * @returns {boolean} Whether this qualified, unclaimed application may start a fresh attempt.
   */
  canResubmit: function (record) {
    const p = this.lifecyclePolicy();
    return !!(
      p &&
      record?.origin === "SELF_APPLICATION" &&
      record.active === true &&
      ["REJECTED", "WITHDRAWN", "EXPIRED"].includes(record.status) &&
      !record.registration &&
      !record.identityClaimed &&
      !record.membership &&
      (record.application?.attempt || 1) < p.maximumAttempts
    );
  },
  /**
   * Writes one owner-built application transition with revision/hash CAS and exact readback.
   * @param {Object} context Private admitted context or Profile system context.
   * @param {Object} record Uncached authoritative application before the transition.
   * @param {Object} application Immutable owner-built evidence for the new state.
   * @param {string} status Target application state, never caller supplied.
   * @param {Object} [patch] Owner-resolved role/policy changes on a fresh attempt.
   * @returns {Promise<Object>} Exactly acknowledged saved record; uncertainty propagates.
   */
  transition: async function (
    context,
    record,
    application,
    status,
    patch = {},
  ) {
    if (
      record.origin !== "SELF_APPLICATION" ||
      record.active !== true ||
      !Number.isSafeInteger(record.revision) ||
      record.revision < 1 ||
      record.registration ||
      record.identityClaimed ||
      record.membership
    )
      this.fail("CONFLICT");
    const mutation = require("node:crypto").randomBytes(32).toString("hex");
    application = { ...application, mutation };
    let failure;
    try {
      const response = await this.write("update", {
        tenant: context.tenant,
        authData: context.authData,
        query: {
          code: record.code,
          revision: record.revision,
          status: record.status,
          active: true,
          origin: "SELF_APPLICATION",
          "application.requestHash": record.application.requestHash,
        },
        model: { ...patch, revision: record.revision, status, application },
        options: { recursive: false },
      });
      this.base().assertWrite(response);
      if (response.result?.matchedCount !== 1) this.fail("CONFLICT");
    } catch (error) {
      failure = error;
    }
    const saved = await this.base().read(
      "DefaultEnterpriseAccessAssignmentService",
      context.tenant,
      { code: record.code },
    );
    if (
      !saved ||
      saved.revision !== record.revision + 1 ||
      saved.status !== status ||
      saved.active !== true ||
      this.base().digest(saved.application) !==
        this.base().digest(application) ||
      Object.entries(patch).some(
        ([key, value]) =>
          this.base().digest(saved[key]) !== this.base().digest(value),
      )
    ) {
      if (failure) throw failure;
      this.fail("CONFLICT");
    }
    return saved;
  },
  /**
   * Enforces a frozen attempt deadline on owner reads and immediately before decisions.
   * @param {Object} context Private authority context for the assignment partition.
   * @param {Object} record Authoritative draft/pending application.
   * @returns {Promise<Object>} Current record or exact EXPIRED transition; never expires approved access.
   */
  expire: async function (context, record) {
    if (
      record?.active !== true ||
      !record?.application?.deadlineAt ||
      !["APPLICATION_DRAFT", "AWAITING_REVIEW"].includes(record.status)
    )
      return record;
    const deadline = Date.parse(record.application.deadlineAt);
    if (!Number.isFinite(deadline)) this.fail("CONFLICT");
    if (deadline > this.base().now()) return record;
    const closed = await this.transition(
      context,
      record,
      {
        ...record.application,
        closedAt: new Date(this.base().now()).toISOString(),
        closedFromRevision: record.revision,
      },
      "EXPIRED",
    );
    await this.reconcileClosedReview(closed);
    return closed;
  },
  /**
   * Withdraws one proof-bound pending attempt; matching retries are read-only, approval wins conflicts.
   * @param {Object} context Server-admitted origin/tenant context.
   * @param {Object} session Private continuation with current mailbox proof.
   * @param {Object} input Continuation, opaque applicationCode and displayed revision only.
   * @returns {Promise<Object>} Refreshed safe history; no credentials, scopes or workflow decisions.
   */
  withdraw: async function (context, session, input) {
    this.assertVerified(context, session, false);
    if (!this.lifecyclePolicy()) this.fail("UNAVAILABLE");
    this.base().input(input, [
      "continuation",
      "applicationCode",
      "expectedRevision",
    ]);
    if (
      typeof input.applicationCode !== "string" ||
      !/^[A-Za-z0-9_.-]{1,128}$/.test(input.applicationCode) ||
      !/^[1-9][0-9]{0,9}$/.test(input.expectedRevision || "")
    )
      this.fail("INPUT");
    const revision = Number(input.expectedRevision);
    let record = await this.base().read(
      "DefaultEnterpriseAccessAssignmentService",
      context.tenant,
      { code: input.applicationCode },
    );
    if (
      !record ||
      record.origin !== "SELF_APPLICATION" ||
      record.normalizedEmail !== session.email
    )
      this.fail("ASSIGNMENT");
    if (
      !(
        record.status === "WITHDRAWN" &&
        record.application.closedFromRevision === revision
      )
    ) {
      record = await this.expire(context, record);
      if (record.status !== "AWAITING_REVIEW" || record.revision !== revision)
        this.fail("CONFLICT");
      await this.base().rate(context, "complete", session.email);
      record = await this.transition(
        context,
        record,
        {
          ...record.application,
          closedAt: new Date(this.base().now()).toISOString(),
          closedFromRevision: revision,
        },
        "WITHDRAWN",
      );
    }
    await this.reconcileClosedReview(record);
    session.applicationCode = record.code;
    session.stage = ENUMS.ProfileEmployeeAccessStage.APPLICATION_CLOSED.key;
    return this.status(context, session);
  },
  /**
   * Attempts optional review retirement only after closure has committed.
   * @param {Object} record Persisted closed attempt.
   * @param {number} [attempt] Exact retained closed attempt when a start races resubmission.
   * @returns {Promise<Object>} Private reconciliation outcome; failures never undo domain closure.
   */
  reconcileClosedReview: async function (record, attempt) {
    if (
      (CONFIG.get("enterpriseManagement") || {}).applications?.review
        ?.retirementQualified !== true
    )
      return { status: "DISABLED" };
    try {
      return await SERVICE.DefaultEnterpriseApplicationReviewService.retireClosedReview(
        record,
        attempt,
      );
    } catch (error) {
      return { status: "UNCONFIRMED" };
    }
  },
  /**
   * Returns opt-in intake policy; presence of source never enables applications.
   * @param {boolean} [requireEnabled] Require intake activation; false allows authorized review while paused.
   * @returns {Object} Validated effective policy; disabled or unqualified policy throws.
   */
  policy: function (requireEnabled = true) {
    const p = (CONFIG.get("enterpriseManagement") || {}).applications;
    if (!p || (requireEnabled && p.enabled !== true)) this.fail("UNAVAILABLE");
    if (
      !Number.isSafeInteger(p.maximumChoices) ||
      p.maximumChoices < 1 ||
      p.maximumChoices > 100 ||
      !Number.isSafeInteger(p.maximumNoteLength) ||
      p.maximumNoteLength < 1 ||
      p.maximumNoteLength > 4000 ||
      !Array.isArray(p.allowedRoleCodes) ||
      !p.allowedRoleCodes.length ||
      p.allowedRoleCodes.some((code) => typeof code !== "string" || !code) ||
      typeof p.reviewPermission !== "string" ||
      !p.reviewPermission ||
      !Number.isSafeInteger(p.pageSize) ||
      p.pageSize < 1 ||
      p.pageSize > 100
    )
      this.fail("UNAVAILABLE");
    return p;
  },
  /**
   * Only a server-admitted registration continuation with fresh proof can apply.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {boolean} [requireEnabled] Require new intake; false permits existing proof-bound history/withdrawal.
   * @returns {void} Returns only for fresh proof and locally admitted context.
   */
  assertVerified: function (context, session, requireEnabled = true) {
    this.policy(requireEnabled);
    if (
      !this.base().ownsContext(context) ||
      !session ||
      session.tenant !== context.tenant ||
      session.origin !== context.origin ||
      typeof session.email !== "string" ||
      !session.proof ||
      !Number.isFinite(session.proofExpiresAt) ||
      session.proofExpiresAt <= this.base().now()
    )
      this.fail("VERIFY_AGAIN");
  },
  /**
   * Resolves an explicit enterprise-owned policy; applicant input cannot choose a role.
   * @param {Object} enterprise Authoritative enterprise and explicit application policy.
   * @returns {Object|undefined} Explicit admissible role policy and digest, or no eligible policy.
   */
  enterprisePolicy: function (enterprise) {
    const policy = enterprise && enterprise.employeeApplicationPolicy;
    if (
      !enterprise ||
      enterprise.active !== true ||
      !policy ||
      policy.enabled !== true ||
      policy.method !== "PASSWORD" ||
      !this.policy().allowedRoleCodes.includes(policy.roleCode)
    )
      return undefined;
    const role = SERVICE.DefaultEnterpriseManagementService.rolePolicy(
      policy.roleCode,
    );
    if (
      role.scopeType !== "ENTERPRISE" ||
      role.delegable !== true ||
      !Array.isArray(role.groupCodes) ||
      !role.groupCodes.length ||
      role.groupCodes.some((code) => typeof code !== "string" || !code) ||
      (role.assignmentPermissions && role.assignmentPermissions.length)
    )
      this.fail("ASSIGNMENT");
    return {
      method: policy.method,
      roleCode: policy.roleCode,
      groupCodes: role.groupCodes,
      digest: this.base().digest([
        policy.method,
        policy.roleCode,
        role.groupCodes,
      ]),
    };
  },
  /**
   * Projects only a business name from the existing enterprise record.
   * @param {Object} enterprise Authoritative enterprise and explicit application policy.
   * @returns {string} Business name with existing enterprise-code fallback.
   */
  enterpriseName: function (enterprise) {
    return typeof enterprise.name === "string"
      ? enterprise.name
      : (enterprise.name && enterprise.name.en) || enterprise.code;
  },
  /**
   * Resolves bounded choices only after email proof; preserves the default invite-only mode.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object[]} assignments Bounded mailbox-owned assignment inventory.
   * @returns {Promise<boolean>} Whether intake handled the continuation, updating choices and stage.
   */
  resolve: async function (context, session, assignments) {
    if (
      (CONFIG.get("enterpriseManagement") || {}).applications?.enabled !== true
    )
      return false;
    this.assertVerified(context, session);
    const own = [];
    for (const item of assignments || []) {
      if (
        item.origin === "SELF_APPLICATION" &&
        item.normalizedEmail === session.email
      )
        own.push(await this.expire(context, item));
    }
    const owned = own.filter(
      (item) =>
        item.origin === "SELF_APPLICATION" &&
        item.normalizedEmail === session.email,
    );
    const submitted = owned.filter(
      (item) =>
        item.active === true &&
        item.status ===
          ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key &&
        item.application?.submittedAt,
    );
    const unavailable = owned.filter(
      (item) =>
        !this.canResubmit(item) &&
        (item.active !== true ||
          ![
            ENUMS.ProfileEmployeeApplicationStatus.APPLICATION_DRAFT.key,
            ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
          ].includes(item.status)),
    );
    const enterprises = await this.base().inventory(
      "DefaultEnterpriseService",
      context.tenant,
      {},
    );
    const choices = [];
    for (const enterprise of enterprises) {
      const policy = this.enterprisePolicy(enterprise);
      if (
        !policy ||
        submitted
          .concat(unavailable)
          .some((item) => item.enterpriseCode === enterprise.code)
      )
        continue;
      const resolved =
        await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
          enterprise.code,
        );
      if (
        resolved.enterprise.active !== true ||
        !this.enterprisePolicy(resolved.enterprise)
      )
        continue;
      choices.push({
        code: enterprise.code,
        name: this.enterpriseName(resolved.enterprise),
      });
    }
    if (
      choices.length > this.policy().maximumChoices ||
      submitted.length > this.policy().maximumChoices
    )
      this.fail("UNAVAILABLE");
    const history = own.filter(
      (item) =>
        item.application?.submittedAt &&
        [
          ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
          ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
          ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
          ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
          "WITHDRAWN",
          "EXPIRED",
        ].includes(item.status),
    );
    if (history.length > this.policy().maximumChoices) this.fail("UNAVAILABLE");
    session.applicationChoices = choices;
    session.applications = history.flatMap((item) => this.projectHistory(item));
    session.stage = choices.length
      ? ENUMS.ProfileEmployeeAccessStage.APPLICATION_DETAILS.key
      : submitted.length
        ? ENUMS.ProfileEmployeeAccessStage.APPLICATION_PENDING.key
        : history.some(
              (item) =>
                item.status ===
                ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
            )
          ? ENUMS.ProfileEmployeeAccessStage.APPLICATION_REJECTED.key
          : history.length
            ? ENUMS.ProfileEmployeeAccessStage.APPLICATION_CLOSED.key
            : ENUMS.ProfileEmployeeAccessStage.NO_INVITATION.key;
    return true;
  },
  /**
   * Projects submitted application history, including completed registration.
   * Callers retain responsibility for scope and allowed transitions; projecting
   * REGISTERED never makes it eligible for review or another registration.
   * @param {Object} item Authoritative assignment with submitted application metadata.
   * @returns {Object} Public history without proof, groups, tenant or private checkpoints.
   * @throws {Error} ERR_PROFILE_APP_CONFLICT for malformed or unsubmitted records.
   */
  projectRecord: function (item) {
    const application = item.application;
    if (
      !application ||
      typeof application.submittedAt !== "string" ||
      !Number.isFinite(Date.parse(application.submittedAt)) ||
      typeof application.enterpriseName !== "string" ||
      !application.enterpriseName ||
      typeof application.firstName !== "string" ||
      !application.firstName ||
      typeof application.lastName !== "string" ||
      !application.lastName ||
      typeof application.note !== "string" ||
      ![
        ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
        ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
        ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
        ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
        "WITHDRAWN",
        "EXPIRED",
      ].includes(item.status)
    )
      this.fail("CONFLICT");
    return {
      code: item.code,
      enterpriseCode: item.enterpriseCode,
      enterpriseName: application.enterpriseName,
      status: item.status,
      submittedAt: application.submittedAt,
      revision: item.revision,
      attempt: application.attempt || 1,
      ...(application.review?.decision?.reason
        ? { reason: application.review.decision.reason }
        : {}),
      ...(application.closedAt ? { closedAt: application.closedAt } : {}),
      ...(application.deadlineAt ? { deadlineAt: application.deadlineAt } : {}),
      canWithdraw: !!(
        this.lifecyclePolicy() &&
        item.active === true &&
        item.status === "AWAITING_REVIEW"
      ),
      reviewStatus:
        application.review?.started === true
          ? ENUMS.ProfileApplicationReviewStatus.STARTED.key
          : ENUMS.ProfileApplicationReviewStatus.NOT_CONFIRMED.key,
    };
  },
  /**
   * Projects bounded immutable attempts without private hashes, workflow handles or applicant details.
   * @param {Object} record Current application and its private previous attempts.
   * @returns {Object[]} Safe chronological history, including the current submitted attempt.
   */
  projectHistory: function (record) {
    const history = record.application?.history || [];
    if (
      !Array.isArray(history) ||
      history.length >= 20 ||
      Buffer.byteLength(JSON.stringify(history)) > 262144
    )
      this.fail("CONFLICT");
    return history
      .filter((item) => item.application?.submittedAt)
      .map((item) => ({
        ...this.projectRecord({
          ...record,
          application: item.application,
          status: item.status,
          revision: item.revision,
        }),
        canWithdraw: false,
      }))
      .concat(
        record.application?.submittedAt ? [this.projectRecord(record)] : [],
      );
  },
  /**
   * Consumes the existing verification proof for this immutable application only.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} record Authoritative application with submitted/review evidence.
   * @returns {Promise<void>} Records proof consumption in the private continuation only.
   */
  consume: async function (context, session, record) {
    const reference = "employee-application:" + record.application.requestHash;
    const fields = {
      challengeCode: session.challenge.challengeCode,
      generation: session.challenge.generation,
      proof: session.proof,
      operationReference: reference,
    };
    if (session.consumedApplication === reference) return;
    try {
      await this.base().verifyRpc(context, session, "CONSUME", fields);
    } catch (error) {
      const receipt = await this.base().verifyRpc(
        context,
        session,
        "RECEIPT",
        fields,
      );
      if (receipt.executionGranted !== false) throw error;
    }
    session.consumedApplication = reference;
  },
  /**
   * Saves only a non-login draft, then confirms proof and a managed submission transition.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} input Untrusted DTO checked against the operation allowlist.
   * @returns {Promise<Object>} Safe progress after immutable draft, proof consumption and submission.
   */
  apply: async function (context, session, input) {
    this.assertVerified(context, session);
    this.base().input(input, [
      "continuation",
      "enterpriseCode",
      "firstName",
      "lastName",
      "note",
    ]);
    if (
      ![
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_DETAILS.key,
        ENUMS.ProfileEmployeeAccessStage.APPLICATION_PENDING.key,
      ].includes(session.stage)
    )
      this.fail("CONFLICT");
    const p = this.policy(),
      names = this.base().policy(),
      management = SERVICE.DefaultEnterpriseManagementService;
    for (const key of ["firstName", "lastName"]) {
      if (
        typeof input[key] !== "string" ||
        !input[key].trim() ||
        input[key].length > names.maximumNameLength
      )
        this.fail("INPUT");
    }
    if (
      input.note !== undefined &&
      (typeof input.note !== "string" ||
        input.note.length > p.maximumNoteLength)
    )
      this.fail("INPUT");
    if (
      typeof input.enterpriseCode !== "string" ||
      !session.applicationChoices?.some(
        (item) => item.code === input.enterpriseCode,
      )
    )
      this.fail("ASSIGNMENT");
    await this.base().rate(context, "complete", session.email);
    const target = await management.retrieveEnterpriseForAccess(
      input.enterpriseCode,
    );
    const policy = this.enterprisePolicy(target.enterprise);
    if (!policy) this.fail("ASSIGNMENT");
    if ((await this.base().identities(context, session.email)).length)
      this.fail("EXISTING");
    const code = management.assignmentCode(input.enterpriseCode, session.email);
    const details = {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      note: (input.note || "").trim(),
    };
    let record = await this.base().read(
      "DefaultEnterpriseAccessAssignmentService",
      context.tenant,
      { code },
    );
    if (record) record = await this.expire(context, record);
    const resubmit = this.canResubmit(record);
    const attempt = resubmit
      ? (record.application.attempt || 1) + 1
      : record?.application?.attempt || 1;
    const requestHash = this.base().digest(
      attempt === 1
        ? [code, policy.digest, details]
        : [code, policy.digest, details, attempt],
    );
    if (
      record &&
      !resubmit &&
      (record.origin !== "SELF_APPLICATION" ||
        record.application?.requestHash !== requestHash ||
        ![
          ENUMS.ProfileEmployeeApplicationStatus.APPLICATION_DRAFT.key,
          ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
        ].includes(record.status) ||
        record.active !== true)
    )
      this.fail("CONFLICT");
    // One consumed proof is bound to one immutable request; do not create an
    // unusable second draft before discovering that its proof cannot be used.
    if (
      session.consumedApplication &&
      session.consumedApplication !== "employee-application:" + requestHash
    )
      this.fail("VERIFY_AGAIN");
    if (resubmit) {
      const previous = { ...record.application };
      delete previous.history;
      const history = [
        ...(record.application.history || []),
        {
          status: record.status,
          revision: record.revision,
          application: previous,
        },
      ];
      const lifecycle = this.lifecyclePolicy();
      if (
        history.length >= lifecycle.maximumAttempts ||
        Buffer.byteLength(JSON.stringify(history)) >
          lifecycle.maximumHistoryBytes
      )
        this.fail("UNAVAILABLE");
      record = await this.transition(
        context,
        record,
        {
          ...details,
          requestHash,
          attempt,
          history,
          policyDigest: policy.digest,
          enterpriseName: this.enterpriseName(target.enterprise),
          createdAt: new Date(this.base().now()).toISOString(),
          ...(lifecycle.expiryDays === null
            ? {}
            : {
                deadlineAt: new Date(
                  this.base().now() + lifecycle.expiryDays * 86400000,
                ).toISOString(),
              }),
        },
        "APPLICATION_DRAFT",
        { roleCode: policy.roleCode, groupCodes: policy.groupCodes },
      );
    }
    if (!record) {
      const model = {
        code,
        revision: 0,
        email: session.email,
        normalizedEmail: session.email,
        enterpriseCode: target.enterprise.code,
        tenantCode: target.tenantCode,
        roleCode: policy.roleCode,
        groupCodes: policy.groupCodes,
        scopeType: "ENTERPRISE",
        scopeCode: target.enterprise.code,
        active: true,
        origin: "SELF_APPLICATION",
        status: ENUMS.ProfileEmployeeApplicationStatus.APPLICATION_DRAFT.key,
        application: {
          ...details,
          attempt: 1,
          ...(this.lifecyclePolicy()?.expiryDays != null
            ? {
                deadlineAt: new Date(
                  this.base().now() +
                    this.lifecyclePolicy().expiryDays * 86400000,
                ).toISOString(),
              }
            : {}),
          requestHash,
          policyDigest: policy.digest,
          enterpriseName: this.enterpriseName(target.enterprise),
          createdAt: new Date(this.base().now()).toISOString(),
        },
      };
      record = await this.base().insert(
        "DefaultEnterpriseAccessAssignmentService",
        context,
        context.tenant,
        model,
        {
          code,
          origin: model.origin,
          normalizedEmail: session.email,
          enterpriseCode: input.enterpriseCode,
        },
      );
    }
    if (
      record.origin !== "SELF_APPLICATION" ||
      record.normalizedEmail !== session.email ||
      record.active !== true ||
      ![
        ENUMS.ProfileEmployeeApplicationStatus.APPLICATION_DRAFT.key,
        ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
      ].includes(record.status) ||
      record.application?.requestHash !== requestHash ||
      record.tenantCode !== target.tenantCode ||
      record.roleCode !== policy.roleCode ||
      this.base().digest(record.groupCodes) !==
        this.base().digest(policy.groupCodes) ||
      record.scopeType !== "ENTERPRISE" ||
      record.scopeCode !== input.enterpriseCode ||
      record.registration ||
      record.identityClaimed
    )
      this.fail("CONFLICT");
    if (
      record.status !==
      ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key
    ) {
      await this.consume(context, session, record);
      record = await this.submit(context, session, record);
    }
    session.applicationCode = code;
    if (
      (CONFIG.get("enterpriseManagement") || {}).applications?.review
        ?.enabled === true
    ) {
      try {
        record = await SERVICE.DefaultEnterpriseApplicationReviewService.start(
          context,
          session,
          record,
        );
      } catch (_) {
        record = await this.base().read(
          "DefaultEnterpriseAccessAssignmentService",
          context.tenant,
          { code },
        );
      }
    }
    session.applications = this.projectHistory(record);
    session.stage = ["WITHDRAWN", "EXPIRED"].includes(record.status)
      ? ENUMS.ProfileEmployeeAccessStage.APPLICATION_CLOSED.key
      : record.status === ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key
        ? ENUMS.ProfileEmployeeAccessStage.APPLICATION_APPROVED.key
        : record.status === ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key
          ? ENUMS.ProfileEmployeeAccessStage.APPLICATION_REJECTED.key
          : ENUMS.ProfileEmployeeAccessStage.APPLICATION_PENDING.key;
    return this.base().project(session);
  },
  /**
   * Conditionally publishes a proof-backed draft to the review list, never to login.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @param {Object} record Authoritative application with submitted/review evidence.
   * @returns {Promise<Object>} AWAITING_REVIEW record after conditional write and readback.
   */
  submit: async function (context, session, record) {
    this.assertVerified(context, session);
    record = await this.expire(context, record);
    if (
      session.consumedApplication !==
      "employee-application:" + record.application?.requestHash
    )
      this.fail("VERIFY_AGAIN");
    if (
      !Number.isSafeInteger(record.revision) ||
      record.revision < 1 ||
      record.status !==
        ENUMS.ProfileEmployeeApplicationStatus.APPLICATION_DRAFT.key ||
      record.active !== true
    )
      this.fail("CONFLICT");
    const target =
      await SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess(
        record.enterpriseCode,
      );
    if (
      this.enterprisePolicy(target.enterprise)?.digest !==
        record.application.policyDigest ||
      target.tenantCode !== record.tenantCode
    )
      this.fail("ASSIGNMENT");
    const mutation = require("node:crypto").randomBytes(32).toString("hex");
    const application = {
      ...record.application,
      submittedAt: new Date(this.base().now()).toISOString(),
      mutation,
    };
    let failure;
    try {
      const response = await this.write("update", {
        tenant: context.tenant,
        authData: context.authData,
        query: {
          code: record.code,
          revision: record.revision,
          status: ENUMS.ProfileEmployeeApplicationStatus.APPLICATION_DRAFT.key,
          active: true,
          origin: "SELF_APPLICATION",
        },
        model: {
          revision: record.revision,
          status: ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
          application,
        },
        options: { recursive: false },
      });
      this.base().assertWrite(response);
      if (response.result?.matchedCount !== 1) this.fail("CONFLICT");
    } catch (error) {
      failure = error;
    }
    const saved = await this.base().read(
      "DefaultEnterpriseAccessAssignmentService",
      context.tenant,
      {
        code: record.code,
      },
    );
    if (
      !saved ||
      saved.revision !== record.revision + 1 ||
      saved.application?.mutation !== mutation ||
      saved.status !==
        ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key ||
      saved.application.requestHash !== record.application.requestHash ||
      saved.active !== true
    ) {
      if (failure) throw failure;
      this.fail("CONFLICT");
    }
    return saved;
  },
  /**
   * Reads the same application's status after proof without resending or submitting.
   * @param {Object} context Server-admitted tenant, origin and trusted authorization.
   * @param {Object} session Mutable private continuation, never caller-supplied authority.
   * @returns {Promise<Object>} Safe progress without provisioning or another proof consumption.
   */
  status: async function (context, session) {
    this.assertVerified(context, session, false);
    const rows = [];
    for (const record of await this.base().assignments(
      context,
      session.email,
    )) {
      if (record.normalizedEmail !== session.email) this.fail("CONFLICT");
      rows.push(
        record.origin === "SELF_APPLICATION"
          ? await this.expire(context, record)
          : record,
      );
    }
    if (
      session.stage === ENUMS.ProfileEmployeeAccessStage.APPLICATION_DETAILS.key
    ) {
      await this.base().resolveVerified(context, session);
      return this.base().project(session);
    }
    const selected =
      session.applicationCode &&
      rows.find(
        (row) =>
          row.code === session.applicationCode &&
          row.origin === "SELF_APPLICATION" &&
          row.active === true,
      );
    if (session.applicationCode && !selected) this.fail("CONFLICT");
    if (
      selected?.status === ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key
    ) {
      session.stage = ENUMS.ProfileEmployeeAccessStage.SIGN_IN.key;
      return this.base().project(session);
    }
    if (
      selected &&
      ![
        ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
        ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
        ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
        "WITHDRAWN",
        "EXPIRED",
      ].includes(selected.status)
    )
      this.fail("CONFLICT");
    session.applications = rows
      .filter(
        (row) =>
          row.origin === "SELF_APPLICATION" &&
          [
            ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
            ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key,
            ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key,
            ENUMS.ProfileEmployeeApplicationStatus.REGISTERED.key,
            "WITHDRAWN",
            "EXPIRED",
          ].includes(row.status) &&
          row.normalizedEmail === session.email,
      )
      .flatMap((row) => this.projectHistory(row));
    if (session.applications.length > this.policy(false).maximumChoices * 20)
      this.fail("UNAVAILABLE");
    if (
      selected?.status === ENUMS.ProfileEmployeeApplicationStatus.APPROVED.key
    )
      session.stage = ENUMS.ProfileEmployeeAccessStage.APPLICATION_APPROVED.key;
    if (
      selected?.status === ENUMS.ProfileEmployeeApplicationStatus.REJECTED.key
    )
      session.stage = ENUMS.ProfileEmployeeAccessStage.APPLICATION_REJECTED.key;
    if (selected && ["WITHDRAWN", "EXPIRED"].includes(selected.status))
      session.stage = ENUMS.ProfileEmployeeAccessStage.APPLICATION_CLOSED.key;
    return this.base().project(session);
  },
  /**
   * Preserves application history when an administrator uses ordinary invitation preparation.
   * @param {string} enterpriseCode Scoped enterprise identity.
   * @param {string} email Canonical normalized mailbox.
   * @returns {Promise<void>} Resolves only when invitation preparation cannot overwrite application history.
   */
  assertNoApplication: async function (enterpriseCode, email) {
    const management = SERVICE.DefaultEnterpriseManagementService;
    const item = await this.base().read(
      "DefaultEnterpriseAccessAssignmentService",
      management.assignmentTenant(),
      {
        code: management.assignmentCode(enterpriseCode, email),
      },
    );
    if (item && (item.origin === "SELF_APPLICATION" || item.application))
      this.fail("CONFLICT");
  },
  /**
   * Restricts review visibility through existing permission resolution and enterprise context.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @param {string|undefined} requested Optional enterprise filter constrained by authenticated scope.
   * @returns {string|undefined} Authorized enterprise filter; undefined permits platform-wide scope.
   */
  reviewEnterprise: function (request, requested) {
    const auth = request.authData,
      permission = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      !auth ||
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      !(auth.loginId || auth.principalId) ||
      auth.isSystem ||
      !permission ||
      !permission.isPermissionGranted(
        this.policy(false).reviewPermission,
        permission.getGrantedPermissions(request),
        permission.getRouteActionAuthorizationConfig(),
      )
    )
      this.fail("ASSIGNMENT");
    const current = auth.entCode || auth.enterpriseCode;
    if (typeof current !== "string" || !current) this.fail("ASSIGNMENT");
    if (
      requested !== undefined &&
      (typeof requested !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(requested))
    )
      this.fail("INPUT");
    const platform =
      SERVICE.DefaultEnterpriseManagementService.isPlatformAdministrator(auth);
    if (!platform && requested && requested !== current)
      this.fail("ASSIGNMENT");
    return platform ? requested : current;
  },
  /**
   * Lists saved pending requests, not Process tasks or approved memberships.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @returns {Promise<Object>} Bounded pending page with allowlisted applicant details.
   */
  search: async function (request) {
    const input = request.query || {},
      management = SERVICE.DefaultEnterpriseManagementService,
      p = this.policy(false);
    this.base().input(input, ["enterpriseCode", "page", "limit"]);
    const enterpriseCode = this.reviewEnterprise(request, input.enterpriseCode);
    const page = management.boundedInteger(input.page, 1, 10000, "page");
    const limit = management.boundedInteger(
      input.limit,
      p.pageSize,
      100,
      "limit",
    );
    const query = {
      origin: "SELF_APPLICATION",
      status: ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key,
      active: true,
    };
    if (enterpriseCode) query.enterpriseCode = enterpriseCode;
    const rows = this.base().rows(
      await SERVICE.DefaultEnterpriseAccessAssignmentService.get({
        tenant: management.assignmentTenant(),
        authData: request.authData,
        query,
        options: { recursive: false, skipItemCache: true },
        searchOptions: {
          pageSize: limit,
          pageNumber: page,
          sort: { created: -1, code: 1 },
        },
      }),
    );
    if (
      rows.length > limit ||
      new Set(rows.map((row) => row.code)).size !== rows.length ||
      rows.some(
        (row) =>
          row.origin !== "SELF_APPLICATION" ||
          row.status !==
            ENUMS.ProfileEmployeeApplicationStatus.AWAITING_REVIEW.key ||
          row.active !== true ||
          (enterpriseCode && row.enterpriseCode !== enterpriseCode),
      )
    )
      this.fail("CONFLICT");
    const current = [];
    for (const row of rows) {
      const fresh = await this.expire(
        {
          tenant: management.assignmentTenant(),
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        },
        row,
      );
      if (fresh.status === "AWAITING_REVIEW") current.push(fresh);
    }
    return {
      page,
      limit,
      count: current.length,
      items: current.map((row) => ({
        ...this.projectRecord(row),
        email: row.email,
        name: row.application.firstName + " " + row.application.lastName,
        note: row.application.note,
      })),
    };
  },
};
