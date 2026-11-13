/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module import/test/startupDestinationOwnership @description Qualifies selected destination owners, explicit publication and local receipts without providers. @layer test @owner import */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const base = require('../src/service/release/defaultDataReleaseService');
const authoring = require('../../../../nDatabase/database/src/service/schema/defaultSchemaAuthoringPolicyService');
const defaults = require('../config/properties').data.dataReleases;

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'import-owner-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const file = 'core-v001/headers/seedHeader.js';
    fs.mkdirSync(path.join(root, 'data/core-v001/headers'), { recursive: true });
    const header = { sourcePackage: { seed: { options: {
        enabled: true, moduleName: 'inventory', schemaName: 'stock', operation: 'saveAll'
    } } } };
    const write = () => fs.writeFileSync(path.join(root, 'data', file), 'module.exports = ' + JSON.stringify(header));
    write();
    const module = { name: 'inventory', rawSchema: { stock: { model: true } } };
    const context = { runtimeRole: { code: 'UNRELATED_LABEL', publication: 'OPERATIONAL' }, environment: { class: 'LOCAL' } };
    const policy = structuredClone(defaults);
    let active = ['inventory'];
    const effects = [];
    global.CONFIG = { get: key => key === 'data' ? { dataReleases: policy } : context[key] };
    global.NODICS = { getActiveModules: () => active, getModule: name => active.includes(name) ? module : undefined,
        getRawModule: name => name === 'sourcePackage' ? { name, path: root } : undefined,
        getSelectedEnvironmentName: () => 'local', getServerName: () => 'selectedServer' };
    global.SERVICE = { DefaultSchemaAuthoringPolicyService: authoring,
        DefaultDataInstallationService: { get: async request => { effects.push(request); return { code: 'SUC_DBS_00000', result: [] }; } } };
    const release = { releaseCode: 'sourcePackage:seed', moduleName: 'sourcePackage', sectionCode: 'seed',
        dataType: 'core', sourceRoot: 'core-v001', version: '1.0.0', checksum: 'a'.repeat(64),
        declaredFiles: [file], destinationRole: 'RETIRED_ROLE_LABEL', environmentScope: ['LOCAL'], lifecycle: 'REFERENCE' };
    const service = { ...base, activeExecutions: new Map(), discoverReleases: () => [release],
        error: (code, message) => Object.assign(new Error(message), { code }) };
    return { service, release, module, context, policy, header, write, effects, deactivate: () => { active = []; } };
}

test('source package and role labels do not select destination; explicit header owner does', t => {
    const f = fixture(t);
    assert.equal(f.service.validateDestination(f.release), true);
    f.context.runtimeRole.code = 'ANY_OTHER_NAME';
    f.release.destinationRole = 'ALSO_DESCRIPTIVE';
    assert.equal(f.service.isDestinationCompatible(f.release), true);
    f.deactivate();
    f.context.runtimeRole.roles = ['ALSO_DESCRIPTIVE'];
    assert.throws(() => f.service.validateDestination(f.release), /destination module/);
    assert.equal(f.service.isDestinationCompatible(f.release), false);
});

test('missing schema, remote-only model and malformed destinations reject before receipts', async t => {
    const f = fixture(t);
    for (const schema of [undefined, { model: false }, {}]) {
        f.module.rawSchema.stock = schema;
        await assert.rejects(f.service.preparePlan({ tenant: 'tenantA', releaseRequest: {
            dataType: 'core', releaseCodes: [f.release.releaseCode]
        } }), /schema owner/);
        assert.equal(f.effects.length, 0);
    }
    f.module.rawSchema.stock = { model: true };
    delete f.header.sourcePackage.seed.options.schemaName;
    f.write();
    assert.throws(() => f.service.validateDestination(f.release), /explicit schema or index/);
});

