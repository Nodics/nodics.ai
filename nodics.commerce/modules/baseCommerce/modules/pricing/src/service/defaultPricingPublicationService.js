/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
// Only fixed admitted target execution can bind a continuation to its private context.
const targetGuards = new WeakMap();
const targetContext = Symbol('Pricing private target context');

/**
 * @module pricing/src/service/defaultPricingPublicationService
 * @description Owns retained Pricing policy capture, hidden target preparation,
 * managed-CAS activation receipts and activated reads for nPublish providers.
 * Uses generated persistence and module transport; never owns approval or operational state.
 * Legacy mutable restoration stays disabled and installed registration remains gated.
 * @layer service
 * @owner pricing
 * @override Extend policy fields through this owner; preserve scope, operational exclusions
 * and nPublish authority. Never implement a second journal or activate through restore.
 */
module.exports = {
    /** Executes one fixed, already source-authorized controller target operation with private original-caller continuation. */
    executePublicationTarget: async function (operation, input, context, originalRequest) {
        if (!['prepare', 'activate', 'reconcile'].includes(operation) || context[targetContext] || targetGuards.has(context))
            throw new Error('Unsupported or concurrent Pricing target execution');
        const originalGuard = this.requirePublicationCaller(originalRequest, operation);
        const state = () => this.fingerprint({ scope: this.scope(context), authData: context.authData,
            recovery: context.legacyCasRecoveryAuthorization });
        const before = state();
        const guard = () => {
            originalGuard();
            if (context.authData?.isSystem !== true || state() !== before)
                throw new Error('Pricing target persistence context changed');
        };
        guard(); context[targetContext] = true; targetGuards.set(context, guard);
        try {
            if (operation === 'prepare') return await this.prepareTarget(input.release, context);
            if (operation === 'activate') return await this.switchTarget(input, context);
            return await this.reconcileTarget(input.publication, input.operationKey, context);
        } finally { targetGuards.delete(context); }
    },
    /** Revalidates an admitted target context; internal non-HTTP provider contexts retain their existing owner contract. */
    checkTargetContext: function (request) {
        const guard = targetGuards.get(request);
        if (request[targetContext] && !guard) throw new Error('Copied or retired Pricing target context');
        guard?.();
    },
    /** Requires the exact signed writer/callback selected by the existing publication transport binding; read admission is not write authority. */
    requirePublicationCaller: function (request, operation) {
        const bindingKey = ['prepare', 'activate', 'reconcile'].includes(operation) ? 'sourceAuthority' :
            operation === 'authorize' ? 'target' : null;
        if (!bindingKey) throw new Error('Unsupported Pricing publication caller operation');
        const state = () => this.fingerprint({ authData: request.authData, tenant: request.tenant, tenantCode: request.tenantCode,
            entCode: request.entCode, enterpriseCode: request.enterpriseCode,
            headers: Object.fromEntries(['tenant', 'x-tenant-code', 'X-Tenant-Code', 'entCode', 'x-enterprise-code', 'X-Enterprise-Code']
                .map(key => [key, request.httpRequest?.headers?.[key]])), settings: this.publicationSettings(),
            permission: CONFIG.get('authSecurity')?.internalToken?.routePermission,
            enterprisePolicy: CONFIG.get('publish')?.approvalWorkflow?.runtimeEnterpriseScope });
        const before = state(), originalAuth = request.authData;
        const check = () => {
            if (bindingKey === 'sourceAuthority') this.requireTarget(); else this.requireSource();
            const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'pricing');
            if (auth !== originalAuth || state() !== before || auth.principalType !== 'service' || auth.isSystem ||
                [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
                auth.enterpriseCode !== undefined && auth.enterpriseCode !== auth.entCode)
                throw new Error('Pricing publication caller authority changed or unavailable');
            const binding = this.publicationSettings()[bindingKey], callers = binding?.callers;
            const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
            const keys = ['tenant', 'principalEnterpriseCode', 'serviceId', 'projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'];
            if (!identifier(binding?.moduleName) || !identifier(binding?.connectionName) || binding.connectionName === 'default' ||
                !identifier(binding?.runtimeRole) || !Array.isArray(callers) || !callers.length || callers.length > 100 ||
                callers.some(caller => !caller || Object.keys(caller).sort().join(',') !== [...keys].sort().join(',') ||
                    keys.some(key => !identifier(caller[key])))) throw new Error('Exact Pricing publication caller binding is required');
            const matches = callers.filter(caller => caller.tenant === auth.tenant && caller.principalEnterpriseCode === auth.entCode &&
                caller.serviceId === auth.serviceId && caller.instanceCode === auth.runtimeInstanceId &&
                ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode']
                    .every(key => caller[key] === auth.runtimeScope?.[key]));
            if (matches.length !== 1) throw new Error('Pricing publication caller is not the qualified deployment');
        };
        check(); return check;
    },
    /** Projects one exact activated row for an admitted runtime; never authors, publishes or substitutes a current Product. */
    rowEvidence: async function (request) {
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'pricing');
        const security = SERVICE.DefaultSecuredRequestPipelineService, permission = CONFIG.get('authSecurity')?.internalToken?.routePermission;
        const state = () => this.fingerprint({ tenant: request.tenant, tenantCode: request.tenantCode,
            enterpriseCode: request.enterpriseCode, entCode: request.entCode, authData: request.authData,
            payload: request.payload, body: request.httpRequest?.body, query: request.query,
            headers: Object.fromEntries(['tenant', 'x-tenant-code', 'X-Tenant-Code', 'entCode', 'x-enterprise-code', 'X-Enterprise-Code']
                .map(key => [key, request.httpRequest?.headers?.[key]])),
            settings: this.publicationSettings(), enterprisePolicy: CONFIG.get('publish')?.approvalWorkflow?.runtimeEnterpriseScope });
        const before = state(), input = structuredClone(request.payload || {});
        const check = () => {
            if (SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'pricing') !== auth || auth.isSystem ||
                SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true || state() !== before ||
                typeof permission !== 'string' || !permission || CONFIG.get('authSecurity')?.internalToken?.routePermission !== permission ||
                !security?.isPermissionGranted?.(permission, security.getGrantedPermissions(request), {}) ||
                request.tenant !== auth.tenant || [request.tenantCode, auth.tenantCode, request.httpRequest?.headers?.tenant,
                    request.httpRequest?.headers?.['x-tenant-code'], request.httpRequest?.headers?.['X-Tenant-Code']]
                    .some(value => value !== undefined && value !== auth.tenant) ||
                [auth.enterpriseCode, request.enterpriseCode, request.entCode, request.httpRequest?.headers?.entCode,
                    request.httpRequest?.headers?.['x-enterprise-code'], request.httpRequest?.headers?.['X-Enterprise-Code']]
                    .some(value => value !== undefined && value !== auth.entCode)) throw new Error('Pricing row evidence authority changed or unavailable');
            if (input.enterpriseCode !== auth.entCode) {
                const workflow = SERVICE.DefaultPublicationApprovalWorkflowService;
                if (!workflow?.requireRuntimeEnterprise) throw new Error('Pricing row evidence business enterprise is not qualified');
                workflow.requireRuntimeEnterprise(auth, input.enterpriseCode);
            }
        };
        check(); this.requireTarget();
        const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
        if (Object.keys(input).sort().join(',') !== 'contractVersion,enterpriseCode,priceBookCode,priceRowCode,productReference' ||
            input.contractVersion !== 1 || ![input.enterpriseCode, input.priceBookCode, input.priceRowCode].every(identifier) ||
            this.publicationSettings().delivery?.rowReleases !== true) throw new Error('Exact enabled Pricing row evidence is required');
        const reference = this.productReference(input.productReference), identity = SERVICE.DefaultIdentityGovernanceService;
        if (!identity?.getSystemAuthData) throw new Error('Pricing row evidence persistence owner unavailable');
        const persistenceAuth = identity.getSystemAuthData();
        if (persistenceAuth?.isSystem !== true) throw new Error('Pricing row evidence persistence owner unavailable');
        const context = { tenant: request.tenant, enterpriseCode: input.enterpriseCode, authData: persistenceAuth,
            storeCode: reference.storeCode, productCode: reference.productCode, productReferences: [{ productCode: reference.productCode,
                storeCode: reference.storeCode, targetVersion: reference.targetVersion }] };
        if (!this.deliveryEnabled(context) || !this.deliveryRoots(context).includes(input.priceBookCode)) throw new Error('Pricing row evidence delivery is not selected');
        const services = this.targetServices(), pointerCode = this.pointerCode({ rootType: 'priceRow', rootCode: input.priceRowCode }, context);
        const bookBefore = await this.getTargetStatus({ rootType: 'priceBook', rootCode: input.priceBookCode }, context); check();
        const pointer = await this.readRecord(services.pointer, pointerCode, context); check();
        if (!pointer?.version || pointer.rootType !== 'priceRow' || pointer.rootCode !== input.priceRowCode ||
            pointer.priceBookCode !== input.priceBookCode || pointer.productCode !== reference.productCode || pointer.storeCode !== reference.storeCode)
            throw new Error('Exact activated Pricing row is unavailable');
        const release = await this.retainedVersion(pointer.version, context); check();
        const row = this.rowRelease(release.payload);
        if (release.rootType !== 'priceRow' || release.rootCode !== input.priceRowCode || row.book.code !== input.priceBookCode ||
            !require('node:util').isDeepStrictEqual(row.reference, reference)) throw new Error('Pricing row Product reference mismatch');
        const records = await this.readConfigured(context); check();
        const books = records.filter(item => item.schema === 'priceBook').map(item => item.policy),
            rows = records.filter(item => item.schema === 'priceRow').map(item => item.policy);
        const selected = SERVICE.DefaultPriceSelectionService.select({ ...context, currency: row.row.currency, quantity: '1', now: new Date() },
            books, rows, SERVICE.DefaultExactAmountService);
        if (selected.selected?.code !== input.priceRowCode || selected.conflicts.length || selected.selected.active === false ||
            selected.selected.minQuantity !== '1' || this.fingerprint({ ...selected.selected, productReference: undefined }) !== this.fingerprint(row.row))
            throw new Error('Exact Pricing row is not currently effective');
        const receipt = await this.readRecord(services.receipt, pointer.receiptCode, context); check();
        const freshPointer = await this.readRecord(services.pointer, pointerCode, context); check();
        if (this.fingerprint(freshPointer) !== this.fingerprint(pointer) || receipt?.applied !== true || receipt.pointerCode !== pointerCode ||
            receipt.targetVersion !== pointer.version || receipt.sourceVersion !== release.code || receipt.fingerprint !== release.code ||
            receipt.expectedRevision + 1 !== pointer.revision || !identifier(receipt.publicationCode) ||
            typeof receipt.operationKey !== 'string' || !receipt.operationKey || receipt.operationKey.length > 256)
            throw new Error('Pricing row activation receipt changed or unavailable');
        this.assertProductStatus(row.reference, row.evidence, await this.productStatus(row.reference, row.evidence, context), context); check();
        const bookAfter = await this.getTargetStatus({ rootType: 'priceBook', rootCode: input.priceBookCode }, context); check();
        const freshReceipt = await this.readRecord(services.receipt, pointer.receiptCode, context); check();
        if (this.fingerprint(bookAfter) !== this.fingerprint(bookBefore) || this.fingerprint(freshReceipt) !== this.fingerprint(receipt) ||
            SERVICE.DefaultPriceSelectionService.select({ ...context, currency: row.row.currency, quantity: '1', now: new Date() },
                books, rows, SERVICE.DefaultExactAmountService).selected?.code !== input.priceRowCode)
            throw new Error('Pricing row evidence changed before readback');
        return { contractVersion: 1, tenant: request.tenant, enterpriseCode: input.enterpriseCode,
            row: { code: row.row.code, priceBookCode: row.book.code, productCode: row.row.productCode,
                unitAmount: row.row.unitAmount, currency: row.row.currency, minQuantity: '1', active: row.row.active !== false },
            productReference: reference, publicationCode: receipt.publicationCode, sourceVersion: receipt.sourceVersion,
            targetVersion: pointer.version, pointerRevision: pointer.revision, activationOperationKey: receipt.operationKey, receiptCode: receipt.code };
    },
    /** Validates the exact reviewed Product identity; a Product code alone is not compatibility evidence. */
    productReference: function (reference) {
        const keys = ['publicationCode', 'productCode', 'storeCode', 'sourceVersion', 'targetVersion'];
        if (!reference || Object.keys(reference).sort().join(',') !== keys.sort().join(',') ||
            ['publicationCode', 'productCode', 'storeCode'].some(key => typeof reference[key] !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(reference[key])) ||
            typeof reference.sourceVersion !== 'string' || !/^(0|[1-9]\d*)$/.test(reference.sourceVersion) ||
            !Number.isSafeInteger(Number(reference.sourceVersion)) || !/^[a-f0-9]{64}$/.test(reference.targetVersion || ''))
            throw new Error('Exact approved Product reference required');
        return structuredClone(reference);
    },
    /** Reads the existing Product owner pointer/receipt, never mutable Product data or caller approval flags. */
    productStatus: function (reference, evidence, request) {
        const scope = { tenant: request.tenant, productCode: reference.productCode, storeCode: reference.storeCode };
        const input = { scope, operationKey: evidence.operationKey };
        if (this.publicationSettings().runtimeRole === 'STAGED') {
            const provider = SERVICE.DefaultProductPublicationVersionProviderService;
            if (!provider?.transport) throw new Error('Product publication owner unavailable');
            return provider.transport().getStatus(input, request);
        }
        if (!SERVICE.DefaultProductPublicationTargetService?.getStatus) throw new Error('Product target owner unavailable');
        return SERVICE.DefaultProductPublicationTargetService.getStatus(input, request);
    },
    /** Rejects stale/ABA Product activation and receipts not bound to the reviewed immutable Product. */
    assertProductStatus: function (reference, evidence, status, request) {
        const receipt = status?.receipt;
        if (!Number.isSafeInteger(evidence?.revision) || evidence.revision < 1 ||
            typeof evidence.operationKey !== 'string' || !evidence.operationKey ||
            status?.version !== reference.targetVersion || status.revision !== evidence.revision ||
            this.fingerprint(status.scope) !== this.fingerprint({ tenant: request.tenant, productCode: reference.productCode, storeCode: reference.storeCode }) ||
            receipt?.committed !== true || receipt.operationKey !== evidence.operationKey ||
            receipt.publicationCode !== reference.publicationCode || receipt.sourceVersion !== reference.sourceVersion ||
            receipt.targetVersion !== reference.targetVersion || this.fingerprint(receipt.scope) !== this.fingerprint(status.scope))
            throw new Error('Approved Product activation changed or is unconfirmed');
    },
    /** Captures genuine Product approval and immutable graph proof through the existing lifecycle/provider owners. */
    approvedProduct: async function (reference, request) {
        reference = this.productReference(reference);
        const auth = request.authData || {}, scope = this.scope(request);
        if (auth.principalType !== 'human' || auth.tokenType !== 'access' || auth.isSystem || auth.tenant !== scope.tenant ||
            (auth.entCode || auth.enterpriseCode) !== scope.enterpriseCode ||
            [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
            !(auth.principalId || auth.loginId || auth.code) ||
            [auth.entCode, auth.enterpriseCode, request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== scope.enterpriseCode))
            throw new Error('Signed book-owner publisher is required for row capture');
        const lifecycle = SERVICE.DefaultPublicationLifecycleService, provider = SERVICE.DefaultProductPublicationVersionProviderService;
        if (!lifecycle?.get || !provider?.getVersion) throw new Error('Product publication evidence unavailable');
        const publication = await lifecycle.get({ ...request, publicationCode: reference.publicationCode });
        if (publication?.domain !== 'product' || publication.rootType !== 'product' || publication.rootCode !== reference.productCode ||
            publication.tenantCode !== request.tenant || publication.enterpriseCode !== this.scope(request).enterpriseCode ||
            publication.sourceVersion !== reference.sourceVersion || publication.targetVersion !== reference.targetVersion ||
            publication.state !== 'ONLINE' || !publication.auditTrail?.some(row => row.toState === 'APPROVED') ||
            !publication.activationOperation?.key) throw new Error('Product has no exact approved publication');
        const manifest = await provider.getVersion(publication, request);
        if (manifest?.version !== reference.targetVersion || manifest.root?.code !== reference.productCode ||
            String(manifest.root.versionId) !== reference.sourceVersion || manifest.root.enterpriseCode !== this.scope(request).enterpriseCode ||
            this.fingerprint(manifest.scope) !== this.fingerprint({ tenant: request.tenant, productCode: reference.productCode, storeCode: reference.storeCode }))
            throw new Error('Approved Product graph mismatch');
        const status = await this.productStatus(reference, { operationKey: publication.activationOperation.key }, request);
        const evidence = { operationKey: publication.activationOperation.key, revision: status?.revision };
        this.assertProductStatus(reference, evidence, status, request);
        return evidence;
    },
    /** Qualifies one exact row/book anchor and its immutable Product reference without authoring writes. */
    rowRelease: function (payload) {
        const records = payload?.records, rows = records?.filter(item => item.schema === 'priceRow'), books = records?.filter(item => item.schema === 'priceBook');
        if (payload?.rootType !== 'priceRow' || records?.length !== 2 || rows?.length !== 1 || books?.length !== 1 ||
            rows[0].policy.code !== payload.rootCode || rows[0].policy.priceBookCode !== books[0].policy.code ||
            rows[0].policy.productCode !== this.productReference(payload.productReference).productCode ||
            rows[0].policy.currency !== books[0].policy.currency || !payload.productEvidence ||
            Object.keys(payload.productEvidence).sort().join(',') !== 'operationKey,revision')
            throw new Error('Row release requires one exact book, row and approved Product');
        return { row: rows[0].policy, book: books[0].policy, reference: payload.productReference, evidence: payload.productEvidence };
    },
    /** Captures an exact application setup intent through this domain's existing publication owner. */
    prepareSetup: function (request, item) {
        if (item.domain !== 'pricing' || item.input.rootType !== item.rootType || item.input.rootCode !== item.rootCode)
            throw new CLASSES.NodicsError('ERR_PUB_SETUP_INVALID');
        return this.createGoverned(request, item.input);
    },
    /** Qualifies this domain's applied policy receipt without borrowing Product commit flags. */
    isSetupReceiptCommitted: function (publication, request, receipt) {
        return receipt?.applied === true && receipt.tenant === request.tenant && receipt.enterpriseCode === request.enterpriseCode &&
            receipt.fingerprint === publication.sourceVersion && receipt.previousOnlineVersion === publication.activationOperation?.previousOnlineVersion;
    },
    /** Verifies intended immutable policy membership and trusted scope without changing source or target. */
    validateSetup: async function (publication, request, item) {
        const release = await this.getVersion(publication, request), refs = item.input.references;
        if (!Array.isArray(refs) || !refs.length || release.payload.tenant !== request.tenant ||
            release.payload.enterpriseCode !== request.enterpriseCode || release.code !== item.sourceVersion ||
            refs.length !== release.payload.records.length || new Set(refs.map(ref => ref.schema + ':' + ref.code)).size !== refs.length ||
            refs.some(ref => !release.payload.records.some(row => row.schema === ref.schema && row.policy.code === ref.code && row.policy.versionId === ref.versionId)))
            throw new CLASSES.NodicsError('ERR_PUB_SETUP_INVALID');
        if (publication.rootType === 'priceRow' && this.fingerprint(item.input.productReference) !== this.fingerprint(release.payload.productReference))
            throw new CLASSES.NodicsError('ERR_PUB_SETUP_INVALID');
        return release.code;
    },
    /** Creates the nPublish request from retained capture with fixed domain and trusted scope. */
    createGoverned: async function (request, input) {
        request = { ...request, authData: structuredClone(request.authData || {}) };
        input = structuredClone(input);
        const scope = this.scope(request);
        const release = await this.capture(request, input);
        return SERVICE.DefaultPublicationLifecycleService.create({ ...request, publication: {
            code: input.publicationCode, domain: 'pricing', rootType: input.rootType, rootCode: input.rootCode,
            sourceVersion: release.code, tenantCode: scope.tenant, enterpriseCode: scope.enterpriseCode
        } });
    },
    /** Independently authorizes target commands against stored nPublish intent, never caller-supplied approval. */
    authorizeTarget: async function (command, request) {
        command = structuredClone(command);
        this.requireSource();
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'pricing');
        const scope = this.scope(request);
        if (auth.tenant !== scope.tenant) throw new Error('Publication runtime tenant mismatch');
        if (auth.entCode !== scope.enterpriseCode) {
            const workflow = SERVICE.DefaultPublicationApprovalWorkflowService;
            if (!workflow?.requireRuntimeEnterprise) throw new Error('Cross-enterprise publication is not selected');
            workflow.requireRuntimeEnterprise(auth, scope.enterpriseCode);
        }
        if (command.enterpriseCode !== undefined && command.enterpriseCode !== scope.enterpriseCode)
            throw new Error('Publication business enterprise mismatch');
        if (!command || !['prepare', 'activate', 'reconcile'].includes(command.operation) ||
            typeof command.publicationCode !== 'string' || !command.publicationCode ||
            typeof command.operationKey !== 'string' || !command.operationKey) throw new Error('Unsupported source authorization operation');
        this.pointerCode(command, request);
        const checkCaller = this.requirePublicationCaller(request, 'authorize');
        // Only the fixed private intent read uses canonical local system authority.
        const local = { ...request, authData: Object.assign({}, request.authData,
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()) };
        const publication = await SERVICE.DefaultPublicationLifecycleService.getRepository().get(command.publicationCode, local);
        checkCaller();
        if (!publication || publication.domain !== 'pricing' || publication.tenantCode !== scope.tenant ||
            publication.enterpriseCode !== scope.enterpriseCode || publication.sourceVersion !== command.sourceVersion ||
            publication.rootType !== command.rootType || publication.rootCode !== command.rootCode) throw new Error('Stored publication authority mismatch');
        const activation = publication.activationOperation;
        if (command.operation === 'prepare' || command.operation === 'reconcile' ||
            (command.operation === 'activate' && command.targetVersion === publication.sourceVersion)) {
            if (!['ACTIVATING', 'ONLINE', 'FAILED'].includes(publication.state) || !activation ||
                activation.key !== command.operationKey) throw new Error('Stored activation authority missing');
            if (command.operation !== 'reconcile' && command.targetVersion !== publication.sourceVersion) throw new Error('Target source version mismatch');
            if (command.operation === 'activate' && (command.expectedVersion !== activation.previousOnlineVersion ||
                command.expectedRevision !== activation.previousOnlineRevision)) throw new Error('Stored activation precondition mismatch');
        } else if (command.operation === 'activate') {
            if (publication.state !== 'ROLLING_BACK' || command.targetVersion !== publication.previousOnlineVersion ||
                command.expectedVersion !== publication.targetVersion ||
                command.operationKey !== publication.code + ':rollback:' + publication.revision) throw new Error('Stored rollback authority missing');
        } else throw new Error('Unsupported source authorization operation');
        const recovery = this.legacyRecoverySelection(command, request);
        const legacyCasRecovery = recovery && command.operation === 'activate' &&
            publication.state === 'ACTIVATING' && activation.previousOnlineVersion === null &&
            activation.previousOnlineRevision === 0 && command.expectedVersion === null &&
            command.expectedRevision === 0 && command.targetVersion === publication.sourceVersion
            ? recovery : undefined;
        return { authorized: true, fingerprint: this.fingerprint(command), legacyCasRecovery };
    },
    /** Selects a reviewed exact operation, never a wildcard or caller-controlled recovery flag. */
    legacyRecoverySelection: function (command, request) {
        const config = this.publicationSettings().legacyCasRecovery || {};
        if (config.enabled !== true) return undefined;
        if (!Array.isArray(config.operations) || config.operations.length > 100) throw new Error('Invalid legacy CAS recovery selection');
        const identity = { ...this.scope(request), publicationCode: command.publicationCode,
            operationKey: command.operationKey, rootType: command.rootType, rootCode: command.rootCode,
            sourceVersion: command.sourceVersion };
        const matches = config.operations.filter(entry => entry && Object.keys(identity).every(key => entry[key] === identity[key]));
        if (!matches.length) return undefined;
        if (matches.length !== 1 || !['reason', 'approvedBy', 'approvalReference'].every(key =>
            typeof matches[0][key] === 'string' && matches[0][key].trim())) throw new Error('Reviewed legacy CAS recovery evidence required');
        return { ...identity, reason: matches[0].reason, approvedBy: matches[0].approvedBy,
            approvalReference: matches[0].approvalReference };
    },
    /** Attests only the proven pre-fix pointer via generated CAS; never supplies a counter value. */
    recoverLegacyPointer: async function (command, receipt, pointer, release, request) {
        const selection = this.legacyRecoverySelection({ ...command, publicationCode: command.publication.code,
            sourceVersion: command.publication.sourceVersion, rootType: command.publication.rootType,
            rootCode: command.publication.rootCode }, request);
        if (!selection || !request.legacyCasRecoveryAuthorization ||
            this.fingerprint(selection) !== this.fingerprint(request.legacyCasRecoveryAuthorization)) return pointer;
        const pointerCode = this.pointerCode(command.publication, request);
        const receiptCode = this.fingerprint({ ...this.scope(request), pointerCode, operationKey: command.operationKey });
        if (!pointer || !receipt || pointer.revision !== 0 || receipt.revision !== 0 || receipt.applied !== false ||
            receipt.expectedRevision !== 0 || (receipt.previousOnlineVersion ?? null) !== null ||
            command.expectedVersion !== null || command.expectedRevision !== 0 || pointer.legacyCasRecovery ||
            pointer.code !== pointerCode || receipt.pointerCode !== pointerCode || receipt.code !== receiptCode ||
            pointer.receiptCode !== receiptCode || pointer.version !== command.targetVersion ||
            receipt.targetVersion !== command.targetVersion || receipt.sourceVersion !== command.targetVersion ||
            receipt.publicationCode !== command.publication.code || receipt.operationKey !== command.operationKey ||
            receipt.fingerprint !== release.code || release.code !== command.publication.sourceVersion ||
            release.rootType !== command.publication.rootType || release.rootCode !== command.publication.rootCode) {
            throw new Error('Legacy CAS recovery evidence mismatch');
        }
        for (const suffix of ['Pointer', 'Receipt']) {
            const model = (NODICS.getModels('pricing', request.tenant) || {})[UTILS.createModelName('pricingPolicy' + suffix)];
            if (!model || model.versioned === true ||
                SERVICE.DefaultModelConcurrencyService.getField(model.rawSchema) !== 'revision') {
                throw new Error('Legacy CAS recovery requires effective managed models');
            }
        }
        const history = await this.targetServices().receipt.get({ tenant: request.tenant, authData: request.authData,
            query: { ...this.scope(request), pointerCode }, searchOptions: { limit: 2 } });
        if (!history || !Array.isArray(history.result) || history.result.length !== 1 ||
            history.result[0].code !== receiptCode) throw new Error('Legacy CAS recovery has competing history');
        const evidence = { kind: 'PRE_FIX_UNMANAGED_CAS', ...selection,
            recordedAt: new Date().toISOString(),
            pointerCode, receiptCode, priorPointerRevision: 0, priorReceiptRevision: 0,
            priorPointerFingerprint: this.fingerprint(pointer), priorReceiptFingerprint: this.fingerprint(receipt) };
        this.checkTargetContext(request);
        try {
            await this.targetServices().pointer.update({ tenant: request.tenant, authData: request.authData,
                query: { ...this.scope(request), code: pointerCode, revision: 0, version: release.code, receiptCode },
                model: { legacyCasRecovery: evidence } });
        } catch (error) {
            const recovered = await this.readRecord(this.targetServices().pointer, pointerCode, request);
            if (!recovered || recovered.revision !== 1 ||
                this.fingerprint(recovered.legacyCasRecovery) !== this.fingerprint(evidence)) throw error;
        }
        const recovered = await this.readRecord(this.targetServices().pointer, pointerCode, request);
        if (!recovered || recovered.revision !== 1 ||
            this.fingerprint(recovered.legacyCasRecovery) !== this.fingerprint(evidence)) throw new Error('Legacy CAS recovery was not committed');
        return recovered;
    },
    /** Optional explicit Store rollout leaves every unselected Store on its existing consumer path. */
    deliveryEnabled: function (request) {
        const delivery = this.publicationSettings().delivery || {};
        if (delivery.enabled !== true) return false;
        if (delivery.storeCodes === undefined) return true;
        if (!Array.isArray(delivery.storeCodes) || !delivery.storeCodes.length ||
            delivery.storeCodes.some(code => typeof code !== 'string' || !code) ||
            new Set(delivery.storeCodes).size !== delivery.storeCodes.length) throw new Error('Explicit delivery Store selection required');
        return Boolean(request && delivery.storeCodes.includes(request.storeCode));
    },
    /** Resolves an explicit configured delivery set; empty/duplicate roots never fall back to authoring data. */
    deliveryRoots: function (request) {
        const delivery = this.publicationSettings().delivery || {};
        if (delivery.rootCodesByStore !== undefined) {
            const mapping = delivery.rootCodesByStore;
            const maximum = this.publicationSettings().maxDependencies || 1000;
            if (!this.deliveryEnabled(request) || !Array.isArray(delivery.storeCodes) ||
                !mapping || typeof mapping !== 'object' || Array.isArray(mapping) ||
                Object.keys(mapping).length !== delivery.storeCodes.length ||
                delivery.storeCodes.some(store => !Object.hasOwn(mapping, store) ||
                    !Array.isArray(mapping[store]) || !mapping[store].length ||
                    mapping[store].length > maximum ||
                    mapping[store].some(code => typeof code !== 'string' || !code.trim()) ||
                    new Set(mapping[store]).size !== mapping[store].length))
                throw new Error('Activated delivery roots require an exact Store mapping');
            return [...mapping[request.storeCode]];
        }
        if (!this.deliveryEnabled(request) || !Array.isArray(delivery.rootCodes) || !delivery.rootCodes.length ||
            delivery.rootCodes.length > (this.publicationSettings().maxDependencies || 1000) ||
            delivery.rootCodes.some(code => typeof code !== 'string' || !code) ||
            new Set(delivery.rootCodes).size !== delivery.rootCodes.length) throw new Error('Activated delivery roots are required');
        return delivery.rootCodes;
    },
    /** Reads one configured book's bounded exact Store row candidates; this is selection, never Product authority or delivery proof. */
    rowPointers: async function (request, rootCode) {
        this.requireTarget();
        const maximum = this.publicationSettings().maxDependencies || 1000;
        if (!Number.isSafeInteger(maximum) || maximum < 1 ||
            typeof request.storeCode !== 'string' || !request.storeCode || !this.deliveryRoots(request).includes(rootCode))
            throw new Error('Bounded exact Pricing row selection required');
        const service = this.targetServices().pointer;
        const query = { ...this.scope(request), rootType: 'priceRow', priceBookCode: rootCode, storeCode: request.storeCode };
        const response = await service.get({ tenant: request.tenant, authData: this.activatedReadAuth(request, service), query,
            options: { recursive: false, skipItemCache: true }, searchOptions: { limit: maximum + 1, pageSize: maximum + 1 } });
        if (!response || response.error || response.success === false || response.code && !/^SUC_/.test(response.code) ||
            !Array.isArray(response.result) || response.result.length > maximum ||
            [response.count, response.total].some(n => n !== undefined && n !== response.result.length) ||
            new Set(response.result.map(row => row.code)).size !== response.result.length ||
            response.result.some(row => Object.entries(query).some(([key, value]) => row[key] !== value)))
            throw new Error('Row publication pointers are incomplete or foreign');
        return response.result;
    },
    /** Selects only basket Products with a relevant row candidate. Consumers must still use an independent fresh readConfigured delivery check. */
    rowProductCodes: async function (request) {
        if (this.publicationSettings().delivery?.rowReleases !== true) return [];
        const selection = () => this.fingerprint({ tenant: request.tenant, enterpriseCode: request.enterpriseCode,
            entCode: request.entCode, authData: request.authData, storeCode: request.storeCode,
            productCode: request.productCode, productCodes: request.productCodes, settings: this.publicationSettings() });
        const before = selection(), maximum = this.publicationSettings().maxDependencies || 1000;
        const requested = request.productCodes || (request.productCode ? [request.productCode] : []);
        if (!Array.isArray(requested) || requested.length > maximum || requested.some(code => typeof code !== 'string' || !code))
            throw new Error('Bounded Pricing Product selection required');
        const needed = new Set();
        for (const rootCode of this.deliveryRoots(request)) {
            const pointers = await this.rowPointers(request, rootCode);
            if (selection() !== before) throw new Error('Pricing row selection authority changed');
            for (const pointer of pointers) {
                if (!pointer.version && !pointer.receiptCode) continue;
                if (!requested.length) throw new Error('Consumed Product selection required for row delivery');
                if (requested.includes(pointer.productCode)) needed.add(pointer.productCode);
            }
        }
        return [...needed];
    },
    /** Loads each configured root once and rejects ambiguous policy membership across releases. */
    readConfigured: async function (request) {
        const roots = [...this.deliveryRoots(request)], snapshots = new Map();
        const rowDelivery = this.publicationSettings().delivery?.rowReleases === true;
        const selection = () => this.fingerprint({ tenant: request.tenant, enterpriseCode: request.enterpriseCode,
            entCode: request.entCode, authData: request.authData, storeCode: request.storeCode,
            productCode: request.productCode, productCodes: request.productCodes, productReferences: request.productReferences,
            settings: this.publicationSettings() });
        const selected = rowDelivery ? selection() : null;
        const check = () => { if (rowDelivery && selection() !== selected) throw new Error('Pricing row delivery authority or selection changed'); };
        const result = [], identities = new Set();
        for (const rootCode of roots) {
            if (rowDelivery) snapshots.set(rootCode, await this.getTargetStatus({ rootType: 'priceBook', rootCode }, request));
            const records = await this.readActivated({ rootType: 'priceBook', rootCode }, request);
            check();
            for (const item of records) {
                const identity = item.schema + ':' + item.policy.code;
                if (identities.has(identity)) throw new Error('Activated policy membership conflict');
                identities.add(identity);
                result.push(item);
            }
        }
        if (!rowDelivery) return result;
        if (typeof request.storeCode !== 'string' || !request.storeCode) throw new Error('Exact Store required for individual row delivery');
        const maximum = this.publicationSettings().maxDependencies || 1000;
        if (!Number.isSafeInteger(maximum) || maximum < 1) throw new Error('Bounded Pricing row delivery required');
        const proofs = [], pointers = [], replacements = new Map();
        const requested = request.productCodes || (request.productCode ? [request.productCode] : []);
        if (!Array.isArray(requested) || requested.length > maximum || requested.some(code => typeof code !== 'string' || !code))
            throw new Error('Bounded Pricing Product selection required');
        const service = this.targetServices().pointer;
        for (const rootCode of roots) {
            const candidates = await this.rowPointers(request, rootCode);
            check();
            for (const pointer of candidates) {
                if (!pointer.version && !pointer.receiptCode) continue;
                if (!requested.length) throw new Error('Consumed Product selection required for row delivery');
                if (!requested.includes(pointer.productCode)) continue;
                const release = await this.retainedVersion(pointer.version, request), row = this.rowRelease(release.payload);
                if (release.rootType !== 'priceRow' || release.rootCode !== pointer.rootCode || pointer.code !== this.pointerCode(release, request) ||
                    row.book.code !== rootCode || row.row.productCode !== pointer.productCode || row.reference.storeCode !== request.storeCode)
                    throw new Error('Row publication pointer anchor mismatch');
                const book = result.find(item => item.schema === 'priceBook' && item.policy.code === rootCode)?.policy;
                if (this.fingerprint(book) !== this.fingerprint(row.book)) throw new Error('Row publication book version changed');
                const pin = this.consumedProduct(request, row.reference.productCode);
                if (pin.targetVersion !== row.reference.targetVersion) throw new Error('Consumed Product version is incompatible with price row');
                const active = await this.readActivated({ rootType: 'priceRow', rootCode: pointer.rootCode }, request);
                if (this.fingerprint(active) !== this.fingerprint(release.payload.records)) throw new Error('Row publication changed during read');
                this.assertProductStatus(row.reference, row.evidence, await this.productStatus(row.reference, row.evidence, request), request);
                check();
                if (replacements.has(row.row.code)) throw new Error('Row publication membership conflict');
                replacements.set(row.row.code, { schema: 'priceRow', policy: { ...row.row, productReference: pin } });
                proofs.push(row); pointers.push(pointer);
            }
        }
        if (pointers.length) {
            for (const [rootCode, before] of snapshots) {
                const after = await this.getTargetStatus({ rootType: 'priceBook', rootCode }, request);
                if (this.fingerprint(before) !== this.fingerprint(after)) throw new Error('Price book activation changed during row read');
            }
            for (const pointer of pointers) {
                const after = await this.readRecord(service, pointer.code, request);
                if (this.fingerprint(after) !== this.fingerprint(pointer)) throw new Error('Price row activation changed during read');
            }
            for (const row of proofs)
                this.assertProductStatus(row.reference, row.evidence, await this.productStatus(row.reference, row.evidence, request), request);
        }
        for (const [code, item] of replacements) {
            const index = result.findIndex(row => row.schema === 'priceRow' && row.policy.code === code);
            if (index < 0) result.push(item); else result[index] = item;
        }
        check();
        return result;
    },
    /** Requires the exact Product version already selected by the consuming owner, never inferred from a row or latest Product. */
    consumedProduct: function (request, productCode) {
        const pins = request.productReferences, maximum = this.publicationSettings().maxDependencies || 1000;
        if (!Array.isArray(pins) || !pins.length || pins.length > maximum ||
            new Set(pins.map(pin => pin?.productCode)).size !== pins.length || pins.some(pin => !pin ||
                Object.keys(pin).sort().join(',') !== 'productCode,storeCode,targetVersion' ||
                typeof pin.productCode !== 'string' || !pin.productCode || pin.storeCode !== request.storeCode ||
                !/^[a-f0-9]{64}$/.test(pin.targetVersion || '')))
            throw new Error('Consumed immutable Product references required');
        const pin = pins.find(pin => pin.productCode === productCode);
        if (!pin) throw new Error('Consumed Product reference missing');
        return structuredClone(pin);
    },
    /** Selects prices from one activated book snapshot; never mixes pointer generations. */
    selectActivated: async function (request, rootCode) {
        if (this.publicationSettings().delivery?.rowReleases === true && !this.deliveryRoots(request).includes(rootCode))
            throw new Error('Price book is outside the selected delivery roots');
        const records = this.publicationSettings().delivery?.rowReleases === true
            ? (await this.readConfigured(request)).filter(item => item.schema === 'priceBook' ? item.policy.code === rootCode : item.policy.priceBookCode === rootCode)
            : await this.readActivated({ rootType: 'priceBook', rootCode }, request);
        return SERVICE.DefaultPriceSelectionService.select(request,
            records.filter(item => item.schema === 'priceBook').map(item => item.policy),
            records.filter(item => item.schema === 'priceRow').map(item => item.policy),
            SERVICE.DefaultExactAmountService);
    },
