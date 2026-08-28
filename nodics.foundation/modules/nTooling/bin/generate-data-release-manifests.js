/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * Generates one immutable aggregate manifest for module-owned init, core,
 * sample, source, and content-pack data sections. Existing sections are validated and are never silently
 * rewritten because changing checksums requires an intentional version bump.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../../..');
const dataTypes = new Set(['init', 'core', 'sample']);
const requestedReleases = new Map();
process.argv.forEach((argument, index) => {
    if (argument !== '--release') return;
    let requestedRelease = String(process.argv[index + 1] || '');
    let separator = requestedRelease.lastIndexOf('=');
    let requestedKey = requestedRelease.slice(0, separator);
    let requestedVersion = requestedRelease.slice(separator + 1);
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}:(init|core|sample)$/.test(requestedKey) ||
        !/^\d+\.\d+\.\d+$/.test(requestedVersion)) {
        throw new Error('Use one or more --release <module>:<init|core|sample>=<major.minor.patch> arguments');
    }
    requestedReleases.set(requestedKey, requestedVersion);
});

function hash(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * Compares manifest file maps by path and checksum without treating JSON key
 * insertion order as release content. Aggregate manifests remain readable in
 * an owner-chosen order while immutable file membership still fails closed.
 */
function sameFileMap(left, right) {
    let leftEntries = Object.entries(left || {}).sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath));
    let rightEntries = Object.entries(right || {}).sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath));
    return JSON.stringify(leftEntries) === JSON.stringify(rightEntries);
}

function filesBelow(folder, prefix = '') {
    if (!fs.existsSync(folder)) return [];
    return fs.readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
        let relative = prefix ? prefix + '/' + entry.name : entry.name;
        let absolute = path.join(folder, entry.name);
        return entry.isDirectory() ? filesBelow(absolute, relative) : [relative];
    });
}

function releaseRootsFor(dataRoot, dataType) {
    if (!fs.existsSync(dataRoot)) return [];
    let releasePattern = new RegExp('^' + dataType + '-v\\d{3}$');
    let roots = fs.readdirSync(dataRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && releasePattern.test(entry.name))
        .map(entry => ({ sectionCode: entry.name, sourceRoot: entry.name, root: path.join(dataRoot, entry.name) }))
        .sort((left, right) => left.sectionCode.localeCompare(right.sectionCode));
    let legacyRoot = path.join(dataRoot, dataType);
    if (fs.existsSync(legacyRoot)) roots.unshift({ sectionCode: dataType, sourceRoot: dataType, root: legacyRoot });
    return roots;
}

function visit(folder) {
    if (['.git', 'node_modules', 'docs'].includes(path.basename(folder))) return [];
    let packagePath = path.join(folder, 'package.json');
    let generated = [];
    if (fs.existsSync(packagePath)) {
        let packageMetadata = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (packageMetadata.nodics && packageMetadata.name) {
            let dataRoot = path.join(folder, 'data');
            let manifestPath = path.join(dataRoot, 'manifest.json');
            let aggregate = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {
                contractVersion: 0,
                module: packageMetadata.name,
                sections: {}
            };
            if (![0, 2].includes(aggregate.contractVersion) || aggregate.module !== packageMetadata.name ||
                !aggregate.sections || typeof aggregate.sections !== 'object') {
                throw new Error('Aggregate data manifest is incompatible: ' + manifestPath);
            }
            let contentOwnedRoots = new Set(Object.values(aggregate.sections)
                .filter(section => section && section.kind === 'CONTENT_PACK' && section.contentPath)
                .map(section => String(section.contentPath).split('/')[0]));
            let changed = false;
            for (let dataType of dataTypes) {
                for (let releaseRoot of releaseRootsFor(dataRoot, dataType)) {
                    if (contentOwnedRoots.has(releaseRoot.sourceRoot) && !aggregate.sections[releaseRoot.sectionCode]) continue;
                    let contributionFiles = new Set(Object.entries(aggregate.sections)
                        .filter(([sectionCode, contribution]) => sectionCode !== releaseRoot.sectionCode && contribution &&
                            contribution.kind === 'DATA_RELEASE' && contribution.dataType === dataType)
                        .flatMap(([, contribution]) => Object.keys(contribution.files || {}))
                        .map(file => file.startsWith(releaseRoot.sourceRoot + '/') ? file.slice(releaseRoot.sourceRoot.length + 1) : file));
                    let releaseFiles = filesBelow(releaseRoot.root).filter(file => !contributionFiles.has(file));
                    if (releaseFiles.length === 0) continue;
                    let files = Object.fromEntries(releaseFiles.map(file => [
                        releaseRoot.sourceRoot + '/' + file,
                        hash(path.join(releaseRoot.root, file))
                    ]));
                    let section = {
                        kind: 'DATA_RELEASE',
                        dataType: dataType,
                        sourceRoot: releaseRoot.sourceRoot,
                        version: '0.0.0',
                        description: (packageMetadata.nodics.displayName || packageMetadata.name) + ' ' + dataType + ' data',
                        files: files
                    };
                    let existing = aggregate.sections[releaseRoot.sectionCode];
                    if (existing) {
                        if (!sameFileMap(existing.files, files)) {
                            let requestedVersion = requestedReleases.get(packageMetadata.name + ':' + dataType);
                            if (requestedVersion && requestedVersion !== existing.version) {
                                section.version = requestedVersion;
                                aggregate.sections[releaseRoot.sectionCode] = Object.assign({}, existing, section);
                                changed = true;
                                continue;
                            }
                            if (existing.version === '0.0.0') {
                                aggregate.sections[releaseRoot.sectionCode] = Object.assign({}, existing, section, { version: '0.0.0' });
                                changed = true;
                                continue;
                            }
                            throw new Error('Data release changed without an intentional manifest section version update: ' + manifestPath + '#' + releaseRoot.sectionCode);
                        }
                        continue;
                    }
                    aggregate.sections[releaseRoot.sectionCode] = section;
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFileSync(manifestPath, JSON.stringify(aggregate, null, 4) + '\n');
                generated.push(path.relative(root, manifestPath));
            }
        }
    }
    for (let entry of fs.readdirSync(folder, { withFileTypes: true })) {
        if (entry.isDirectory()) generated.push(...visit(path.join(folder, entry.name)));
    }
    return generated;
}

let generated = visit(root);
console.log('Generated data release manifests: ' + generated.length);
