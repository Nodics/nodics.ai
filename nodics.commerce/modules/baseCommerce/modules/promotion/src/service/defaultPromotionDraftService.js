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
const admissions = new WeakMap();
const draftWrites = new WeakMap();
/** @module promotion/service/defaultPromotionDraftService @description Owns ordinary scoped draft metadata commands over qualified CURRENT versioned persistence. No policy, financial, issuance or publication authority. @layer service @owner promotion */
module.exports = {
    /** Supplies the authorized original root only to the exact generated write's immutable-offer hook. */
    couponOfferWriteState: function (request) {
        const context = draftWrites.get(request);
        if (!context) return undefined;
        this.admitted(context.token);
        if (!isDeepStrictEqual(request.model, context.model) || !isDeepStrictEqual(request.query, context.query)) this.fail();
        return { current: structuredClone(context.current) };
    },
    /** Refuses ambiguous authority or persistence evidence; a failed response never becomes a local model. */
    fail: function () { throw new CLASSES.NodicsError("ERR_PROMOTION_DRAFT_UNCONFIRMED"); },
    /** Requires original signed employee scope and the distinct ordinary draft grant. */
    scope: function (request) {
        const scope = SERVICE.DefaultPromotionBusinessWorkbenchService.context(request);
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!security.isPermissionGranted("commerce.promotion.draft.write",
            security.getGrantedPermissions({ tenant: scope.tenant, authData: request.authData }), {})) this.fail();
        return scope;
    },
    /** Qualifies existing source storage without enabling versioning or borrowing publication permissions. */
    storage: function (scope) {
        const schema = NODICS.getModule("promotion")?.rawSchema?.promotion;
        const model = NODICS.getModels("promotion", scope.tenant)?.[UTILS.createModelName("promotion")];
        const service = SERVICE.DefaultPromotionService, publication = SERVICE.DefaultPromotionPublicationService;
        if (!schema || NODICS.isModuleActive?.("promotion") === false || CONFIG.get("runtimeRole")?.publication !== "STAGED" ||
            Array.isArray(schema.backoffice?.operations) && ["create", "update"].some(name => !schema.backoffice.operations.includes(name)) ||
            !SERVICE.DefaultSchemaAuthoringPolicyService?.describe(schema).authoringAllowed ||
            !publication?.requireSource || !publication.validateSourceAuthoring ||
            !model || model.versioned !== true || model.primaryKey !== "code" || model.rawSchema?.versionedReadMode !== "CURRENT" ||
            ["getCurrentVersionItems", "saveVersionedItems", "updateVersionedItems"].some(name => typeof model[name] !== "function") ||
            ["get", "save", "update"].some(name => typeof service?.[name] !== "function") ||
            SERVICE.DefaultModelSaveInitializerService?.resolveSaveMethod?.({ schemaModel: model }) !== "saveVersionedItems" ||
            SERVICE.DefaultModelsUpdateInitializerService?.resolveUpdateMethod?.({ schemaModel: model }) !== "updateVersionedItems" ||
            SERVICE.DefaultModelsGetInitializerService?.resolveReadMethod?.({ schemaModel: model, query: {} }) !== "getCurrentVersionItems") this.fail();
        publication.requireSource();
        publication.validateSourceAuthoring({ tenant: scope.tenant, schemaModel: model });
        return { schema, model, service, get: service.get, save: service.save, update: service.update,
            current: model.getCurrentVersionItems, insert: model.saveVersionedItems, append: model.updateVersionedItems };
    },
    /** Discovery fails closed to browsing when the deployment or caller cannot author drafts. */
    available: function (request) {
        try { this.storage(this.scope(request)); return true; } catch (_) { return false; }
    },
    /** Allows bounded ordinary metadata only; scope, policy, financial and lifecycle fields are never inputs. */
    writableFields: function () { return ["code", "name", "priority", "validFrom", "validTo"]; },
    /** Rejects operators, extra fields, prototypes and accessors before cloning input. */
    object: function (value, allowed) {
        if (!value || Object.getPrototypeOf(value) !== Object.prototype || Reflect.ownKeys(value).some(key =>
            typeof key !== "string" || !allowed.includes(key) || !Object.getOwnPropertyDescriptor(value, key)?.enumerable ||
            !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), "value"))) this.fail();
        return value;
    },
    /** Validates an exact campaign identity rather than a query expression. */
    code: function (value) {
        if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value)) this.fail();
        return value;
    },
    /** Normalizes only fields exposed by the owner form. */
    model: function (input, creating) {
        this.object(input, creating && input?.couponOffer ? [...this.writableFields(), 'couponOffer', 'actions', 'conditions'] : this.writableFields());
        const model = {};
        for (const [name, value] of Object.entries(input)) {
            if (name === "code") model.code = this.code(value);
            else if (name === 'couponOffer') model.couponOffer = SERVICE.DefaultCouponOfferService.validate(value);
            else if (['actions', 'conditions'].includes(name)) {
                if (!value || Object.getPrototypeOf(value) !== Object.prototype ||
                    Buffer.byteLength(JSON.stringify(value)) > SERVICE.DefaultCouponOfferService.settings().maximumPolicyBytes) this.fail();
                model[name] = structuredClone(value);
            }
            else if (name === "name") {
                if (typeof value !== "string" || !value.trim() || value.length > 256 || /[\u0000-\u001f\u007f]/.test(value)) this.fail();
                model.name = value.trim();
            } else if (name === "priority") {
                if (!Number.isSafeInteger(value) || value < 0 || value > 1000000) this.fail();
                model.priority = value;
            } else {
                if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || value.length > 40 ||
                    !Number.isFinite(Date.parse(value))) this.fail();
                model[name] = new Date(value);
            }
        }
        if (creating && (!model.code || !model.name) || !Object.keys(model).length) this.fail();
        return model;
    },
    /** Detaches a validated command and pins original scope, effective schema and provider ports across awaits. */
    execute: async function (request, operation, input) {
        if (!["create", "update"].includes(operation)) this.fail();
        const scope = this.scope(request), storage = this.storage(scope), token = {};
        let command;
        if (operation === "create") command = { model: this.model(input, true) };
        else {
            this.object(input, ["query", "model", "options"]);
            this.object(input.query, ["code", "versionId"]);
            this.code(input.query.code);
            if (!Number.isSafeInteger(input.query.versionId) || input.query.versionId < 0 || input.query.versionId === Number.MAX_SAFE_INTEGER) this.fail();
            if (input.options !== undefined) {
                this.object(input.options, ["recursive", "returnModified"]);
                if (input.options.recursive !== false || input.options.returnModified !== true) this.fail();
            }
            command = { query: { ...input.query }, model: this.model(input.model, false) };
        }
        if (request.promotionCode !== undefined && request.promotionCode !== (command.query?.code || command.model.code)) this.fail();
        if (command.model.couponOffer) {
            const security = SERVICE.DefaultSecuredRequestPipelineService;
            if (!command.model.actions || !command.model.conditions || !security.isPermissionGranted('commerce.promotion.manage',
                security.getGrantedPermissions({ tenant: scope.tenant, authData: request.authData }), {})) this.fail();
        }
        admissions.set(token, { request, scope, storage, schema: structuredClone(storage.schema),
            role: structuredClone(CONFIG.get("runtimeRole")), publication: structuredClone(SERVICE.DefaultPromotionPublicationService.publicationSettings()) });
        try { return await this.write(token, operation, command); } finally { admissions.delete(token); }
    },
    /** A copied flag or token cannot mint owner persistence authority. */
    admitted: function (token) {
        const context = admissions.get(token);
        if (!context || !isDeepStrictEqual(this.scope(context.request), context.scope) ||
            !isDeepStrictEqual(CONFIG.get("runtimeRole"), context.role) ||
            !isDeepStrictEqual(SERVICE.DefaultPromotionPublicationService.publicationSettings(), context.publication) ||
            !isDeepStrictEqual(context.storage.schema, context.schema) ||
            Object.entries(this.storage(context.scope)).some(([key, value]) => context.storage[key] !== value)) this.fail();
        return context;
    },
    /** Uses canonical local authority only inside the privately admitted fixed command. */
    local: function (token) {
        const { scope } = this.admitted(token);
        return { tenant: scope.tenant, authData: SERVICE.DefaultPromotionBusinessWorkbenchService.persistenceAuth(),
            options: { recursive: false, skipItemCache: true } };
    },
    /** Checks explicit failure markers even alongside a nominal success code. */
    outcome: function (value) {
        if (!value || Object.getPrototypeOf(value) !== Object.prototype || value.error ||
            value.success !== undefined && value.success !== true || value.acknowledged !== undefined && value.acknowledged !== true ||
            value.errors !== undefined && value.errors !== null && (!Array.isArray(value.errors) || value.errors.length)) this.fail();
        return value;
    },
    /** Requires the exact generated operation envelope. */
    envelope: function (response, code) {
        this.outcome(response);
        if (response.code !== code || !Object.hasOwn(response, "result")) this.fail();
        return response.result;
    },
    /** Validates returned identity independently of provider filters. */
    row: function (token, row, code) {
        const { scope } = this.admitted(token);
        this.outcome(row);
        if (row.code !== code || row.tenant !== scope.tenant || row.enterpriseCode !== scope.enterpriseCode ||
            [row.entCode, row.issuerEnterpriseCode, row.enterpriseRef?.code, row.issuerEnterpriseRef?.code]
                .some(value => value !== undefined && value !== scope.enterpriseCode) ||
            !Number.isSafeInteger(row.versionId) || row.versionId < 0 || !Number.isSafeInteger(row.revision) || row.revision < 0) this.fail();
        this.project(row);
        return row;
    },
    /** Reads exactly one current scoped root, never a history fallback or an unscoped dependency. */
    load: async function (token, code, optional = false) {
        const { scope, storage } = this.admitted(token);
        const response = await storage.service.get({ ...this.local(token),
            query: { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, code }, searchOptions: { pageSize: 2, pageNumber: 1 } });
        this.admitted(token);
        const rows = this.envelope(response, "SUC_FIND_00000");
        if (!Array.isArray(rows) || rows.length > 1 || !Number.isSafeInteger(response.count) || response.count !== rows.length) this.fail();
        if (!rows.length) { if (optional) return undefined; this.fail(); }
        return structuredClone(this.row(token, rows[0], code));
    },
    /** Returns ordinary fields only, with the version needed for the next explicit edit. */
    project: function (row) {
        return SERVICE.DefaultPromotionBusinessWorkbenchService.project(row);
    },
    /** Appends one draft version, with exact acknowledgement and current readback; never upserts or retries. */
    write: async function (token, operation, command) {
        const { scope, storage } = this.admitted(token), creating = operation === "create";
        const code = creating ? command.model.code : command.query.code;
        const current = await this.load(token, code, creating);
        if (creating ? !!current : current.status !== "DRAFT" || current.versionId !== command.query.versionId ||
            current.revision === Number.MAX_SAFE_INTEGER || current.budgetAdmission !== undefined || current.sellerAuthorizations !== undefined ||
            command.model.code !== undefined && command.model.code !== code) this.fail();
        const model = creating ? { ...command.model, tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, status: "DRAFT",
            active: false, conditions: command.model.conditions || {}, actions: command.model.actions || {}, priority: command.model.priority ?? 0,
            ...(command.model.couponOffer ? { issuerEnterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: scope.enterpriseCode },
                vendorEnterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: scope.enterpriseCode } } : {}),
            versionId: 0, revision: 0, createdBy: scope.actorId, updatedBy: scope.actorId } :
            { ...command.model, revision: current.revision + 1, updatedBy: scope.actorId };
        const expected = structuredClone({ ...current, ...model, versionId: creating ? 0 : current.versionId + 1 });
        if (expected.validFrom && expected.validTo && new Date(expected.validFrom) >= new Date(expected.validTo)) this.fail();
        const query = { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, code,
            ...(creating ? {} : { versionId: current.versionId, revision: current.revision, status: "DRAFT" }) };
        const writeRequest = { ...this.local(token), query, model };
        if (creating) {
            writeRequest.schemaModel = storage.model;
            await new Promise((resolve, reject) => SERVICE.DefaultModelSaveInitializerService.applyDefaultValues(writeRequest, {}, {
                nextSuccess: resolve, error: (_request, _response, error) => reject(error),
            }));
        }
        draftWrites.set(writeRequest, { token, current: structuredClone(current), query: structuredClone(query), model: structuredClone(model) });
        let response;
        try { response = await storage.service[creating ? "save" : "update"](writeRequest); }
        finally { draftWrites.delete(writeRequest); }
        this.admitted(token);
        const result = this.outcome(this.envelope(response, creating ? "SUC_SAVE_00000" : "SUC_UPD_00000"));
        if (creating) {
            this.row(token, result, code);
            if (Object.entries(expected).some(([key, value]) => !isDeepStrictEqual(result[key], value))) this.fail();
        } else if (result.acknowledged !== true || result.insertedCount !== 1) this.fail();
        const saved = await this.load(token, code);
        // Every prior non-storage field must survive unchanged, including private policy and financial state.
        for (const [key, value] of Object.entries(expected)) {
            if (!["_id", "updated"].includes(key) && !isDeepStrictEqual(saved[key], value)) this.fail();
        }
        // Newly injected private fields are also failures, not just changes to fields already present.
        for (const key of Object.keys(storage.schema.definition)) {
            if (!["_id", "created", "updated", "accessGroups"].includes(key) && !isDeepStrictEqual(saved[key], expected[key])) this.fail();
        }
        return this.project(saved);
    },
};
