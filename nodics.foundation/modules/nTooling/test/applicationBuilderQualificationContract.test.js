/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderQualificationContract
 * @description Proves Builder qualification converts generated locks from NOT_RUN to evidence-backed status through artifact, security, self-test, reference-workspace, CLI, and tamper-failure gates.
 * @layer test
 * @owner nTooling
 * @override Future full-runtime qualification must extend these gates without weakening lock binding, generated-skeleton scope honesty, or command allowlisting.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const contractService = require('../src/service/applicationBuilder/defaultApplicationBuilderContractService');
const generationService = require('../src/service/applicationBuilder/defaultApplicationBuilderGenerationService');
const planningService = require('../src/service/applicationBuilder/defaultApplicationBuilderPlanningService');
const qualificationService = require('../src/service/applicationBuilder/defaultApplicationBuilderQualificationService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const agoraRoot = path.join(expRoot, 'nodics.agora.apparel');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder', 'valid');
const referenceEvidencePath = path.join(workspaceRoot, 'actionsRepo', 'Agora',
    'nodics-multi-domain-qualification-evidence-2026-08-15.md');
const hasReferenceEvidence = fs.existsSync(referenceEvidencePath);
const catalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });
const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-wp-b6-'));

/** Loads one solution fixture. */
function loadSolution(fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixtureRoot, fileName), 'utf8'));
}

/** Creates an approved plan under a stable WP-B6 clock. */
function approve(solution, reference) {
    return generationService.approvePlan(planningService.createPlan(solution, catalogue, {
        createdAt: '2026-08-16T11:00:00.000Z', expiresAt: '2099-08-17T11:00:00.000Z'
    }), reference, '2026-08-16T11:05:00.000Z');
}

