/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const crypto = require('node:crypto');

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeChunkService @description Creates deterministic bounded text chunks with source provenance for Discovery projection. @layer service @owner copilotKnowledge @override Projects may improve parsing while preserving deterministic digests, bounds, provenance, and security metadata. */
module.exports = {
    /** Hashes content without retaining it in diagnostics. @param {string} value Content. @returns {string} SHA-256 digest. */
    digest: function (value) {
        return crypto.createHash('sha256').update(String(value || '')).digest('hex');
    },
    /** Derives a human-readable title from Markdown or a path. @param {string} content Content. @param {string} relativePath Relative path. @returns {string} Title. */
    title: function (content, relativePath) {
        const heading = String(content || '').split(/\r?\n/u).find(line => /^#\s+\S/u.test(line));
        return heading ? heading.replace(/^#\s+/u, '').trim() : String(relativePath || 'Untitled').split('/').pop();
    },
    /** Splits one safe file into overlapping deterministic chunks. @param {Object} file Safe file. @param {Object} source Classified source. @param {Object} configuration Ingestion configuration. @returns {Object[]} Chunks. */
    chunk: function (file, source, configuration) {
        const content = String(file.content || '').replace(/\r\n/gu, '\n').trim();
        if (!content) return [];
        const maximum = Number((configuration || {}).chunkCharacters || 4000);
        const overlap = Math.min(Number((configuration || {}).chunkOverlapCharacters || 400), Math.floor(maximum / 2));
        if (!Number.isInteger(maximum) || maximum < 500) throw new Error('COPILOT_KNOWLEDGE_CHUNK_CONFIGURATION_INVALID');
        const chunks = [];
        let offset = 0;
        while (offset < content.length) {
            let end = Math.min(offset + maximum, content.length);
            if (end < content.length) {
                const boundary = content.lastIndexOf('\n\n', end);
                if (boundary > offset + Math.floor(maximum / 2)) end = boundary;
            }
            const text = content.slice(offset, end).trim();
            if (text) {
                const digest = this.digest(text);
                chunks.push({
                    code: source.code + '|' + this.digest(file.relativePath).slice(0, 16) + '|' + String(chunks.length + 1),
                    sourceCode: source.code, sourceType: source.sourceType, classification: source.classification,
                    repository: source.repository, project: source.project, module: source.module, owner: source.owner,
                    version: source.version, relativePath: file.relativePath, title: this.title(content, file.relativePath),
                    content: text, contentDigest: digest, sequence: chunks.length + 1,
                    allowedChannels: source.allowedChannels, requiredPermissions: source.requiredPermissions,
                    tenantScopes: source.tenantScopes, enterpriseScopes: source.enterpriseScopes,
                    customerScopes: source.customerScopes, customerProjectScopes: source.customerProjectScopes,
                    environmentScopes: source.environmentScopes
                });
            }
            if (end >= content.length) break;
            offset = Math.max(offset + 1, end - overlap);
        }
        return chunks;
    }
};
