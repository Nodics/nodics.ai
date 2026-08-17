/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderGuidedContract
 * @description Proves beginner-facing Builder answers create governed solution and plan documents without requiring Nodics module knowledge or writing project files.
 * @layer test
 * @owner nTooling
 * @override Future interactive Builder surfaces must preserve preset translation, corrective diagnostics, plan delegation, and no-write guided behavior.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const contractService = require('../src/service/applicationBuilder/defaultApplicationBuilderContractService');
const guidedService = require('../src/service/applicationBuilder/defaultApplicationBuilderGuidedService');
const planningService = require('../src/service/applicationBuilder/defaultApplicationBuilderPlanningService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const agoraRoot = path.join(expRoot, 'nodics.agora');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder');
const catalogue = catalogueService.discover({ framework: frameworkRoot, agora: agoraRoot, kickoff: kickoffRoot });
const expCatalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });

/** Loads one Builder fixture. */
function fixture(state, fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixtureRoot, state, fileName), 'utf8'));
}

const request = fixture('valid', 'guided-request-telco.json');
const result = guidedService.guide(request, catalogue, {
    createdAt: '2026-08-16T12:00:00.000Z',
    expiresAt: '2099-08-17T12:00:00.000Z'
});

assert.strictEqual(result.guided, true, 'Guided Builder must identify beginner-friendly output');
assert.strictEqual(result.writePerformed, false, 'Guided Builder must not write project files');
assert.strictEqual(result.solution.identity.projectCode, 'acmeMobile',
    'Guided Builder must preserve beginner project identity');
assert.deepStrictEqual(result.solution.capabilities.selected, ['nodics.commerce', 'telco'],
    'Guided Telco preset must select only Commerce and Telco explicitly');
assert.deepStrictEqual(result.solution.capabilities.domains, ['TELCO'],
    'Guided Telco preset must activate only the Telco experience domain');
assert(result.plan.backendGraph.nodes.includes('electronics'),
    'Guided Telco plan must resolve Electronics transitively without asking the user');
assert.deepStrictEqual(result.solution.data.packs, ['agora.common', 'agora.telco'],
    'Guided Telco preset must not add an Electronics customer data pack');
assert(result.summary.nextCommands.some(command => command.includes('builder:approve')),
    'Guided Builder must provide the next approval command in beginner language');
assert(result.summary.beginnerNotes.some(note => note.includes('do not need to know Nodics module names')),
    'Guided Builder must explicitly hide module internals from beginner workflow');

const validation = planningService.validateSolution(result.solution, catalogue);
assert.strictEqual(validation.valid, true, validation.errors.join('\n'));
const uiResult = guidedService.guide(request, expCatalogue, {
    createdAt: '2026-08-16T12:00:00.000Z',
    expiresAt: '2099-08-17T12:00:00.000Z'
});
assert.deepStrictEqual(uiResult.solution, result.solution,
    'Guided Builder must produce the same solution when Agora is resolved through nodics.exp');

const reviewParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-guide-'));
const reviewRoot = path.join(reviewParent, 'acme-mobile-review');
const canonicalReviewRoot = path.join(fs.realpathSync(reviewParent), 'acme-mobile-review');
const persisted = guidedService.guide(request, expCatalogue, {
    createdAt: '2026-08-16T12:00:00.000Z',
    expiresAt: '2099-08-17T12:00:00.000Z',
    workspaceRoot: reviewRoot,
    protectedRoots: [frameworkRoot, expRoot, kickoffRoot]
});
assert.strictEqual(persisted.writePerformed, true,
    'Guided Builder must report review artifact writes when --workspace is supplied');
assert.strictEqual(persisted.workspaceRoot, canonicalReviewRoot,
    'Guided Builder must preserve the canonical explicit review workspace root');
assert.deepStrictEqual(persisted.artifacts.map(artifact => artifact.path).sort(),
    ['beginner-summary.md', 'builder-guide-report.json', 'generation-plan.json', 'guided-answers.json',
        'solution.json'],
    'Guided Builder must write only governed review artifacts');
assert.strictEqual(fs.existsSync(path.join(reviewRoot, 'solution.json')), true,
    'Guided Builder must persist the review solution document');
assert.strictEqual(contractService.validateDocument('solution',
    JSON.parse(fs.readFileSync(path.join(reviewRoot, 'solution.json'), 'utf8'))).valid, true,
    'Persisted guided solution must satisfy the Application Builder contract');
