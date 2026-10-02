/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');
const recoveryContexts = new WeakSet();
/**
 * @module profile/service/employee/DefaultEmployeeRecoveryService
 * @description Coordinates purpose-bound employee password recovery using the
 * existing Profile continuation, verification, credential and security-stamp owners.
 * No registration, membership, customer, activation or permission records are changed.
 * @owner profile
 * @layer service
 * @sideEffects Leases Profile auth continuations, invokes Communication and updates
 * the existing credential/security stamp conditionally; membership stays untouched.
 * @throws {CLASSES.NodicsError} ERR_PROFILE_RECOVERY_* or existing owner failures.
 * Uncertain writes require readback; a second password write is not automatic.
 * @override Later layers may tighten supported credential policy and presentation.
 * Recovery must not become an approval, activation or external-provider bypass.
 * Shared helpers use the effective recovery receiver so its policy, purpose,
 * cache namespace and projections remain independently customizable.
 */
module.exports = {
    /**
     * Resolves the existing continuation/admission helpers rather than copying their implementation.
     * @returns {Object} Effective loader-merged registration owner rather than a copied implementation.
     */
    base: function () {
        const owner = SERVICE.DefaultEnterpriseRegistrationService;
        if (!owner) this.fail('UNAVAILABLE');
        return owner;
    },
    /**
     * Uses the stable Profile recovery error vocabulary.
     * @param {string} suffix Stable Profile error suffix.
     * @returns {never} Throws the stable redacted owner error.
     */
    fail: function (suffix) {
        throw new CLASSES.NodicsError('ERR_PROFILE_RECOVERY_' + suffix);
    },
    /**
     * Resolves server time through the established continuation owner.
     * @returns {number} Server epoch milliseconds; supports an overridden owner clock.
     */
    now: function () {
        return this.base().now();
    },
    /**
     * Reuses canonical Profile command identity.
     * @param {*} value Helper input; shape alone grants no authority.
     * @returns {string} Canonical Profile command digest.
     */
    digest: function (value) {
        return this.base().digest(value);
    },
    /**
     * Validates independently qualified password recovery; registration/application enablement is not consulted.
     * @returns {Object} Validated effective policy; disabled or unqualified policy throws.
     */
    policy: function () {
        const p = CONFIG.get('profileEmployeeRecovery');
        if (
            !p ||
            p.enabled !== true ||
            p.method !== 'PASSWORD' ||
            p.inventoryQualified !== true ||
            p.credentialWriteQualified !== true ||
            p.requireDistributedRateLimit !== true ||
            !Number.isSafeInteger(p.continuationSeconds) ||
            p.continuationSeconds < 60 ||
            p.continuationSeconds > 3600 ||
            !Number.isSafeInteger(p.maximumInventoryPages) ||
            p.maximumInventoryPages < 1 ||
            p.maximumInventoryPages > 1000 ||
            !Number.isSafeInteger(p.pageSize) ||
            p.pageSize < 1 ||
            p.pageSize > 100 ||
            !Number.isSafeInteger(p.minimumPasswordLength) ||
            p.minimumPasswordLength < 12 ||
            !Number.isSafeInteger(p.maximumPasswordLength) ||
            p.maximumPasswordLength < p.minimumPasswordLength ||
            p.maximumPasswordLength > 1024 ||
            typeof p.verificationPurpose !== 'string' ||
            !p.verificationPurpose ||
            !p.rates ||
            !p.presentation ||
            !p.mail ||
            !p.confirmation
        )
            this.fail('UNAVAILABLE');
        const registrationPurpose = (CONFIG.get('enterpriseManagement') || {}).accessAssignments
            ?.registrationVerification?.purpose;
        if (p.verificationPurpose === registrationPurpose || p.mail.purpose === p.confirmation.purpose)
            this.fail('UNAVAILABLE');
        return p;
    },
    /**
     * Applies the existing exact-origin admission and marks only the resulting in-process context as recovery.
     * @param {Object} request Nodics request validated by the owning entry point.
     * @param {string} operation Fixed controller-selected capability operation.
     * @returns {Promise<Object>} Frozen admitted context after origin/rate checks.
     */
    context: async function (request, operation) {
        const context = await this.base().context.call(this, request, operation);
        recoveryContexts.add(context);
        return context;
    },
    /**
     * JSON fields cannot manufacture this authenticated runtime-call authority.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @returns {boolean} Whether this exact object was admitted in-process.
     */
    ownsContext: function (context) {
        return recoveryContexts.has(context);
    },
    /**
     * Uses the shared distributed rate limiter under the distinct recovery capability.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {string} name Fixed owner-defined operation or rate-policy key.
     * @param {string|string[]} identity Subject components for the owner's rate capability.
     * @returns {Promise<void>} Resolves only after the distributed limiter admits the request.
     */
    rate: async function (context, name, identity) {
        const limit = this.policy().rates[name];
        if (
            !limit ||
            !Number.isSafeInteger(limit.limit) ||
            limit.limit < 1 ||
            !Number.isSafeInteger(limit.windowSeconds) ||
            limit.windowSeconds < 1
        )
            this.fail('UNAVAILABLE');
        await SERVICE.DefaultRateLimitService.enforce({
            moduleName: 'profile',
            channelName: 'rateLimit',
            tenant: context.tenant,
            capability: 'profile.employeeRecovery',
            operation: name,
            identity,
            limit: limit.limit,
            windowSeconds: limit.windowSeconds,
            requireDistributed: true,
        });
    },
    /**
     * Uses the existing exact DTO validator.
     * @param {Object} input Untrusted DTO checked against the operation allowlist.
     * @param {string[]} allowed Exact permitted DTO field names.
     * @returns {Object} Validated input; unknown fields throw.
     */
    input: function (input, allowed) {
        return this.base().input.call(this, input, allowed);
    },
    /**
     * Separates recovery from registration inside the existing auth cache, not another token store.
     * @param {string} token Opaque continuation handle; never log or return outside start.
     * @returns {string} Namespaced digest; invalid handles throw before cache access.
     */
    cacheKey: function (token) {
        if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) this.fail('CONTINUATION');
        return 'employee-recovery:' + this.digest(token);
    },
    /**
     * Retains only the original remaining continuation lifetime.
     * @param {string} token Opaque continuation handle; never log or return outside start.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @returns {Promise<void>} Cache acknowledgement using only the original remaining lifetime.
     */
    store: function (token, session) {
        return this.base().store.call(this, token, session);
    },
    /**
     * Reuses the existing atomic-consume continuation lease and origin/expiry checks.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {string} token Opaque continuation handle; never log or return outside start.
     * @param {function(Object): Promise<*>} work Awaited callback receiving the atomically leased continuation.
     * @returns {Promise<*>} Callback result; unexpired state is restored in finally, failures propagate.
     */
    session: function (context, token, work) {
        return this.base().session.call(this, context, token, work);
    },
    /**
     * Reuses canonical generated-service envelope validation.
     * @param {Object} response Generated-service or transport envelope to validate.
     * @returns {Object[]} Successful result records; failed transport cannot become an empty inventory.
     */
    rows: function (response) {
        return this.base().rows.call(this, response);
    },
    /**
     * Reads one exact owner record without direct database access.
     * @param {string} service Internal generated-service name, never a public selector.
     * @param {string} tenant Owner-resolved persistence partition.
     * @param {Object} query Owner-built exact lookup or conditional-write predicate.
     * @returns {Promise<Object|undefined>} Exact uncached record; ambiguity and transport failure reject.
     */
    read: function (service, tenant, query) {
        return this.base().read.call(this, service, tenant, query);
    },
    /**
     * Reuses the bounded paginated owner inventory.
     * @param {string} service Internal generated-service name, never a public selector.
     * @param {string} tenant Owner-resolved persistence partition.
     * @param {Object} query Owner-built exact lookup or conditional-write predicate.
     * @returns {Promise<Object[]>} Bounded complete inventory; duplicates and truncation reject.
     */
    inventory: function (service, tenant, query) {
        return this.base().inventory.call(this, service, tenant, query);
    },
    /**
     * Resolves existing identities using the same system-wide Profile inventory.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {string} email Canonical normalized mailbox.
     * @returns {Promise<Object[]>} Existing employee/customer matches in the declared tenant inventory.
     */
    identities: function (context, email) {
        return this.base().identities.call(this, context, email);
    },
    /**
     * Binds code operations to this server-held session and the distinct recovery purpose.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @param {string} operation Fixed controller-selected capability operation.
     * @param {Object} fields Operation-specific server-held verification fields.
     * @returns {Object} Bound verification DTO with owner-selected authority.
     */
    command: function (session, operation, fields) {
        return this.base().command.call(this, session, operation, fields);
    },
    /**
     * Uses the existing Profile-to-Communication transport with private recovery-purpose selection.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @param {string} operation Fixed controller-selected capability operation.
     * @param {Object} fields Operation-specific server-held verification fields.
     * @returns {Promise<Object>} Verification transport result without local fallback.
     */
    verifyRpc: function (context, session, operation, fields) {
        return this.base().verifyRpc.call(this, context, session, operation, fields);
    },
    /**
     * Sends the current code through the existing Communication intent owner.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @param {string} secret Transient code used only for the current delivery intent.
     * @returns {Promise<void>} Updates session delivery acceptance, not proof of inbox receipt.
     */
    deliver: function (context, session, secret) {
        return this.base().deliver.call(this, context, session, secret);
    },
    /**
     * Starts with the same neutral response for missing and existing accounts.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} input Untrusted DTO checked against the operation allowlist.
     * @returns {Promise<Object>} Neutral progress and new continuation after issuing and storing verification.
     */
    start: function (context, input) {
        return this.base().start.call(this, context, input);
    },
    /**
     * Uses persisted verification and retains raw proof only in the server auth continuation.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @param {Object} input Untrusted DTO checked against the operation allowlist.
     * @returns {Promise<Object>} Safe progress after verification; raw proof stays server-side.
     */
    verify: function (context, session, input) {
        return this.base().verify.call(this, context, session, input);
    },
    /**
     * Replaces code through the existing verifier; old proof is invalidated.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @param {Object} input Untrusted DTO checked against the operation allowlist.
     * @returns {Promise<Object>} Safe progress after replacing the code and invalidating old proof.
     */
    resend: function (context, session, input) {
        return this.base().resend.call(this, context, session, input);
    },
    /**
     * Requires the exact canonical local credential; no external-provider fallback password is created.
     * @param {Object} identity Owner-resolved employee and tenant.
     * @returns {Promise<Object>} Existing active PASSWORD credential; external or mismatched credentials reject.
     */
    credential: async function (identity) {
        const person = identity.person;
        const reference = person && person.password;
        const id = reference && typeof reference === 'object' ? reference._id : reference;
        if (!id) this.fail('ACCOUNT');
        const credential = await this.read('DefaultPasswordService', identity.tenant, { _id: id });
        if (
            !credential ||
            String(credential._id) !== String(id) ||
            credential.loginId !== person.loginId ||
            credential.active === false ||
            typeof credential.password !== 'string' ||
            !/^\$2[aby]\$\d{2}\$/.test(credential.password) ||
            (credential.provider && credential.provider !== 'PASSWORD')
        )
            this.fail('ACCOUNT');
        return credential;
    },
    /**
     * Resolves the eligible existing account after proof without touching its memberships or activation state.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @returns {Promise<void>} Updates the private continuation's next stage and choices.
     */
    resolveVerified: async function (context, session) {
        const identities = await this.identities(context, session.email);
        if (
            identities.length !== 1 ||
            identities[0].kind !== 'EMPLOYEE' ||
            identities[0].person.principalType !== 'human' ||
            identities[0].person.active !== true ||
            identities[0].person.disabled === true ||
            identities[0].person.registrationSuspended === true
        ) {
            session.stage = ENUMS.ProfileEmployeeAccessStage.ACCOUNT_UNAVAILABLE.key;
            return;
        }
        const identity = identities[0],
            person = identity.person;
        if (!person.code || person.loginId !== session.email) this.fail('ACCOUNT');
        let credential;
        try {
            credential = await this.credential(identity);
        } catch (error) {
            if (error.code === 'ERR_PROFILE_RECOVERY_ACCOUNT') {
                session.stage = ENUMS.ProfileEmployeeAccessStage.ACCOUNT_UNAVAILABLE.key;
                return;
            }
            throw error;
        }
        const enterprises = await this.inventory('DefaultEnterpriseService', context.tenant, {});
        const matches = enterprises.filter(
            (enterprise) =>
                enterprise.active === true &&
                (typeof enterprise.tenant === 'object' ? enterprise.tenant.code : enterprise.tenant) ===
                    identity.tenant,
        );
        if (matches.length !== 1) this.fail('ACCOUNT');
        const version = Number(person.authVersion || 1);
        if (!Number.isSafeInteger(version) || version < 1) this.fail('ACCOUNT');
        session.identity = {
            tenant: identity.tenant,
            code: person.code,
            loginId: person.loginId,
            passwordId: String(credential._id),
            authVersion: version,
            enterpriseCode: matches[0].code,
        };
        session.operationReference =
            'employee-recovery:' + this.digest([session.challenge.challengeCode, session.binding, session.identity]);
        session.stage = ENUMS.ProfileEmployeeAccessStage.RESET_PASSWORD.key;
    },
    /**
     * Reloads the exact same principal and credential; a newly disabled identity cannot be reactivated.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @returns {Promise<Object>} Fresh person and credential pair with the original identity binding.
     */
    current: async function (session) {
        const expected = session.identity;
        if (!expected) this.fail('ACCOUNT');
        const person = await this.read('DefaultEmployeeService', expected.tenant, {
            code: expected.code,
            loginId: expected.loginId,
        });
        if (
            !person ||
            person.active !== true ||
            person.principalType !== 'human' ||
            person.disabled === true ||
            person.registrationSuspended === true
        )
            this.fail('ACCOUNT');
        const credential = await this.credential({ tenant: expected.tenant, person });
        if (String(credential._id) !== expected.passwordId) this.fail('CONFLICT');
        return { person, credential };
    },
    /**
     * Consumes this purpose's proof once; a receipt reconciles only this original operation.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @returns {Promise<void>} Records proof consumption in the private continuation only.
     */
    consume: async function (context, session) {
        if (session.proofConsumed === true) return;
        if (!session.proof || !Number.isFinite(session.proofExpiresAt) || session.proofExpiresAt <= this.now())
            this.fail('VERIFY_AGAIN');
        const fields = {
            challengeCode: session.challenge.challengeCode,
            generation: session.challenge.generation,
            proof: session.proof,
            operationReference: session.operationReference,
        };
        try {
            await this.verifyRpc(context, session, 'CONSUME', fields);
        } catch (error) {
            const receipt = await this.verifyRpc(context, session, 'RECEIPT', fields);
            if (receipt.executionGranted !== false) throw error;
        }
        session.proofConsumed = true;
    },
    /**
     * Requires the existing credential/stamp pipeline's acknowledged result; roles, approval and activation are untouched.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @param {string} password Transient plaintext candidate; never returned or logged.
     * @returns {Promise<Object>} Completion after credential readback and security-stamp acknowledgement.
     */
    confirmReset: async function (context, session, password) {
        let { person, credential } = await this.current(session);
        const managed = SERVICE.DefaultPasswordSaveInterceptorService.managedPolicy(session.identity.tenant);
        if (managed && (!session.passwordMutation ||
            String(credential._id) !== session.passwordMutation.credentialId || credential.code !== session.passwordMutation.code ||
            credential.revision !== session.passwordMutation.revision + 1 || credential.active !== true ||
            Object.hasOwn(credential, 'identityLinkRetirement'))) this.fail('CONFLICT');
        if (!managed && session.passwordMutation) this.fail('CONFLICT');
        if (!(await UTILS.compareHash(password, credential.password))) this.fail('VERIFY_AGAIN');
        if (Number(person.authVersion || 1) === session.identity.authVersion) {
            const response = await SERVICE.DefaultEmployeeService.update({
                tenant: session.identity.tenant,
                authData: context.authData,
                query: { code: person.code, loginId: person.loginId, authVersion: person.authVersion, active: true },
                model: { $set: { authVersion: 1 } },
                options: { recursive: false },
            });
            if (!response || !/^SUC_/.test(response.code || '') || response.result?.matchedCount !== 1)
                this.fail('STORAGE');
            ({ person, credential } = await this.current(session));
        }
        if (
            Number(person.authVersion || 1) <= session.identity.authVersion ||
            !(await UTILS.compareHash(password, credential.password))
        )
            this.fail('STORAGE');
        const stamps = SERVICE.DefaultPrincipalSecurityStampService;
        if (!stamps || typeof stamps.register !== 'function' || typeof stamps.validate !== 'function')
            this.fail('UNAVAILABLE');
        await stamps.register(session.identity.tenant, person.loginId, person.authVersion);
        await stamps.validate({
            tenant: session.identity.tenant,
            loginId: person.loginId,
            authVersion: person.authVersion,
        });
        session.stage = ENUMS.ProfileEmployeeAccessStage.COMPLETE.key;
        session.completedAt = new Date(this.now()).toISOString();
        delete session.proof;
        try {
            await this.confirmation(context, session);
            session.notificationStatus = ENUMS.ProfileEmployeeNotificationStatus.REQUESTED.key;
        } catch (_) {
            session.notificationStatus = ENUMS.ProfileEmployeeNotificationStatus.UNAVAILABLE.key;
        }
        return this.project(session);
    },
    /**
     * Updates the existing credential conditionally once. An uncertain response is inspected, never another password write.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @param {Object} input Untrusted DTO checked against the operation allowlist.
     * @returns {Promise<Object>} Safe progress from the guarded complete/resume operation.
     */
    complete: async function (context, session, input) {
        this.input(input, ['continuation', 'password']);
        if (session.stage === ENUMS.ProfileEmployeeAccessStage.COMPLETE.key) return this.project(session);
        if (
            ![
                ENUMS.ProfileEmployeeAccessStage.RESET_PASSWORD.key,
                ENUMS.ProfileEmployeeAccessStage.RESETTING.key,
            ].includes(session.stage)
        )
            this.fail('CONFLICT');
        const policy = this.policy(),
            password = input.password;
        if (
            typeof password !== 'string' ||
            password.length < policy.minimumPasswordLength ||
            password.length > policy.maximumPasswordLength
        )
            this.fail('INPUT');
        const current = await this.current(session);
        if (session.passwordAttempted === true) return this.confirmReset(context, session, password);
        if (Number(current.person.authVersion || 1) !== session.identity.authVersion) this.fail('CONFLICT');
        const managedQuery = SERVICE.DefaultPasswordSaveInterceptorService.mutationQuery(session.identity.tenant, current.credential);
        if (managedQuery) session.passwordMutation = {
            credentialId: String(current.credential._id), code: current.credential.code, revision: current.credential.revision,
        };
        await this.consume(context, session);
        session.stage = ENUMS.ProfileEmployeeAccessStage.RESETTING.key;
        session.passwordAttempted = true;
        // A public value resembling a bcrypt hash is still a password and must be hashed once here.
        const hash = await UTILS.encryptPassword(password);
        if (typeof hash !== 'string' || !/^\$2[aby]\$\d{2}\$/.test(hash)) this.fail('STORAGE');
        let failure;
        try {
            const response = await SERVICE.DefaultPasswordService.update({
                tenant: session.identity.tenant,
                authData: context.authData,
                query: managedQuery || { _id: current.credential._id, loginId: session.email, password: current.credential.password },
                model: { password: hash, loginId: session.email },
                options: { recursive: false },
            });
            if (!response || !/^SUC_/.test(response.code || '') || response.result?.matchedCount !== 1)
                this.fail('STORAGE');
        } catch (error) {
            failure = error;
        }
        try {
            return await this.confirmReset(context, session, password);
        } catch (error) {
            if (failure) this.fail('STORAGE');
            throw error;
        }
    },
    /**
     * Requests a secret-free confirmation after verified persistence; delivery retry never resets the credential.
     * @param {Object} context Server-admitted tenant, origin and trusted authorization.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @returns {Promise<void>} Accepted secret-free notification; failure never rewrites credentials.
     */
    confirmation: async function (context, session) {
        const config = this.policy(),
            mail = config.mail,
            confirmation = config.confirmation;
        if (!confirmation.templateCode || !confirmation.purpose || !Number.isSafeInteger(mail.timeoutMilliseconds))
            this.fail('UNAVAILABLE');
        const response = await SERVICE.DefaultEnterpriseManagementService.invokePrivateCommunication({
            local: false,
            moduleName: 'commsApi',
            connectionName: mail.connectionName,
            apiName: '/internal/communications',
            methodName: 'POST',
            tenant: context.tenant,
            request: { tenant: context.tenant },
            header: { 'X-Enterprise-Code': context.enterpriseCode },
            requestBody: {
                sourceModule: 'profile',
                sourceType: 'EMPLOYEE_PASSWORD_RESET',
                sourceCode: session.operationReference,
                templateCode: confirmation.templateCode,
                recipientId: 'registration:' + this.digest(session.email),
                recipientAddressReference: session.email,
                purpose: confirmation.purpose,
                channel: 'EMAIL',
                locale: mail.locale,
                variables: { completedAt: session.completedAt },
                idempotencyKey: session.operationReference + ':confirmation',
            },
            maxAttempts: 1,
            timeoutMs: mail.timeoutMilliseconds,
            maxResponseBytes: 8192,
            followRedirects: false,
            requireInternalAuth: true,
        }, mail).catch(() => this.fail('DELIVERY'));
        let result = response;
        for (let depth = 0; depth < 4; depth++) {
            if (
                !result ||
                typeof result !== 'object' ||
                Array.isArray(result) ||
                result.error ||
                result.success === false ||
                /^ERR_/.test(result.code || '')
            )
                this.fail('DELIVERY');
            if (
                result.intentCode &&
                ['ACCEPTED', 'QUEUED', 'DELIVERING', 'DELIVERED', 'RETRY_PENDING', 'UNCERTAIN'].includes(result.status)
            )
                return;
            if (Object.hasOwn(result, 'data') === Object.hasOwn(result, 'result')) this.fail('DELIVERY');
            result = Object.hasOwn(result, 'data') ? result.data : result.result;
        }
        this.fail('DELIVERY');
    },
    /**
     * Projects only safe user progress, never the credential, proof or principal persistence details.
     * @param {Object} session Mutable private continuation, never caller-supplied authority.
     * @returns {Object} Allowlisted progress without credentials, proofs or private checkpoints.
     */
    project: function (session) {
        return {
            contractVersion: 1,
            stage: session.stage,
            email: session.email,
            codeState: session.challenge?.status || 'PENDING',
            resendAt: session.challenge.nextIssueAt,
            expiresAt: new Date(session.expiresAt).toISOString(),
            deliveryStatus: session.deliveryStatus,
            ...(session.notice ? { notice: session.notice } : {}),
            ...(session.notificationStatus ? { notificationStatus: session.notificationStatus } : {}),
            ...(session.stage === ENUMS.ProfileEmployeeAccessStage.COMPLETE.key
                ? { signInEnterpriseCode: session.identity.enterpriseCode }
                : {}),
        };
    },
    /**
     * Returns the backend-owned recovery journey contract using the common Axis account-access shell.
     * @returns {Object} Backend-owned declarative presentation, constraints and endpoints.
     */
    workspace: function () {
        const p = this.policy();
        return {
            contractVersion: 1,
            owner: 'profile',
            renderer: 'axis.employee-recovery',
            method: p.method,
            endpoints: p.endpoints,
            presentation: p.presentation,
            constraints: {
                maximumNameLength: 128,
                minimumPasswordLength: p.minimumPasswordLength,
                maximumPasswordLength: p.maximumPasswordLength,
            },
        };
    },
    /**
     * Dispatches fixed recovery commands; no caller-selected methods, storage or authority.
     * @param {Object} request Nodics request validated by the owning entry point.
     * @param {string} operation Fixed controller-selected capability operation.
     * @returns {Promise<Object>} Authorized operation result; errors propagate without implicit retries.
     */
    execute: async function (request, operation) {
        if (
            ![
                ENUMS.ProfileEmployeeAccessOperation.START.key,
                ENUMS.ProfileEmployeeAccessOperation.VERIFY.key,
                ENUMS.ProfileEmployeeAccessOperation.RESEND.key,
                ENUMS.ProfileEmployeeAccessOperation.STATUS.key,
                ENUMS.ProfileEmployeeAccessOperation.COMPLETE.key,
            ].includes(operation)
        )
            this.fail('INPUT');
        const context = await this.context(request, operation),
            input = request.body || request.httpRequest?.body || {};
        if (operation === ENUMS.ProfileEmployeeAccessOperation.START.key) return this.start(context, input);
        this.input(
            input,
            operation === ENUMS.ProfileEmployeeAccessOperation.VERIFY.key
                ? ['continuation', 'code']
                : operation === ENUMS.ProfileEmployeeAccessOperation.COMPLETE.key
                  ? ['continuation', 'password']
                  : ['continuation'],
        );
        return this.session(context, input.continuation, async (session) => {
            if (operation === ENUMS.ProfileEmployeeAccessOperation.VERIFY.key)
                return this.verify(context, session, input);
            if (operation === ENUMS.ProfileEmployeeAccessOperation.RESEND.key)
                return this.resend(context, session, input);
            if (operation === ENUMS.ProfileEmployeeAccessOperation.COMPLETE.key)
                return this.complete(context, session, input);
            this.input(input, ['continuation']);
            if (session.stage === ENUMS.ProfileEmployeeAccessStage.RESOLVING.key)
                await this.resolveVerified(context, session);
            return this.project(session);
        });
    },
};
