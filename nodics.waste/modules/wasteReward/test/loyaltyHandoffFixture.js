/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
require("./../../../../nodics.loyalty/modules/loyaltyWallet/test/helpers/runtimeEnums.js")();
/**
 * @module wasteReward/test/loyaltyHandoffFixture
 * @description Loads real Loyalty API/controller/facade/wallet/earning/transaction owners; only transport and generated storage are fake.
 * @owner wasteReward @layer test
 */
const assert = require('node:assert/strict');
const loyaltyRoot = '../../../../nodics.loyalty/modules/';
const controller = require(loyaltyRoot + 'loyaltyApi/src/controller/defaultLoyaltyInternalController');
const facade = require(loyaltyRoot + 'loyaltyApi/src/facade/defaultLoyaltyInternalFacade');
const wallet = require(loyaltyRoot + 'loyaltyWallet/src/service/defaultLoyaltyWalletOperationService');
const operations = require(loyaltyRoot + 'loyaltyWallet/src/service/defaultLoyaltyRewardOperationService');
const transaction = require(loyaltyRoot + 'loyaltyWallet/src/service/defaultLoyaltyTransactionService');
const defaults = require(loyaltyRoot + 'loyaltyWallet/config/properties').loyalty;
const exactEvidence = require(loyaltyRoot + 'loyaltyWallet/src/service/defaultLoyaltyReadEvidenceService');
const runtime = require('../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
const copy = value => structuredClone(value);

module.exports = {
    /** Replaces only network/database boundaries. Synthetic transaction rollback is not live provider qualification. */
    install: function ({ allowProjection = false } = {}) {
        const rows = { LoyaltyWallet: [], LoyaltyWalletRewardBalance: [], RewardLedgerEntry: [] };
        const state = { calls: [], commits: 0, loseResponse: false, failLedger: false, token: null, evidenceRequests: [],
            evidenceAuth: { tenant: 'T', principalType: 'service', tokenType: 'service', serviceId: 'commerce-runtime',
                principalId: 'commerce-runtime', entCode: 'runtime', runtimeInstanceId: 'instance',
                runtimeScope: { projectCode: 'project', environmentCode: 'unit', serverCode: 'commerce', instanceCode: 'instance', assignmentCode: 'assignment' },
                modules: ['loyaltyApi'], permissions: ['loyalty.wallet.read'], groups: [], userGroups: [] } };
        state.evidencePolicy = { runtimeRole: 'LOYALTY', callers: [{ tenant: 'T', principalEnterpriseCode: 'runtime',
            enterpriseCode: 'market', serviceId: 'commerce-runtime', ...state.evidenceAuth.runtimeScope }] };
        const get = CONFIG.get;
        global.CONFIG = { get: key => key === 'loyalty' ? { ...defaults, transactions: { ...defaults.transactions, enabled: true },
            ...(allowProjection ? { api: { readEvidence: state.evidencePolicy } } : {}) } :
            allowProjection && key === 'runtimeRole' ? { code: 'LOYALTY' } :
            key === 'databaseTransactions' ? { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 } : get(key) };
        global.FACADE = { DefaultLoyaltyInternalFacade: facade };
        Object.assign(SERVICE, { DefaultLoyaltyWalletOperationService: wallet, DefaultLoyaltyRewardOperationService: operations,
            DefaultLoyaltyAmountService: require(loyaltyRoot + 'loyaltyCore/src/service/defaultLoyaltyAmountService'),
            DefaultLoyaltyReadEvidenceService: exactEvidence,
            DefaultLoyaltyTransactionService: transaction });
        if (allowProjection) {
            SERVICE.DefaultServiceTokenService = runtime;
            SERVICE.DefaultLoggerService = { ...SERVICE.DefaultLoggerService, hasPrivateCaptureProtection: () => true };
            NODICS.getSelectedEnvironmentName = () => 'unit';
        }
        let queue = Promise.resolve();
        SERVICE.DefaultDatabaseTransactionService = {
            capabilities: () => ({ multiRecordAtomic: true, contextPropagation: true }),
            execute: (scope, work) => {
                assert.deepEqual(scope, { tenant: 'T', moduleName: defaults.transactions.moduleName });
                const pending = queue.then(async () => {
                    const snapshot = copy(rows); const token = {}; state.token = token;
                    try { const result = await work(token); state.commits++; return result; }
                    catch (error) { for (const name of Object.keys(rows)) rows[name] = snapshot[name]; throw error; }
                    finally { state.token = null; }
                });
                queue = pending.catch(() => {});
                return pending;
            }
        };
        for (const name of Object.keys(rows)) {
            const match = (row, query) => Object.entries(query || {}).every(([key, value]) => row[key] === value);
            const check = request => {
                assert.equal(request.tenant, 'T'); assert.equal(request.authData.principalType, 'service');
                if (name !== 'LoyaltyWallet') assert.equal(request.transactionContext ?? null, state.token);
            };
            const write = async request => {
                check(request);
                if (name === 'RewardLedgerEntry' && state.failLedger) { state.failLedger = false; throw Error('injected ledger failure'); }
                if (request.query) {
                    const found = rows[name].find(row => match(row, request.query));
                    if (!found) throw Error('optimistic conflict');
                    Object.assign(found, copy(request.model));
                } else {
                    if (rows[name].some(row => row.code === request.model.code)) throw Error('duplicate');
                    rows[name].push(copy(request.model));
                }
                return { result: copy(request.model) };
            };
            SERVICE['Default' + name + 'Service'] = { save: write, update: write, get: async request => {
                check(request);
                const selected = rows[name].filter(row => match(row, request.query));
                return { code: 'SUC_TEST', count: selected.length, result: copy(selected) };
            } };
        }
        SERVICE.DefaultModuleService = { invokeModule: async input => {
            assert.equal(input.moduleName, 'loyaltyApi'); assert.equal(input.connectionName, 'loyalty');
            assert.deepEqual(input.targetAuthority, { runtimeRole: 'LOYALTY' }); assert.equal(input.tenant, 'T');
            assert.equal(input.maxAttempts, 1); assert.equal(input.methodName, 'POST');
            const operation = input.apiName === '/wallets' ? 'openWallet' : input.apiName === '/reward-earnings' ? 'earnRewards' :
                allowProjection && input.apiName === '/wallet-projections' ? 'ownerWalletProjection' :
                allowProjection && input.apiName === '/reward-ledger-evidence' ? 'ledgerEvidence' : null;
            assert.ok(operation, 'Only the existing authorized Loyalty operations are used');
            state.calls.push(copy(input));
            const request = { tenant: input.tenant,
                authData: operation === 'ledgerEvidence' ? copy(state.evidenceAuth) : { tenant: input.tenant, principalType: 'service', loginId: 'material-value-transport',
                    entCode: 'market', permissions: ['loyalty.wallet.read'] },
                httpRequest: { body: copy(input.requestBody), headers: copy(input.header) }
            };
            if (operation === 'ledgerEvidence') state.evidenceRequests.push(request);
            const result = await controller[operation](request);
            if (operation === 'earnRewards' && state.loseResponse) { state.loseResponse = false; throw Error('lost Loyalty response'); }
            return result;
        } };
        return { rows, state };
    }
};
