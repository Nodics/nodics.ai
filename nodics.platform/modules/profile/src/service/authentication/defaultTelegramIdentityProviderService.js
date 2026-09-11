/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('node:crypto');

/**
 * @module profile/service/defaultTelegramIdentityProviderService
 * @description Verifies Telegram Mini App launch assertions using server-configured credentials; returns minimized identity facts and never issues tokens.
 * @owner profile @layer service
 * @override Later provider modules may replace verification while retaining cryptographic proof, application binding and bounded freshness. No network or persistence side effects.
 */
module.exports = {
    /** Rejects untrusted assertions without echoing personal data or credentials. */
    invalid: function () { throw new CLASSES.NodicsError('ERR_PROFILE_EXTERNAL_ASSERTION'); },
    /** Verifies a bounded signed assertion against a configured bot. @param {object} options Provider configuration, proof and policy. @returns {object} Stable provider subject and consent facts; throws on failure. */
    verify: function ({ proof, application, policy }) {
        const token = process.env[application.secretEnvironmentVariable];
        if (!token || !/^\d+:[^\s]+$/.test(token)) throw new CLASSES.NodicsError('ERR_PROFILE_EXTERNAL_UNAVAILABLE');
        if (typeof proof !== 'string' || !proof || proof.length > policy.maximumAssertionCharacters) return this.invalid();
        const params = new URLSearchParams(proof), keys = [...params.keys()];
        if (new Set(keys).size !== keys.length) return this.invalid();
        const hash = params.get('hash');
        if (!/^[a-f0-9]{64}$/i.test(hash || '')) return this.invalid();
        params.delete('hash');
        const check = [...params.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key,value]) => key + '=' + value).join('\n');
        const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
        const expected = crypto.createHmac('sha256', secret).update(check).digest();
        if (!crypto.timingSafeEqual(expected, Buffer.from(hash, 'hex'))) return this.invalid();
        const at = Number(params.get('auth_date')), now = Math.floor(Date.now()/1000);
        if (!Number.isSafeInteger(at) || at <= 0 || at > now + policy.clockSkewSeconds || now - at > policy.maximumAssertionAgeSeconds) return this.invalid();
        let user; try { user = JSON.parse(params.get('user')); } catch { return this.invalid(); }
        if (!user || !Number.isSafeInteger(user.id) || user.id <= 0 || user.is_bot === true) return this.invalid();
        return { subject: String(user.id), applicationSubject: token.split(':')[0], authenticatedAt: at, allowsWrite: user.allows_write_to_pm === true };
    }
};
