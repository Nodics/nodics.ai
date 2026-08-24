/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');

global.CLASSES = { NodicsError: class NodicsError extends Error {} };
global.SERVICE = {};

const approval = require('../modules/workflow/src/service/operation/defaultProcessPublicationApprovalService');

const instance = {
    code: 'cmsPublicationApproval-test',
    definitionCode: 'cmsPublicationApproval',
    version: 1,
    status: 'WAITING',
    currentNode: 'approval'
};
let created;
SERVICE.DefaultProcessTaskService = {
    get: async () => ({ result: [] })
};
SERVICE.DefaultProcessRuntimeLifecycleService = {
    requireVersion: async () => ({ status: 'PUBLISHED', graph: { nodes: [{ code: 'approval', type: 'TASK' }] } }),
    findNode: (graph, code) => graph.nodes.find(node => node.code === code),
    createTaskForNode: async (request, currentInstance, node, body) => {
        created = { request, currentInstance, node, body };
        return { code: body.taskCode, status: 'OPEN' };
    }
};

(async () => {
    const request = { tenant: 'default', authData: { serviceId: 'cms' } };
    const task = await approval.repairWaitingTask(request, instance);
    assert.strictEqual(task.status, 'OPEN');
    assert.strictEqual(created.body.taskCode, 'cmsPublicationApproval-test-approval');

    SERVICE.DefaultProcessTaskService.get = async () => ({ result: [{ code: 'existing', status: 'OPEN' }] });
    created = undefined;
    const existing = await approval.repairWaitingTask(request, instance);
    assert.strictEqual(existing.code, 'existing');
    assert.strictEqual(created, undefined, 'an actionable task must never be duplicated');

    console.log('Process publication approval recovery contract passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