const persistedPlan = JSON.parse(fs.readFileSync(path.join(reviewRoot, 'generation-plan.json'), 'utf8'));
assert.strictEqual(contractService.validateDocument('plan', persistedPlan).valid, true,
    'Persisted guided generation plan must satisfy the Application Builder contract');
assert.strictEqual(persistedPlan.approval.state, 'PENDING',
    'Persisted guided generation plan must remain approval-required');
const persistedSummary = fs.readFileSync(path.join(reviewRoot, 'beginner-summary.md'), 'utf8');
assert(persistedSummary.includes('Nodics Application Builder review'),
    'Persisted guided summary must be beginner-readable Markdown');
assert(persistedSummary.includes('builder:approve'),
    'Persisted guided summary must include the next approval command');
const persistedReport = JSON.parse(fs.readFileSync(path.join(reviewRoot, 'builder-guide-report.json'), 'utf8'));
assert.strictEqual(persistedReport.writeScope, 'GUIDED_REVIEW_ONLY',
    'Persisted guided report must identify review-only writes');
assert.strictEqual(persistedReport.generatedApplication, false,
    'Persisted guided report must not describe application generation');

assert.throws(() => guidedService.guide(request, expCatalogue, { workspaceRoot: 'relative-review' }),
    /absolute path/, 'Guided Builder must reject relative review workspaces');
assert.throws(() => guidedService.guide(request, expCatalogue, { workspaceRoot: reviewRoot }),
    /must be absent/, 'Guided Builder must reject an existing review workspace');
assert.throws(() => guidedService.guide(request, expCatalogue, {
    workspaceRoot: frameworkRoot,
    protectedRoots: [frameworkRoot]
}), /protected root/, 'Guided Builder must reject protected review roots');

assert.throws(() => guidedService.guide(fixture('invalid', 'guided-request-no-agora.json'), catalogue),
    /Guided Builder requires AGORA/, 'Guided Builder must give corrective missing-storefront diagnostics');

const commands = toolingCommandService.loadCommands(frameworkRoot);
assert.strictEqual(commands['builder:guide'].operation, 'guide',
    'WP-B7 must expose the beginner guided command');
assert.strictEqual(commands['builder:guide'].handler, '@nTooling/application-builder',
    'Builder guide must use the governed application-builder adapter');

const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
const cliResult = JSON.parse(childProcess.execFileSync(process.execPath,
    [cli, 'builder:guide', '--agora=' + agoraRoot, '--kickoff=' + kickoffRoot,
        '--answers=' + path.join(fixtureRoot, 'valid', 'guided-request-telco.json')],
    { cwd: frameworkRoot, encoding: 'utf8' }));
assert.strictEqual(cliResult.guided, true, 'Governed CLI must expose guided Builder output');
assert.strictEqual(cliResult.solution.experience.composition, 'telco',
    'Governed CLI must generate the Telco solution from beginner answers');
const uiCliResult = JSON.parse(childProcess.execFileSync(process.execPath,
    [cli, 'builder:guide', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
        '--answers=' + path.join(fixtureRoot, 'valid', 'guided-request-telco.json')],
    { cwd: frameworkRoot, encoding: 'utf8' }));
assert.strictEqual(uiCliResult.solution.experience.composition, 'telco',
    'Governed CLI must resolve Agora through nodics.exp for beginner guided output');
assert(uiCliResult.plan.frontendGraph.nodes.includes('agora.telco'),
    'UI-resolved guided plan must keep Agora frontend graph semantics');

const cliReviewRoot = path.join(reviewParent, 'acme-mobile-cli-review');
const cliPersistedResult = JSON.parse(childProcess.execFileSync(process.execPath,
    [cli, 'builder:guide', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
        '--answers=' + path.join(fixtureRoot, 'valid', 'guided-request-telco.json'),
        '--workspace=' + cliReviewRoot],
    { cwd: frameworkRoot, encoding: 'utf8' }));
assert.strictEqual(cliPersistedResult.writePerformed, true,
    'Governed CLI must persist guided review artifacts when --workspace is supplied');
assert.strictEqual(fs.existsSync(path.join(cliReviewRoot, 'beginner-summary.md')), true,
    'Governed CLI must write the guided beginner summary artifact');

console.log('Application Builder WP-B8 guided beginner review contract validated');
