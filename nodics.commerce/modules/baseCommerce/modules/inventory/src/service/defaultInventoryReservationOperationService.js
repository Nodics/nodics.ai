/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
/** @module inventory/service/defaultInventoryReservationOperationService @description Atomically acquires and releases Order stock holds through generated Inventory owners. @layer service @owner inventory @override Preserve signed buyer scope, installed persistence qualification, exact arithmetic, revision checks and atomic replay evidence. */
module.exports = {
    /** Refuses uncertain stock evidence without exposing owner records. */
    fail: function () { throw new CLASSES.NodicsError('ERR_INVENTORY_RESERVATION_UNCONFIRMED'); },
    /** Snapshots the signed customer checkout scope; request fields cannot replace it. */
    context: function (input) {
        const auth = input.authData || {}, enterpriseCode = auth.enterpriseCode || auth.entCode;
        const ownerId = auth.principalId || auth.code || auth.loginId;
        const role = CONFIG.get('runtimeRole'), security = SERVICE.DefaultSecuredRequestPipelineService;
        if ((typeof role === 'string' ? role : role?.code) !== 'COMMERCE' || auth.principalType !== 'customer' ||
            [auth.tenant,enterpriseCode,ownerId,input.payload?.orderCode].some(value => typeof value !== 'string' || !value ||
                value.length > 192 || /[\u0000-\u0020\u007f]/.test(value)) ||
            auth.tokenType !== 'access' || auth.tenant !== input.tenant || !enterpriseCode || !ownerId ||
            input.ownerId !== ownerId || [input.enterpriseCode, input.entCode, auth.enterpriseCode, auth.entCode].some(value =>
                value !== undefined && value !== enterpriseCode) ||
            !security?.isPermissionGranted('commerce.checkout.place', security.getGrantedPermissions(input), {})) this.fail();
        return { ...input, enterpriseCode, ownerId, authData: structuredClone(auth), payload: structuredClone(input.payload || {}) };
    },
    /** Builds generated owner access without changing signed buyer admission. */
    storage: function (r) {
        return { tenant: r.tenant, authData: SERVICE.DefaultInventoryOperationService.serviceAuthData(r),
            options: { recursive: false, skipItemCache: true }, ...(r.transactionContext ? { transactionContext: r.transactionContext } : {}) };
    },
    /** Requires successful generated persistence evidence. */
    result: function (response) {
        if (!response || !/^SUC_/.test(response.code || '') || response.error || response.success === false ||
            response.errors?.length || response.result?.acknowledged === false) this.fail();
        return response.result;
    },
    /** Reads one exact record; missing, foreign and ambiguous results never count as a hold. */
    read: async function (name, r, query) {
        const scope = { ...query, tenant: r.tenant, enterpriseCode: r.enterpriseCode };
        const rows = this.result(await SERVICE[name].get({ ...this.storage(r), query: scope,
            searchOptions: { limit: 2, pageSize: 2, pageNumber: 1 } }));
        if (!Array.isArray(rows) || rows.length > 1 || rows.some(row => Object.entries(scope).some(([key,value]) => row[key] !== value))) this.fail();
        return rows[0];
    },
    /** Checks installed atomic models and unique identities, not only configuration declarations. */
    persistence: async function (r) {
        const policy = CONFIG.get('databaseTransactions') || {}, transaction = SERVICE.DefaultDatabaseTransactionService;
        if (policy.enabled !== true || policy.failClosed !== true || !Number.isSafeInteger(policy.maximumCommitTimeMs) ||
            policy.maximumCommitTimeMs < 1 || transaction?.capabilities({ moduleName: 'inventory', tenant: r.tenant }).multiRecordAtomic !== true) this.fail();
        const models = NODICS.getModels('inventory', r.tenant) || {};
        for (const name of ['inventoryBalance', 'inventoryReservation', 'inventoryMovement']) {
            const model = models[UTILS.createModelName(name)];
            if (!model || model.versioned === true || typeof model.compareAndSetItem !== 'function' ||
                SERVICE.DefaultModelConcurrencyService?.getField(model.rawSchema)) this.fail();
            transaction.assertSchemaEligible(model);
            const evidence = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
            const unique = keys => evidence?.versioned === false && evidence.indexes?.some(index => index.unique === true &&
                !index.sparse && !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') &&
                Object.keys(index.key || {}).sort().join(',') === keys.slice().sort().join(',') && keys.every(key => index.key[key] === 1));
            if (!unique(['code']) || name === 'inventoryBalance' && !unique(['tenant','enterpriseCode','warehouseCode','sku'])) this.fail();
        }
    },
    /** Validates owner-built identity and exact positive quantity before transaction entry. */
    instruction: function (r, input) {
        const fields = ['code','warehouseCode','sku','ownerCode','idempotencyKey','correlationId'];
        if (fields.some(key => typeof input[key] !== 'string' || !input[key] || input[key].length > 512 || /[\u0000-\u0020\u007f]/.test(input[key])) ||
            input.tenant !== r.tenant || input.enterpriseCode !== r.enterpriseCode || input.ownerType !== 'ORDER' ||
            input.ownerCode !== r.payload.orderCode || !Number.isSafeInteger(input.expectedBalanceRevision) || input.expectedBalanceRevision < 0) this.fail();
        const exact = SERVICE.DefaultExactAmountService, quantity = exact.normalize(String(input.quantity));
        if (exact.compare(quantity, '0') <= 0) this.fail();
        return { ...Object.fromEntries(fields.map(key => [key,input[key]])), tenant: r.tenant, enterpriseCode: r.enterpriseCode,
            ownerId: r.ownerId, ownerType: 'ORDER', quantity, expectedBalanceRevision: input.expectedBalanceRevision };
    },
    /** Builds deterministic movement identities from the scoped original hold. */
    movementCode: function (r, code, kind) {
        return 'reservation-' + crypto.createHash('sha256').update(JSON.stringify([r.tenant,r.enterpriseCode,code,kind])).digest('hex');
    },
    /** Inserts once inside the opaque owner transaction and verifies current readback. */
    insert: async function (name, r, model) {
        this.result(await SERVICE[name].save({ ...this.storage(r), query: { tenant:r.tenant,enterpriseCode:r.enterpriseCode,code:model.code },
            options: { insertOnly:true,recursive:false }, model }));
        const stored = await this.read(name,r,{code:model.code});
        if (!stored || Object.entries(model).some(([key,value]) => !['created','updated'].includes(key) &&
            JSON.stringify(stored[key]) !== JSON.stringify(value))) this.fail();
        return stored;
    },
    /** Updates exactly the observed revision and confirms intended fields within the transaction. */
    update: async function (name,r,row,patch) {
        if (!Number.isSafeInteger(row.revision) || row.revision < 0 || row.revision >= Number.MAX_SAFE_INTEGER) this.fail();
        const result = this.result(await SERVICE[name].update({ ...this.storage(r),
            query:{tenant:r.tenant,enterpriseCode:r.enterpriseCode,code:row.code,revision:row.revision}, model:{$set:patch} }));
        if (result?.acknowledged !== true || result.matchedCount !== 1) this.fail();
        const stored = await this.read(name,r,{code:row.code});
        if (!stored || Object.entries(patch).some(([key,value]) => !['created','updated'].includes(key) &&
            JSON.stringify(stored[key]) !== JSON.stringify(value))) this.fail();
        return stored;
    },
    /** Validates original hold identity and its stock movement without requiring unchanged live stock. */
    original: async function (r,input) {
        const row = await this.read('DefaultInventoryReservationService',r,{code:input.code});
        if (!row) return undefined;
        if (Object.entries(input).some(([key,value]) => !['expectedBalanceRevision','correlationId'].includes(key) && row[key] !== value) ||
            !['ACTIVE','RELEASED'].includes(row.status) || !row.balanceCode) this.fail();
        const movement = await this.read('DefaultInventoryMovementService',r,{code:this.movementCode(r,row.code,'RESERVE')});
        const balance = await this.read('DefaultInventoryBalanceService',r,{code:row.balanceCode});
        if (!movement || !balance || movement.movementType !== 'RESERVE' || movement.referenceCode !== row.code ||
            movement.quantity !== row.quantity || movement.sku !== row.sku || movement.warehouseCode !== row.warehouseCode ||
            balance.sku !== row.sku || balance.warehouseCode !== row.warehouseCode || !Number.isSafeInteger(movement.balanceRevision) ||
            !Number.isSafeInteger(balance.revision) || balance.revision < movement.balanceRevision) this.fail();
        return row;
    },
    /** Atomically acquires every physical entry or none; repeated original commands never subtract stock twice. */
    reserveAll: async function (input,commands) {
        if (!Array.isArray(commands) || commands.some(command => !command || typeof command !== 'object')) this.fail();
        const r = this.context(input), intents = commands.map(command => this.instruction(r,structuredClone(command)));
        if (!intents.length || intents.length > 100 || new Set(intents.map(row=>row.code)).size !== intents.length) this.fail();
        await this.persistence(r);
        try {
            return await SERVICE.DefaultDatabaseTransactionService.execute({moduleName:'inventory',tenant:r.tenant}, async transactionContext => {
                const tx = {...r,transactionContext}, rows = [], exact = SERVICE.DefaultExactAmountService;
                for (const intent of intents) {
                    const existing = await this.original(tx,intent);
                    if (existing) { if (existing.status !== 'ACTIVE') this.fail(); rows.push(existing); continue; }
                    const balance = await this.read('DefaultInventoryBalanceService',tx,{warehouseCode:intent.warehouseCode,sku:intent.sku});
                    if (!balance || balance.revision !== intent.expectedBalanceRevision || exact.compare(balance.available,intent.quantity) < 0 ||
                        exact.compare(balance.reserved,'0') < 0) this.fail();
                    const now = new Date(), patch = {available:exact.add(balance.available,exact.multiply(intent.quantity,'-1')),
                        reserved:exact.add(balance.reserved,intent.quantity),revision:balance.revision+1,updated:now};
                    await this.update('DefaultInventoryBalanceService',tx,balance,patch);
                    const common = {tenant:r.tenant,enterpriseCode:r.enterpriseCode,warehouseCode:intent.warehouseCode,sku:intent.sku,active:true,created:now,updated:now};
                    await this.insert('DefaultInventoryMovementService',tx,{...common,code:this.movementCode(r,intent.code,'RESERVE'),
                        quantity:intent.quantity,movementType:'RESERVE',referenceCode:intent.code,balanceRevision:patch.revision,occurredAt:now,correlationId:intent.correlationId});
                    rows.push(await this.insert('DefaultInventoryReservationService',tx,{...common,...intent,balanceCode:balance.code,status:'ACTIVE',revision:0}));
                }
                return rows;
            });
        } catch (error) {
            const confirmed = [];
            for (const intent of intents) {
                try { const row = await this.original(r,intent); if (row?.status === 'ACTIVE') confirmed.push(row); }
                catch (_) { /* Uncertain identities remain recovery work, never fabricated acquisitions. */ }
            }
            if (confirmed.length === intents.length) return confirmed;
            error.inventoryReservations = confirmed;
            error.inventoryReservationRecoveryRequired = true;
            throw error;
        }
    },
    /** Releases an exact buyer's original hold and balance atomically; missing acquisition has no stock effect. */
    release: async function (input,code) {
        if (typeof code !== 'string' || !code || code.length > 512 || /[\u0000-\u0020\u007f]/.test(code)) this.fail();
        const r = this.context(input);
        await this.persistence(r);
        return SERVICE.DefaultDatabaseTransactionService.execute({moduleName:'inventory',tenant:r.tenant},async transactionContext => {
            const tx={...r,transactionContext}, row=await this.read('DefaultInventoryReservationService',tx,{code});
            if (!row) return {code,status:'NOT_ACQUIRED'};
            const intent=this.instruction(r,row), current=await this.original(tx,intent);
            if (current.ownerId !== r.ownerId) this.fail();
            if (current.status === 'RELEASED') {
                const proof=await this.read('DefaultInventoryMovementService',tx,{code:this.movementCode(r,code,'RELEASE')});
                if (!proof || proof.movementType !== 'RELEASE' || proof.quantity !== row.quantity || proof.referenceCode !== code ||
                    proof.sku !== row.sku || proof.warehouseCode !== row.warehouseCode || !Number.isSafeInteger(proof.balanceRevision)) this.fail();
                return current;
            }
            const balance=await this.read('DefaultInventoryBalanceService',tx,{code:row.balanceCode}), exact=SERVICE.DefaultExactAmountService;
            if (!balance || exact.compare(balance.reserved,row.quantity)<0) this.fail();
            const now=new Date(), patch={reserved:exact.add(balance.reserved,exact.multiply(row.quantity,'-1')),available:exact.add(balance.available,row.quantity),revision:balance.revision+1,updated:now};
            await this.update('DefaultInventoryBalanceService',tx,balance,patch);
            await this.insert('DefaultInventoryMovementService',tx,{tenant:r.tenant,enterpriseCode:r.enterpriseCode,code:this.movementCode(r,code,'RELEASE'),
                warehouseCode:row.warehouseCode,sku:row.sku,quantity:row.quantity,movementType:'RELEASE',referenceCode:code,
                balanceRevision:patch.revision,occurredAt:now,correlationId:row.correlationId,active:true,created:now,updated:now});
            return this.update('DefaultInventoryReservationService',tx,row,{status:'RELEASED',revision:row.revision+1,updated:now});
        });
    }
};
