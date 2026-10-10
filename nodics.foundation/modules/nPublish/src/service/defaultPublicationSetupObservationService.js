/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/**
 * @module nPublish/service/defaultPublicationSetupObservationService
 * @description Disabled-by-default, exact-plan deployment observations. Owns no readiness state or mutation authority.
 * @layer service
 * @owner nPublish
 * @override Preserve signed service identity, confined reviewed bytes and fresh generated owner reads.
 */
module.exports = {
    /**
     * Refuses invalid setup observation without changing readiness or publication state.
     * @returns {never} Always throws ERR_PUB_SETUP_OBSERVATION.
     */
    fail: function () { throw new CLASSES.NodicsError('ERR_PUB_SETUP_OBSERVATION'); },
    /**
     * Checks the bounded identifier syntax used by reviewed setup coordinates.
     * @param {*} value Candidate identifier; never coerced or mutated.
     * @returns {boolean} Whether the value matches the allowed 1..192-character syntax.
     */
    identifier: function (value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(value); },
    /**
     * Recursively sorts object keys and omits undefined object fields while preserving array order.
     * @param {*} value Acyclic JSON-like observation material; not mutated.
     * @returns {*} Canonicalized material for stable comparison and hashing.
     */
    canonical: function (value) {
        return Array.isArray(value) ? value.map(item => this.canonical(item)) : value && typeof value === 'object'
            ? Object.fromEntries(Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => [key, this.canonical(value[key])])) : value;
    },
    /**
     * Hashes canonical JSON, using the literal undefined marker when serialization is absent.
     * @param {*} value Observation material; not mutated.
     * @returns {string} SHA-256 hexadecimal digest; canonicalization/serialization errors propagate.
     */
    digest: function (value) { return crypto.createHash('sha256').update(JSON.stringify(this.canonical(value)) ?? 'undefined').digest('hex'); },
    /**
     * Reads enabled observation policy and validates its plan and source byte limits.
     * @returns {Object} Effective publish.setup.observation policy without mutation; throws if disabled or invalid.
     */
    policy: function () {
        const policy = CONFIG.get('publish')?.setup?.observation;
        if (policy?.enabled !== true || !Number.isSafeInteger(policy.maximumPlanBytes) ||
            policy.maximumPlanBytes < 1 || policy.maximumPlanBytes > 2097152 ||
            !Number.isSafeInteger(policy.maximumSourceBytes) || policy.maximumSourceBytes < 1 || policy.maximumSourceBytes > 67108864 ||
            !Number.isSafeInteger(policy.maximumSourcePayloadBytes) || policy.maximumSourcePayloadBytes < 1 ||
            policy.maximumSourcePayloadBytes > 16777216 || policy.maximumSourcePayloadBytes > policy.maximumSourceBytes) this.fail();
        return policy;
    },
    /** Reads bounded module-owned bytes without require(), symlink traversal or caller-selected paths. */
    bytes: function (reference) {
        let fd;
        try {
            if (!reference || !this.identifier(reference.moduleName) || typeof reference.path !== 'string' ||
                reference.path.includes('\\') || path.isAbsolute(reference.path) ||
                reference.path.split('/').some(part => !part || part === '.' || part === '..') ||
                !/^[a-f0-9]{64}$/.test(reference.checksum || '')) this.fail();
            const owner = NODICS.getRawModule(reference.moduleName);
            if (!owner || owner.name !== reference.moduleName || !owner.path) this.fail();
            const root = fs.realpathSync(owner.path);
            let resolved = root;
            for (const part of reference.path.split('/')) {
                resolved = path.join(resolved, part);
                if (fs.lstatSync(resolved).isSymbolicLink()) this.fail();
            }
            if (!fs.realpathSync(resolved).startsWith(root + path.sep)) this.fail();
            fd = fs.openSync(resolved, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
            const before = fs.fstatSync(fd), limit = this.policy().maximumPlanBytes;
            if (!before.isFile() || before.size < 1 || before.size > limit) this.fail();
            const bytes = Buffer.alloc(before.size);
            let offset = 0;
            while (offset < bytes.length) {
                const count = fs.readSync(fd, bytes, offset, bytes.length - offset, offset);
                if (!count) this.fail();
                offset += count;
            }
            const after = fs.fstatSync(fd), current = fs.lstatSync(resolved);
            if (['dev', 'ino', 'size', 'mtimeMs', 'ctimeMs'].some(key => before[key] !== after[key] || after[key] !== current[key]) ||
                crypto.createHash('sha256').update(bytes).digest('hex') !== reference.checksum) this.fail();
            return bytes;
        } catch (_) { this.fail(); } finally { if (fd !== undefined) fs.closeSync(fd); }
    },
    /** Pins the entire effective profile, including shared BEFORE prerequisites, not a historical stage count. */
    profile: function (code) {
        const config = CONFIG.get('backofficeApplicationInitialization') || {}, raw = config.profiles?.[code];
        if (!raw || raw.enabled === false || raw.code !== code || !raw.owner || !raw.baselineCode) this.fail();
        return { ...raw, target: { ...config.target, ...raw.target } };
    },
    /**
     * Projects the canonical preparation-step coordinates used in reviewed plans.
     * @param {Object} step Configured step with code, type, target and optional manifest/publication fields.
     * @returns {Object} Canonical descriptor with default phase/type; does not mutate the step.
     */
    stepIdentity: function (step) {
        return this.canonical({ code: step.code, type: step.type || 'DATA_RELEASE', phase: step.phase || 'BEFORE_PUBLICATION',
            dataType: step.dataType || (step.type === 'MEDIA_ASSET_MANIFEST' ? 'media' : ''), targetServer: step.targetServer || step.connectionName, targetRuntimeRole: step.targetRuntimeRole,
            operatorEnterpriseCode: step.operatorEnterpriseCode, publicationPlan: step.publicationPlan,
            manifestModule: step.manifestModule, manifestPath: step.manifestPath });
    },
    /**
     * Combines prerequisites with explicit preparation steps or derived legacy data packages.
     * @param {Object} profile Effective initialization profile including preparation and target defaults.
     * @returns {Object[]} Enabled required steps in configured order; does not mutate the profile.
     */
    configuredSteps: function (profile) {
        const preparation = profile.preparation || {};
        const raw = Array.isArray(preparation.steps) ? preparation.steps : [].concat(profile.dataPackages || []).map(pack => ({
            type: 'DATA_RELEASE', dataType: pack.dataType || (pack.type === 'MEDIA_ASSET_MANIFEST' ? 'media' : pack.kind === 'CORE_CONTENT' ? 'core' : 'sample'),
            targetServer: pack.targetServer || profile.target.connectionName,
            targetRuntimeRole: pack.targetRuntimeRole || profile.target.runtimeRole || 'WCMS_STAGED', ...pack,
        }));
        return [].concat(preparation.prerequisites || [], raw).filter(step => step && step.enabled !== false && step.required !== false);
    },
    /** Review-only source identity from the destination's own canonical discovery, not a lifecycle receipt. */
    describeRelease: function (code, dataType) {
        const matches = SERVICE.DefaultDataReleaseService.discoverReleases(dataType).filter(item => item.releaseCode === code);
        if (matches.length !== 1 || matches[0].invalidManifest) this.fail();
        return Object.fromEntries(['moduleName', 'releaseCode', 'sectionCode', 'dataType', 'version', 'checksum',
            'sourceRoot', 'declaredFiles', 'installer', 'owningDomain', 'lifecycle', 'destinationRole', 'environmentScope']
            .filter(key => matches[0][key] !== undefined).map(key => [key, structuredClone(matches[0][key])]));
    },
    /** Reuses nImport confinement with a private read budget, never changing global installer limits. */
    sourceSnapshot: function (release) {
        const policy = this.policy(), owner = SERVICE.DefaultDataReleaseService, reader = Object.create(owner);
        reader.configuration = () => ({ ...owner.configuration(), maximumContributionBytes: policy.maximumSourceBytes,
            maximumContributionPayloadBytes: policy.maximumSourcePayloadBytes });
        return reader.contributionSourceSnapshot(NODICS.getRawModule(release.moduleName), release.sourceRoot, release.declaredFiles);
    },
    /** Read-only review material from effective configuration and canonical release discovery; never writes or installs a plan. */
    describePlan: function (profileCode, tenant, code, revision = 1) {
        if (!this.identifier(tenant) || !this.identifier(code) || !Number.isSafeInteger(revision) || revision < 1) this.fail();
        const profile = this.profile(profileCode), releases = SERVICE.DefaultDataReleaseService;
        const stages = this.configuredSteps(profile).map(step => {
            const descriptor = this.stepIdentity(step), binding = SERVICE.DefaultBackofficeApplicationInitializationService;
            const stage = { code: step.code, descriptor,
                server: typeof binding?.applicationTargetBinding === 'function'
                    ? binding.applicationTargetBinding(descriptor.targetServer, descriptor.targetRuntimeRole, 'publish').connectionName : null,
                enterpriseCode: step.operatorEnterpriseCode || null };
            if (descriptor.type === 'DATA_RELEASE') {
                const matches = releases.discoverReleases(descriptor.dataType).filter(item => item.releaseCode === step.code);
                if (matches.length > 1 || matches[0]?.invalidManifest) this.fail();
                stage.release = matches.length ? this.describeRelease(step.code, descriptor.dataType) : null;
            }
            // Shared enterprise scope, Online coordinates and Media descriptors require explicit owner review.
            return stage;
        });
        return { contractVersion: 1, code, revision, tenant, profileCode, baselineCode: profile.baselineCode,
            profileDigest: this.digest(profile), stages };
    },
    /** Plan files are reviewed input authority, never a persisted observation/result registry. */
    resolvePlan: function (code) {
        const policy = this.policy(), reference = policy.plans?.[code];
        if (!this.identifier(code) || !reference || !Number.isSafeInteger(reference.revision) || reference.revision < 1) this.fail();
        let plan;
        try { plan = JSON.parse(this.bytes(reference).toString('utf8')); } catch (_) { this.fail(); }
        if (plan?.contractVersion !== 1 || plan.code !== code || plan.revision !== reference.revision ||
            !this.identifier(plan.tenant) || !this.identifier(plan.profileCode) || !this.identifier(plan.baselineCode) ||
            !Array.isArray(plan.stages) || !plan.stages.length || plan.stages.length > 256 ||
            new Set(plan.stages.map(stage => stage.code)).size !== plan.stages.length) this.fail();
        if (!/^[a-f0-9]{64}$/.test(plan.profileDigest || '')) this.fail();
        // BackOffice checks its full effective profile before and after dispatch.
        // Target graphs may discover different profile contributions; their authority
        // is the exact locally approved file checksum plus runtime-owned stage reads.
        for (const stage of plan.stages) {
            if (!this.identifier(stage.code) || !this.identifier(stage.server) || !this.identifier(stage.enterpriseCode) ||
                !this.identifier(stage.descriptor?.targetServer) || !this.identifier(stage.descriptor?.targetRuntimeRole) ||
                (stage.descriptor.operatorEnterpriseCode !== undefined && stage.enterpriseCode !== stage.descriptor.operatorEnterpriseCode)) this.fail();
            if (stage.descriptor.type === 'GOVERNED_PUBLICATIONS') {
                const items = stage.descriptor.publicationPlan?.items;
                if (stage.descriptor.phase !== 'AFTER_PUBLICATION' || stage.descriptor.publicationPlan?.contractVersion !== 1 ||
                    !Array.isArray(items) || !items.length || items.length > 256 ||
                    !this.identifier(stage.online?.server) || !this.identifier(stage.online?.runtimeRole) ||
                    new Set(items.map(item => item.code)).size !== items.length ||
                    items.some(item => !['code', 'domain', 'rootType', 'rootCode', 'sourceVersion'].every(key => this.identifier(item[key])) ||
                        item.input?.publicationCode !== item.code) ||
                    stage.publications !== undefined && (!Array.isArray(stage.publications) || stage.publications.length > items.length ||
                        new Set(stage.publications.map(pin => pin.code)).size !== stage.publications.length ||
                        stage.publications.some(pin => !items.some(item => item.code === pin.code) ||
                            Object.keys(pin).some(key => !['code', 'revision', 'targetVersion', 'operationKey', 'previousOnlineVersion'].includes(key)) ||
                            pin.revision !== undefined && (!Number.isSafeInteger(pin.revision) || pin.revision < 0) ||
                            ['targetVersion', 'operationKey'].some(key => pin[key] !== undefined && !this.identifier(pin[key])) ||
                            pin.previousOnlineVersion !== undefined && pin.previousOnlineVersion !== null && !this.identifier(pin.previousOnlineVersion)))) this.fail();
            } else if (stage.descriptor.type === 'DATA_RELEASE') {
                if (!stage.release || stage.release.releaseCode !== stage.code ||
                    stage.release.moduleName !== stage.code.split(':')[0] || stage.release.dataType !== stage.descriptor.dataType ||
                    !this.identifier(stage.release.version) || !/^[a-f0-9]{64}$/.test(stage.release.checksum || '') ||
                    !Array.isArray(stage.release.declaredFiles) || !stage.release.declaredFiles.length ||
                    !Array.isArray(stage.release.environmentScope)) this.fail();
            } else if (stage.descriptor.type === 'MEDIA_ASSET_MANIFEST') {
                if (!Array.isArray(stage.assets) || !stage.assets.length || stage.assets.length > 100 ||
                    stage.manifest?.moduleName !== stage.descriptor.manifestModule || stage.manifest?.path !== stage.descriptor.manifestPath) this.fail();
            } else this.fail();
        }
        if (plan.baseline && (!this.identifier(plan.baseline.enterpriseCode) ||
            !this.identifier(plan.baseline.server) || !this.identifier(plan.baseline.runtimeRole) ||
            !/^[a-f0-9]{64}$/.test(plan.baseline.descriptorDigest || '') ||
            plan.baseline.publication !== undefined && (!['code', 'rootType', 'rootCode', 'sourceVersion', 'targetVersion'].every(key =>
                this.identifier(plan.baseline.publication[key])) || !Number.isSafeInteger(plan.baseline.publication.revision) ||
                plan.baseline.publication.revision < 0))) this.fail();
        return { plan, checksum: reference.checksum, reference: structuredClone(reference) };
    },
    /** Dedicated recognized permission plus an exact approved deployment; never expands or rewrites signed claims. */
    authorize: function (request, input) {
        const policy = this.policy(), permission = 'publish.setup.observe';
        const expectedKeys = input?.mode === 'TARGET' ? 'checksum,contractVersion,mode,operations,planCode,revision,stageCode' :
            'checksum,contractVersion,mode,planCode,revision,stageCode';
        if (!input || Object.keys(input).sort().join(',') !== expectedKeys ||
            input.contractVersion !== 1 || !['SOURCE', 'TARGET', 'INSTALLATION', 'MEDIA', 'BASELINE'].includes(input.mode) ||
            !this.identifier(input.stageCode)) this.fail();
        if (!CONFIG.get('identityGovernance')?.permissionCatalog?.includes(permission)) this.fail();
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'publish');
        if (auth !== request.authData || auth.principalType !== 'service' || auth.isSystem ||
            !Array.isArray(auth.permissions) || !auth.permissions.includes(permission) ||
            [auth.enterpriseCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== auth.entCode) ||
            [auth.tenantCode, request.tenantCode, request.httpRequest?.headers?.tenant, request.httpRequest?.headers?.['x-tenant-code']]
                .some(value => value !== undefined && value !== auth.tenant) ||
            [request.httpRequest?.headers?.['x-enterprise-code'], request.httpRequest?.headers?.enterpriseCode]
                .some(value => value !== undefined && value !== auth.entCode)) this.fail();
        const callers = Object.values(policy.callers || {}).filter(caller => caller && caller.tenant === auth.tenant &&
            caller.enterpriseCode === auth.entCode && caller.serviceId === auth.serviceId &&
            ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'].every(key =>
                this.identifier(caller[key]) && caller[key] === auth.runtimeScope[key]) &&
            caller.instanceCode === auth.runtimeInstanceId && Array.isArray(caller.plans) && caller.plans.includes(input.planCode));
        if (callers.length !== 1 || auth.runtimeScope.environmentCode !== NODICS.getSelectedEnvironmentName()) this.fail();
        const resolved = this.resolvePlan(input.planCode), { plan } = resolved;
        if (input.checksum !== resolved.checksum || input.revision !== plan.revision || request.tenant !== plan.tenant) this.fail();
        const stage = input.mode === 'BASELINE' ? plan.baseline : plan.stages.find(item => item.code === input.stageCode);
        if (!stage || (input.mode === 'BASELINE' && input.stageCode !== plan.baselineCode)) this.fail();
        if (input.mode === 'TARGET' && (!Array.isArray(input.operations) ||
            input.operations.length !== stage.descriptor.publicationPlan.items.length ||
            stage.descriptor.publicationPlan.items.some(item => input.operations.filter(operation =>
                operation && Object.keys(operation).sort().join(',') === 'code,operationKey' && operation.code === item.code &&
                this.identifier(operation.operationKey)).length !== 1))) this.fail();
        const target = input.mode === 'TARGET' ? stage.online : input.mode === 'BASELINE' ? stage :
            { server: stage.server, runtimeRole: stage.descriptor.targetRuntimeRole };
        if (target?.server !== NODICS.getServerName() || target?.runtimeRole !== CONFIG.get('runtimeRole')?.code ||
            (input.mode === 'SOURCE' || input.mode === 'TARGET') && stage.descriptor.type !== 'GOVERNED_PUBLICATIONS' ||
            input.mode === 'INSTALLATION' && stage.descriptor.type !== 'DATA_RELEASE' ||
            input.mode === 'MEDIA' && stage.descriptor.type !== 'MEDIA_ASSET_MANIFEST') this.fail();
        // Enterprise is a reviewed target scope, not a substituted authentication principal.
        const ownerRequest = { tenant: plan.tenant, enterpriseCode: stage.enterpriseCode, authData: request.authData };
        return { ...resolved, stage, ownerRequest, operations: input.operations, policyDigest: this.digest(policy) };
    },
    /** Rejects failed/ambiguous owner reads; all calls explicitly bypass item caches. */
    readOne: async function (service, request, query) {
        if (typeof service?.get !== 'function') this.fail();
        const response = await service.get({ tenant: request.tenant, authData: request.authData, query,
            options: { skipItemCache: true, recursive: false }, searchOptions: { limit: 2, pageSize: 2, pageNumber: 1 } });
        if (!response || !Array.isArray(response.result) || response.result.length > 1 || response.error || response.errors?.length ||
            response.success === false || response.code && !/^SUC_/.test(response.code) ||
            Number.isFinite(response.count) && response.count !== response.result.length) this.fail();
        return response.result[0];
    },
    /**
     * Resolves the source version provider only when domain adapter and workflow registrations exist.
     * @param {string} domain Publication domain from the reviewed stage.
     * @returns {Object} Registered provider without invoking it; throws when registration is incomplete.
     */
    provider: function (domain) {
        const config = CONFIG.get('publish')?.providers, name = config?.versionProviders?.[domain], provider = name && SERVICE[name];
        if (!provider || !config.domainAdapters?.[domain] || !config.workflowProviders?.[domain]) this.fail();
        return provider;
    },
    /** Target-only registration never requires source adapters, workflows or publishing authority. */
    targetObserver: function (domain) {
        const name = this.policy().targetObservers?.[domain], owner = typeof name === 'string' && SERVICE[name];
        if (!this.identifier(domain) || !this.identifier(name) || !NODICS.isModuleActive(domain) ||
            typeof owner?.observeSetupTarget !== 'function') this.fail();
        return owner;
    },
    /**
     * Reads source publication approval, activation and committed receipt evidence, fencing row drift.
     * @param {Object} context Authorized stage with ownerRequest and optional exact publication pins.
     * @returns {Promise<Object>} Read-only ready/items projection; rejects invalid scope, pins or owner failures.
     */
    source: async function (context) {
        const { stage, ownerRequest: request } = context, items = [];
        for (const item of stage.descriptor.publicationPlan.items) {
            const provider = this.provider(item.domain), pin = stage.publications?.find(row => row.code === item.code) || {};
            const publication = await this.readOne(SERVICE.DefaultPublicationRequestService, request, { code: item.code });
            if (!publication) { items.push({ code: item.code, status: 'NOT_CURRENT' }); continue; }
            const legacyProduct = item.domain === 'product' && typeof provider.getPublicationEnterprise === 'function' &&
                (publication.tenantCode === undefined || publication.enterpriseCode === undefined);
            if (['code', 'domain', 'rootType', 'rootCode', 'sourceVersion'].some(key => publication[key] !== item[key]) ||
                [publication.tenantCode, publication.tenant].some(value => value !== undefined && value !== request.tenant) ||
                publication.tenantCode === undefined && !legacyProduct ||
                publication.enterpriseCode !== undefined && publication.enterpriseCode !== request.enterpriseCode ||
                !Number.isSafeInteger(publication.revision) || publication.revision < 0 ||
                pin.revision !== undefined && publication.revision !== pin.revision) this.fail();
            // Legacy Product journals predate both scope stamps. Only its sealed
            // root owner may resolve absence; explicit foreign scope never falls back.
            const enterpriseCode = legacyProduct
                ? await provider.getPublicationEnterprise(publication, request) : publication.enterpriseCode;
            if (enterpriseCode !== request.enterpriseCode) this.fail();
            const version = await provider.validateSetup(publication, request, item);
            const receipt = publication.auditTrail?.filter(entry => entry.toState === 'ONLINE').at(-1)?.details?.receipt;
            const operation = publication.activationOperation;
            const current = publication.state === 'ONLINE' && publication.targetVersion === version &&
                (pin.targetVersion === undefined || version === pin.targetVersion) &&
                publication.auditTrail?.some(entry => entry.toState === 'APPROVED') &&
                this.identifier(operation?.key) && (pin.operationKey === undefined || operation.key === pin.operationKey) &&
                (operation.previousOnlineVersion === null || this.identifier(operation.previousOnlineVersion)) &&
                (pin.previousOnlineVersion === undefined || operation.previousOnlineVersion === pin.previousOnlineVersion) &&
                await provider.isSetupReceiptCommitted(publication, request, receipt) === true &&
                receipt?.operationKey === operation.key && receipt.publicationCode === item.code &&
                receipt.sourceVersion === item.sourceVersion && receipt.targetVersion === version;
            const final = await this.readOne(SERVICE.DefaultPublicationRequestService, request, { code: item.code });
            if (this.digest(publication) !== this.digest(final)) this.fail();
            items.push({ code: item.code, domain: item.domain, rootType: item.rootType, rootCode: item.rootCode,
                sourceVersion: item.sourceVersion, targetVersion: publication.targetVersion, revision: publication.revision,
                operationKey: operation?.key, previousOnlineVersion: operation?.previousOnlineVersion,
                status: current ? 'CURRENT' : 'NOT_CURRENT' });
        }
        return { ready: items.every(item => item.status === 'CURRENT'), items };
    },
    /**
     * Reads target-owner version and receipt evidence against the reviewed activation operations.
     * @param {Object} context Authorized stage, ownerRequest and exact per-publication operations.
     * @returns {Promise<Object>} Read-only ready/items projection; rejects pin conflicts or observer failures.
     */
    target: async function (context) {
        const { stage, ownerRequest: request } = context, items = [];
        for (const item of stage.descriptor.publicationPlan.items) {
            const pin = stage.publications?.find(row => row.code === item.code) || {}, provider = this.targetObserver(item.domain);
            if (typeof provider.observeSetupTarget !== 'function') this.fail();
            const operationKey = context.operations.find(operation => operation.code === item.code).operationKey;
            if (pin.operationKey !== undefined && pin.operationKey !== operationKey) this.fail();
            const target = await provider.observeSetupTarget({ ...item, targetVersion: pin.targetVersion,
                activationOperation: { key: operationKey, previousOnlineVersion: pin.previousOnlineVersion } }, request);
            const receipt = target?.receipt;
            // These typed owners omit a null predecessor in persistence. Their
            // read hook proves the applied receipt against the actual pointer CAS;
            // normalize only that scoped, revision-backed absence in projection.
            const typedNoPredecessor = ['pricing', 'inventory', 'tax', 'promotion'].includes(item.domain) &&
                receipt?.previousOnlineVersion === undefined && receipt?.applied === true &&
                receipt.tenant === request.tenant && receipt.enterpriseCode === request.enterpriseCode &&
                receipt.fingerprint === item.sourceVersion && Number.isSafeInteger(receipt.expectedRevision) &&
                receipt.expectedRevision >= 0 && target.revision === receipt.expectedRevision + 1;
            const previousOnlineVersion = typedNoPredecessor ? null : receipt?.previousOnlineVersion;
            const current = this.identifier(target?.version) && (pin.targetVersion === undefined || target.version === pin.targetVersion) &&
                receipt?.operationKey === operationKey &&
                receipt.publicationCode === item.code && receipt.sourceVersion === item.sourceVersion &&
                receipt.targetVersion === target.version &&
                (previousOnlineVersion === null || this.identifier(previousOnlineVersion)) &&
                (pin.previousOnlineVersion === undefined || previousOnlineVersion === pin.previousOnlineVersion);
            items.push({ code: item.code, domain: item.domain, rootType: item.rootType, rootCode: item.rootCode,
                sourceVersion: item.sourceVersion, targetVersion: target?.version ?? null, revision: target?.revision,
                operationKey: receipt?.operationKey, previousOnlineVersion,
                status: current ? 'CURRENT' : 'NOT_CURRENT' });
        }
        return { ready: items.every(item => item.status === 'CURRENT'), items };
    },
    /**
     * Verifies discovered release bytes against reviewed pins and reads its installation receipt.
     * @param {Object} context Authorized data-release stage and scoped ownerRequest.
     * @returns {Promise<Object>} Read-only installation readiness; rejects release drift or invalid receipt identity.
     */
    installation: async function (context) {
        const { stage, ownerRequest: request } = context, owner = SERVICE.DefaultDataReleaseService;
        const matches = owner.discoverReleases(stage.release.dataType).filter(release => release.releaseCode === stage.code);
        if (matches.length !== 1) this.fail();
        const release = matches[0], pin = stage.release;
        if (release.invalidManifest || ['moduleName', 'releaseCode', 'dataType', 'sectionCode', 'version', 'checksum', 'sourceRoot',
            'installer', 'owningDomain', 'lifecycle', 'destinationRole'].some(key => release[key] !== pin[key]) ||
            this.digest(release.environmentScope) !== this.digest(pin.environmentScope) ||
            this.digest(release.declaredFiles) !== this.digest(pin.declaredFiles)) this.fail();
        owner.validateDestination(release);
        const snapshot = this.sourceSnapshot(release);
        const hashes = release.declaredFiles.slice().sort().map(name => {
            const bytes = snapshot.files.get(name); if (!Buffer.isBuffer(bytes)) this.fail();
            return name + ':' + crypto.createHash('sha256').update(bytes).digest('hex');
        });
        if (crypto.createHash('sha256').update(hashes.join('|')).digest('hex') !== pin.checksum) this.fail();
        const code = owner.installationCode(request.tenant, release);
        const receipt = await this.readOne(SERVICE.DefaultDataInstallationService, request, { code });
        if (receipt && (receipt.code !== code || receipt.tenant !== request.tenant ||
            receipt.environment !== NODICS.getSelectedEnvironmentName() ||
            ['moduleName', 'releaseCode', 'sectionCode', 'dataType'].some(key => receipt[key] !== release[key]))) this.fail();
        const ready = Boolean(receipt && receipt.active === true && receipt.status === 'CURRENT' &&
            receipt.version === pin.version && receipt.checksum === pin.checksum && this.identifier(receipt.executionId));
        return { ready, releaseCode: stage.code, version: release.version, releaseChecksum: release.checksum,
            status: ready ? 'CURRENT' : 'NOT_CURRENT', installationRunId: receipt?.runId, executionId: receipt?.executionId };
    },
    /**
     * Verifies the reviewed manifest bytes and inspects matching persisted Media metadata.
     * @param {Object} context Authorized manifest/assets stage and ownerRequest with matching enterprise.
     * @returns {Promise<Object>} Read-only metadata readiness without stored-byte verification; rejects mismatched evidence.
     */
    media: async function (context) {
        this.bytes(context.stage.manifest);
        const owner = SERVICE.DefaultMediaReadinessService;
        if (typeof owner?.inspect !== 'function' || context.ownerRequest.authData.entCode !== context.stage.enterpriseCode) this.fail();
        const evidence = await owner.inspect({ assets: context.stage.assets }, context.ownerRequest);
        if (evidence?.contractVersion !== 1 || evidence.owner !== 'media' || evidence.evidenceKind !== 'PERSISTED_CURRENT_METADATA' ||
            !Array.isArray(evidence.items) || evidence.items.length !== context.stage.assets.length ||
            evidence.items.some((item, index) => item.mediaCode !== context.stage.assets[index].mediaCode ||
                item.checksum !== context.stage.assets[index].checksum || item.storedBytesVerified !== false)) this.fail();
        return { ready: evidence.items.every(item => item.metadataMatched === true),
            evidenceKind: evidence.evidenceKind, items: evidence.items };
    },
    /**
     * Reads CMS baseline authority, active version and Media qualification against the reviewed descriptor.
     * @param {Object} context Authorized plan, baseline stage and scoped ownerRequest.
     * @returns {Promise<Object>} Read-only ready/authority projection; rejects descriptor, publication or owner mismatches.
     */
    baseline: async function (context) {
        const { plan, stage, ownerRequest: request } = context, owner = SERVICE.DefaultCmsPublicationBaselineService;
        if (!owner) this.fail();
        const descriptor = owner.descriptor(plan.baselineCode);
        if (this.digest(descriptor) !== stage.descriptorDigest) this.fail();
        const publicationCode = owner.publicationCode(descriptor);
        const row = await this.readOne(SERVICE.DefaultPublicationRequestService, request, { code: publicationCode });
        if (!row) return { ready: false, authority: { baselineCode: plan.baselineCode, readiness: 'NOT_IMPORTED' } };
        if (row.code !== publicationCode || !Number.isSafeInteger(row.revision) || row.revision < 0 ||
            [row.tenant, row.tenantCode].some(value => value !== undefined && value !== request.tenant) ||
            row.enterpriseCode !== undefined && row.enterpriseCode !== stage.enterpriseCode ||
            stage.publication && ['code', 'revision', 'sourceVersion', 'targetVersion', 'rootType', 'rootCode'].some(key => row[key] !== stage.publication[key]) ||
            ['rootType', 'rootCode', 'sourceVersion'].some(key => row[key] !== descriptor[key]) ||
            row.domain !== 'cms') this.fail();
        const evidence = await owner.status(plan.baselineCode, request);
        if (evidence?.baselineCode !== plan.baselineCode || evidence.publication?.code !== row.code ||
            evidence.publication.revision !== row.revision || evidence.publication.targetVersion !== row.targetVersion) this.fail();
        const provider = SERVICE.DefaultCmsPublicationVersionProviderService;
        const active = descriptor.rootType === 'site'
            ? await provider.transport().getStatus({ scope: { site: descriptor.rootCode, bundle: true } }, request)
            : await provider.getOnlineVersion(row, request);
        const ready = Boolean(row.auditTrail?.some(entry => entry.toState === 'APPROVED') &&
            active?.version === row.targetVersion && evidence.readiness === 'READY' && evidence.releaseStatus === 'CURRENT' &&
            evidence.publication.state === 'ONLINE' && evidence.mediaDependencies?.qualified === true);
        return { ready, authority: { baselineCode: plan.baselineCode, readiness: ready ? 'READY' : 'UNAVAILABLE',
            releaseStatus: evidence.releaseStatus,
            publication: { code: row.code, state: row.state, revision: row.revision, sourceVersion: row.sourceVersion, targetVersion: row.targetVersion },
            mediaDependencies: { contractVersion: 1, owner: 'media', qualified: evidence.mediaDependencies?.qualified === true,
                status: evidence.mediaDependencies?.status, dependencies: [].concat(evidence.mediaDependencies?.dependencies || []).map(item => ({
                    code: item.code, mediaCode: item.mediaCode, versionId: item.versionId, checksum: item.checksum, status: item.status })) } } };
    },
    /** Two fresh observations fence drift; every call rechecks policy, plan bytes and configuration. No result is retained. */
    observe: async function (request, input) {
        try {
            input = structuredClone(input);
            const context = this.authorize(request, input), method = { SOURCE: 'source', TARGET: 'target',
                INSTALLATION: 'installation', MEDIA: 'media', BASELINE: 'baseline' }[input.mode];
            const identity = SERVICE.DefaultIdentityGovernanceService;
            if (typeof identity?.getSystemAuthData !== 'function') this.fail();
            const persistenceAuth = identity.getSystemAuthData();
            if (persistenceAuth?.isSystem !== true) this.fail();
            // Only these fixed read-only owner methods receive private persistence
            // authority after exact deployment/plan admission. Never return it or
            // mutate the external principal; lifecycle/action methods are unreachable.
            context.ownerRequest = { ...context.ownerRequest,
                authData: { ...context.ownerRequest.authData, ...persistenceAuth } };
            const first = await this[method](context), second = await this[method](context);
            const final = this.authorize(request, input);
            if (context.policyDigest !== final.policyDigest || this.digest(first) !== this.digest(second)) this.fail();
            return { ...second, contractVersion: 1, planCode: input.planCode, checksum: context.checksum, revision: context.plan.revision,
                profileCode: context.plan.profileCode, baselineCode: context.plan.baselineCode, tenant: context.plan.tenant,
                stageCode: input.stageCode, enterpriseCode: context.stage.enterpriseCode, mode: input.mode,
                server: NODICS.getServerName(), runtimeRole: CONFIG.get('runtimeRole').code };
        } catch (_) { this.fail(); }
    },
};
