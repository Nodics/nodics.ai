/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/runtimeWorker
 * @description Builds or starts the real Nodics acceptance composition through Foundation; exposes no test HTTP endpoints or replacement authority.
 * @layer test @owner copilotKnowledge
 */
const fs = require("node:fs");
const path = require("node:path");
const _ = require("lodash");

/** Runs the selected disposable lifecycle and sends readiness only after ordinary startup. @returns {Promise<void>} Lifecycle completion. */
async function main() {
  const selection = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const root = selection.frameworkRoot;
  const foundation = require(path.join(root, "nodics.foundation"));
  const options = {
    NODICS_HOME: path.join(root, "nodics.foundation"),
    CUSTOM_HOME: selection.root,
    MODULE_ROOTS: require(path.join(root, "package.json"))
      .workspaces.concat(selection.additionalModuleRoots || [])
      .map((entry) => path.join(root, entry))
      .concat(selection.root),
    defaultServer: selection.serverName,
    defaultEnvironment: selection.environmentName,
  };
  if (process.argv[3] === "build") {
    await foundation.buildAll(options);
    return;
  }
  await foundation.start(options);
  if (
    CONFIG.get("copilotAcceptance")?.withRulesInspection &&
    CONFIG.get("runtimeRole")?.code === "RULES"
  ) {
    // A synthetic consumer supplies only an empty catalogue; all draft creation and reads still use native APIs.
    SERVICE.DefaultRulePropertyCatalogueRegistryService.registerProvider(
      "acceptance",
      {
        getCatalogue: () => ({
          code: "ACCEPTANCE_PROPERTIES",
          version: "1",
          providerCode: "acceptance",
          consumerModule: "acceptance",
          properties: [],
        }),
        resolveProperty: () => ({ available: false }),
      },
    );
  }
  if (CONFIG.get("copilotAcceptance")?.withCouponActions) {
    const handler = SERVICE.DefaultRequestHandlerPipelineService;
    const validate = handler.validateApiExposure;
    /** Records only disabled category identifiers; preserves native admission unchanged. */
    handler.validateApiExposure = function (request, ...rest) {
      const category = this.getApiExposureCategory(request.router || {});
      if (category && !this.isApiExposureEnabled(category))
        process.send?.({
          phase: "diagnostic",
          code: "COUPON_CATEGORY_DENIED",
          category,
        });
      return validate.call(this, request, ...rest);
    };
    const merchant = SERVICE.DefaultDigitalCommerceMerchantService;
    if (merchant)
      for (const operation of [
        "workspace",
        "validate",
        "confirm",
        "inspectReceipt",
      ]) {
        const original = merchant[operation];
        /** Keeps sensitive owner errors private while identifying the failing native code location. */
        merchant[operation] = async function (...args) {
          try {
            return await original.apply(this, args);
          } catch (error) {
            process.send?.({
              phase: "diagnostic",
              code: "COUPON_OWNER_REJECTED",
              operation,
              frames: String(error.stack || "")
                .split("\n")
                .filter((line) => /^\s+at /.test(line))
                .slice(0, 6),
            });
            throw error;
          }
        };
      }
  }
  if (
    CONFIG.get("copilotAcceptance")?.withCouponActions &&
    CONFIG.get("runtimeRole")?.code === "COMMERCE"
  )
    await require(
      path.join(
        root,
        "nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/helpers/nativeCouponFixture",
      ),
    ).provision();
  const modules = SERVICE.DefaultModuleService;
  if (modules?.fetch) {
    const fetchModule = modules.fetch;
    modules.fetch = async function (request, ...args) {
      try {
        return await fetchModule.call(this, request, ...args);
      } catch (error) {
        const url = new URL(request.uri);
        if (
          url.pathname.includes("/publication/target/") ||
          (CONFIG.get("copilotAcceptance")?.withEnterpriseActions &&
            url.pathname.includes("/enterprises"))
        )
          process.send?.({
            phase: "diagnostic",
            code: url.pathname.includes("/publication/target/")
              ? "PUBLICATION_TARGET_TRANSPORT"
              : "ENTERPRISE_TARGET_TRANSPORT",
            status: error.status,
            origin: url.origin,
            path: url.pathname,
          });
        throw error;
      }
    };
  }
  const saves = SERVICE.DefaultModelSaveInitializerService;
  if (saves?.insertModel) {
    const insertModel = saves.insertModel;
    saves.insertModel = async function (request) {
      try {
        return await insertModel.call(this, request);
      } catch (error) {
        process.send?.({
          phase: "diagnostic",
          code: error.code,
          insertOnly: {
            plainModel: _.isPlainObject(request.model),
            plainQuery: _.isPlainObject(request.query || {}),
            versioned: !!request.schemaModel.versioned,
            managed: !!SERVICE.DefaultModelConcurrencyService?.getField(
              request.schemaModel.rawSchema,
            ),
            atomicAdapter:
              typeof request.schemaModel.compareAndSetItem === "function",
            recursive: request.options?.recursive === true,
            replace: request.options?.replaceAllMatchesByQuery === true,
            mismatchedKeys: Object.entries(request.query || {})
              .filter(([key, value]) => !_.isEqual(value, request.model[key]))
              .map(([key]) => key),
          },
        });
        throw error;
      }
    };
  }
  if (CONFIG.get("runtimeRole")?.code === "PLATFORM")
    await SERVICE.DefaultCopilotAcceptanceBootstrapService.provisionRuntimeScope();
  if (
    CONFIG.get("copilotAcceptance")?.withEnterpriseActions ||
    CONFIG.get("copilotAcceptance")?.withPriceActions ||
    CONFIG.get("copilotAcceptance")?.withCollectionActions ||
    CONFIG.get("copilotAcceptance")?.withProcessActions ||
    CONFIG.get("copilotAcceptance")?.withCouponActions ||
    CONFIG.get("copilotAcceptance")?.withGovernedSchemaActions
  ) {
    let enterpriseResponseLost = false;
    let priceResponseLost = false;
    let collectionResponseLost = false;
    let couponResponseLost = false;
    let processResponseLost = false;
    const owner = SERVICE.DefaultModuleService;
    const original = owner.invokeModule;
    /** Captures only native rejection locations, never business payloads or credentials. */
    owner.invokeModule = async function (...args) {
      try {
        const result = await original.apply(this, args);
        if (
          (CONFIG.get("copilotAcceptance")?.withProcessResponseLoss ||
            CONFIG.get("copilotAcceptance")?.withProcessTriggerResponseLoss) &&
          !processResponseLost &&
          args[0]?.moduleName === "workflow" &&
          args[0]?.apiName ===
            (CONFIG.get("copilotAcceptance")?.withProcessTriggerResponseLoss
              ? "/triggers/acceptance_trigger/execute"
              : "/tasks/acceptance_task_one/complete") &&
          args[0]?.methodName === "POST"
        ) {
          processResponseLost = true;
          process.send?.({
            phase: "diagnostic",
            code: "PROCESS_TASK_RESPONSE_LOST",
          });
          throw new Error(
            "Disposable task response loss after native completion",
          );
        }
        if (
          args[0]?.moduleName === "digitalCore" &&
          /^\/merchant\/redemptions\/[^/]+\/confirm$/.test(args[0]?.apiName) &&
          args[0]?.methodName === "POST"
        ) {
          process.send?.({
            phase: "diagnostic",
            code: "COUPON_NATIVE_COMPLETED",
          });
          if (
            CONFIG.get("copilotAcceptance")?.withCouponResponseLoss &&
            !couponResponseLost
          ) {
            couponResponseLost = true;
            process.send?.({
              phase: "diagnostic",
              code: "COUPON_RESPONSE_LOST",
            });
            throw new Error("Disposable coupon response loss");
          }
        }
        if (
          args[0]?.moduleName === "wasteCollection" &&
          args[0]?.apiName === "/wastecollectionpoint" &&
          args[0]?.methodName === "PUT"
        ) {
          process.send?.({
            phase: "diagnostic",
            code: "COLLECTION_NATIVE_COMPLETED",
          });
          if (
            args[0]?.request?.code ===
              CONFIG.get("copilotAcceptance")?.collectionResponseLossCode &&
            !collectionResponseLost
          ) {
            collectionResponseLost = true;
            process.send?.({
              phase: "diagnostic",
              code: "COLLECTION_RESPONSE_LOST",
            });
            throw new Error("Disposable collection response loss");
          }
        }
        if (
          args[0]?.moduleName === "product" &&
          args[0]?.apiName === "/product" &&
          args[0]?.methodName === "PUT"
        ) {
          process.send?.({
            phase: "diagnostic",
            code: "PRODUCT_NATIVE_COMPLETED",
          });
        }
        if (
          args[0]?.moduleName === "pricing" &&
          args[0]?.apiName === "/pricerow" &&
          args[0]?.methodName === "PUT"
        ) {
          process.send?.({
            phase: "diagnostic",
            code: "PRICE_NATIVE_COMPLETED",
          });
          if (
            args[0]?.request?.code ===
              CONFIG.get("copilotAcceptance")?.priceResponseLossCode &&
            !priceResponseLost
          ) {
            priceResponseLost = true;
            process.send?.({
              phase: "diagnostic",
              code: "PRICE_RESPONSE_LOST",
            });
            throw new Error("Disposable price response loss");
          }
        }
        if (
          args[0]?.apiName === "/enterprises" &&
          args[0]?.methodName === "POST"
        ) {
          process.send?.({
            phase: "diagnostic",
            code: "ENTERPRISE_NATIVE_COMPLETED",
          });
          if (
            CONFIG.get("copilotAcceptance")?.withEnterpriseResponseLoss &&
            !enterpriseResponseLost
          ) {
            enterpriseResponseLost = true;
            process.send?.({
              phase: "diagnostic",
              code: "ENTERPRISE_RESPONSE_LOST",
            });
            throw new Error("Disposable enterprise response loss");
          }
        }
        return result;
      } catch (error) {
        if (
          args[0]?.apiName?.startsWith("/enterprises") ||
          args[0]?.apiName === "/pricerow" ||
          (CONFIG.get("copilotAcceptance")?.withGovernedSchemaActions &&
            args[0]?.moduleName === "product" &&
            args[0]?.apiName === "/schemaactionrecord")
        )
          process.send?.({
            phase: "diagnostic",
            code:
              args[0]?.apiName === "/schemaactionrecord"
                ? "SCHEMA_ACTION_NATIVE_REJECTED"
                : "BUSINESS_NATIVE_REJECTED",
            ownerCode: error.code,
            frames: String(error.stack || "")
              .split("\n")
              .filter((line) => /^\s+at /.test(line))
              .slice(0, 5),
          });
        throw error;
      }
    };
  }
  if (
    selection.failMeasuredSettlement &&
    CONFIG.get("runtimeRole")?.code === "PLATFORM"
  ) {
    const usage = SERVICE.DefaultCopilotUsageService;
    const settle = usage.settle;
    let failed = false;
    /** Fails once after real provider receipt capture but before normal ledger settlement. */
    usage.settle = async function (handle, measurement, ...args) {
      if (!failed && measurement?.state === "MEASURED") {
        failed = true;
        process.send?.({
          phase: "diagnostic",
          code: "MEASURED_SETTLEMENT_UNAVAILABLE",
        });
        throw new Error("Disposable settlement unavailable");
      }
      return settle.call(this, handle, measurement, ...args);
    };
  }
  if (
    selection.journalResponseLoss &&
    CONFIG.get("runtimeRole")?.code === "PLATFORM"
  ) {
    if (!["STARTED", "ERASED"].includes(selection.journalResponseLoss))
      throw new Error("Unsupported disposable journal fault");
    const receipts = SERVICE.DefaultDiscoveryIndexRetirementReceiptService;
    const updateReceipt = receipts.update;
    let dropped = false;
    /** Loses one response only after the real generated durable update returns; never substitutes persistence. */
    receipts.update = async function (request, ...args) {
      const result = await updateReceipt.call(this, request, ...args);
      if (
        !dropped &&
        request.model?.erasure?.state === selection.journalResponseLoss &&
        /^SUC_/.test(result?.code || "")
      ) {
        dropped = true;
        process.send?.({
          phase: "diagnostic",
          code: "ERASURE_JOURNAL_RESPONSE_LOST",
          state: selection.journalResponseLoss,
        });
        throw new Error("Disposable durable response loss");
      }
      return result;
    };
  }
  const generation = SERVICE.DefaultDiscoveryGenerationService;
  if (
    CONFIG.get("copilotAcceptance")?.withScheduleResponseLoss &&
    CONFIG.get("runtimeRole")?.code === "PROCESS"
  ) {
    const cron = SERVICE.DefaultCronJobRuntimeService;
    const start = cron.startJob;
    let dropped = false;
    /** Loses one acknowledgement after the real timer starts; never substitutes a scheduler result. */
    cron.startJob = async function (...args) {
      const result = await start.apply(this, args);
      if (
        !dropped &&
        args[0] === "default" &&
        args[1] === "acceptance-refresh-job"
      ) {
        dropped = true;
        process.send?.({
          phase: "diagnostic",
          code: "CRON_ACTIVATION_RESPONSE_LOST",
        });
        throw new Error("Disposable activation acknowledgement loss");
      }
      return result;
    };
  }
  if (
    CONFIG.get("copilotAcceptance")?.withRefresh &&
    SERVICE.DefaultCronJobScheduleLifecycleService
  ) {
    const lifecycleOwner = SERVICE.DefaultCronJobScheduleLifecycleService;
    const fail = lifecycleOwner.fail;
    /** Preserves the original lifecycle rejection location without exposing request data. */
    lifecycleOwner.fail = function (...args) {
      process.send?.({
        phase: "diagnostic",
        code: "CRON_LIFECYCLE_REJECTED",
        frames: new Error().stack
          .split("\n")
          .filter((line) => /^\s+at /.test(line))
          .slice(0, 5),
      });
      return fail.apply(this, args);
    };
    for (const [lifecycle, method] of [
      ...["transition", "prepare", "executeOnce", "read"].map((method) => [
        lifecycleOwner,
        method,
      ]),
      ...["createJob", "startJob", "persistRuntimeState"].map((method) => [
        SERVICE.DefaultCronJobRuntimeService,
        method,
      ]),
    ]) {
      const original = lifecycle[method];
      /** Records only bounded stack locations for the owned scheduler acceptance. */
      lifecycle[method] = async function (...args) {
        try {
          return await original.apply(this, args);
        } catch (error) {
          process.send?.({
            phase: "diagnostic",
            code: "CRON_LIFECYCLE_FAILURE",
            method,
            ownerCode: error.code,
            frames: String(error.stack || "")
              .split("\n")
              .filter((line) => /^\s+at /.test(line))
              .slice(0, 6),
          });
          throw error;
        }
      };
    }
  }
  const retention = SERVICE.DefaultCopilotRetentionExecutionService;
  if (retention) {
    const advance = retention.advance;
    /** Captures bounded error locations for owned retention acceptance, never record content. */
    retention.advance = async function (...args) {
      try {
        return await advance.apply(this, args);
      } catch (error) {
        process.send?.({
          phase: "diagnostic",
          code: "RETENTION_ADVANCE_FAILURE",
          status: error.code,
          validationProperties:
            error.errInfo?.details?.schemaRulesNotSatisfied?.flatMap((rule) =>
              (rule.propertiesNotSatisfied || []).map(
                (item) => item.propertyName,
              ),
            ),
          contexts: error.contexts?.map(({ layer, handler }) => ({
            layer,
            handler,
          })),
          frames: String(error.stack || "")
            .split("\n")
            .filter((x) => /^\s+at /.test(x))
            .slice(0, 6),
        });
        throw error;
      }
    };
  }
  if (generation) {
    const saveGeneration = generation.save;
    generation.save = async function (...args) {
      try {
        const response = await saveGeneration.apply(this, args);
        if (!/^SUC_/.test(response?.code || ""))
          process.send?.({
            phase: "diagnostic",
            code: response?.code || "GENERATION_SAVE_UNACKNOWLEDGED",
          });
        return response;
      } catch (error) {
        process.send?.({
          phase: "diagnostic",
          code: error.code || "GENERATION_SAVE_FAILURE",
          category: /validation/i.test(error.message)
            ? "DOCUMENT_VALIDATION"
            : /E11000|duplicate/i.test(error.message)
              ? "DUPLICATE_KEY"
              : /write.?concern/i.test(error.message)
                ? "WRITE_CONCERN"
                : "OTHER",
          contexts: error.contexts?.map(({ layer, handler, nodeName }) => ({
            layer,
            handler,
            nodeName,
          })),
          frames: String(error.stack || "")
            .split("\n")
            .filter((line) => /^\s+at /.test(line))
            .slice(0, 4),
        });
        throw error;
      }
    };
  }
  const ingestion = SERVICE.DefaultCopilotKnowledgeIngestionService;
  if (ingestion) {
    const ingestSource = ingestion.ingestSource;
    ingestion.ingestSource = async function (...args) {
      try {
        return await ingestSource.apply(this, args);
      } catch (error) {
        process.send?.({
          phase: "diagnostic",
          code: /^[A-Z][A-Z0-9_]+$/.test(error.code || error.message || "")
            ? error.code || error.message
            : "INGESTION_FAILURE",
          frames: String(error.stack || "")
            .split("\n")
            .filter((line) => /^\s+at /.test(line))
            .slice(0, 6),
        });
        throw error;
      }
    };
  }
  if (
    CONFIG.get("copilotAcceptance")?.withRefresh &&
    CONFIG.get("runtimeRole")?.code === "PLATFORM"
  ) {
    process.on("message", async (message) => {
      if (message?.action !== "notifySourceEvent") return;
      try {
        const origin = CONFIG.get("copilotAcceptance").refreshOrigin;
        if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
          throw new Error("Owned loopback required");
        const token = NODICS.getInternalAuthToken("default");
        const response = await fetch(
          origin + "/nodics/copilotApi/v0/knowledge/events/sourceChanged",
          {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.timeout(45000),
            headers: {
              "Content-Type": "application/json",
              "x-enterprise-code": "default",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(message.body),
          },
        );
        const body = await response.json();
        process.send?.({
          phase: "sourceEventEvidence",
          requestId: message.requestId,
          evidence: { status: response.status, body },
        });
      } catch (error) {
        process.send?.({
          phase: "sourceEventEvidence",
          requestId: message.requestId,
          failed: true,
          diagnostic: {
            code: error.code,
            name: error.name,
            frames: String(error.stack || "")
              .split("\n")
              .filter((line) => /^\s+at /.test(line))
              .slice(0, 4),
          },
        });
      }
    });
  }
  if (CONFIG.get("copilotAcceptance")?.withRetention) {
    process.on("message", async (message) => {
      if (message?.action !== "inspectRetentionFixture") return;
      try {
        const request = {
          tenant: "default",
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          options: { skipItemCache: true },
        };
        const scope = { tenantCode: "default", enterpriseCode: "default" };
        /** Reads only the fixed disposable identities and returns counts, never content. */
        const read = async (service, query) => {
          const result = await service.get({
            ...request,
            query: { ...scope, ...query },
          });
          if (
            !/^SUC_/.test(result?.code || "") ||
            !Array.isArray(result.result)
          )
            throw new Error("Unacknowledged inspection");
          return result.result;
        };
        const binding = { conversationCode: "acceptance-expired-conversation" };
        const parents = await read(
          SERVICE.DefaultCopilotConversationRecordService,
          { code: binding.conversationCode },
        );
        const evidence = {
          parentCount: parents.length,
          state: parents[0]?.state,
          titleCleared: parents[0]?.title === null,
        };
        for (const [key, name] of [
          ["messages", "DefaultCopilotMessageService"],
          ["events", "DefaultCopilotEventService"],
          ["turns", "DefaultCopilotTurnService"],
        ])
          evidence[key] = (await read(SERVICE[name], binding)).length;
        for (const [key, name, code] of [
          [
            "heldAudit",
            "DefaultCopilotTranscriptAccessService",
            "acceptance-held-audit",
          ],
          [
            "expiredAudit",
            "DefaultCopilotTranscriptAccessService",
            "acceptance-expired-audit",
          ],
          [
            "uncertainAction",
            "DefaultCopilotActionService",
            "acceptance-uncertain-action",
          ],
          [
            "expiredAction",
            "DefaultCopilotActionService",
            "acceptance-expired-action",
          ],
        ])
          evidence[key] = (await read(SERVICE[name], { code })).length;
        process.send?.({
          phase: "retentionEvidence",
          requestId: message.requestId,
          evidence,
        });
      } catch {
        process.send?.({
          phase: "retentionEvidence",
          requestId: message.requestId,
          failed: true,
        });
      }
    });
  }
  process.send?.({ phase: "ready", modules: NODICS.getActiveModules() });
  await new Promise((resolve) => {
    process.once("SIGTERM", resolve);
    process.once("SIGINT", resolve);
    process.once("disconnect", resolve);
  });
  await SERVICE.DefaultRuntimeLifecycleService.requestShutdown({
    reason: "copilot-acceptance",
  });
  if (process.connected) process.disconnect();
}
main().catch((error) => {
  console.error("COPILOT_ACCEPTANCE_RUNTIME_FAILED", error);
  process.send?.({ phase: "failed" });
  process.exitCode = 1;
});
