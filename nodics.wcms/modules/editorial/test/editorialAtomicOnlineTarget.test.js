/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/test/editorialAtomicOnlineTarget @description Independent target atomicity, original receipt recovery, route collision and pointer concurrency checks using isolated generated-service ports. @layer test @owner editorial */
const assert = require('node:assert/strict');
const test = require('node:test');
const { fixture } = require('./helpers/editorialOnlineTargetFixture');

/** Checks the complete caller-visible command acknowledgement independently of stored pointer implementation. */
function commandResult(kind, input, affected, version = input.result.version) {
    return { ...(kind === 'ROLLBACK' ? { version, restored: affected } : { articleCode: input.publication.rootCode, withdrawn: affected }),
        projectionCodes: affected ? version.split(',') : [],
        receipt: { operationKey: input.publication.code + (kind === 'ROLLBACK' ? ':rollback:6' : ':withdraw:6'),
            publicationCode: input.publication.code, rootCode: input.publication.rootCode, sourceVersion: input.publication.sourceVersion,
            operation: kind, targetVersion: version, affected } };
}

test('complete bilingual activation returns a qualified original receipt and a consistent managed head', async t => {
    const f = fixture(t), input = f.publish('story', 1);
    assert.deepEqual(await f.status('story'), { version: null, revision: 0, projectionCodes: [], deployment: null });
    input.result = await f.deploy(input);
    const version = 'story-exampleSite-ar-1,story-exampleSite-en-1';
    assert.equal(input.result.version, version);
    assert.deepEqual(input.result.receipt, { operationKey: input.operationKey, publicationCode: input.publication.code,
        rootCode: 'story', sourceVersion: '1', targetVersion: version, previousOnlineVersion: null, previousOnlineRevision: 0 });
    assert.deepEqual(await f.status('story'), { version, revision: 1, projectionCodes: version.split(','), deployment: { publicationCode: input.publication.code, sourceRevision: 1, activationKey: input.publication.activationOperation.key } });
    assert.equal([...f.state.projections.values()].filter(row => row.status === 'CURRENT').length, 2);
    assert.equal([...f.state.receipts.values()].filter(row => row.receiptKind === 'ARTICLE_HEAD').length, 1);
    assert.equal([...f.state.receipts.values()].filter(row => row.receiptKind === 'ROUTE_CLAIM').length, 2);
    const writes = f.state.writes.length, snapshot = f.snapshot();
    assert.deepEqual(await f.deploy(input), input.result);
    assert.equal(f.state.writes.length, writes, 'exact replay reads its receipt without target writes');
    assert.deepEqual(f.snapshot(), snapshot);
    const inspected = await f.target.status(f.request({ publication: input.publication, inspectOperation: true }));
    assert.equal(inspected.activation.status, 'COMMITTED'); assert.equal(inspected.activation.isCurrent, true);
});

test('lost commit acknowledgement is recovered from the original durable operation without republishing', async t => {
    const f = fixture(t), input = f.publish('story', 1);
    f.state.loseCommitResponse = true;
    await assert.rejects(f.deploy(input), /Commit response unavailable/);
    assert.equal((await f.status('story')).revision, 1);
    const writes = f.state.writes.length, snapshot = f.snapshot();
    const result = await f.deploy(input);
    assert.equal(result.receipt.operationKey, input.operationKey);
    assert.equal(f.state.writes.length, writes); assert.deepEqual(f.snapshot(), snapshot);
});

test('ordinary insert-only receipt saves are rejected by the real managed-save admission without partial target writes', async t => {
    const f = fixture(t), input = f.publish('story', 1), before = f.snapshot();
    const save = global.SERVICE.DefaultEditorialPublicationReceiptService.save;
    global.SERVICE.DefaultEditorialPublicationReceiptService.save = request => save({ ...request, options: { ...request.options, insertOnly: true } });
    await assert.rejects(f.deploy(input), /managed-concurrency/);
    assert.deepEqual(f.snapshot(), before);
});

test('unknown receipt inspection is not a failed-operation claim and performs no writes', async t => {
    const f = fixture(t), input = f.publish('story', 1);
    const result = await f.target.status(f.request({ publication: input.publication, inspectOperation: true }));
    assert.deepEqual(result.activation, { status: 'UNKNOWN' });
    assert.equal(result.revision, 0); assert.equal(f.state.writes.length, 0);
});

