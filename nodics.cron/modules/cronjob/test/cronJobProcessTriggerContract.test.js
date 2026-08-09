/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.cron/modules/cronjob/test/cronJobProcessTriggerContract.test
 * @description Validates Cron-owned scheduled jobs can hand off to Process-owned trigger execution without moving workflow ownership into Cron.
 * @layer test
 * @owner cronjob
 * @override Project modules may add custom trigger target tests while preserving this Process/Cron ownership boundary.
 */

const assert = require('assert');

const executionRequests = [];
const pipelineTransitions = [];

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    }
};

global.ENUMS = {
    CronJobState: {
        RUNNING: { key: 'RUNNING' }
    }
};

global.SERVICE = {
    DefaultCronJobService: {
        update: function () {
            return Promise.resolve({ code: 'SUC_JOB_00000' });
        }
    },
    DefaultCronJobConfigurationService: {
        getJobInterceptors: function () {
            return undefined;
        },
        getJobValidators: function () {
            return undefined;
        }
    },
    DefaultProcessRuntimeLifecycleService: {
        executeTrigger: function (request) {
            executionRequests.push(request);
            return Promise.resolve({
                code: 'SUC_PROCESS_00011',
                data: {
                    correlationId: request.runtimeOperation.correlationId,
                    execution: { instance: { code: 'instance-1' } }
                }
            });
        }
    }
};

const triggerHandler = require('../src/service/trigger/defaultCronJobTriggerHandlerService');
triggerHandler.LOG = {
    debug: function () {},
    error: function () {}
};

function processStub() {
    return {
        nextSuccess: function (request, response) {
            pipelineTransitions.push({ type: 'success', response });
        },
        error: function (request, response, error) {
            pipelineTransitions.push({ type: 'error', error });
        }
    };
}

(async function run() {
    const definition = {
        code: 'dailyContentApprovalJob',
        tenant: 'default',
        startTime: new Date('2026-08-09T10:00:00.000Z'),
        trigger: { expression: '0 10 * * *' },
        jobDetail: {
            processTrigger: {
                triggerCode: 'dailyContentApproval',
                instanceCode: 'dailyContentApproval-20260809',
                context: {
                    businessDate: '2026-08-09'
                }
            }
        }
    };
    const response = {};
    triggerHandler.triggerProcess({ definition, job: { code: 'runtime-job' } }, response, processStub());
    await new Promise(resolve => setImmediate(resolve));

    assert.strictEqual(pipelineTransitions[0].type, 'success', 'Process trigger job should continue the Cron pipeline');
    assert.strictEqual(executionRequests.length, 1, 'Process trigger executor should be called once');
    assert.strictEqual(executionRequests[0].tenant, 'default', 'Cron should preserve tenant when calling Process');
    assert.strictEqual(executionRequests[0].triggerCode, 'dailyContentApproval', 'Cron should pass Process trigger code');
    assert.strictEqual(executionRequests[0].authData.serviceId, 'cronjob', 'Cron should use service identity for Process handoff');
    assert.strictEqual(executionRequests[0].runtimeOperation.instanceCode, 'dailyContentApproval-20260809', 'Cron should pass optional Process instance idempotency code');
    assert.strictEqual(executionRequests[0].runtimeOperation.context.cronJobCode, 'dailyContentApprovalJob', 'Cron job code should be included in Process context');
    assert.strictEqual(executionRequests[0].runtimeOperation.context.businessDate, '2026-08-09', 'Process context should include configured trigger context');

    delete global.SERVICE.DefaultProcessRuntimeLifecycleService;
    const missingRuntimeResponse = {};
    triggerHandler.triggerProcess({
        definition: {
            code: 'missingProcessRuntimeJob',
            tenant: 'default',
            jobDetail: { processTrigger: { triggerCode: 'dailyContentApproval' } }
        },
        job: {}
    }, missingRuntimeResponse, processStub());
    await new Promise(resolve => setImmediate(resolve));

    const lastTransition = pipelineTransitions[pipelineTransitions.length - 1];
    assert.strictEqual(lastTransition.type, 'error', 'Cron should fail closed when Process runtime executor is missing');
    assert.strictEqual(lastTransition.error.code, 'ERR_JOB_00008', 'Missing Process runtime should use Cron status definition');

    console.log('CronJob Process trigger contract validated: scheduled handoff preserves module ownership');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
