/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE file. */
'use strict';
/** @module nPublish/test/publicationSetupOwners @description Integrates configured setup permissions and exact retained-source hooks with existing domain owners using independent partner data. @layer test @owner nPublish */
const test = require('node:test'), assert = require('node:assert/strict'), path = require('node:path');
const commerce = path.resolve(__dirname, '../../../../nodics.commerce/modules/baseCommerce/modules');
for (const domain of ['pricing', 'inventory', 'tax', 'promotion']) {
    test(domain + ' setup uses existing capture grant and exact retained partner source membership', async t => {
        const prior = global.CLASSES; t.after(() => { global.CLASSES = prior; });
        global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
        const prefix = domain[0].toUpperCase() + domain.slice(1);
        const base = require(path.join(commerce, domain, 'src/service/default' + prefix + 'PublicationService'));
        const properties = require(path.join(commerce, domain, 'config/properties'));
        const routes = require(path.join(commerce, domain, 'src/router/routers'));
        const find = value => value && typeof value === 'object' ? value.createGoverned || Object.values(value).map(find).find(Boolean) : undefined;
        assert.equal(properties.publish.setup.permissions[domain], find(routes).permission);
        const request = { tenant: 'partner', enterpriseCode: 'partnerEnterprise' };
        const input = { publicationCode: 'partner-capture', rootType: 'policy', rootCode: 'partnerRoot', references: [{ schema: 'policy', code: 'partnerRoot', versionId: 4 }] };
        const item = { code: input.publicationCode, domain, rootType: input.rootType, rootCode: input.rootCode, sourceVersion: 'partnerDigest', input };
        const release = { code: 'partnerDigest', payload: { tenant: 'partner', enterpriseCode: 'partnerEnterprise', records: [{ schema: 'policy', policy: { code: 'partnerRoot', versionId: 4 } }] } };
        let captures = 0;
        const service = Object.assign(Object.create(base), { getVersion: async () => release,
            createGoverned: (r, value) => { assert.equal(r, request); assert.equal(value, input); captures++; return 'captured'; } });
        assert.equal(service.prepareSetup(request, item), 'captured'); assert.equal(captures, 1);
        assert.equal(await service.validateSetup({}, request, item), 'partnerDigest');
        const publication = { sourceVersion: 'partnerDigest', activationOperation: { previousOnlineVersion: null } };
        const receipt = { applied: true, tenant: 'partner', enterpriseCode: 'partnerEnterprise', fingerprint: 'partnerDigest', previousOnlineVersion: null };
        assert.equal(service.isSetupReceiptCommitted(publication, request, receipt), true);
        for (const change of [{ applied: false, committed: true }, { tenant: 'other' }, { enterpriseCode: 'other' },
            { fingerprint: 'other' }, { previousOnlineVersion: 'other' }])
            assert.equal(service.isSetupReceiptCommitted(publication, request, { ...receipt, ...change }), false);
        for (const change of [{ sourceVersion: 'other' }, { input: { ...input, references: [] } },
            { input: { ...input, references: [{ schema: 'policy', code: 'partnerRoot', versionId: 5 }] } },
            { input: { ...input, references: [input.references[0], input.references[0]] } }])
            await assert.rejects(service.validateSetup({}, request, { ...item, ...change }));
        await assert.rejects(service.validateSetup({}, { ...request, tenant: 'foreign' }, item));
        await assert.rejects(service.validateSetup({}, { ...request, enterpriseCode: 'foreign' }, item));
        for (const change of [
            { tenant: 'foreign' }, { enterpriseCode: 'foreign' },
            { records: [{ schema: 'foreign', policy: { code: 'partnerRoot', versionId: 4 } }] },
            { records: [{ schema: 'policy', policy: { code: 'foreign', versionId: 4 } }] },
            { records: [{ schema: 'policy', policy: { code: 'partnerRoot', versionId: 5 } }] },
        ]) {
            service.getVersion = async () => ({ ...release, payload: { ...release.payload, ...change } });
            await assert.rejects(service.validateSetup({}, request, item), { code: 'ERR_PUB_SETUP_INVALID' });
        }
        assert.throws(() => service.prepareSetup(request, { ...item, domain: 'foreign' }));
    });
}