for (const bad of ['capability', 'role', 'source-enabled']) test('unsupported target authority fails before writes: ' + bad, async t => {
    const f = fixture(t), input = f.publish('story', 1);
    if (bad === 'capability') f.state.capabilities = false;
    if (bad === 'role') f.configured.publication.runtimeRole = 'STAGED';
    if (bad === 'source-enabled') f.state.publicationEnabled = true;
    await assert.rejects(f.deploy(input)); assert.equal(f.state.writes.length, 0);
});

for (const point of ['second-projection', 'supersede', 'deployment-receipt', 'head-cas', 'route-cas']) {
    test('failure at ' + point + ' preserves the complete previous language set and every pointer/receipt', async t => {
        const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
        const second = f.publish('story', 2, await f.status('story')), before = f.snapshot();
        let fired = false, projectionSaves = 0;
        f.state.fault = ({ store, operation, request, row }) => {
            const hit = point === 'second-projection' && store === 'projections' && operation === 'save' && ++projectionSaves === 2 ||
                point === 'supersede' && store === 'projections' && operation === 'update' && request.model.status === 'SUPERSEDED' ||
                point === 'deployment-receipt' && store === 'receipts' && operation === 'save' && row.receiptKind === 'DEPLOYMENT' ||
                point === 'head-cas' && store === 'receipts' && operation === 'update' && row.receiptKind === 'ARTICLE_HEAD' ||
                point === 'route-cas' && store === 'receipts' && operation === 'update' && row.receiptKind === 'ROUTE_CLAIM';
            if (hit) { fired = true; throw new Error('Injected target failure'); }
        };
        await assert.rejects(f.deploy(second), /Injected target failure/);
        assert.equal(fired, true); assert.deepEqual(f.snapshot(), before);
    });
}

for (const bad of ['missing-save-record', 'negative-envelope', 'receipt-count-only', 'zero-update-count']) {
    test('unverifiable ' + bad + ' acknowledgement rolls back the whole replacement', async t => {
        const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
        const second = f.publish('story', 2, await f.status('story')), before = f.snapshot();
        f.state.fault = ({ store, operation, row, response }) => {
            if (bad === 'missing-save-record' && store === 'projections' && operation === 'save') return { code: 'SUC_SAVE_00000', result: { modifiedCount: 1 } };
            if (bad === 'negative-envelope' && store === 'projections' && operation === 'save') return { ...response, success: false };
            if (bad === 'receipt-count-only' && store === 'receipts' && operation === 'update' && row.receiptKind === 'ARTICLE_HEAD') return { code: 'SUC_UPD_00000', result: { modifiedCount: 1 } };
            if (bad === 'zero-update-count' && store === 'projections' && operation === 'update') return { code: 'SUC_UPD_00000', result: { modifiedCount: 0 } };
        };
        await assert.rejects(f.deploy(second)); assert.deepEqual(f.snapshot(), before);
    });
}

test('changed payload/control intent cannot reuse an original activation key', async t => {
    const f = fixture(t), input = f.publish('story', 1); input.result = await f.deploy(input);
    const before = f.snapshot(), changed = structuredClone(input);
    changed.projections[0].accessGroups.push('different-group');
    await assert.rejects(f.deploy(changed), /different source/); assert.deepEqual(f.snapshot(), before);
});

test('rollback restores the retained complete set, supersedes the replacement and returns its original command receipt on replay', async t => {
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    const second = f.publish('story', 2, await f.status('story')); second.result = await f.deploy(second);
    const restored = await f.rollback(second, first.result.version);
    assert.deepEqual(restored, commandResult('ROLLBACK', second, 2, first.result.version));
    assert.equal((await f.status('story')).version, first.result.version);
    assert.equal((await f.status('story')).revision, 3);
    assert([...f.state.projections.values()].filter(row => row.sourceRevision === 2).every(row => row.status === 'SUPERSEDED'));
    const writes = f.state.writes.length;
    assert.deepEqual(await f.rollback(second, first.result.version), restored); assert.equal(f.state.writes.length, writes);
    const stale = f.publish('story', 3, { version: first.result.version, revision: 1 });
    await assert.rejects(f.deploy(stale), /predecessor was captured/);
});

test('old publication withdrawal preserves newer visibility and explicit old withdrawal prevents rollback republication', async t => {
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    const second = f.publish('story', 2, await f.status('story')); second.result = await f.deploy(second);
    assert.deepEqual(await f.withdraw(first), commandResult('WITHDRAWAL', first, 0));
    assert.equal((await f.status('story')).version, second.result.version);
    await assert.rejects(f.rollback(second, first.result.version), /explicitly withdrawn/);
    assert.equal((await f.status('story')).version, second.result.version);
});

