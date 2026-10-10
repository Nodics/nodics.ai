/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.docs/test/sourceCoverageClaims @description Rejects invalid depth claims and preserves the distinction between documentation and implementation evidence. @layer test @owner nodics.docs */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('source coverage binds substantial canonical sections to existing selected module source', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-coverage-claims-'));
    try {
        const owner = path.join(root, 'capability');
        fs.mkdirSync(path.join(owner, 'src/service'), { recursive: true });
        fs.mkdirSync(path.join(owner, 'src/schemas'), { recursive: true });
        fs.writeFileSync(path.join(owner, 'package.json'), JSON.stringify({ name: 'capability', nodics: { kind: 'module' } }));
        fs.writeFileSync(path.join(owner, 'src/service/operation.js'), 'module.exports = {};');
        fs.writeFileSync(path.join(owner, 'src/schemas/schemas.js'), 'module.exports = {};');
        const evidence = ['src/service/operation.js', 'src/schemas/schemas.js'];
        const blocks = [1, 2, 3].flatMap(index => [
            { kind: 'heading', level: 2, anchor: 'section-' + index, text: 'Section ' + index },
            { kind: 'paragraph', text: ('Source-backed business behavior and honest acceptance boundary. ').repeat(45) },
        ]);
        blocks.push({ kind: 'diagram', text: 'flowchart LR\n A --> B' }, { kind: 'table', headers: ['Owner'], rows: [['Capability']] });
        const baseline = { documents: [{ id: 'test.guide', title: 'Guide', ownerRoot: owner, content: 'unused', blocks, body: 'Guide', sourceEvidence: evidence,
            sourceCoverage: [{ modulePath: '.', implementationState: 'SCHEMA_DEFINED', anchors: ['section-1', 'section-2', 'section-3'], evidence }] }] };
        const catalogue = path.join(root, 'catalogue.json'), output = path.join(root, 'reports');
        const run = value => {
            fs.writeFileSync(catalogue, JSON.stringify(value));
            return spawnSync(process.execPath, [new URL('../scripts/audit-source-coverage.mjs', import.meta.url).pathname,
                '--source-root=' + owner, '--catalogue=' + catalogue, '--output-dir=' + output], { encoding: 'utf8' });
        };
        const ok = run(baseline);
        assert.equal(ok.status, 0, ok.stderr);
        const row = JSON.parse(fs.readFileSync(path.join(output, 'source-backed-documentation-coverage-report.json'))).rows[0];
        assert.equal(row.coverageBasis, 'validated-source-sections');
        assert.equal(row.sourceCoverage[0].implementationState, 'SCHEMA_DEFINED');
        const shared = structuredClone(baseline);
        shared.documents[0].sourceCoverage = [];
        shared.documents[0].sourceOwnership = [{ modulePath: '.', implementationState: 'SCHEMA_DEFINED',
            anchor: 'section-1', evidence, rationale: 'This selected schema capability is explained by its canonical shared guide rather than duplicated into a separate article. This is an ownership mapping, not live acceptance.' }];
        assert.equal(run(shared).status, 0);
        const mapped = JSON.parse(fs.readFileSync(path.join(output, 'source-backed-documentation-coverage-report.json'))).rows[0];
        assert.equal(mapped.classification, 'shared-guide-mapped');
        assert.equal(mapped.coverageBasis, 'owner-reviewed-reference');
        assert.deepEqual(mapped.sourceCoverage, []);
        for (const change of [
            value => value.documents[0].sourceOwnership = {},
            value => value.documents[0].sourceOwnership[0].anchor = 'missing',
            value => value.documents[0].sourceOwnership[0].modulePath = '..',
            value => value.documents[0].sourceOwnership[0].implementationState = 'LIVE_ACCEPTED',
            value => value.documents[0].sourceOwnership[0].rationale = 'Too short',
            value => value.documents[0].sourceOwnership[0].evidence = [evidence[0], evidence[0]],
            value => value.documents[0].sourceOwnership[0].evidence[0] = 'src/service/missing.js',
            value => value.documents[0].sourceEvidence = [],
        ]) {
            const invalid = structuredClone(shared);
            change(invalid);
            const result = run(invalid);
            assert.notEqual(result.status, 0);
            assert.match(result.stderr, /Invalid sourceOwnership/);
        }
        for (const change of [
            value => value.documents[0].sourceCoverage[0].anchors.push('section-1'),
            value => value.documents[0].sourceCoverage[0].anchors[0] = 'absent',
            value => value.documents[0].sourceCoverage[0].modulePath = '..',
            value => value.documents[0].sourceCoverage[0].implementationState = 'LIVE_ACCEPTED',
            value => value.documents[0].sourceCoverage[0].evidence[0] = 'src/service/missing.js',
            value => value.documents[0].sourceEvidence = [],
            value => value.documents[0].blocks = blocks.filter(block => block.kind !== 'diagram'),
            value => value.documents[0].blocks = blocks.filter(block => block.kind !== 'table'),
            value => value.documents[0].blocks.forEach(block => { if (block.kind === 'paragraph') block.text = 'Too shallow'; }),
        ]) {
            const invalid = structuredClone(baseline);
            change(invalid);
            const result = run(invalid);
            assert.notEqual(result.status, 0);
            assert.match(result.stderr, /Invalid sourceCoverage/);
        }
        fs.writeFileSync(path.join(root, 'outside.js'), 'module.exports = {};');
        fs.symlinkSync(path.join(root, 'outside.js'), path.join(owner, 'src/service/escaped.js'));
        const escaped = structuredClone(baseline);
        escaped.documents[0].sourceEvidence.push('src/service/escaped.js');
        escaped.documents[0].sourceCoverage[0].evidence[0] = 'src/service/escaped.js';
        assert.notEqual(run(escaped).status, 0, 'realpath escape must fail');
        const escapedMapping = structuredClone(shared);
        escapedMapping.documents[0].sourceEvidence.push('src/service/escaped.js');
        escapedMapping.documents[0].sourceOwnership[0].evidence[0] = 'src/service/escaped.js';
        assert.notEqual(run(escapedMapping).status, 0, 'shared mapping realpath escape must fail');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});
