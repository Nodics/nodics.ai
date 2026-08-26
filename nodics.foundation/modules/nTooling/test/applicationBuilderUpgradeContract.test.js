/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderUpgradeContract
 * @description Proves Builder release manifests and upgrade plans are digest-bound, non-mutating, approval-gated, and safe for generated application upgrades.
 * @layer test
 * @owner nTooling
 * @override Future registry integrations must preserve digest verification, current-lock comparison, non-mutating planning, and customer-owned overwrite protection.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const generationService = require('../src/service/applicationBuilder/defaultApplicationBuilderGenerationService');
const planningService = require('../src/service/applicationBuilder/defaultApplicationBuilderPlanningService');
const upgradeService = require('../src/service/applicationBuilder/defaultApplicationBuilderUpgradeService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const agoraRoot = path.join(expRoot, 'nodics.agora.apparel');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder', 'valid');
const catalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });
const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-upgrade-'));

/** Loads one solution fixture. */
function loadSolution(fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixtureRoot, fileName), 'utf8'));
}

/** Creates an approved target plan. */
function approve(solution, reference) {
    return generationService.approvePlan(planningService.createPlan(solution, catalogue, {
        createdAt: '2026-08-16T13:00:00.000Z', expiresAt: '2099-08-17T13:00:00.000Z'
    }), reference, '2026-08-16T13:05:00.000Z');
}

try {
    const currentSolution = loadSolution('solution-commerce.json');
    const targetSolution = loadSolution('solution-apparel.json');
    const currentPlan = approve(currentSolution, 'WP-B9-current-commerce');
    const targetPlan = approve(targetSolution, 'WP-B9-target-apparel');
    const outputRoot = path.join(tempParent, 'current-commerce');
    generationService.generate(currentPlan, currentSolution, catalogue, outputRoot, {
        now: '2026-08-16T13:10:00.000Z'
    });
    const currentLock = JSON.parse(fs.readFileSync(path.join(outputRoot, 'solution-lock.json'), 'utf8'));

    const manifest = upgradeService.createReleaseManifest(targetSolution, targetPlan, catalogue, {
        createdAt: '2026-08-16T13:15:00.000Z',
        releaseChannel: 'LOCAL_TEST',
        signer: 'nodics.test.builder'
    });
    assert.strictEqual(upgradeService.verifyReleaseManifest(manifest).valid, true,
        'Builder release manifest must verify through its local digest signature');
    assert.strictEqual(manifest.artifactPolicy.customerOwnedOverwrite, 'NEVER',
        'Builder release manifest must preserve customer-owned overwrite protection');

    const upgradePlan = upgradeService.createUpgradePlan(currentLock, manifest, targetPlan, targetSolution, catalogue, {
        createdAt: '2026-08-16T13:20:00.000Z'
    });
    assert.strictEqual(upgradePlan.state, 'READY',
        'Builder upgrade plan must be ready when current lock differs from the target release');
    assert.strictEqual(upgradePlan.mutationPerformed, false,
        'Builder upgrade planning must not mutate generated output');
    assert.deepStrictEqual(upgradePlan.diff.packages.added, ['apparel'],
        'Builder upgrade plan must identify the newly required Apparel capability');
    assert.deepStrictEqual(upgradePlan.diff.dataPacks.added, ['agora.apparel'],
        'Builder upgrade plan must identify newly required customer data packs');
    assert.strictEqual(upgradePlan.operations[0].operation, 'VERIFY_CURRENT_LOCK',
        'Builder upgrade plan must start by verifying the current lock');

    const tamperedManifest = JSON.parse(JSON.stringify(manifest));
    tamperedManifest.dataPacks.push('agora.telco');
    const rejected = upgradeService.createUpgradePlan(currentLock, tamperedManifest, targetPlan, targetSolution,
        catalogue);
    assert.strictEqual(rejected.state, 'REJECTED',
        'Builder upgrade plan must reject tampered release manifests');
    assert(rejected.errors.some(error => error.includes('signature digest')),
        'Builder upgrade diagnostics must explain manifest signature failure');

    const noopPlan = upgradeService.createUpgradePlan(currentLock,
        upgradeService.createReleaseManifest(currentSolution, currentPlan, catalogue, {
            createdAt: '2026-08-16T13:25:00.000Z'
        }), currentPlan, currentSolution, catalogue);
    assert.strictEqual(noopPlan.state, 'NOOP',
        'Builder upgrade plan must detect when the current generated output already matches the target');

    const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
    const targetSolutionPath = path.join(fixtureRoot, 'solution-apparel.json');
    const targetPlanPath = path.join(tempParent, 'target-approved-plan.json');
    const releasePath = path.join(tempParent, 'release-manifest.json');
    fs.writeFileSync(targetPlanPath, JSON.stringify(targetPlan, null, 2));
    const releaseOutput = childProcess.execFileSync(process.execPath,
        [cli, 'builder:release-manifest', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
            '--solution=' + targetSolutionPath, '--plan=' + targetPlanPath, '--release-channel=LOCAL_TEST'],
        { cwd: frameworkRoot, encoding: 'utf8' });
    fs.writeFileSync(releasePath, releaseOutput);
    const cliUpgrade = JSON.parse(childProcess.execFileSync(process.execPath,
        [cli, 'builder:upgrade-plan', '--exp=' + expRoot, '--kickoff=' + kickoffRoot,
            '--current-lock=' + path.join(outputRoot, 'solution-lock.json'), '--release=' + releasePath,
            '--solution=' + targetSolutionPath, '--plan=' + targetPlanPath],
        { cwd: frameworkRoot, encoding: 'utf8' }));
    assert.strictEqual(cliUpgrade.state, 'READY',
        'Governed CLI must emit a non-mutating ready upgrade plan');

    const commands = toolingCommandService.loadCommands(frameworkRoot);
    assert.strictEqual(commands['builder:release-manifest'].operation, 'release-manifest',
        'Builder must expose release manifest creation');
    assert.strictEqual(commands['builder:upgrade-plan'].operation, 'upgrade-plan',
        'Builder must expose safe upgrade planning');
} finally {
    fs.rmSync(tempParent, { recursive: true, force: true });
}

console.log('Application Builder WP-B9 registry and upgrade contract validated');
