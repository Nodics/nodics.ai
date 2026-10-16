/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/test/eWasteOutcomeTemplateOwnership @description Verifies layered outcome presentation without enabling delivery or mutating frozen intents. @owner eWaste @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const templates = require(
    path.join(
        root,
        'nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService',
    ),
);
const defaults = require(
    path.join(root, 'nodics.communication/modules/commsCore/config/properties'),
).communication;
test('Telegram and in-app outcomes come from the same selected domain resource contract', (t) => {
    const previous = global.NODICS;
    t.after(() => {
        global.NODICS = previous;
    });
    global.NODICS = {
        getIndexedModules: () => [],
        getRawModule: (name) =>
            name === 'eWaste'
                ? { path: path.resolve(__dirname, '..') }
                : undefined,
    };
    const policy = structuredClone(defaults);
    policy.templateResources.modules = { eWaste: true };
    policy.templateResources.selections = { WASTE_REVIEW_OUTCOME_V1: true };
    for (const channel of ['TELEGRAM', 'IN_APP']) {
        const command = {
            channel,
            locale: 'en',
            templateCode: 'WASTE_REVIEW_OUTCOME_V1',
        };
        const template = templates.resolve(command, policy);
        assert.equal(template.ownerModule, 'eWaste');
        assert.equal(template.version, 2);
        assert.equal(template.purpose, 'WASTE_REVIEW_OUTCOME');
        const rendered = templates.render(
            template,
            {
                submissionCode: 'test-item',
                status: 'APPROVED',
                comment: '',
                detailUrl: 'https://example.test/item',
            },
            policy,
        );
        assert(rendered.body.includes('Submission test-item: APPROVED.'));
        assert.equal(rendered.subject, 'Recycling review outcome');
        assert.equal(rendered.html, undefined);
        assert(rendered.templateIdentity.checksum);
        assert.throws(() =>
            templates.render(template, { undeclared: 'value' }, policy),
        );
        const unselected = structuredClone(policy);
        unselected.templateResources.selections.WASTE_REVIEW_OUTCOME_V1 = false;
        assert.equal(templates.resolve(command, unselected), undefined);
    }
    assert.deepEqual(policy.providers, {});
    assert.equal(
        require('../config/properties').eWaste.outcomeCommunication.enabled,
        false,
    );
});
