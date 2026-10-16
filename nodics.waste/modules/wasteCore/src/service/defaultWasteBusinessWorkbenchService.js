/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module wasteCore/service/DefaultWasteBusinessWorkbenchService @description Collection-scoped read-only Workbench over existing schema metadata and generated persistence. @layer service @owner wasteCore */
const { isDeepStrictEqual } = require('node:util');

// Fixed domain relationships and disclosure ceilings, not caller-selected repositories.
const resources = Object.freeze({
    wasteCollectionPoint: { owner: 'wasteCollection', link: 'point', fields: ['code', 'name', 'collectionPointType', 'operatingStatus', 'status', 'revision'] },
    wasteSubmission: { owner: 'wasteSubmission', link: 'submission', fields: ['code', 'categoryCode', 'itemTypeCode', 'conditionGrade', 'quantity', 'weight', 'submissionStatus', 'revision'] },
    wasteReceipt: { owner: 'wasteReceipt', link: 'submissionCode', fields: ['code', 'submissionCode', 'collectionPointCode', 'receivedAt', 'receivedQuantity', 'receivedWeight', 'receiptStatus', 'revision'] },
    wasteVerification: { owner: 'wasteVerification', link: 'submissionCode', fields: ['code', 'submissionCode', 'verificationStatus', 'verifiedCategoryCode', 'verifiedItemTypeCode', 'verifiedQuantity', 'verifiedWeight', 'verifiedAt', 'revision'] },
    wasteMetadataSuggestion: { owner: 'wasteSubmission', link: 'submissionCode', fields: ['code', 'submissionCode', 'sourceType', 'suggestedCategoryCode', 'suggestedItemTypeCode', 'confidence', 'status', 'revision'] },
    wasteAsset: { owner: 'wasteCore', link: 'asset', fields: ['code', 'assetTypeCode', 'sourceSubmissionCode', 'custodyStatus', 'assetStatus', 'revision'] },
    wasteAssetOwnershipEvent: { owner: 'wasteCore', link: 'assetCode', fields: ['code', 'assetCode', 'transferType', 'transferStatus', 'occurredAt', 'revision'] },
    wasteAssetMarketplaceProjection: { owner: 'wasteCore', link: 'assetCode', fields: ['code', 'assetCode', 'projectionStatus', 'listingMode', 'visibilityMode', 'requestedAt', 'projectedAt', 'closedAt', 'revision'] },
    wasteImpactSelection: { owner: 'wasteImpact', link: 'assetCode', fields: ['code', 'assetCode', 'selectedAt', 'sourceAssetRevision', 'revision'] },
});

