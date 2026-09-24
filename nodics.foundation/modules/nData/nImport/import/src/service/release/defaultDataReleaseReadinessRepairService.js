/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/service/release/DefaultDataReleaseReadinessRepairService
 * @description Provides nImport-owned operational-readiness repair execution by delegating to the canonical data-release service.
 * @layer service
 * @owner import
 * @override Projects may extend release policy through nImport configuration; Axis and BackOffice must not duplicate import execution logic.
 */
module.exports = {
  providerCode: "dataReleaseReadinessRepairProvider",
  ownerModule: "import",
  repairContractVersion: 1,

  supportedOperations: [
    { operation: "dataRelease.install", action: "PREPARE_CAPABILITY" },
    { operation: "dataRelease.install", action: "UPDATE_RELEASE" },
    { operation: "dataRelease.install", action: "RETRY_FAILED_IMPORT" },
    { operation: "dataRelease.status", action: "REFRESH_READINESS" },
  ],

  /** Describes provider readiness without exposing executable internals. */
  repairCapability: function () {
    const releaseService = this.releaseService();
    const ready =
      releaseService &&
      typeof releaseService.preflight === "function" &&
      typeof releaseService.execute === "function";
    return {
      repairContractVersion: this.repairContractVersion,
      ownerModule: this.ownerModule,
      providerCode: this.providerCode,
      lifecycleState: ready ? "READY" : "MISCONFIGURED",
      available: ready,
      supportedOperations: this.supportedOperations.slice(),
      message: ready
        ? "nImport repair provider is ready."
        : "nImport data release service is unavailable.",
      nextAction: ready
        ? undefined
        : "Start a runtime that loads nImport before executing data-release readiness repairs.",
    };
  },

  /** Executes a governed repair by reusing the existing data-release authority. */
  executeRepair: async function (repair, request) {
    const releaseService = this.releaseService();
    if (!releaseService) {
      return this.unavailable(repair);
    }
    const target = this.resolveTarget(releaseService, repair);
    if (!target.releaseCode) {
      return this.targetMissing(repair);
    }
    if (!target.dataType) {
      return this.targetUnavailable(repair, target.releaseCode);
    }
    const operationRequest = this.operationRequest(repair, request, target);
    const validateOnly =
      repair.dryRun === true || repair.operation === "dataRelease.status";
    try {
      const response = validateOnly
        ? await releaseService.preflight(operationRequest)
        : await releaseService.execute(operationRequest);
      return this.toRepairResult(repair, target, response, validateOnly);
    } catch (error) {
      return this.toErrorResult(repair, target, error);
    }
  },

  /** Resolves the canonical nImport service from the runtime registry. */
  releaseService: function () {
    return typeof SERVICE !== "undefined" && SERVICE.DefaultDataReleaseService;
  },

  /** Resolves stable release target identity and data type. */
  resolveTarget: function (releaseService, repair) {
    const identifiers = (repair && repair.targetIdentifiers) || {};
    const context = (repair && repair.context) || {};
    const releaseCode = String(
      identifiers.releaseCode ||
        context.releaseCode ||
        context.owner ||
        context.sourceCode ||
        "",
    ).trim();
    let dataType = String(
      context.dataType || context.releaseDataType || context.type || "",
    )
      .trim()
      .toLowerCase();
    if (releaseCode && !dataType && typeof releaseService.discoverReleases === "function") {
      dataType = this.findReleaseDataType(releaseService, releaseCode);
    }
    return {
      releaseCode: releaseCode,
      dataType: dataType,
      expectedVersion: context.expectedVersion || context.version,
    };
  },

  /** Finds the release type from the active catalogue without using names as authority. */
  findReleaseDataType: function (releaseService, releaseCode) {
    for (const type of ["init", "core", "sample"]) {
      try {
        const match = (releaseService.discoverReleases(type) || []).find(
          (release) => release && release.releaseCode === releaseCode,
        );
        if (match && match.dataType) return String(match.dataType).toLowerCase();
      } catch (error) {
        // Discovery may be destination scoped; continue so the provider can
        // return a governed unavailable result instead of leaking internals.
      }
    }
    return "";
  },

  /** Builds the request shape consumed by DefaultDataReleaseService. */
  operationRequest: function (repair, request, target) {
    const expectedReleases = {};
    if (target.expectedVersion) {
      expectedReleases[target.releaseCode] = target.expectedVersion;
    }
    return Object.assign({}, request || {}, {
      releaseRequest: {
        dataType: target.dataType,
        releaseCodes: [target.releaseCode],
        expectedReleases: expectedReleases,
      },
      repairContext: {
        idempotencyKey: repair.idempotencyKey,
        correlationId: repair.correlationId,
        action: repair.action,
        dryRun: repair.dryRun === true,
      },
    });
  },

  /** Converts nImport preflight/execution evidence to the BackOffice repair contract. */
  toRepairResult: function (repair, target, response, validateOnly) {
    const data = (response && response.data) || {};
    const dryRun = data.dryRun || {};
    const summary = dryRun.summary || {};
    const releases = [].concat(data.releases || []);
    const targetCodes = releases.map((release) => release.releaseCode).filter(Boolean);
    const changedCount = validateOnly
      ? Number(summary.install || 0) +
        Number(summary.update || 0) +
        Number(summary.retry || 0)
      : releases.length;
    const skippedCount = validateOnly
      ? Number(summary.skip || 0) + Number(summary.wait || 0)
      : 0;
    const blockersRemaining = validateOnly
      ? Number(summary.blocked || 0) + Number(summary.wait || 0)
      : 0;
    const publicationFollowUps = [].concat(dryRun.publicationFollowUps || []);
    const refreshScopes = ["imports", "operationalReadiness"].concat(
      publicationFollowUps.length > 0 ? ["publishing"] : [],
    );
    return {
      state: validateOnly ? "DRY_RUN" : "COMPLETED",
      targetIdentifiers: { releaseCode: target.releaseCode },
      changedCount: changedCount,
      skippedCount: skippedCount,
      blockersRemaining: blockersRemaining,
      preview: {
        changedCount: changedCount,
        skippedCount: skippedCount,
        targetCodes: targetCodes.length > 0 ? targetCodes : [target.releaseCode],
      },
      transaction: {
        atomic: false,
        rollbackAvailable: false,
        rollbackHint:
          "Data-release repairs use immutable release receipts; rollback requires installing a governed later corrective release.",
      },
      policy: {
        approvalRequired: false,
      },
      retryPolicy: {
        safeToRetry: validateOnly || blockersRemaining > 0,
        reuseIdempotencyKey: true,
      },
      plan: this.plan(repair, target, dryRun, validateOnly),
      refreshScopes: refreshScopes,
      evidenceReference: this.evidenceReference(target, data),
      message: this.message(validateOnly, target, dryRun),
      nextAction: this.nextAction(validateOnly, blockersRemaining, publicationFollowUps),
    };
  },

  /** Returns clear source-repair guidance for defects that cannot be fixed in Axis. */
  toErrorResult: function (repair, target, error) {
    const message = String((error && error.message) || "");
    if (/manifest|descriptor|sourceRoot|symlink|file count/i.test(message)) {
      return {
        state: "SOURCE_REPAIR_REQUIRED",
        targetIdentifiers: { releaseCode: target.releaseCode },
        changedCount: 0,
        skippedCount: 0,
        blockersRemaining: 1,
        preview: {
          changedCount: 0,
          skippedCount: 0,
          targetCodes: target.releaseCode ? [target.releaseCode] : [],
        },
        transaction: {
          atomic: false,
          rollbackAvailable: false,
          rollbackHint:
            "No runtime rollback is available because the source release package must be repaired before import.",
        },
        policy: {
          approvalRequired: false,
          disabled: true,
        },
        retryPolicy: {
          safeToRetry: false,
          reuseIdempotencyKey: false,
        },
        plan: {
          businessSteps: [
            "Repair the owning data release source package.",
            "Regenerate or validate the release manifest through the owner pipeline.",
            "Restart or refresh readiness after the corrected release is available.",
          ],
          machineSteps: [
            {
              action: "SOURCE_REPAIR_REQUIRED",
              ownerModule: this.ownerModule,
              target: target.releaseCode,
            },
          ],
        },
        refreshScopes: ["imports", "operationalReadiness"],
        evidenceReference: error && error.code ? String(error.code) : undefined,
        message: message || "Data release source package requires repair.",
        nextAction:
          "Repair the owning source release and run the release validation pipeline before retrying from Axis.",
      };
    }
    return {
      state: "FAILED",
      targetIdentifiers: { releaseCode: target.releaseCode },
      changedCount: 0,
      skippedCount: 0,
      blockersRemaining: 1,
      retryPolicy: {
        safeToRetry: true,
        reuseIdempotencyKey: false,
      },
      refreshScopes: ["imports", "operationalReadiness"],
      evidenceReference: error && error.code ? String(error.code) : undefined,
      message: message || "Data release repair failed.",
      nextAction:
        "Review nImport execution evidence, repair the blocker, and retry when the owner service is healthy.",
    };
  },

  /** Builds business and machine steps for Axis and audit evidence. */
  plan: function (repair, target, dryRun, validateOnly) {
    const messages = [].concat(dryRun.messages || []);
    return {
      businessSteps:
        messages.length > 0
          ? messages
          : [
              validateOnly
                ? "Validate the selected data release plan."
                : "Install or update the selected data release through nImport.",
            ],
      machineSteps: [
        {
          action: validateOnly ? "PREFLIGHT_DATA_RELEASE" : "EXECUTE_DATA_RELEASE",
          ownerModule: this.ownerModule,
          target: target.releaseCode,
        },
        {
          action: "REFRESH_OPERATIONAL_READINESS",
          ownerModule: "backoffice",
          target: target.releaseCode,
        },
      ],
    };
  },

  /** Returns compact execution evidence references without exposing filesystem paths. */
  evidenceReference: function (target, data) {
    return (
      data.importRun ||
      (Array.isArray(data.importRuns) && data.importRuns[data.importRuns.length - 1]) ||
      "dataRelease:" + target.releaseCode
    );
  },

  /** Builds the operator-facing message. */
  message: function (validateOnly, target, dryRun) {
    if (validateOnly) {
      return (
        [].concat(dryRun.messages || [])[0] ||
        "Data release repair dry-run completed for " + target.releaseCode + "."
      );
    }
    return "Data release repair executed for " + target.releaseCode + ".";
  },

  /** Builds the operator-facing next action. */
  nextAction: function (validateOnly, blockersRemaining, publicationFollowUps) {
    if (blockersRemaining > 0) {
      return "Repair remaining data-release blockers, then refresh operational readiness.";
    }
    if (validateOnly) {
      return "Execute the governed repair if the dry-run result matches the intended change.";
    }
    if (publicationFollowUps.length > 0) {
      return "Refresh operational readiness and complete governed publication before Online users can see the change.";
    }
    return "Refresh operational readiness and confirm the capability is prepared.";
  },

  /** Returns a guarded result when the owning nImport service is not loaded. */
  unavailable: function (repair) {
    return {
      state: "PROVIDER_MISCONFIGURED",
      targetIdentifiers: (repair && repair.targetIdentifiers) || {},
      blockersRemaining: 1,
      message: "nImport data release service is unavailable.",
      nextAction:
        "Start a runtime that loads nImport before executing data-release readiness repairs.",
    };
  },

  /** Returns validation guidance when the repair request lacks stable target identity. */
  targetMissing: function () {
    return {
      state: "VALIDATION_FAILED",
      blockersRemaining: 1,
      message: "Data release repair requires a stable releaseCode target.",
      nextAction: "Refresh readiness and retry from a data-release blocker action.",
    };
  },

  /** Returns target guidance when the requested release cannot be found in the active catalogue. */
  targetUnavailable: function (repair, releaseCode) {
    return {
      state: "TARGET_NOT_FOUND",
      targetIdentifiers: { releaseCode: releaseCode },
      blockersRemaining: 1,
      message: "Requested data release target is unavailable in this runtime.",
      nextAction:
        "Register or activate the owning module in this runtime, then refresh readiness.",
    };
  },
};
