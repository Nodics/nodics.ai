/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderGenerationContract
 * @description Proves approved Commerce and Apparel generation, slim capability graphs, solution locks, absent-root and symlink guards, tamper rejection, and created-root-only rollback.
 * @layer test
 * @owner nTooling
 * @override Additional generators must retain these safety and reproducibility acceptance cases.
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

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const agoraRoot = path.join(expRoot, 'nodics.agora.apparel');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder', 'valid');
const catalogue = catalogueService.discover({ framework: frameworkRoot,
    exp: expRoot, kickoff: path.join(workspaceRoot, 'nodics.kickoff') });
const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-wp-b4-'));

/** Loads one solution fixture. */
function solution(fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixtureRoot, fileName), 'utf8'));
}

/** Creates an approved deterministic plan for a solution. */
function approvedPlan(solutionObject, reference) {
    const plan = planningService.createPlan(solutionObject, catalogue, {
        createdAt: '2026-08-16T08:00:00.000Z', expiresAt: '2099-08-17T08:00:00.000Z'
    });
    return generationService.approvePlan(plan, reference, '2026-08-16T08:05:00.000Z');
}

/** Returns a relative-file/content map for deterministic tree comparison. */
function generatedTree(root, directory = root, result = {}) {
    fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))
        .forEach(entry => {
            const target = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                generatedTree(root, target, result);
            } else {
                result[path.relative(root, target).split(path.sep).join('/')] = fs.readFileSync(target, 'utf8');
            }
        });
    return result;
}

