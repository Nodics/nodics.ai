/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module digitalCore/acceptance/defaultDigitalWholeBundleGiftAcceptanceService
 * @description Exercises whole-bundle send, reservation, accept, decline, cancel and expiry through
 * Digital's installed HTTP owners. It provisions no identities, holdings, permissions or scheduler jobs.
 * @owner digitalCore
 * @layer tooling
 */
import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectEndpointUrl, projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

const defaultAcceptanceName = 'digitalWholeBundleGift';
const outcomes = ['ACCEPT', 'DECLINE', 'CANCEL', 'EXPIRE'];
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/;
const bundleCodePattern = /^bundle:[a-f0-9]{64}$/;
const operationCodePattern = /^bundle-operation:[a-f0-9]{64}$/;

function requireEvidence(condition, code) {
  if (!condition) throw Object.assign(new Error(code), { code });
}

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

function identifier(value) {
  return typeof value === 'string' && identifierPattern.test(value);
}

function owner(value) {
  requireEvidence(exactKeys(value, ['module', 'schema', 'code']) && value.module === 'profile' &&
    ['customer', 'enterprise'].includes(value.schema) && identifier(value.code), 'REVIEWED_GIFT_OWNER_REQUIRED');
  return value;
}

function component(value) {
  const keys = value?.kind === 'REALIZED_CARBON'
    ? ['kind', 'reference', 'quantity', 'expectedRevision', 'unitOfMeasure']
    : ['kind', 'reference', 'quantity', 'expectedRevision'];
  requireEvidence(exactKeys(value, keys) && ['CERTIFICATE', 'REALIZED_CARBON'].includes(value.kind) &&
    exactKeys(value.reference, ['module', 'schema', 'code']) &&
    [value.reference.module, value.reference.schema, value.reference.code].every(identifier) &&
    typeof value.quantity === 'string' && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value.quantity) && value.quantity.length <= 128 &&
    /[1-9]/.test(value.quantity) && (value.kind !== 'CERTIFICATE' || value.quantity === '1') &&
    Number.isSafeInteger(value.expectedRevision) && value.expectedRevision >= 0 &&
    (value.kind !== 'REALIZED_CARBON' || typeof value.unitOfMeasure === 'string' && value.unitOfMeasure.trim() &&
      value.unitOfMeasure.length <= 100), 'REVIEWED_GIFT_COMPONENT_REQUIRED');
  return value;
}

function bearer(value) {
  return typeof value === 'string' && /^Bearer [^\s]{1,16384}$/i.test(value);
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function normalizeComponents(values) {
  return values.map(value => structuredClone(component(value)))
    .sort((left, right) => JSON.stringify(left.reference).localeCompare(JSON.stringify(right.reference)));
}

/** Resolves one bounded customer-owned acceptance profile name from CLI arguments. */
export function digitalWholeBundleGiftAcceptanceArgument(argv = []) {
  const values = argv.filter(argument => argument === '--acceptance' || argument.startsWith('--acceptance='));
  requireEvidence(values.length <= 1, 'ONE_GIFT_ACCEPTANCE_SELECTION_REQUIRED');
  if (!values.length) return defaultAcceptanceName;
  const name = values[0].startsWith('--acceptance=') ? values[0].slice('--acceptance='.length) : '';
  requireEvidence(/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name), 'GIFT_ACCEPTANCE_SELECTION_INVALID');
  return name;
}

/** Selects an own-property acceptance profile without embedding deployment identities in Digital. */
export function selectDigitalWholeBundleGiftAcceptance(profiles, name = defaultAcceptanceName) {
  requireEvidence(/^[A-Za-z][A-Za-z0-9]{0,127}$/.test(name) && profiles && Object.hasOwn(profiles, name) &&
    profiles[name] && typeof profiles[name] === 'object' && !Array.isArray(profiles[name]), 'GIFT_ACCEPTANCE_PROFILE_UNAVAILABLE');
  return profiles[name];
}

