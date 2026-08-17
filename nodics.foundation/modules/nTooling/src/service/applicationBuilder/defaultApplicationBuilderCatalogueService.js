/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderCatalogueService
 * @description Discovers a deterministic, read-only Application Builder capability catalogue from explicit repository roots, optional nodics.exp app catalogue, Nodics package metadata, Agora compositions, and Kickoff data-pack boundaries.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may enrich descriptor facts through the standard merged-service path, but must preserve explicit repository roots and source-backed provenance.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = {
    /**
     * Produces stable JSON text by recursively sorting object keys.
     * @param {*} value Serializable value.
     * @returns {string} Canonical JSON text.
     */
    stableStringify: function (value) {
        if (Array.isArray(value)) {
            return '[' + value.map(item => this.stableStringify(item)).join(',') + ']';
        }
        if (value && typeof value === 'object') {
            return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' +
                this.stableStringify(value[key])).join(',') + '}';
        }
        return JSON.stringify(value);
    },

    /**
     * Computes a prefixed SHA-256 digest for a serializable Builder artifact.
     * @param {*} value Serializable value.
     * @returns {string} `sha256:` digest.
     */
    digest: function (value) {
        return 'sha256:' + crypto.createHash('sha256').update(this.stableStringify(value)).digest('hex');
    },

    /**
     * Validates and resolves an explicitly supplied repository root.
     * @param {string} repositoryPath Candidate root.
     * @param {string} label Repository label.
     * @returns {string} Absolute existing directory.
     */
    resolveRepositoryRoot: function (repositoryPath, label) {
        if (!repositoryPath) {
            throw new Error('Application Builder discovery requires explicit repository root: ' + label);
        }
        const resolved = path.resolve(repositoryPath);
        if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
            throw new Error('Application Builder repository root is unavailable: ' + label + ' -> ' + resolved);
        }
        return resolved;
    },

    /**
     * Reads a nodics.exp frontend application catalogue when supplied.
     * @param {string} expRoot Candidate nodics.exp root.
     * @returns {Object|null} Parsed experience catalogue or null.
     */
    loadExperienceCatalogue: function (expRoot) {
        if (!expRoot) {
            return null;
        }
        const resolved = this.resolveRepositoryRoot(expRoot, 'exp');
        const cataloguePath = path.join(resolved, 'apps.json');
        if (!fs.existsSync(cataloguePath) || !fs.statSync(cataloguePath).isFile()) {
            throw new Error('nodics.exp apps catalogue is unavailable: ' + cataloguePath);
        }
        const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
        if (catalogue.contractVersion !== 1 || catalogue.workspace !== 'nodics.exp' || !catalogue.apps) {
            throw new Error('Invalid nodics.exp apps catalogue: ' + cataloguePath);
        }
        return { root: resolved, catalogue: catalogue };
    },

    /**
     * Resolves one frontend app repository from nodics.exp, preferring nested apps and allowing transitional sibling fallback.
     * @param {Object} experienceInfo Loaded experience catalogue info.
     * @param {string} appCode Frontend app code.
     * @returns {Object} App root resolution.
     */
    resolveExperienceAppRoot: function (experienceInfo, appCode) {
        const app = experienceInfo?.catalogue?.apps?.[appCode];
        if (!app) {
            throw new Error('nodics.exp does not declare frontend app: ' + appCode);
        }
        if (app.packageName && app.packageName !== app.name) {
            throw new Error('nodics.exp app package identity mismatch: ' + appCode);
        }
        const candidates = [{
            location: 'nested',
            root: path.resolve(experienceInfo.root, app.folder || '')
        }];
        if (app.siblingFallback) {
            candidates.push({ location: 'sibling',
                root: path.resolve(experienceInfo.root, app.siblingFallback) });
        }
        const found = candidates.find(candidate => fs.existsSync(path.join(candidate.root, 'package.json')));
        if (!found) {
            throw new Error('Frontend app `' + appCode + '` is not available from nodics.exp. Run `npm run apps:fetch -- --app=' +
                appCode + '` in ' + experienceInfo.root + '.');
        }
        const packageJson = JSON.parse(fs.readFileSync(path.join(found.root, 'package.json'), 'utf8'));
        if (packageJson.name !== app.packageName) {
            throw new Error('Frontend app `' + appCode + '` package name mismatch: expected ' +
                app.packageName + ', received ' + packageJson.name);
        }
        return {
            code: appCode,
            name: app.name,
            type: app.type,
            root: found.root,
            location: found.location,
            packageName: packageJson.name,
            verifyScript: app.verifyScript
        };
    },

    /**
     * Resolves Builder repository roots from direct coordinates or nodics.exp.
     * @param {Object} input Discovery input.
     * @returns {Object} Resolved roots and optional experience app provenance.
     */
    resolveRepositoryCoordinates: function (input) {
        const experienceInfo = this.loadExperienceCatalogue(input.exp);
        const agoraApp = input.agora ? null : (experienceInfo ? this.resolveExperienceAppRoot(experienceInfo, 'agora') : null);
        return {
            roots: {
                framework: this.resolveRepositoryRoot(input.framework, 'framework'),
                agora: this.resolveRepositoryRoot(input.agora || agoraApp?.root, 'agora'),
                kickoff: this.resolveRepositoryRoot(input.kickoff, 'kickoff'),
                exp: experienceInfo ? experienceInfo.root : null
            },
            experienceApps: agoraApp ? [agoraApp] : []
        };
    },

    /**
     * Recursively discovers package metadata while excluding dependency, generated, VCS, and temporary directories.
     * @param {string} directory Directory to inspect.
     * @param {string} repositoryRoot Owning repository root.
     * @param {Object[]} packages Mutable package collection.
     * @returns {Object[]} Discovered packages.
     */
    collectPackages: function (directory, repositoryRoot, packages = []) {
        const ignored = new Set(['node_modules', '.git', 'generated', 'dist', 'coverage', 'temp', 'archive']);
        if (!fs.existsSync(directory)) {
            return packages;
        }
        const packagePath = path.join(directory, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            if (packageJson.nodics) {
                packages.push({
                    name: packageJson.name,
                    version: packageJson.version,
                    index: packageJson.index || '0',
                    moduleRoot: path.relative(repositoryRoot, directory).split(path.sep).join('/') || '.',
                    metadataDigest: this.digest(packageJson),
                    nodics: packageJson.nodics
                });
            }
        }
        fs.readdirSync(directory, { withFileTypes: true })
            .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !ignored.has(entry.name))
            .sort((left, right) => left.name.localeCompare(right.name))
            .forEach(entry => this.collectPackages(path.join(directory, entry.name), repositoryRoot, packages));
        return packages;
    },

    /**
     * Reads Agora build-time compositions and their renderer contribution keys.
     * @param {string} agoraRoot Explicit Agora repository root.
     * @returns {Object[]} Sorted composition descriptors.
     */
    discoverAgoraCompositions: function (agoraRoot) {
        const compositionRoot = path.join(agoraRoot, 'src', 'composition');
        if (!fs.existsSync(compositionRoot)) {
            throw new Error('Agora composition directory is unavailable: ' + compositionRoot);
        }
        const rendererRegistryPath = path.join(agoraRoot, 'src', 'rendering', 'storefrontRendererRegistry.ts');
        const rendererRegistrySource = fs.existsSync(rendererRegistryPath) ? fs.readFileSync(rendererRegistryPath, 'utf8') : '';
        const baseRendererKeys = Array.from(rendererRegistrySource.matchAll(/export\s+const\s+[A-Z0-9_]+\s*=\s*['"]([^'"]+)['"]/g))
            .map(match => match[1]);
        const descriptors = fs.readdirSync(compositionRoot)
            .filter(fileName => fileName.endsWith('.ts'))
            .sort()
            .map(fileName => {
                const source = fs.readFileSync(path.join(compositionRoot, fileName), 'utf8');
                const rendererKeys = Array.from(source.matchAll(/key:\s*['"]([^'"]+)['"]/g)).map(match => match[1]);
                const imports = Array.from(source.matchAll(/import\s+(?:[^'"]+from\s+)?['"]([^'"]+)['"]/g)).map(match => match[1]);
                const domainMatch = source.match(/activeDomains\s*=\s*\[([^\]]*)\]/);
                const domains = domainMatch ? Array.from(domainMatch[1].matchAll(/['"]([^'"]+)['"]/g)).map(match => match[1]) : [];
                return {
                    code: path.basename(fileName, '.ts'),
                    path: 'src/composition/' + fileName,
                    domains: domains,
                    imports: imports,
                    rendererKeys: rendererKeys,
                    sourceDigest: this.digest(source)
                };
            });
        const descriptorLookup = new Map(descriptors.map(descriptor => [descriptor.code, descriptor]));
        const effectiveKeys = (descriptor, visiting = new Set()) => {
            if (visiting.has(descriptor.code)) {
                throw new Error('Agora composition import cycle detected at: ' + descriptor.code);
            }
            const next = new Set(visiting);
            next.add(descriptor.code);
            const importedKeys = descriptor.imports.filter(importPath => importPath.startsWith('./'))
                .map(importPath => descriptorLookup.get(path.basename(importPath)))
                .filter(Boolean)
                .flatMap(imported => effectiveKeys(imported, next));
            return Array.from(new Set(baseRendererKeys.concat(descriptor.rendererKeys, importedKeys))).sort();
        };
        return descriptors.map(descriptor => Object.assign({}, descriptor, {
            rendererKeys: effectiveKeys(descriptor)
        }));
    },

    /**
     * Reads customer-owned Kickoff Agora and Nexus data-pack module boundaries.
     * @param {Object[]} kickoffPackages Discovered Kickoff packages.
     * @returns {Object[]} Customer data-pack descriptors.
     */
    discoverDataPacks: function (kickoffPackages) {
        return kickoffPackages
            .filter(packageObject => packageObject.name &&
                (packageObject.name.startsWith('agora.') || packageObject.name === 'nexus.web'))
            .map(packageObject => ({
                code: packageObject.name,
                moduleRoot: packageObject.moduleRoot,
                extends: [].concat(packageObject.nodics.extends || []),
                metadataDigest: packageObject.metadataDigest
            }))
            .sort((left, right) => left.code.localeCompare(right.code));
    },

    /**
     * Returns repository verification commands without executing package scripts.
     * @param {string} repositoryRoot Explicit repository root.
     * @returns {Object<string,string>} Verification-related scripts.
     */
    discoverQualificationCommands: function (repositoryRoot) {
        const packagePath = path.join(repositoryRoot, 'package.json');
        if (!fs.existsSync(packagePath)) {
            return {};
        }
        const scripts = JSON.parse(fs.readFileSync(packagePath, 'utf8')).scripts || {};
        return Object.keys(scripts).filter(name => /^(?:verify|test|acceptance:|qualification:)/.test(name))
            .sort().reduce((result, name) => {
                result[name] = scripts[name];
                return result;
            }, {});
    },

    /**
     * Creates a deterministic read-only capability catalogue from explicit repository coordinates.
     * @param {Object} input Discovery input.
     * @param {string} input.framework Framework repository root.
     * @param {string} input.agora Direct Agora repository root. Takes precedence over `input.exp`.
     * @param {string} input.kickoff Kickoff repository root.
     * @param {string} input.exp Optional nodics.exp repository root used to resolve Agora from `apps.json`.
     * @returns {Object} Capability catalogue with provenance and digest.
     */
    discover: function (input) {
        const coordinates = this.resolveRepositoryCoordinates(input);
        const roots = coordinates.roots;
        const frameworkPackages = this.collectPackages(roots.framework, roots.framework, [])
            .sort((left, right) => left.name.localeCompare(right.name));
        const kickoffPackages = this.collectPackages(path.join(roots.kickoff, 'modules'), roots.kickoff, [])
            .sort((left, right) => left.name.localeCompare(right.name));
        const capabilities = frameworkPackages.map(packageObject => ({
            code: packageObject.name,
            version: packageObject.version,
            kind: packageObject.nodics.kind || 'capability',
            displayName: packageObject.nodics.displayName || packageObject.name,
            moduleRoot: packageObject.moduleRoot,
            runtimeModule: packageObject.nodics.runtimeModule === true,
            extends: [].concat(packageObject.nodics.extends || []).sort(),
            owns: [].concat(packageObject.nodics.owns || []).sort(),
            metadataDigest: packageObject.metadataDigest
        }));
        const catalogue = {
            contractVersion: 1,
            readOnly: true,
            repositories: Object.keys(roots).filter(code => roots[code]).sort()
                .map(code => ({ code: code, root: roots[code] })),
            frontendApps: coordinates.experienceApps,
            capabilities: capabilities,
            frontendCompositions: this.discoverAgoraCompositions(roots.agora),
            customerDataPacks: this.discoverDataPacks(kickoffPackages),
            qualificationCommands: {
                framework: this.discoverQualificationCommands(roots.framework),
                agora: this.discoverQualificationCommands(roots.agora),
                kickoff: this.discoverQualificationCommands(roots.kickoff)
            }
        };
        const portableCatalogue = Object.assign({}, catalogue, {
            repositories: catalogue.repositories.map(repository => ({ code: repository.code }))
        });
        catalogue.catalogueDigest = this.digest(portableCatalogue);
        return catalogue;
    }
};
