/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderQuestionnaireContract
 * @description Proves the beginner Application Builder questionnaire collects one answer at a time, creates governed guided answers, and delegates to dry-run planning without generated application writes.
 * @layer test
 * @owner nTooling
 * @override Future UI or conversational Builder wrappers must preserve this questionnaire-to-answers-to-dry-run delegation contract.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const contractService = require('../src/service/applicationBuilder/defaultApplicationBuilderContractService');
const guidedService = require('../src/service/applicationBuilder/defaultApplicationBuilderGuidedService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');

/**
 * Runs the questionnaire service with in-memory input.
 * @param {string[]} answers Ordered answer lines.
 * @returns {Promise<Object>} Guided answers document.
 */
async function collectAnswers(answers) {
    return guidedService.runQuestionnaire({ scriptedAnswers: answers });
}

(async () => {
    const answers = await collectAnswers([
        'acmeMobile',
        'acme',
        'Acme Mobile',
        'telco',
        'AE',
        'en-AE',
        'AED',
        'AGORA,AXIS',
        'yes',
        '/workspace/generated/acmeMobile',
        'CHANGE-1234'
    ]);
    assert.strictEqual(contractService.validateDocument('guided', answers).valid, true,
        'Questionnaire answers must produce a valid guided request');
    assert.strictEqual(answers.project.projectCode, 'acmeMobile',
        'Questionnaire must preserve typed project code');
    assert.strictEqual(answers.preset, 'telco',
        'Questionnaire must preserve typed preset');
    assert.deepStrictEqual(answers.frontends, ['AGORA', 'AXIS'],
        'Questionnaire must parse comma-separated frontends');
    assert.strictEqual(answers.sampleData, true,
        'Questionnaire must normalize yes/no sample-data answers');

    const defaulted = await collectAnswers(['', '', '', '', '', '', '', '', '', '', '']);
    assert.strictEqual(contractService.validateDocument('guided', defaulted).valid, true,
        'Questionnaire defaults must produce a valid guided request');
    assert.strictEqual(defaulted.preset, 'commerce',
        'Questionnaire defaults must support a Commerce beginner path');

    const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-questionnaire-'));
    const cliAnswersPath = path.join(tempParent, 'acme-mobile-questionnaire.json');
    const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
    const input = [
        'acmeMobile',
        'acme',
        'Acme Mobile',
        'telco',
        'AE',
        'en-AE',
        'AED',
        'AGORA,AXIS',
        'yes',
        '/workspace/generated/acmeMobile',
        'CHANGE-1234',
        ''
    ].join('\n');
    const cliResult = JSON.parse(childProcess.execFileSync(process.execPath,
        [cli, 'builder:questionnaire', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
            '--output=' + cliAnswersPath, '--dry-run=true'],
        { cwd: frameworkRoot, encoding: 'utf8', input: input }));
    assert.strictEqual(cliResult.operation, 'questionnaire',
        'Governed CLI must expose questionnaire operation');
    assert.strictEqual(cliResult.writePerformed, true,
        'Questionnaire CLI must write one answers file when --output is supplied');
    assert.strictEqual(fs.existsSync(cliAnswersPath), true,
        'Questionnaire CLI must create the requested answers file');
    assert.strictEqual(contractService.validateDocument('guided',
        JSON.parse(fs.readFileSync(cliAnswersPath, 'utf8'))).valid, true,
    'Questionnaire persisted answers must satisfy the guided schema');
    assert.strictEqual(cliResult.dryRunResult.dryRun, true,
        'Questionnaire CLI must delegate to dry run when requested');
    assert(cliResult.dryRunResult.dryRunPlan.selectedResult.transitiveBackendDependencies.includes('electronics'),
        'Questionnaire Telco dry run must explain Electronics backend dependency');
    assert.strictEqual(cliResult.dryRunResult.writePerformed, false,
        'Questionnaire dry run must not generate application files');

    const commands = toolingCommandService.loadCommands(frameworkRoot);
    assert.strictEqual(commands['builder:questionnaire'].operation, 'questionnaire',
        'WP-B12 must expose beginner questionnaire operation');
    assert.strictEqual(commands['builder:questionnaire'].handler, '@nTooling/application-builder',
        'Builder questionnaire must use the governed application-builder adapter');

    console.log('Application Builder WP-B12 beginner questionnaire contract validated');
})().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
});
