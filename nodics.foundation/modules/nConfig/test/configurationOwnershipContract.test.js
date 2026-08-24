/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const merge = require('lodash/merge');

/**
 * @module nodics.foundation/modules/nConfig/test/configurationOwnershipContract
 * @description Prevents environment, server, and node properties from becoming copied snapshots of module defaults.
 * @layer test
 * @owner nConfig
 */

const root = path.resolve(__dirname, '../../../..');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-config-ownership-'));
const envRoot = path.join(fixtureRoot, 'customerProject/envs');

function findProperties(directory, result) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            findProperties(target, result);
        } else if (target.endsWith(path.join('config', 'properties.js'))) {
            result.push(target);
        }
    });
    return result;
}

function load(relativePath) {
    return require(path.join(root, relativePath));
}

/**
 * Writes a synthetic project/environment/server properties fixture.
 *
 * The contract intentionally uses project-neutral fixture names so framework
 * governance does not accidentally make any reference project a standard.
 *
 * @param {string} relativePath relative fixture path.
 * @param {string} source JavaScript source to write.
 */
function writeFixture(relativePath, source) {
    const filePath = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, source);
}

writeFixture('customerProject/envs/local/config/properties.js', `
module.exports = {
    log: {
        level: 'info'
    },
    search: {
        default: {
            options: {
                enabled: false
            }
        }
    }
};
`);
writeFixture('customerProject/envs/local/platformServer/config/properties.js', `
module.exports = {
};
`);
writeFixture('customerProject/envs/local/diagnosticServer/config/properties.js', `
module.exports = {
    log: {
        level: 'debug'
    }
};
`);
writeFixture('customerProject/envs/local/searchServer/config/properties.js', `
module.exports = {
    search: {
        default: {
            options: {
                enabled: true,
                engine: 'elastic'
            }
        }
    }
};
`);
writeFixture('customerProject/envs/local/contentServer/config/properties.js', `
module.exports = {
    cms: {
        publication: {
            target: {
                timeoutMs: 30000,
                maxAttempts: 3
            }
        }
    },
    media: {
        publication: {
            target: {
                timeoutMs: 30000,
                maxAttempts: 3
            }
        }
    }
};
`);

const topologySources = findProperties(envRoot, []).map(file => ({
    file,
    source: fs.readFileSync(file, 'utf8')
}));

const inheritedPlaceholderPatterns = [
    {
        expression: /contextRoot:\s*['"]nodics['"]/,
        message: 'contextRoot nodics is inherited from nRouter'
    },
    {
        expression: /runOnStartup:\s*false/,
        message: 'cronjob.runOnStartup false is inherited from cronjob'
    },
    {
        expression: /logFailedMessages:\s*false/,
        message: 'emsClient.logFailedMessages false is inherited from emsClient'
    }
];

topologySources.forEach(entry => inheritedPlaceholderPatterns.forEach(pattern => {
    assert(!pattern.expression.test(entry.source),
        path.relative(root, entry.file) + ' must not restate an inherited default: ' + pattern.message);
}));

const framework = merge({},
    load('nodics.foundation/modules/nConfig/config/properties.js'),
    load('nodics.foundation/modules/nRouter/config/properties.js'),
    load('nodics.foundation/modules/nSearch/search/config/properties.js'),
    load('nodics.foundation/modules/nEms/emsClient/config/properties.js'),
    load('nodics.process/modules/cronjob/config/properties.js'));
const local = require(path.join(fixtureRoot, 'customerProject/envs/local/config/properties.js'));

const backoffice = merge({}, framework, local,
    require(path.join(fixtureRoot, 'customerProject/envs/local/platformServer/config/properties.js')));
assert.strictEqual(backoffice.log.level, 'info');
assert.strictEqual(backoffice.cronjob.runOnStartup, false);
assert.strictEqual(backoffice.search.default.options.enabled, false);
assert.strictEqual(backoffice.servers.options.contextRoot, 'nodics');

const deap = merge({}, framework, local,
    require(path.join(fixtureRoot, 'customerProject/envs/local/diagnosticServer/config/properties.js')));
assert.strictEqual(deap.emsClient.logFailedMessages, false);
assert.strictEqual(deap.search.default.options.enabled, false);
assert.strictEqual(deap.log.level, 'debug',
    'Server-specific debug logging must remain an intentional override');

const mono = merge({}, framework, local,
    require(path.join(fixtureRoot, 'customerProject/envs/local/searchServer/config/properties.js')));
assert.strictEqual(mono.cronjob.runOnStartup, false);
assert.strictEqual(mono.search.default.options.enabled, true);
assert.strictEqual(mono.search.default.options.engine, 'elastic');

const publicationDefaults = merge({},
    load('nodics.wcms/modules/cms/config/properties.js'),
    load('nodics.wcms/modules/media/config/properties.js'));
const staged = merge({}, publicationDefaults,
    require(path.join(fixtureRoot, 'customerProject/envs/local/contentServer/config/properties.js')));
['cms', 'media'].forEach(moduleName => {
    assert.strictEqual(staged[moduleName].publication.target.timeoutMs, 30000);
    assert.strictEqual(staged[moduleName].publication.target.maxAttempts, 3);
});

fs.rmSync(fixtureRoot, { recursive: true, force: true });

console.log('Framework-wide configuration ownership contract validated');
