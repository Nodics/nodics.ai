/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const REDACTED = '[REDACTED]';

const secretPatterns = Object.freeze([
    { code: 'bearer-token', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]+/gi, replacement: `Bearer ${REDACTED}` },
    { code: 'password-assignment', pattern: /(password|passwd|pwd)\s*[:=]\s*["']?[^"',\s}]+/gi, replacement: `$1=${REDACTED}` },
    { code: 'token-assignment', pattern: /(access[_-]?token|refresh[_-]?token|auth[_-]?token|secret|api[_-]?key)\s*[:=]\s*["']?[^"',\s}]+/gi, replacement: `$1=${REDACTED}` },
    { code: 'secret-query', pattern: /([?&](?:token|access_token|refresh_token|authToken|api_key|secret)=)[^&\s"']+/gi, replacement: `$1${REDACTED}` },
    { code: 'private-key', pattern: /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, replacement: REDACTED }
]);

function redactText(value, maxBytes) {
    const redactions = [];
    let text = String(value === undefined || value === null ? '' : value);
    secretPatterns.forEach(rule => {
        if (rule.pattern.test(text)) {
            redactions.push(rule.code);
            rule.pattern.lastIndex = 0;
            text = text.replace(rule.pattern, rule.replacement);
        }
        rule.pattern.lastIndex = 0;
    });
    const bytes = Buffer.byteLength(text, 'utf8');
    if (maxBytes && bytes > maxBytes) {
        redactions.push('truncated');
        text = Buffer.from(text, 'utf8').subarray(0, maxBytes).toString('utf8') +
            '\n[TRUNCATED]';
    }
    return {
        value: text,
        redactions: Array.from(new Set(redactions))
    };
}

/**
 * @module installer/service/DefaultInstallerRedactionService
 * @description Redacts installer evidence and diagnostics before they can be returned to Axis.
 * @layer service
 * @owner installer
 * @override Extend redaction patterns conservatively; never remove a pattern without replacement coverage.
 */
module.exports = {
    REDACTED,
    secretPatterns,
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    redactText
};
