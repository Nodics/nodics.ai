/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
const crypto = require('crypto');

/**
 * @module nodics.foundation/modules/nSystem/src/service/config/defaultRuntimeConfigurationSchemaService
 * @description Exposes module-declared runtime configuration contracts and masked effective values for admin control planes.
 * @layer service
 * @owner nSystem
 * @override Project modules may extend `runtimeConfigurationSchemas` through layered properties; they must not create a parallel configuration authority.
 */
module.exports = {
    /** Initializes the runtime configuration schema service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Completes runtime configuration schema service startup. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Lists runtime configuration schemas declared by active modules.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Runtime configuration schema response.
     */
    listSchemas: function (request) {
        let schemas = this.getSchemaRegistry();
        let data = Object.keys(schemas).sort().map(code => this.describeSchema(code, schemas[code]));
        return Promise.resolve({
            code: 'SUC_SYS_00000',
            message: 'Runtime configuration schemas fetched successfully',
            data: data,
            metadata: {
                count: data.length,
                tenant: this.getTenant(request)
            }
        });
    },

    /**
     * Returns one module-declared runtime configuration schema.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Runtime configuration schema response.
     */
    getSchema: function (request) {
        let schemaCode = this.getSchemaCode(request);
        let schema = this.resolveSchema(schemaCode);
        return Promise.resolve({
            code: 'SUC_SYS_00000',
            message: 'Runtime configuration schema fetched successfully',
            data: this.describeSchema(schemaCode, schema),
            metadata: {
                tenant: this.getTenant(request)
            }
        });
    },

    /**
     * Returns masked effective runtime configuration values for one schema.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Masked effective configuration response.
     */
    getEffectiveConfiguration: function (request) {
        let schemaCode = this.getSchemaCode(request);
        let schema = this.resolveSchema(schemaCode);
        let values = {};
        let missingRequired = [];
        (schema.fields || []).forEach(field => {
            let value = this.resolveFieldValue(field);
            let configured = this.isConfigured(field, value);
            values[field.code] = {
                configured: configured,
                value: configured ? this.maskValue(value, field) : undefined,
                sensitive: field.sensitive === true,
                sourcePath: field.path,
                restartRequired: field.restartRequired === true
            };
            if (field.required === true && !configured) {
                missingRequired.push(field.code);
            }
        });
        return Promise.resolve({
            code: 'SUC_SYS_00000',
            message: 'Runtime configuration effective values fetched successfully',
            data: {
                code: schemaCode,
                ownerModule: schema.ownerModule,
                status: missingRequired.length > 0 ? 'UNCONFIGURED' : 'CONFIGURED',
                missingRequired: missingRequired,
                values: values
            },
            metadata: {
                tenant: this.getTenant(request)
            }
        });
    },

    /**
     * Validates a proposed operator update against the declared schema without persisting it.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Validation response.
     */
    validateUpdate: function (request) {
        let payload = this.getPayload(request);
        let schemaCode = payload.schemaCode || payload.code || this.getSchemaCode(request);
        let schema = this.resolveSchema(schemaCode);
        let values = payload.values || payload.configuration || {};
        let validation = this.validateValues(schema, values);
        return Promise.resolve({
            code: validation.valid ? 'SUC_SYS_00000' : 'ERR_SYS_00002',
            message: validation.valid ? 'Runtime configuration update is valid' : 'Runtime configuration update is invalid',
            data: validation
        });
    },

    /**
     * Saves a runtime configuration update through the dedicated secret-safe path.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Save response with masked values only.
     */
    saveUpdate: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let payload = this.getPayload(request);
                let schemaCode = payload.schemaCode || payload.code || this.getSchemaCode(request);
                let schema = this.resolveSchema(schemaCode);
                let values = payload.values || payload.configuration || {};
                let validation = this.validateValues(schema, values, { allowSensitivePlainValue: true });
                if (!validation.valid) {
                    reject(new CLASSES.NodicsError('ERR_SYS_00002', validation.errors.join('; ')));
                    return;
                }
                let record = this.createRuntimeConfigurationRecord(request, schemaCode, schema, values);
                this.persistRuntimeConfigurationRecord(request, record).then(result => {
                    this.applyRuntimeConfigurationRecord(request, record);
                    return this.publishRuntimeConfigurationChanged(request, record).then(eventResult => {
                        resolve({
                            code: 'SUC_SYS_00000',
                            message: 'Runtime configuration saved successfully',
                            data: this.describeRuntimeConfigurationRecord(record),
                            result: result,
                            event: eventResult
                        });
                    });
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Reloads one persisted runtime configuration record and applies it to the effective config layer.
     *
     * @param {Object} request Event request containing data.code.
     * @returns {Promise<string>} Reload result.
     */
    reloadRuntimeConfigurationRecord: function (request) {
        return new Promise((resolve, reject) => {
            let payload = request && request.event && request.event.data ? request.event.data : request && request.data || {};
            let code = payload.code;
            if (!code) {
                resolve('Runtime configuration reload skipped; event has no record code');
                return;
            }
            let service = SERVICE.DefaultRuntimeConfigurationValueService;
            if (!service || typeof service.get !== 'function') {
                resolve('Runtime configuration value service is not available; reload skipped');
                return;
            }
            service.get({
                tenant: this.getTenant(request),
                query: { code: code },
                searchOptions: { limit: 1 }
            }).then(success => {
                let record = success.result && success.result[0];
                if (!record) {
                    resolve('Runtime configuration record not found; reload skipped: ' + code);
                    return;
                }
                this.applyRuntimeConfigurationRecord(request, record);
                resolve('Runtime configuration reloaded: ' + code);
            }).catch(reject);
        });
    },

    /** Returns the effective active schema registry from layered configuration. */
    getSchemaRegistry: function () {
        return (CONFIG && typeof CONFIG.get === 'function' && CONFIG.get('runtimeConfigurationSchemas')) || {};
    },

    /** Resolves one schema or raises the stable system error. */
    resolveSchema: function (schemaCode) {
        let schemas = this.getSchemaRegistry();
        let schema = schemaCode ? schemas[schemaCode] : undefined;
        if (!schema) {
            throw new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration schema is not available: ' + (schemaCode || 'unknown'));
        }
        return schema;
    },

    /** Projects a schema for API output without sample or placeholder values. */
    describeSchema: function (schemaCode, schema) {
        let described = _.cloneDeep(schema || {});
        described.code = described.code || schemaCode;
        described.fields = (described.fields || []).map(field => {
            let copy = _.cloneDeep(field);
            delete copy.placeholderValue;
            delete copy.sampleValue;
            return copy;
        });
        return described;
    },

    /** Resolves one field from runtime, secure, or credential configuration sources. */
    resolveFieldValue: function (field) {
        let runtime = CONFIG.get('runtimeConfiguration') || {};
        let secure = CONFIG.get('secureConfiguration') || {};
        let generic = CONFIG.get('credentials') || {};
        let candidates = field.sources || [
            { root: 'runtimeConfiguration', path: field.path },
            { root: 'secureConfiguration', path: field.path },
            { root: 'credentials', path: field.credentialReference ? [field.credentialReference] : field.path }
        ];
        let roots = {
            runtimeConfiguration: runtime,
            secureConfiguration: secure,
            credentials: generic
        };
        for (let index = 0; index < candidates.length; index++) {
            let candidate = candidates[index];
            let value = _.get(roots[candidate.root] || {}, candidate.path);
            if (this.isPresent(value)) {
                return this.unwrapValue(value);
            }
        }
        return undefined;
    },

    /** Extracts the operator-facing scalar value from wrapped configuration entries. */
    unwrapValue: function (value) {
        if (value && typeof value === 'object') {
            if (typeof value.value === 'string') return value.value;
            if (typeof value.token === 'string') return value.token;
            if (typeof value.secretReference === 'string') return value.secretReference;
        }
        return value;
    },

    /** Determines whether a field value is usable under its declared contract. */
    isConfigured: function (field, value) {
        if (!this.isPresent(value)) {
            return false;
        }
        let unconfiguredValues = field.unconfiguredValues || ['', 'changeme', 'sample', 'placeholder'];
        if (typeof value === 'string' && unconfiguredValues.includes(value.trim())) {
            return false;
        }
        if (field.pattern && typeof value === 'string' && !(new RegExp(field.pattern).test(value))) {
            return false;
        }
        return true;
    },

    /** Checks whether a candidate value is present before placeholder validation. */
    isPresent: function (value) {
        return value !== undefined && value !== null && value !== '';
    },

    /** Masks sensitive values for operator responses. */
    maskValue: function (value, field) {
        if (field.sensitive !== true) {
            return value;
        }
        let text = String(value);
        if (text.length <= 4) {
            return '****';
        }
        return text.slice(0, 2) + '****' + text.slice(-2);
    },

    /** Validates submitted values against the declared field types and patterns. */
    validateValues: function (schema, values, options) {
        options = options || {};
        let errors = [];
        let fieldMap = {};
        (schema.fields || []).forEach(field => {
            fieldMap[field.code] = field;
        });
        Object.keys(values || {}).forEach(code => {
            let field = fieldMap[code];
            if (!field) {
                errors.push('Unknown runtime configuration field: ' + code);
                return;
            }
            let value = values[code];
            if (field.sensitive === true && typeof value === 'string' && options.allowSensitivePlainValue !== true) {
                errors.push('Sensitive runtime configuration field must not be submitted as a plain value: ' + code);
                return;
            }
            if (field.type === 'boolean' && typeof value !== 'boolean') {
                errors.push('Runtime configuration field must be boolean: ' + code);
            } else if (field.type === 'number' && typeof value !== 'number') {
                errors.push('Runtime configuration field must be number: ' + code);
            } else if (field.type === 'string' && typeof value !== 'string') {
                errors.push('Runtime configuration field must be string: ' + code);
            } else if (field.pattern && typeof value === 'string' && !(new RegExp(field.pattern).test(value))) {
                errors.push('Runtime configuration field does not match required pattern: ' + code);
            }
        });
        return {
            valid: errors.length === 0,
            errors: errors,
            maskedValues: this.maskUpdateValues(schema, values)
        };
    },

    /** Builds the persisted runtime configuration record for one schema update. */
    createRuntimeConfigurationRecord: function (request, schemaCode, schema, values) {
        let fields = {};
        (schema.fields || []).forEach(field => {
            if (!Object.prototype.hasOwnProperty.call(values || {}, field.code)) {
                return;
            }
            fields[field.code] = this.createFieldRecord(field, values[field.code]);
        });
        return {
            code: this.runtimeRecordCode(request, schemaCode),
            active: true,
            ownerModule: schema.ownerModule,
            schemaCode: schemaCode,
            capabilityGroup: schema.capabilityGroup,
            category: schema.category,
            scope: this.resolveScope(request),
            tenant: this.getTenant(request),
            fields: fields,
            status: 'CONFIGURED',
            revision: this.createRevision(),
            requestedBy: this.resolveRuntimeActor(request),
            updatedAt: new Date().toISOString(),
            changedFieldCodes: Object.keys(fields),
            refreshBehavior: schema.refreshBehavior || 'runtime'
        };
    },

    /** Builds one persisted field record, encrypting sensitive values. */
    createFieldRecord: function (field, value) {
        let record = {
            sensitive: field.sensitive === true,
            restartRequired: field.restartRequired === true,
            updatedAt: new Date().toISOString()
        };
        if (field.sensitive === true) {
            record.encryptedValue = this.encryptSensitiveValue(String(value));
            record.maskedValue = this.maskValue(value, field);
        } else {
            record.value = value;
        }
        return record;
    },

    /** Encrypts a sensitive configuration value for persisted storage. */
    encryptSensitiveValue: function (value) {
        let key = this.resolveEncryptionKey();
        if (!key) {
            throw new CLASSES.NodicsError('ERR_SYS_00002', 'Runtime configuration encryption key is required for sensitive values');
        }
        let iv = crypto.randomBytes(12);
        let cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
        return {
            algorithm: 'aes-256-gcm',
            iv: iv.toString('base64'),
            value: encrypted.toString('base64'),
            authTag: cipher.getAuthTag().toString('base64')
        };
    },

    /** Decrypts a sensitive configuration envelope for effective runtime application. */
    decryptSensitiveValue: function (envelope) {
        if (!envelope) {
            return undefined;
        }
        let key = this.resolveEncryptionKey();
        if (!key) {
            throw new CLASSES.NodicsError('ERR_SYS_00002', 'Runtime configuration encryption key is required for sensitive values');
        }
        let decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
        decipher.setAuthTag(Buffer.from(envelope.authTag, 'base64'));
        return Buffer.concat([
            decipher.update(Buffer.from(envelope.value, 'base64')),
            decipher.final()
        ]).toString('utf8');
    },

    /** Resolves the configured AES key material for runtime configuration secrets. */
    resolveEncryptionKey: function () {
        let security = CONFIG.get('runtimeConfigurationSecurity') || {};
        let configured = security.encryptionKey;
        if (!configured || typeof configured !== 'string') {
            return undefined;
        }
        if (/^[a-f0-9]{64}$/i.test(configured)) {
            return Buffer.from(configured, 'hex');
        }
        return crypto.createHash('sha256').update(configured).digest();
    },

    /** Persists the runtime configuration record through the generated value service. */
    persistRuntimeConfigurationRecord: function (request, record) {
        let service = SERVICE.DefaultRuntimeConfigurationValueService;
        if (!service || typeof service.save !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration value service is not available'));
        }
        return service.save({
            tenant: this.getTenant(request),
            model: record
        });
    },

    /** Applies a persisted record into the effective tenant runtime configuration layer. */
    applyRuntimeConfigurationRecord: function (request, record) {
        let patch = this.createEffectiveRuntimePatch(record);
        if (Object.keys(patch).length > 0 && CONFIG && typeof CONFIG.changeTenantProperties === 'function') {
            CONFIG.changeTenantProperties({ runtimeConfiguration: patch }, this.getTenant(request));
        }
        return patch;
    },

    /** Creates the effective runtime configuration patch represented by a record. */
    createEffectiveRuntimePatch: function (record) {
        let schema = this.resolveSchema(record.schemaCode);
        let patch = {};
        (schema.fields || []).forEach(field => {
            let fieldRecord = record.fields && record.fields[field.code];
            if (!fieldRecord) {
                return;
            }
            let value = fieldRecord.sensitive ? this.decryptSensitiveValue(fieldRecord.encryptedValue) : fieldRecord.value;
            if (field.path) {
                if (this.fieldPathTargetsValue(field.path)) {
                    _.set(patch, field.path, value);
                } else {
                    _.set(patch, field.path, { value: value });
                }
            }
        });
        return patch;
    },

    /** Identifies schema paths that target an existing wrapped credential value. */
    fieldPathTargetsValue: function (path) {
        if (Array.isArray(path)) {
            return path[path.length - 1] === 'value';
        }
        return typeof path === 'string' && path.split('.').pop() === 'value';
    },

    /** Publishes the cluster/runtime refresh event for a saved configuration record. */
    publishRuntimeConfigurationChanged: function (request, record) {
        if (!SERVICE.DefaultEventService || typeof SERVICE.DefaultEventService.publish !== 'function') {
            return Promise.resolve({ skipped: true, reason: 'event_service_unavailable' });
        }
        return SERVICE.DefaultEventService.publish({
            tenant: this.getTenant(request),
            event: 'runtimeConfigurationChanged',
            data: {
                code: record.code,
                ownerModule: record.ownerModule,
                schemaCode: record.schemaCode,
                scope: record.scope,
                revision: record.revision,
                changedFieldCodes: record.changedFieldCodes,
                refreshBehavior: record.refreshBehavior
            },
            correlationId: request && request.correlationId
        }).catch(error => ({ skipped: true, reason: 'event_publish_failed', errorCode: error.code }));
    },

    /** Projects a persisted record for API output with encrypted values removed. */
    describeRuntimeConfigurationRecord: function (record) {
        let copy = _.cloneDeep(record);
        Object.keys(copy.fields || {}).forEach(fieldCode => {
            if (copy.fields[fieldCode].sensitive) {
                delete copy.fields[fieldCode].encryptedValue;
                copy.fields[fieldCode].value = copy.fields[fieldCode].maskedValue;
            }
        });
        return copy;
    },

    /** Creates the deterministic persisted record code for tenant, scope, and schema. */
    runtimeRecordCode: function (request, schemaCode) {
        let scope = this.resolveScope(request);
        return [this.getTenant(request), scope.level, scope.code, schemaCode].filter(Boolean).join(':');
    },

    /** Resolves the update scope declared by the request payload. */
    resolveScope: function (request) {
        let payload = this.getPayload(request);
        return {
            level: payload.scopeLevel || 'tenant',
            code: payload.scopeCode || this.getTenant(request)
        };
    },

    /** Creates an opaque revision token for runtime configuration records. */
    createRevision: function () {
        return Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
    },

    /** Resolves the authenticated actor recorded on the configuration update. */
    resolveRuntimeActor: function (request) {
        let authData = request && (request.authData || request.autData) || {};
        return authData.loginId || authData.serviceId || authData.sub || authData.code || authData.userId || authData.uid || authData.email;
    },

    /** Masks submitted values for validation responses. */
    maskUpdateValues: function (schema, values) {
        let masked = {};
        (schema.fields || []).forEach(field => {
            if (Object.prototype.hasOwnProperty.call(values || {}, field.code)) {
                masked[field.code] = this.maskValue(values[field.code], field);
            }
        });
        return masked;
    },

    /** Extracts the schema code from params, query, or body payload. */
    getSchemaCode: function (request) {
        let payload = this.getPayload(request);
        return request.schemaCode || payload.schemaCode || payload.code || payload.configurationCode;
    },

    /** Merges supported HTTP request payload locations into one object. */
    getPayload: function (request) {
        let httpRequest = request && request.httpRequest ? request.httpRequest : {};
        return _.merge({}, request && request.query || {}, httpRequest.params || {}, httpRequest.query || {}, httpRequest.body || {});
    },

    /** Resolves the active tenant for runtime configuration operations. */
    getTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    }
};