module.exports = {
    /** Only these persisted relationships qualify for the ordinary business read surface. */
    supports: function (schema) { return Object.hasOwn(resources, schema); },
    /** Returns the same disclosure ceiling used by descriptor fields and navigation. */
    readFields: function (schema) { return resources[schema]?.fields.slice() || []; },
    /** Emits stable, non-disclosing errors. */
    fail: function (reason) { throw new CLASSES.NodicsError('ERR_WASTE_WORKBENCH_' + reason); },
    /** Rejects hidden properties, raw query operators and scope aliases at the HTTP boundary. */
    object: function (value, keys) {
        if (!value || Object.getPrototypeOf(value) !== Object.prototype || Reflect.ownKeys(value).some(key =>
            typeof key !== 'string' || !keys.includes(key) || !Object.getOwnPropertyDescriptor(value, key)?.enumerable ||
            !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'))) this.fail('INPUT');
    },
    /** Bounds hydrated claim ancestry before invoking the shared permission walkers. */
    validGroups: function (groups) {
        const ancestry = new Set();
        let remaining = 1024;
        const visit = (items, depth) => Array.isArray(items) && items.length <= remaining && depth < 64 && Array.from(items).every(group => {
            if (--remaining < 0) return false;
            if (typeof group === 'string') return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(group);
            if (!group || Object.getPrototypeOf(group) !== Object.prototype || ancestry.has(group) ||
                typeof group.code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(group.code) ||
                (group.active !== undefined && typeof group.active !== 'boolean') ||
                (group.permissions !== undefined && (!Array.isArray(group.permissions) ||
                    !Array.from(group.permissions).every(permission => typeof permission === 'string' && permission.trim())))) return false;
            ancestry.add(group);
            const valid = group.parentGroups === undefined || visit(group.parentGroups, depth + 1);
            ancestry.delete(group);
            return valid;
        });
        return visit(groups, 0);
    },
    /** Requires signed human enterprise authority, never a namespace supplied by the browser. */
    scope: function (request) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        const valid = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
        const enterprise = auth.entCode || auth.enterpriseCode;
        if (!valid(auth.tenant) || !valid(enterprise) || typeof auth.loginId !== 'string' || !auth.loginId.trim() ||
            auth.principalType !== 'human' || auth.tokenType !== 'access' || auth.isSystem || auth.runtimeScope ||
            request.tenant !== auth.tenant || !/^Bearer \S+$/.test(request.authorization || '') ||
            [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
            [auth.entCode, auth.enterpriseCode, request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== enterprise) ||
            !this.validGroups(auth.userGroups) || (auth.groups !== undefined && !this.validGroups(auth.groups)) ||
            !security?.getEffectiveUserGroupCodes(auth.userGroups).includes('employeeUserGroup') ||
            !security.isPermissionGranted('waste.backoffice.view', security.getGrantedPermissions(request), {})) this.fail('SCOPE');
        return { tenant: auth.tenant, enterprise };
    },
    /** Records immutable caller context for each bounded operation. */
    admission: function (request) {
        return { request, scope: this.scope(request), auth: structuredClone(request.authData), authorization: request.authorization,
            policy: structuredClone((CONFIG.get('waste') || {}).operations || {}) };
    },
    /** Rechecks caller and policy after every asynchronous owner boundary. */
    current: function (context) {
        if (!isDeepStrictEqual(this.scope(context.request), context.scope) ||
            !isDeepStrictEqual(context.request.authData, context.auth) || context.request.authorization !== context.authorization ||
            !isDeepStrictEqual((CONFIG.get('waste') || {}).operations || {}, context.policy)) this.fail('SCOPE');
    },
    /** Resolves only a qualified active owner schema. */
    schema: function (name) {
        if (!this.supports(name)) this.fail('UNQUALIFIED_SCHEMA');
        const owner = resources[name].owner, schema = NODICS.getModule(owner)?.rawSchema?.[name];
        if (NODICS.isModuleActive(owner) !== true || !schema?.model) this.fail('UNAVAILABLE');
        return schema;
    },
    /** Reuses metadata builders but exposes no generic CRUD, references or evidence fields. */
    descriptor: function (name) {
        const schema = this.schema(name), resource = resources[name], utility = SERVICE.DefaultSchemaUtilityService;
        const definition = Object.fromEntries(resource.fields.map(field => [field, schema.definition[field]]).filter(([, value]) => value));
        if (!definition.code) this.fail('UNAVAILABLE');
        const projected = { ...schema, definition, refSchema: {} };
        const config = { ...schema.backoffice, mutationMode: 'READ_ONLY', operations: ['read', 'search'],
            fields: Object.fromEntries(Object.keys(definition).map(field => [field, { readOnly: true }])),
            searchableFields: ['code'], sortableFields: ['code'], filterFields: ['code'],
            form: { defaultColumns: Object.keys(definition) } };
        const queryCapabilities = utility.buildQueryCapabilities(projected, config, 'code');
        const bulkCapabilities = utility.buildBulkCapabilities({ bulkOperations: [] });
        if (!Number.isSafeInteger(queryCapabilities.maximumPageSize) || queryCapabilities.maximumPageSize < 1 ||
            !Number.isSafeInteger(bulkCapabilities.maximumItems) || bulkCapabilities.maximumItems < 1) this.fail('UNAVAILABLE');
        queryCapabilities.maximumPageSize = Math.min(100, queryCapabilities.maximumPageSize);
        queryCapabilities.allowedPageSizes = queryCapabilities.allowedPageSizes.filter(size => Number.isSafeInteger(size) && size > 0 && size <= queryCapabilities.maximumPageSize);
        if (!queryCapabilities.allowedPageSizes.length) this.fail('UNAVAILABLE');
        if (!queryCapabilities.allowedPageSizes.includes(queryCapabilities.defaultPageSize)) queryCapabilities.defaultPageSize = queryCapabilities.allowedPageSizes[0];
        const route = operation => {
            const targets = Object.values(NODICS.getRouters('wasteApi') || {}).filter(route =>
                route.controller === 'DefaultWasteBusinessWorkbenchController' && route.operation === operation);
            if (targets.length !== 1 || targets[0].active === false) this.fail('UNAVAILABLE');
            return utility.projectOperationRoute({ ...targets[0], key: targets[0].key.replace(':schemaName', name) });
        };
        const disabled = method => ({ active: false, method, path: '/business/waste/schemas', apiVersion: 'v0' });
        return { moduleName: 'wasteApi', schemaName: name, label: utility.humanize(name), description: '',
            origin: utility.buildSchemaOrigin(resource.owner, schema, config), hierarchy: utility.buildSchemaHierarchy(resource.owner, schema, config),
            displayProperty: 'code', displayProperties: ['code'], operations: ['read', 'search'], mutationMode: 'READ_ONLY',
            mutationPolicy: { ...utility.buildMutationPolicy(config), savePath: 'NONE', deleteStrategy: 'NONE' },
            authoring: { ...utility.getAuthoringAuthority(schema), authoringAllowed: false },
            fields: utility.buildFields(resource.owner, projected, config), form: utility.buildForm(resource.owner, projected, config),
            relationships: [], aggregateOperations: [], concurrency: utility.buildConcurrency(schema, config),
            queryCapabilities, bulkCapabilities,
            apiOperations: { search: route('search'), capabilities: route('capabilities'),
                create: disabled('PUT'), update: disabled('PATCH'), delete: disabled('DELETE'),
                deleteImpact: disabled('POST'), bulk: disabled('POST') } };
    },
    /** Reads current Profile scopes without using an earlier request-local scope cache. */
    profileScopes: async function (context) {
        this.current(context);
        const result = await SERVICE.DefaultWasteOperationalAccessService.context({ ...context.request }, true);
        this.current(context);
        if (result?.unscoped || !Array.isArray(result?.scopes) || !Array.isArray(result?.deniedScopes) ||
            result.principalCode !== context.auth.loginId) this.fail('SCOPE');
        return result;
    },
    /** Validates provider records against partition and caller enterprise, independent of query compliance. */
    row: function (context, row) {
        if (!row || typeof row.code !== 'string' || !row.code ||
            [row.tenant, row.tenantCode].some(value => value !== undefined && value !== context.scope.tenant) ||
            [row.entCode, row.enterpriseCode].some(value => value !== undefined && value !== context.scope.enterprise)) this.fail('PROVIDER_SCOPE');
        return row;
    },
    /** Requires the generated uncached get success contract even when plausible rows accompany failure. */
    envelope: function (response) {
        if (!response || Object.getPrototypeOf(response) !== Object.prototype || response.code !== 'SUC_FIND_00000' ||
            response.error || (response.success !== undefined && response.success !== true) ||
            (response.acknowledged !== undefined && response.acknowledged !== true) ||
            (response.errors !== undefined && response.errors !== null &&
                (!Array.isArray(response.errors) || response.errors.length > 0)) ||
            !Object.hasOwn(response, 'result')) this.fail('PROVIDER_OUTCOME');
        return response;
    },
    /** A whitelisted field name never authorizes arbitrary nested provider structures. */
    project: function (row, descriptor) {
        return Object.fromEntries(descriptor.fields.filter(field => row[field.name] !== undefined).map(field => {
            const value = row[field.name];
            if (value === null || ['string', 'boolean'].includes(typeof value) || typeof value === 'number' && Number.isFinite(value)) return [field.name, value];
            if (field.type === 'date' && value instanceof Date && Number.isFinite(value.getTime())) return [field.name, value.toISOString()];
            if (field.name === 'name' && field.type === 'object' && value && Object.getPrototypeOf(value) === Object.prototype &&
                Reflect.ownKeys(value).every(key => typeof key === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,34}$/.test(key) &&
                    !['constructor', 'prototype', '__proto__'].includes(key) &&
                    typeof Object.getOwnPropertyDescriptor(value, key)?.value === 'string')) return [field.name, { ...value }];
            this.fail('PROVIDER_FIELD');
        }));
    },
    /** Generated reads use only the canonical local identity authority and forced tenant partition. */
    read: async function (context, name, query, searchOptions, validate) {
        this.current(context);
        const maximumRows = searchOptions.pageSize;
        const repository = SERVICE.DefaultWastePersistenceService.repository(name);
        const identity = SERVICE.DefaultIdentityGovernanceService;
        if (typeof identity?.getSystemAuthData !== 'function') this.fail('UNAVAILABLE');
        const request = { tenant: context.scope.tenant, authData: identity.getSystemAuthData(), query,
            searchOptions, options: { recursive: false, skipItemCache: true } };
        const before = structuredClone({ tenant: request.tenant, authData: request.authData, query: request.query });
        const response = this.envelope(await repository.get(request));
        this.current(context);
        if (!isDeepStrictEqual({ tenant: request.tenant, authData: request.authData, query: request.query }, before) ||
            !Array.isArray(response?.result) || !Number.isSafeInteger(response.count) ||
            response.count < response.result.length || response.result.length > maximumRows ||
            new Set(response.result.map(row => row?.code)).size !== response.result.length) this.fail('PROVIDER_SCOPE');
        for (const row of response.result) { this.row(context, row); if (!validate(row)) this.fail('PROVIDER_SCOPE'); }
        return response;
    },
    /** Bounds scope expansion; never return a silently truncated authorization set. */
    all: async function (context, name, query, validate) {
        const max = context.policy.maximumScopePoints;
        if (!Number.isSafeInteger(max) || max < 1 || max > 10000) this.fail('UNAVAILABLE');
        const rows = [], seen = new Set(); let count;
        for (let page = 1; ; page++) {
            const result = await this.read(context, name, query, { pageSize: Math.min(max, 100), pageNumber: page, sort: { code: 1 } }, validate);
            if (result.count > max || (count !== undefined && count !== result.count)) this.fail('SCOPE_LIMIT');
            count = result.count;
            for (const row of result.result) { if (seen.has(row.code)) this.fail('PROVIDER_SCOPE'); seen.add(row.code); rows.push(row); }
            if (rows.length === count) return rows;
            if (!result.result.length || rows.length > count) this.fail('PROVIDER_SCOPE');
        }
    },
    /** Establishes the signed enterprise ceiling before resolving collection grants or denials. */
    points: async function (context) {
        const access = SERVICE.DefaultWasteOperationalAccessService, scopes = await this.profileScopes(context);
        context.scopes = scopes;
        const applicable = values => values.filter(scope => access.matchesOperation(scope, 'waste.backoffice.view', context.request));
        const allow = applicable(scopes.scopes), deny = applicable(scopes.deniedScopes);
        const broad = values => values.some(scope => ['GLOBAL', 'TENANT'].includes(scope.scopeType) && access.matchesPoint(scope, null, context.request) ||
            scope.scopeType === 'ENTERPRISE' && scope.scopeCode === context.scope.enterprise);
        if (broad(deny)) this.fail('SCOPE');
        const allowCodes = allow.filter(scope => scope.scopeType === 'BUSINESS_UNIT').map(scope => scope.scopeCode);
        const denyCodes = deny.filter(scope => scope.scopeType === 'BUSINESS_UNIT').map(scope => scope.scopeCode);
        if (!broad(allow) && !allowCodes.length) this.fail('SCOPE');
        const query = { 'operatorEnterpriseRef.module': 'profile', 'operatorEnterpriseRef.schema': 'enterprise',
            'operatorEnterpriseRef.code': context.scope.enterprise,
            ...(!broad(allow) ? { code: { $in: allowCodes, $nin: denyCodes } } : denyCodes.length ? { code: { $nin: denyCodes } } : {}) };
        const points = await this.all(context, 'wasteCollectionPoint', query, row =>
            row.operatorEnterpriseRef?.module === 'profile' && row.operatorEnterpriseRef?.schema === 'enterprise' &&
            row.operatorEnterpriseRef.code === context.scope.enterprise &&
            allow.some(scope => access.matchesPoint(scope, row, context.request)) && !deny.some(scope => access.matchesPoint(scope, row, context.request)));
        if (!points.length) this.fail('SCOPE');
        return new Set(points.map(row => row.code));
    },
    /** Derives each transaction predicate through real persisted collection/submission/asset links. */
    selection: async function (context, name, points) {
        const link = resources[name].link, access = SERVICE.DefaultWasteOperationalAccessService;
        if (link === 'point') return { query: { code: { $in: [...points] }, 'operatorEnterpriseRef.code': context.scope.enterprise },
            valid: row => points.has(row.code) && row.operatorEnterpriseRef?.module === 'profile' &&
                row.operatorEnterpriseRef?.schema === 'enterprise' && row.operatorEnterpriseRef.code === context.scope.enterprise };
        const submissionQuery = access.pointQuery([...points]), submissionValid = row => points.has(access.pointCode(row));
        if (link === 'submission') return { query: submissionQuery, valid: submissionValid };
        const submissions = new Set((await this.all(context, 'wasteSubmission', submissionQuery, submissionValid)).map(row => row.code));
        if (link === 'submissionCode') return { query: { submissionCode: { $in: [...submissions] },
            ...(name === 'wasteReceipt' ? { collectionPointCode: { $in: [...points] } } : {}) },
            valid: row => submissions.has(row.submissionCode) && (name !== 'wasteReceipt' || points.has(row.collectionPointCode)) };
        const assetQuery = { sourceSubmissionCode: { $in: [...submissions] } }, assetValid = row => submissions.has(row.sourceSubmissionCode);
        if (link === 'asset') return { query: assetQuery, valid: assetValid };
        const assets = new Set((await this.all(context, 'wasteAsset', assetQuery, assetValid)).map(row => row.code));
        return { query: { assetCode: { $in: [...assets] } }, valid: row => assets.has(row.assetCode) };
    },
    /** Fixed read entrypoint; scopes are re-read before returning data or descriptors. */
    execute: async function (request, operation, name, body = {}) {
        if (!['schemas', 'capabilities', 'search'].includes(operation)) this.fail('INPUT');
        this.object(body, operation === 'search' ? ['query'] : []);
        if (operation !== 'schemas' && !this.supports(name)) this.fail('UNQUALIFIED_SCHEMA');
        const context = this.admission(request), points = await this.points(context);
        let result;
        if (operation === 'schemas') result = { schemas: Object.keys(resources).filter(schema =>
            NODICS.isModuleActive(resources[schema].owner) && NODICS.getModule(resources[schema].owner)?.rawSchema?.[schema]?.model).map(schema => this.descriptor(schema)) };
        else if (operation === 'capabilities') result = this.descriptor(name);
        else {
            this.object(body.query || {}, ['search', 'filters', 'sort', 'pageNumber', 'pageSize']);
            const descriptor = this.descriptor(name), input = SERVICE.DefaultSchemaSafeQueryService.buildSearchInput(body.query || {}, descriptor);
            if (input.pageNumber > 1000) this.fail('INPUT');
            const selection = await this.selection(context, name, points);
            const response = await this.read(context, name, { $and: [selection.query, input.query] },
                { ...input.searchOptions, projection: undefined }, selection.valid);
            const rechecked = await this.selection(context, name, points);
            if (!isDeepStrictEqual(rechecked.query, selection.query)) this.fail('SCOPE');
            result = { records: response.result.map(row => this.project(row, descriptor)), totalCount: response.count,
                pageNumber: input.pageNumber, pageSize: input.pageSize, sort: input.sort };
        }
        const before = context.scopes, currentPoints = await this.points(context);
        if (!isDeepStrictEqual(context.scopes, before) || !isDeepStrictEqual(currentPoints, points)) this.fail('SCOPE');
        return result;
    },
};
