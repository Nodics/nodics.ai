/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/acceptance @description Explicit installed Local mock HTTP acceptance; no provisioning or authentication. @owner wasteReward @layer tooling */
import { open } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import properties from '../../../config/properties.js';
const defaults = properties.tooling.acceptance.wasteMaterialValueHttp;
export const same = isDeepStrictEqual;
/** Rejects with bounded diagnostics; never includes responses or credentials. */
export function check(value, label) {
    if (!value) throw Object.assign(new Error(label), { code: 'ACCEPTANCE_REFUSED' });
}
/** Validates plain reviewed selection objects and prohibits extra authority/fixture inputs. */
export function keys(value, expected) {
    check(value && Object.getPrototypeOf(value) === Object.prototype &&
        same(Object.keys(value).sort(), [...expected].sort()), 'Invalid selection shape');
}
/** Checks bounded wire identity grammar; never constructs authority. */
export function id(value) { check(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(value), 'Invalid identity'); }
/** Requires an exact typed reference without accepting arbitrary request fields. */
export function ref(value) { keys(value, ['module', 'schema', 'code']); Object.values(value).forEach(id); }
/** Requires a canonical Profile beneficiary reference. */
export function owner(value) { ref(value); check(value.module === 'profile' && ['customer', 'enterprise'].includes(value.schema), 'Invalid beneficiary'); }
/** Requires a bounded positive decimal string without floating-point conversion. */
export function decimal(value) { check(typeof value === 'string' && /^(0|[1-9]\d{0,29})(\.\d{1,8})?$/.test(value) && /[1-9]/.test(value), 'Invalid exact positive amount'); }
/** Validates Local selection without network access; approval and isolation are operator assertions, not grants. */
export function base(selection, fields) {
    keys(selection, ['contractVersion', 'approvalReference', 'environmentCode', 'localDemo', 'isolatedPartition',
        'baseUrl', 'tenant', 'enterpriseCode', 'runCode', ...fields]);
    check(selection.contractVersion === 1 && selection.localDemo === true && selection.isolatedPartition === true, 'Reviewed simulation selection required');
    for (const key of ['approvalReference', 'environmentCode', 'tenant', 'enterpriseCode', 'runCode']) id(selection[key]);
    check(selection.environmentCode.endsWith('Local') && !/docker/i.test(selection.environmentCode), 'Native Local selection required');
    let url; try { url = new URL(selection.baseUrl); } catch { check(false, 'Invalid Local URL'); }
    check(['http:', 'https:'].includes(url.protocol) && ['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname) &&
        !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'Loopback origin required');
    return structuredClone(selection);
}
/** Creates bounded HTTP transport using the unchanged operator authorization; never logs, mints or renews tokens. */
export function transport(selection, authorization, fetchRequest = globalThis.fetch) {
    check(typeof authorization === 'string' && /^Bearer [^\s]{1,16384}$/.test(authorization), 'Existing native Platform administrator or authorized service bearer required');
    return async (path, body, negativeCodes) => {
        let response, bytes;
        try {
            response = await fetchRequest(new URL('/nodics/wasteReward/v0' + path, selection.baseUrl), {
                method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(defaults.timeoutMs),
                headers: { Authorization: authorization, 'Content-Type': 'application/json',
                    tenant: selection.tenant, 'x-enterprise-code': selection.enterpriseCode,
                    'X-Correlation-Id': selection.runCode },
                body: JSON.stringify(body)
            });
            const reader = response.body.getReader(), chunks = []; let length = 0;
            try {
                while (true) {
                    const part = await reader.read(); if (part.done) break;
                    length += part.value.byteLength;
                    check(length <= defaults.maximumResponseBytes, 'Response exceeds owner bound');
                    chunks.push(Buffer.from(part.value));
                }
            } finally { await reader.cancel(); }
            bytes = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch { check(false, 'HTTP outcome uncertain; inspect original key before rerunning'); }
        if (negativeCodes) {
            check(response.status >= 400 && response.status < 500 && negativeCodes.includes(bytes?.code),
                'Expected owner refusal missing');
            return bytes.code;
        }
        check(response.ok, 'Owner HTTP request refused');
        for (let depth = 0; depth < 8; depth++) {
            check(bytes && typeof bytes === 'object' && !bytes.error && bytes.success !== false &&
                (!bytes.errors || Array.isArray(bytes.errors) && bytes.errors.length === 0) &&
                bytes.acknowledged !== false && !(typeof bytes.code === 'string' && bytes.code.startsWith('ERR_')) &&
                !(bytes.data !== undefined && bytes.result !== undefined), 'Owner envelope refused');
            if (bytes.data === undefined && bytes.result === undefined) return bytes;
            bytes = bytes.data === undefined ? bytes.result : bytes.data;
        }
        check(false, 'Owner envelope nesting exceeded');
    };
}
/** CLI reads only reviewed JSON. Plan mode never resolves credentials or touches HTTP/runtime configuration. */
export async function main(args = process.argv.slice(2), options = {}) {
    if (same(args, ['--help'])) return { usage: 'acceptance:waste-material-value --selection=<reviewed.json> [--execute]', authorizationEnvironment: defaults.authorizationEnvironment };
    check(args.every(a => a === '--execute' || a.startsWith('--selection=')) &&
        args.filter(a => a === '--execute').length <= 1 && args.filter(a => a.startsWith('--selection=')).length === 1, 'Invalid acceptance arguments');
    const file = args.find(a => a.startsWith('--selection=')).slice(12);
    const handle = await open(file, 'r');
    let bytes;
    try {
        check((await handle.stat()).isFile(), 'Selection must be a regular JSON file');
        const buffer = Buffer.alloc(defaults.maximumSelectionBytes + 1);
        let length = 0;
        while (length < buffer.length) {
            const part = await handle.read(buffer, length, buffer.length - length, null);
            if (!part.bytesRead) break;
            length += part.bytesRead;
        }
        check(length <= defaults.maximumSelectionBytes, 'Selection exceeds owner bound');
        bytes = buffer.subarray(0, length);
    } finally { await handle.close(); }
    let selection; try { selection = JSON.parse(bytes.toString('utf8')); } catch { check(false, 'Invalid selection JSON'); }
    return run({ selection, execute: args.includes('--execute'),
        authorization: args.includes('--execute') ? (options.environment || process.env)[defaults.authorizationEnvironment] : undefined,
        fetch: options.fetch });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
    main().then(value => console.log(JSON.stringify(value))).catch(() => { console.error('Acceptance refused; retain original selection and operation keys for reconciliation'); process.exitCode = 1; });

/** Validates exact reviewed valuation, original beneficiary and recycler-payment expectations. */
export function validate(value) {
    const s = base(value, ['valuationRef', 'paymentEvidenceRef', 'batchCode', 'allocationCode',
        'ownerRef', 'contributionRef', 'receiptRef', 'payerRef', 'payeeRef', 'currency', 'confirmedValue',
        'attributedValue', 'paymentAmount', 'programCode', 'rewardTypeCode', 'rewardAmount']);
    for (const key of ['valuationRef', 'paymentEvidenceRef', 'contributionRef', 'receiptRef', 'payerRef', 'payeeRef']) ref(s[key]);
    for (const key of ['valuationRef', 'paymentEvidenceRef']) check(s[key].module === 'wasteReward' &&
        s[key].schema === 'wasteMaterialValueMockEvidence', 'Mock financial reference required');
    check(!same(s.valuationRef, s.paymentEvidenceRef), 'Separate payment evidence required');
    check(s.contributionRef.module === 'wasteSubmission' && s.contributionRef.schema === 'wasteSubmission' &&
        s.receiptRef.module === 'wasteReceipt' && s.receiptRef.schema === 'wasteReceipt', 'Canonical contribution and receipt required');
    owner(s.ownerRef);
    for (const key of ['batchCode', 'allocationCode', 'programCode', 'rewardTypeCode']) id(s[key]);
    for (const key of ['confirmedValue', 'attributedValue', 'paymentAmount', 'rewardAmount']) decimal(s[key]);
    check(/^[A-Z]{3}$/.test(s.currency), 'Currency required');
    return s;
}
/** Exercises payment-gated release and canonical persisted replay without funding or creating fixtures. */
export async function run(options = {}) {
    const s = validate(options.selection);
    if (options.execute !== true) return { state: 'PLANNED', synthetic: true, liveEffects: false };
    const post = transport(s, options.authorization, options.fetch);
    const batch = await post('/waste/material-value/assessments', { evidenceRef: s.valuationRef });
    check(batch.synthetic === true && batch.code === s.batchCode && same(batch.valuationRef, s.valuationRef) &&
        same(batch.payerRef, s.payerRef) && same(batch.payeeRef, s.payeeRef) &&
        batch.currency === s.currency && batch.confirmedValue === s.confirmedValue &&
        batch.policy?.programCode === s.programCode && batch.policy?.rewardTypeCode === s.rewardTypeCode,
        'Exact synthetic valuation required');
    const allocations = batch.allocations?.filter(a => a.code === s.allocationCode);
    check(allocations?.length === 1 && same(allocations[0].ownerRef, s.ownerRef) &&
        same(allocations[0].contributionRef, s.contributionRef) && same(allocations[0].receiptRef, s.receiptRef) &&
        allocations[0].rewardAmount === s.rewardAmount && allocations[0].attributedValue === s.attributedValue,
        'Original beneficiary allocation mismatch');
    const body = { batchCode: s.batchCode, allocationCode: s.allocationCode, paymentEvidenceRef: s.paymentEvidenceRef };
    const read = () => post('/waste/material-value/lookup', { batchCode: s.batchCode });
    const before = await read();
    await post('/waste/material-value/releases', { ...body, paymentEvidenceRef: {
        module: 'wasteReward', schema: 'notMockEvidence', code: s.runCode + ':invalid' } },
        ['ERR_MATERIAL_VALUE_EVIDENCE', 'ERR_MATERIAL_VALUE_CONFLICT']);
    check(same(await read(), before), 'Rejected payment changed batch');
    const release = await post('/waste/material-value/releases', body);
    const assertReceipt = r => {
        check(r.synthetic === true && r.status === 'COMPLETED' && r.allocationCode === s.allocationCode &&
            r.operationKey === s.allocationCode + ':material-value' && same(r.originalOwnerRef, s.ownerRef) &&
            r.ledgerRef?.module === 'loyaltyLedger' && r.ledgerRef?.schema === 'rewardLedgerEntry' &&
            typeof r.ledgerRef.code === 'string' && r.ledgerRef.code.length > 0 &&
            typeof r.walletCode === 'string' && r.walletCode.length > 0 &&
            same(r.requestedPaymentRef, s.paymentEvidenceRef) &&
            r.payment?.synthetic === true && r.payment.status === 'CONFIRMED' &&
            same(r.payment.paymentRef, s.paymentEvidenceRef) && same(r.payment.valuationRef, s.valuationRef) &&
            same(r.payment.batchRef, batch.batchRef) && same(r.payment.payerRef, s.payerRef) &&
            same(r.payment.payeeRef, s.payeeRef) && r.payment.currency === s.currency &&
            r.payment.amount === s.paymentAmount && r.payment.coverage?.some(c =>
                c.allocationCode === s.allocationCode && c.amount === s.attributedValue),
            'Exact synthetic settlement receipt required');
    };
    assertReceipt(release);
    const persisted = await read();
    check(persisted.synthetic === true && persisted.code === batch.code && persisted.evidenceHash === batch.evidenceHash &&
        same(persisted.allocations, batch.allocations) && same(persisted.policy, batch.policy),
        'Settlement changed original assessment');
    const replay = await post('/waste/material-value/releases', body); assertReceipt(replay);
    check(same(replay, release) && same(await read(), persisted), 'Replay changed canonical release evidence');
    const matching = persisted.releases?.filter(r => r.allocationCode === s.allocationCode);
    check(matching?.length === 1 && same(matching[0], release), 'Single persisted release required');
    return { state: 'PASSED', evidence: 'INSTALLED_SYNTHETIC_MATERIAL_HTTP', synthetic: true,
        operationKey: release.operationKey, batchCode: s.batchCode, ledgerRef: release.ledgerRef,
        replayVerified: true, negativeVerified: true, recyclerPaymentQualified: false,
        independentLoyaltyReadback: false };
}
