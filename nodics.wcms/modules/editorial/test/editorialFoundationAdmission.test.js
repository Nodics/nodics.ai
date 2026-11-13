/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module editorial/test/editorialFoundationAdmission
 * @description Qualifies the actual Editorial reference foundation through shared schema policy and nImport discovery without executing installation.
 * @layer test
 * @owner editorial
 * @override Keep source records Staged-only, projections read-only and immutable release evidence unchanged.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const schemas = require('../src/schemas/schemas').editorial;
const ports = require('../../../../nodics.foundation/modules/nData/nImport/import/test/helpers/releaseExecution');
global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };

test('the real Editorial policy foundation is discoverable as reference data only on Staged', async () => {
    const f = ports({ modules: { editorial: { name: 'editorial', path: path.resolve(__dirname, '..'), rawSchema: schemas } },
        runtimeRole: 'WCMS_STAGED' });
    const catalogue = await f.service.getCatalogue({ tenant: 'default', dataType: 'init' });
    const foundation = catalogue.data.find(row => row.releaseCode === 'editorial:init-v001');
    assert.ok(foundation, 'the required content-type foundation must not disappear from the catalogue');
    assert.equal(foundation.lifecycle, 'REFERENCE');
    assert.equal(foundation.publicationPolicy, 'NONE');
    assert.equal(foundation.status, 'NOT_INSTALLED');
    const release = f.service.discoverReleases('init').find(row => row.releaseCode === foundation.releaseCode);
    assert.equal(f.service.validateDestination(release), true);
    for (const stage of ['ONLINE', 'OPERATIONAL', undefined]) {
        f.publication = stage;
        assert.throws(() => f.service.validateDestination(release));
        const denied = await f.service.getCatalogue({ tenant: 'default', dataType: 'init' });
        assert.ok(!denied.data.some(row => row.releaseCode === foundation.releaseCode));
    }
    assert.equal(f.imports.length, 0);
    assert.equal(f.installations.length, 0);
});

test('content-type reference classification preserves article, translation and projection guards', () => {
    const f = ports({ modules: { editorial: { name: 'editorial', path: path.resolve(__dirname, '..'), rawSchema: schemas } },
        runtimeRole: 'WCMS_STAGED' });
    const policy = SERVICE.DefaultSchemaAuthoringPolicyService;
    for (const stage of ['STAGED', 'ONLINE', 'OPERATIONAL', undefined]) {
        f.publication = stage;
        const type = policy.describe(schemas.editorialContentType);
        assert.equal(type.publishRequired, false);
        assert.equal(type.authoringAllowed, stage === 'STAGED');
        for (const name of ['editorialArticle', 'editorialAuthor', 'editorialTaxonomyTerm']) {
            assert.equal(policy.describe(schemas[name]).publishRequired, true);
            assert.equal(policy.describe(schemas[name]).authoringAllowed, stage === 'STAGED');
        }
        const locales = policy.describe(schemas.editorialArticleLocalization);
        assert.equal(locales.publishRequired, true);
        assert.equal(locales.authoringAllowed, false);
        assert.equal(locales.stagedSourceOperation, stage === 'STAGED' ? 'saveAll' : undefined);
        for (const name of ['editorialOnlineArticle', 'editorialPublicationReceipt']) {
            assert.equal(policy.describe(schemas[name]).authoringAllowed, false);
        }
    }
});
