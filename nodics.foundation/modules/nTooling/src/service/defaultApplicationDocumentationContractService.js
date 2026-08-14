/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/defaultApplicationDocumentationContractService
 * @description Validates application-owned documentation sources and builds immutable WCMS Staged content-pack manifest sections without owning project renderers or runtime import behavior.
 * @layer tooling
 * @owner nTooling
 * @override Projects may narrow catalogue and release policy through a later tooling service while preserving path containment, immutable checksums, optional Axis administration, and Staged-to-Online publication.
 */
module.exports = {
    /** Returns a deterministic SHA-256 checksum. */
    sha256: function (value) {
        return crypto.createHash('sha256').update(value).digest('hex');
    },

    /** Raises a stable validation error. */
    fail: function (code, message) {
        const error = new Error(message);
        error.code = code;
        throw error;
    },

    /** Normalizes and validates a repository-relative path. */
    relativePath: function (value, label) {
        if (typeof value !== 'string' || !value.trim()) {
            this.fail('ERR_TOOL_DOC_00001', label + ' must be a non-empty relative path');
        }
        const normalized = value.replace(/\\/g, '/').replace(/^\.\//, '');
        if (path.isAbsolute(value) || normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
            this.fail('ERR_TOOL_DOC_00001', label + ' must remain inside its owning module');
        }
        return normalized;
    },

    /** Verifies that a resolved path stays inside an owning directory. */
    containedPath: function (ownerRoot, relativeValue, label) {
        const relative = this.relativePath(relativeValue, label);
        const owner = path.resolve(ownerRoot);
        const resolved = path.resolve(owner, relative);
        if (resolved !== owner && !resolved.startsWith(owner + path.sep)) {
            this.fail('ERR_TOOL_DOC_00001', label + ' escapes its owning module');
        }
        return resolved;
    },

    /** Validates a module-owned documentation catalogue and returns its source files. */
    validateCatalogue: function (request) {
        const root = path.resolve(request && request.ownerRoot || '');
        const sourceDirectory = this.relativePath(request && request.sourceDirectory || 'docs', 'sourceDirectory');
        if (sourceDirectory === 'data' || sourceDirectory.startsWith('data/')) {
            this.fail('ERR_TOOL_DOC_00002', 'documentation source must not live under generated/runtime data');
        }
        const cataloguePath = this.relativePath(request && request.cataloguePath || sourceDirectory + '/catalogue.json', 'cataloguePath');
        if (cataloguePath !== sourceDirectory + '/catalogue.json') {
            this.fail('ERR_TOOL_DOC_00002', 'catalogue must be owned by ' + sourceDirectory + '/catalogue.json');
        }
        const catalogue = request && request.catalogue;
        if (!catalogue || typeof catalogue.pack !== 'string' || !catalogue.pack || typeof catalogue.version !== 'string' || !catalogue.version) {
            this.fail('ERR_TOOL_DOC_00003', 'catalogue requires stable pack and version values');
        }
        const documents = Array.isArray(catalogue.documents) ? catalogue.documents : [];
        if (!documents.length) {
            this.fail('ERR_TOOL_DOC_00003', 'catalogue requires at least one document');
        }
        const identities = new Set();
        const sources = documents.map(document => {
            if (!document || !/^[a-z][a-z0-9.-]*$/.test(document.id || '') || identities.has(document.id)) {
                this.fail('ERR_TOOL_DOC_00004', 'document identities must be unique stable lowercase codes');
            }
            identities.add(document.id);
            const content = this.relativePath(document.content, document.id + '.content');
            if (!content.startsWith(sourceDirectory + '/pages/') || !content.endsWith('.md')) {
                this.fail('ERR_TOOL_DOC_00002', document.id + ' source must be Markdown below ' + sourceDirectory + '/pages');
            }
            const sourcePath = this.containedPath(root, content, document.id + '.content');
            if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
                this.fail('ERR_TOOL_DOC_00005', document.id + ' source does not exist');
            }
            return Object.freeze({ id: document.id, relativePath: content, absolutePath: sourcePath });
        });
        return Object.freeze({ pack: catalogue.pack, version: catalogue.version, cataloguePath: cataloguePath, sourceDirectory: sourceDirectory, documents: Object.freeze(sources) });
    },

    /** Validates generated data hashes and returns the aggregate release checksum. */
    releaseChecksum: function (generatedHashes) {
        const entries = Object.entries(generatedHashes || {});
        if (!entries.length) {
            this.fail('ERR_TOOL_DOC_00006', 'documentation release requires generated files');
        }
        entries.forEach(([fileName, checksum]) => {
            const relative = this.relativePath(fileName, 'generated file');
            if (!(relative.startsWith('core/data/') || relative.startsWith('core/headers/') || relative.startsWith('staged/')) || !/^[a-f0-9]{64}$/.test(checksum || '')) {
                this.fail('ERR_TOOL_DOC_00006', 'generated documentation files require governed data paths and SHA-256 checksums');
            }
        });
        return this.sha256(entries.sort(([left], [right]) => left.localeCompare(right)).map(([fileName, checksum]) => fileName + ':' + checksum).join('|'));
    },

    /** Builds the shared immutable application-documentation manifest contract. */
    buildReleaseSection: function (request) {
        const section = {
            kind: 'CONTENT_PACK',
            contentPath: this.relativePath(request.contentPath, 'contentPath'),
            pack: request.catalogue.pack,
            version: request.catalogue.version,
            owningDomain: request.owningDomain,
            lifecycle: 'PUBLISHABLE',
            destinationRole: 'WCMS_STAGED',
            environmentScope: request.environmentScope || ['ALL'],
            sensitivity: request.sensitivity || 'PUBLIC',
            versioningPolicy: 'IMMUTABLE',
            publicationPolicy: 'REQUIRED',
            initialPublicationPolicy: 'ADMIN_INITIATED',
            installationPolicy: 'OPTIONAL_AXIS_INITIATED',
            removalPolicy: 'UNPUBLISH_OR_RETIRE',
            sourceMode: 'catalogue-markdown-source',
            sourceAuthority: this.relativePath(request.sourceAuthority, 'sourceAuthority'),
            sites: request.sites,
            accessMode: request.accessMode || 'PUBLIC',
            pages: request.pages,
            components: request.components,
            routes: request.routes,
            releaseChecksum: this.releaseChecksum(request.generatedHashes),
            generatedHashes: request.generatedHashes
        };
        if (request.migrationRegister) {
            section.migrationRegister = this.relativePath(request.migrationRegister, 'migrationRegister');
        }
        return this.validateReleaseSection(section);
    },

    /** Validates the shared publication and installation invariants. */
    validateReleaseSection: function (section) {
        if (!section || section.kind !== 'CONTENT_PACK' || section.lifecycle !== 'PUBLISHABLE' || section.destinationRole !== 'WCMS_STAGED' ||
            section.versioningPolicy !== 'IMMUTABLE' || section.publicationPolicy !== 'REQUIRED' || section.initialPublicationPolicy !== 'ADMIN_INITIATED' ||
            section.installationPolicy !== 'OPTIONAL_AXIS_INITIATED' || section.removalPolicy !== 'UNPUBLISH_OR_RETIRE') {
            this.fail('ERR_TOOL_DOC_00007', 'application documentation must be optional Axis-installed, immutable Staged content requiring publication');
        }
        if (typeof section.sourceAuthority !== 'string' || !section.sourceAuthority ||
            section.sourceAuthority === 'data' || section.sourceAuthority.startsWith('data/')) {
            this.fail('ERR_TOOL_DOC_00002', 'authored documentation source must remain outside generated/runtime data');
        }
        if (!Array.isArray(section.sites) || !section.sites.length || !Number.isInteger(section.pages) || section.pages < 1 ||
            !Number.isInteger(section.components) || section.components < 1 || !Number.isInteger(section.routes) || section.routes < 1) {
            this.fail('ERR_TOOL_DOC_00007', 'application documentation release counts and Site ownership are incomplete');
        }
        if (section.releaseChecksum !== this.releaseChecksum(section.generatedHashes)) {
            this.fail('ERR_TOOL_DOC_00006', 'application documentation release checksum is inconsistent');
        }
        return Object.freeze(section);
    }
};