test('publication uses explicit context and effective schema, never a role suffix', t => {
    const f = fixture(t);
    f.module.rawSchema.stock.backoffice = { lifecycle: 'PUBLISHABLE' };
    f.release.lifecycle = 'PUBLISHABLE';
    f.context.runtimeRole.code = 'SOMETHING_STAGED';
    for (const publication of [undefined, 'ONLINE', 'OPERATIONAL']) {
        f.context.runtimeRole.publication = publication;
        assert.throws(() => f.service.validateDestination(f.release), /publication context|Staged/);
    }
    f.context.runtimeRole = { code: 'ARBITRARY', publication: 'STAGED' };
    assert.equal(f.service.validateDestination(f.release), true);
    f.release.lifecycle = 'REFERENCE';
    assert.throws(() => f.service.validateDestination(f.release), /publication context/);
    f.release.lifecycle = 'PUBLISHABLE';
    f.module.rawSchema.stock.backoffice.mutationMode = 'READ_ONLY';
    assert.throws(() => f.service.validateDestination(f.release), /publication context/);
});

test('retired allowances, environment limits and unavailable installer stay fail closed', t => {
    const f = fixture(t);
    f.policy.allowedDestinationRoles = ['RETIRED_ROLE_LABEL'];
    assert.throws(() => f.service.validateDestination(f.release), /retired/);
    delete f.policy.allowedDestinationRoles;
    f.release.environmentScope = ['PRODUCTION'];
    assert.throws(() => f.service.validateDestination(f.release), /environment/);
    f.release.environmentScope = ['ALL'];
    f.release.installer = 'OWNER_INSTALLER';
    assert.throws(() => f.service.validateDestination(f.release), /installer/);
    f.policy.installers.OWNER_INSTALLER = 'SelectedInstaller';
    SERVICE.SelectedInstaller = { preflightContribution() { throw Error('not invoked'); }, installContribution() { throw Error('not invoked'); } };
    assert.equal(f.service.validateDestination(f.release), true);
});

test('fresh layered schema override applies and runtime-local history retains original tenant', async t => {
    const f = fixture(t);
    assert.equal(f.service.validateDestination(f.release), true);
    f.module.rawSchema.stock = { model: false };
    assert.equal(f.service.isDestinationCompatible(f.release), false);
    assert.deepEqual(await f.service.getInstallations('tenantB'), []);
    assert.equal(f.effects.length, 1);
    assert.equal(f.effects[0].tenant, 'tenantB');
    assert.deepEqual(f.effects[0].query, {});
});

test('folder lifecycle does not synthesize publication policy from runtime labels', t => {
    const f = fixture(t);
    f.context.runtimeRole = { code: 'WCMS_STAGED', publication: 'STAGED' };
    const section = f.service.syntheticReleaseSection({ name: 'independent' }, 'core', 'core-v001');
    assert.equal(section.lifecycle, 'REFERENCE');
    assert.equal(section.publicationPolicy, 'NONE');
    assert.equal(section.destinationRole, undefined);
});

test('disabled guards and malformed explicit module overrides cannot restore fallback admission', t => {
    const f = fixture(t);
    f.policy.destinationEnforced = false;
    assert.throws(() => f.service.validateDestination(f.release), /cannot be disabled/);
    f.policy.destinationEnforced = true;
    for (const value of ['', null, false]) {
        f.header.sourcePackage.seed.options.moduleName = value;
        f.write();
        assert.throws(() => f.service.validateDestination(f.release), /destination module is invalid/);
    }
});

test('index destinations require selected owner validation before installation claims', async t => {
    const f = fixture(t);
    delete f.header.sourcePackage.seed.options.schemaName;
    f.header.sourcePackage.seed.options.indexName = 'stockIndex';
    f.write();
    assert.throws(() => f.service.validateDestination(f.release), /index owner validator/);
    f.policy.targetValidators.inventory = 'IndexOwner';
    SERVICE.IndexOwner = { validateImportTarget: async () => false };
    assert.equal(f.service.validateDestination(f.release), true);
    await assert.rejects(f.service.preparePlan({ tenant: 'tenantA', releaseRequest: {
        dataType: 'core', releaseCodes: [f.release.releaseCode]
    } }), /not admitted/);
    assert.equal(f.effects.length, 0);
});

