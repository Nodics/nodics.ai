/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const lifecycle = require('../src/service/defaultRuleDefinitionLifecycleService');

const rows = {};
const band = { code:'BANDS', status:'DRAFT', currentVersion:1, draftRevision:2 };
const bandVersion = { code:'BANDS_v1', bandSetCode:'BANDS', version:1, status:'ACTIVE', bands:[] };
const audit = [];

function result(value) { return { result:value }; }

global.SERVICE = {
    DefaultRuleDefinitionValidationService: {
        validateDefinition: () => ({ valid:false, issues:[{ code:'RULE_GROUPS_REQUIRED' }] }),
        validateBands: () => ({ valid:false, issues:[{ code:'BANDS_REQUIRED' }] }),
        validateDates: () => ({ valid:true, issues:[] })
    },
    DefaultRuleAuditService: { record: async (request, event) => { audit.push(event); return event; } },
    DefaultRuleSetService: {
        get: async request => result(rows[request.query.code] ? [rows[request.query.code]] : []),
        save: async request => { rows[request.model.code] = { ...request.model }; return result(rows[request.model.code]); },
        update: async request => {
            let row = rows[request.query.code];
            if (row) {
                const patch = request.model.$set || request.model;
                ['validation', 'lastSimulation', 'approval'].forEach(key => assert.notStrictEqual(patch[key], null, key + ' must not violate the object schema'));
                Object.assign(row, patch);
                Object.keys(request.model.$unset || {}).forEach(key => delete row[key]);
            }
            return result({ modifiedCount:row ? 1 : 0 });
        }
    },
    DefaultScoreBandSetService: {
        get: async request => result(request.query.code === band.code ? [band] : []),
        update: async request => { Object.assign(band, request.model.$set || request.model); return result({ modifiedCount:1 }); }
    },
    DefaultScoreBandSetVersionService: {
        get: async request => result(request.query.bandSetCode === 'BANDS' && Number(request.query.version) === 1 ? [bandVersion] : [])
    },
    DefaultRuleSetVersionService: { get:async () => result([{ ...rows.POLICY, version:1, definition:{ groups:[] } }]), save:async request => result(request.model) }
};

global.CONFIG = { get: () => ({}) };

(async () => {
    const created = await lifecycle.createRuleSet({
        tenant:'default',
        authData:{ loginId:'creator' },
        model:{
            code:'POLICY',
            consumerModule:'sample',
            policyType:'SCORE',
            propertyProviderCode:'sample',
            scopeType:'DOMAIN',
            scopeCode:'TEST',
            scoreBandSetCode:'BANDS',
            definition:{ groups:[] }
        }
    });
    assert.strictEqual(created.data.status, 'DRAFT');
    assert.strictEqual(created.data.validation.valid, false,
        'business users must be able to save an incomplete draft before it is publishable');

    const matching = {
        ...created.data,
        draftRevision:1,
        lastSimulation:{
            draftRevision:1,
            sourceHash:'hash-1',
            bandSetCode:'BANDS',
            bandSetVersion:1
        }
    };
    assert.strictEqual((await lifecycle.assertCurrentSimulation({ tenant:'default' }, matching)).version, 1);

    await assert.rejects(
        lifecycle.assertCurrentSimulation({ tenant:'default' }, {
            ...matching,
            draftRevision:2
        }),
        /successful simulation/
    );

    rows.POLICY.lastSimulation = matching.lastSimulation;
    rows.POLICY.approval = { status:'REJECTED' };
    await lifecycle.updateRuleSetDraft({ tenant:'default', ruleSetCode:'POLICY', model:{ definition:{ groups:[] }, lastSimulation:{ forged:true }, approval:{ status:'APPROVED' } } });
    assert.strictEqual(rows.POLICY.draftRevision, 2);
    assert.strictEqual(rows.POLICY.lastSimulation, undefined);
    assert.strictEqual(rows.POLICY.approval, undefined);
    rows.POLICY.status = 'ACTIVE';
    rows.POLICY.currentVersion = 1;
    rows.POLICY.lastSimulation = matching.lastSimulation;
    rows.POLICY.approval = { status:'APPROVED' };
    await lifecycle.prepareNextRuleSetDraft({ tenant:'default', ruleSetCode:'POLICY' });
    assert.strictEqual(rows.POLICY.status, 'DRAFT');
    assert.strictEqual(rows.POLICY.draftRevision, 3);
    ['validation','lastSimulation','approval'].forEach(key => assert.strictEqual(rows.POLICY[key], undefined));
    assert(audit.some(event => event.eventType === 'RULE_SET_CREATED'));
    console.log('Rules draft-first authoring and current-simulation governance contracts validated');
})().finally(() => {
    delete global.SERVICE;
    delete global.CONFIG;
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
