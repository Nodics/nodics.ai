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
const configurationInitializer = require("../../../../../nodics.foundation/modules/nConfig/src/service/DefaultFrameworkInitializerService");
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
  describe: function (profile, evidence) {
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
      visual: this.visual(
        presentation.visual,
        profile.target,
        this.applicationArtworkActive(profile, evidence),
      ),
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
      setupPlan: this.setupPlan(profile),
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
  /** Projects an owner media reference; Media retains record, storage and access authority. */
  visual: function (value, target, active) {
    if (
      !value ||
      typeof value.mediaCode !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,159}$/.test(value.mediaCode)
    )
      return undefined;
    if (
      typeof value.alt !== "string" ||
      !value.alt.trim() ||
      value.alt.length > 200
    )
      return undefined;
    let runtimeRole = target && target.runtimeRole;
    if (
      typeof runtimeRole !== "string" ||
      !/^[A-Z][A-Z0-9_]{1,63}$/.test(runtimeRole)
    )
      return undefined;
    return {
      mediaCode: value.mediaCode,
      alt: value.alt.trim(),
      runtimeRole: runtimeRole,
      active: active === true,
    };
  },
  /** Catalogue presence is not activation. Require current module activation and an initiated application baseline, not Online publication. */
  applicationArtworkActive: function (profile, evidence) {
    if (
      !evidence ||
      ![
        "IMPORTING",
        "IMPORTED",
        "PUBLICATION_PENDING",
        "READY",
        "REJECTED",
        "ROLLED_BACK",
      ].includes(evidence.readiness)
    )
      return false;
    const steps = (evidence.preparation && evidence.preparation.steps) || [];
    return this.requiredFunctionalModules(profile).every((required) =>
      steps.some(
        (step) =>
          step.type === "FUNCTIONAL_MODULE" &&
          step.code === required.code &&
          step.status === "CURRENT",
      ),
    );
  },
  /** Projects a read-only scope from the existing owner profile. It never activates or imports.
   * Later modules can extend this member for additional stages without changing Axis.
   * Public items deliberately omit paths, credentials and target transport details.
   */
  setupPlan: function (profile) {
    let labels = (CONFIG.get("backofficeApplicationInitialization") || {})
      .planPresentation;
    if (
      !labels ||
      !labels.capabilities ||
      !labels.preparation ||
      !labels.publication
    )
      return undefined;
    let capabilities = Array.from(
      new Map(
        this.requiredFunctionalModules(profile)
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => [
            item.code,
            {
              code: item.code,
              label: item.label,
              required: item.required,
              type: "FUNCTIONAL_MODULE",
              owner: item.code,
            },
          ]),
      ).values(),
    );
    let preparation = new Map();
    this.preparationSteps(profile)
      .slice()
      .sort((left, right) => left.order - right.order)
      .forEach((step) => {
        let identity = JSON.stringify([
          step.type,
          step.code,
          step.targetServer,
          step.targetRuntimeRole,
        ]);
        let previous = preparation.get(identity);
        preparation.set(identity, {
          code:
            step.code +
            "@" +
            crypto
              .createHash("sha256")
              .update(identity)
              .digest("hex")
              .slice(0, 16),
          label: step.label || step.kind,
          required: step.required || Boolean(previous && previous.required),
          type: step.type,
          owner: String(profile.owner),
        });
      });
    if (profile.contentPackCode)
      preparation.set("contentPack:" + profile.contentPackCode, {
        code: "contentPack:" + profile.contentPackCode,
        label: String(
          (profile.presentation || {}).title || profile.contentPackCode,
        ),
        required: true,
        type: "CONTENT_PACK",
        owner: String(profile.owner),
      });
    let approvalRequired =
      ((profile.presentation || {}).activationPolicy || {})
        .approvalRequiredForOnline !== false;
    return {
      contractVersion: 1,
      stages: [
        {
          code: "capabilities",
          title: labels.capabilities.title,
          summary: labels.capabilities.summary,
          items: capabilities,
        },
        {
          code: "preparation",
          title: labels.preparation.title,
          summary: labels.preparation.summary,
          items: Array.from(preparation.values()),
        },
        {
          code: "publication",
          title: labels.publication.title,
          summary: labels.publication.summary,
          items: [
            {
              code: String(profile.baselineCode),
              label: approvalRequired
                ? labels.publicationReview
                : labels.publicationPrepare,
              required: true,
              type: "PUBLICATION",
              owner: String(profile.owner),
            },
          ],
        },
      ].filter((stage) => stage.items.length > 0),
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
    const prerequisites =
      profile && profile.preparation && profile.preparation.prerequisites;
    if (
      prerequisites !== undefined &&
      (!Array.isArray(prerequisites) || prerequisites.length > 256)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation prerequisites must be a bounded step list",
      );
    }
    return []
      .concat(prerequisites || [], rawSteps)
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
    let manifestModule = step.manifestModule
      ? String(step.manifestModule)
      : undefined;
    if (
      !/^[A-Za-z][A-Za-z0-9._-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(
        code,
      ) ||
      !["init", "core", "sample", "media"].includes(dataType) ||
      !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(targetServer) ||
      !/^[A-Z][A-Z0-9_]{1,63}$/.test(targetRuntimeRole) ||
      (type === "MEDIA_ASSET_MANIFEST" &&
        (!manifestPath ||
          (manifestModule &&
            (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(manifestModule) ||
              manifestModule !== code.split(":")[0])) ||
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
      manifestModule:
        type === "MEDIA_ASSET_MANIFEST" ? manifestModule : undefined,
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
            runtimeState:
              record && record.runtimeState
                ? String(record.runtimeState)
                : undefined,
            registrationState:
              record && record.registrationState
                ? String(record.registrationState)
                : undefined,
            observedServers: this.safeObservedServers(
              record && record.observedServers,
            ),
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
        []
          .concat(servers || [])
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
    if (targetCode === "ERR_RTR_00004")
      return "Readiness checks are temporarily rate limited. Wait before refreshing status; no import or publication retry has been authorized.";
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
  targetDiagnostic: function (error, profile, request) {
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
      source && (source.responseCode || source.status)
        ? String(source.responseCode || source.status)
        : undefined;
    const runtimeInvocationDiagnostic = this.runtimeInvocationDiagnostic(
      error,
      {
        targetModule: profile.target.moduleName,
        targetConnection: profile.target.connectionName,
        targetRuntimeRole: profile.target.runtimeRole || "WCMS_STAGED",
      },
    );
    const diagnostic = {
      code: "ERR_BOF_00085",
      targetCode: targetCode,
      targetResponseCode: targetResponseCode,
      profileCode: profile.code,
      baselineCode: profile.baselineCode,
      targetModule: profile.target.moduleName,
      targetConnection: profile.target.connectionName,
      targetRuntimeRole: profile.target.runtimeRole || "WCMS_STAGED",
      phase: runtimeInvocationDiagnostic && runtimeInvocationDiagnostic.phase,
      failureCode:
        runtimeInvocationDiagnostic && runtimeInvocationDiagnostic.failureCode,
      correlationId: request && (request.correlationId || request.requestId),
    };
    // Error serialization can omit metadata; log only bounded scalar routing facts separately.
    const safeDiagnostic = Object.fromEntries(
      Object.entries(diagnostic).filter(
        ([, value]) =>
          ["string", "number"].includes(typeof value) &&
          /^[A-Za-z0-9_.:-]{1,192}$/.test(String(value)),
      ),
    );
    if (this.LOG && typeof this.LOG.warn === "function") {
      this.LOG.warn(
        "Application initialization target invocation failed",
        safeDiagnostic,
      );
    }
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
        runtimeInvocationDiagnostic: runtimeInvocationDiagnostic,
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
  /** Resolves declared deployment aliases without treating a connection name as server authority. */
  applicationTargetBinding: function (connectionName, runtimeRole, moduleName) {
    const context =
      configurationInitializer.getPropertyBindingContext(__filename);
    const servers = configurationInitializer.discoverDeploymentServers(context);
    const aliases = configurationInitializer.deriveDeploymentServerAliases(
      context,
      servers,
    );
    const matches = Object.keys(aliases).filter((server) =>
      aliases[server].includes(connectionName),
    );
    if (matches.length !== 1) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application target connection requires one declared deployment server",
      );
    }
    const server = matches[0];
    if (connectionName !== server) {
      const router = SERVICE.DefaultRouterService;
      const aliasUrl =
        router &&
        typeof router.prepareUrl === "function" &&
        router.prepareUrl({ moduleName, connectionName });
      const serverUrl =
        router &&
        typeof router.prepareUrl === "function" &&
        router.prepareUrl({ moduleName, connectionName: server });
      if (
        !router ||
        typeof router.prepareUrl !== "function" ||
        !aliasUrl ||
        !serverUrl ||
        aliasUrl !== serverUrl
      ) {
        throw new CLASSES.NodicsError(
          "ERR_BOF_00081",
          "Application target alias differs from its declared server endpoint",
        );
      }
    }
    return {
      connectionName: server,
      targetAuthority: { server, runtimeRole: { code: runtimeRole } },
    };
  },
  /** Invokes one governed data-release validation or installation with the initiating human context. */
  invokeDataReleaseOperation: function (mode, group, request) {
    let suffix = mode === "preflight" ? "validate" : "install";
    const authorization = this.authorizationHeader(request, true);
    return SERVICE.DefaultModuleService.invokeModule({
      moduleName: "import",
      // These operations intentionally use the governed HTTP import route, even in a consolidated runtime.
      local: false,
      ...this.applicationTargetBinding(
        group.targetServer,
        group.targetRuntimeRole,
        "import",
      ),
      connectionType: "abstract",
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
  /** Batches adjacent compatible releases without changing the configured dependency order. */
  preparationGroups: function (profile, request, steps) {
    let input = request.applicationInitialization || {};
    let correlationId =
      input.correlationId || request.correlationId || request.requestId;
    let groups = [];
    steps
      .map((step, index) => ({
        ...step,
        order: Number.isFinite(step.order) ? step.order : index + 1,
      }))
      .sort((left, right) => left.order - right.order)
      .filter((step) => step.required !== false && step.type === "DATA_RELEASE")
      .forEach((step) => {
        let key = [
          step.targetServer,
          step.targetRuntimeRole,
          step.dataType,
        ].join(":");
        let group = groups[groups.length - 1];
        if (
          !group ||
          group.targetServer !== step.targetServer ||
          group.targetRuntimeRole !== step.targetRuntimeRole ||
          group.dataType !== step.dataType
        ) {
          group = {
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
          groups.push(group);
        }
        group.steps.push(step);
      });
    // Separated batches for one runtime must not share an operation key.
    const counts = new Map();
    for (const group of groups)
      counts.set(
        group.idempotencyKey,
        (counts.get(group.idempotencyKey) || 0) + 1,
      );
    return groups.map((group) =>
      counts.get(group.idempotencyKey) > 1
        ? {
            ...group,
            idempotencyKey:
              group.idempotencyKey +
              ":" +
              crypto
                .createHash("sha256")
                .update(JSON.stringify(group.steps.map((step) => step.code)))
                .digest("hex"),
          }
        : group,
    );
  },
  /** Converts runtime preparation faults into business-facing setup guidance. */
  preparationFailureMessage: function (step, error, group) {
    if (error && error.code === "ERR_RTR_00004")
      return this.targetFailureMessage("ERR_RTR_00004", "");
    if (this.preparationValidationDenied(error)) {
      const count = group && Array.isArray(group.steps) ? group.steps.length : 1;
      return "The selected setup group (" + count + " releases) is held by the import owner's prerequisite or release validation. This does not identify a failure in every member. Review releases individually in the import workbench; no failed import or runtime outage has been established.";
    }
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
  /** Recognizes only the import owner's typed validation refusal, never exception text or a caller marker. */
  preparationValidationDenied: function (error) {
    const remote = error && error.metadata && error.metadata.remoteHttpFailure;
    const code = remote ? remote.code : error && error.code;
    const status = remote ? remote.httpStatus : error && (error.status || error.responseCode);
    return (code === "ERR_IMP_00003" && Number(status) === 400) ||
      (code === "ERR_IMP_00004" && Number(status) === 404);
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
      profile: this.describe(profile, projection),
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
    if (presentation.capabilityGroup)
      return String(presentation.capabilityGroup);
    if (profile.type === "DOCUMENTATION_BUNDLE") return "DOCUMENTATION_PACK";
    if (String(presentation.category || "").toLowerCase() === "customization")
      return "APPLICATION_CONTENT";
    if (
      /STOREFRONT|WEBSITE|APPLICATION|DOMAIN/i.test(String(profile.type || ""))
    )
      return "PROJECT_ACCELERATOR";
    return "APPLICATION_CONTENT";
  },
  /** Returns the business capability type for one initialization profile. */
  capabilityType: function (profile) {
    let presentation = (profile && profile.presentation) || {};
    if (presentation.capabilityType) return String(presentation.capabilityType);
    if (profile.type === "DOCUMENTATION_BUNDLE") return "DOCUMENTATION_PACK";
    if (
      /STOREFRONT|WEBSITE|APPLICATION|DOMAIN/i.test(String(profile.type || ""))
    )
      return "ACCELERATOR";
    return "APPLICATION";
  },
  /** Maps technical initialization facts to the shared business capability lifecycle. */
  capabilityBusinessStatus: function (projection) {
    if (!projection) return "NEEDS_ATTENTION";
    if (
      projection.mediaDependencies &&
      projection.mediaDependencies.qualified !== true
    )
      return "NEEDS_ATTENTION";
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
    if (
      projection.readiness === "READY" &&
      projection.releaseStatus !== "UPDATE_AVAILABLE"
    )
      return "ONLINE";
    if (
      projection.readiness === "READY" &&
      projection.releaseStatus === "UPDATE_AVAILABLE"
    )
      return "NEEDS_ATTENTION";
    if (projection.readiness === "PUBLICATION_PENDING")
      return "APPROVAL_IN_PROGRESS";
    if (projection.readiness === "IMPORTED") return "APPROVAL_REQUIRED";
    if (projection.readiness === "IMPORTING") return "PREPARING";
    if (projection.readiness === "NOT_IMPORTED") return "NOT_PREPARED";
    if (projection.readiness === "ROLLED_BACK") return "PREPARED_STAGED";
    return "NEEDS_ATTENTION";
  },
  /** Projects technical blockers into stable capability-level finding codes. */
  capabilityBlockers: function (projection) {
    let blockers = [];
    const media = projection && projection.mediaDependencies;
    if (media && media.qualified !== true) {
      const dependencies = [].concat(media.dependencies || []);
      for (const item of dependencies.length
        ? dependencies
        : [{ status: media.status }]) {
        if (item.qualified === true) continue;
        blockers.push({
          blockerCode:
            "MEDIA_DEPENDENCY_" + String(item.status || "UNAVAILABLE"),
          code: "MEDIA_DEPENDENCY_" + String(item.status || "UNAVAILABLE"),
          severity: "REPAIR_REQUIRED",
          owner: String(item.mediaCode || "media"),
          ownerType: "MEDIA",
          source: "MEDIA_PUBLICATION",
          message:
            media.message ||
            "Referenced Media is not qualified for Online delivery.",
          technicalStatus: item.status,
          action: item.nextAction || "Review Media publication",
          mediaDependency: item,
          repair:
            item.status === "VERSION_UNPINNED"
              ? {
                  available: true,
                  action: "INITIALIZE",
                  operation: "applicationInitialization.initiate",
                  label: "Review a fresh exact-version site publication",
                  requiresConfirmation: true,
                  automaticExecution: false,
                }
              : {
                  available: !!(
                    item.handoff && item.handoff.available === true
                  ),
                  action: "REVIEW_MEDIA_PUBLICATION",
                  operation: "media.createRetainedPublication",
                  label:
                    (item.handoff && item.handoff.label) ||
                    "Review exact-version Media publication",
                  route: item.handoff && item.handoff.route,
                  handoff: item.handoff,
                  requiresOwnerInspection: true,
                  requiresConfirmation: true,
                  automaticExecution: false,
                  publicationRequest: item.publicationRequest,
                },
        });
      }
    }
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
                    : step.status === "FAILED"
                      ? "IMPORT_FAILED"
                      : step.status === "READINESS_RATE_LIMITED"
                        ? "READINESS_RATE_LIMITED"
                        : step.status === "VALIDATION_BLOCKED"
                          ? "READINESS_VALIDATION_BLOCKED"
                          : step.status === "UNAVAILABLE"
                            ? "READINESS_UNAVAILABLE"
                            : "READINESS_UNKNOWN";
      let repair = this.capabilityRepairProjection(code, {
        owner: step.code,
        targetServer: step.targetServer,
        targetRuntimeRole: step.targetRuntimeRole,
        historyHandoff: step.historyHandoff,
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
        releaseReceipt: step.releaseReceipt,
      });
    });
    if (projection && projection.releaseStatus === "INVALID_RELEASE") {
      let repair = this.capabilityRepairProjection("INVALID_MANIFEST", {
        owner: projection.releaseCode,
      });
      blockers.push({
        blockerCode: "INVALID_MANIFEST",
        code: "INVALID_MANIFEST",
        severity: this.capabilityBlockerSeverity(
          "INVALID_MANIFEST",
          true,
          repair,
        ),
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
      let code = projection.publication
        ? "ONLINE_POINTER_STALE"
        : "PUBLICATION_RECEIPT_MISSING";
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
        action:
          code === "ONLINE_POINTER_STALE"
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
    if (
      projection &&
      projection.publicationDiagnostic &&
      !["PUBLICATION_ONLINE", "PUBLICATION_APPROVAL_PENDING"].includes(
        projection.publicationDiagnostic.status,
      )
    ) {
      let diagnostic = projection.publicationDiagnostic;
      let repair = diagnostic.repair;
      blockers.push({
        blockerCode: diagnostic.status,
        code: diagnostic.status,
        severity:
          diagnostic.severity === "INFO"
            ? "INFO"
            : diagnostic.severity === "WAITING"
              ? "WARNING"
              : diagnostic.severity === "REPAIR_REQUIRED"
                ? "REPAIR_REQUIRED"
                : "BLOCKED",
        owner: String(
          diagnostic.publicationCode ||
            diagnostic.releaseCode ||
            projection.releaseCode ||
            "",
        ),
        ownerType: "PUBLICATION",
        source: "CMS_PUBLICATION",
        message: diagnostic.message,
        action: diagnostic.suggestedAction,
        disabledReason: diagnostic.disabledReason,
        technicalStatus: diagnostic.status,
        failureCode: diagnostic.failureCode,
        repair: repair,
        publicationDiagnostic: diagnostic,
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
        severity: this.capabilityBlockerSeverity(
          code,
          !publication.workflowRef,
          repair,
        ),
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
    return blockers.sort(
      (left, right) =>
        Number(right.code === "IMPORT_FAILED") -
        Number(left.code === "IMPORT_FAILED"),
    );
  },
  /** Maps raw preparation source data to a stable repair severity. */
  capabilityBlockerSeverity: function (code, required, repair) {
    if (required === false || code === "APPROVAL_IN_PROGRESS") return "INFO";
    if (repair && repair.available === true) return "REPAIR_REQUIRED";
    if (["VERSION_MISMATCH", "IMPORT_IN_PROGRESS"].includes(code))
      return "WARNING";
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
        IMPORT_NOT_STARTED: "Required setup data has not been installed yet.",
        READINESS_UNAVAILABLE:
          "The owning runtime could not verify readiness. Restore its prerequisites and refresh status; this is not evidence of a failed import.",
        READINESS_UNKNOWN:
          "The owning runtime did not return a recognized readiness status. Refresh status or ask an operator to inspect the owner response.",
        READINESS_RATE_LIMITED:
          "Readiness checks are temporarily rate limited. Wait before refreshing status.",
        READINESS_VALIDATION_BLOCKED:
          "The import owner refused the selected setup group's prerequisites or release validation. Resolve the owner gate before preparing data; this is not a runtime outage or failed import.",
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
        IMPORT_FAILED: "Review import history",
        READINESS_UNAVAILABLE: "Refresh readiness",
        READINESS_UNKNOWN: "Refresh readiness",
        READINESS_RATE_LIMITED: "Wait and refresh readiness",
        READINESS_VALIDATION_BLOCKED: "Review setup prerequisites",
      }[code] || "Review capability readiness"
    );
  },
  /** Returns client-safe repair metadata for a readiness blocker without inventing browser authority. */
  capabilityRepairProjection: function (code, context) {
    let owner = context && context.owner ? String(context.owner) : undefined;
    let targetServer =
      context && context.targetServer
        ? String(context.targetServer)
        : undefined;
    let targetRuntimeRole =
      context && context.targetRuntimeRole
        ? String(context.targetRuntimeRole)
        : undefined;
    let definitions = {
      READINESS_VALIDATION_BLOCKED: {
        available: false,
        label: "Review setup prerequisites",
        action: "REVIEW_SETUP_PREREQUISITES",
        idempotent: true,
        requiresConfirmation: false,
      },
      READINESS_UNAVAILABLE: {
        available: true,
        label: "Refresh readiness",
        operation: "applicationInitialization.status",
        action: "REFRESH_READINESS",
        idempotent: true,
        requiresConfirmation: false,
      },
      READINESS_UNKNOWN: {
        available: true,
        label: "Refresh readiness",
        operation: "applicationInitialization.status",
        action: "REFRESH_READINESS",
        idempotent: true,
        requiresConfirmation: false,
      },
      READINESS_RATE_LIMITED: {
        available: true,
        label: "Wait and refresh readiness",
        operation: "applicationInitialization.status",
        action: "REFRESH_READINESS",
        idempotent: true,
        requiresConfirmation: false,
      },
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
        available: !!(context && context.historyHandoff && context.historyHandoff.available === true),
        label: "Review import history",
        action: "REVIEW_IMPORT_HISTORY",
        owner: "import",
        unavailableReason:
          "Review the owning runtime's import history; exact-runtime history navigation is not qualified by this setup contract.",
        idempotent: true,
        requiresConfirmation: false,
        route: context && context.historyHandoff && context.historyHandoff.route,
        handoff: context && context.historyHandoff,
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
    let ownerDiagnostic =
      publication.approvalDiagnostic ||
      (projection && projection.approvalDiagnostic);
    let workflowRef = publication.workflowRef
      ? String(publication.workflowRef)
      : undefined;
    let task =
      publication.approvalTask || publication.workflowTask || publication.task;
    if (ownerDiagnostic && ownerDiagnostic.status) {
      return Object.assign({}, ownerDiagnostic, {
        source: ownerDiagnostic.source || "PUBLICATION_APPROVAL",
        publicationCode:
          ownerDiagnostic.publicationCode ||
          (publication.code ? String(publication.code) : undefined),
        publicationState:
          ownerDiagnostic.publicationState ||
          (publication.state ? String(publication.state) : undefined),
        workflowRef: ownerDiagnostic.workflowRef || workflowRef,
        taskCode:
          ownerDiagnostic.taskCode ||
          (task && task.code ? String(task.code) : undefined),
        taskStatus:
          ownerDiagnostic.taskStatus ||
          (task && task.status ? String(task.status) : undefined),
        message:
          ownerDiagnostic.message ||
          "Publication approval diagnostic is unavailable.",
        suggestedAction:
          ownerDiagnostic.suggestedAction ||
          "Refresh publication approval readiness",
        disabledReason:
          ownerDiagnostic.disabledReason ||
          "Process approval evidence is unavailable.",
      });
    }
    let taskStatus = task && task.status ? String(task.status) : undefined;
    let assignee = task && task.assignee ? String(task.assignee) : undefined;
    let queue =
      task && (task.queue || task.candidateGroup || task.assignment)
        ? String(task.queue || task.candidateGroup || task.assignment)
        : undefined;
    let actionable = taskStatus
      ? ["OPEN", "CLAIMED", "ESCALATED"].includes(taskStatus)
      : undefined;
    let hasPublicationEvidence = Object.keys(publication).length > 0;
    let status =
      !projection || projection.readiness !== "PUBLICATION_PENDING"
        ? projection &&
          (projection.readiness === "READY" || publication.state === "ONLINE")
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
      PROVIDER_UNAVAILABLE: "Process approval diagnostic is unavailable.",
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
      publicationState: publication.state
        ? String(publication.state)
        : undefined,
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
      let server;
      try {
        server = this.applicationTargetBinding(
          target.connectionName,
          target.runtimeRole || "WCMS_STAGED",
          target.moduleName,
        ).connectionName;
      } catch (_) {
        // Unresolved aliases do not establish runtime authority.
      }
      const steps = [].concat(
        (projection && projection.preparation && projection.preparation.steps) || [],
      );
      const answered = server && (
        (projection && projection.publicationTargetResponded === true) ||
        steps.some(step =>
          [target.connectionName, server].includes(step.targetServer) &&
          step.targetRuntimeRole === (target.runtimeRole || "WCMS_STAGED") &&
          ((step.type === "DATA_RELEASE" && [
            "CURRENT", "SOURCE_READY", "NOT_INSTALLED", "UPDATE_AVAILABLE",
            "DOWNGRADE_AVAILABLE", "INVALID_RELEASE", "RUNNING", "FAILED",
          ].includes(step.status)) ||
          (step.type === "MEDIA_ASSET_MANIFEST" && step.status === "SOURCE_READY")),
        )
      );
      dependencies.push({
        kind: "RUNTIME",
        code: String(server || target.connectionName || target.runtimeRole || "target"),
        label: "Publication target runtime",
        required: true,
        server: server,
        runtimeRole: target.runtimeRole
          ? String(target.runtimeRole)
          : "WCMS_STAGED",
        status: answered ? "AVAILABLE" : "UNKNOWN",
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
        classification:
          pack.classification || this.dataPackageClassification(pack),
        server: pack.targetServer ? String(pack.targetServer) : undefined,
        runtimeRole: pack.targetRuntimeRole
          ? String(pack.targetRuntimeRole)
          : undefined,
        status: this.dependencyStatus(pack, projection),
        evidence: this.dependencyEvidence(step),
      });
    });
    []
      .concat(
        (profile &&
          profile.presentation &&
          profile.presentation.requiredFunctionalModules) ||
          [],
      )
      .forEach((module) => {
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
            : [
                  "TASK_REFERENCE_MISSING",
                  "TASK_ASSIGNEE_MISSING",
                  "TASK_NOT_ACTIONABLE",
                  "PUBLICATION_MISSING",
                ].includes(approvalDiagnostic.status)
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
      (projection && projection.preparation && projection.preparation.steps) ||
        [],
    );
    return steps.find((item) => item.code === dependency.code);
  },
  /** Returns the current status for a declared dependency from the preparation projection. */
  dependencyStatus: function (dependency, projection) {
    let step = this.dependencyStep(dependency, projection);
    if (!step) return "UNKNOWN";
    if (["CURRENT", "SOURCE_READY", "OPTIONAL"].includes(step.status))
      return "CURRENT";
    if (["NOT_INSTALLED", "NOT_REGISTERED"].includes(step.status))
      return "NOT_STARTED";
    if (["UPDATE_AVAILABLE", "DOWNGRADE_AVAILABLE"].includes(step.status))
      return "VERSION_MISMATCH";
    if (["RUNNING", "IMPORTING"].includes(step.status)) return "IN_PROGRESS";
    if (["RUNTIME_OFFLINE", "UNAVAILABLE"].includes(step.status))
      return "UNAVAILABLE";
    return String(step.status || "UNKNOWN");
  },
  /** Projects sanitized evidence for dependency rows and graph nodes. */
  dependencyEvidence: function (step) {
    if (!step) return undefined;
    let evidence = {};
    if (step.runtimeState) evidence.runtimeState = String(step.runtimeState);
    if (step.registrationState)
      evidence.registrationState = String(step.registrationState);
    if (Array.isArray(step.observedServers)) {
      evidence.observedServers = this.safeObservedServers(step.observedServers);
    }
    if (step.targetServer) evidence.targetServer = String(step.targetServer);
    if (step.targetRuntimeRole)
      evidence.targetRuntimeRole = String(step.targetRuntimeRole);
    if (step.runtimeEvidence) evidence.runtimeEvidence = step.runtimeEvidence;
    if (step.runtimeDiagnostic)
      evidence.runtimeDiagnostic = step.runtimeDiagnostic;
    if (step.mediaEvidence) evidence.mediaEvidence = step.mediaEvidence;
    if (step.classification)
      evidence.classification = String(step.classification);
    if (step.trigger) evidence.trigger = String(step.trigger);
    if (step.dataType) evidence.dataType = String(step.dataType);
    return Object.keys(evidence).length ? evidence : undefined;
  },
  /** Builds a compact graph so UI pages can explain cross-runtime readiness order. */
  capabilityDependencyGraph: function (profile, projection) {
    let dependencies = this.capabilityDependencies(profile, projection);
    let capabilityCode = String(
      ((profile && profile.presentation) || {}).capabilityCode || profile.code,
    );
    let nodes = [
      {
        id: capabilityCode,
        kind: "CAPABILITY",
        label: String(
          ((profile && profile.presentation) || {}).title || profile.code,
        ),
      },
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
        projection &&
        projection.preparation &&
        projection.preparation.status === "CURRENT"
          ? "CURRENT"
          : projection && projection.preparation
            ? String(projection.preparation.status)
            : "UNKNOWN",
      staged:
        projection && projection.releaseStatus
          ? String(projection.releaseStatus)
          : "UNKNOWN",
      approval: this.approvalWorkflowDiagnostic(projection).status,
      online:
        projection &&
        projection.publication &&
        projection.publication.state === "ONLINE"
          ? "ONLINE"
          : blockerCodes.has("ONLINE_POINTER_STALE") ||
              blockerCodes.has("PUBLICATION_RECEIPT_MISSING")
            ? "NEEDS_REPAIR"
            : "NOT_ONLINE",
      runtime: blockers.some(
        (blocker) => blocker.code === "RUNTIME_UNAVAILABLE",
      )
        ? "UNAVAILABLE"
        : blockers.some((blocker) => blocker.runtimeDiagnostic)
          ? "NEEDS_ATTENTION"
          : "AVAILABLE",
      media:
        projection && projection.mediaDependencies
          ? projection.mediaDependencies.qualified === true
            ? projection.mediaDependencies.status === "NOT_REQUIRED"
              ? "NOT_REQUIRED"
              : "READY"
            : String(projection.mediaDependencies.status || "UNAVAILABLE")
          : blockerCodes.has("MEDIA_MISSING") ||
              blockerCodes.has("MEDIA_UNPUBLISHED")
            ? "NEEDS_REPAIR"
            : []
                  .concat(
                    (projection &&
                      projection.preparation &&
                      projection.preparation.steps) ||
                      [],
                  )
                  .some(
                    (step) =>
                      step.type === "MEDIA_ASSET_MANIFEST" &&
                      step.required !== false,
                  )
              ? "UNKNOWN"
              : "NOT_REQUIRED",
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
      technicalStatus: String(
        (projection && projection.readiness) || "UNKNOWN",
      ),
      releaseStatus:
        projection && projection.releaseStatus
          ? String(projection.releaseStatus)
          : undefined,
      lastEvaluatedAt: evaluatedAt,
      source: "backoffice.applicationInitialization",
      stale: false,
      dependencies: this.capabilityDependencies(profile, projection),
      dependencyGraph:
        (projection && projection.publicationDependencyGraph) ||
        this.capabilityDependencyGraph(profile, projection),
      blockers: blockers,
      repairActions: blockers.map((blocker) => blocker.repair).filter(Boolean),
      publicationSummary: this.capabilityPublicationSummary(
        projection,
        blockers,
      ),
      publicationDiagnostic: projection && projection.publicationDiagnostic,
      mediaDependencies: projection && projection.mediaDependencies,
      approvalDiagnostic: this.approvalWorkflowDiagnostic(projection),
      disabledReason: blockingAction
        ? blockingAction.disabledReason || blockingAction.message
        : undefined,
      nextAction:
        blockingAction?.action ||
        blockers[0]?.action ||
        (businessStatus === "ONLINE"
          ? "Monitor Online readiness"
          : "Prepare capability"),
    };
  },
  /** Projects only bounded owner receipt fields, never record payloads or source paths. */
  preparationReleaseReceipt: function (release) {
    const receipt = {};
    for (const key of [
      "releaseCode",
      "status",
      "version",
      "installedVersion",
      "lastRunId",
      "importRun",
    ]) {
      const value = release && release[key];
      if (
        ["string", "number"].includes(typeof value) &&
        /^[A-Za-z0-9_.:-]{1,192}$/.test(String(value))
      )
        receipt[key] = String(value);
    }
    return receipt;
  },
  /** Resolves an inert exact-runtime History handoff from the existing authorized registry owner. */
  importHistoryHandoff: async function (target, request) {
    const unavailable = {
      contractVersion: 1,
      owner: "import",
      action: "REVIEW_IMPORT_HISTORY",
      available: false,
      readOnly: true,
      automaticExecution: false,
      unavailableReason:
        "Authorized exact-runtime import history navigation is unavailable.",
    };
    const registry =
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultBackofficeRegistryService;
    if (
      !registry ||
      typeof registry.readNavigationRecoveryContext !== "function"
    )
      return unavailable;
    try {
      const context = await registry.readNavigationRecoveryContext(request);
      const environment = NODICS.getSelectedEnvironmentName();
      if (typeof environment !== "string" || !environment) return unavailable;
      const routes = context.navigation.filter(
        (item) =>
          item.id === "imports-exports" &&
          item.moduleName === "backoffice" &&
          ["UP", "DEGRADED"].includes(item.availability) &&
          (item.featureState === undefined || item.featureState === "ACTIVE"),
      );
      const instances = (context.modules.import || []).filter(
        (instance) =>
          instance.clientCallable === true &&
          typeof instance.endpoint === "string" &&
          instance.environment === environment &&
          instance.server === target.targetServer &&
          instance.runtimeRole &&
          instance.runtimeRole.code === target.targetRuntimeRole &&
          ["UP", "DEGRADED"].includes(instance.state),
      );
      if (routes.length !== 1 || instances.length !== 1) return unavailable;
      const route = routes[0].route;
      const instanceId = instances[0].instanceId;
      if (
        typeof route !== "string" ||
        !/^\/(?!\/)[A-Za-z0-9_/-]{1,510}$/.test(route) ||
        route.split("/").some((part) => part === "." || part === "..") ||
        typeof instanceId !== "string" ||
        !/^[A-Za-z0-9_.:-]{1,256}$/.test(instanceId)
      )
        return unavailable;
      const query = new URLSearchParams({
        area: "history",
        importInstance: instanceId,
      });
      return {
        contractVersion: 1,
        owner: "import",
        action: "REVIEW_IMPORT_HISTORY",
        available: true,
        readOnly: true,
        automaticExecution: false,
        route: route + "?" + query.toString(),
        importInstance: instanceId,
        targetServer: target.targetServer,
        targetRuntimeRole: target.targetRuntimeRole,
      };
    } catch (_) {
      return unavailable;
    }
  },
  /** Reads owner-confirmed release, stored Media and runtime readiness without installing or publishing. */
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
              status: [
                "CURRENT",
                "SOURCE_READY",
                "NOT_INSTALLED",
                "UPDATE_AVAILABLE",
                "DOWNGRADE_AVAILABLE",
                "INVALID_RELEASE",
                "RUNNING",
                "FAILED",
              ].includes(release.status)
                ? release.status
                : "UNKNOWN",
              version: release.version,
              installedVersion: release.installedVersion,
              description: release.description,
              releaseReceipt: this.preparationReleaseReceipt(release),
            }),
          );
        });
      } catch (error) {
        group.steps.forEach((step) =>
          projected.push(
            Object.assign({}, step, {
              status:
                error && error.code === "ERR_RTR_00004"
                  ? "READINESS_RATE_LIMITED"
                  : this.preparationValidationDenied(error)
                    ? "VALIDATION_BLOCKED"
                    : "UNAVAILABLE",
              message: this.preparationFailureMessage(step, error, group),
              runtimeDiagnostic: this.preparationValidationDenied(error)
                ? undefined
                : this.runtimeInvocationDiagnostic(error, {
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
    for (const step of steps.filter(
      (item) => item.required !== false && item.type === "MEDIA_ASSET_MANIFEST",
    )) {
      projected.push(await this.mediaPreparationStatus(step, request));
    }
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
    for (const step of projected) {
      if (step.type === "DATA_RELEASE" && step.status === "FAILED")
        step.historyHandoff = await this.importHistoryHandoff(step, request);
    }
    return {
      status: projected.some((step) =>
        [
          "INVALID_RELEASE",
          "DOWNGRADE_AVAILABLE",
          "UNAVAILABLE",
          "READINESS_RATE_LIMITED",
          "VALIDATION_BLOCKED",
          "UNKNOWN",
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
  /** Reads one fresh persisted CURRENT metadata aggregate; routine status never verifies bytes or publishes. */
  mediaPreparationStatus: async function (step, request) {
    try {
      const manifestPath = this.safeManifestPath(step);
      delete require.cache[require.resolve(manifestPath)];
      const assets = require(manifestPath);
      if (!Array.isArray(assets) || assets.length === 0 || assets.length > 100) {
        return {
          ...step,
          status: "FAILED",
          description: "Media asset manifest is empty or unavailable",
        };
      }
      const descriptors = assets.map(asset =>
        this.describeMediaAsset(step, asset, request).descriptor);
      if (new Set(descriptors.map(asset => asset.mediaCode)).size !== descriptors.length) {
        throw new Error("Ambiguous Media manifest");
      }
      const startedAt = Date.now();
      const response = await SERVICE.DefaultModuleService.invokeModule({
        moduleName: "media", local: false, tenant: request.tenant,
        ...this.applicationTargetBinding(step.targetServer, step.targetRuntimeRole, "media"),
        methodName: "POST", apiName: "/storage/readiness", maxAttempts: 1,
        header: {
          Authorization: this.authorizationHeader(request, true), tenant: request.tenant,
          "x-enterprise-code": request.enterpriseCode || (request.authData && request.authData.entCode),
          Origin: this.operatorOrigin(request),
        },
        requestBody: { assets: descriptors },
      });
      const aggregate = response && response.data;
      const checkedAt = aggregate && Date.parse(aggregate.checkedAt);
      if (!aggregate || typeof aggregate.checkedAt !== "string" || aggregate.checkedAt.length > 64 ||
          aggregate.contractVersion !== 1 || aggregate.owner !== "media" ||
          aggregate.evidenceKind !== "PERSISTED_CURRENT_METADATA" || !Number.isFinite(checkedAt) ||
          checkedAt < startedAt - 1000 || checkedAt > Date.now() + 1000 ||
          !Array.isArray(aggregate.items) || aggregate.items.length !== descriptors.length) {
        throw new Error("Unconfirmed Media aggregate");
      }
      const evidence = aggregate.items;
      const evidenceFields = ["mediaCode", "checksum", "versionId", "exists", "metadataMatched", "storedBytesVerified"];
      evidence.forEach((item, index) => {
        const descriptor = descriptors[index];
        if (!item || Object.keys(item).some(key => !evidenceFields.includes(key)) ||
            item.mediaCode !== descriptor.mediaCode || item.checksum !== descriptor.checksum ||
            typeof item.exists !== "boolean" || typeof item.metadataMatched !== "boolean" || item.storedBytesVerified !== false ||
            (item.versionId !== null && (!Number.isSafeInteger(item.versionId) || item.versionId < 0)) ||
            (item.metadataMatched && (!item.exists || item.versionId === null))) {
          throw new Error("Invalid Media aggregate");
        }
      });
      const current = evidence.every(item => item.metadataMatched);
      return {
        ...step,
        status: current
          ? "SOURCE_READY"
          : evidence.some((item) => item.exists)
            ? "UPDATE_AVAILABLE"
            : "NOT_INSTALLED",
        version: String(assets.length),
        mediaEvidence: evidence,
        mediaEvidenceKind: aggregate.evidenceKind,
        mediaCheckedAt: aggregate.checkedAt,
        description: current
          ? "Persisted CURRENT media metadata matches the declared assets. Byte verification and Online approval remain separate operations."
          : "Declared media assets need governed Staged preparation.",
      };
    } catch (_) {
      return {
        ...step,
        status: "UNAVAILABLE",
        description:
          "Media preparation evidence is unavailable. Restore authorized Media inspection before continuing.",
      };
    }
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
    const owner =
      typeof NODICS.getRawModule === "function" &&
      NODICS.getRawModule(step.manifestModule);
    const relativePath = String(step.manifestPath || "");
    if (
      !owner ||
      !owner.path ||
      !relativePath ||
      path.isAbsolute(relativePath) ||
      relativePath.split(/[\\/]+/).includes("..")
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation manifest requires a declared module-relative source",
      );
    }
    const root = fs.realpathSync(owner.path);
    const resolved = fs.realpathSync(path.resolve(root, relativePath));
    if (
      !resolved.startsWith(root + path.sep) ||
      !fs.statSync(resolved).isFile()
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00081",
        "Application preparation manifest escapes its owning module",
      );
    }
    return resolved;
  },
  /** Confines media payloads to the declared manifest's files directory, including symlink resolution. */
  safeManifestAssetPath: function (step, fileName) {
    const manifest = this.safeManifestPath(step);
    const root = fs.realpathSync(path.join(path.dirname(manifest), "files"));
    if (!root.startsWith(path.dirname(manifest) + path.sep))
      throw new CLASSES.NodicsError(
        "ERR_BOF_00085",
        "Application preparation media directory escapes its manifest directory",
      );
    const relativePath = String(fileName || "");
    if (
      !relativePath ||
      path.isAbsolute(relativePath) ||
      relativePath.split(/[\\/]+/).includes("..")
    )
      throw new CLASSES.NodicsError(
        "ERR_BOF_00085",
        "Application preparation media asset path is invalid",
      );
    const resolved = fs.realpathSync(path.resolve(root, relativePath));
    if (
      !resolved.startsWith(root + path.sep) ||
      !fs.statSync(resolved).isFile()
    )
      throw new CLASSES.NodicsError(
        "ERR_BOF_00085",
        "Application preparation media asset escapes its manifest directory",
      );
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
      if (
        typeof authorization !== "string" ||
        !/^Bearer\s+\S+$/i.test(authorization)
      ) {
        throw new CLASSES.NodicsError(
          "ERR_BOF_00082",
          "Operator bearer authorization is required for application data installation",
        );
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
    const binding = this.applicationTargetBinding(
      serverCode,
      runtimeRole,
      moduleName,
    );
    const owner = await resolver.resolveRuntimeOwner({
      moduleName,
      ...binding,
    });
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
  /** Builds the same confined asset descriptor for aggregate reads and explicit preparation. */
  describeMediaAsset: function (step, asset, request) {
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
    const headers = {
      Authorization: this.authorizationHeader(request, true),
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
    };
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
    const descriptor = Object.fromEntries(
      Array.from(form.entries()).filter(([key]) => key !== "file"),
    );
    Object.assign(descriptor, {
      checksum,
      sizeBytes: buffer.length,
      mimeType,
      originalFileName: String(asset.fileName),
    });
    return { form, headers, checksum, descriptor };
  },
  /** Explicit preparation reads exact current bytes before upload reuse or CAS replacement. */
  inspectMediaAsset: async function (step, asset, request) {
    const { form, headers, checksum, descriptor } = this.describeMediaAsset(step, asset, request);
    const baseUrl = await this.moduleBaseUrl(step.targetServer, 'media', step.targetRuntimeRole);
    const inspectionResponse = await fetch(
      baseUrl + "/media/v0/storage/upload/inspect",
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(descriptor),
      },
    );
    const fail = (message) => {
      throw new CLASSES.NodicsError("ERR_BOF_00085", message);
    };
    const parse = async (response) => {
      if (!response.ok) {
        fail(
          "Application preparation media request failed: HTTP " +
            String(response.status),
        );
      }
      try {
        return JSON.parse(await response.text()).data;
      } catch (_) {
        return fail("Application preparation Media acknowledgement is invalid");
      }
    };
    const inspection = await parse(inspectionResponse);
    if (
      !inspection ||
      inspection.contractVersion !== 1 ||
      inspection.mediaCode !== descriptor.mediaCode ||
      typeof inspection.versioned !== "boolean" ||
      typeof inspection.exists !== "boolean" ||
      typeof inspection.unchanged !== "boolean" ||
      (inspection.exists &&
        inspection.versioned &&
        (!Number.isSafeInteger(inspection.versionId) ||
          inspection.versionId < 0)) ||
      (inspection.unchanged && (!inspection.exists || !inspection.versioned))
    ) {
      fail("Application preparation Media inspection is invalid");
    }
    return {
      inspection,
      descriptor,
      checksum,
      form,
      headers,
      baseUrl,
      parse,
      fail,
    };
  },
  /** Uploads one declared asset only when owner inspection cannot verify unchanged reuse. */
  uploadMediaAsset: async function (step, asset, request) {
    const {
      inspection,
      descriptor,
      checksum,
      form,
      headers,
      baseUrl,
      parse,
      fail,
    } = await this.inspectMediaAsset(step, asset, request);
    if (inspection.unchanged)
      return { mediaCode: descriptor.mediaCode, checksum };
    if (inspection.exists && inspection.versioned) {
      form.append("versionId", String(inspection.versionId));
    }
    const response = await fetch(baseUrl + "/media/v0/storage/upload", {
      method: "POST",
      headers,
      body: form,
    });
    const saved = await parse(response);
    const expectedVersion = inspection.exists ? inspection.versionId + 1 : 0;
    if (
      !saved ||
      saved.code !== descriptor.mediaCode ||
      saved.checksumAlgorithm !== "sha256" ||
      saved.checksum !== checksum ||
      (inspection.versioned && saved.versionId !== expectedVersion)
    ) {
      fail("Application preparation Media upload was not acknowledged");
    }
    return {
      mediaCode: String(asset.mediaCode || asset.code),
      checksum,
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
    const groupReceipts = [];
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
      const receipt = {
        targetServer: group.targetServer,
        targetRuntimeRole: group.targetRuntimeRole,
        dataType: group.dataType,
        releaseCodes: group.steps.map((step) => step.code),
      };
      try {
        const response = await this.invokeDataReleaseOperation(
          "execute",
          group,
          request,
        );
        const result =
          (response && (response.data || response.result || response)) || {};
        const selected = new Set(receipt.releaseCodes);
        const releases = Array.isArray(result.releases)
          ? result.releases
              .filter((release) => release && selected.has(release.releaseCode))
              .map((release) => this.preparationReleaseReceipt(release))
          : [];
        groupReceipts.push({
          ...receipt,
          status:
            releases.length === selected.size &&
            releases.every((release) => release.status === "CURRENT")
              ? "COMPLETE"
              : "UNCONFIRMED",
          releases,
        });
      } catch (error) {
        const code = error && error.code;
        const failureCode =
          typeof code === "string" && /^ERR_[A-Z0-9_]{1,128}$/.test(code)
            ? code
            : "OWNER_OPERATION_FAILED";
        groupReceipts.push({ ...receipt, status: "FAILED", failureCode });
        const refreshed = await this.preparationStatus(profile, request).catch(
          () => ({
            status: "BLOCKED",
            steps: preparation.steps.map((step) => ({
              ...step,
              status: "UNAVAILABLE",
            })),
          }),
        );
        const releases = refreshed.steps
          .filter(
            (step) =>
              step.targetServer === group.targetServer &&
              step.dataType === group.dataType &&
              receipt.releaseCodes.includes(step.code),
          )
          .map(
            (step) =>
              step.releaseReceipt || {
                releaseCode: step.code,
                status: step.status,
              },
          );
        groupReceipts[groupReceipts.length - 1].releases = releases;
        for (const pending of groups.slice(groups.indexOf(group) + 1)) {
          groupReceipts.push({
            targetServer: pending.targetServer,
            targetRuntimeRole: pending.targetRuntimeRole,
            dataType: pending.dataType,
            releaseCodes: pending.steps.map((step) => step.code),
            status: "NOT_ATTEMPTED",
            releases: [],
          });
        }
        return {
          ...refreshed,
          status: "BLOCKED",
          groupReceipts,
          operationFailure: {
            owner: "import",
            ...receipt,
            failureCode,
            message:
              "Data preparation failed. Review the owning runtime's import receipt before attempting another preparation.",
            automaticRetry: false,
            historyHandoff: refreshed.steps.find(step =>
              step.status === "FAILED" && step.targetServer === group.targetServer &&
              step.targetRuntimeRole === group.targetRuntimeRole && receipt.releaseCodes.includes(step.code))?.historyHandoff,
          },
        };
      }
    }
    return {
      ...(await this.preparationStatus(profile, request)),
      groupReceipts,
    };
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
      status:
        repairedDiagnostic.status === "WAITING_REVIEWER" || repairedWorkflowRef
          ? "REPAIRED_OR_REPLAYED"
          : "NEEDS_PROCESS_REVIEW",
      idempotent: true,
      previousWorkflowRef: previousWorkflowRef
        ? String(previousWorkflowRef)
        : undefined,
      workflowRef: repairedWorkflowRef
        ? String(repairedWorkflowRef)
        : undefined,
      previousApprovalStatus: previousDiagnostic.status,
      approvalStatus: repairedDiagnostic.status,
      previousTaskCode: previousDiagnostic.taskCode,
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
  /** Builds a bounded proof bundle for approval reconciliation requests. */
  approvalRepairBinding: function (status) {
    let publication = (status && status.publication) || {};
    let diagnostic = publication.approvalDiagnostic || {};
    if (!diagnostic.workflowRef && !publication.workflowRef) return undefined;
    return {
      source: "PUBLICATION_APPROVAL",
      publicationCode: publication.code ? String(publication.code) : undefined,
      publicationRevision: publication.revision,
      workflowRef: diagnostic.workflowRef || publication.workflowRef,
      taskCode: diagnostic.taskCode,
      taskStatus: diagnostic.taskStatus,
      approvalStatus: diagnostic.status,
    };
  },
  /** Runs only profile-owned setup preparation, then returns the refreshed readiness projection. */
  prepareCapability: async function (profileCode, request) {
    let profile = this.profile(profileCode);
    this.human(request);
    let initialPreparation = await this.preparationStatus(profile, request);
    if (initialPreparation.status === "BLOCKED") {
      return Object.assign(
        this.blockedProjection(profile, initialPreparation),
        {
          preparationOperation: this.prepareCapabilityEvidence(
            profile,
            initialPreparation,
            initialPreparation,
            false,
          ),
        },
      );
    }
    const prepared = await this.prepareApplication(
      profile,
      request,
      initialPreparation,
    );
    if (prepared.status === "BLOCKED") {
      return {
        ...this.blockedProjection(profile, prepared),
        preparationOperation: this.prepareCapabilityEvidence(
          profile,
          initialPreparation,
          prepared,
          true,
        ),
      };
    }
    let refreshed = await this.status(profileCode, request);
    refreshed.preparation = {
      ...refreshed.preparation,
      groupReceipts: prepared.groupReceipts,
    };
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
            beforeSteps.map((step) => [
              step.code,
              step.status,
              step.installedVersion,
            ]),
          ) !==
            JSON.stringify(
              afterSteps.map((step) => [
                step.code,
                step.status,
                step.installedVersion,
              ]),
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
    if (preparation.status === "BLOCKED")
      return this.blockedProjection(profile, preparation);
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
        ...this.applicationTargetBinding(
          profile.target.connectionName,
          profile.target.runtimeRole || "WCMS_STAGED",
          profile.target.moduleName,
        ),
        connectionType: profile.target.connectionType || "abstract",
        methodName: "GET",
        apiName:
          "/publication/baselines/" + encodeURIComponent(profile.baselineCode),
        timeoutMs: profile.target.timeoutMs,
        maxAttempts: profile.target.maxAttempts,
        header: { Authorization: "Bearer " + token },
      })
        .then(
          (response) =>
            (response && (response.data || response.result || response)) || {},
        )
        .catch(() => undefined);
      let binding = this.approvalRepairBinding(repairBefore);
      if (binding) body.approvalRepairBinding = binding;
    }
    return SERVICE.DefaultModuleService.invokeModule({
      moduleName: profile.target.moduleName,
      local: false,
      ...this.applicationTargetBinding(
        profile.target.connectionName,
        profile.target.runtimeRole || "WCMS_STAGED",
        profile.target.moduleName,
      ),
      connectionType: profile.target.connectionType || "abstract",
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
      .then((response) => {
        let authority =
          (response && (response.data || response.result || response)) || {};
        const mediaDependencies =
          authority.mediaDependencies ||
          ((authority.readiness === "READY" ||
            authority.readiness === "MEDIA_DEPENDENCIES_PENDING" ||
            (authority.publication &&
              authority.publication.state === "ONLINE")) &&
          this.preparationSteps(profile).some(
            (step) =>
              step.type === "MEDIA_ASSET_MANIFEST" && step.required !== false,
          )
            ? {
                contractVersion: 1,
                owner: "media",
                qualified: false,
                status: "UNAVAILABLE",
                dependencies: [],
                message:
                  "Media publication dependency evidence is not available from the CMS owner.",
              }
            : undefined);
        let readiness =
          preparation.status === "BLOCKED" ? "BLOCKED" : authority.readiness;
        if (
          readiness === "READY" &&
          mediaDependencies &&
          mediaDependencies.qualified !== true
        ) {
          readiness = "MEDIA_DEPENDENCIES_PENDING";
        }
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
          publicationTargetResponded: true,
          releaseStatus: authority.releaseStatus,
          releaseCode: authority.releaseCode,
          preparation: preparation,
          publication: authority.publication,
          publicationDiagnostic: authority.publicationDiagnostic,
          mediaDependencies,
          publicationDependencyGraph: authority.publicationDependencyGraph,
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
          profile: this.describe(profile, projection),
          allowedActions:
            preparation.status === "BLOCKED"
              ? []
              : readiness === "READY" ||
                  readiness === "MEDIA_DEPENDENCIES_PENDING"
                ? [].concat(
                    updateAvailable ||
                      preparationUpdateAvailable ||
                      (mediaDependencies &&
                        []
                          .concat(mediaDependencies.dependencies || [])
                          .some((item) => item.status === "VERSION_UNPINNED"))
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
          publicationDiagnostic: authority.publicationDiagnostic,
          mediaDependencies,
          publicationDependencyGraph: authority.publicationDependencyGraph,
          lineage: authority.lineage,
          repair: repair,
          capability: this.capabilityProjection(profile, projection),
        };
      })
      .catch((error) => {
        if (operation === "status" && error && error.code === "ERR_RTR_00004") {
          return this.blockedProjection(profile, {
            ...preparation,
            status: "BLOCKED",
            steps: [].concat(preparation.steps || [], {
              type: "PUBLICATION_READINESS",
              code: profile.baselineCode,
              required: true,
              status: "READINESS_RATE_LIMITED",
              targetServer: this.applicationTargetBinding(
                profile.target.connectionName,
                profile.target.runtimeRole || "WCMS_STAGED",
                profile.target.moduleName,
              ).connectionName,
              targetRuntimeRole: profile.target.runtimeRole || "WCMS_STAGED",
              message: this.targetFailureMessage("ERR_RTR_00004", ""),
            }),
          });
        }
        throw this.targetDiagnostic(error, profile, request);
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
      ...this.applicationTargetBinding(
        profile.target.connectionName,
        profile.target.runtimeRole || "WCMS_STAGED",
        "system",
      ),
      connectionType: profile.target.connectionType || "abstract",
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