try {
    const solution = loadSolution('solution-combined.json');
    const approved = approve(solution, 'WP-B6-referenceCombined');
    const outputRoot = path.join(tempParent, solution.identity.projectCode);
    generationService.generate(approved, solution, catalogue, outputRoot, { now: '2026-08-16T11:10:00.000Z' });
    const initialLock = JSON.parse(fs.readFileSync(path.join(outputRoot, 'solution-lock.json'), 'utf8'));
    assert.strictEqual(initialLock.qualification.state, 'NOT_RUN',
        'Generated lock must start with NOT_RUN qualification');
    assert.strictEqual(initialLock.qualification.scope, 'GENERATED_SKELETON',
        'Generated lock must state its initial scope honestly');

    const qualificationOptions = { now: '2026-08-16T11:20:00.000Z' };
    if (hasReferenceEvidence) {
        qualificationOptions.referenceEvidencePath = referenceEvidencePath;
    }
    const result = qualificationService.qualify(approved, solution, catalogue, outputRoot, qualificationOptions);
    assert.strictEqual(result.qualified, true, 'Qualification must pass for an intact generated output');
    assert.strictEqual(result.scope, 'FULL_GENERATED_APPLICATION',
        'Passing generated backend and storefront runtime probes must qualify full generated application scope');
    assert(result.gates.includes('backend.graph'), 'Qualification must include backend graph evidence');
    assert(result.gates.includes('frontend.composition'), 'Qualification must include frontend composition evidence');
    assert(result.gates.includes('customer.ownership'), 'Qualification must include customer ownership evidence');
    assert(result.gates.includes('security.boundary'), 'Qualification must include security boundary evidence');
    assert(result.gates.includes('generated.handoff'), 'Qualification must include generated handoff evidence');
    assert(result.gates.includes('generated.self-test'), 'Qualification must include generated self-test evidence');
    assert(result.gates.includes('generated.runtime'), 'Qualification must include generated runtime evidence');
    if (hasReferenceEvidence) {
        assert(result.gates.includes('reference.workspace.nine-runtimes'),
            'Qualification must attach the fresh-database nine-runtime reference evidence');
    } else {
        assert(!result.gates.includes('reference.workspace.nine-runtimes'),
            'Qualification must not invent missing reference workspace evidence');
    }
    const report = JSON.parse(fs.readFileSync(path.join(outputRoot, result.reportPath), 'utf8'));
    assert.strictEqual(contractService.validateDocument('qualification', report).valid, true,
        'Qualification report must satisfy its schema');
    assert.strictEqual(fs.existsSync(path.join(outputRoot, result.summaryPath)), true,
        'Qualification must write a human-readable summary beside the JSON report');
    const summary = fs.readFileSync(path.join(outputRoot, result.summaryPath), 'utf8');
    assert(summary.includes('Builder qualification summary'),
        'Qualification summary must be human-readable');
    assert(summary.includes('generated.handoff'),
        'Qualification summary must include the handoff gate state');
    const nextLock = JSON.parse(fs.readFileSync(path.join(outputRoot, 'solution-lock.json'), 'utf8'));
    assert.strictEqual(nextLock.qualification.state, 'PASSED',
        'Qualification must update the generated solution lock');
    assert.strictEqual(nextLock.qualification.evidenceDigest, report.evidenceDigest,
        'Lock must carry the report evidence digest');

    const fullGeneratedOutput = path.join(tempParent, 'full-generated-only');
    generationService.generate(approved, solution, catalogue, fullGeneratedOutput, {
        now: '2026-08-16T11:10:00.000Z'
    });
    const fullGeneratedResult = qualificationService.qualify(approved, solution, catalogue, fullGeneratedOutput, {
        now: '2026-08-16T11:25:00.000Z'
    });
    assert.strictEqual(fullGeneratedResult.scope, 'FULL_GENERATED_APPLICATION',
        'Qualification without external reference evidence may still pass full generated application runtime scope');
    assert(!fullGeneratedResult.gates.includes('reference.workspace.nine-runtimes'),
        'Generated application qualification must not invent reference workspace evidence');

    const tamperedOutput = path.join(tempParent, 'tampered');
    generationService.generate(approved, solution, catalogue, tamperedOutput, { now: '2026-08-16T11:10:00.000Z' });
    const graphPath = path.join(tamperedOutput, 'backend', 'generated',
        solution.identity.projectCode + '-module-graph.json');
    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    graph.capabilities = graph.capabilities.filter(code => code !== 'telco');
    fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2) + '\n');
    const tamperedResult = qualificationService.qualify(approved, solution, catalogue, tamperedOutput, {
        now: '2026-08-16T11:30:00.000Z',
        executeCommands: false
    });
    assert.strictEqual(tamperedResult.state, 'FAILED',
        'Tampered generated artifacts must fail qualification');
    const tamperedLock = JSON.parse(fs.readFileSync(path.join(tamperedOutput, 'solution-lock.json'), 'utf8'));
    assert.strictEqual(tamperedLock.qualification.state, 'FAILED',
        'Failed qualification must be reflected in the generated lock');

    const cliSolution = loadSolution('solution-commerce.json');
    const cliPlan = approve(cliSolution, 'WP-B6-CLI');
    const cliOutput = path.join(tempParent, 'cli-commerce');
    generationService.generate(cliPlan, cliSolution, catalogue, cliOutput, { now: '2026-08-16T11:10:00.000Z' });
    const cliPlanPath = path.join(tempParent, 'cli-approved-plan.json');
    fs.writeFileSync(cliPlanPath, JSON.stringify(cliPlan, null, 2));
    const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
    const cliArgs = [cli, 'builder:qualify', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
        '--solution=' + path.join(fixtureRoot, 'solution-commerce.json'), '--plan=' + cliPlanPath,
        '--output=' + cliOutput];
    if (hasReferenceEvidence) {
        cliArgs.push('--reference-evidence=' + referenceEvidencePath);
    }
    const cliResult = JSON.parse(childProcess.execFileSync(process.execPath,
        cliArgs,
        { cwd: frameworkRoot, encoding: 'utf8' }));
    assert.strictEqual(cliResult.qualified, true, 'Governed CLI must qualify generated Builder output');

    const commands = toolingCommandService.loadCommands(frameworkRoot);
    assert.strictEqual(commands['builder:qualify'].operation, 'qualify',
        'WP-B6 must expose governed Builder qualification');
    assert.strictEqual(commands['builder:qualify'].handler, '@nTooling/application-builder',
        'Builder qualification must use the governed application-builder adapter');
} finally {
    fs.rmSync(tempParent, { recursive: true, force: true });
}

console.log('Application Builder WP-B6 qualification contract validated');
