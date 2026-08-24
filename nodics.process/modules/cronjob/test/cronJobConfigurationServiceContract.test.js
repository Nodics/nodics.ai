/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.process/modules/cronjob/test/cronJobConfigurationServiceContract.test
 * @description Validates Cron configuration caches for interceptors, validators, and default active-job query.
 * @layer test
 * @owner cronjob
 * @override Project modules may add tenant/job validator variants while preserving the default cache contract.
 */

const assert = require('assert');

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    }
};

global.ENUMS = {
    InterceptorType: {
        job: { key: 'job' },
        schema: { key: 'schema' }
    }
};

const prepared = [];
global.SERVICE = {
    DefaultInterceptorConfigurationService: {
        prepareItemInterceptors: function (jobCode, type) {
            prepared.push({ kind: 'interceptor', jobCode, type });
            return { preRun: [], postRun: [] };
        }
    },
    DefaultValidatorConfigurationService: {
        prepareItemValidators: function (tenant, jobCode, type) {
            prepared.push({ kind: 'validator', tenant, jobCode, type });
            return { preRun: [], postRun: [] };
        }
    }
};

const service = require('../src/service/config/defaultCronJobConfigurationService');

const interceptors = service.getJobInterceptors('dailyJob');
assert.deepStrictEqual(interceptors, { preRun: [], postRun: [] }, 'Cron should lazily prepare interceptor cache');

const validators = service.getJobValidators('default', 'dailyJob');
assert.deepStrictEqual(validators, { preRun: [], postRun: [] }, 'Cron should lazily prepare validator cache');
assert.deepStrictEqual(prepared, [
    { kind: 'interceptor', jobCode: 'dailyJob', type: 'job' },
    { kind: 'validator', tenant: 'default', jobCode: 'dailyJob', type: 'schema' }
]);

const query = service.getDefaultQuery();
assert.strictEqual(query.$and[0].active, true, 'Cron default query should require active jobs');
assert(query.$and[1].start.$lt instanceof Date, 'Cron default query should enforce started jobs only');

console.log('CronJob configuration service contract validated');
