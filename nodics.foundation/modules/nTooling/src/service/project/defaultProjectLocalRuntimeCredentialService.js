/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nTooling/service/project/defaultProjectLocalRuntimeCredentialService
 * @description Supplies stable generated credentials for native local project
 * runtime processes without committing secrets or requiring a .env file.
 * @layer tooling
 * @owner nTooling
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const insecureBootstrapValues = new Set(['admin', 'adminpassword', 'password', 'changeme', 'change-me']);
const legacyRuntimeApiKeys = Object.freeze([
    'NODICS_RUNTIME_API_KEY',
    'NODICS_PLATFORM_API_KEY',
    'NODICS_LOCATION_API_KEY',
    'NODICS_WCMS_STAGED_API_KEY',
    'NODICS_WCMS_ONLINE_API_KEY',
    'NODICS_PROCESS_API_KEY',
    'NODICS_ENGAGEMENT_API_KEY',
    'NODICS_LOYALTY_API_KEY',
    'NODICS_WASTE_API_KEY',
    'NODICS_COMMERCE_STAGED_API_KEY',
    'NODICS_COMMERCE_API_KEY'
]);

function randomSecret(bytes = 48) {
    return crypto.randomBytes(bytes).toString('base64url');
}

function isWeakBootstrapSecret(value, minimumLength = 16) {
    const normalized = typeof value === 'string' ? value.toLowerCase() : '';
    return typeof value !== 'string' ||
        value.length < minimumLength ||
        insecureBootstrapValues.has(normalized) ||
        normalized.indexOf('change-me') >= 0;
}

module.exports = {
    /** Returns the generated local credential file for one selected environment. */
    credentialPath: function (projectRoot, environmentCode) {
        return path.join(projectRoot, 'envs', environmentCode, 'generated', 'local-runtime', 'credentials.json');
    },

    /** Creates stable native-local credential values on first use. */
    ensureCredentials: function (projectRoot, environmentCode) {
        const file = this.credentialPath(projectRoot, environmentCode);
        fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
        let values;
        try {
            values = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch {
            values = {
                NODICS_JWT_SECRET: randomSecret(64),
                NODICS_API_KEY_PEPPER: randomSecret(64),
                NODICS_BOOTSTRAP_ADMIN_PASSWORD: process.env.NODICS_BOOTSTRAP_ADMIN_PASSWORD || randomSecret(),
                NODICS_BOOTSTRAP_SERVICE_PASSWORD: randomSecret(),
                NODICS_BOOTSTRAP_SERVICE_API_KEY: randomSecret(),
                NODICS_API_KEY: randomSecret()
            };
        }
        let changed = false;
        if (isWeakBootstrapSecret(values.NODICS_BOOTSTRAP_ADMIN_PASSWORD)) {
            values.NODICS_BOOTSTRAP_ADMIN_PASSWORD = randomSecret();
            changed = true;
        }
        if (isWeakBootstrapSecret(values.NODICS_BOOTSTRAP_SERVICE_PASSWORD)) {
            values.NODICS_BOOTSTRAP_SERVICE_PASSWORD = randomSecret();
            changed = true;
        }
        if (values.NODICS_BOOTSTRAP_ADMIN_PASSWORD === values.NODICS_BOOTSTRAP_SERVICE_PASSWORD) {
            values.NODICS_BOOTSTRAP_SERVICE_PASSWORD = randomSecret();
            changed = true;
        }
        if (typeof values.NODICS_BOOTSTRAP_SERVICE_API_KEY !== 'string' || values.NODICS_BOOTSTRAP_SERVICE_API_KEY.length < 32) {
            values.NODICS_BOOTSTRAP_SERVICE_API_KEY = randomSecret();
            changed = true;
        }
        if (typeof values.NODICS_API_KEY !== 'string' || values.NODICS_API_KEY.length < 32) {
            values.NODICS_API_KEY = typeof values.NODICS_RUNTIME_API_KEY === 'string' && values.NODICS_RUNTIME_API_KEY.length >= 32
                ? values.NODICS_RUNTIME_API_KEY
                : randomSecret();
            changed = true;
        }
        for (const key of legacyRuntimeApiKeys) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                delete values[key];
                changed = true;
            }
        }
        if (changed || !fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify(values, null, 2) + '\n', { mode: 0o600 });
        }
        fs.chmodSync(file, 0o600);
        return values;
    },

    /** Merges generated local values without overriding deployment-supplied inputs. */
    mergeEnvironment: function (projectRoot, environmentCode, environment = process.env) {
        if (!environmentCode || !/Local$/u.test(String(environmentCode))) return Object.assign({}, environment);
        const generated = this.ensureCredentials(projectRoot, environmentCode);
        return Object.assign({}, generated, environment);
    }
};
