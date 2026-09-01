#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { execFile, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { readProjectEnvironmentProfile } from "./defaultProjectEnvironmentProfileService.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const manifestPath = path.join(projectRoot, "nodics.project.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
const environmentProfile = readProjectEnvironmentProfile(projectRoot, process.env.ENV || "");
const config = environmentProfile.acceptance?.functionalJourney || manifest.acceptance?.functionalJourney || {};
const enterprise = process.env.AXIS_ENTERPRISE || "default";
const platformUrl = process.env.AXIS_PLATFORM_URL || "http://127.0.0.1:4300";
const engagementUrl = process.env.NODICS_ENGAGEMENT_URL || "http://127.0.0.1:4340";
const commerceUrl = process.env.NODICS_COMMERCE_URL || "http://127.0.0.1:4350";
const runtimes = config.runtimes || {
  platform: { label: "Platform", port: 4300, script: "start:platform" },
  commerce: { label: "Commerce", port: 4350, script: "start:commerce" },
  engagement: { label: "Engagement", port: 4340, script: "start:engagement" },
};
const managed = [];

function log(message) {
  console.log(`[functional-acceptance] ${message}`);
}

async function listening(port) {
  const result = await execFileAsync("lsof", [
    "-nP",
    `-iTCP:${String(port)}`,
    "-sTCP:LISTEN",
  ]).catch(() => ({ stdout: "" }));
  return result.stdout.includes(`:${String(port)} `);
}

async function request(baseUrl, route, options = {}) {
  const response = await fetch(new URL(route, baseUrl), {
    ...options,
    headers: {
      Accept: "application/json",
      "x-enterprise-code": enterprise,
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(`${route} returned a non-JSON response`);
  }
  if (!response.ok) {
    throw new Error(`${route} returned HTTP ${String(response.status)}: ${text.slice(0, 500)}`);
  }
  return body?.data ?? body?.result ?? body;
}

async function waitReady(baseUrl, label) {
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < 60000) {
    try {
      const health = await request(baseUrl, "/nodics/system/v0/health/ready");
      if (health?.status === "UP") {
        log(`${label} ready`);
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }
  throw new Error(`${label} did not become ready: ${lastError?.message || "timeout"}`);
}

async function ensureRuntime(label, port, script, baseUrl) {
  if (!(await listening(port))) {
    const child = spawn("npm", ["run", script], {
      cwd: projectRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => process.stdout.write(`[${label}] ${chunk}`));
    child.stderr.on("data", (chunk) => process.stderr.write(`[${label}] ${chunk}`));
    managed.push(child);
  }
  await waitReady(baseUrl, label);
}

async function authenticate() {
  const result = await request(
    platformUrl,
    "/nodics/profile/v0/employee/browser/authenticate",
    {
      method: "POST",
      headers: { Origin: "http://127.0.0.1:3100" },
      body: JSON.stringify({
        loginId: process.env.AXIS_LOGIN_ID || "admin",
        password: process.env.AXIS_PASSWORD || "adminPassword",
      }),
    },
  );
  if (!result?.authToken) throw new Error("Platform authentication returned no token");
  return { Authorization: `Bearer ${result.authToken}` };
}

async function exerciseFeedback(headers) {
  const journeyId = randomUUID();
  const correlationId = `kickoff-feedback-${journeyId}`;
  const commonHeaders = { ...headers, "x-correlation-id": correlationId };
  const submitted = await request(engagementUrl, "/nodics/engagement/v0/public/feedback", {
    method: "POST",
    headers: { "x-correlation-id": correlationId },
    body: JSON.stringify({
      type: "SUGGESTION",
      subject: "Functional acceptance",
      message: `Kickoff reference journey ${journeyId}`,
      anonymous: true,
    }),
  });
  if (submitted?.status !== "RECEIVED" || !submitted.code) {
    throw new Error("Feedback intake did not return a received reference");
  }

  const records = await request(
    engagementUrl,
    `/nodics/engagement/v0/operator/feedback?code=${encodeURIComponent(submitted.code)}&limit=1`,
    { headers: commonHeaders },
  );
  if (!records.some((record) => record.code === submitted.code)) {
    throw new Error("Operator feedback queue did not expose the submitted record");
  }

  let revision = Number(submitted.revision || 0);
  for (const action of ["TRIAGE", "ASSIGN", "START", "RESOLVE", "CONFIRM"]) {
    const updated = await request(
      engagementUrl,
      `/nodics/engagement/v0/operator/feedback/${encodeURIComponent(submitted.code)}/actions/${action}`,
      {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify({
          expectedRevision: revision,
        reason: config.reason || "Project functional acceptance",
        }),
      },
    );
    revision = Number(updated.revision);
  }
  log(`feedback ${submitted.code} completed customer-to-operator lifecycle`);
}

async function exercisePublicVisibility() {
  const headers = { "x-correlation-id": `kickoff-public-${randomUUID()}` };
  const testimonials = await request(
    engagementUrl,
    "/nodics/engagement/v0/public/testimonials",
    { headers },
  );
  const reviews = await request(
    engagementUrl,
    "/nodics/engagement/v0/public/reviews",
    { headers },
  );
  if (!Array.isArray(testimonials) || !Array.isArray(reviews?.items)) {
    throw new Error("Public Engagement projections returned an invalid contract");
  }
  log("public testimonial and review projections are readable");
}

async function exerciseCommerceContract(headers) {
  const contract = await request(commerceUrl, "/nodics/system/v0/contract/openapi", {
    headers,
  });
  const paths = contract?.paths || contract?.openapi?.paths || {};
  const required = [
    "/nodics/cart/v0/carts/{cartCode}/calculations",
    "/nodics/checkoutCore/v0/checkouts/place",
    "/nodics/order/v0/orders/{orderCode}/lifecycle/preview",
    "/nodics/process/v0/incidents",
    "/nodics/process/v0/instances/{instanceCode}/retry",
    "/nodics/process/v0/instances/{instanceCode}/compensate",
  ];
  const processPaths = Object.keys(paths).filter((route) => route.includes("/process/"));
  for (const route of required) {
    if (!paths[route]) {
      throw new Error(
        `Commerce effective contract is missing ${route}; effective Process paths: ${processPaths.join(", ") || "none"}`,
      );
    }
  }
  log("Commerce transaction and Process recovery APIs are effective");
}

async function cleanup() {
  for (const child of managed.reverse()) child.kill("SIGTERM");
}

async function run() {
  try {
    await ensureRuntime(runtimes.platform.label, runtimes.platform.port, runtimes.platform.script, platformUrl);
    await Promise.all([
      ensureRuntime(runtimes.commerce.label, runtimes.commerce.port, runtimes.commerce.script, commerceUrl),
      ensureRuntime(runtimes.engagement.label, runtimes.engagement.port, runtimes.engagement.script, engagementUrl),
    ]);
    const headers = await authenticate();
    await exerciseFeedback(headers);
    await exercisePublicVisibility();
    await exerciseCommerceContract(headers);
    log("functional journey acceptance passed");
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
