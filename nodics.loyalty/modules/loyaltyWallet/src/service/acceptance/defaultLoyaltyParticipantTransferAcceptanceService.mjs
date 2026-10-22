/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module loyaltyWallet/acceptance/defaultLoyaltyParticipantTransferAcceptanceService
 * @description Opt-in live acceptance for canonical Customer and Enterprise participant reward transfers.
 * @layer tooling
 * @owner loyaltyWallet
 * @override Preserve participant authority, exact owner separation, immutable command recovery and existing Loyalty APIs.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createAcceptanceContext } from "../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs";
import amounts from "../../../../loyaltyCore/src/service/defaultLoyaltyAmountService.js";

const route = "/nodics/loyaltyApi/v0/participant";
const identifierPattern = /^[A-Za-z0-9_.:@|-]{1,200}$/;
const directions = Object.freeze([
  Object.freeze({ key: "customerToEnterprise", source: "customer", recipient: "enterprise" }),
  Object.freeze({ key: "enterpriseToCustomer", source: "enterprise", recipient: "customer" }),
]);

function fail(message, code = "LOYALTY_PARTICIPANT_TRANSFER_ACCEPTANCE_REFUSED") {
  throw Object.assign(new Error(message), { code });
}

function requireEvidence(condition, message, code) {
  if (!condition) fail(message, code);
}

function exactObject(value, keys, label) {
  requireEvidence(value && typeof value === "object" && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === keys.length &&
    Object.keys(value).every(key => keys.includes(key)), label + " is invalid");
  return value;
}

function identifier(value, label, maximum = 200) {
  requireEvidence(typeof value === "string" && value.length <= maximum && identifierPattern.test(value), label + " is invalid");
  return value;
}

function exactAmount(value, scale, label, positive = true) {
  requireEvidence(typeof value === "string", label + " requires an exact decimal string");
  return positive ? amounts.assertPositive(value, scale) : amounts.normalize(value, scale);
}

