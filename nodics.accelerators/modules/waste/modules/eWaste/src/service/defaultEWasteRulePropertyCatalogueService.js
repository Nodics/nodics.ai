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

    /** Implements init as an overrideable service operation. */
    init: function () {
        if (typeof SERVICE !== 'undefined' && SERVICE.DefaultRulePropertyCatalogueRegistryService) {
            SERVICE.DefaultRulePropertyCatalogueRegistryService.registerProvider(this.providerCode, this);
        }
        return Promise.resolve(true);
    },

    /** Implements postInit as an overrideable service operation. */
    postInit: function () { return Promise.resolve(true); },

    /** Implements property as an overrideable service operation. */
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

    /** Implements getCatalogue as an overrideable service operation. */
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
                this.property('metadata.unknownFields','Unknown metadata fields','COLLECTION',collection),
                this.property('metadata.lowConfidenceFields','Low-confidence metadata fields','COLLECTION',collection),
                this.property('evidence.imageEvidenceType','Image evidence type','STRING',equality,{
                    allowedValues:['ITEM_PHOTOGRAPH','PROMOTIONAL_GRAPHIC','ILLUSTRATION_OR_PAINTING','SCREENSHOT_OR_REPHOTO','SUSPECTED_GENERATED','UNCERTAIN']
                }),
                this.property('evidence.imageEvidenceConfidence','Image evidence confidence','NUMBER',numeric),
                this.property('evidence.manualReviewRequired','Image manual review required','BOOLEAN',['IS_TRUE','IS_FALSE','EQUALS','NOT_EQUALS']),
                this.property('evidence.qualityFlags','Image quality flags','COLLECTION',collection),
                this.property('verification.status','Verification status','STRING',equality)
            ]
        };
    },

    /** Implements resolveProperty as an overrideable service operation. */
    resolveProperty: function (request) {
        let context = request && request.context || {};
        let properties = context.properties || {};
        let resolution = properties[request.propertyCode];
        return resolution || { available:false, quality:'UNAVAILABLE', source:'UNAVAILABLE' };
    },

    /** Implements label as an overrideable service operation. */
    label: function (record) {
        if (!record) return '';
        if (typeof record.name === 'string') return record.name;
        if (record.name && typeof record.name === 'object') {
            return record.name.en || record.name['en-US'] || record.name['en-GB'] ||
                Object.values(record.name).find(value => typeof value === 'string') || record.code;
        }
        return record.code;
    },

    /** Implements values as an overrideable service operation. */
    values: function (records) {
        return (records || []).map(record => ({
            value: record.code,
            label: this.label(record)
        }));
    },

    /** Implements resolveAllowedValues as an overrideable service operation. */
    resolveAllowedValues: async function (request) {
        let propertyCode = request.propertyCode;
        let property = this.getCatalogue().properties.find(item => item.code === propertyCode);
        if (!property) return [];
        if (Array.isArray(property.allowedValues)) {
            return property.allowedValues.map(value => ({ value: value, label: value }));
        }

        let context = request.context || {};
        let runtimeRequest = context.request;
        let store = typeof SERVICE !== 'undefined' && SERVICE.DefaultWastePersistenceService;
        let filters = context.filters || {};
        if (store && runtimeRequest) {
            if (propertyCode === 'asset.family') {
                return this.values(await store.list('wasteFamily', runtimeRequest, { status: 'ACTIVE' }, 100));
            }
            if (propertyCode === 'asset.category') {
                let query = { status: 'ACTIVE' };
                if (filters.familyCode) query.familyCode = filters.familyCode;
                return this.values(await store.list('wasteCategory', runtimeRequest, query, 500));
            }
            if (propertyCode === 'asset.itemType') {
                let query = { status: 'ACTIVE' };
                if (filters.categoryCode) query.categoryCode = filters.categoryCode;
                return this.values(await store.list('wasteItemType', runtimeRequest, query, 500));
            }
            if (propertyCode === 'asset.condition') {
                return this.values(await store.list('wasteConditionGrade', runtimeRequest, { status: 'ACTIVE' }, 100));
            }
            if (propertyCode === 'materials' || propertyCode === 'components') {
                let query = { status: 'ACTIVE' };
                if (propertyCode === 'components') query.materialKind = 'COMPONENT';
                return this.values(await store.list('wasteMaterialType', runtimeRequest, query, 500));
            }
        }

        let descriptor = require('../../../../../../../nodics.waste/modules/wasteMaterial/src/utils/descriptorDefinitions');
        if (propertyCode === 'asset.handlingSize') {
            return descriptor.sizeClasses.map(value => ({ value: value, label: value }));
        }
        if (propertyCode === 'environment.recyclability') {
            return descriptor.recyclability.map(value => ({ value: value, label: value }));
        }
        if (propertyCode === 'environment.contamination') {
            return descriptor.contamination.map(value => ({ value: value, label: value }));
        }
        if (propertyCode === 'hazards') {
            return descriptor.hazards.map(value => ({ value: value, label: value }));
        }
        if (propertyCode === 'evidence.imageEvidenceType') {
            return ['ITEM_PHOTOGRAPH','PROMOTIONAL_GRAPHIC','ILLUSTRATION_OR_PAINTING','SCREENSHOT_OR_REPHOTO','SUSPECTED_GENERATED','UNCERTAIN']
                .map(value => ({ value: value, label: value }));
        }
        if (propertyCode === 'evidence.qualityFlags') {
            return descriptor.qualityFlags.map(value => ({ value: value, label: value }));
        }
        if (propertyCode === 'verification.status') {
            return ['VERIFIED','APPROVED','REJECTED','CHANGES_REQUESTED','NEEDS_RECEIPT','NEEDS_INSPECTION']
                .map(value => ({ value: value, label: value }));
        }
        return [];
    },

    /** Implements qualityService as an overrideable service operation. */
    qualityService: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultRuleQualityService
            ? SERVICE.DefaultRuleQualityService
            : require('../../../../../../../nodics.rulesEngine/modules/rulesEvaluation/src/service/defaultRuleQualityService');
    },

    /** Implements resolveFallback as an overrideable service operation. */
    resolveFallback: function (request) {
        let context = request && request.context || {};
        let fallback = context.fallbacks && context.fallbacks[request.propertyCode];
        if (!Array.isArray(fallback)) return { available:false, quality:'UNAVAILABLE', source:'UNAVAILABLE' };
        let quality = this.qualityService();
        return fallback.find(candidate => candidate && candidate.available === true &&
            quality.meets(candidate.quality, request.minimumInputQuality) &&
            quality.confidenceMeets(candidate.confidence, request.minimumConfidence)) ||
            { available:false, quality:'UNAVAILABLE', source:'UNAVAILABLE' };
    },

    /** Implements normalizeQuality as an overrideable service operation. */
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
