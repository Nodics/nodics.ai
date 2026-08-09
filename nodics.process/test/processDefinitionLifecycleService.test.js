/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/test/processDefinitionLifecycleService
 * @description Validates draft, validation, publish, archive, and delete behavior for Process definitions without requiring a live database.
 * @layer test
 * @owner flowCore
 * @override Customer process overlays may extend lifecycle policy while preserving draft-only mutation and immutable publish semantics.
 */
const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') return 'default';
        if (key === 'process') return { designer: {} };
        return undefined;
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const definitions = [];
const versions = [];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function matches(model, query) {
    return Object.keys(query || {}).every(key => model[key] === query[key]);
}

function createGeneratedService(store) {
    return {
        get: async function (request) {
            return { result: store.filter(item => matches(item, request.query)).map(clone) };
        },
        save: async function (request) {
            store.push(clone(request.model));
            return { result: clone(request.model) };
        },
        update: async function (request) {
            let update = request.model && request.model.$set || request.model || {};
            let count = 0;
            store.forEach(item => {
                if (matches(item, request.query)) {
                    Object.assign(item, clone(update));
                    count += 1;
                }
            });
            return { result: { n: count } };
        },
        remove: async function (request) {
            let before = store.length;
            for (let index = store.length - 1; index >= 0; index -= 1) {
                if (matches(store[index], request.query)) {
                    store.splice(index, 1);
                }
            }
            return { result: { n: before - store.length } };
        }
    };
}

global.SERVICE = {
    DefaultProcessGraphValidationService: require('../modules/workflow/modules/flowCore/src/service/designer/defaultProcessGraphValidationService'),
    DefaultProcessDefinitionService: createGeneratedService(definitions),
    DefaultProcessDefinitionVersionService: createGeneratedService(versions)
};

const lifecycleService = require('../modules/workflow/modules/flowCore/src/service/definition/defaultProcessDefinitionLifecycleService');
const validGraph = Object.freeze({
    nodes: [
        { code: 'start', type: 'START' },
        { code: 'review', type: 'TASK' },
        { code: 'end', type: 'END' }
    ],
    transitions: [
        { code: 'start_to_review', source: 'start', target: 'review' },
        { code: 'review_to_end', source: 'review', target: 'end' }
    ]
});

(async function run() {
    let created = await lifecycleService.createDefinition({
        tenant: 'default',
        authData: { loginId: 'admin' },
        processDefinition: {
            code: 'contentApproval',
            name: 'Content Approval',
            graph: clone(validGraph)
        }
    });
    assert.strictEqual(created.code, 'SUC_PROCESS_00001');
    assert.strictEqual(definitions[0].status, 'DRAFT');
    assert.strictEqual(definitions[0].currentVersion, 0);
    assert.strictEqual(definitions[0].validation.valid, true);

    await assert.rejects(
        () => lifecycleService.createDefinition({ tenant: 'default', processDefinition: { code: 'contentApproval', graph: clone(validGraph) } }),
        error => error.code === 'ERR_PROCESS_00003',
    );

    let updated = await lifecycleService.updateDraft({
        tenant: 'default',
        definitionCode: 'contentApproval',
        processDefinition: {
            description: 'Updated draft',
            graph: clone(validGraph)
        }
    });
    assert.strictEqual(updated.code, 'SUC_PROCESS_00002');
    assert.strictEqual(updated.data.draftRevision, 2);
    assert.strictEqual(definitions[0].description, 'Updated draft');

    let validation = await lifecycleService.validateDraft({ tenant: 'default', definitionCode: 'contentApproval' });
    assert.strictEqual(validation.code, 'SUC_PROCESS_00003');
    assert.strictEqual(validation.data.valid, true);

    let published = await lifecycleService.publishDraft({
        tenant: 'default',
        authData: { loginId: 'publisher' },
        definitionCode: 'contentApproval'
    });
    assert.strictEqual(published.code, 'SUC_PROCESS_00004');
    assert.strictEqual(published.data.version, 1);
    assert.strictEqual(definitions[0].status, 'PUBLISHED');
    assert.strictEqual(versions.length, 1);
    assert.strictEqual(versions[0].publishedBy, 'publisher');
    assert(versions[0].checksum);

    await assert.rejects(
        () => lifecycleService.updateDraft({ tenant: 'default', definitionCode: 'contentApproval', processDefinition: { description: 'not allowed' } }),
        error => error.code === 'ERR_PROCESS_00005',
    );

    let archived = await lifecycleService.deleteOrArchive({ tenant: 'default', definitionCode: 'contentApproval' });
    assert.strictEqual(archived.code, 'SUC_PROCESS_00005');
    assert.strictEqual(archived.data.status, 'ARCHIVED');
    assert.strictEqual(definitions[0].active, false);
    assert.strictEqual(versions[0].status, 'ARCHIVED');

    await lifecycleService.createDefinition({
        tenant: 'default',
        processDefinition: {
            code: 'draftOnly',
            name: 'Draft Only',
            graph: clone(validGraph)
        }
    });
    let deletedDraft = await lifecycleService.deleteOrArchive({ tenant: 'default', definitionCode: 'draftOnly' });
    assert.strictEqual(deletedDraft.data.status, 'DELETED_DRAFT');
    assert.strictEqual(definitions.some(definition => definition.code === 'draftOnly'), false);

    console.log('Process definition lifecycle service contract passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
