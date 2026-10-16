/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/referenceDemoOwnership @description Exercises static demo ownership rejection and partner customization without executing source or touching a runtime. @layer test @owner nTooling */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const audit = require('../src/service/quality/defaultDesignPrincipleAuditService');
const project = require('../src/service/command/defaultProjectCommandService');

function fixture(t, referenceDemo = true) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-reference-demo-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const moduleRoot = path.join(root, 'modules/example');
    const write = (file, value) => {
        const target = path.join(moduleRoot, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value));
    };
    write('package.json', { name: 'unrelated.example', scripts: {}, nodics: {
        referenceDemo, kind: 'content-pack', owns: ['data', 'configuration', 'composition'], runtime: { router: false },
    } });
    write('data/manifest.json', { sections: { sample: { kind: 'DATA_RELEASE', dataType: 'sample', selectionPolicy: 'EXPLICIT' } } });
    write('data/sample-v001/records/products.json', [{ code: 'fictional-product', accessGroups: ['contentUserGroup'] }]);
    write('config/properties.js', 'module.exports = {};');
    return { root, moduleRoot, write, inspect() {
        const failures = [];
        audit.auditReferenceDemoModules(failures, root);
        return failures;
    } };
}

test('marked demos retain literal composition, sample JSON and catalog access references', t => {
    const f = fixture(t);
    f.write('config/properties.js', `
        const visual = { mediaCode: 'fictional-hero' };
        module.exports = {
            backofficeApplicationVisual: visual,
            tooling: { acceptance: { scenario: { items: require('../data/sample-v001/records/products.json') } } }
        };`);
    f.write('nodics.js', 'module.exports = { init: function () { return Promise.resolve(true); } };');
    f.write('config/prescripts.js', 'module.exports = {};');
    assert.deepEqual(f.inspect(), []);
});

test('demo identities, header authority references and individual scope assignments are not access definitions', t => {
    for (const extension of ['js', 'json']) {
        const f = fixture(t);
        const write = (file, value) => f.write(file + '.' + extension,
            extension === 'json' ? value : 'module.exports = ' + JSON.stringify(value) + ';');
        write('data/sample-v001/records/people', { record0: {
            code: 'fictional-person', loginId: 'person@example.invalid', principalType: 'human',
            userGroups: ['userGroup', 'existingOperator'], groupCodes: ['existingBusinessView'], roleCodes: ['EXISTING_VIEW'],
        } });
        write('data/sample-v001/headers/people', { profile: { people: { options: {
            schemaName: 'employee', operation: 'saveAll', dataFilePrefix: 'people',
            userGroups: ['userGroup', 'adminGroup'], requiredRoles: ['EXISTING_OPERATOR'],
        } }, scopes: { options: { schemaName: 'principalScopeAssignment', operation: 'saveAll', dataFilePrefix: 'scopes' } } } });
        write('data/sample-v001/records/scopes', { record0: { code: 'fictional-scope', principalType: 'human',
            principalCode: 'fictional-person', permissionCode: 'existing.operation', scopeType: 'STORE', scopeCode: 'demo-store' } });
        assert.deepEqual(f.inspect(), [], extension);
    }
});

test('reference-shaped fields do not conceal reusable definitions or executable assignments', t => {
    const cases = [
        ['headers/definition', { profile: { definition: { options: {
            schemaName: 'enterpriseRole', operation: 'saveAll', dataFilePrefix: 'definition', requiredRoles: ['EXISTING_OPERATOR'],
        } } } }],
        ['headers/definition', { options: { schemaName: 'userGroup', operation: 'saveAll', dataFilePrefix: 'definition' } }],
        ['records/definition', { record0: { code: 'new-group', parentGroups: ['existingGroup'] } }],
        ['records/definition', { record0: { code: 'new-role', groupCodes: ['existingGroup'] } }],
        ['records/people', { record0: { loginId: 'demo', userGroups: [{ code: 'new-group', permissions: ['example.write'] }] } }],
        ['records/people', { record0: { loginId: 'demo', userGroups: ['existingGroup'], permissions: ['example.write'] } }],
        ['headers/people', { options: { schemaName: 'employee', operation: 'saveAll', dataFilePrefix: 'people',
            requiredRoles: [{ code: 'new-role', groupCodes: ['existingGroup'] }] } }],
    ];
    for (const extension of ['js', 'json']) for (const [file, value] of cases) {
        const f = fixture(t);
        f.write('data/sample-v001/' + file + '.' + extension,
            extension === 'json' ? value : 'module.exports = ' + JSON.stringify(value) + ';');
        assert(f.inspect().length > 0, file + '.' + extension);
    }
    const f = fixture(t);
    f.write('data/sample-v001/records/people.js', 'module.exports = { record0: { loginId: "demo", userGroups: SERVICE.Example.groups() } };');
    assert(f.inspect().length > 0);
});

