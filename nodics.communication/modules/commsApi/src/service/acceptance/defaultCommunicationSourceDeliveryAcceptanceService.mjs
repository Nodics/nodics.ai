/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module commsApi/acceptance/defaultCommunicationSourceDeliveryAcceptanceService
 * @description Proves source-bound durable Communication delivery, retry,
 * suppression, idempotent replay and restart-safe persisted inspection.
 * @layer tooling
 * @owner commsApi
 */
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import properties from "../../../config/properties.js";
import { createAcceptanceContext } from "../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs";
import {
  projectEndpointUrl,
  projectRuntimeAcceptance,
} from "../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs";

const defaultAcceptanceName = "communicationSourceDelivery";
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const identifier = (value) =>
  typeof value === "string" &&
  /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
const moduleIdentifier = (value) =>
  typeof value === "string" && /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(value);
const required = (condition, code) => {
  if (!condition) throw Object.assign(new Error(code), { code });
};
const statuses = new Set([
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
]);

function unwrap(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    required(
      object(value) &&
        value.success !== false &&
        !value.error &&
        !(typeof value.code === "string" && value.code.startsWith("ERR_")),
      "COMMUNICATION_OWNER_RESPONSE_REFUSED",
    );
    const hasData = Object.hasOwn(value, "data");
    const hasResult = Object.hasOwn(value, "result");
    required(
      !(hasData && hasResult),
      "COMMUNICATION_OWNER_RESPONSE_AMBIGUOUS",
    );
    if (!hasData && !hasResult) return value;
    value = hasData ? value.data : value.result;
  }
  required(false, "COMMUNICATION_OWNER_RESPONSE_DEPTH");
}

export function selectCommunicationSourceDeliveryAcceptance(
  profiles,
  name = defaultAcceptanceName,
) {
  required(
    object(profiles) && Object.hasOwn(profiles, name),
    "COMMUNICATION_DELIVERY_ACCEPTANCE_UNAVAILABLE",
  );
  return profiles[name];
}

export function communicationSourceDeliveryAcceptanceArguments(args = []) {
  const selections = args.filter((value) => value.startsWith("--acceptance="));
  const phases = args.filter((value) => value.startsWith("--phase="));
  required(
    selections.length <= 1 && phases.length <= 1,
    "ONE_ACCEPTANCE_SELECTION_REQUIRED",
  );
  const acceptanceName = selections[0]?.slice(13) || defaultAcceptanceName;
  const phase = phases[0]?.slice(8) || "exercise";
  required(
    /^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(acceptanceName),
    "ACCEPTANCE_NAME_INVALID",
  );
  required(["exercise", "inspect"].includes(phase), "ACCEPTANCE_PHASE_INVALID");
  return { acceptanceName, phase };
}

function validateCommand(command) {
  const requiredKeys = [
    "sourceType",
    "sourceCode",
    "templateCode",
    "recipientId",
    "recipientAddressReference",
    "purpose",
    "channel",
    "locale",
    "idempotencyKey",
    "variables",
  ];
  const optionalKeys = ["correlationId", "expiresAt", "requiresSourceEligibility"];
  required(
    object(command) &&
      requiredKeys.every((key) => Object.hasOwn(command, key)) &&
      Object.keys(command).every((key) =>
        [...requiredKeys, ...optionalKeys].includes(key),
      ) &&
      requiredKeys
        .filter((key) => key !== "variables")
        .every(
          (key) =>
            typeof command[key] === "string" &&
            command[key].length > 0 &&
            command[key].length <= 512,
        ) &&
      object(command.variables) &&
      Object.keys(command.variables).length <= 50 &&
      ["EMAIL", "SMS", "IN_APP", "TELEGRAM"].includes(command.channel) &&
      (command.correlationId === undefined || identifier(command.correlationId)) &&
      (command.expiresAt === undefined ||
        Number.isFinite(Date.parse(command.expiresAt))) &&
      (command.requiresSourceEligibility === undefined ||
        command.requiresSourceEligibility === true),
    "REVIEWED_COMMUNICATION_COMMAND_REQUIRED",
  );
  return structuredClone(command);
}

