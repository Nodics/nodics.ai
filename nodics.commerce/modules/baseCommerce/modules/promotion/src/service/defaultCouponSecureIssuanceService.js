/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const reads = new WeakSet(), writes = new WeakSet(), retention = new WeakSet();

/** @module promotion/service/defaultCouponSecureIssuanceService @description Owns atomic generated coupon issuance, encrypted retention on coupon aggregates, private reads and replay. Key material remains with the purpose-bound secret owner. @layer service @owner promotion @override Narrow issuance bounds or owner admission through exported members; retain immutable intent, original actor, generated transactions, authenticated scope and private read/write guards. */
module.exports = {
    /** Refuses without reporting secret values or provider errors. @param {string} code Stable failure. @returns {never} Refusal. */
    fail: function (code = 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED') { throw new CLASSES.NodicsError(code); },
    /** Resolves the fixed purpose-bound key owner; no generic configuration key or caller provider is accepted. @param {Object} r Trusted context. @returns {Promise<Object>} Ready owner. */
    keyOwner: async function (r) {
        const owner = SERVICE.DefaultSecretProtectionService;
        if (!owner?.assertReady || !owner.protect || !owner.unprotect)
            this.fail('ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED');
        try {
            if (await owner.assertReady({ tenant: r.tenant, purpose: 'PROMOTION_COUPON_TOKEN' }) !== true)
                this.fail('ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED');
        } catch (_) { this.fail('ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED'); }
        return owner;
    },
    /** Executes trusted detached owner work under existing private capture protection. @param {Object} r Context. @param {Function} action Owner work. @returns {Promise<*>} Protected result. */
    privateOperation: function (r, action) {
        const logger = SERVICE.DefaultLoggerService;
        if (!logger?.isRequestPrivacyQualified?.() || !logger.runSensitiveOperation)
            this.fail('ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED');
        if (logger.hasPrivateCaptureProtection(r)) return action();
        return logger.runSensitiveOperation({ tenant: r.tenant, operation: 'PROMOTION_COUPON_ISSUANCE' }, action);
    },
    /** Recognizes only in-flight owner-generated insert commands. @param {Object} r Exact request. @returns {boolean} Private identity. */
    isIssuanceWrite: function (r) { return writes.has(r); },
    /** Checks schema-owned protected reads before provider, count or cache execution. @param {Object} r Exact request. @param {Object} model Prepared model. @returns {boolean} Admission. */
    providerRead: function (r, model) {
        if (model.moduleName !== 'promotion' || !['coupon', 'couponBatch'].includes(model.schemaName)) this.fail();
        if (!reads.has(r) && /protectedToken|secureIssuance|\$where|\$function|\$accumulator/.test(
            JSON.stringify({ query: r.query, options: r.options, searchOptions: r.searchOptions }))) this.fail();
        if (!reads.has(r) && r.searchOptions?.projection &&
            Object.values(r.searchOptions.projection).some(value => ![0, 1, false, true].includes(value))) this.fail();
        return true;
    },
    /** Removes ciphertext and private issuance evidence before all generic reads/exports. @param {Object} r Exact request. @param {Object} response Pipeline envelope. @param {Object} model Prepared model. @returns {boolean} Projection complete. */
    providerResult: function (r, response, model) {
        this.providerRead(r, model);
        if (reads.has(r)) return true;
        const project = row => {
            if (!row || typeof row !== 'object') return row;
            const safe = { ...row };
            delete safe.protectedToken; delete safe.secureIssuance; delete safe.secureIssuanceCode;
            return safe;
        };
        if (response?.success?.result !== undefined) response.success.result = Array.isArray(response.success.result)
            ? response.success.result.map(project) : project(response.success.result);
        return true;
    },
    /** Rejects manufacture/erasure of retained secrets and proof through generic partial writers. @param {Object} r Generated write. @returns {boolean} Legacy non-proof mutation. */
    protect: function (r) {
        if (writes.has(r)) return true;
        for (const value of [].concat(r.models || r.model || [])) {
            if (!value || typeof value !== 'object' || Array.isArray(value) ||
                Object.keys(value).some(key => key.startsWith('$') && !['$set', '$unset', '$setOnInsert'].includes(key)) ||
                /protectedToken|secureIssuance/.test(JSON.stringify(value))) this.fail();
        }
        if (!SERVICE.DefaultCouponSellerAuthorizationService?.isCouponWrite(r))
            r.query = { ...(r.query || {}), protectedToken: { $exists: false }, secureIssuance: { $exists: false } };
        return true;
    },
    /** Fences ordinary save/upsert against issued aggregates, never replenishing them. @param {Object} r Generated save. @returns {boolean} Atomic exclusion. */
    protectSave: function (r) {
        this.protect(r);
        if (!writes.has(r)) r.query = { ...(r.query || {}), protectedToken: { $exists: false }, secureIssuance: { $exists: false } };
        return true;
    },
    /** Keeps original encrypted retention and issuance evidence from generic deletion. @param {Object} r Generated remove. @returns {boolean} Atomic exclusion. */
    protectRemove: function (r) {
        this.protect(r);
        r.query = { ...(r.query || {}), protectedToken: { $exists: false }, secureIssuance: { $exists: false } };
        return true;
    },
    /** Reads a bounded private generated result while preserving transaction identity. @param {string} name Generated owner. @param {Object} r Scope. @param {Object} query Selector. @param {number} maximum Bound. @returns {Promise<Array>} Detached rows. */
    read: async function (name, r, query, maximum = 1) {
        const service = SERVICE[name];
        if (!service?.get) this.fail();
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r), query,
            options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: maximum + 1, limit: maximum + 1 },
            ...(r.transactionContext ? { transactionContext: r.transactionContext } : {}) };
        reads.add(command);
        try {
            const response = await service.get(command);
            SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(response);
            if (!Array.isArray(response.result) || response.result.length > maximum ||
                response.result.some(row => Object.entries(query).some(([key, value]) => row[key] !== value))) this.fail();
            return structuredClone(response.result);
        } finally { reads.delete(command); }
    },
    /** Requires actual installed identities, private hooks and side-effect-safe transaction schemas. @param {Object} r Scope. @returns {Promise<void>} Persistence admission. */
    persistence: async function (r) {
        const config = CONFIG.get('databaseTransactions');
        if (config?.enabled !== true || config.failClosed !== true || !Number.isSafeInteger(config.maximumCommitTimeMs) || config.maximumCommitTimeMs < 1 ||
            SERVICE.DefaultDatabaseTransactionService?.capabilities({ moduleName: 'promotion', tenant: r.tenant }).multiRecordAtomic !== true)
            this.fail('ERR_PROMOTION_ISSUANCE_TRANSACTION_REQUIRED');
        for (const name of ['coupon', 'couponBatch']) {
            const model = (NODICS.getModels('promotion', r.tenant) || {})[UTILS.createModelName(name)];
            if (!model || model.versioned === true || typeof model.compareAndSetItem !== 'function' ||
                model.rawSchema?.readProtection?.owner !== 'DefaultCouponSecureIssuanceService' ||
                model.rawSchema.transaction?.enabled !== true || model.rawSchema.transaction.sideEffects !== 'none' ||
                model.rawSchema.cache?.enabled !== false || model.rawSchema.event?.enabled !== false || model.rawSchema.search?.enabled !== false ||
                !model.rawSchema.definition?.[name === 'coupon' ? 'protectedToken' : 'secureIssuance'] ||
                !model.guardProtectedRead || !model.projectReadResult || SERVICE.DefaultModelConcurrencyService?.getField(model.rawSchema))
                this.fail('ERR_PROMOTION_ISSUANCE_SCHEMA_REQUIRED');
            const hooks = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(name);
            for (const [trigger, member] of Object.entries({ preSave: 'protectSave', preUpdate: 'protect', preRemove: 'protectRemove' }))
                if (!hooks?.[trigger]?.some(item => [true, 'true'].includes(item.active) &&
                    item.handler === 'DefaultCouponSecureIssuanceService.' + member)) this.fail('ERR_PROMOTION_ISSUANCE_HOOKS_REQUIRED');
            const evidence = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
            const unique = keys => evidence?.versioned === false && evidence.indexes?.some(index => index.unique === true && !index.sparse &&
                !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') &&
                Object.keys(index.key || {}).sort().join(',') === keys.slice().sort().join(',') && keys.every(key => index.key[key] === 1));
            if (!unique(['code']) || name === 'coupon' && !unique(['tenant', 'tokenHash'])) this.fail('ERR_PROMOTION_ISSUANCE_INDEX_REQUIRED');
        }
    },
    /** Builds authenticated immutable token binding; lifecycle fields never change ciphertext scope. @param {Object} coupon Issued coupon. @param {string} intentDigest Original instruction hash. @param {Object} sellerAuthorizationProof Original delegated grant, absent for legacy self-issued stock. @returns {Object} AEAD binding. */
    binding: function (coupon, intentDigest, sellerAuthorizationProof) {
        return { tenant: coupon.tenant, issuerEnterpriseCode: coupon.issuerEnterpriseRef?.code, vendorEnterpriseCode: coupon.vendorEnterpriseRef?.code,
            promotionCode: coupon.promotionCode, batchCode: coupon.batchCode, couponCode: coupon.code, tokenHash: coupon.tokenHash, intentDigest,
            ...(sellerAuthorizationProof ? { sellerAuthorizationProof } : {}) };
    },
    /** Resolves issuer authority and policy-derived operational seller without changing signed request scope. Self-issued commands retain their original receipt shape. @param {Object} r Signed issuer. @param {Object} policy Pinned policy. @param {Object} expected Original authority on a recheck. @returns {Promise<Object|undefined>} Delegated immutable authority. */
    authorizeIssuance: async function (r, policy, expected) {
        const seller = SERVICE.DefaultCouponSellerAuthorizationService;
        for (const key of ['issuerEnterpriseRef', 'vendorEnterpriseRef'])
            if (policy[key]?.moduleName !== 'profile' || policy[key]?.schemaName !== 'enterprise' ||
                typeof policy[key]?.code !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(policy[key].code))
                this.fail('ERR_PROMOTION_ISSUANCE_ENTERPRISE_REQUIRED');
        if (policy.issuerEnterpriseRef.code !== r.enterpriseCode) this.fail('ERR_PROMOTION_ISSUANCE_ENTERPRISE_REQUIRED');
        if (policy.vendorEnterpriseRef.code === r.enterpriseCode) {
            if (expected) this.fail();
            return undefined;
        }
        if (!seller?.authorizeIssuance) this.fail('ERR_PROMOTION_ISSUANCE_ENTERPRISE_REQUIRED');
        const proof = await seller.authorizeIssuance(r, policy, expected?.sellerAuthorizationProof);
        const authority = { issuerEnterpriseRef: structuredClone(policy.issuerEnterpriseRef),
            vendorEnterpriseRef: structuredClone(policy.vendorEnterpriseRef), sellerAuthorizationProof: proof };
        if (!proof || proof.issuerEnterpriseCode !== r.enterpriseCode ||
            proof.sellerEnterpriseCode !== policy.vendorEnterpriseRef.code || proof.promotionCode !== policy.code ||
            !Number.isSafeInteger(proof.grantRevision) || proof.grantRevision < 1 ||
            expected && !isDeepStrictEqual(authority, expected)) this.fail();
        return authority;
    },
    /** Validates immutable issuer/vendor/grant receipt shape and returns its operational seller. No request-supplied seller selector is accepted. @param {Object} command Original issuance command. @returns {string} Stock enterprise. */
    stockEnterprise: function (command) {
        const authority = command.issuanceAuthority;
        if (authority === undefined) return command.enterpriseCode;
        const proof = authority?.sellerAuthorizationProof;
        if (!authority || Object.keys(authority).sort().join(',') !== 'issuerEnterpriseRef,sellerAuthorizationProof,vendorEnterpriseRef' ||
            !proof || Object.keys(proof).sort().join(',') !== 'grantRevision,issuerEnterpriseCode,promotionCode,sellerEnterpriseCode' ||
            !Number.isSafeInteger(proof.grantRevision) || proof.grantRevision < 1 ||
            proof.issuerEnterpriseCode !== command.enterpriseCode || proof.promotionCode !== command.promotionCode ||
            proof.sellerEnterpriseCode === command.enterpriseCode) this.fail();
        for (const [key, code] of [['issuerEnterpriseRef', command.enterpriseCode], ['vendorEnterpriseRef', proof.sellerEnterpriseCode]])
            if (authority[key]?.moduleName !== 'profile' || authority[key]?.schemaName !== 'enterprise' ||
                typeof code !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code) || authority[key].code !== code) this.fail();
        return proof.sellerEnterpriseCode;
    },
    /** Checks every aggregate association against original immutable authority and the batch, not only reference codes. @param {Object} row Original aggregate. @param {Object} command Original command. @param {Object} references Pinned policy or original batch. @returns {void} Exact association or refusal. */
    assertStockScope: function (row, command, references) {
        const enterprise = this.stockEnterprise(command), authority = command.issuanceAuthority;
        const issuer = authority?.issuerEnterpriseRef || references.issuerEnterpriseRef,
            vendor = authority?.vendorEnterpriseRef || references.vendorEnterpriseRef;
        if (row.tenant !== command.tenant || row.enterpriseCode !== enterprise || row.promotionCode !== command.promotionCode ||
            issuer?.moduleName !== 'profile' || issuer?.schemaName !== 'enterprise' || issuer?.code !== command.enterpriseCode ||
            vendor?.moduleName !== 'profile' || vendor?.schemaName !== 'enterprise' || vendor?.code !== enterprise ||
            !isDeepStrictEqual(row.issuerEnterpriseRef, issuer) || !isDeepStrictEqual(row.vendorEnterpriseRef, vendor) ||
            !isDeepStrictEqual(row.enterpriseRef, authority ? vendor : issuer) ||
            authority && row.code !== command.batchCode &&
                !isDeepStrictEqual(row.sellerAuthorizationProof, authority.sellerAuthorizationProof)) this.fail();
    },
    /** Validates retained batch identity and all original units without changing sold/consumed lifecycle state. @param {Object} r Scope. @param {Object} command Pinned intent. @param {Object} policy Pinned policy associations, when available. @returns {Promise<Object|undefined>} Exact original batch. */
    original: async function (r, command, policy) {
        const rows = await this.read('DefaultCouponBatchService', r, { tenant: r.tenant, code: command.batchCode });
        if (!rows.length) return undefined;
        const batch = rows[0], receipt = batch.secureIssuance, fp = SERVICE.DefaultPromotionPublicationService.fingerprint;
        const actor = receipt?.command?.actorId;
        this.assertStockScope(batch, command, policy || batch);
        if (command.enterpriseCode !== r.enterpriseCode || batch.promotionCode !== command.promotionCode ||
            typeof actor !== 'string' || !actor.trim() || actor !== actor.trim() || actor.length > 192 || /[\u0000-\u001f\u007f]/.test(actor) ||
            fp(receipt.command) !== fp({ ...command, actorId: actor }) || !Number.isFinite(Date.parse(receipt.createdAt)) ||
            batch.issuedCount !== command.quantity ||
            !Array.isArray(receipt.units) || receipt.units.length !== command.quantity ||
            receipt.units.some((unit, index) => !unit || unit.code !== command.batchCode + ':' + (index + 1) ||
                !/^[a-f0-9]{64}$/.test(unit.tokenHash || '') || !/^[a-f0-9]{64}$/.test(unit.protectedFingerprint || '')) ||
            new Set(receipt.units.map(unit => unit.code)).size !== command.quantity) this.fail();
        const originalUnits = await this.read('DefaultCouponService', r, { tenant: r.tenant, batchCode: batch.code }, command.quantity);
        if (originalUnits.length !== command.quantity) this.fail();
        for (const unit of receipt.units) {
            const coupon = originalUnits.find(item => item.code === unit.code);
            if (!coupon) this.fail();
            this.assertStockScope(coupon, command, batch);
            if (coupon.promotionCode !== command.promotionCode ||
                coupon.batchCode !== batch.code || coupon.secureIssuanceCode !== batch.code || coupon.tokenHash !== unit.tokenHash ||
                fp(coupon.protectedToken) !== unit.protectedFingerprint) this.fail();
            retention.add(coupon);
            try { await this.privateOperation(r, () => this.retainedToken(r, coupon, receipt.command)); }
            finally { retention.delete(coupon); }
        }
        return batch;
    },
    /** Checks authenticated retention and retained key availability inside private capture protection. @param {Object} r Scope. @param {Object} coupon Private original row. @param {Object} command Original immutable intent. @returns {Promise<string>} Verified raw token only inside private owners. */
    retainedToken: async function (r, coupon, command) {
        if (!retention.has(coupon) || SERVICE.DefaultLoggerService?.isSensitiveRequest(r) !== true) this.fail();
        const owner = await this.keyOwner(r);
        let token;
        try { token = await owner.unprotect({ tenant: r.tenant, purpose: 'PROMOTION_COUPON_TOKEN',
            binding: this.binding(coupon, SERVICE.DefaultPromotionPublicationService.fingerprint(command),
                command.issuanceAuthority?.sellerAuthorizationProof), envelope: coupon.protectedToken }); }
        catch (_) { this.fail(); }
        if (typeof token !== 'string' || !/^[A-F0-9]{64}$/.test(token) ||
            SERVICE.DefaultPromotionOperationService.hashToken(r.tenant, token) !== coupon.tokenHash) this.fail();
        return token;
    },
    /** Re-resolves current scope/pinned policy and installed owner evidence for a validated issuance intent. @param {Object} request Setup context. @param {Object} intent Batch intent. @param {Object} campaign Pinned campaign instruction. @returns {Promise<Object>} Read-only owner plan. */
    prepare: async function (request, intent, campaign) {
        const admission = SERVICE.DefaultPromotionBudgetAdmissionService, setup = SERVICE.DefaultPromotionSetupContributionService;
        const r = admission.context(setup.campaignRequest(request, campaign));
        const role = CONFIG.get('runtimeRole');
        if ((typeof role === 'string' ? role : role?.code) !== 'COMMERCE' ||
            !intent || Object.keys(intent).sort().join(',') !== 'batchCode,commandReference,promotionCode,quantity' ||
            !['batchCode', 'commandReference', 'promotionCode'].every(key => /^[A-Za-z0-9_.:-]{1,128}$/.test(intent[key] || '')) ||
            intent.promotionCode !== r.promotionCode || !Number.isSafeInteger(intent.quantity) || intent.quantity < 1 || intent.quantity > 1000) this.fail();
        const policy = await admission.policy(r, r.payload);
        if (Object.hasOwn(campaign, 'admissionContribution')) await setup.prepareCampaign(request, campaign);
        const issuanceAuthority = await this.authorizeIssuance(r, policy);
        await this.keyOwner(r); await this.persistence(r);
        const command = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, ...intent, storeCode: campaign.storeCode,
            rootCode: campaign.rootCode, policyFingerprint: campaign.policyFingerprint, actorId: r.actorId,
            contribution: setup.contributionIdentity(request.contribution),
            ...(issuanceAuthority ? { issuanceAuthority } : {}),
            ...(Object.hasOwn(campaign, 'admissionContribution') ? { admissionCommandReference: campaign.commandReference,
                admissionContribution: setup.contributionIdentity(campaign.admissionContribution) } : {}) };
        this.stockEnterprise(command);
        const original = await this.original(r, command, policy);
        if (!original && (await this.read('DefaultCouponService', r, { tenant: r.tenant, batchCode: intent.batchCode }, 1)).length) this.fail();
        await this.authorizeIssuance(r, policy, issuanceAuthority);
        return { r, command, policy, original };
    },
    /** Saves a private insert through the generated pipeline and original transaction. @param {string} name Generated owner. @param {Object} r Context. @param {Object} model Owner-built record. @returns {Promise<void>} Confirmed insertion. */
    insert: async function (name, r, model) {
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r), transactionContext: r.transactionContext,
            query: { tenant: r.tenant, enterpriseCode: model.enterpriseCode, code: model.code }, model,
            options: { insertOnly: true, recursive: false } };
        if (!command.transactionContext || !SERVICE[name]?.save) this.fail();
        writes.add(command);
        try { SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(await SERVICE[name].save(command)); }
        finally { writes.delete(command); }
    },
    /** Generates cryptographically random tokens once and atomically inserts batch/proof/encrypted units; exact replay never generates replacements. @param {Object} request Setup context. @param {Object} intent Batch intent. @param {Object} campaign Pinned campaign. @returns {Promise<Object>} Secret-free receipt. */
    issue: async function (request, intent, campaign) {
        request = { ...request, authData: structuredClone(request.authData), contribution: structuredClone(request.contribution) };
        intent = structuredClone(intent); campaign = structuredClone(campaign);
        SERVICE.DefaultPromotionBudgetAdmissionService.context(SERVICE.DefaultPromotionSetupContributionService.campaignRequest(request, campaign));
        return this.privateOperation(request, async () => {
            const prepared = await this.prepare(request, intent, campaign), { r, command, policy } = prepared;
            if (prepared.original) return { batchCode: intent.batchCode, quantity: intent.quantity, replayed: true };
            const budget = await SERVICE.DefaultPromotionSetupContributionService.prepareCampaign(request, campaign);
            if (!budget.current) this.fail();
            const owner = await this.keyOwner(r), fp = SERVICE.DefaultPromotionPublicationService.fingerprint;
            const stockEnterprise = this.stockEnterprise(command);
            const intentDigest = fp(command), now = new Date(), models = [];
            for (let index = 0; index < intent.quantity; index++) {
                const token = crypto.randomBytes(32).toString('hex').toUpperCase();
                const coupon = SERVICE.DefaultPromotionOperationService.withSchemaBase({ code: intent.batchCode + ':' + (index + 1), tenant: r.tenant,
                    enterpriseCode: stockEnterprise, promotionCode: intent.promotionCode, batchCode: intent.batchCode,
                    issuerEnterpriseRef: structuredClone(policy.issuerEnterpriseRef), vendorEnterpriseRef: structuredClone(policy.vendorEnterpriseRef),
                    enterpriseRef: structuredClone(command.issuanceAuthority ? policy.vendorEnterpriseRef : policy.issuerEnterpriseRef),
                    tokenHash: SERVICE.DefaultPromotionOperationService.hashToken(r.tenant, token),
                    status: 'ACTIVE', saleStatus: 'AVAILABLE', benefitStatus: 'UNCLAIMED', maxUses: 1, usedCount: 0, revision: 0,
                    ...(command.issuanceAuthority ? { sellerAuthorizationProof: structuredClone(command.issuanceAuthority.sellerAuthorizationProof) } : {}),
                    secureIssuanceCode: intent.batchCode }, r);
                try { coupon.protectedToken = await owner.protect({ tenant: r.tenant, purpose: 'PROMOTION_COUPON_TOKEN',
                    binding: this.binding(coupon, intentDigest, command.issuanceAuthority?.sellerAuthorizationProof), value: token }); }
                catch (_) { this.fail(); }
                if (!coupon.protectedToken || typeof coupon.protectedToken !== 'object' || Array.isArray(coupon.protectedToken) ||
                    JSON.stringify(coupon.protectedToken).includes(token)) this.fail();
                models.push(coupon);
            }
            const batch = SERVICE.DefaultPromotionOperationService.withSchemaBase({ code: intent.batchCode, tenant: r.tenant, enterpriseCode: stockEnterprise,
                promotionCode: intent.promotionCode, issuerEnterpriseRef: structuredClone(policy.issuerEnterpriseRef), vendorEnterpriseRef: structuredClone(policy.vendorEnterpriseRef),
                enterpriseRef: structuredClone(command.issuanceAuthority ? policy.vendorEnterpriseRef : policy.issuerEnterpriseRef),
                status: 'GENERATED', issuedCount: intent.quantity, reservedCount: 0,
                tokenHashPolicy: 'TENANT_UPPERCASE_SHA256', revision: 0, secureIssuance: { command, createdAt: now.toISOString(),
                    units: models.map(coupon => ({ code: coupon.code, tokenHash: coupon.tokenHash, protectedFingerprint: fp(coupon.protectedToken) })) } }, r);
            let replayed = false;
            try {
                await SERVICE.DefaultDatabaseTransactionService.execute({ moduleName: 'promotion', tenant: r.tenant }, async transactionContext => {
                    const scoped = { ...r, transactionContext };
                    await this.authorizeIssuance(r, policy, command.issuanceAuthority);
                    if (await this.original(scoped, command, policy)) {
                        await this.authorizeIssuance(r, policy, command.issuanceAuthority);
                        replayed = true; return;
                    }
                    await this.insert('DefaultCouponBatchService', scoped, batch);
                    for (const coupon of models) await this.insert('DefaultCouponService', scoped, coupon);
                    await this.authorizeIssuance(r, policy, command.issuanceAuthority);
                });
            } catch (_) {
                await this.authorizeIssuance(r, policy, command.issuanceAuthority);
                if (!await this.original(r, command, policy)) this.fail();
                replayed = true;
            }
            await this.authorizeIssuance(r, policy, command.issuanceAuthority);
            if (!await this.original(r, command, policy)) this.fail();
            await this.authorizeIssuance(r, policy, command.issuanceAuthority);
            return { batchCode: intent.batchCode, quantity: intent.quantity, replayed };
        });
    },
    /** Decrypts only after the existing Digital owner revalidates payment/purchase/delivery and current customer scope. @param {Object} r Privately admitted customer request. @param {Object} observed Already authorized coupon snapshot. @returns {Promise<string>} Raw token only to reveal response. */
    revealToken: async function (r, observed) {
        if (!SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection(r)) this.fail();
        const fp = SERVICE.DefaultPromotionPublicationService.fingerprint;
        const current = (await this.read('DefaultCouponService', r, { tenant: r.tenant, code: observed.code }))[0];
        if (!current || current.enterpriseCode !== r.enterpriseCode || !current.protectedToken || !current.secureIssuanceCode ||
            current.revision !== observed.revision || current.status !== observed.status || current.soldTo !== r.ownerId) this.fail();
        const batch = (await this.read('DefaultCouponBatchService', r, { tenant: r.tenant, code: current.secureIssuanceCode }))[0];
        const receipt = batch?.secureIssuance, unit = receipt?.units?.find(item => item.code === current.code);
        if (!receipt?.command || receipt.command.tenant !== r.tenant || this.stockEnterprise(receipt.command) !== r.enterpriseCode ||
            receipt.command.batchCode !== current.batchCode || receipt.command.promotionCode !== current.promotionCode ||
            !unit || unit.tokenHash !== current.tokenHash || unit.protectedFingerprint !== fp(current.protectedToken)) this.fail();
        this.assertStockScope(batch, receipt.command, batch);
        this.assertStockScope(current, receipt.command, batch);
        await SERVICE.DefaultDigitalCommerceEntitlementService.authorizeCouponReveal(r, current);
        retention.add(current);
        let token;
        try { token = await this.retainedToken(r, current, receipt.command); }
        finally { retention.delete(current); }
        await SERVICE.DefaultDigitalCommerceEntitlementService.authorizeCouponReveal(r, current);
        const final = (await this.read('DefaultCouponService', r, { tenant: r.tenant, code: current.code }))[0];
        if (!final || final.revision !== current.revision || final.status !== current.status || final.soldTo !== current.soldTo ||
            fp(final.protectedToken) !== fp(current.protectedToken)) this.fail();
        this.assertStockScope(final, receipt.command, batch);
        return token;
    },
};
