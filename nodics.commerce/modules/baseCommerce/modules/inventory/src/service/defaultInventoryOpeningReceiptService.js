/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');

/**
 * @module inventory/service/DefaultInventoryOpeningReceiptService
 * @description Admits a first stock receipt from explicit intake instructions, not
 * balance snapshots. Generated Inventory services atomically retain the opening
 * balance, movement and replay evidence in one tenant database transaction.
 * @layer service
 * @owner inventory
 * @override Later layers may narrow intake or policy validation. Preserve original
 * operator authority, activated Product/warehouse scope, atomicity and insert-only
 * writes. No file, import marker or deployment flag grants stock authority.
 */
module.exports = {
    /** Creates a content-free owner failure. @param {string} code Stable status. @returns {never} Throws. */
    fail: function (code = 'ERR_INVENTORY_OPENING_INVALID') { throw new CLASSES.NodicsError(code); },

    /** Resolves trusted human stock authority, independently of import permission. @param {Object} request Authenticated context. @returns {Object} Scoped context. */
    context: function (request) {
        const auth = request.authData || {}, role = CONFIG.get('runtimeRole'), security = SERVICE.DefaultSecuredRequestPipelineService;
        if ((typeof role === 'string' ? role : role?.code) !== 'COMMERCE' ||
            CONFIG.get('inventory')?.publication?.runtimeRole !== 'ONLINE') this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        const enterpriseCode = auth.enterpriseCode || auth.entCode;
        const actorId = auth.principalId || auth.loginId || auth.code;
        if (!auth.tenant || auth.tenant !== request.tenant || !enterpriseCode || !actorId ||
            [auth.entCode, auth.enterpriseCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
            auth.principalType !== 'human' || auth.tokenType !== 'access' || auth.isSystem ||
            typeof security?.getGrantedPermissions !== 'function' || typeof security.isPermissionGranted !== 'function' ||
            !security.isPermissionGranted('commerce.inventory.operate', security.getGrantedPermissions(request), {})) this.fail('ERR_AUTH_00003');
        return { ...request, tenant: auth.tenant, enterpriseCode, actorId };
    },

    /** Snapshots caller-owned input before awaited owner work. No new authority is added. @param {Object} request Trusted context. @returns {Object} Detached command. */
    snapshot: function (request) {
        const scoped = this.context(request);
        return { ...scoped, authData: structuredClone(scoped.authData) };
    },

    /** Accepts only bounded, positive whole-unit intake, never operational counters. @param {Object} input Pack instruction. @returns {Object} Detached intent. */
    instruction: function (input) {
        const fields = ['code', 'storeCode', 'locale', 'warehouseCode', 'productCode', 'variantCode', 'sku', 'quantity', 'referenceCode'];
        if (!input || Object.keys(input).some(key => !fields.includes(key)) ||
            fields.some(key => typeof input[key] !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:@|+-]{0,191}$/.test(input[key])) ||
            !/^[1-9][0-9]{0,8}$/.test(input.quantity)) this.fail();
        return Object.fromEntries(fields.map(key => [key, input[key]]));
    },

    /** Fingerprints canonical owner-built identities and intent. @param {Object} value Ordered JSON. @returns {string} Digest. */
    digest: function (value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); },

    /** Rejects failed generated envelopes without interpreting failure as absence or acknowledgement. @param {Object} response Owner response. @returns {*} Generated result. */
    result: function (response) {
        if (!response || response.error || response.success === false || response.acknowledged === false ||
            response.code && !/^SUC_/.test(response.code) || response.errors?.length ||
            response.result?.error || response.result?.success === false || response.result?.acknowledged === false) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        return response.result;
    },

    /** Builds exact replay/stock identities without trusting a source balance code. @param {Object} request Scoped context. @param {Object} input Validated intake. @param {Object} source Immutable pack identity. @returns {Object} Identities. */
    identity: function (request, input, source) {
        if (!source || Object.keys(source).sort().join(',') !== 'checksum,releaseCode,version' ||
            !/^[A-Za-z0-9._-]+:[A-Za-z0-9_-]+$/.test(source.releaseCode) || !/^\d+\.\d+\.\d+$/.test(source.version) ||
            !/^[a-f0-9]{64}$/.test(source.checksum)) this.fail();
        const scope = { tenant: request.tenant, enterpriseCode: request.enterpriseCode };
        return {
            scope,
            code: 'opening-' + this.digest({ ...scope, releaseCode: source.releaseCode, instructionCode: input.code }),
            balanceCode: 'stock-' + this.digest({ ...scope, warehouseCode: input.warehouseCode, sku: input.sku }),
            intentDigest: this.digest({ ...scope, input, source })
        };
    },

    /** Reads exactly one owner record; failed/ambiguous envelopes never imply absence. @param {string} name Generated owner. @param {Object} request Context. @param {Object} query Exact scope. @returns {Promise<Object|undefined>} Record. */
    read: async function (name, request, query) {
        const service = SERVICE[name];
        if (!service || typeof service.get !== 'function') this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        const response = await service.get({ tenant: request.tenant, authData: request.authData,
            query, options: { skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1, limit: 2 },
            ...(request.transactionContext ? { transactionContext: request.transactionContext } : {}) });
        const rows = this.result(response);
        if (!Array.isArray(rows) || rows.length > 1) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        const row = rows[0];
        if (row && Object.entries(query).some(([key, value]) => row[key] !== value)) this.fail('ERR_INVENTORY_OPENING_CONFLICT');
        return row;
    },

    /** Validates current activated catalog and warehouse ownership without a mutable fallback. @param {Object} request Context. @param {Object} input Intake. @returns {Promise<void>} Admitted. */
    policy: async function (request, input) {
        const scoped = { ...request, storeCode: input.storeCode, locale: input.locale,
            productCode: input.productCode, variantCode: input.variantCode, sku: input.sku, query: {} };
        const product = SERVICE.DefaultProductDiscoveryService, inventory = SERVICE.DefaultInventoryPublicationService;
        if (!product || !inventory || typeof product.activeSelection !== 'function' ||
            typeof product.resolveVariantSku !== 'function' || typeof inventory.readConfigured !== 'function') this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        if (await product.activeSelection(scoped) === undefined || await product.resolveVariantSku(scoped) !== input.sku) this.fail('ERR_INVENTORY_OPENING_POLICY');
        const records = await inventory.readConfigured(scoped);
        if (!Array.isArray(records) || records.filter(row => row.schema === 'warehouse' && row.policy?.code === input.warehouseCode &&
            row.policy.status === 'ACTIVE' && row.policy.tenant === request.tenant && row.policy.enterpriseCode === request.enterpriseCode).length !== 1) this.fail('ERR_INVENTORY_OPENING_POLICY');
    },

    /** Verifies installed insert-only identities and transaction-eligible schemas through the database owner, not metadata flags. @param {Object} request Scoped context. @returns {Promise<void>} Qualified. */
    persistence: async function (request) {
        const policy = CONFIG.get('databaseTransactions') || {};
        if (policy.enabled !== true || policy.failClosed !== true ||
            !Number.isSafeInteger(policy.maximumCommitTimeMs) || policy.maximumCommitTimeMs < 1) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        const handler = SERVICE.DefaultDatabaseModelHandlerService, transaction = SERVICE.DefaultDatabaseTransactionService;
        if (!handler || typeof handler.inspectIndexes !== 'function' || !transaction ||
            transaction.capabilities({ moduleName: 'inventory', tenant: request.tenant }).multiRecordAtomic !== true) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        const models = NODICS.getModels('inventory', request.tenant) || {};
        for (const name of ['inventoryBalance', 'inventoryMovement', 'inventoryOpeningReceiptRecord']) {
            const model = models[UTILS.createModelName(name)];
            if (!model || model.versioned === true || typeof model.compareAndSetItem !== 'function' ||
                model.rawSchema?.transaction?.enabled !== true || model.rawSchema.transaction.sideEffects !== 'none' ||
                model.rawSchema.cache?.enabled !== false || model.rawSchema.event?.enabled !== false ||
                SERVICE.DefaultModelConcurrencyService?.getField(model.rawSchema)) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
            const evidence = await handler.inspectIndexes(model);
            const unique = (keys) => evidence?.versioned === false && Array.isArray(evidence.indexes) && evidence.indexes.some(index =>
                index.unique === true && !index.sparse && !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') &&
                Object.keys(index.key || {}).sort().join(',') === keys.slice().sort().join(',') && keys.every(key => index.key[key] === 1));
            if (!unique(['code']) || name === 'inventoryBalance' && !unique(['tenant', 'enterpriseCode', 'warehouseCode', 'sku'])) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        }
    },

    /** Checks original receipt and movement without requiring an unchanged live quantity after sales. @param {Object} request Context. @param {Object} input Intake. @param {Object} identity Keys. @returns {Promise<Object|undefined>} Original receipt. */
    original: async function (request, input, identity) {
        const receipt = await this.read('DefaultInventoryOpeningReceiptRecordService', request, { ...identity.scope, code: identity.code });
        if (!receipt) return undefined;
        if (receipt.intentDigest !== identity.intentDigest || receipt.balanceCode !== identity.balanceCode ||
            receipt.warehouseCode !== input.warehouseCode || receipt.sku !== input.sku || receipt.quantity !== input.quantity ||
            receipt.referenceCode !== input.referenceCode || receipt.movementCode !== identity.code || !receipt.actorId) this.fail('ERR_INVENTORY_OPENING_CONFLICT');
        const balance = await this.read('DefaultInventoryBalanceService', request, { ...identity.scope, code: identity.balanceCode });
        const movement = await this.read('DefaultInventoryMovementService', request, { ...identity.scope, code: identity.code });
        if (!balance || balance.warehouseCode !== input.warehouseCode || balance.sku !== input.sku || !movement ||
            movement.warehouseCode !== input.warehouseCode || movement.sku !== input.sku || movement.quantity !== input.quantity ||
            movement.referenceCode !== input.referenceCode || movement.movementType !== 'RECEIPT' || movement.balanceRevision !== 1) this.fail('ERR_INVENTORY_OPENING_CONFLICT');
        return receipt;
    },

    /** Inspects complete admission read-only, including replay and provider capability. @param {Object} request Original context. @param {Object} input Intake. @param {Object} source Pack identity. @returns {Promise<Object>} Owner plan. */
    inspect: async function (request, input, source) {
        request = this.snapshot(request); input = this.instruction(input); source = { ...source };
        const identity = this.identity(request, input, source);
        await this.policy(request, input);
        const original = await this.original(request, input, identity);
        if (original) return { ready: true, action: 'CURRENT', receiptCode: original.code };
        const existing = await this.read('DefaultInventoryBalanceService', request, { ...identity.scope, warehouseCode: input.warehouseCode, sku: input.sku });
        if (existing) this.fail('ERR_INVENTORY_OPENING_CONFLICT');
        await this.persistence(request);
        return { ready: true, action: 'RECEIVE_FIRST', receiptCode: identity.code };
    },

    /** Inserts once through generated pipelines inside the opaque transaction. @param {string} name Owner service. @param {Object} request Transaction context. @param {Object} model Record. @returns {Promise<Object>} Acknowledged record. */
    insert: async function (name, request, model) {
        const service = SERVICE[name];
        if (!service || typeof service.save !== 'function') this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        const response = await service.save({ tenant: request.tenant, authData: request.authData, transactionContext: request.transactionContext,
            query: { code: model.code, tenant: request.tenant, enterpriseCode: request.enterpriseCode }, options: { insertOnly: true }, model: structuredClone(model) });
        const result = this.result(response);
        if (!result || Array.isArray(result) ||
            Object.entries(model).some(([key, value]) => key !== 'created' && key !== 'updated' &&
                (value instanceof Date ? new Date(result[key]).getTime() !== value.getTime() : result[key] !== value))) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        return result;
    },

    /** Commits first balance, receipt movement and replay evidence atomically; unknown acknowledgements only read original evidence, never reapply quantities. @param {Object} request Context. @param {Object} input Intake. @param {Object} source Pack identity. @returns {Promise<Object>} Bounded receipt. */
    receive: async function (request, input, source) {
        request = this.snapshot(request); input = this.instruction(input); source = { ...source };
        const identity = this.identity(request, input, source);
        const plan = await this.inspect(request, input, source);
        if (plan.action === 'CURRENT') return { code: identity.code, balanceCode: identity.balanceCode, movementCode: identity.code, replayed: true };
        let replayed = false;
        try {
            await SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: 'inventory', tenant: request.tenant }, async transactionContext => {
                const scoped = { ...request, transactionContext };
                this.context(scoped);
                await this.policy(scoped, input);
                const original = await this.original(scoped, input, identity);
                if (original) { replayed = true; return; }
                if (await this.read('DefaultInventoryBalanceService', scoped, { ...identity.scope, warehouseCode: input.warehouseCode, sku: input.sku })) this.fail('ERR_INVENTORY_OPENING_CONFLICT');
                const now = new Date();
                const common = { ...identity.scope, warehouseCode: input.warehouseCode, sku: input.sku, active: true, created: now, updated: now };
                await this.insert('DefaultInventoryBalanceService', scoped, { ...common, code: identity.balanceCode,
                    onHand: input.quantity, reserved: '0', allocated: '0', available: input.quantity, revision: 1 });
                await this.insert('DefaultInventoryMovementService', scoped, { ...common, code: identity.code, quantity: input.quantity,
                    movementType: 'RECEIPT', referenceCode: input.referenceCode, balanceRevision: 1, occurredAt: now,
                    correlationId: request.correlationId || identity.code });
                await this.insert('DefaultInventoryOpeningReceiptRecordService', scoped, { ...common, code: identity.code,
                    intentDigest: identity.intentDigest, balanceCode: identity.balanceCode, movementCode: identity.code,
                    quantity: input.quantity, referenceCode: input.referenceCode, actorId: request.actorId });
            });
        } catch (error) {
            this.context(request);
            if (!await this.original(request, input, identity)) throw error;
            replayed = true;
        }
        this.context(request);
        if (!await this.original(request, input, identity)) this.fail('ERR_INVENTORY_OPENING_UNAVAILABLE');
        return { code: identity.code, balanceCode: identity.balanceCode, movementCode: identity.code, replayed };
    }
};
