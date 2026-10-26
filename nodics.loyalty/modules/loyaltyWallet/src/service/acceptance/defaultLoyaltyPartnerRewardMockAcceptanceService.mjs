/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module loyaltyWallet/acceptance @description Bounded installed Local simulated conversion acceptance. @owner loyaltyWallet @layer tooling */
import { open } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { isDeepStrictEqual as same } from "node:util";
import properties from "../../../config/properties.js";
import amounts from "../../../../loyaltyCore/src/service/defaultLoyaltyAmountService.js";

const limits = properties.tooling.acceptance.loyaltyPartnerRewardMock;
const route = "/nodics/loyaltyApi/v0/participant";
const identityFields = ["integrationCode", "accountLinkCode", "partnerEnterpriseCode", "programCode", "rewardTypeCode", "termsReference", "termsRevision"];
const check = (value, message) => { if (!value) throw new Error(message); };
const id = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|-]{0,159}$/.test(value);

/** Validates a business selection only. Local/isolation declarations are not runtime authority. */
export function validate(selection) {
  const fields = ["contractVersion", "approvalReference", "environmentCode", "localDemo", "isolatedPartition", "baseUrl",
    "enterpriseCode", "runCode", "owner", "walletCode", "amount", "sourceScale", "targetUnit", ...identityFields];
  check(selection && Object.getPrototypeOf(selection) === Object.prototype &&
    same(Object.keys(selection).sort(), fields.sort()), "Exact reviewed selection required");
  const s = structuredClone(selection);
  check(s.contractVersion === 1 && s.localDemo === true && s.isolatedPartition === true, "Explicit isolated simulation required");
  for (const field of ["approvalReference", "environmentCode", "enterpriseCode", "runCode", "walletCode", "targetUnit", ...identityFields])
    check(id(s[field]), "Invalid selection identity");
  check(s.environmentCode.endsWith("Local") && !/docker/i.test(s.environmentCode), "Explicit native Local target required");
  const url = new URL(s.baseUrl);
  check(["http:", "https:"].includes(url.protocol) && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash, "Explicit loopback origin required");
  check(s.owner && same(Object.keys(s.owner).sort(), ["ownerCode", "ownerType"]) &&
    ["CUSTOMER", "ENTERPRISE"].includes(s.owner.ownerType) && id(s.owner.ownerCode), "Exact human participant owner required");
  check(Number.isInteger(s.sourceScale) && s.sourceScale >= 0 && s.sourceScale <= 8 && typeof s.amount === "string" &&
    s.amount.length <= 100 && amounts.assertPositive(s.amount, s.sourceScale) === s.amount, "Canonical positive amount required");
  return s;
}

/** Preserves the signed bearer and its Enterprise alias. API owners verify signature and human authority. */
export function sessionHeaders(token, selection) {
  check(typeof token === "string" && token.length <= 32768 && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token), "Existing signed human session required");
  let claims;
  try { claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")); }
  catch { throw new Error("Invalid session transport"); }
  check(claims.entCode === selection.enterpriseCode &&
    (claims.enterpriseCode === undefined || claims.enterpriseCode === claims.entCode), "Signed Enterprise transport mismatch");
  return { Authorization: "Bearer " + token, "x-enterprise-code": claims.entCode,
    "Content-Type": "application/json", "x-correlation-id": selection.runCode };
}

