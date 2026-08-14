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
 * @module nTooling/service/quality/defaultCopyrightHeaderQualityService
 * @description Validates and normalizes the standard Nodics copyright header for JavaScript source and generated artifacts.
 * @layer tooling
 * @owner nTooling
 * @override Projects may replace this command only when their legal header contract is explicitly different.
 */

const requiredHeader = '/*\n' +
    '    Nodics - Enterprice Micro-Services Management Framework\n' +
    '\n' +
    '    Copyright (c) 2026 Nodics All rights reserved.\n' +
    '\n' +
    '    This software is governed by the Nodics Source-Available Commercial License.\n' +
    '    You may use, copy, modify, deploy, or distribute it only as permitted by the\n' +
    '    root LICENSE file or a separate written agreement with Nodics.\n' +
    '\n' +
    ' */\n';

const compatibleImmutableReleaseHeader = '/*\n' +
    ' *  Copyright (c) 2026 Nodics All rights reserved.\n' +
    ' *\n' +
    ' *  This source code is licensed under the license found in the\n' +
    ' *  LICENSE file in the root directory of this source tree.\n' +
    ' */\n';

const excludedDirectories = new Set([
    '.git',
    '.idea',
    '.vscode',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist'
]);

const excludedFiles = new Map([
    ['nodics.foundation/modules/nConfig/bin/enum.js', 'Bundled third-party enum compatibility implementation.']
]);




