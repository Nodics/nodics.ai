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

const toolingCommandService = require('../src/service/defaultToolingCommandService');

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

function resolveFrameworkRoot(projectRoot, projectEnv) {
    const env = Object.assign({}, projectEnv || {}, process.env);
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
            'Unable to resolve Nodics framework root. Set NODICS_FRAMEWORK_ROOT for this process ' +
            'or run from a project beside the nodics.ai checkout before using Nodics lifecycle commands.'
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

function resolveCommandHome(command, projectRoot) {
    return projectRoot;
}

function main() {
    const normalized = toolingCommandService.normalizeArguments(process.argv.slice(2));
    const projectRoot = toolingCommandService.resolveHome(normalized);
    const projectEnv = {};
    const command = normalizeCommand(normalized.find(argument => !argument.startsWith('-')) || 'help');
    const frameworkRoot = resolveFrameworkRoot(projectRoot, projectEnv);
    const toolPath = assertFrameworkRoot(frameworkRoot);
    const commandHome = resolveCommandHome(command, projectRoot, frameworkRoot);
    const args = [toolPath, command, '--home=' + commandHome].concat(normalized.filter(argument =>
        argument !== command && argument !== 'release-check' && !argument.startsWith('--home=')));
    const environment = Object.assign({}, projectEnv, process.env);
    for (const key of ['NODICS_REPOSITORY_BUILD_TMPDIR', 'NODICS_TOOLING_TMPDIR']) {
        if (environment[key] && !path.isAbsolute(environment[key])) environment[key] = path.resolve(projectRoot, environment[key]);
    }
    console.log('[nodics-project] project: ' + projectRoot);
    console.log('[nodics-project] framework: ' + frameworkRoot);
    console.log('[nodics-project] command: ' + command);
    const result = spawnSync(process.execPath, args, {
        cwd: projectRoot,
        env: Object.assign({}, environment, {
            NODICS_PROJECT_ROOT: projectRoot,
            NODICS_FRAMEWORK_ROOT: frameworkRoot
        }),
        stdio: 'inherit'
    });
    if (result.error) throw result.error;
    process.exitCode = result.status === null ? 1 : result.status;
}

try {
    main();
} catch (error) {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
}
