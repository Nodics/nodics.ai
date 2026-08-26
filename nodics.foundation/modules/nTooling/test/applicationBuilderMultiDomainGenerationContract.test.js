/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderMultiDomainGenerationContract
 * @description Qualifies deterministic Electronics, Telco, and Combined generation with exact backend dependency closure, Agora renderer/domain selection, customer data-pack symmetry, exclusions, locks, and governed CLI execution.
 * @layer test
 * @owner nTooling
 * @override Future domain generators must add cases without weakening exact-union, no-duplicate, source-backed renderer, and customer data-pack invariants.
 */
const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const generationService = require('../src/service/applicationBuilder/defaultApplicationBuilderGenerationService');
const planningService = require('../src/service/applicationBuilder/defaultApplicationBuilderPlanningService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const agoraRoot = path.join(expRoot, 'nodics.agora');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder', 'valid');
const catalogue = catalogueService.discover({ framework: frameworkRoot, agora: agoraRoot, kickoff: kickoffRoot });
const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-builder-wp-b5-'));

/** Loads one solution fixture. */
function loadSolution(fileName) {
    return JSON.parse(fs.readFileSync(path.join(fixtureRoot, fileName), 'utf8'));
}

/** Returns an approved plan under a stable WP-B5 clock. */
function approve(solution, reference) {
    return generationService.approvePlan(planningService.createPlan(solution, catalogue, {
        createdAt: '2026-08-16T10:00:00.000Z', expiresAt: '2099-08-17T10:00:00.000Z'
    }), reference, '2026-08-16T10:05:00.000Z');
}

/** Returns all file contents keyed by portable relative path. */
function tree(root, directory = root, result = {}) {
    fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))
        .forEach(entry => {
            const target = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                tree(root, target, result);
            } else {
                result[path.relative(root, target).split(path.sep).join('/')] = fs.readFileSync(target, 'utf8');
            }
        });
    return result;
}

/** Parses the JSON object embedded in the generated TypeScript composition. */
function composition(root) {
    const source = fs.readFileSync(path.join(root, 'storefront/generated/agora-composition.ts'), 'utf8');
    const match = source.match(/const composition = ([\s\S]+) as const;/);
    assert(match, 'Generated Agora composition must contain a deterministic object');
    return JSON.parse(match[1]);
}

const cases = [{
    fixture: 'solution-electronics.json',
    capabilities: ['electronics', 'nodics.commerce', 'nodics.foundation'],
    domains: ['electronics'],
    renderers: ['agora.electronics.product-card'],
    packs: ['agora.electronics']
}, {
    fixture: 'solution-telco.json',
    capabilities: ['electronics', 'nodics.commerce', 'nodics.foundation', 'telco'],
    domains: ['telco'],
    renderers: ['agora.telco.product-card'],
    packs: ['agora.telco']
}, {
    fixture: 'solution-combined.json',
    capabilities: ['apparel', 'electronics', 'nodics.commerce', 'nodics.foundation', 'telco'],
    domains: ['apparel', 'electronics', 'telco'],
    renderers: ['agora.apparel.product-card', 'agora.electronics.product-card', 'agora.telco.product-card'],
    packs: ['agora.apparel', 'agora.electronics', 'agora.telco', 'nexus.web']
}];