/** Bounded, no-redirect HTTP; failures never print credentials or private response bodies and never retry writes. */
export function transport(selection, token, fetchRequest = globalThis.fetch) {
  const headers = sessionHeaders(token, selection);
  return async (path, body) => {
    let response, value;
    try {
      response = await fetchRequest(new URL(route + path, selection.baseUrl), {
        method: body === undefined ? "GET" : "POST", headers, redirect: "error", cache: "no-store",
        signal: AbortSignal.timeout(limits.timeoutMs), ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const reader = response.body.getReader(), chunks = []; let length = 0;
      try {
        while (true) {
          const part = await reader.read(); if (part.done) break;
          length += part.value.byteLength;
          check(length <= limits.maximumResponseBytes, "Response bound exceeded");
          chunks.push(Buffer.from(part.value));
        }
      } finally { await reader.cancel(); }
      value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch { throw new Error("HTTP outcome uncertain; retain original selection and operation key"); }
    check(response.ok, "Owner HTTP request refused; retain original selection");
    for (let depth = 0; depth < 8; depth++) {
      check(value && typeof value === "object" && !Array.isArray(value) && !value.error && value.success !== false &&
        value.acknowledged !== false && !(typeof value.code === "string" && value.code.startsWith("ERR_")) &&
        (!value.errors || Array.isArray(value.errors) && value.errors.length === 0) &&
        !(value.data !== undefined && value.result !== undefined), "Owner response refused");
      if (value.data === undefined && value.result === undefined) return value;
      value = value.data === undefined ? value.result : value.data;
    }
    throw new Error("Owner response nesting exceeded");
  };
}

/** Runs one CREDITED simulation with real test-wallet source accounting; never creates or funds fixtures. */
export async function run({ selection, execute = false, token, fetch: fetchRequest } = {}) {
  const s = validate(selection);
  const idempotencyKey = s.runCode + ":convert";
  const conversionCode = "partnerConversion:" + createHash("sha256").update(JSON.stringify([s.walletCode, idempotencyKey])).digest("hex");
  if (!execute) return { state: "PLANNED", simulated: true, liveEffects: false, idempotencyKey, conversionCode };
  check(execute === true, "Explicit execution required");
  const request = transport(s, token, fetchRequest);
  // Claims bind response evidence only; the API still verifies the original bearer.
  const actorCode = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).loginId;
  const matchesOwner = owner => owner && owner.ownerType === s.owner.ownerType && owner.ownerCode === s.owner.ownerCode &&
    (!Object.hasOwn(owner, "actorCode") || typeof actorCode === "string" && actorCode.length > 0 && owner.actorCode === actorCode);
  const post = (operation, body) => request("/partner-conversions/" + operation, body);
  const options = await post("options", {});
  check(options.enabled === true && matchesOwner(options.owner) && options.walletCode === s.walletCode && Array.isArray(options.options), "Source owner selection mismatch");
  const choices = options.options.filter(row => identityFields.every(key => row[key] === s[key]));
  check(choices.length === 1 && choices[0].simulated === true && choices[0].sourceScale === s.sourceScale, "Exact simulated choice unavailable");
  const wallet = async () => {
    const p = await request("/wallet");
    check(matchesOwner(p.owner) && p.wallet?.code === s.walletCode && p.wallet.status === "OPEN" &&
      p.wallet.ownerType === s.owner.ownerType && p.wallet.ownerCode === s.owner.ownerCode && Array.isArray(p.balances), "Existing wallet mismatch");
    const balances = p.balances.filter(row => row.programCode === s.programCode && row.rewardTypeCode === s.rewardTypeCode);
    check(balances.length === 1 && balances[0].precision === s.sourceScale, "Exact source balance required");
    const result = {};
    for (const key of ["available", "reserved", "spent", "earned"]) {
      const value = balances[0][key];
      check(typeof value === "string" && amounts.compare(value, "0", s.sourceScale) >= 0, "Invalid source balance");
      result[key] = amounts.normalize(value, s.sourceScale);
    }
    return result;
  };
  const before = await wallet();
  const assertResult = value => {
    check(value?.simulated === true && value.conversionCode === conversionCode && matchesOwner(value.owner) &&
      value.walletCode === s.walletCode && identityFields.every(key => value[key] === s[key]) &&
      value.sourceAmount === s.amount && value.sourceScale === s.sourceScale && value.targetAmount === s.amount &&
      value.targetScale === s.sourceScale && value.targetUnit === s.targetUnit, "Simulated conversion binding mismatch");
    return value;
  };
  const quote = assertResult(await post("quote", { integrationCode: s.integrationCode, accountLinkCode: s.accountLinkCode,
    walletCode: s.walletCode, programCode: s.programCode, rewardTypeCode: s.rewardTypeCode, amount: s.amount, idempotencyKey }));
  check(["QUOTED", "HOLDING", "HELD", "SUBMITTED", "CREDIT_CONFIRMED", "COMPLETED"].includes(quote.status), "Original conversion is not recoverable by this CREDITED scenario");
  const command = { conversionCode };
  const completed = assertResult(await post("confirm", command));
  check(completed.status === "COMPLETED" && completed.completedAt && completed.confirmedAt, "Simulation incomplete; retain original key for recovery");
  const after = await wallet();
  if (quote.status === "QUOTED") {
    check(amounts.compare(after.available, amounts.subtract(before.available, s.amount, s.sourceScale), s.sourceScale) === 0 &&
      amounts.compare(after.spent, amounts.add(before.spent, s.amount, s.sourceScale), s.sourceScale) === 0 &&
      after.earned === before.earned && after.reserved === before.reserved, "Source capture delta mismatch");
  }
  check(same(assertResult(await post("confirm", command)), completed), "Confirmation replay changed result");
  check(same(assertResult(await post("status", command)), completed), "Status recovery changed result");
  check(same(await wallet(), after), "Replay changed source balances");
  return { state: quote.status === "QUOTED" ? "PASSED" : "RECOVERED", simulated: true,
    evidence: "INSTALLED_LOCAL_MOCK_HTTP", externalPartnerCreditProven: false, conversionCode, idempotencyKey,
    replayVerified: true, sourceDeltaVerified: quote.status === "QUOTED" };
}

/** Reads reviewed JSON only; planning never reads a session or contacts a runtime. */
export async function main(args = process.argv.slice(2), environment = process.env) {
  if (same(args, ["--help"])) return { usage: "acceptance:loyalty-partner-reward-mock --selection=<json> [--execute]", tokenEnvironment: "NODICS_LOYALTY_ACCEPTANCE_PARTICIPANT_TOKEN" };
  check(args.every(arg => arg === "--execute" || arg.startsWith("--selection=")) &&
    args.filter(arg => arg === "--execute").length <= 1 && args.filter(arg => arg.startsWith("--selection=")).length === 1, "Invalid arguments");
  const file = await open(args.find(arg => arg.startsWith("--selection=")).slice(12), "r");
  let bytes;
  try {
    check((await file.stat()).isFile(), "Selection must be a regular file");
    const buffer = Buffer.alloc(limits.maximumSelectionBytes + 1); let length = 0;
    while (length < buffer.length) {
      const part = await file.read(buffer, length, buffer.length - length, null);
      if (!part.bytesRead) break;
      length += part.bytesRead;
    }
    check(length <= limits.maximumSelectionBytes, "Selection bound exceeded");
    bytes = buffer.subarray(0, length);
  } finally { await file.close(); }
  return run({ selection: JSON.parse(bytes.toString("utf8")), execute: args.includes("--execute"),
    token: args.includes("--execute") ? environment.NODICS_LOYALTY_ACCEPTANCE_PARTICIPANT_TOKEN : undefined });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().then(report => console.log(JSON.stringify(report))).catch(() => {
    console.error("Acceptance refused; retain original selection and operation key"); process.exitCode = 1;
  });
