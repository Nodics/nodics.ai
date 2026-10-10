/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../../../../../..');
const foundation = relative => require(path.join(root, 'nodics.foundation/modules', relative));
const operation = require('../../src/service/defaultPromotionOperationService');
const publication = require('../../src/service/defaultPromotionPublicationService');
const admission = require('../../src/service/defaultPromotionBudgetAdmissionService');
const setup = require('../../src/service/defaultPromotionSetupContributionService');
const secure = require('../../src/service/defaultCouponSecureIssuanceService');
const seller = require('../../src/service/defaultCouponSellerAuthorizationService');
const schema = require('../../src/schemas/schemas').promotion;
const hooks = require('../../src/interceptors/interceptors');
const transactions = foundation('nDatabase/database/src/service/transaction/defaultDatabaseTransactionService');
const save = foundation('nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService');
const readPolicy = foundation('nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService');
const logger = foundation('nConfig/src/service/DefaultLoggerService');
const secrets = foundation('nSystem/src/service/defaultSecretProtectionService');
const interceptors = foundation('nCommon/src/service/interceptor/defaultInterceptorService');

/** @module promotion/test/helpers/secureIssuanceFixture @description Uses real nSystem AEAD, nConfig private context, generated insert dispatch, read protection and opaque transactions with an isolated transactional provider double. Not native database qualification. @layer test @owner promotion */
module.exports = {
    /** Creates isolated source-owner evidence without touching a deployment or credential store. @param {Object} t Test context. @returns {Object} Fixture. */
    create: function (t) {
        const previous = Object.fromEntries(['CONFIG', 'nConfig', 'SERVICE', 'CLASSES', 'NODICS', 'UTILS'].map(key => [key, global[key]]));
        t.after(() => Object.assign(global, previous));
        const previousFirstChar = Object.getOwnPropertyDescriptor(String.prototype, 'toUpperCaseFirstChar');
        Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', { configurable: true,
            /** Mirrors the initialized runtime string helper only for this fixture. @returns {string} Uppercase-first model name. */
            value: function () { return this[0].toUpperCase() + this.slice(1); } });
        t.after(() => {
            if (previousFirstChar) Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', previousFirstChar);
            else delete String.prototype.toUpperCaseFirstChar;
        });
        global.CLASSES = { NodicsError: class extends Error {
            constructor(code) { super(code instanceof Error ? code.message : code); this.code = code instanceof Error ? code.code : code; }
            static enrich(error) { return error; }
        } };
        const ref = { moduleName: 'profile', schemaName: 'enterprise', code: 'issuerA' };
        const policy = { code: 'campaign', tenant: 'tenantA', enterpriseCode: 'issuerA', issuerEnterpriseRef: ref,
            vendorEnterpriseRef: ref, enterpriseRef: ref, name: 'Reviewed campaign', status: 'ACTIVE', active: true,
            priority: 10, conditions: {}, actions: {}, budget: { limit: '100' }, revision: 0, versionId: 0 };
        const contribution = { installer: 'PROMOTION_CAMPAIGN_ISSUANCE', moduleName: 'referencePack', releaseCode: 'referencePack:operations',
            version: '0.0.1', checksum: 'a'.repeat(64), dataType: 'sample', selectionPolicy: 'EXPLICIT', destinationRole: 'COMMERCE', lifecycle: 'OPERATIONAL_VERSIONED' };
        const campaign = { promotionCode: 'campaign', storeCode: 'storeA', rootCode: 'rootA', commandReference: 'openingCampaign001',
            policyFingerprint: publication.fingerprint(policy) };
        const intent = { promotionCode: 'campaign', batchCode: 'openingBatch001', quantity: 3, commandReference: 'openingIssuance001' };
        const payload = { campaigns: [campaign], couponBatches: [intent] };
        const request = { tenant: 'tenantA', enterpriseCode: 'issuerA', contribution, authData: {
            tenant: 'tenantA', enterpriseCode: 'issuerA', loginId: 'operatorA', tokenType: 'access', principalType: 'human' } };
        const settings = { runtimeRole: 'COMMERCE', databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 },
            log: { requestPrivacy: { qualified: true, captureMode: 'disabled' } },
            secretProtection: { purposes: { PROMOTION_COUPON_TOKEN: { activeKeyId: 'primary', keys: { primary: { encryptionKey: crypto.randomBytes(32).toString('hex') } } } } },
            promotion: { budgetAdmission: { maximumCampaignsPerContribution: 50 }, publication: {
                runtimeRole: 'ONLINE', delivery: { enabled: true, storeCodes: ['storeA'], rootCodesByStore: { storeA: ['rootA'] } } } } };
        const rows = { promotion: [], coupon: [], couponBatch: [] }, state = { writes: 0, commits: 0, aborts: 0, allowed: true, atomic: true };
        global.CONFIG = { get: key => settings[key] }; global.nConfig = global.CONFIG;
        global.UTILS = { createModelName: value => value };
        const database = { getOptions: () => ({ connectionHandler: 'IsolatedTransactionalAdapter' }) };
        const matches = (row, query) => Object.entries(query).every(([key, value]) => {
            const actual = key.split('.').reduce((item, part) => item?.[part], row);
            return value && typeof value === 'object' && '$exists' in value ? (actual !== undefined) === value.$exists : actual === value;
        });
        const scopeRows = (command, model) => command.transactionContext
            ? transactions.operationOptions(command.transactionContext, database, model).rows : rows;
        const models = Object.fromEntries(['promotion', 'coupon', 'couponBatch'].map(name => {
            const model = { schemaName: name, moduleName: 'promotion', primaryKey: 'code', versioned: false, rawSchema: structuredClone(schema[name]) };
            model.guardProtectedRead = command => readPolicy.providerRead(command, model);
            model.projectReadResult = (command, response) => readPolicy.providerResult(command, response, model);
            model.compareAndSetItem = async command => {
                assert.equal(command.operation, 'create'); assert.equal(command.insertOnly, true);
                if (name !== 'promotion') assert.ok(command.transactionContext);
                const target = scopeRows(command, model)[name];
                if (target.some(row => row.code === command.model.code || name === 'coupon' && row.tokenHash === command.model.tokenHash)) throw new Error('duplicate identity');
                if (state.failCoupon && name === 'coupon' && command.model.code.endsWith(':2')) throw new Error('provider interruption');
                state.writes++; target.push(structuredClone(command.model)); return structuredClone(command.model);
            };
            return [name, model];
        }));
        global.NODICS = { getModels: (module, tenant) => module === 'promotion' && tenant === 'tenantA' ? models : {} };
        let queue = Promise.resolve();
        global.SERVICE = {
            DefaultPromotionOperationService: operation, DefaultPromotionSetupContributionService: setup,
            DefaultPromotionBudgetAdmissionService: admission, DefaultCouponSecureIssuanceService: secure,
            DefaultPromotionDistributionAdmissionService: { ...require('../../src/service/defaultPromotionDistributionAdmissionService'),
                assertInstalled: async () => true },
            DefaultCouponSellerAuthorizationService: seller, DefaultLoggerService: logger, DefaultSecretProtectionService: secrets,
            DefaultDatabaseTransactionService: transactions, DefaultSchemaReadAccessPolicyService: readPolicy,
            DefaultInterceptorService: interceptors,
            DefaultExactAmountService: require('../../../pricing/src/service/defaultExactAmountService'),
            DefaultModelConcurrencyService: foundation('nDatabase/database/src/service/schema/defaultModelConcurrencyService'),
            DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => ['commerce.promotion.manage', 'commerce.digital.own.reveal'],
                isPermissionGranted: () => state.allowed },
            DefaultDatabaseConfigurationService: {
                getTenantDatabase: (module, tenant) => module === 'promotion' && tenant === 'tenantA' ? { master: database } : undefined,
                getSchemaInterceptors: name => Object.fromEntries(['preSave', 'preUpdate', 'preRemove'].map(trigger =>
                    [trigger, Object.values(hooks).filter(item => item.item === name && item.trigger === trigger &&
                        [true, 'true'].includes(item.active)).sort((left, right) => left.index - right.index)])),
            },
            DefaultDatabaseModelHandlerService: { inspectIndexes: async model => ({ versioned: model.versioned,
                indexes: state.indexes || [{ unique: true, key: { code: 1 } }, ...(model.schemaName === 'coupon' ? [{ unique: true, key: { tenant: 1, tokenHash: 1 } }] : [])] }) },
            IsolatedTransactionalAdapter: {
                transactionCapabilities: () => ({ multiRecordAtomic: state.atomic }),
                transactionOperationOptions: context => context,
                executeTransaction: async (db, options, work) => {
                    assert.equal(db, database); assert.equal(options.maximumCommitTimeMs, 5000);
                    let unlock; const pending = queue; queue = new Promise(resolve => { unlock = resolve; });
                    await pending;
                    try {
                        const temporary = structuredClone(rows), result = await work({ rows: temporary });
                        for (const key of Object.keys(rows)) rows[key].splice(0, rows[key].length, ...temporary[key]);
                        state.commits++;
                        if (state.lost) { state.lost = false; throw new Error('lost commit response'); }
                        return result;
                    } catch (error) { state.aborts++; throw error; }
                    finally { unlock(); }
                },
            },
            DefaultDataReleaseService: { readContributionPayload: async (c, installer, file) => {
                assert.deepEqual(c, contribution); assert.equal(installer, contribution.installer); assert.equal(file, 'promotionSetup.json');
                if (state.changedBytes) throw new Error('immutable bytes changed');
                return structuredClone(payload);
            } },
            DefaultPromotionPublicationService: { ...publication, readActivated: async () => [{ schema: 'promotion', policy: structuredClone(policy) }] },
        };
        for (const [name, serviceName] of [['promotion', 'DefaultPromotionService'], ['coupon', 'DefaultCouponService'], ['couponBatch', 'DefaultCouponBatchService']]) {
            const model = models[name];
            SERVICE[serviceName] = {
                get: async command => {
                    await model.guardProtectedRead(command);
                    const selected = scopeRows(command, model)[name].filter(row => matches(row, command.query || {}));
                    const response = { success: { code: 'SUC_TEST', result: structuredClone(selected) } };
                    await model.projectReadResult(command, response);
                    return response.success;
                },
                save: async command => {
                    command.schemaModel = model;
                    await new Promise((resolve, reject) => ({ ...save, LOG: { debug() {} } }).applyPreInterceptors(command, {}, {
                        nextSuccess: resolve, error: (request, response, error) => reject(error),
                    }));
                    state.lastWrite = command;
                    return { code: 'SUC_TEST', result: await save.persistModel(command) };
                },
                update: async command => {
                    secure.protect(command); if (name === 'coupon') seller.protectCoupon(command);
                    const target = rows[name].filter(row => matches(row, command.query));
                    for (const row of target) Object.assign(row, command.model.$set || command.model);
                    return { code: 'SUC_TEST', result: { acknowledged: true, matchedCount: target.length, modifiedCount: target.length } };
                },
            };
        }
        for (const name of ['DefaultPromotionBudgetLedgerService', 'DefaultPromotionRedemptionService']) SERVICE[name] = { get: async () => ({ code: 'SUC_TEST', result: [] }) };
        return { request, payload, campaign, intent, policy, settings, rows, state, models, database, matches,
            privateRun: (r, action) => logger.runSensitiveOperation(r, action) };
    },
};
