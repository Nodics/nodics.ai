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
    /** Checks an explicitly selected unreleased source tree without changing manifests or runtime authority.
     * @param {Object} options projectRoot selects the baseline; dependencyRoots resolve exact external prerequisites.
     * @returns {Object} Checked owner/section inventory. Throws on stale pins, hashes, non-v001 paths or retained roots.
     * @override Preserve canonical validation, test isolation and read-only execution; generic release versions are unaffected.
     */
    validateUnreleasedBaseline: function ({ projectRoot, dependencyRoots = [] }) {
        if (typeof projectRoot !== 'string' || !Array.isArray(dependencyRoots))
            throw new Error('Explicit baseline projectRoot and dependencyRoots required');
        const selectedRoot = fs.realpathSync(projectRoot);
        const roots = [...new Set([selectedRoot, ...dependencyRoots.map(root => fs.realpathSync(root))])];
        const defaults = require('../../../../nData/nImport/import/config/properties').data.dataReleases;
        const releases = Object.assign(Object.create(releasePolicy), { configuration: () => defaults });
        const documentation = require('../defaultApplicationDocumentationContractService');
        const owners = new Map(), checked = [], descriptors = new Map(), candidates = new Map();
        const inspect = ({ owner, manifestPath, section, code }) => {
            return releases.inspectSourceManifest(owner, manifestPath, section, code);
        };
        for (const root of roots) {
            for (const item of catalogue.collectPackages(root, root, [])) {
                if (item.moduleRoot.split(/[\\/]/).some(part => ['test', 'tests', 'fixtures', '__fixtures__'].includes(part))) continue;
                const owner = { name: item.name, index: item.index, path: path.resolve(root, item.moduleRoot) };
                const manifestPath = path.join(owner.path, 'data/manifest.json');
                if (!fs.existsSync(manifestPath)) continue;
                if (owners.has(owner.name) && owners.get(owner.name).path !== owner.path)
                    throw new Error('Ambiguous baseline owner: ' + owner.name);
                owners.set(owner.name, owner);
                const manifest = releases.readAggregateManifest(owner, manifestPath);
                const selected = root === selectedRoot;
                if (selected && Object.hasOwn(manifest, 'retainedRoots'))
                    throw new Error('Unreleased baseline must not retain superseded roots: ' + owner.name);
                if (selected) {
                    const declared = new Set(Object.values(manifest.sections).flatMap(section =>
                        [...Object.keys(section.files || {}), ...Object.keys(section.generatedHashes || {})]));
                    for (const entry of fs.readdirSync(path.dirname(manifestPath), { withFileTypes: true })) {
                        if (entry.isDirectory() && /-v\d+$/.test(entry.name) && !/-v001$/.test(entry.name))
                            throw new Error('Unreleased baseline requires owner-specific v001: ' + owner.name + '/' + entry.name);
                        if (entry.isDirectory() && /-v001$/.test(entry.name)) {
                            for (const file of releases.collectReleaseFiles(path.join(path.dirname(manifestPath), entry.name))) {
                                if (file !== 'release.descriptor.json' && !declared.has(entry.name + '/' + file))
                                    throw new Error('Unselected baseline payload: ' + owner.name + '/' + entry.name + '/' + file);
                            }
                        }
                    }
                }
                for (const [code, section] of Object.entries(manifest.sections)) {
                    if (selected && ['DATA_RELEASE', 'CONTENT_PACK'].includes(section.kind)) {
                        const paths = [section.sourceRoot, section.contentPath, ...Object.keys(section.files || {}), ...Object.keys(section.generatedHashes || {})].filter(Boolean);
                        if (paths.some(value => !/^[A-Za-z][A-Za-z0-9_-]*-v001(?:\/|$)/.test(value)))
                            throw new Error('Unreleased baseline section selects non-v001 source: ' + owner.name + ':' + code);
                    }
                    if (section.kind === 'DATA_RELEASE') {
                        const candidate = { owner, manifestPath, section, code };
                        candidates.set(owner.name + ':' + code, candidate);
                        if (selected) {
                            const descriptor = inspect(candidate);
                            descriptors.set(descriptor.releaseCode, descriptor);
                        }
                    } else if (selected && section.kind === 'CONTENT_PACK') {
                        documentation.validateDataRelease(owner.path, code);
                    }
                    if (selected) checked.push({ module: owner.name, section: code, kind: section.kind, version: section.version });
                }
            }
        }
        if (!checked.length) throw new Error('No shipping baseline manifests found');
        for (const descriptor of descriptors.values()) {
            for (const reference of descriptor.prerequisites) {
                const key = reference.moduleName + ':' + reference.sectionCode;
                if (!descriptors.has(key) && candidates.has(key)) descriptors.set(key, inspect(candidates.get(key)));
                const target = descriptors.get(key);
                if (!target || target.version !== reference.version || target.checksum !== reference.checksum)
                    throw new Error('Baseline prerequisite drift: ' + descriptor.releaseCode + ' -> ' + reference.moduleName + ':' + reference.sectionCode);
            }
        }
        return { projectRoot: selectedRoot, effects: false, sections: checked };
    },
    /** Checks a supplied counted owner snapshot and reviewed reference-only changes without writes or invented allocations. This is not runtime authority or import qualification. @param {Object} options Inert inventory and changes. @returns {Object} Redacted preflight with mandatory live-revalidation gate. */
    preflightReferenceChanges: function ({ inventory, changes }) {
        const fail = () => {
            throw new Error(
                'Reference changes require a complete consistent owner snapshot and reviewed revisions',
            );
        };
        const code = (value) =>
            typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,192}$/.test(value);
        if (
            !inventory ||
            !code(inventory.moduleName) ||
            !code(inventory.schemaName) ||
            !code(inventory.tenantCode) ||
            !Array.isArray(inventory.items) ||
            inventory.items.length > 10000 ||
            !Number.isSafeInteger(inventory.count) ||
            inventory.count !== inventory.items.length ||
            !Array.isArray(changes) ||
            changes.length > 10000
        )
            fail();
        const seen = new Map();
        for (const item of inventory.items) {
            if (
                !item ||
                !code(item.code) ||
                seen.has(item.code) ||
                !Number.isSafeInteger(item.revision) ||
                item.revision < 0
            )
                fail();
            seen.set(item.code, item);
        }
        const selected = new Set();
        const plan = changes.map((change) => {
            if (
                !change ||
                Object.keys(change).sort().join(',') !==
                    'code,enterpriseRef,revision' ||
                selected.has(change.code)
            )
                fail();
            const item = seen.get(change.code),
                ref = change.enterpriseRef;
            if (
                !item ||
                change.revision !== item.revision ||
                !ref ||
                Object.keys(ref).sort().join(',') !==
                    'code,moduleName,schemaName' ||
                ref.moduleName !== 'profile' ||
                ref.schemaName !== 'enterprise' ||
                !code(ref.code)
            )
                fail();
            selected.add(change.code);
            return {
                sourceRef: {
                    moduleName: inventory.moduleName,
                    schemaName: inventory.schemaName,
                    code: item.code,
                },
                revision: item.revision,
                enterpriseRef: {
                    moduleName: 'profile',
                    schemaName: 'enterprise',
                    code: ref.code,
                },
            };
        });
        return {
            effects: false,
            requiresLiveRevalidation: true,
            requiresBusinessApproval: true,
            inventoryCount: seen.size,
            changes: plan,
        };
    },
    /** Plans a successor from an authored new root while preserving the old tree and exact section identity. Does not write files. */
    planForwardRelease: function ({
        dataRoot,
        manifest,
        sectionCode,
        sourceRoot,
        version,
        retentionScope,
    }) {
        const proposed = JSON.parse(JSON.stringify(manifest));
        if (retentionScope !== undefined && retentionScope !== 'SECTIONS')
            throw new Error('Unsupported forward release retention scope');
        if (
            proposed.contractVersion !== 2 ||
            !proposed.module ||
            !proposed.sections
        )
            throw new Error(
                'Forward release requires a contractVersion 2 manifest',
            );
        releasePolicy.validateRetainedRoots(dataRoot, proposed);
        const previous = proposed.sections[sectionCode];
        if (
            !previous ||
            previous.kind !== 'DATA_RELEASE' ||
            !previous.sourceRoot ||
            !previous.files ||
            !/^\d+\.\d+\.\d+$/.test(previous.version || '') ||
            !/^\d+\.\d+\.\d+$/.test(version || '') ||
            releasePolicy.compareVersions(version, previous.version) <= 0 ||
            sourceRoot === previous.sourceRoot ||
            !new RegExp('^' + previous.dataType + '-v\\d{3}$').test(
                sourceRoot,
            ) ||
            releasePolicy.releaseSequence({ sourceRoot }) <=
                releasePolicy.releaseSequence(previous)
        ) {
            throw new Error(
                'Forward release requires a newer version and source sequence for an existing DATA_RELEASE',
            );
        }
        if (
            Object.entries(proposed.sections).some(
                ([code, section]) =>
                    code !== sectionCode &&
                    section &&
                    section.sourceRoot === sourceRoot,
            )
        ) {
            throw new Error(
                'Forward release source conflicts with another active section',
            );
        }
        const retainedFiles = releasePolicy.sourceRootFiles(
            dataRoot,
            previous.sourceRoot,
        );
        if (
            !Object.keys(previous.files).length ||
            Object.entries(previous.files).some(
                ([file, hash]) => retainedFiles[file] !== hash,
            )
        ) {
            throw new Error(
                'Immutable release content changed; restore original bytes before a forward release',
            );
        }
        if (proposed.retainedRoots && proposed.retainedRoots[sourceRoot])
            throw new Error('Forward release source is already retained');
        const files = Object.fromEntries(
            Object.entries(
                releasePolicy.sourceRootFiles(dataRoot, sourceRoot),
            ).filter(
                ([file]) => file !== sourceRoot + '/release.descriptor.json',
            ),
        );
        if (!Object.keys(files).length)
            throw new Error('Forward release payload is empty');
        const retained =
            proposed.retainedRoots &&
            proposed.retainedRoots[previous.sourceRoot];
        if (retained && retained.scope !== retentionScope)
            throw new Error(
                'Forward release cannot change an existing retention scope',
            );
        proposed.retainedRoots = {
            ...proposed.retainedRoots,
            [previous.sourceRoot]: {
                ...(retentionScope ? { scope: retentionScope } : {}),
                files:
                    retentionScope === 'SECTIONS'
                        ? { ...(retained && retained.files), ...previous.files }
                        : retainedFiles,
                sections: {
                    ...(retained && retained.sections),
                    [sectionCode]: previous,
                },
            },
        };
        proposed.sections[sectionCode] = {
            ...previous,
            sourceRoot,
            version,
            files,
        };
        releasePolicy.validateRetainedRoots(dataRoot, proposed);
        return proposed;
    },

    /** Plans checksum changes using declared manifests and the existing package inventory. @param {Object} options Project/module coordinates. @returns {Object[]} Planned updates. */
    plan: function (options = {}) {
        const projectRoot = fs.realpathSync(
            path.resolve(options.projectRoot || process.cwd()),
        );
        const project = JSON.parse(
            fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
        );
        if (!project.nodics || project.nodics.kind !== 'application')
            throw new Error(
                'Select a customer application project for manifest generation',
            );
        const packages = catalogue
            .collectPackages(projectRoot, projectRoot, [])
            .filter(
                (item) =>
                    !options.module ||
                    item.name === options.module ||
                    item.moduleRoot === options.module,
            );
        if (options.module && !packages.length)
            throw new Error(
                'Selected project module is unavailable: ' + options.module,
            );
        const updates = [];
        for (const owner of packages) {
            const moduleRoot = path.resolve(projectRoot, owner.moduleRoot);
            const dataRoot = path.join(moduleRoot, 'data');
            const manifestPath = path.join(dataRoot, 'manifest.json');
            if (!fs.existsSync(manifestPath)) continue;
            const canonicalModuleRoot = fs.realpathSync(moduleRoot);
            const canonicalDataRoot = fs.realpathSync(dataRoot);
            const canonicalManifestPath = fs.realpathSync(manifestPath);
            if (
                !(
                    canonicalModuleRoot === projectRoot ||
                    canonicalModuleRoot.startsWith(projectRoot + path.sep)
                ) ||
                !canonicalDataRoot.startsWith(canonicalModuleRoot + path.sep) ||
                canonicalManifestPath !==
                    path.join(canonicalDataRoot, 'manifest.json') ||
                !fs.statSync(canonicalManifestPath).isFile()
            ) {
                throw new Error(
                    'Project data manifest is outside its owning project module',
                );
            }
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            if (
                manifest.contractVersion !== 2 ||
                manifest.module !== owner.name ||
                !manifest.sections ||
                typeof manifest.sections !== 'object' ||
                Array.isArray(manifest.sections)
            ) {
                throw new Error(
                    'Project data manifest must declare its module and contractVersion 2: ' +
                        owner.name,
                );
            }
            const changes = [];
            releasePolicy.validateRetainedRoots(dataRoot, manifest);
            for (const [sectionCode, section] of Object.entries(
                manifest.sections,
            )) {
                if (
                    !section ||
                    typeof section !== 'object' ||
                    Array.isArray(section)
                )
                    throw new Error(
                        'Manifest section must be an object: ' + sectionCode,
                    );
                if (section.kind !== 'DATA_RELEASE') continue;
                if (
                    !section.files ||
                    typeof section.files !== 'object' ||
                    Array.isArray(section.files)
                )
                    throw new Error(
                        'Release files must be a declared checksum map: ' +
                            sectionCode,
                    );
                for (const [relative, expected] of Object.entries(
                    section.files,
                )) {
                    if (
                        path.isAbsolute(relative) ||
                        relative.split(/[\\/]/).some((part) => part === '..')
                    )
                        throw new Error(
                            'Release file path leaves the owning data module',
                        );
                    const file = fs.realpathSync(
                        path.resolve(dataRoot, relative),
                    );
                    if (
                        !file.startsWith(canonicalDataRoot + path.sep) ||
                        !fs.statSync(file).isFile()
                    )
                        throw new Error(
                            'Release file is outside its owning data module',
                        );
                    const actual = crypto
                        .createHash('sha256')
                        .update(fs.readFileSync(file))
                        .digest('hex');
                    if (actual === expected) continue;
                    if (!releasePolicy.isDevelopmentRelease(section.version))
                        throw new Error(
                            'Immutable release content changed: ' +
                                owner.name +
                                ':' +
                                sectionCode +
                                '. Create a new release instead of rewriting its checksum.',
                        );
                    section.files[relative] = actual;
                    changes.push({ section: sectionCode, file: relative });
                }
            }
            updates.push({
                module: owner.name,
                manifestPath,
                manifest,
                changes,
            });
        }
        if (!updates.length)
            throw new Error(
                'No declared project data manifests found in the selected scope',
            );
        return updates;
    },

    /** Validates the full plan before writing any draft checksum changes. @param {Object} options Project/module/check choices. @returns {Object[]} Safe summary. */
    run: function (options = {}) {
        const updates = this.plan(options);
        if (options.check && updates.some((update) => update.changes.length))
            throw new Error('Development manifest checksums require refresh');
        if (!options.check)
            for (const update of updates) {
                if (!update.changes.length) continue;
                fs.writeFileSync(
                    update.manifestPath,
                    JSON.stringify(update.manifest, null, 2) + '\n',
                );
            }
        return updates.map((update) => ({
            module: update.module,
            changedFiles: update.changes.length,
        }));
    },

    /** Runs the generic project manifest command. @param {string[]} args CLI arguments. @returns {Object[]} Summary. */
    runCli: function (args = process.argv.slice(2)) {
        const value = (name) =>
            (
                args.find((argument) =>
                    argument.startsWith('--' + name + '='),
                ) || ''
            ).slice(name.length + 3);
        return this.run({
            projectRoot:
                value('project') ||
                process.env.NODICS_PROJECT_ROOT ||
                process.cwd(),
            module: value('module'),
            check: args.includes('--check'),
        });
    },
};

if (require.main === module) {
    try {
        console.log(JSON.stringify(module.exports.runCli(), null, 2));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
