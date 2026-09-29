/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/defaultProjectAcceptanceService
 * @description Opt-in acceptance mechanics; importing this module performs no operations.
 * @owner nTooling
 * @layer tooling
 * Callers retain endpoint selection, credentials, response projections, expected
 * outcomes and timing policy. Injectable operations allow isolated contract tests.
 */
import { setTimeout as delay } from "node:timers/promises";
import net from "node:net";
import { spawn } from "node:child_process";

/** Builds an inert-until-called API context for capability-owned suites; runtime lifecycle stays with topology tooling. */
export async function createAcceptanceContext({
  projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd(), environment = process.env,
  configuration, fetch: fetchRequest = globalThis.fetch,
} = {}) {
  const { readProjectEnvironmentConfiguration, projectEndpointUrl, projectCorsOrigin } = await import('./defaultProjectEnvironmentConfigurationService.mjs');
  const config = configuration || readProjectEnvironmentConfiguration(projectRoot, environment.NODICS_ENVIRONMENT || environment.ENV || '');
  const origin = environment.NODICS_ACCEPTANCE_ORIGIN || environment.AXIS_ORIGIN || projectCorsOrigin(config, 'axis');
  const common = { Origin: origin, 'x-enterprise-code': environment.NODICS_ENTERPRISE_CODE || environment.AXIS_ENTERPRISE || 'default' };
  const raw = (role, route, options = {}) => fetchRequest(new URL(route, projectEndpointUrl(config, { role })), {
    ...options, signal: AbortSignal.timeout(30000),
    headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...common, ...options.headers },
  });
  const request = async (role, route, options = {}) => parseAcceptanceResponse(await raw(role, route, options), {
    route, errorLimit: 500, unwrap: body => body?.data ?? body?.result ?? body,
  });
  const authenticate = () => authenticateAcceptanceEmployee({ request: (_base, route, options) => request('PLATFORM', route, options),
    suppliedToken: environment.AXIS_AUTH_TOKEN || environment.NODICS_AUTH_TOKEN,
    credentials: { loginId: environment.AXIS_LOGIN_ID || 'admin', password: environment.AXIS_PASSWORD || environment.NODICS_BOOTSTRAP_ADMIN_PASSWORD },
    headers: common, routes: ['/nodics/profile/v0/employee/browser/authenticate', '/nodics/profile/v0/employee/authenticate'],
    missingToken: route => route + ' returned no employee token', failureMessage: 'Employee authentication failed',
  });
  return { request, raw, authenticate, configuration: config, projectRoot, environment };
}

/** Completes only the caller-selected, correlated Process task through its secured APIs. No approval is inferred. */
export async function completeAcceptanceWorkflow({
  request, baseUrl, headers, definitionCode, correlation, nodeCode, decision,
  attempts = 1, intervalMs = 0, instanceLimit = 100, taskLimit = 20,
  sleep = delay, instanceUnavailable, taskUnavailable,
}) {
  if (typeof request !== "function" || !definitionCode || !nodeCode ||
      !correlation || typeof correlation.key !== "string" || !correlation.value ||
      !decision || typeof decision !== "object" || Array.isArray(decision) || !Object.keys(decision).length ||
      !Number.isInteger(attempts) || attempts < 1 || attempts > 100 ||
      !Number.isFinite(intervalMs) || intervalMs < 0 || intervalMs > 60000 ||
      ![instanceLimit, taskLimit].every(value => Number.isInteger(value) && value > 0 && value <= 200))
    throw new Error("Explicit bounded workflow selection and decision are required");
  let instance;
  for (let attempt = 0; attempt < attempts && !instance; attempt++) {
    const response = await request(baseUrl, "/nodics/process/v0/instances?limit=" + instanceLimit, { headers });
    instance = [].concat(response?.items || response || []).find(item =>
      item.definitionCode === definitionCode && item.context?.[correlation.key] === correlation.value && item.status === "WAITING");
    if (!instance && attempt + 1 < attempts) await sleep(intervalMs);
  }
  if (!instance?.code) throw new Error(instanceUnavailable || "Correlated waiting workflow instance is unavailable");
  const response = await request(baseUrl, "/nodics/process/v0/tasks?instanceCode=" + encodeURIComponent(instance.code) + "&limit=" + taskLimit, { headers });
  const task = [].concat(response?.items || response || []).find(item =>
    item.instanceCode === instance.code && item.nodeCode === nodeCode && ["OPEN", "CLAIMED"].includes(item.status));
  if (!task?.code) throw new Error(typeof taskUnavailable === "function" ? taskUnavailable(instance) : taskUnavailable || "Correlated decision task is unavailable");
  const taskPath = "/nodics/process/v0/tasks/" + encodeURIComponent(task.code);
  if (task.status === "OPEN") await request(baseUrl, taskPath + "/claim", { headers, method: "POST" });
  return request(baseUrl, taskPath + "/complete", { headers, method: "POST", body: JSON.stringify({ decision }) });
}

