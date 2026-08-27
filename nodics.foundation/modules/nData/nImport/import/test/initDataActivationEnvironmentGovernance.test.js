/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const _ = require('lodash');

/**
 * @module import/test/initDataActivationEnvironmentGovernance
 * @description Verifies init/core/sample data-release activation, protected
 * environment gating, and mandatory bootstrap identity provisioning across
 * the import, auth, profile, and Kickoff configuration boundary.
 * @layer test
 * @owner import
 * @override Projects may enable additional environment-owned data releases
 * and secret sources through later configuration, but must preserve explicit
 * activation, manifest integrity, and governed bootstrap identity validation.
 */

const repositoryRoot = path.resolve(__dirname, '../../../../../../');
const importProperties = require('../config/properties');
const authDefaults = require('../../../../nAuth/config/properties').authSecurity;
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-import-env-'));
const localProperties = {
    data: {
        dataReleases: {
            types: {
                sample: {
                    enabled: true,
                    operatorExecution: true
                }
            }
        },
        contentPacks: {
            enabled: true
        }
    },
    authSecurity: {
        compatibility: {
            allowLocalBootstrapIdentity: true
        }
    },
    bootstrapIdentity: {
        source: 'test',
        adminPassword: 'test-admin-password-12345',
        servicePassword: 'test-service-password-12345',
        serviceApiKey: 'test-service-api-key-value-12345678901234567890'
    }
};
const protectedEnvironmentPropertyPaths = [
    'customer.project/envs/config/properties.js',
    'customer.project/envs/development/config/properties.js',
    'customer.project/envs/qa/config/properties.js',
    'customer.project/envs/preprod/config/properties.js',
    'customer.project/envs/production/config/properties.js'
];
const protectedEnvironmentRoots = [
    'customer.project/envs',
    'customer.project/envs/development',
    'customer.project/envs/qa',
    'customer.project/envs/preprod',
    'customer.project/envs/production'
];
const profileEmployeeDataPath = path.join(repositoryRoot, 'nodics.platform/modules/profile/data/init-v001/records/user/defaultEmployeeData.js');

function loadProperties(relativePath) {
    return require(path.join(fixtureRoot, relativePath));
}

function config(values) {
    const effective = _.merge({ authSecurity: _.merge({}, authDefaults) }, values || {});
    return {
        /**
         * Resolves one fixture-backed configuration value.
         *
         * @param {string} key Configuration key.
         * @returns {*} Configured value.
         */
        get: function (key) {
            return effective[key];
        }
    };
}

function writeProperties(relativePath, properties) {
    const filePath = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, 'module.exports = ' + JSON.stringify(properties || {}, null, 4) + ';\n');
}

protectedEnvironmentPropertyPaths.forEach(relativePath => writeProperties(relativePath, {}));
fs.mkdirSync(path.join(fixtureRoot, 'customer.project/envs/local/data/init-v001'), { recursive: true });
fs.writeFileSync(path.join(fixtureRoot, 'customer.project/envs/local/data/manifest.json'), JSON.stringify({
    contractVersion: 0,
    module: 'local',
    sections: {
        init: {
            kind: 'DATA_RELEASE',
            dataType: 'init',
            version: '0.0.0',
            description: 'Explicitly governed local developer init data',
            files: {}
        }
    }
}, null, 4));

function loadProfileBootstrapEmployees(activeConfig) {
    delete require.cache[profileEmployeeDataPath];
    global.CONFIG = activeConfig;
    try {
        return require(profileEmployeeDataPath);
    } finally {
        delete require.cache[profileEmployeeDataPath];
        delete global.CONFIG;
    }
}

const defaultReleasePolicy = importProperties.data.dataReleases;

assert.deepStrictEqual(defaultReleasePolicy.allowedContractVersions, [1, 2]);
assert.strictEqual(defaultReleasePolicy.types.init.enabled, true);
assert.strictEqual(defaultReleasePolicy.types.init.operatorExecution, true);
assert.strictEqual(defaultReleasePolicy.types.core.enabled, true);
assert.strictEqual(defaultReleasePolicy.types.core.operatorExecution, true);
assert.strictEqual(defaultReleasePolicy.types.sample.enabled, false);
assert.strictEqual(defaultReleasePolicy.types.sample.operatorExecution, false);

assert.strictEqual(localProperties.data.dataReleases.types.sample.enabled, true);
assert.strictEqual(localProperties.data.dataReleases.types.sample.operatorExecution, true);
assert.strictEqual(localProperties.data.contentPacks.enabled, true);
assert.strictEqual(
    fs.existsSync(path.join(fixtureRoot, 'customer.project/envs/local/data/manifest.json')),
    true,
    'local customer environments may own developer init data explicitly'
);

protectedEnvironmentPropertyPaths.forEach(relativePath => {
    const properties = loadProperties(relativePath);
    const label = relativePath;
    assert.notStrictEqual(_.get(properties, 'data.dataReleases.types.sample.enabled'), true,
        label + ' must not enable sample data releases by default');
    assert.notStrictEqual(_.get(properties, 'data.dataReleases.types.sample.operatorExecution'), true,
        label + ' must not enable operator sample execution by default');
    assert.notStrictEqual(_.get(properties, 'data.contentPacks.enabled'), true,
        label + ' must not enable content-pack imports by default');
});

protectedEnvironmentRoots.forEach(relativeRoot => {
    assert.strictEqual(
        fs.existsSync(path.join(fixtureRoot, relativeRoot, 'data/manifest.json')),
        false,
        relativeRoot + ' must not carry environment-owned init data unless explicitly governed'
    );
});

assert.throws(() => loadProfileBootstrapEmployees(config({})), /Bootstrap identity source/,
    'Mandatory profile bootstrap employees must not materialize without governed bootstrap identity');

assert.throws(() => loadProfileBootstrapEmployees(config({
    bootstrapIdentity: localProperties.bootstrapIdentity
})), /Local bootstrap identity sources are disabled/,
'Local bootstrap identity must not be usable with protected auth defaults');

const employees = loadProfileBootstrapEmployees(config({
    authSecurity: {
        compatibility: {
            allowLocalBootstrapIdentity: true
        }
    },
    bootstrapIdentity: {
        source: 'test',
        adminPassword: 'test-admin-password-12345',
        servicePassword: 'test-service-password-12345',
        serviceApiKey: 'test-service-api-key-value-12345678901234567890'
    }
}));
assert.strictEqual(employees.record0.code, 'admin');
assert.strictEqual(employees.record0.password.password, 'test-admin-password-12345');
assert.strictEqual(employees.record1.code, 'apiAdmin');
assert.strictEqual(employees.record1.apiKey, 'test-service-api-key-value-12345678901234567890');

console.log('Init-data activation and environment governance validated');
