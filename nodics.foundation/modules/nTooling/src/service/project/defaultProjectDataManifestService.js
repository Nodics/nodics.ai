/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/project/DefaultProjectDataManifestService
 * @description Validates project-owned release file checksums and refreshes declared development-baseline manifests without inventing application packs or release policy.
 * @layer tooling
 * @owner nTooling
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const catalogue = require('../applicationBuilder/defaultApplicationBuilderCatalogueService');
const releasePolicy = require('../../../../nData/nImport/import/src/service/release/defaultDataReleaseService');

module.exports = {
    /** Plans checksum changes using declared manifests and the existing package inventory. @param {Object} options Project/module coordinates. @returns {Object[]} Planned updates. */
    plan: function (options = {}) {
        const projectRoot = fs.realpathSync(path.resolve(options.projectRoot || process.cwd()));
        const project = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
        if (!project.nodics || project.nodics.kind !== 'application') throw new Error('Select a customer application project for manifest generation');
        const packages = catalogue.collectPackages(projectRoot, projectRoot, []).filter(item =>
            !options.module || item.name === options.module || item.moduleRoot === options.module);
        if (options.module && !packages.length) throw new Error('Selected project module is unavailable: ' + options.module);
        const updates = [];
        for (const owner of packages) {
            const moduleRoot = path.resolve(projectRoot, owner.moduleRoot);
            const dataRoot = path.join(moduleRoot, 'data');
            const manifestPath = path.join(dataRoot, 'manifest.json');
            if (!fs.existsSync(manifestPath)) continue;
            const canonicalModuleRoot = fs.realpathSync(moduleRoot);
            const canonicalDataRoot = fs.realpathSync(dataRoot);
            const canonicalManifestPath = fs.realpathSync(manifestPath);
            if (!(canonicalModuleRoot === projectRoot || canonicalModuleRoot.startsWith(projectRoot + path.sep)) ||
                !canonicalDataRoot.startsWith(canonicalModuleRoot + path.sep) ||
                canonicalManifestPath !== path.join(canonicalDataRoot, 'manifest.json') ||
                !fs.statSync(canonicalManifestPath).isFile()) {
                throw new Error('Project data manifest is outside its owning project module');
            }
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            if (manifest.contractVersion !== 2 || manifest.module !== owner.name || !manifest.sections ||
                typeof manifest.sections !== 'object' || Array.isArray(manifest.sections)) {
                throw new Error('Project data manifest must declare its module and contractVersion 2: ' + owner.name);
            }
            const changes = [];
            for (const [sectionCode, section] of Object.entries(manifest.sections)) {
                if (!section || typeof section !== 'object' || Array.isArray(section)) throw new Error('Manifest section must be an object: ' + sectionCode);
                if (section.kind !== 'DATA_RELEASE') continue;
                if (!section.files || typeof section.files !== 'object' || Array.isArray(section.files)) throw new Error('Release files must be a declared checksum map: ' + sectionCode);
                for (const [relative, expected] of Object.entries(section.files)) {
                    if (path.isAbsolute(relative) || relative.split(/[\\/]/).some(part => part === '..')) throw new Error('Release file path leaves the owning data module');
                    const file = fs.realpathSync(path.resolve(dataRoot, relative));
                    if (!file.startsWith(canonicalDataRoot + path.sep) || !fs.statSync(file).isFile()) throw new Error('Release file is outside its owning data module');
                    const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
                    if (actual === expected) continue;
                    if (!releasePolicy.isDevelopmentRelease(section.version)) throw new Error('Immutable release content changed: ' + owner.name + ':' + sectionCode + '. Create a new release instead of rewriting its checksum.');
                    section.files[relative] = actual;
                    changes.push({ section: sectionCode, file: relative });
                }
            }
            updates.push({ module: owner.name, manifestPath, manifest, changes });
        }
        if (!updates.length) throw new Error('No declared project data manifests found in the selected scope');
        return updates;
    },

    /** Validates the full plan before writing any draft checksum changes. @param {Object} options Project/module/check choices. @returns {Object[]} Safe summary. */
    run: function (options = {}) {
        const updates = this.plan(options);
        if (options.check && updates.some(update => update.changes.length)) throw new Error('Development manifest checksums require refresh');
        if (!options.check) for (const update of updates) {
            if (!update.changes.length) continue;
            fs.writeFileSync(update.manifestPath, JSON.stringify(update.manifest, null, 2) + '\n');
        }
        return updates.map(update => ({ module: update.module, changedFiles: update.changes.length }));
    },

    /** Runs the generic project manifest command. @param {string[]} args CLI arguments. @returns {Object[]} Summary. */
    runCli: function (args = process.argv.slice(2)) {
        const value = name => (args.find(argument => argument.startsWith('--' + name + '=')) || '').slice(name.length + 3);
        return this.run({ projectRoot: value('project') || process.env.NODICS_PROJECT_ROOT || process.cwd(), module: value('module'), check: args.includes('--check') });
    }
};

if (require.main === module) {
    try { console.log(JSON.stringify(module.exports.runCli(), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
}
