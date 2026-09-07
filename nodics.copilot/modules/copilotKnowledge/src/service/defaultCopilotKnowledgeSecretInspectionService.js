/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeSecretInspectionService @description Detects high-confidence credential material before knowledge content can be chunked, projected, logged, or sent to a provider. @layer service @owner copilotKnowledge @override Projects may add detectors but must preserve the default high-confidence rules and fail-closed result shape. */
module.exports = {
    /** Returns high-confidence detector definitions without exposing matched values. @returns {Object[]} Detectors. */
    detectors: function () {
        return [
            { code: 'PRIVATE_KEY', expression: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/u },
            { code: 'AWS_ACCESS_KEY', expression: /\bAKIA[0-9A-Z]{16}\b/u },
            { code: 'GITHUB_TOKEN', expression: /\bgh[psuro]_[A-Za-z0-9_]{30,}\b/u },
            { code: 'BEARER_TOKEN', expression: /\bBearer\s+[A-Za-z0-9._~+\/-]{32,}={0,2}\b/u },
            { code: 'ASSIGNED_SECRET', expression: /(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[:=]\s*["'][^"'\r\n]{16,}["']/iu }
        ];
    },
    /** Inspects content and returns only detector codes. @param {string} content Candidate content. @returns {Object} Safe inspection result. */
    inspect: function (content) {
        const value = String(content || '');
        const findings = this.detectors().filter(detector => detector.expression.test(value)).map(detector => detector.code);
        return Object.freeze({ safe: findings.length === 0, findingCodes: Object.freeze(findings) });
    }
};
