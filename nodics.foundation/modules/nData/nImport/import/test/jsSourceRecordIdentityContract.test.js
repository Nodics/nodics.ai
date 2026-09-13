/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/jsSourceRecordIdentityContract
 * @description Proves layered JavaScript source-key identity before persistence dispatch.
 * @layer test
 * @owner import
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const processor = require('../../jsImport/src/service/init/defaultJsFileDataProcessService');

test('actual file composition inherits by key, replaces arrays, and never uses code as source identity', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-source-identity-'));
    try {
        const base = { record0: { code: 'original', name: 'Base', nested: { a: 1 }, values: ['a', 'b'] },
            other: { code: 'shared', name: 'First' } };
        const next = { record0: { name: 'Partner', nested: { b: 2 }, values: ['c'] },
            distinct: { code: 'shared', name: 'Second' } };
        const files = [base, next].map((value, index) => {
            const file = path.join(root, index + '.js');
            fs.writeFileSync(file, 'module.exports = ' + JSON.stringify(value));
            return file;
        });
        const result = await processor.handleFiles({}, {}, files.slice());
        assert.deepEqual(result.record0, { code: 'original', name: 'Partner', nested: { a: 1, b: 2 }, values: ['c'] });
        assert.deepEqual(Object.keys(result), ['record0', 'other', 'distinct']);
        assert.equal(result.other.code, result.distinct.code);
        assert.deepEqual(require(files[0]), base, 'composing must not mutate require exports');
        assert.equal(processor.mergeModels(result, { record0: { code: 'changed' } }).record0.code, 'changed');
        const separate = await processor.handleFiles({}, {}, [files[0]]);
        assert.equal(separate.record0.name, 'Base', 'a different dataset begins its own source key scope');
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('malformed source exports and prototype-affecting record keys fail before dispatch', () => {
    for (const value of [[], null, 'text', { record0: 4 }, JSON.parse('{"__proto__": {"polluted": true}}')]) {
        assert.throws(() => processor.mergeModels({}, value), /keyed object|record key or model/);
    }
    assert.equal({}.polluted, undefined);
});
