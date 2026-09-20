/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module eWaste/src/service/defaultEWasteRulePropertyCatalogueService
 * @description Contributes Electronics/eWaste reward properties and resolves normalized values for the generic Rules Engine.
 * @layer service
 * @owner eWaste
 * @override Partner projects may extend catalogue labels, allowed values and approved fallback sources without moving domain semantics into rulesEngine.
 */
module.exports = {
    providerCode: 'eWaste.reward',

    init: function () {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultRulePropertyCatalogueRegistryService) {
            SERVICE.DefaultRulePropertyCatalogueRegistryService.registerProvider(this.providerCode, this);
        }
        return Promise.resolve(true);
    },

    postInit: function () { return Promise.resolve(true); },

    property: function (code, displayName, dataType, operators, options) {
        return Object.assign({
            code: code,
            displayName: displayName,
            dataType: dataType,
            allowedOperators: operators,
            qualityAware: true,
            supportsFallback: false
        }, options || {});
    },

    getCatalogue: function () {
        const equality = ['EQUALS','NOT_EQUALS','IN','NOT_IN','IS_AVAILABLE','IS_NOT_AVAILABLE'];
        const numeric = ['EQUALS','NOT_EQUALS','GREATER_THAN','GREATER_THAN_OR_EQUAL','LESS_THAN','LESS_THAN_OR_EQUAL','BETWEEN','IS_AVAILABLE','IS_NOT_AVAILABLE'];
        const collection = ['CONTAINS','DOES_NOT_CONTAIN','CONTAINS_ANY','CONTAINS_ALL','IS_AVAILABLE','IS_NOT_AVAILABLE'];
        return {
            code: 'EWASTE_REWARD_PROPERTIES',
            version: '1',
            providerCode: this.providerCode,
            consumerModule: 'eWaste',
            properties: [
                this.property('asset.domain','Domain','STRING',equality,{ allowedValues:['ELECTRONICS'] }),
                this.property('asset.family','Waste family','STRING',equality),
                this.property('asset.category','Category','STRING',equality),
                this.property('asset.subCategory','Sub-category','STRING',equality),
                this.property('asset.itemType','Item type','STRING',equality),
                this.property('asset.brand','Brand','STRING',equality),
                this.property('asset.model','Model','STRING',equality),
                this.property('asset.condition','Condition','STRING',equality),
                this.property('asset.quantity','Quantity','NUMBER',numeric),
                this.property('asset.handlingSize','Handling size','STRING',equality),
                this.property('asset.recordedWeight','Recorded weight','NUMBER',numeric,{ unit:'KG', supportsFallback:true }),
                this.property('asset.approximateWeight','Approximate weight','NUMBER',numeric,{ unit:'KG', supportsFallback:true }),
                this.property('asset.length','Length','NUMBER',numeric,{ unit:'CM' }),
                this.property('asset.width','Width','NUMBER',numeric,{ unit:'CM' }),
                this.property('asset.height','Height','NUMBER',numeric,{ unit:'CM' }),
                this.property('environment.carbonImpact','Estimated carbon impact','NUMBER',numeric,{ unit:'KG_CO2E', supportsFallback:true }),
                this.property('environment.recyclability','Recyclability','STRING',equality),
                this.property('environment.reusePotential','Reuse potential','STRING',equality),
                this.property('environment.refurbishmentPotential','Refurbishment potential','STRING',equality),
                this.property('environment.recoveryPotential','Material recovery potential','STRING',equality),
                this.property('environment.landfillDiversion','Landfill diversion','NUMBER',numeric,{ unit:'KG' }),
                this.property('environment.contamination','Contamination','STRING',equality),
                this.property('materials','Materials','COLLECTION',collection),
                this.property('components','Components','COLLECTION',collection),
                this.property('hazards','Hazards','COLLECTION',collection),
                this.property('metadata.overallConfidence','Metadata confidence','NUMBER',numeric),
                this.property('metadata.completenessScore','Metadata completeness','NUMBER',numeric),
                this.property('metadata.manualVerificationRequired','Manual verification required','BOOLEAN',['IS_TRUE','IS_FALSE','EQUALS','NOT_EQUALS']),
                this.property('verification.status','Verification status','STRING',equality)
            ]
        };
    },

    resolveProperty: function (request) {
        let context = request && request.context || {};
        let properties = context.properties || {};
        let resolution = properties[request.propertyCode];
        return resolution || { available:false, quality:'UNAVAILABLE', source:'UNAVAILABLE' };
    },

    resolveAllowedValues: function (request) {
        let property = this.getCatalogue().properties.find(item => item.code === request.propertyCode);
        return property && property.allowedValues || [];
    },

    resolveFallback: function (request) {
        let context = request && request.context || {};
        let fallback = context.fallbacks && context.fallbacks[request.propertyCode];
        if (!Array.isArray(fallback)) return { available:false, quality:'UNAVAILABLE', source:'UNAVAILABLE' };
        return fallback.find(candidate => candidate && candidate.available === true) ||
            { available:false, quality:'UNAVAILABLE', source:'UNAVAILABLE' };
    },

    normalizeQuality: function (basis) {
        const map = {
            OPERATOR_MEASURED:'VERIFIED_MEASUREMENT',
            VERIFIED_MEASUREMENT:'VERIFIED_MEASUREMENT',
            OPERATOR_VERIFIED:'OPERATOR_VERIFIED',
            CUSTOMER_CONFIRMED:'CUSTOMER_CONFIRMED',
            AI_OBSERVED:'AI_OBSERVED',
            OBSERVED:'AI_OBSERVED',
            AI_INFERRED:'AI_INFERRED',
            INFERRED:'AI_INFERRED',
            ITEM_TYPE_DEFAULT:'REFERENCE_DEFAULT',
            CATEGORY_DEFAULT:'REFERENCE_DEFAULT',
            DOMAIN_DEFAULT:'REFERENCE_DEFAULT',
            REFERENCE_DEFAULT:'REFERENCE_DEFAULT'
        };
        return map[basis] || 'UNAVAILABLE';
    }
};
