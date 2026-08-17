/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderAnswersTemplateContract
 * @description Proves beginner Builder answer templates can be created from simple flags, written safely as one guided-request JSON file, and delegated to dry-run planning without hand-authored JSON.
 * @layer test
 * @owner nTooling
 * @override Future interactive Builder surfaces must preserve the same guided-request schema, safe write rules, and dry-run delegation.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const contractService = require('../src/service/applicationBuilder/defaultApplicationBuilderContractService');
const guidedService = require('../src/service/applicationBuilder/defaultApplicationBuilderGuidedService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const catalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });

const answers = guidedService.createAnswersTemplate({
    projectCode: 'acmeMobile',
    customerCode: 'acme',
    displayName: 'Acme Mobile',
    preset: 'telco',
    country: 'AE',
    locale: 'en-AE',
    currency: 'AED',
    frontends: ['AGORA', 'AXIS'],
    sampleData: true,
    outputRoot: '/workspace/generated/acmeMobile',
    approvalReference: 'CHANGE-1234'
});

assert.strictEqual(contractService.validateDocument('guided', answers).valid, true,
    'Answer template must satisfy the guided request schema');
assert.strictEqual(answers.preset, 'telco', 'Answer template must preserve the beginner preset');
assert.deepStrictEqual(answers.frontends, ['AGORA', 'AXIS'],
    'Answer template must preserve selected frontends only');

const dryRun = guidedService.dryRun(answers, catalogue);
assert.strictEqual(dryRun.dryRun, true, 'Generated answers must delegate to dry-run planning');
assert(dryRun.dryRunPlan.selectedResult.transitiveBackendDependencies.includes('electronics'),
    'Generated Telco answers must still explain Electronics dependency resolution');
assert.deepStrictEqual(dryRun.dryRunPlan.selectedResult.dataPacks, ['agora.common', 'agora.telco'],
    'Generated Telco answers must not select Electronics data');

const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-answers-'));
const answersPath = path.join(tempParent, 'acme-mobile-answers.json');
const canonicalAnswersPath = path.join(fs.realpathSync(tempParent), 'acme-mobile-answers.json');
const artifact = guidedService.writeAnswersTemplate(answersPath, answers, { protectedRoots: [frameworkRoot, expRoot, kickoffRoot] });
assert.strictEqual(artifact.path, canonicalAnswersPath, 'Answer template write must target the canonical explicit absent file');
assert.strictEqual(contractService.validateDocument('guided',
    JSON.parse(fs.readFileSync(answersPath, 'utf8'))).valid, true,
'Persisted answers template must remain a valid guided request');
assert.throws(() => guidedService.writeAnswersTemplate(answersPath, answers),
    /must be absent/, 'Answer template write must reject overwriting existing files');
assert.throws(() => guidedService.writeAnswersTemplate(path.join(frameworkRoot, 'answers.json'), answers, {
    protectedRoots: [frameworkRoot]
}), /protected root|output parent/, 'Answer template write must reject protected repository roots');

const commands = toolingCommandService.loadCommands(frameworkRoot);
assert.strictEqual(commands['builder:answers-template'].operation, 'answers-template',
    'WP-B11 must expose beginner answers-template operation');
assert.strictEqual(commands['builder:answers-template'].handler, '@nTooling/application-builder',
    'Builder answers-template must use the governed application-builder adapter');

const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
const cliResult = JSON.parse(childProcess.execFileSync(process.execPath,
    [cli, 'builder:answers-template', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
        '--project-code=acmeMobile', '--customer-code=acme', '--display-name=Acme Mobile',
        '--preset=telco', '--country=AE', '--locale=en-AE', '--currency=AED',
        '--frontends=AGORA,AXIS', '--sample-data=true',
        '--output-root=/workspace/generated/acmeMobile', '--approval-reference=CHANGE-1234',
        '--dry-run=true'],
    { cwd: frameworkRoot, encoding: 'utf8' }));
assert.strictEqual(cliResult.operation, 'answers-template',
    'Governed CLI must expose answer-template operation');
assert.strictEqual(contractService.validateDocument('guided', cliResult.answers).valid, true,
    'Governed CLI answer template must satisfy the guided schema');
assert.strictEqual(cliResult.dryRunResult.dryRun, true,
    'Governed CLI answer-template must delegate to dry-run when requested');

const cliAnswersPath = path.join(tempParent, 'acme-mobile-cli-answers.json');
const cliPersisted = JSON.parse(childProcess.execFileSync(process.execPath,
    [cli, 'builder:answers-template', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
        '--project-code=acmeMobile', '--customer-code=acme', '--preset=telco',
        '--frontends=AGORA,AXIS', '--output=' + cliAnswersPath],
    { cwd: frameworkRoot, encoding: 'utf8' }));
assert.strictEqual(cliPersisted.writePerformed, true,
    'Governed CLI must write one answers file when --output is supplied');
assert.strictEqual(fs.existsSync(cliAnswersPath), true,
    'Governed CLI must create the requested answers file');
assert.strictEqual(contractService.validateDocument('guided',
    JSON.parse(fs.readFileSync(cliAnswersPath, 'utf8'))).valid, true,
'Governed CLI persisted answers must satisfy the guided schema');

console.log('Application Builder WP-B11 beginner answers-template contract validated');