let exportedService;
module.exports = exportedService = {
    /** Implements readOption as an overrideable service operation. */
    readOption: function (args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
},

    /** Implements relative as an overrideable service operation. */
    relative: function (filePath, rootDir) {
    return path.relative(rootDir, filePath).split(path.sep).join('/');
},

    /** Implements isExcludedFile as an overrideable service operation. */
    isExcludedFile: function (filePath, rootDir) {
    const relativePath = (this.relative || exportedService.relative).call(this, filePath, rootDir);
    return excludedFiles.has(relativePath) || relativePath === 'docs' || relativePath.startsWith('docs/');
},

    /** Implements walk as an overrideable service operation. */
    walk: function (dir, files, rootDir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        if (entry.name.startsWith('.')) {
            return;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (excludedDirectories.has(entry.name)) {
                return;
            }
            (this.walk || exportedService.walk).call(this, fullPath, files, rootDir);
            return;
        }
        if (entry.isFile() && /\.(?:cjs|js|mjs)$/.test(entry.name) &&
            !(this.isExcludedFile || exportedService.isExcludedFile).call(this, fullPath, rootDir)) {
            files.push(fullPath);
        }
    });
},

    /** Implements splitShebang as an overrideable service operation. */
    splitShebang: function (content) {
    if (!content.startsWith('#!')) {
        return {
            shebang: '',
            body: content
        };
    }
    const newlineIndex = content.indexOf('\n');
    if (newlineIndex < 0) {
        return {
            shebang: content + '\n',
            body: ''
        };
    }
    return {
        shebang: content.slice(0, newlineIndex + 1),
        body: content.slice(newlineIndex + 1)
    };
},

    /** Implements stripExistingNodicsHeader as an overrideable service operation. */
    stripExistingNodicsHeader: function (body) {
    const trimmedStart = body.replace(/^\uFEFF/, '');
    const leadingWhitespaceLength = trimmedStart.length - trimmedStart.replace(/^\s*/, '').length;
    const leadingWhitespace = trimmedStart.slice(0, leadingWhitespaceLength);
    const content = trimmedStart.slice(leadingWhitespaceLength);
    if (!content.startsWith('/*')) {
        return body;
    }
    const endIndex = content.indexOf('*/');
    if (endIndex < 0) {
        return body;
    }
    const candidate = content.slice(0, endIndex + 2);
    if (!/Copyright \(c\) \d{4} Nodics All rights reserved\./.test(candidate)) {
        return body;
    }
    return leadingWhitespace + content.slice(endIndex + 2).replace(/^\s*\n?/, '');
},

    /** Implements normalizeContent as an overrideable service operation. */
    normalizeContent: function (content) {
    const shebangParts = (this.splitShebang || exportedService.splitShebang).call(this, content);
    const body = (this.stripExistingNodicsHeader || exportedService.stripExistingNodicsHeader).call(this, shebangParts.body);
    return shebangParts.shebang + requiredHeader + '\n' + body.replace(/^\s+/, '');
},

    /** Implements hasRequiredHeader as an overrideable service operation. */
    hasRequiredHeader: function (content) {
    const shebangParts = (this.splitShebang || exportedService.splitShebang).call(this, content);
    return shebangParts.body.startsWith(requiredHeader) ||
        shebangParts.body.startsWith(compatibleImmutableReleaseHeader);
},

    /** Implements collect as an overrideable service operation. */
    collect: function (rootDir) {
    const files = [];
    (this.walk || exportedService.walk).call(this, rootDir, files, rootDir);
    return files.sort();
},

    /** Implements inspectFiles as an overrideable service operation. */
    inspectFiles: function (options) {
    const files = (this.collect || exportedService.collect).call(this, options.rootDir);
    const missing = [];
    const fixed = [];
    files.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        if ((this.hasRequiredHeader || exportedService.hasRequiredHeader).call(this, content)) {
            return;
        }
        const normalized = (this.normalizeContent || exportedService.normalizeContent).call(this, content);
        if (options.fix && normalized !== content) {
            fs.writeFileSync(filePath, normalized, 'utf8');
            fixed.push((this.relative || exportedService.relative).call(this, filePath, options.rootDir));
            return;
        }
        missing.push((this.relative || exportedService.relative).call(this, filePath, options.rootDir));
    });
    return {
        filesChecked: files.length,
        filesMissingHeader: missing,
        filesFixed: fixed,
        excludedFiles: Array.from(excludedFiles.keys())
    };
},

    /** Implements createOptions as an overrideable service operation. */
    createOptions: function (args) {
    args = args || [];
    const configuredHome = (this.readOption || exportedService.readOption).call(this, args, '--home', process.env.NODICS_HOME || '');
    return {
        rootDir: configuredHome ? path.resolve(configuredHome) : process.cwd(),
        fix: args.includes('--fix'),
        failOnMissing: args.includes('--fail') || !args.includes('--fix'),
        reportLimit: Number((this.readOption || exportedService.readOption).call(this, args, '--limit', '80'))
    };
},

    /** Implements printReport as an overrideable service operation. */
    printReport: function (report, limit) {
    console.log('Nodics copyright header governance');
    console.log('Files checked              : ' + report.filesChecked);
    console.log('Files fixed                : ' + report.filesFixed.length);
    console.log('Files missing header       : ' + report.filesMissingHeader.length);
    console.log('Excluded files             : ' + report.excludedFiles.length);
    if (report.filesMissingHeader.length > 0) {
        console.log('\nFiles missing copyright header:');
        report.filesMissingHeader.slice(0, limit).forEach(file => console.log('  - ' + file));
        if (report.filesMissingHeader.length > limit) {
            console.log('  ... ' + (report.filesMissingHeader.length - limit) + ' more');
        }
    }
    if (report.filesFixed.length > 0) {
        console.log('\nFiles normalized:');
        report.filesFixed.slice(0, limit).forEach(file => console.log('  - ' + file));
        if (report.filesFixed.length > limit) {
            console.log('  ... ' + (report.filesFixed.length - limit) + ' more');
        }
    }
},

    /** Implements runCli as an overrideable service operation. */
    runCli: function (args) {
    const options = (this.createOptions || exportedService.createOptions).call(this, args);
    const report = (this.inspectFiles || exportedService.inspectFiles).call(this, options);
    (this.printReport || exportedService.printReport).call(this, report, options.reportLimit);
    if (options.failOnMissing && report.filesMissingHeader.length > 0) {
        process.exitCode = 1;
    }
},

    /** Implements requiredHeader as an overrideable service operation. */
requiredHeader,

    /** Implements compatibleImmutableReleaseHeader as a migration compatibility contract. */
compatibleImmutableReleaseHeader
};

if (require.main === module) {
    exportedService.runCli(process.argv.slice(2));
}