function validateScenario(scenario, kind) {
  const keys =
    kind === "retry"
      ? ["command", "expectedInitialStatus", "expectedFinalStatus"]
      : ["command", "expectedStatus"];
  required(
    object(scenario) &&
      Object.keys(scenario).sort().join() === keys.sort().join() &&
      keys.every((key) => Object.hasOwn(scenario, key)),
    "REVIEWED_COMMUNICATION_SCENARIO_REQUIRED",
  );
  const command = validateCommand(scenario.command);
  if (kind === "delivery")
    required(
      scenario.expectedStatus === "DELIVERED",
      "DELIVERY_EXPECTATION_REQUIRED",
    );
  else if (kind === "suppression")
    required(
      scenario.expectedStatus === "SUPPRESSED",
      "SUPPRESSION_EXPECTATION_REQUIRED",
    );
  else {
    required(
      scenario.expectedInitialStatus === "RETRY_PENDING" &&
        statuses.has(scenario.expectedFinalStatus),
      "RETRY_EXPECTATION_REQUIRED",
    );
  }
  return { ...scenario, command };
}

function input(options) {
  required(options.execute === true, "EXPLICIT_EXECUTION_REQUIRED");
  required(
    ["exercise", "inspect"].includes(options.phase || "exercise"),
    "ACCEPTANCE_PHASE_INVALID",
  );
  let url;
  try {
    url = new URL(options.baseUrl);
  } catch {
    required(false, "LOCAL_HTTP_TARGET_REQUIRED");
  }
  required(
    ["http:", "https:"].includes(url.protocol) &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash,
    "LOCAL_HTTP_TARGET_REQUIRED",
  );
  const selection = structuredClone(options.selection);
  const keys = [
    "contractVersion",
    "approvalReference",
    "tenant",
    "runtimeEnterpriseCode",
    "sourceModule",
    "scenarios",
  ];
  required(
    object(selection) &&
      Object.keys(selection).length === keys.length &&
      keys.every((key) => Object.hasOwn(selection, key)) &&
      selection.contractVersion === 1 &&
      [
        selection.approvalReference,
        selection.tenant,
        selection.runtimeEnterpriseCode,
      ].every(identifier) &&
      moduleIdentifier(selection.sourceModule) &&
      object(selection.scenarios) &&
      Object.keys(selection.scenarios).sort().join() ===
        "delivery,retry,suppression",
    "REVIEWED_COMMUNICATION_SELECTION_REQUIRED",
  );
  selection.scenarios = {
    delivery: validateScenario(selection.scenarios.delivery, "delivery"),
    retry: validateScenario(selection.scenarios.retry, "retry"),
    suppression: validateScenario(
      selection.scenarios.suppression,
      "suppression",
    ),
  };
  const keysByScenario = Object.values(selection.scenarios).map(
    (scenario) => scenario.command.idempotencyKey,
  );
  required(
    new Set(keysByScenario).size === keysByScenario.length,
    "DISTINCT_COMMUNICATION_IDENTITIES_REQUIRED",
  );
  const policy = {
    ...properties.communicationApi.acceptance,
    ...(options.policy || {}),
  };
  required(
    object(policy) &&
      Object.keys(policy).sort().join() ===
        "maximumRetryWaitMs,pollIntervalMs,requestTimeoutMs" &&
      Number.isSafeInteger(policy.requestTimeoutMs) &&
      policy.requestTimeoutMs >= 1 &&
      policy.requestTimeoutMs <= 300000 &&
      Number.isSafeInteger(policy.maximumRetryWaitMs) &&
      policy.maximumRetryWaitMs >= 1 &&
      policy.maximumRetryWaitMs <= 600000 &&
      Number.isSafeInteger(policy.pollIntervalMs) &&
      policy.pollIntervalMs >= 10 &&
      policy.pollIntervalMs <= policy.maximumRetryWaitMs,
    "COMMUNICATION_ACCEPTANCE_POLICY_REQUIRED",
  );
  const session = options.session;
  required(
    object(session) &&
      Object.keys(session).length === 2 &&
      /^Bearer [^\s]{1,16384}$/i.test(session.authorization || "") &&
      session.enterpriseCode === selection.runtimeEnterpriseCode,
    "ORIGINAL_COMMUNICATION_SERVICE_SESSION_REQUIRED",
  );
  return {
    selection,
    policy,
    session,
    baseUrl: url.origin,
    phase: options.phase || "exercise",
  };
}

