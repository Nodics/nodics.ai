/*
    Nodics - Enterprise Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    Governed by the root LICENSE or a separate written agreement with Nodics.
 */
/** @module editorial/test/editorialOriginalPublicationCommandRecovery @description Qualifies original rollback/withdrawal identity through actual lifecycle, source/target services and managed persistence owners, using isolated approved-source and repository ports. @layer test @owner editorial */
const test = require('node:test');
const assert = require('node:assert/strict');
const { lifecycleFixture } = require('./helpers/editorialPublicationLifecycleFixture');

for (const kind of ['ROLLBACK', 'WITHDRAWAL']) for (const failure of ['response', 'hook']) {
    test(kind + ' ' + failure + ' loss resumes the original command without revalidation, activation or another target effect', async t => {
        const f = lifecycleFixture(t), first = await f.publish(1), second = await f.publish(2);
        if (failure === 'response') f.state.loseResponses[kind] = 1; else f.state.failHooks[kind] = 1;
        await assert.rejects(f.invoke(kind, second), /after commit/);
        const failed = f.current(second.code), activation = structuredClone(failed.activationOperation);
        assert.equal(failed.state, 'FAILED'); assert.equal(failed.auditTrail.at(-1).fromState, kind === 'ROLLBACK' ? 'ROLLING_BACK' : 'WITHDRAWING');
        const proof = failed.auditTrail.at(-1).details.targetCommandOperation;
        assert.equal(proof.originRevision, 6); assert.equal(proof.operationKey, second.code + (kind === 'ROLLBACK' ? ':rollback:6' : ':withdraw:6'));
        assert.equal(Object.hasOwn(failed, 'targetCommandOperation'), false, 'the existing immutable journal owns intent, without another descriptor store');
        const before = f.target.snapshot(), writes = f.target.state.writes.length, reads = f.state.sourceReads;
        const recovered = await f.recover(failed);
        assert.equal(recovered.state, kind === 'ROLLBACK' ? 'ROLLED_BACK' : 'WITHDRAWN');
        assert.deepEqual(recovered.activationOperation, activation); assert.equal(f.state.activations, 2); assert.equal(f.state.sourceReads, reads);
        assert.equal(f.target.state.writes.length, writes); assert.deepEqual(f.target.snapshot(), before);
        assert(f.state.commands.every(call => call.proof.operationKey === proof.operationKey));
        assert.equal(f.state.commands.at(-1).revision, 8, 'actual lifecycle revision advances while original target identity remains 6');
        assert.equal(recovered.auditTrail.some(entry => entry.fromState === 'FAILED' && entry.toState === 'VALIDATING'), false);
        assert.equal((await f.target.status('story')).version, kind === 'ROLLBACK' ? first.targetVersion : null);
        if (kind === 'ROLLBACK') assert.deepEqual(f.state.hooks.at(-1).projectionCodes.sort(), first.targetVersion.split(',').sort());
    });
}

for (const kind of ['ROLLBACK', 'WITHDRAWAL']) test(kind + ' in-flight resume rejects stale revision before target I/O and keeps its original pre-effect journal', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.loseTransition = kind === 'ROLLBACK' ? 'ROLLING_BACK' : 'WITHDRAWING';
    await assert.rejects(f.invoke(kind, second), /Transition acknowledgement lost/);
    const pending = f.current(second.code), before = f.target.snapshot();
    assert.equal(pending.revision, 6); assert.equal(f.state.commands.length, 0);
    await assert.rejects(f.invoke(kind, pending, 5), error => error.code === 'ERR_PUB_00004');
    assert.equal(f.state.commands.length, 0); assert.deepEqual(f.target.snapshot(), before);
    const completed = await f.invoke(kind, pending);
    assert.equal(completed.state, kind === 'ROLLBACK' ? 'ROLLED_BACK' : 'WITHDRAWN');
    assert.equal(f.state.commands[0].proof.originRevision, 6);
});

test('repeated command failures retain one original intent across every later lifecycle revision', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.loseResponses.WITHDRAWAL = 2;
    await assert.rejects(f.invoke('WITHDRAWAL', second));
    const before = f.target.snapshot(), writes = f.target.state.writes.length;
    await assert.rejects(f.recover(f.current(second.code)));
    const final = await f.recover(f.current(second.code));
    assert.equal(final.state, 'WITHDRAWN'); assert.equal(final.revision, 11);
    assert.deepEqual(f.target.snapshot(), before); assert.equal(f.target.state.writes.length, writes);
    assert.deepEqual(f.state.commands.map(call => call.proof.originRevision), [6, 6, 6]);
});

