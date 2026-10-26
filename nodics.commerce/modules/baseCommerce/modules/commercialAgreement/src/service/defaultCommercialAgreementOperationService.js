/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const { isDeepStrictEqual } = require('node:util');
const writes = new WeakSet();
/** @module commercialAgreement/service/operation @description Persists authorized commercial assignments and immutable amendments through generated services. @layer service @owner commercialAgreement @override Override individual validation/reference members while preserving append-only history and generated CAS. */
module.exports = {
    /** Raises a stable owner error without disclosing commercial records. */
    fail: function (code) { throw new CLASSES.NodicsError('ERR_AGREEMENT_' + code); },
    /**
     * Reads canonical keys from the effective layered enum, never raw source definitions.
     * @param {string} name Fixed owner enum name selected by this service.
     * @returns {Array<string>} Detached vocabulary used by validation and workspace choices.
     * @throws {CLASSES.NodicsError} When the runtime enum is absent or malformed.
     * @override Preserve effective ENUMS resolution and exact keys; do not fall back to source defaults.
     */
    vocabulary: function (name) {
        const entries = typeof ENUMS === 'undefined' ? undefined : ENUMS[name]?.enums;
        if (!Array.isArray(entries) || !entries.length ||
            entries.some(entry => typeof entry?.key !== 'string' || !entry.key) ||
            new Set(entries.map(entry => entry.key)).size !== entries.length) this.fail('CONFIG');
        return entries.map(entry => entry.key);
    },
    /** Blocks generic CRUD/import writes from replacing append-only agreement history. */
    protect: function (request) { if (!writes.has(request)) this.fail('SCOPE'); return true; },
    /** Agreement evidence is retained; deletion is not a commercial lifecycle command. */
    protectRemove: function () { this.fail('SCOPE'); },
    /** Validates all effective mechanics; no inline replacement defaults. */
    policy: function () {
        const policy = CONFIG.get('commercialAgreement');
        if (!['LOCAL', 'REMOTE'].includes(policy?.catalogueReferences?.mode) ||
            !policy?.validation || typeof policy.validation.identifierPattern !== 'string' ||
            !Number.isSafeInteger(policy.validation.maximumConfiguredBound) || policy.validation.maximumConfiguredBound < 1 ||
            !Number.isSafeInteger(policy.validation.maximumTextLength) || policy.validation.maximumTextLength < 1 ||
            policy.validation.maximumTextLength > policy.validation.maximumConfiguredBound ||
            ['maximumVersions', 'maximumBenefits', 'maximumSelectedProducts', 'maximumRecordBytes', 'maximumPageSize'].some(key =>
                !Number.isSafeInteger(policy[key]) || policy[key] < 1 || policy[key] > policy.validation.maximumConfiguredBound) ||
            ['readPermission', 'writePermission'].some(key => typeof policy[key] !== 'string' || !policy[key]) ||
            !Number.isSafeInteger(policy.workspace?.pageSize) || policy.workspace.pageSize < 1 ||
            policy.workspace.pageSize > policy.maximumPageSize) this.fail('CONFIG');
        try { new RegExp(policy.validation.identifierPattern); } catch { this.fail('CONFIG'); }
        return policy;
    },
    /** Rejects query operators and malformed record identities. */
    identifier: function (value) {
        if (typeof value !== 'string' || !new RegExp(this.policy().validation.identifierPattern).test(value)) this.fail('INPUT');
        return value;
    },
    /** Allows only explicit command fields. */
    object: function (value, fields) {
        if (!value || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).some(key => !fields.includes(key))) this.fail('INPUT');
        return value;
    },
    /** Requires meaningful bounded descriptive terms rather than silently selecting defaults. */
    text: function (value) {
        if (typeof value !== 'string' || !value.trim() || value.length > this.policy().validation.maximumTextLength) this.fail('INPUT');
        return value;
    },
    /** Requires explicit timezone-bearing dates and normalizes their representation. */
    date: function (value) {
        if (typeof value !== 'string' || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) this.fail('INPUT');
        return new Date(value).toISOString();
    },
    /** Normalizes a descriptive reference; its existence is resolved separately by its owner. */
    reference: function (ref, moduleName, schema) {
        this.object(ref, ['module', 'schema', 'code', 'versionId', 'catalogVersion']);
        if (ref.module !== moduleName || ref.schema !== schema) this.fail('INPUT');
        this.identifier(ref.code);
        if (ref.versionId !== undefined && (!Number.isSafeInteger(ref.versionId) || ref.versionId < 0)) this.fail('INPUT');
        if (ref.catalogVersion !== undefined) this.identifier(ref.catalogVersion);
        return structuredClone(ref);
    },
    /** Admits scoped employees; only an existing admin grant may administer another Enterprise. */
    scope: function (request, enterpriseCode, write) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        const groups = security?.getEffectiveUserGroupCodes?.(auth.userGroups || []);
        const permission = this.policy()[write ? 'writePermission' : 'readPermission'];
        if (!request.tenant || request.tenant !== auth.tenant || auth.principalType !== 'human' || auth.tokenType !== 'access' ||
            auth.isSystem === true || !Array.isArray(groups) || !groups.includes('employeeUserGroup') ||
            !security?.isPermissionGranted?.(permission, security.getGrantedPermissions(request), {})) this.fail('SCOPE');
        this.identifier(request.tenant); this.identifier(enterpriseCode);
        const own = auth.enterpriseCode || auth.entCode;
        if (typeof own !== 'string' || !new RegExp(this.policy().validation.identifierPattern).test(own) ||
            auth.tenantCode !== undefined && auth.tenantCode !== request.tenant ||
            auth.enterpriseCode !== undefined && auth.enterpriseCode !== own ||
            auth.entCode !== undefined && auth.entCode !== own) this.fail('SCOPE');
        if (own !== enterpriseCode && !groups.includes('adminGroup')) this.fail('SCOPE');
        const actor = auth.principalId || auth.loginId;
        this.identifier(actor);
        return { tenant: request.tenant, enterpriseCode, actor };
    },
    /** Requires generated atomic concurrency and a unique agreement identity before persistence. */
    storage: function (tenant) {
        const model = NODICS.getModels('commercialAgreement', tenant)?.CommercialAgreementModel;
        if (!model || model.primaryKey !== 'code' || typeof model.compareAndSetItem !== 'function' ||
            model.rawSchema?.backoffice?.concurrency?.managed !== true ||
            model.rawSchema.backoffice.concurrency.field !== 'revision' ||
            model.rawSchema.router?.enabled !== false ||
            !SERVICE.DefaultCommercialAgreementService?.get || !SERVICE.DefaultCommercialAgreementService?.save ||
            !SERVICE.DefaultCommercialAgreementService?.update) this.fail('STORAGE');
        const hooks = SERVICE.DefaultDatabaseConfigurationService?.getSchemaInterceptors?.('commercialAgreement');
        for (const [trigger, member] of Object.entries({ preSave: 'protect', preUpdate: 'protect', preRemove: 'protectRemove' })) {
            if (!hooks?.[trigger]?.some(item => [true, 'true'].includes(item.active) &&
                item.handler === 'DefaultCommercialAgreementOperationService.' + member)) this.fail('STORAGE');
        }
        if (SERVICE.DefaultModelConcurrencyService?.getField(model.rawSchema) !== 'revision') this.fail('STORAGE');
        return SERVICE.DefaultCommercialAgreementService;
    },
    /** Requires the installed unique identity index before admitting a mutation; metadata alone is insufficient. */
    qualifyPersistence: async function (tenant) {
        this.storage(tenant);
        const model = NODICS.getModels('commercialAgreement', tenant)?.CommercialAgreementModel;
        const inspector = SERVICE.DefaultDatabaseModelHandlerService;
        if (!inspector?.inspectIndexes) this.fail('STORAGE');
        const evidence = await inspector.inspectIndexes(model);
        if (evidence?.versioned !== false || !Array.isArray(evidence.indexes) || !evidence.indexes.some(index =>
            index.unique === true && !index.sparse && !index.partialFilterExpression &&
            (!index.collation || index.collation.locale === 'simple') && index.key?.code === 1 &&
            Object.keys(index.key).length === 1)) this.fail('STORAGE');
    },
    /** Builds a private generated-service request only after scope admission. */
    local: function (tenant) {
        const identity = SERVICE.DefaultIdentityGovernanceService;
        if (!identity?.getSystemAuthData) this.fail('STORAGE');
        return { tenant, authData: identity.getSystemAuthData(), options: { recursive: false, skipItemCache: true } };
    },
    /** Unwraps a generated result and rejects failed/unknown response envelopes. */
    records: function (response) {
        if (!response || response.success === false || response.acknowledged === false || response.error ||
            response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
            Object.hasOwn(response, 'result') && response.code !== undefined &&
                (typeof response.code !== 'string' || !response.code.startsWith('SUC_'))) this.fail('STORAGE');
        const data = Object.hasOwn(response, 'result') ? response.result : response;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.models)) return data.models;
        if (data?.code) return [data];
        this.fail('STORAGE');
    },
    /**
     * Reads an exact catalogue version from the configured detached owner using the original human bearer.
     * @param {Object} request Admitted Agreement context; authorization is captured by its controller.
     * @param {Object} ref Exact Product or PriceRow reference, including its managed version.
     * @param {Object} query Owner query constructed by resolveReference, never a caller query.
     * @returns {Promise<Object[]>} Bounded generated owner rows; no persistence or credential issuance.
     * @throws {Error} Invalid topology, missing original authority, transport failure or changed binding.
     * @override Preserve fixed owner routes, original identity, exact versions and no local fallback.
     */
    remoteCatalogueReference: async function (request, ref, query) {
        const policy = structuredClone(this.policy().catalogueReferences);
        const timeout = policy.validation?.timeoutMs;
        const maximumPageSize = this.policy().maximumPageSize;
        const auth = structuredClone(request.authData), authorization = request.authorization;
        const tenant = request.tenant, enterprise = auth.enterpriseCode || auth.entCode;
        const owner = ref.module === 'product' && ref.schema === 'product' ? 'product' :
            ref.module === 'pricing' && ref.schema === 'priceRow' ? 'pricing' : undefined;
        const check = () => {
            if (!owner || !Number.isSafeInteger(ref.versionId) || ref.versionId < 0 ||
                policy.mode !== 'REMOTE' || typeof policy.connectionName !== 'string' || !policy.connectionName ||
                !/^v\d+$/.test(policy.apiVersion) || policy.targetAuthority?.runtimeRole !== 'COMMERCE_STAGED' ||
                !Number.isSafeInteger(timeout?.minimum) || !Number.isSafeInteger(timeout?.maximum) ||
                timeout.minimum < 1 || timeout.minimum > timeout.maximum ||
                !Number.isSafeInteger(policy.timeoutMs) || policy.timeoutMs < timeout.minimum || policy.timeoutMs > timeout.maximum ||
                !/^Bearer \S+$/i.test(authorization || '') || auth.principalType !== 'human' || auth.tokenType !== 'access' ||
                !tenant || auth.tenant !== tenant || !enterprise || auth.isSystem ||
                request.tenant !== tenant || request.authorization !== authorization ||
                !isDeepStrictEqual(request.authData, auth) || !isDeepStrictEqual(this.policy().catalogueReferences, policy) ||
                this.policy().maximumPageSize !== maximumPageSize) this.fail('REFERENCE');
        };
        check();
        if (typeof SERVICE.DefaultModuleService?.invokeModule !== 'function') this.fail('REFERENCE');
        const path = owner === 'product' ? '/product' : '/pricerow';
        const invoke = async (apiName, methodName, requestBody) => {
            check();
            let response;
            try {
                response = await SERVICE.DefaultModuleService.invokeModule({ local: false,
                    moduleName: owner, connectionName: policy.connectionName, apiVersion: policy.apiVersion,
                    targetAuthority: policy.targetAuthority, apiName, methodName, tenant, request: { tenant },
                    header: { Authorization: authorization, 'X-Enterprise-Code': enterprise },
                    ...(requestBody === undefined ? {} : { requestBody }),
                    timeoutMs: policy.timeoutMs, maxAttempts: 1 });
            } catch { this.fail('REFERENCE'); }
            check();
            return this.catalogueReferenceData(response);
        };
        const descriptor = await invoke(path + '/capabilities', 'GET');
        const capabilities = descriptor?.queryCapabilities, route = descriptor?.apiOperations?.search;
        const requiredFields = ['code', 'tenant', 'versionId', ...Object.keys(query),
            ...(owner === 'pricing' ? ['productCode', 'unitAmount', 'currency'] : [])];
        if (descriptor?.moduleName !== owner || descriptor.schemaName !== ref.schema ||
            !descriptor.operations?.includes('search') || route?.active !== true || route.method !== 'POST' ||
            route.path !== path + '/safe-search' || route.apiVersion !== policy.apiVersion ||
            !Array.isArray(descriptor.fields) || requiredFields.some(name => !descriptor.fields.some(field => field.name === name)) ||
            !Array.isArray(capabilities?.allowedPageSizes) || !Number.isSafeInteger(capabilities.maximumPageSize) || capabilities.maximumPageSize < 1 ||
            !capabilities.groupOperators?.includes('AND') ||
            !Array.isArray(capabilities.filterFields) || Object.keys(query).some(field =>
                !capabilities.filterFields.some(item => item.field === field && item.operators?.includes('EQUALS')))) this.fail('REFERENCE');
        const pageSize = Math.min(...capabilities.allowedPageSizes.filter(size => Number.isSafeInteger(size) && size > 0 &&
            size <= capabilities.maximumPageSize && size <= maximumPageSize));
        if (!Number.isSafeInteger(pageSize)) this.fail('REFERENCE');
        const response = await invoke(route.path, route.method, { pageNumber: 1, pageSize,
            filters: { operator: 'AND', items: Object.entries(query).map(([field, value]) => ({ field, operator: 'EQUALS', value })) } });
        const rows = response?.records;
        if (!Array.isArray(rows) || rows.length > 2 || rows.some(row => row.tenant !== tenant) ||
            response.totalCount !== rows.length || response.pageNumber !== 1 || response.pageSize !== pageSize) this.fail('REFERENCE');
        return rows;
    },
    /**
     * Unwraps only affirmative canonical schema capability/search responses.
     * @param {Object} response Existing nService HTTP result, possibly wrapped in data envelopes.
     * @returns {Object} Owner descriptor or safe-search page without transport wrappers.
     * @throws {Error} Failed, ambiguous or excessively nested response; no error payload is exposed.
     * @override Preserve failure checks at every envelope and do not reinterpret errors as records.
     */
    catalogueReferenceData: function (response) {
        for (let depth = 0; depth < 5; depth += 1) {
            if (!response || typeof response !== 'object' || Array.isArray(response) ||
                response.error || response.success === false || response.acknowledged === false ||
                response.code !== undefined && !/^SUC_/.test(response.code) ||
                response.errors != null && (!Array.isArray(response.errors) || response.errors.length) ||
                response.result !== undefined) this.fail('REFERENCE');
            if (response.data === undefined) return response;
            response = response.data;
        }
        this.fail('REFERENCE');
    },
    /**
     * Resolves the agreement party through Profile's existing fresh participant evidence port.
     * @param {Object} request Admitted Agreement context with the original human bearer.
     * @param {Object} ref Exact Enterprise code selected after Agreement scope admission.
     * @returns {Promise<Object>} Tenant-bound Enterprise identity, never a local Profile record copy.
     * @throws {Error} Missing authority, changed context or absent/foreign participant evidence.
     * @override Preserve Profile ownership, fixed endpoint, original actor and exact response binding.
     */
    enterpriseReference: async function (request, ref) {
        this.identifier(ref.code);
        const policy = structuredClone(this.policy().enterpriseReference);
        const auth = structuredClone(request.authData), tenant = request.tenant, authorization = request.authorization;
        const code = ref.code, enterprise = auth.enterpriseCode || auth.entCode;
        const bound = () => {
            const timeout = policy?.validation?.timeoutMs;
            if (!policy || typeof policy.connectionName !== 'string' || !policy.connectionName ||
                !/^v\d+$/.test(policy.apiVersion) || policy.targetAuthority?.runtimeRole !== 'PLATFORM' ||
                !Number.isSafeInteger(timeout?.minimum) || !Number.isSafeInteger(timeout?.maximum) ||
                timeout.minimum < 1 || timeout.maximum < timeout.minimum ||
                !Number.isSafeInteger(policy.timeoutMs) || policy.timeoutMs < timeout.minimum || policy.timeoutMs > timeout.maximum ||
                auth.principalType !== 'human' || auth.tokenType !== 'access' || auth.isSystem || !enterprise ||
                !tenant || auth.tenant !== tenant || !/^Bearer \S+$/i.test(authorization || '') ||
                request.tenant !== tenant || request.authorization !== authorization || ref.code !== code ||
                !isDeepStrictEqual(request.authData, auth) || !isDeepStrictEqual(this.policy().enterpriseReference, policy)) this.fail('REFERENCE');
        };
        bound();
        if (typeof SERVICE.DefaultModuleService?.invokeModule !== 'function') this.fail('REFERENCE');
        let response;
        try {
            response = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: 'profile',
                connectionName: policy.connectionName, apiVersion: policy.apiVersion, targetAuthority: policy.targetAuthority,
                apiName: '/participants/resolve', methodName: 'POST', tenant, request: { tenant },
                header: { Authorization: authorization, 'X-Enterprise-Code': enterprise },
                requestBody: { ownerType: 'ENTERPRISE', ownerCode: code }, timeoutMs: policy.timeoutMs, maxAttempts: 1 });
        } catch { this.fail('REFERENCE'); }
        bound();
        const proof = this.catalogueReferenceData(response);
        if (proof.contractVersion !== 1 || proof.tenant !== tenant || proof.recipient?.ownerType !== 'ENTERPRISE' ||
            proof.recipient.ownerCode !== code) this.fail('REFERENCE');
        return { code, tenant };
    },
    /** Reads a single exact owner reference using the original scoped authority. */
    resolveReference: async function (request, ref, serviceName) {
        if (serviceName === 'DefaultEnterpriseService') return this.enterpriseReference(request, ref);
        const query = { code: ref.code };
        if (ref.versionId !== undefined) query.versionId = ref.versionId;
        if (ref.catalogVersion !== undefined) query.catalogVersion = ref.catalogVersion;
        const catalogue = ['DefaultProductService', 'DefaultPriceRowService'].includes(serviceName);
        const mode = this.policy().catalogueReferences.mode;
        if (!['LOCAL', 'REMOTE'].includes(mode)) this.fail('CONFIG');
        let rows;
        if (catalogue && mode === 'REMOTE') rows = await this.remoteCatalogueReference(request, ref, query);
        else {
            const service = SERVICE[serviceName];
            if (!service?.get) this.fail('REFERENCE');
            rows = this.records(await service.get({ tenant: request.tenant, authData: request.authData, query,
                options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, limit: 2 } }));
        }
        if (rows.length !== 1 || Object.entries(query).some(([key, value]) => rows[0][key] !== value) ||
            rows[0].tenant !== undefined && rows[0].tenant !== request.tenant) this.fail('REFERENCE');
        return rows[0];
    },
    /** Checks and freezes agreed benefit coverage; no payment or coupon lifecycle is executed. */
    benefit: function (value, terms) {
        this.object(value, ['code', 'source', 'targetType', 'productCodes', 'storeCode', 'validFrom', 'validTo', 'evidenceRef', 'additionalBenefitTerms']);
        this.identifier(value.code); this.identifier(value.storeCode);
        if (!this.vocabulary('commercialAgreementBenefitSources').includes(value.source) ||
            !this.vocabulary('commercialAgreementTargetTypes').includes(value.targetType)) this.fail('INPUT');
        const productCodes = value.productCodes;
        if (!Array.isArray(productCodes) || productCodes.length > this.policy().maximumSelectedProducts ||
            new Set(productCodes).size !== productCodes.length) this.fail('INPUT');
        productCodes.forEach(code => this.identifier(code));
        if (value.targetType === 'SELECTED_COUPONS' ? productCodes.length === 0 : productCodes.length !== 0) this.fail('INPUT');
        const validFrom = this.date(value.validFrom), validTo = this.date(value.validTo);
        if (validFrom >= validTo || validFrom < terms.effectiveFrom || terms.effectiveTo && validTo > terms.effectiveTo) this.fail('INPUT');
        this.text(value.evidenceRef);
        if (value.source === 'ADD_ON') this.text(value.additionalBenefitTerms);
        return { ...structuredClone(value), productCodes: [...productCodes].sort(), validFrom, validTo };
    },
    /** Validates a complete agreed snapshot for both shared-package commercial models. */
    terms: function (input) {
        this.object(input, ['model', 'paymentTerms', 'packageRef', 'priceRef', 'services', 'allowances', 'effectiveFrom', 'effectiveTo',
            'serviceStart', 'paymentSchedule', 'billingPeriod', 'renewal', 'terminationTerms', 'financialTreatment', 'evidenceRef', 'financialReferences', 'benefits']);
        if (!this.vocabulary('commercialAgreementModels').includes(input.model) ||
            !this.vocabulary('commercialAgreementPaymentTerms').includes(input.paymentTerms)) this.fail('INPUT');
        const terms = structuredClone(input);
        terms.packageRef = this.reference(input.packageRef, 'product', 'product');
        terms.priceRef = this.reference(input.priceRef, 'pricing', 'priceRow');
        if (terms.packageRef.versionId === undefined || terms.priceRef.versionId === undefined) this.fail('INPUT');
        terms.effectiveFrom = this.date(input.effectiveFrom);
        terms.serviceStart = this.date(input.serviceStart);
        if (input.effectiveTo !== undefined) terms.effectiveTo = this.date(input.effectiveTo);
        if (terms.effectiveTo && terms.effectiveTo <= terms.effectiveFrom || terms.serviceStart < terms.effectiveFrom ||
            terms.effectiveTo && terms.serviceStart >= terms.effectiveTo) this.fail('INPUT');
        ['services', 'allowances', 'paymentSchedule', 'terminationTerms', 'financialTreatment', 'evidenceRef'].forEach(key => this.text(input[key]));
        if (input.model === 'SUBSCRIPTION') this.text(input.billingPeriod);
        this.object(input.renewal, ['mode', 'period', 'noticeTerms', 'evidenceRef']);
        if (!['NONE', 'MANUAL', 'AUTOMATIC'].includes(input.renewal.mode)) this.fail('INPUT');
        if (input.renewal.mode === 'AUTOMATIC') ['period', 'noticeTerms', 'evidenceRef'].forEach(key => this.text(input.renewal[key]));
        if (!Array.isArray(input.financialReferences) || input.financialReferences.length > this.policy().maximumBenefits ||
            !Array.isArray(input.benefits) || input.benefits.length > this.policy().maximumBenefits) this.fail('INPUT');
        terms.financialReferences = input.financialReferences.map(ref => {
            if (ref.module === 'order') return this.reference(ref, 'order', 'commerceOrder');
            if (ref.module === 'paymentCore') return this.reference(ref, 'paymentCore', 'paymentTransaction');
            this.fail('REFERENCE');
        });
        terms.benefits = input.benefits.map(benefit => this.benefit(benefit, terms));
        if (new Set(terms.benefits.map(benefit => benefit.code)).size !== terms.benefits.length) this.fail('INPUT');
        return terms;
    },
    /** Reads the exact scoped aggregate, never an editable head detached from history. */
    load: async function (tenant, code, enterpriseCode) {
        this.identifier(code); this.identifier(enterpriseCode);
        const rows = this.records(await this.storage(tenant).get({ ...this.local(tenant),
            query: { code, 'enterpriseRef.code': enterpriseCode }, searchOptions: { pageSize: 2, limit: 2 } }));
        if (rows.length > 1) this.fail('STORAGE');
        const row = rows[0];
        if (row && (row.code !== code || row.enterpriseRef?.code !== enterpriseCode || !Array.isArray(row.versions) ||
            !Number.isSafeInteger(row.revision) || row.revision < 1 || row.versions.length !== row.revision)) this.fail('STORAGE');
        return row;
    },
    /** Persists creation/amendment atomically, with stable command replay and retained financial treatment. */
    record: async function (original) {
        const request = { tenant: original.tenant, authData: structuredClone(original.authData),
            authorization: original.authorization, payload: structuredClone(original.payload) };
        const input = this.object(request.payload, ['code', 'enterpriseCode', 'commandId', 'expectedRevision', 'terms']);
        const scope = this.scope(request, input.enterpriseCode, true);
        this.identifier(input.code); this.identifier(input.commandId);
        if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) this.fail('INPUT');
        const terms = this.terms(input.terms);
        await this.qualifyPersistence(scope.tenant);
        const previous = await this.load(scope.tenant, input.code, scope.enterpriseCode);
        const command = { commandId: input.commandId, expectedRevision: input.expectedRevision, terms };
        const replay = previous?.versions.find(version => version.commandId === command.commandId);
        if (replay) {
            if (!isDeepStrictEqual(replay.command, command) || replay.actor !== scope.actor) this.fail('CONFLICT');
            return { code: previous.code, revision: previous.revision, version: replay.version, replayed: true };
        }
        if ((previous?.revision || 0) !== input.expectedRevision || (previous?.versions.length || 0) >= this.policy().maximumVersions) this.fail('CONFLICT');
        if (previous && terms.effectiveFrom <= previous.versions.at(-1).terms.effectiveFrom) this.fail('CONFLICT');
        await this.resolveReference(request, { code: scope.enterpriseCode }, 'DefaultEnterpriseService');
        const product = await this.resolveReference(request, terms.packageRef, 'DefaultProductService');
        const price = await this.resolveReference(request, terms.priceRef, 'DefaultPriceRowService');
        if (product.active === false || price.active === false || price.productCode !== product.code ||
            typeof price.unitAmount !== 'string' || !/^\d+(\.\d+)?$/.test(price.unitAmount) || !/^[A-Z]{3}$/.test(price.currency || '')) this.fail('REFERENCE');
        for (const ref of terms.financialReferences) await this.resolveReference(request, ref,
            ref.module === 'order' ? 'DefaultCommerceOrderService' : 'DefaultPaymentTransactionService');
        const version = { version: input.expectedRevision + 1, commandId: input.commandId, command,
            actor: scope.actor, recordedAt: new Date().toISOString(), terms,
            agreedPrice: { reference: terms.priceRef, unitAmount: price.unitAmount, currency: price.currency } };
        const model = { code: input.code, enterpriseRef: { module: 'profile', schema: 'enterprise', code: scope.enterpriseCode },
            versions: [...(previous?.versions || []), version] };
        if (Buffer.byteLength(JSON.stringify(model)) > this.policy().maximumRecordBytes) this.fail('INPUT');
        this.scope(request, scope.enterpriseCode, true);
        const local = this.local(scope.tenant), service = this.storage(scope.tenant);
        const mutation = previous
            ? { ...local, query: { code: input.code, 'enterpriseRef.code': scope.enterpriseCode, revision: previous.revision },
                model, options: { ...local.options, returnModified: true } }
            : { ...local, model };
        writes.add(mutation);
        try { await service[previous ? 'update' : 'save'](mutation); }
        finally { writes.delete(mutation); }
        // Read back the committed command so an ambiguous/failed provider acknowledgement never reports success.
        const saved = await this.load(scope.tenant, input.code, scope.enterpriseCode);
        const retained = saved?.versions.find(item => item.commandId === input.commandId);
        if (!retained || !isDeepStrictEqual(retained, version)) this.fail('CONFLICT');
        return { code: saved.code, revision: saved.revision, version: retained.version, replayed: false };
    },
    /** Projects authorized workspace commands and framework bounds without installing or granting anything. */
    workspace: function (request) {
        const input = this.object(request.payload, ['enterpriseCode']);
        const scope = this.scope(request, input.enterpriseCode, false), policy = this.policy();
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        return { contractVersion: 1, workspaceCode: 'commerce.agreements', viewCode: 'commercialAgreement.history',
            enterpriseCode: scope.enterpriseCode,
            availableCommands: ['search', 'read', ...(security.isPermissionGranted(policy.writePermission,
                security.getGrantedPermissions(request), {}) ? ['record'] : [])],
            options: { models: this.vocabulary('commercialAgreementModels'),
                paymentTerms: this.vocabulary('commercialAgreementPaymentTerms'),
                benefitSources: this.vocabulary('commercialAgreementBenefitSources'),
                targetTypes: this.vocabulary('commercialAgreementTargetTypes'),
                renewalModes: ['NONE', 'MANUAL', 'AUTOMATIC'],
                financialOwners: [{ module: 'order', schema: 'commerceOrder' }, { module: 'paymentCore', schema: 'paymentTransaction' }] },
            limits: { pageSize: policy.workspace.pageSize, maximumPageSize: policy.maximumPageSize,
                maximumBenefits: policy.maximumBenefits, maximumSelectedProducts: policy.maximumSelectedProducts,
                maximumTextLength: policy.validation.maximumTextLength, maximumVersions: policy.maximumVersions,
                maximumRecordBytes: policy.maximumRecordBytes },
            mutation: { expectedRevisionRequired: true, commandIdRequired: true, automaticRetry: false } };
    },
    /** Returns authorized agreement history without deriving Enterprise active status. */
    read: async function (request) {
        const input = this.object(request.payload, ['code', 'enterpriseCode']);
        const scope = this.scope(request, input.enterpriseCode, false);
        const row = await this.load(scope.tenant, input.code, scope.enterpriseCode);
        if (!row) this.fail('MISSING');
        return row;
    },
    /** Lists bounded agreement summaries inside one independently authorized Enterprise. */
    search: async function (request) {
        const input = this.object(request.payload, ['enterpriseCode', 'pageNumber', 'pageSize']);
        const scope = this.scope(request, input.enterpriseCode, false);
        if (!Number.isSafeInteger(input.pageNumber) || input.pageNumber < 1 || !Number.isSafeInteger(input.pageSize) ||
            input.pageSize < 1 || input.pageSize > this.policy().maximumPageSize ||
            !Number.isSafeInteger((input.pageNumber - 1) * input.pageSize)) this.fail('INPUT');
        const rows = this.records(await this.storage(scope.tenant).get({ ...this.local(scope.tenant),
            query: { 'enterpriseRef.code': scope.enterpriseCode },
            searchOptions: { skip: (input.pageNumber - 1) * input.pageSize, limit: input.pageSize + 1, pageSize: input.pageSize + 1, sort: { code: 1 } } }));
        if (rows.length > input.pageSize + 1 || rows.some(row => row.enterpriseRef?.code !== scope.enterpriseCode || !Array.isArray(row.versions))) this.fail('STORAGE');
        return { pageNumber: input.pageNumber, pageSize: input.pageSize, hasMore: rows.length > input.pageSize,
            agreements: rows.slice(0, input.pageSize).map(row => ({ code: row.code, revision: row.revision,
                enterpriseRef: row.enterpriseRef, latestVersion: row.versions.at(-1)?.version })) };
    },
    /** Requires agreement read authority before an operator links coverage to a published Search rule. */
    authorizeBenefitPublication: async function (request, reference) {
        this.scope(request, reference?.enterpriseCode, false);
        return this.resolveBenefit(request, reference);
    },
    /** Resolves the current benefit only for internal Search; no HTTP route exposes private commercial records. */
    resolveBenefit: async function (request, reference) {
        this.object(reference, ['agreementCode', 'enterpriseCode', 'benefitCode']);
        ['agreementCode', 'enterpriseCode', 'benefitCode'].forEach(key => this.identifier(reference[key]));
        this.identifier(request.tenant);
        if (request.authData?.tenant && request.authData.tenant !== request.tenant) this.fail('SCOPE');
        const row = await this.load(request.tenant, reference.agreementCode, reference.enterpriseCode);
        if (!row) return undefined;
        const now = request.now === undefined ? Date.now() : new Date(request.now).getTime();
        if (!Number.isFinite(now)) this.fail('INPUT');
        const version = row.versions.filter(item => Date.parse(item.terms.effectiveFrom) <= now).at(-1);
        if (!version || version.terms.effectiveTo && Date.parse(version.terms.effectiveTo) <= now) return undefined;
        const benefit = version.terms.benefits.find(item => item.code === reference.benefitCode);
        if (!benefit || Date.parse(benefit.validFrom) > now || Date.parse(benefit.validTo) <= now) return undefined;
        const coverage = Object.fromEntries(['code', 'source', 'targetType', 'productCodes', 'storeCode', 'validFrom', 'validTo']
            .map(key => [key, structuredClone(benefit[key])]));
        return { ...coverage, ...reference, version: version.version };
    }
};