test('only owner-selected saveAll on a sealed explicit Staged source release can target a read-only source schema', t => {
    const f = fixture(t);
    const owner = NODICS.getRawModule('sourcePackage');
    const data = path.join(owner.path, 'data');
    const [file] = f.release.declaredFiles;
    const hash = () => require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(data, file))).digest('hex');
    const section = { ...f.release, kind: 'DATA_RELEASE', owningDomain: 'test', sensitivity: 'INTERNAL',
        lifecycle: 'PUBLISHABLE', selectionPolicy: 'EXPLICIT', publicationPolicy: 'REQUIRED',
        initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE',
        versioningPolicy: 'IMMUTABLE', files: { [file]: hash() } };
    const manifest = { module: owner.name, contractVersion: 2, sections: { seed: section } };
    const seal = () => fs.writeFileSync(path.join(data, 'manifest.json'), JSON.stringify(manifest));
    seal();
    Object.assign(f.release, { selectionPolicy: 'EXPLICIT', lifecycle: 'PUBLISHABLE',
        checksum: f.service.releaseFileChecksum(section.files, []) });
    const schema = f.module.rawSchema.stock;
    schema.backoffice = { mutationMode: 'READ_ONLY', mutationPolicy: { publishRequired: true } };
    schema.dataRelease = { stagedSourceOperation: 'saveAll' };
    f.context.runtimeRole.publication = 'STAGED';
    assert.equal(f.service.validateDestination(f.release), true);
    assert.equal(authoring.describe(schema).authoringAllowed, false);

    for (const stage of ['ONLINE', 'OPERATIONAL']) {
        f.context.runtimeRole.publication = stage;
        assert.throws(() => f.service.validateDestination(f.release), /Staged/);
    }
    f.context.runtimeRole.publication = 'STAGED';
    section.selectionPolicy = 'DEFAULT'; seal();
    assert.throws(() => f.service.validateDestination(f.release), /selection policy/);
    // Matching DEFAULT is valid for Core, but never admits an implicit sample.
    f.release.selectionPolicy = 'DEFAULT';
    assert.equal(f.service.validateDestination(f.release), true);
    section.dataType = f.release.dataType = 'sample'; seal();
    assert.throws(() => f.service.validateDestination(f.release), /selection policy/);
    section.dataType = f.release.dataType = 'core';
    section.selectionPolicy = f.release.selectionPolicy = 'EXPLICIT'; seal();
    delete schema.dataRelease;
    f.header.sourcePackage.seed.options.stagedSourceOperation = 'saveAll'; f.write();
    assert.throws(() => f.service.validateDestination({ ...f.release }), /publication context/);
    schema.dataRelease = { stagedSourceOperation: 'saveAll' };
    f.header.sourcePackage.seed.options.operation = 'remove'; f.write();
    assert.throws(() => f.service.validateDestination({ ...f.release }), /publication context/);
    f.header.sourcePackage.seed.options.operation = 'saveAll'; f.write();
    assert.throws(() => f.service.validateDestination(f.release), /manifest seals/);
    section.files[file] = hash(); seal();
    assert.throws(() => f.service.validateDestination(f.release), /manifest seals/);
    assert.equal(f.effects.length, 0);
});

