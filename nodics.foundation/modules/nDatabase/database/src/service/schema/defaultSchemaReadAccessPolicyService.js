/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/schema/DefaultSchemaReadAccessPolicyService
 * @description Applies runtime schema/property access policy decisions to
 * generated read/export responses. This service is intentionally read-only: it
 * masks or removes fields after data retrieval while leaving write and import
 * enforcement to their own pipeline slices.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize masking,
 * nested field handling, external policy resolution, or response metadata while
 * preserving the generated get pipeline contract.
 */
module.exports = {
    /** Resolves fixed read hooks from actual prepared schema metadata, never request flags. Qualification is evidence, not a privacy bypass. @param {Object} model Prepared provider receiver. @returns {Object|null} Effective configured owner. */
    protectedReadOwner: function (model) {
        const policy =
            model && model.rawSchema && model.rawSchema.readProtection;
        if (policy === undefined) return null;
        if (
            !policy ||
            typeof policy !== 'object' ||
            Array.isArray(policy) ||
            typeof policy.owner !== 'string' ||
            !/^[A-Za-z][A-Za-z0-9]*Service$/.test(policy.owner)
        ) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        }
        const owner = SERVICE[policy.owner];
        if (
            typeof owner?.providerRead !== 'function' ||
            typeof owner?.providerResult !== 'function'
        ) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        }
        return owner;
    },

    /** Guards the exact request before cache/provider query or count execution. @param {Object} request Exact original input. @param {Object} model Actual prepared receiver. @returns {Promise<boolean>} Owner acknowledgement. */
    providerRead: async function (request, model) {
        const owner = this.protectedReadOwner(model);
        if (owner && (await owner.providerRead(request, model)) !== true)
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        return true;
    },

    /** Projects the original response envelope before public delivery; no synthetic owner admission is created. @param {Object} request Exact original input. @param {Object} response Pipeline wrapper with success. @param {Object} model Actual prepared receiver. @returns {Promise<Object>} Projected wrapper. */
    providerResult: async function (request, response, model) {
        const owner = this.protectedReadOwner(model);
        if (
            owner &&
            (await owner.providerResult(request, response, model)) !== true
        )
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        return response;
    },

    /**
     * Initializes the read access policy service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the read access policy service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Applies runtime read policies to a generated get response.
     *
     * @param {Object} request Nodics get request.
     * @param {Object} response Pipeline response accumulator.
     * @returns {Promise<Object>} Resolves with the response after policy application.
     */
    applyReadPolicies: function (request, response) {
        return this.providerResult(request, response, request.schemaModel).then(
            () => this.applyAccessPolicies(request, response, 'read')
        );
    },

    /**
     * Applies runtime export policies to exported models.
     *
     * @param {Object} request Nodics export request.
     * @param {Object} response Export response accumulator.
     * @returns {Promise<Object>} Resolves with the response after policy application.
     */
    applyExportPolicies: function (request, response) {
        return this.providerResult(request, response, request.schemaModel).then(
            () => this.applyAccessPolicies(request, response, 'export')
        );
    },

    /**
     * Applies runtime access policies to a result collection.
     *
     * @param {Object} request Nodics request.
     * @param {Object} response Response accumulator.
     * @param {string} action Policy action.
     * @returns {Promise<Object>} Resolves with the response after policy application.
     */
    applyAccessPolicies: function (request, response, action) {
        if (
            !this.isPolicyResolverAvailable() ||
            !response ||
            !response.success ||
            !Array.isArray(response.success.result)
        ) {
            return Promise.resolve(response);
        }
        let properties = this.getPolicyControlledProperties(request);
        if (properties.length === 0 || response.success.result.length === 0) {
            return Promise.resolve(response);
        }
        return this.resolvePropertyDecisions(request, properties, action).then(
            (decisions) => {
                response.success.result = response.success.result.map((model) =>
                    this.applyDecisionsToModel(model, decisions)
                );
                response.success.policy = this.buildPolicyMetadata(
                    decisions,
                    action
                );
                return response;
            }
        );
    },

    /**
     * Checks whether the runtime policy resolver is available in the active module set.
     *
     * @returns {boolean} True when policy resolution can be performed.
     */
    isPolicyResolverAvailable: function () {
        return (
            SERVICE.DefaultSchemaAccessPolicyResolverService &&
            typeof SERVICE.DefaultSchemaAccessPolicyResolverService
                .resolveAccess === 'function'
        );
    },

    /**
     * Returns schema properties that can be controlled by read policies.
     *
     * @param {Object} request Nodics get request.
     * @returns {string[]} Property names.
     */
    getPolicyControlledProperties: function (request) {
        let definition =
            request.schemaModel && request.schemaModel.rawSchema
                ? request.schemaModel.rawSchema.definition
                : {};
        return Object.keys(definition || {});
    },

    /**
     * Resolves access decisions for each schema property.
     *
     * @param {Object} request Nodics read/export request.
     * @param {string[]} properties Property names.
     * @param {string} action Policy action.
     * @returns {Promise<Object>} Property decision map.
     */
    resolvePropertyDecisions: function (request, properties, action) {
        let decisions = {};
        return Promise.all(
            properties.map((propertyName) => {
                return SERVICE.DefaultSchemaAccessPolicyResolverService.resolveAccess(
                    request,
                    {
                        tenant: request.tenant,
                        moduleName: request.schemaModel.moduleName,
                        schemaName: request.schemaModel.schemaName,
                        propertyName: propertyName,
                        action: action,
                        userGroups: this.getUserGroups(request),
                        now: request.now
                    }
                ).then((decision) => {
                    decisions[propertyName] = decision;
                });
            })
        ).then(() => decisions);
    },

    /**
     * Returns user groups from the authenticated request context.
     *
     * @param {Object} request Nodics get request.
     * @returns {string[]} User group codes.
     */
    getUserGroups: function (request) {
        return request.authData && Array.isArray(request.authData.userGroups)
            ? request.authData.userGroups
            : [];
    },

    /**
     * Applies property decisions to a single model.
     *
     * @param {Object} model Source model.
     * @param {Object} decisions Property decision map.
     * @returns {Object} Filtered model.
     */
    applyDecisionsToModel: function (model, decisions) {
        let filtered = this.toPlainObject(model);
        Object.keys(decisions).forEach((propertyName) => {
            let decision = decisions[propertyName];
            if (decision.effect === 'HIDE' || decision.effect === 'DENY') {
                delete filtered[propertyName];
            } else if (
                decision.effect === 'MASK' &&
                Object.prototype.hasOwnProperty.call(filtered, propertyName)
            ) {
                filtered[propertyName] = this.maskValue(
                    filtered[propertyName],
                    decision.maskStrategy
                );
            }
        });
        return filtered;
    },

    /**
     * Converts model documents to plain objects before masking/removal.
     *
     * @param {*} model Source model or document.
     * @returns {Object} Plain model object.
     */
    toPlainObject: function (model) {
        if (model && typeof model.toObject === 'function') {
            return model.toObject();
        }
        if (model && typeof model.toJSON === 'function') {
            return model.toJSON();
        }
        return Object.assign({}, model);
    },

    /**
     * Masks a value according to a supported strategy.
     *
     * @param {*} value Source value.
     * @param {string} strategy Mask strategy.
     * @returns {*} Masked value.
     */
    maskValue: function (value, strategy) {
        if (value === undefined || value === null) {
            return value;
        }
        if (strategy === 'last4') {
            let text = String(value);
            return text.length <= 4
                ? '****'
                : '*'.repeat(text.length - 4) + text.slice(-4);
        }
        if (strategy === 'empty') {
            return '';
        }
        if (strategy === 'null') {
            return null;
        }
        return '****';
    },

    /**
     * Builds response metadata describing applied access policies.
     *
     * @param {Object} decisions Property decision map.
     * @param {string} action Policy action.
     * @returns {Object} Policy metadata.
     */
    buildPolicyMetadata: function (decisions, action) {
        let applied = Object.keys(decisions)
            .filter((propertyName) => {
                return ['HIDE', 'DENY', 'MASK'].includes(
                    decisions[propertyName].effect
                );
            })
            .map((propertyName) => {
                return {
                    propertyName: propertyName,
                    effect: decisions[propertyName].effect,
                    policyCode: decisions[propertyName].policyCode
                };
            });
        return {
            action: action,
            applied: applied,
            appliedCount: applied.length
        };
    }
};