/** Validates reviewed fixtures and separately supplied live sessions before any request is sent. */
export function digitalWholeBundleGiftSelection(options = {}) {
  requireEvidence(options.execute === true, 'EXPLICIT_GIFT_ACCEPTANCE_EXECUTION_REQUIRED');
  const baseUrl = new URL(options.baseUrl);
  requireEvidence(['http:', 'https:'].includes(baseUrl.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname) &&
    !baseUrl.username && !baseUrl.password && baseUrl.pathname === '/' && !baseUrl.search && !baseUrl.hash,
  'LOCAL_GIFT_ACCEPTANCE_TARGET_REQUIRED');
  const selection = structuredClone(options.selection);
  requireEvidence(exactKeys(selection, ['contractVersion', 'approvalReference', 'localDemo', 'isolatedPartition', 'tenant', 'runCode',
    'sender', 'recipient', 'scheduler', 'expiryMaximumWaitMilliseconds', 'cases']) && selection.contractVersion === 1 &&
    selection.localDemo === true && selection.isolatedPartition === true && identifier(selection.approvalReference) &&
    identifier(selection.tenant) && identifier(selection.runCode) && selection.runCode.length <= 80,
  'REVIEWED_LOCAL_GIFT_SELECTION_REQUIRED');
  for (const key of ['sender', 'recipient']) {
    const actor = selection[key];
    requireEvidence(exactKeys(actor, ['ownerRef', 'enterpriseCode']) && identifier(actor.enterpriseCode),
      'REVIEWED_GIFT_ACTOR_REQUIRED');
    owner(actor.ownerRef);
  }
  requireEvidence(!same(selection.sender.ownerRef, selection.recipient.ownerRef) &&
    exactKeys(selection.scheduler, ['enterpriseCode']) && identifier(selection.scheduler.enterpriseCode) &&
    selection.scheduler.enterpriseCode === selection.sender.enterpriseCode &&
    Number.isSafeInteger(selection.expiryMaximumWaitMilliseconds) && selection.expiryMaximumWaitMilliseconds >= 1 &&
    selection.expiryMaximumWaitMilliseconds <= 60000 && Array.isArray(selection.cases) && selection.cases.length === outcomes.length,
  'REVIEWED_GIFT_PARTITION_REQUIRED');
  const seenCases = new Set(), seenOutcomes = new Set(), seenComponents = new Set();
  for (const giftCase of selection.cases) {
    requireEvidence(exactKeys(giftCase, ['caseCode', 'outcome', 'components']) && identifier(giftCase.caseCode) &&
      giftCase.caseCode.length <= 40 && outcomes.includes(giftCase.outcome) && !seenCases.has(giftCase.caseCode) &&
      !seenOutcomes.has(giftCase.outcome) && Array.isArray(giftCase.components) && giftCase.components.length >= 2 &&
      giftCase.components.length <= 100, 'REVIEWED_WHOLE_GIFT_CASE_REQUIRED');
    seenCases.add(giftCase.caseCode);
    seenOutcomes.add(giftCase.outcome);
    for (const selected of giftCase.components) {
      component(selected);
      const reference = JSON.stringify(selected.reference);
      requireEvidence(!seenComponents.has(reference), 'FRESH_GIFT_COMPONENT_REQUIRED');
      seenComponents.add(reference);
    }
  }
  requireEvidence(outcomes.every(value => seenOutcomes.has(value)), 'COMPLETE_GIFT_OUTCOME_SELECTION_REQUIRED');
  const sessions = {};
  for (const key of ['sender', 'recipient', 'scheduler']) {
    const session = options.sessions?.[key];
    requireEvidence(exactKeys(session, ['authorization', 'enterpriseCode']) && bearer(session.authorization) &&
      session.enterpriseCode === selection[key].enterpriseCode, 'ORIGINAL_GIFT_SESSION_REQUIRED');
    sessions[key] = { ...session };
  }
  return { selection, sessions, baseUrl: baseUrl.origin };
}

