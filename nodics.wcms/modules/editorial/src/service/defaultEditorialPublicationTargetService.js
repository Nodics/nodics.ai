/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('node:crypto');

/** @module editorial/service/DefaultEditorialPublicationTargetService @description Owns atomic Editorial Online projection, pointer and correlated receipt operations through generated database services. @layer service @owner editorial @override Preserve tenant/runtime authority, immutable source identity, original operation receipts and provider-neutral pointer CAS. */
module.exports = {
    /** Initializes target publication operations. */
    init: function () { return Promise.resolve(true); },
    /** Completes target publication initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Rejects target mutations unless this process is explicitly the Online runtime. */
    assertOnlineRuntime: function () {
        let publication = (CONFIG.get('editorial') || {}).publication || {};
        if (publication.runtimeRole !== 'ONLINE') {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial target operations require an Online runtime');
        }
        if (CONFIG.get('publishEnabled') === true) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Online Editorial target must not run publish source modules');
        }
    },
    /** Normalizes one target operation body. */
    input: function (request) {
        return request.editorialPublicationTarget || request;
    },
    /** Raises a bounded owner error without exposing publication payloads. */
    fail: function (message, code = 'ERR_EDT_00008') { throw new CLASSES.NodicsError(code, message); },
    /** Hashes inert owner identity; this never selects a database or permission. */
    digest: function (value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); },
    /** Validates a bounded stored reference or opaque operation identity. */
    reference: function (value, label, maximum = 256) {
        if (typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > maximum || /[\u0000-\u001f\u007f]/.test(value)) this.fail('Invalid Editorial ' + label, 'ERR_EDT_00001');
        return value;
    },
    /** Reads complete module-owned limits; invalid configuration cannot broaden target work. */
    limits: function () {
        const settings = (CONFIG.get('editorial') || {}).publication || {};
        const count = settings.maximumProjections, bytes = settings.maximumProjectionBytes;
        if (!Number.isSafeInteger(count) || count < 1 || !Number.isSafeInteger(bytes) || bytes < 1) this.fail('Editorial target limits are unavailable');
        return { count, bytes };
    },
    /** Uses the existing opaque transaction authority; no non-atomic persistence fallback exists. */
    transaction: function (request, work) {
        this.assertOnlineRuntime();
        const owner = SERVICE.DefaultDatabaseTransactionService;
        if (!owner?.execute || !owner?.capabilities) this.fail('Atomic Editorial Online publication is unavailable');
        const capability = owner.capabilities({ moduleName: 'editorial', tenant: request.tenant });
        if (!capability?.multiRecordAtomic || !capability.contextPropagation) this.fail('Editorial Online publication requires qualified atomic transactions');
        return owner.execute({ moduleName: 'editorial', tenant: request.tenant }, transactionContext => work(Object.assign({}, request, { transactionContext })));
    },
    /** Keeps the original verified target principal, tenant and opaque local transaction on every generated operation. */
    scoped: function (request, values) {
        return Object.assign({ tenant: request.tenant, authData: request.authData, transactionContext: request.transactionContext,
            options: { recursive: false } }, values);
    },
    /** Rejects negative or contradictory generated acknowledgements before treating result data as evidence. */
    acknowledged: function (response) {
        if (!response || typeof response.code !== 'string' || !response.code.startsWith('SUC_') || response.success === false || response.acknowledged === false || response.error || response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length)) this.fail('Editorial target persistence could not be confirmed');
        return response.result;
    },
    /** Reads one bounded, nonrecursive generated result set without substituting missing rows. */
    read: async function (service, query, request, limit = this.limits().count + 1) {
        const result = this.acknowledged(await SERVICE[service].get(this.scoped(request, { query, searchOptions: { limit, pageSize: limit, pageNumber: 1 } })));
        if (!Array.isArray(result) || result.length >= limit || new Set(result.map(row => row.code)).size !== result.length) this.fail('Editorial target read is incomplete or ambiguous');
        return result;
    },
    /** Reads at most one receipt by its stable tenant-local code. */
    receipt: async function (code, request) {
        return (await this.read('DefaultEditorialPublicationReceiptService', { code }, request, 2))[0];
    },
    /** Requires one canonical persisted model; counts and submitted-model fallbacks are not receipts. */
    saved: function (response, expected) {
        const value = this.acknowledged(response);
        const record = Array.isArray(value) ? value.length === 1 && value[0] : value;
        if (!record || typeof record !== 'object' || Object.entries(expected).some(([key, actual]) => JSON.stringify(record[key]) !== JSON.stringify(actual))) this.fail('Editorial persistence did not return the exact saved target record');
        return record;
    },
    /** Creates or CAS-updates an existing domain pointer through managed database concurrency. */
    storeReceipt: async function (model, previous, request) {
        if (previous && (!Number.isSafeInteger(previous.revision) || previous.revision < 1 || previous.code !== model.code)) this.fail('Editorial target pointer revision is unavailable');
        const expected = Object.assign({}, model, { revision: previous ? previous.revision + 1 : 1 });
        const response = previous
            ? await SERVICE.DefaultEditorialPublicationReceiptService.update(this.scoped(request, { query: { code: previous.code, revision: previous.revision }, model,
                options: { recursive: false, returnModified: true } }))
            : await SERVICE.DefaultEditorialPublicationReceiptService.save(this.scoped(request, {
                query: { code: model.code, revision: 0 }, model, options: { recursive: false } }));
        // Provider-populated dates and ownership are additional fields, never a substitute for identity/revision evidence.
        const proof = { code: model.code, receiptKind: model.receiptKind, articleCode: model.articleCode,
            sourceRevision: model.sourceRevision, status: model.status, sourceHash: model.sourceHash,
            projectionCodes: model.projectionCodes, evidence: model.evidence, revision: expected.revision };
        if (previous) {
            const result = this.acknowledged(response);
            if (SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(response) !== 1 || !Array.isArray(result?.models) || result.models.length !== 1) this.fail('Editorial target pointer CAS did not return its exact modified record');
            return this.saved({ code: response.code, result: result.models[0] }, proof);
        }
        return this.saved(response, proof);
    },
    /** Fences a visibility transition against the exact immutable projection and original state. */
    setProjectionStatus: async function (row, status, request) {
        const response = await SERVICE.DefaultEditorialOnlineArticleService.update(this.scoped(request, {
            query: { code: row.code, articleCode: row.articleCode, sourceRevision: row.sourceRevision, sourceHash: row.sourceHash, status: row.status }, model: { status } }));
        this.acknowledged(response);
        if (SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(response) !== 1) this.fail('The Editorial target projection changed; inspect its current state');
    },
    /** Admits only the exact nPublish-owned article/source identity. */
    publication: function (input) {
        const publication = input.publication;
        if (!publication || publication.domain !== 'editorial' || publication.rootType !== 'article' ||
            typeof publication.sourceVersion !== 'string' || !/^[1-9]\d*$/.test(publication.sourceVersion) || !Number.isSafeInteger(Number(publication.sourceVersion))) this.fail('Exact Editorial publication identity is required', 'ERR_EDT_00001');
        this.reference(publication.code, 'publication code'); this.reference(publication.rootCode, 'article code');
        if (input.articleCode !== undefined && input.articleCode !== publication.rootCode) this.fail('Editorial publication root does not match the requested article');
        return publication;
    },
    /** Stable pointers remain inside the existing Editorial receipt owner, not another lifecycle store. */
    pointerCode: function (kind, identity) { return 'editorial-' + kind.toLowerCase() + '-' + this.digest(identity); },
    /** Uses one receipt per exact operation, retaining renewed approval cycles independently. */
    operationCode: function (kind, publication, operationKey) { return this.pointerCode(kind, [publication.code, operationKey]); },
    /** Normalizes sorted immutable target-version identity. */
    version: function (rows) { return rows.map(row => row.code).sort().join(','); },
    /** Includes payload and access intent while excluding a retry's volatile publication timestamp. */
    projectionDigest: function (rows) { return this.digest(rows.map(row => [row.code, row.sourceHash, [...row.accessGroups].sort(), row.active]).sort((a, b) => a[0].localeCompare(b[0]))); },
    /** Validates projection mechanics and hash; source business approval remains nPublish/Editorial-owned. */
    projection: function (value, publication) {
        const row = this.normalizeProjection(value);
        for (const field of ['code', 'articleCode', 'contentTypeCode', 'siteCode', 'localeCode', 'slug']) {
            this.reference(row[field], field);
            if (row[field].includes(',')) this.fail('Editorial projection identity cannot contain a version separator');
        }
        if (row.articleCode !== publication.rootCode || row.sourceRevision !== Number(publication.sourceVersion) ||
            row.code !== [row.articleCode, row.siteCode, row.localeCode, row.sourceRevision].join('-') ||
            row.active !== true || !['CURRENT', 'SUPERSEDED', 'WITHDRAWN'].includes(row.status) ||
            !Array.isArray(row.accessGroups) || !row.accessGroups.length || row.accessGroups.length > 100 || row.accessGroups.some(group => typeof group !== 'string' || group.length > 128) ||
            !(row.publishedAt instanceof Date) || !Number.isFinite(row.publishedAt.getTime()) ||
            !row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload) ||
            ['articleCode', 'contentTypeCode', 'siteCode', 'localeCode', 'slug'].some(field => row.payload[field] !== row[field]) ||
            typeof row.sourceHash !== 'string' || !/^[a-f0-9]{64}$/.test(row.sourceHash) || this.digest(row.payload) !== row.sourceHash) this.fail('Editorial target projection does not match its immutable source');
        return row;
    },
    /** Reads and checks the complete current set against its managed article pointer. Absence never adopts legacy rows. */
    current: async function (articleCode, request) {
        const head = await this.receipt(this.pointerCode('ARTICLE_HEAD', articleCode), request);
        const rows = await this.read('DefaultEditorialOnlineArticleService', { articleCode, status: 'CURRENT' }, request);
        if (!head) {
            if (rows.length) this.fail('Unqualified existing Editorial projections require owner review before adoption');
            if ((await this.read('DefaultEditorialPublicationReceiptService', { articleCode, receiptKind: 'ROUTE_CLAIM', status: 'PUBLISHED' }, request)).length) this.fail('Editorial routes exist without a qualified article pointer');
            return { head: undefined, rows, version: null, revision: 0 };
        }
        if (head.receiptKind !== 'ARTICLE_HEAD' || head.articleCode !== articleCode || !Number.isSafeInteger(head.revision) || head.revision < 1 || !['PUBLISHED', 'WITHDRAWN'].includes(head.status)) this.fail('Editorial article pointer is unverified');
        const version = rows.length ? this.version(rows) : null;
        if (head.status === 'WITHDRAWN') {
            if (rows.length || head.evidence?.version !== null) this.fail('Withdrawn Editorial pointer has inconsistent visible content');
        } else {
            for (const row of rows) this.projection(row, { rootCode: articleCode, sourceVersion: String(head.sourceRevision) });
            if (!rows.length || !Array.isArray(head.projectionCodes) || version !== head.evidence?.version || version !== [...head.projectionCodes].sort().join(',') || this.projectionDigest(rows) !== head.sourceHash) this.fail('Editorial Online projection set is incomplete or ambiguous');
        }
        const claims = await this.read('DefaultEditorialPublicationReceiptService', { articleCode, receiptKind: 'ROUTE_CLAIM', status: 'PUBLISHED' }, request);
        if (claims.length !== rows.length || claims.some(claim => !rows.some(row => this.claimMatches(claim, row)))) this.fail('Editorial route claims do not match its complete Online set');
        return { head, rows, version, revision: head.revision };
    },
    /** Builds a standard receipt/pointer model; no caller-supplied persistence model is accepted. */
    receiptModel: function (kind, code, publication, rows, status, evidence, request) {
        return { code, receiptKind: kind, active: true, accessGroups: ['serviceAccountUserGroup', 'adminGroup', 'employeeUserGroup'],
            description: 'Editorial Online ' + kind.toLowerCase(), articleCode: publication.rootCode,
            sourceRevision: Number(publication.sourceVersion), targetCode: 'editorial-online', status,
            sourceHash: this.projectionDigest(rows), projectionCodes: rows.map(row => row.code).sort(),
            correlationId: this.reference(request.correlationId || publication.code, 'correlation identity'), evidence, publishedAt: new Date() };
    },
    /** Identifies an exact site/language/slug claim independently of an article's immutable version code. */
    routeCode: function (row) { return this.pointerCode('ROUTE_CLAIM', [row.siteCode, row.localeCode, row.slug]); },
    /** Checks a route pointer's full target identity rather than accepting a same-named article. */
    claimMatches: function (claim, row) {
        return claim.code === this.routeCode(row) && claim.receiptKind === 'ROUTE_CLAIM' && claim.articleCode === row.articleCode &&
            claim.sourceRevision === row.sourceRevision && claim.sourceHash === this.projectionDigest([row]) &&
            JSON.stringify(claim.projectionCodes) === JSON.stringify([row.code]) &&
            claim.evidence?.siteCode === row.siteCode && claim.evidence.localeCode === row.localeCode && claim.evidence.slug === row.slug;
    },
    /** Changes only target state/evidence while the managed provider owns receipt revisions and stored audit metadata. */
    changeReceipt: function (previous, status, evidence, request) {
        const fields = ['code', 'receiptKind', 'active', 'accessGroups', 'description', 'articleCode', 'sourceRevision',
            'targetCode', 'sourceHash', 'projectionCodes', 'correlationId', 'publishedAt'];
        const model = Object.fromEntries(fields.map(field => [field, previous[field]]));
        model.status = status; model.evidence = Object.assign({}, previous.evidence, evidence);
        return this.storeReceipt(model, previous, request);
    },
    /** Atomically claims new routes and retires only this article's routes absent from the replacement set. */
    switchRoutes: async function (current, rows, publication, request) {
        const keys = new Set();
        for (const row of rows) {
            const code = this.routeCode(row);
            if (keys.has(code)) this.fail('Editorial publication contains an ambiguous site/language/slug');
            keys.add(code);
            const claim = await this.receipt(code, request);
            if (claim && (claim.receiptKind !== 'ROUTE_CLAIM' || !['PUBLISHED', 'SUPERSEDED', 'WITHDRAWN'].includes(claim.status))) this.fail('Editorial route ownership is unverified');
            if (claim?.status === 'PUBLISHED' && (claim.articleCode !== publication.rootCode || !current.rows.some(previous => this.claimMatches(claim, previous)))) this.fail('This URL is already published by another Editorial article or target version', 'ERR_EDT_00002');
            // A renewed activation of the same immutable copy needs no route edit. Its managed head CAS
            // still fences this article; never manufacture a modification through publication timestamps.
            if (claim?.status === 'PUBLISHED' && claim.evidence?.publicationCode === publication.code && this.claimMatches(claim, row)) continue;
            await this.storeReceipt(this.receiptModel('ROUTE_CLAIM', code, publication, [row], 'PUBLISHED', {
                siteCode: row.siteCode, localeCode: row.localeCode, slug: row.slug, publicationCode: publication.code
            }, request), claim, request);
        }
        for (const previous of current.rows) {
            if (keys.has(this.routeCode(previous))) continue;
            const claim = await this.receipt(this.routeCode(previous), request);
            if (!claim || claim.status !== 'PUBLISHED' || !this.claimMatches(claim, previous)) this.fail('The previous Editorial route changed during publication');
            await this.changeReceipt(claim, 'SUPERSEDED', { retiredByPublicationCode: publication.code }, request);
        }
    },
    /** Writes one article visibility pointer using its original managed revision or insert-only absent token. */
    switchHead: function (current, rows, publication, receiptCode, request) {
        return this.storeReceipt(this.receiptModel('ARTICLE_HEAD', this.pointerCode('ARTICLE_HEAD', publication.rootCode),
            publication, rows, 'PUBLISHED', { version: this.version(rows), publicationCode: publication.code, receiptCode }, request), current.head, request);
    },
    /** Validates durable activation evidence independently of current visibility; exact replay returns the original result. */
    activationResult: function (record, publication, operationKey) {
        const proof = record?.evidence?.activation;
        if (!record || record.code !== this.operationCode('DEPLOYMENT', publication, operationKey) || record.receiptKind !== 'DEPLOYMENT' ||
            record.articleCode !== publication.rootCode || record.sourceRevision !== Number(publication.sourceVersion) ||
            !Number.isSafeInteger(record.revision) || record.revision < 1 || !['PUBLISHED', 'SUPERSEDED', 'WITHDRAWN'].includes(record.status) ||
            record.targetCode !== 'editorial-online' || typeof record.sourceHash !== 'string' || !/^[a-f0-9]{64}$/.test(record.sourceHash) ||
            !proof || proof.operationKey !== operationKey || proof.publicationCode !== publication.code || proof.sourceVersion !== publication.sourceVersion ||
            !Array.isArray(record.projectionCodes) || !record.projectionCodes.length || record.projectionCodes.length > this.limits().count ||
            new Set(record.projectionCodes).size !== record.projectionCodes.length || record.projectionCodes.some(code => typeof code !== 'string' || !code || code.length > 256 || code.includes(',')) ||
            proof.targetVersion !== [...record.projectionCodes].sort().join(',') ||
            !(proof.previousOnlineVersion === null || typeof proof.previousOnlineVersion === 'string' && proof.previousOnlineVersion.length) ||
            !Number.isSafeInteger(proof.previousOnlineRevision) || proof.previousOnlineRevision < 0 || proof.requestHash !== record.sourceHash) this.fail('The retained Editorial activation receipt is unverified');
        return { version: proof.targetVersion, projectionCodes: [...record.projectionCodes], receipt: {
            operationKey: proof.operationKey, publicationCode: proof.publicationCode, sourceVersion: proof.sourceVersion,
            rootCode: record.articleCode,
            targetVersion: proof.targetVersion, previousOnlineVersion: proof.previousOnlineVersion,
            previousOnlineRevision: proof.previousOnlineRevision
        } };
    },
    /** Requires nPublish's original captured predecessor token, never a fresh substitute after an uncertain commit. */
    activationInput: function (input, publication) {
        const operation = publication.activationOperation;
        if (!operation || !Object.hasOwn(operation, 'previousOnlineVersion') ||
            !(operation.previousOnlineVersion === null || typeof operation.previousOnlineVersion === 'string' && operation.previousOnlineVersion.length) ||
            !Number.isSafeInteger(operation.previousOnlineRevision) || operation.previousOnlineRevision < 0 || input.operationKey !== operation.key) this.fail('Inspect the original publication operation and target predecessor before activating');
        this.reference(operation.key, 'activation operation', 1024);
        return operation;
    },
    /** Saves only absent immutable models or changes visibility of an exactly retained immutable model. */
    storeProjections: async function (rows, request) {
        const saved = [];
        for (const model of rows) {
            const existing = (await this.read('DefaultEditorialOnlineArticleService', { code: model.code }, request, 2))[0];
            if (existing) {
                this.projection(existing, { rootCode: model.articleCode, sourceVersion: String(model.sourceRevision) });
                if (this.projectionDigest([existing]) !== this.projectionDigest([model])) this.fail('An immutable Editorial target version has different content');
                if (existing.status !== 'CURRENT') await this.setProjectionStatus(existing, 'CURRENT', request);
                const actual = (await this.read('DefaultEditorialOnlineArticleService', { code: model.code }, request, 2))[0];
                if (!actual || actual.status !== 'CURRENT' || this.projectionDigest([this.projection(actual, { rootCode: model.articleCode, sourceVersion: String(model.sourceRevision) })]) !== this.projectionDigest([model])) this.fail('Restored Editorial target visibility could not be confirmed');
                saved.push(actual);
            } else {
                const response = await SERVICE.DefaultEditorialOnlineArticleService.save(this.scoped(request, { model, options: { recursive: false, insertOnly: true } }));
                const actual = this.saved(response, { code: model.code, articleCode: model.articleCode, sourceRevision: model.sourceRevision,
                    sourceHash: model.sourceHash, siteCode: model.siteCode, localeCode: model.localeCode, slug: model.slug, status: 'CURRENT', payload: model.payload });
                this.projection(actual, { rootCode: model.articleCode, sourceVersion: String(model.sourceRevision) });
                saved.push(actual);
            }
        }
        return saved;
    },
    /** Qualifies the exact deployment referenced by a current article head before retiring its visibility. */
    currentDeployment: async function (current, request) {
        if (!current.head || current.head.status !== 'PUBLISHED') return undefined;
        const row = await this.receipt(this.reference(current.head.evidence?.receiptCode, 'target receipt code'), request);
        const previous = { code: current.head.evidence.publicationCode, rootCode: current.head.articleCode, sourceVersion: String(current.head.sourceRevision) };
        const result = this.activationResult(row, previous, row?.evidence?.activation?.operationKey);
        if (row.status !== 'PUBLISHED' || result.version !== current.version || row.sourceHash !== current.head.sourceHash) this.fail('Editorial pointer and deployment receipt disagree');
        return row;
    },
    /** Identifies one rollback/withdrawal intent without using latest source content or a mutable target as replay evidence. */
    commandInput: function (kind, input, publication) {
        const operationKey = this.reference(input.operationKey, 'target operation', 1024);
        const activationKey = this.reference(publication.activationOperation?.key, 'original activation operation', 1024);
        const version = kind === 'ROLLBACK' ? this.reference(input.targetVersion, 'rollback target version', 131072) : this.reference(publication.targetVersion, 'published target version', 131072);
        const proof = publication.targetCommandOperation;
        if (!proof || proof.contractVersion !== 1 || proof.operation !== kind || proof.publicationCode !== publication.code ||
            proof.domain !== publication.domain || proof.rootType !== publication.rootType || proof.rootCode !== publication.rootCode || proof.sourceVersion !== publication.sourceVersion ||
            proof.activationKey !== activationKey || proof.operationKey !== operationKey || !Number.isSafeInteger(proof.originRevision) || proof.originRevision < 1 ||
            !Number.isSafeInteger(publication.revision) || proof.originRevision > publication.revision ||
            operationKey !== publication.code + (kind === 'ROLLBACK' ? ':rollback:' : ':withdraw:') + String(proof.originRevision) || proof.targetVersionHash !== this.digest(version)) this.fail('Original nPublish command proof does not match the requested Editorial target effect');
        return { operationKey, activationKey, version,
            requestHash: this.digest([kind, publication.code, publication.rootCode, publication.sourceVersion, activationKey, version]) };
    },
    /** Requires an exact original command receipt, retaining historical completion separately from current visibility. */
    commandResult: function (record, kind, publication, intent) {
        const proof = record?.evidence?.command;
        if (!record || record.code !== this.operationCode(kind, publication, intent.operationKey) || record.receiptKind !== kind ||
            record.articleCode !== publication.rootCode || record.sourceRevision !== Number(publication.sourceVersion) ||
            !proof || proof.operationKey !== intent.operationKey || proof.activationKey !== intent.activationKey ||
            proof.publicationCode !== publication.code || proof.sourceVersion !== publication.sourceVersion || proof.requestHash !== intent.requestHash ||
            !proof.result || !Array.isArray(record.projectionCodes)) this.fail('Editorial target command receipt does not match the original request');
        const result = proof.result;
        if (kind === 'ROLLBACK' && (result.version !== intent.version || result.version !== [...record.projectionCodes].sort().join(',') || result.restored !== record.projectionCodes.length) ||
            kind === 'WITHDRAWAL' && (result.articleCode !== publication.rootCode || result.withdrawn !== record.projectionCodes.length)) this.fail('Editorial target command result is unverified');
        return Object.assign({}, result, { projectionCodes: [...record.projectionCodes], receipt: {
            operationKey: proof.operationKey, publicationCode: proof.publicationCode, rootCode: record.articleCode,
            sourceVersion: proof.sourceVersion, operation: kind, targetVersion: intent.version,
            affected: kind === 'ROLLBACK' ? result.restored : result.withdrawn
        } });
    },
    /** Persists command completion in the same transaction as its complete target effect. */
    recordCommand: async function (kind, publication, intent, rows, result, request) {
        const code = this.operationCode(kind, publication, intent.operationKey);
        const record = await this.storeReceipt(this.receiptModel(kind, code, publication, rows,
            kind === 'WITHDRAWAL' ? 'WITHDRAWN' : 'SUPERSEDED', { command: {
                operationKey: intent.operationKey, activationKey: intent.activationKey, publicationCode: publication.code,
                sourceVersion: publication.sourceVersion, requestHash: intent.requestHash, result
            } }, request), undefined, request);
        return this.commandResult(record, kind, publication, intent);
    },
    /** Restores date instances that were serialized while crossing the Staged-to-Online module boundary. */
    normalizeProjection: function (projection) {
        const allowed = ['code', 'active', 'accessGroups', 'description', 'articleCode', 'contentTypeCode', 'siteCode',
            'localeCode', 'slug', 'payload', 'sourceRevision', 'sourceHash', 'status', 'publishedAt'];
        let model = Object.fromEntries(allowed.filter(field => projection && Object.hasOwn(projection, field)).map(field => [field, projection[field]]));
        if (model.publishedAt && !(model.publishedAt instanceof Date)) model.publishedAt = new Date(model.publishedAt);
        if (model.payload) {
            model.payload = JSON.parse(JSON.stringify(model.payload));
            ['publishFrom', 'publishUntil', 'specialFrom', 'specialUntil', 'embargoAt'].forEach(field => {
                if (model.payload[field] && !(model.payload[field] instanceof Date)) model.payload[field] = new Date(model.payload[field]);
                if (model.payload[field] instanceof Date && !Number.isFinite(model.payload[field].getTime())) this.fail('Editorial projection has an invalid date');
            });
        }
        return model;
    },
    /** Atomically switches the complete projection/route/head set and original nPublish activation receipt. */
    deploy: async function (request) {
        this.assertOnlineRuntime();
        const input = this.input(request), publication = this.publication(input), operation = this.activationInput(input, publication);
        const limits = this.limits();
        if (publication.state !== 'ACTIVATING' || !Array.isArray(input.projections) || !input.projections.length || input.projections.length > limits.count || Buffer.byteLength(JSON.stringify(input.projections), 'utf8') > limits.bytes) this.fail('Editorial target activation exceeds its qualified source or size boundary');
        const rows = input.projections.map(row => this.projection(row, publication));
        if (rows.some(row => row.status !== 'CURRENT') || new Set(rows.map(row => row.code)).size !== rows.length) this.fail('Editorial activation contains duplicate or non-current projections');
        const requestHash = this.projectionDigest(rows), receiptCode = this.operationCode('DEPLOYMENT', publication, operation.key);
        return this.transaction(request, async scoped => {
            const original = await this.receipt(receiptCode, scoped);
            if (original) {
                const result = this.activationResult(original, publication, operation.key);
                if (original.sourceHash !== requestHash || result.receipt.previousOnlineVersion !== operation.previousOnlineVersion || result.receipt.previousOnlineRevision !== operation.previousOnlineRevision) this.fail('The original Editorial activation has different source or predecessor evidence');
                return result;
            }
            const current = await this.current(publication.rootCode, scoped);
            if (current.revision !== operation.previousOnlineRevision || current.version !== operation.previousOnlineVersion) this.fail('The Online article changed after the publication predecessor was captured');
            if (current.head && (Number(publication.sourceVersion) < current.head.sourceRevision ||
                Number(publication.sourceVersion) === current.head.sourceRevision && current.head.evidence?.publicationCode !== publication.code)) this.fail('This source revision already belongs to another publication, or requires the governed rollback path');
            const previous = await this.currentDeployment(current, scoped);
            await this.switchRoutes(current, rows, publication, scoped);
            for (const row of current.rows) if (!rows.some(next => next.code === row.code)) await this.setProjectionStatus(row, 'SUPERSEDED', scoped);
            const saved = await this.storeProjections(rows, scoped);
            const activation = { operationKey: operation.key, publicationCode: publication.code, sourceVersion: publication.sourceVersion,
                targetVersion: this.version(saved), previousOnlineVersion: operation.previousOnlineVersion,
                previousOnlineRevision: operation.previousOnlineRevision, requestHash };
            if (this.projectionDigest(saved) !== requestHash) this.fail('Persisted Editorial projections differ from the original operation');
            const receipt = await this.storeReceipt(this.receiptModel('DEPLOYMENT', receiptCode, publication, saved, 'PUBLISHED', {
                activation, previousReceiptCode: previous?.code ?? null, dependencyCount: (publication.dependencies || []).length
            }, scoped), undefined, scoped);
            if (previous) await this.changeReceipt(previous, 'SUPERSEDED', { supersededByReceiptCode: receiptCode }, scoped);
            await this.switchHead(current, saved, publication, receiptCode, scoped);
            const confirmed = await this.current(publication.rootCode, scoped);
            if (confirmed.version !== activation.targetVersion || confirmed.revision !== current.revision + 1 || confirmed.head.evidence.receiptCode !== receiptCode) this.fail('Complete Editorial activation readback could not be confirmed');
            return this.activationResult(receipt, publication, operation.key);
        });
    },
    /** Reads a consistent target snapshot and optionally inspects an original activation without replay or inferred failure. */
    status: async function (request) {
        this.assertOnlineRuntime();
        const input = this.input(request);
        const publication = input.publication ? this.publication(input) : undefined;
        const articleCode = this.reference(input.articleCode || publication?.rootCode, 'article code');
        return this.transaction(request, async scoped => {
            const current = await this.current(articleCode, scoped);
            const result = { version: current.version, revision: current.revision, projectionCodes: current.rows.map(row => row.code).sort() };
            const deployed = await this.currentDeployment(current, scoped);
            // This is deployment identity, not proof that embargo/window/access rules currently permit delivery.
            result.deployment = deployed ? { publicationCode: deployed.evidence.activation.publicationCode,
                sourceRevision: deployed.sourceRevision, activationKey: deployed.evidence.activation.operationKey } : null;
            if (input.inspectOperation === true) {
                if (!publication) this.fail('Original publication identity is required for target inspection');
                const key = this.reference(publication.activationOperation?.key, 'activation operation', 1024);
                const original = await this.receipt(this.operationCode('DEPLOYMENT', publication, key), scoped);
                result.activation = original ? { status: 'COMMITTED', result: this.activationResult(original, publication, key),
                    isCurrent: current.head?.evidence?.receiptCode === original.code && current.version === original.evidence.activation.targetVersion }
                    : { status: 'UNKNOWN' };
            }
            return result;
        });
    },
    /** Atomically restores only the retained predecessor of this exact activation; intervening publications are never overwritten. */
    rollback: async function (request) {
        this.assertOnlineRuntime();
        const input = this.input(request), publication = this.publication(input), intent = this.commandInput('ROLLBACK', input, publication);
        if (publication.state !== 'ROLLING_BACK' || publication.previousOnlineVersion !== intent.version) this.fail('Rollback requires the exact retained publication predecessor');
        const codes = intent.version.split(',');
        if (!codes.length || codes.length > this.limits().count || new Set(codes).size !== codes.length || [...codes].sort().join(',') !== intent.version) this.fail('Editorial rollback version is incomplete or ambiguous');
        return this.transaction(request, async scoped => {
            const original = await this.receipt(this.operationCode('ROLLBACK', publication, intent.operationKey), scoped);
            if (original) return this.commandResult(original, 'ROLLBACK', publication, intent);
            const current = await this.current(publication.rootCode, scoped), active = await this.currentDeployment(current, scoped);
            if (!active || active.code !== this.operationCode('DEPLOYMENT', publication, intent.activationKey) || current.version !== publication.targetVersion) this.fail('The Online article changed after this publication; rollback was not applied');
            const previous = await this.receipt(this.reference(active.evidence?.previousReceiptCode, 'retained predecessor receipt'), scoped);
            if (!previous || !['PUBLISHED', 'SUPERSEDED'].includes(previous.status)) this.fail('The retained Editorial predecessor is unavailable or explicitly withdrawn');
            const retainedPublication = { code: previous.evidence?.activation?.publicationCode, rootCode: publication.rootCode, sourceVersion: String(previous.sourceRevision) };
            const retained = this.activationResult(previous, retainedPublication, previous.evidence?.activation?.operationKey);
            if (retained.version !== intent.version) this.fail('The retained predecessor receipt does not match the rollback target');
            const rows = await this.read('DefaultEditorialOnlineArticleService', { articleCode: publication.rootCode, code: { $in: codes } }, scoped);
            if (rows.length !== codes.length || this.version(rows) !== intent.version) this.fail('The complete retained Editorial version is unavailable');
            for (const row of rows) this.projection(row, retainedPublication);
            if (this.projectionDigest(rows) !== previous.sourceHash) this.fail('Retained Editorial content differs from its immutable receipt');
            await this.switchRoutes(current, rows, retainedPublication, scoped);
            for (const row of current.rows) if (!codes.includes(row.code)) await this.setProjectionStatus(row, 'SUPERSEDED', scoped);
            for (const row of rows) if (row.status !== 'CURRENT') await this.setProjectionStatus(row, 'CURRENT', scoped);
            await this.changeReceipt(active, 'SUPERSEDED', { rolledBackToReceiptCode: previous.code }, scoped);
            const restored = await this.changeReceipt(previous, 'PUBLISHED', {}, scoped);
            await this.switchHead(current, rows, retainedPublication, restored.code, scoped);
            const confirmed = await this.current(publication.rootCode, scoped);
            if (confirmed.version !== intent.version || confirmed.revision !== current.revision + 1) this.fail('Complete Editorial rollback readback could not be confirmed');
            return this.recordCommand('ROLLBACK', publication, intent, rows, { version: intent.version, restored: rows.length }, scoped);
        });
    },
    /** Atomically withdraws only this exact activation, retaining newer publication visibility and original command evidence. */
    withdraw: async function (request) {
        this.assertOnlineRuntime();
        const input = this.input(request), publication = this.publication(input), intent = this.commandInput('WITHDRAWAL', input, publication);
        if (publication.state !== 'WITHDRAWING') this.fail('Editorial withdrawal requires the owning lifecycle intent');
        return this.transaction(request, async scoped => {
            const original = await this.receipt(this.operationCode('WITHDRAWAL', publication, intent.operationKey), scoped);
            if (original) return this.commandResult(original, 'WITHDRAWAL', publication, intent);
            const deployment = await this.receipt(this.operationCode('DEPLOYMENT', publication, intent.activationKey), scoped);
            const retained = this.activationResult(deployment, publication, intent.activationKey);
            if (retained.version !== intent.version) this.fail('Editorial withdrawal target does not match its original activation');
            const current = await this.current(publication.rootCode, scoped);
            const ownsCurrent = current.head?.status === 'PUBLISHED' && current.head.evidence?.receiptCode === deployment.code;
            const rows = ownsCurrent ? current.rows : [];
            if (ownsCurrent && (current.version !== intent.version || current.head.sourceRevision !== Number(publication.sourceVersion))) this.fail('Editorial current visibility differs from the publication being withdrawn');
            for (const row of rows) {
                await this.setProjectionStatus(row, 'WITHDRAWN', scoped);
                const claim = await this.receipt(this.routeCode(row), scoped);
                if (!claim || claim.status !== 'PUBLISHED' || !this.claimMatches(claim, row)) this.fail('Editorial route changed during withdrawal');
                await this.changeReceipt(claim, 'WITHDRAWN', {}, scoped);
            }
            if (ownsCurrent) await this.changeReceipt(current.head, 'WITHDRAWN', { version: null }, scoped);
            if (deployment.status !== 'WITHDRAWN') await this.changeReceipt(deployment, 'WITHDRAWN', {}, scoped);
            const confirmed = await this.current(publication.rootCode, scoped);
            if (confirmed.version !== (ownsCurrent ? null : current.version) || confirmed.revision !== current.revision + (ownsCurrent ? 1 : 0)) this.fail('Complete Editorial withdrawal readback could not be confirmed');
            return this.recordCommand('WITHDRAWAL', publication, intent, rows, { articleCode: publication.rootCode, withdrawn: rows.length }, scoped);
        });
    }
};
