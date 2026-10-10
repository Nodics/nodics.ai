/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/helpers/generatedCouponReadFixture @description Connects real generated Promotion get services, pipeline, Mongo adapter and protected hooks to isolated cursors. No native persistence or qualification. @layer test @owner promotion */
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const root = path.resolve(__dirname, '../../../../../../..');
const foundation = relative => require(path.join(root, 'nodics.foundation/modules', relative));
const mongo = foundation('nDatabase/mongodb/src/schemas/model').default;
const policy = foundation('nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService');

/** Installs actual generated read orchestration over the test's existing authority fixtures. @param {Object} t Test context. @param {Function} records Current original rows by schema. @param {string[]} schemaNames Selected Promotion schemas. @returns {Object} Bounded observations. */
module.exports = function (t, records, schemaNames = ['coupon', 'couponBatch']) {
    const keys = ['_', 'UTILS', 'PIPELINE', 'NODICS', 'CLASSES', 'CONFIG', 'SERVICE'];
    const previous = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
    const stringMethod = Object.getOwnPropertyDescriptor(String.prototype, 'toUpperCaseFirstChar');
    t.after(() => {
        for (const key of keys) {
            if (previous[key]) Object.defineProperty(global, key, previous[key]); else delete global[key];
        }
        if (stringMethod) Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', stringMethod);
        else delete String.prototype.toUpperCaseFirstChar;
    });
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', { configurable: true,
        /** Matches the generated service-name helper and is restored during fixture cleanup. */
        value: function () { return this.charAt(0).toUpperCase() + this.slice(1); } });
    global._ = require('lodash');
    global.UTILS = { isBlank: value => value == null || _.isEmpty(value), isObject: _.isObject,
        generateUniqueCode: () => 'fixture-only' };
    const get = CONFIG.get;
    global.CONFIG = { get: key => ({ schemaPolicies: require('../../config/properties').schemaPolicies,
        accessPoints: { readAccessPoint: 1, fullAccessPoint: 10 }, cache: { enabled: false }, defaultPageNumber: 1 }[key] ?? get(key)) };
    global.CLASSES = { ...CLASSES, PipelineHead: foundation('nPipeline/src/lib/pipelineHead'),
        PipelineNode: foundation('nPipeline/src/lib/pipelineNode') };
    if (typeof CLASSES.NodicsError.enrich !== 'function') CLASSES.NodicsError.enrich = error => error;
    global.PIPELINE = { ...foundation('nPipeline/src/pipelines/pipelines'), ...foundation('nDatabase/database/src/pipelines/pipelines') };
    const log = { debug() {}, warn() {}, error() {}, info() {} };
    const state = { reads: [], hooks: [], findCalls: 0, countCalls: 0, sameRequest: true };
    const schemaOwner = foundation('nDatabase/database/src/service/schema/defaultDatabaseSchemaHandlerService');
    const effective = schemaOwner.applyNamedSchemaPolicies('promotion', structuredClone(require('../../src/schemas/schemas').promotion));
    const models = Object.fromEntries(schemaNames.map(name => [name + 'Model', { ...mongo,
        moduleName: 'promotion', schemaName: name, rawSchema: effective[name], cache: { enabled: false },
        find(query, options) {
            state.findCalls++;
            state.reads.push({ schema: name, query: structuredClone(query), options: structuredClone(options) });
            const rows = records(name).filter(row => Object.entries(query).every(([key, value]) => row[key] === value));
            const skip = options.skip || 0;
            const cursor = {
                sort(order) {
                    rows.sort((a, b) => {
                        for (const [key, direction] of Object.entries(order)) {
                            if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * direction;
                        }
                        return 0;
                    });
                    return this;
                },
                toArray: async () => structuredClone(rows.slice(skip, options.limit === undefined ? undefined : skip + options.limit)),
            };
            if (options.sort) cursor.sort(options.sort);
            return cursor;
        },
        countDocuments: async query => {
            state.countCalls++;
            return records(name).filter(row => Object.entries(query).every(([key, value]) => row[key] === value)).length;
        },
    }]));
    global.NODICS = { getModels: () => models };
    global.SERVICE = { ...SERVICE,
        DefaultLoggerService: { ...SERVICE.DefaultLoggerService, createLogger: () => log, inheritRequestPrivacy() {}, isSensitiveRequest: () => true },
        DefaultPipelineService: { ...foundation('nPipeline/src/service/pipeline/defaultPipelineService'), LOG: log },
        DefaultModelsGetInitializerService: { ...foundation('nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService'), LOG: log },
        DefaultSchemaAccessHandlerService: foundation('nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService'),
        DefaultRecordOwnershipPolicyService: foundation('nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService'),
        DefaultDatabaseConfigurationService: { getSchemaInterceptors: () => ({}), getSchemaValidators: () => ({}) },
        DefaultSchemaReadAccessPolicyService: { ...policy,
            providerRead(request, model) {
                if (request !== state.current) state.sameRequest = false;
                return policy.providerRead.call(this, request, model);
            },
            providerResult(request, response, model) {
                if (request !== state.current) state.sameRequest = false;
                state.hooks.push({ schema: model.schemaName, hasCode: 'code' in response.success,
                    count: response.success.count, privateFields: Boolean(response.success.result[0]?.protectedToken || response.success.result[0]?.secureIssuance) });
                return policy.providerResult.call(this, request, response, model);
            },
        },
    };
    for (const name of schemaNames) {
        const filename = path.join(root, 'nodics.foundation/modules/nService/src/service/common.js');
        let source = fs.readFileSync(filename, 'utf8');
        for (const [key, value] of Object.entries({ mdulnm: 'promotion', mdlnm: name + 'Model', schmanm: name })) source = source.replaceAll(key, value);
        const compiled = new Module(filename, module); compiled.paths = module.paths; compiled._compile(source, filename);
        SERVICE['Default' + name.toUpperCaseFirstChar() + 'Service'] = { get: async request => {
            state.current = request;
            const result = await compiled.exports.get(state.copyRequest ? { ...request } : request);
            state.afterGet?.(result);
            return result;
        } };
    }
    return state;
};
