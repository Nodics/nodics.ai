#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/bin/nodics-project
 * @description Framework-owned bridge for executing framework lifecycle tooling
 * from a customer or reference project without moving lifecycle implementation
 * into the project repository.
 * @layer tooling
 * @owner nTooling
 * @override Customer projects may expose npm script aliases to this bridge, but
 * must not copy framework clean, build, or release lifecycle logic.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const supportedCommands = new Set([
    'clean',
    'build',
    'release:check',
    'qualification:security-boundary',
    'qualification:publishing-capacity',
    'qualification:publishing-soak',
    'qualification:publishing-interruption-contracts',
    'project:validate',
    'project:run'
]);

function readEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/u).reduce((env, line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return env;
        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex < 0) return env;
        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[key] = value;
        return env;
    }, {});
}

function findFrameworkRootFromBridge() {
    const candidates = [];
    let current = path.resolve(__dirname);
    for (let index = 0; index < 8; index++) {
        candidates.push(current);
        current = path.dirname(current);
    }
    const match = candidates.find(candidate => {
        return fs.existsSync(path.join(candidate, 'nodics.foundation', 'modules', 'nTooling', 'bin', 'nodics-tool.js')) &&
            fs.existsSync(path.join(candidate, 'package.json'));
    });
    return match || path.resolve(__dirname, '../../../../..');
}

function resolveFrameworkRoot(projectRoot) {
    const env = Object.assign({}, readEnvFile(path.join(projectRoot, '.env')), process.env);
    if (env.NODICS_FRAMEWORK_ROOT) {
        return path.resolve(projectRoot, env.NODICS_FRAMEWORK_ROOT);
    }
    return findFrameworkRootFromBridge();
}

function assertFrameworkRoot(frameworkRoot) {
    const toolPath = path.join(frameworkRoot, 'nodics.foundation', 'modules', 'nTooling', 'bin', 'nodics-tool.js');
    const packagePath = path.join(frameworkRoot, 'package.json');
    if (!fs.existsSync(toolPath) || !fs.existsSync(packagePath)) {
        throw new Error(
            'Unable to resolve Nodics framework root. Set NODICS_FRAMEWORK_ROOT in the project .env ' +
            'or run configure:framework before using Nodics lifecycle commands.'
        );
    }
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageJson.name !== 'nodics.ai') {
        throw new Error('Resolved framework root is not nodics.ai: ' + frameworkRoot);
    }
    return toolPath;
}

function normalizeCommand(command) {
    if (command === 'release-check') return 'release:check';
    return command;
}

function resolveCommandHome(command, projectRoot, frameworkRoot) {
    if (command.indexOf('project:') === 0) {
        return projectRoot;
    }
    return frameworkRoot;
}

function main() {
    const projectRoot = process.cwd();
    const command = normalizeCommand(process.argv[2] || 'help');
    if (!supportedCommands.has(command)) {
        console.error('Usage: node nodics-project.js <clean|build|release:check|qualification:security-boundary|qualification:publishing-capacity|qualification:publishing-soak|qualification:publishing-interruption-contracts|project:validate|project:run> [args...]');
        process.exitCode = 1;
        return;
    }
    const frameworkRoot = resolveFrameworkRoot(projectRoot);
    const toolPath = assertFrameworkRoot(frameworkRoot);
    const commandHome = resolveCommandHome(command, projectRoot, frameworkRoot);
    const args = [toolPath, command, '--home=' + commandHome].concat(process.argv.slice(3));
    console.log('[nodics-project] project: ' + projectRoot);
    console.log('[nodics-project] framework: ' + frameworkRoot);
    console.log('[nodics-project] command: ' + command);
    const result = spawnSync(process.execPath, args, {
        cwd: projectRoot,
        env: Object.assign({}, process.env, {
            NODICS_PROJECT_ROOT: projectRoot,
            NODICS_FRAMEWORK_ROOT: frameworkRoot
        }),
        stdio: 'inherit'
    });
    if (result.error) throw result.error;
    process.exitCode = result.status || 0;
}

try {
    main();
} catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
}
