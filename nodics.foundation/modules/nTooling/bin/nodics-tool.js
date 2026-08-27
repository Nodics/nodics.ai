#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/bin/nodics-tool
 * @description CLI entrypoint that delegates non-runtime commands to the governed, project-aware tooling command service.
 * @layer tooling
 * @owner nTooling
 * @override Projects customize commands through module contributions; this stable launcher should not contain project behavior.
 */

const fs = require('fs');
const path = require('path');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

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

function loadLocalEnv(cwd) {
    const localEnv = readEnvFile(path.join(cwd, '.env'));
    Object.keys(localEnv).forEach(key => {
        if (process.env[key] === undefined) process.env[key] = localEnv[key];
    });
}

loadLocalEnv(process.cwd());

toolingCommandService.run(process.argv.slice(2)).catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
});