test('exact withdrawal atomically removes both locales and original retry never re-executes', async t => {
    const f = fixture(t), input = f.publish('story', 1); input.result = await f.deploy(input);
    assert.deepEqual(await f.withdraw(input), commandResult('WITHDRAWAL', input, 2));
    assert.deepEqual(await f.status('story'), { version: null, revision: 2, projectionCodes: [], deployment: null });
    assert([...f.state.projections.values()].every(row => row.status === 'WITHDRAWN'));
    assert([...f.state.receipts.values()].filter(row => row.receiptKind === 'ROUTE_CLAIM').every(row => row.status === 'WITHDRAWN'));
    const writes = f.state.writes.length;
    assert.deepEqual(await f.withdraw(input), commandResult('WITHDRAWAL', input, 2)); assert.equal(f.state.writes.length, writes);
});

test('a mid-withdrawal failure cannot remove only one language', async t => {
    const f = fixture(t), input = f.publish('story', 1); input.result = await f.deploy(input);
    const before = f.snapshot(); let updated = 0;
    f.state.fault = ({ store, operation }) => { if (store === 'projections' && operation === 'update' && ++updated === 2) throw new Error('Withdrawal interrupted'); };
    await assert.rejects(f.withdraw(input), /Withdrawal interrupted/); assert.deepEqual(f.snapshot(), before);
});

for (const sameArticle of [true, false]) test('concurrent first activations fence ' + (sameArticle ? 'one article head' : 'a cross-article slug claim'), async t => {
    const f = fixture(t), left = f.publish('story', 1, undefined, 'publication-left'), right = f.publish(sameArticle ? 'story' : 'other', 1, undefined, 'publication-right');
    let release, reached = 0;
    const barrier = new Promise(resolve => { release = resolve; });
    f.state.beforeCommit = async () => { if (++reached === 2) release(); await barrier; };
    const results = await Promise.allSettled([f.deploy(left), f.deploy(right)]);
    f.state.beforeCommit = undefined;
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter(result => result.status === 'rejected').length, 1);
    assert.equal([...f.state.projections.values()].filter(row => row.status === 'CURRENT').length, 2);
    assert.equal([...f.state.receipts.values()].filter(row => row.receiptKind === 'ARTICLE_HEAD').length, 1);
    assert.equal([...f.state.receipts.values()].filter(row => row.receiptKind === 'DEPLOYMENT').length, 1);
});

test('rollback cannot displace another article that acquired a released slug', async t => {
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    const second = f.publish('story', 2, await f.status('story'), undefined, { en: 'replacement-en', ar: 'replacement-ar' }); second.result = await f.deploy(second);
    const other = f.publish('other', 1); other.result = await f.deploy(other);
    const before = f.snapshot();
    await assert.rejects(f.rollback(second, first.result.version), /already published by another/);
    assert.deepEqual(f.snapshot(), before);
});

for (const defect of ['wrong-root', 'wrong-hash', 'invalid-date', 'duplicate-locale', 'oversize', 'missing-predecessor-revision', 'noncurrent']) {
    test('invalid target input cannot partially activate: ' + defect, async t => {
        const f = fixture(t), input = f.publish('story', 1), before = f.snapshot();
        if (defect === 'wrong-root') input.projections[0].articleCode = 'other';
        if (defect === 'wrong-hash') input.projections[0].payload.title = 'Changed after approval';
        if (defect === 'invalid-date') input.projections[0].publishedAt = 'not-a-date';
        if (defect === 'duplicate-locale') input.projections[1] = structuredClone(input.projections[0]);
        if (defect === 'oversize') f.configured.publication.maximumProjectionBytes = 10;
        if (defect === 'missing-predecessor-revision') delete input.publication.activationOperation.previousOnlineRevision;
        if (defect === 'noncurrent') input.projections[0].status = 'SUPERSEDED';
        await assert.rejects(f.deploy(input)); assert.deepEqual(f.snapshot(), before); assert.equal(f.state.writes.length, 0);
    });
}

