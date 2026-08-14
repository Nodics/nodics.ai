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
 * @module nTooling/service/quality/defaultOwnershipLanguageQualityService
 * @description Finds documentation, test, and acceptance wording that assigns framework-owned contracts to consumer projects, frontend renderers, or runtime servers.
 * @layer tooling
 * @owner nTooling
 * @override Projects may add stricter wording rules, but the base Nodics ownership-language rules must stay active so acceptance checks do not become false ownership authorities.
 */

const ignoredDirectories = new Set([
    '.git',
    '.idea',
    '.nodics',
    '.vscode',
    'coverage',
    'dist',
    'logs',
    'node_modules',
    'temp',
    'tmp'
]);

const textExtensions = new Set([
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.ts',
    '.tsx',
    '.json',
    '.md',
    '.txt',
    '.yml',
    '.yaml'
]);

const negationPattern = /\b(must not|must never|does not|do not|do no|not own|not owned|cannot own|should not|never owns|without becoming|rather than owning|belong in|belongs in|belong to|belongs to)\b/i;

const scannerFixturePattern = /(ownershipRules|pattern:|const .*Pattern|BadOwnership|assert\(|finding\.code|code ===|description:)/;

const ownershipRules = [
    {
        code: 'consumer-project-framework-contract-owner',
        severity: 'error',
        description: 'Consumer/reference projects may verify framework-owned contracts but must not be described as owning them.',
        pattern: /\b(?:Kickoff|nodics\.kickoff|customer project|reference project)\b.{0,120}\b(?:owns?|owned|owning)\b.{0,120}\b(?:WCMS|CMS|Platform|Core|Cron|Process|Media|BackOffice|framework)[\w\s-]*\bcontract\b/i
    },
    {
        code: 'consumer-project-named-authoring-contract',
        severity: 'error',
        description: 'Designer authoring contracts are WCMS-owned; Kickoff may only observe or verify availability.',
        pattern: /\b(?:Kickoff|nodics\.kickoff)\b.{0,120}\b(?:CMS|WCMS)?\s*Designer\s+authoring\s+contract\b/i
    },
    {
        code: 'frontend-backend-data-owner',
        severity: 'error',
        description: 'Axis frontend renders backend-owned data and must not be described as owning CMS/import records.',
        pattern: /\b(?:Axis frontend|nodics\.axis|frontend renderer|browser renderer|renderer)\b.{0,120}\b(?:owns?|owned|packages|imports)\b.{0,120}\b(?:CMS records|backend-importable|catalog records|page records|component records|documentation data|content pack|importable CMS data)\b/i
    },
    {
        code: 'runtime-server-functional-module-owner',
        severity: 'error',
        description: 'Runtime servers compose or observe functional modules; functional module ownership stays with module groups.',
        pattern: /\b(?:server|runtime|environment|env)\b.{0,120}\b(?:owns?|owned|owning)\b.{0,120}\b(?:functional module|module registry|module lifecycle|module contract)\b/i
    }
];




let exportedService;
module.exports = exportedService = {
    /** Implements readOption as an overrideable service operation. */
    readOption: function (args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
},

    /** Implements toRelative as an overrideable service operation. */
    toRelative: function (filePath, rootDir) {
    return path.relative(rootDir, filePath).split(path.sep).join('/');
},

    /** Implements isTextFile as an overrideable service operation. */
    isTextFile: function (filePath) {
    return textExtensions.has(path.extname(filePath));
},

    /** Implements shouldSkipFile as an overrideable service operation. */
    shouldSkipFile: function (filePath, rootDir) {
    const relativePath = (this.toRelative || exportedService.toRelative).call(this, filePath, rootDir);
    if (relativePath === 'package-lock.json') {
        return true;
    }
    if (relativePath.endsWith('.min.js')) {
        return true;
    }
    return false;
},

    /** Implements walk as an overrideable service operation. */
    walk: function (directory, rootDir, files) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (ignoredDirectories.has(entry.name)) {
                return;
            }
            (this.walk || exportedService.walk).call(this, fullPath, rootDir, files);
            return;
        }
        if (entry.isFile() && (this.isTextFile || exportedService.isTextFile).call(this, fullPath) && !this.shouldSkipFile(fullPath, rootDir)) {
            files.push(fullPath);
        }
    });
},

    /** Implements collectFiles as an overrideable service operation. */
    collectFiles: function (rootDir) {
    const files = [];
    if (fs.existsSync(rootDir)) {
        (this.walk || exportedService.walk).call(this, rootDir, rootDir, files);
    }
    return files.sort();
},

    /** Implements inspectLine as an overrideable service operation. */
    inspectLine: function (filePath, rootDir, line, lineNumber) {
    if (negationPattern.test(line) || scannerFixturePattern.test(line)) {
        return [];
    }
    return ownershipRules
        .filter(rule => rule.pattern.test(line))
        .map(rule => ({
            file: (this.toRelative || exportedService.toRelative).call(this, filePath, rootDir),
            line: lineNumber,
            code: rule.code,
            severity: rule.severity,
            description: rule.description,
            text: line.trim()
        }));
},

    /** Implements inspectFiles as an overrideable service operation. */
    inspectFiles: function (options) {
    const files = (this.collectFiles || exportedService.collectFiles).call(this, options.rootDir);
    const findings = [];
    files.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split(/\r?\n/).forEach((line, index) => {
            findings.push.apply(findings, (this.inspectLine || exportedService.inspectLine).call(this, filePath, options.rootDir, line, index + 1));
        });
    });
    return {
        filesChecked: files.length,
        findings: findings
    };
},

    /** Implements createOptions as an overrideable service operation. */
    createOptions: function (args) {
    args = args || [];
    const configuredHome = (this.readOption || exportedService.readOption).call(this, args, '--home', process.env.NODICS_HOME || '');
    const configuredRoot = (this.readOption || exportedService.readOption).call(this, args, '--root', configuredHome || '');
    return {
        rootDir: configuredRoot ? path.resolve(configuredRoot) : process.cwd(),
        reportLimit: Number((this.readOption || exportedService.readOption).call(this, args, '--limit', '80'))
    };
},

    /** Implements printReport as an overrideable service operation. */
    printReport: function (report, limit) {
    console.log('Nodics ownership-language governance');
    console.log('Files checked              : ' + report.filesChecked);
    console.log('Findings                   : ' + report.findings.length);
    if (report.findings.length > 0) {
        console.log('\nOwnership-language findings:');
        report.findings.slice(0, limit).forEach(finding => {
            console.log('  - ' + finding.file + ':' + finding.line + ' [' + finding.code + '] ' + finding.text);
        });
        if (report.findings.length > limit) {
            console.log('  ... ' + (report.findings.length - limit) + ' more');
        }
    }
},

    /** Implements runCli as an overrideable service operation. */
    runCli: function (args) {
    const options = (this.createOptions || exportedService.createOptions).call(this, args);
    const report = (this.inspectFiles || exportedService.inspectFiles).call(this, options);
    (this.printReport || exportedService.printReport).call(this, report, options.reportLimit);
    if (report.findings.length > 0) {
        process.exitCode = 1;
    }
},

    /** Implements ownershipRules as an overrideable service operation. */
ownershipRules
};

if (require.main === module) {
    exportedService.runCli(process.argv.slice(2));
}