/** Unwraps successful Nodics envelopes without accepting contradictory or error-shaped responses. */
export function digitalWholeBundleGiftData(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    requireEvidence(value && typeof value === 'object' && !value.error && value.success !== false &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'GIFT_OWNER_RESPONSE_REFUSED');
    const data = Object.hasOwn(value, 'data'), result = Object.hasOwn(value, 'result');
    requireEvidence(!(data && result), 'GIFT_OWNER_RESPONSE_AMBIGUOUS');
    if (!data && !result) return value;
    value = data ? value.data : value.result;
  }
  requireEvidence(false, 'GIFT_OWNER_RESPONSE_DEPTH');
}

function assertManifest(value, selection, giftCase) {
  const expected = normalizeComponents(giftCase.components);
  requireEvidence(bundleCodePattern.test(value?.code || '') && value.status === 'ACTIVE' && Number.isSafeInteger(value.revision) &&
    same(value.ownerRef, selection.sender.ownerRef) && same(value.components, expected), 'EXACT_GIFT_MANIFEST_REQUIRED');
  return value;
}

function assertOperation(value, manifest, selection, status, decision, phases) {
  requireEvidence(operationCodePattern.test(value?.code || '') && value.manifestCode === manifest.code &&
    value.manifestRevision === manifest.revision && value.purpose === 'GIFT' && value.status === status &&
    same(value.ownerRef, selection.sender.ownerRef) && same(value.recipientRef, selection.recipient.ownerRef) &&
    value.evidence?.decision === decision && value.evidence?.manifestDigest === manifest.digest &&
    value.checkpoints && typeof value.checkpoints === 'object' && Object.keys(value.checkpoints).length === manifest.components.length,
  'EXACT_GIFT_OPERATION_REQUIRED');
  const expectedStatuses = { reserve: 'RESERVED', transfer: 'TRANSFERRED', finalize: 'COMPLETED', release: 'RELEASED' };
  for (let index = 0; index < manifest.components.length; index += 1) {
    const checkpoint = value.checkpoints[index];
    requireEvidence(checkpoint && Object.keys(checkpoint).sort().join(',') === [...phases].sort().join(','),
      'EXACT_GIFT_COMPONENT_PHASES_REQUIRED');
    for (const phase of phases) {
      const receipt = checkpoint[phase], component = manifest.components[index];
      requireEvidence(receipt?.status === expectedStatuses[phase] && receipt.operationKey === value.code + ':' + index &&
        same(receipt.reference, component.reference) && receipt.quantity === component.quantity &&
        typeof receipt.receiptCode === 'string' && receipt.receiptCode.length > 0,
      'EXACT_GIFT_COMPONENT_RECEIPT_REQUIRED');
    }
  }
  return value;
}