test('unqualified legacy visibility and incomplete qualified language sets require owner review, with no adoption', async t => {
    const f = fixture(t), input = f.publish('story', 1);
    f.state.projections.set(input.projections[0].code, structuredClone(input.projections[0]));
    const legacy = f.snapshot();
    await assert.rejects(f.deploy(input), /Unqualified existing/); assert.deepEqual(f.snapshot(), legacy);
    f.state.projections.clear(); input.result = await f.deploy(input);
    f.state.projections.delete(input.projections[0].code);
    const incomplete = f.snapshot();
    await assert.rejects(f.status('story'), /incomplete or ambiguous/);
    await assert.rejects(f.withdraw(input)); assert.deepEqual(f.snapshot(), incomplete);
});

test('a renewed approval cycle retains distinct original receipts and never overwrites immutable source payload', async t => {
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    await f.withdraw(first);
    const renewed = f.publish('story', 1, await f.status('story'));
    renewed.publication.activationOperation.key = renewed.operationKey = first.publication.code + ':activate:12';
    renewed.result = await f.deploy(renewed);
    assert.equal(renewed.result.version, first.result.version);
    assert.equal([...f.state.receipts.values()].filter(row => row.receiptKind === 'DEPLOYMENT').length, 2);
    const original = await f.target.status(f.request({ publication: first.publication, inspectOperation: true }));
    assert.equal(original.activation.status, 'COMMITTED'); assert.equal(original.activation.isCurrent, false);
    assert.deepEqual(original.activation.result, first.result);
    const writes = f.state.writes.length;
    assert.deepEqual(await f.withdraw(first), commandResult('WITHDRAWAL', first, 2));
    assert.equal(f.state.writes.length, writes); assert.equal((await f.status('story')).version, renewed.result.version);
    const changed = f.publish('story', 1, await f.status('story'));
    changed.publication.activationOperation.key = changed.operationKey = first.publication.code + ':activate:16';
    changed.projections[0].accessGroups.push('different');
    const before = f.snapshot();
    await assert.rejects(f.deploy(changed), /different content/); assert.deepEqual(f.snapshot(), before);
});

test('another publication cannot capture an already published immutable source revision', async t => {
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    const alternative = f.publish('story', 1, await f.status('story'), 'alternative-publication'), before = f.snapshot();
    await assert.rejects(f.deploy(alternative), /already belongs/); assert.deepEqual(f.snapshot(), before);
});

test('a mid-rollback failure preserves the complete replacement, routes, pointer and deployment receipts', async t => {
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    const second = f.publish('story', 2, await f.status('story')); second.result = await f.deploy(second);
    const before = f.snapshot(); let restored = 0;
    f.state.fault = ({ store, operation, request }) => {
        if (store === 'projections' && operation === 'update' && request.model.status === 'CURRENT' && ++restored === 2) throw new Error('Rollback interrupted');
    };
    await assert.rejects(f.rollback(second, first.result.version), /Rollback interrupted/); assert.deepEqual(f.snapshot(), before);
});

test('rollback cannot overwrite a publication that intervened after the original activation', async t => {
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    const second = f.publish('story', 2, await f.status('story')); second.result = await f.deploy(second);
    const third = f.publish('story', 3, await f.status('story')); third.result = await f.deploy(third);
    const before = f.snapshot();
    await assert.rejects(f.rollback(second, first.result.version), /changed after/); assert.deepEqual(f.snapshot(), before);
});

test('same-instant renewal of the currently deployed immutable source does not fabricate route edits or managed CAS acknowledgements', async t => {
    t.mock.timers.enable({ apis: ['Date'], now: Date.UTC(2026, 10, 4) });
    const f = fixture(t), first = f.publish('story', 1); first.result = await f.deploy(first);
    const claims = [...f.state.receipts.values()].filter(row => row.receiptKind === 'ROUTE_CLAIM');
    const renewed = f.publish('story', 1, await f.status('story'));
    renewed.publication.activationOperation.key = renewed.operationKey = first.publication.code + ':activate:12';
    renewed.result = await f.deploy(renewed);
    assert.equal(renewed.result.version, first.result.version); assert.equal((await f.status('story')).revision, 2);
    assert.deepEqual([...f.state.receipts.values()].filter(row => row.receiptKind === 'ROUTE_CLAIM'), claims);
    assert.equal([...f.state.receipts.values()].filter(row => row.receiptKind === 'DEPLOYMENT').length, 2);
    const changed = f.publish('story', 1, await f.status('story'));
    changed.publication.activationOperation.key = changed.operationKey = first.publication.code + ':activate:16';
    changed.projections[0].accessGroups.push('different');
    const before = f.snapshot(); await assert.rejects(f.deploy(changed), /different content/); assert.deepEqual(f.snapshot(), before);
});