test('static local header assembly remains data-owned without allowing access-definition headers', t => {
    const f = fixture(t);
    const source = schema => `const entry = (schemaName, dataFilePrefix) => ({
        options: { schemaName, operation: 'saveAll', dataFilePrefix }
    }); module.exports = { product: { items: entry('${schema}', 'items') } };`;
    f.write('data/sample-v001/headers/items.js', source('product'));
    assert.deepEqual(f.inspect(), []);
    f.write('data/sample-v001/headers/items.js', source('principalScopeAssignment'));
    assert.deepEqual(f.inspect(), []);
    for (const schema of ['permission', 'userGroup', 'enterpriseRole']) {
        f.write('data/sample-v001/headers/items.js', source(schema));
        assert(f.inspect().length > 0, schema);
    }
});

test('current and historical setup observation JSON stay inert and cannot become configuration imports', t => {
    const f = fixture(t);
    const receipt = { contractVersion: 1, code: 'unrelated-observation', revision: 2,
        tenant: 'demo', profileCode: 'example', baselineCode: 'example', profileDigest: 'retained-digest',
        stages: [{ code: 'owner:accessGroups', descriptor: { requiredRoles: ['EXISTING_OPERATOR'] } }], baseline: {} };
    f.write('config/setup-observation/example.json', receipt);
    f.write('config/setup-observation/history/example-revision-1.json', { ...receipt, revision: 1 });
    assert.deepEqual(f.inspect(), []);
    f.write('config/properties.js', 'module.exports = { tooling: { acceptance: { fixture: require("./setup-observation/example.json") } } };');
    assert(f.inspect().length > 0);
    f.write('config/properties.js', 'module.exports = {};');
    for (const [file, value] of [
        ['config/setup-observation/example.json', 'module.exports = {};'],
        ['config/setup-observation/example.json', { permissions: ['example.write'] }],
        ['config/setup-observation/example.json', { ...receipt, schemaPolicies: {} }],
        ['config/setup-observation/example.js', 'module.exports = {};'],
        ['config/other.json', receipt],
    ]) {
        f.write(file, value);
        assert(f.inspect().length > 0, file);
        fs.unlinkSync(path.join(f.moduleRoot, file));
    }
});

test('identity and display leaves cannot conceal capability definitions', t => {
    const f = fixture(t);
    const policy = require('../config/properties').tooling.referenceDemoOwnership;
    const nested = (pattern, value) => pattern.split('.').reverse().reduce((child, key) => ({ [key === '*' ? 'unrelatedChoice' : key]: child }), value);
    for (const pattern of policy.configurationLeafPaths) {
        f.write('config/properties.js', 'module.exports = ' + JSON.stringify(nested(pattern, 'selected')) + ';');
        assert.deepEqual(f.inspect(), [], pattern);
        for (const value of [{ policy: 'capability' }, { permissions: ['new.grant'] }, [{ code: 'definition' }],
            { $config: 'replace', value: { handler: 'DefaultExampleService' } }]) {
            f.write('config/properties.js', 'module.exports = ' + JSON.stringify(nested(pattern, value)) + ';');
            assert(f.inspect().length > 0, pattern);
        }
    }
    f.write('config/properties.js', `module.exports = { eWaste: {
        presentation: { brandName: 'Unrelated example', walletLabels: { points: 'Demo points' }, sampleMode: true },
        application: { code: 'UNRELATED', visual: { mediaCode: 'unrelated-hero' },
            requiredScenarioModules: ['existingOwner', 'existingExtension'] }
    } };`);
    assert.deepEqual(f.inspect(), []);
});

