/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.docs/test/sourceCoverageScope @description Proves coverage is independent of sibling customers and writes selected project evidence only to explicit project output. @layer test @owner nodics.docs */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const source = new URL('../scripts/audit-source-coverage.mjs', import.meta.url);
function write(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
}
test('framework scope is stable with arbitrary sibling projects; selected project evidence uses its own catalogue', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-coverage-scope-'));
    try {
        const framework = path.join(home, 'framework'),
            docs = path.join(framework, 'nodics.docs');
        const script = path.join(docs, 'scripts/audit-source-coverage.mjs');
        write(script, fs.readFileSync(source, 'utf8'));
        write(path.join(docs, 'docs/catalogue.json'), { documents: [], release: 'test' });
        write(path.join(framework, 'foundation/package.json'), {
            name: 'foundation',
            nodics: { kind: 'group' },
        });
        write(path.join(framework, 'foundation/src/service/defaultTestService.js'), 'module.exports = {};');
        const run = (args) => execFileSync(process.execPath, [script, ...args], { encoding: 'utf8' });
        run([]);
        const reportPath = path.join(docs, 'docs/reports/source-backed-documentation-coverage-report.json');
        const baseline = fs.readFileSync(reportPath, 'utf8');
        for (const name of ['nodics.kickoff', 'unrelated-customer'])
            write(path.join(home, name, 'package.json'), { name, nodics: { kind: 'application' } });
        run(['--check']);
        assert.equal(fs.readFileSync(reportPath, 'utf8'), baseline);
        const customer = path.join(home, 'unrelated-customer');
        write(path.join(customer, 'docs/catalogue.json'), {
            documents: [
                { id: 'customer', title: 'Customer', content: 'docs/page.md', sourceEvidence: ['.'] },
            ],
            release: 'customer-release',
        });
        write(path.join(customer, 'docs/page.md'), 'Customer-owned guide');
        const args = [
            '--source-root=' + customer,
            '--catalogue=' + path.join(customer, 'docs/catalogue.json'),
            '--output-dir=' + path.join(customer, 'docs/reports'),
        ];
        run(args);
        run([...args, '--check']);
        const report = JSON.parse(
            fs.readFileSync(
                path.join(customer, 'docs/reports/source-backed-documentation-coverage-report.json'),
            ),
        );
        assert.equal(report.release, 'customer-release');
        assert.deepEqual(report.scope, ['']);
        assert.equal(report.summary.totalModules, 1);
        assert.deepEqual(report.documentationBacklog, []);
        assert.equal(fs.readFileSync(reportPath, 'utf8'), baseline);
        assert.notEqual(spawnSync(process.execPath, [script, '--source-root=' + customer]).status, 0);
        assert.notEqual(
            spawnSync(process.execPath, [
                script,
                ...args.slice(0, 2),
                '--output-dir=' + path.join(docs, 'docs/reports'),
            ]).status,
            0,
        );
        assert.equal(fs.readFileSync(reportPath, 'utf8'), baseline);
    } finally {
        fs.rmSync(home, { recursive: true, force: true });
    }
});
