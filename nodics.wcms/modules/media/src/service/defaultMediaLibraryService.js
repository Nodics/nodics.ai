/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';

/**
 * @module media/service/DefaultMediaLibraryService
 * @description Supplies bounded path-free library reads and exact-version publication initiation through existing Media and nPublish owners.
 * @layer service
 * @owner media
 * @override Later layers may customize presentation and narrow read scope; preserve signed tenant/enterprise scope, permission checks and exact-version publication gates.
 */
module.exports = {
    /** Rejects unsupported input or authority without exposing provider material. */
    fail: function () {
        throw new CLASSES.NodicsError(
            'ERR_MED_00023',
            'Media library operation is unavailable or invalid'
        );
    },
    /** Uses canonical hydrated/current group grants rather than interpreting a group name as authority. */
    permitted: function (request, permission) {
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        return !!(
            security &&
            typeof security.getGrantedPermissions === 'function' &&
            typeof security.isPermissionGranted === 'function' &&
            security.isPermissionGranted(
                permission,
                security.getGrantedPermissions(request),
                {}
            )
        );
    },
    /** Requires a human access context with authoritative tenant and enterprise binding. */
    assertOperator: function (request, permission) {
        const auth = request && request.authData;
        if (
            !auth ||
            auth.tokenType !== 'access' ||
            typeof auth.tenant !== 'string' ||
            !auth.tenant ||
            request.tenant !== auth.tenant ||
            !this.identifier(auth.entCode) ||
            !this.permitted(request, permission)
        )
            this.fail();
    },
    /** Accepts bounded opaque identities only, never query expressions or storage paths. */
    identifier: function (value) {
        return (
            typeof value === 'string' &&
            /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(value)
        );
    },
    /** Rejects unknown public DTO fields before constructing any owner query. */
    assertInput: function (input, keys) {
        if (
            !input ||
            ![Object.prototype, null].includes(Object.getPrototypeOf(input)) ||
            Object.keys(input).some((key) => !keys.includes(key))
        )
            this.fail();
    },
    /** Parses form/query decimal values without accepting coercion, fractions or scientific notation. */
    integer: function (value, fallback, minimum, maximum) {
        if (value === undefined || value === '') return fallback;
        if (typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value))
            value = Number(value);
        if (!Number.isSafeInteger(value) || value < minimum || value > maximum)
            this.fail();
        return value;
    },
    /** Includes current-enterprise records and unowned PUBLIC records, never another enterprise's private metadata. */
    scope: function (request) {
        return {
            $or: [
                { enterpriseCode: request.authData.entCode },
                { enterpriseCode: { $in: [null, ''] }, access: 'PUBLIC' }
            ]
        };
    },
    /** Rechecks owner results before projection; provider/query contract violations fail closed. */
    inScope: function (record, request) {
        return (
            record &&
            (record.enterpriseCode === request.authData.entCode ||
                ((record.enterpriseCode === undefined ||
                    record.enterpriseCode === null ||
                    record.enterpriseCode === '') &&
                    record.access === 'PUBLIC'))
        );
    },
    /** Ordinary metadata is readable, but a versioned model must prove CURRENT selection rather than returning history as current. */
    currentModel: function (request) {
        const models =
            typeof NODICS !== 'undefined' &&
            typeof NODICS.getModels === 'function' &&
            NODICS.getModels('media', request.tenant);
        const name =
            typeof UTILS !== 'undefined' &&
            typeof UTILS.createModelName === 'function' &&
            UTILS.createModelName('media');
        const model = models && name && models[name];
        if (
            !model ||
            (model.versioned === true &&
                (!model.rawSchema ||
                    model.rawSchema.versionedReadMode !== 'CURRENT'))
        )
            this.fail();
        return model;
    },
    /** Reports fixed, safe failed source checks without disclosing provider errors, paths or credentials. */
    publicationSourceBlockers: function (request) {
        const blockers = [];
        const add = (code, owner, message) =>
            blockers.push({ code, owner, message });
        const policy = (CONFIG.get('media') || {}).publication || {};
        if (policy.versionProviderEnabled !== true)
            add(
                'MEDIA_PROVIDER_UNSELECTED',
                'media',
                'Retained Media publication provider is not selected for this deployment.'
            );
        if (policy.runtimeRole !== 'STAGED')
            add(
                'MEDIA_STAGED_REQUIRED',
                'media',
                'Inspect and request publication through the registered WCMS Staged owner.'
            );
        if (CONFIG.get('publishEnabled') === false)
            add(
                'PUBLISHING_DISABLED',
                'publish',
                'Publishing is disabled for this runtime.'
            );
        const lifecycle = SERVICE.DefaultPublicationLifecycleService;
        const provider = SERVICE.DefaultMediaPublicationVersionProviderService;
        const retained = SERVICE.DefaultMediaRetainedPublicationService;
        if (
            !provider ||
            typeof provider.createGoverned !== 'function' ||
            !retained ||
            !lifecycle ||
            typeof lifecycle.getWorkflowProvider !== 'function' ||
            typeof lifecycle.getDomainAdapter !== 'function' ||
            typeof lifecycle.getVersionProvider !== 'function'
        ) {
            add(
                'MEDIA_OWNER_UNAVAILABLE',
                'media',
                'The required Media and publication owner services are unavailable.'
            );
            return blockers;
        }
        try {
            retained.assertVersionedSource(request);
        } catch (_) {
            add(
                'MEDIA_CURRENT_STORAGE_REQUIRED',
                'media',
                'Installed Media storage must expose immutable CURRENT versions.'
            );
        }
        if (
            policy.versionProviderEnabled === true &&
            policy.runtimeRole === 'STAGED'
        ) {
            try {
                retained.transactionScope(request);
            } catch (_) {
                add(
                    'MEDIA_ATOMIC_STORAGE_REQUIRED',
                    'database',
                    'Connected Media storage must prove multi-record atomic transactions and context propagation.'
                );
            }
        }
        try {
            if (
                !lifecycle.getWorkflowProvider('media') ||
                !lifecycle.getDomainAdapter('media') ||
                lifecycle.getVersionProvider('media') !== provider
            )
                add(
                    'MEDIA_PROVIDER_REGISTRATION_REQUIRED',
                    'publish',
                    'The selected Media workflow, domain and retained version providers must be registered.'
                );
        } catch (_) {
            add(
                'MEDIA_PROVIDER_REGISTRATION_REQUIRED',
                'publish',
                'The selected Media workflow, domain and retained version providers must be registered.'
            );
        }
        return blockers;
    },
    /** Reports installation prerequisites without enabling a provider or manufacturing a version. */
    publicationReady: function (request) {
        return this.publicationSourceBlockers(request).length === 0;
    },
    /** Names only fixed operation grants absent from the caller's canonical current authority. */
    publicationPermissionBlockers: function (request) {
        const missing = [
            'publish.lifecycle.create',
            'publish.lifecycle.validate',
            'publish.lifecycle.requestApproval',
            'process.instance.start',
            'process.definition.read'
        ].filter((permission) => !this.permitted(request, permission));
        return missing.length
            ? [
                  {
                      code: 'PUBLICATION_PERMISSIONS_REQUIRED',
                      owner: 'authorization',
                      requiredPermissions: missing,
                      message:
                          'Caller requires publication permissions: ' +
                          missing.join(', ') +
                          '.'
                  }
              ]
            : [];
    },
    /** All permissions for the existing combined create/validate/request-approval operation are required. */
    canRequest: function (request) {
        return (
            this.publicationReady(request) &&
            this.publicationPermissionBlockers(request).length === 0
        );
    },
    /** Proves the selected workflow's published current version using its existing authenticated Process read boundary. */
    workflowReadiness: async function (request) {
        const evidence = {
            code: 'mediaPublicationApproval',
            availability: 'UNCONFIRMED',
            releaseCode: 'media:mediaPublicationWorkflow',
            selectionPolicy: 'EXPLICIT',
            owner: 'workflow',
            blockerCode: 'PROCESS_DEFINITION_INSPECTION_REQUIRED',
            blocker:
                'Verify or explicitly install and publish the selected Media approval definition in Process'
        };
        const blockers = [
            ...this.publicationSourceBlockers(request),
            ...this.publicationPermissionBlockers(request)
        ];
        if (blockers.length) {
            evidence.availability = 'NOT_INSPECTED';
            evidence.blockerCode = blockers[0].code;
            evidence.blocker = blockers[0].message;
            return evidence;
        }
        const block = (code, message) => {
            evidence.blockerCode = code;
            evidence.blocker = message;
            return evidence;
        };
        let processReadStarted = false;
        try {
            const provider =
                SERVICE.DefaultPublicationLifecycleService.getWorkflowProvider(
                    'media'
                );
            if (
                !provider ||
                typeof provider.policy !== 'function' ||
                typeof provider.target !== 'function' ||
                typeof provider.assertSource !== 'function'
            )
                return block(
                    'PUBLICATION_WORKFLOW_POLICY_REQUIRED',
                    'The selected publication workflow provider must expose its governed Media policy and Process target.'
                );
            block(
                'PUBLICATION_WORKFLOW_POLICY_REQUIRED',
                'The selected Media workflow policy and Staged source authority must be valid.'
            );
            const policy = provider.policy('media');
            provider.assertSource(policy);
            if (
                !this.identifier(policy.definitionCode) ||
                policy.ownerModule !== 'media' ||
                policy.requesterBinding !== 'NATIVE_ACTOR' ||
                policy.reviewNodeCode !== 'mediaReview' ||
                policy.reviewPermission !== 'publish.lifecycle.approve'
            )
                return evidence;
            evidence.code = policy.definitionCode;
            block(
                'PROCESS_TARGET_REQUIRED',
                'The selected workflow requires an explicit registered Process target.'
            );
            const target = provider.target();
            const authorization =
                request.httpRequest &&
                request.httpRequest.headers &&
                (request.httpRequest.headers.authorization ||
                    request.httpRequest.headers.Authorization);
            if (
                typeof authorization !== 'string' ||
                !/^Bearer \S+$/.test(authorization)
            )
                return block(
                    'HUMAN_BEARER_REQUIRED',
                    'Fresh Process inspection requires the original authenticated operator bearer.'
                );
            if (
                !target ||
                target.runtimeRole !== 'PROCESS' ||
                !target.connectionName ||
                target.connectionName === 'default' ||
                !SERVICE.DefaultModuleService ||
                typeof SERVICE.DefaultModuleService.invokeModule !== 'function'
            )
                return evidence;
            block(
                'PROCESS_INSPECTION_UNCONFIRMED',
                'Process definition inspection is unavailable or denied. Verify the registered Process target and caller access.'
            );
            const read = async (suffix) =>
                SERVICE.DefaultModuleService.invokeModule({
                    moduleName: 'workflow',
                    connectionName: target.connectionName,
                    connectionType: target.connectionType,
                    targetAuthority: { runtimeRole: 'PROCESS' },
                    local: false,
                    tenant: request.tenant,
                    header: {
                        Authorization: authorization,
                        tenant: request.tenant,
                        'x-enterprise-code': request.authData.entCode
                    },
                    methodName: 'GET',
                    apiName:
                        '/definitions/' +
                        encodeURIComponent(policy.definitionCode) +
                        suffix,
                    timeoutMs: Math.min(
                        5000,
                        Math.max(1, Number(target.timeoutMs) || 5000)
                    ),
                    maxAttempts: 1,
                    responseSelector: (response) =>
                        (response && (response.data || response.result)) ||
                        response
                });
            processReadStarted = true;
            const definition = await read('');
            if (
                !definition ||
                definition.code !== policy.definitionCode ||
                definition.active !== true ||
                definition.ownerModule !== policy.ownerModule ||
                definition.status !== 'PUBLISHED' ||
                !Number.isSafeInteger(definition.currentVersion) ||
                definition.currentVersion < 1
            ) {
                evidence.availability = 'BLOCKED';
                return block(
                    'PROCESS_PUBLISHED_DEFINITION_REQUIRED',
                    'The selected Media approval definition must be active and published with a current version in Process. Install the explicit Media workflow release if absent.'
                );
            }
            const versions = await read('/versions');
            if (!Array.isArray(versions) || versions.length > 100)
                return evidence;
            const selected = versions.filter(
                (version) =>
                    version.definitionCode === definition.code &&
                    version.version === definition.currentVersion
            );
            if (
                selected.length !== 1 ||
                selected[0].active !== true ||
                selected[0].status !== 'PUBLISHED'
            ) {
                evidence.availability = 'BLOCKED';
                return block(
                    'PROCESS_CURRENT_VERSION_REQUIRED',
                    'The selected Process current version must exist exactly once and be active and published.'
                );
            }
            const fresh = await read('');
            const candidate = selected[0];
            const review = (candidate.graph && candidate.graph.nodes || []).filter(node => node.code === 'mediaReview');
            const actor = candidate.policy && candidate.policy.actorPolicy;
            const requiredActor = { permission: 'publish.lifecycle.approve', enterpriseContextField: 'enterpriseCode', requesterContextField: 'requestedBy' };
            const decision = review.length === 1 && review[0].policy && review[0].policy.decisionContract;
            const decisionKeys = ['contractVersion', 'kind', 'approveLabel', 'rejectLabel', 'reasonLabel', 'rejectionReasonRequired', 'maximumReasonLength'];
            if (!actor || Object.keys(actor).length !== Object.keys(requiredActor).length ||
                Object.keys(requiredActor).some(key => actor[key] !== requiredActor[key]) ||
                !decision || Object.keys(decision).length !== decisionKeys.length ||
                Object.keys(decision).some(key => !decisionKeys.includes(key)) ||
                decision.contractVersion !== 1 || decision.kind !== 'APPROVAL' ||
                decision.rejectionReasonRequired !== true || decision.maximumReasonLength !== 1000 ||
                ['approveLabel', 'rejectLabel', 'reasonLabel'].some(key => typeof decision[key] !== 'string' || !decision[key].trim() || decision[key].length > 200) ||
                (review[0].policy.actorPolicy !== undefined &&
                    !require('node:util').isDeepStrictEqual(review[0].policy.actorPolicy, actor))) {
                evidence.availability = 'BLOCKED';
                return block('PROCESS_MEDIA_DECISION_POLICY_REQUIRED',
                    'Update the explicit media:mediaPublicationWorkflow release to 1.0.1 and verify its published native permission-based reviewer and approval decision policy. Existing v1 tasks are not upgraded.');
            }
            if (
                !fresh ||
                fresh.code !== definition.code ||
                fresh.active !== true ||
                fresh.status !== 'PUBLISHED' ||
                fresh.ownerModule !== policy.ownerModule ||
                fresh.currentVersion !== definition.currentVersion
            )
                return block(
                    'PROCESS_CURRENT_VERSION_CHANGED',
                    'The Process current version changed during inspection. Refresh inspection before requesting publication.'
                );
            evidence.availability = 'PUBLISHED_CURRENT';
            evidence.version = definition.currentVersion;
            delete evidence.blocker;
            delete evidence.blockerCode;
        } catch (error) {
            if (
                processReadStarted &&
                error &&
                error.code === 'ERR_PROCESS_00002' &&
                String(error.status || error.responseCode) === '404'
            ) {
                evidence.availability = 'BLOCKED';
                return block(
                    'PROCESS_MEDIA_DEFINITION_MISSING',
                    'Process reports the selected Media approval definition was not found. Verify its governed read and media:mediaPublicationWorkflow release receipt; install and publish that explicit release only if absent.'
                );
            }
            /* Remote absence, denial or uncertainty never enables initiation. */
        }
        return evidence;
    },
    /** Whitelists business metadata; no locator, bytes, provider credentials or private evidence enters this DTO. */
    project: function (record, request, workflow) {
        if (!this.inScope(record, request) || !this.identifier(record.code))
            this.fail();
        const dto = { code: record.code };
        for (const key of [
            'name',
            'description',
            'folderCode',
            'formatCode',
            'mimeType',
            'extension',
            'status',
            'access'
        ]) {
            if (typeof record[key] === 'string')
                dto[key] = record[key].slice(
                    0,
                    key === 'description' ? 512 : 192
                );
        }
        if (Number.isSafeInteger(record.sizeBytes) && record.sizeBytes >= 0)
            dto.sizeBytes = record.sizeBytes;
        dto.versionId =
            this.currentModel(request).versioned === true &&
            Number.isSafeInteger(record.versionId) &&
            record.versionId >= 0
                ? record.versionId
                : null;
        dto.publicationRequestAvailable =
            this.canRequest(request) &&
            workflow.availability === 'PUBLISHED_CURRENT' &&
            record.active === true &&
            record.status === 'READY' &&
            dto.versionId !== null;
        dto.publicationReadiness = {
            sourcePrerequisites: this.canRequest(request)
                ? 'SATISFIED'
                : 'BLOCKED',
            installedQualification: 'UNCONFIRMED',
            workflowDefinition: workflow,
            onlinePublication: 'UNCONFIRMED'
        };
        const blockers = [
            ...this.publicationSourceBlockers(request),
            ...this.publicationPermissionBlockers(request)
        ];
        if (
            workflow.availability !== 'PUBLISHED_CURRENT' &&
            blockers.length === 0
        )
            blockers.push({
                code: workflow.blockerCode || 'PROCESS_INSPECTION_UNCONFIRMED',
                owner: workflow.owner,
                message: workflow.blocker
            });
        if (record.active !== true || record.status !== 'READY')
            blockers.push({
                code: 'MEDIA_READY_REQUIRED',
                owner: 'media',
                message: 'The selected Media asset must be active and READY.'
            });
        if (dto.versionId === null)
            blockers.push({
                code: 'MEDIA_EXACT_VERSION_REQUIRED',
                owner: 'media',
                message:
                    'The selected Media asset requires an exact immutable CURRENT version.'
            });
        dto.publicationReadiness.blockers = blockers;
        dto.publicationReadiness.message = blockers.length
            ? blockers
                  .map((blocker) => blocker.message)
                  .join(' ')
                  .slice(0, 512)
            : 'Source and Process prerequisites are satisfied. Publication still requires explicit submission and governed approval.';
        dto.commands = dto.publicationRequestAvailable
            ? [
                  {
                      id: 'requestPublication',
                      method: 'POST',
                      path: '/library/publications',
                      mediaCode: record.code,
                      versionId: dto.versionId,
                      approvalRequired: true
                  }
              ]
            : [];
        return dto;
    },
    /** Reads one fixed bounded page through generated Media authority; fresh metadata is never replaced by cached UI state. */
    list: async function (input, request) {
        this.assertOperator(request, 'media.storage.policy.view');
        this.assertInput(input, [
            'code',
            'folderCode',
            'status',
            'pageNumber',
            'pageSize'
        ]);
        this.currentModel(request);
        const pageNumber = this.integer(input.pageNumber, 1, 1, 10000);
        const pageSize = this.integer(input.pageSize, 50, 1, 100);
        const query = this.scope(request);
        for (const key of ['code', 'folderCode', 'status']) {
            if (input[key] !== undefined && input[key] !== '') {
                if (!this.identifier(input[key])) this.fail();
                query[key] = input[key];
            }
        }
        const owner = SERVICE.DefaultMediaService;
        if (!owner || typeof owner.get !== 'function') this.fail();
        const response = await owner.get({
            tenant: request.tenant,
            authData: request.authData,
            query,
            skipcache: true,
            searchOptions: {
                pageSize,
                pageNumber,
                limit: pageSize,
                sort: { code: 1 }
            }
        });
        if (
            !response ||
            !Array.isArray(response.result) ||
            response.result.length > pageSize
        )
            this.fail();
        const workflow = await this.workflowReadiness(request);
        return {
            items: response.result.map((record) =>
                this.project(record, request, workflow)
            ),
            pageNumber,
            pageSize,
            hasMore: response.result.length === pageSize
        };
    },
    /** Resolves exactly one current scoped row, rejecting absent or ambiguous evidence. */
    current: async function (mediaCode, request) {
        if (!this.identifier(mediaCode)) this.fail();
        this.currentModel(request);
        const owner = SERVICE.DefaultMediaService;
        if (!owner || typeof owner.get !== 'function') this.fail();
        const response = await owner.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { ...this.scope(request), code: mediaCode },
            skipcache: true,
            searchOptions: { limit: 2, pageSize: 2, pageNumber: 1 }
        });
        if (
            !response ||
            !Array.isArray(response.result) ||
            response.result.length !== 1 ||
            response.result[0].code !== mediaCode ||
            !this.inScope(response.result[0], request)
        )
            this.fail();
        return response.result[0];
    },
    /** Returns current record/version and only the commands this operator can initiate. */
    inspect: async function (input, request) {
        this.assertOperator(request, 'media.storage.policy.view');
        this.assertInput(input, ['mediaCode']);
        return this.project(
            await this.current(input.mediaCode, request),
            request,
            await this.workflowReadiness(request)
        );
    },
    /** Initiates existing nPublish approval from an explicit freshly verified version; never approves or activates. */
    requestPublication: async function (input, request) {
        this.assertOperator(request, 'media.storage.policy.view');
        this.assertInput(input, ['mediaCode', 'versionId', 'publicationCode']);
        const authorization =
            request.httpRequest &&
            request.httpRequest.headers &&
            (request.httpRequest.headers.authorization ||
                request.httpRequest.headers.Authorization);
        if (
            typeof authorization !== 'string' ||
            !/^Bearer \S+$/.test(authorization)
        )
            this.fail();
        if (
            !this.identifier(input.mediaCode) ||
            typeof input.publicationCode !== 'string' ||
            !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(
                input.publicationCode
            ) ||
            !this.canRequest(request) ||
            (await this.workflowReadiness(request)).availability !==
                'PUBLISHED_CURRENT'
        )
            this.fail();
        const versionId = this.integer(
            input.versionId,
            undefined,
            0,
            Number.MAX_SAFE_INTEGER
        );
        if (versionId === undefined) this.fail();
        const row = await this.current(input.mediaCode, request);
        if (
            row.active !== true ||
            row.status !== 'READY' ||
            row.versionId !== versionId
        )
            this.fail();
        const result =
            await FACADE.DefaultMediaStorageFacade.retainedPublication(
                'createGoverned',
                {
                    mediaCode: input.mediaCode,
                    versionId,
                    publicationCode: input.publicationCode
                },
                request
            );
        const publication = result && result.result;
        if (
            !publication ||
            publication.code !== input.publicationCode ||
            publication.domain !== 'media' ||
            publication.rootType !== 'media' ||
            publication.rootCode !== input.mediaCode ||
            !Number.isSafeInteger(publication.revision) ||
            publication.revision < 0 ||
            typeof publication.state !== 'string' ||
            !/^[A-Z_]{1,64}$/.test(publication.state)
        )
            this.fail();
        return {
            publicationCode: publication.code,
            mediaCode: input.mediaCode,
            versionId,
            state: publication.state,
            revision: publication.revision,
            approvalRequired: true
        };
    }
};