test('runtime policy remains outside every marked demo even as scalar values or config directives', t => {
    const demo = fixture(t);
    const partner = fixture(t, false);
    const nested = (pattern, value) => pattern.split('.').reverse().reduce((child, key) => ({ [key]: child }), value);
    const paths = [
        'waste.operations.requireScopes', 'waste.operations.requireVerification',
        'waste.operations.requireDifferentApprover', 'bidding.maximumAmount', 'bidding.policyVersion',
        'eWaste.rewardValuation.pointsPerKg', 'eWaste.marketplace.autoPublishListings',
        'copilot.runtimeRoleProfiles.WASTE.providers.adapters.custom.credential.mode',
        'copilot.runtimeRoleProfiles.WASTE.providers.adapters.custom.credential.secretRef',
        'copilot.runtimeRoleProfiles.WASTE.providers.adapters.custom.connection.timeoutMs',
        'copilot.runtimeRoleProfiles.WASTE.providers.adapters.custom.model.name',
        'fulfillmentCore.runtimeRoleProfiles.COMMERCE.physicalOperations.enabled',
        'order.runtimeRoleProfiles.COMMERCE.disputes.enabled',
        'order.runtimeRoleProfiles.COMMERCE.disputes.storeCodes.example',
        'order.runtimeRoleProfiles.COMMERCE.refunds.enabled',
        'order.runtimeRoleProfiles.COMMERCE.refunds.storeCodes.example',
        'order.runtimeRoleProfiles.COMMERCE.refunds.ownerByStore.example',
        'product.localization.supportedLocales', 'product.maximumVariants',
        'cart.runtimeRoleProfiles.COMMERCE.customerApi.defaultCurrency',
        'promotion.legacyTokenHashPolicies', 'digitalCore.merchantRedemption.enabled',
        'profileExternalIdentity.applications.example.credentialReference',
        'media.customerUploads.enabled', 'waste.projectOverlay.enabled',
        'wasteImpact.calculation.providerService',
        'eWaste.application.enabled', 'eWaste.journeys.consumer.enabled',
        'eWaste.application.frameworkModuleName', 'eWaste.application.backendModuleName',
        'eWaste.journey.arrivalRadiusMetres', 'eWaste.journey.contractVersion',
        'eWaste.channelAuthentication.channels.telegram.seamlessSignIn',
        'eWaste.outcomeCommunication.connectionName', 'eWaste.rewardValuationService',
        'eWaste.targetAuthorities.newOwner', 'order.refunds.ownerPorts.newOwner',
        'wasteSubmission.runtimeRoleProfiles.WASTE.metadataSuggestion.adapter',
        'futureCapability.policy.enabled',
    ];
    for (const property of paths) for (const value of [true, false, 50, 'selection', ['selection'],
        { $config: 'ref', path: 'existing.policy' },
        { $config: 'env', name: 'DEMO_POLICY', type: 'boolean', fallback: true },
        { $config: 'replace', value: ['selection'] }]) {
        const source = 'module.exports = ' + JSON.stringify(nested(property, value)) + ';';
        demo.write('config/properties.js', source);
        assert(demo.inspect().some(failure => failure.includes('cannot own capability/access configuration')), property);
        partner.write('config/properties.js', source);
        assert.deepEqual(partner.inspect(), [], 'actual partner: ' + property);
    }
});