function intentCode(tenant, idempotencyKey) {
  return (
    "COMM_" +
    crypto
      .createHash("sha256")
      .update(JSON.stringify([tenant, idempotencyKey]))
      .digest("hex")
  );
}

async function requestJson(context, path, body) {
  let response;
  try {
    response = await context.fetchRequest(new URL(path, context.baseUrl), {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(context.policy.requestTimeoutMs),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        tenant: context.selection.tenant,
        "x-enterprise-code": context.session.enterpriseCode,
        Authorization: context.session.authorization,
        "x-correlation-id": context.selection.approvalReference,
      },
      body: JSON.stringify(body),
    });
  } catch {
    required(false, "COMMUNICATION_HTTP_OUTCOME_UNCONFIRMED");
  }
  let value;
  try {
    value = await response.json();
  } catch {
    required(false, "COMMUNICATION_OWNER_RESPONSE_INVALID");
  }
  required(response.ok, `COMMUNICATION_HTTP_${response.status}`);
  return unwrap(value);
}

async function inspect(context, code, expectedStatus) {
  const result = await requestJson(
    context,
    `/nodics/commsApi/v0/internal/communications/${encodeURIComponent(code)}/inspect`,
    {},
  );
  required(
    result.intentCode === code &&
      result.status === expectedStatus &&
      Number.isSafeInteger(result.revision) &&
      result.revision >= 0 &&
      Object.keys(result).sort().join() === "intentCode,revision,status",
    "COMMUNICATION_INSPECTION_UNCONFIRMED",
  );
  return result;
}

function expectedFinalStatus(scenario, name) {
  return name === "retry"
    ? scenario.expectedFinalStatus
    : scenario.expectedStatus;
}

async function runInspection(context) {
  const evidence = {};
  for (const [name, scenario] of Object.entries(context.selection.scenarios)) {
    const code = intentCode(
      context.selection.tenant,
      scenario.command.idempotencyKey,
    );
    evidence[name] = await inspect(
      context,
      code,
      expectedFinalStatus(scenario, name),
    );
  }
  return evidence;
}

async function requestIntent(context, scenario) {
  return requestJson(
    context,
    "/nodics/commsApi/v0/internal/communications",
    { sourceModule: context.selection.sourceModule, ...scenario.command },
  );
}