test('recovery of an already committed older withdrawal preserves a newer Online publication', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.loseResponses.WITHDRAWAL = 1;
    await assert.rejects(f.invoke('WITHDRAWAL', second));
    const third = await f.publish(3), before = f.target.snapshot(), writes = f.target.state.writes.length;
    const recovered = await f.recover(f.current(second.code));
    assert.equal(recovered.state, 'WITHDRAWN'); assert.equal((await f.target.status('story')).version, third.targetVersion);
    assert.deepEqual(f.target.snapshot(), before); assert.equal(f.target.state.writes.length, writes);
});

for (const defect of ['missing-proof', 'changed-key', 'changed-activation', 'revision-gap', 'legacy-provider']) test('unqualified recovery stays held without target effects: ' + defect, async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.loseResponses.ROLLBACK = 1; await assert.rejects(f.invoke('ROLLBACK', second));
    const stored = f.state.records.get(second.code);
    if (defect === 'legacy-provider') delete f.provider.targetCommandReceiptContract;
    else for (const entry of stored.auditTrail) if (entry.details?.targetCommandOperation) {
        if (defect === 'missing-proof') delete entry.details.targetCommandOperation;
        if (defect === 'changed-key') entry.details.targetCommandOperation.operationKey = 'replacement-key';
        if (defect === 'changed-activation') entry.details.targetCommandOperation.activationKey = 'replacement-activation';
    }
    if (defect === 'revision-gap') stored.auditTrail.at(-2).revision--;
    const before = f.target.snapshot(), calls = f.state.commands.length;
    await assert.rejects(f.recover(f.current(second.code)));
    assert.equal(f.current(second.code).state, 'FAILED'); assert.equal(f.state.commands.length, calls); assert.deepEqual(f.target.snapshot(), before);
});

test('mismatched qualified provider receipt cannot complete lifecycle or execute completion hooks', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.corruptReceipt = 'WITHDRAWAL';
    await assert.rejects(f.invoke('WITHDRAWAL', second), error => error.code === 'ERR_PUB_00006');
    assert.equal(f.current(second.code).state, 'FAILED'); assert.equal(f.state.hooks.length, 0);
    const writes = f.target.state.writes.length; f.state.corruptReceipt = undefined;
    assert.equal((await f.recover(f.current(second.code))).state, 'WITHDRAWN');
    assert.equal(f.target.state.writes.length, writes);
});

test('target-version identity stays exact for a large site/language set without broadening generic evidence limits', async t => {
    const f = lifecycleFixture(t);
    f.state.siteCodes = Array.from({ length: 20 }, (_, index) => 'website-reference-' + index + '-for-enterprise-content');
    const first = await f.publish(1), second = await f.publish(2);
    assert(second.targetVersion.length > 1000);
    f.state.loseResponses.ROLLBACK = 1; await assert.rejects(f.invoke('ROLLBACK', second));
    const failed = f.current(second.code), proof = failed.auditTrail.at(-1).details.targetCommandOperation;
    assert.match(proof.targetVersionHash, /^[a-f0-9]{64}$/); assert.equal(proof.targetVersion, undefined);
    assert.equal(f.lifecycle.sanitizeEvidence('x'.repeat(1500)).length, 1000, 'generic redaction/string boundary is unchanged');
    assert.equal((await f.recover(failed)).state, 'ROLLED_BACK');
    assert.equal((await f.target.status('story')).version, first.targetVersion);
});

for (const [label, corrupt] of [
    ['negative response', result => ({ ...result, acknowledged: false })],
    ['negative receipt', result => ({ ...result, receipt: { ...result.receipt, success: false } })],
    ['contradictory response code', result => ({ ...result, responseCode: 'ERR_TARGET_00001' })],
    ['contradictory receipt errors', result => ({ ...result, receipt: { ...result.receipt, errors: ['denied'] } })],
    ['wrong operation', result => ({ ...result, receipt: { ...result.receipt, operation: 'ROLLBACK' } })],
    ['wrong target', result => ({ ...result, receipt: { ...result.receipt, targetVersion: 'unrelated-version' } })],
    ['invalid affected count', result => ({ ...result, receipt: { ...result.receipt, affected: -1 } })],
]) test('qualified recovery rejects ' + label + ' before lifecycle completion hooks', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.corruptReceipt = corrupt;
    await assert.rejects(f.invoke('WITHDRAWAL', second), error => error.code === 'ERR_PUB_00006');
    assert.equal(f.current(second.code).state, 'FAILED'); assert.equal(f.state.hooks.length, 0);
    const before = f.target.snapshot(), writes = f.target.state.writes.length;
    f.state.corruptReceipt = undefined;
    assert.equal((await f.recover(f.current(second.code))).state, 'WITHDRAWN');
    assert.equal(f.target.state.writes.length, writes); assert.deepEqual(f.target.snapshot(), before);
});

