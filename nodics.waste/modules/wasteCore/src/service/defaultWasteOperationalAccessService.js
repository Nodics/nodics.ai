/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module wasteCore/service/defaultWasteOperationalAccessService @description Enforces granular staff permissions and Profile-owned operational scopes before Waste records or evidence are exposed or mutated. @layer service @owner wasteCore @override Configure the owning Profile transport and scope policy without accepting caller-supplied grants. */
const contexts = new WeakMap();
module.exports = {
  /** Returns the layered operational access policy. */
  settings: function () {
    return (CONFIG.get("waste") || {}).operations || {};
  },
  /** Resolves current grants through the existing router permission authority. */
  permissions: function (request) {
    return SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions(
      request,
    );
  },
  /** Uses the canonical permission matcher without relaxing its enforcement mode. */
  granted: function (request, permission) {
    return SERVICE.DefaultSecuredRequestPipelineService.isPermissionGranted(
      permission,
      this.permissions(request),
      {},
    );
  },
  /** Records a sanitized denied action before returning a stable authorization failure. */
  deny: async function (request, reason) {
    if (SERVICE.DefaultAuthAuditService)
      await SERVICE.DefaultAuthAuditService.record({
        eventType: "WASTE_OPERATION_DENIED",
        outcome: "DENIED",
        tenant: request.tenant,
        entCode: request.authData && request.authData.entCode,
        principalId: request.authData && request.authData.loginId,
        reasonCode: reason,
        correlationId: request.correlationId,
        source: "wasteCore",
      });
    SERVICE.DefaultWastePersistenceService.fail(
      "ERR_WASTE_REVIEW_FORBIDDEN",
      "This operation is outside your assigned permission or collection-centre scope",
    );
  },
  /** Requires an authenticated human and the exact operation grant. */
  authorize: async function (request, permission) {
    const auth = request.authData || {};
    if (
      auth.principalType !== "human" ||
      !auth.loginId ||
      !this.granted(request, permission)
    )
      await this.deny(request, permission);
  },
  /** Reads only this authenticated employee's scopes from Profile and keeps them request-local. */
  context: async function (request) {
    if (!this.settings().requireScopes)
      return { scopes: [], deniedScopes: [], unscoped: true };
    if (contexts.has(request)) return contexts.get(request);
    const promise = (async () => {
      if (!request.authorization || !/^Bearer /i.test(request.authorization))
        await this.deny(request, "PROFILE_SCOPE_TOKEN_REQUIRED");
      const target = this.settings().profileTarget || {};
      const response = await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName: "profile",
        connectionName: target.connectionName || "profile",
        targetAuthority: { runtimeRole: target.runtimeRole || "PLATFORM" },
        apiName: "/identity/scopes/me",
        methodName: "GET",
        tenant: request.tenant,
        request: { tenant: request.tenant },
        header: {
          Authorization: request.authorization,
          "X-Enterprise-Code": request.authData.entCode,
        },
        timeoutMs: 10000,
        maxAttempts: 1,
      });
      let value = response;
      for (let n = 0; n < 6 && value && !Array.isArray(value); n++) {
        if (value.data !== undefined) value = value.data;
        else if (value.result !== undefined) value = value.result;
        else break;
      }
      if (
        !value ||
        value.principalCode !== request.authData.loginId ||
        !Array.isArray(value.scopes) ||
        !Array.isArray(value.deniedScopes)
      )
        await this.deny(request, "PROFILE_SCOPE_RESPONSE_INVALID");
      return value;
    })();
    contexts.set(request, promise);
    return promise;
  },
  /** Matches one scope's capability and permission without expanding a business-unit grant. */
  matchesOperation: function (scope, permission, request) {
    if (scope.tenantCode && scope.tenantCode !== request.tenant) return false;
    if (
      scope.capabilityCode &&
      !["waste", "wasteCore"].includes(scope.capabilityCode)
    )
      return false;
    if (
      scope.permissionCode &&
      !SERVICE.DefaultSecuredRequestPipelineService.isPermissionGranted(
        permission,
        [scope.permissionCode],
        {},
      )
    )
      return false;
    return true;
  },
  /** Maps canonical scope kinds to the collection-point ownership reference. */
  matchesPoint: function (scope, point, request) {
    if (scope.scopeType === "GLOBAL" && scope.scopeCode === "*") return true;
    if (scope.scopeType === "TENANT") return scope.scopeCode === request.tenant;
    if (!point) return false;
    if (scope.scopeType === "BUSINESS_UNIT")
      return scope.scopeCode === point.code;
    return (
      scope.scopeType === "ENTERPRISE" &&
      scope.scopeCode ===
        (point.operatorEnterpriseRef && point.operatorEnterpriseRef.code)
    );
  },
  /** Resolves the submission's selected point from persisted facts only. */
  pointCode: function (record) {
    return (
      record &&
      (record.preferredCollectionPointCode ||
        (record.confirmedFacts &&
          record.confirmedFacts.preferredCollectionPointCode) ||
        (record.submittedFacts &&
          record.submittedFacts.preferredCollectionPointCode))
    );
  },
  /** Filters a bounded record selection using current Profile allow and deny scopes. */
  visible: async function (request, permission, records) {
    await this.authorize(request, permission);
    const context = await this.context(request);
    if (context.unscoped) return records;
    const codes = [
      ...new Set(
        records.map((record) => this.pointCode(record)).filter(Boolean),
      ),
    ];
    const points = codes.length
      ? await SERVICE.DefaultWastePersistenceService.list(
          "wasteCollectionPoint",
          request,
          { code: { $in: codes } },
          500,
        )
      : [];
    const byCode = new Map(points.map((point) => [point.code, point]));
    const applicable = (values) =>
      values.filter((scope) =>
        this.matchesOperation(scope, permission, request),
      );
    const allow = applicable(context.scopes),
      deny = applicable(context.deniedScopes);
    return records.filter((record) => {
      const point = byCode.get(this.pointCode(record));
      return (
        allow.some((scope) => this.matchesPoint(scope, point, request)) &&
        !deny.some((scope) => this.matchesPoint(scope, point, request))
      );
    });
  },
  /** Matches a point code with the same persisted-fact precedence as pointCode; conflicting stale copies cannot widen access. */
  pointQuery: function (codes) {
    const fields = [
      "preferredCollectionPointCode",
      "confirmedFacts.preferredCollectionPointCode",
      "submittedFacts.preferredCollectionPointCode",
    ];
    return {
      $or: fields.map((field, index) => ({
        $and: [
          ...fields
            .slice(0, index)
            .map((previous) => ({
              $or: [
                { [previous]: { $exists: false } },
                { [previous]: null },
                { [previous]: "" },
              ],
            })),
          { [field]: { $in: codes } },
        ],
      })),
    };
  },
  /** Compiles Profile scopes to a generated-service query before record paging/counting. Enterprise scopes resolve their owned points in bounded pages; no submissions are scanned in memory. */
  scopeQuery: async function (request, permission) {
    await this.authorize(request, permission);
    const context = await this.context(request);
    if (context.unscoped) return {};
    const applicable = (values) =>
      values.filter((scope) =>
        this.matchesOperation(scope, permission, request),
      );
    const allow = applicable(context.scopes),
      deny = applicable(context.deniedScopes);
    const broad = (scopes) =>
      scopes.some((scope) => this.matchesPoint(scope, null, request));
    if (broad(deny) || !allow.length) return { code: { $in: [] } };
    const enterpriseCodes = [
      ...new Set(
        [...allow, ...deny]
          .filter((scope) => scope.scopeType === "ENTERPRISE")
          .map((scope) => scope.scopeCode),
      ),
    ];
    const directCodes = [
      ...new Set(
        [...allow, ...deny]
          .filter((scope) => scope.scopeType === "BUSINESS_UNIT")
          .map((scope) => scope.scopeCode),
      ),
    ];
    const points = [];
    if (enterpriseCodes.length || directCodes.length) {
      const maximum = this.settings().maximumScopePoints;
      if (!Number.isSafeInteger(maximum) || maximum < 1)
        await this.deny(request, "SCOPE_LIMIT_UNCONFIGURED");
      for (let page = 1; ; page++) {
        const result = await SERVICE.DefaultWastePersistenceService.page(
          "wasteCollectionPoint",
          request,
          {
            $or: [
              { "operatorEnterpriseRef.code": { $in: enterpriseCodes } },
              { code: { $in: directCodes } },
            ],
          },
          page,
          Math.min(500, maximum),
        );
        if (result.total > maximum)
          await this.deny(request, "SCOPE_RESOLUTION_LIMIT");
        points.push(...result.items);
        if (points.length >= result.total) break;
        if (!result.items.length)
          await this.deny(request, "SCOPE_RESOLUTION_INCOMPLETE");
      }
    }
    const codes = (scopes) => [
      ...new Set([
        ...points
          .filter((point) =>
            scopes.some((scope) => this.matchesPoint(scope, point, request)),
          )
          .map((point) => point.code),
      ]),
    ];
    const allowQuery = broad(allow) ? {} : this.pointQuery(codes(allow));
    const deniedCodes = codes(deny);
    return deniedCodes.length
      ? { $and: [allowQuery, { $nor: [this.pointQuery(deniedCodes)] }] }
      : allowQuery;
  },
  /** Resolves complete permitted collection-point choices using the same Profile allow/deny semantics as review queries. Never truncates the catalogue silently. */
  collectionPoints: async function (request, permission) {
    await this.authorize(request, permission);
    const context = await this.context(request);
    const applicable = values => (values || []).filter(scope => this.matchesOperation(scope, permission, request));
    const allow = applicable(context.scopes), deny = applicable(context.deniedScopes);
    const maximum = this.settings().maximumScopePoints;
    if (!Number.isSafeInteger(maximum) || maximum < 1) return this.deny(request, 'SCOPE_LIMIT_UNCONFIGURED');
    const records = [];
    for (let page = 1; ; page++) {
      const result = await SERVICE.DefaultWastePersistenceService.page('wasteCollectionPoint', request, {}, page, Math.min(500, maximum));
      if (result.total > maximum) return this.deny(request, 'SCOPE_RESOLUTION_LIMIT');
      records.push(...result.items.filter(point => context.unscoped || allow.some(scope => this.matchesPoint(scope, point, request)) && !deny.some(scope => this.matchesPoint(scope, point, request))));
      if (page * Math.min(500, maximum) >= result.total) break;
      if (!result.items.length) return this.deny(request, 'SCOPE_RESOLUTION_INCOMPLETE');
    }
    return records;
  },
  /** Rejects individual record access before any business mutation or Media call. */
  assertRecord: async function (request, permission, record) {
    if (!(await this.visible(request, permission, [record])).length)
      await this.deny(request, permission + ":SCOPE");
  },
  /** Projects only UI action availability; business services repeat authorization on every command. */
  describe: async function (request) {
    await this.authorize(request, "waste.review.queue.read");
    await this.context(request);
    return {
      impactAssessment: { labels: (CONFIG.get('wasteImpact') || {}).assessments?.presentation || {} },
      principalCode: request.authData.loginId,
      presentation: this.settings().presentation || {},
      canVerify: this.granted(request, "waste.verification.record"),
      canApprove: this.granted(request, "waste.review.approve"),
      canReadEvidence: this.granted(request, "waste.review.evidence.read"),
      canAudit: this.granted(request, "waste.audit.read"),
      canAssign:
        this.granted(request, "waste.verification.record") ||
        this.granted(request, "waste.review.approve"),
      reviewWorkspace: (CONFIG.get("waste") || {}).reviewWorkspace || {},
      requireVerification: this.settings().requireVerification === true,
      requireDifferentApprover:
        this.settings().requireDifferentApprover === true,
    };
  },
};
