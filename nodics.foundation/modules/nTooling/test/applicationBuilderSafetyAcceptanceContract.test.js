/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderSafetyAcceptanceContract
 * @description Proves final Application Builder safety acceptance for invalid selections, approval binding, protected output roots, overwrite prevention, and generated data-pack tamper detection.
 * @layer test
 * @owner nTooling
 * @override Future Builder productization must add safety cases without weakening fail-closed validation, explicit approval, absent-root generation, or generated self-test detection.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const generationService = require('../src/service/applicationBuilder/defaultApplicationBuilderGenerationService');
const planningService = require('../src/service/applicationBuilder/defaultApplicationBuilderPlanningService');
const qualificationService = require('../src/service/applicationBuilder/defaultApplicationBuilderQualificationService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const agoraRoot = path.join(expRoot, 'nodics.agora.apparel');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder', 'valid');
const catalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });
const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-safety-'));

/** Loads a valid solution fixture. */
function loadSolution(fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixtureRoot, fileName), 'utf8'));
}

/** Creates an approved plan for the supplied solution. */
function approvedPlan(solution, reference) {
    const plan = planningService.createPlan(solution, catalogue, {
        createdAt: '2026-08-16T18:00:00.000Z',
        expiresAt: '2099-08-17T18:00:00.000Z'
    });
    return generationService.approvePlan(plan, reference, '2026-08-16T18:05:00.000Z');
}

try {
    const electronics = loadSolution('solution-electronics.json');
    const invalidRenderer = JSON.parse(JSON.stringify(electronics));
    invalidRenderer.experience.rendererKeys = ['agora.telco.product-card'];
    assert.strictEqual(planningService.validateSolution(invalidRenderer, catalogue).valid, false,
        'Builder must reject renderer keys outside the selected domain composition');

    const invalidDataPack = JSON.parse(JSON.stringify(electronics));
    invalidDataPack.data.packs.push('agora.telco');
    assert.strictEqual(planningService.validateSolution(invalidDataPack, catalogue).valid, false,
        'Builder must reject data packs that are not required by the selected experience');

    const invalidDomain = JSON.parse(JSON.stringify(electronics));
    invalidDomain.capabilities.domains = ['TELCO'];
    assert.strictEqual(planningService.validateSolution(invalidDomain, catalogue).valid, false,
        'Builder must reject active domains that are absent from the resolved backend graph');

    const pendingPlan = planningService.createPlan(electronics, catalogue, {
        createdAt: '2026-08-16T18:00:00.000Z',
        expiresAt: '2099-08-17T18:00:00.000Z'
    });
    assert.throws(() => generationService.approvePlan(pendingPlan, ''),
        /approval requires a non-empty approval reference/,
    'Builder approval must require an explicit approval reference');
    assert.throws(() => generationService.generate(pendingPlan, electronics, catalogue,
        path.join(tempParent, 'pending-plan-output')),
    /requires an APPROVED plan/, 'Builder generation must reject a pending plan');

    const expiredPlan = planningService.createPlan(electronics, catalogue, {
        createdAt: '2026-08-16T18:00:00.000Z',
        expiresAt: '2026-08-16T18:01:00.000Z'
    });
    assert.throws(() => generationService.approvePlan(expiredPlan, 'WP-C11-EXPIRED',
        '2026-08-16T18:05:00.000Z'), /expired/,
    'Builder must reject approval of expired plans');

    const approved = approvedPlan(electronics, 'WP-C11-referenceElectronics');
    assert.throws(() => generationService.generate(approved, electronics, catalogue, frameworkRoot),
        /protected root|output must be absent/,
    'Builder must reject framework root generation targets');
    assert.throws(() => generationService.generate(approved, electronics, catalogue,
        path.join(tempParent, 'relative-output').replace(tempParent + path.sep, '')),
    /absolute path/, 'Builder generation must require an absolute output root');

    const outputRoot = path.join(tempParent, electronics.identity.projectCode);
    generationService.generate(approved, electronics, catalogue, outputRoot, {
        now: '2026-08-16T18:10:00.000Z',
        protectedRoots: [frameworkRoot, expRoot, kickoffRoot]
    });
    assert.throws(() => generationService.generate(approved, electronics, catalogue, outputRoot),
        /output must be absent/, 'Builder generation must not overwrite an existing generated root');

    const tamperedDataPath = path.join(outputRoot, 'data', 'agora.electronics',
        'products', 'starter-products.json');
    fs.unlinkSync(tamperedDataPath);
    const tampered = qualificationService.qualify(approved, electronics, catalogue, outputRoot, {
        now: '2026-08-16T18:20:00.000Z'
    });
    assert.strictEqual(tampered.state, 'FAILED',
        'Missing generated data-pack files must fail qualification through generated self-test');
    const tamperedReport = JSON.parse(fs.readFileSync(path.join(outputRoot, tampered.reportPath), 'utf8'));
    assert(tamperedReport.evidence.some(entry => entry.gate === 'generated.self-test' && entry.state === 'FAILED'),
        'Generated self-test gate must report data-pack tampering');
} finally {
    fs.rmSync(tempParent, { recursive: true, force: true });
}

console.log('Application Builder WP-C11 safety acceptance contract validated');