try {
    ['solution-commerce.json', 'solution-apparel.json'].forEach(fileName => {
        const solutionObject = solution(fileName);
        const approved = approvedPlan(solutionObject, 'WP-B4-TEST-' + solutionObject.identity.projectCode);
        const outputRoot = path.join(tempParent, solutionObject.identity.projectCode);
        const result = generationService.generate(approved, solutionObject, catalogue, outputRoot, {
            now: '2026-08-16T08:10:00.000Z', protectedRoots: [frameworkRoot]
        });
        assert.strictEqual(result.generated, true, fileName + ' must generate');
        assert(fs.statSync(path.join(outputRoot, 'backend/customer')).isDirectory(),
            'Backend customer extension directory must exist');
        assert(fs.statSync(path.join(outputRoot, 'storefront/customer')).isDirectory(),
            'Storefront customer extension directory must exist');
        assert(fs.statSync(path.join(outputRoot, '.env.example')).isFile(),
            'Generated project must include beginner environment bootstrap');
        assert(fs.statSync(path.join(outputRoot, '.gitignore')).isFile(),
            'Generated project must include repository hygiene defaults');
        assert(fs.statSync(path.join(outputRoot, 'deployment/local-compose.yaml')).isFile(),
            'Generated project must include a local deployment packaging draft');
        assert(fs.statSync(path.join(outputRoot, 'docs/first-30-minutes.md')).isFile(),
            'Generated project must include a first-30-minutes beginner guide');
        assert(fs.statSync(path.join(outputRoot, 'docs/api-catalogue.md')).isFile(),
            'Generated project must include a backend API catalogue');
        assert(fs.statSync(path.join(outputRoot, 'docs/frontend-guide.md')).isFile(),
            'Generated project must include a frontend guide');
        assert(fs.statSync(path.join(outputRoot, 'docs/customization-map.md')).isFile(),
            'Generated project must include a customization ownership map');
        assert(fs.statSync(path.join(outputRoot, 'integrations/frontend-wiring.json')).isFile(),
            'Generated project must include frontend wiring metadata');
        assert(fs.statSync(path.join(outputRoot, 'backend/src/customerHooks.js')).isFile(),
            'Generated backend must include customer-owned hook extension points');
        const graph = JSON.parse(fs.readFileSync(path.join(outputRoot, 'backend/generated',
            solutionObject.identity.projectCode + '-module-graph.json'), 'utf8'));
        const expectedDomain = fileName.includes('apparel');
        assert.strictEqual(graph.capabilities.includes('apparel'), expectedDomain,
            'Generated graph must include Apparel only for the Apparel solution');
        assert.strictEqual(graph.capabilities.includes('electronics'), false,
            'WP-B4 outputs must exclude Electronics');
        assert.strictEqual(graph.capabilities.includes('telco'), false,
            'WP-B4 outputs must exclude Telco');
        const lock = JSON.parse(fs.readFileSync(path.join(outputRoot, 'solution-lock.json'), 'utf8'));
        assert.strictEqual(contractService.validateDocument('lock', lock).valid, true,
            'Generated solution lock must satisfy its contract');
        assert.strictEqual(lock.planDigest, approved.approval.approvedPlanDigest,
            'Solution lock must bind the approved plan');
        const readme = fs.readFileSync(path.join(outputRoot, 'README.md'), 'utf8');
        assert(readme.includes('Nodics Application Builder'),
            'Generated output must include a beginner handoff README');
        assert(readme.includes('## Ownership'),
            'Generated README must explain ownership boundaries');
        assert(readme.includes('docs/first-30-minutes.md'),
            'Generated README must point a new user to the beginner guide');
        const firstThirty = fs.readFileSync(path.join(outputRoot, 'docs/first-30-minutes.md'), 'utf8');
        assert(firstThirty.includes('npm test') && firstThirty.includes('npm run verify:runtime'),
            'Beginner guide must include the first validation commands');
        const apiCatalogue = fs.readFileSync(path.join(outputRoot, 'docs/api-catalogue.md'), 'utf8');
        assert(apiCatalogue.includes('/api/commerce/products') && apiCatalogue.includes('/api/commerce/data-packs') &&
            apiCatalogue.includes('/api/commerce/checkout/preview'),
            'API catalogue must document generated Commerce APIs');
        const customization = fs.readFileSync(path.join(outputRoot, 'docs/customization-map.md'), 'utf8');
        assert(customization.includes('backend/customer') && customization.includes('nodics.ai'),
            'Customization map must separate customer roots from framework ownership');
        solutionObject.data.packs.forEach(dataPack => {
            assert(fs.statSync(path.join(outputRoot, 'data', dataPack, 'manifest.json')).isFile(),
                'Generated data pack must include a manifest: ' + dataPack);
            assert(fs.statSync(path.join(outputRoot, 'data', dataPack, 'pages/home.json')).isFile(),
                'Generated data pack must include a home page: ' + dataPack);
            assert(fs.statSync(path.join(outputRoot, 'data', dataPack, 'components/hero.json')).isFile(),
                'Generated data pack must include a hero component: ' + dataPack);
            assert(fs.statSync(path.join(outputRoot, 'data', dataPack, 'products/starter-products.json')).isFile(),
                'Generated data pack must include starter products file: ' + dataPack);
            const manifest = JSON.parse(fs.readFileSync(path.join(outputRoot, 'data', dataPack, 'manifest.json'), 'utf8'));
            assert.strictEqual(manifest.ownership, 'CUSTOMER_OWNED',
                'Generated data pack manifest must keep customer ownership: ' + dataPack);
        });
        const handoff = JSON.parse(fs.readFileSync(path.join(outputRoot, 'builder-handoff.json'), 'utf8'));
        assert.strictEqual(handoff.project.projectCode, solutionObject.identity.projectCode,
            'Generated handoff must preserve project identity');
        assert.deepStrictEqual(handoff.selected.backendCapabilities, graph.capabilities,
            'Generated handoff must expose the approved backend graph');
        assert(handoff.ownership.framework.includes('nodics.ai'),
            'Generated handoff must explain framework ownership');
        childProcess.execFileSync(process.execPath, [path.join(outputRoot, 'verify-generated.js')], {
            cwd: outputRoot, stdio: 'pipe'
        });
        childProcess.execFileSync('npm', ['test'], { cwd: outputRoot, stdio: 'pipe' });
        childProcess.execFileSync('npm', ['run', 'verify:runtime'], { cwd: outputRoot, stdio: 'pipe' });
        const storefront = require(path.join(outputRoot, 'storefront/src/server.js'));
        assert.strictEqual(storefront.dataPackSamples.length, solutionObject.data.packs.length,
            'Generated storefront must expose selected data-pack summaries');
        assert(storefront.page().includes('data-pack-summary="true"'),
            'Generated storefront must render selected customer data-pack summaries');
        assert(fs.statSync(path.join(outputRoot, 'backend/src/server.js')).isFile(),
            'Generated backend must include a bootable server entrypoint');
        assert(fs.statSync(path.join(outputRoot, 'storefront/src/server.js')).isFile(),
            'Generated storefront must include a bootable server entrypoint');
        assert.throws(() => generationService.generate(approved, solutionObject, catalogue, outputRoot),
            /output must be absent/, 'Generation must never overwrite an existing root');
    });

    const commerce = solution('solution-commerce.json');
    const repeatPlan = approvedPlan(commerce, 'WP-B4-TEST-referenceCommerce');
    const repeatRoot = path.join(tempParent, 'referenceCommerce-repeat');
    generationService.generate(repeatPlan, commerce, catalogue, repeatRoot, {
        now: '2026-08-16T08:10:00.000Z'
    });
    assert.deepStrictEqual(generatedTree(repeatRoot), generatedTree(path.join(tempParent, 'referenceCommerce')),
        'Same solution, catalogue, approval, and clock must generate the same file tree');

    const approved = approvedPlan(commerce, 'WP-B4-TAMPER');
    const tampered = JSON.parse(JSON.stringify(approved));
    tampered.operations[0].targetPath = 'tampered.json';
    assert.throws(() => generationService.generate(tampered, commerce, catalogue,
        path.join(tempParent, 'tampered-output')), /digest is invalid|differs from the current canonical plan/,
    'Generation must reject changes after approval');

    const rollbackRoot = path.join(tempParent, 'rollback-output');
    assert.throws(() => generationService.generate(approved, commerce, catalogue, rollbackRoot, {
        now: '2026-08-16T08:10:00.000Z', failAfterOperation: 2
    }), /Injected Builder generation failure/, 'Injected failure must exercise rollback');
    assert.strictEqual(fs.existsSync(rollbackRoot), false, 'Rollback must remove only the root created by generation');

    const symlinkTarget = path.join(tempParent, 'real-parent');
    const symlinkParent = path.join(tempParent, 'linked-parent');
    fs.mkdirSync(symlinkTarget);
    fs.symlinkSync(symlinkTarget, symlinkParent, 'dir');
    assert.throws(() => generationService.resolveOutputRoot(path.join(symlinkParent, 'output')),
        /symlinked output ancestors/, 'Generation must reject symlinked output ancestors');
    assert.throws(() => generationService.resolveOutputRoot('relative-output'), /absolute path/,
        'Generation must require an absolute output path');

    const cliPlanPath = path.join(tempParent, 'cli-plan.json');
    const cliApprovedPath = path.join(tempParent, 'cli-approved.json');
    const cliSolutionPath = path.join(fixtureRoot, 'solution-commerce.json');
    const cliOutputRoot = path.join(tempParent, 'cli-commerce-output');
    fs.writeFileSync(cliPlanPath, JSON.stringify(planningService.createPlan(commerce, catalogue, {
        createdAt: '2026-08-16T08:00:00.000Z', expiresAt: '2099-08-17T08:00:00.000Z'
    }), null, 2));
    const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
    const roots = ['--exp=' + expRoot,
        '--kickoff=' + path.join(workspaceRoot, 'nodics.kickoff')];
    const approvedOutput = childProcess.execFileSync(process.execPath,
        [cli, 'builder:approve'].concat(roots, ['--plan=' + cliPlanPath, '--approval-reference=WP-B4-CLI']),
        { cwd: frameworkRoot, encoding: 'utf8' });
    fs.writeFileSync(cliApprovedPath, approvedOutput);
    const generatedOutput = JSON.parse(childProcess.execFileSync(process.execPath,
        [cli, 'builder:generate'].concat(roots, ['--plan=' + cliApprovedPath,
            '--solution=' + cliSolutionPath, '--output=' + cliOutputRoot]),
        { cwd: frameworkRoot, encoding: 'utf8' }));
    assert.strictEqual(generatedOutput.generated, true, 'Governed CLI must execute the approved Commerce plan');
    childProcess.execFileSync('npm', ['test'], { cwd: cliOutputRoot, stdio: 'pipe' });
} finally {
    fs.rmSync(tempParent, { recursive: true, force: true });
}

console.log('Application Builder WP-B4 generation contract validated');
