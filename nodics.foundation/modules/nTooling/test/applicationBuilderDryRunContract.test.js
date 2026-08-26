/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderDryRunContract
 * @description Proves beginner-facing Builder dry-run planning maps plain guided answers to backend, frontend, and data outputs without writing files or requiring Nodics module knowledge.
 * @layer test
 * @owner nTooling
 * @override Future Builder UIs may reword the questions, but must delegate to this read-only dry-run contract before generation.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const guidedService = require('../src/service/applicationBuilder/defaultApplicationBuilderGuidedService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder');
const catalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });
const request = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'valid', 'guided-request-telco.json'), 'utf8'));

const result = guidedService.dryRun(request, catalogue, {
    createdAt: '2026-08-16T14:00:00.000Z',
    expiresAt: '2099-08-17T14:00:00.000Z'
});

assert.strictEqual(result.guided, true, 'Dry run must stay on the beginner guided path');
assert.strictEqual(result.dryRun, true, 'Dry run must identify itself explicitly');
assert.strictEqual(result.writePerformed, false, 'Dry run must not write review or generated application files');
assert.strictEqual(result.dryRunPlan.writePerformed, false, 'Dry-run projection must repeat no-write semantics');
assert.strictEqual(result.dryRunPlan.generatedApplication, false,
    'Dry run must not claim generated backend or frontend files');
assert.strictEqual(result.dryRunPlan.safety.mode, 'READ_ONLY_PLAN',
    'Dry run must be reported as a read-only plan');
assert.strictEqual(result.dryRunPlan.safety.generationBlocked, true,
    'Dry run must keep generation blocked until explicit approval');
assert(result.dryRunPlan.beginnerQuestions.some(question => question.id === 'domain' &&
    question.answer === 'Telco commerce storefront'),
'Dry run must explain the selected business-facing domain preset');
assert.deepStrictEqual(result.dryRunPlan.selectedResult.explicitBackendSelections.sort(),
    ['nodics.commerce', 'telco'],
    'Telco dry run must explicitly select only Commerce and Telco from beginner answers');
assert(result.dryRunPlan.selectedResult.transitiveBackendDependencies.includes('electronics'),
    'Telco dry run must show Electronics as backend behavior resolved by dependency');
assert.deepStrictEqual(result.dryRunPlan.selectedResult.activeDomains, ['TELCO'],
    'Telco dry run must activate only the Telco customer experience');
assert.deepStrictEqual(result.dryRunPlan.selectedResult.dataPacks, ['agora.telco'],
    'Telco dry run must not include the Electronics data pack unless the user selected that domain');
assert(!result.dryRunPlan.selectedResult.rendererKeys.includes('agora.electronics.product-card'),
    'Telco dry run must not include Electronics renderers unless the user selected Electronics');
assert.deepStrictEqual(result.dryRunPlan.selectedResult.frontends.map(frontend => frontend.code).sort(),
    ['AGORA', 'AXIS'],
    'Dry run must include only the frontends selected by the beginner answers');
assert(result.dryRunPlan.customerProjectOutputs.backend.includes('backend/src/server.js'),
    'Dry run must show planned backend output without writing it');
assert(result.dryRunPlan.customerProjectOutputs.storefront.includes('storefront/src/server.js'),
    'Dry run must show planned storefront output without writing it');
assert(result.dryRunPlan.ownershipRules.some(rule => rule.includes('framework and domain behavior stays in nodics.ai')),
    'Dry run must teach the ownership boundary in beginner language');

const commands = toolingCommandService.loadCommands(frameworkRoot);
assert.strictEqual(commands['builder:dry-run'].operation, 'dry-run',
    'WP-B10 must expose a beginner dry-run operation');
assert.strictEqual(commands['builder:dry-run'].handler, '@nTooling/application-builder',
    'Builder dry run must use the governed application-builder adapter');

const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
const cliResult = JSON.parse(childProcess.execFileSync(process.execPath,
    [cli, 'builder:dry-run', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
        '--answers=' + path.join(fixtureRoot, 'valid', 'guided-request-telco.json')],
    { cwd: frameworkRoot, encoding: 'utf8' }));
assert.strictEqual(cliResult.dryRun, true, 'Governed CLI must expose dry-run Builder output');
assert.strictEqual(cliResult.dryRunPlan.safety.mode, 'READ_ONLY_PLAN',
    'Governed CLI dry run must preserve read-only safety semantics');
assert(cliResult.dryRunPlan.selectedResult.transitiveBackendDependencies.includes('electronics'),
    'Governed CLI dry run must explain Telco dependency resolution');
assert.strictEqual(cliResult.beginnerWorkflow.currentOperation, 'dry-run',
    'Governed CLI dry run must include beginner workflow guidance');
assert.strictEqual(cliResult.beginnerWorkflow.recommendedNext.operation, 'guide',
    'Governed CLI dry run must recommend the guide/review step next');
assert(cliResult.beginnerWorkflow.steps.some(step => step.operation === 'qualify'),
    'Beginner workflow must lead through final qualification');

console.log('Application Builder WP-B10 beginner dry-run contract validated');
