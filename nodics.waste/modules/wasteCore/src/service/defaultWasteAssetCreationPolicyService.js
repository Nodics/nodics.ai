/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const UTILS = require('../utils/utils');

/** @module wasteCore/src/service/defaultWasteAssetCreationPolicyService @description Evaluates when an approved Waste submission may become a reusable customer-owned asset. @layer service @owner wasteCore @override Partner accelerators may provide policy records without moving wallet, commerce, coupon, or media ownership into Waste. */
module.exports = {
    /** Initializes this service. */
    init: function () { return Promise.resolve(true); },

    /** Completes this service startup. */
    postInit: function () { return Promise.resolve(true); },

    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Returns the default framework asset creation policy. */
    defaultPolicy: function () {
        return {
            code: 'WASTE_APPROVED_SUBMISSION_ASSET',
            sourceStatusRequired: 'APPROVED',
            requiresEvidence: true,
            requiresReceipt: false,
            requiresImpactResult: false,
            duplicateStrategy: 'RETURN_EXISTING',
            assetCodeStrategy: 'SOURCE_SUBMISSION',
            assetCodePrefix: 'WASTE_ASSET',
            initialCustodyStatus: 'CUSTOMER_HELD',
            initialAssetStatus: 'OWNED',
            settlementReferenceFailureMode: 'STOP_CREATION'
        };
    },

    /** Normalizes optional arrays. */
    array: function (value) {
        if (value === undefined || value === null) return [];
        return Array.isArray(value) ? value : [value];
    },

    /** Returns a single effective policy record. */
    resolve: function (request) {
        request = request || {};
        return Object.assign({}, this.defaultPolicy(), request.policy || {});
    },

    /** Returns true when the request already has an asset for this source submission. */
    hasExistingAsset: function (request) {
        request = request || {};
        let submission = request.submission || {};
        if (request.existingAsset) return true;
        return this.array(request.existingAssets).some(function (asset) {
            return asset && asset.sourceSubmissionCode === submission.code;
        });
    },

    /** Finds an existing asset for idempotent duplicate handling. */
    existingAsset: function (request) {
        request = request || {};
        let submission = request.submission || {};
        if (request.existingAsset) return request.existingAsset;
        return this.array(request.existingAssets).find(function (asset) {
            return asset && asset.sourceSubmissionCode === submission.code;
        });
    },

    /** Evaluates whether a submission satisfies the configured asset creation gate. */
    evaluate: function (request) {
        request = request || {};
        let policy = this.resolve(request);
        let submission = request.submission || {};
        let verification = request.verification || {};
        let missingRequirements = [];
        if (!submission.code) missingRequirements.push('submission.code');
        if (UTILS.normalizeCode(submission.submissionStatus) !== UTILS.normalizeCode(policy.sourceStatusRequired)) {
            missingRequirements.push('submissionStatus:' + policy.sourceStatusRequired);
        }
        if (policy.verificationStatusRequired && UTILS.normalizeCode(verification.verificationStatus) !== UTILS.normalizeCode(policy.verificationStatusRequired)) {
            missingRequirements.push('verificationStatus:' + policy.verificationStatusRequired);
        }
        if (policy.requiresEvidence && !this.array(request.evidenceRefs || submission.evidenceRefs).length) {
            missingRequirements.push('evidenceRefs');
        }
        if (policy.requiresReceipt && !(request.receiptRef || submission.receiptRef)) {
            missingRequirements.push('receiptRef');
        }
        if (policy.requiresImpactResult && !(request.impactRef || submission.impactRef)) {
            missingRequirements.push('impactRef');
        }
        if (this.hasExistingAsset(request) && policy.duplicateStrategy === 'FAIL') {
            missingRequirements.push('duplicateAsset');
        }
        return {
            eligible: missingRequirements.length === 0 || (missingRequirements.length === 1 && missingRequirements[0] === 'duplicateAsset' && policy.duplicateStrategy === 'RETURN_EXISTING'),
            reasonCode: missingRequirements.length ? 'WASTE_ASSET_CREATION_REQUIREMENTS_MISSING' : 'WASTE_ASSET_CREATION_ALLOWED',
            policyCode: policy.code,
            policy: policy,
            missingRequirements: missingRequirements,
            existingAsset: this.existingAsset(request)
        };
    },

    /** Requires the submission to pass the configured asset creation gate. */
    assertEligible: function (request) {
        let evaluation = this.evaluate(request);
        if (evaluation.existingAsset && evaluation.policy.duplicateStrategy === 'RETURN_EXISTING') return evaluation;
        if (!evaluation.eligible) {
            this.fail('ERR_WASTE_ASSET_CREATION_NOT_ALLOWED', evaluation.missingRequirements.join(', ') || 'asset creation is not allowed');
        }
        return evaluation;
    }
};
