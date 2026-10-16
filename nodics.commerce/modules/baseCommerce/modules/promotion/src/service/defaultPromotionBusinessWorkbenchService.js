/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/** @module promotion/service/defaultPromotionBusinessWorkbenchService @description Exposes fixed campaign discovery and safe search with separately qualified owner draft commands, without generic schema grants or financial/coupon evidence. @layer service @owner promotion */
module.exports = {
    /** Refuses unconfirmed scope, descriptor or provider evidence without returning private data. */
    fail: function () { throw new CLASSES.NodicsError("ERR_PROMOTION_WORKBENCH_UNCONFIRMED"); },
    /** Captures original signed employee authority; headers and browser selectors never grant scope. */
    context: function (request) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        const tenant = auth.tenant ?? auth.tenantCode, enterpriseCode = auth.entCode ?? auth.enterpriseCode;
        const actorId = auth.principalId || auth.userId || auth.loginId || auth.code;
        const sources = [auth, request, request.auth, request.payload, request.payload?.query, request.query,
            request.httpRequest?.body, request.httpRequest?.body?.query, request.httpRequest?.query];
        const tenants = sources.flatMap(value => [value?.tenant, value?.tenantCode]);
        const enterprises = sources.flatMap(value => [value?.entCode, value?.enterpriseCode]);
        for (const [key, value] of Object.entries(request.httpRequest?.headers || {})) {
            if (["x-enterprise-code", "entcode", "enterprisecode"].includes(key.toLowerCase())) enterprises.push(value);
            if (["x-tenant-code", "tenant", "tenantcode"].includes(key.toLowerCase())) tenants.push(value);
        }
        if (auth.principalType !== "human" || auth.tokenType !== "access" || auth.isSystem || auth.runtimeScope ||
            typeof actorId !== "string" || !actorId ||
            [tenant, enterpriseCode].some(value => typeof value !== "string" || !/^[A-Za-z0-9_.:@-]{1,128}$/.test(value)) ||
            tenants.some(value => value !== undefined && value !== tenant) ||
            enterprises.some(value => value !== undefined && value !== enterpriseCode) ||
            sources.some(value => [value?.schemaName, value?.moduleName].some(name => name !== undefined && name !== "promotion")) ||
            request.actorId !== undefined && request.actorId !== actorId ||
            request.transactionContext !== undefined || request.internalPersistence !== undefined ||
            !security?.hasAccessGroup || !security.getGrantedPermissions || !security.isPermissionGranted ||
            !security.hasAccessGroup({ tenant, authData: auth, router: { accessGroups: ["employeeUserGroup"] } }) ||
            !security.isPermissionGranted("commerce.promotion.read", security.getGrantedPermissions({ tenant, authData: auth }), {})) this.fail();
        return { tenant, enterpriseCode, actorId, authData: structuredClone(auth) };
    },
    /** Uses the existing local persistence authority only after original business admission. */
    persistenceAuth: function () {
        const identity = SERVICE.DefaultIdentityGovernanceService;
        if (!identity?.getSystemAuthData) this.fail();
        return identity.getSystemAuthData();
    },
    /** Defines the ordinary campaign projection, never nested policy, financial, consent or coupon fields. Later layers may narrow this projection. */
    fields: function () {
        return ["code", "name", "status", "priority", "validFrom", "validTo", "revision", "versionId"];
    },
    /** Shares a scalar-only projection between browsing and draft responses, independently of provider field shapes. */
    project: function (row, fields = this.fields()) {
        const allowed = this.fields();
        if (!row || Object.getPrototypeOf(row) !== Object.prototype || !Array.isArray(fields) ||
            fields.some(name => !allowed.includes(name))) this.fail();
        return Object.fromEntries(fields.filter(name => Object.hasOwn(row, name)).map(name => {
            const property = Object.getOwnPropertyDescriptor(row, name);
            if (!Object.hasOwn(property, "value")) this.fail();
            const value = property.value;
            if (value === null || ["string", "boolean"].includes(typeof value) ||
                typeof value === "number" && Number.isFinite(value)) return [name, value];
            if (["validFrom", "validTo"].includes(name) && value instanceof Date) {
                const timestamp = Date.prototype.getTime.call(value);
                if (Number.isFinite(timestamp)) return [name, new Date(timestamp)];
            }
            this.fail();
        }));
    },
    /** Derives shared metadata, replacing mutation paths only with independently qualified owner commands. */
    descriptor: function (request) {
        const context = this.context(request), utility = SERVICE.DefaultSchemaUtilityService;
        if (!utility?.resolveDescriptor || !utility.findOperationRoute) this.fail();
        const source = utility.resolveDescriptor({ tenant: context.tenant, moduleName: "promotion", authData: this.persistenceAuth() }, "promotion", "promotion");
        if (!source || source.moduleName !== "promotion" || source.schemaName !== "promotion" || !Array.isArray(source.fields)) this.fail();
        const allowed = new Set(this.fields());
        let fields = source.fields.filter(field => allowed.has(field.name) && ["string", "int", "integer", "number", "double", "float", "date", "boolean"].includes(field.type))
            .map(field => ({ ...field, readOnly: true, reference: undefined }));
        const visible = new Set(fields.map(field => field.name));
        if (!visible.has("code")) this.fail();
        const query = source.queryCapabilities;
        const sortableFields = query.sortableFields.filter(name => visible.has(name));
        const defaultSort = sortableFields.includes(query.defaultSort?.field) ? query.defaultSort : { field: "code", direction: "ASC" };
        const maximumPageSize = Math.min(query.maximumPageSize, 100);
        const allowedPageSizes = query.allowedPageSizes.filter(size => Number.isSafeInteger(size) && size > 0 && size <= maximumPageSize);
        if (!sortableFields.includes(defaultSort.field) || !allowedPageSizes.length) this.fail();
        const capabilities = utility.findOperationRoute("promotion", "DefaultPromotionBusinessWorkbenchController", "capabilities");
        const search = utility.findOperationRoute("promotion", "DefaultPromotionBusinessWorkbenchController", "search");
        if (!capabilities || capabilities.active === false || capabilities.method !== "GET" ||
            !search || search.active === false || search.method !== "POST") this.fail();
        const draft = SERVICE.DefaultPromotionDraftService, writable = draft?.available(request) === true;
        let editing = {};
        if (writable) {
            const create = utility.findOperationRoute("promotion", "DefaultPromotionBusinessWorkbenchController", "create");
            const update = utility.findOperationRoute("promotion", "DefaultPromotionBusinessWorkbenchController", "update");
            if (!create?.active || create.method !== "PUT" || !update?.active || update.method !== "PATCH") this.fail();
            const schema = NODICS.getModule("promotion").rawSchema.promotion;
            const definition = Object.fromEntries(fields.map(field => [field.name, schema.definition[field.name]]));
            definition.versionId = { type: "int", required: true };
            const config = { fields: Object.fromEntries(Object.keys(definition).map(name => [name, { readOnly: !draft.writableFields().includes(name) }])),
                form: { sections: { details: { label: "Campaign draft", fields: draft.writableFields().filter(name => definition[name]) } },
                    defaultColumns: ["code", "name", "status", "versionId"] } };
            const projected = { ...schema, definition };
            fields = utility.buildFields("promotion", projected, config);
            editing = { operations: ["search", "read", "create", "update"],
                // Existing Workbench editor shape; every write dispatches to the scoped owner, never raw CRUD.
                mutationMode: "GENERATED_CRUD", mutationPolicy: { ...utility.buildMutationPolicy(config),
                    savePath: "PROMOTION_DRAFT_OWNER_COMMAND", lifecycle: "PUBLISHABLE", publishRequired: true, deleteStrategy: "NONE" },
                authoring: { ...source.authoring, publishRequired: true, authoringAllowed: true }, form: utility.buildForm("promotion", projected, config),
                concurrency: { mode: "COMPARE_AND_SET", field: "versionId", required: true, managed: true },
                apiOperations: { capabilities, search, create, update,
                    delete: { method: "DELETE", path: "/business/promotions/drafts", apiVersion: "v0", active: false },
                    deleteImpact: { method: "POST", path: "/business/promotions/drafts", apiVersion: "v0", active: false },
                    bulk: { method: "POST", path: "/business/promotions/drafts", apiVersion: "v0", active: false } } };
        }
        return { ...source, fields, displayProperty: "code", displayProperties: ["code"],
            operations: ["search", "read"], mutationMode: "READ_ONLY", mutationPolicy: undefined,
            authoring: source.authoring ? { ...source.authoring, authoringAllowed: false } : undefined,
            relationships: [], aggregateOperations: [], form: undefined,
            bulkCapabilities: { operations: [], maximumItems: 100, idempotencyRequired: true, outcomeMode: "AUTHORITATIVE_RESULT" },
            apiOperations: { capabilities, search }, ...editing,
            queryCapabilities: { ...query, searchableFields: query.searchableFields.filter(name => visible.has(name)),
                filterFields: query.filterFields.filter(field => visible.has(field.field)), sortableFields, defaultSort,
                maximumPageSize, allowedPageSizes,
                defaultPageSize: allowedPageSizes.includes(query.defaultPageSize) ? query.defaultPageSize : allowedPageSizes[0] } };
    },
    /** Discovers only the campaign schema used by the two currently implemented ordinary pages. */
    schemas: function (request) { return { schemas: [this.descriptor(request)] }; },
    /** Searches a fixed owner service through the shared parser, preserving signed scope outside caller filters. */
    search: async function (request) {
        const context = this.context(request), descriptor = this.descriptor(request);
        const parser = SERVICE.DefaultSchemaSafeQueryService, service = SERVICE.DefaultPromotionService;
        if (!parser?.buildSearchInput || !service?.get) this.fail();
        const input = parser.buildSearchInput(request.payload || {}, descriptor);
        if (!Number.isSafeInteger((input.pageNumber - 1) * input.pageSize)) this.fail();
        const response = await service.get({ tenant: context.tenant, authData: this.persistenceAuth(),
            query: { $and: [{ tenant: context.tenant, enterpriseCode: context.enterpriseCode }, input.query] },
            options: { recursive: false, skipItemCache: true },
            searchOptions: { ...input.searchOptions, projection: { ...input.searchOptions.projection, tenant: 1, enterpriseCode: 1 } } });
        if (!isDeepStrictEqual(this.context(request), context) || !response ||
            typeof response.code !== "string" || !response.code.startsWith("SUC_") || response.error || response.success === false ||
            (Object.hasOwn(response, "acknowledged") && response.acknowledged !== true) ||
            (response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) ||
            !Array.isArray(response.result) || response.result.length > input.pageSize ||
            !Number.isSafeInteger(response.count) || response.count < response.result.length ||
            response.result.some(row => !row || typeof row !== "object" || Array.isArray(row) ||
                typeof row.code !== "string" || !row.code || row.tenant !== context.tenant || row.enterpriseCode !== context.enterpriseCode ||
                descriptor.concurrency?.managed === true && (!Number.isSafeInteger(row.versionId) || row.versionId < 0 ||
                    !Number.isSafeInteger(row.revision) || row.revision < 0)) ||
            new Set(response.result.map(row => row.code)).size !== response.result.length) this.fail();
        const records = response.result.map(row => this.project(row, descriptor.fields.map(field => field.name)));
        return { records, totalCount: response.count, pageNumber: input.pageNumber, pageSize: input.pageSize, sort: input.sort };
    },
};
