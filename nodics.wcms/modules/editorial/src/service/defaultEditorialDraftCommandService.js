/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module editorial/service/DefaultEditorialDraftCommandService
 * @description Owns ordinary Editorial draft creation, atomic copy revisions and bounded original-command inspection.
 * @layer service
 * @owner editorial
 * @override Extend existing schema/configuration and generated services; preserve original human authority, atomic revision and publication owners.
 */
const crypto = require('node:crypto');
const immutable = new Set(['code', 'contentTypeCode', 'siteCodes']);
const managed = new Set(['active', 'status', 'revision', 'workflowInstanceCode', 'decisionEvidence',
    'publicationCode', 'publicationSourceRevision', 'publicationIntent', 'lastAuthoringCommand',
    'accessGroups', 'userGroups', 'ownerType', 'ownerCode', 'ownerId', 'tenant', 'enterpriseCode']);
const editableStates = new Set(['DRAFT', 'READY', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'WITHDRAWN']);

module.exports = {
    /** Returns one stable owner error without exposing another actor's copy or authority. */
    fail: function (message, code) { throw new CLASSES.NodicsError(code || 'ERR_EDT_00001', message); },

    /** Admits original employee authority without substituting persistence credentials. */
    authorize: function (request, permission) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        const enterprise = auth.enterpriseCode || auth.entCode;
        const principal = auth.principalId || auth.loginId || auth.code;
        const valid = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
        if (CONFIG.get('editorial')?.publication?.runtimeRole !== 'STAGED' ||
            auth.principalType !== 'human' || auth.tokenType !== 'access' || auth.isSystem || auth.runtimeScope ||
            auth.type !== undefined && auth.type !== 'Employee' || !valid(auth.tenant) || auth.tenant !== request.tenant ||
            !valid(enterprise) || typeof principal !== 'string' || !principal.trim() || principal.length > 256 || /[\u0000-\u001f\u007f]/.test(principal) ||
            [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== request.tenant) ||
            [auth.entCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterprise) ||
            !/^Bearer \S+$/i.test(request.authorization || request.httpRequest?.headers?.authorization || '') ||
            !security?.isPermissionGranted || !security?.getGrantedPermissions || !security?.getEffectiveUserGroupCodes ||
            !(security.getEffectiveUserGroupCodes(auth.userGroups || []).includes('employeeUserGroup') ||
                security.hasPlatformFullAccess?.(request) === true) ||
            !security.isPermissionGranted(permission, security.getGrantedPermissions(request), {})) {
            this.fail('Editorial employee authority or Staged source scope is unavailable', 'ERR_AUTH_00003');
        }
        return crypto.createHash('sha256').update(JSON.stringify([request.tenant, enterprise,
            principal])).digest('hex');
    },

    /** Reads only the authoring envelope; transport/security fields never become command context. */
    input: function (request) {
        const input = request.editorial || {};
        if (!input || typeof input !== 'object' || Array.isArray(input)) this.fail('Editorial command is invalid');
        return input;
    },

    /** Binds an original command key to canonical submitted business values, never an access token. */
    command: function (request, operation, actor, input) {
        const commandId = SERVICE.DefaultSchemaUtilityService.getIdempotencyKey(request);
        if (!commandId || input.commandId !== undefined && input.commandId !== commandId) this.fail('An unchanged Editorial command reference is required');
        const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
            ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
        const value = Object.assign({}, input); delete value.commandId;
        const text = JSON.stringify(canonical(value));
        const maximum = CONFIG.get('editorial')?.authoring?.maximumDraftBytes;
        if (!Number.isSafeInteger(maximum) || maximum < 1 || Buffer.byteLength(text) > maximum) this.fail('Editorial draft exceeds the configured input boundary');
        return { contractVersion: 1, operation, commandId, actor,
            payloadHash: crypto.createHash('sha256').update(text).digest('hex') };
    },

    /** Keeps model identity and business revision separate from transport command identity. */
    identity: function (input) {
        const article = input.article || {};
        const code = input.articleCode || article.code;
        const revision = input.expectedRevision ?? article.revision;
        if (typeof code !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code) ||
            !Number.isSafeInteger(revision) || revision < 1 || article.code !== undefined && article.code !== code ||
            article.revision !== undefined && article.revision !== revision) this.fail('Select the saved article and its exact revision');
        return { code, revision };
    },

    /** Preserves original actor/tenant and the opaque transaction token on generated operations. */
    context: function (request) {
        return { tenant: request.tenant, authData: request.authData, options: { recursive: false },
            ...(request.transactionContext ? { transactionContext: request.transactionContext } : {}) };
    },

    /** Reads an unambiguous current root through its existing owner service. */
    root: async function (request, code, optional) {
        const response = await SERVICE.DefaultEditorialArticleService.get(Object.assign(this.context(request), {
            query: { code }, searchOptions: { limit: 2 }
        }));
        const rows = response && response.result;
        if (!/^SUC_/.test(response?.code || '') || !Array.isArray(rows) || rows.length > 1 || rows[0] && rows[0].code !== code) this.fail('Saved Editorial article evidence is invalid', 'ERR_EDT_00008');
        if (!rows[0] && !optional) this.fail('The Editorial article is unavailable', 'ERR_EDT_00003');
        return rows[0];
    },

    /** Reuses shared effective field normalization; managed lifecycle fields cannot be submitted as copy. */
    copy: function (request, model, schemaName, creating) {
        if (!model || typeof model !== 'object' || Array.isArray(model)) this.fail('Editorial copy is invalid');
        if (Object.keys(model).some(key => managed.has(key) || !creating && immutable.has(key))) this.fail('Editorial identity and governance evidence are managed by the owner');
        return SERVICE.DefaultSchemaUtilityService.buildGeneratedMutationModel(model,
            Object.assign({}, request, { moduleName: 'editorial' }), schemaName);
    },

    /** Removes private command evidence from ordinary editor snapshots. */
    articleView: function (article) {
        const value = Object.assign({}, article); delete value.lastAuthoringCommand;
        return value;
    },

    /** Checks real authorized Site/Author references without moving foreign reference reads into the copy transaction. */
    references: async function (request, model) {
        const context = { tenant: request.tenant, authData: request.authData, options: { recursive: false } };
        const enterprise = request.authData.enterpriseCode || request.authData.entCode;
        for (const [field, service, site] of [
            ['siteCodes', 'DefaultCmsSiteService', true], ['authorCodes', 'DefaultEditorialAuthorService', false]
        ]) {
            const codes = model[field];
            if (!Array.isArray(codes) || !codes.length || codes.length > 20 || new Set(codes).size !== codes.length ||
                codes.some(code => typeof code !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code)) || !SERVICE[service]?.get) {
                this.fail('Choose authorized saved websites and authors');
            }
            const response = await SERVICE[service].get(Object.assign({}, context, {
                query: Object.assign({ code: { $in: codes }, active: true }, site ? {} : { status: 'ACTIVE' }), searchOptions: { limit: 21 }
            }));
            const rows = response?.result;
            if (!/^SUC_/.test(response?.code || '') || !Array.isArray(rows) || rows.length !== codes.length ||
                rows.some(row => !codes.includes(row.code) || row.active !== true || site && row.enterpriseCode !== enterprise || !site && row.status !== 'ACTIVE')) {
                this.fail('A selected website or author is unavailable in the original scope', 'ERR_AUTH_00003');
            }
        }
    },

    /** Requires exact generated update acknowledgement inside the owning transaction. */
    update: async function (service, request, query, model) {
        const result = await SERVICE[service].update(Object.assign(this.context(request), {
            query, model, options: { recursive: false }
        }));
        if (!/^SUC_/.test(result?.code || '') || result.error || result.success === false || result.acknowledged === false ||
            result.errors?.length || SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(result) !== 1) {
            this.fail('The saved revision changed or its update could not be confirmed; inspect the article', 'ERR_EDT_00008');
        }
    },

    /** Validates an actual saved row, never substituting the submitted model for missing persistence evidence. */
    saved: function (response, code) {
        const result = response && response.result;
        const rows = Array.isArray(result) ? result : result && typeof result === 'object' ? [result] : [];
        if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false || response.acknowledged === false ||
            response.errors?.length || rows.length !== 1 || rows[0]?.code !== code) {
            this.fail('Editorial persistence did not return the saved record; inspect the original command', 'ERR_EDT_00008');
        }
        return rows[0];
    },

    /** Resolves the exact saved source/policy under the same optional atomic context. */
    source: function (request, code, revision) {
        return SERVICE.DefaultEditorialArticleAuthoringService.storedInput(Object.assign({}, request, {
            editorial: { article: { code, revision } }
        }));
    },

    /** Reads retained archived copy without treating current policy as new authoring/readiness authority. */
    archivedSource: async function (request, article) {
        this.authorize(request, 'editorial.backoffice.read');
        if (article.status !== 'ARCHIVED') this.fail('Archived inspection requires the saved archived state', 'ERR_EDT_00008');
        const maximum = CONFIG.get('editorial')?.publication?.maximumDependencies;
        if (!Number.isSafeInteger(maximum) || maximum < 1) this.fail('Editorial dependency boundary is unavailable', 'ERR_EDT_00008');
        const response = await SERVICE.DefaultEditorialArticleLocalizationService.get(Object.assign(this.context(request), {
            query: { articleCode: article.code, revision: article.revision }, searchOptions: { limit: maximum + 1 }
        }));
        const rows = response?.result, seen = new Set();
        if (!/^SUC_/.test(response?.code || '') || response.error || response.success === false || response.acknowledged === false ||
            response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length > 0) ||
            !Array.isArray(rows) || rows.length > maximum || rows.some(row => {
                if (!row || row.articleCode !== article.code || row.revision !== article.revision ||
                    typeof row.localeCode !== 'string' || !row.localeCode.trim() || seen.has(row.localeCode)) return true;
                seen.add(row.localeCode); return false;
            })) this.fail('Archived Editorial copy could not be confirmed for this revision', 'ERR_EDT_00008');
        const current = await this.root(request, article.code);
        if (current.status !== 'ARCHIVED' || current.revision !== article.revision) {
            this.fail('The archived article changed during inspection; refresh its saved state', 'ERR_EDT_00008');
        }
        return { article: current, localizations: rows };
    },

    /** Keeps only a verified nPublish reference; a reference does not assert current Online delivery. */
    publicationReference: async function (request, article) {
        if (!article.publicationCode) {
            if (article.status === 'PUBLISHED' || article.status === 'WITHDRAWN') this.fail('Inspect the missing publication reference before editing', 'ERR_EDT_00008');
            return undefined;
        }
        const publication = await SERVICE.DefaultPublicationLifecycleService.get(Object.assign({}, request, {
            publicationCode: article.publicationCode
        }));
        const sourceRevision = article.publicationSourceRevision ?? article.revision;
        if (!publication || publication.code !== article.publicationCode || publication.domain !== 'editorial' ||
            publication.rootType !== 'article' || publication.rootCode !== article.code ||
            !Number.isSafeInteger(sourceRevision) || sourceRevision < 1 || publication.sourceVersion !== String(sourceRevision) ||
            !['ONLINE', 'WITHDRAWN', 'ROLLED_BACK'].includes(publication.state)) {
            this.fail('The article publication reference is not confirmed; inspect its owning request', 'ERR_EDT_00008');
        }
        return { code: publication.code, sourceRevision, state: publication.state };
    },

    /** Provides bounded configured presentation and exact saved locales for one source revision. */
    workspace: async function (request) {
        this.authorize(request, 'editorial.backoffice.read');
        const input = this.input(request);
        const code = input.articleCode || input.article?.code;
        if (typeof code !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code)) this.fail('An Editorial article reference is required');
        const article = await this.root(request, code);
        const source = article.status === 'ARCHIVED'
            ? await this.archivedSource(request, article)
            : await this.source(request, code, article.revision);
        const settings = CONFIG.get('editorial') || {};
        const locale = typeof input.locale === 'string' ? input.locale : 'en';
        const copy = settings.authoring?.presentation || {};
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        const manage = security.isPermissionGranted('editorial.backoffice.manage', security.getGrantedPermissions(request), {});
        let deployment = { status: 'UNKNOWN' };
        try {
            deployment = await SERVICE.DefaultEditorialOnlineProjectionService.getDeployment(code, request);
            if (deployment.status === 'DEPLOYED' && deployment.sourceRevision > article.revision) this.fail('Editorial deployment is newer than this saved article');
        } catch (_) { deployment = { status: 'UNKNOWN' }; }
        const intake = settings.authoring?.mediaIntake;
        const mediaIntake = intake && /^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(intake.contextCode || '')
            ? { contractVersion: 1, contextCode: intake.contextCode,
                presentation: Object.fromEntries(['title', 'choose', 'check', 'upload', 'inspect', 'apply', 'clear',
                    'checking', 'uploading', 'inspecting', 'review', 'confirmed', 'uncertain', 'unavailable', 'failed', 'reference', 'applied']
                    .map(key => [key, intake.presentation?.[locale]?.[key] || intake.presentation?.en?.[key]])
                    .filter(([, value]) => typeof value === 'string' && value.trim() && value.length <= 2000)) } : undefined;
        return { contractVersion: 1, article: this.articleView(source.article), localizations: source.localizations,
            featuredMedia: await SERVICE.DefaultEditorialFeaturedMediaService.evaluate(request, source.article),
            ...(mediaIntake ? { mediaIntake } : {}),
            deployment,
            requiredLocaleCodes: source.policy?.requiredLocaleCodes || [],
            supportedLocaleCodes: settings.delivery.supportedLocales,
            operations: manage ? [
                ...(article.publicationIntent === undefined && editableStates.has(article.status) ? ['SAVE'] : []),
                ...(article.publicationIntent === undefined && !['IN_REVIEW', 'ARCHIVED'].includes(article.status) &&
                    (!article.publicationCode || deployment.status === 'NONE') ? ['ARCHIVE'] : []), 'INSPECT'
            ] : [], presentation: Object.assign({}, copy.en, copy[locale]) };
    },

    /** Creates a draft once; an identical original-actor retry returns only the unchanged acknowledged record. */
    create: async function (request) {
        const actor = this.authorize(request, 'editorial.backoffice.manage');
        const input = this.input(request), model = this.copy(request, input.model, 'editorialArticle', true);
        if (!/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(model.code || '')) this.fail('Choose a valid stable article reference');
        if (typeof model.internalName !== 'string' || !model.internalName.trim() || typeof model.slug !== 'string' ||
            !model.slug.trim()) this.fail('Enter a working title and URL slug before creating the draft');
        const command = this.command(request, 'CREATE', actor, input);
        const existing = await this.root(request, model.code, true);
        if (existing) {
            const receipt = existing.lastAuthoringCommand;
            if (receipt?.operation === 'CREATE' && receipt.commandId === command.commandId && receipt.actor === actor &&
                receipt.payloadHash === command.payloadHash && existing.revision === 1 && existing.status === 'DRAFT') return this.articleView(existing);
            this.fail('This article reference already exists; inspect the saved article', 'ERR_EDT_00008');
        }
        const types = await SERVICE.DefaultEditorialContentTypeService.get(Object.assign(this.context(request), {
            query: { code: model.contentTypeCode, active: true }, searchOptions: { limit: 2 }
        }));
        if (!/^SUC_/.test(types?.code || '') || !Array.isArray(types?.result) || types.result.length !== 1 || types.result[0].code !== model.contentTypeCode || types.result[0].active !== true) {
            this.fail('Choose an active saved Editorial content type', 'ERR_EDT_00007');
        }
        const receipt = Object.assign({}, command, { fromRevision: 0, toRevision: 1 });
        await this.references(request, model);
        const response = await SERVICE.DefaultEditorialArticleService.save(Object.assign(this.context(request), {
            model: Object.assign({}, model, { active: true, status: 'DRAFT', revision: 1, lastAuthoringCommand: receipt }),
            options: { insertOnly: true, recursive: false }
        }));
        this.saved(response, model.code);
        const article = await this.root(request, model.code);
        if (article.lastAuthoringCommand?.commandId !== receipt.commandId || article.status !== 'DRAFT' || article.revision !== 1) {
            this.fail('The created draft could not be confirmed; inspect the original command', 'ERR_EDT_00008');
        }
        return this.articleView(article);
    },

    /** Atomically advances the root and every stored locale into a new review revision. */
    saveDraft: async function (request) {
        const actor = this.authorize(request, 'editorial.backoffice.manage');
        const input = this.input(request), identity = this.identity(input);
        const command = this.command(request, 'SAVE', actor, input);
        const changes = this.copy(request, input.changes || {}, 'editorialArticle', false);
        const localized = input.localization;
        const locales = CONFIG.get('editorial')?.delivery?.supportedLocales;
        if (localized !== undefined && (!localized || typeof localized !== 'object' || Array.isArray(localized) ||
            !Array.isArray(locales) || !locales.includes(localized.localeCode))) this.fail('Choose a configured content language');
        const localeChanges = localized ? this.copy(request, localized.changes || {}, 'editorialArticleLocalization', false) : undefined;
        if (localeChanges && ['articleCode', 'localeCode'].some(field => Object.hasOwn(localeChanges, field))) this.fail('Localization identity is managed by Editorial');
        // Read nPublish outside the database transaction; only the bounded reference is carried in.
        const original = await this.root(request, identity.code);
        if (original.revision !== identity.revision || !editableStates.has(original.status) || original.publicationIntent !== undefined) {
            this.fail('The article changed or is in review. Inspect its saved revision before editing', 'ERR_EDT_00008');
        }
        const publication = await this.publicationReference(request, original);
        await this.references(request, Object.assign({}, original, changes));
        const transaction = SERVICE.DefaultDatabaseTransactionService;
        if (!transaction?.execute) this.fail('Atomic Editorial draft saving is unavailable', 'ERR_EDT_00008');
        return transaction.execute({ moduleName: 'editorial', tenant: request.tenant }, async transactionContext => {
            const scoped = Object.assign({}, request, { transactionContext });
            const source = await this.source(scoped, identity.code, identity.revision);
            const article = source.article;
            if (article.status !== original.status || article.publicationCode !== original.publicationCode ||
                article.publicationSourceRevision !== original.publicationSourceRevision || article.publicationIntent !== undefined || !editableStates.has(article.status)) {
                this.fail('The saved article changed before the draft command began', 'ERR_EDT_00008');
            }
            const revision = article.revision + 1;
            if (!Number.isSafeInteger(revision)) this.fail('Editorial revision boundary was reached');
            const receipt = Object.assign({}, command, { fromRevision: article.revision, toRevision: revision });
            const set = Object.assign({}, changes, { status: 'DRAFT', revision, lastAuthoringCommand: receipt },
                publication ? { publicationCode: publication.code, publicationSourceRevision: publication.sourceRevision } : {});
            const unset = { workflowInstanceCode: '', decisionEvidence: '' };
            for (const [key, value] of Object.entries(changes)) if (value === '') {
                const definition = NODICS.getModule('editorial').rawSchema.editorialArticle.definition[key];
                if (definition && definition.required !== true) { delete set[key]; unset[key] = ''; }
            }
            await this.update('DefaultEditorialArticleService', scoped,
                { code: article.code, revision: article.revision, status: article.status, publicationIntent: { $exists: false } }, { $set: set, $unset: unset });
            const pending = [...source.localizations];
            if (localized && !pending.some(row => row.localeCode === localized.localeCode)) pending.push({
                code: 'editorial-locale-' + crypto.createHash('sha256').update(article.code + ':' + localized.localeCode).digest('hex').slice(0, 48),
                articleCode: article.code, localeCode: localized.localeCode, active: true
            });
            for (const locale of pending) {
                const edited = localized && locale.localeCode === localized.localeCode;
                const model = Object.assign({}, locale, edited ? localeChanges : {}, { revision });
                if (edited) model.status = SERVICE.DefaultEditorialValidationService.localizationComplete(model) ? 'READY' : 'DRAFT';
                if (source.localizations.some(row => row.code === locale.code)) {
                    const patch = Object.assign({}, edited ? localeChanges : {}, { revision, status: model.status });
                    await this.update('DefaultEditorialArticleLocalizationService', scoped,
                        { code: locale.code, articleCode: article.code, localeCode: locale.localeCode, revision: article.revision }, patch);
                } else {
                    this.saved(await SERVICE.DefaultEditorialArticleLocalizationService.save(Object.assign(this.context(scoped), {
                        model, options: { insertOnly: true, recursive: false }
                    })), model.code);
                }
            }
            const saved = await this.source(scoped, article.code, revision);
            if (saved.article.lastAuthoringCommand?.commandId !== command.commandId || saved.article.status !== 'DRAFT' ||
                saved.localizations.length !== pending.length) this.fail('Atomic draft readback could not be confirmed', 'ERR_EDT_00008');
            return { contractVersion: 1, outcome: 'SAVED_DRAFT', commandId: command.commandId,
                fromRevision: article.revision, toRevision: revision, article: this.articleView(saved.article), localizations: saved.localizations };
        });
    },

    /** Inspects an original actor's retained root receipt without replaying a command or claiming absence proves failure. */
    inspectCommand: async function (request) {
        const actor = this.authorize(request, 'editorial.backoffice.manage');
        const input = this.input(request), identity = this.identity(input);
        if (typeof input.commandId !== 'string' || !/^[A-Za-z0-9._:-]{8,128}$/.test(input.commandId)) this.fail('The original command reference is required');
        const article = await this.root(request, identity.code);
        const receipt = article.lastAuthoringCommand;
        const matched = receipt?.actor === actor && receipt.commandId === input.commandId && receipt.fromRevision === identity.revision;
        if (!matched) return { contractVersion: 1, outcome: 'UNKNOWN', commandId: input.commandId,
            fromRevision: identity.revision, currentRevision: article.revision, currentStatus: article.status };
        if (article.revision !== receipt.toRevision || receipt.operation === 'SAVE' && article.status !== 'DRAFT' ||
            receipt.operation === 'ARCHIVE' && article.status !== 'ARCHIVED') return { contractVersion: 1, outcome: 'SAVED_BUT_CHANGED',
            commandId: input.commandId, fromRevision: receipt.fromRevision, toRevision: receipt.toRevision,
            currentRevision: article.revision, currentStatus: article.status };
        if (receipt.operation === 'ARCHIVE') return { contractVersion: 1, outcome: 'ARCHIVED', commandId: input.commandId,
            fromRevision: receipt.fromRevision, toRevision: receipt.toRevision, article: this.articleView(article) };
        const source = await this.source(request, article.code, article.revision);
        return { contractVersion: 1, outcome: receipt.operation === 'ARCHIVE' ? 'ARCHIVED' : 'SAVED_DRAFT',
            commandId: input.commandId, fromRevision: receipt.fromRevision, toRevision: receipt.toRevision,
            article: this.articleView(source.article), localizations: source.localizations };
    },

    /** Archives only a saved non-review revision whose actual retained publication is no longer Online. */
    archive: async function (request) {
        const actor = this.authorize(request, 'editorial.backoffice.manage');
        const input = this.input(request), identity = this.identity(input);
        const command = this.command(request, 'ARCHIVE', actor, input);
        const article = await this.root(request, identity.code);
        if (article.revision !== identity.revision || !editableStates.has(article.status) || article.publicationIntent !== undefined) this.fail('Inspect the current article and its retained publication request before archiving', 'ERR_EDT_00008');
        const publication = await this.publicationReference(request, article);
        if (publication?.state === 'ONLINE') this.fail('Withdraw the Online copy before archiving this article', 'ERR_EDT_00002');
        if (publication) {
            const deployed = await SERVICE.DefaultEditorialOnlineProjectionService.getDeployment(article.code, request);
            if (deployed.status !== 'NONE') this.fail('Verify that no copy is deployed before archiving this article', 'ERR_EDT_00008');
        }
        await this.update('DefaultEditorialArticleService', request,
            { code: article.code, revision: article.revision, status: article.status, publicationIntent: { $exists: false } },
            { status: 'ARCHIVED', lastAuthoringCommand: Object.assign({}, command, {
                fromRevision: article.revision, toRevision: article.revision
            }) });
        const saved = await this.root(request, article.code);
        if (saved.status !== 'ARCHIVED' || saved.lastAuthoringCommand?.commandId !== command.commandId) this.fail('Inspect the original archive command', 'ERR_EDT_00008');
        return { contractVersion: 1, outcome: 'ARCHIVED', commandId: command.commandId,
            fromRevision: article.revision, toRevision: article.revision, article: this.articleView(saved) };
    }
};