try {
    cases.forEach(testCase => {
        const solution = loadSolution(testCase.fixture);
        const plan = approve(solution, 'WP-B5-' + solution.identity.projectCode);
        const output = path.join(tempParent, solution.identity.projectCode);
        generationService.generate(plan, solution, catalogue, output, { now: '2026-08-16T10:10:00.000Z' });
        const graph = JSON.parse(fs.readFileSync(path.join(output, 'backend/generated',
            solution.identity.projectCode + '-module-graph.json'), 'utf8'));
        assert.deepStrictEqual(graph.capabilities, testCase.capabilities, 'Backend graph must be the exact capability union');
        assert.strictEqual(new Set(graph.capabilities).size, graph.capabilities.length,
            'Backend graph must not duplicate capabilities');
        if (graph.capabilities.includes('telco')) {
            assert(graph.edges.some(edge => edge.from === 'telco' && edge.to === 'electronics'),
                'Telco must extend Electronics in the generated backend graph');
        }
        const frontend = composition(output);
        assert.deepStrictEqual(frontend.rendererKeys, testCase.renderers,
            'Generated renderer selection must exactly match the solution');
        assert.strictEqual(new Set(frontend.rendererKeys).size, frontend.rendererKeys.length,
            'Generated renderer selection must not contain duplicates');
        const discoveredComposition = catalogue.frontendCompositions.find(item => item.code === frontend.composition);
        assert.deepStrictEqual(discoveredComposition.domains, testCase.domains,
            'Generated composition must use the source-backed active domains');
        frontend.rendererKeys.forEach(key => assert(discoveredComposition.rendererKeys.includes(key),
            'Generated renderer must exist in the source-backed Agora composition: ' + key));
        assert.deepStrictEqual(fs.readdirSync(path.join(output, 'data')).sort(), testCase.packs,
            'Generated customer data-pack directories must exactly match the solution');
        const lock = JSON.parse(fs.readFileSync(path.join(output, 'solution-lock.json'), 'utf8'));
        assert.deepStrictEqual(lock.dataPacks.map(pack => pack.code), testCase.packs,
            'Solution lock must contain the exact customer data-pack union');
        assert.strictEqual(new Set(lock.packages.map(item => item.code)).size, lock.packages.length,
            'Solution lock must not duplicate package coordinates');
        const handoff = JSON.parse(fs.readFileSync(path.join(output, 'builder-handoff.json'), 'utf8'));
        assert.deepStrictEqual(handoff.selected.dataPacks, testCase.packs,
            'Generated handoff must show the exact selected customer data-pack union');
        assert.deepStrictEqual(handoff.selected.rendererKeys, testCase.renderers,
            'Generated handoff must show the exact selected renderer hierarchy');
        assert(handoff.ownership.projectData.includes('Customer-owned'),
            'Generated handoff must explain customer data ownership');
        const wiring = JSON.parse(fs.readFileSync(path.join(output, 'integrations/frontend-wiring.json'), 'utf8'));
        assert.strictEqual(wiring.generatedApps.agora.selected, true,
            'Agora wiring must always be selected for generated commerce experiences');
        assert.strictEqual(wiring.generatedApps.axis.selected, solution.topology.frontends.includes('AXIS'),
            'Axis wiring must follow selected frontends without copying Axis source');
        assert.strictEqual(wiring.generatedApps.nexus.selected, solution.topology.frontends.includes('NEXUS'),
            'Nexus wiring must follow selected frontends without copying Nexus source');
        assert.strictEqual(fs.existsSync(path.join(output, 'integrations/axis-wiring.md')),
            solution.topology.frontends.includes('AXIS'),
            'Axis wiring notes must be generated only when Axis is selected');
        assert.strictEqual(fs.existsSync(path.join(output, 'integrations/nexus-wiring.md')),
            solution.topology.frontends.includes('NEXUS'),
            'Nexus wiring notes must be generated only when Nexus is selected');
        assert(fs.readFileSync(path.join(output, 'deployment/local-compose.yaml'), 'utf8').includes('NODICS_PROJECT_CODE'),
            'Deployment packaging draft must preserve project identity configuration');
        const frontendGuide = fs.readFileSync(path.join(output, 'docs/frontend-guide.md'), 'utf8');
        testCase.renderers.forEach(renderer => assert(frontendGuide.includes(renderer),
            'Frontend guide must explain selected renderer: ' + renderer));
        const firstThirty = fs.readFileSync(path.join(output, 'docs/first-30-minutes.md'), 'utf8');
        testCase.packs.forEach(dataPack => assert(firstThirty.includes(dataPack),
            'First-30-minutes guide must list selected data pack: ' + dataPack));
        const customizationMap = fs.readFileSync(path.join(output, 'docs/customization-map.md'), 'utf8');
        testCase.packs.forEach(dataPack => assert(customizationMap.includes('data/' + dataPack),
            'Customization map must include selected data root: ' + dataPack));
        testCase.packs.forEach(dataPack => {
            const packRoot = path.join(output, 'data', dataPack);
            const manifest = JSON.parse(fs.readFileSync(path.join(packRoot, 'manifest.json'), 'utf8'));
            const page = JSON.parse(fs.readFileSync(path.join(packRoot, 'pages/home.json'), 'utf8'));
            const products = JSON.parse(fs.readFileSync(path.join(packRoot, 'products/starter-products.json'), 'utf8'));
            const prices = JSON.parse(fs.readFileSync(path.join(packRoot, 'prices/starter-prices.json'), 'utf8'));
            const inventory = JSON.parse(fs.readFileSync(path.join(packRoot, 'inventory/starter-inventory.json'), 'utf8'));
            assert.strictEqual(manifest.ownership, 'CUSTOMER_OWNED',
                'Data-pack manifest must preserve customer ownership: ' + dataPack);
            assert.strictEqual(page.dataPack, dataPack,
                'Data-pack home page must identify its pack: ' + dataPack);
            assert.strictEqual(prices.prices.length, products.products.length,
                'Price seed count must match product seed count: ' + dataPack);
            assert.strictEqual(inventory.inventory.length, products.products.length,
                'Inventory seed count must match product seed count: ' + dataPack);
            if (dataPack.startsWith('agora.') && true) {
                const expectedDomain = dataPack.split('.').pop();
                assert(products.products.length > 0,
                    'Domain data pack must include at least one starter product: ' + dataPack);
                products.products.forEach(product => assert.strictEqual(product.domain, expectedDomain,
                    'Domain data pack must only include its domain products: ' + dataPack));
            } else {
                assert.strictEqual(products.products.length, 0,
                    'Common/web data pack must not own domain products: ' + dataPack);
            }
        });
        childProcess.execFileSync('npm', ['test'], { cwd: output, stdio: 'pipe' });

        const repeat = path.join(tempParent, solution.identity.projectCode + '-repeat');
        generationService.generate(plan, solution, catalogue, repeat, { now: '2026-08-16T10:10:00.000Z' });
        assert.deepStrictEqual(tree(repeat), tree(output), testCase.fixture + ' must generate deterministically');
    });

    const invalidRenderer = loadSolution('solution-electronics.json');
    invalidRenderer.experience.rendererKeys = ['agora.telco.product-card'];
    const rendererValidation = planningService.validateSolution(invalidRenderer, catalogue);
    assert.strictEqual(rendererValidation.valid, false, 'Cross-domain renderer selection must fail');
    assert(rendererValidation.errors.some(error => error.includes('renderer is unavailable')),
        'Renderer failure must identify source-backed composition availability');

    const invalidPack = loadSolution('solution-telco.json');
    invalidPack.data.packs.push('agora.electronics');
    const packValidation = planningService.validateSolution(invalidPack, catalogue);
    assert.strictEqual(packValidation.valid, false, 'Telco must not silently include an Electronics customer data pack');
    assert(packValidation.errors.some(error => error.includes('not required by the selected experience')),
        'Unexpected data-pack failure must be actionable');

    const combined = loadSolution('solution-combined.json');
    const cliPlan = planningService.createPlan(combined, catalogue, {
        createdAt: '2026-08-16T10:00:00.000Z', expiresAt: '2099-08-17T10:00:00.000Z'
    });
    const cliPlanPath = path.join(tempParent, 'combined-plan.json');
    const cliApprovedPath = path.join(tempParent, 'combined-approved.json');
    fs.writeFileSync(cliPlanPath, JSON.stringify(cliPlan, null, 2));
    const cli = path.join(frameworkRoot, 'nodics.foundation/modules/nTooling/bin/nodics-tool.js');
    const roots = ['--agora=' + agoraRoot, '--kickoff=' + kickoffRoot];
    const approvedJson = childProcess.execFileSync(process.execPath,
        [cli, 'builder:approve'].concat(roots, ['--plan=' + cliPlanPath, '--approval-reference=WP-B5-CLI']),
        { cwd: frameworkRoot, encoding: 'utf8' });
    fs.writeFileSync(cliApprovedPath, approvedJson);
    const cliOutput = path.join(tempParent, 'combined-cli');
    const result = JSON.parse(childProcess.execFileSync(process.execPath,
        [cli, 'builder:generate'].concat(roots, ['--plan=' + cliApprovedPath,
            '--solution=' + path.join(fixtureRoot, 'solution-combined.json'), '--output=' + cliOutput]),
        { cwd: frameworkRoot, encoding: 'utf8' }));
    assert.strictEqual(result.generated, true, 'Governed CLI must generate the approved Combined application');
    childProcess.execFileSync('npm', ['test'], { cwd: cliOutput, stdio: 'pipe' });
} finally {
    fs.rmSync(tempParent, { recursive: true, force: true });
}

console.log('Application Builder WP-B5 multi-domain generation contract validated');
