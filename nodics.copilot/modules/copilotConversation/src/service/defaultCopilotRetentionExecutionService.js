/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');

/**
 * @module copilotConversation/service/DefaultCopilotRetentionExecutionService
 * @description Executes explicitly reviewed retention in bounded transactional pages, retaining a parent tombstone and operation evidence under a durable governed-property fence.
 * @layer service
 * @owner copilotConversation
 * @override Preserve independent grants, closed/expired qualification, durable revision fences, exact transactional parent transitions, no automatic retries, and separate audit/accounting retention.
 */
module.exports = {
    /** Advertises minimized owner copy only after independent execution admission; recovery stays visible when deletion is disabled. @param {Object} request Trusted request. @param {Object} configuration Conversation configuration. @returns {Object|undefined} Optional capability. */
    capability: function (request, configuration) {
        try {
            this.admission(request, false);
            if (!configuration.lifecycle?.executionPresentation)
                return undefined;
            let canDelete = false;
            try {
                this.admission(request);
                canDelete = true;
            } catch {
                /* Recovery remains separately available. */
            }
            return {
                canDelete,
                presentation: configuration.lifecycle.executionPresentation,
            };
        } catch {
            return undefined;
        }
    },
    /** Rejects without revealing content or private coordination data. @returns {never} Throws. */
    fail: function () {
        throw new CLASSES.NodicsError('ERR_CPC_00006');
    },
    /** Hashes ordered owner-built review data, never caller-built selectors. @param {Object} value Owner data. @returns {string} Digest. */
    digest: function (value) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(value))
            .digest('hex');
    },
    /** Requires separate authority and qualified persistence; inspection and stopping remain possible with deletion disabled. @param {Object} request Trusted employee request. @param {boolean} execution Whether new deletion is requested. @returns {Object} Scope, actor and batch bound. */
    admission: function (request, execution = true) {
        const scope =
            SERVICE.DefaultCopilotConversationLifecycleService.scope(request);
        const config = CONFIG.get('copilot')?.conversation;
        const persistence = SERVICE.DefaultRuntimePropertyPersistenceService;
        const transactions = SERVICE.DefaultDatabaseTransactionService;
        const durablePolicy = persistence?.policy?.();
        const transactionPolicy = CONFIG.get('databaseTransactions');
        const capabilities = transactions?.capabilities?.({
            moduleName: 'copilotConversation',
            tenant: request.tenant,
        });
        const fencePolicy = CONFIG.get('runtimePropertyGovernance')?.readFence;
        const batch = config?.lifecycle?.maximumBatch;
        if (
            !request.authData?.permissions?.some((value) =>
                ['*', 'copilot.activity.lifecycle.execute'].includes(value),
            ) ||
            (execution && config?.lifecycle?.deletionEnabled !== true) ||
            config?.writerFence?.enabled !== true ||
            (execution &&
                (transactionPolicy?.enabled !== true ||
                    transactionPolicy.failClosed !== true)) ||
            (execution &&
                (fencePolicy?.enabled !== true ||
                    fencePolicy.owners?.copilotConversation !== true)) ||
            config?.storage !== 'GENERATED_SERVICE' ||
            !Number.isSafeInteger(batch) ||
            batch < 1 ||
            batch > 100 ||
            durablePolicy?.enabled !== true ||
            durablePolicy.requireDurableJournal !== true ||
            !SERVICE.DefaultRuntimePropertyReadFenceService ||
            capabilities?.multiRecordAtomic !== true ||
            capabilities.journaledCommit !== true
        )
            this.fail();
        return {
            ...scope,
            actor: SERVICE.DefaultCopilotConversationService.identity(request)
                .principalCode,
            batch,
        };
    },
    /** Validates exact generated acknowledgements at both envelope levels. @param {Object} response Generated response. @returns {*} Result. */
    result: function (response) {
        if (
            !/^SUC_/.test(response?.code || '') ||
            [response, response?.result].some(
                (value) =>
                    !value ||
                    value.error ||
                    value.success === false ||
                    value.acknowledged === false ||
                    (value.errors !== undefined &&
                        (!Array.isArray(value.errors) || value.errors.length)),
            )
        )
            this.fail();
        return response.result;
    },
    /** Reads the exact scoped parent; outside transactions use primary-majority readback. @param {Object} request Trusted context. @param {Object} scope Enterprise scope. @param {string} code Conversation identity. @param {Object} transactionContext Optional opaque transaction. @returns {Promise<Object>} Private parent. */
    parent: async function (request, scope, code, transactionContext) {
        if (
            typeof code !== 'string' ||
            !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code)
        )
            this.fail();
        const rows = this.result(
            await SERVICE.DefaultCopilotConversationRecordService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: {
                    code,
                    tenantCode: scope.tenantCode,
                    enterpriseCode: scope.enterpriseCode,
                },
                searchOptions: { pageNumber: 1, pageSize: 2 },
                options: { skipItemCache: true },
                ...(transactionContext
                    ? { transactionContext }
                    : { internalPersistence: 'DURABLE_JOURNAL' }),
            }),
        );
        if (
            !Array.isArray(rows) ||
            rows.length !== 1 ||
            rows[0].code !== code ||
            rows[0].tenantCode !== scope.tenantCode ||
            rows[0].enterpriseCode !== scope.enterpriseCode ||
            typeof rows[0].principalCode !== 'string' ||
            !rows[0].principalCode
        )
            this.fail();
        return rows[0];
    },
    /** Builds a fresh read-only review bound to current committed policy and closed parent. @param {Object} request Trusted context with conversationCode and reason. @returns {Promise<Object>} Private review inputs. */
    prepare: async function (request) {
        const scope = this.admission(request);
        const current =
            await SERVICE.DefaultCopilotAdministrationService.current(request);
        const parent = await this.parent(
            request,
            scope,
            request.conversationCode,
        );
        const policy =
            SERVICE.DefaultCopilotConversationLifecycleService.policy(
                current.configuration.conversation,
                scope,
            );
        const reason = request.body?.reason;
        if (
            typeof reason !== 'string' ||
            !reason.trim() ||
            reason.length > 500 ||
            !/^[a-f0-9]{64}$/.test(current.revision || '') ||
            parent.retentionOperation ||
            !['CLOSED', 'ARCHIVED'].includes(parent.state) ||
            policy.holdAll ||
            policy.conversationCodes.includes(parent.code) ||
            !Number.isFinite(Date.parse(parent.updatedAt)) ||
            Date.parse(parent.updatedAt) >=
                Date.now() - policy.retentionDays * 86400000 ||
            JSON.stringify(this.admission(request)) !== JSON.stringify(scope)
        )
            this.fail();
        const binding = {
            scope,
            code: parent.code,
            principalCode: parent.principalCode,
            state: parent.state,
            updatedAt: parent.updatedAt,
            writerToken: parent.writerToken ?? null,
            revision: current.revision,
            policy,
            reason,
        };
        return {
            scope,
            parent,
            policy,
            revision: current.revision,
            reason,
            reviewDigest: this.digest(binding),
        };
    },
    /** Produces a non-destructive confirmation summary; no journal or fence is created. @param {Object} request Trusted context. @returns {Promise<Object>} Safe review. */
    preview: async function (request) {
        if (Object.keys(request.body || {}).some((key) => key !== 'reason'))
            this.fail();
        const value = await this.prepare(request);
        return {
            contractVersion: 1,
            context: {
                tenantCode: value.scope.tenantCode,
                enterpriseCode: value.scope.enterpriseCode,
            },
            state: 'REVIEWED',
            conversationCode: value.parent.code,
            reviewDigest: value.reviewDigest,
            policyRevision: value.revision,
            maximumBatch: value.scope.batch,
            retained: [
                'CONVERSATION_TOMBSTONE',
                'TRANSCRIPT_ACCESS_AUDIT',
                'ACTION_AUDIT',
                'PROVIDER_ACCOUNTING',
            ],
        };
    },
    /** Reviews an exact active parent for non-destructive closure; closure neither removes content nor cancels domain effects. @param {Object} request Trusted administrator and reason. @returns {Promise<Object>} Private closure review. */
    prepareClosure: async function (request) {
        const scope = this.admission(request, false);
        const parent = await this.parent(
            request,
            scope,
            request.conversationCode,
        );
        const reason = request.body?.reason;
        if (
            parent.state !== 'ACTIVE' ||
            parent.retentionOperation ||
            parent.lifecycleClosure ||
            typeof reason !== 'string' ||
            !reason.trim() ||
            reason.length > 500 ||
            JSON.stringify(this.admission(request, false)) !==
                JSON.stringify(scope)
        )
            this.fail();
        return {
            scope,
            parent,
            reason,
            reviewDigest: this.digest({
                scope,
                code: parent.code,
                principalCode: parent.principalCode,
                state: parent.state,
                updatedAt: parent.updatedAt,
                writerToken: parent.writerToken ?? null,
                reason,
            }),
        };
    },
    /** Returns a read-only closure review, independently of the destructive-deletion gate. @param {Object} request Exact reason. @returns {Promise<Object>} Scoped inert review. */
    previewClosure: async function (request) {
        if (Object.keys(request.body || {}).join() !== 'reason') this.fail();
        const value = await this.prepareClosure(request);
        return {
            contractVersion: 1,
            context: {
                tenantCode: value.scope.tenantCode,
                enterpriseCode: value.scope.enterpriseCode,
            },
            conversationCode: value.parent.code,
            state: 'REVIEWED',
            intent: 'CLOSE',
            reviewDigest: value.reviewDigest,
        };
    },
    /** Projects retained closure evidence only, never its private actor/reason or a claim of cancelled external work. @param {Object} request Trusted administrator. @param {Object} scope Scope. @param {Object} parent Current parent. @returns {Object} Original closure receipt. */
    closureReceipt: function (request, scope, parent) {
        const value = parent.lifecycleClosure;
        if (
            !value ||
            value.actor !== scope.actor ||
            !/^closure-[a-f0-9-]{36}$/.test(value.code || '') ||
            !/^[a-f0-9]{64}$/.test(value.reviewDigest || '') ||
            !Number.isFinite(Date.parse(value.closedAt)) ||
            ![
                'CLOSED',
                'ARCHIVED',
                'PURGING',
                'PURGED',
                'RETENTION_STOPPED',
            ].includes(parent.state) ||
            JSON.stringify(this.admission(request, false)) !==
                JSON.stringify(scope)
        )
            this.fail();
        return {
            contractVersion: 1,
            context: {
                tenantCode: scope.tenantCode,
                enterpriseCode: scope.enterpriseCode,
            },
            conversationCode: parent.code,
            state: 'CLOSURE_RECORDED',
            operationCode: value.code,
            closedAt: value.closedAt,
            conversationState: parent.state,
        };
    },
    /** Atomically freezes the parent against concurrent writer touches and retains an original closure receipt; no content is deleted. @param {Object} request Fresh confirmed closure review. @returns {Promise<Object>} Durable closure evidence. */
    close: async function (request) {
        if (
            Object.keys(request.body || {})
                .sort()
                .join() !== 'confirmed,reason,reviewDigest' ||
            request.body.confirmed !== true
        )
            this.fail();
        const value = await this.prepareClosure(request);
        if (value.reviewDigest !== request.body.reviewDigest) this.fail();
        const closure = {
            code: 'closure-' + crypto.randomUUID(),
            actor: value.scope.actor,
            reason: value.reason,
            reviewDigest: value.reviewDigest,
            closedAt: new Date().toISOString(),
        };
        await this.transition(request, value.parent, {
            state: 'CLOSED',
            updatedAt: closure.closedAt,
            lifecycleClosure: closure,
        });
        const parent = await this.parent(
            request,
            value.scope,
            request.conversationCode,
        );
        if (JSON.stringify(parent.lifecycleClosure) !== JSON.stringify(closure))
            this.fail();
        return this.closureReceipt(request, value.scope, parent);
    },
    /** Inspects original closure after response loss without closing again or inferring original intent from current state. @param {Object} request Empty body and trusted identity. @returns {Promise<Object>} Original closure receipt. */
    inspectClosure: async function (request) {
        if (Object.keys(request.body || {}).length) this.fail();
        const scope = this.admission(request, false);
        return this.closureReceipt(
            request,
            scope,
            await this.parent(request, scope, request.conversationCode),
        );
    },
    /** Conditionally advances the exact parent and its embedded operation evidence. @param {Object} request Trusted context. @param {Object} parent Prior record. @param {Object} patch Next state/journal. @param {Object} transactionContext Optional transaction. @returns {Promise<void>} Acknowledged transition. */
    transition: async function (request, parent, patch, transactionContext) {
        const query = {
            code: parent.code,
            tenantCode: parent.tenantCode,
            enterpriseCode: parent.enterpriseCode,
            principalCode: parent.principalCode,
            state: parent.state,
            updatedAt: parent.updatedAt,
            writerToken: parent.writerToken ?? null,
            ...(parent.retentionOperation
                ? {
                      'retentionOperation.code': parent.retentionOperation.code,
                      'retentionOperation.revision':
                          parent.retentionOperation.revision,
                  }
                : { retentionOperation: null }),
        };
        const result = this.result(
            await SERVICE.DefaultCopilotConversationRecordService.update({
                tenant: request.tenant,
                authData: request.authData,
                query,
                model: patch,
                ...(transactionContext
                    ? { transactionContext }
                    : { internalPersistence: 'DURABLE_JOURNAL' }),
            }),
        );
        if (result.matchedCount !== 1) this.fail();
    },
    /** Persists reviewed intent once; acquisition and content removal require a separate explicit advance. @param {Object} request Confirmed review. @returns {Promise<Object>} Original operation reference. */
    begin: async function (request) {
        const body = request.body || {};
        if (
            Object.keys(body).sort().join() !==
                'confirmed,reason,reviewDigest' ||
            body.confirmed !== true
        )
            this.fail();
        const value = await this.prepare(request);
        if (body.reviewDigest !== value.reviewDigest) this.fail();
        const operation = {
            code: 'retention-' + crypto.randomUUID(),
            revision: 1,
            state: 'PREPARED',
            actor: value.scope.actor,
            policyRevision: value.revision,
            policyDigest: this.digest(value.policy),
            reason: value.reason,
            originalState: value.parent.state,
            eligibleUpdatedAt: value.parent.updatedAt,
            preparedAt: new Date().toISOString(),
            stage: 0,
            removed: { messages: 0, events: 0, turns: 0 },
        };
        await this.transition(request, value.parent, {
            retentionOperation: operation,
        });
        if (
            JSON.stringify(this.admission(request, false)) !==
            JSON.stringify(value.scope)
        )
            this.fail();
        return this.projection(value.parent, operation);
    },
    /** Projects only scoped status/counts; private reason, policy, fence and user content are withheld. @param {Object} parent Parent identity. @param {Object} operation Durable operation. @returns {Object} Public receipt. */
    projection: function (parent, operation) {
        return {
            contractVersion: 1,
            context: {
                tenantCode: parent.tenantCode,
                enterpriseCode: parent.enterpriseCode,
            },
            conversationCode: parent.code,
            operationCode: operation.code,
            revision: operation.revision,
            state: operation.state,
            removed: { ...operation.removed },
            completedAt: operation.completedAt || null,
        };
    },
    /** Validates the persisted operation against the original actor and explicit recovery handle. @param {Object} request Trusted command. @param {Object} scope Scope. @param {Object} parent Parent. @returns {Object} Operation. */
    operation: function (request, scope, parent) {
        const operation = parent.retentionOperation;
        if (
            !operation ||
            (request.body?.operationCode !== undefined &&
                operation.code !== request.body.operationCode) ||
            operation.actor !== scope.actor ||
            !/^retention-[a-f0-9-]{36}$/.test(operation.code || '') ||
            !/^[a-f0-9]{64}$/.test(operation.policyDigest || '') ||
            !['CLOSED', 'ARCHIVED'].includes(operation.originalState) ||
            !Number.isFinite(Date.parse(operation.preparedAt)) ||
            operation.revision < 1 ||
            !/^[a-f0-9]{64}$/.test(operation.policyRevision || '') ||
            !Number.isSafeInteger(operation.revision) ||
            !['PREPARED', 'RESUMING', 'PURGING', 'PURGED', 'STOPPED'].includes(
                operation.state,
            ) ||
            !Number.isSafeInteger(operation.stage) ||
            operation.stage < 0 ||
            operation.stage > 3 ||
            !operation.removed ||
            ['messages', 'events', 'turns'].some(
                (key) =>
                    !Number.isSafeInteger(operation.removed[key]) ||
                    operation.removed[key] < 0,
            )
        )
            this.fail();
        const terminal = ['PURGED', 'STOPPED'].includes(operation.state);
        if (
            (terminal
                ? !Number.isFinite(Date.parse(operation.completedAt))
                : operation.completedAt != null) ||
            (operation.state === 'PREPARED' &&
                (operation.revision !== 1 ||
                    operation.stage !== 0 ||
                    parent.state !== operation.originalState ||
                    Object.values(operation.removed).some(
                        (count) => count !== 0,
                    ))) ||
            (operation.state === 'PURGING' &&
                (parent.state !== 'PURGING' ||
                    operation.stage >= 3 ||
                    operation.revision < 2)) ||
            (operation.state === 'RESUMING' &&
                (parent.state !== 'RETENTION_STOPPED' ||
                    operation.stage >= 3 ||
                    operation.revision < 3 ||
                    !operation.resumptions?.length)) ||
            (operation.state === 'PURGED' &&
                (parent.state !== 'PURGED' ||
                    operation.stage !== 3 ||
                    operation.revision < 2)) ||
            (operation.state === 'STOPPED' &&
                (parent.state !== 'RETENTION_STOPPED' ||
                    operation.revision < 2))
        )
            this.fail();
        if (
            operation.resumptions !== undefined &&
            (!Array.isArray(operation.resumptions) ||
                operation.resumptions.length > 20 ||
                operation.resumptions.some(
                    (entry, index, entries) =>
                        !entry ||
                        !Number.isSafeInteger(entry.revision) ||
                        entry.revision < 3 ||
                        entry.revision > operation.revision ||
                        (index > 0 &&
                            entry.revision <= entries[index - 1].revision) ||
                        !/^[a-f0-9]{64}$/.test(entry.policyRevision || '') ||
                        !/^[a-f0-9]{64}$/.test(
                            entry.previousPolicyRevision || '',
                        ) ||
                        !Number.isFinite(Date.parse(entry.stoppedAt)) ||
                        !Number.isFinite(Date.parse(entry.reviewedAt)) ||
                        typeof entry.reason !== 'string' ||
                        !entry.reason.trim() ||
                        entry.reason.length > 500,
                ))
        )
            this.fail();
        return operation;
    },
    /** Reviews a stopped original operation against current policy without reacquiring a fence or deleting data. @param {Object} request Original handle, revision and reason. @returns {Promise<Object>} Private review evidence. */
    prepareResume: async function (request) {
        const scope = this.admission(request);
        const current =
            await SERVICE.DefaultCopilotAdministrationService.current(request);
        const parent = await this.parent(
            request,
            scope,
            request.conversationCode,
        );
        const operation = this.operation(request, scope, parent);
        const policy =
            SERVICE.DefaultCopilotConversationLifecycleService.policy(
                current.configuration.conversation,
                scope,
            );
        const reason = request.body?.reason;
        if (
            operation.state !== 'STOPPED' ||
            operation.stage >= 3 ||
            operation.revision !== request.body?.expectedRevision ||
            !Number.isFinite(Date.parse(operation.eligibleUpdatedAt)) ||
            Date.parse(operation.eligibleUpdatedAt) >=
                Date.now() - policy.retentionDays * 86400000 ||
            (operation.resumptions?.length || 0) >= 20 ||
            !/^[a-f0-9]{64}$/.test(current.revision || '') ||
            policy.holdAll ||
            policy.conversationCodes.includes(parent.code) ||
            typeof reason !== 'string' ||
            !reason.trim() ||
            reason.length > 500
        )
            this.fail();
        const fence =
            await SERVICE.DefaultRuntimePropertyReadFenceService.inspect(
                request,
                {
                    ownerModule: 'copilotConversation',
                    operationCode: operation.code,
                    revision: current.revision,
                },
            );
        if (
            fence ||
            JSON.stringify(this.admission(request)) !== JSON.stringify(scope)
        )
            this.fail();
        return {
            scope,
            parent,
            operation,
            policy,
            revision: current.revision,
            reason,
            reviewDigest: this.digest({
                scope,
                code: parent.code,
                operation,
                revision: current.revision,
                policy,
                reason,
            }),
        };
    },
    /** Projects a fresh resumption review; stale/missing original progress is never reconstructed. @param {Object} request Original handle, revision and reason. @returns {Promise<Object>} Inert scoped review. */
    previewResume: async function (request) {
        if (
            Object.keys(request.body || {})
                .sort()
                .join() !== 'expectedRevision,operationCode,reason'
        )
            this.fail();
        const value = await this.prepareResume(request);
        return {
            contractVersion: 1,
            context: {
                tenantCode: value.scope.tenantCode,
                enterpriseCode: value.scope.enterpriseCode,
            },
            state: 'REVIEWED',
            conversationCode: value.parent.code,
            reviewDigest: value.reviewDigest,
            policyRevision: value.revision,
            maximumBatch: value.scope.batch,
            retained: [
                'CONVERSATION_TOMBSTONE',
                'TRANSCRIPT_ACCESS_AUDIT',
                'ACTION_AUDIT',
                'PROVIDER_ACCOUNTING',
            ],
        };
    },
    /** Records explicit reauthorization of the same stopped operation, preserving counts/cutoff and frozen writers; the next advance acquires the new policy fence. @param {Object} request Confirmed fresh review. @returns {Promise<Object>} Original operation with a new revision. */
    resume: async function (request) {
        if (
            Object.keys(request.body || {})
                .sort()
                .join() !==
                'confirmed,expectedRevision,operationCode,reason,reviewDigest' ||
            request.body.confirmed !== true
        )
            this.fail();
        const value = await this.prepareResume(request);
        if (request.body.reviewDigest !== value.reviewDigest) this.fail();
        const next = {
            ...value.operation,
            revision: value.operation.revision + 1,
            state: 'RESUMING',
            completedAt: null,
            policyRevision: value.revision,
            policyDigest: this.digest(value.policy),
            resumptions: [
                ...(value.operation.resumptions || []),
                {
                    revision: value.operation.revision + 1,
                    policyRevision: value.revision,
                    previousPolicyRevision: value.operation.policyRevision,
                    stoppedAt: value.operation.completedAt,
                    reviewedAt: new Date().toISOString(),
                    reason: value.reason,
                },
            ],
        };
        await this.transition(request, value.parent, {
            retentionOperation: next,
        });
        const parent = await this.parent(
            request,
            value.scope,
            request.conversationCode,
        );
        const observed = this.operation(request, value.scope, parent);
        if (
            observed.revision !== next.revision ||
            observed.state !== 'RESUMING' ||
            JSON.stringify(observed) !== JSON.stringify(next) ||
            JSON.stringify(this.admission(request, false)) !==
                JSON.stringify(value.scope)
        )
            this.fail();
        return this.projection(parent, observed);
    },
    /** Inspects original operation evidence, including a lost begin response, without acquiring a fence or replaying a write. @param {Object} request Original actor and optional operationCode. @returns {Promise<Object>} Current receipt. */
    inspect: async function (request) {
        if (
            Object.keys(request.body || {}).some(
                (key) => key !== 'operationCode',
            )
        )
            this.fail();
        const scope = this.admission(request, false);
        const parent = await this.parent(
            request,
            scope,
            request.conversationCode,
        );
        const operation = this.operation(request, scope, parent);
        if (
            JSON.stringify(this.admission(request, false)) !==
            JSON.stringify(scope)
        )
            this.fail();
        return this.projection(parent, operation);
    },
    /** Stops further deletion and releases the original fence only after a durable frozen terminal record; never restores deleted content or reopens writers. @param {Object} request Original operationCode and expectedRevision. @returns {Promise<Object>} Frozen terminal receipt. */
    stop: async function (request) {
        if (
            Object.keys(request.body || {})
                .sort()
                .join() !== 'expectedRevision,operationCode'
        )
            this.fail();
        const scope = this.admission(request, false);
        let parent = await this.parent(
            request,
            scope,
            request.conversationCode,
        );
        let operation = this.operation(request, scope, parent);
        if (operation.revision !== request.body.expectedRevision) this.fail();
        const fences = SERVICE.DefaultRuntimePropertyReadFenceService;
        const intent = {
            ownerModule: 'copilotConversation',
            operationCode: operation.code,
            revision: operation.policyRevision,
        };
        if (!['PURGED', 'STOPPED'].includes(operation.state)) {
            await SERVICE.DefaultDatabaseTransactionService.execute(
                { moduleName: 'copilotConversation', tenant: request.tenant },
                async (transactionContext) => {
                    parent = await this.parent(
                        request,
                        scope,
                        request.conversationCode,
                        transactionContext,
                    );
                    operation = this.operation(request, scope, parent);
                    if (
                        operation.revision !== request.body.expectedRevision ||
                        !['PREPARED', 'RESUMING', 'PURGING'].includes(
                            operation.state,
                        ) ||
                        JSON.stringify(this.admission(request, false)) !==
                            JSON.stringify(scope)
                    )
                        this.fail();
                    const next = {
                        ...operation,
                        revision: operation.revision + 1,
                        state: 'STOPPED',
                        completedAt: new Date().toISOString(),
                    };
                    await this.transition(
                        request,
                        parent,
                        {
                            state: 'RETENTION_STOPPED',
                            retentionOperation: next,
                        },
                        transactionContext,
                    );
                },
            );
        }
        parent = await this.parent(request, scope, request.conversationCode);
        operation = this.operation(request, scope, parent);
        if (
            !(
                (operation.state === 'STOPPED' &&
                    parent.state === 'RETENTION_STOPPED') ||
                (operation.state === 'PURGED' && parent.state === 'PURGED')
            ) ||
            JSON.stringify(this.admission(request, false)) !==
                JSON.stringify(scope)
        )
            this.fail();
        const currentPolicy =
            await SERVICE.DefaultCopilotAdministrationService.current(request);
        if (
            !/^[a-f0-9]{64}$/.test(currentPolicy.revision || '') ||
            JSON.stringify(this.admission(request, false)) !==
                JSON.stringify(scope)
        )
            this.fail();
        // A released terminal fence can outlive its property revision; an active fence prevents that revision from changing.
        intent.revision = currentPolicy.revision;
        const fence = await fences.inspect(request, intent);
        if (fence) await fences.release(request, intent, fence.token);
        return this.projection(parent, operation);
    },
    /** Checks pinned policy and identity while the private fence prevents concurrent governed hold changes. @param {Object} request Trusted command. @param {Object} scope Initial scope. @param {Object} parent Parent. @param {Object} operation Operation. @returns {void} Throws when revoked or drifted. */
    guard: function (request, scope, parent, operation) {
        const policy =
            SERVICE.DefaultCopilotConversationLifecycleService.policy(
                CONFIG.get('copilot').conversation,
                scope,
            );
        if (
            JSON.stringify(this.admission(request)) !== JSON.stringify(scope) ||
            this.digest(policy) !== operation.policyDigest ||
            policy.holdAll ||
            policy.conversationCodes.includes(parent.code)
        )
            this.fail();
    },
    /** Performs at most one bounded deletion page and journals it in the same parent transaction; explicit later calls advance remaining stages. @param {Object} request Original operationCode and expectedRevision. @returns {Promise<Object>} Durable progress or terminal receipt. */
    advance: async function (request) {
        if (
            Object.keys(request.body || {})
                .sort()
                .join() !== 'expectedRevision,operationCode'
        )
            this.fail();
        const scope = this.admission(request);
        let parent = await this.parent(
            request,
            scope,
            request.conversationCode,
        );
        let operation = this.operation(request, scope, parent);
        if (operation.revision !== request.body.expectedRevision) this.fail();
        if (operation.state === 'STOPPED') this.fail();
        const fences = SERVICE.DefaultRuntimePropertyReadFenceService;
        const intent = {
            ownerModule: 'copilotConversation',
            operationCode: operation.code,
            revision: operation.policyRevision,
        };
        let fence = await fences.inspect(request, intent);
        if (operation.state === 'PURGED') {
            if (parent.state !== 'PURGED') this.fail();
            if (
                JSON.stringify(this.admission(request, false)) !==
                JSON.stringify(scope)
            )
                this.fail();
            if (fence) await fences.release(request, intent, fence.token);
            return this.projection(parent, operation);
        }
        this.guard(request, scope, parent, operation);
        if (!fence) {
            if (!['PREPARED', 'RESUMING'].includes(operation.state))
                this.fail();
            fence = await fences.acquire(request, intent);
        }
        await SERVICE.DefaultDatabaseTransactionService.execute(
            { moduleName: 'copilotConversation', tenant: request.tenant },
            async (transactionContext) => {
                parent = await this.parent(
                    request,
                    scope,
                    request.conversationCode,
                    transactionContext,
                );
                operation = this.operation(request, scope, parent);
                if (
                    operation.revision !== request.body.expectedRevision ||
                    (operation.state === 'PREPARED'
                        ? parent.state !== operation.originalState
                        : operation.state === 'RESUMING'
                          ? parent.state !== 'RETENTION_STOPPED'
                          : parent.state !== 'PURGING')
                )
                    this.fail();
                this.guard(request, scope, parent, operation);
                const next = structuredClone(operation);
                next.state = 'PURGING';
                next.revision++;
                const stores = [
                    ['messages', 'DefaultCopilotMessageService'],
                    ['events', 'DefaultCopilotEventService'],
                    ['turns', 'DefaultCopilotTurnService'],
                ];
                const binding = {
                    conversationCode: parent.code,
                    tenantCode: parent.tenantCode,
                    enterpriseCode: parent.enterpriseCode,
                    principalCode: parent.principalCode,
                };
                if (next.stage < stores.length) {
                    const [key, name] = stores[next.stage];
                    const rows = this.result(
                        await SERVICE[name].get({
                            tenant: request.tenant,
                            authData: request.authData,
                            transactionContext,
                            query: { conversationCode: parent.code },
                            searchOptions: {
                                pageNumber: 1,
                                pageSize: scope.batch,
                            },
                            options: { skipItemCache: true },
                        }),
                    );
                    if (
                        !Array.isArray(rows) ||
                        rows.length > scope.batch ||
                        new Set(rows.map((row) => row.code)).size !==
                            rows.length ||
                        rows.some(
                            (row) =>
                                typeof row.code !== 'string' ||
                                !row.code ||
                                Object.entries(binding).some(
                                    ([field, value]) => row[field] !== value,
                                ),
                        )
                    )
                        this.fail();
                    if (rows.length) {
                        const removed = this.result(
                            await SERVICE[name].remove({
                                tenant: request.tenant,
                                authData: request.authData,
                                transactionContext,
                                query: {
                                    ...binding,
                                    code: { $in: rows.map((row) => row.code) },
                                },
                            }),
                        );
                        if (removed.deletedCount !== rows.length) this.fail();
                        next.removed[key] += rows.length;
                        if (!Number.isSafeInteger(next.removed[key]))
                            this.fail();
                    } else next.stage++;
                }
                if (next.stage === stores.length) {
                    next.state = 'PURGED';
                    next.completedAt = new Date().toISOString();
                }
                this.guard(request, scope, parent, operation);
                await this.transition(
                    request,
                    parent,
                    {
                        state: next.state,
                        retentionOperation: next,
                        ...(next.state === 'PURGED'
                            ? { title: null, lastSequence: 0 }
                            : {}),
                    },
                    transactionContext,
                );
                this.guard(request, scope, parent, operation);
            },
        );
        const observed = await this.parent(
            request,
            scope,
            request.conversationCode,
        );
        const stored = this.operation(request, scope, observed);
        if (
            JSON.stringify(this.admission(request, false)) !==
            JSON.stringify(scope)
        )
            this.fail();
        if (
            stored.revision !== request.body.expectedRevision + 1 ||
            !['PURGING', 'PURGED'].includes(stored.state)
        )
            this.fail();
        if (stored.state === 'PURGED')
            await fences.release(request, intent, fence.token);
        return this.projection(observed, stored);
    },
};
