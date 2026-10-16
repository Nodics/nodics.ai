/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const { isDeepStrictEqual } = require('node:util');

// Private, request-local persistence admission. Only execute can mint these tokens.
const admissions = new WeakMap();

/**
 * @module product/service/DefaultProductBusinessAuthoringService
 * @description Enterprise-scoped ordinary Product roots over generated CURRENT versioned persistence.
 * @layer service
 * @owner product
 * @override Extend bounded root metadata/validation without granting generic schema access or publication authority.
 */
module.exports = {
    /** Throws a stable Product-domain error without echoing private records. */
    fail: function (code) { throw new CLASSES.NodicsError('ERR_PRODUCT_AUTHORING_' + code); },
    /** Reads the effective Product command policy. */
    policy: function () { return CONFIG.get('product')?.businessAuthoring || {}; },
    /** Checks owner permissions through the existing authenticated permission resolver. */
    permitted: function (request, permission) {
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        return typeof permission === 'string' && permission.length > 0 && security?.isPermissionGranted?.(
            permission, security.getGrantedPermissions(request), {}) === true;
    },
    /** Validates hydrated claim structure before the shared group/permission walkers consume it. */
    validGroups: function (groups) {
        const ancestry = new Set();
        let remaining = 1024;
        const visit = (items, depth) => Array.isArray(items) && depth < 64 && Array.from(items).every(group => {
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
    /** Requires an employee's signed enterprise; caller scope aliases never broaden authority. */
    scope: function (request, operation) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        const enterpriseCode = auth.enterpriseCode || auth.entCode, principal = auth.principalId || auth.loginId || auth.code;
        const valid = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
        if (!valid(auth.tenant) || !valid(enterpriseCode) || typeof principal !== 'string' || !principal.trim() ||
            principal.length > 256 || /[\u0000-\u001f\u007f]/.test(principal) || auth.principalType !== 'human' ||
            auth.tokenType !== 'access' || auth.isSystem || auth.runtimeScope || request.tenant !== auth.tenant ||
            [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
            !this.validGroups(auth.userGroups) ||
            !security?.getEffectiveUserGroupCodes(auth.userGroups).includes('employeeUserGroup') ||
            [auth.enterpriseCode, auth.entCode, request.enterpriseCode, request.entCode].some(value =>
                value !== undefined && value !== enterpriseCode) || !this.permitted(request, this.policy().readPermission)) this.fail('SCOPE');
        if (['create', 'update', 'archive'].includes(operation)) {
            if (CONFIG.get('runtimeRole')?.publication !== 'STAGED' ||
                !SERVICE.DefaultSchemaAuthoringPolicyService?.describe(this.schema()).authoringAllowed ||
                !this.permitted(request, operation === 'archive' ? this.policy().archivePermission : this.policy().writePermission)) this.fail('SCOPE');
        }
        return { tenant: auth.tenant, enterpriseCode, principal };
    },
    /** Resolves the effective Product root, never another schema selected by input. */
    schema: function () {
        const schema = NODICS.getModule('product')?.rawSchema?.product;
        if (!schema?.model || NODICS.isModuleActive?.('product') === false) this.fail('STORAGE');
        return schema;
    },
    /** Qualifies existing generated version-aware ports without enabling them. */
    storage: function (scope) {
        const model = NODICS.getModels('product', scope.tenant)?.ProductModel;
        const service = SERVICE.DefaultProductService;
        if (!model || model.versioned !== true || model.primaryKey !== 'code' || model.rawSchema?.versionedReadMode !== 'CURRENT' ||
            ['getCurrentVersionItems', 'saveVersionedItems', 'updateVersionedItems'].some(name => typeof model[name] !== 'function') ||
            ['get', 'save', 'update'].some(name => typeof service?.[name] !== 'function') ||
            SERVICE.DefaultModelSaveInitializerService?.resolveSaveMethod?.({ schemaModel: model }) !== 'saveVersionedItems' ||
            SERVICE.DefaultModelsUpdateInitializerService?.resolveUpdateMethod?.({ schemaModel: model }) !== 'updateVersionedItems' ||
            SERVICE.DefaultModelsGetInitializerService?.resolveReadMethod?.({ schemaModel: model, query: {} }) !== 'getCurrentVersionItems') this.fail('STORAGE');
        return { model, service, get: service.get, save: service.save, update: service.update,
            current: model.getCurrentVersionItems, insert: model.saveVersionedItems, append: model.updateVersionedItems };
    },
    /** Validates a bounded plain command envelope, rejecting operators and hidden/accessor properties. */
    object: function (value, allowed) {
        if (!value || Object.getPrototypeOf(value) !== Object.prototype || Reflect.ownKeys(value).some(key =>
            typeof key !== 'string' || !allowed.includes(key) || !Object.getOwnPropertyDescriptor(value, key)?.enumerable ||
            !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'))) this.fail('INPUT');
        return value;
    },
    /** Validates a Product identity, never a query expression. */
    code: function (value) {
        if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value)) this.fail('INPUT');
        return value;
    },
    /** Projects the exact existing Workbench contract with owner routes, not widened schema ACLs. */
    descriptor: function (request) {
        const scope = this.scope(request, 'read');
        this.storage(scope);
        const utility = SERVICE.DefaultSchemaUtilityService, schema = this.schema(), metadata = schema.backoffice.businessAuthoring;
        if (!utility || !metadata) this.fail('STORAGE');
        const definition = Object.fromEntries(metadata.readFields.map(name => [name, schema.definition[name] ||
            (name === 'versionId' ? { type: 'int', required: true } : undefined)]));
        if (Object.values(definition).some(value => !value)) this.fail('STORAGE');
        definition.status = { ...definition.status, default: 'DRAFT' };
        const config = { ...schema.backoffice, fields: Object.fromEntries(metadata.readFields.map(name =>
            [name, { readOnly: !metadata.writableFields.includes(name) }])),
            searchableFields: ['code', 'name'], sortableFields: ['code', 'name', 'status'],
            filterFields: ['code', 'name', 'status', 'catalogVersion'],
            form: { sections: { details: { label: 'Product details', fields: metadata.writableFields } },
                defaultColumns: ['code', 'name', 'status', 'catalogVersion', 'versionId'] } };
        const projected = { ...schema, definition };
        const authoring = utility.getAuthoringAuthority(schema);
        const writable = CONFIG.get('runtimeRole')?.publication === 'STAGED' && authoring.authoringAllowed &&
            this.permitted(request, this.policy().writePermission);
        const route = operation => {
            const target = utility.findOperationRoute('product', 'DefaultProductBusinessAuthoringController', operation);
            if (!target) this.fail('STORAGE');
            return target;
        };
        return {
            moduleName: 'product', schemaName: 'product', label: 'Products',
            description: 'Enterprise Product roots. Staged source changes require separate governed publication.',
            origin: utility.buildSchemaOrigin('product', schema, config), hierarchy: utility.buildSchemaHierarchy('product', schema, config),
            displayProperty: 'code', displayProperties: ['code', 'name'],
            operations: ['read', 'search', ...(writable ? ['create', 'update'] : [])],
            // The existing editor transport is generated-CRUD shaped; the Product owner gates every dispatch.
            mutationMode: writable ? 'GENERATED_CRUD' : 'READ_ONLY',
            mutationPolicy: { ...utility.buildMutationPolicy(config), savePath: 'PRODUCT_OWNER_COMMAND',
                lifecycle: 'PUBLISHABLE', publishRequired: true, deleteStrategy: 'NONE' },
            authoring, fields: utility.buildFields('product', projected, config).map(field => field.name === 'status'
                ? { ...field, enum: ['DRAFT', 'ACTIVE'], enumOptions: (field.enumOptions || []).filter(option => option.value !== 'ARCHIVED') }
                : field), form: utility.buildForm('product', projected, config),
            relationships: [], aggregateOperations: [], concurrency: { mode: 'COMPARE_AND_SET', field: 'versionId', required: true, managed: true },
            queryCapabilities: utility.buildQueryCapabilities(projected, config, 'code'),
            bulkCapabilities: utility.buildBulkCapabilities({ bulkOperations: [] }),
            apiOperations: { capabilities: route('capabilities'), search: route('search'),
                create: { ...route('create'), active: writable && route('create').active },
                update: { ...route('update'), active: writable && route('update').active },
                delete: { method: 'DELETE', path: '/business/products', apiVersion: 'v0', active: false },
                deleteImpact: { method: 'POST', path: '/business/products', apiVersion: 'v0', active: false },
                bulk: { method: 'POST', path: '/business/products', apiVersion: 'v0', active: false } },
        };
    },
    /** Single admission entry; immutable input and authority are pinned until completion, then retired. */
    execute: async function (request, operation, input) {
        if (!['search', 'read', 'create', 'update', 'archive'].includes(operation)) this.fail('INPUT');
        const scope = this.scope(request, operation), storage = this.storage(scope), token = {};
        const context = { request, operation, scope, storage, auth: structuredClone(request.authData),
            role: structuredClone(CONFIG.get('runtimeRole')), policy: structuredClone(this.policy()), schema: this.schema(),
            schemaSnapshot: structuredClone(this.schema()) };
        admissions.set(token, context);
        try {
            const payload = structuredClone(input);
            if (operation === 'search') return await this.searchAdmitted(token, payload);
            if (operation === 'read') {
                this.object(payload, ['code']);
                return this.project(await this.loadRoot(token, this.code(payload.code)));
            }
            return await this.writeAdmitted(token, payload);
        } finally { admissions.delete(token); }
    },
    /** Checks private admission and fresh authority after every await; no caller can construct a token. */
    admitted: function (token) {
        const context = admissions.get(token);
        if (!context) this.fail('SCOPE');
        const { request, operation, scope, storage } = context;
        if (!isDeepStrictEqual(request.authData, context.auth) || !isDeepStrictEqual(this.scope(request, operation), scope) ||
            !isDeepStrictEqual(CONFIG.get('runtimeRole'), context.role) || !isDeepStrictEqual(this.policy(), context.policy) ||
            this.schema() !== context.schema || !isDeepStrictEqual(this.schema(), context.schemaSnapshot) ||
            Object.entries(this.storage(scope)).some(([key, value]) => storage[key] !== value)) this.fail('SCOPE');
        return context;
    },
    /** Supplies local generated persistence authority only to a privately admitted fixed Product command. */
    local: function (token) {
        const { scope } = this.admitted(token), identity = SERVICE.DefaultIdentityGovernanceService;
        if (!identity?.getSystemAuthData) this.fail('STORAGE');
        return { tenant: scope.tenant, authData: identity.getSystemAuthData(), options: { recursive: false, skipItemCache: true } };
    },
    /** Rejects provider scope escapes independently of the query; only the root's safe fields leave this owner. */
    assertRow: function (token, row, code) {
        const { scope } = this.admitted(token);
        if (!row || Object.getPrototypeOf(row) !== Object.prototype || row.tenant !== scope.tenant || row.enterpriseCode !== scope.enterpriseCode ||
            (code !== undefined && row.code !== code) || !Number.isSafeInteger(row.versionId) || row.versionId < 0 ||
            !Number.isSafeInteger(row.revision) || row.revision < 0) this.fail('CONFLICT');
        this.code(row.code);
        return row;
    },
    /** Projects bounded ordinary fields, never publication seals, marketplace proofs, scope or storage metadata. */
    project: function (row) {
        const fields = this.schema().backoffice.businessAuthoring.readFields;
        return Object.fromEntries(fields.filter(name => row[name] !== undefined).map(name => [name, structuredClone(row[name])]));
    },
    /** Rejects failure markers even when a generated success code or plausible payload accompanies them. */
    assertOutcome: function (value) {
        if (!value || Object.getPrototypeOf(value) !== Object.prototype || value.error ||
            (value.success !== undefined && value.success !== true) ||
            (value.acknowledged !== undefined && value.acknowledged !== true) ||
            (value.errors !== undefined && value.errors !== null &&
                (!Array.isArray(value.errors) || value.errors.length > 0))) this.fail('CONFLICT');
        return value;
    },
    /** Requires the exact generated operation success envelope; missing outcomes require operator reconciliation. */
    envelope: function (response, code) {
        this.assertOutcome(response);
        if (response.code !== code || !Object.hasOwn(response, 'result')) this.fail('CONFLICT');
        return response.result;
    },
    /** Reads one current enterprise root; no history or neutral dependency fallback. */
    loadRoot: async function (token, code, optional = false) {
        const { scope, storage } = this.admitted(token);
        const response = await storage.service.get({ ...this.local(token),
            query: { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, code }, searchOptions: { limit: 2, pageSize: 2 } });
        this.admitted(token);
        this.envelope(response, 'SUC_FIND_00000');
        if (!Array.isArray(response?.result) || response.result.length > 1 ||
            !Number.isSafeInteger(response.count) || response.count !== response.result.length) this.fail('CONFLICT');
        if (!response.result.length) { if (optional) return undefined; this.fail('MISSING'); }
        return this.assertRow(token, response.result[0], code);
    },
    /** Reuses the canonical safe-query parser and adds immutable enterprise predicates outside caller expressions. */
    searchAdmitted: async function (token, payload) {
        this.object(payload, ['query']);
        this.object(payload.query || {}, ['search', 'pageNumber', 'pageSize', 'sort', 'filters']);
        const { request, scope, storage } = this.admitted(token), descriptor = this.descriptor(request);
        const input = SERVICE.DefaultSchemaSafeQueryService.buildSearchInput(payload.query || {}, descriptor);
        const max = this.policy().maximumPageNumber;
        if (!Number.isSafeInteger(max) || max < 1 || input.pageNumber > max) this.fail('INPUT');
        const response = await storage.service.get({ ...this.local(token),
            query: { $and: [{ tenant: scope.tenant, enterpriseCode: scope.enterpriseCode }, input.query] },
            searchOptions: { ...input.searchOptions, projection: undefined } });
        this.admitted(token);
        this.envelope(response, 'SUC_FIND_00000');
        if (!Array.isArray(response?.result) || response.result.length > input.pageSize || !Number.isSafeInteger(response.count) ||
            response.count < response.result.length || new Set(response.result.map(row => row?.code)).size !== response.result.length) this.fail('CONFLICT');
        return { records: response.result.map(row => this.project(this.assertRow(token, row))), totalCount: response.count,
            pageNumber: input.pageNumber, pageSize: input.pageSize, sort: input.sort };
    },
    /** Validates ordinary fields against the effective schema; scope, lifecycle seals and archive remain owner-managed. */
    writableModel: function (input, creating) {
        const schema = this.schema(), allowed = schema.backoffice.businessAuthoring.writableFields;
        this.object(input, allowed);
        const limit = this.policy().maximumTextLength;
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 4000) this.fail('STORAGE');
        const model = {};
        for (const [name, value] of Object.entries(input)) {
            if (['tenant', 'enterpriseCode', 'revision', 'versionId', 'publicationReferences', 'listingAuthoring',
                'createdBy', 'updatedBy', 'ownerId', 'ownerType', 'accessGroups', '_id'].includes(name) ||
                name.startsWith('$') || name.includes('.') || typeof value !== 'string' || !value.trim() ||
                value.length > limit || /[\u0000-\u001f\u007f]/.test(value) ||
                !schema.definition[name] || (schema.definition[name].enum && !schema.definition[name].enum.includes(value))) this.fail('INPUT');
            if (name === 'status' && !['DRAFT', 'ACTIVE'].includes(value)) this.fail('INPUT');
            model[name] = value.trim();
        }
        if (creating) {
            this.code(model.code); this.code(model.catalogVersion);
            if (!model.name) this.fail('INPUT');
            model.status ||= 'DRAFT';
        } else if (!Object.keys(model).length) this.fail('INPUT');
        return model;
    },
    /** Creates version zero or appends exactly one scoped successor; no upsert, delete, publication or automatic retry. */
    writeAdmitted: async function (token, payload) {
        const { operation, scope, storage } = this.admitted(token);
        if (operation === 'create') {
            const model = this.writableModel(payload, true);
            if (await this.loadRoot(token, model.code, true)) this.fail('CONFLICT');
            const response = await storage.service.save({ ...this.local(token), query: { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, code: model.code },
                model: { ...model, tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, revision: 0, versionId: 0,
                    createdBy: scope.principal, updatedBy: scope.principal } });
            this.admitted(token);
            const acknowledged = this.assertRow(token, this.assertOutcome(this.envelope(response, 'SUC_SAVE_00000')), model.code);
            if (acknowledged.versionId !== 0 || acknowledged.revision !== 0 ||
                acknowledged.createdBy !== scope.principal || acknowledged.updatedBy !== scope.principal ||
                Object.entries(model).some(([name, value]) => acknowledged[name] !== value)) this.fail('CONFLICT');
            const saved = await this.loadRoot(token, model.code);
            if (saved.versionId !== 0 || saved.revision !== 0 || saved.createdBy !== scope.principal || saved.updatedBy !== scope.principal ||
                !isDeepStrictEqual(this.project(saved), this.project(acknowledged))) this.fail('CONFLICT');
            return this.project(saved);
        }
        this.object(payload, operation === 'archive' ? ['actionId', 'identity', 'model', 'idempotencyKey'] : ['query', 'model', 'options']);
        const selected = operation === 'archive' ? payload.identity : payload.query;
        this.object(selected, ['code', 'versionId']); this.code(selected.code);
        if (!Number.isSafeInteger(selected.versionId) || selected.versionId < 0 || selected.versionId === Number.MAX_SAFE_INTEGER) this.fail('INPUT');
        if (operation === 'archive' && payload.actionId !== 'archiveProduct') this.fail('INPUT');
        if (operation === 'archive' && payload.idempotencyKey !== undefined &&
            (typeof payload.idempotencyKey !== 'string' || !payload.idempotencyKey || payload.idempotencyKey.length > 256)) this.fail('INPUT');
        if (payload.options !== undefined) {
            this.object(payload.options, ['recursive', 'returnModified']);
            if (payload.options.recursive !== false || payload.options.returnModified !== true) this.fail('INPUT');
        }
        const model = operation === 'archive' ? { status: 'ARCHIVED' } : this.writableModel(payload.model, false);
        const current = await this.loadRoot(token, selected.code);
        if (current.versionId !== selected.versionId || current.revision === Number.MAX_SAFE_INTEGER ||
            current.status === 'ARCHIVED' || current.listingAuthoring !== undefined ||
            (model.code !== undefined && model.code !== current.code) ||
            (model.catalogVersion !== undefined && model.catalogVersion !== current.catalogVersion)) this.fail('CONFLICT');
        // Lifecycle UI sends a row echo; it never becomes the archive write model or authority.
        if (operation === 'archive' && payload.model !== undefined && !isDeepStrictEqual(payload.model, this.project(current))) this.fail('INPUT');
        const response = await storage.service.update({ ...this.local(token), query: { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode,
            code: current.code, versionId: current.versionId, revision: current.revision },
            model: { ...model, revision: current.revision + 1, updatedBy: scope.principal } });
        this.admitted(token);
        const acknowledged = this.assertOutcome(this.envelope(response, 'SUC_UPD_00000'));
        if (acknowledged.acknowledged !== true || acknowledged.insertedCount !== 1) this.fail('CONFLICT');
        const saved = await this.loadRoot(token, current.code);
        if (saved.versionId !== current.versionId + 1 || saved.revision !== current.revision + 1 ||
            saved.updatedBy !== scope.principal || saved.catalogVersion !== current.catalogVersion ||
            !isDeepStrictEqual(this.project(saved), this.project({ ...current, ...model,
                versionId: current.versionId + 1, revision: current.revision + 1 }))) this.fail('CONFLICT');
        return this.project(saved);
    },
};