function digest(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function operationKey(selection, direction) {
  return selection.runCode + ":" + direction.key;
}

function limitOperationKey(selection) {
  return selection.runCode + ":enterprise-limit-probe";
}

function headers(token, correlationId) {
  return { Authorization: "Bearer " + token, "x-correlation-id": correlationId };
}

function transferBody(selection, direction, feeAmount, amount) {
  const body = {
    recipient: {
      ownerType: direction.recipient === "customer" ? "CUSTOMER" : "ENTERPRISE",
      ownerCode: selection[direction.recipient].ownerCode,
    },
    programCode: selection.programCode,
    rewardTypeCode: selection.rewardTypeCode,
    amount,
    scale: selection.scale,
    idempotencyKey: operationKey(selection, direction),
    confirmed: true,
  };
  if (amounts.compare(feeAmount, "0", selection.scale) > 0) body.confirmedFeeAmount = feeAmount;
  return body;
}

function selectedBalance(projection, selection, actor) {
  const expectedType = actor === "customer" ? "CUSTOMER" : "ENTERPRISE";
  requireEvidence(projection?.owner?.ownerType === expectedType &&
    projection.owner.ownerCode === selection[actor].ownerCode,
  actor + " participant owner does not match the reviewed selection");
  requireEvidence(projection.wallet?.ownerType === expectedType &&
    projection.wallet.ownerCode === selection[actor].ownerCode &&
    projection.wallet.status === "OPEN", actor + " requires one existing OPEN owner wallet");
  const balances = projection.balances?.filter(row => row.programCode === selection.programCode &&
    row.rewardTypeCode === selection.rewardTypeCode);
  requireEvidence(balances?.length === 1, actor + " requires one exact program and reward balance");
  const balance = balances[0];
  requireEvidence(balance.precision === selection.scale && balance.transferEligible === true,
    actor + " reward balance is not transfer eligible at the reviewed precision");
  for (const key of ["available", "reserved", "spent", "earned", "transferFeeAmount"])
    exactAmount(balance[key], selection.scale, actor + "." + key, false);
  requireEvidence(["available", "reserved", "spent", "earned", "transferFeeAmount"].every(key =>
    amounts.compare(balance[key], "0", selection.scale) >= 0), actor + " projection contains a negative reward value");
  requireEvidence(amounts.compare(balance.transferFeeAmount, selection.expectedFeeAmount, selection.scale) === 0,
    actor + " effective transfer fee changed");
  requireEvidence(Array.isArray(projection.entries), actor + " ledger projection is unavailable");
  return { projection, balance };
}

function sameResult(actual, expected, label) {
  for (const key of ["status", "amount", "feeAmount", "debitEntryCode", "creditEntryCode", "operationCode"])
    requireEvidence(actual?.[key] === expected?.[key], label + " changed " + key);
}

function assertFreshDeltas(beforeSource, afterSource, beforeRecipient, afterRecipient, result, selection) {
  const debit = amounts.add(result.amount, result.feeAmount, selection.scale);
  requireEvidence(amounts.compare(afterSource.available,
    amounts.subtract(beforeSource.available, debit, selection.scale), selection.scale) === 0,
  "Source available rewards do not match the transfer and fee");
  requireEvidence(amounts.compare(afterSource.spent,
    amounts.add(beforeSource.spent, debit, selection.scale), selection.scale) === 0 &&
    amounts.compare(afterSource.reserved, beforeSource.reserved, selection.scale) === 0,
  "Source spent or reserved rewards do not match completed settlement");
  requireEvidence(amounts.compare(afterRecipient.available,
    amounts.add(beforeRecipient.available, result.amount, selection.scale), selection.scale) === 0 &&
    amounts.compare(afterRecipient.earned,
      amounts.add(beforeRecipient.earned, result.amount, selection.scale), selection.scale) === 0 &&
    amounts.compare(afterRecipient.reserved, beforeRecipient.reserved, selection.scale) === 0,
  "Recipient available, earned or reserved rewards do not match completed settlement");
}

function assertLedger(projection, result, source) {
  const code = source ? result.debitEntryCode : result.creditEntryCode;
  const rows = projection.entries.filter(row => row.code === code);
  requireEvidence(rows.length === 1 && rows[0].sourceType === "WALLET_TRANSFER" &&
    rows[0].sourceCode === result.operationCode, "Exact transfer ledger evidence is missing or duplicated");
}

async function wallet(request, token, selection, actor, correlationId) {
  return selectedBalance(await request("LOYALTY", route + "/wallet", {
    headers: headers(token, correlationId),
  }), selection, actor);
}

async function transferStatus(request, token, key, correlationId) {
  return request("LOYALTY", route + "/reward-transfers/" + encodeURIComponent(key), {
    headers: headers(token, correlationId),
  });
}

async function completedTransfer({ context, selection, actors, direction, correlationId }) {
  const sourceToken = actors[direction.source];
  const recipientToken = actors[direction.recipient];
  const key = operationKey(selection, direction);
  const initial = await transferStatus(context.request, sourceToken, key, correlationId + ":status-before");
  const recovered = initial?.status === "COMPLETED";
  requireEvidence(recovered || initial?.status === "UNCONFIRMED", "Original transfer status is neither recoverable nor fresh");
  const beforeSource = await wallet(context.request, sourceToken, selection, direction.source, correlationId + ":source-before");
  const beforeRecipient = await wallet(context.request, recipientToken, selection, direction.recipient, correlationId + ":recipient-before");
  const amount = selection.transfers[direction.key].amount;
  const fee = beforeSource.balance.transferFeeAmount;
  requireEvidence(amounts.compare(beforeSource.balance.available,
    amounts.add(amount, fee, selection.scale), selection.scale) >= 0,
  direction.source + " has insufficient eligible available rewards for the reviewed transfer and fee");
  const body = transferBody(selection, direction, fee, amount);
  let result = initial;
  if (!recovered) {
    if (direction.key === "customerToEnterprise") {
      const response = await context.raw("LOYALTY", route + "/reward-transfers", {
        method: "POST", headers: headers(sourceToken, correlationId + ":uncertain-submit"), body: JSON.stringify(body),
      });
      requireEvidence(response?.ok === true, "Uncertain transfer submission was refused before acknowledgement loss");
      await response.arrayBuffer();
      result = await transferStatus(context.request, sourceToken, key, correlationId + ":uncertain-recovery");
    } else {
      result = await context.request("LOYALTY", route + "/reward-transfers", {
        method: "POST", headers: headers(sourceToken, correlationId + ":submit"), body: JSON.stringify(body),
      });
    }
  }
  requireEvidence(result?.status === "COMPLETED" && result.operationCode && result.amount === amount &&
    amounts.compare(result.feeAmount, fee, selection.scale) === 0,
  "Completed transfer result does not match reviewed intent");
  const afterSource = await wallet(context.request, sourceToken, selection, direction.source, correlationId + ":source-after");
  const afterRecipient = await wallet(context.request, recipientToken, selection, direction.recipient, correlationId + ":recipient-after");
  assertLedger(afterSource.projection, result, true);
  assertLedger(afterRecipient.projection, result, false);
  if (!recovered) assertFreshDeltas(beforeSource.balance, afterSource.balance, beforeRecipient.balance, afterRecipient.balance, result, selection);
  const duplicate = await context.request("LOYALTY", route + "/reward-transfers", {
    method: "POST", headers: headers(sourceToken, correlationId + ":duplicate"), body: JSON.stringify(body),
  });
  sameResult(duplicate, result, "Duplicate transfer replay");
  const duplicateSource = await wallet(context.request, sourceToken, selection, direction.source, correlationId + ":source-duplicate");
  const duplicateRecipient = await wallet(context.request, recipientToken, selection, direction.recipient, correlationId + ":recipient-duplicate");
  requireEvidence(amounts.compare(duplicateSource.balance.available, afterSource.balance.available, selection.scale) === 0 &&
    amounts.compare(duplicateSource.balance.spent, afterSource.balance.spent, selection.scale) === 0 &&
    amounts.compare(duplicateRecipient.balance.available, afterRecipient.balance.available, selection.scale) === 0 &&
    duplicateSource.projection.entries.length === afterSource.projection.entries.length &&
    duplicateRecipient.projection.entries.length === afterRecipient.projection.entries.length,
  "Duplicate replay changed balance or ledger evidence");
  const status = await transferStatus(context.request, sourceToken, key, correlationId + ":status-after");
  sameResult(status, result, "Original-command recovery");
  const foreign = await transferStatus(context.request, recipientToken, key, correlationId + ":foreign-status");
  requireEvidence(foreign?.status === "UNCONFIRMED" && foreign.operationCode !== result.operationCode,
    "Another canonical owner could inspect the source owner's transfer");
  return {
    mode: recovered ? "RECOVERED" : "EXECUTED",
    sourceOwner: digest(direction.source + ":" + selection[direction.source].ownerCode),
    recipientOwner: digest(direction.recipient + ":" + selection[direction.recipient].ownerCode),
    operationCode: result.operationCode,
    amount: result.amount,
    feeAmount: result.feeAmount,
    debitEntryCode: result.debitEntryCode,
    creditEntryCode: result.creditEntryCode,
    duplicateReplayVerified: true,
    ownerIsolationVerified: true,
    uncertainRecoveryVerified: direction.key === "customerToEnterprise" && !recovered,
  };
}

async function verifyLimit({ context, selection, actors, correlationId }) {
  const effective = (await context.request("LOYALTY", route + "/transfer-policy/read", {
    method: "POST",
    headers: headers(actors.enterprise, correlationId + ":policy"),
    body: JSON.stringify({ programCode: selection.programCode, rewardTypeCode: selection.rewardTypeCode }),
  }))?.effective;
  requireEvidence(effective && effective.enabled === true && effective.outgoingEnabled === true && effective.incomingEnabled === true,
    "Enterprise transfer policy is not enabled");
  for (const key of ["feeAmount", "maximumAmount", "maximumDailyAmount"]) {
    const expected = selection.enterprisePolicy[key];
    requireEvidence(expected === null ? effective[key] === null : typeof effective[key] === "string" &&
      amounts.compare(effective[key], expected, selection.scale) === 0, "Enterprise effective policy changed " + key);
  }
  for (const key of ["maximumDailyCount", "timeZone"])
    requireEvidence(effective[key] === selection.enterprisePolicy[key], "Enterprise effective policy changed " + key);
  const direction = directions[1];
  const key = limitOperationKey(selection);
  const source = await wallet(context.request, actors.enterprise, selection, "enterprise", correlationId + ":limit-wallet");
  const body = transferBody(selection, direction, source.balance.transferFeeAmount, selection.limitProbeAmount);
  body.idempotencyKey = key;
  let refusal;
  try {
    await context.request("LOYALTY", route + "/reward-transfers", {
      method: "POST", headers: headers(actors.enterprise, correlationId + ":limit-probe"), body: JSON.stringify(body),
    });
  } catch (error) {
    refusal = error;
  }
  requireEvidence(refusal && /Per-transfer limit exceeded/.test(refusal.message),
    "Configured per-transfer limit did not refuse the reviewed probe");
  const status = await transferStatus(context.request, actors.enterprise, key, correlationId + ":limit-status");
  requireEvidence(status?.status === "UNCONFIRMED", "Rejected limit probe created transfer evidence");
  return { effective: structuredClone(selection.enterprisePolicy), rejectedAmount: selection.limitProbeAmount };
}

/** Validates an operator-reviewed fixture without defining any customer or deployment defaults. */
export function validateLoyaltyParticipantTransferAcceptanceSelection(value) {
  const selection = structuredClone(exactObject(value,
    ["contractVersion", "approvalReference", "runCode", "programCode", "rewardTypeCode", "scale", "customer", "enterprise",
      "expectedFeeAmount", "enterprisePolicy", "limitProbeAmount", "transfers"], "Acceptance selection"));
  requireEvidence(selection.contractVersion === 1, "Acceptance contractVersion must be 1");
  identifier(selection.approvalReference, "approvalReference");
  identifier(selection.runCode, "runCode", 120);
  identifier(selection.programCode, "programCode");
  identifier(selection.rewardTypeCode, "rewardTypeCode");
  requireEvidence(Number.isInteger(selection.scale) && selection.scale >= 0 && selection.scale <= 8, "scale must be 0..8");
  for (const actor of ["customer", "enterprise"]) {
    exactObject(selection[actor], ["ownerCode"], actor);
    identifier(selection[actor].ownerCode, actor + ".ownerCode");
  }
  requireEvidence(selection.customer.ownerCode !== selection.enterprise.ownerCode,
    "Customer and Enterprise fixtures must use distinct owner codes");
  selection.expectedFeeAmount = exactAmount(selection.expectedFeeAmount, selection.scale, "expectedFeeAmount", false);
  requireEvidence(amounts.compare(selection.expectedFeeAmount, "0", selection.scale) >= 0,
    "expectedFeeAmount cannot be negative");
  exactObject(selection.enterprisePolicy,
    ["feeAmount", "maximumAmount", "maximumDailyAmount", "maximumDailyCount", "timeZone"], "enterprisePolicy");
  selection.enterprisePolicy.feeAmount = exactAmount(selection.enterprisePolicy.feeAmount, selection.scale,
    "enterprisePolicy.feeAmount", false);
  requireEvidence(amounts.compare(selection.enterprisePolicy.feeAmount, selection.expectedFeeAmount, selection.scale) === 0,
    "Enterprise policy fee must match the reviewed participant fee");
  selection.enterprisePolicy.maximumAmount = exactAmount(selection.enterprisePolicy.maximumAmount, selection.scale,
    "enterprisePolicy.maximumAmount");
  if (selection.enterprisePolicy.maximumDailyAmount !== null)
    selection.enterprisePolicy.maximumDailyAmount = exactAmount(selection.enterprisePolicy.maximumDailyAmount, selection.scale,
      "enterprisePolicy.maximumDailyAmount");
  requireEvidence(selection.enterprisePolicy.maximumDailyCount === null ||
    Number.isSafeInteger(selection.enterprisePolicy.maximumDailyCount) && selection.enterprisePolicy.maximumDailyCount > 0,
  "enterprisePolicy.maximumDailyCount is invalid");
  requireEvidence(typeof selection.enterprisePolicy.timeZone === "string" && selection.enterprisePolicy.timeZone.length > 0 &&
    selection.enterprisePolicy.timeZone.length <= 100, "enterprisePolicy.timeZone is invalid");
  try { new Intl.DateTimeFormat("en-CA", { timeZone: selection.enterprisePolicy.timeZone }).format(new Date()); }
  catch { fail("enterprisePolicy.timeZone is invalid"); }
  selection.limitProbeAmount = exactAmount(selection.limitProbeAmount, selection.scale, "limitProbeAmount");
  requireEvidence(amounts.compare(selection.limitProbeAmount, selection.enterprisePolicy.maximumAmount, selection.scale) > 0,
    "limitProbeAmount must exceed the reviewed per-transfer maximum");
  exactObject(selection.transfers, directions.map(direction => direction.key), "transfers");
  for (const direction of directions) {
    exactObject(selection.transfers[direction.key], ["amount"], "transfers." + direction.key);
    const amount = exactAmount(selection.transfers[direction.key].amount, selection.scale, "transfers." + direction.key + ".amount");
    selection.transfers[direction.key].amount = amount;
    requireEvidence(amounts.compare(amount, selection.enterprisePolicy.maximumAmount, selection.scale) <= 0,
      direction.key + " exceeds the reviewed per-transfer maximum");
    identifier(operationKey(selection, direction), direction.key + " operation key");
  }
  identifier(limitOperationKey(selection), "limit probe operation key");
  return selection;
}

/** Parses the owner command CLI; no implicit customer selection is supported. */
export function loyaltyParticipantTransferAcceptanceArgument(argv = []) {
  requireEvidence(argv.every(argument => argument === "--execute" || argument.startsWith("--selection=")),
    "Unsupported participant transfer acceptance argument");
  const selections = argv.filter(argument => argument.startsWith("--selection="));
  requireEvidence(selections.length === 1 && selections[0].length > "--selection=".length,
    "Exactly one --selection=<json-file> is required");
  requireEvidence(argv.filter(argument => argument === "--execute").length <= 1,
    "Duplicate --execute argument");
  return selections[0].slice("--selection=".length);
}

/** Runs live participant APIs only after explicit consent, reviewed fixtures and existing participant credentials. */
export async function runLoyaltyParticipantTransferAcceptance({
  execute = false,
  selection,
  actors,
  context,
  configuration,
  environment = process.env,
  projectRoot = environment.NODICS_PROJECT_ROOT || process.cwd(),
  fetch: fetchRequest = globalThis.fetch,
} = {}) {
  requireEvidence(execute === true, "Participant transfer acceptance requires --execute because it moves real reward value");
  const selected = validateLoyaltyParticipantTransferAcceptanceSelection(selection);
  exactObject(actors, ["customer", "enterprise"], "actors");
  for (const actor of ["customer", "enterprise"])
    requireEvidence(typeof actors[actor] === "string" && actors[actor].length > 0 && actors[actor].length <= 32768,
      actor + " participant bearer token is required");
  requireEvidence(actors.customer !== actors.enterprise, "Customer and Enterprise require distinct participant sessions");
  const live = context || await createAcceptanceContext({ projectRoot, environment, configuration, fetch: fetchRequest });
  requireEvidence(typeof live.request === "function" && typeof live.raw === "function", "Acceptance HTTP context is unavailable");
  const contract = await live.request("LOYALTY", "/nodics/system/v0/contract/openapi", {
    headers: headers(actors.enterprise, "loyalty-transfer-contract:" + selected.runCode),
  });
  const paths = contract?.paths || contract?.openapi?.paths || {};
  for (const [path, method] of [[route + "/wallet", "get"], [route + "/reward-transfers", "post"],
    [route + "/reward-transfers/{operationKey}", "get"], [route + "/transfer-policy/read", "post"]])
    requireEvidence(paths[path]?.[method], "Loyalty API contract is missing " + method.toUpperCase() + " " + path);
  const correlationId = "loyalty-participant-transfer:" + selected.runCode;
  const policy = await verifyLimit({ context: live, selection: selected, actors, correlationId });
  const reports = [];
  for (const direction of directions)
    reports.push(await completedTransfer({ context: live, selection: selected, actors, direction, correlationId: correlationId + ":" + direction.key }));
  return {
    state: reports.every(report => report.mode === "EXECUTED") ? "PASSED" : "RECOVERED",
    contractVersion: 1,
    approvalReference: selected.approvalReference,
    runCode: selected.runCode,
    customerOwner: digest("customer:" + selected.customer.ownerCode),
    enterpriseOwner: digest("enterprise:" + selected.enterprise.ownerCode),
    policy,
    transfers: reports,
    walletAuthority: "LOYALTY",
    customerDefaultsAdded: false,
  };
}

/** Import-inert command CLI owned and registered by Loyalty Wallet. */
export async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--help")) {
    console.log("acceptance:loyalty-participant-transfer --execute --selection=<json-file>\nRequires running PLATFORM and LOYALTY runtimes plus NODICS_LOYALTY_ACCEPTANCE_CUSTOMER_TOKEN and NODICS_LOYALTY_ACCEPTANCE_ENTERPRISE_TOKEN. The reviewed owners must have existing OPEN, funded wallets and a configured Enterprise per-transfer maximum. The runner never provisions identity, wallets, rewards, policies or permissions.");
    return 0;
  }
  const selectionPath = loyaltyParticipantTransferAcceptanceArgument(argv);
  const selection = JSON.parse(await readFile(selectionPath, "utf8"));
  const report = await runLoyaltyParticipantTransferAcceptance({
    execute: argv.includes("--execute"),
    selection,
    actors: {
      customer: process.env.NODICS_LOYALTY_ACCEPTANCE_CUSTOMER_TOKEN,
      enterprise: process.env.NODICS_LOYALTY_ACCEPTANCE_ENTERPRISE_TOKEN,
    },
  });
  console.log(JSON.stringify(report, null, 2));
  return report.state === "PASSED" ? 0 : 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(code => { process.exitCode = code; }).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
