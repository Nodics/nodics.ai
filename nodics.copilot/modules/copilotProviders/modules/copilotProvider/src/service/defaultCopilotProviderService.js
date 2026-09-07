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
    /** Resolves effective layered provider configuration. @param {Object} options Invocation options. @returns {Object} Effective configuration. */
    getEffectiveConfiguration: function (options) {
        const source = options || {};
        const configuration = source.configuration || source;
        const defaults = configuration.default || {};
        const adapterName = source.adapter || defaults.adapter;
        const adapter = (configuration.adapters || {})[adapterName];
        const profileName = source.profile || defaults.profile;
        return { configuration: configuration, defaults: defaults, adapterName: adapterName, adapter: adapter, profileName: profileName, profile: (configuration.profiles || {})[profileName] || {} };
    },
    /** Validates activation and adapter metadata. @param {Object} effective Effective configuration. @param {Object} request Provider request. @returns {boolean} True when valid. */
    validate: function (effective, request) {
        if (effective.configuration.enabled !== true) throw new Error('COPILOT_PROVIDERS_DISABLED');
        if (!effective.adapterName || !effective.adapter || effective.adapter.enabled !== true) throw new Error('COPILOT_PROVIDER_UNAVAILABLE');
        if (effective.adapter.contractVersion !== effective.configuration.contractVersion) throw new Error('COPILOT_PROVIDER_CONTRACT_UNSUPPORTED');
        if (!effective.adapter.handler) throw new Error('COPILOT_PROVIDER_HANDLER_REQUIRED');
        if (!effective.adapter.capabilities || effective.adapter.capabilities.chat !== true) throw new Error('COPILOT_PROVIDER_CHAT_UNSUPPORTED');
        if (!request || !Array.isArray(request.messages) || request.messages.length === 0) throw new Error('COPILOT_PROVIDER_MESSAGES_REQUIRED');
        if (request.messages.length > Number(effective.defaults.maximumMessages || 64)) throw new Error('COPILOT_PROVIDER_MESSAGE_LIMIT_EXCEEDED');
        const credential = effective.adapter.credential || {};
        if (credential.mode === 'SECRET_REFERENCE' && !credential.secretRef) throw new Error('COPILOT_PROVIDER_SECRET_REFERENCE_REQUIRED');
        return true;
    },
    /** Resolves a configured handler. @param {Object} adapter Adapter metadata. @param {Object} options Runtime dependencies. @returns {Object} Handler. */
    resolveHandler: function (adapter, options) {
        const services = (options || {}).services || (typeof SERVICE !== 'undefined' ? SERVICE : {});
        const handler = services[adapter.handler];
        if (!handler || typeof handler.invoke !== 'function') throw new Error('COPILOT_PROVIDER_HANDLER_UNAVAILABLE');
        return handler;
    },
    /** Normalizes adapter output. @param {string} adapterName Adapter identity. @param {Object} response Adapter response. @returns {Object} Provider-neutral result. */
    normalizeResponse: function (adapterName, response) {
        const source = response || {};
        return { provider: adapterName, model: source.model || null, content: String(source.content || ''), toolCalls: Array.isArray(source.toolCalls) ? source.toolCalls : [], usage: Object.assign({ inputTokens: 0, outputTokens: 0, totalTokens: 0 }, source.usage || {}), finishReason: source.finishReason || 'complete', metadata: Object.assign({}, source.metadata || {}) };
    },
    /** Invokes the selected adapter. @param {Object} request Provider request. @param {Object} options Layered configuration and dependencies. @returns {Promise<Object>} Normalized response. */
    invoke: function (request, options) {
        const effective = this.getEffectiveConfiguration(options);
        this.validate(effective, request);
        const handler = this.resolveHandler(effective.adapter, options);
        const invocation = Object.assign({}, request, { profile: Object.assign({}, effective.profile), adapter: Object.assign({}, effective.adapter), limits: Object.assign({}, effective.defaults) });
        return Promise.resolve(handler.invoke(invocation, options)).then(response => this.normalizeResponse(effective.adapterName, response));
    },
    /** Invokes streaming on the selected adapter. @param {Object} request Provider request. @param {Function} onEvent Normalized event listener. @param {Object} options Layered configuration and dependencies. @returns {Promise<Object>} Final normalized response. */
    invokeStream: function (request, onEvent, options) {
        const effective = this.getEffectiveConfiguration(options);
        this.validate(effective, request);
        if (effective.adapter.capabilities.streaming !== true) return Promise.reject(new Error('COPILOT_PROVIDER_STREAMING_UNSUPPORTED'));
        const handler = this.resolveHandler(effective.adapter, options);
        if (typeof handler.invokeStream !== 'function') return Promise.reject(new Error('COPILOT_PROVIDER_STREAM_HANDLER_UNAVAILABLE'));
        const invocation = Object.assign({}, request, { stream: true, profile: Object.assign({}, effective.profile), adapter: Object.assign({}, effective.adapter), limits: Object.assign({}, effective.defaults) });
        return Promise.resolve(handler.invokeStream(invocation, event => onEvent(this.normalizeResponse(effective.adapterName, event)), options)).then(response => this.normalizeResponse(effective.adapterName, response));
    }
};