/** Executes the four live owner journeys with stable keys; repeated execution resumes the same operations. */
export async function runDigitalWholeBundleGiftAcceptance(options = {}) {
  const { selection, sessions, baseUrl } = digitalWholeBundleGiftSelection(options);
  const fetchRequest = options.fetch || globalThis.fetch;
  const sleep = options.sleep || delay;
  let stage = 'START';
  const summaries = [];
  async function post(actor, route, body, idempotencyKey) {
    stage = 'POST:' + route;
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/digitalCore/v0' + route, baseUrl), {
        method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(30000),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: selection.tenant,
          'x-enterprise-code': actor.enterpriseCode, Authorization: actor.authorization,
          'x-correlation-id': selection.runCode, ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
        body: JSON.stringify(body),
      });
    } catch {
      requireEvidence(false, 'GIFT_HTTP_OUTCOME_UNCONFIRMED');
    }
    requireEvidence(response.ok, 'GIFT_HTTP_' + response.status);
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'GIFT_OWNER_RESPONSE_INVALID'); }
    return digitalWholeBundleGiftData(value);
  }
  async function inspect(actor, ownerRef, operationCode, status, decision) {
    const value = await post(actor, '/gifts/inspect', { ownerRef, operationCode });
    requireEvidence(value.contractVersion === 1 && value.operationCode === operationCode && value.status === status &&
      value.decision === decision && Number.isSafeInteger(value.revision) && same(value.ownerRef, ownerRef),
    'EXACT_GIFT_INSPECTION_REQUIRED');
    return value;
  }
  try {
    for (const giftCase of selection.cases) {
      const prefix = selection.runCode + ':' + giftCase.caseCode;
      requireEvidence(prefix.length <= 125, 'GIFT_COMMAND_KEY_TOO_LONG');
      const manifest = assertManifest(await post(sessions.sender, '/bundles', {
        ownerRef: selection.sender.ownerRef, components: giftCase.components, idempotencyKey: prefix + ':manifest',
      }, prefix + ':manifest'), selection, giftCase);
      const sent = await post(sessions.sender, '/gifts', {
        manifestCode: manifest.code, manifestRevision: manifest.revision, recipientRef: selection.recipient.ownerRef,
        idempotencyKey: prefix + ':gift', confirmed: true,
      }, prefix + ':gift');
      if (sent.status !== 'PENDING') {
        const finalStatus = giftCase.outcome === 'ACCEPT' ? 'COMPLETED' : 'RELEASED';
        const phases = giftCase.outcome === 'ACCEPT' ? ['reserve', 'transfer', 'finalize'] : ['reserve', 'release'];
        const replay = assertOperation(sent, manifest, selection, finalStatus, giftCase.outcome, phases);
        await inspect(sessions.sender, selection.sender.ownerRef, replay.code, finalStatus, giftCase.outcome);
        await inspect(sessions.recipient, selection.recipient.ownerRef, replay.code, finalStatus, giftCase.outcome);
        summaries.push({ caseCode: giftCase.caseCode, outcome: giftCase.outcome, operationCode: replay.code,
          componentCount: manifest.components.length, status: finalStatus, resumedTerminal: true,
          exactTransferReceipts: giftCase.outcome === 'ACCEPT' ? manifest.components.length : 0,
          exactFinalizeReceipts: giftCase.outcome === 'ACCEPT' ? manifest.components.length : 0,
          exactReleaseReceipts: giftCase.outcome === 'ACCEPT' ? 0 : manifest.components.length });
        continue;
      }
      const pending = assertOperation(sent, manifest, selection, 'PENDING', undefined, ['reserve']);
      requireEvidence(Number.isFinite(Date.parse(pending.deadline)), 'EXACT_GIFT_DEADLINE_REQUIRED');
      await inspect(sessions.sender, selection.sender.ownerRef, pending.code, 'PENDING', null);
      await inspect(sessions.recipient, selection.recipient.ownerRef, pending.code, 'PENDING', null);
      if (giftCase.outcome === 'EXPIRE') {
        const wait = Math.max(0, Date.parse(pending.deadline) - Date.now() + 25);
        requireEvidence(wait <= selection.expiryMaximumWaitMilliseconds, 'GIFT_EXPIRY_WINDOW_NOT_ACCEPTANCE_SAFE');
        if (wait) await sleep(wait);
        const expired = await post(sessions.scheduler, '/internal/bundles/gifts/expire', {});
        requireEvidence(expired.contractVersion === 1 && expired.schedulerActivated === false && expired.scanned === 1 &&
          Array.isArray(expired.results) && expired.results.length === 1 && expired.results[0].operationCode === pending.code &&
          expired.results[0].status === 'RELEASED' && expired.nextCursor === null,
        'EXACT_GIFT_EXPIRY_REQUIRED');
        const final = await inspect(sessions.sender, selection.sender.ownerRef, pending.code, 'RELEASED', 'EXPIRE');
        summaries.push({ caseCode: giftCase.caseCode, outcome: giftCase.outcome, operationCode: pending.code,
          componentCount: manifest.components.length, status: final.status, releaseEvidence: 'OWNER_SWEEP_CONFIRMED' });
        continue;
      }
      const actor = giftCase.outcome === 'CANCEL' ? sessions.sender : sessions.recipient;
      const finalStatus = giftCase.outcome === 'ACCEPT' ? 'COMPLETED' : 'RELEASED';
      const phases = giftCase.outcome === 'ACCEPT' ? ['reserve', 'transfer', 'finalize'] : ['reserve', 'release'];
      const command = { operationCode: pending.code, expectedRevision: pending.revision, decision: giftCase.outcome, confirmed: true };
      const completed = assertOperation(await post(actor, '/gifts/decision', command, prefix + ':decision'), manifest,
        selection, finalStatus, giftCase.outcome, phases);
      const replay = assertOperation(await post(actor, '/gifts/decision', command, prefix + ':decision'), manifest,
        selection, finalStatus, giftCase.outcome, phases);
      requireEvidence(replay.code === completed.code && replay.revision === completed.revision,
        'GIFT_DECISION_REPLAY_CHANGED_RESULT');
      await inspect(sessions.sender, selection.sender.ownerRef, pending.code, finalStatus, giftCase.outcome);
      await inspect(sessions.recipient, selection.recipient.ownerRef, pending.code, finalStatus, giftCase.outcome);
      summaries.push({ caseCode: giftCase.caseCode, outcome: giftCase.outcome, operationCode: pending.code,
        componentCount: manifest.components.length, status: finalStatus,
        exactTransferReceipts: giftCase.outcome === 'ACCEPT' ? manifest.components.length : 0,
        exactFinalizeReceipts: giftCase.outcome === 'ACCEPT' ? manifest.components.length : 0,
        exactReleaseReceipts: giftCase.outcome === 'ACCEPT' ? 0 : manifest.components.length });
    }
    return { contractVersion: 1, state: 'PASSED', isolatedPartition: true, scenarioCount: summaries.length,
      selectionDigest: createHash('sha256').update(JSON.stringify(selection)).digest('hex'), summaries };
  } catch (error) {
    return { contractVersion: 1, state: 'RECOVERY_REQUIRED', stage,
      reasonCode: /^[A-Z][A-Z0-9_]{0,95}$/.test(error?.code || '') ? error.code : 'GIFT_OWNER_OUTCOME_UNCONFIRMED', summaries };
  }
}