targetReceiptContract: 'v1',
    /** Returns layered domain settings; no default enables registration or installed versioning. */
    publicationSettings: function () { return (CONFIG.get('pricing') || {}).publication || {}; },
    /** Checks deployment role and explicit installed-source qualification before authoring capture. */
    requireSource: function () {
        const settings = this.publicationSettings();
        if (settings.runtimeRole !== 'STAGED' || settings.sourceVersioningQualified !== true) throw new Error('Pricing immutable source is not qualified');
    },
    /** Guards ordinary Staged authoring against an unqualified effective model before persistence. */
    validateSourceAuthoring: function (request) {
        if (this.publicationSettings().runtimeRole !== 'STAGED') return true;
        const schema = request.schemaModel && request.schemaModel.schemaName;
        if (!Object.hasOwn(this.policyFields(), schema) || !request.tenant) throw new Error('Policy authoring schema and tenant are required');
        const model = (NODICS.getModels('pricing', request.tenant) || {})[UTILS.createModelName(schema)];
        if (!model || model.versioned !== true || !model.rawSchema || model.rawSchema.versionedReadMode !== 'CURRENT') {
            throw new Error('Pricing authoring requires qualified CURRENT versioned storage: ' + schema);
        }
        return true;
    },
    /** Rejects target operations outside an explicitly selected Online runtime. */
    requireTarget: function () {
        if (this.publicationSettings().runtimeRole !== 'ONLINE') throw new Error('Pricing publication target requires Online role');
    },
    /** Computes stable content identity, including nested policy objects, independent of key order. */
    fingerprint: function (value) {
        const canonical = item => item instanceof Date ? item.toISOString() : Array.isArray(item)
            ? item.map(canonical) : item && typeof item === 'object'
                ? Object.fromEntries(Object.keys(item).sort().filter(key => item[key] !== undefined).map(key => [key, canonical(item[key])])) : item;
        return require('node:crypto').createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
    },
    /** Requires trusted tenant/enterprise context; neither default tenant nor request fallback is invented. */
    scope: function (request) {
        const enterpriseCode = request && (request.enterpriseCode || request.entCode ||
            request.authData && (request.authData.enterpriseCode || request.authData.entCode));
        if (!request || typeof request.tenant !== 'string' || !request.tenant || typeof enterpriseCode !== 'string' || !enterpriseCode) throw new Error('Publication scope is required');
        return { tenant: request.tenant, enterpriseCode };
    },
    /** Admits the real Staged publisher for this owner's fixed scoped persistence, never generic schema CRUD. */
    sourcePersistenceAuth: function (request) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        if (auth.principalType !== 'human' || !security?.getGrantedPermissions || !security.isPermissionGranted ||
            !['publish.lifecycle.create', 'commerce.product.publish', CONFIG.get('publish')?.setup?.permissions?.pricing]
                .every(permission => typeof permission === 'string' && permission &&
                    security.isPermissionGranted(permission, security.getGrantedPermissions(request), {}))) return request.authData;
        const enterpriseCode = auth.enterpriseCode || auth.entCode;
        if (auth.tokenType !== 'access' || auth.isSystem || !(auth.principalId || auth.loginId || auth.code) ||
            typeof auth.tenant !== 'string' || !auth.tenant || request.tenant !== auth.tenant ||
            typeof enterpriseCode !== 'string' || !enterpriseCode ||
            [auth.enterpriseCode, auth.entCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterpriseCode))
            throw new Error('Authenticated Pricing publisher scope is required');
        this.requireSource();
        const owner = SERVICE.DefaultIdentityGovernanceService;
        if (!owner?.getSystemAuthData) throw new Error('Pricing publication persistence owner is unavailable');
        return owner.getSystemAuthData();
    },
    /** Admits Online human publication reads only for this owner's fixed retained services; never grants source capture or writes. */
    activatedReadAuth: function (request, service) {
        this.requireTarget();
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!['human', 'customer'].includes(auth.principalType)) return request.authData;
        const enterpriseCode = auth.enterpriseCode || auth.entCode;
        if (auth.tokenType !== 'access' || auth.isSystem || !(auth.principalId || auth.loginId || auth.code) ||
            typeof auth.tenant !== 'string' || !auth.tenant || request.tenant !== auth.tenant ||
            typeof enterpriseCode !== 'string' || !enterpriseCode ||
            [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
            [auth.enterpriseCode, auth.entCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterpriseCode))
            throw new Error('Authenticated Pricing activated reader scope is required');
        if (auth.principalType !== 'human' || !security?.getGrantedPermissions || !security.isPermissionGranted ||
            !['commerce.product.publish', CONFIG.get('publish')?.setup?.permissions?.pricing]
                .every(permission => typeof permission === 'string' && permission &&
                    security.isPermissionGranted(permission, security.getGrantedPermissions(request), {})) ||
            !Object.values(this.targetServices()).includes(service)) return request.authData;
        const owner = SERVICE.DefaultIdentityGovernanceService;
        if (!owner?.getSystemAuthData) throw new Error('Pricing publication persistence owner is unavailable');
        return owner.getSystemAuthData();
    },
    /** Reads at most one scoped record through generated services, rejecting malformed or ambiguous results. */
    readRecord: async function (service, code, request) {
        this.checkTargetContext(request);
        const authData = this.publicationSettings().runtimeRole === 'ONLINE'
            ? this.activatedReadAuth(request, service) : this.sourcePersistenceAuth(request);
        const response = await service.get({ tenant: request.tenant, authData,
            query: { ...this.scope(request), code }, searchOptions: { limit: 2, pageSize: 2 },
            options: { recursive: false, skipItemCache: true } });
        this.checkTargetContext(request);
        if (!response || !Array.isArray(response.result) || response.result.length > 1) throw new Error('Invalid publication persistence response');
        const item = response.result[0];
        if (item && (item.code !== code || item.tenant !== request.tenant || item.enterpriseCode !== this.scope(request).enterpriseCode)) throw new Error('Publication persistence scope mismatch');
        return item;
    },
    /** Resolves domain-owned generated retention, pointer and receipt services. */
    targetServices: function () {
        const result = { release: SERVICE.DefaultPricingPolicyReleaseService, pointer: SERVICE.DefaultPricingPolicyPointerService, receipt: SERVICE.DefaultPricingPolicyReceiptService };
        if (Object.values(result).some(service => !service || typeof service.get !== 'function' || typeof service.save !== 'function' || typeof service.update !== 'function')) throw new Error('Policy persistence unavailable');
        return result;
    },
    /** Insert-only managed save; only an identical durable record can resolve a duplicate/lost response. */
    retain: async function (service, model, request) {
        const scope = this.scope(request);
        if (model.tenant !== scope.tenant || model.enterpriseCode !== scope.enterpriseCode) throw new Error('Retained publication scope mismatch');
        const matches = item => item && Object.keys(model).filter(key => key !== 'revision').every(key => this.fingerprint(item[key]) === this.fingerprint(model[key]));
        let existing = await this.readRecord(service, model.code, request);
        if (existing) { if (!matches(existing)) throw new Error('Retained publication identity conflict'); return existing; }
        this.checkTargetContext(request);
        try {
            await service.save({ tenant: request.tenant, authData: this.sourcePersistenceAuth(request), model: { ...model, revision: 0 } });
        } catch (error) {
            existing = await this.readRecord(service, model.code, request);
            if (!matches(existing)) throw error;
            return existing;
        }
        existing = await this.readRecord(service, model.code, request);
        if (!matches(existing)) throw new Error('Retained publication write was not verified');
        return existing;
    },
    /** Captures explicit exact source references into immutable domain retention before publication creation.
     * @param {Object} request Trusted scope/auth context.
     * @param {Object} input Root identity and bounded references [{schema,code,versionId}].
     * @returns {Promise<Object>} Retained release; use its code as nPublish sourceVersion.
     */
    capture: async function (request, input) {
        request = { ...request, authData: structuredClone(request.authData || {}) };
        input = structuredClone(input);
        this.requireSource();
        const services = {"priceBook":"DefaultPriceBookService","priceRow":"DefaultPriceRowService"};
        const maximum = this.publicationSettings().maxDependencies || 1000;
        if (!Number.isSafeInteger(maximum) || maximum < 1 || !input || !Object.hasOwn(services, input.rootType) || typeof input.rootCode !== 'string' || !input.rootCode ||
            !Array.isArray(input.references) || !input.references.length || input.references.length > maximum) throw new Error('Exact policy references required');
        const seen = new Set(), records = [];
        for (const ref of input.references) {
            if (!ref || !Object.hasOwn(services, ref.schema) || typeof ref.code !== 'string' || !ref.code ||
                !Number.isSafeInteger(ref.versionId) || ref.versionId < 0 || seen.has(ref.schema + ':' + ref.code)) throw new Error('Invalid or duplicate policy reference');
            seen.add(ref.schema + ':' + ref.code);
            const model = (NODICS.getModels('pricing', request.tenant) || {})[UTILS.createModelName(ref.schema)];
            if (!model || model.versioned !== true || !model.rawSchema || model.rawSchema.versionedReadMode !== 'CURRENT') {
                throw new Error('Pricing publication requires qualified CURRENT versioned storage: ' + ref.schema);
            }
            const response = await SERVICE[services[ref.schema]].get({ tenant: request.tenant, authData: this.sourcePersistenceAuth(request),
                query: { ...this.scope(request), code: ref.code, versionId: ref.versionId }, searchOptions: { limit: 2 } });
            if (!response || !Array.isArray(response.result) || response.result.length !== 1 ||
                response.result[0].code !== ref.code || response.result[0].versionId !== ref.versionId) throw new Error('Exact policy version unavailable');
            records.push({ schema: ref.schema, policy: this.capturePolicy(ref.schema, response.result[0], request) });
        }
        if (!seen.has(input.rootType + ':' + input.rootCode)) throw new Error('Policy root is missing');
        if (records.filter(item => item.schema === 'priceBook').length !== 1 || !records.some(item => item.schema === 'priceRow'))
            throw new Error('Pricing release must bind one exact book and its selected rows');
        if (input.rootType === 'priceBook' && (input.productReference !== undefined ||
            records.some(item => item.schema === 'priceRow' && item.policy.priceBookCode !== input.rootCode)))
            throw new Error('Pricing release must bind one exact book and its selected rows');
        records.sort((a,b) => (a.schema + ':' + a.policy.code).localeCompare(b.schema + ':' + b.policy.code));
        const payload = { ...this.scope(request), rootType: input.rootType, rootCode: input.rootCode, records };
        if (input.rootType === 'priceRow') {
            payload.productReference = this.productReference(input.productReference);
            payload.productEvidence = await this.approvedProduct(payload.productReference, request);
            this.rowRelease(payload);
        }
        const code = this.fingerprint(payload);
        return this.retain(this.targetServices().release, { ...this.scope(request), code, rootType: input.rootType,
            rootCode: input.rootCode, payload, fingerprint: code }, request);
    },
    /** Loads retained capture, never mutable source. Also used by target preparation and activated reads. */
    retainedVersion: async function (code, request) {
        const release = await this.readRecord(this.targetServices().release, code, request);
        if (!release || release.fingerprint !== code || this.fingerprint(release.payload) !== code) throw new Error('Retained policy unavailable or corrupt');
        return release;
    },
    /** Implements nPublish exact source lookup. */
    getVersion: async function (publication, request) {
        this.requireSource();
        const release = await this.retainedVersion(publication.sourceVersion, request);
        if (publication.domain !== 'pricing' || release.rootType !== publication.rootType || release.rootCode !== publication.rootCode) throw new Error('Publication root mismatch');
        return release;
    },
    /** Supplies exact dependency identities without re-reading current authoring rows. */
    resolveDependencies: function (publication, release) {
        const records = release.payload.records.map(item => ({ schema: item.schema, code: item.policy.code, version: String(item.policy.versionId) }));
        if (release.rootType === 'priceRow') {
            const { reference } = this.rowRelease(release.payload);
            records.push({ domain: 'product', schema: 'product', code: reference.productCode, version: reference.sourceVersion,
                publicationCode: reference.publicationCode, storeCode: reference.storeCode, targetVersion: reference.targetVersion });
        }
        return records;
    },
    /** Validates retained content for the existing nPublish adapter hook. */
    validate: async function (publication, release, request) {
        const retained = await this.getVersion(publication, request);
        if (retained.rootType === 'priceRow') {
            const row = this.rowRelease(retained.payload), evidence = await this.approvedProduct(row.reference, request);
            if (this.fingerprint(evidence) !== this.fingerprint(row.evidence)) throw new Error('Approved Product reference drift');
        }
        return { valid: retained.fingerprint === release.fingerprint };
    },
    /** Resolves the configured owner transport. An absent transport never falls back to local source. */
    transport: function () {
        const name = this.publicationSettings().targetTransportProvider;
        const transport = name && SERVICE[name];
        if (!transport) throw new Error('Pricing target transport unavailable');
        return transport;
    },
    /** Reads the target's authoritative pointer for nPublish's pre-activation evidence. */
    getOnlineVersion: function (publication, request) { return this.transport().getTargetStatus(publication, request); },
    /** Prepares immutable content without changing the target pointer. */
    prepareTarget: async function (release, request) {
        this.requireTarget();
        if (!release || !release.payload || !Array.isArray(release.payload.records) || !release.payload.records.length ||
            release.payload.records.length > (this.publicationSettings().maxDependencies || 1000) ||
            release.payload.rootType !== release.rootType || release.payload.rootCode !== release.rootCode ||
            release.payload.tenant !== request.tenant || release.payload.enterpriseCode !== this.scope(request).enterpriseCode ||
            this.fingerprint(release.payload) !== release.code || release.fingerprint !== release.code ||
            release.tenant !== request.tenant || release.enterpriseCode !== this.scope(request).enterpriseCode) throw new Error('Target policy scope or fingerprint mismatch');
        for (const item of release.payload.records) {
            if (this.fingerprint(this.capturePolicy(item.schema, item.policy, request)) !== this.fingerprint(item.policy)) throw new Error('Target policy contains non-policy fields');
        }
        if (release.rootType === 'priceRow') {
            const row = this.rowRelease(release.payload);
            this.assertProductStatus(row.reference, row.evidence, await this.productStatus(row.reference, row.evidence, request), request);
        } else if (release.payload.productReference !== undefined || release.payload.productEvidence !== undefined)
            throw new Error('Book release cannot carry a row Product reference');
        return this.retain(this.targetServices().release, { ...this.scope(request), code: release.code,
            rootType: release.rootType, rootCode: release.rootCode, payload: release.payload, fingerprint: release.fingerprint }, request);
    },
    /** Derives the domain root pointer key from explicit scope and root identity. */
    pointerCode: function (publication, request) {
        if (!publication || (publication.domain && publication.domain !== 'pricing') ||
            !Array.isArray(this.policyFields()[publication.rootType]) || typeof publication.rootCode !== 'string' || !publication.rootCode) throw new Error('Target root required');
        return this.fingerprint({ ...this.scope(request), rootType: publication.rootType, rootCode: publication.rootCode });
    },
    /** Reads Online version and optimistic pointer token; absent pointer means no published content. */
    getTargetStatus: async function (publication, request) {
        this.requireTarget();
        const pointer = await this.readRecord(this.targetServices().pointer, this.pointerCode(publication, request), request);
        return pointer ? { version: pointer.version ?? null, revision: pointer.revision } : { version: null, revision: 0 };
    },
    /** Pure exact target observation; never settles or repairs an incomplete activation receipt. */
    observeSetupTarget: async function (publication, request) {
        this.requireTarget();
        const services = this.targetServices();
        const pointer = await this.readRecord(services.pointer, this.pointerCode(publication, request), request);
        if (!pointer || pointer.active === false || !pointer.version) return { version: null, revision: pointer?.revision, receipt: null };
        const receipt = await this.readRecord(services.receipt, pointer.receiptCode, request);
        const release = await this.retainedVersion(pointer.version, request);
        if (!receipt || receipt.applied !== true || receipt.pointerCode !== pointer.code || receipt.targetVersion !== pointer.version ||
            receipt.expectedRevision + 1 !== pointer.revision || receipt.fingerprint !== release.fingerprint ||
            release.rootType !== publication.rootType || release.rootCode !== publication.rootCode)
            throw new CLASSES.NodicsError('ERR_PUB_SETUP_OBSERVATION');
        return { version: pointer.version, revision: pointer.revision, receipt };
    },
    /** Finalizes only a receipt proven by the durable pointer CAS, including a lost-update response. */
    settleReceipt: async function (receipt, pointer, request) {
        this.checkTargetContext(request);
        if (!pointer || pointer.code !== receipt.pointerCode || pointer.receiptCode !== receipt.code ||
            pointer.version !== receipt.targetVersion || pointer.revision !== receipt.expectedRevision + 1) {
            throw new Error(receipt.applied ? 'Target receipt superseded conflict' : 'Target receipt is not committed');
        }
        if (receipt.applied) return { ...receipt, previousOnlineVersion: receipt.previousOnlineVersion ?? null };
        const service = this.targetServices().receipt;
        this.checkTargetContext(request);
        try {
            await service.update({ tenant: request.tenant, authData: request.authData,
                query: { ...this.scope(request), code: receipt.code, revision: receipt.revision }, model: { applied: true } });
        } catch (error) {
            const recovered = await this.readRecord(service, receipt.code, request);
            if (!recovered || recovered.applied !== true) throw error;
        }
        const applied = await this.readRecord(service, receipt.code, request);
        if (!applied || applied.applied !== true) throw new Error('Receipt completion not acknowledged');
        return { ...applied, previousOnlineVersion: applied.previousOnlineVersion ?? null };
    },
    /** Applies one durable target operation using existing generated managed CAS; owns no approval state.
     * @param {Object} command Publication scope, operation key, exact target and expected Online version.
     * @param {Object} request Trusted target context.
     * @returns {Promise<Object>} nPublish-compatible receipt and retained target identity.
     */
    switchTarget: async function (command, request) {
        this.requireTarget();
        const { publication, operationKey, targetVersion, expectedVersion, expectedRevision } = command;
        if (typeof operationKey !== 'string' || !operationKey || typeof publication.code !== 'string' ||
            !(expectedVersion === null || typeof expectedVersion === 'string')) throw new Error('Target operation binding required');
        const services = this.targetServices(), pointerCode = this.pointerCode(publication, request);
        const release = await this.retainedVersion(targetVersion, request);
        if (release.rootCode !== publication.rootCode || release.rootType !== publication.rootType) throw new Error('Target release root mismatch');
        const row = release.rootType === 'priceRow' ? this.rowRelease(release.payload) : undefined;
        if (row) this.assertProductStatus(row.reference, row.evidence, await this.productStatus(row.reference, row.evidence, request), request);
        const receiptCode = this.fingerprint({ ...this.scope(request), pointerCode, operationKey });
        let pointer = await this.readRecord(services.pointer, pointerCode, request);
        const anchor = row ? { priceBookCode: row.book.code, productCode: row.row.productCode, storeCode: row.reference.storeCode } : {};
        if (pointer && Object.entries(anchor).some(([key, value]) => pointer[key] !== value)) throw new Error('Row pointer anchor conflict');
        let receipt = await this.readRecord(services.receipt, receiptCode, request);
        if (receipt && pointer && pointer.revision === 0) {
            pointer = await this.recoverLegacyPointer(command, receipt, pointer, release, request);
        }
        if (receipt) {
            if (receipt.targetVersion !== targetVersion || receipt.publicationCode !== publication.code ||
                receipt.sourceVersion !== publication.sourceVersion || (receipt.previousOnlineVersion ?? null) !== expectedVersion) throw new Error('Target operation replay conflict');
            if (receipt.applied) return { version: targetVersion, receipt: await this.settleReceipt(receipt, pointer, request) };
        }
        if (!pointer) pointer = await this.retain(services.pointer, { ...this.scope(request), code: pointerCode,
            rootType: publication.rootType, rootCode: publication.rootCode, ...anchor }, request);
        if (pointer.receiptCode) {
            const previousReceipt = await this.readRecord(services.receipt, pointer.receiptCode, request);
            if (!previousReceipt) throw new Error('Pointer receipt is missing');
            await this.settleReceipt(previousReceipt, pointer, request);
        }
        if (receipt && pointer.receiptCode === receiptCode) return { version: targetVersion, receipt: await this.settleReceipt(receipt, pointer, request) };
        if ((pointer.version ?? null) !== expectedVersion || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
            !(pointer.revision === expectedRevision || (expectedRevision === 0 && pointer.revision === 1 && !pointer.receiptCode && (pointer.version ?? null) === null))) throw new Error('Online policy revision conflict');
        if (!receipt) receipt = await this.retain(services.receipt, { ...this.scope(request), code: receiptCode,
            pointerCode, operationKey, publicationCode: publication.code, sourceVersion: publication.sourceVersion,
            targetVersion, ...(expectedVersion === null ? {} : { previousOnlineVersion: expectedVersion }), expectedRevision: pointer.revision,
            fingerprint: release.fingerprint, applied: false }, request);
        if (receipt.expectedRevision !== pointer.revision) throw new Error('Target pointer CAS conflict');
        this.checkTargetContext(request);
        try {
            await services.pointer.update({ tenant: request.tenant, authData: request.authData,
                query: { ...this.scope(request), code: pointerCode, revision: receipt.expectedRevision },
                model: { version: targetVersion, receiptCode } });
        } catch (error) {
            pointer = await this.readRecord(services.pointer, pointerCode, request);
            if (!pointer || pointer.receiptCode !== receiptCode) throw error;
        }
        pointer = await this.readRecord(services.pointer, pointerCode, request);
        return { version: targetVersion, receipt: await this.settleReceipt(receipt, pointer, request) };
    },
    /** Performs approved nPublish activation; target preparation alone is not visible. */
    activate: async function (publication, request) {
        this.requireSource();
        if (publication.state !== 'ACTIVATING' || !publication.activationOperation) throw new Error('nPublish activation operation required');
        const release = await this.getVersion(publication, request);
        if (release.rootType === 'priceRow') {
            const row = this.rowRelease(release.payload);
            this.assertProductStatus(row.reference, row.evidence, await this.productStatus(row.reference, row.evidence, request), request);
        }
        await this.transport().prepareTarget(release, request, publication);
        return this.transport().switchTarget({ publication, operationKey: publication.activationOperation.key,
            targetVersion: release.code, expectedVersion: publication.activationOperation.previousOnlineVersion,
            expectedRevision: publication.activationOperation.previousOnlineRevision }, request);
    },
    /** Restores retained policy through target CAS without touching operational state. */
    rollback: async function (publication, targetVersion, request) {
        this.requireSource();
        if (publication.state !== 'ROLLING_BACK' || !targetVersion || !publication.targetVersion) throw new Error('Retained rollback target required');
        const status = await this.transport().getTargetStatus(publication, request);
        return this.transport().switchTarget({ publication, operationKey: publication.code + ':rollback:' + publication.revision,
            targetVersion, expectedVersion: publication.targetVersion, expectedRevision: status.revision }, request);
    },
    /** Reconciles a known operation only; never repairs pointer identity or resolves latest source. */
    reconcileTarget: async function (publication, operationKey, request) {
        this.requireTarget();
        const services = this.targetServices(), pointerCode = this.pointerCode(publication, request);
        const code = this.fingerprint({ ...this.scope(request), pointerCode, operationKey });
        const receipt = await this.readRecord(services.receipt, code, request);
        if (!receipt || receipt.publicationCode !== publication.code || receipt.sourceVersion !== publication.sourceVersion) throw new Error('Target receipt unavailable');
        const pointer = await this.readRecord(services.pointer, pointerCode, request);
        return { version: receipt.targetVersion, receipt: await this.settleReceipt(receipt, pointer, request) };
    },
    /** Implements the existing provider reconciliation hook for the pinned activation operation. */
    reconcile: function (publication, request) {
        this.requireSource();
        if (!publication.activationOperation) throw new Error('Activation operation required');
        return this.transport().reconcileTarget(publication, publication.activationOperation.key, request);
    },
    /** Resolves one activated policy release, rejecting absence rather than querying source data. */
    readActivated: async function (publication, request) {
        this.requireTarget();
        request = { ...request, authData: structuredClone(request.authData || {}) };
        publication = { ...publication };
        const services = this.targetServices();
        const pointer = await this.readRecord(services.pointer, this.pointerCode(publication, request), request);
        if (!pointer || !pointer.version) throw new Error('No activated policy');
        const receipt = await this.readRecord(services.receipt, pointer.receiptCode, request);
        if (!receipt || receipt.applied !== true || receipt.pointerCode !== pointer.code || receipt.targetVersion !== pointer.version ||
            receipt.expectedRevision + 1 !== pointer.revision) throw new Error('Activated policy receipt mismatch');
        const release = await this.retainedVersion(pointer.version, request);
        if (receipt.fingerprint !== release.fingerprint) throw new Error('Activated policy fingerprint mismatch');
        if (release.rootType !== publication.rootType || release.rootCode !== publication.rootCode) throw new Error('Activated root mismatch');
        return structuredClone(release.payload.records);
    },
    /**
     * Returns the domain's release field allowlist; technical schema identities are not runtime policy.
     * @returns {Object<string, string[]>} Policy-only fields keyed by supported source schema.
     */
    policyFields: function () {
        return {
        "priceBook": [
                "code",
                "tenant",
                "enterpriseCode",
                "versionId",
                "revision",
                "active",
                "currency",
                "status",
                "validFrom",
                "validTo"
        ],
        "priceRow": [
                "code",
                "tenant",
                "enterpriseCode",
                "versionId",
                "revision",
                "active",
                "priceBookCode",
                "productCode",
                "unitAmount",
                "currency",
                "minQuantity",
                "validFrom",
                "validTo"
        ]
};
    },
    /**
     * Copies a supplied exact-version record into release policy without changing the source.
     * The caller must resolve retained immutable storage; a versionId alone does not prove that.
     * @param {string} schema Supported domain source schema, never an operational schema.
     * @param {Object} record Record returned by the owning exact-version reader.
     * @param {Object} request Trusted tenant and enterprise context.
     * @returns {Object} Detached policy projection, retaining exact version identity.
     * @throws {Error} Missing version, unsupported schema or scope mismatch, before any side effect.
     */
    capturePolicy: function (schema, record, request) {
        const fields = this.policyFields()[schema];
        const enterprise = request && (request.enterpriseCode || request.entCode ||
            request.authData && (request.authData.enterpriseCode || request.authData.entCode));
        if (!Array.isArray(fields) || !record || !request || !request.tenant || !enterprise ||
            record.tenant !== request.tenant || typeof record.code !== 'string' || !record.code ||
            !Number.isSafeInteger(record.versionId) || record.versionId < 0) {
            throw new Error('Pricing policy requires an exact version and trusted scope');
        }
        if (record.enterpriseCode !== enterprise) {
            throw new Error('Pricing policy escaped its enterprise boundary');
        }
        const policy = {};
        for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(record, field)) policy[field] = structuredClone(record[field]);
        }
        return policy;
    },
    /**
     * Rejects the old direct-to-Online restore path before accessing any generated service.
     * @param {Object} request Authenticated request; caller flags cannot qualify installed migration.
     * @param {Object} input Legacy transport payload; never restored or published here.
     * @returns {Promise<never>} Rejected until owner integration replaces this transport via nPublish.
     */
    restoreOperational: async function (request, input) {
        throw new CLASSES.NodicsError('ERR_PUB_00006',
            'Pricing publication requires qualified immutable migration and nPublish target activation; mutable restoration is disabled');
    }
};
