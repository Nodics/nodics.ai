/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nConfig/test/loggerStorageProviderContract
 * @description Verifies that file logging resolves through independent log
 * storage configuration and is not coupled to media storage provider selection.
 * @layer test
 * @owner nConfig
 * @override Project, environment, server, and node layers may override
 * `log.storage` without changing `media.storage`.
 */
const assert = require('assert');
const os = require('os');
const path = require('path');

const loggerService = require('../src/service/DefaultLoggerService');

const serverRoot = path.join(os.tmpdir(), 'nodics-log-storage-server');

global.NODICS = {
    getServerPath: function () {
        return serverRoot;
    },
    getEnvironmentName: function () {
        return 'kickoffLocal';
    },
    getServerName: function () {
        return 'commerceServer';
    },
    getNodeName: function () {
        return 'node1';
    }
};
global.CONFIG = {
    get: function (key) {
        if (key === 'nodeId') return 'node1';
        if (key === 'log') {
            return {
                storage: {
                    defaultProvider: 'local',
                    providers: {
                        local: {
                            enabled: true,
                            basePath: '',
                            fallbackRelativeBasePath: 'temp/logs'
                        }
                    },
                    layout: '{filename}'
                }
            };
        }
        if (key === 'media') {
            return {
                storage: {
                    defaultProvider: 's3',
                    providers: {
                        s3: {
                            enabled: true,
                            bucket: 'nodics-product-media',
                            region: 'me-central-1',
                            baseUrl: 'https://cdn.example.test'
                        }
                    }
                }
            };
        }
        return undefined;
    }
};

let localLogPath = loggerService.resolveLogFileName('nodics.log');
assert.strictEqual(
    localLogPath,
    path.join(serverRoot, 'temp/logs/nodics.log'),
    'Default local log storage must remain server-local even when media uses S3'
);
assert.strictEqual(CONFIG.get('media').storage.defaultProvider, 's3',
    'The test must prove media provider selection remains separate');

let nasLogPath = loggerService.resolveLogFileName('nodics.log', {
    storage: {
        defaultProvider: 'nas',
        providers: {
            nas: {
                enabled: true,
                basePath: '/mnt/nodics-logs'
            }
        },
        layout: '{environment}/{server}/{node}/{yyyy}/{mm}/{dd}/{filename}'
    }
});
assert(nasLogPath.startsWith('/mnt/nodics-logs/kickoffLocal/commerceServer/node1/'),
    'NAS log provider must resolve under the configured provider root and runtime layout');
assert(nasLogPath.endsWith('/nodics.log'), 'NAS log layout must preserve the configured filename');

let sanitizedPath = loggerService.resolveLogFileName('../escape.log', {
    storage: {
        defaultProvider: 'nas',
        providers: {
            nas: {
                enabled: true,
                basePath: '/mnt/nodics-logs'
            }
        },
        layout: '../{filename}'
    }
});
assert(sanitizedPath.startsWith('/mnt/nodics-logs/'),
    'Unsafe log layout segments must be sanitized inside the configured root');
assert(!sanitizedPath.includes('..'), 'Sanitized log path must not retain traversal segments');

delete global.NODICS;
delete global.CONFIG;
