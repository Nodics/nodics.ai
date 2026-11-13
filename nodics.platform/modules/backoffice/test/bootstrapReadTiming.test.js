/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module backoffice/test/bootstrapReadTiming
 * @description Verifies bounded numeric diagnostics preserve owner results, failure identity and overlapping read counts without retaining private context.
 * @layer test
 * @owner backoffice
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const base = require('../src/service/registry/defaultBackofficeRegistryService');

test('fixed bootstrap phases preserve results and store numeric counters only', async () => {
    const owner = Object.assign(Object.create(base), { _metrics: {} });
    const result = { privateResult: 'synthetic-private-payload' };
    let calls = 0;
    assert.equal(await owner.measureBootstrapPhase('registry', () => { calls++; return result; }), result);
    assert.equal(calls, 1);
    const metric = owner._metrics.bootstrapTiming.registry;
    assert.equal(metric.active, 0);
    assert.equal(metric.completed, 1);
    assert.equal(metric.rejected, 0);
    assert.deepEqual(Object.keys(metric).sort(), ['active', 'completed', 'lastDurationMs', 'maxDurationMs', 'rejected', 'totalDurationMs']);
    assert(Object.values(metric).every(value => Number.isFinite(value) && value >= 0));
    assert(!JSON.stringify(owner._metrics).includes('synthetic-private'));
});

test('overlapping and failed reads retain exact outcomes without retaining errors', async () => {
    const owner = Object.assign(Object.create(base), { _metrics: {} });
    let completeFirst, completeSecond;
    const first = owner.measureBootstrapPhase('documentation', () => new Promise((resolve, reject) => { completeFirst = reject; }));
    const second = owner.measureBootstrapPhase('documentation', () => new Promise(resolve => { completeSecond = resolve; }));
    const metric = owner._metrics.bootstrapTiming.documentation;
    assert.equal(metric.active, 2);
    const failure = new Error('synthetic-private-error');
    const rejected = assert.rejects(first, error => error === failure);
    completeSecond('second');
    assert.equal(await second, 'second');
    assert.equal(metric.active, 1);
    completeFirst(failure);
    await rejected;
    assert.equal(metric.active, 0);
    assert.equal(metric.completed, 2);
    assert.equal(metric.rejected, 1);
    assert.throws(() => owner.measureBootstrapPhase('axisPolicy', () => { throw failure; }), error => error === failure);
    assert.equal(owner._metrics.bootstrapTiming.axisPolicy.rejected, 1);
    assert(!JSON.stringify(owner._metrics).includes('synthetic-private'));
});

test('unsupported phase labels execute once without becoming diagnostic keys', () => {
    const owner = Object.assign(Object.create(base), { _metrics: {} });
    let calls = 0;
    assert.equal(owner.measureBootstrapPhase('synthetic-private-principal', () => { calls++; return 'result'; }), 'result');
    assert.equal(calls, 1);
    assert.deepEqual(owner._metrics, {});
});
