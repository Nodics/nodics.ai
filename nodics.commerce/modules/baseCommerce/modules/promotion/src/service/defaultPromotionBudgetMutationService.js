/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual } = require('node:util');
const writes = new WeakMap(), reads = new WeakMap();
const failures = new WeakMap();
const prefix = 'promotionBudgetMutation:';

/** @module promotion/service/defaultPromotionBudgetMutationService @description Atomically appends activated budget receipts and changes the existing counter through generated owners. Delegated benefits require the separate coupon-bound private owner admission; no general delegated accounting or parallel journal. @layer service @owner promotion @override Later layers may narrow exported members; preserve signed scope, immutable identity, append-only hooks, transaction participation and exact replay. */
module.exports = {
    /** Returns only a fixed stage retained for the original accounting failure. @param {Error} error Original error. @returns {string|undefined} Private diagnostic. */
    failureStage: function (error) { return failures.get(error); },
    /** Refuses ambiguous authority, persistence or evidence without leaking private commands. @returns {never} Typed refusal. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED'); },
    /** Bounds scalar command identifiers. @param {*} value Candidate. @returns {boolean} Valid bounded identity. */
    identifier: function (value) { return typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,256}$/.test(value); },
    /** Bounds authenticated principal text without treating email-shaped logins as invalid. @param {*} value Principal. @returns {boolean} Valid original actor. */
    actor: function (value) { return typeof value === 'string' && value.length > 0 && value.length <= 192 && value === value.trim() && !/[\u0000-\u001f\u007f]/.test(value); },
    /** Preserves exact explicit or natural command keys, including email-shaped principals, without code normalization. @param {*} value Key. @returns {boolean} Bounded printable key. */
    key: function (value) { return typeof value === 'string' && value.length > 0 && value.length <= 1024 && value === value.trim() && !/[\u0000-\u001f\u007f]/.test(value); },
    /** Captures original authenticated enterprise aliases, never replacing a foreign signed scope. @param {Object} request Original operation. @returns {Object} Detached own-enterprise context. */
    context: function (request) {
        SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
        const role = CONFIG.get('runtimeRole');
        const auth = request.authData || {}, enterpriseCode = auth.enterpriseCode || auth.entCode;
        if ((typeof role === 'string' ? role : role?.code) !== 'COMMERCE' ||
            !this.identifier(request.tenant) || auth.tenant !== request.tenant || !this.identifier(enterpriseCode) ||
            [request.enterpriseCode, request.entCode, auth.enterpriseCode, auth.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
            [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== request.tenant) ||
            !['human', 'customer', 'service'].includes(auth.principalType) ||
            !this.actor(auth.principalId || auth.loginId || auth.code) ||
            !SERVICE.DefaultPromotionPublicationService?.deliveryEnabled(request)) this.fail();
        // Routed Express requests and opaque contexts are not cloneable business inputs.
        return { tenant: request.tenant, enterpriseCode, authData: structuredClone(auth), ownerId: request.ownerId,
            storeCode: request.storeCode, idempotencyKey: request.idempotencyKey, requestId: request.requestId,
            payload: { cartCode: request.payload?.cartCode, currency: request.payload?.currency,
                idempotencyKey: request.payload?.idempotencyKey } };
    },
    /** Resolves canonical exact arithmetic, refusing fallback floating-point accounting. @returns {Object} Exact amount owner. */
    exact: function () {
        const exact = SERVICE.DefaultExactAmountService;
        if (!exact?.normalize || !exact.add || !exact.compare) this.fail();
        return exact;
    },
    /** Validates nonnegative bounded decimal text before normalization. @param {*} value Amount. @returns {string} Canonical decimal. */
    amount: function (value) {
        if (typeof value !== 'string' || value.length > 128 || !/^\d+(?:\.\d+)?$/.test(value)) this.fail();
        return this.exact().normalize(value);
    },
    /** Uses the canonical publication fingerprint for retained command evidence. @param {*} value Evidence. @returns {string} Digest. */
    fingerprint: function (value) { return SERVICE.DefaultPromotionPublicationService.fingerprint(value); },
    /** Requires a successful generated envelope and refuses explicit negative provider acknowledgements. @param {Object} response Generated result. @returns {void} Evidence or refusal. */
    envelope: function (response) {
        SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(response);
        if (response.acknowledged === false || response.result?.acknowledged === false) this.fail();
    },
    /** Requires actual generated schemas, installed identity indexes, hooks and atomic topology before any mutation or replay claim. @param {Object} r Original scoped context. @returns {Promise<void>} Admission. */
    persistence: async function (r) {
        const transaction = SERVICE.DefaultDatabaseTransactionService, settings = CONFIG.get('databaseTransactions');
        if (!transaction?.execute || !transaction.capabilities || settings?.enabled !== true || settings.failClosed !== true ||
            !Number.isSafeInteger(settings.maximumCommitTimeMs) || settings.maximumCommitTimeMs < 1 ||
            transaction.capabilities({ moduleName: 'promotion', tenant: r.tenant }).multiRecordAtomic !== true ||
            !SERVICE.DefaultCouponSecureIssuanceService?.privateOperation ||
            !SERVICE.DefaultModelConcurrencyService?.getField || !SERVICE.DefaultDatabaseModelHandlerService?.inspectIndexes ||
            !SERVICE.DefaultDatabaseConfigurationService?.getSchemaInterceptors) this.fail();
        for (const member of ['protect', 'protectSave', 'protectRemoval', 'replay'])
            if (typeof SERVICE.DefaultPromotionBudgetAdmissionService?.[member] !== 'function') this.fail();
        for (const name of ['promotion', 'promotionBudgetLedger']) {
            const model = (NODICS.getModels('promotion', r.tenant) || {})[UTILS.createModelName(name)];
            const schema = model?.rawSchema;
            if (!model || model.versioned === true || model.primaryKey !== 'code' || typeof model.compareAndSetItem !== 'function' ||
                schema?.transaction?.enabled !== true || schema.transaction.sideEffects !== 'none' ||
                schema.cache?.enabled !== false || schema.event?.enabled !== false || schema.search?.enabled !== false ||
                SERVICE.DefaultModelConcurrencyService.getField(schema)) this.fail();
            if (name === 'promotionBudgetLedger' && (schema.definition?.budgetMutation?.type !== 'object' ||
                schema.definition?.enterpriseCode?.type !== 'string' || schema.readProtection?.owner !== 'DefaultPromotionBudgetMutationService' ||
                !model.guardProtectedRead || !model.projectReadResult)) this.fail();
            if (name === 'promotion' && schema.definition?.budgetAdmission?.type !== 'object') this.fail();
            const hooks = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(name);
            const owner = name === 'promotion' ? 'DefaultPromotionBudgetAdmissionService' : 'DefaultPromotionBudgetMutationService';
            for (const [trigger, member] of Object.entries({ preSave: 'protectSave', preUpdate: 'protect',
                preRemove: name === 'promotion' ? 'protectRemoval' : 'protectRemove' })) {
                if (!hooks?.[trigger]?.some(item => [true, 'true'].includes(item.active) && item.handler === owner + '.' + member)) this.fail();
            }
            const evidence = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
            if (evidence?.versioned !== false || !evidence.indexes?.some(index => index.unique === true && !index.sparse &&
                !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') && index.key?.code === 1 &&
                Object.keys(index.key).every(key => ['code', 'tenant'].includes(key)) &&
                Object.values(index.key).every(value => value === 1))) this.fail();
        }
        if (!SERVICE.DefaultPromotionService?.get || !SERVICE.DefaultPromotionService.update ||
            !SERVICE.DefaultPromotionBudgetLedgerService?.get || !SERVICE.DefaultPromotionBudgetLedgerService.save) this.fail();
    },
    /** Reads at most one exact scoped row without caches, preserving the opaque transaction. @param {string} name Generated service. @param {Object} r Context. @param {Object} query Exact selector. @returns {Promise<Object|undefined>} Detached row. */
    read: async function (name, r, query) {
        const selector = structuredClone(query);
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r), query: structuredClone(selector),
            budgetMutationRead: true, options: { recursive: false, skipItemCache: true },
            searchOptions: { pageNumber: 1, pageSize: 2, limit: 2, skip: 0, snapshot: false },
            ...(r.transactionContext ? { transactionContext: r.transactionContext } : {}) };
        reads.set(command, { tenant: command.tenant, authData: structuredClone(command.authData), query: selector,
            options: structuredClone(command.options), searchOptions: structuredClone(command.searchOptions), transactionContext: command.transactionContext });
        try {
            const response = await SERVICE[name].get(command);
            this.assertRead(command);
            this.envelope(response);
            if (!Array.isArray(response.result) || response.result.length > 1 ||
                response.count !== undefined && response.count !== response.result.length || response.result.some(row =>
                    Object.entries(selector).some(([key, value]) => !isDeepStrictEqual(row[key], value)))) this.fail();
            return structuredClone(response.result[0]);
        } finally { reads.delete(command); }
    },
    /** Pins only persistence-relevant data and exact opaque identity; generated schema metadata may be attached without changing selectors. @param {Object} command Original private request. @returns {boolean} Exact admission. */
    assertRead: function (command) {
        const expected = reads.get(command);
        if (!expected || command.budgetMutationRead !== true || command.tenant !== expected.tenant ||
            command.transactionContext !== expected.transactionContext || command.internalPersistence !== undefined || command.test === true ||
            !isDeepStrictEqual(command.authData, expected.authData) || !isDeepStrictEqual(command.query, expected.query) ||
            !isDeepStrictEqual(command.options, expected.options) || !isDeepStrictEqual(command.searchOptions, expected.searchOptions)) this.fail();
        return true;
    },
    /** Keeps private receipt selectors out of generic provider reads. @param {Object} r Generated request. @param {Object} model Installed model. @returns {boolean} Admission. */
    providerRead: function (r, model) {
        if (model.moduleName !== 'promotion' || model.schemaName !== 'promotionBudgetLedger') this.fail();
        if (reads.has(r) || r.budgetMutationRead !== undefined) return this.assertRead(r);
        if (!reads.has(r) && /budgetMutation|\$where|\$function|\$accumulator/.test(JSON.stringify({
            query: r.query, options: r.options, searchOptions: r.searchOptions }))) this.fail();
        if (!reads.has(r) && r.searchOptions?.projection &&
            Object.values(r.searchOptions.projection).some(value => ![0, 1, true, false].includes(value))) this.fail();
        return true;
    },
    /** Suppresses private command evidence from generic reads and exports. @param {Object} r Generated request. @param {Object} response Pipeline envelope. @param {Object} model Installed model. @returns {boolean} Projection complete. */
    providerResult: function (r, response, model) {
        this.providerRead(r, model);
        if (!reads.has(r) && response?.success?.result !== undefined) {
            const project = row => { if (!row || typeof row !== 'object') return row; const safe = { ...row }; delete safe.budgetMutation; return safe; };
            response.success.result = Array.isArray(response.success.result) ? response.success.result.map(project) : project(response.success.result);
        }
        return true;
    },
    /** Fences all generic updates against retained receipts, including dotted/operator manufacture. @param {Object} command Generated request. @returns {boolean} Legacy non-receipt mutation only. */
    protect: function (command) {
        if (writes.has(command)) this.fail(); // Append-only owners never authorize update or remove.
        const visit = value => {
            if (!value || typeof value !== 'object') return;
            for (const [key, item] of Object.entries(value)) {
                if (/budgetMutation/.test(key) || key.startsWith('$') && !['$set', '$unset', '$setOnInsert'].includes(key) ||
                    typeof item === 'string' && item.startsWith(prefix)) this.fail();
                visit(item);
            }
        };
        visit(command.models || command.model);
        command.query = { ...(command.query || {}), budgetMutation: { $exists: false } };
        return true;
    },
    /** Admits only one exact in-flight transaction insert; ordinary saves cannot upsert or forge receipts. @param {Object} command Generated save. @returns {boolean} Admission. */
    protectSave: function (command) {
        const expected = writes.get(command);
        if (!expected) {
            if (typeof command.model?.code !== 'string' || command.model.code.startsWith(prefix)) this.fail();
            return this.protect(command);
        }
        if (command.models !== undefined || command.transactionContext !== expected.transactionContext ||
            !command.transactionContext || command.options?.insertOnly !== true || command.options.recursive !== false ||
            command.tenant !== expected.tenant || !isDeepStrictEqual(command.authData, expected.authData) ||
            !isDeepStrictEqual(command.query, expected.query) ||
            Object.keys(expected.model).some(key => !isDeepStrictEqual(command.model?.[key], expected.model[key])) ||
            Object.keys(command.model || {}).some(key => !Object.hasOwn(expected.model, key) &&
                !['_id', 'createdBy', 'updatedBy', 'ownerType'].includes(key))) this.fail();
        return true;
    },
    /** Keeps receipt removal fenced independently of recording selection. @param {Object} command Generated removal. @returns {boolean} Legacy non-receipt removal only. */
    protectRemove: function (command) { return this.protect(command); },
    /** Appends one immutable receipt through generated insert-only persistence and private identity. @param {Object} r Transaction context. @param {Object} model Complete receipt. @returns {Promise<void>} Confirmed save envelope. */
    append: async function (r, model) {
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r),
            query: { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: model.code }, model,
            options: { insertOnly: true, recursive: false }, transactionContext: r.transactionContext };
        const initializer = SERVICE.DefaultModelSaveInitializerService;
        command.schemaModel = (NODICS.getModels('promotion', r.tenant) || {})[UTILS.createModelName('promotionBudgetLedger')];
        if (!command.schemaModel || !initializer?.applyDefaultValues) this.fail();
        // Pin the same effective defaults the generated save will apply before its private hook runs.
        await new Promise((resolve, reject) => initializer.applyDefaultValues(command, {}, {
            nextSuccess: resolve, error: (request, response, error) => reject(error),
        }));
        const expected = structuredClone({ tenant: command.tenant, authData: command.authData, query: command.query, model: command.model });
        writes.set(command, { ...expected, transactionContext: command.transactionContext });
        try { this.envelope(await SERVICE.DefaultPromotionBudgetLedgerService.save(command)); }
        finally { writes.delete(command); }
    },
    /** Derives immutable command identity without spend, amount or timestamps. RELEASE has exactly one identity per original COMMIT. @param {Object} command Retained command. @returns {string} Unique ledger code. */
    code: function (command) {
        if (command.contractVersion === 2) return prefix + this.fingerprint(command.mutationType === 'RELEASE'
            ? { contractVersion: 2, tenant: command.tenant, enterpriseCode: command.enterpriseCode,
                mutationType: 'RELEASE', originalCommitCode: command.originalCommitCode }
            : { contractVersion: 2, tenant: command.tenant, enterpriseCode: command.enterpriseCode,
                mutationType: 'COMMIT', vendorEnterpriseCode: command.vendorEnterpriseCode, couponCode: command.couponCode });
        return prefix + this.fingerprint(command.mutationType === 'RELEASE'
            ? { contractVersion: 1, tenant: command.tenant, enterpriseCode: command.enterpriseCode,
                mutationType: 'RELEASE', originalCommitCode: command.originalCommitCode }
            : { contractVersion: 1, tenant: command.tenant, enterpriseCode: command.enterpriseCode,
                mutationType: 'COMMIT', idempotencyKey: command.idempotencyKey });
    },
    /** Checks current counter and immutable admission without interpreting mutable rules as policy. @param {Object} current Live campaign. @param {Object} command Retained binding. @returns {void} Evidence or refusal. */
    current: function (current, command) {
        if (!current || current.tenant !== command.tenant || current.enterpriseCode !== command.enterpriseCode || current.code !== command.promotionCode ||
            !Number.isSafeInteger(current.revision) || current.revision < 0 || !Number.isSafeInteger(current.revision + 1) ||
            !current.budgetAdmission?.command || current.budget?.limit !== command.limit ||
            this.fingerprint(current.budgetAdmission) !== command.budgetAdmissionFingerprint ||
            !isDeepStrictEqual(current.budgetAdmission.command, command.admissionCommand)) this.fail();
        this.amount(current.budget.spent);
        if (this.exact().compare(current.budget.spent, command.limit) > 0) this.fail();
        const original = current.budgetAdmission.command, contribution = original.contribution;
        if (original.policyFingerprint !== command.policyFingerprint || original.rootCode !== command.rootCode || original.storeCode !== command.storeCode ||
            !contribution || Object.keys(contribution).sort().join(',') !== 'checksum,moduleName,releaseCode,version' ||
            !['moduleName', 'releaseCode', 'version'].every(key => typeof contribution[key] === 'string' && contribution[key].length > 0 && contribution[key].length <= 256) ||
            !/^[a-f0-9]{64}$/.test(contribution.checksum || '') || !/^[A-Za-z0-9_.:-]{1,128}$/.test(original.commandReference || '')) this.fail();
        SERVICE.DefaultPromotionBudgetAdmissionService.replay(current, { tenant: command.tenant,
            enterpriseCode: command.enterpriseCode, promotionCode: command.promotionCode,
            actorId: original.actorId, contribution: structuredClone(contribution), commandReference: original.commandReference,
            storeCode: command.storeCode, rootCode: command.rootCode, policyFingerprint: command.policyFingerprint });
    },
    /** Verifies the complete original receipt, not just a matching key or current spend. @param {Object} row Persisted ledger. @param {Object} command Expected exact command. @returns {Object} Verified original receipt. */
    receipt: function (row, command) {
        const proof = row?.budgetMutation, exact = this.exact();
        const keys = ['contractVersion', 'tenant', 'enterpriseCode', 'promotionCode', 'mutationType', 'targetCode', 'idempotencyKey',
            'ownerId', 'storeCode', 'rootCode', 'policyFingerprint', 'limit', 'amount', 'currency', 'redemptionCode', 'targetType', 'budgetAdmissionFingerprint', 'admissionCommand',
            ...(command?.contractVersion === 2 ? ['couponCode', 'batchCode', 'vendorEnterpriseCode', 'issuanceFingerprint',
                'purchaseFingerprint', 'operationCode', 'sourceReference', 'sellerAuthorizationProof', 'benefitAuthority', 'outletStoreCode'] : []),
            ...(command?.mutationType === 'RELEASE' ? ['originalCommitCode'] : [])].sort();
        if (!command || ![1, 2].includes(command.contractVersion) || !['COMMIT', 'RELEASE'].includes(command.mutationType) ||
            Object.keys(command).sort().join(',') !== keys.join(',') ||
            !['tenant', 'enterpriseCode', 'promotionCode', 'rootCode', 'redemptionCode'].every(key => this.identifier(command[key])) ||
            !this.key(command.idempotencyKey) || !(command.contractVersion === 2 ? ['CART', 'POS'] : ['CART', 'CUSTOMER_CONTEXT']).includes(command.targetType) ||
            !(command.targetType === 'CUSTOMER_CONTEXT' ? this.actor(command.targetCode) : this.identifier(command.targetCode)) ||
            !['policyFingerprint', 'budgetAdmissionFingerprint'].every(key => /^[a-f0-9]{64}$/.test(command[key] || '')) ||
            command.ownerId !== null && !this.actor(command.ownerId) || command.storeCode !== null && !this.identifier(command.storeCode) ||
            command.currency !== null && (typeof command.currency !== 'string' || !/^[A-Z]{3,16}$/.test(command.currency)) ||
            command.mutationType === 'RELEASE' && !new RegExp('^' + prefix + '[a-f0-9]{64}$').test(command.originalCommitCode || '') ||
            !row || row.code !== this.code(command) || !isDeepStrictEqual(proof?.command, command) ||
            proof.commandFingerprint !== this.fingerprint(command) ||
            ['tenant', 'enterpriseCode', 'promotionCode', 'mutationType', 'amount', 'targetCode', 'idempotencyKey'].some(key => row[key] !== command[key]) ||
            !Number.isSafeInteger(proof.beforeRevision) || proof.beforeRevision < 0 || proof.afterRevision !== proof.beforeRevision + 1 ||
            !Number.isSafeInteger(proof.afterRevision) || !this.actor(row.actorId) || !Number.isFinite(new Date(row.occurredAt).getTime())) this.fail();
        if (command.contractVersion === 2 && (!['couponCode', 'batchCode', 'vendorEnterpriseCode', 'operationCode', 'outletStoreCode'].every(key => this.identifier(command[key])) ||
            !['issuanceFingerprint', 'purchaseFingerprint'].every(key => /^[a-f0-9]{64}$/.test(command[key] || '')) ||
            command.vendorEnterpriseCode === command.enterpriseCode || command.operationCode !== command.idempotencyKey ||
            command.redemptionCode !== command.operationCode || !this.key(command.sourceReference) ||
            command.benefitAuthority !== 'ISSUED_COUPON_BENEFIT_V1' ||
            Object.keys(command.sellerAuthorizationProof || {}).sort().join(',') !== 'grantRevision,issuerEnterpriseCode,promotionCode,sellerEnterpriseCode' ||
            command.sellerAuthorizationProof.issuerEnterpriseCode !== command.enterpriseCode ||
            command.sellerAuthorizationProof.sellerEnterpriseCode !== command.vendorEnterpriseCode ||
            command.sellerAuthorizationProof.promotionCode !== command.promotionCode ||
            !Number.isSafeInteger(command.sellerAuthorizationProof.grantRevision) || command.sellerAuthorizationProof.grantRevision < 1)) this.fail();
        if (command.contractVersion === 2 && command.mutationType === 'COMMIT' &&
            (!Number.isSafeInteger(proof.couponRevisionBefore) || proof.couponRevisionBefore < 0 ||
                !Number.isSafeInteger(proof.couponRevisionAfter) || proof.couponRevisionAfter !== proof.couponRevisionBefore + 1)) this.fail();
        const before = this.amount(row.beforeSpent), after = this.amount(row.afterSpent), amount = this.amount(command.amount);
        if (before !== row.beforeSpent || after !== row.afterSpent || amount !== command.amount ||
            after !== exact.add(before, command.mutationType === 'COMMIT' ? amount : '-' + amount) ||
            exact.compare(after, command.limit) > 0) this.fail();
        return row;
    },
    /** Selects exactly one retained policy from the configured root set, without mutable fallback. @param {Object} r Signed context. @param {string} code Campaign. @returns {Promise<Object>} Pure policy and root. */
    activated: async function (r, code) {
        const publication = SERVICE.DefaultPromotionPublicationService, matches = [];
        const roots = publication.deliveryRoots(r);
        if (!Array.isArray(roots) || !roots.length || roots.length > 1000 || new Set(roots).size !== roots.length) this.fail();
        for (const rootCode of roots) {
            const records = await publication.readActivated({ rootType: 'promotion', rootCode }, r);
            if (!Array.isArray(records) || records.length > 1000) this.fail();
            for (const record of records) if (record.schema === 'promotion' && record.policy?.code === code)
                matches.push({ policy: record.policy, rootCode });
        }
        if (matches.length !== 1) this.fail();
        const selected = matches[0];
        if (selected.policy.tenant !== r.tenant || selected.policy.enterpriseCode !== r.enterpriseCode || selected.policy.status !== 'ACTIVE') this.fail();
        return structuredClone(selected);
    },
    /** Supplied live spend cannot change the retained policy fingerprint. @param {Object} r Signed context. @param {Object} observed Selected policy. @returns {Promise<Object>} Pure policy and root. */
    policy: async function (r, observed) {
        const selected = await this.activated(r, observed.code), pure = structuredClone(observed);
        if (pure.budget) delete pure.budget.spent;
        if (this.fingerprint(pure) !== this.fingerprint(selected.policy)) this.fail();
        this.amount(selected.policy.budget?.limit);
        return structuredClone(selected);
    },
    /** Atomically commits one budget command or returns its exact original receipt. No external effect runs in a retried transaction callback. @param {Object} r Signed or private owner context. @param {Object} details Owner-built command fields. @param {Object} original Original COMMIT for release. @param {Object} couponEnvelope Optional exact private coupon authority. @returns {Promise<Object>} Current live campaign after verified receipt. */
    mutate: async function (r, details, original, couponEnvelope) {
        const couponOwner = SERVICE.DefaultPromotionCouponBudgetService;
        if (details.contractVersion === 2) {
            if (!couponEnvelope || !couponOwner?.resolveMutation || !couponOwner.assertCurrent) this.fail();
            await couponOwner.resolveMutation(couponEnvelope);
        } else if (couponEnvelope !== undefined) this.fail();
        const query = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: details.promotionCode };
        let expected, stage = 'BUDGET_TX_CURRENT';
        const inspect = async scoped => {
            const row = await this.read('DefaultPromotionBudgetLedgerService', scoped,
                { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: this.code(details) });
            if (!row) return undefined;
            this.receipt(row, expected);
            const current = await this.read('DefaultPromotionService', scoped, query);
            this.current(current, expected);
            if (current.revision < row.budgetMutation.afterRevision) this.fail();
            return current;
        };
        try {
            await SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: 'promotion', tenant: r.tenant }, async transactionContext => {
                stage = 'BUDGET_TX_CURRENT';
                const scoped = { ...r, transactionContext };
                const current = await this.read('DefaultPromotionService', scoped, query);
                const command = { ...details, budgetAdmissionFingerprint: original?.budgetMutation.command.budgetAdmissionFingerprint ||
                    this.fingerprint(current?.budgetAdmission), admissionCommand: original?.budgetMutation.command.admissionCommand ||
                    structuredClone(current?.budgetAdmission?.command) };
                if (expected && !isDeepStrictEqual(expected, command)) this.fail();
                expected = command;
                this.current(current, command);
                stage = 'BUDGET_TX_AUTHORITY';
                if (couponEnvelope) {
                    await couponOwner.resolveMutation(couponEnvelope, transactionContext);
                    couponOwner.assertCurrent(current, couponEnvelope);
                }
                if (original) {
                    const saved = await this.read('DefaultPromotionBudgetLedgerService', scoped,
                        { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: original.code });
                    if (!isDeepStrictEqual(saved, original)) this.fail();
                    this.receipt(saved, original.budgetMutation.command);
                }
                // REDEEMED recovery may only return the exact original receipt; a new charge must fence unused CLAIMED stock.
                stage = 'BUDGET_TX_RECEIPT';
                if (await inspect(scoped)) return;
                let couponFence;
                if (couponEnvelope && command.mutationType === 'COMMIT') {
                    if (!couponOwner.fenceNewCommit) this.fail();
                    stage = 'BUDGET_TX_COUPON_FENCE';
                    couponFence = await couponOwner.fenceNewCommit(couponEnvelope, transactionContext);
                }
                stage = 'BUDGET_TX_LIMIT';
                const exact = this.exact(), beforeSpent = this.amount(current.budget.spent);
                const afterSpent = exact.add(beforeSpent, command.mutationType === 'COMMIT' ? command.amount : '-' + command.amount);
                if (exact.compare(afterSpent, '0') < 0 || exact.compare(afterSpent, command.limit) > 0) this.fail();
                const model = SERVICE.DefaultPromotionOperationService.withSchemaBase({
                    code: this.code(command), tenant: r.tenant, enterpriseCode: r.enterpriseCode, promotionCode: command.promotionCode,
                    mutationType: command.mutationType, amount: command.amount, beforeSpent, afterSpent,
                    targetCode: command.targetCode, idempotencyKey: command.idempotencyKey,
                    actorId: couponEnvelope ? r.actorId : r.authData.principalId || r.authData.loginId || r.authData.code,
                    occurredAt: new Date(), budgetMutation: { command, commandFingerprint: this.fingerprint(command),
                        beforeRevision: current.revision, afterRevision: current.revision + 1, ...(couponFence || {}) },
                }, r);
                stage = 'BUDGET_TX_LEDGER';
                await this.append(scoped, model);
                stage = 'BUDGET_TX_COUNTER';
                const response = await SERVICE.DefaultPromotionOperationService.persistBudgetCommand({
                    tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r), transactionContext,
                    query: { ...query, revision: current.revision, 'budget.spent': current.budget.spent },
                    model: { budget: { ...current.budget, spent: afterSpent }, revision: current.revision + 1 },
                }, command => SERVICE.DefaultPromotionService.update(command));
                this.envelope(response);
                const result = SERVICE.DefaultPromotionOperationService.unwrap(response);
                if (!result || result.acknowledged !== true || result.modifiedCount !== 1 || result.matchedCount !== 1) this.fail();
                stage = 'BUDGET_TX_READBACK';
                const saved = await this.read('DefaultPromotionService', scoped, query);
                if (!saved || saved.revision !== current.revision + 1 || saved.budget?.spent !== afterSpent ||
                    !isDeepStrictEqual(saved.budgetAdmission, current.budgetAdmission)) this.fail();
                if (!await inspect(scoped)) this.fail();
            });
        } catch (_) {
            if (!expected || !await inspect(r)) {
                try { this.fail(); }
                catch (error) {
                    if (error && typeof error === 'object') failures.set(error, stage);
                    throw error;
                }
            }
        }
        if (!expected) this.fail();
        const result = await inspect(r);
        if (!result) this.fail();
        if (couponEnvelope) await couponOwner.resolveMutation(couponEnvelope);
        return result;
    },
    /** Consumes or reverses only one canonical private coupon-benefit command. The separate owner supplies immutable authority, not an arbitrary issuer context or amount. @param {Object} envelope Exact in-flight coupon owner command. @returns {Promise<Object>} Safe receipt identity and current budget. */
    mutateCoupon: async function (envelope) {
        let stage = 'BUDGET_OWNER';
        try {
            const bridge = SERVICE.DefaultPromotionCouponBudgetService;
            if (!bridge?.resolveMutation) this.fail();
            const admitted = await bridge.resolveMutation(envelope), binding = admitted.binding;
            const r = bridge.persistenceOwner(envelope);
            stage = 'BUDGET_PERSISTENCE';
            await this.persistence(r);
            const identity = { contractVersion: 2, tenant: binding.tenant, enterpriseCode: binding.issuerEnterpriseCode,
                mutationType: 'COMMIT', vendorEnterpriseCode: binding.sellerEnterpriseCode, couponCode: admitted.couponCode };
            let original, details;
            if (admitted.mutationType === 'RELEASE') {
                original = await this.read('DefaultPromotionBudgetLedgerService', r, { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: this.code(identity) });
                const saved = original?.budgetMutation?.command;
                if (!saved) this.fail();
                this.receipt(original, saved);
                if (saved.contractVersion !== 2 || saved.promotionCode !== binding.promotionCode || saved.batchCode !== binding.batchCode ||
                    saved.couponCode !== admitted.couponCode || saved.vendorEnterpriseCode !== binding.sellerEnterpriseCode ||
                    saved.issuanceFingerprint !== binding.issuanceFingerprint || saved.purchaseFingerprint !== admitted.purchaseFingerprint ||
                    saved.operationCode !== admitted.operationCode || saved.targetCode !== admitted.targetCode || saved.targetType !== admitted.targetType ||
                    saved.ownerId !== admitted.ownerId || saved.storeCode !== binding.storeCode || saved.outletStoreCode !== admitted.storeCode || saved.rootCode !== binding.rootCode ||
                    saved.policyFingerprint !== binding.policyFingerprint || !isDeepStrictEqual(saved.sellerAuthorizationProof, binding.sellerAuthorizationProof) ||
                    saved.amount !== this.amount(admitted.benefit.amount) || saved.currency !== admitted.benefit.currency ||
                    saved.sourceReference !== admitted.benefit.sourceReference) this.fail();
                details = { ...saved, mutationType: 'RELEASE', originalCommitCode: original.code };
            } else {
                const publication = SERVICE.DefaultPromotionPublicationService;
                if (!publication.deliveryRoots({ tenant: binding.tenant, storeCode: binding.storeCode }).includes(binding.rootCode)) this.fail();
                if (!publication.readCouponBudgetPolicy) this.fail();
                stage = 'BUDGET_POLICY';
                const policy = await publication.readCouponBudgetPolicy(envelope);
                this.amount(policy.budget.limit);
                details = { ...identity, promotionCode: binding.promotionCode, batchCode: binding.batchCode,
                    targetCode: admitted.targetCode, targetType: admitted.targetType, idempotencyKey: admitted.operationCode,
                    operationCode: admitted.operationCode, redemptionCode: admitted.operationCode,
                    ownerId: admitted.ownerId, storeCode: binding.storeCode, outletStoreCode: admitted.storeCode, rootCode: binding.rootCode,
                    policyFingerprint: binding.policyFingerprint, limit: policy.budget.limit,
                    amount: this.amount(admitted.benefit.amount), currency: admitted.benefit.currency,
                    sourceReference: admitted.benefit.sourceReference, issuanceFingerprint: binding.issuanceFingerprint,
                    purchaseFingerprint: admitted.purchaseFingerprint, sellerAuthorizationProof: structuredClone(binding.sellerAuthorizationProof),
                    benefitAuthority: 'ISSUED_COUPON_BENEFIT_V1' };
            }
            stage = 'BUDGET_TRANSACTION';
            const current = await this.mutate(r, details, original, envelope);
            if (admitted.mutationType === 'COMMIT') {
                stage = 'BUDGET_POLICY_READBACK';
                const policy = await SERVICE.DefaultPromotionPublicationService.readCouponBudgetPolicy(envelope);
                if (this.fingerprint(policy) !== details.policyFingerprint) this.fail();
            }
            return { receiptCode: this.code(details), originalCommitCode: original?.code || this.code(details),
                promotionCode: binding.promotionCode, couponCode: admitted.couponCode, mutationType: admitted.mutationType,
                revision: current.revision, budget: structuredClone(current.budget) };
        } catch (error) {
            if (error && typeof error === 'object' && !failures.has(error)) failures.set(error, stage);
            throw error;
        }
    },
    /** Consumes only an exact activated own-enterprise policy using stable command identity and an atomic counter/receipt transaction. @param {Object} request Original context. @param {Object} policy Selected activated policy. @param {string} amount Exact nonnegative benefit. @returns {Promise<Object>} Verified current budget row. */
    consume: async function (request, policy, amount) {
        const r = this.context(request);
        if (policy?.tenant !== r.tenant || policy.enterpriseCode !== r.enterpriseCode)
            throw new CLASSES.NodicsError('ERR_PROMOTION_SELLER_UNCONFIRMED');
        policy = structuredClone(policy);
        const secure = SERVICE.DefaultCouponSecureIssuanceService;
        if (!secure?.privateOperation) this.fail();
        return secure.privateOperation(r, async () => {
            await this.persistence(r);
            const selected = await this.policy(r, policy), operation = SERVICE.DefaultPromotionOperationService;
            const targetCode = r.payload?.cartCode || r.ownerId, key = operation.idempotencyKey(r, policy, targetCode);
            if (!this.identifier(policy.code) || !(r.payload?.cartCode ? this.identifier(targetCode) : this.actor(targetCode)) || !this.key(key) ||
                r.ownerId !== undefined && !this.actor(r.ownerId) || r.storeCode !== undefined && !this.identifier(r.storeCode) ||
                r.payload?.currency !== undefined && (typeof r.payload.currency !== 'string' || !/^[A-Z]{3,16}$/.test(r.payload.currency))) this.fail();
            return this.mutate(r, { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
                promotionCode: policy.code, mutationType: 'COMMIT', targetCode, idempotencyKey: key,
                ownerId: r.ownerId || null, storeCode: r.storeCode || null, rootCode: selected.rootCode,
                policyFingerprint: this.fingerprint(selected.policy), limit: selected.policy.budget.limit,
                amount: this.amount(amount), currency: r.payload?.currency || null,
                redemptionCode: operation.redemptionCode(r, policy, targetCode), targetType: r.payload?.cartCode ? 'CART' : 'CUSTOMER_CONTEXT' });
        });
    },
    /** Releases exactly one original own-enterprise COMMIT, never a supplied amount without durable original evidence. @param {Object} request Original reversal context. @param {Object} redemption Persisted redemption. @returns {Promise<Object>} Verified current budget row. */
    release: async function (request, redemption) {
        const r = this.context(request);
        redemption = redemption && Object.fromEntries(['code', 'tenant', 'enterpriseCode', 'promotionCode', 'targetCode', 'targetType',
            'idempotencyKey', 'discountAmount', 'ownerId', 'currency'].map(key => [key, redemption[key]]));
        const secure = SERVICE.DefaultCouponSecureIssuanceService;
        if (!secure?.privateOperation) this.fail();
        return secure.privateOperation(r, async () => {
            await this.persistence(r);
            if (!redemption || !this.identifier(redemption.promotionCode) || !this.actor(redemption.targetCode) ||
                !this.key(redemption.idempotencyKey) ||
                [redemption.tenant].some(value => value !== undefined && value !== r.tenant) ||
                [redemption.enterpriseCode].some(value => value !== undefined && value !== r.enterpriseCode)) this.fail();
            const identity = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, promotionCode: redemption.promotionCode,
                targetCode: redemption.targetCode, idempotencyKey: redemption.idempotencyKey, mutationType: 'COMMIT' };
            const original = await this.read('DefaultPromotionBudgetLedgerService', r, { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: this.code(identity) });
            if (!original) {
                const current = await this.read('DefaultPromotionService', r,
                    { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: redemption.promotionCode });
                if (current && !current.budget && !current.budgetAdmission && !(await this.activated(r, redemption.promotionCode)).policy.budget)
                    return undefined;
                this.fail();
            }
            const command = original.budgetMutation?.command;
            if (!command || Object.entries(identity).some(([key, value]) => command[key] !== value) ||
                command.amount !== this.amount(redemption.discountAmount) || command.storeCode !== (r.storeCode || null) ||
                command.redemptionCode !== redemption.code ||
                redemption.targetType !== undefined && command.targetType !== redemption.targetType ||
                redemption.ownerId !== undefined && command.ownerId !== redemption.ownerId ||
                r.ownerId !== undefined && command.ownerId !== r.ownerId ||
                redemption.currency !== undefined && command.currency !== redemption.currency) this.fail();
            this.receipt(original, command);
            return this.mutate(r, { ...command, mutationType: 'RELEASE', originalCommitCode: original.code }, original);
        });
    },
};
