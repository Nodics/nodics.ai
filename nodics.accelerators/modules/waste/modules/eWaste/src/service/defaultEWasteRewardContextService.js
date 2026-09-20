/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module eWaste/src/service/defaultEWasteRewardContextService
 * @description Normalizes submitted/verified eWaste facts and environmental assessments into the property-provider input contract.
 * @layer service
 * @owner eWaste
 */
module.exports = {
    provider: function () {
        return typeof SERVICE !== 'undefined' && SERVICE.DefaultEWasteRulePropertyCatalogueService
            ? SERVICE.DefaultEWasteRulePropertyCatalogueService
            : require('./defaultEWasteRulePropertyCatalogueService');
    },

    resolution: function (value, quality, confidence, source) {
        let available = value !== undefined && value !== null && value !== '' &&
            !(typeof value === 'number' && !Number.isFinite(value));
        return {
            available: available,
            value: available ? value : undefined,
            quality: available ? quality : 'UNAVAILABLE',
            confidence: available ? confidence : undefined,
            source: available ? source : 'UNAVAILABLE'
        };
    },

    codes: function (values) {
        return (Array.isArray(values) ? values : values === undefined || values === null ? [] : [values])
            .map(value => {
                if (typeof value === 'string') return value;
                if (value && typeof value === 'object') return value.code || value.materialCode || value.componentCode || value.hazardCode || value.name;
                return undefined;
            })
            .filter(value => typeof value === 'string' && value.length > 0);
    },

    provenanceQuality: function (facts, key, defaultQuality) {
        let provenance = facts && facts[key + 'Provenance'];
        let basis = provenance && provenance.basis;
        return this.provider().normalizeQuality(basis) === 'UNAVAILABLE'
            ? defaultQuality
            : this.provider().normalizeQuality(basis);
    },

    metric: function (impact, metricCodes) {
        let metrics = impact && Array.isArray(impact.metrics) ? impact.metrics : [];
        let wanted = Array.isArray(metricCodes) ? metricCodes : [metricCodes];
        return metrics.find(metric => wanted.includes(metric.metricCode || metric.code));
    },

    metricValue: function (metric) {
        if (!metric) return undefined;
        let value = metric.value;
        if (value === undefined) value = metric.amount;
        if (value === undefined) value = metric.valueMin;
        let numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : value;
    },

    carbonQuality: function (impact, confirmed) {
        if (confirmed) return 'OPERATOR_VERIFIED';
        if (impact && ['CONFIRMED','RECALCULATED'].includes(impact.calculationStatus)) return 'OPERATOR_VERIFIED';
        return 'AI_INFERRED';
    },

    descriptorValue: function (descriptor, path) {
        return path.split('.').reduce((value, key) => value && value[key], descriptor || {});
    },

    rangeMidpoint: function (range) {
        if (!range || typeof range !== 'object') return undefined;
        let min = Number(range.min), max = Number(range.max);
        return Number.isFinite(min) && Number.isFinite(max) && max >= min ? (min + max) / 2 : undefined;
    },

    observationValue: function (observation) {
        if (observation && typeof observation === 'object' && Object.prototype.hasOwnProperty.call(observation, 'value'))
            return observation.value === 'UNKNOWN' ? undefined : observation.value;
        return observation === 'UNKNOWN' ? undefined : observation;
    },

    observationQuality: function (observation, fallback) {
        let basis = observation && typeof observation === 'object' && observation.basis;
        let normalized = this.provider().normalizeQuality(basis);
        return normalized === 'UNAVAILABLE' ? fallback : normalized;
    },

    build: function (request) {
        let submission = request.submission || {};
        let descriptor = request.descriptor || submission.metadata && submission.metadata.suggestion || {};
        let facts = request.facts || submission.confirmedFacts || submission.submittedFacts || {};
        let impact = request.impact || submission.metadata && submission.metadata.approvedEstimate || {};
        let confirmed = request.assessmentType === 'CONFIRMED' || request.assessmentType === 'RECALCULATED';
        let factQuality = confirmed ? 'OPERATOR_VERIFIED' : 'CUSTOMER_CONFIRMED';
        let carbon = this.metric(impact, ['ESTIMATED_CO2E_SAVED_KG','NET_EMISSIONS_BENEFIT_KG_CO2E','AVOIDED_CO2E']);
        let landfill = this.metric(impact, ['DIVERTED_FROM_LANDFILL_KG']);
        let suggestionFacts = descriptor.facts || {};
        let recognition = descriptor.recognition || {};
        let environment = facts.environment || suggestionFacts.environment || {};
        let approximateRange = facts.weightEstimate || suggestionFacts.weightEstimate ||
            this.descriptorValue(descriptor, 'physical.approximateWeight') || descriptor.approximateWeight;
        let approximateWeight = typeof approximateRange === 'number' ? approximateRange : this.rangeMidpoint(approximateRange);
        let dimensions = facts.dimensionsEstimate || suggestionFacts.dimensionsEstimate || {};
        let recordedWeight = facts.weight !== undefined ? Number(facts.weight) : undefined;
        let materials = this.codes(
            facts.materials && facts.materials.length ? facts.materials :
            facts.materialTypeCodes && facts.materialTypeCodes.length ? facts.materialTypeCodes :
            suggestionFacts.materials && suggestionFacts.materials.length ? suggestionFacts.materials :
            recognition.materials
        );
        let components = this.codes(facts.components || suggestionFacts.components || recognition.components);
        let hazards = this.codes(environment.hazards || facts.hazards || suggestionFacts.hazards);
        let evidence = submission.metadata && submission.metadata.evidenceReview || {};
        let descriptorOwner = typeof SERVICE !== 'undefined' && SERVICE.DefaultWasteItemDescriptorService;
        let unknownFields = this.codes(
            descriptor.unknownFields || recognition.unknownFields ||
            (descriptorOwner && descriptorOwner.unknownFields ? descriptorOwner.unknownFields(facts) : [])
        );
        let lowConfidenceFields = this.codes(
            descriptor.lowConfidenceFields || recognition.lowConfidenceFields ||
            (descriptorOwner && descriptorOwner.lowConfidenceFields ? descriptorOwner.lowConfidenceFields(facts) : [])
        );
        let qualityFlags = this.codes(evidence.qualityFlags || descriptor.qualityFlags || recognition.qualityFlags);
        let completeness = descriptor.metadataCompleteness || descriptor.completenessScore;
        if (!Number.isFinite(Number(completeness))) completeness = Math.max(0, 1 - unknownFields.length / 7);
        let properties = {
            'asset.domain': this.resolution('ELECTRONICS','REFERENCE_DEFAULT',1,'EWASTE_ACCELERATOR'),
            'asset.family': this.resolution(facts.familyCode || 'ELECTRONICS',factQuality,1,'FACTS'),
            'asset.category': this.resolution(facts.categoryCode, this.provenanceQuality(facts,'category',factQuality),1,'FACTS'),
            'asset.subCategory': this.resolution(facts.subCategoryCode, factQuality,1,'FACTS'),
            'asset.itemType': this.resolution(facts.itemTypeCode, this.provenanceQuality(facts,'itemType',factQuality),1,'FACTS'),
            'asset.brand': this.resolution(facts.brand || suggestionFacts.brand, facts.brand ? factQuality : 'AI_OBSERVED', descriptor.confidence, facts.brand ? 'FACTS':'IMAGE_AI'),
            'asset.model': this.resolution(facts.model || suggestionFacts.model, facts.model ? factQuality : 'AI_OBSERVED', descriptor.confidence, facts.model ? 'FACTS':'IMAGE_AI'),
            'asset.condition': this.resolution(facts.conditionGrade || suggestionFacts.conditionGrade, this.provenanceQuality(facts,'condition', facts.conditionGrade ? factQuality : 'AI_OBSERVED'), descriptor.confidence, facts.conditionGrade ? 'FACTS':'IMAGE_AI'),
            'asset.quantity': this.resolution(facts.quantity || suggestionFacts.quantity || 1, factQuality,1,'FACTS'),
            'asset.handlingSize': this.resolution(facts.sizeClass || suggestionFacts.sizeClass, this.provenanceQuality(facts,'size', facts.sizeClass ? factQuality : 'AI_INFERRED'), descriptor.confidence,'FACTS_OR_AI'),
            'asset.recordedWeight': this.resolution(recordedWeight, this.provenanceQuality(facts,'weight', confirmed ? 'VERIFIED_MEASUREMENT' : factQuality),1,'FACTS'),
            'asset.approximateWeight': this.resolution(Number(approximateWeight), 'AI_INFERRED', descriptor.confidence,'IMAGE_AI'),
            'asset.length': this.resolution(this.rangeMidpoint(dimensions.length), 'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'asset.width': this.resolution(this.rangeMidpoint(dimensions.width), 'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'asset.height': this.resolution(this.rangeMidpoint(dimensions.height), 'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'environment.carbonImpact': this.resolution(this.metricValue(carbon), this.carbonQuality(impact,confirmed), impact.confidence,'WASTE_IMPACT'),
            'environment.recyclability': this.resolution(this.observationValue(environment.recyclability),this.observationQuality(environment.recyclability,'AI_INFERRED'),environment.recyclability && environment.recyclability.confidence || descriptor.confidence,'IMAGE_AI'),
            'environment.reusePotential': this.resolution(this.descriptorValue(descriptor,'environmental.reusePotential') || descriptor.reusePotential,'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'environment.refurbishmentPotential': this.resolution(this.descriptorValue(descriptor,'environmental.refurbishmentPotential') || descriptor.refurbishmentPotential,'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'environment.recoveryPotential': this.resolution(this.observationValue(environment.recoveryPotential),this.observationQuality(environment.recoveryPotential,'AI_INFERRED'),environment.recoveryPotential && environment.recoveryPotential.confidence || descriptor.confidence,'IMAGE_AI'),
            'environment.landfillDiversion': this.resolution(this.metricValue(landfill), this.carbonQuality(impact,confirmed),impact.confidence,'WASTE_IMPACT'),
            'environment.contamination': this.resolution(this.observationValue(environment.contamination),this.observationQuality(environment.contamination,'AI_OBSERVED'),environment.contamination && environment.contamination.confidence || descriptor.confidence,'IMAGE_AI'),
            'materials': this.resolution(materials,'AI_INFERRED',descriptor.confidence,'IMAGE_AI_OR_FACTS'),
            'components': this.resolution(components,'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'hazards': this.resolution(hazards,'AI_OBSERVED',descriptor.confidence,'IMAGE_AI'),
            'metadata.overallConfidence': this.resolution(Number(descriptor.confidence),'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'metadata.completenessScore': this.resolution(Number(completeness),'AI_INFERRED',descriptor.confidence,'SYSTEM_DERIVED'),
            'metadata.manualVerificationRequired': this.resolution(Boolean(evidence.manualApprovalRequired),'AI_OBSERVED',1,'EVIDENCE_POLICY'),
            'metadata.unknownFields': this.resolution(unknownFields,'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'metadata.lowConfidenceFields': this.resolution(lowConfidenceFields,'AI_INFERRED',descriptor.confidence,'IMAGE_AI'),
            'evidence.imageEvidenceType': this.resolution(evidence.sourceType || recognition.imageEvidence && recognition.imageEvidence.sourceType,'AI_OBSERVED',evidence.confidence || recognition.imageEvidence && recognition.imageEvidence.confidence,'EVIDENCE_POLICY'),
            'evidence.imageEvidenceConfidence': this.resolution(Number(evidence.confidence !== undefined ? evidence.confidence : recognition.imageEvidence && recognition.imageEvidence.confidence),'AI_OBSERVED',1,'EVIDENCE_POLICY'),
            'evidence.manualReviewRequired': this.resolution(Boolean(evidence.manualApprovalRequired),'AI_OBSERVED',1,'EVIDENCE_POLICY'),
            'evidence.qualityFlags': this.resolution(qualityFlags,'AI_OBSERVED',1,'EVIDENCE_POLICY'),
            'verification.status': this.resolution(request.verification && request.verification.verificationStatus, confirmed ? 'OPERATOR_VERIFIED':'UNAVAILABLE',1,'WASTE_VERIFICATION')
        };

        let fallbacks = {
            'asset.recordedWeight': [
                properties['asset.approximateWeight'],
                this.resolution(request.referenceDefaults && request.referenceDefaults.itemTypeWeight,'REFERENCE_DEFAULT',1,'ITEM_TYPE_DEFAULT'),
                this.resolution(request.referenceDefaults && request.referenceDefaults.categoryWeight,'REFERENCE_DEFAULT',1,'CATEGORY_DEFAULT')
            ].filter(Boolean),
            'asset.approximateWeight': [
                this.resolution(recordedWeight, this.provenanceQuality(facts,'weight',factQuality),1,'FACTS'),
                this.resolution(request.referenceDefaults && request.referenceDefaults.itemTypeWeight,'REFERENCE_DEFAULT',1,'ITEM_TYPE_DEFAULT')
            ].filter(Boolean),
            'environment.carbonImpact': Array.isArray(request.carbonFallbacks) ? request.carbonFallbacks : []
        };

        return {
            properties: properties,
            fallbacks: fallbacks,
            metadata: {
                assessmentType: request.assessmentType,
                submissionCode: submission.code,
                submissionRevision: submission.revision
            }
        };
    }
};
