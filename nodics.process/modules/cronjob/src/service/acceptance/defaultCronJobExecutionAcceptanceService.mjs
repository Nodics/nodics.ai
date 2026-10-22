/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module cronjob/acceptance/defaultCronJobExecutionAcceptanceService
 * @description Activates one reviewed inactive schedule and proves one explicit
 * Cron-owned execution through canonical lifecycle and persisted job APIs.
 * @layer tooling
 * @owner cronjob
 */
import { pathToFileURL } from "node:url";
import properties from "../../../config/properties.js";
import { createAcceptanceContext } from "../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs";
import {
  projectEndpointUrl,
  projectRuntimeAcceptance,
} from "../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs";

const defaultAcceptanceName = "cronJobExecution";
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const identifier = (value) =>
  typeof value === "string" &&
  /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
const required = (condition, code) => {
  if (!condition) throw Object.assign(new Error(code), { code });
};

function unwrap(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    if (Array.isArray(value)) return value;
    required(
      object(value) &&
        value.success !== false &&
        !value.error &&
        !(typeof value.code === "string" && value.code.startsWith("ERR_")),
      "CRON_OWNER_RESPONSE_REFUSED",
    );
    const hasData = Object.hasOwn(value, "data");
    const hasResult = Object.hasOwn(value, "result");
    required(!(hasData && hasResult), "CRON_OWNER_RESPONSE_AMBIGUOUS");
    if (!hasData && !hasResult) return value;
    value = hasData ? value.data : value.result;
  }
  required(false, "CRON_OWNER_RESPONSE_DEPTH");
}

function one(value) {
  const rows = Array.isArray(value) ? value : value ? [value] : [];
  required(rows.length === 1 && object(rows[0]), "CRON_JOB_EVIDENCE_REQUIRED");
  return rows[0];
}

export function selectCronJobExecutionAcceptance(
  profiles,
  name = defaultAcceptanceName,
) {
  required(
    object(profiles) && Object.hasOwn(profiles, name),
    "CRON_EXECUTION_ACCEPTANCE_UNAVAILABLE",
  );
  return profiles[name];
}

export function cronJobExecutionAcceptanceArgument(args = []) {
  const values = args.filter((value) => value.startsWith("--acceptance="));
  required(values.length <= 1, "ONE_ACCEPTANCE_SELECTION_REQUIRED");
  const name = values[0]?.slice(13) || defaultAcceptanceName;
  required(
    /^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(name),
    "ACCEPTANCE_NAME_INVALID",
  );
  return name;
}

function input(options) {
  required(options.execute === true, "EXPLICIT_EXECUTION_REQUIRED");
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
    "jobCode",
    "expectedExpression",
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
        selection.jobCode,
      ].every(identifier) &&
      typeof selection.expectedExpression === "string" &&
      selection.expectedExpression.length > 0 &&
      selection.expectedExpression.length <= 120,
    "REVIEWED_CRON_EXECUTION_SELECTION_REQUIRED",
  );
  const policy = {
    ...properties.cronjob.acceptance,
    ...(options.policy || {}),
  };
  required(
    object(policy) &&
      Object.keys(policy).sort().join() ===
        "executionTimeoutMs,pollIntervalMs,requestTimeoutMs" &&
      Number.isSafeInteger(policy.requestTimeoutMs) &&
      policy.requestTimeoutMs >= 1 &&
      policy.requestTimeoutMs <= 300000 &&
      Number.isSafeInteger(policy.executionTimeoutMs) &&
      policy.executionTimeoutMs >= 1 &&
      policy.executionTimeoutMs <= 600000 &&
      Number.isSafeInteger(policy.pollIntervalMs) &&
      policy.pollIntervalMs >= 10 &&
      policy.pollIntervalMs <= policy.executionTimeoutMs,
    "CRON_EXECUTION_ACCEPTANCE_POLICY_REQUIRED",
  );
  const session = options.session;
  required(
    object(session) &&
      Object.keys(session).length === 2 &&
      /^Bearer [^\s]{1,16384}$/i.test(session.authorization || "") &&
      session.enterpriseCode === selection.runtimeEnterpriseCode,
    "ORIGINAL_CRON_OPERATOR_SESSION_REQUIRED",
  );
  return { selection, policy, session, baseUrl: url.origin };
}

