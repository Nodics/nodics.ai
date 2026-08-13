/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/dataLifecycleClassificationContract
 * @description Ensures every executable framework data section declares complete, coherent lifecycle and destination policy.
 * @layer test
 * @owner nTooling
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../../..');
const lifecycleFields = ['owningDomain', 'lifecycle', 'destinationRole', 'environmentScope', 'sensitivity',
    'versioningPolicy', 'publicationPolicy', 'initialPublicationPolicy', 'removalPolicy'];

/** Returns aggregate manifest paths without scanning dependencies or generated documentation workspaces. */
function manifestsBelow(folder) {
    return fs.readdirSync(folder, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name)).flatMap(entry => {
        if (entry.name === 'node_modules' || entry.name === '.git') return [];
        let absolute = path.join(folder, entry.name);
        if (entry.isDirectory()) return manifestsBelow(absolute);
        return entry.name === 'manifest.json' && path.basename(path.dirname(absolute)) === 'data' ? [absolute] : [];
    });
}

let executableSections = [];
for (let manifestPath of manifestsBelow(root)) {
    let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (let [sectionCode, section] of Object.entries(manifest.sections || {})) {
        if (!['DATA_RELEASE', 'CONTENT_PACK'].includes(section.kind)) continue;
        let identity = path.relative(root, manifestPath) + '#' + sectionCode;
        lifecycleFields.forEach(field => assert.notStrictEqual(section[field], undefined,
            identity + ' must declare ' + field));
        assert(Array.isArray(section.environmentScope) && section.environmentScope.length > 0,
            identity + ' must declare at least one environment class');
        if (section.lifecycle === 'PUBLISHABLE') {
            assert(/_STAGED$/.test(section.destinationRole), identity + ' must target a Staged runtime');
            assert.strictEqual(section.versioningPolicy, 'IMMUTABLE');
            assert.strictEqual(section.publicationPolicy, 'REQUIRED');
            assert.strictEqual(section.initialPublicationPolicy, 'ADMIN_INITIATED');
            assert.strictEqual(section.removalPolicy, 'UNPUBLISH_OR_RETIRE');
        } else {
            assert(['OPERATIONAL_VERSIONED', 'REFERENCE'].includes(section.lifecycle), identity + ' has an unknown lifecycle');
            assert.strictEqual(section.publicationPolicy, 'NONE');
            assert.strictEqual(section.initialPublicationPolicy, 'NONE');
            assert.strictEqual(section.versioningPolicy, section.lifecycle === 'OPERATIONAL_VERSIONED' ? 'IMMUTABLE' : 'NONE');
        }
        if (section.dataType === 'sample') {
            assert(!section.environmentScope.includes('ALL'), identity + ' sample data must remain environment-bounded');
        }
        executableSections.push(identity);
    }
}

assert(executableSections.length >= 16, 'The framework lifecycle inventory unexpectedly lost executable releases');
console.log('Framework data lifecycle classification contract validated: ' + executableSections.length + ' sections');
