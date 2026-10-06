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
const localBootstrapAdminPassword = 'adminPassword';

module.exports = {
    /** Generates a cryptographically random local secret. */
    randomSecret: function (bytes = 48) {
        return crypto.randomBytes(bytes).toString('base64url');
    },

    /** Checks the existing minimum bootstrap-service credential policy. */
    isWeakBootstrapSecret: function (value, minimumLength = 16) {
        const normalized = typeof value === 'string' ? value.toLowerCase() : '';
        return typeof value !== 'string' ||
            value.length < minimumLength ||
            insecureBootstrapValues.has(normalized) ||
            normalized.indexOf('change-me') >= 0;
    },

    /** Returns the generated local credential file for one selected environment. */
    credentialPath: function (projectRoot, environmentCode) {
        return path.join(projectRoot, 'envs', environmentCode, 'generated', 'local-runtime', 'credentials.json');
    },

    /** Reads existing native-Local credentials without creating, normalizing, chmodding or rotating storage. Invalid storage refuses even with environment overrides. */
    readExistingEnvironment: function (projectRoot, environmentCode, environment = process.env) {
        let fd;
        try {
            if (typeof projectRoot !== 'string' || !path.isAbsolute(projectRoot) ||
                !/^[A-Za-z0-9][A-Za-z0-9_-]*Local$/.test(environmentCode || '')) throw new Error();
            const root = fs.realpathSync(projectRoot);
            if (root !== path.resolve(projectRoot)) throw new Error();
            const file = this.credentialPath(root, environmentCode);
            if (fs.realpathSync(path.dirname(file)) !== path.dirname(file)) throw new Error();
            const before = fs.lstatSync(file);
            fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
            const stat = fs.fstatSync(fd);
            if (!stat.isFile() || before.isSymbolicLink() || stat.ino !== before.ino || stat.dev !== before.dev ||
                stat.nlink !== 1 || stat.size > 65536 || (stat.mode & 0o777) !== 0o600 ||
                typeof process.getuid === 'function' && stat.uid !== process.getuid()) throw new Error();
            const bytes = Buffer.alloc(65537);
            const length = fs.readSync(fd, bytes, 0, bytes.length, 0);
            if (length !== stat.size || length > 65536) throw new Error();
            const values = JSON.parse(bytes.subarray(0, length).toString('utf8'));
            const required = ['NODICS_JWT_SECRET', 'NODICS_API_KEY_PEPPER', 'NODICS_BOOTSTRAP_ADMIN_PASSWORD',
                'NODICS_BOOTSTRAP_SERVICE_PASSWORD', 'NODICS_BOOTSTRAP_SERVICE_API_KEY', 'NODICS_API_KEY'];
            if (!values || Object.getPrototypeOf(values) !== Object.prototype ||
                required.some(key => typeof values[key] !== 'string' || !values[key]) ||
                Object.keys(values).some(key => !/^NODICS_[A-Z0-9_]+$/.test(key) || typeof values[key] !== 'string') ||
                values.NODICS_JWT_SECRET.length < 32 ||
                required.filter(key => key !== 'NODICS_BOOTSTRAP_ADMIN_PASSWORD').some(key => this.isWeakBootstrapSecret(values[key]))) throw new Error();
            const after = fs.lstatSync(file);
            if (after.ino !== stat.ino || after.dev !== stat.dev || after.size !== stat.size ||
                after.mtimeMs !== stat.mtimeMs || after.ctimeMs !== stat.ctimeMs) throw new Error();
            return { ...values, ...environment };
        } catch {
            throw new Error('RESET_CREDENTIAL_RESOLUTION_REFUSED');
        } finally {
            if (fd !== undefined) fs.closeSync(fd);
        }
    },

    /** Rotates only existing native-Local JWT signing material during an explicitly authorized, exclusive runtime outage. Never normalizes other credentials or returns secret values. @param {string} projectRoot Canonical absolute project root. @param {string} environmentCode Exact Local environment code. @returns {Object} Content-free changed-key receipt. */
    rotateJwtSecret: function (projectRoot, environmentCode) {
        let temporary;
        let committed = false;
        try {
            if (typeof projectRoot !== 'string' || !path.isAbsolute(projectRoot) ||
                typeof environmentCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*Local$/.test(environmentCode)) throw new Error();
            const root = fs.realpathSync(projectRoot);
            if (root !== path.resolve(projectRoot)) throw new Error();
            const file = this.credentialPath(root, environmentCode);
            if (fs.realpathSync(path.dirname(file)) !== path.dirname(file)) throw new Error();
            const stat = fs.lstatSync(file);
            if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > 65536 || (stat.mode & 0o777) !== 0o600 ||
                typeof process.getuid === 'function' && stat.uid !== process.getuid()) throw new Error();
            const before = fs.readFileSync(file);
            if (before.length > 65536) throw new Error();
            const values = JSON.parse(before.toString('utf8'));
            const required = ['NODICS_JWT_SECRET', 'NODICS_API_KEY_PEPPER', 'NODICS_BOOTSTRAP_ADMIN_PASSWORD',
                'NODICS_BOOTSTRAP_SERVICE_PASSWORD', 'NODICS_BOOTSTRAP_SERVICE_API_KEY', 'NODICS_API_KEY'];
            if (!values || Object.getPrototypeOf(values) !== Object.prototype ||
                required.some(key => typeof values[key] !== 'string' || !values[key]) ||
                Object.keys(values).some(key => !/^NODICS_[A-Z0-9_]+$/.test(key) || typeof values[key] !== 'string') ||
                values.NODICS_JWT_SECRET.length < 32) throw new Error();
            const secret = this.randomSecret(64);
            if (typeof secret !== 'string' || secret.length < 64 || secret === values.NODICS_JWT_SECRET) throw new Error();
            const next = { ...values, NODICS_JWT_SECRET: secret };
            const serialized = Buffer.from(JSON.stringify(next, null, 2) + '\n');
            const parsed = JSON.parse(serialized.toString('utf8'));
            const changedKeys = Object.keys(values).filter(key => !Buffer.from(values[key]).equals(Buffer.from(parsed[key])));
            if (changedKeys.length !== 1 || changedKeys[0] !== 'NODICS_JWT_SECRET') throw new Error();
            temporary = path.join(path.dirname(file), '.jwt-rotation-' + crypto.randomBytes(16).toString('hex') + '.tmp');
            const fd = fs.openSync(temporary, 'wx', 0o600);
            try { fs.writeFileSync(fd, serialized); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
            // The operator owns the outage; reject an intervening credential writer rather than overwriting its changes.
            const current = fs.lstatSync(file);
            if (current.ino !== stat.ino || current.dev !== stat.dev || !current.isFile() ||
                (current.mode & 0o777) !== 0o600 || !fs.readFileSync(file).equals(before)) throw new Error();
            fs.renameSync(temporary, file);
            temporary = undefined;
            committed = true;
            const directory = fs.openSync(path.dirname(file), 'r');
            try { fs.fsyncSync(directory); } finally { fs.closeSync(directory); }
            if (!fs.readFileSync(file).equals(serialized) || (fs.statSync(file).mode & 0o777) !== 0o600) throw new Error();
            return { changedKeys, unchangedKeys: Object.keys(values).filter(key => key !== 'NODICS_JWT_SECRET'),
                administratorPasswordPreserved: true, mode: '0600' };
        } catch {
            throw new Error(committed ? 'JWT_ROTATION_COMMITTED_REQUIRES_RECONCILIATION' : 'JWT_ROTATION_REFUSED');
        } finally {
            if (temporary) { try { fs.unlinkSync(temporary); } catch { /* Never expose private file contents in cleanup errors. */ } }
        }
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
                NODICS_JWT_SECRET: this.randomSecret(64),
                NODICS_API_KEY_PEPPER: this.randomSecret(64),
                NODICS_BOOTSTRAP_ADMIN_PASSWORD: process.env.NODICS_BOOTSTRAP_ADMIN_PASSWORD || localBootstrapAdminPassword,
                NODICS_BOOTSTRAP_SERVICE_PASSWORD: this.randomSecret(),
                NODICS_BOOTSTRAP_SERVICE_API_KEY: this.randomSecret(),
                NODICS_API_KEY: this.randomSecret()
            };
        }
        let changed = false;
        // Persist once: rotating this key would orphan encrypted runtime configuration.
        if (!Object.prototype.hasOwnProperty.call(values, 'NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY')) {
            values.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY =
                process.env.NODICS_RUNTIME_CONFIGURATION_ENCRYPTION_KEY || this.randomSecret(32);
            changed = true;
        }
        if (values.NODICS_BOOTSTRAP_ADMIN_PASSWORD !== localBootstrapAdminPassword) {
            values.NODICS_BOOTSTRAP_ADMIN_PASSWORD = process.env.NODICS_BOOTSTRAP_ADMIN_PASSWORD || localBootstrapAdminPassword;
            changed = true;
        }
        if (this.isWeakBootstrapSecret(values.NODICS_BOOTSTRAP_SERVICE_PASSWORD)) {
            values.NODICS_BOOTSTRAP_SERVICE_PASSWORD = this.randomSecret();
            changed = true;
        }
        if (values.NODICS_BOOTSTRAP_ADMIN_PASSWORD === values.NODICS_BOOTSTRAP_SERVICE_PASSWORD) {
            values.NODICS_BOOTSTRAP_SERVICE_PASSWORD = this.randomSecret();
            changed = true;
        }
        if (typeof values.NODICS_BOOTSTRAP_SERVICE_API_KEY !== 'string' || values.NODICS_BOOTSTRAP_SERVICE_API_KEY.length < 32) {
            values.NODICS_BOOTSTRAP_SERVICE_API_KEY = this.randomSecret();
            changed = true;
        }
        if (typeof values.NODICS_API_KEY !== 'string' || values.NODICS_API_KEY.length < 32) {
            values.NODICS_API_KEY = typeof values.NODICS_RUNTIME_API_KEY === 'string' && values.NODICS_RUNTIME_API_KEY.length >= 32
                ? values.NODICS_RUNTIME_API_KEY
                : this.randomSecret();
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
