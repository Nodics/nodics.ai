/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/DefaultBackofficeApplicationInitializationService
 * @description Projects and initiates configured application/site bundles through complete target-runtime preparation and fixed WCMS Staged baseline publication.
 * @layer service
 * @owner backoffice
 * @override Customer projects may add profile descriptors through later configuration without replacing Platform orchestration.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = {
  /** Executes the documented bounded module operation. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Executes the documented bounded module operation. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns every configured application initialization profile as a client-safe catalogue. */
  profiles: function () {
    let profiles =
      (CONFIG.get("backofficeApplicationInitialization") || {}).profiles || {};
    return Object.keys(profiles)
      .filter((code) => (profiles[code].presentation || {}).visible !== false)
      .sort((left, right) => {
        let leftOrder = Number(
          (profiles[left].presentation || {}).order || 1000,
        );
        let rightOrder = Number(
          (profiles[right].presentation || {}).order || 1000,
        );
        return leftOrder === rightOrder
          ? left.localeCompare(right)
          : leftOrder - rightOrder;
      })
      .filter((code) => profiles[code].enabled !== false)
      .map((code) => this.describe(this.resolveProfile(profiles[code])))
      .filter(Boolean);
  },
  /** Projects one configured profile without exposing transport internals or credentials. */
  describe: function (profile) {
    if (!profile || !profile.code) return undefined;
    let presentation = profile.presentation || {};
    let preparationSteps = this.preparationSteps(profile);
    let requiredFunctionalModules = this.requiredFunctionalModules(profile);
    let dataPackages = preparationSteps.map((step) => ({
      code: step.code,
      kind: step.kind,
      required: step.required,
      trigger: step.trigger,
      dataType: step.dataType,
      classification: step.classification,
      targetServer: step.targetServer,
      targetRuntimeRole: step.targetRuntimeRole,
    }));
    if (profile.contentPackCode)
      dataPackages.push({
        code: String(profile.contentPackCode),
        kind: "CONTENT_PACK",
        required: true,
        trigger: "USER",
        dataType: "content",
        classification: "DOCUMENTATION_CONTENT_PACK",
      });
    return {
      code: String(profile.code),
      title: String(presentation.title || profile.code),
      kind: String(
        presentation.kind ||
          (profile.type === "DOCUMENTATION_BUNDLE"
            ? "DOCUMENTATION"
            : "PROJECT"),
      ),
      category: String(
        presentation.category ||
          (profile.type === "DOCUMENTATION_BUNDLE"
            ? "documentation"
            : "accelerator"),
      ),
      summary: String(presentation.summary || ""),
      order: Number(presentation.order || 1000),
      type: String(profile.type),
      owner: String(profile.owner),
      applicationCode: String(profile.applicationCode),
      siteCode: String(profile.siteCode),
      baselineCode: String(profile.baselineCode),
      contentPackCode: profile.contentPackCode
        ? String(profile.contentPackCode)
        : undefined,
      requiredServers: [].concat(
        presentation.requiredServers || [
          "Platform",
          "WCMS Staged",
          "WCMS Online",
          "Process",
        ],
      ),
      requiredFunctionalModules: requiredFunctionalModules.map((item) => ({
        code: item.code,
        label: item.label,
        required: item.required,
        order: item.order,
      })),
      dataPackages: dataPackages,
      preparationSteps: preparationSteps,
      activationPolicy: Object.assign(
        {
          approvalRequiredForOnline: true,
          requiredDataTrigger:
            profile.type === "DOCUMENTATION_BUNDLE" ? "USER" : "ACTIVATION",
          sampleDataTrigger: "USER",
        },
        presentation.activationPolicy || {},
      ),
    };
  },
  /** Returns a normalized application-preparation plan owned by the profile contract. */
  preparationSteps: function (profile) {
    let rawSteps =
      profile && profile.preparation && Array.isArray(profile.preparation.steps)
        ? profile.preparation.steps
        : [].concat((profile && profile.dataPackages) || []).map((pack) =>
            Object.assign(
              {
                type: "DATA_RELEASE",
                dataType:
                  pack.dataType ||
                  (pack.type === "MEDIA_ASSET_MANIFEST"
                    ? "media"
                    : pack.kind === "CORE_CONTENT"
                      ? "core"
                      : "sample"),
                targetServer:
                  pack.targetServer ||
                  (profile.target && profile.target.connectionName),
                targetRuntimeRole:
                  pack.targetRuntimeRole ||
                  (profile.target &&
                    (profile.target.runtimeRole || "WCMS_STAGED")),
              },
              pack,
            ),
          );
    return rawSteps
      .map((step, index) => this.normalizePreparationStep(step, index))
      .filter(Boolean);
  },
  /** Validates one client-safe preparation step. */
  normalizePreparationStep: function (step, index) {
    if (!step || step.enabled === false) return undefined;
    let type = String(step.type || "DATA_RELEASE");
    if (!["DATA_RELEASE", "MEDIA_ASSET_MANIFEST"].includes(type)) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation step type is unsupported",
      );
    }
    let code = String(step.code || "");
    let dataType = String(
      step.dataType || (type === "MEDIA_ASSET_MANIFEST" ? "media" : ""),
    ).toLowerCase();
    let targetServer = String(step.targetServer || step.connectionName || "");
    let targetRuntimeRole = String(
      step.targetRuntimeRole ||
        step.runtimeRole ||
        (type === "MEDIA_ASSET_MANIFEST" ? "WCMS_STAGED" : ""),
    );
    let manifestPath = String(step.manifestPath || "");
    let manifestModule = step.manifestModule ? String(step.manifestModule) : undefined;
    if (
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(
        code,
      ) ||
      !["init", "core", "sample", "media"].includes(dataType) ||
      !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(targetServer) ||
      !/^[A-Z][A-Z0-9_]{1,63}$/.test(targetRuntimeRole) ||
      (type === "MEDIA_ASSET_MANIFEST" &&
        (!manifestPath ||
          (manifestModule && (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(manifestModule) || manifestModule !== code.split(":")[0])) ||
          path.isAbsolute(manifestPath) ||
          manifestPath.split(/[\\/]+/).includes("..")))
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation step configuration is invalid",
      );
    }
    let normalized = {
      order: Number(step.order || index + 1),
      type: type,
      code: code,
      kind: String(step.kind || "DATA_RELEASE"),
      label: String(step.label || ""),
      required: step.required !== false,
      trigger: String(
        step.trigger || (step.required === false ? "USER" : "ACTIVATION"),
      ),
      dataType: dataType,
      targetServer: targetServer,
      targetRuntimeRole: targetRuntimeRole,
      manifestPath: type === "MEDIA_ASSET_MANIFEST" ? manifestPath : undefined,
      manifestModule: type === "MEDIA_ASSET_MANIFEST" ? manifestModule : undefined,
      folderCode: step.folderCode ? String(step.folderCode) : undefined,
      businessPurpose: step.businessPurpose
        ? String(step.businessPurpose)
        : undefined,
    };
    normalized.classification = this.dataPackageClassification(normalized);
    return normalized;
  },
  /** Classifies setup packages for readiness and operator guidance without becoming an import authority. */
  dataPackageClassification: function (step) {
    if (!step) return "DATA_RELEASE";
    if (step.type === "MEDIA_ASSET_MANIFEST") return "MEDIA_ASSET_MANIFEST";
    if (step.kind === "CONTENT_PACK") return "DOCUMENTATION_CONTENT_PACK";
    let code = String(step.code || "");
    let dataType = String(step.dataType || "").toLowerCase();
    let trigger = String(step.trigger || "").toUpperCase();
    if (dataType === "init" && (/^nodics[.:]/.test(code) || /^cms:/.test(code)))
      return "FRAMEWORK_BASELINE";
    if (dataType === "core") return "MODULE_BASELINE";
    if (dataType === "sample" && trigger === "USER") return "SAMPLE_DEMO";
    if (dataType === "sample") return "ACCELERATOR_BASELINE";
    if (dataType === "config") return "RUNTIME_CONFIG";
    if (trigger === "PROJECT") return "PROJECT_OVERRIDE";
    return "DATA_RELEASE";
  },
  /** Returns normalized functional capabilities required before an application can be considered ready. */
  requiredFunctionalModules: function (profile) {
    let presentation = (profile && profile.presentation) || {};
    let rawModules = [].concat(
      (profile && profile.requiredFunctionalModules) || [],
      presentation.requiredFunctionalModules || [],
    );
    return rawModules
      .map((item, index) => {
        let source = typeof item === "string" ? { code: item } : item || {};
        let code = String(source.code || source.functionalModule || "");
        if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code)) {
          throw new CLASSES.NodicsError(
            "ERR_BOF_00081",
            "Application required functional module is invalid",
          );
        }
        return {
          order: Number(source.order || index + 1),
          type: "FUNCTIONAL_MODULE",
          code: code,
          kind: String(source.kind || "Required capability"),
          label: String(source.label || this.businessCapabilityLabel(code)),
          required: source.required !== false,
          trigger: String(source.trigger || "PROJECT_REGISTRATION"),
          dataType: "capability",
          targetServer: String(source.targetServer || "platform"),
          targetRuntimeRole: String(source.targetRuntimeRole || "PLATFORM"),
        };
      })
      .filter((item) => item.required !== false);
  },
  /** Creates a business-facing label from a canonical functional module identity. */
  businessCapabilityLabel: function (functionalModule) {
    return (
      String(functionalModule || "")
        .replace(/^nodics\./, "")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[._-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (value) => value.toUpperCase()) + " capability"
    );
  },
  /** Resolves the customer project identity used by the functional-module registry. */
  projectCode: function (request) {
    let query =
      (request &&
        (request.query ||
          (request.httpRequest && request.httpRequest.query))) ||
      {};
    let configured =
      (CONFIG.get("backofficeApplicationInitialization") || {}).projectCode ||
      (request && request.project) ||
      query.project ||
      process.env.NODICS_PROJECT_CODE ||
      (typeof NODICS !== "undefined" &&
        NODICS.getEnvironmentName &&
        NODICS.getEnvironmentName());
    if (!configured)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application initialization project identity is unavailable",
      );
    return String(configured);
  },
  /** Projects required functional-module registration readiness into the application preparation contract. */
  functionalModulePreparationStatus: async function (profile, request) {
    let requirements = this.requiredFunctionalModules(profile);
    if (!requirements.length) return [];
    let catalogue = SERVICE.DefaultFunctionalModuleCatalogueService;
    if (!catalogue || typeof catalogue.getRecord !== "function") {
      return requirements.map((step) =>
        Object.assign({}, step, {
          status: "UNAVAILABLE",
          message:
            step.label +
            " cannot be checked because the module registry is unavailable.",
        }),
      );
    }
    let project = this.projectCode(request);
    let projected = [];
    for (let step of requirements) {
      try {
        let record = await catalogue.getRecord(project, step.code, request);
        let displayName = (record && record.displayName) || step.label;
        let status =
          !record || record.registrationState === "DEREGISTERED"
            ? "NOT_REGISTERED"
            : record.runtimeState !== "ACTIVE"
              ? "RUNTIME_OFFLINE"
              : record.registrationState !== "REGISTERED"
                ? "NOT_REGISTERED"
                : record.enabled !== true
                  ? "NOT_ACTIVE"
                  : "CURRENT";
        projected.push(
          Object.assign({}, step, {
            status: status,
            version: record && record.registeredVersion,
            description: String(displayName),
            runtimeState: record && record.runtimeState ? String(record.runtimeState) : undefined,
            registrationState:
              record && record.registrationState ? String(record.registrationState) : undefined,
            observedServers: this.safeObservedServers(record && record.observedServers),
            runtimeEvidence: this.functionalModuleRuntimeEvidence(record),
            message:
              status === "CURRENT"
                ? String(displayName) + " is registered and active."
                : status === "NOT_ACTIVE"
                  ? String(displayName) +
                    " is registered but not activated for this project."
                  : status === "RUNTIME_OFFLINE"
                    ? String(displayName) +
                      " is registered but no compatible runtime is active."
                    : String(displayName) +
                      " must be registered and activated in Module Registry before this application can go live.",
          }),
        );
      } catch (error) {
        projected.push(
          Object.assign({}, step, {
            status: "UNAVAILABLE",
            message:
              (error && error.message) || step.label + " cannot be checked.",
            runtimeEvidence: {
              source: "FUNCTIONAL_MODULE_CATALOGUE",
              status: "UNAVAILABLE",
              stale: true,
            },
          }),
        );
      }
    }
    return projected;
  },
  /** Returns bounded observed server identities without leaking registry internals. */
  safeObservedServers: function (servers) {
    return Array.from(
      new Set(
        [].concat(servers || [])
          .map((server) => String(server || "").trim())
          .filter(Boolean),
      ),
    ).sort();
  },
  /** Projects sanitized functional-module runtime evidence for readiness consumers. */
  functionalModuleRuntimeEvidence: function (record) {
    if (!record) {
      return {
        source: "FUNCTIONAL_MODULE_CATALOGUE",
        status: "NOT_REGISTERED",
        stale: true,
        observedServers: [],
      };
    }
    const observedServers = this.safeObservedServers(record.observedServers);
    return {
      source: "FUNCTIONAL_MODULE_CATALOGUE",
      status: record.runtimeState ? String(record.runtimeState) : "UNKNOWN",
      registrationState: record.registrationState
        ? String(record.registrationState)
        : undefined,
      enabled: record.enabled === true,
      stale: record.runtimeState !== "ACTIVE" || observedServers.length === 0,
      observedServers: observedServers,
    };
  },
  /** Executes the documented bounded module operation. */
  profile: function (code) {
    if (!/^[a-z][a-z0-9_-]{0,63}$/.test(String(code || ""))) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00080",
        "Application profile code is invalid",
      );
    }
    let configured = ((CONFIG.get("backofficeApplicationInitialization") || {})
      .profiles || {})[code];
    let profile = configured && this.resolveProfile(configured);
    if (
      !profile ||
      profile.enabled === false ||
      !profile.owner ||
      !profile.applicationCode ||
      !profile.siteCode ||
      !profile.baselineCode ||
      !profile.target ||
      !profile.target.moduleName ||
      !profile.target.connectionName ||
      profile.target.connectionName === "default"
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application initialization profile is unavailable",
      );
    }
    return Object.assign({}, profile);
  },
  /** Resolves technical target defaults at consumption time so later deployment and node choices apply to earlier customer profiles. */
  resolveProfile: function (profile) {
    const configuration =
      CONFIG.get("backofficeApplicationInitialization") || {};
    return Object.assign({}, profile, {
      target: Object.assign(
        {},
        configuration.target || {},
        profile.target || {},
      ),
    });
  },
  /** Requires a human principal for initiation while allowing authenticated status reads. */
  /** Executes the documented bounded module operation. */
  human: function (request) {
    let auth = (request && request.authData) || {};
    let principal = String(auth.principalId || auth.loginId || auth.code || "");
    if (!principal || auth.tokenType === "service") {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00082",
        "An authenticated human administrator is required",
      );
    }
    return principal;
  },
  /** Converts target runtime exceptions into a user-safe application setup message. */
  targetFailureMessage: function (targetCode, targetMessage) {
    if (
      /CMS_BASELINE_RELEASE_INVALID|INVALID_RELEASE/i.test(targetCode) ||
      /invalid release|release qualification|release is unavailable/i.test(
        targetMessage,
      )
    ) {
      return "Application setup data is invalid or unavailable. Ask a developer to repair the configured baseline release before retrying.";
    }
    if (/already running|in progress/i.test(targetMessage)) {
      return targetMessage;
    }
    if (
      /ERR_SYS_|internal error|Failed due to some internal error/i.test(
        targetCode + " " + targetMessage,
      )
    ) {
      return "Application setup could not be completed by the target runtime. Ask an operator to check the target runtime logs before retrying.";
    }
    return "Application setup could not be completed by the target runtime. Ask an operator to check the target runtime logs before retrying.";
  },
  /** Preserves sanitized target-side diagnostics for operators without exposing request credentials. */
  targetDiagnostic: function (error, profile) {
    let source =
      error && (error.data || error.result || error.response || error);
    let targetCode = String(
      (source && (source.code || source.errorCode)) ||
        (error && error.code) ||
        "UNKNOWN_TARGET_ERROR",
    );
    let remoteResponse =
      (source && source.remoteResponse) || (error && error.remoteResponse);
    let targetMessage = String(
      (source && (source.remoteMessage || source.message)) ||
        (remoteResponse &&
          (remoteResponse.message ||
            remoteResponse.error ||
            remoteResponse.reason)) ||
        (error && (error.remoteMessage || error.message)) ||
        "Unknown target error",
    );
    let targetResponseCode =
      source && source.responseCode ? String(source.responseCode) : undefined;
    return new CLASSES.NodicsError({
      code: "ERR_BOF_00085",
      message: this.targetFailureMessage(targetCode, targetMessage),
      metadata: {
        targetCode: targetCode,
        targetMessage: targetMessage,
        targetResponseCode: targetResponseCode,
        profileCode: profile.code,
        baselineCode: profile.baselineCode,
        targetModuleName: profile.target.moduleName,
      },
      causes: remoteResponse ? [remoteResponse] : undefined,
    });
  },
  /** Extracts a client-safe runtime invocation diagnostic from a framework error. */
  runtimeInvocationDiagnostic: function (error, fallback) {
    let source =
      (error && error.metadata && error.metadata.runtimeInvocationDiagnostic) ||
      (error &&
        error.contexts &&
        error.contexts
          .map((context) => context && context.runtimeInvocationDiagnostic)
          .find(Boolean)) ||
      undefined;
    if (!source && !fallback) return undefined;
    return CLASSES.NodicsError.cleanContext(
      Object.assign({}, fallback || {}, source || {}),
    );
  },
  /** Invokes one target runtime data-release operation for application preparation. */
  invokeDataReleaseOperation: function (mode, group, request) {
    let suffix = mode === "preflight" ? "validate" : "install";
    const authorization = this.authorizationHeader(request, true);
    return SERVICE.DefaultModuleService.invokeModule({
      moduleName: "import",
      // These operations intentionally use the governed HTTP import route, even in a consolidated runtime.
      local: false,
      connectionName: group.targetServer,
      connectionType: "abstract",
      targetAuthority: {
        server: group.targetServer,
        runtimeRole: { code: group.targetRuntimeRole },
      },
      methodName: "POST",
      apiName: "/" + group.dataType + "/" + suffix,
      requestBody: {
        dataType: group.dataType,
        releaseCodes: group.steps.map((step) => step.code),
        expectedReleases: group.expectedReleases,
      },
      timeoutMs: group.timeoutMs || 120000,
      maxAttempts: 1,
      idempotencyKey: mode === "execute" ? group.idempotencyKey : undefined,
      header: { Authorization: authorization },
      responseSelector: (response) =>
        response && (response.data || response.result || response),
    });
  },
  /** Groups required preparation steps by target runtime and release type. */
  preparationGroups: function (profile, request, steps) {
    let input = request.applicationInitialization || {};
    let correlationId =
      input.correlationId || request.correlationId || request.requestId;
    let groups = {};
    steps
      .filter((step) => step.required !== false && step.type === "DATA_RELEASE")
      .forEach((step) => {
        let key = [
          step.targetServer,
          step.targetRuntimeRole,
          step.dataType,
        ].join(":");
        groups[key] = groups[key] || {
          targetServer: step.targetServer,
          targetRuntimeRole: step.targetRuntimeRole,
          dataType: step.dataType,
          steps: [],
          idempotencyKey:
            profile.code +
            ":prepare:" +
            key +
            ":" +
            String(
              correlationId ||
                (request.authData && request.authData.principalId) ||
                "operator",
            ),
        };
        groups[key].steps.push(step);
      });
    return Object.values(groups).sort(
      (left, right) =>
        left.targetServer.localeCompare(right.targetServer) ||
        left.dataType.localeCompare(right.dataType),
    );
  },
  /** Converts runtime preparation faults into business-facing setup guidance. */
  preparationFailureMessage: function (step, error) {
    let rawMessage = String(
      (error && (error.remoteMessage || error.message)) || "",
    );
    let releaseCode = String(step.code || "configured setup data");
    let kind = String(step.kind || "Setup data");
    if (
      /ERR_IMP_00004|Requested data release is unavailable/i.test(rawMessage)
    ) {
      return (
        kind +
        " is not available for this application. Ask a developer to repair data release " +
        releaseCode +
        " or the application setup configuration."
      );
    }
    if (/manifest|contract version|release metadata/i.test(rawMessage)) {
      return (
        kind +
        " cannot be read from its module data manifest. Ask a developer to repair data release " +
        releaseCode +
        " before initializing this application."
      );
    }
    return (
      kind +
      " cannot be checked on " +
      String(step.targetServer || "the target runtime") +
      ". Refresh after the target runtime is ready, or ask a developer to review the application setup configuration."
    );
  },
  /** Summarizes blocked preparation without leaking target runtime exception text. */
  preparationBlockedMessage: function (preparation) {
    let steps = [].concat((preparation && preparation.steps) || []);
    let blockedStep = steps.find(
      (step) =>
        step.status !== "CURRENT" &&
        step.status !== "SOURCE_READY" &&
        step.status !== "OPTIONAL" &&
        step.message,
    );
    return (
      (blockedStep && blockedStep.message) ||
      "Application setup is blocked because required capabilities or setup data are not ready."
    );
  },
  /** Resolves a stable release identity for statuses that stop before the publication target. */
  blockedReleaseIdentity: function (profile, preparation) {
    let steps = [].concat((preparation && preparation.steps) || []);
    let releaseStep =
      steps.find(
        (step) => step.required !== false && step.type === "DATA_RELEASE",
      ) ||
      steps.find(
        (step) =>
          step.required !== false && step.type === "MEDIA_ASSET_MANIFEST",
      ) ||
      {};
    return {
      releaseCode: String(
        releaseStep.code ||
          (profile.contentPackCode &&
            "contentPack:" + profile.contentPackCode) ||
          profile.owner + ":" + profile.baselineCode,
      ),
      releaseVersion: String(
        releaseStep.version ||
          releaseStep.installedVersion ||
          profile.releaseVersion ||
          "pending setup",
      ),
    };
  },
  /** Projects a blocked application setup without invoking its final publication target. */
  blockedProjection: function (profile, preparation) {
    let releaseIdentity = this.blockedReleaseIdentity(profile, preparation);
    let projection = {
      readiness: "BLOCKED",
      releaseStatus: "PREPARATION_BLOCKED",
      preparation: preparation,
      publication: undefined,
    };
    return {
      profileCode: profile.code,
      type: profile.type,
      owner: profile.owner,
      applicationCode: profile.applicationCode,
      siteCode: profile.siteCode,
      profile: this.describe(profile),
      allowedActions: [],
      readiness: "BLOCKED",
      releaseCode: releaseIdentity.releaseCode,
      releaseVersion: releaseIdentity.releaseVersion,
      releaseStatus: projection.releaseStatus,
      preparation: preparation,
      message: this.preparationBlockedMessage(preparation),
      capability: this.capabilityProjection(profile, projection),
    };
  },
  /** Returns the business capability group for one initialization profile. */
  capabilityGroup: function (profile) {
    let presentation = (profile && profile.presentation) || {};
    if (presentation.capabilityGroup) return String(presentation.capabilityGroup);
    if (profile.type === "DOCUMENTATION_BUNDLE") return "DOCUMENTATION_PACK";
    if (String(presentation.category || "").toLowerCase() === "customization")
      return "APPLICATION_CONTENT";
    if (/STOREFRONT|WEBSITE|APPLICATION|DOMAIN/i.test(String(profile.type || "")))
      return "PROJECT_ACCELERATOR";
    return "APPLICATION_CONTENT";
  },
  /** Returns the business capability type for one initialization profile. */
  capabilityType: function (profile) {
    let presentation = (profile && profile.presentation) || {};
    if (presentation.capabilityType) return String(presentation.capabilityType);
    if (profile.type === "DOCUMENTATION_BUNDLE") return "DOCUMENTATION_PACK";
    if (/STOREFRONT|WEBSITE|APPLICATION|DOMAIN/i.test(String(profile.type || "")))
      return "ACCELERATOR";
    return "APPLICATION";
  },
  /** Maps technical initialization facts to the shared business capability lifecycle. */
  capabilityBusinessStatus: function (projection) {
    if (!projection) return "NEEDS_ATTENTION";
    if (
      projection.preparation &&
      !["CURRENT", "RUNNING"].includes(projection.preparation.status)
    )
      return "NEEDS_ATTENTION";
    if (projection.readiness === "RETIRED") return "RETIRED";
    if (
      projection.readiness === "READY" &&
      (!projection.publication || projection.publication.state !== "ONLINE")
    )
      return "NEEDS_ATTENTION";
    if (projection.readiness === "READY" && projection.releaseStatus !== "UPDATE_AVAILABLE")
      return "ONLINE";
    if (projection.readiness === "READY" && projection.releaseStatus === "UPDATE_AVAILABLE")
      return "NEEDS_ATTENTION";
    if (projection.readiness === "PUBLICATION_PENDING") return "APPROVAL_IN_PROGRESS";
    if (projection.readiness === "IMPORTED") return "APPROVAL_REQUIRED";
    if (projection.readiness === "IMPORTING") return "PREPARING";
    if (projection.readiness === "NOT_IMPORTED") return "NOT_PREPARED";
    if (projection.readiness === "ROLLED_BACK") return "PREPARED_STAGED";
    return "NEEDS_ATTENTION";
  },
  /** Projects technical blockers into stable capability-level finding codes. */
  capabilityBlockers: function (projection) {
    let blockers = [];
    let preparation = projection && projection.preparation;
    [].concat((preparation && preparation.steps) || []).forEach((step) => {
      if (["CURRENT", "SOURCE_READY", "OPTIONAL"].includes(step.status)) return;
      let code =
        step.type === "FUNCTIONAL_MODULE"
          ? step.status === "NOT_ACTIVE"
            ? "MODULE_INACTIVE"
            : step.status === "RUNTIME_OFFLINE"
              ? "RUNTIME_UNAVAILABLE"
              : "MISSING_DEPENDENCY"
          : step.type === "MEDIA_ASSET_MANIFEST"
            ? step.status === "FAILED"
              ? "MEDIA_MISSING"
              : "MEDIA_UNPUBLISHED"
            : step.status === "INVALID_RELEASE"
              ? "INVALID_MANIFEST"
              : step.status === "UPDATE_AVAILABLE"
                ? "VERSION_MISMATCH"
                : step.status === "RUNNING"
                  ? "IMPORT_IN_PROGRESS"
                  : step.status === "NOT_INSTALLED"
                    ? "IMPORT_NOT_STARTED"
                    : "IMPORT_FAILED";
      let repair = this.capabilityRepairProjection(code, {
        owner: step.code,
        targetServer: step.targetServer,
        targetRuntimeRole: step.targetRuntimeRole,
      });
      blockers.push({
        blockerCode: code,
        code: code,
        severity: this.capabilityBlockerSeverity(code, step.required, repair),
        owner: String(step.code || ""),
        ownerType: this.capabilityBlockerOwnerType(step),
        source: this.capabilityBlockerSource(step),
        message: String(
          step.message ||
            step.description ||
            step.kind ||
            "Capability preparation needs attention.",
        ),
        action: this.capabilityBlockerAction(code),
        disabledReason: this.capabilityBlockerDisabledReason(code, step),
        targetServer: step.targetServer ? String(step.targetServer) : undefined,
        targetRuntimeRole: step.targetRuntimeRole
          ? String(step.targetRuntimeRole)
          : undefined,
        technicalStatus: step.status ? String(step.status) : undefined,
        repair: repair,
        runtimeDiagnostic: step.runtimeDiagnostic,
      });
    });
    if (projection && projection.releaseStatus === "INVALID_RELEASE") {
      let repair = this.capabilityRepairProjection("INVALID_MANIFEST", {
        owner: projection.releaseCode,
      });
      blockers.push({
        blockerCode: "INVALID_MANIFEST",
        code: "INVALID_MANIFEST",
        severity: this.capabilityBlockerSeverity("INVALID_MANIFEST", true, repair),
        owner: String(projection.releaseCode || ""),
        ownerType: "SOURCE_RELEASE",
        source: "RELEASE_MANIFEST",
        message:
          "The staged release manifest is invalid and must be repaired before publication.",
        action: "Repair release manifest",
        disabledReason:
          "The source release manifest must be repaired before Axis can install or publish it.",
        technicalStatus: "INVALID_RELEASE",
        repair: repair,
      });
    }
    if (
      projection &&
      projection.readiness === "READY" &&
      (!projection.publication || projection.publication.state !== "ONLINE")
    ) {
      let code = projection.publication ? "ONLINE_POINTER_STALE" : "PUBLICATION_RECEIPT_MISSING";
      let repair = this.capabilityRepairProjection(code, {
        owner: projection.releaseCode,
      });
      blockers.push({
        blockerCode: code,
        code: code,
        severity: this.capabilityBlockerSeverity(code, true, repair),
        owner: String(projection.releaseCode || ""),
        ownerType: "PUBLICATION",
        source: "ONLINE_PUBLICATION",
        message: projection.publication
          ? "The publication is marked ready, but the Online pointer is not confirmed."
          : "The publication is marked ready, but no publication receipt was returned.",
        action: code === "ONLINE_POINTER_STALE"
          ? "Refresh Online publication pointer"
          : "Reconcile publication receipt",
        disabledReason:
          "Publication evidence is incomplete; reconcile the Online pointer or receipt before treating this capability as Online.",
        technicalStatus:
          projection.publication && projection.publication.state
            ? String(projection.publication.state)
            : "MISSING_PUBLICATION",
        repair: repair,
      });
    }
    if (projection && projection.readiness === "PUBLICATION_PENDING") {
      let approvalDiagnostic = this.approvalWorkflowDiagnostic(projection);
      let publication = projection.publication || {};
      let code =
        approvalDiagnostic.status === "TASK_REFERENCE_MISSING"
          ? "APPROVAL_TASK_MISSING"
          : approvalDiagnostic.status === "TASK_ASSIGNEE_MISSING"
            ? "APPROVAL_TASK_ASSIGNEE_MISSING"
            : approvalDiagnostic.status === "TASK_NOT_ACTIONABLE"
              ? "APPROVAL_TASK_UNACTIONABLE"
              : "APPROVAL_IN_PROGRESS";
      let repair = publication.workflowRef
        ? this.capabilityRepairProjection("APPROVAL_IN_PROGRESS", {
            owner: publication.code || projection.releaseCode,
          })
        : this.capabilityRepairProjection("APPROVAL_TASK_MISSING", {
            owner: publication.code || projection.releaseCode,
          });
      blockers.push({
        blockerCode: code,
        code: code,
        severity: this.capabilityBlockerSeverity(code, !publication.workflowRef, repair),
        owner: String(publication.code || projection.releaseCode || ""),
        ownerType: "PROCESS_WORKFLOW",
        source: "PUBLICATION_APPROVAL",
        message: approvalDiagnostic.message,
        action: approvalDiagnostic.suggestedAction,
        disabledReason: approvalDiagnostic.disabledReason,
        technicalStatus: approvalDiagnostic.status,
        repair: repair,
        approvalDiagnostic: approvalDiagnostic,
      });
    }
    return blockers;
  },
  /** Maps raw preparation source data to a stable repair severity. */
  capabilityBlockerSeverity: function (code, required, repair) {
    if (required === false || code === "APPROVAL_IN_PROGRESS") return "INFO";
    if (repair && repair.available === true) return "REPAIR_REQUIRED";
    if (["VERSION_MISMATCH", "IMPORT_IN_PROGRESS"].includes(code)) return "WARNING";
    return "BLOCKED";
  },
  /** Classifies which authority owns the fix for one blocker. */
  capabilityBlockerOwnerType: function (step) {
    if (!step) return "UNKNOWN";
    if (step.type === "FUNCTIONAL_MODULE") return "MODULE_REGISTRY";
    if (step.type === "MEDIA_ASSET_MANIFEST") return "MEDIA_MODULE";
    if (step.type === "DATA_RELEASE") return "DATA_RELEASE";
    return "APPLICATION_PROFILE";
  },
  /** Classifies which readiness source produced one blocker. */
  capabilityBlockerSource: function (step) {
    if (!step) return "UNKNOWN";
    if (step.type === "FUNCTIONAL_MODULE") return "MODULE_REGISTRY";
    if (step.type === "MEDIA_ASSET_MANIFEST") return "MEDIA_MANIFEST";
    if (step.type === "DATA_RELEASE") return "IMPORT_PREFLIGHT";
    return "APPLICATION_PREPARATION";
  },
  /** Returns a concise disabled-action explanation for Axis buttons/tooltips. */
  capabilityBlockerDisabledReason: function (code, step) {
    let target = step && (step.targetServer || step.targetRuntimeRole);
    return (
      {
        MODULE_INACTIVE:
          "This capability depends on a module that is not registered and active.",
        RUNTIME_UNAVAILABLE:
          "No active runtime currently owns the required module route.",
        MISSING_DEPENDENCY:
          "A required framework or accelerator capability is not ready.",
        MEDIA_MISSING:
          "Required media references are missing from the owning media manifest.",
        MEDIA_UNPUBLISHED:
          "Required media assets must be prepared before publication.",
        INVALID_MANIFEST:
          "The source release manifest is invalid and cannot be installed.",
        VERSION_MISMATCH:
          "The staged data version does not match the expected release version.",
        IMPORT_IN_PROGRESS:
          "The import runtime is still processing this release.",
        IMPORT_NOT_STARTED:
          "Required setup data has not been installed yet.",
        IMPORT_FAILED:
          "The target import preflight failed for " +
          String(target || "the configured runtime") +
          ".",
      }[code] || "Readiness is blocked by a capability dependency."
    );
  },
  /** Returns a guided recovery label for one blocker code. */
  capabilityBlockerAction: function (code) {
    return (
      {
        MODULE_INACTIVE: "Register and activate module",
        RUNTIME_UNAVAILABLE: "Start or repair target runtime",
        MISSING_DEPENDENCY: "Prepare required dependency",
        MEDIA_MISSING: "Repair media manifest",
        MEDIA_UNPUBLISHED: "Prepare media assets",
        INVALID_MANIFEST: "Repair release manifest",
        VERSION_MISMATCH: "Update staged release",
        IMPORT_IN_PROGRESS: "Refresh readiness",
        IMPORT_NOT_STARTED: "Prepare capability",
        IMPORT_FAILED: "Retry failed import",
      }[code] || "Review capability readiness"
    );
  },
  /** Returns client-safe repair metadata for a readiness blocker without inventing browser authority. */
  capabilityRepairProjection: function (code, context) {
    let owner = context && context.owner ? String(context.owner) : undefined;
    let targetServer =
      context && context.targetServer ? String(context.targetServer) : undefined;
    let targetRuntimeRole =
      context && context.targetRuntimeRole
        ? String(context.targetRuntimeRole)
        : undefined;
    let definitions = {
      MODULE_INACTIVE: {
        available: false,
        label: "Activate module in Module Registry",
        operation: "moduleRegistry.activate",
        action: "ACTIVATE_REQUIRED_MODULE",
        idempotent: false,
        requiresConfirmation: true,
      },
      RUNTIME_UNAVAILABLE: {
        available: false,
        label: "Restore target runtime",
        operation: "runtimeTopology.restoreRuntime",
        action: "RESTORE_RUNTIME",
        idempotent: true,
        requiresConfirmation: true,
      },
      MISSING_DEPENDENCY: {
        available: false,
        label: "Prepare required dependency",
        operation: "moduleRegistry.prepareDependency",
        action: "PREPARE_DEPENDENCY",
        idempotent: true,
        requiresConfirmation: true,
      },
      MEDIA_MISSING: {
        available: true,
        label: "Rebuild media references",
        operation: "applicationInitialization.prepareCapability",
        action: "REBUILD_MEDIA_REFERENCES",
        idempotent: true,
        requiresConfirmation: false,
      },
      MEDIA_UNPUBLISHED: {
        available: true,
        label: "Prepare media assets",
        operation: "applicationInitialization.prepareCapability",
        action: "PREPARE_MEDIA_ASSETS",
        idempotent: true,
        requiresConfirmation: false,
      },
      INVALID_MANIFEST: {
        available: false,
        label: "Repair release manifest source",
        operation: "source.releaseManifest.repair",
        action: "REPAIR_RELEASE_MANIFEST_SOURCE",
        idempotent: false,
        requiresConfirmation: true,
      },
      VERSION_MISMATCH: {
        available: true,
        label: "Update staged release",
        operation: "applicationInitialization.prepareCapability",
        action: "UPDATE_STAGED_RELEASE",
        idempotent: true,
        requiresConfirmation: false,
      },
      IMPORT_IN_PROGRESS: {
        available: true,
        label: "Refresh readiness",
        operation: "applicationInitialization.status",
        action: "REFRESH_READINESS",
        idempotent: true,
        requiresConfirmation: false,
      },
      IMPORT_NOT_STARTED: {
        available: true,
        label: "Prepare capability",
        operation: "applicationInitialization.prepareCapability",
        action: "PREPARE_CAPABILITY",
        idempotent: true,
        requiresConfirmation: false,
      },
      IMPORT_FAILED: {
        available: true,
        label: "Retry failed import",
        operation: "applicationInitialization.prepareCapability",
        action: "RETRY_FAILED_IMPORT",
        idempotent: true,
        requiresConfirmation: false,
      },
      APPROVAL_TASK_MISSING: {
        available: true,
        label: "Reconcile publication approval",
        operation: "applicationInitialization.reconcileApproval",
        action: "RECONCILE_APPROVAL_TASK",
        idempotent: true,
        requiresConfirmation: false,
      },
      APPROVAL_IN_PROGRESS: {
        available: false,
        label: "Review approval queue",
        operation: "process.reviewApprovalTask",
        action: "REVIEW_APPROVAL_TASK",
        idempotent: true,
        requiresConfirmation: false,
      },
      APPROVAL_TASK_ASSIGNEE_MISSING: {
        available: false,
        label: "Assign publication approval task",
        operation: "process.assignApprovalTask",
        action: "ASSIGN_APPROVAL_TASK",
        idempotent: true,
        requiresConfirmation: true,
      },
      APPROVAL_TASK_UNACTIONABLE: {
        available: false,
        label: "Review Process workflow state",
        operation: "process.reviewApprovalTask",
        action: "REVIEW_APPROVAL_TASK_STATE",
        idempotent: true,
        requiresConfirmation: false,
      },
      ONLINE_POINTER_STALE: {
        available: false,
        label: "Refresh Online publication pointer",
        operation: "publishing.refreshOnlinePointer",
        action: "REFRESH_ONLINE_POINTER",
        idempotent: true,
        requiresConfirmation: true,
      },
      PUBLICATION_RECEIPT_MISSING: {
        available: false,
        label: "Reconcile publication receipt",
        operation: "publishing.reconcileReceipt",
        action: "RECONCILE_PUBLICATION_RECEIPT",
        idempotent: true,
        requiresConfirmation: true,
      },
    };
    let repair = definitions[code];
    if (!repair) return undefined;
    return Object.assign({}, repair, {
      owner: owner,
      targetServer: targetServer,
      targetRuntimeRole: targetRuntimeRole,
      eligibility: repair.available
        ? repair.requiresConfirmation
          ? "MANUAL"
          : "AUTOMATIC"
        : "NOT_AVAILABLE",
      unavailableReason: repair.available
        ? undefined
        : "The owning module, source release, runtime, or workflow authority must perform this repair.",
    });
  },
  /** Projects current publication approval evidence without querying Process from the browser. */
  approvalWorkflowDiagnostic: function (projection) {
    let publication = (projection && projection.publication) || {};
    let ownerDiagnostic = publication.approvalDiagnostic || projection && projection.approvalDiagnostic;
    let workflowRef = publication.workflowRef ? String(publication.workflowRef) : undefined;
    let task = publication.approvalTask || publication.workflowTask || publication.task;
    if (ownerDiagnostic && ownerDiagnostic.status) {
      return Object.assign({}, ownerDiagnostic, {
        source: ownerDiagnostic.source || "PUBLICATION_APPROVAL",
        publicationCode: ownerDiagnostic.publicationCode || (publication.code ? String(publication.code) : undefined),
        publicationState: ownerDiagnostic.publicationState || (publication.state ? String(publication.state) : undefined),
        workflowRef: ownerDiagnostic.workflowRef || workflowRef,
        taskCode: ownerDiagnostic.taskCode || (task && task.code ? String(task.code) : undefined),
        taskStatus: ownerDiagnostic.taskStatus || (task && task.status ? String(task.status) : undefined),
        message: ownerDiagnostic.message || "Publication approval diagnostic is unavailable.",
        suggestedAction: ownerDiagnostic.suggestedAction || "Refresh publication approval readiness",
        disabledReason: ownerDiagnostic.disabledReason || "Process approval evidence is unavailable.",
      });
    }
    let taskStatus = task && task.status ? String(task.status) : undefined;
    let assignee = task && task.assignee ? String(task.assignee) : undefined;
    let queue = task && (task.queue || task.candidateGroup || task.assignment)
      ? String(task.queue || task.candidateGroup || task.assignment)
      : undefined;
    let actionable = taskStatus
      ? ["OPEN", "CLAIMED", "ESCALATED"].includes(taskStatus)
      : undefined;
    let hasPublicationEvidence = Object.keys(publication).length > 0;
    let status =
      !projection || projection.readiness !== "PUBLICATION_PENDING"
        ? projection && projection.readiness === "READY"
          ? "APPROVED"
          : "NOT_STARTED"
        : !hasPublicationEvidence
          ? "PUBLICATION_MISSING"
          : !workflowRef
            ? "TASK_REFERENCE_MISSING"
            : task && actionable === false
              ? "TASK_NOT_ACTIONABLE"
              : task && task.requiresAssignee === true && !assignee && !queue
                ? "TASK_ASSIGNEE_MISSING"
                : "WAITING_REVIEWER";
    let messages = {
      APPROVED: "Publication approval is complete.",
      NOT_STARTED: "Publication approval has not been requested yet.",
      PUBLICATION_MISSING:
        "Publication is pending approval, but publication evidence is unavailable.",
      TASK_REFERENCE_MISSING:
        "Publication is pending approval, but no workflow task reference is available.",
      TASK_ASSIGNEE_MISSING:
        "Publication approval task exists but has no assignee or review queue evidence.",
      TASK_NOT_ACTIONABLE:
        "Publication approval workflow reference exists, but the known task is not open for decision.",
      PROVIDER_UNAVAILABLE:
        "Process approval diagnostic is unavailable.",
      WAITING_REVIEWER: "Publication is waiting for reviewer decision.",
    };
    let actions = {
      APPROVED: "Monitor Online publication",
      NOT_STARTED: "Request publication approval",
      PUBLICATION_MISSING: "Reconcile publication approval",
      TASK_REFERENCE_MISSING: "Reconcile publication approval",
      TASK_ASSIGNEE_MISSING: "Assign approval task",
      TASK_NOT_ACTIONABLE: "Review Process workflow state",
      PROVIDER_UNAVAILABLE: "Check Process runtime connectivity",
      WAITING_REVIEWER: "Review approval queue",
    };
    let disabled = {
      APPROVED: "The governed Process approval has completed.",
      NOT_STARTED:
        "The staged publication must be submitted for governed approval before reviewers can decide.",
      PUBLICATION_MISSING:
        "The publication approval state is incomplete; reconcile approval before continuing.",
      TASK_REFERENCE_MISSING:
        "The publication has no actionable Process task reference; reconcile approval before continuing.",
      TASK_ASSIGNEE_MISSING:
        "The Process task needs assignee or queue evidence before Axis can present a decision path.",
      TASK_NOT_ACTIONABLE:
        "The Process task is not currently open, claimed, or escalated for decision.",
      PROVIDER_UNAVAILABLE:
        "Process approval evidence is unavailable; check runtime connectivity before deciding.",
      WAITING_REVIEWER:
        "The publication is waiting for a governed Process reviewer decision.",
    };
    return {
      source: "PUBLICATION_APPROVAL",
      status: status,
      publicationCode: publication.code ? String(publication.code) : undefined,
      publicationState: publication.state ? String(publication.state) : undefined,
      workflowRef: workflowRef,
      taskCode: task && task.code ? String(task.code) : undefined,
      taskStatus: taskStatus,
      assignee: assignee,
      queue: queue,
      message: messages[status],
      suggestedAction: actions[status],
      disabledReason: disabled[status],
    };
  },
  /** Builds a backend-owned dependency projection for Axis pages without exposing implementation internals. */
  capabilityDependencies: function (profile, projection) {
    let dependencies = [];
    let target = (profile && profile.target) || {};
    if (target.connectionName || target.runtimeRole) {
      dependencies.push({
        kind: "RUNTIME",
        code: String(target.connectionName || target.runtimeRole || "target"),
        label: "Publication target runtime",
        required: true,
        server: target.connectionName ? String(target.connectionName) : undefined,
        runtimeRole: target.runtimeRole ? String(target.runtimeRole) : "WCMS_STAGED",
        status: projection && projection.readiness === "BLOCKED" ? "UNKNOWN" : "AVAILABLE",
      });
    }
    [].concat((profile && profile.dataPackages) || []).forEach((pack) => {
      let step = this.dependencyStep(pack, projection);
      dependencies.push({
        kind:
          pack.type === "MEDIA_ASSET_MANIFEST"
            ? "MEDIA"
            : pack.type === "FUNCTIONAL_MODULE"
              ? "MODULE"
              : "DATA_RELEASE",
        code: String(pack.code),
        label: String(pack.kind || pack.code),
        required: pack.required !== false,
        trigger: pack.trigger ? String(pack.trigger) : undefined,
        dataType: pack.dataType ? String(pack.dataType) : undefined,
        classification: pack.classification || this.dataPackageClassification(pack),
        server: pack.targetServer ? String(pack.targetServer) : undefined,
        runtimeRole: pack.targetRuntimeRole ? String(pack.targetRuntimeRole) : undefined,
        status: this.dependencyStatus(pack, projection),
        evidence: this.dependencyEvidence(step),
      });
    });
    [].concat((profile && profile.presentation && profile.presentation.requiredFunctionalModules) || []).forEach((module) => {
      let dependency = { code: module.code, type: "FUNCTIONAL_MODULE" };
      let step = this.dependencyStep(dependency, projection);
      dependencies.push({
        kind: "MODULE",
        code: String(module.code),
        label: String(module.label || module.code),
        required: module.required !== false,
        classification: "FUNCTIONAL_MODULE",
        status: this.dependencyStatus(dependency, projection),
        evidence: this.dependencyEvidence(step),
      });
    });
    let approvalDiagnostic = this.approvalWorkflowDiagnostic(projection);
    dependencies.push({
      kind: "PROCESS",
      code: "publicationApproval",
      label: "Governed publication approval",
      required: true,
      status:
        approvalDiagnostic.status === "WAITING_REVIEWER"
          ? "PENDING"
          : approvalDiagnostic.status === "APPROVED"
            ? "CURRENT"
            : ["TASK_REFERENCE_MISSING", "TASK_ASSIGNEE_MISSING", "TASK_NOT_ACTIONABLE", "PUBLICATION_MISSING"].includes(approvalDiagnostic.status)
              ? "UNAVAILABLE"
              : "NOT_STARTED",
      evidence: {
        approvalDiagnostic: approvalDiagnostic,
      },
    });
    dependencies.push({
      kind: "ONLINE_PUBLICATION",
      code: "onlinePointer",
      label: "Online publication pointer",
      required: true,
      status:
        projection &&
        projection.publication &&
        projection.publication.state === "ONLINE"
          ? "CURRENT"
          : "NOT_READY",
    });
    return dependencies;
  },
  /** Finds the preparation step backing one dependency projection. */
  dependencyStep: function (dependency, projection) {
    let steps = [].concat(
      (projection && projection.preparation && projection.preparation.steps) || [],
    );
    return steps.find((item) => item.code === dependency.code);
  },
  /** Returns the current status for a declared dependency from the preparation projection. */
  dependencyStatus: function (dependency, projection) {
    let step = this.dependencyStep(dependency, projection);
    if (!step) return "UNKNOWN";
    if (["CURRENT", "SOURCE_READY", "OPTIONAL"].includes(step.status)) return "CURRENT";
    if (["NOT_INSTALLED", "NOT_REGISTERED"].includes(step.status)) return "NOT_STARTED";
    if (["UPDATE_AVAILABLE", "DOWNGRADE_AVAILABLE"].includes(step.status)) return "VERSION_MISMATCH";
    if (["RUNNING", "IMPORTING"].includes(step.status)) return "IN_PROGRESS";
    if (["RUNTIME_OFFLINE", "UNAVAILABLE"].includes(step.status)) return "UNAVAILABLE";
    return String(step.status || "UNKNOWN");
  },
  /** Projects sanitized evidence for dependency rows and graph nodes. */
  dependencyEvidence: function (step) {
    if (!step) return undefined;
    let evidence = {};
    if (step.runtimeState) evidence.runtimeState = String(step.runtimeState);
    if (step.registrationState) evidence.registrationState = String(step.registrationState);
    if (Array.isArray(step.observedServers)) {
      evidence.observedServers = this.safeObservedServers(step.observedServers);
    }
    if (step.targetServer) evidence.targetServer = String(step.targetServer);
    if (step.targetRuntimeRole)
      evidence.targetRuntimeRole = String(step.targetRuntimeRole);
    if (step.runtimeEvidence) evidence.runtimeEvidence = step.runtimeEvidence;
    if (step.runtimeDiagnostic) evidence.runtimeDiagnostic = step.runtimeDiagnostic;
    if (step.classification) evidence.classification = String(step.classification);
    if (step.trigger) evidence.trigger = String(step.trigger);
    if (step.dataType) evidence.dataType = String(step.dataType);
    return Object.keys(evidence).length ? evidence : undefined;
  },
  /** Builds a compact graph so UI pages can explain cross-runtime readiness order. */
  capabilityDependencyGraph: function (profile, projection) {
    let dependencies = this.capabilityDependencies(profile, projection);
    let capabilityCode = String(((profile && profile.presentation) || {}).capabilityCode || profile.code);
    let nodes = [
      { id: capabilityCode, kind: "CAPABILITY", label: String(((profile && profile.presentation) || {}).title || profile.code) },
    ].concat(
      dependencies.map((dependency) => ({
        id: dependency.kind + ":" + dependency.code,
        kind: dependency.kind,
        label: dependency.label,
        status: dependency.status,
        evidence: dependency.evidence,
      })),
    );
    let edges = dependencies.map((dependency) => ({
      from: dependency.kind + ":" + dependency.code,
      to: capabilityCode,
      relationship: "REQUIRED_FOR",
    }));
    return { nodes: nodes, edges: edges };
  },
  /** Summarizes installation, approval, Online, runtime, and media state for business users. */
  capabilityPublicationSummary: function (projection, blockers) {
    let blockerCodes = new Set(blockers.map((blocker) => blocker.code));
    return {
      installed:
        projection && projection.preparation && projection.preparation.status === "CURRENT"
          ? "CURRENT"
          : projection && projection.preparation
            ? String(projection.preparation.status)
            : "UNKNOWN",
      staged:
        projection && projection.releaseStatus ? String(projection.releaseStatus) : "UNKNOWN",
      approval: this.approvalWorkflowDiagnostic(projection).status,
      online:
        projection && projection.publication && projection.publication.state === "ONLINE"
          ? "ONLINE"
          : blockerCodes.has("ONLINE_POINTER_STALE") ||
              blockerCodes.has("PUBLICATION_RECEIPT_MISSING")
            ? "NEEDS_REPAIR"
            : "NOT_ONLINE",
      runtime:
        blockers.some((blocker) => blocker.code === "RUNTIME_UNAVAILABLE")
          ? "UNAVAILABLE"
          : blockers.some((blocker) => blocker.runtimeDiagnostic)
            ? "NEEDS_ATTENTION"
            : "AVAILABLE",
      media:
        blockerCodes.has("MEDIA_MISSING") || blockerCodes.has("MEDIA_UNPUBLISHED")
          ? "NEEDS_REPAIR"
          : "READY_OR_NOT_REQUIRED",
    };
  },
  /** Builds the shared business capability readiness projection consumed by Axis pages. */
  capabilityProjection: function (profile, projection) {
    let presentation = (profile && profile.presentation) || {};
    let blockers = this.capabilityBlockers(projection);
    let businessStatus = this.capabilityBusinessStatus(projection);
    let blockingAction = blockers.find((item) =>
      ["BLOCKED", "REPAIR_REQUIRED"].includes(item.severity),
    );
    let evaluatedAt = new Date().toISOString();
    return {
      subject: {
        type: "APPLICATION_CAPABILITY",
        code: String(presentation.capabilityCode || profile.code),
        owner: String(profile.owner),
        applicationCode: String(profile.applicationCode),
        siteCode: String(profile.siteCode),
      },
      status: businessStatus,
      capabilityCode: String(presentation.capabilityCode || profile.code),
      displayName: String(presentation.title || profile.code),
      owningModule: String(profile.owner),
      capabilityType: this.capabilityType(profile),
      group: this.capabilityGroup(profile),
      businessStatus: businessStatus,
      technicalStatus: String((projection && projection.readiness) || "UNKNOWN"),
      releaseStatus: projection && projection.releaseStatus ? String(projection.releaseStatus) : undefined,
      lastEvaluatedAt: evaluatedAt,
      source: "backoffice.applicationInitialization",
      stale: false,
      dependencies: this.capabilityDependencies(profile, projection),
      dependencyGraph: this.capabilityDependencyGraph(profile, projection),
      blockers: blockers,
      repairActions: blockers.map((blocker) => blocker.repair).filter(Boolean),
      publicationSummary: this.capabilityPublicationSummary(projection, blockers),
      approvalDiagnostic: this.approvalWorkflowDiagnostic(projection),
      disabledReason: blockingAction ? blockingAction.disabledReason || blockingAction.message : undefined,
      nextAction:
        blockingAction?.action ||
        blockers[0]?.action ||
        (businessStatus === "ONLINE" ? "Monitor Online readiness" : "Prepare capability"),
    };
  },
  /** Returns current preparation state for every declared data-release dependency. */
  preparationStatus: async function (profile, request) {
    let steps = this.preparationSteps(profile);
    let functionalModuleSteps = await this.functionalModulePreparationStatus(
      profile,
      request,
    );
    if (!steps.length && !functionalModuleSteps.length)
      return { status: "CURRENT", steps: [] };
    let projected = [];
    let groups = this.preparationGroups(profile, request, steps);
    for (let group of groups) {
      try {
        let result = await this.invokeDataReleaseOperation(
          "preflight",
          group,
          request,
        );
        let releases =
          (result && result.releases) ||
          (result && result.data && result.data.releases) ||
          [];
        let byCode = Object.fromEntries(
          releases.map((release) => [release.releaseCode, release]),
        );
        group.steps.forEach((step) => {
          let release = byCode[step.code] || {};
          projected.push(
            Object.assign({}, step, {
              status: String(release.status || "UNKNOWN"),
              version: release.version,
              installedVersion: release.installedVersion,
              description: release.description,
            }),
          );
        });
      } catch (error) {
        group.steps.forEach((step) =>
          projected.push(
            Object.assign({}, step, {
              status: "UNAVAILABLE",
              message: this.preparationFailureMessage(step, error),
              runtimeDiagnostic: this.runtimeInvocationDiagnostic(error, {
                phase: "preparation",
                targetServer: group.targetServer,
                targetRuntimeRole: group.targetRuntimeRole,
                targetModule: "import",
                suggestedAction:
                  "Start the target import runtime or repair its runtime registration and service credential.",
              }),
            }),
          ),
        );
      }
    }
    steps
      .filter(
        (step) =>
          step.required !== false && step.type === "MEDIA_ASSET_MANIFEST",
      )
      .forEach((step) => {
        let count = this.mediaManifestAssetCount(step);
        projected.push(
          Object.assign({}, step, {
            status: count > 0 ? "SOURCE_READY" : "FAILED",
            version: String(count),
            description:
              count > 0
                ? String(count) + " media assets declared"
                : "Media asset manifest is empty or unavailable",
          }),
        );
      });
    steps
      .filter((step) => step.required === false)
      .forEach((step) =>
        projected.push(
          Object.assign({}, step, {
            status: "OPTIONAL",
          }),
        ),
      );
    projected = projected.concat(functionalModuleSteps);
    return {
      status: projected.some((step) =>
        [
          "INVALID_RELEASE",
          "DOWNGRADE_AVAILABLE",
          "UNAVAILABLE",
          "NOT_REGISTERED",
          "NOT_ACTIVE",
          "RUNTIME_OFFLINE",
        ].includes(step.status),
      )
        ? "BLOCKED"
        : projected.some((step) => step.status === "RUNNING")
          ? "RUNNING"
          : projected
                .filter((step) => step.required !== false)
                .every((step) =>
                  ["CURRENT", "SOURCE_READY"].includes(step.status),
                )
            ? "CURRENT"
            : "ACTION_REQUIRED",
      steps: projected.sort((left, right) => left.order - right.order),
    };
  },
  /** Returns the configured project root used only for declared project-owned setup assets. */
  projectRoot: function () {
    let configured =
      (CONFIG.get("backofficeApplicationInitialization") || {}).projectRoot ||
      process.env.NODICS_PROJECT_ROOT ||
      process.cwd();
    return path.resolve(String(configured));
  },
  /** Resolves a manifest path without allowing profile data to escape the project root. */
  safeProjectPath: function (relativePath) {
    let root = this.projectRoot();
    let resolved = path.resolve(root, String(relativePath || ""));
    if (!resolved.startsWith(root + path.sep)) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation asset path is outside the project root",
      );
    }
    return resolved;
  },
  /** Resolves a declared module-owned manifest through the canonical module registry, preserving project-relative compatibility. */
  safeManifestPath: function (step) {
    if (!step.manifestModule) return this.safeProjectPath(step.manifestPath);
    const owner = typeof NODICS.getRawModule === "function" && NODICS.getRawModule(step.manifestModule);
    const relativePath = String(step.manifestPath || "");
    if (!owner || !owner.path || !relativePath || path.isAbsolute(relativePath) || relativePath.split(/[\\/]+/).includes("..")) {
      throw new CLASSES.NodicsError("ERR_BOF_00081", "Application preparation manifest requires a declared module-relative source");
    }
    const root = fs.realpathSync(owner.path);
    const resolved = fs.realpathSync(path.resolve(root, relativePath));
    if (!resolved.startsWith(root + path.sep) || !fs.statSync(resolved).isFile()) {
      throw new CLASSES.NodicsError("ERR_BOF_00081", "Application preparation manifest escapes its owning module");
    }
    return resolved;
  },
  /** Confines media payloads to the declared manifest's files directory, including symlink resolution. */
  safeManifestAssetPath: function (step, fileName) {
    const manifest = this.safeManifestPath(step);
    const root = fs.realpathSync(path.join(path.dirname(manifest), "files"));
    if (!root.startsWith(path.dirname(manifest) + path.sep))
      throw new CLASSES.NodicsError("ERR_BOF_00085", "Application preparation media directory escapes its manifest directory");
    const relativePath = String(fileName || "");
    if (!relativePath || path.isAbsolute(relativePath) || relativePath.split(/[\\/]+/).includes(".."))
      throw new CLASSES.NodicsError("ERR_BOF_00085", "Application preparation media asset path is invalid");
    const resolved = fs.realpathSync(path.resolve(root, relativePath));
    if (!resolved.startsWith(root + path.sep) || !fs.statSync(resolved).isFile())
      throw new CLASSES.NodicsError("ERR_BOF_00085", "Application preparation media asset escapes its manifest directory");
    return resolved;
  },
  /** Counts declared media assets without exposing local file paths to the browser. */
  mediaManifestAssetCount: function (step) {
    try {
      let manifestPath = this.safeManifestPath(step);
      delete require.cache[require.resolve(manifestPath)];
      let assets = require(manifestPath);
      return Array.isArray(assets) ? assets.length : 0;
    } catch (error) {
      return 0;
    }
  },
  /** Reads declared media identities from owner-scoped asset manifests for the governed Online release. */
  mediaManifestCodes: function (profile) {
    let codes = new Set();
    this.preparationSteps(profile)
      .filter(
        (step) =>
          step.type === "MEDIA_ASSET_MANIFEST" && step.required !== false,
      )
      .forEach((step) => {
        let manifestPath = this.safeManifestPath(step);
        delete require.cache[require.resolve(manifestPath)];
        let assets = require(manifestPath);
        if (!Array.isArray(assets)) return;
        assets.forEach((asset) => {
          let code = asset && (asset.mediaCode || asset.code);
          if (code) codes.add(String(code));
        });
      });
    return Array.from(codes).sort();
  },
  /** Returns a browser/request token when available so media-owned upload permissions stay human governed. */
  authorizationHeader: function (request, requireHuman = false) {
    let headers =
      (request && request.httpRequest && request.httpRequest.headers) || {};
    let authorization = headers.authorization || headers.Authorization;
    if (requireHuman) {
      this.human(request);
      if (typeof authorization !== "string" || !/^Bearer\s+\S+$/i.test(authorization)) {
        throw new CLASSES.NodicsError("ERR_BOF_00082", "Operator bearer authorization is required for application data installation");
      }
    }
    if (authorization) return authorization;
    let token = NODICS.getInternalAuthToken(request.tenant);
    if (!token)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00083",
        "Application initialization service authentication is unavailable",
      );
    return "Bearer " + token;
  },
  /** Resolves the allowed operator origin used by governed server-side media preparation. */
  operatorOrigin: function (request) {
    let httpHeaders =
      (request && request.httpRequest && request.httpRequest.headers) || {};
    let requestHeaders = (request && request.headers) || {};
    let configured = (CONFIG.get("backofficeApplicationInitialization") || {})
      .operatorOrigin;
    let origin =
      httpHeaders.origin ||
      httpHeaders.Origin ||
      requestHeaders.origin ||
      requestHeaders.Origin ||
      configured;
    if (typeof origin !== "string" || !origin)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00083",
        "An explicit operator origin is required for governed media preparation",
      );
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00083",
        "Operator origin is invalid",
      );
    }
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin ||
      parsed.username ||
      parsed.password
    )
      throw new CLASSES.NodicsError(
        "ERR_BOF_00083",
        "Operator origin must be an HTTP origin",
      );
    return parsed.origin;
  },
  /** Resolves a runtime registry owner into the module's HTTP base URL. */
  moduleBaseUrl: async function (serverCode, moduleName, runtimeRole) {
    const resolver = SERVICE.DefaultBackofficeRegistryService;
    if (!resolver || typeof resolver.resolveRuntimeOwner !== "function") {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation runtime registry is unavailable",
      );
    }
    const candidates = Array.from(
      new Set(
        [
          String(serverCode || ""),
          String(serverCode || "").replace(/Server$/, ""),
          /Server$/.test(String(serverCode || ""))
            ? String(serverCode || "")
            : String(serverCode || "") + "Server",
        ].filter(Boolean),
      ),
    );
    let owner;
    for (const candidate of candidates) {
      owner = await resolver.resolveRuntimeOwner({
        moduleName,
        connectionName: candidate,
        targetAuthority: {
          server: candidate,
          runtimeRole: runtimeRole ? { code: runtimeRole } : undefined,
        },
      });
      if (owner && owner.endpoint) break;
    }
    if (!owner || !owner.endpoint) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation target runtime is unavailable",
      );
    }
    return String(owner.endpoint).replace(
      new RegExp("/" + moduleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"),
      "",
    );
  },
  /** Uploads one declared media asset through the media-owned upload API. */
  uploadMediaAsset: async function (step, asset, request) {
    let filePath = this.safeManifestAssetPath(step, asset.fileName);
    let buffer = fs.readFileSync(filePath);
    let form = new FormData();
    let extension = path.extname(String(asset.fileName || "")).toLowerCase();
    let mimeType =
      asset.mimeType ||
      (extension === ".jpg" || extension === ".jpeg"
        ? "image/jpeg"
        : extension === ".png"
          ? "image/png"
          : extension === ".webp"
            ? "image/webp"
            : extension === ".svg"
              ? "image/svg+xml"
              : "application/octet-stream");
    form.append(
      "file",
      new Blob([buffer], { type: mimeType }),
      String(asset.fileName),
    );
    form.append(
      "folderCode",
      String(asset.folderCode || step.folderCode || "cmsAssets"),
    );
    form.append("formatCode", String(asset.formatCode || "original"));
    form.append("mediaCode", String(asset.mediaCode || asset.code));
    form.append("name", String(asset.name || asset.mediaCode || asset.code));
    form.append(
      "description",
      String(asset.description || asset.name || asset.mediaCode || asset.code),
    );
    form.append("moduleName", "media");
    form.append("schemaName", "media");
    form.append(
      "businessPurpose",
      String(
        asset.businessPurpose || step.businessPurpose || "APPLICATION_CONTENT",
      ),
    );
    form.append("ownerType", String(asset.ownerType || "CMS_COMPONENT"));
    form.append(
      "ownerReference",
      String(
        asset.ownerCode ||
          asset.ownerReference ||
          asset.mediaCode ||
          asset.code,
      ),
    );
    let response = await fetch(
      (await this.moduleBaseUrl(step.targetServer, "media", step.targetRuntimeRole)) +
        "/media/v0/storage/upload",
      {
        method: "POST",
        headers: {
          Authorization: this.authorizationHeader(request),
          "x-enterprise-code":
            request.enterpriseCode ||
            (request.authData &&
              (request.authData.enterpriseCode || request.authData.entCode)) ||
            (request.headers &&
              (request.headers.enterpriseCode ||
                request.headers["x-enterprise-code"])) ||
            CONFIG.get("defaultEnterprise") ||
            "default",
          Origin: this.operatorOrigin(request),
        },
        body: form,
      },
    );
    let text = await response.text();
    if (!response.ok && !/duplicate|already|exists|E11000/i.test(text)) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00085",
        "Application preparation media upload failed: HTTP " +
          String(response.status) +
          " - " +
          text.slice(0, 300),
      );
    }
    return {
      mediaCode: String(asset.mediaCode || asset.code),
      checksum: crypto.createHash("sha256").update(buffer).digest("hex"),
    };
  },
  /** Reconciles profile-declared media manifests into the Staged media store before publication approval. */
  prepareMediaAssets: async function (profile, request) {
    let steps = this.preparationSteps(profile).filter(
      (step) => step.type === "MEDIA_ASSET_MANIFEST" && step.required !== false,
    );
    let uploaded = [];
    for (let step of steps) {
      let manifestPath = this.safeManifestPath(step);
      delete require.cache[require.resolve(manifestPath)];
      let assets = require(manifestPath);
      if (!Array.isArray(assets) || assets.length === 0) {
        throw new CLASSES.NodicsError(
          "ERR_BOF_00085",
          "Application preparation media manifest is empty",
        );
      }
      for (let asset of assets)
        uploaded.push(await this.uploadMediaAsset(step, asset, request));
    }
    return uploaded;
  },
  /** Installs required preparation releases before requesting publication approval. */
  prepareApplication: async function (profile, request, currentPreparation) {
    let preparation =
      currentPreparation || (await this.preparationStatus(profile, request));
    if (preparation.status === "BLOCKED") {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00085",
        this.preparationBlockedMessage(preparation),
      );
    }
    await this.prepareMediaAssets(profile, request);
    let groups = this.preparationGroups(profile, request, preparation.steps)
      .map((group) =>
        Object.assign({}, group, {
          steps: group.steps.filter((step) => {
            let current = preparation.steps.find(
              (item) =>
                item.code === step.code &&
                item.dataType === step.dataType &&
                item.targetServer === step.targetServer,
            );
            return (
              current &&
              ["NOT_INSTALLED", "UPDATE_AVAILABLE", "FAILED"].includes(
                current.status,
              )
            );
          }),
        }),
      )
      .filter((group) => group.steps.length > 0);
    for (let group of groups) {
      group.expectedReleases = Object.fromEntries(
        group.steps
          .map((step) => {
            let current = preparation.steps.find(
              (item) =>
                item.code === step.code &&
                item.dataType === step.dataType &&
                item.targetServer === step.targetServer,
            );
            return [step.code, current && current.version];
          })
          .filter((entry) => entry[1]),
      );
      await this.invokeDataReleaseOperation("execute", group, request);
    }
    return this.preparationStatus(profile, request);
  },
  /** Returns the target baseline operation used for one BackOffice application operation. */
  targetBaselineOperation: function (operation) {
    return operation === "reconcileApproval" ? "initiate" : operation;
  },
  /** Returns the target baseline API suffix for one BackOffice application operation. */
  targetBaselineSuffix: function (operation) {
    let targetOperation = this.targetBaselineOperation(operation);
    return targetOperation === "status" ? "" : "/" + targetOperation;
  },
  /** Projects repair metadata for BackOffice-owned approval reconciliation. */
  approvalRepairProjection: function (operation, before, after) {
    if (operation !== "reconcileApproval") return undefined;
    let previousPublication = (before && before.publication) || {};
    let repairedPublication = (after && after.publication) || {};
    let previousDiagnostic = previousPublication.approvalDiagnostic || {};
    let repairedDiagnostic = repairedPublication.approvalDiagnostic || {};
    let previousWorkflowRef = previousPublication.workflowRef;
    let repairedWorkflowRef = repairedPublication.workflowRef;
    return {
      action: "RECONCILE_APPROVAL_TASK",
      status: repairedDiagnostic.status === "WAITING_REVIEWER" || repairedWorkflowRef
        ? "REPAIRED_OR_REPLAYED"
        : "NEEDS_PROCESS_REVIEW",
      idempotent: true,
      previousWorkflowRef: previousWorkflowRef ? String(previousWorkflowRef) : undefined,
      workflowRef: repairedWorkflowRef ? String(repairedWorkflowRef) : undefined,
      previousApprovalStatus: previousDiagnostic.status,
      approvalStatus: repairedDiagnostic.status,
      taskCode: repairedDiagnostic.taskCode,
      publicationCode: repairedPublication.code
        ? String(repairedPublication.code)
        : previousPublication.code
          ? String(previousPublication.code)
          : undefined,
      message: repairedWorkflowRef
        ? "Publication approval workflow was reconciled. Review the Process task for decision."
        : "Publication approval could not be reconciled automatically. Review Process workflow state.",
    };
  },
  /** Runs only profile-owned setup preparation, then returns the refreshed readiness projection. */
  prepareCapability: async function (profileCode, request) {
    let profile = this.profile(profileCode);
    this.human(request);
    let initialPreparation = await this.preparationStatus(profile, request);
    if (initialPreparation.status === "BLOCKED") {
      return Object.assign(this.blockedProjection(profile, initialPreparation), {
        preparationOperation: this.prepareCapabilityEvidence(
          profile,
          initialPreparation,
          initialPreparation,
          false,
        ),
      });
    }
    await this.prepareApplication(profile, request, initialPreparation);
    let refreshed = await this.status(profileCode, request);
    return Object.assign(refreshed, {
      preparationOperation: this.prepareCapabilityEvidence(
        profile,
        initialPreparation,
        refreshed.preparation,
        true,
      ),
    });
  },
  /** Builds compact operator evidence for setup-only capability preparation. */
  prepareCapabilityEvidence: function (profile, before, after, attempted) {
    let beforeSteps = (before && before.steps) || [];
    let afterSteps = (after && after.steps) || [];
    return {
      operation: "applicationInitialization.prepareCapability",
      capabilityCode: profile.code,
      beforeStatus: before && before.status,
      afterStatus: after && after.status,
      attempted: attempted === true,
      stepCount: afterSteps.length,
      changed:
        Boolean(before && after) &&
        (before.status !== after.status ||
          JSON.stringify(
            beforeSteps.map((step) => [step.code, step.status, step.installedVersion]),
          ) !==
            JSON.stringify(
              afterSteps.map((step) => [step.code, step.status, step.installedVersion]),
            )),
    };
  },
  /** Invokes only the profile-owned fixed Staged baseline endpoint. */
  /** Executes the documented bounded module operation. */
  invoke: async function (operation, profileCode, request) {
    let profile = this.profile(profileCode);
    let principal = operation === "status" ? undefined : this.human(request);
    let initialPreparation = await this.preparationStatus(profile, request);
    if (initialPreparation.status === "BLOCKED") {
      return this.blockedProjection(profile, initialPreparation);
    }
    let preparationChanged =
      operation === "initiate" && initialPreparation.status !== "CURRENT";
    let preparation =
      operation === "initiate"
        ? await this.prepareApplication(profile, request, initialPreparation)
        : initialPreparation;
    let token = NODICS.getInternalAuthToken(request.tenant);
    if (!token)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00083",
        "Application initialization service authentication is unavailable",
      );
    let input = request.applicationInitialization || {};
    let correlationId =
      input.correlationId || request.correlationId || request.requestId;
    let mediaCodes =
      operation === "initiate" ? this.mediaManifestCodes(profile) : [];
    let body =
      operation !== "status"
        ? {
            requestedBy: principal,
            reason: input.reason,
            correlationId: correlationId,
            forceRefresh:
              operation === "reconcileApproval" ||
              input.forceRefresh === true ||
              preparationChanged
                ? true
                : undefined,
            mediaCodes: mediaCodes.length ? mediaCodes : undefined,
          }
        : undefined;
    let suffix = this.targetBaselineSuffix(operation);
    let repairBefore;
    if (operation === "reconcileApproval") {
      repairBefore = await SERVICE.DefaultModuleService.invokeModule({
        moduleName: profile.target.moduleName,
        local: false,
        connectionName: profile.target.connectionName,
        connectionType: profile.target.connectionType || "abstract",
        targetAuthority: {
          runtimeRole: profile.target.runtimeRole || "WCMS_STAGED",
        },
        methodName: "GET",
        apiName:
          "/publication/baselines/" +
          encodeURIComponent(profile.baselineCode),
        timeoutMs: profile.target.timeoutMs,
        maxAttempts: profile.target.maxAttempts,
        header: { Authorization: "Bearer " + token },
      })
        .then((response) => (response && (response.data || response.result || response)) || {})
        .catch(() => undefined);
    }
    return SERVICE.DefaultModuleService.invokeModule({
      moduleName: profile.target.moduleName,
      local: false,
      connectionName: profile.target.connectionName,
      connectionType: profile.target.connectionType || "abstract",
      targetAuthority: {
        runtimeRole: profile.target.runtimeRole || "WCMS_STAGED",
      },
      methodName: operation === "status" ? "GET" : "POST",
      apiName:
        "/publication/baselines/" +
        encodeURIComponent(profile.baselineCode) +
        suffix,
      requestBody: body,
      timeoutMs: profile.target.timeoutMs,
      maxAttempts: profile.target.maxAttempts,
      idempotencyKey:
        operation !== "status"
          ? profile.code +
            ":" +
            operation +
            ":" +
            String(correlationId || principal)
          : undefined,
      header: { Authorization: "Bearer " + token },
    })
      .catch((error) => {
        throw this.targetDiagnostic(error, profile);
      })
      .then((response) => {
        let authority =
          (response && (response.data || response.result || response)) || {};
        let readiness =
          preparation.status === "BLOCKED" ? "BLOCKED" : authority.readiness;
        let preparationUpdateAvailable =
          preparation.status !== "CURRENT" &&
          preparation.status !== "RUNNING" &&
          preparation.status !== "BLOCKED";
        let releaseInvalid = authority.releaseStatus === "INVALID_RELEASE";
        let updateAvailable =
          readiness === "READY" &&
          ["UPDATE_AVAILABLE", "FAILED"].includes(authority.releaseStatus);
        let projection = {
          readiness: readiness,
          releaseStatus: authority.releaseStatus,
          releaseCode: authority.releaseCode,
          preparation: preparation,
          publication: authority.publication,
        };
        let repair = this.approvalRepairProjection(
          operation,
          repairBefore,
          authority,
        );
        return {
          profileCode: profile.code,
          type: profile.type,
          owner: profile.owner,
          applicationCode: profile.applicationCode,
          siteCode: profile.siteCode,
          profile: this.describe(profile),
          allowedActions:
            preparation.status === "BLOCKED"
              ? []
              : readiness === "READY"
                ? [].concat(
                    updateAvailable || preparationUpdateAvailable
                      ? ["INITIALIZE"]
                      : [],
                    authority.publication &&
                      authority.publication.previousOnlineVersion
                      ? ["ROLLBACK"]
                      : [],
                    ["RETIRE"],
                  )
                : releaseInvalid ||
                    ["IMPORTING", "PUBLICATION_PENDING"].includes(readiness)
                  ? []
                  : ["INITIALIZE"],
          readiness: readiness,
          releaseCode: authority.releaseCode,
          releaseVersion: authority.releaseVersion,
          releaseStatus: authority.releaseStatus,
          preparation: preparation,
          publication: authority.publication,
          lineage: authority.lineage,
          repair: repair,
          capability: this.capabilityProjection(profile, projection),
        };
      });
  },
  /** Reads or installs the profile-owned content pack through its fixed Staged target. */
  invokeContentPack: function (operation, profileCode, request) {
    let profile = this.profile(profileCode);
    if (profile.type !== "DOCUMENTATION_BUNDLE" || !profile.contentPackCode) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00084",
        "Application profile does not own a documentation content pack",
      );
    }
    if (operation === "install") this.human(request);
    let token = NODICS.getInternalAuthToken(request.tenant);
    if (!token)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00083",
        "Application initialization service authentication is unavailable",
      );
    return SERVICE.DefaultModuleService.invokeModule({
      moduleName: "system",
      local: false,
      connectionName: profile.target.connectionName,
      connectionType: profile.target.connectionType || "abstract",
      targetAuthority: {
        runtimeRole: profile.target.runtimeRole || "WCMS_STAGED",
      },
      methodName: operation === "status" ? "GET" : "POST",
      apiName:
        "/internal/content-packs/" +
        encodeURIComponent(profile.contentPackCode) +
        (operation === "install" ? "/imports" : ""),
      timeoutMs: profile.target.timeoutMs,
      maxAttempts: profile.target.maxAttempts,
      idempotencyKey:
        operation === "install"
          ? profile.code +
            ":content-pack:" +
            String(
              request.correlationId ||
                request.requestId ||
                (request.authData && request.authData.principalId),
            )
          : undefined,
      header: { Authorization: "Bearer " + token },
      responseSelector: (response) =>
        response && (response.data || response.result || response),
    });
  },
  /** Returns the documentation content-pack status from the profile's Staged authority. */
  contentPackStatus: function (profileCode, request) {
    return this.invokeContentPack("status", profileCode, request);
  },
  /** Installs the documentation content pack through the profile's governed Staged authority. */
  installContentPack: function (profileCode, request) {
    return this.invokeContentPack("install", profileCode, request);
  },
  /** Executes the documented bounded module operation. */
  status: function (profileCode, request) {
    return this.invoke("status", profileCode, request);
  },
  /** Prepares profile-owned setup data and media without submitting publication approval. */
  prepare: function (profileCode, request) {
    return this.prepareCapability(profileCode, request);
  },
  /** Executes the documented bounded module operation. */
  initiate: function (profileCode, request) {
    return this.invoke("initiate", profileCode, request);
  },
  /** Executes governed approval reconciliation through the owning Staged baseline authority. */
  reconcileApproval: function (profileCode, request) {
    return this.invoke("reconcileApproval", profileCode, request);
  },
  /** Executes the documented bounded module operation. */
  rollback: function (profileCode, request) {
    return this.invoke("rollback", profileCode, request);
  },
  /** Executes the documented bounded module operation. */
  retire: function (profileCode, request) {
    return this.invoke("retire", profileCode, request);
  },
};