for (const kind of ['ROLLBACK', 'WITHDRAWAL']) test(kind + ' terminal acknowledgement loss is inspected and the same command returns without another target effect', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    const terminal = kind === 'ROLLBACK' ? 'ROLLED_BACK' : 'WITHDRAWN';
    f.state.loseTransition = terminal;
    await assert.rejects(f.invoke(kind, second), /Transition acknowledgement lost/);
    const saved = f.current(second.code), before = f.target.snapshot(), commands = f.state.commands.length;
    assert.equal(saved.state, terminal);
    assert.deepEqual(await f.invoke(kind, saved), saved);
    assert.equal(f.state.commands.length, commands); assert.deepEqual(f.target.snapshot(), before);
});

for (const kind of ['ROLLBACK', 'WITHDRAWAL']) test(kind + ' concurrent recovery admits one lifecycle CAS and preserves the original target receipt', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.loseResponses[kind] = 1; await assert.rejects(f.invoke(kind, second));
    const failed = f.current(second.code), before = f.target.snapshot(), writes = f.target.state.writes.length;
    const results = await Promise.allSettled([f.recover(failed), f.recover(failed)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.filter(result => result.status === 'rejected' && result.reason.code === 'ERR_PUB_00004').length, 1);
    assert.equal(f.current(second.code).state, kind === 'ROLLBACK' ? 'ROLLED_BACK' : 'WITHDRAWN');
    assert.equal(f.target.state.writes.length, writes); assert.deepEqual(f.target.snapshot(), before);
});

test('a failed withdrawal cannot be resumed as rollback or classified from a forged last journal state', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.loseResponses.WITHDRAWAL = 1; await assert.rejects(f.invoke('WITHDRAWAL', second));
    const failed = f.current(second.code), before = f.target.snapshot(), calls = f.state.commands.length;
    await assert.rejects(f.invoke('ROLLBACK', failed), error => error.code === 'ERR_PUB_00005');
    f.state.records.get(second.code).auditTrail.at(-1).toState = 'ONLINE';
    await assert.rejects(f.recover(failed), error => error.code === 'ERR_PUB_00005');
    assert.equal(f.state.commands.length, calls); assert.deepEqual(f.target.snapshot(), before);
});


test('current deployment identifies the restored earlier request separately from the retained newer request', async t => {
    const f = lifecycleFixture(t), first = await f.publish(1), second = await f.publish(2);
    const request = f.request(second.code, second.revision);
    const source = require('../src/service/defaultEditorialOnlineProjectionService');
    const before = await source.getDeployment('story', request);
    assert.equal(before.code, second.code); assert.equal(before.sourceRevision, 2);
    await f.invoke('ROLLBACK', second);
    const restored = await source.getDeployment('story', request);
    assert.equal(restored.status, 'DEPLOYED'); assert.equal(restored.code, first.code);
    assert.equal(restored.sourceRevision, 1); assert.equal(restored.version, first.targetVersion);
    assert.equal(f.current(second.code).state, 'ROLLED_BACK');
    assert.equal(f.current(first.code).state, 'ONLINE');
    await f.invoke('WITHDRAWAL', f.current(first.code));
    assert.deepEqual(await source.getDeployment('story', request), { status: 'NONE', revision: 4 });
});

test('completion of an older target command projects the current owner set instead of its historical result', async t => {
    const f = lifecycleFixture(t); await f.publish(1); const second = await f.publish(2);
    f.state.loseResponses.WITHDRAWAL = 1; await assert.rejects(f.invoke('WITHDRAWAL', second));
    const third = await f.publish(3), projected = [];
    SERVICE.DefaultEditorialSearchProjectionService = require('../src/service/defaultEditorialSearchProjectionService');
    SERVICE.DefaultSearchProjectionService = { project: async request => { projected.push(request); return true; } };
    await f.recover(f.current(second.code));
    assert.equal(projected.length, 1); assert.deepEqual(projected[0].projectionCodes.sort(), third.targetVersion.split(',').sort());
    assert.equal(projected[0].tenant, 'testTenant'); assert.equal(projected[0].authData, f.request().authData);
});
