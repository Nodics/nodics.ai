/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderEndToEndJourneyContract
 * @description Proves the beginner Builder path from questionnaire through dry-run, review, approval, generation, and qualification for Telco and Combined domain journeys.
 * @layer test
 * @owner nTooling
 * @override Future Builder UX layers must delegate to this governed journey rather than bypassing answer, approval, generation, lock, handoff, and qualification gates.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const contractService = require('../src/service/applicationBuilder/defaultApplicationBuilderContractService');
const generationService = require('../src/service/applicationBuilder/defaultApplicationBuilderGenerationService');
const guidedService = require('../src/service/applicationBuilder/defaultApplicationBuilderGuidedService');
const qualificationService = require('../src/service/applicationBuilder/defaultApplicationBuilderQualificationService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const catalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });
const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-wp-b15-'));

const cases = [{
    projectCode: 'acmeMobile',
    customerCode: 'acme',
    displayName: 'Acme Mobile',
    preset: 'telco',
    frontends: 'AGORA,AXIS',
    expectedDomains: ['TELCO'],
    expectedPacks: ['agora.common', 'agora.telco']
}, {
    projectCode: 'acmeMarketplace',
    customerCode: 'acme',
    displayName: 'Acme Marketplace',
    preset: 'combined',
    frontends: 'AGORA,AXIS,NEXUS',
    expectedDomains: ['APPAREL', 'ELECTRONICS', 'TELCO'],
    expectedPacks: ['agora.apparel', 'agora.common', 'agora.electronics', 'agora.telco', 'nexus.web']
}];

/**
 * Runs the complete beginner journey for one case.
 * @param {Object} testCase Case configuration.
 * @returns {Promise<void>}
 */
async function runJourney(testCase) {
    const outputRoot = path.join(tempParent, testCase.projectCode + '-generated');
    const reviewRoot = path.join(tempParent, testCase.projectCode + '-review');
    const answers = await guidedService.runQuestionnaire({ scriptedAnswers: [
        testCase.projectCode,
        testCase.customerCode,
        testCase.displayName,
        testCase.preset,
        'AE',
        'en-AE',
        'AED',
        testCase.frontends,
        'yes',
        outputRoot,
        'WP-B15-' + testCase.projectCode
    ] });
    assert.strictEqual(contractService.validateDocument('guided', answers).valid, true,
        'Questionnaire must produce valid guided answers for ' + testCase.projectCode);

    const dryRun = guidedService.dryRun(answers, catalogue, {
        createdAt: '2026-08-16T15:00:00.000Z',
        expiresAt: '2099-08-17T15:00:00.000Z'
    });
    assert.strictEqual(dryRun.dryRunPlan.safety.mode, 'READ_ONLY_PLAN',
        'Dry run must stay read-only for ' + testCase.projectCode);
    assert.deepStrictEqual(dryRun.dryRunPlan.selectedResult.activeDomains, testCase.expectedDomains,
        'Dry run must show the selected active domains for ' + testCase.projectCode);
    assert.deepStrictEqual(dryRun.dryRunPlan.selectedResult.dataPacks.slice().sort(), testCase.expectedPacks,
        'Dry run must show the selected data packs for ' + testCase.projectCode);

    const review = guidedService.guide(answers, catalogue, {
        createdAt: '2026-08-16T15:00:00.000Z',
        expiresAt: '2099-08-17T15:00:00.000Z',
        workspaceRoot: reviewRoot,
        protectedRoots: [frameworkRoot, expRoot, kickoffRoot]
    });
    assert.strictEqual(review.writePerformed, true,
        'Guide review must write review artifacts for ' + testCase.projectCode);
    assert.strictEqual(fs.existsSync(path.join(reviewRoot, 'beginner-summary.md')), true,
        'Guide review must include beginner summary for ' + testCase.projectCode);

    const approved = generationService.approvePlan(review.plan, 'WP-B15-' + testCase.projectCode,
        '2026-08-16T15:05:00.000Z');
    const generation = generationService.generate(approved, review.solution, catalogue, outputRoot, {
        now: '2026-08-16T15:10:00.000Z',
        protectedRoots: [frameworkRoot, expRoot, kickoffRoot]
    });
    assert.strictEqual(generation.generated, true,
        'Approved plan must generate output for ' + testCase.projectCode);
    assert.strictEqual(fs.existsSync(path.join(outputRoot, 'README.md')), true,
        'Generated output must include README handoff for ' + testCase.projectCode);
    assert.strictEqual(fs.existsSync(path.join(outputRoot, 'builder-handoff.json')), true,
        'Generated output must include machine-readable handoff for ' + testCase.projectCode);

    const qualification = qualificationService.qualify(approved, review.solution, catalogue, outputRoot, {
        now: '2026-08-16T15:20:00.000Z'
    });
    assert.strictEqual(qualification.qualified, true,
        'Generated output must qualify for ' + testCase.projectCode);
    assert.strictEqual(qualification.scope, 'FULL_GENERATED_APPLICATION',
        'Qualified generated output must prove runtime probes for ' + testCase.projectCode);
    assert(qualification.gates.includes('generated.handoff'),
        'Qualification must include the generated handoff gate for ' + testCase.projectCode);
    assert.strictEqual(fs.existsSync(path.join(outputRoot, qualification.summaryPath)), true,
        'Qualification must include human summary for ' + testCase.projectCode);
}

(async () => {
    try {
        for (const testCase of cases) {
            await runJourney(testCase);
        }
        console.log('Application Builder WP-B15 beginner end-to-end journey contract validated');
    } finally {
        fs.rmSync(tempParent, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
});