/** Loads customer-owned fixtures and externally supplied sessions for the module-owned command. */
export async function runConfiguredDigitalWholeBundleGiftAcceptance(options = {}) {
  const context = await createAcceptanceContext(options);
  const selection = options.selection || selectDigitalWholeBundleGiftAcceptance(
    projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }),
    options.acceptanceName || defaultAcceptanceName,
  );
  const token = value => value ? (value.startsWith('Bearer ') ? value : 'Bearer ' + value) : '';
  const sessions = options.sessions || {
    sender: { authorization: token(context.environment.NODICS_DIGITAL_GIFT_SENDER_TOKEN), enterpriseCode: selection.sender?.enterpriseCode },
    recipient: { authorization: token(context.environment.NODICS_DIGITAL_GIFT_RECIPIENT_TOKEN), enterpriseCode: selection.recipient?.enterpriseCode },
    scheduler: { authorization: token(context.environment.NODICS_DIGITAL_GIFT_EXPIRY_TOKEN), enterpriseCode: selection.scheduler?.enterpriseCode },
  };
  return runDigitalWholeBundleGiftAcceptance({ ...options, execute: options.execute, selection, sessions,
    baseUrl: options.baseUrl || projectEndpointUrl(context.configuration, { role: 'COMMERCE' }) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:digital-whole-bundle-gift --execute [--acceptance=<name>]; requires a reviewed isolated local tooling.acceptance profile plus NODICS_DIGITAL_GIFT_SENDER_TOKEN, NODICS_DIGITAL_GIFT_RECIPIENT_TOKEN and NODICS_DIGITAL_GIFT_EXPIRY_TOKEN. Uses existing Digital owner APIs only.');
  else runConfiguredDigitalWholeBundleGiftAcceptance({ execute: process.argv.includes('--execute'),
    acceptanceName: digitalWholeBundleGiftAcceptanceArgument(process.argv.slice(2)) })
    .then(result => { console.log(JSON.stringify(result)); if (result.state !== 'PASSED') process.exitCode = 1; })
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
