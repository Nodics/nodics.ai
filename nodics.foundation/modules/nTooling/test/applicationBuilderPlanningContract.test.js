/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/applicationBuilderPlanningContract
 * @description Verifies explicit-root capability discovery, Telco dependency resolution, frontend/data symmetry, deterministic planning, safe target ownership, and read-only Builder command registration.
 * @layer test
 * @owner nTooling
 * @override Customer tooling may add descriptors and validation rules, but must preserve deterministic resolution, explicit roots, approval-required plans, and non-execution.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const catalogueService = require('../src/service/applicationBuilder/defaultApplicationBuilderCatalogueService');
const planningService = require('../src/service/applicationBuilder/defaultApplicationBuilderPlanningService');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

const frameworkRoot = path.resolve(__dirname, '../../../..');
const workspaceRoot = path.dirname(frameworkRoot);
const expRoot = path.join(workspaceRoot, 'nodics.exp');
const agoraRoot = path.join(expRoot, 'nodics.agora');
const kickoffRoot = path.join(workspaceRoot, 'nodics.kickoff');
const fixtureRoot = path.join(__dirname, 'fixtures', 'applicationBuilder', 'valid');
const catalogue = catalogueService.discover({ framework: frameworkRoot, agora: agoraRoot, kickoff: kickoffRoot });
const expCatalogue = catalogueService.discover({ framework: frameworkRoot, exp: expRoot, kickoff: kickoffRoot });

assert.strictEqual(catalogue.readOnly, true, 'Builder discovery must be read-only');
assert(catalogue.capabilities.some(capability => capability.code === 'nodics.commerce'),
    'Catalogue must discover Commerce');
assert(catalogue.capabilities.some(capability => capability.code === 'apparel'),
    'Catalogue must discover Apparel');
assert(catalogue.capabilities.some(capability => capability.code === 'electronics'),
    'Catalogue must discover Electronics');
assert(catalogue.capabilities.some(capability => capability.code === 'telco'),
    'Catalogue must discover Telco');
assert(catalogue.frontendCompositions.some(composition => composition.code === 'combined'),
    'Catalogue must discover the combined Agora composition');
assert(catalogue.customerDataPacks.some(dataPack => dataPack.code === 'agora.telco'),
    'Catalogue must discover the customer-owned Telco data-pack boundary');
assert(/^sha256:[a-f0-9]{64}$/.test(catalogue.catalogueDigest),
    'Catalogue must carry a deterministic integrity digest');
const portableCatalogue = Object.assign({}, catalogue, {
    repositories: catalogue.repositories.map(repository => ({ code: repository.code }))
});
delete portableCatalogue.catalogueDigest;
assert.strictEqual(catalogue.catalogueDigest, catalogueService.digest(portableCatalogue),
    'Catalogue digest must exclude machine-specific absolute repository roots');
if (fs.existsSync(expRoot)) {
    assert(expCatalogue.repositories.some(repository => repository.code === 'exp'),
        'Builder discovery must record nodics.exp provenance when used');
    assert(expCatalogue.frontendApps.some(app => app.code === 'agoraApparel' && app.location === 'nested'),
        'Builder discovery must resolve Agora Apparel from nodics.exp nested layout');
    assert(expCatalogue.frontendApps.some(app => app.code === 'agoraElectronics' && app.location === 'nested'),
        'Builder discovery must resolve Agora Electronics from nodics.exp nested layout');
    assert(expCatalogue.frontendApps.some(app => app.code === 'agoraTelco' && app.location === 'nested'),
        'Builder discovery must resolve Agora Telco from nodics.exp nested layout');
    assert(expCatalogue.frontendApps.some(app => app.code === 'domainCommerceUi' && app.location === 'nested'),
        'Builder discovery must resolve shared Domain Commerce UI from nodics.exp nested layout');
}
assert.deepStrictEqual(expCatalogue.capabilities, catalogue.capabilities,
    'Using nodics.exp to resolve the same Agora app must keep backend capability semantics');
const expCompositionByCode = new Map(expCatalogue.frontendCompositions.map(composition => [composition.code, composition]));
['apparel', 'electronics', 'telco', 'combined', 'commerce'].forEach(code => {
    assert(expCompositionByCode.has(code),
        'Using nodics.exp must expose the ' + code + ' Agora composition semantics');
});
assert.deepStrictEqual(expCompositionByCode.get('combined').domains, ['apparel', 'electronics', 'telco'],
    'Split nodics.exp apps must preserve combined multi-domain planning semantics');
assert.deepStrictEqual(expCompositionByCode.get('combined').rendererKeys,
    catalogue.frontendCompositions.find(composition => composition.code === 'combined').rendererKeys,
    'Split nodics.exp apps must preserve combined renderer availability');
assert(expCompositionByCode.get('apparel').sourcePackage === 'nodics.agora.apparel',
    'Apparel composition must retain split app provenance');
