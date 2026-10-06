/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotProvider/src/service/defaultCopilotProviderService @description Selects, validates, and invokes configured adapters without provider-name special cases. @layer service @owner copilotProvider @override Projects may override selection and fallback policy through service merging. */
module.exports = {
    /** Requires the independent provider probe grant. @param {Object} request Trusted request. @returns {boolean} Granted. */
    canCheck: function (request) {
        const permissions = (request.authData || {}).permissions;
        return (
            Array.isArray(permissions) &&
            permissions.some(
                (value) => value === '*' || value === 'copilot.provider.check',
            )
        );
    },
    /** Runs one explicit configured adapter probe without model invocation, credentials in responses or caller-selected URLs. @param {Object} request Trusted employee context. @param {Object} configuration Provider configuration. @returns {Promise<Object>} Bounded safe health result. */
    checkConnection: async function (request, configuration) {
        const usage = SERVICE.DefaultCopilotUsageService;
        if (!this.canCheck(request))
            throw new CLASSES.NodicsError('ERR_CPP_00002');
        const context = usage.scope(request);
        if (
            request.body !== undefined &&
            (!request.body ||
                typeof request.body !== 'object' ||
                Array.isArray(request.body) ||
                Object.keys(request.body).some((key) => key !== 'adapter'))
        )
            throw new CLASSES.NodicsError('ERR_CPP_00005');
        const adapter = request.body?.adapter;
        if (
            adapter !== undefined &&
            (typeof adapter !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(adapter) ||
                !Object.hasOwn(configuration.adapters || {}, adapter) ||
                configuration.adapters[adapter]?.enabled !== true)
        )
            throw new CLASSES.NodicsError('ERR_CPP_00005');
        const effective = this.getEffectiveConfiguration({
            configuration,
            ...(adapter ? { adapter } : {}),
        });
        const policy = configuration.accounting;
        if (policy && typeof policy.enabled !== 'boolean')
            throw new CLASSES.NodicsError('ERR_CPP_00001');
        if (policy && policy.enabled === true) {
            usage.validate(policy);
            const assigned = usage.limits(policy, context, null);
            if (
                !assigned.enterprise ||
                !assigned.user ||
                !assigned.enterprise.adapters.includes(effective.adapterName) ||
                !assigned.enterprise.profiles.includes(effective.profileName)
            )
                throw new CLASSES.NodicsError('ERR_CPP_00002');
        }
        let state = 'NOT_CONFIGURED',
            model = null;
        try {
            this.validateConfiguration(effective);
            const handler = this.resolveHandler(effective.adapter);
            const name = (effective.adapter.model || {}).name;
            model =
                typeof name === 'string' && name.length <= 128 ? name : null;
            if (typeof handler.health !== 'function') state = 'UNSUPPORTED';
            else {
                const connection = effective.adapter.connection || {};
                if (
                    !Number.isInteger(connection.healthTimeoutMs) ||
                    connection.healthTimeoutMs < 1 ||
                    connection.healthTimeoutMs > 30000 ||
                    !Number.isInteger(connection.maximumResponseBytes) ||
                    connection.maximumResponseBytes < 1 ||
                    connection.maximumResponseBytes > 1048576
                )
                    throw new Error('Unbounded health transport');
                state = 'DOWN';
                const result = await handler.health(effective.adapter);
                if (result && ['UP', 'DEGRADED', 'DOWN'].includes(result.state))
                    state = result.state;
            }
        } catch {
            // Provider exceptions and diagnostic payloads can contain secrets or endpoint details.
        }
        const presentation = configuration.healthPresentation || {};
        return {
            contractVersion: 1,
            context,
            state,
            model,
            adapter: effective.adapterName,
            observedAt: new Date().toISOString(),
            message: presentation[state],
            title: presentation.title,
        };
    },
    /** Resolves effective layered provider configuration. @param {Object} options Invocation options. @returns {Object} Effective configuration. */
    getEffectiveConfiguration: function (options) {
        const source = options || {};
        const configuration = source.configuration || source;
        const defaults = configuration.default || {};
        const adapterName = source.adapter || defaults.adapter;
        const adapter = (configuration.adapters || {})[adapterName];
        const profileName = source.profile || defaults.profile;
        const profiles = configuration.profiles || {};
        const profile = Object.hasOwn(profiles, profileName)
            ? profiles[profileName]
            : undefined;
        return {
            configuration: configuration,
            defaults: defaults,
            adapterName: adapterName,
            adapter: adapter,
            profileName: profileName,
            profile: profile,
        };
    },
    /** Validates optional provider-neutral tuning before reservation or transport; adapters still enforce their model-specific capabilities. @param {Object} profile Configured profile. @returns {boolean} Valid profile. */
    validateProfile: function (profile) {
        if (!profile || typeof profile !== 'object' || Array.isArray(profile))
            throw new Error('COPILOT_PROVIDER_PROFILE_UNAVAILABLE');
        for (const [key, maximum] of [
            ['temperature', 2],
            ['topP', 1],
        ]) {
            const value = profile[key];
            if (
                value !== undefined &&
                (typeof value !== 'number' ||
                    !Number.isFinite(value) ||
                    value < 0 ||
                    value > maximum)
            )
                throw new Error('COPILOT_PROVIDER_PROFILE_INVALID');
        }
        if (
            profile.maximumOutputTokens !== undefined &&
            (!Number.isSafeInteger(profile.maximumOutputTokens) ||
                profile.maximumOutputTokens < 1 ||
                profile.maximumOutputTokens > 1048576)
        )
            throw new Error('COPILOT_PROVIDER_PROFILE_INVALID');
        if (
            profile.structuredOutput !== undefined &&
            typeof profile.structuredOutput !== 'boolean'
        )
            throw new Error('COPILOT_PROVIDER_PROFILE_INVALID');
        return true;
    },
    /** Validates selection metadata without invoking a provider or resolving credentials. @param {Object} effective Effective configuration. @returns {boolean} True when configured. */
    validateConfiguration: function (effective) {
        if (effective.configuration.enabled !== true)
            throw new Error('COPILOT_PROVIDERS_DISABLED');
        if (
            !effective.profileName ||
            !effective.profile ||
            typeof effective.profile !== 'object' ||
            Array.isArray(effective.profile)
        )
            throw new Error('COPILOT_PROVIDER_PROFILE_UNAVAILABLE');
        this.validateProfile(effective.profile);
        if (
            !effective.adapterName ||
            !effective.adapter ||
            effective.adapter.enabled !== true
        )
            throw new Error('COPILOT_PROVIDER_UNAVAILABLE');
        if (
            effective.adapter.contractVersion !==
            effective.configuration.contractVersion
        )
            throw new Error('COPILOT_PROVIDER_CONTRACT_UNSUPPORTED');
        if (!effective.adapter.handler)
            throw new Error('COPILOT_PROVIDER_HANDLER_REQUIRED');
        if (
            !effective.adapter.capabilities ||
            effective.adapter.capabilities.chat !== true
        )
            throw new Error('COPILOT_PROVIDER_CHAT_UNSUPPORTED');
        const credential = effective.adapter.credential || {};
        if (credential.mode === 'SECRET_REFERENCE' && !credential.secretRef)
            throw new Error('COPILOT_PROVIDER_SECRET_REFERENCE_REQUIRED');
        return true;
    },
    /** Describes configuration only, never live health, credentials or endpoint details. @param {Object} options Trusted layered configuration and dependencies. @returns {Object} Secret-safe dashboard projection. */
    describeConfiguration: function (options) {
        try {
            const effective = this.getEffectiveConfiguration(options);
            this.validateConfiguration(effective);
            this.resolveHandler(effective.adapter, options);
            const model = (effective.adapter.model || {}).name;
            return {
                state: 'CONFIGURED',
                health: 'NOT_CHECKED',
                model: typeof model === 'string' ? model : null,
            };
        } catch (error) {
            return {
                state: 'NOT_CONFIGURED',
                health: 'NOT_CHECKED',
                model: null,
            };
        }
    },
    /** Validates metadata and request capabilities before either transport path. @param {Object} effective Effective configuration. @param {Object} request Provider request. @returns {boolean} True when valid. */
    validate: function (effective, request) {
        this.validateConfiguration(effective);
        if (
            !request ||
            !Array.isArray(request.messages) ||
            request.messages.length === 0
        )
            throw new Error('COPILOT_PROVIDER_MESSAGES_REQUIRED');
        if (
            request.messages.length >
            Number(effective.defaults.maximumMessages || 64)
        )
            throw new Error('COPILOT_PROVIDER_MESSAGE_LIMIT_EXCEEDED');
        if (request.tools !== undefined && !Array.isArray(request.tools))
            throw new Error('COPILOT_PROVIDER_TOOLS_INVALID');
        if (
            request.tools &&
            request.tools.length > 0 &&
            effective.adapter.capabilities.toolCalling !== true
        )
            throw new Error('COPILOT_PROVIDER_TOOLS_UNSUPPORTED');
        if (
            Buffer.byteLength(JSON.stringify(request), 'utf8') >
            Number(effective.defaults.maximumRequestBytes || 262144)
        )
            throw new Error('COPILOT_PROVIDER_REQUEST_LIMIT_EXCEEDED');
        return true;
    },
    /** Resolves a configured handler. @param {Object} adapter Adapter metadata. @param {Object} options Runtime dependencies. @returns {Object} Handler. */
    resolveHandler: function (adapter, options) {
        const services =
            (options || {}).services ||
            (typeof SERVICE !== 'undefined' ? SERVICE : {});
        const handler = services[adapter.handler];
        if (!handler || typeof handler.invoke !== 'function')
            throw new Error('COPILOT_PROVIDER_HANDLER_UNAVAILABLE');
        return handler;
    },
    /** Preserves missing usage as unknown; derives totals only from measured components. @param {Object} usage Adapter usage. @returns {Object} Sanitized token counts and measurement state. */
    normalizeUsage: function (usage) {
        const source = usage || {};
        const result = {};
        for (const key of ['inputTokens', 'outputTokens', 'totalTokens']) {
            result[key] =
                Number.isSafeInteger(source[key]) && source[key] >= 0
                    ? source[key]
                    : null;
        }
        if (
            result.totalTokens === null &&
            result.inputTokens !== null &&
            result.outputTokens !== null
        ) {
            const total = result.inputTokens + result.outputTokens;
            result.totalTokens = Number.isSafeInteger(total) ? total : null;
        }
        result.state = Object.values(result).every((value) => value !== null)
            ? 'MEASURED'
            : 'UNKNOWN';
        return result;
    },
    /** Normalizes adapter output. @param {string} adapterName Adapter identity. @param {Object} response Adapter response. @returns {Object} Provider-neutral result. */
    normalizeResponse: function (adapterName, response) {
        const source = response || {};
        return {
            provider: adapterName,
            model: source.model || null,
            content: String(source.content || ''),
            toolCalls: Array.isArray(source.toolCalls) ? source.toolCalls : [],
            usage: this.normalizeUsage(source.usage),
            finishReason: source.finishReason || 'complete',
            metadata: Object.assign({}, source.metadata || {}),
        };
    },
    /** Validates and bounds the output allowance before reservation and adapter dispatch. @param {Object} request Provider input. @param {Object} effective Validated selection. @returns {number} Maximum output tokens. */
    outputLimit: function (request, effective) {
        const ceiling = effective.profile.maximumOutputTokens;
        const selected =
            request.maximumOutputTokens === undefined
                ? ceiling
                : request.maximumOutputTokens;
        if (
            !Number.isSafeInteger(ceiling) ||
            ceiling < 1 ||
            !Number.isSafeInteger(selected) ||
            selected < 1 ||
            selected > ceiling
        )
            throw new Error('COPILOT_PROVIDER_OUTPUT_LIMIT_INVALID');
        return selected;
    },
    /** Wraps either transport with the same durable budget contract; dispatch is never retried here. @param {Object} request Provider request. @param {Object} options Trusted invocation dependencies and attribution. @param {Object} effective Effective configuration. @param {Function} dispatch Adapter callback. @returns {Promise<Object>} Normalized measured or pending response. */
    accounted: async function (request, options, effective, dispatch) {
        const policy = effective.configuration.accounting;
        if (
            policy !== undefined &&
            (!policy || typeof policy.enabled !== 'boolean')
        )
            throw new CLASSES.NodicsError('ERR_CPP_00001');
        const enabled = policy && policy.enabled === true;
        const services =
            (options || {}).services ||
            (typeof SERVICE !== 'undefined' ? SERVICE : {});
        const usage = services.DefaultCopilotUsageService;
        const reconciliation = services.DefaultCopilotReconciliationService;
        let handle;
        if (enabled) {
            if (!usage) throw new Error('COPILOT_ACCOUNTING_UNAVAILABLE');
            if (
                policy.reconciliation &&
                policy.reconciliation.enabled === true
            ) {
                if (!reconciliation)
                    throw new CLASSES.NodicsError('ERR_CPP_00001');
                reconciliation.storage();
            }
            const attribution = (options || {}).accounting || {};
            handle = await usage.reserve(
                {
                    ...attribution,
                    adapter: effective.adapterName,
                    profile: effective.profileName,
                    model:
                        (effective.adapter.model || {}).name ||
                        effective.adapterName,
                    tokens:
                        Buffer.byteLength(JSON.stringify(request), 'utf8') +
                        this.outputLimit(request, effective),
                },
                policy,
            );
        }
        let result;
        try {
            result = this.normalizeResponse(
                effective.adapterName,
                await dispatch(),
            );
        } catch (error) {
            if (handle)
                await usage.settle(
                    handle,
                    null,
                    options.accounting.request,
                    policy,
                );
            throw error;
        }
        if (handle) {
            if (
                policy.reconciliation &&
                policy.reconciliation.enabled === true &&
                result.usage.state === 'MEASURED'
            ) {
                await reconciliation.capture(
                    handle,
                    result.usage,
                    options.accounting.request,
                );
            }
            const entry = await usage.settle(
                handle,
                result.usage,
                options.accounting.request,
                policy,
            );
            result.metadata.accounting = {
                state: entry.state,
                callId: handle.callId,
            };
        }
        return result;
    },
    /** Invokes the selected adapter. @param {Object} request Provider request. @param {Object} options Layered configuration and dependencies. @returns {Promise<Object>} Normalized response. */
    invoke: function (request, options) {
        const effective = this.getEffectiveConfiguration(options);
        this.validate(effective, request);
        const handler = this.resolveHandler(effective.adapter, options);
        const invocation = Object.assign({}, request, {
            profile: Object.assign({}, effective.profile),
            adapter: Object.assign({}, effective.adapter),
            limits: Object.assign({}, effective.defaults),
        });
        if (
            effective.configuration.accounting &&
            effective.configuration.accounting.enabled === true
        ) {
            invocation.maximumOutputTokens = this.outputLimit(
                request,
                effective,
            );
            invocation.profile.maximumOutputTokens =
                invocation.maximumOutputTokens;
        }
        return this.accounted(request, options, effective, () =>
            handler.invoke(invocation, options),
        );
    },
    /** Invokes streaming on the selected adapter. @param {Object} request Provider request. @param {Function} onEvent Normalized event listener. @param {Object} options Layered configuration and dependencies. @returns {Promise<Object>} Final normalized response. */
    invokeStream: function (request, onEvent, options) {
        const effective = this.getEffectiveConfiguration(options);
        this.validate(effective, request);
        if (effective.adapter.capabilities.streaming !== true)
            return Promise.reject(
                new Error('COPILOT_PROVIDER_STREAMING_UNSUPPORTED'),
            );
        const handler = this.resolveHandler(effective.adapter, options);
        if (typeof handler.invokeStream !== 'function')
            return Promise.reject(
                new Error('COPILOT_PROVIDER_STREAM_HANDLER_UNAVAILABLE'),
            );
        const invocation = Object.assign({}, request, {
            stream: true,
            profile: Object.assign({}, effective.profile),
            adapter: Object.assign({}, effective.adapter),
            limits: Object.assign({}, effective.defaults),
        });
        if (
            effective.configuration.accounting &&
            effective.configuration.accounting.enabled === true
        ) {
            invocation.maximumOutputTokens = this.outputLimit(
                request,
                effective,
            );
            invocation.profile.maximumOutputTokens =
                invocation.maximumOutputTokens;
        }
        return this.accounted(request, options, effective, () =>
            handler.invokeStream(
                invocation,
                (event) =>
                    onEvent(
                        this.normalizeResponse(effective.adapterName, event),
                    ),
                options,
            ),
        );
    },
};
