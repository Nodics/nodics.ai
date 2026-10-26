/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module commerce/test/consolidatedDataReleases
 * @description Checks source-only baseline placement, checksums and import identity uniqueness.
 * @owner nodics.commerce
 * @layer test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const release = require('../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService');
const root = path.resolve(__dirname, '..');
const files = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry =>
    entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const manifests = files(root).filter(file => file.endsWith('/data/manifest.json'))
    .map(file => ({file, data: path.dirname(file), manifest: require(file)}));
const checksum = section => hash(Object.keys(section.files).sort()
    .map(file => file + ':' + section.files[file]).join('|') +
    (section.prerequisites?.length ? '|prerequisites:' + JSON.stringify(section.prerequisites) : ''));

test('Product baseline retains the newer typed publication approval decision', () => {
    const workflow = require('../modules/baseCommerce/modules/product/data/init-v001/records/process/productPublicationWorkflowDefinitionData');
    const definition = workflow.definitions.find(row => row.code === 'productPublicationApproval');
    const review = definition.graph.nodes.find(node => node.code === 'productReview');
    assert.deepEqual(review.policy.decisionContract, {
        contractVersion: 1, kind: 'APPROVAL', approveLabel: 'Approve', rejectLabel: 'Reject',
        reasonLabel: 'Reason', rejectionReasonRequired: true, maximumReasonLength: 1000
    });
});

for (const {data, manifest} of manifests) {
    test(manifest.module + ': publication reviews satisfy the canonical import contract', () => {
        for (const [name, section] of Object.entries(manifest.sections)) {
            if (section.publicationReview === undefined) continue;
            assert.deepEqual(release.validatePublicationReview(section.publicationReview, manifest.module, name),
                section.publicationReview, name);
        }
    });
    test(manifest.module + ': consolidated files, exact hashes and independent selection', () => {
        const declared = new Set();
        const selectedIdentities = new Map();
        assert.equal(Object.hasOwn(manifest, 'retainedRoots'), false);
        for (const [name, section] of Object.entries(manifest.sections)) {
            assert.equal(Object.hasOwn(section, 'retainedRoots'), false, name);
            const hashes = section.files || section.generatedHashes || {};
            const identities = new Set();
            for (const [file, expected] of Object.entries(hashes)) {
                declared.add(file);
                assert.equal(hash(fs.readFileSync(path.join(data, file))), expected, name + ':' + file);
                if (!file.includes('/headers/')) continue;
                for (const [owner, routes] of Object.entries(require(path.join(data, file)))) {
                    for (const route of Object.values(routes)) {
                        if (route.options?.enabled === false || !route.options?.dataFilePrefix) continue;
                        const records = Object.keys(hashes).filter(candidate => candidate.includes('/records/') &&
                            path.basename(candidate, '.js') === route.options.dataFilePrefix);
                        assert.equal(records.length, 1, name + ':' + route.options.dataFilePrefix);
                        for (const row of Object.values(require(path.join(data, records[0])))) {
                            const query = Object.fromEntries(Object.entries(route.query || {}).map(([key, value]) =>
                                [key, typeof value === 'string' && value.startsWith('$') ? row[value.slice(1)] : value]));
                            const identity = owner + ':' + route.options.schemaName + ':' + JSON.stringify(query);
                            assert.ok(!identities.has(identity), name + ': duplicate ' + identity);
                            assert.ok(!selectedIdentities.has(identity), name + ': overlaps section ' + selectedIdentities.get(identity) + ': ' + identity);
                            identities.add(identity);
                            selectedIdentities.set(identity, name);
                        }
                    }
                }
            }
            for (const pin of section.prerequisites || []) {
                const dependency = manifests.find(item => item.manifest.module === pin.moduleName)
                    ?.manifest.sections[pin.sectionCode];
                if (!dependency) continue;
                assert.equal(pin.version, dependency.version, name + ': prerequisite version');
                assert.equal(pin.checksum, checksum(dependency), name + ': prerequisite checksum');
            }
        }
        for (const file of files(data)) {
            const relative = path.relative(data, file);
            if (!/^(init|core|sample|docs)-v\d{3}\//.test(relative)) continue;
            assert.match(relative, /^(init|core|sample|docs)-v001\//);
            assert.ok(declared.has(relative), 'undeclared retained source: ' + relative);
        }
    });
}
