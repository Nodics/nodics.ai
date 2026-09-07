/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @module copilotKnowledge/src/service/defaultCopilotRepositoryKnowledgeSourceProviderService @description Reads only registered non-public repository files beneath configured repository roots with symlink, path, extension, file-count, and byte bounds. @layer service @owner copilotKnowledge @override Projects may replace repository transport while preserving containment and source classification rules. */
module.exports = {
    /** Builds a partition-specific configuration that may only narrow global repository bounds. @param {Object} source Registered source. @param {Object} configuration Global ingestion configuration. @returns {Object} Effective bounded configuration. */
    effectiveConfiguration: function (source, configuration) {
        const globalConfiguration = configuration || {};
        const limits = source && source.limits || {};
        const narrow = (sourceLimit, globalLimit, fallback) => Math.min(Number(sourceLimit || globalLimit || fallback), Number(globalLimit || fallback));
        const globallyAllowed = (globalConfiguration.allowedExtensions || []).map(value => String(value).toLowerCase());
        const requested = source && source.allowedExtensions && source.allowedExtensions.length ? source.allowedExtensions : globallyAllowed;
        return Object.assign({}, globalConfiguration, {
            allowedExtensions: requested.filter(extension => globallyAllowed.includes(String(extension).toLowerCase())),
            maximumFilesPerSource: narrow(limits.maximumFiles, globalConfiguration.maximumFilesPerSource, 5000),
            maximumFileBytes: narrow(limits.maximumFileBytes, globalConfiguration.maximumFileBytes, 1048576),
            maximumSourceBytes: narrow(limits.maximumSourceBytes, globalConfiguration.maximumSourceBytes, 52428800)
        });
    },
    /** Determines whether a relative path matches one bounded registry pattern. @param {string} relativePath Relative path. @param {string} pattern Registry pattern. @returns {boolean} Match result. */
    matchesPattern: function (relativePath, pattern) {
        const candidate = String(relativePath).replace(/\\/gu, '/');
        const expected = String(pattern || '').replace(/\\/gu, '/').replace(/^\.\//u, '');
        if (!expected || expected.startsWith('/') || expected.split('/').includes('..')) return false;
        if (expected === '**/README.md') return candidate === 'README.md' || candidate.endsWith('/README.md');
        if (expected === '**/AGENTS.md') return candidate === 'AGENTS.md' || candidate.endsWith('/AGENTS.md');
        if (expected.startsWith('**/') && !expected.slice(3).includes('*')) return candidate === expected.slice(3) || candidate.endsWith('/' + expected.slice(3));
        if (expected.startsWith('**/*.')) return candidate.endsWith(expected.slice(4));
        if (expected.startsWith('**/') && expected.endsWith('/*.md')) {
            const directory = expected.slice(3, -5);
            return candidate.endsWith('.md') && (candidate.startsWith(directory + '/') || candidate.includes('/' + directory + '/'));
        }
        if (expected.includes('/**/')) {
            const parts = expected.split('/**/');
            return candidate.startsWith(parts[0] + '/') && this.matchesPattern(candidate.slice(parts[0].length + 1), '**/' + parts[1]);
        }
        if (expected.endsWith('/*.md')) return candidate.startsWith(expected.slice(0, -5)) && candidate.endsWith('.md');
        return candidate === expected || candidate.startsWith(expected.replace(/\/$/u, '') + '/');
    },
    /** Determines whether a path is excluded by segment or registered pattern. @param {string} relativePath Relative path. @param {Object} source Source. @param {Object} configuration Configuration. @returns {boolean} Excluded state. */
    excluded: function (relativePath, source, configuration) {
        const candidate = String(relativePath).replace(/\\/gu, '/');
        const segments = candidate.split('/');
        if (((configuration || {}).excludedSegments || []).some(value => {
            const excluded = String(value).replace(/\\/gu, '/');
            return excluded.includes('/') ? candidate === excluded || candidate.startsWith(excluded + '/') || candidate.includes('/' + excluded + '/') : segments.includes(excluded);
        })) return true;
        return (source.excludedPaths || []).some(pattern => this.matchesPattern(candidate, pattern));
    },
    /** Walks a repository without following symbolic links. @param {string} root Canonical root. @param {string} current Current directory. @param {Object} source Source. @param {Object} configuration Configuration. @param {string[]} output Relative file accumulator. @returns {string[]} Files. */
    walk: function (root, current, source, configuration, output) {
        const relativeDirectory = path.relative(root, current).replace(/\\/gu, '/');
        if (relativeDirectory && this.excluded(relativeDirectory, source, configuration)) return output;
        const entries = fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
        entries.forEach(entry => {
            const absolute = path.join(current, entry.name);
            const relative = path.relative(root, absolute).replace(/\\/gu, '/');
            if (this.excluded(relative, source, configuration) || entry.isSymbolicLink()) return;
            if (entry.isDirectory()) this.walk(root, absolute, source, configuration, output);
            else if (entry.isFile() && source.paths.some(pattern => this.matchesPattern(relative, pattern))) output.push(relative);
            if (output.length > Number((configuration || {}).maximumFilesPerSource || 5000)) throw new Error('COPILOT_KNOWLEDGE_SOURCE_FILE_LIMIT_EXCEEDED');
        });
        return output;
    },
    /** Reads one registered repository source. @param {Object} source Classified source. @param {Object} options Provider options. @returns {Promise<Object[]>} Safe candidate files awaiting secret inspection. */
    read: async function (source, options) {
        if (!source || source.classification === 'PUBLIC' || source.sourceType === 'PUBLISHED_DOCUMENTATION') throw new Error('COPILOT_PUBLIC_REPOSITORY_SOURCE_FORBIDDEN');
        const configuration = this.effectiveConfiguration(source, (options || {}).configuration || {});
        const roots = (options || {}).repositoryRoots || {};
        const configuredRoot = roots[source.repository];
        if (!configuredRoot || !path.isAbsolute(configuredRoot)) throw new Error('COPILOT_KNOWLEDGE_REPOSITORY_ROOT_REQUIRED');
        const root = fs.realpathSync(configuredRoot);
        if (!fs.statSync(root).isDirectory()) throw new Error('COPILOT_KNOWLEDGE_REPOSITORY_ROOT_INVALID');
        const allowedExtensions = configuration.allowedExtensions || [];
        let totalBytes = 0;
        return this.walk(root, root, source, configuration, []).filter(relative => allowedExtensions.includes(path.extname(relative).toLowerCase())).map(relative => {
            const absolute = path.resolve(root, relative);
            if (absolute !== root && !absolute.startsWith(root + path.sep)) throw new Error('COPILOT_KNOWLEDGE_PATH_ESCAPE');
            const stat = fs.lstatSync(absolute);
            if (stat.isSymbolicLink() || stat.size > Number(configuration.maximumFileBytes || 1048576)) throw new Error('COPILOT_KNOWLEDGE_FILE_BOUND_EXCEEDED');
            totalBytes += stat.size;
            if (totalBytes > Number(configuration.maximumSourceBytes || 52428800)) throw new Error('COPILOT_KNOWLEDGE_SOURCE_BYTE_LIMIT_EXCEEDED');
            return { relativePath: relative, content: fs.readFileSync(absolute, 'utf8'), size: stat.size, updatedAt: stat.mtime.toISOString() };
        });
    }
};
