/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const retirementWrites = new WeakSet();

/**
 * @module nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService
 * @description Owns backend runtime lifecycle for starting published process definitions, generating human tasks, moving instances, and writing audit evidence.
 * @layer service
 * @owner workflow
 * @override Customer process overlays may override focused runtime methods for domain policy, assignment, SLA, tenant redaction, or execution providers without moving runtime truth into Axis.
 */
module.exports = {
  /** Admits this owner's exact retirement write at generated hooks. @param {Object} service Existing generated owner. @param {Object} request Exact CAS request. @returns {Promise<Object>} Generated envelope with transient private admission. */
  writeRetirement: async function (service, request) {
    retirementWrites.add(request);
    try {
      return await service.update(request);
    } finally {
      retirementWrites.delete(request);
    }
  },
  /**
   * Protects private retirement evidence and retired records from generic mutation.
   * @param {Object} request Generated pre-mutation context.
   * @param {Object} service Fixed generated owner selected by its interceptor.
   * @returns {Promise<boolean>} Ordinary bounded writes pass; retirement evidence is owner-only.
   * @throws {CLASSES.NodicsError} Forged markers, unbounded selectors or uncertain records.
   */
  protectRetirement: async function (request, service) {
    if (retirementWrites.has(request)) return true;
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_PROCESS_00028");
    };
    if (/\bdomainRetirement\b/.test(JSON.stringify(request.model || {})))
      fail();
    const models = Array.isArray(request.model)
      ? request.model
      : [request.model || {}];
    // Identity rewrites and upserts can evade a pre-read and the atomic retirement fence.
    if (
      request.options?.upsert === true ||
      request.upsert === true ||
      (Array.isArray(request.model) &&
        models.some((model) =>
          Object.keys(model || {}).some((key) => key.startsWith("$")),
        )) ||
      models.some((model) =>
        Object.entries(model || {}).some(
          ([operator, fields]) =>
            operator === "$rename" ||
            (operator.startsWith("$") &&
              ![
                "$set",
                "$unset",
                "$inc",
                "$mul",
                "$min",
                "$max",
                "$push",
                "$pop",
                "$pull",
                "$pullAll",
                "$addToSet",
                "$currentDate",
                "$bit",
              ].includes(operator)) ||
            (operator.startsWith("$") &&
              fields &&
              Object.keys(fields).some((key) =>
                [
                  "code",
                  "instanceCode",
                  "nodeCode",
                  "definitionCode",
                  "version",
                ].includes(key.split(".")[0]),
              )),
        ),
      )
    )
      fail();
    const codes = models.map((model) => model?.code).filter(Boolean);
    if (
      request.query &&
      Object.keys(request.query).length &&
      codes.length &&
      (codes.length !== 1 ||
        Object.keys(request.query).length !== 1 ||
        request.query.code !== codes[0])
    )
      fail();
    const query =
      request.query && Object.keys(request.query).length
        ? request.query
        : codes.length
          ? { code: { $in: codes } }
          : undefined;
    if (!query || codes.length > 100) fail();
    const response = await service.get(
      this.serviceRequest(request, {
        query,
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 101, pageNumber: 1 },
      }),
    );
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.error ||
      response.success === false ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Array.isArray(response.result) ||
      response.result.length > 100 ||
      response.result.some((row) => row.domainRetirement)
    )
      fail();
    request.query = { ...query, domainRetirement: { $exists: false } };
    return true;
  },
  /** Guards generic task persistence. @param {Object} request Generated mutation. @returns {Promise<boolean>} Private retirement admission. */
  protectTaskRetirement: function (request) {
    return this.protectRetirement(request, this.taskService());
  },
  /** Guards generic instance persistence. @param {Object} request Generated mutation. @returns {Promise<boolean>} Private retirement admission. */
  protectInstanceRetirement: function (request) {
    return this.protectRetirement(request, this.instanceService());
  },
  /**
   * Resolves tenant from the Nodics request context.
   *
   * @param {Object} request Nodics request context.
   * @returns {string} Tenant code.
   */
  getTenant: function (request) {
    return (
      (request && request.tenant) || CONFIG.get("defaultTenant") || "default"
    );
  },

  /**
   * Resolves the actor used for runtime audit events.
   *
   * @param {Object} request Nodics request context.
   * @returns {string|undefined} Actor identifier.
   */
  getActor: function (request) {
    let auth = (request && request.authData) || {};
    return auth.loginId || auth.serviceId || auth.code || auth.userId;
  },

  /**
   * Returns a request body/model without binding the service to HTTP.
   *
   * @param {Object} request Nodics request context.
   * @returns {Object} Body model.
   */
  bodyOf: function (request) {
    return (
      (request &&
        (request.runtimeOperation || request.model || request.body)) ||
      {}
    );
  },

  /**
   * Builds a generated-service request preserving tenant and auth data.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} additions Generated-service request additions.
   * @returns {Object} Generated-service request.
   */
  serviceRequest: function (request, additions) {
    return Object.assign(
      {
        tenant: this.getTenant(request),
        authData: request && request.authData,
        options: { recursive: false },
      },
      additions || {},
    );
  },

  /** @returns {Object} Generated definition service. */
  definitionService: function () {
    return SERVICE.DefaultProcessDefinitionService;
  },
  /** @returns {Object} Generated definition-version service. */
  versionService: function () {
    return SERVICE.DefaultProcessDefinitionVersionService;
  },
  /** @returns {Object} Generated instance service. */
  instanceService: function () {
    return SERVICE.DefaultProcessInstanceService;
  },
  /** @returns {Object} Generated task service. */
  taskService: function () {
    return SERVICE.DefaultProcessTaskService;
  },
  /** @returns {Object} Generated recovery-incident service. */
  incidentService: function () {
    return SERVICE.DefaultProcessIncidentService;
  },
  /** @returns {Object} Generated audit service. */
  auditService: function () {
    return SERVICE.DefaultProcessAuditEventService;
  },
  /** @returns {Object|undefined} Generated trigger service when the schema is available. */
  triggerService: function () {
    return SERVICE.DefaultProcessTriggerService;
  },
  /** @returns {Object|undefined} Process action adapter registry service. */
  actionAdapterRegistryService: function () {
    return SERVICE.DefaultProcessActionAdapterRegistryService;
  },

  /**
   * Resolves a bounded retry policy from the ACTION node and merged config.
   *
   * @param {Object} node ACTION node.
   * @returns {Object} Retry policy.
   */
  retryPolicy: function (node) {
    let configured = ((CONFIG.get("process") || {}).runtime || {}).retry || {};
    let declared = (node && node.retry) || {};
    let maximumAttempts = Number(
      declared.maximumAttempts || configured.maximumAttempts || 3,
    );
    let delayMs = Number(declared.delayMs || configured.delayMs || 0);
    return {
      maximumAttempts: Math.max(
        1,
        Math.min(
          Number.isFinite(maximumAttempts) ? Math.floor(maximumAttempts) : 3,
          10,
        ),
      ),
      delayMs: Math.max(
        0,
        Math.min(Number.isFinite(delayMs) ? Math.floor(delayMs) : 0, 86400000),
      ),
    };
  },

  /**
   * Lists lifecycle states allowed for Process-owned trigger metadata.
   *
   * @returns {string[]} Supported trigger states.
   */
  triggerStatuses: function () {
    return ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"];
  },

  /**
   * Validates a Process trigger lifecycle state.
   *
   * @param {*} status Candidate trigger status.
   * @returns {string} Valid trigger status.
   * @throws {CLASSES.NodicsError} When the status is unsupported.
   */
  assertTriggerStatus: function (status) {
    if (!this.triggerStatuses().includes(status)) {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00015",
        "Process trigger status is invalid",
      );
    }
    return status;
  },

  /**
   * Validates a stable runtime code.
   *
   * @param {*} value Candidate code.
   * @returns {boolean} Whether the code is safe for runtime use.
   */
  isCode: function (value) {
    return (
      typeof value === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value)
    );
  },

  /**
   * Throws when a process runtime code is invalid.
   *
   * @param {*} code Candidate code.
   * @returns {string} Valid code.
   * @throws {CLASSES.NodicsError} When the code is invalid.
   */
  assertCode: function (code) {
    if (!this.isCode(code))
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00006",
        "Process runtime code is invalid",
      );
    return code;
  },

  /**
   * Generates a bounded runtime code when the caller did not provide one.
   *
   * @param {string} prefix Business-readable prefix.
   * @returns {string} Runtime code.
   */
  runtimeCode: function (prefix) {
    return (
      String(prefix || "process").slice(0, 48) +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  },

  /** Resolves policy attached to an immutable process version or task node. */
  policyOf: function (version, node) {
    return Object.assign(
      {},
      (version && version.policy) || {},
      (node && node.policy) || {},
    );
  },

  /** Builds task governance metadata from the immutable workflow policy. */
  taskGovernance: function (version, node, body) {
    let policy = this.policyOf(version, node);
    let now = body && body.now ? new Date(body.now) : new Date();
    let slaHours = Number(policy.slaHours || (node && node.slaHours) || 0);
    let dueAt =
      (body && body.dueAt) ||
      (node && node.dueAt) ||
      (slaHours > 0
        ? new Date(now.getTime() + Math.min(slaHours, 8760) * 3600000)
        : undefined);
    return {
      assignmentPolicy:
        policy.assignmentPolicy || (node && node.assignmentPolicy) || "QUEUE",
      escalationPolicy:
        policy.escalationPolicy || (node && node.escalationPolicy) || {},
      approvalPolicy: {
        requiredApprovals: Math.max(
          1,
          Math.min(Number(policy.requiredApprovals || 1), 25),
        ),
        emergencyOverridePermission: policy.emergencyOverridePermission,
        requireReasonOnReject: policy.requireReasonOnReject === true,
      },
      dueAt: dueAt,
    };
  },

  /** Validates the published actor-policy shape without granting actor authority. @param {Object} configured Pinned policy descriptor. @returns {Object} Valid descriptor. */
  assertTaskActorPolicyDefinition: function (configured) {
    if (
      !configured ||
      typeof configured !== "object" ||
      Array.isArray(configured) ||
      Object.keys(configured).length !== 3 ||
      Object.keys(configured).some(
        (key) =>
          ![
            "permission",
            "enterpriseContextField",
            "requesterContextField",
          ].includes(key),
      ) ||
      typeof configured.permission !== "string" ||
      !configured.permission ||
      !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(
        configured.enterpriseContextField || "",
      ) ||
      !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(
        configured.requesterContextField || "",
      )
    )
      throw new CLASSES.NodicsError("ERR_PROCESS_00029");
    return configured;
  },

  /** Validates an owner-declared approval presentation without granting actor authority. @param {Object} contract Pinned policy descriptor. @returns {Object} Detached exact public contract. */
  assertTaskDecisionContract: function (contract) {
    const keys = [
      "contractVersion",
      "kind",
      "approveLabel",
      "rejectLabel",
      "reasonLabel",
      "rejectionReasonRequired",
      "maximumReasonLength",
    ];
    if (
      !contract ||
      typeof contract !== "object" ||
      Array.isArray(contract) ||
      Object.keys(contract).length !== keys.length ||
      Object.keys(contract).some((key) => !keys.includes(key)) ||
      contract.contractVersion !== 1 ||
      contract.kind !== "APPROVAL" ||
      contract.rejectionReasonRequired !== true ||
      contract.maximumReasonLength !== 1000 ||
      ["approveLabel", "rejectLabel", "reasonLabel"].some(
        (key) =>
          typeof contract[key] !== "string" ||
          !contract[key].trim() ||
          contract[key].length > 200,
      )
    )
      throw new CLASSES.NodicsError("ERR_PROCESS_00029");
    return Object.fromEntries(keys.map((key) => [key, contract[key]]));
  },

  /** Describes approval declared by the pinned actor or decision policy, without authorizing completion. @param {Object} policy Effective immutable task policy. @returns {Object|undefined} Content-free decision contract; undeclared legacy policies remain unchanged. */
  taskDecisionContract: function (policy) {
    if (policy.actorPolicy !== undefined)
      this.assertTaskActorPolicyDefinition(policy.actorPolicy);
    if (policy.decisionContract !== undefined)
      return this.assertTaskDecisionContract(policy.decisionContract);
    if (policy.actorPolicy === undefined) return undefined;
    return {
      contractVersion: 1,
      kind: "APPROVAL",
      approveLabel: "Approve",
      rejectLabel: "Reject",
      reasonLabel: "Reason",
      rejectionReasonRequired: true,
      maximumReasonLength: 1000,
    };
  },

  /** Projects tasks using fresh stored instance bindings and immutable versions, never persisted or caller-supplied decision contracts. @param {Object} request Authorized read context. @param {Object[]} tasks Owner-read task records. @returns {Promise<Object[]>} Detached task projections. */
  projectTaskDecisions: async function (request, tasks) {
    if (!Array.isArray(tasks) || tasks.length > 100)
      throw new CLASSES.NodicsError("ERR_PROCESS_00028");
    const instances = new Map(),
      versions = new Map();
    const projected = [];
    for (const task of tasks) {
      if (!task || typeof task !== "object" || Array.isArray(task))
        throw new CLASSES.NodicsError("ERR_PROCESS_00028");
      const instanceCode = this.assertCode(task.instanceCode);
      if (!instances.has(instanceCode))
        instances.set(
          instanceCode,
          await this.readOwnedStartRecord(request, this.instanceService(), {
            code: instanceCode,
          }),
        );
      const instance = instances.get(instanceCode);
      if (
        instance.code !== instanceCode ||
        !Number.isSafeInteger(instance.version) ||
        instance.version < 1
      )
        throw new CLASSES.NodicsError("ERR_PROCESS_00028");
      const definitionCode = this.assertCode(instance.definitionCode);
      const key = JSON.stringify([definitionCode, instance.version]);
      if (!versions.has(key))
        versions.set(
          key,
          await this.readOwnedStartRecord(request, this.versionService(), {
            definitionCode,
            version: instance.version,
          }),
        );
      const version = versions.get(key);
      if (
        version.definitionCode !== definitionCode ||
        version.version !== instance.version ||
        version.status !== "PUBLISHED"
      )
        throw new CLASSES.NodicsError("ERR_PROCESS_00028");
      const nodes = (version.graph && version.graph.nodes) || [];
      const matches = Array.isArray(nodes)
        ? nodes.filter((node) => node && node.code === task.nodeCode)
        : [];
      if (matches.length !== 1 || matches[0].type !== "TASK")
        throw new CLASSES.NodicsError("ERR_PROCESS_00028");
      const result = Object.assign({}, task);
      delete result.decisionContract;
      delete result.reviewerEligibility;
      delete result.reviewContext;
      const policy = this.policyOf(version, matches[0]);
      const contract = this.taskDecisionContract(policy);
      if (contract) result.decisionContract = contract;
      if (policy.actorPolicy !== undefined) {
        let eligibility = this.taskReviewerEligibility(
          request,
          instance,
          policy,
        );
        if (!["OPEN", "CLAIMED", "ESCALATED"].includes(task.status))
          eligibility = {
            eligible: false,
            reasonCode: "TASK_NOT_ACTIONABLE",
            message: "This task is no longer awaiting a decision.",
          };
        else if (!["RUNNING", "WAITING"].includes(instance.status))
          eligibility = {
            eligible: false,
            reasonCode: "INSTANCE_NOT_ACTIONABLE",
            message:
              "This process instance is not awaiting an actionable decision.",
          };
        result.reviewerEligibility = eligibility;
      }
      const reviewContext = this.taskReviewContext(instance, version);
      if (contract && reviewContext) result.reviewContext = reviewContext;
      projected.push(result);
    }
    return projected;
  },

  /**
   * Projects pinned publication identity without private context or inferred numeric versions.
   * @param {Object} instance Fresh stored Process instance.
   * @param {Object} version Exact published definition version.
   * @returns {Object|undefined} Bounded review identity when its owner action matches.
   */
  taskReviewContext: function (instance, version) {
    const context = instance.context || {};
    const text = (value) =>
      typeof value === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
    const nodes = version.graph && version.graph.nodes;
    if (
      !text(context.ownerModule) ||
      context.definitionCode !== instance.definitionCode ||
      context.workflowRef !== instance.code ||
      !["publicationCode", "rootType", "rootCode", "sourceVersion"].every(
        (key) => text(context[key]),
      ) ||
      !Array.isArray(nodes) ||
      nodes.filter(
        (node) =>
          node.type === "ACTION" &&
          node.action &&
          node.action.moduleName === context.ownerModule &&
          node.action.operation === "applyPublicationDecision" &&
          context.actionKey ===
            context.ownerModule + ".applyPublicationDecision",
      ).length !== 1
    )
      return undefined;
    return {
      contractVersion: 1,
      owner: context.ownerModule,
      publicationCode: context.publicationCode,
      rootType: context.rootType,
      rootCode: context.rootCode,
      sourceVersion: context.sourceVersion,
    };
  },

  /**
   * Uses completion actor admission for advisory display, never decision authority.
   * @param {Object} request Current authenticated read context.
   * @param {Object} instance Fresh stored Process instance.
   * @param {Object} policy Effective pinned task policy.
   * @returns {Object} Safe current reviewer eligibility and reason.
   */
  taskReviewerEligibility: function (request, instance, policy) {
    this.assertTaskActorPolicyDefinition(policy.actorPolicy);
    try {
      this.assertTaskActor(request, instance, policy);
      return {
        eligible: true,
        reasonCode: "ELIGIBLE",
        message:
          "Reviewer identity checks passed; completion is rechecked on submission.",
      };
    } catch (_) {
      const auth = request.authData || {},
        context = instance.context || {};
      const requester = context[policy.actorPolicy.requesterContextField];
      const sameRequester =
        auth.tokenType === "access" &&
        auth.principalType === "human" &&
        !auth.isSystem &&
        auth.tenant === request.tenant &&
        auth.entCode === context[policy.actorPolicy.enterpriseContextField] &&
        typeof auth.loginId === "string" &&
        typeof requester === "string" &&
        requester.trim() &&
        auth.loginId.trim().toLowerCase() === requester.trim().toLowerCase();
      return sameRequester
        ? {
            eligible: false,
            reasonCode: "DIFFERENT_REVIEWER_REQUIRED",
            message:
              "A different authorised reviewer is required; the requester cannot review this publication.",
          }
        : {
            eligible: false,
            reasonCode: "REVIEWER_NOT_AUTHORISED",
            message:
              "Your current reviewer identity or permission is not authorised for this task.",
          };
    }
  },

  /**
   * Enforces an immutable definition's optional, strict human-review policy.
   * @param {Object} request Authenticated task-completion context, not callback input.
   * @param {Object} instance Persisted Process instance.
   * @param {Object} policy Published task policy; actorPolicy names direct context fields.
   * @returns {void} No writes; throws before task completion for invalid authority.
   * @override Alternative actor policy must retain no-self-review and enterprise isolation.
   */
  assertTaskActor: function (request, instance, policy) {
    const configured = policy.actorPolicy;
    if (configured === undefined) return;
    const auth = request.authData || {},
      permissions = SERVICE.DefaultSecuredRequestPipelineService;
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_PROCESS_00029");
    };
    this.assertTaskActorPolicyDefinition(configured);
    const context = instance.context || {},
      requester = context[configured.requesterContextField];
    if (
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.isSystem ||
      typeof auth.loginId !== "string" ||
      !auth.loginId ||
      !request.tenant ||
      auth.tenant !== request.tenant ||
      typeof auth.entCode !== "string" ||
      !auth.entCode ||
      auth.entCode !== context[configured.enterpriseContextField] ||
      typeof requester !== "string" ||
      !requester ||
      auth.loginId.trim().toLowerCase() === requester.trim().toLowerCase() ||
      !permissions ||
      !permissions.isPermissionGranted(
        configured.permission,
        permissions.getGrantedPermissions(request),
        permissions.getRouteActionAuthorizationConfig(),
      )
    )
      fail();
  },
  /** Validates decision shape after the same published actor admission used by task claim. */
  assertTaskActorPolicy: function (request, instance, policy, decision) {
    this.assertTaskActor(request, instance, policy);
    if (!this.taskDecisionContract(policy)) return;
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_PROCESS_00029");
    };
    if (
      !decision ||
      typeof decision !== "object" ||
      Array.isArray(decision) ||
      typeof decision.approved !== "boolean" ||
      Object.keys(decision).some(
        (key) => !["approved", "reason"].includes(key),
      ) ||
      (decision.reason !== undefined &&
        (typeof decision.reason !== "string" ||
          decision.reason.length > 1000)) ||
      (decision.approved === false && !decision.reason?.trim())
    )
      fail();
  },

  /** Enforces approval-task policy before a human task can advance. */
  assertTaskCompletionPolicy: function (
    request,
    task,
    instance,
    version,
    node,
    body,
  ) {
    let actor = this.getActor(request);
    const pinnedPolicy = this.policyOf(version, node);
    let policy = Object.assign({}, pinnedPolicy, task.approvalPolicy || {}, {
      decisionContract: pinnedPolicy.decisionContract,
    });
    let decision = (body && body.decision) || {};
    this.assertTaskActorPolicy(request, instance, policy, decision);
    let override = decision.emergencyOverride === true;
    if (override && !policy.emergencyOverridePermission) {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Emergency override is not allowed for this task",
      );
    }
    if (override && policy.emergencyOverridePermission) {
      let permissions = [].concat(
        (request && request.authData && request.authData.permissions) || [],
      );
      if (!permissions.includes(policy.emergencyOverridePermission)) {
        throw new CLASSES.NodicsError(
          "ERR_PROCESS_00012",
          "Emergency override permission is required for this task",
        );
      }
    }
    if (
      decision.approved === false &&
      policy.requireReasonOnReject === true &&
      !decision.reason
    ) {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Approval rejection requires a reason",
      );
    }
    let approvals = [].concat(decision.approvals || []).filter(Boolean);
    let requiredApprovals = Math.max(
      1,
      Math.min(Number(policy.requiredApprovals || 1), 25),
    );
    if (
      !override &&
      requiredApprovals > 1 &&
      approvals.length < requiredApprovals
    ) {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Workflow task requires multiple approvals",
      );
    }
    return {
      actor: actor,
      override: override,
      requiredApprovals: requiredApprovals,
      approvals: approvals.length,
    };
  },

  /**
   * Loads a process definition aggregate.
   *
   * @param {Object} request Nodics request context.
   * @param {string} definitionCode Definition code.
   * @returns {Promise<Object>} Process definition.
   */
  requireDefinition: async function (request, definitionCode) {
    let response = await this.definitionService().get(
      this.serviceRequest(request, {
        query: { code: this.assertCode(definitionCode) },
        searchOptions: { limit: 1 },
      }),
    );
    let definition = response && response.result && response.result[0];
    if (!definition)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00002",
        "Process definition was not found",
      );
    return definition;
  },

  /**
   * Loads Process-owned trigger metadata.
   *
   * @param {Object} request Nodics request context.
   * @param {string} triggerCode Trigger code.
   * @returns {Promise<Object>} Trigger metadata.
   */
  requireTrigger: async function (request, triggerCode) {
    if (!this.triggerService())
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00014",
        "Process trigger service is unavailable",
      );
    let response = await this.triggerService().get(
      this.serviceRequest(request, {
        query: { code: this.assertCode(triggerCode) },
        searchOptions: { limit: 1 },
      }),
    );
    let trigger = response && response.result && response.result[0];
    if (!trigger)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00016",
        "Process trigger was not found",
      );
    return trigger;
  },

  /**
   * Loads an immutable published version.
   *
   * @param {Object} request Nodics request context.
   * @param {string} definitionCode Definition code.
   * @param {number} version Version number.
   * @returns {Promise<Object>} Published version.
   */
  requireVersion: async function (request, definitionCode, version) {
    let response = await this.versionService().get(
      this.serviceRequest(request, {
        query: {
          definitionCode: this.assertCode(definitionCode),
          version: Number(version),
        },
        searchOptions: { limit: 1 },
      }),
    );
    let processVersion = response && response.result && response.result[0];
    if (!processVersion || processVersion.status !== "PUBLISHED") {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00011",
        "Process definition is not published for runtime start",
      );
    }
    return processVersion;
  },

  /**
   * Resolves the published version used by a runtime request.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} body Runtime operation body.
   * @returns {Promise<Object>} Published version.
   */
  resolveStartVersion: async function (request, body) {
    let definitionCode = body.definitionCode || request.definitionCode;
    let definition = await this.requireDefinition(request, definitionCode);
    let version = Number(
      body.version || request.version || definition.currentVersion || 0,
    );
    if (definition.status !== "PUBLISHED" || version < 1) {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00011",
        "Process definition is not published for runtime start",
      );
    }
    return this.requireVersion(request, definition.code, version);
  },

  /**
   * Finds a node in a published process graph.
   *
   * @param {Object} graph Published graph.
   * @param {string} nodeCode Node code.
   * @returns {Object|undefined} Matching node.
   */
  findNode: function (graph, nodeCode) {
    return (graph.nodes || []).find((node) => node && node.code === nodeCode);
  },

  /**
   * Finds all outgoing transitions for a source node.
   *
   * @param {Object} graph Published graph.
   * @param {string} sourceNodeCode Source node code.
   * @returns {Object[]} Outgoing transitions.
   */
  outgoingTransitions: function (graph, sourceNodeCode) {
    return (graph.transitions || []).filter(
      (item) => item && item.source === sourceNodeCode,
    );
  },

  /**
   * Resolves the next transition for a runtime node. DECISION nodes can use a
   * selected transition code, target node code, or a simple equals condition
   * against the completion decision/context before falling back to the default
   * transition.
   *
   * @param {Object} graph Published graph.
   * @param {string} sourceNodeCode Source node code.
   * @param {Object} body Runtime request body.
   * @returns {Object|undefined} Selected transition.
   */
  resolveTransition: function (graph, sourceNodeCode, body) {
    let transitions = this.outgoingTransitions(graph, sourceNodeCode);
    let decision = (body && body.decision) || {};
    if (decision.transitionCode) {
      return transitions.find(
        (transition) => transition.code === decision.transitionCode,
      );
    }
    if (decision.targetNodeCode) {
      return transitions.find(
        (transition) => transition.target === decision.targetNodeCode,
      );
    }
    let context = Object.assign({}, (body && body.context) || {}, decision);
    let matched = transitions.find((transition) => {
      let condition = transition.condition || {};
      if (!condition.field) return false;
      return context[condition.field] === condition.equals;
    });
    return (
      matched ||
      transitions.find((transition) => transition.default === true) ||
      transitions[0]
    );
  },

  /**
   * Finds the next transition target for a source node.
   *
   * @param {Object} graph Published graph.
   * @param {string} sourceNodeCode Source node code.
   * @param {Object} body Runtime request body.
   * @returns {Object|undefined} Next target node.
   */
  nextNode: function (graph, sourceNodeCode, body) {
    let transition = this.resolveTransition(graph, sourceNodeCode, body || {});
    return transition ? this.findNode(graph, transition.target) : undefined;
  },

  /**
   * Resolves the first executable node after START.
   *
   * @param {Object} graph Published graph.
   * @returns {Object|undefined} First runtime node.
   */
  firstRuntimeNode: function (graph) {
    let startNode = (graph.nodes || []).find(
      (node) => node && node.type === "START",
    );
    return startNode ? this.nextNode(graph, startNode.code) : undefined;
  },

  /**
   * Creates an audit event with bounded metadata.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} model Audit model.
   * @returns {Promise<Object>} Saved audit model.
   */
  audit: async function (request, model) {
    let auditModel = Object.assign(
      {
        active: true,
        actor: this.getActor(request),
        outcome: "success",
      },
      model || {},
    );
    let response = await this.auditService().save(
      this.serviceRequest(request, { model: auditModel }),
    );
    return response.result || response;
  },

  /**
   * Creates an OPEN human task for the current instance node.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} instance Process instance.
   * @param {Object} node Task node.
   * @param {Object} body Runtime request body.
   * @returns {Promise<Object>} Saved task.
   */
  createTaskForNode: async function (request, instance, node, body, version) {
    let governance = this.taskGovernance(version, node, body || {});
    let taskModel = {
      code: body.taskCode || this.runtimeCode(instance.code + "-" + node.code),
      active: true,
      name: node.name || node.code,
      instanceCode: instance.code,
      nodeCode: node.code,
      assignee:
        body.assignee ||
        node.assignee ||
        (node.assignment && node.assignment.assignee),
      status: "OPEN",
      dueAt: governance.dueAt,
      assignmentPolicy: governance.assignmentPolicy,
      escalationPolicy: governance.escalationPolicy,
      approvalPolicy: governance.approvalPolicy,
    };
    let response = await this.taskService().save(
      this.serviceRequest(request, { model: taskModel }),
    );
    await this.audit(request, {
      definitionCode: instance.definitionCode,
      instanceCode: instance.code,
      eventType: "process.task.created",
      metadata: {
        taskCode: taskModel.code,
        nodeCode: node.code,
        assignee: taskModel.assignee,
        assignmentPolicy: taskModel.assignmentPolicy,
        escalationPolicy: taskModel.escalationPolicy,
        dueAt: taskModel.dueAt,
        approvalPolicy: taskModel.approvalPolicy,
      },
    });
    return response.result || response;
  },

  /**
   * Records that the runtime entered a backend-supported graph node.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} instance Process instance.
   * @param {Object} version Published definition version.
   * @param {Object} node Runtime node.
   * @param {Object} [metadata] Additional bounded metadata.
   * @returns {Promise<Object>} Saved audit event.
   */
  auditNodeEntered: async function (
    request,
    instance,
    version,
    node,
    metadata,
  ) {
    return this.audit(request, {
      definitionCode: instance.definitionCode,
      instanceCode: instance.code,
      eventType: "process.node.entered",
      metadata: Object.assign(
        {
          version: version.version,
          nodeCode: node && node.code,
          nodeType: node && node.type,
        },
        metadata || {},
      ),
    });
  },

  /**
   * Executes an ACTION node through the configured declarative adapter
   * registry and records the outcome.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} instance Process instance.
   * @param {Object} version Published definition version.
   * @param {Object} node ACTION node.
   * @param {Object} body Runtime request body.
   * @returns {Promise<Object>} Adapter execution summary.
   */
  executeActionNode: async function (request, instance, version, node, body) {
    let registry = this.actionAdapterRegistryService();
    if (!registry || typeof registry.execute !== "function") {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00019",
        "Process action adapter registry is unavailable",
      );
    }
    try {
      let result = await registry.execute(request, {
        instance: instance,
        version: version,
        node: node,
        context: instance.context || {},
        decision: (body && body.decision) || {},
        payload: (body && (body.actionPayload || body.payload)) || {},
      });
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.action.executed",
        metadata: {
          nodeCode: node.code,
          adapter:
            node.action && node.action.moduleName + "." + node.action.operation,
          status: result && result.status,
        },
      });
      return result;
    } catch (error) {
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.action.failed",
        outcome: "failure",
        metadata: {
          nodeCode: node.code,
          errorCode: error.code || "ERR_PROCESS_00019",
        },
      });
      throw error;
    }
  },

  /**
   * Fails an instance and creates a Process-owned recovery incident after an
   * ACTION adapter failure. Business compensation remains domain-owned.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} instance Process instance.
   * @param {Object} version Published process version.
   * @param {Object} node Failed ACTION node.
   * @param {Error} error Adapter failure.
   * @param {Object} body Runtime request body.
   * @returns {Promise<Object>} Created incident.
   */
  openIncident: async function (request, instance, version, node, error, body) {
    let policy = this.retryPolicy(node);
    let failedAt = new Date();
    let incident = {
      code: this.runtimeCode(instance.code + "-incident"),
      active: true,
      name: "Recovery incident for " + instance.code,
      instanceCode: instance.code,
      definitionCode: instance.definitionCode,
      version: instance.version,
      nodeCode: node.code,
      status: policy.maximumAttempts > 1 ? "OPEN" : "DEAD_LETTER",
      errorCode: error.code || "ERR_PROCESS_00019",
      attempt: 1,
      maximumAttempts: policy.maximumAttempts,
      nextRetryAt:
        policy.maximumAttempts > 1
          ? new Date(failedAt.getTime() + policy.delayMs)
          : undefined,
      adapter: node.action || {},
      compensationAdapter: node.compensation || {},
      correlationId: body && body.correlationId,
      evidence: { failureStage: "ACTION_EXECUTION" },
      lastErrorAt: failedAt,
    };
    let saved = await this.incidentService().save(
      this.serviceRequest(request, { model: incident }),
    );
    incident = saved.result || saved;
    await this.instanceService().update(
      this.serviceRequest(request, {
        query: { code: instance.code },
        model: {
          $set: {
            status: "FAILED",
            currentNode: node.code,
            incidentCode: incident.code,
            failureCode: incident.errorCode,
            compensationStatus: node.compensation ? "PENDING" : "NONE",
          },
        },
      }),
    );
    await this.audit(request, {
      definitionCode: instance.definitionCode,
      instanceCode: instance.code,
      eventType: "process.incident.opened",
      outcome: "failure",
      metadata: {
        incidentCode: incident.code,
        nodeCode: node.code,
        errorCode: incident.errorCode,
        maximumAttempts: incident.maximumAttempts,
      },
    });
    return incident;
  },

  /**
   * Moves an instance to the next backend-supported runtime node.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} instance Process instance.
   * @param {Object} version Published definition version.
   * @param {Object} node Target node.
   * @param {Object} body Runtime request body.
   * @returns {Promise<Object>} Updated runtime summary.
   */
  enterNode: async function (request, instance, version, node, body) {
    if (!node || node.type === "END") {
      let completedAt = new Date();
      await this.instanceService().update(
        this.serviceRequest(request, {
          query: { code: instance.code },
          model: {
            $set: {
              status: "COMPLETED",
              currentNode: (node && node.code) || instance.currentNode,
              completedAt: completedAt,
            },
          },
        }),
      );
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.instance.completed",
        metadata: {
          version: version.version,
          nodeCode: node && node.code,
        },
      });
      return {
        instance: Object.assign({}, instance, {
          status: "COMPLETED",
          currentNode: (node && node.code) || instance.currentNode,
          completedAt: completedAt,
        }),
      };
    }
    await this.auditNodeEntered(request, instance, version, node);
    if (node.type === "TASK") {
      await this.instanceService().update(
        this.serviceRequest(request, {
          query: { code: instance.code },
          model: {
            $set: { status: "WAITING", currentNode: node.code },
          },
        }),
      );
      let updatedInstance = Object.assign({}, instance, {
        status: "WAITING",
        currentNode: node.code,
      });
      let task = await this.createTaskForNode(
        request,
        updatedInstance,
        node,
        body || {},
        version,
      );
      return { instance: updatedInstance, task: task };
    }
    if (node.type === "DECISION") {
      let transition = this.resolveTransition(
        version.graph || {},
        node.code,
        body || {},
      );
      if (!transition)
        throw new CLASSES.NodicsError(
          "ERR_PROCESS_00021",
          "Process decision could not resolve a transition",
        );
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.decision.evaluated",
        metadata: {
          nodeCode: node.code,
          transitionCode: transition.code,
          targetNodeCode: transition.target,
        },
      });
      return this.enterNode(
        request,
        instance,
        version,
        this.findNode(version.graph || {}, transition.target),
        body,
      );
    }
    if (node.type === "ACTION") {
      try {
        await this.executeActionNode(
          request,
          instance,
          version,
          node,
          body || {},
        );
      } catch (error) {
        await this.openIncident(
          request,
          instance,
          version,
          node,
          error,
          body || {},
        );
        throw error;
      }
      return this.enterNode(
        request,
        instance,
        version,
        this.nextNode(version.graph || {}, node.code, body),
        body,
      );
    }
    if (node.type === "TIMER") {
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.timer.observed",
        metadata: { nodeCode: node.code, timer: node.timer || {} },
      });
      return this.enterNode(
        request,
        instance,
        version,
        this.nextNode(version.graph || {}, node.code, body),
        body,
      );
    }
    if (node.type === "SUB_PROCESS") {
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.subProcess.referenced",
        metadata: {
          nodeCode: node.code,
          definitionCode:
            node.subProcessDefinitionCode ||
            (node.subProcess && node.subProcess.definitionCode),
        },
      });
      return this.enterNode(
        request,
        instance,
        version,
        this.nextNode(version.graph || {}, node.code, body),
        body,
      );
    }
    throw new CLASSES.NodicsError(
      "ERR_PROCESS_00018",
      "Unsupported process runtime node type",
    );
  },

  /** Binds an instance start to immutable input, independent of JSON key order and later context updates. */
  startFingerprint: function (request, body, version) {
    const input = Object.assign({}, body);
    delete input.instanceCode;
    delete input.definitionCode;
    delete input.version;
    input.context = input.context || {};
    const auth = request.authData || {};
    const identity = {
      tenant: this.getTenant(request),
      enterprise: auth.entCode || auth.enterpriseCode || "",
      definitionCode: version.definitionCode,
      version: version.version,
      input,
    };
    const serialized = JSON.stringify(identity, (key, value) =>
      value && typeof value === "object" && !Array.isArray(value)
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((name) => [name, value[name]]),
          )
        : value,
    );
    return require("node:crypto")
      .createHash("sha256")
      .update(serialized)
      .digest("hex");
  },

  /** Returns only an exact completed-start replay; partial starts never execute again through the start endpoint. */
  replayStart: async function (request, body, instance) {
    if (
      instance.definitionCode !==
        (body.definitionCode || request.definitionCode) ||
      ((body.version || request.version) &&
        Number(body.version || request.version) !== instance.version) ||
      instance.startFingerprint !==
        this.startFingerprint(request, body, instance)
    ) {
      throw new CLASSES.NodicsError("ERR_PROCESS_00026");
    }
    if (instance.startCompleted !== true)
      throw new CLASSES.NodicsError("ERR_PROCESS_00027");
    return { code: "SUC_PROCESS_00000", data: { instance } };
  },

  /**
   * Reads exactly one successful published-owner record, bypassing item cache.
   * @param {Object} request Authorized service request retaining tenant and principal.
   * @param {Object} service Effective generated definition or version service.
   * @param {Object} query Exact owner-built definition/version identity.
   * @returns {Promise<Object>} One record; missing, ambiguous or failed reads reject.
   * @throws {CLASSES.NodicsError} ERR_PROCESS_00028 for invalid persistence evidence.
   */
  readOwnedStartRecord: async function (request, service, query) {
    const result = await service.get(
      this.serviceRequest(request, {
        query,
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 },
      }),
    );
    if (
      !result ||
      !/^SUC_/.test(result.code || "") ||
      result.success === false ||
      result.error ||
      (result.errors &&
        (!Array.isArray(result.errors) || result.errors.length)) ||
      !Array.isArray(result.result) ||
      result.result.length !== 1
    )
      throw new CLASSES.NodicsError("ERR_PROCESS_00028");
    return result.result[0];
  },

  /**
   * Starts an explicitly allowed published definition for its authorised service owner.
   * @param {Object} request Router-verified scoped service request; runtimeOperation
   * contains sourceModule, definitionCode, version, instanceCode and context only.
   * @returns {Promise<Object>} Existing Process start/replay result. This may write an
   * instance, task and audit through the existing lifecycle; it grants no domain access.
   * @throws {CLASSES.NodicsError} Missing policy, source authority or published evidence.
   * @override Narrow deployment selections without weakening source, version or scope checks.
   */
  startOwnedInstance: async function (request) {
    const policy = ((CONFIG.get("process") || {}).runtime || {}).internalStarts;
    const input = this.bodyOf(request);
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_PROCESS_00028");
    };
    if (
      !policy ||
      policy.enabled !== true ||
      !Array.isArray(policy.allowedDefinitions) ||
      typeof policy.permission !== "string" ||
      !policy.permission ||
      !Number.isSafeInteger(policy.maximumContextBytes) ||
      policy.maximumContextBytes < 1 ||
      policy.maximumContextBytes > 65536
    )
      fail();
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).length !== 5 ||
      Object.keys(input).some(
        (key) =>
          ![
            "sourceModule",
            "definitionCode",
            "version",
            "instanceCode",
            "context",
          ].includes(key),
      ) ||
      typeof input.sourceModule !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(input.sourceModule) ||
      !this.isCode(input.definitionCode) ||
      !this.isCode(input.instanceCode) ||
      !Number.isSafeInteger(input.version) ||
      input.version < 1 ||
      !policy.allowedDefinitions.includes(input.definitionCode)
    )
      fail();
    const authority = SERVICE.DefaultServiceTokenService;
    if (!authority || typeof authority.requireRuntimePrincipal !== "function")
      fail();
    const auth = authority.requireRuntimePrincipal(request, "workflow");
    authority.requireRuntimePrincipal(request, input.sourceModule);
    if (
      auth.principalType !== "service" ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes(policy.permission)
    )
      fail();
    const definition = await this.readOwnedStartRecord(
      request,
      this.definitionService(),
      { code: input.definitionCode },
    );
    const version = await this.readOwnedStartRecord(
      request,
      this.versionService(),
      { definitionCode: input.definitionCode, version: input.version },
    );
    if (
      definition.code !== input.definitionCode ||
      definition.ownerModule !== input.sourceModule ||
      definition.status !== "PUBLISHED" ||
      definition.active === false ||
      version.definitionCode !== input.definitionCode ||
      version.version !== input.version ||
      version.status !== "PUBLISHED" ||
      version.active === false
    )
      fail();
    const context = input.context,
      allowed = version.policy && version.policy.contextAllowlist;
    if (
      !context ||
      typeof context !== "object" ||
      Array.isArray(context) ||
      !Array.isArray(allowed) ||
      Object.keys(context).some((key) => !allowed.includes(key)) ||
      Buffer.byteLength(JSON.stringify(context), "utf8") >
        policy.maximumContextBytes ||
      (context.enterpriseCode !== undefined &&
        context.enterpriseCode !== auth.entCode)
    )
      fail();
    return this.startInstance({
      ...request,
      runtimeOperation: {
        definitionCode: input.definitionCode,
        version: input.version,
        instanceCode: input.instanceCode,
        context: JSON.parse(JSON.stringify(context)),
      },
    });
  },

  /**
   * Retires one waiting human review after its signed domain owner closes the source.
   * @param {Object} request Scoped service context with exact source, instance and closure identity.
   * @returns {Promise<Object>} Confirmed retirement or a competing decision requiring inspection.
   * @throws {CLASSES.NodicsError} Invalid ownership, ambiguous tasks or unconfirmed persistence.
   * @override Keep cancellation narrow; never substitute generic cancellation or steal remote actions.
   */
  retireOwnedReview: async function (request) {
    const input = this.bodyOf(request);
    const policy = ((CONFIG.get("process") || {}).runtime || {})
      .internalRetirements;
    const fail = () => {
      throw new CLASSES.NodicsError("ERR_PROCESS_00028");
    };
    const equal = require("node:util").isDeepStrictEqual;
    if (
      !policy ||
      policy.enabled !== true ||
      !Array.isArray(policy.allowedDefinitions) ||
      typeof policy.permission !== "string" ||
      !policy.permission ||
      !input ||
      Object.keys(input).length !== 4 ||
      Object.keys(input).some(
        (key) =>
          !["sourceModule", "instanceCode", "closureCode", "context"].includes(
            key,
          ),
      ) ||
      typeof input.sourceModule !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(input.sourceModule) ||
      !this.isCode(input.instanceCode) ||
      !this.isCode(input.closureCode) ||
      !input.context ||
      Array.isArray(input.context) ||
      typeof input.context !== "object" ||
      Object.keys(input.context).length > 64 ||
      Buffer.byteLength(JSON.stringify(input.context), "utf8") > 16384
    )
      fail();
    const authority = SERVICE.DefaultServiceTokenService;
    if (typeof authority?.requireRuntimePrincipal !== "function") fail();
    const auth = authority.requireRuntimePrincipal(request, "workflow");
    authority.requireRuntimePrincipal(request, input.sourceModule);
    if (
      auth.principalType !== "service" ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes(policy.permission)
    )
      fail();
    let instance = await this.readOwnedStartRecord(
      request,
      this.instanceService(),
      { code: input.instanceCode },
    );
    const definition = await this.readOwnedStartRecord(
      request,
      this.definitionService(),
      { code: instance.definitionCode },
    );
    const version = await this.readOwnedStartRecord(
      request,
      this.versionService(),
      {
        definitionCode: instance.definitionCode,
        version: instance.version,
      },
    );
    if (
      instance.code !== input.instanceCode ||
      instance.startCompleted !== true ||
      definition.code !== instance.definitionCode ||
      definition.ownerModule !== input.sourceModule ||
      !policy.allowedDefinitions.includes(instance.definitionCode) ||
      version.definitionCode !== instance.definitionCode ||
      version.version !== instance.version ||
      !equal(instance.context, input.context) ||
      input.context.enterpriseCode !== auth.entCode
    )
      fail();
    const evidence = {
      sourceModule: input.sourceModule,
      closureCode: input.closureCode,
    };
    let task = await this.readOwnedStartRecord(request, this.taskService(), {
      instanceCode: instance.code,
    });
    const taskNode = this.findNode(version.graph || {}, task.nodeCode);
    if (
      task.instanceCode !== instance.code ||
      !taskNode ||
      taskNode.type !== "TASK" ||
      !this.policyOf(version, taskNode).actorPolicy
    )
      fail();
    // A completed competing review remains read-only even after its instance advanced.
    if (
      task.status === "COMPLETED" &&
      !task.domainRetirement &&
      !instance.domainRetirement
    )
      return {
        code: "SUC_PROCESS_00000",
        data: { status: "DECISION_IN_PROGRESS", instanceCode: instance.code },
      };
    if (
      !["WAITING", "CANCELLED"].includes(instance.status) ||
      (instance.activeRemoteAction &&
        ["READY", "CLAIMED"].includes(instance.activeRemoteAction.status))
    )
      fail();
    const node = this.findNode(version.graph || {}, instance.currentNode);
    if (
      !node ||
      node.type !== "TASK" ||
      !this.policyOf(version, node).actorPolicy
    )
      fail();
    if (
      task.instanceCode !== instance.code ||
      task.nodeCode !== instance.currentNode
    )
      fail();
    if (
      instance.status === "CANCELLED" &&
      !equal(instance.domainRetirement, evidence)
    )
      fail();
    if (task.status !== "CANCELLED") {
      if (
        instance.status !== "WAITING" ||
        !["OPEN", "CLAIMED", "ESCALATED"].includes(task.status)
      )
        fail();
      try {
        const response = await this.writeRetirement(
          this.taskService(),
          this.serviceRequest(request, {
            query: {
              code: task.code,
              instanceCode: task.instanceCode,
              nodeCode: task.nodeCode,
              status: task.status,
              domainRetirement: { $exists: false },
              assignee:
                task.assignee === undefined
                  ? { $exists: false }
                  : task.assignee,
            },
            model: {
              $set: {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancelledBy: this.getActor(request),
                domainRetirement: evidence,
              },
            },
          }),
        );
        this.assertTaskTransitionWrite(response);
      } catch (error) {
        const observed = await this.readTaskTransition(request, task.code);
        if (observed.status === "COMPLETED")
          return {
            code: "SUC_PROCESS_00000",
            data: {
              status: "DECISION_IN_PROGRESS",
              instanceCode: instance.code,
            },
          };
        if (
          observed.status !== "CANCELLED" ||
          !equal(observed.domainRetirement, evidence)
        )
          throw error;
      }
      task = await this.readTaskTransition(request, task.code);
    }
    if (
      task.status !== "CANCELLED" ||
      !equal(task.domainRetirement, evidence) ||
      task.instanceCode !== instance.code ||
      task.nodeCode !== instance.currentNode
    )
      fail();
    if (instance.status !== "CANCELLED") {
      try {
        const response = await this.writeRetirement(
          this.instanceService(),
          this.serviceRequest(request, {
            query: {
              code: instance.code,
              definitionCode: instance.definitionCode,
              version: instance.version,
              startCompleted: true,
              domainRetirement: { $exists: false },
              status: "WAITING",
              currentNode: instance.currentNode,
              context: instance.context,
              activeRemoteAction:
                instance.activeRemoteAction === undefined
                  ? { $exists: false }
                  : instance.activeRemoteAction,
            },
            model: {
              $set: {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancelledBy: this.getActor(request),
                domainRetirement: evidence,
              },
            },
          }),
        );
        this.assertTaskTransitionWrite(response);
      } catch (error) {
        const observed = await this.readOwnedStartRecord(
          request,
          this.instanceService(),
          { code: instance.code },
        );
        if (
          observed.status !== "CANCELLED" ||
          !equal(observed.domainRetirement, evidence)
        )
          throw error;
      }
      instance = await this.readOwnedStartRecord(
        request,
        this.instanceService(),
        { code: instance.code },
      );
    }
    if (
      instance.status !== "CANCELLED" ||
      !equal(instance.domainRetirement, evidence) ||
      !equal(instance.context, input.context) ||
      instance.definitionCode !== definition.code ||
      instance.version !== version.version ||
      instance.startCompleted !== true ||
      instance.currentNode !== task.nodeCode
    )
      fail();
    return {
      code: "SUC_PROCESS_00000",
      data: {
        status: "RETIRED",
        instanceCode: instance.code,
        taskCode: task.code,
      },
    };
  },

  /**
   * Starts a published process definition once and creates the first task when needed.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Started instance and first task summary.
   */
  startInstance: async function (request) {
    const admission = SERVICE.DefaultModuleRegistrationAgentService;
    if (!admission || typeof admission.assertModuleOperational !== "function") {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00018",
        "Process operational authority is unavailable",
      );
    }
    await admission.assertModuleOperational(
      "workflow",
      this.getTenant(request),
    );
    let body = this.bodyOf(request);
    if (body.instanceCode !== undefined) {
      this.assertCode(body.instanceCode);
      const found = await this.instanceService().get(
        this.serviceRequest(request, {
          query: { code: body.instanceCode },
          searchOptions: { limit: 1 },
        }),
      );
      if (found && found.result && found.result[0])
        return this.replayStart(request, body, found.result[0]);
    }
    let version = await this.resolveStartVersion(request, body);
    let instanceModel = {
      code: body.instanceCode || this.runtimeCode(version.definitionCode),
      active: true,
      name: body.name || version.name || version.definitionCode,
      definitionCode: version.definitionCode,
      version: version.version,
      status: "RUNNING",
      context: body.context || {},
      currentNode: "start",
      startedAt: new Date(),
      startFingerprint: this.startFingerprint(request, body, version),
      startCompleted: false,
    };
    let saved;
    try {
      // No query: generated persistence inserts under the existing unique primary key, never upserts.
      saved = await this.instanceService().save(
        this.serviceRequest(request, { model: instanceModel }),
      );
    } catch (error) {
      const found = await this.instanceService().get(
        this.serviceRequest(request, {
          query: { code: instanceModel.code },
          searchOptions: { limit: 1 },
        }),
      );
      if (found && found.result && found.result[0])
        return this.replayStart(request, body, found.result[0]);
      throw error;
    }
    let instance = saved.result || saved;
    await this.audit(request, {
      definitionCode: instance.definitionCode,
      instanceCode: instance.code,
      eventType: "process.instance.started",
      metadata: { version: instance.version },
    });
    let entered = await this.enterNode(
      request,
      instance,
      version,
      this.firstRuntimeNode(version.graph || {}),
      body,
    );
    const completed = await this.instanceService().update(
      this.serviceRequest(request, {
        query: {
          code: instance.code,
          startFingerprint: instanceModel.startFingerprint,
          startCompleted: false,
        },
        model: { $set: { startCompleted: true } },
      }),
    );
    const result = completed && completed.result;
    if (
      !result ||
      Number(
        result.modifiedCount === undefined
          ? result.nModified === undefined
            ? result.n
            : result.nModified
          : result.modifiedCount,
      ) !== 1
    ) {
      throw new CLASSES.NodicsError("ERR_PROCESS_00027");
    }
    entered.instance = Object.assign({}, entered.instance, {
      startCompleted: true,
    });
    return { code: "SUC_PROCESS_00007", data: entered };
  },

  /**
   * Loads a process task by code.
   *
   * @param {Object} request Nodics request context.
   * @param {string} taskCode Task code.
   * @returns {Promise<Object>} Process task.
   */
  requireTask: async function (request, taskCode) {
    let response = await this.taskService().get(
      this.serviceRequest(request, {
        query: { code: this.assertCode(taskCode) },
        searchOptions: { limit: 1 },
      }),
    );
    let task = response && response.result && response.result[0];
    if (!task)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00008",
        "Process task was not found",
      );
    return task;
  },

  /**
   * Loads a process instance by code.
   *
   * @param {Object} request Nodics request context.
   * @param {string} instanceCode Instance code.
   * @returns {Promise<Object>} Process instance.
   */
  requireInstance: async function (request, instanceCode) {
    let response = await this.instanceService().get(
      this.serviceRequest(request, {
        query: { code: this.assertCode(instanceCode) },
        searchOptions: { limit: 1 },
      }),
    );
    let instance = response && response.result && response.result[0];
    if (!instance)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00007",
        "Process instance was not found",
      );
    return instance;
  },

  /** Loads one Process-owned recovery incident. */
  requireIncident: async function (request, incidentCode) {
    let response = await this.incidentService().get(
      this.serviceRequest(request, {
        query: { code: this.assertCode(incidentCode) },
        searchOptions: { limit: 1 },
      }),
    );
    let incident = response && response.result && response.result[0];
    if (!incident)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00022",
        "Process recovery incident was not found",
      );
    return incident;
  },

  /** Restores a local decision adapter's execution from the unique completed predecessor TASK in the pinned graph, never the retry caller's decision. @param {Object} request Current authorized operation context. @param {Object} execution Engine-selected action. @returns {Promise<Object>} Fresh instance/context, original task decision and actor evidence. */
  completedDecisionExecution: async function (request, execution) {
    const fail = () => {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00019",
        "Completed action decision evidence is unavailable",
      );
    };
    const response = await this.instanceService().get(
      this.serviceRequest(request, {
        query: { code: this.assertCode(execution?.instance?.code) },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { limit: 2 },
      }),
    );
    if (
      !/^SUC_/.test(response?.code || "") ||
      response.error ||
      response.errors ||
      response.success === false ||
      !Array.isArray(response.result) ||
      response.result.length !== 1
    )
      fail();
    const instance = response.result[0];
    if (
      instance.code !== execution.instance.code ||
      !["RUNNING", "WAITING"].includes(instance.status) ||
      instance.definitionCode !== execution.version?.definitionCode ||
      instance.version !== execution.version?.version
    )
      fail();
    const version = await this.requireVersion(
      request,
      instance.definitionCode,
      instance.version,
    );
    const graph = version.graph || {};
    const node = this.findNode(graph, execution.node?.code);
    if (
      !node ||
      node.type !== "ACTION" ||
      !require("node:util").isDeepStrictEqual(
        node.action,
        execution.node.action,
      )
    )
      fail();
    const predecessors = new Set(),
      visited = new Set(),
      pending = [node.code];
    while (pending.length) {
      const code = pending.pop();
      if (visited.has(code)) continue;
      visited.add(code);
      const incoming = (graph.transitions || []).filter(
        (item) => item.target === code,
      );
      if (!incoming.length) fail();
      for (const edge of incoming) {
        const source = this.findNode(graph, edge.source);
        if (source?.type === "TASK") predecessors.add(source.code);
        else if (source?.type === "DECISION") pending.push(source.code);
        else fail();
      }
    }
    if (predecessors.size !== 1) fail();
    const taskNode = [...predecessors][0];
    if (![taskNode, node.code].includes(instance.currentNode)) fail();
    const tasks = await this.taskService().get(
      this.serviceRequest(request, {
        query: {
          instanceCode: instance.code,
          nodeCode: taskNode,
          status: "COMPLETED",
        },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { limit: 2 },
      }),
    );
    if (
      !/^SUC_/.test(tasks?.code || "") ||
      tasks.error ||
      tasks.errors ||
      tasks.success === false ||
      !Array.isArray(tasks.result) ||
      tasks.result.length !== 1
    )
      fail();
    const task = await this.readTaskTransition(request, tasks.result[0].code);
    if (
      task.status !== "COMPLETED" ||
      task.instanceCode !== instance.code ||
      task.nodeCode !== taskNode ||
      typeof task.completedBy !== "string" ||
      !task.completedBy ||
      !task.completedAt ||
      !Number.isFinite(new Date(task.completedAt).getTime()) ||
      typeof task.decision?.approved !== "boolean" ||
      Object.keys(task.decision).some(
        (key) =>
          ![
            "approved",
            "reason",
            "outcome",
            "approvals",
            "emergencyOverride",
            "transitionCode",
            "targetNodeCode",
          ].includes(key),
      ) ||
      (task.decision.reason !== undefined &&
        (typeof task.decision.reason !== "string" ||
          task.decision.reason.length > 1000)) ||
      (task.decision.approved === false && !task.decision.reason?.trim())
    )
      fail();
    // Legacy clients retain a descriptive outcome with the approved decision.
    // Typed approval contracts remain approved/reason-only; outcome is never a
    // substitute for the stored boolean, actor or pinned graph-path proof.
    if (
      Object.hasOwn(task.decision, "outcome") &&
      (this.taskDecisionContract(
        this.policyOf(version, this.findNode(graph, taskNode)),
      ) ||
        typeof task.decision.outcome !== "string" ||
        !task.decision.outcome.trim() ||
        task.decision.outcome.length > 256)
    )
      fail();
    let next = this.nextNode(graph, taskNode, { decision: task.decision });
    const path = new Set();
    while (next?.type === "DECISION" && !path.has(next.code)) {
      path.add(next.code);
      next = this.nextNode(graph, next.code, { decision: task.decision });
    }
    if (next?.code !== node.code) fail();
    return Object.assign({}, execution, {
      instance,
      version,
      node,
      context: structuredClone(instance.context || {}),
      decision: structuredClone(task.decision),
      completedTask: {
        code: task.code,
        nodeCode: task.nodeCode,
        completedBy: task.completedBy,
        completedAt: task.completedAt,
      },
    });
  },

  /** Retries the failed ACTION of one Process instance under bounded policy. Decision adapters restore original completed-task evidence through the registry. */
  retryInstance: async function (request) {
    let body = this.bodyOf(request);
    let instance = await this.requireInstance(
      request,
      request.instanceCode || body.instanceCode,
    );
    if (instance.status !== "FAILED" || !instance.incidentCode)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00023",
        "Process instance is not retryable",
      );
    let incident = await this.requireIncident(request, instance.incidentCode);
    if (
      !["OPEN", "DEAD_LETTER"].includes(incident.status) ||
      incident.attempt >= incident.maximumAttempts
    ) {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00023",
        "Process incident retry policy is exhausted",
      );
    }
    if (
      body.expectedAttempt !== undefined &&
      Number(body.expectedAttempt) !== incident.attempt
    ) {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00024",
        "Process incident changed; refresh before retrying",
      );
    }
    let version = await this.requireVersion(
      request,
      instance.definitionCode,
      instance.version,
    );
    let node = this.findNode(version.graph || {}, incident.nodeCode);
    if (!node || node.type !== "ACTION")
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00023",
        "Process incident ACTION node is unavailable",
      );
    let nextAttempt = incident.attempt + 1;
    let claimed = await this.incidentService().update(
      this.serviceRequest(request, {
        query: {
          code: incident.code,
          attempt: incident.attempt,
          status: incident.status,
        },
        model: { $set: { status: "RETRYING", attempt: nextAttempt } },
      }),
    );
    let claimedCount =
      claimed &&
      claimed.result &&
      (claimed.result.nModified !== undefined
        ? claimed.result.nModified
        : claimed.result.n);
    if (claimedCount === 0)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00024",
        "Process incident changed; refresh before retrying",
      );
    await this.instanceService().update(
      this.serviceRequest(request, {
        query: { code: instance.code, status: "FAILED" },
        model: {
          $set: { status: "RUNNING", retryCount: nextAttempt - 1 },
        },
      }),
    );
    try {
      await this.executeActionNode(request, instance, version, node, body);
      let resolvedAt = new Date();
      await this.incidentService().update(
        this.serviceRequest(request, {
          query: { code: incident.code, attempt: nextAttempt },
          model: {
            $set: {
              status: "RESOLVED",
              resolvedAt: resolvedAt,
              nextRetryAt: undefined,
            },
          },
        }),
      );
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.incident.resolved",
        metadata: { incidentCode: incident.code, attempt: nextAttempt },
      });
      let entered = await this.enterNode(
        request,
        Object.assign({}, instance, {
          status: "RUNNING",
          retryCount: nextAttempt - 1,
        }),
        version,
        this.nextNode(version.graph || {}, node.code, body),
        body,
      );
      return {
        code: "SUC_PROCESS_00012",
        data: Object.assign(
          {
            incident: Object.assign({}, incident, {
              status: "RESOLVED",
              attempt: nextAttempt,
              resolvedAt: resolvedAt,
            }),
          },
          entered,
        ),
      };
    } catch (error) {
      let policy = this.retryPolicy(node);
      let exhausted = nextAttempt >= incident.maximumAttempts;
      let lastErrorAt = new Date();
      await this.incidentService().update(
        this.serviceRequest(request, {
          query: { code: incident.code, attempt: nextAttempt },
          model: {
            $set: {
              status: exhausted ? "DEAD_LETTER" : "OPEN",
              errorCode: error.code || "ERR_PROCESS_00019",
              lastErrorAt: lastErrorAt,
              nextRetryAt: exhausted
                ? undefined
                : new Date(lastErrorAt.getTime() + policy.delayMs),
            },
          },
        }),
      );
      await this.instanceService().update(
        this.serviceRequest(request, {
          query: { code: instance.code },
          model: {
            $set: {
              status: "FAILED",
              failureCode: error.code || "ERR_PROCESS_00019",
              retryCount: nextAttempt - 1,
            },
          },
        }),
      );
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: exhausted
          ? "process.incident.deadLettered"
          : "process.incident.retryFailed",
        outcome: "failure",
        metadata: {
          incidentCode: incident.code,
          attempt: nextAttempt,
          errorCode: error.code || "ERR_PROCESS_00019",
        },
      });
      throw error;
    }
  },

  /** Executes a declarative domain-owned compensation adapter. */
  compensateInstance: async function (request) {
    let body = this.bodyOf(request);
    let instance = await this.requireInstance(
      request,
      request.instanceCode || body.instanceCode,
    );
    if (instance.status !== "FAILED" || !instance.incidentCode)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00025",
        "Process instance is not compensatable",
      );
    let incident = await this.requireIncident(request, instance.incidentCode);
    let version = await this.requireVersion(
      request,
      instance.definitionCode,
      instance.version,
    );
    let node = this.findNode(version.graph || {}, incident.nodeCode);
    if (!node || !node.compensation)
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00025",
        "Process node has no declarative compensation adapter",
      );
    await this.incidentService().update(
      this.serviceRequest(request, {
        query: { code: incident.code },
        model: { $set: { status: "COMPENSATING" } },
      }),
    );
    await this.instanceService().update(
      this.serviceRequest(request, {
        query: { code: instance.code },
        model: { $set: { compensationStatus: "IN_PROGRESS" } },
      }),
    );
    try {
      let result = await this.actionAdapterRegistryService().execute(request, {
        instance: instance,
        version: version,
        node: Object.assign({}, node, {
          action: node.compensation,
        }),
        context: instance.context || {},
        payload: body.payload || {},
      });
      let compensatedAt = new Date();
      await this.incidentService().update(
        this.serviceRequest(request, {
          query: { code: incident.code },
          model: {
            $set: {
              status: "COMPENSATED",
              compensatedAt: compensatedAt,
            },
          },
        }),
      );
      await this.instanceService().update(
        this.serviceRequest(request, {
          query: { code: instance.code },
          model: { $set: { compensationStatus: "COMPLETED" } },
        }),
      );
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.incident.compensated",
        metadata: {
          incidentCode: incident.code,
          adapter:
            node.compensation.moduleName + "." + node.compensation.operation,
        },
      });
      return {
        code: "SUC_PROCESS_00013",
        data: {
          instanceCode: instance.code,
          incidentCode: incident.code,
          compensationStatus: "COMPLETED",
          result: result,
        },
      };
    } catch (error) {
      await this.incidentService().update(
        this.serviceRequest(request, {
          query: { code: incident.code },
          model: {
            $set: {
              status: "DEAD_LETTER",
              errorCode: error.code || "ERR_PROCESS_00019",
            },
          },
        }),
      );
      await this.instanceService().update(
        this.serviceRequest(request, {
          query: { code: instance.code },
          model: { $set: { compensationStatus: "FAILED" } },
        }),
      );
      await this.audit(request, {
        definitionCode: instance.definitionCode,
        instanceCode: instance.code,
        eventType: "process.incident.compensationFailed",
        outcome: "failure",
        metadata: {
          incidentCode: incident.code,
          errorCode: error.code || "ERR_PROCESS_00019",
        },
      });
      throw error;
    }
  },

  /**
   * Claims an open task for the authenticated actor or provided assignee.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Claimed task summary.
   */
  claimTask: async function (request) {
    let body = this.bodyOf(request);
    let task = await this.requireTask(
      request,
      request.taskCode || body.taskCode,
    );
    if (task.status !== "OPEN")
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Process task transition is not allowed",
      );
    let assignee = body.assignee || this.getActor(request);
    this.assertCode(assignee);
    const instance = await this.requireInstance(request, task.instanceCode);
    if (!["RUNNING", "WAITING"].includes(instance.status))
      throw new CLASSES.NodicsError("ERR_PROCESS_00013");
    const version = await this.requireVersion(
      request,
      instance.definitionCode,
      instance.version,
    );
    const node = this.findNode(version.graph || {}, task.nodeCode);
    const policy = Object.assign(
      {},
      this.policyOf(version, node),
      task.approvalPolicy || {},
    );
    this.assertTaskActor(request, instance, policy);
    if (policy.actorPolicy !== undefined && assignee !== this.getActor(request))
      throw new CLASSES.NodicsError("ERR_PROCESS_00029");
    const claimed = await this.taskService().update(
      this.serviceRequest(request, {
        query: {
          code: task.code,
          status: "OPEN",
          instanceCode: task.instanceCode,
          nodeCode: task.nodeCode,
          assignee:
            task.assignee === undefined ? { $exists: false } : task.assignee,
        },
        model: { $set: { status: "CLAIMED", assignee: assignee } },
      }),
    );
    if (
      !claimed ||
      !/^SUC_/.test(claimed.code || "") ||
      claimed.success === false ||
      claimed.error ||
      (claimed.errors &&
        (!Array.isArray(claimed.errors) || claimed.errors.length)) ||
      SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(
        claimed,
      ) !== 1
    )
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Task claim was not exactly acknowledged",
      );
    const saved = await this.readTaskTransition(request, task.code);
    if (
      saved.status !== "CLAIMED" ||
      saved.assignee !== assignee ||
      saved.instanceCode !== task.instanceCode ||
      saved.nodeCode !== task.nodeCode
    )
      throw new CLASSES.NodicsError("ERR_PROCESS_00012");
    await this.audit(request, {
      instanceCode: task.instanceCode,
      eventType: "process.task.claimed",
      metadata: { taskCode: task.code, assignee: assignee },
    });
    return {
      code: "SUC_PROCESS_00008",
      data: saved,
    };
  },

  /**
   * Assigns or reassigns an open/claimed/escalated task.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Assigned task summary.
   */
  assignTask: async function (request) {
    let body = this.bodyOf(request);
    let task = await this.requireTask(
      request,
      request.taskCode || body.taskCode,
    );
    if (!["OPEN", "CLAIMED", "ESCALATED"].includes(task.status))
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Process task transition is not allowed",
      );
    let assignee = body.assignee;
    this.assertCode(assignee);
    await this.taskService().update(
      this.serviceRequest(request, {
        query: { code: task.code },
        model: { $set: { assignee: assignee } },
      }),
    );
    await this.audit(request, {
      instanceCode: task.instanceCode,
      eventType: "process.task.assigned",
      metadata: { taskCode: task.code, assignee: assignee },
    });
    return {
      code: "SUC_PROCESS_00008",
      data: Object.assign({}, task, { assignee: assignee }),
    };
  },

  /**
   * Completes a task and advances the owning process instance.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Completed task and next runtime state.
   */
  completeTask: async function (request) {
    let body = this.bodyOf(request);
    let task = await this.requireTask(
      request,
      request.taskCode || body.taskCode,
    );
    if (!["OPEN", "CLAIMED", "ESCALATED"].includes(task.status))
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Process task transition is not allowed",
      );
    let instance = await this.requireInstance(request, task.instanceCode);
    if (!["RUNNING", "WAITING"].includes(instance.status))
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00013",
        "Process instance transition is not allowed",
      );
    let version = await this.requireVersion(
      request,
      instance.definitionCode,
      instance.version,
    );
    let currentNode = this.findNode(version.graph || {}, task.nodeCode);
    let policyEvidence = this.assertTaskCompletionPolicy(
      request,
      task,
      instance,
      version,
      currentNode,
      body,
    );
    let nextNode = currentNode
      ? this.nextNode(version.graph || {}, currentNode.code, body)
      : undefined;
    let completedAt = new Date();
    const completed = await this.taskService().update(
      this.serviceRequest(request, {
        query: {
          code: task.code,
          status: task.status,
          instanceCode: task.instanceCode,
          nodeCode: task.nodeCode,
          assignee:
            task.assignee === undefined ? { $exists: false } : task.assignee,
        },
        model: {
          $set: {
            status: "COMPLETED",
            decision: body.decision || {},
            completedAt: completedAt,
            completedBy: this.getActor(request),
          },
        },
      }),
    );
    this.assertTaskTransitionWrite(completed);
    const saved = await this.readTaskTransition(request, task.code);
    if (
      saved.status !== "COMPLETED" ||
      saved.instanceCode !== task.instanceCode ||
      saved.nodeCode !== task.nodeCode ||
      saved.assignee !== task.assignee ||
      saved.completedBy !== this.getActor(request) ||
      new Date(saved.completedAt).getTime() !== completedAt.getTime() ||
      !require("node:util").isDeepStrictEqual(
        saved.decision,
        body.decision || {},
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Task completion is unconfirmed; inspect without replay",
      );
    await this.audit(request, {
      definitionCode: instance.definitionCode,
      instanceCode: instance.code,
      eventType: "process.task.completed",
      metadata: {
        taskCode: task.code,
        nodeCode: task.nodeCode,
        approvalPolicy: policyEvidence,
      },
    });
    let nextState = await this.enterNode(
      request,
      instance,
      version,
      nextNode,
      body,
    );
    return {
      code: "SUC_PROCESS_00008",
      data: Object.assign(
        {
          task: saved,
        },
        nextState,
      ),
    };
  },

  /** Rejects failed or ambiguous task acknowledgements before audit or advancement. @param {Object} response Generated owner write envelope. @returns {void} Requires acknowledged exactly-one mutation. */
  assertTaskTransitionWrite: function (response) {
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.error ||
      response.errors ||
      response.success === false ||
      response.result?.acknowledged !== true ||
      SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(
        response,
      ) !== 1
    )
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Task transition is unconfirmed; inspect without replay",
      );
  },
  /** Reads one transitioned task through its existing generated owner, bypassing stale item cache. @param {Object} request Original authorized context. @param {string} code Inspected task code. @returns {Promise<Object>} Exactly one freshly acknowledged owner record. */
  readTaskTransition: async function (request, code) {
    const response = await this.taskService().get(
      this.serviceRequest(request, {
        query: { code: this.assertCode(code) },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { limit: 2 },
      }),
    );
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.error ||
      response.errors ||
      response.success === false ||
      !Array.isArray(response.result) ||
      response.result.length !== 1 ||
      response.result[0]?.code !== code
    )
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Task readback is unconfirmed; inspect without replay",
      );
    return response.result[0];
  },

  /**
   * Cancels a human task without cancelling the owning instance.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Cancelled task summary.
   */
  cancelTask: async function (request) {
    let body = this.bodyOf(request);
    let task = await this.requireTask(
      request,
      request.taskCode || body.taskCode,
    );
    if (!["OPEN", "CLAIMED", "ESCALATED"].includes(task.status))
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Process task transition is not allowed",
      );
    const instance = await this.requireInstance(request, task.instanceCode);
    const version = await this.requireVersion(
      request,
      instance.definitionCode,
      instance.version,
    );
    const node = this.findNode(version.graph || {}, task.nodeCode);
    const policy = Object.assign(
      {},
      this.policyOf(version, node),
      task.approvalPolicy || {},
    );
    // A generic task cancellation is not a domain withdrawal or review decision.
    if (
      this.policyOf(version, node).actorPolicy !== undefined ||
      policy.actorPolicy !== undefined
    )
      throw new CLASSES.NodicsError("ERR_PROCESS_00029");
    const cancelledAt = new Date();
    const response = await this.taskService().update(
      this.serviceRequest(request, {
        query: {
          code: task.code,
          status: task.status,
          instanceCode: task.instanceCode,
          nodeCode: task.nodeCode,
          assignee:
            task.assignee === undefined ? { $exists: false } : task.assignee,
        },
        model: {
          $set: {
            status: "CANCELLED",
            cancellationReason: body.reason,
            cancelledAt,
            cancelledBy: this.getActor(request),
          },
        },
      }),
    );
    this.assertTaskTransitionWrite(response);
    const saved = await this.readTaskTransition(request, task.code);
    if (
      saved.status !== "CANCELLED" ||
      saved.instanceCode !== task.instanceCode ||
      saved.nodeCode !== task.nodeCode ||
      saved.assignee !== task.assignee ||
      saved.cancelledBy !== this.getActor(request) ||
      saved.cancellationReason !== body.reason ||
      new Date(saved.cancelledAt).getTime() !== cancelledAt.getTime()
    )
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00012",
        "Task cancellation is unconfirmed; inspect without replay",
      );
    await this.audit(request, {
      instanceCode: task.instanceCode,
      eventType: "process.task.cancelled",
      metadata: { taskCode: task.code, reason: body.reason },
    });
    return {
      code: "SUC_PROCESS_00008",
      data: saved,
    };
  },

  /**
   * Cancels a running or waiting process instance and any open tasks.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Cancelled instance summary.
   */
  cancelInstance: async function (request) {
    let body = this.bodyOf(request);
    let instance = await this.requireInstance(
      request,
      request.instanceCode || body.instanceCode,
    );
    if (!["CREATED", "RUNNING", "WAITING"].includes(instance.status))
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00013",
        "Process instance transition is not allowed",
      );
    const version = await this.requireVersion(
      request,
      instance.definitionCode,
      instance.version,
    );
    if (
      version.policy?.actorPolicy !== undefined ||
      (version.graph?.nodes || []).some(
        (node) => this.policyOf(version, node).actorPolicy !== undefined,
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00029",
        "Governed review cancellation requires a domain contract",
      );
    let cancelledAt = new Date();
    await this.instanceService().update(
      this.serviceRequest(request, {
        query: { code: instance.code },
        model: {
          $set: {
            status: "CANCELLED",
            completedAt: cancelledAt,
            cancellationReason: body.reason,
          },
        },
      }),
    );
    await this.taskService().update(
      this.serviceRequest(request, {
        query: { instanceCode: instance.code, status: "OPEN" },
        model: {
          $set: {
            status: "CANCELLED",
            cancelledAt: cancelledAt,
            cancellationReason: "INSTANCE_CANCELLED",
          },
        },
        options: { recursive: true },
      }),
    );
    await this.audit(request, {
      definitionCode: instance.definitionCode,
      instanceCode: instance.code,
      eventType: "process.instance.cancelled",
      metadata: { reason: body.reason },
    });
    return {
      code: "SUC_PROCESS_00009",
      data: Object.assign({}, instance, {
        status: "CANCELLED",
        completedAt: cancelledAt,
      }),
    };
  },

  /**
   * Lists Process-owned trigger metadata while preserving Cron ownership of actual jobs.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Trigger metadata list.
   */
  listTriggers: async function (request) {
    if (!this.triggerService()) return { code: "SUC_PROCESS_00010", data: [] };
    let response = await this.triggerService().get(
      this.serviceRequest(request, {
        query: request.query || {},
        searchOptions: { limit: 100, sort: { code: 1 } },
      }),
    );
    return { code: "SUC_PROCESS_00010", data: response.result || [] };
  },

  /**
   * Creates Process-owned trigger metadata after verifying the referenced
   * definition exists. Cron remains responsible for actual job execution.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Created trigger summary.
   */
  createTrigger: async function (request) {
    let body = this.bodyOf(request);
    if (!this.triggerService())
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00014",
        "Process trigger service is unavailable",
      );
    let definitionCode = this.assertCode(body.definitionCode);
    let definition = await this.requireDefinition(request, definitionCode);
    let triggerModel = {
      code: body.code || this.runtimeCode(definitionCode + "-trigger"),
      active: body.active !== false,
      name: body.name || definition.name || definitionCode,
      definitionCode: definitionCode,
      version: body.version ? Number(body.version) : undefined,
      triggerType: body.triggerType || "CRON",
      ownerModule: body.ownerModule || "nodics.process",
      cronJobCode: body.cronJobCode,
      status: this.assertTriggerStatus(body.status || "DRAFT"),
      schedule: body.schedule || {},
      lastObservedAt: new Date(),
    };
    this.assertCode(triggerModel.code);
    if (triggerModel.cronJobCode) this.assertCode(triggerModel.cronJobCode);
    let response = await this.triggerService().save(
      this.serviceRequest(request, { model: triggerModel }),
    );
    let trigger = response.result || response;
    await this.audit(request, {
      definitionCode: definitionCode,
      eventType: "process.trigger.created",
      metadata: {
        triggerCode: trigger.code,
        triggerType: trigger.triggerType,
        cronJobCode: trigger.cronJobCode,
      },
    });
    return { code: "SUC_PROCESS_00010", data: trigger };
  },

  /**
   * Updates Process-owned trigger metadata without moving scheduler behavior
   * into Process or Axis.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Updated trigger summary.
   */
  updateTrigger: async function (request) {
    let body = this.bodyOf(request);
    let triggerCode = this.assertCode(request.triggerCode || body.code);
    if (!this.triggerService())
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00014",
        "Process trigger service is unavailable",
      );
    let allowed = [
      "name",
      "version",
      "triggerType",
      "cronJobCode",
      "status",
      "schedule",
      "active",
    ];
    let update = {};
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(body, key))
        update[key] = body[key];
    });
    let existingTrigger = await this.requireTrigger(request, triggerCode);
    if (existingTrigger.status === "ARCHIVED")
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00017",
        "Archived process trigger cannot be updated",
      );
    if (update.cronJobCode) this.assertCode(update.cronJobCode);
    if (update.status) this.assertTriggerStatus(update.status);
    update.lastObservedAt = new Date();
    await this.triggerService().update(
      this.serviceRequest(request, {
        query: { code: triggerCode },
        model: { $set: update },
      }),
    );
    await this.audit(request, {
      eventType: "process.trigger.updated",
      metadata: {
        triggerCode: triggerCode,
        status: update.status,
        cronJobCode: update.cronJobCode,
      },
    });
    return {
      code: "SUC_PROCESS_00010",
      data: Object.assign({ code: triggerCode }, update),
    };
  },

  /**
   * Archives trigger metadata rather than deleting it so operations teams can
   * retain evidence of schedule relationships.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Archived trigger summary.
   */
  archiveTrigger: async function (request) {
    let triggerCode = this.assertCode(
      request.triggerCode || this.bodyOf(request).code,
    );
    let existingTrigger = await this.requireTrigger(request, triggerCode);
    let archivedAt = new Date();
    await this.triggerService().update(
      this.serviceRequest(request, {
        query: { code: triggerCode },
        model: {
          $set: {
            active: false,
            status: "ARCHIVED",
            archivedAt: archivedAt,
          },
        },
      }),
    );
    await this.audit(request, {
      eventType: "process.trigger.archived",
      metadata: {
        triggerCode: triggerCode,
        previousStatus: existingTrigger.status,
      },
    });
    return {
      code: "SUC_PROCESS_00010",
      data: {
        code: triggerCode,
        active: false,
        status: "ARCHIVED",
        archivedAt: archivedAt,
      },
    };
  },

  /**
   * Executes a Process-owned trigger by starting the referenced process
   * definition. Cron or another authorized scheduler may call this endpoint,
   * but Process remains the owner of instance creation and audit evidence.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Trigger execution and started instance summary.
   */
  executeTrigger: async function (request) {
    let body = this.bodyOf(request);
    let trigger = await this.requireTrigger(
      request,
      request.triggerCode || body.triggerCode,
    );
    if (trigger.active === false || trigger.status !== "ACTIVE") {
      throw new CLASSES.NodicsError(
        "ERR_PROCESS_00020",
        "Process trigger is not active",
      );
    }
    let correlationId =
      body.correlationId ||
      body.idempotencyKey ||
      this.runtimeCode(trigger.code + "-correlation");
    await this.audit(request, {
      definitionCode: trigger.definitionCode,
      eventType: "process.trigger.execution.requested",
      metadata: {
        triggerCode: trigger.code,
        cronJobCode: trigger.cronJobCode,
        correlationId: correlationId,
      },
    });
    try {
      let started = await this.startInstance(
        Object.assign({}, request, {
          runtimeOperation: Object.assign({}, body.runtimeOperation || {}, {
            definitionCode: trigger.definitionCode,
            version: body.version || trigger.version,
            instanceCode: body.instanceCode,
            context: Object.assign({}, body.context || {}, {
              triggerCode: trigger.code,
              cronJobCode: trigger.cronJobCode,
              correlationId: correlationId,
            }),
          }),
        }),
      );
      await this.audit(request, {
        definitionCode: trigger.definitionCode,
        eventType: "process.trigger.execution.completed",
        metadata: {
          triggerCode: trigger.code,
          correlationId: correlationId,
          instanceCode:
            started &&
            started.data &&
            started.data.instance &&
            started.data.instance.code,
        },
      });
      return {
        code: "SUC_PROCESS_00011",
        data: {
          trigger: trigger,
          correlationId: correlationId,
          execution: started.data,
        },
      };
    } catch (error) {
      await this.audit(request, {
        definitionCode: trigger.definitionCode,
        eventType: "process.trigger.execution.failed",
        outcome: "failure",
        metadata: {
          triggerCode: trigger.code,
          correlationId: correlationId,
          errorCode: error.code || "ERR_PROCESS_00020",
        },
      });
      throw error;
    }
  },

  /**
   * Reads an instance together with tasks and audit timeline.
   *
   * @param {Object} request Nodics request context.
   * @returns {Promise<Object>} Aggregated runtime detail.
   */
  getInstanceDetail: async function (request) {
    let instance = await this.requireInstance(request, request.instanceCode);
    let tasks = await this.taskService().get(
      this.serviceRequest(request, {
        query: { instanceCode: instance.code },
        searchOptions: { limit: 100, sort: { createdAt: 1 } },
      }),
    );
    let auditEvents = await this.auditService().get(
      this.serviceRequest(request, {
        query: { instanceCode: instance.code },
        searchOptions: { limit: 100, sort: { createdAt: 1 } },
      }),
    );
    return {
      code: "SUC_PROCESS_00000",
      data: {
        instance: instance,
        tasks: await this.projectTaskDecisions(request, tasks.result || []),
        auditEvents: auditEvents.result || [],
      },
    };
  },
};