/** Probes a local TCP endpoint; strict maintenance accepts only confirmed refusal as offline. */
export function probeAcceptancePort(port, options = {}) {
  return new Promise((resolve, reject) => {
    const socket = (options.createConnection || net.createConnection)({ host: "127.0.0.1", port });
    let settled = false;
    const finish = (value, error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else resolve(value);
    };
    socket.setTimeout(500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false, options.strict === true ? new Error("Maintenance port probe timed out") : null));
    socket.once("error", error => finish(false,
      options.strict === true && error.code !== "ECONNREFUSED" ? error : null));
  });
}

/** Starts only a caller-selected command when its port is free; records ownership before readiness checks. */
export async function ensureAcceptanceRuntime({
  port, label, command, args, cwd, env, managed, waitReady, baseUrl,
  probe = probeAcceptancePort, spawnProcess = spawn, write = chunk => process.stdout.write(chunk),
}) {
  let launchFailure;
  if (!(await probe(port))) {
    const child = spawnProcess(command, args, {
      cwd, env, detached: true, stdio: ["ignore", "pipe", "pipe"],
    });
    child.exitPromise = new Promise(resolve => child.once("close", resolve));
    launchFailure = new Promise((resolve, reject) => child.once("error", reject));
    child.stdout.on("data", chunk => write(`[${label}] ${chunk}`));
    child.stderr.on("data", chunk => process.stderr.write(`[${label}] ${chunk}`));
    managed.push(child);
  }
  const ready = waitReady(baseUrl, label);
  return launchFailure ? Promise.race([ready, launchFailure]) : ready;
}

/**
 * Read a response once, parse before checking HTTP status, then project its body.
 * @param {Response} response Already fetched response.
 * @param {object} policy Route, optional malformed-message callback, errorLimit
 * and unwrap callback. Omitting malformed preserves the native JSON parse error.
 * @returns {Promise<*>} Projected JSON, including undefined for an empty body.
 */
export async function parseAcceptanceResponse(response, {
  route, malformed, errorLimit, unwrap = body => body,
}) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch (error) {
    if (malformed) throw new Error(malformed(response, text));
    throw error;
  }
  if (!response.ok) {
    throw new Error(`${route} returned HTTP ${response.status}: ${text.slice(0, errorLimit)}`);
  }
  return unwrap(body);
}

/**
 * Authenticate through caller-selected employee routes in order, or reuse a token.
 * @param {object} options Request callback, baseUrl, routes, credentials, headers,
 * suppliedToken, missingToken message callback and failureMessage.
 * @returns {Promise<object>} Bearer header; throws the last route failure.
 */
export async function authenticateAcceptanceEmployee({
  request, baseUrl, routes, credentials, headers, suppliedToken,
  missingToken, failureMessage,
}) {
  if (suppliedToken) return { Authorization: `Bearer ${suppliedToken}` };
  let lastError;
  for (const route of routes) {
    try {
      const result = await request(baseUrl, route, {
        method: "POST", headers, body: JSON.stringify(credentials),
      });
      const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken;
      if (authToken) return { Authorization: `Bearer ${authToken}` };
      lastError = new Error(missingToken(route));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(failureMessage);
}

/**
 * Poll a caller-owned readiness probe without changing its success predicate.
 * @param {object} options Probe, isReady predicate, timeoutMs, intervalMs,
 * onReady callback and failureMessage(lastError); clock and sleep are injectable.
 * @returns {Promise<void>} Throws the caller's diagnostic on timeout.
 * The probe owns request cancellation; this loop does not abort in-flight work.
 */
export async function waitForAcceptanceReady({
  probe, isReady, timeoutMs, intervalMs, onReady, failureMessage,
  now = Date.now, sleep = delay,
}) {
  const deadline = now() + timeoutMs;
  let lastError;
  while (now() < deadline) {
    try {
      if (isReady(await probe())) {
        onReady();
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  throw new Error(failureMessage(lastError));
}

/**
 * Stop only caller-recorded detached children, in reverse launch order.
 * @param {Array} children Owned ChildProcess handles with exitPromise.
 * @param {object} options timeoutMs and injectable signal/timer operations.
 * @returns {Promise<void>} Propagates child-signal failures; cancels escalation
 * timers when a child closes. No port discovery or topology state is consulted.
 */
export async function stopAcceptanceChildren(children, {
  timeoutMs, kill = process.kill.bind(process), schedule = setTimeout, cancel = clearTimeout,
}) {
  for (const child of [...children].reverse()) {
    if (!Number.isInteger(child.pid) || child.pid <= 0 || child.exitCode !== null || child.signalCode) continue;
    const signal = value => {
      try {
        kill(-child.pid, value);
      } catch {
        child.kill(value);
      }
    };
    signal("SIGTERM");
    let timer;
    try {
      await Promise.race([
        child.exitPromise,
        new Promise((resolve, reject) => {
          timer = schedule(() => {
            try {
              if (child.exitCode === null && !child.signalCode) signal("SIGKILL");
              resolve();
            } catch (error) {
              reject(error);
            }
          }, timeoutMs);
        }),
      ]);
    } finally {
      cancel(timer);
    }
  }
}
