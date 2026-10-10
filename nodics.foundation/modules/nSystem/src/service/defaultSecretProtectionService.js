/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE file. */
'use strict';
const crypto = require('node:crypto');

/** @module nSystem/service/defaultSecretProtectionService @description Purpose-bound authenticated encryption for capability-owned secrets. No storage, credential generation, API or authorization authority. @layer service @owner nSystem @override Supply purpose key rings through layered configuration; retain private capture admission, authenticated scope and strict envelopes. */
module.exports = {
    /** Refuses without exposing key material, plaintext or crypto diagnostics. @returns {never} Refusal. */
    fail: function () { throw new Error('SECRET_PROTECTION_REFUSED'); },
    /** Canonicalizes a bounded JSON binding without coercion or prototype keys. @param {*} value JSON value. @param {number} depth Nesting depth. @returns {string} Canonical JSON. */
    canonical: function (value, depth = 0) {
        if (depth > 12) this.fail();
        if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
        if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
        if (Array.isArray(value)) return '[' + value.map(item => this.canonical(item, depth + 1)).join(',') + ']';
        if (!value || Object.getPrototypeOf(value) !== Object.prototype) this.fail();
        const keys = Object.keys(value).sort();
        if (keys.some(key => ['__proto__', 'constructor', 'prototype'].includes(key))) this.fail();
        return '{' + keys.map(key => JSON.stringify(key) + ':' + this.canonical(value[key], depth + 1)).join(',') + '}';
    },
    /** Resolves a real purpose key, never a fallback runtime-configuration key. @param {Object} request Scope and purpose. @param {string} [keyId] Historical decryption key. @returns {Object} Private key and identity. */
    resolve: function (request, keyId) {
        if (!request || typeof request.tenant !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(request.tenant) ||
            !/^[A-Z][A-Z0-9_]{0,95}$/.test(request.purpose || '') ||
            !global.SERVICE?.DefaultLoggerService?.isRequestPrivacyQualified?.()) this.fail();
        const purpose = global.CONFIG?.get('secretProtection', request.tenant)?.purposes?.[request.purpose];
        const id = keyId === undefined ? purpose?.activeKeyId : keyId;
        if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,95}$/.test(id) ||
            !purpose?.keys || !Object.hasOwn(purpose.keys, id)) this.fail();
        const value = purpose.keys[id]?.encryptionKey;
        if (typeof value !== 'string' || !/^[a-f0-9]{64}$/i.test(value)) this.fail();
        const key = Buffer.from(value, 'hex');
        if (key.every(byte => byte === key[0])) { key.fill(0); this.fail(); }
        return { key, id };
    },
    /** Qualifies actual key material and capture controls, not configuration flags. @param {Object} request Scope and purpose. @returns {boolean} Ready. */
    assertReady: function (request) {
        const resolved = this.resolve(request);
        resolved.key.fill(0);
        return true;
    },
    /** Constructs authenticated purpose, tenant and immutable record binding. @param {Object} request Bound owner request. @returns {Buffer} AAD. */
    aad: function (request, keyId) {
        if (!request.binding || Object.getPrototypeOf(request.binding) !== Object.prototype) this.fail();
        const value = this.canonical({ contractVersion: 1, keyId, tenant: request.tenant, purpose: request.purpose, binding: request.binding });
        if (Buffer.byteLength(value) > 16384) this.fail();
        return Buffer.from(value);
    },
    /** Encrypts one bounded value; callers own permissions, private transport and persistence. @param {Object} request Scope, binding and plaintext value. @returns {Object} Authenticated envelope. */
    protect: function (request) {
        let key;
        try {
            const resolved = this.resolve(request); key = resolved.key;
            if (typeof request.value !== 'string' || !request.value || Buffer.byteLength(request.value) > 16384) this.fail();
            const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            cipher.setAAD(this.aad(request, resolved.id));
            const ciphertext = Buffer.concat([cipher.update(request.value, 'utf8'), cipher.final()]);
            return { contractVersion: 1, keyId: resolved.id, iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), ciphertext: ciphertext.toString('hex') };
        } catch (_) { this.fail(); } finally { key?.fill(0); }
    },
    /** Decrypts only a strict envelope bound to the original purpose and record. @param {Object} request Scope, binding and envelope. @returns {string} Plaintext for the authorized private owner. */
    unprotect: function (request) {
        let key;
        try {
            const e = request?.envelope;
            if (!e || Object.getPrototypeOf(e) !== Object.prototype ||
                Object.keys(e).sort().join(',') !== 'ciphertext,contractVersion,iv,keyId,tag' || e.contractVersion !== 1 ||
                !/^[a-f0-9]{24}$/.test(e.iv || '') || !/^[a-f0-9]{32}$/.test(e.tag || '') ||
                typeof e.ciphertext !== 'string' || !/^(?:[a-f0-9]{2}){1,16384}$/.test(e.ciphertext)) this.fail();
            const resolved = this.resolve(request, e.keyId); key = resolved.key;
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(e.iv, 'hex'));
            decipher.setAAD(this.aad(request, resolved.id)); decipher.setAuthTag(Buffer.from(e.tag, 'hex'));
            return Buffer.concat([decipher.update(Buffer.from(e.ciphertext, 'hex')), decipher.final()]).toString('utf8');
        } catch (_) { this.fail(); } finally { key?.fill(0); }
    }
};
