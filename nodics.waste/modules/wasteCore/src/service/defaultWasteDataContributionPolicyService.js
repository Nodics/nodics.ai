/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCore/src/service/defaultWasteDataContributionPolicyService @description Validates schema-driven Waste data contributions from accelerators and partner projects. @layer service @owner wasteCore @override Later modules may add allowed schema names only when nodics.waste owns the reusable contract. */
const allowedSchemaNames = [
    'wasteLifecyclePolicy',
    'wasteAssetCreationPolicy',
    'wasteAssetType',
    'wasteAsset',
    'wasteAssetMarketplaceProjection',
    'wasteAssetOwnershipEvent',
    'wasteAssetTransferPolicy',
    'wasteMarketplaceEligibilityPolicy',
    'wasteRewardSettlementPolicy',
    'wasteCarbonSettlementPolicy',
    'wasteCouponRedemptionSettlementPolicy',
    'wasteFamily',
    'wasteCategory',
    'wasteItemType',
    'wasteMaterialType',
    'wasteConditionGrade',
    'wasteEvidencePolicy',
    'wasteCollectionPointType',
    'wasteCollectionPoint',
    'wasteCollectionAcceptanceRule',
    'wasteCollectionPreset',
    'wasteReceiptPolicy',
    'wasteSubmission',
    'wasteEvidence',
    'wasteMetadataSuggestion',
    'wasteVerificationPolicy',
    'wasteVerification',
    'wasteReceipt',
    'wasteImpactMetric',
    'wasteImpactProfile',
    'wasteImpactResult',
    'wasteBatch',
    'wasteMovement',
    'wasteComplianceProfile',
    'wasteComplianceEvidence'
];

const forbiddenRecordFields = [
    'tenant',
    'tenantCode',
    'enterpriseCode',
    'rewardEligibility',
    'rewardFormula',
    'couponCode',
    'mapProvider',
    'mapboxToken',
    'vendorCode',
    'vendorRef',
    'recyclerAdapter',
    'logisticsAdapter'
];

const layerPrecedence = ['FRAMEWORK', 'ACCELERATOR_UMBRELLA', 'SCENARIO_ACCELERATOR', 'ACCELERATOR', 'PROJECT', 'TENANT', 'ENVIRONMENT'];

const flattenHeaderEntries = function (header) {
    return Object.keys(header || {}).flatMap(function (sectionName) {
        return Object.keys(header[sectionName] || {}).map(function (entryName) {
            return Object.assign({ sectionName: sectionName, entryName: entryName }, header[sectionName][entryName]);
        });
    });
};

const fail = function (code, message) {
    let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
    error.code = code;
    throw error;
};

module.exports = {
    allowedSchemaNames: allowedSchemaNames.slice(),
    forbiddenRecordFields: forbiddenRecordFields.slice(),
    layerPrecedence: layerPrecedence.slice(),
    projectLayerKinds: layerPrecedence.slice(),

    validateHeader: function (header) {
        let entries = flattenHeaderEntries(header);
        if (!entries.length) fail('ERR_WASTE_DATA_CONTRIBUTION_EMPTY', 'Waste data contribution header must contain at least one import entry');
        entries.forEach(function (entry) {
            if (!entry.options || entry.options.enabled !== true) fail('ERR_WASTE_DATA_CONTRIBUTION_DISABLED', entry.entryName + ' must be explicitly enabled');
            if (entry.options.operation !== 'saveAll') fail('ERR_WASTE_DATA_CONTRIBUTION_OPERATION', entry.entryName + ' must use saveAll for idempotent code-based contribution');
            if (!allowedSchemaNames.includes(entry.options.schemaName)) fail('ERR_WASTE_DATA_CONTRIBUTION_SCHEMA', entry.entryName + ' targets unsupported Waste schema ' + entry.options.schemaName);
            if (entry.query && Object.prototype.hasOwnProperty.call(entry.query, 'tenant')) fail('ERR_WASTE_DATA_CONTRIBUTION_SCOPE', entry.entryName + ' must not scope imports by tenant');
            if (!entry.query || entry.query.code !== '$code') fail('ERR_WASTE_DATA_CONTRIBUTION_QUERY', entry.entryName + ' must use code as the idempotent contribution key');
        });
        return entries;
    },

    validateManifestSection: function (section) {
        if (!section || section.kind !== 'DATA_RELEASE') fail('ERR_WASTE_DATA_MANIFEST_KIND', 'Waste contribution section must be a DATA_RELEASE');
        if (section.destinationRole !== 'WASTE') fail('ERR_WASTE_DATA_MANIFEST_DESTINATION', 'Waste contribution section must target WASTE destination role');
        if (!['core', 'sample', 'project', 'tenant'].includes(section.dataType)) fail('ERR_WASTE_DATA_MANIFEST_TYPE', 'Waste contribution dataType is not supported');
        return section;
    },

    validateRecord: function (record, layerKind) {
        if (!record || !record.code) fail('ERR_WASTE_DATA_RECORD_CODE', 'Waste contribution records require a stable code');
        if (layerKind && !layerPrecedence.includes(layerKind)) fail('ERR_WASTE_DATA_LAYER_KIND', 'Waste contribution layer is not supported');
        forbiddenRecordFields.forEach(function (fieldName) {
            if (Object.prototype.hasOwnProperty.call(record, fieldName)) fail('ERR_WASTE_DATA_RECORD_FIELD', 'Waste contribution record must not own ' + fieldName);
        });
        return record;
    },

    resolveByCode: function (contributions) {
        let effective = {};
        (contributions || []).slice().sort(function (left, right) {
            let leftIndex = layerPrecedence.indexOf(left.layerKind);
            let rightIndex = layerPrecedence.indexOf(right.layerKind);
            return (leftIndex === -1 ? layerPrecedence.length : leftIndex) - (rightIndex === -1 ? layerPrecedence.length : rightIndex);
        }).forEach(function (contribution) {
            (contribution.records || []).forEach(function (record) {
                module.exports.validateRecord(record, contribution.layerKind);
                effective[record.code] = Object.assign({}, record, {
                    _contributionLayer: contribution.layerKind,
                    _contributionModule: contribution.moduleName
                });
            });
        });
        return effective;
    }
};
