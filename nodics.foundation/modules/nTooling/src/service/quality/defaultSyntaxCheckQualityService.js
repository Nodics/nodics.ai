/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * @module nTooling/service/quality/defaultSyntaxCheckQualityService
 * @description Provides the framework-root syntax gate used by the basic Nodics test suite without loading runtime modules or executing application code.
 * @layer tooling-quality
 * @owner nTooling
 * @override Later tooling modules may replace individual exported methods to alter file discovery, exclusions, or syntax command behavior while preserving the `check:syntax` command contract.
 */
module.exports = {
    ignoredDirectories: Object.freeze([
        '.git',
        '.idea',
        '.vscode',
        'node_modules',
        'dist',
        'coverage',
        'logs',
        'temp',
        'tmp',
        'local-archive'
    ]),

    checkedExtensions: Object.freeze(['.js', '.mjs', '.cjs']),

    /**
     * Resolves the target home from CLI arguments without assuming the framework checkout is the project root.
     * @param {string[]} args Command-line arguments.
     * @returns {string} Absolute project home.
     */
    resolveHome: function (args) {
        const homeOption = (args || []).find(arg => arg.indexOf('--home=') === 0);
        return path.resolve(homeOption ? homeOption.slice('--home='.length) : process.cwd());
    },

    /**
     * Decides whether a directory should be traversed by the syntax gate.
     * @param {fs.Dirent} entry Directory entry.
     * @returns {boolean} True when the directory should be visited.
     */
    shouldVisitDirectory: function (entry) {
        return entry.isDirectory() && !this.ignoredDirectories.includes(entry.name);
    },

    /**
     * Decides whether a file should be checked with Node syntax validation.
     * @param {string} filePath Absolute file path.
     * @returns {boolean} True when the file extension is a JavaScript source extension.
     */
    shouldCheckFile: function (filePath) {
        return this.checkedExtensions.includes(path.extname(filePath));
    },

    /**
     * Recursively collects JavaScript-family source files for syntax validation.
     * @param {string} directory Directory to scan.
     * @param {string[]} files Mutable result list.
     * @returns {string[]} Files to check.
     */
    collectFiles: function (directory, files = []) {
        if (!fs.existsSync(directory)) {
            return files;
        }
        fs.readdirSync(directory, { withFileTypes: true })
            .sort((left, right) => left.name.localeCompare(right.name))
            .forEach(entry => {
                const entryPath = path.join(directory, entry.name);
                if (this.shouldVisitDirectory(entry)) {
                    this.collectFiles(entryPath, files);
                    return;
                }
                if (entry.isFile() && this.shouldCheckFile(entryPath)) {
                    files.push(entryPath);
                }
            });
        return files;
    },

    /**
     * Runs Node's syntax checker for one source file without executing the file.
     * @param {string} filePath Absolute JavaScript-family file path.
     * @returns {Object} Validation result.
     */
    checkFile: function (filePath) {
        const result = spawnSync(process.execPath, ['--check', filePath], {
            encoding: 'utf8'
        });
        return {
            filePath: filePath,
            ok: result.status === 0,
            output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
        };
    },

    /**
     * Runs syntax validation for every discovered JavaScript-family source file.
     * @param {string} home Project home.
     * @returns {Object} Aggregate syntax-check result.
     */
    checkHome: function (home) {
        const files = this.collectFiles(path.resolve(home), []);
        const failures = files.map(filePath => this.checkFile(filePath)).filter(result => !result.ok);
        return {
            checked: files.length,
            failures: failures
        };
    },

    /**
     * CLI entrypoint used by the root `check:syntax` package script and nTooling test suites.
     * @param {string[]} args Command-line arguments.
     * @returns {Object} Aggregate syntax-check result.
     */
    run: function (args = process.argv.slice(2)) {
        const home = this.resolveHome(args);
        const result = this.checkHome(home);
        console.log('Nodics JavaScript syntax check');
        console.log('Home                       : ' + home);
        console.log('Files checked              : ' + result.checked);
        console.log('Failures                   : ' + result.failures.length);
        if (result.failures.length > 0) {
            result.failures.forEach(failure => {
                console.error(failure.filePath);
                if (failure.output) {
                    console.error(failure.output);
                }
            });
            process.exitCode = 1;
        }
        return result;
    }
};

if (require.main === module) {
    module.exports.run();
}