test('a sealed Staged model write needs the original operator group and exact active release context', async t => {
    const f = fixture(t);
    const schema = f.module.rawSchema.stock;
    schema.backoffice = { mutationMode: 'READ_ONLY', mutationPolicy: { publishRequired: true } };
    schema.dataRelease = { stagedSourceOperation: 'saveAll', stagedSourceWriterGroups: ['stockWriter'] };
    f.context.runtimeRole.publication = 'STAGED';
    const options = f.header.sourcePackage.seed.options;
    options.dataFilePrefix = 'seed';
    f.write();
    const owner = NODICS.getRawModule('sourcePackage');
    const file = f.release.declaredFiles[0];
    const files = { [file]: require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(owner.path, 'data', file))).digest('hex') };
    const section = {
        ...f.release, kind: 'DATA_RELEASE', owningDomain: 'test', sensitivity: 'INTERNAL',
        lifecycle: 'PUBLISHABLE', selectionPolicy: 'EXPLICIT', publicationPolicy: 'REQUIRED',
        initialPublicationPolicy: 'ADMIN_INITIATED', removalPolicy: 'UNPUBLISH_OR_RETIRE',
        versioningPolicy: 'IMMUTABLE', files,
    };
    fs.writeFileSync(path.join(owner.path, 'data', 'manifest.json'), JSON.stringify({
        module: owner.name, contractVersion: 2, sections: { seed: section },
    }));
    Object.assign(f.release, { selectionPolicy: 'EXPLICIT', lifecycle: 'PUBLISHABLE',
        checksum: f.service.releaseFileChecksum(files, []) });
    const tenant = 'tenantA';
    const schemaModel = { schemaName: 'stock', rawSchema: schema };
    const generated = { tenant, schemaModel, authData: { userGroups: ['stockWriter'] } };
    const checks = [];
    const model = SERVICE.DefaultStockService = { saveAll: async request => {
        checks.push(f.service.hasStagedSourceWriteAccess(request));
        assert.equal(f.service.hasStagedSourceWriteAccess({ ...request, tenant: 'tenantB' }), false);
        assert.equal(f.service.hasStagedSourceWriteAccess({ ...request, schemaModel: { ...schemaModel, schemaName: 'other' } }), false);
        return {};
    } };
    f.service.operationReleases = async () => [{ ...f.release, status: 'NOT_INSTALLED' }];
    f.service.recordInstallation = async () => true;
    f.service.invokeImport = async request => {
        request.importRun = { status: 'COMPLETED', summary: { recordsSucceeded: 1 } };
        f.service.bindOperationMetadataRun(request);
        const dispatch = { tenant, header: { options }, importRun: request.importRun };
        await f.service.executeStagedSourceOperation(dispatch, generated, model);
        await f.service.executeStagedSourceOperation({ ...dispatch, importRun: { ...dispatch.importRun } }, generated, model);
        await f.service.executeStagedSourceOperation({ ...dispatch, header: { options: { ...options, dataFilePrefix: 'other' } } }, generated, model);
        assert.equal(f.service.hasStagedSourceWriteAccess(generated), false);
    };
    for (const userGroups of [['stockWriter'], []]) {
        assert.equal(f.service.validateDestination(f.release), true);
        await f.service.executePreparedPlan({ tenant, authData: { userGroups } }, {
            tenant, dataType: 'core', releases: [f.release],
        });
    }
    assert.deepEqual(checks, [true, false, false, false, false, false]);
});

test('canonical publishable sample sections declare explicit selection before Staged admission', () => {
    const root = path.resolve(__dirname, '../../../../../..');
    const manifests = [
        'nodics.accelerators/modules/nexus/modules/nexus.web/data/manifest.json',
        'nodics.wcms/modules/cms/data/manifest.json',
        'nodics.commerce/modules/baseCommerce/modules/product/data/manifest.json',
    ];
    let checked = 0;
    for (const file of manifests) {
        const manifest = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
        for (const [code, section] of Object.entries(manifest.sections)) {
            if (section.kind !== 'DATA_RELEASE' || section.dataType !== 'sample' || section.lifecycle !== 'PUBLISHABLE') continue;
            assert.equal(section.selectionPolicy, 'EXPLICIT', manifest.module + ':' + code);
            checked++;
        }
    }
    assert(checked >= 5);
});

