/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/acceptance @description Explicit installed Local mock HTTP acceptance; no provisioning or authentication. @owner wasteCarbon @layer tooling */
import { open } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import properties from '../../../config/properties.js';
const defaults = properties.tooling.acceptance.wasteCarbonHttp;
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
            response = await fetchRequest(new URL('/nodics/wasteCarbon/v0' + path, selection.baseUrl), {
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
    if (same(args, ['--help'])) return { usage: 'acceptance:waste-carbon --selection=<reviewed.json> [--execute]', authorizationEnvironment: defaults.authorizationEnvironment };
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

/** Validates exact reviewed issuance, allocation and single-component transfer terms. */
export function validate(value) {
    const s = base(value, ['evidenceRef', 'lotCode', 'ownerRef', 'recipientRef', 'contributionRef',
        'allocationCode', 'allocationQuantity', 'issuedQuantity', 'quantity', 'unitOfMeasure', 'scale', 'manifestRef']);
    for (const key of ['evidenceRef', 'contributionRef']) ref(s[key]);
    check(s.evidenceRef.module === 'wasteCarbon' && s.evidenceRef.schema === 'wasteCarbonMockEvidence', 'Mock issuance reference required');
    check(s.contributionRef.module === 'wasteSubmission' && s.contributionRef.schema === 'wasteSubmission', 'Canonical contribution required');
    owner(s.ownerRef); owner(s.recipientRef); check(!same(s.ownerRef, s.recipientRef), 'Distinct recipient required');
    for (const key of ['lotCode', 'allocationCode', 'unitOfMeasure']) id(s[key]);
    for (const key of ['quantity', 'allocationQuantity', 'issuedQuantity']) decimal(s[key]);
    check(Number.isInteger(s.scale) && s.scale >= 0 && s.scale <= 8, 'Invalid scale');
    for (const key of ['quantity', 'allocationQuantity', 'issuedQuantity'])
        check((s[key].split('.')[1] || '').length === s.scale, 'Use exact fixed-scale quantities');
    check(s.lotCode === 'CARBON_' + createHash('sha256').update(JSON.stringify([
        s.evidenceRef.module, s.evidenceRef.schema, s.evidenceRef.code])).digest('hex'), 'Lot identity must match mock issuance');
    keys(s.manifestRef, ['module', 'schema', 'code', 'revision']);
    ref({ module: s.manifestRef.module, schema: s.manifestRef.schema, code: s.manifestRef.code });
    check(Number.isSafeInteger(s.manifestRef.revision) && s.manifestRef.revision >= 0, 'Manifest revision required');
    return s;
}
/** Exercises only canonical owner commands; synchronization is not fixture provisioning or registry certification. */
export async function run(options = {}) {
    const s = validate(options.selection);
    if (options.execute !== true) return { state: 'PLANNED', synthetic: true, liveEffects: false };
    const post = transport(s, options.authorization, options.fetch);
    const lot = await post('/carbon/lots/evidence', { evidenceRef: s.evidenceRef });
    check(lot.synthetic === true && lot.state === 'REALIZED' && lot.code === s.lotCode &&
        same(lot.issuanceRef, s.evidenceRef) && lot.scale === s.scale && lot.unitOfMeasure === s.unitOfMeasure &&
        lot.issuedQuantity === s.issuedQuantity, 'Exact synthetic issuance required');
    const allocation = lot.allocations?.filter(a => a.code === s.allocationCode);
    check(allocation?.length === 1 && same(allocation[0].ownerRef, s.ownerRef) &&
        same(allocation[0].contributionRef, s.contributionRef) && allocation[0].quantity === s.allocationQuantity,
        'Original allocation mismatch');
    const body = { lotCode: s.lotCode, ownerRef: s.ownerRef, recipientRef: s.recipientRef,
        quantity: s.quantity, unitOfMeasure: s.unitOfMeasure, manifestRef: s.manifestRef, operationKey: s.runCode + ':transfer' };
    const assertReceipt = (r, states) => {
        check(r.synthetic === true && states.includes(r.status) && r.lotCode === s.lotCode &&
            r.operationKey === body.operationKey && same(r.ownerRef, s.ownerRef) &&
            r.quantity === s.quantity && r.unitOfMeasure === s.unitOfMeasure &&
            same(r.manifestRef, s.manifestRef), 'Carbon receipt binding mismatch');
        if (r.status !== 'RESERVED') check(same(r.recipientRef, s.recipientRef), 'Recipient mismatch');
        return r;
    };
    await post('/carbon/reservations', { ...body, quantity: '0', operationKey: s.runCode + ':invalid' }, ['ERR_CARBON_QUANTITY']);
    // Replays use the same owner key. No retry loop or compensating release follows an uncertain write.
    assertReceipt(await post('/carbon/reservations', body), ['RESERVED', 'TRANSFERRED', 'COMPLETED']);
    const transferred = assertReceipt(await post('/carbon/transfers', body), ['TRANSFERRED', 'COMPLETED']);
    if (transferred.status === 'TRANSFERRED') check(transferred.destinationHold === 'HELD', 'Recipient hold missing');
    const read = () => post('/carbon/holdings', { ownerRef: s.recipientRef });
    const assertHolding = (projection, state, hold) => {
        check(same(projection.ownerRef, s.recipientRef) && Array.isArray(projection.items), 'Recipient projection required');
        const rows = projection.items.filter(row => row.lotCode === s.lotCode);
        check(rows.length === 1 && rows[0].synthetic === true &&
            rows[0].unitOfMeasure === s.unitOfMeasure && rows[0].scale === s.scale &&
            rows[0].acquisitionRefs?.some(item => item.operationKey === body.operationKey &&
                item.quantity === s.quantity && same(item.manifestRef, s.manifestRef) &&
                item.status === state && item.destinationHold === hold), 'Persisted recipient acquisition required');
    };
    assertHolding(await read(), transferred.status, transferred.destinationHold);
    const completed = assertReceipt(await post('/carbon/transfers/finalize', body), ['COMPLETED']);
    check(completed.destinationHold === 'RELEASED' && completed.finalizedAt, 'Finalization receipt missing');
    const before = await read();
    assertHolding(before, 'COMPLETED', 'RELEASED');
    const replay = assertReceipt(await post('/carbon/transfers/finalize', body), ['COMPLETED']);
    check(same(replay, completed), 'Finalization replay changed receipt');
    check(same(await read(), before), 'Replay changed recipient holdings');
    await post('/carbon/releases', body, ['ERR_CARBON_FINAL']);
    check(same(await read(), before), 'Rejected release changed holdings');
    const lookup = assertReceipt(await post('/carbon/operations/lookup', body), ['COMPLETED']);
    check(same(lookup, completed), 'Original operation lookup changed receipt');
    return { state: 'PASSED', evidence: 'INSTALLED_SYNTHETIC_CARBON_HTTP', synthetic: true,
        operationKey: body.operationKey, lotCode: s.lotCode, replayVerified: true, negativeVerified: true,
        registryQualified: false };
}
