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
        this.object(input, creating && input?.couponOffer ? [...this.writableFields(), 'couponOffer', 'actions', 'conditions', 'vendorEnterpriseRef', 'budget'] : this.writableFields());
        const model = {};
        for (const [name, value] of Object.entries(input)) {
            if (name === "code") model.code = this.code(value);
            else if (name === 'couponOffer') model.couponOffer = SERVICE.DefaultCouponOfferService.validate(value);
            else if (name === 'budget') {
                this.object(value, ['limit']);
                if (typeof value.limit !== 'string' || !/^\d+(?:\.\d+)?$/.test(value.limit) || value.limit.length > 128) this.fail();
                model.budget = { limit: value.limit };
            }
            else if (name === 'vendorEnterpriseRef') {
                this.object(value, ['moduleName', 'schemaName', 'code']);
                if (value.moduleName !== 'profile' || value.schemaName !== 'enterprise' ||
                    typeof value.code !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(value.code)) this.fail();
                model.vendorEnterpriseRef = { moduleName: 'profile', schemaName: 'enterprise', code: value.code };
            }
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
    /** Uses the same bounded draft grammar for ordinary and proven administrative commands. */
    draftCommand: function (operation, input) {
        if (!["create", "update"].includes(operation)) this.fail();
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
        return command;
    },
    /** Detaches a validated command and pins original scope, effective schema and provider ports across awaits. */
    execute: async function (request, operation, input) {
        const scope = this.scope(request), storage = this.storage(scope), token = {};
        const command = this.draftCommand(operation, input);
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
    /** Advanced lifecycle authority remains separate from ordinary draft editing. */
    lifecycleScope: function (request, action = request.actionCode) {
        const scope = SERVICE.DefaultPromotionBusinessWorkbenchService.context(request);
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        if (!security.isPermissionGranted(action === 'APPROVE' ? 'commerce.promotion.approve' : 'commerce.promotion.manage',
            security.getGrantedPermissions({ tenant: scope.tenant, authData: request.authData }), {})) this.fail();
        return scope;
    },
    /** Uses existing lifecycle actions with explicit current-version/revision preconditions. */
    transition: async function (request) {
        const scope = this.lifecycleScope(request), storage = this.storage(scope), token = {};
        const command = this.transitionCommand(request.actionCode, request.promotionCode, request.payload || {});
        admissions.set(token, { request, scope, storage, lifecycle: true, action: command.action, schema: structuredClone(storage.schema),
            role: structuredClone(CONFIG.get('runtimeRole')), publication: structuredClone(SERVICE.DefaultPromotionPublicationService.publicationSettings()) });
        try { return { promotion: await this.write(token, 'transition', command), actionCode: command.action }; }
        finally { admissions.delete(token); }
    },
    /** Keeps version/revision, reason and lifecycle validation common to both transports. */
    transitionCommand: function (action, code, input) {
        this.object(input, ['expectedVersionId', 'expectedRevision', 'reasonCode']);
        if (!['SUBMIT', 'APPROVE', 'SCHEDULE', 'SUSPEND', 'ARCHIVE'].includes(action) ||
            ![input.expectedVersionId, input.expectedRevision].every(n => Number.isSafeInteger(n) && n >= 0 && n < Number.MAX_SAFE_INTEGER) ||
            typeof input.reasonCode !== 'string' || !input.reasonCode.trim() || input.reasonCode.length > 512) this.fail();
        return { query: { code: this.code(code), versionId: input.expectedVersionId,
            revision: input.expectedRevision }, model: {}, action, reason: input.reasonCode };
    },
    /** Exact issuer authoring with native Profile proof; never alters signed scope or grants approval/publication. */
    administrativeAuthoring: async function (request, operation) {
        const administrative = await SERVICE.DefaultPromotionAdministrativeReviewService.context(request, false, false, operation);
        if (!administrative.authoring) this.fail();
        const scope = administrative.scope(), storage = this.storage(scope), token = {};
        const input = administrative.input.command;
        let command, writeOperation = operation;
        if (['create', 'update'].includes(operation)) command = this.draftCommand(operation, input);
        else if (operation === 'read') this.code(input.code);
        else {
            const { code, ...preconditions } = input;
            command = this.transitionCommand(operation.toUpperCase(), code, preconditions);
            writeOperation = 'transition';
        }
        admissions.set(token, { request, scope, storage, administrative, lifecycle: writeOperation === 'transition',
            action: command?.action, schema: structuredClone(storage.schema),
            role: structuredClone(CONFIG.get('runtimeRole')), publication: structuredClone(SERVICE.DefaultPromotionPublicationService.publicationSettings()) });
        try {
            let promotion;
            if (operation === 'read') {
                const current = await this.load(token, input.code);
                await administrative.revalidate();
                this.admitted(token);
                promotion = { ...this.project(current), ...structuredClone(Object.fromEntries(
                    ['actions', 'conditions', 'couponOffer', 'budget', 'issuerEnterpriseRef', 'vendorEnterpriseRef', 'approval']
                        .filter(key => current[key] !== undefined).map(key => [key, current[key]]))) };
            } else promotion = await this.write(token, writeOperation, command);
            return { issuerEnterpriseCode: scope.enterpriseCode, promotion, audit: structuredClone(administrative.audit) };
        }
        finally { admissions.delete(token); }
    },
    /** Reviews or approves an explicit issuer through fresh native Profile authority and the same versioned writer. */
    administrativeReview: async function (request, approving = false) {
        const administrative = await SERVICE.DefaultPromotionAdministrativeReviewService.context(request, approving);
        const scope = administrative.scope(), storage = this.storage(scope), token = {};
        const input = administrative.input;
        if (approving && (![input.expectedVersionId, input.expectedRevision].every(n => Number.isSafeInteger(n) && n >= 0 && n < Number.MAX_SAFE_INTEGER) ||
            typeof input.reasonCode !== 'string' || !input.reasonCode.trim() || input.reasonCode.length > 512)) this.fail();
        admissions.set(token, { request, scope, storage, administrative, lifecycle: true, action: 'APPROVE',
            schema: structuredClone(storage.schema), role: structuredClone(CONFIG.get('runtimeRole')),
            publication: structuredClone(SERVICE.DefaultPromotionPublicationService.publicationSettings()) });
        try {
            if (approving) return { promotion: await this.write(token, 'transition', { query: { code: administrative.code,
                versionId: input.expectedVersionId, revision: input.expectedRevision }, model: {}, action: 'APPROVE', reason: input.reasonCode }) };
            const current = await this.load(token, administrative.code);
            await administrative.revalidate();
            this.admitted(token);
            let available = false;
            try {
                if (current.budgetAdmission === undefined && current.sellerAuthorizations === undefined) {
                    this.lifecycleModel(current, { action: 'APPROVE', query: { revision: current.revision }, reason: 'Review' }, scope);
                    available = true;
                }
            } catch (_) { /* The native administrator still obeys existing approval policy. */ }
            return { ...this.project(current), issuerEnterpriseCode: scope.enterpriseCode,
                ...structuredClone(Object.fromEntries(['actions','conditions','couponOffer','budget','issuerEnterpriseRef','vendorEnterpriseRef']
                    .filter(k => current[k] !== undefined).map(k => [k, current[k]]))),
                approval: structuredClone(Object.fromEntries(['submittedBy','submittedAt','approvedBy','approvedAt','lastAction','lastActionBy','lastActionAt','reasonCode','administrativeReview']
                    .filter(k => current.approval?.[k] !== undefined).map(k => [k, current.approval[k]]))),
                lifecycleActions: available ? [{ actionCode: 'APPROVE', labelKey: 'approve', method: 'POST',
                    route: '/promotions/' + encodeURIComponent(current.code) + '/administrative-approve',
                    issuerEnterpriseCode: scope.enterpriseCode, expectedVersionId: current.versionId, expectedRevision: current.revision }] : [] };
        } finally { admissions.delete(token); }
    },
    /** Advertises only currently executable owner actions; clients never choose status or bypass command checks. */
    describeLifecycle: function (request, current) {
        const result = [];
        for (const action of ['SUBMIT', 'APPROVE', 'SCHEDULE', 'SUSPEND', 'ARCHIVE']) {
            try {
                const scope = this.lifecycleScope(request, action);
                this.storage(scope);
                if (current.enterpriseCode !== scope.enterpriseCode || current.tenant !== scope.tenant ||
                    current.budgetAdmission !== undefined || current.sellerAuthorizations !== undefined ||
                    !Number.isSafeInteger(current.versionId) || current.versionId < 0 || current.versionId === Number.MAX_SAFE_INTEGER) continue;
                this.lifecycleModel(current, {action, query:{revision:current.revision}, reason:'Availability'}, scope);
                result.push({actionCode:action, labelKey:action.toLowerCase(), method:'POST',
                    route:'/promotions/' + encodeURIComponent(current.code) + '/' + action.toLowerCase(),
                    expectedVersionId:current.versionId, expectedRevision:current.revision});
            } catch (_) { /* Unqualified authority or source remains non-actionable. */ }
        }
        return result;
    },
    /** Builds only reviewed lifecycle metadata; never changes immutable terms or operational balances. */
    lifecycleModel: function (current, command, scope) {
        if (current.couponOffer !== undefined) SERVICE.DefaultCouponOfferService.validate(current.couponOffer);
        if (current.couponOffer && !current.budget || current.budget && (Object.keys(current.budget).some(k => k !== 'limit') ||
            typeof current.budget.limit !== 'string' || !/^\d+(?:\.\d+)?$/.test(current.budget.limit)) ||
            !Number.isSafeInteger(current.revision) || current.revision < 0 || current.revision === Number.MAX_SAFE_INTEGER ||
            current.revision !== command.query.revision) this.fail();
        const now = new Date(), timestamp = now.toISOString();
        const expiry = current.couponOffer?.expiry;
        if (!['SUSPEND','ARCHIVE'].includes(command.action) && (current.validTo && new Date(current.validTo) <= now ||
            expiry?.mode === 'FIXED' && new Date(expiry.at) <= now)) this.fail();
        const operation = SERVICE.DefaultPromotionOperationService;
        const status = operation.lifecycleTargetStatus(current, command.action, now);
        const approval = { ...current.approval, lastAction: command.action, lastActionBy: scope.actorId,
            lastActionAt: timestamp, reasonCode: command.reason };
        operation.assertLifecycleApproval(current, command.action, scope.actorId);
        if (command.action === 'SUBMIT') {
            approval.submittedBy = scope.actorId; approval.submittedAt = timestamp;
        } else if (command.action === 'APPROVE') {
            approval.approvedBy = scope.actorId; approval.approvedAt = timestamp;
        }
        return { status, active: status === 'ACTIVE', approval };
    },
    /** A copied flag or token cannot mint owner persistence authority. */
    admitted: function (token) {
        const context = admissions.get(token);
        if (!context || !isDeepStrictEqual(context.administrative ? context.administrative.scope() :
            context.lifecycle ? this.lifecycleScope(context.request, context.action) : this.scope(context.request), context.scope) ||
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
        const { scope, storage, administrative } = this.admitted(token), creating = operation === "create";
        const code = creating ? command.model.code : command.query.code;
        const current = await this.load(token, code, creating);
        if (creating ? !!current : operation !== 'transition' && current.status !== "DRAFT" || current.versionId !== command.query.versionId ||
            current.revision === Number.MAX_SAFE_INTEGER || current.budgetAdmission !== undefined || current.sellerAuthorizations !== undefined ||
            command.model.code !== undefined && command.model.code !== code) this.fail();
        if (operation === 'transition') command.model = this.lifecycleModel(current, command, scope);
        if (administrative) command.model.approval = { ...current?.approval, ...command.model.approval,
            [administrative.authoring ? 'administrativeAuthoring' : 'administrativeReview']: structuredClone(administrative.audit) };
        const model = creating ? { ...command.model, tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, status: "DRAFT",
            active: false, conditions: command.model.conditions || {}, actions: command.model.actions || {}, priority: command.model.priority ?? 0,
            ...(command.model.couponOffer ? { enterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: scope.enterpriseCode },
                issuerEnterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: scope.enterpriseCode },
                vendorEnterpriseRef: command.model.vendorEnterpriseRef || { moduleName: 'profile', schemaName: 'enterprise', code: scope.enterpriseCode } } : {}),
            versionId: 0, revision: 0, createdBy: scope.actorId, updatedBy: scope.actorId } :
            { ...command.model, revision: current.revision + 1, updatedBy: scope.actorId };
        const expected = structuredClone({ ...current, ...model, versionId: creating ? 0 : current.versionId + 1 });
        if (expected.validFrom && expected.validTo && new Date(expected.validFrom) >= new Date(expected.validTo)) this.fail();
        const query = { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, code,
            ...(creating ? {} : { versionId: current.versionId, revision: current.revision, status: current.status }) };
        const writeRequest = { ...this.local(token), query, model };
        if (creating) {
            writeRequest.schemaModel = storage.model;
            await new Promise((resolve, reject) => SERVICE.DefaultModelSaveInitializerService.applyDefaultValues(writeRequest, {}, {
                nextSuccess: resolve, error: (_request, _response, error) => reject(error),
            }));
        }
        // A vendor selection is a business reference, never a grant or a change of issuer scope.
        if (creating && command.model.vendorEnterpriseRef) {
            await SERVICE.DefaultCouponSellerAuthorizationService.activeEnterprise(
                { tenant: scope.tenant }, command.model.vendorEnterpriseRef.code);
            this.admitted(token);
        }
        if (administrative) { await administrative.revalidate(); this.admitted(token); }
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