async function waitForRetryWindow(context, nextAttemptAt) {
  const due = Date.parse(nextAttemptAt);
  required(Number.isFinite(due), "COMMUNICATION_RETRY_WINDOW_REQUIRED");
  const wait = Math.max(0, due - Date.now()) + context.policy.pollIntervalMs;
  required(
    wait <= context.policy.maximumRetryWaitMs,
    "COMMUNICATION_RETRY_WAIT_EXCEEDED",
  );
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

async function runExercise(context) {
  const selected = context.selection;
  const delivery = await requestIntent(context, selected.scenarios.delivery);
  required(
    delivery.status === selected.scenarios.delivery.expectedStatus &&
      /^COMM_[a-f0-9]{64}$/.test(delivery.intentCode || "") &&
      Number.isSafeInteger(delivery.revision),
    "COMMUNICATION_DELIVERY_UNCONFIRMED",
  );
  const deliveryInspection = await inspect(
    context,
    delivery.intentCode,
    selected.scenarios.delivery.expectedStatus,
  );
  const duplicate = await requestIntent(context, selected.scenarios.delivery);
  required(
    duplicate.intentCode === delivery.intentCode &&
      duplicate.status === delivery.status &&
      duplicate.revision === deliveryInspection.revision,
    "COMMUNICATION_DEDUPLICATION_UNCONFIRMED",
  );
  const duplicateInspection = await inspect(
    context,
    delivery.intentCode,
    selected.scenarios.delivery.expectedStatus,
  );
  required(
    duplicateInspection.revision === deliveryInspection.revision,
    "COMMUNICATION_DEDUPLICATION_UNCONFIRMED",
  );

  const suppression = await requestIntent(
    context,
    selected.scenarios.suppression,
  );
  required(
    suppression.status === selected.scenarios.suppression.expectedStatus &&
      suppression.attempt === 0,
    "COMMUNICATION_SUPPRESSION_UNCONFIRMED",
  );
  await inspect(
    context,
    suppression.intentCode,
    selected.scenarios.suppression.expectedStatus,
  );

  const retryBefore = await requestIntent(context, selected.scenarios.retry);
  required(
    retryBefore.status === selected.scenarios.retry.expectedInitialStatus &&
      Number.isSafeInteger(retryBefore.attempt) &&
      retryBefore.attempt >= 1 &&
      Number.isSafeInteger(retryBefore.revision) &&
      typeof retryBefore.nextAttemptAt === "string",
    "COMMUNICATION_RETRY_PRECONDITION_REQUIRED",
  );
  await waitForRetryWindow(context, retryBefore.nextAttemptAt);
  const retried = await requestJson(
    context,
    `/nodics/commsApi/v0/internal/communications/${encodeURIComponent(retryBefore.intentCode)}/retry`,
    {},
  );
  required(
    retried.intentCode === retryBefore.intentCode &&
      retried.status === selected.scenarios.retry.expectedFinalStatus &&
      retried.attempt === retryBefore.attempt + 1 &&
      retried.revision > retryBefore.revision,
    "COMMUNICATION_RETRY_UNCONFIRMED",
  );
  await inspect(
    context,
    retried.intentCode,
    selected.scenarios.retry.expectedFinalStatus,
  );
  return {
    delivery: deliveryInspection,
    deduplication: {
      intentCode: duplicate.intentCode,
      revision: duplicateInspection.revision,
    },
    suppression: {
      intentCode: suppression.intentCode,
      status: suppression.status,
    },
    retry: {
      intentCode: retried.intentCode,
      status: retried.status,
      attempt: retried.attempt,
      revision: retried.revision,
    },
  };
}

/** Runs the mutating exercise or the read-only post-restart inspection phase. */
export async function runCommunicationSourceDeliveryAcceptance(options = {}) {
  const prepared = input(options);
  const context = {
    ...prepared,
    fetchRequest: options.fetch || globalThis.fetch,
  };
  const evidence =
    context.phase === "inspect"
      ? await runInspection(context)
      : await runExercise(context);
  return {
    contractVersion: 1,
    state: "PASSED",
    phase: context.phase,
    approvalReference: context.selection.approvalReference,
    sourceModule: context.selection.sourceModule,
    evidence,
    restartInspectionRequired: context.phase === "exercise",
  };
}

export async function runConfiguredCommunicationSourceDeliveryAcceptance(
  options = {},
) {
  const context = await createAcceptanceContext(options);
  const selection =
    options.selection ||
    selectCommunicationSourceDeliveryAcceptance(
      projectRuntimeAcceptance(context.projectRoot, context.configuration, {
        role: "ENGAGEMENT",
      }),
      options.acceptanceName || defaultAcceptanceName,
    );
  const raw = context.environment.NODICS_COMMUNICATION_ACCEPTANCE_TOKEN || "";
  const session = options.session || {
    authorization: raw.startsWith("Bearer ")
      ? raw
      : raw
        ? `Bearer ${raw}`
        : "",
    enterpriseCode: selection.runtimeEnterpriseCode,
  };
  return runCommunicationSourceDeliveryAcceptance({
    ...options,
    selection,
    session,
    baseUrl:
      options.baseUrl ||
      projectEndpointUrl(context.configuration, { role: "ENGAGEMENT" }),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--help"))
    console.log(
      "acceptance:communication-source-delivery --execute [--acceptance=<name>] [--phase=exercise|inspect]; run exercise, restart Communication, then run inspect with NODICS_COMMUNICATION_ACCEPTANCE_TOKEN.",
    );
  else {
    const cli = communicationSourceDeliveryAcceptanceArguments(
      process.argv.slice(2),
    );
    runConfiguredCommunicationSourceDeliveryAcceptance({
      execute: process.argv.includes("--execute"),
      ...cli,
    })
      .then((result) => console.log(JSON.stringify(result)))
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  }
}