test('named setup and publication composition can reference owner releases without owning them', t => {
    const f = fixture(t);
    f.write('config/properties.js', `module.exports = {
        data: { dataReleases: { runtimeRoleProfiles: { PLATFORM: { initializationProfiles: {
            unrelatedProfile: { enabled: true, steps: { $config: 'replace', value: [
                { dataType: 'init', releaseCodes: ['owner:accessGroups'] },
                { dataType: 'sample', releaseCodes: ['unrelated.example:sample'] }
            ] } }
        } } } } },
        cms: { publication: { baselines: { unrelated: { releaseCode: 'unrelated.example:sample', dataType: 'sample' } } } },
        backofficeApplicationInitialization: { profiles: { unrelated: { dataPackages: [
            { code: 'owner:accessGroups', dataType: 'init', trigger: 'USER' }
        ] } } }
    };`);
    assert.deepEqual(f.inspect(), []);
    f.write('data/init-v001/records/groups.json', { group: { code: 'newAuthority', permissions: ['*'] } });
    assert(f.inspect().length > 0, 'referencing an owner release must not authorize an owned init release');
});

test('shipping policy is deployment configuration even when described as a demo offer', t => {
    const f = fixture(t);
    const source = rows => 'module.exports = ' + JSON.stringify({ fulfillmentCore: { runtimeRoleProfiles: {
        COMMERCE: { customerShipping: { methods: { $config: 'replace', value: rows },
            returnMethods: [{ code: 'DEMO_PICKUP', label: 'Demo pickup', requiresAddress: true }] } },
    } } }) + ';';
    const offer = { code: 'DEMO', label: 'Demo delivery', price: '0.00', currency: 'AED', requiresAddress: true };
    f.write('config/properties.js', source([offer]));
    assert(f.inspect().length > 0);
    const partner = fixture(t, false);
    partner.write('config/properties.js', source([offer]));
    assert.deepEqual(partner.inspect(), []);
    for (const field of [{ handler: 'DefaultShippingService' }, { permissions: ['shipping.manage'] },
        { price: { policy: 'capability' } }]) {
        f.write('config/properties.js', source([{ ...offer, ...field }]));
        assert(f.inspect().length > 0);
    }
});

test('credential bindings belong to deployment configuration, not marked demos', t => {
    const f = fixture(t);
    const binding = { credentialReference: 'provider.demo', path: ['credentials', 'provider.demo', 'value'] };
    const write = fields => f.write('config/properties.js', 'module.exports = ' + JSON.stringify({
        runtimeConfigurationSchemas: { existingProviderSchema: { fields } },
    }) + ';');
    write([binding]);
    assert(f.inspect().length > 0);
    const partner = fixture(t, false);
    partner.write('config/properties.js', 'module.exports = ' + JSON.stringify({
        runtimeConfigurationSchemas: { existingProviderSchema: { fields: [binding] } },
    }) + ';');
    assert.deepEqual(partner.inspect(), []);
    for (const fields of [[], [{ ...binding, path: ['permissions'] }], [{ ...binding, path: ['credentials', 'other', 'value'] }],
        ...['code', 'type', 'required', 'sensitive', 'ownerModule', 'updatePermission'].map(key => [{ ...binding, [key]: false }])]) {
        write(fields);
        assert(f.inspect().length > 0, JSON.stringify(fields));
    }
});

test('capability configuration, grants, bindings and executable configuration fail without evaluation', t => {
    const f = fixture(t);
    for (const source of [
        'module.exports = { product: { maximumVariants: 10 } };',
        'module.exports = { order: true };',
        'module.exports = { fulfillmentCore: { runtimeRoleProfiles: { COMMERCE: { physicalOperations: { evidenceMode: "MANUAL_ATTESTATION" } } } } };',
        'module.exports = { schemaPolicies: { example: { accessGroups: { adminGroup: 10 } } } };',
        'const grant = { permissions: ["example.write"] }; module.exports = { tooling: { acceptance: { fixture: grant } } };',
        'module.exports = { product: { $config: "replace", value: {} } };',
        'module.exports = { ...require("/untrusted-module") };',
        'throw new Error("MUST_NOT_EXECUTE"); module.exports = {};',
        'module.exports = {}; module.exports.product = {};',
        'module.exports = { ["product"]: {} };',
        'module.exports = { get product() { throw new Error("MUST_NOT_EXECUTE"); } };',
        'const a = a; module.exports = a;',
        'module.exports = { broken: '
    ]) {
        f.write('config/properties.js', source);
        const failures = f.inspect();
        assert(failures.length > 0, source);
        assert(!failures.join(' ').includes('MUST_NOT_EXECUTE'));
    }
});

