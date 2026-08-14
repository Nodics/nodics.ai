/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/quality/defaultDocumentationNavigationQualityService
 * @description Validates public documentation links, path case, entry-point reachability, page continuation, and exhaustive module README navigation.
 * @layer tooling
 * @owner nTooling
 * @override Projects may change navigation roots and required entry points through `tooling.documentationGovernance.navigation`.
 */

const ignoredDirectories = new Set(['.git', 'node_modules', 'docs', 'gen', 'generated']);


let exportedService;
module.exports = exportedService = {
    /** Implements toPosix as an overrideable service operation. */
    toPosix: function (filePath) {
    return filePath.split(path.sep).join('/');
},

    /** Implements walkFiles as an overrideable service operation. */
    walkFiles: function (rootDir, currentDir, predicate, files) {
    files = files || [];
    fs.readdirSync(currentDir, { withFileTypes: true }).forEach(entry => {
        if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
            return;
        }
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
            (this.walkFiles || exportedService.walkFiles).call(this, rootDir, fullPath, predicate, files);
        } else if (predicate(fullPath)) {
            files.push((this.toPosix || exportedService.toPosix).call(this, path.relative(rootDir, fullPath)));
        }
    });
    return files;
},

    /** Implements extractLocalMarkdownLinks as an overrideable service operation. */
    extractLocalMarkdownLinks: function (content) {
    const links = [];
    const pattern = /(?<!!)\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
        const target = match[1].trim().replace(/^<|>$/g, '').split('#')[0];
        if (target && !/^[a-z]+:/i.test(target)) {
            links.push(decodeURIComponent(target));
        }
    }
    return links;
},

    /** Implements hasExactPathCase as an overrideable service operation. */
    hasExactPathCase: function (rootDir, relativePath) {
    const parts = (this.toPosix || exportedService.toPosix).call(this, relativePath).split('/').filter(Boolean);
    let current = rootDir;
    for (const part of parts) {
        if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
            return false;
        }
        if (!fs.readdirSync(current).includes(part)) {
            return false;
        }
        current = path.join(current, part);
    }
    return true;
},

    /** Implements resolveTarget as an overrideable service operation. */
    resolveTarget: function (source, link) {
    return (this.toPosix || exportedService.toPosix).call(this, path.normalize(path.join(path.dirname(source), link)));
},

    /** Implements collectPackageReadmes as an overrideable service operation. */
    collectPackageReadmes: function (rootDir) {
    return (this.walkFiles || exportedService.walkFiles).call(this, rootDir, rootDir, filePath => path.basename(filePath) === 'package.json')
        .filter(packagePath => packagePath !== 'package.json')
        .map(packagePath => (this.toPosix || exportedService.toPosix).call(this, path.join(path.dirname(packagePath), 'README.md')))
        .filter(readmePath => fs.existsSync(path.join(rootDir, readmePath)))
        .sort();
},

    /** Implements collectNavigationReport as an overrideable service operation. */
    collectNavigationReport: function (rootDir, policy) {
    if (policy && policy.enabled === false) {
        return {
            disabled: true,
            markdownFiles: 0,
            publicPages: 0,
            packageReadmes: (this.collectPackageReadmes || exportedService.collectPackageReadmes).call(this, rootDir).length,
            brokenLinks: [],
            caseMismatches: [],
            unreachablePages: [],
            deadEndPages: [],
            missingRequiredEntryPoints: [],
            missingModuleReadmes: []
        };
    }
    const entryPoint = policy.entryPoint || 'README.md';
    const publicRoot = policy.publicRoot || 'publicDocs';
    const publicIndex = policy.publicIndex || 'publicDocs/README.md';
    const moduleCatalog = policy.moduleCatalog || 'publicDocs/reference/standards/module-catalog.md';
    const excluded = new Set(policy.excludedPublicPages || []);
    const markdownFiles = [entryPoint].concat((this.walkFiles || exportedService.walkFiles).call(this,
        rootDir,
        path.join(rootDir, publicRoot),
        filePath => filePath.endsWith('.md')
    ));
    const graph = new Map();
    const brokenLinks = [];
    const caseMismatches = [];

    markdownFiles.forEach(source => {
        const content = fs.readFileSync(path.join(rootDir, source), 'utf8');
        const targets = (this.extractLocalMarkdownLinks || exportedService.extractLocalMarkdownLinks).call(this, content).map(link => ({
            link,
            target: (this.resolveTarget || exportedService.resolveTarget).call(this, source, link)
        }));
        graph.set(source, targets.map(item => item.target));
        targets.forEach(item => {
            const fullTarget = path.join(rootDir, item.target);
            if (!fs.existsSync(fullTarget)) {
                brokenLinks.push({ source, target: item.link });
            } else if (!(this.hasExactPathCase || exportedService.hasExactPathCase).call(this, rootDir, item.target)) {
                caseMismatches.push({ source, target: item.link });
            }
        });
    });

    const reachable = new Set([entryPoint]);
    const queue = [entryPoint];
    while (queue.length > 0) {
        const source = queue.shift();
        (graph.get(source) || []).forEach(target => {
            if (graph.has(target) && !reachable.has(target)) {
                reachable.add(target);
                queue.push(target);
            }
        });
    }

    const publicPages = markdownFiles.filter(filePath => filePath.startsWith(publicRoot + '/') && !excluded.has(filePath));
    const unreachablePages = publicPages.filter(filePath => !reachable.has(filePath));
    const deadEndPages = publicPages.filter(filePath => filePath !== publicIndex &&
        !fs.readFileSync(path.join(rootDir, filePath), 'utf8').includes('\n## Continue\n'));
    const missingRequiredEntryPoints = (policy.requiredEntryPoints || []).filter(filePath =>
        !fs.existsSync(path.join(rootDir, filePath)) || !reachable.has(filePath));

    const catalogContent = fs.existsSync(path.join(rootDir, moduleCatalog)) ?
        fs.readFileSync(path.join(rootDir, moduleCatalog), 'utf8') : '';
    const catalogTargets = new Set((this.extractLocalMarkdownLinks || exportedService.extractLocalMarkdownLinks).call(this, catalogContent).map(link => this.resolveTarget(moduleCatalog, link)));
    const missingModuleReadmes = (this.collectPackageReadmes || exportedService.collectPackageReadmes).call(this, rootDir).filter(readmePath => !catalogTargets.has(readmePath));

    return {
        markdownFiles: markdownFiles.length,
        publicPages: publicPages.length,
        packageReadmes: (this.collectPackageReadmes || exportedService.collectPackageReadmes).call(this, rootDir).length,
        brokenLinks,
        caseMismatches,
        unreachablePages,
        deadEndPages,
        missingRequiredEntryPoints,
        missingModuleReadmes
    };
},

    /** Implements hasFailures as an overrideable service operation. */
    hasFailures: function (report) {
    return ['brokenLinks', 'caseMismatches', 'unreachablePages', 'deadEndPages',
        'missingRequiredEntryPoints', 'missingModuleReadmes'].some(key => report[key].length > 0);
},

    /** Implements printItems as an overrideable service operation. */
    printItems: function (label, items) {
    if (items.length === 0) {
        return;
    }
    console.error(label + ':');
    items.forEach(item => console.error('  - ' + (typeof item === 'string' ? item : item.source + ' -> ' + item.target)));
},

    /** Implements printReport as an overrideable service operation. */
    printReport: function (report) {
    if (report.disabled === true) {
        console.log('\nSKIPPED: public documentation navigation');
        console.log('Reason: canonical public content is governed outside this repository.');
        return;
    }
    console.log('\nENFORCED: public documentation navigation');
    console.log('Markdown entry/public files : ' + report.markdownFiles);
    console.log('Governed public pages       : ' + report.publicPages);
    console.log('Cataloged module READMEs    : ' + (report.packageReadmes - report.missingModuleReadmes.length) + '/' + report.packageReadmes);
    (this.printItems || exportedService.printItems).call(this, 'Broken local links', report.brokenLinks);
    (this.printItems || exportedService.printItems).call(this, 'Path-case mismatches', report.caseMismatches);
    (this.printItems || exportedService.printItems).call(this, 'Unreachable public pages', report.unreachablePages);
    (this.printItems || exportedService.printItems).call(this, 'Pages without Continue navigation', report.deadEndPages);
    (this.printItems || exportedService.printItems).call(this, 'Missing required entry points', report.missingRequiredEntryPoints);
    (this.printItems || exportedService.printItems).call(this, 'Module READMEs missing from catalog', report.missingModuleReadmes);
}
};
