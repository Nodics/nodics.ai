/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module import/test/exactManifestDiscovery @description Exact readiness discovery retains admission and fresh inspection without scanning sibling releases. @owner import @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const base = require('../src/service/release/defaultDataReleaseService');

test('exact discovery inspects only admitted owner section and rechecks each call', t => {
    const previous = global.NODICS;
    t.after(() => { global.NODICS = previous; });
    const calls = [];
    const section = { kind: 'DATA_RELEASE', dataType: 'sample', sourceRoot: 'sample-v001' };
    const aggregate = { sections: { selected: section, unrelated: section } };
    let active = true, selected = ['selected'], version = 'one';
    global.NODICS = { getRawModule: name => {
        calls.push(['owner', name]);
        assert.equal(name, 'owner');
        return { name, path: '/owner' };
    } };
    const service = Object.assign(Object.create(base), {
        validateDataType: type => assert.equal(type, 'sample'),
        discoveryOwners: () => [{ moduleName: 'unrelated', active: true },
            { moduleName: 'owner', active, sections: selected }],
        readAggregateManifest: owner => { calls.push(['manifest', owner.name]); return aggregate; },
        inspectManifest: (owner, type, path, input, code, requireLifecycle) => {
            calls.push(['inspect', code]);
            assert.equal(input, section);
            assert.equal(requireLifecycle, !active);
            return { releaseCode: owner.name + ':' + code, version };
        },
        discoverReleases: () => assert.fail('must not scan the catalogue'),
        error: (_code, message) => new Error(message),
    });
    const pin = { moduleName: 'owner', sectionCode: 'selected' };
    assert.equal(service.discoverManifestRelease(pin, 'sample').version, 'one');
    version = 'two';
    assert.equal(service.discoverManifestRelease(pin, 'sample').version, 'two');
    assert.deepEqual(calls, [['owner', 'owner'], ['manifest', 'owner'], ['inspect', 'selected'],
        ['owner', 'owner'], ['manifest', 'owner'], ['inspect', 'selected']]);
    active = false;
    assert.equal(service.discoverManifestRelease(pin, 'sample').version, 'two');
    selected = ['unrelated'];
    const before = calls.length;
    assert.throws(() => service.discoverManifestRelease(pin, 'sample'), /not selected/);
    assert.equal(calls.length, before);
    assert.throws(() => service.discoverManifestRelease({ ...pin, moduleName: 'absent' }, 'sample'), /not selected/);
    active = true;
    aggregate.sections.selected = { ...section, dataType: 'core' };
    assert.throws(() => service.discoverManifestRelease(pin, 'sample'), /different data type/);
    aggregate.sections.selected = section;
    service.inspectManifest = () => { throw new Error('source drift'); };
    assert.throws(() => service.discoverManifestRelease(pin, 'sample'), /source drift/);
});