// Retain actual owner-graph integration coverage alongside isolated admission regressions.
const lodash = require("lodash");
const root = path.resolve(__dirname, "../../../../../..");
function setup(role = "WCMS_ONLINE") {
  const properties = lodash.merge(
    {},
    require("../config/properties"),
    require(path.join(root, "nodics.wcms/config/properties")),
    { runtimeRole: { code: role, publication: role === "WCMS_STAGED" ? "STAGED" : "ONLINE" }, environment: { class: "LOCAL" } },
  );
  const modules = Object.fromEntries(
    ["cms", "media", "wcms", "editorial"].map((name, index) => [
      name,
      {
        name,
        index: "60." + index,
        parent: "nodics.wcms",
        path: path.join(root, "nodics.wcms/modules", name),
      },
    ]),
  );
  const schemas = {};
  let effects = 0;
  global.CONFIG = { get: (key) => properties[key] };
  global.NODICS = {
    getActiveModules: () => Object.keys(modules),
    getRawModule: (name) => modules[name],
    getModule: (name) => modules[name] && { ...modules[name], rawSchema: schemas[name] || {} },
    getSelectedEnvironmentName: () => "local",
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultSchemaAuthoringPolicyService: authoring,
    DefaultDataInstallationService: {
      get: async () => {
        effects += 1;
        throw new Error("Unexpected receipt read");
      },
    },
  };
  const staged = base.discoverReleases("init").find(release => release.releaseCode === "cms:init-v001");
  for (const {moduleName, schemaName} of base.releaseDestinationTargets(staged)) {
    (schemas[moduleName] ??= {})[schemaName] = { model: true };
  }
  return { properties, effects: () => effects };
}

test("actual Online initializer excludes Media Process releases without the selected installer", async () => {
  const fixture = setup();
  const discovered = base.discoverReleases("init");
  const candidate = discovered.find(
    (release) => release.releaseCode === "media:mediaPublicationWorkflow",
  );
  assert.ok(
    candidate,
    "Current Media workflow must exercise real discovery",
  );
  assert.equal(candidate.destinationRole, "PROCESS");
  assert.equal(candidate.sourceRoot, "init-v001");
  assert.equal(candidate.invalidManifest, undefined);
  assert.equal(base.isDestinationCompatible(candidate), false);
  const result = await base.installStartupReleases({
    tenant: "default",
    modules: NODICS.getActiveModules(),
  });
  assert.deepEqual(result, { skipped: true, reason: "NO_INIT_RELEASES" });
  assert.equal(fixture.effects(), 0);
  await assert.rejects(
    base.preparePlan({
      tenant: "default",
      releaseRequest: {
        dataType: "init",
        releaseCodes: [candidate.releaseCode],
      },
    }),
    { code: "ERR_IMP_00004" },
  );
  assert.equal(
    fixture.effects(),
    0,
    "Explicit request must refuse before receipt/import operations",
  );
});

test("actual Staged release selection remains admitted; Online cannot import Staged or Process releases", () => {
  setup("WCMS_STAGED");
  const staged = base
    .discoverReleases("init")
    .find((release) => release.releaseCode === "cms:init-v001");
  assert.ok(staged);
  assert.equal(staged.destinationRole, "WCMS_STAGED");
  assert.equal(base.isDestinationCompatible(staged), true);
  assert.equal(base.validateDestination(staged), true);
  setup();
  assert.equal(base.isDestinationCompatible(staged), false);
  assert.throws(() => base.validateDestination(staged), {
    code: "ERR_IMP_00004",
  });
  const process = base
    .discoverReleases("init")
    .find((release) => release.releaseCode === "cms:cmsPublicationApproval");
  assert.equal(base.isDestinationCompatible(process), false);
  assert.throws(() => base.validateDestination(process), {
    code: "ERR_IMP_00004",
  });
});

test("manual destination policy requires local ownership and refuses retired role allowances", () => {
  const { properties } = setup();
  const release = { moduleName: "cms", environmentScope: ["ALL"] };
  assert.equal(base.validateDestination(release), true);
  assert.equal(base.isDestinationCompatible({ ...release, moduleName: "absent" }), false);
  assert.equal(base.isDestinationCompatible({ ...release, environmentScope: ["PRODUCTION"] }), false);
  properties.data.dataReleases.allowedDestinationRoles = ["WCMS_ONLINE"];
  assert.equal(base.isDestinationCompatible(release), false);
  assert.throws(() => base.validateDestination(release), /allowedDestinationRoles is retired/);
});
