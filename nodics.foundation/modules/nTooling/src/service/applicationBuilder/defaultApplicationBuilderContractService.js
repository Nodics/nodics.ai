/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderContractService
 * @description Loads and validates versioned, non-runtime Application Builder document contracts without bootstrapping Nodics or introducing a runtime persistence schema.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may extend semantic validation through the standard mergeable service contract without weakening structural, secret, path, or ownership safeguards.
 */
const fs = require('fs');
const path = require('path');

const contractRoot = path.resolve(__dirname, '../../../contracts/applicationBuilder');

module.exports = {
    /**
     * Returns the source-controlled Builder contract catalogue.
     * @returns {Object<string,string>} Contract kind to absolute schema path.
     */
    getContractPaths: function () {
        return {
            solution: path.join(contractRoot, 'solution.schema.json'),
            capability: path.join(contractRoot, 'capability-descriptor.schema.json'),
            guided: path.join(contractRoot, 'guided-request.schema.json'),
            plan: path.join(contractRoot, 'generation-plan.schema.json'),
            lock: path.join(contractRoot, 'solution-lock.schema.json'),
            qualification: path.join(contractRoot, 'qualification-report.schema.json')
        };
    },

    /**
     * Loads one Builder JSON Schema from the nTooling contract boundary.
     * @param {string} kind Contract kind.
     * @returns {Object} Parsed JSON Schema.
     */
    loadSchema: function (kind) {
        const schemaPath = this.getContractPaths()[kind];
        if (!schemaPath) {
            throw new Error('Unsupported Application Builder contract kind: ' + kind);
        }
        return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    },

    /**
     * Resolves a local JSON Schema reference from the current root schema.
     * @param {Object} rootSchema Root JSON Schema document.
     * @param {string} reference Local reference.
     * @returns {Object} Referenced schema fragment.
     */
    resolveReference: function (rootSchema, reference) {
        if (!reference.startsWith('#/')) {
            throw new Error('Only local Application Builder schema references are supported: ' + reference);
        }
        return reference.slice(2).split('/').reduce((value, segment) => value && value[segment], rootSchema);
    },

    /**
     * Returns a stable type name for structural validation diagnostics.
     * @param {*} value Candidate value.
     * @returns {string} JSON-oriented type name.
     */
    valueType: function (value) {
        if (Array.isArray(value)) {
            return 'array';
        }
        if (value === null) {
            return 'null';
        }
        if (Number.isInteger(value)) {
            return 'integer';
        }
        return typeof value;
    },

    /**
     * Validates a value against the dependency-free JSON Schema subset used by Builder contracts.
     * @param {*} value Candidate document or nested value.
     * @param {Object} schema Schema fragment.
     * @param {Object} rootSchema Root schema used for local references.
     * @param {string} location Diagnostic JSON path.
     * @param {string[]} errors Mutable diagnostic collection.
     * @returns {string[]} Validation errors.
     */
    validateValue: function (value, schema, rootSchema, location = '$', errors = []) {
        if (schema.$ref) {
            const resolved = this.resolveReference(rootSchema, schema.$ref);
            if (!resolved) {
                errors.push(location + ' references an unknown schema fragment: ' + schema.$ref);
                return errors;
            }
            return this.validateValue(value, resolved, rootSchema, location, errors);
        }
        if (Object.prototype.hasOwnProperty.call(schema, 'const') && value !== schema.const) {
            errors.push(location + ' must equal ' + JSON.stringify(schema.const));
        }
        if (schema.enum && !schema.enum.includes(value)) {
            errors.push(location + ' must be one of ' + schema.enum.join(', '));
        }
        if (schema.type) {
            const actualType = this.valueType(value);
            const validType = schema.type === 'number' ? typeof value === 'number' : actualType === schema.type;
            if (!validType) {
                errors.push(location + ' must be ' + schema.type + ', received ' + actualType);
                return errors;
            }
        }
        if (typeof value === 'string') {
            if (schema.minLength !== undefined && value.length < schema.minLength) {
                errors.push(location + ' must contain at least ' + schema.minLength + ' characters');
            }
            if (schema.maxLength !== undefined && value.length > schema.maxLength) {
                errors.push(location + ' must contain at most ' + schema.maxLength + ' characters');
            }
            if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) {
                errors.push(location + ' does not match required pattern');
            }
            if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) {
                errors.push(location + ' must be an ISO date-time');
            }
            if (schema.format === 'uri') {
                try {
                    new URL(value);
                } catch (error) {
                    errors.push(location + ' must be an absolute URI');
                }
            }
        }
        if (Array.isArray(value)) {
            if (schema.minItems !== undefined && value.length < schema.minItems) {
                errors.push(location + ' must contain at least ' + schema.minItems + ' items');
            }
            if (schema.uniqueItems) {
                const identities = value.map(item => JSON.stringify(item));
                if ((new Set(identities)).size !== identities.length) {
                    errors.push(location + ' must contain unique items');
                }
            }
            if (schema.items) {
                value.forEach((item, index) => this.validateValue(item, schema.items, rootSchema,
                    location + '[' + index + ']', errors));
            }
        }
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const properties = schema.properties || {};
            (schema.required || []).forEach(propertyName => {
                if (!Object.prototype.hasOwnProperty.call(value, propertyName)) {
                    errors.push(location + '.' + propertyName + ' is required');
                }
            });
            if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) {
                errors.push(location + ' must contain at least ' + schema.minProperties + ' properties');
            }
            Object.keys(value).forEach(propertyName => {
                if (properties[propertyName]) {
                    this.validateValue(value[propertyName], properties[propertyName], rootSchema,
                        location + '.' + propertyName, errors);
                } else if (schema.additionalProperties === false) {
                    errors.push(location + '.' + propertyName + ' is not allowed');
                } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
                    this.validateValue(value[propertyName], schema.additionalProperties, rootSchema,
                        location + '.' + propertyName, errors);
                }
                if (schema.propertyNames) {
                    this.validateValue(propertyName, schema.propertyNames, rootSchema,
                        location + ' property ' + propertyName, errors);
                }
            });
        }
        return errors;
    },

    /**
     * Detects secret-value field names anywhere in a Builder document.
     * @param {*} value Candidate document.
     * @param {string} location Diagnostic path.
     * @param {string[]} errors Mutable diagnostics.
     * @returns {string[]} Secret-field diagnostics.
     */
    validateSecretFree: function (value, location = '$', errors = []) {
        const forbidden = /^(?:password|secret|secretValue|token|apiKey|privateKey|credential|credentials)$/i;
        if (Array.isArray(value)) {
            value.forEach((item, index) => this.validateSecretFree(item, location + '[' + index + ']', errors));
        } else if (value && typeof value === 'object') {
            Object.keys(value).forEach(key => {
                if (forbidden.test(key)) {
                    errors.push(location + '.' + key + ' contains forbidden secret material; use a secretReference');
                }
                this.validateSecretFree(value[key], location + '.' + key, errors);
            });
        }
        return errors;
    },

    /**
     * Validates one Builder document structurally and applies invariant secret checks.
     * @param {string} kind Contract kind.
     * @param {Object} document Candidate document.
     * @returns {{valid:boolean,errors:string[]}} Validation result.
     */
    validateDocument: function (kind, document) {
        const schema = this.loadSchema(kind);
        const errors = this.validateValue(document, schema, schema, '$', []);
        this.validateSecretFree(document, '$', errors);
        return { valid: errors.length === 0, errors: errors };
    }
};
