/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the repository LICENSE. */
/**
 * @module cms/test/helpers/freshSourceOwnership
 * @description Verifies explicit source ownership through real JS import and schema dispatch.
 * @owner cms
 * @layer test
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const frameworkRoot = path.resolve(__dirname, '../../../../..');
const fileImporter = require(path.join(frameworkRoot, 'nodics.foundation/modules/nData/nImport/jsImport/src/service/init/defaultJsFileDataProcessService'));
const modelImporter = require(path.join(frameworkRoot, 'nodics.foundation/modules/nData/nImport/import/src/service/process/model/defaultModelImportProcessService'));
const schemas = require('../../src/schemas/schemas').cms;
const access = require('../../src/service/designer/defaultCmsDesignerAccessService');
const siteOwned = new Set(['cmsPage', 'cmsPageRoute', 'cmsNavigationNode']);

function assertOwnership(model, schemaName, scope, readOnlyReferenceCodes = []) {
    if (readOnlyReferenceCodes.includes(model.code)) {
        assert.equal(model.authoringScope, undefined, 'reviewed read-only reference must not acquire catalog ownership');
        assert.equal(access.matches(model, scope, 'DefaultCmsComponentService'), false);
        return;
    }
    if (schemaName === 'cmsSite') {
        assert.equal(model.enterpriseCode, 'default');
        assert.equal(model.catalog, scope.catalogCode);
        return;
    }
    const serviceName = 'Default' + schemaName[0].toUpperCase() + schemaName.slice(1) + 'Service';
    const expected = siteOwned.has(schemaName) ? scope
        : { enterpriseCode: scope.enterpriseCode, catalogCode: scope.catalogCode };
    assert.deepEqual(model.authoringScope, expected);
    assert.equal(access.matches(model, scope, serviceName), true);
    assert.equal(access.matches(model, { ...scope, enterpriseCode: 'foreign' }, serviceName), false);
    assert.equal(access.matches(model, { ...scope, catalogCode: 'foreign' }, serviceName), false);
    assert.equal(access.matches(model, { ...scope, siteCode: 'another-owned-site' }, serviceName), !siteOwned.has(schemaName));
    for (const placement of model.cmsComponents || model.subComponents || []) {
        if (!placement || typeof placement !== 'object') continue;
        assert.deepEqual(placement.authoringScope, expected);
        assert.equal(access.matches(placement, scope, 'DefaultCmsComponentDetailService'), true);
        assert(!readOnlyReferenceCodes.includes(placement.target), 'current pages must not need unassigned cross-catalog components');
    }
}

/** Uses real importer mapping/dispatch, substituting only persistence and installed-state reads. */
function registerSourceOwnershipTests(repoRoot, packs) {
    for (const pack of packs) test(pack.site + (pack.sealedHistoricalSource
        ? ': sealed historical import preserves unowned content without authoring admission'
        : ': fresh ownership survives declared JS headers and generated dispatch'), async () => {
        const previous = Object.fromEntries(['SERVICE', 'NODICS', 'CLASSES'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
        try {
            global.NODICS = { getModule: () => ({ rawSchema: schemas }) };
            global.CLASSES = { DataImportError: Error };
            const declared = require(path.join(repoRoot, pack.header));
            for (const prefix of pack.prefixes) {
                const entry = Object.values(declared).flatMap(group => Object.values(group))
                    .find(item => item.options?.dataFilePrefix === prefix);
                assert(entry, prefix + ' must have an actual import header');
                assert.equal(entry.options.operation, 'saveAll');
                const schemaName = entry.options.schemaName;
                assert(schemas[schemaName].definition[schemaName === 'cmsSite' ? 'enterpriseCode' : 'authoringScope']);
                const header = { ...entry, options: { ...entry.options, moduleName: 'cms' }, rawSchema: schemas[schemaName] };
                const file = path.join(repoRoot, pack.dir, prefix + '.js');
                const original = structuredClone(Object.values(require(file)));
                let dispatched;
                const generated = { saveAll: async request => {
                    dispatched = structuredClone(request.models);
                    assert.deepEqual(request.query, entry.query);
                    assert.equal(request.tenant, 'default');
                    return { result: request.models };
                } };
                const importer = Object.assign({}, modelImporter, {
                    ensureLocalSchemaService: async () => generated,
                    reconcileContentPackVersions: async (_request, _service, models) => models,
                    reconcileManagedRevisions: async (_request, _service, models) => models,
                });
                global.SERVICE = { DefaultPipelineService: { start: async (_pipeline, request) =>
                    importer.insertLocalSchemaModel(request, request.models) } };
                const request = { tenant: 'default', files: [file], outputPath: {}, header };
                await new Promise((resolve, reject) => fileImporter.processDataChunk.call(
                    Object.assign({}, fileImporter, { LOG: { debug() {}, warn() {} } }), request, {}, {
                        nextSuccess: resolve, error: (_request, _response, error) => reject(error),
                    }));
                // Complete model equality protects documentation media/content references too.
                assert.deepEqual(dispatched, original, prefix + ': import must preserve the complete source model');
                for (const record of dispatched) {
                    const scope = { enterpriseCode: 'default', catalogCode: pack.catalog, siteCode: pack.site };
                    if (pack.sealedHistoricalSource) {
                        // Historical headers are retention checks, never current authoring authority.
                        assert.equal(record.authoringScope, undefined);
                        if (schemaName === 'cmsSite') assert.equal(record.enterpriseCode, undefined);
                        assert.equal(access.matches(record, scope, 'DefaultCmsComponentService'), false);
                        for (const placement of record.cmsComponents || record.subComponents || []) {
                            if (placement && typeof placement === 'object') assert.equal(placement.authoringScope, undefined);
                        }
                    } else assertOwnership(record, schemaName, scope, pack.readOnlyReferenceCodes);
                }
            }
        } finally {
            for (const [key, descriptor] of Object.entries(previous)) {
                if (descriptor) Object.defineProperty(global, key, descriptor);
                else delete global[key];
            }
        }
    });
}
module.exports = { registerSourceOwnershipTests };