assert(expCompositionByCode.get('electronics').sourcePackage === 'nodics.agora.electronics',
    'Electronics composition must retain split app provenance');
assert(expCompositionByCode.get('telco').sourcePackage === 'nodics.agora.telco',
    'Telco composition must retain split app provenance');
assert.deepStrictEqual(expCatalogue.customerDataPacks, catalogue.customerDataPacks,
    'Using nodics.exp to resolve the same Agora app must keep Kickoff data-pack semantics');

const solution = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'solution-combined.json'), 'utf8'));
const originalSolution = JSON.stringify(solution);
const validation = planningService.validateSolution(solution, catalogue);
assert.strictEqual(validation.valid, true, validation.errors.join('\n'));
assert(validation.resolution.capabilities.some(capability => capability.code === 'electronics'),
    'Combined solution must resolve Electronics');
assert(validation.resolution.edges.some(edge => edge.from === 'telco' && edge.to === 'electronics'),
    'Telco must resolve its package-metadata Electronics extension');

const planningClock = {
    createdAt: '2026-08-16T08:00:00.000Z',
    expiresAt: '2026-08-17T08:00:00.000Z'
};
const firstPlan = planningService.createPlan(solution, catalogue, planningClock);
const secondPlan = planningService.createPlan(solution, catalogue, planningClock);
assert.deepStrictEqual(firstPlan, secondPlan, 'Same inputs and clock must produce the same plan');
assert.strictEqual(JSON.stringify(solution), originalSolution, 'Planning must not mutate the solution document');
assert.strictEqual(firstPlan.approval.state, 'PENDING', 'Plans must start pending approval');
assert.strictEqual(firstPlan.approval.required, true, 'Plans must require explicit approval');
assert(firstPlan.operations.every(operation => !path.isAbsolute(operation.targetPath) &&
    !operation.targetPath.split('/').includes('..')), 'Every planned target must remain relative and traversal-free');
assert(firstPlan.operations.some(operation => operation.ownership === 'CUSTOMER_OWNED'),
    'Plan must distinguish customer-owned extension paths');
assert(firstPlan.excludedCapabilityAssertions.length === 0,
    'Combined solution must not invent excluded domains');

const invalidSolution = JSON.parse(JSON.stringify(solution));
invalidSolution.capabilities.excluded = ['electronics'];
const invalidResult = planningService.validateSolution(invalidSolution, catalogue);
assert.strictEqual(invalidResult.valid, false, 'Required excluded dependencies must fail validation');
assert(invalidResult.errors.some(error => error.includes('Excluded capability')),
    'Dependency exclusion failure must be actionable');

const unresolvedSolution = JSON.parse(JSON.stringify(solution));
unresolvedSolution.decisions.unresolved = ['Choose the production identity provider'];
assert.strictEqual(planningService.validateSolution(unresolvedSolution, catalogue).valid, false,
    'Material unresolved decisions must prevent planning');

assert.throws(() => catalogueService.discover({ framework: frameworkRoot, agora: '', kickoff: kickoffRoot }),
    /requires explicit repository root: agora/, 'Discovery must not infer a missing parallel repository without nodics.exp');
assert.throws(() => catalogueService.discover({ framework: frameworkRoot, exp: path.join(workspaceRoot, 'missing-exp'),
    kickoff: kickoffRoot }), /repository root is unavailable: exp/,
'Discovery must give a corrective error for unavailable nodics.exp');

const commands = toolingCommandService.loadCommands(frameworkRoot);
['builder:discover', 'builder:guide', 'builder:validate', 'builder:plan', 'builder:qualify'].forEach(commandName => {
    assert(commands[commandName], 'Tooling must register ' + commandName);
    assert.strictEqual(commands[commandName].handler, '@nTooling/application-builder',
        commandName + ' must use the governed Builder adapter');
});
assert.strictEqual(commands['builder:plan'].operation, 'plan', 'Builder plan must remain a planning operation');
assert.strictEqual(commands['builder:guide'].operation, 'guide', 'WP-B7 must expose beginner guided creation');
assert.strictEqual(commands['builder:approve'].operation, 'approve', 'WP-B4 must expose explicit approval');
assert.strictEqual(commands['builder:generate'].operation, 'generate', 'WP-B4 must expose guarded generation');
assert.strictEqual(commands['builder:qualify'].operation, 'qualify', 'WP-B6 must expose governed qualification');

const builderContract = fs.readFileSync(path.join(__dirname, '../llm/contracts/application-builder.md'), 'utf8');
[
    'Beginner guided experience',
    'business choices',
    'domain presets',
    'one clear next command',
    'corrective instructions',
    'guided wrapper'
].forEach(clause => {
    assert(builderContract.includes(clause), 'Application Builder contract must preserve beginner guidance: ' + clause);
});

console.log('Application Builder discovery and planning contract validated');