test('runtime source, startup behavior, access data and mandatory releases fail', t => {
    const cases = [
        ['src/service/defaultExampleService.js', 'module.exports = {};'],
        ['helper.mjs', 'export default {};'],
        ['config/postscripts.js', 'module.exports = { execute: "example" };'],
        ['nodics.js', 'module.exports = { init: function () { SERVICE.Example.run(); return Promise.resolve(true); } };'],
        ['data/init-v001/records/defaults.json', []],
        ['data/manifest.json', { sections: { core: { dataType: 'core', selectionPolicy: 'EXPLICIT' } } }],
        ['data/manifest.json', { sections: { sample: { dataType: 'sample', selectionPolicy: 'DEFAULT' } } }],
        ['data/sample-v001/headers/access.js', 'module.exports = { options: { schemaName: "permission" } };'],
        ['data/sample-v001/headers/access.js', 'const entry = name => ({schemaName:name}); module.exports = entry("userGroup");'],
        ['data/sample-v001/records/access.json', { permissions: ['example.write'] }],
        ['data/sample-v001/records/access.js', 'module.exports = SERVICE.Example.run();'],
        ['data/sample-v001/records/access.js', 'module.exports = require("node:fs");']
    ];
    for (const [file, value] of cases) {
        const f = fixture(t);
        f.write(file, value);
        assert(f.inspect().length > 0, file);
    }
});

test('symlinks and nested modules cannot conceal capability ownership', t => {
    const f = fixture(t);
    fs.symlinkSync(os.tmpdir(), path.join(f.moduleRoot, 'linked'));
    f.write('modules/hidden/package.json', { name: 'hidden' });
    assert.equal(f.inspect().length, 2);
});

test('documentation uses the existing optional content-pack installation contract', t => {
    const f = fixture(t);
    const section = { kind: 'CONTENT_PACK', contentPath: 'docs-v001', installationPolicy: 'OPTIONAL_AXIS_INITIATED' };
    f.write('data/manifest.json', { sections: { documentation: section } });
    assert.deepEqual(f.inspect(), []);
    f.write('data/manifest.json', { sections: { documentation: { ...section, installationPolicy: 'AUTOMATIC' } } });
    assert(f.inspect().length > 0);
});

test('ordinary partner customization is not constrained by reference demo ownership', t => {
    const f = fixture(t, false);
    f.write('src/service/defaultPartnerService.js', 'module.exports = { custom: function () {} };');
    f.write('config/properties.js', 'module.exports = { product: { maximumVariants: 10 } };');
    assert.deepEqual(f.inspect(), []);
});

test('project validation runs the ownership gate without relying on project test scripts', t => {
    const f = fixture(t);
    const validator = { ...project, assertNoProjectDescriptor() {}, resolveProjectCode() { return 'example'; },
        resolveCommands() { return {}; }, validateScriptOwnership() {}, validateProjectDirectoryBoundaries() {} };
    assert.doesNotThrow(() => validator.validateProject(f.root));
    f.write('src/service/defaultExampleService.js', 'module.exports = {};');
    assert.throws(() => validator.validateProject(f.root), /reference demo cannot own runtime source/);
});

test('framework audit always invokes reference ownership', () => {
    const calls = [];
    const isolated = { ...audit };
    for (const name of ['auditAiGovernance', 'auditCommandGates', 'auditPrincipleContracts', 'auditLlmGuidance',
        'auditGeneratedContextEntrypoints', 'auditServiceExportStyle', 'auditConfigurationSources']) isolated[name] = () => {};
    isolated.auditReferenceDemoModules = failures => { calls.push('reference'); failures.push('rejected'); };
    assert.deepEqual(isolated.audit(), ['rejected']);
    assert.deepEqual(calls, ['reference']);
});