async function requestJson(context, path, method = "GET", body) {
  let response;
  try {
    response = await context.fetchRequest(new URL(path, context.baseUrl), {
      method,
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(context.policy.requestTimeoutMs),
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        tenant: context.selection.tenant,
        "x-enterprise-code": context.session.enterpriseCode,
        Authorization: context.session.authorization,
        "x-correlation-id": context.selection.approvalReference,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    required(false, "CRON_HTTP_OUTCOME_UNCONFIRMED");
  }
  let value;
  try {
    value = await response.json();
  } catch {
    required(false, "CRON_OWNER_RESPONSE_INVALID");
  }
  required(response.ok, `CRON_HTTP_${response.status}`);
  return unwrap(value);
}

async function readJob(context) {
  return one(
    await requestJson(
      context,
      `/nodics/cronjob/v0/cronjob/code/${encodeURIComponent(context.selection.jobCode)}`,
    ),
  );
}

async function waitForExecution(context, baselineEndTime, firedAt) {
  const deadline = Date.now() + context.policy.executionTimeoutMs;
  while (Date.now() <= deadline) {
    const row = await readJob(context);
    const start = Date.parse(row.startTime);
    const end = Date.parse(row.endTime);
    if (
      row.code === context.selection.jobCode &&
      row.trigger?.expression === context.selection.expectedExpression &&
      row.status === "SUCCESS" &&
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start >= firedAt &&
      end >= start &&
      (!Number.isFinite(baselineEndTime) || end > baselineEndTime)
    )
      return row;
    await new Promise((resolve) => setTimeout(resolve, context.policy.pollIntervalMs));
  }
  required(false, "CRON_EXECUTION_EVIDENCE_TIMEOUT");
}

/** Activates exactly one reviewed inactive schedule, then proves one fresh execution. */
export async function runCronJobExecutionAcceptance(options = {}) {
  const prepared = input(options);
  const context = {
    ...prepared,
    fetchRequest: options.fetch || globalThis.fetch,
  };
  const selected = context.selection;
  const before = await readJob(context);
  required(
    before.code === selected.jobCode &&
      before.trigger?.expression === selected.expectedExpression &&
      before.active === false,
    "REVIEWED_INACTIVE_CRON_JOB_REQUIRED",
  );
  const lifecycle = await requestJson(
    context,
    "/nodics/cronjob/v0/schedules/lifecycle/inspect",
    "POST",
    { code: selected.jobCode },
  );
  required(
    lifecycle.code === selected.jobCode &&
      lifecycle.state === "SAVED_INACTIVE" &&
      lifecycle.revision === 0,
    "SAVED_INACTIVE_CRON_JOB_REQUIRED",
  );
  const preview = await requestJson(
    context,
    "/nodics/cronjob/v0/schedules/lifecycle/preview",
    "POST",
    { code: selected.jobCode, intent: "ACTIVATE", expectedRevision: 0 },
  );
  required(
    preview.code === selected.jobCode &&
      preview.intent === "ACTIVATE" &&
      preview.revision === 0 &&
      /^[a-f0-9]{64}$/.test(preview.reviewDigest || ""),
    "CRON_ACTIVATION_REVIEW_REQUIRED",
  );
  const activated = await requestJson(
    context,
    "/nodics/cronjob/v0/schedules/lifecycle/execute",
    "POST",
    {
      code: selected.jobCode,
      intent: "ACTIVATE",
      expectedRevision: 0,
      confirmed: true,
      reviewDigest: preview.reviewDigest,
    },
  );
  required(
    activated.code === selected.jobCode &&
      activated.state === "ACTIVE" &&
      activated.intent === "ACTIVATE" &&
      activated.revision === 1,
    "CRON_ACTIVATION_UNCONFIRMED",
  );
  const baselineEndTime = Date.parse(before.endTime);
  const firedAt = Date.now();
  await requestJson(
    context,
    `/nodics/cronjob/v0/job/run/${encodeURIComponent(selected.jobCode)}`,
    "POST",
    {},
  );
  const executed = await waitForExecution(context, baselineEndTime, firedAt);
  return {
    contractVersion: 1,
    state: "PASSED",
    approvalReference: selected.approvalReference,
    jobCode: selected.jobCode,
    scheduledExpression: selected.expectedExpression,
    activation: {
      state: activated.state,
      revision: activated.revision,
      reviewDigest: activated.reviewDigest,
    },
    execution: {
      status: executed.status,
      startTime: new Date(executed.startTime).toISOString(),
      endTime: new Date(executed.endTime).toISOString(),
    },
  };
}

export async function runConfiguredCronJobExecutionAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection =
    options.selection ||
    selectCronJobExecutionAcceptance(
      projectRuntimeAcceptance(context.projectRoot, context.configuration, {
        role: "PROCESS",
      }),
      options.acceptanceName || defaultAcceptanceName,
    );
  const raw = context.environment.NODICS_CRONJOB_ACCEPTANCE_TOKEN || "";
  const session = options.session || {
    authorization: raw.startsWith("Bearer ")
      ? raw
      : raw
        ? `Bearer ${raw}`
        : "",
    enterpriseCode: selection.runtimeEnterpriseCode,
  };
  return runCronJobExecutionAcceptance({
    ...options,
    selection,
    session,
    baseUrl:
      options.baseUrl ||
      projectEndpointUrl(context.configuration, { role: "PROCESS" }),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--help"))
    console.log(
      "acceptance:cronjob-execution --execute [--acceptance=<name>]; activates one reviewed inactive schedule and proves one explicit Cron execution using NODICS_CRONJOB_ACCEPTANCE_TOKEN.",
    );
  else
    runConfiguredCronJobExecutionAcceptance({
      execute: process.argv.includes("--execute"),
      acceptanceName: cronJobExecutionAcceptanceArgument(process.argv.slice(2)),
    })
      .then((result) => console.log(JSON.stringify(result)))
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
}
