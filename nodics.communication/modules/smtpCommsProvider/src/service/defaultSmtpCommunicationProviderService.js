/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module smtpCommsProvider/src/service/defaultSmtpCommunicationProviderService @description Adapts durable Communication delivery to the existing sandbox or an explicitly configured SMTP test transport without exposing credentials/content. @layer service @owner smtpCommsProvider */
module.exports = {
    code: 'smtp-sandbox',

    /** Accepts the durable Communication envelope while retaining the existing sandbox injection contract. */
    deliver: async function (value, ports, configuration) {
        if (!value || !Object.hasOwn(value, 'intent')) return this.deliverSandbox(value, ports, configuration);
        const policy = this.runtimePolicy(value.policy);
        if (policy.mode === 'SMTP') return this.deliverSmtp(value, policy);
        if (policy.mode !== 'SANDBOX') return { status: 'UNCONFIGURED', responseCode: 'ERR_COMMS_SMTP_CONFIGURATION' };
        if (policy.enabled !== true) return { status: 'UNCONFIGURED', responseCode: 'ERR_COMMS_SMTP_DISABLED' };
        const intent = value.intent;
        const tenant = value.request?.authData?.tenant || value.request?.tenant;
        if (!tenant || !intent || intent.tenant !== tenant ||
            (value.request.tenant && value.request.tenant !== tenant) || intent.channel !== 'EMAIL' ||
            intent.status !== 'DELIVERING' || !Number.isFinite(new Date(intent.leaseExpiresAt).getTime()) ||
            new Date(intent.leaseExpiresAt).getTime() <= Date.now())
            return { status: 'FAILED', responseCode: 'ERR_COMMS_SMTP_CONTEXT' };
        if (intent.expiresAt && (!Number.isFinite(new Date(intent.expiresAt).getTime()) ||
            new Date(intent.expiresAt).getTime() <= Date.now()))
            return { status: 'SUPPRESSED', responseCode: 'ERR_COMMS_SMTP_EXPIRED' };
        const transport = typeof policy.sandboxTransportService === 'string' && SERVICE[policy.sandboxTransportService];
        if (!transport || typeof transport.resolveCredential !== 'function' || typeof transport.send !== 'function') {
            return { status: 'UNCONFIGURED', responseCode: 'ERR_COMMS_SMTP_CONFIGURATION' };
        }
        return this.deliverSandbox({ channel: intent.channel, intentCode: intent.code,
            idempotencyKey: intent.idempotencyKey, recipientAddressReference: intent.recipientAddressReference,
            rendered: intent.renderedContent }, {
            resolveCredential: transport.resolveCredential.bind(transport), send: transport.send.bind(transport)
        }, policy);
    },

    /** Merges the existing provider defaults with the trusted sending-runtime selection, never browser input. */
    runtimePolicy: function (selected) {
        const defaults = typeof CONFIG !== 'undefined' ? CONFIG.get('smtpCommsProvider') || {} : {};
        return { ...defaults, ...(selected || {}), smtp: { ...(defaults.smtp || {}), ...((selected || {}).smtp || {}) } };
    },

    /** Returns only a stable provider error; credentials, provider replies and addresses are not diagnostics. */
    smtpError: function (suffix) {
        return Object.assign(new Error('SMTP provider operation is unavailable'), { code: 'ERR_COMMS_SMTP_' + suffix });
    },

    /** Accepts one plain email address, excluding display-name and multiple-recipient syntax. */
    mailbox: function (value) {
        if (typeof value !== 'string' || value.length > 320 || /[\r\n,;<>]/.test(value) ||
            !require('email-validator').validate(value.trim())) throw this.smtpError('CONFIGURATION');
        return value.trim().toLowerCase();
    },

    /** Resolves a credential object through the established runtime/secure configuration stores on each send. */
    smtpCredential: function (reference) {
        if (typeof reference !== 'string' || !reference || reference.length > 256) throw this.smtpError('CONFIGURATION');
        const runtime = CONFIG.get('runtimeConfiguration') || {}, secure = CONFIG.get('secureConfiguration') || {};
        const store = runtime.credentials && Object.hasOwn(runtime.credentials, reference) ? runtime.credentials : secure.credentials;
        const entry = store && Object.hasOwn(store, reference) ? store[reference] : undefined;
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw this.smtpError('CONFIGURATION');
        const user = this.mailbox(entry.user);
        if (entry.type === 'OAuth2') {
            if (typeof entry.accessToken !== 'string' || !entry.accessToken || /[\r\n]/.test(entry.accessToken)) throw this.smtpError('CONFIGURATION');
            return { type: 'OAuth2', user, accessToken: entry.accessToken };
        }
        if (entry.type !== undefined && entry.type !== 'login') throw this.smtpError('CONFIGURATION');
        if (typeof entry.pass !== 'string' || !entry.pass || /[\r\n]/.test(entry.pass)) throw this.smtpError('CONFIGURATION');
        return { user, pass: entry.pass };
    },

    /** Resolves an approved sender reference from the existing Communication configuration owner. */
    smtpSender: function (reference) {
        const policy = CONFIG.get('communication') || {};
        const entry = typeof reference === 'string' && policy.senders && Object.hasOwn(policy.senders, reference) ? policy.senders[reference] : undefined;
        const address = this.mailbox(typeof entry === 'string' ? entry : entry && entry.address);
        const name = typeof entry === 'object' && entry ? entry.name : undefined;
        if (name !== undefined && (typeof name !== 'string' || name.length > 128 || /[\r\n]/.test(name))) throw this.smtpError('CONFIGURATION');
        return { address, ...(name ? { name } : {}) };
    },

    /** Constructs bounded TLS-safe options; plaintext is available only on explicitly selected loopback test hosts. */
    smtpOptions: function (policy, credential) {
        const smtp = policy.smtp || {}, timeout = policy.timeoutMilliseconds;
        if (policy.enabled !== true || policy.mode !== 'SMTP' || policy.sandboxOnly !== false ||
            policy.testOnly !== true || policy.liveQualified === true || !Array.isArray(policy.allowedRecipients) ||
            !policy.allowedRecipients.length || policy.allowedRecipients.length > 100 ||
            !Number.isSafeInteger(timeout) || timeout < 1 || timeout > 60000 ||
            !Number.isSafeInteger(smtp.port) || smtp.port < 1 || smtp.port > 65535 ||
            typeof smtp.host !== 'string' || !smtp.host || smtp.host.length > 253 || /[\s/@?#]/.test(smtp.host) ||
            typeof smtp.secure !== 'boolean' || typeof smtp.requireTLS !== 'boolean' ||
            Object.keys(smtp).some(key => !['host','port','secure','requireTLS','allowInsecureLoopback'].includes(key))) throw this.smtpError('CONFIGURATION');
        const loopback = ['127.0.0.1','::1','localhost'].includes(smtp.host);
        if ((!smtp.secure && !smtp.requireTLS && !(loopback && smtp.allowInsecureLoopback === true)) ||
            (smtp.port === 465 && !smtp.secure) || (smtp.allowInsecureLoopback === true && !loopback)) throw this.smtpError('CONFIGURATION');
        policy.allowedRecipients.forEach(address => this.mailbox(address));
        return { host: smtp.host, port: smtp.port, secure: smtp.secure, requireTLS: smtp.requireTLS,
            auth: credential, pool: false, logger: false, debug: false,
            disableFileAccess: true, disableUrlAccess: true, maxRecipients: 1,
            connectionTimeout: timeout, greetingTimeout: timeout, socketTimeout: timeout, dnsTimeout: timeout,
            tls: { rejectUnauthorized: true } };
    },

    /** Uses the maintained SMTP/MIME library in its owning provider; no credentials are retained between sends. */
    createSmtpTransport: function (options) { return require('nodemailer').createTransport(options); },

    /** Classifies only definitive SMTP rejections as retryable; ambiguous sends never trigger an automatic replay. */
    smtpFailure: function (error) {
        if (error && (error.code === 'EAUTH' || error.code === 'ERR_COMMS_SMTP_CONFIGURATION')) {
            return { status: 'UNCONFIGURED', responseCode: 'ERR_COMMS_SMTP_CONFIGURATION' };
        }
        if (error && Number.isInteger(error.responseCode) && error.responseCode >= 400 && error.responseCode < 600) {
            return { status: error.responseCode < 500 ? 'RETRY_PENDING' : 'FAILED', responseCode: 'ERR_COMMS_SMTP_REJECTED' };
        }
        return { status: 'UNCERTAIN', responseCode: 'ERR_COMMS_SMTP_UNCERTAIN' };
    },

    /** Sends one already-claimed, tenant-bound intent to an approved test mailbox. SMTP acceptance is not inbox evidence. */
    deliverSmtp: async function ({ request, intent }, policy) {
        if (policy.enabled !== true) return { status: 'UNCONFIGURED', responseCode: 'ERR_COMMS_SMTP_DISABLED' };
        let transport;
        try {
            const tenant = request && (request.authData && request.authData.tenant || request.tenant);
            if (!tenant || !intent || intent.tenant !== tenant ||
                (request.tenant && request.tenant !== tenant) || intent.channel !== 'EMAIL' ||
                intent.status !== 'DELIVERING' || typeof intent.code !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(intent.code) ||
                typeof intent.idempotencyKey !== 'string' || !intent.idempotencyKey ||
                !Number.isFinite(new Date(intent.leaseExpiresAt).getTime()) || new Date(intent.leaseExpiresAt).getTime() <= Date.now()) {
                return { status: 'FAILED', responseCode: 'ERR_COMMS_SMTP_CONTEXT' };
            }
            if (intent.expiresAt && (!Number.isFinite(new Date(intent.expiresAt).getTime()) || new Date(intent.expiresAt).getTime() <= Date.now())) {
                return { status: 'SUPPRESSED', responseCode: 'ERR_COMMS_SMTP_EXPIRED' };
            }
            const credential = this.smtpCredential(policy.credentialReference), sender = this.smtpSender(policy.senderReference);
            const options = this.smtpOptions(policy, credential), recipient = this.mailbox(intent.recipientAddressReference);
            if (sender.address !== credential.user || !policy.allowedRecipients.map(address => this.mailbox(address)).includes(recipient)) {
                return { status: 'SUPPRESSED', responseCode: 'ERR_COMMS_SMTP_RECIPIENT' };
            }
            const content = intent.renderedContent;
            if (!content || typeof content.subject !== 'string' || typeof content.body !== 'string' ||
                (content.html !== undefined && typeof content.html !== 'string') ||
                /[\r\n]/.test(content.subject) || !Number.isSafeInteger(policy.maximumContentBytes) ||
                policy.maximumContentBytes < 1 || policy.maximumContentBytes > 1048576 ||
                Buffer.byteLength(content.subject + content.body + (content.html || ''), 'utf8') > policy.maximumContentBytes) {
                return { status: 'FAILED', responseCode: 'ERR_COMMS_SMTP_CONTENT' };
            }
            transport = this.createSmtpTransport(options);
            const result = await transport.sendMail({ from: sender, to: recipient,
                envelope: { from: sender.address, to: [recipient] },
                subject: content.subject, text: content.body,
                ...(content.html !== undefined ? { html: content.html } : {}),
                messageId: '<' + intent.code + '@nodics.invalid>',
                disableFileAccess: true, disableUrlAccess: true });
            if (!result || !Array.isArray(result.accepted) || result.accepted.length !== 1 ||
                typeof result.accepted[0] !== 'string' || result.accepted[0].trim().toLowerCase() !== recipient || !Array.isArray(result.rejected) || result.rejected.length) {
                return { status: 'UNCERTAIN', responseCode: 'ERR_COMMS_SMTP_UNCERTAIN' };
            }
            return { status: 'DELIVERED', providerReference: intent.code,
                responseCode: 'SUC_COMMS_SMTP_ACCEPTED', sandbox: false };
        } catch (error) { return this.smtpFailure(error); }
        finally {
            // A transport cleanup failure cannot erase an already acknowledged send.
            if (transport && typeof transport.close === 'function') { try { transport.close(); } catch (_) { /* No retry or secret-bearing diagnostics. */ } }
        }
    },

    /** Delivers one email intent through injected sandbox ports. */
    deliverSandbox: async function (request, ports, configuration) {
        configuration = { ...require('../../config/properties').smtpCommsProvider, ...(configuration || {}) }; ports = ports || {};
        if (configuration.enabled !== true) throw Object.assign(new Error('email provider is disabled'), { code: 'COMMS_PROVIDER_DISABLED' });
        if (configuration.sandboxOnly !== true || configuration.liveQualified === true) throw Object.assign(new Error('email provider sandbox policy is invalid'), { code: 'COMMS_PROVIDER_POLICY' });
        if (!configuration.endpoint || !configuration.credentialReference || !configuration.senderReference) throw Object.assign(new Error('email provider references are incomplete'), { code: 'COMMS_PROVIDER_CONFIGURATION' });
        if (!request || request.channel !== 'EMAIL' || !request.intentCode || !request.idempotencyKey || !request.recipientAddressReference) throw Object.assign(new Error('invalid email delivery request'), { code: 'COMMS_PROVIDER_REQUEST' });
        if (typeof ports.resolveCredential !== 'function' || typeof ports.send !== 'function') throw Object.assign(new Error('email provider ports are unavailable'), { code: 'COMMS_PROVIDER_UNAVAILABLE' });
        const rendered = this.sandboxContent(request.rendered, configuration);
        const credential = await ports.resolveCredential(configuration.credentialReference);
        if (!credential) throw Object.assign(new Error('email provider credential is unavailable'), { code: 'COMMS_PROVIDER_CREDENTIAL' });
        const response = await ports.send({ endpoint: configuration.endpoint, credential, senderReference: configuration.senderReference, recipientAddressReference: request.recipientAddressReference, rendered, idempotencyKey: request.idempotencyKey, timeoutMilliseconds: configuration.timeoutMilliseconds });
        if (!response || !response.reference) throw Object.assign(new Error('email provider returned no reference'), { code: 'COMMS_PROVIDER_RESPONSE' });
        return { status: response.accepted === false ? 'FAILED' : 'DELIVERED', providerReference: response.reference, responseCode: response.code || 'SANDBOX_ACCEPTED', sandbox: true };
    },
    /**
     * Projects literal MIME alternatives without leaking private template provenance.
     * @param {object} content Frozen subject/body/HTML representations.
     * @param {object} policy Effective content limit.
     * @returns {object} Bounded MIME strings; throws before credential or transport access.
     */
    sandboxContent: function (content, policy) {
        if (!content || typeof content.body !== 'string' ||
            (content.subject !== undefined && typeof content.subject !== 'string') ||
            (content.html !== undefined && typeof content.html !== 'string') ||
            /[\r\n\0]/.test(content.subject || '') || !Number.isSafeInteger(policy.maximumContentBytes) ||
            policy.maximumContentBytes < 1 || policy.maximumContentBytes > 1048576 ||
            Buffer.byteLength((content.subject || '') + content.body + (content.html || '')) > policy.maximumContentBytes)
            throw Object.assign(new Error('Invalid email content'), { code: 'COMMS_PROVIDER_REQUEST' });
        return { body: content.body, ...(content.subject !== undefined ? { subject: content.subject } : {}),
            ...(content.html !== undefined ? { html: content.html } : {}) };
    },
    /** Reports disabled or sandbox transport availability without exposing secrets. */
    health: async function (ports, configuration) {
        const policy = this.runtimePolicy(configuration);
        if (policy.enabled !== true) return { code: this.code, status: 'DISABLED', liveQualified: false };
        if (policy.mode === 'SMTP') {
            try {
                const credential = this.smtpCredential(policy.credentialReference);
                const sender = this.smtpSender(policy.senderReference);
                this.smtpOptions(policy, credential);
                if (sender.address !== credential.user) throw this.smtpError('CONFIGURATION');
                return { code: 'smtp', status: 'CONFIGURED', liveQualified: false, transportVerified: false };
            } catch (_) { return { code: 'smtp', status: 'UNCONFIGURED', liveQualified: false, transportVerified: false }; }
        }
        if (!ports || typeof ports.health !== 'function') return { code: this.code, status: 'UNAVAILABLE', liveQualified: false };
        return { code: this.code, status: await ports.health(policy.endpoint) ? 'AVAILABLE' : 'UNAVAILABLE', liveQualified: false };
    }
};
