/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderUpgradeService
 * @description Creates digest-bound local Builder release manifests and non-mutating upgrade plans from existing solution locks to approved target plans.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling may add release channels or external signatures, but must preserve digest verification, lock comparison, non-mutating planning, and explicit target approval.
 */
const catalogueService = require('./defaultApplicationBuilderCatalogueService');
const contractService = require('./defaultApplicationBuilderContractService');
const generationService = require('./defaultApplicationBuilderGenerationService');

module.exports = {
    /** Returns a JSON-safe copy of a value. */
    clone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    /** Returns the unsigned manifest payload protected by the local digest signature. */
    releasePayload: function (manifest) {
        const payload = this.clone(manifest);
        delete payload.signature;
        return payload;
    },

    /** Creates a deterministic local release manifest for an approved Builder plan. */
    createReleaseManifest: function (solution, plan, catalogue, options = {}) {
        const solutionValidation = contractService.validateDocument('solution', solution);
        const planValidation = contractService.validateDocument('plan', plan);
        const errors = solutionValidation.errors.concat(planValidation.errors);
        if (plan?.approval?.state !== 'APPROVED') {
            errors.push('Builder release manifest requires an APPROVED plan');
        }
        if (plan?.solutionDigest !== catalogueService.digest(solution)) {
            errors.push('Builder release manifest plan does not match the supplied solution');
        }
        if (plan?.catalogueDigest !== catalogue.catalogueDigest) {
            errors.push('Builder release manifest plan does not match the current catalogue');
        }
        if (plan?.approval?.approvedPlanDigest !== generationService.approvalDigest(plan)) {
            errors.push('Builder release manifest approval digest is invalid');
        }
        if (errors.length > 0) {
            throw new Error('Builder release manifest validation failed:\n- ' + errors.join('\n- '));
        }
        const createdAt = options.createdAt || new Date().toISOString();
        const manifest = {
            contractVersion: 0,
            releaseId: 'builder-release-' + generationService.approvalDigest(plan)
                .slice('sha256:'.length, 'sha256:'.length + 32),
            createdAt: createdAt,
            projectCode: solution.identity.projectCode,
            releaseChannel: options.releaseChannel || 'LOCAL_BUILDER',
            solutionDigest: catalogueService.digest(solution),
            planDigest: plan.approval.approvedPlanDigest,
            catalogueDigest: catalogue.catalogueDigest,
            builderVersion: plan.builderVersion,
            packages: plan.resolvedCapabilities.map(item => ({
                code: item.code,
                version: item.version,
                digest: item.descriptorDigest
            })).sort((left, right) => left.code.localeCompare(right.code)),
            dataPacks: (solution.data.packs || []).slice().sort(),
            qualificationProfile: solution.qualification.profile,
            artifactPolicy: {
                generatedOverwrite: 'LOCKED_HASH_MATCH_ONLY',
                customerOwnedOverwrite: 'NEVER',
                requiresQualificationAfterUpgrade: true
            }
        };
        manifest.signature = {
            algorithm: 'LOCAL_SHA256_DIGEST',
            signer: options.signer || 'nodics.local.builder',
            value: catalogueService.digest(this.releasePayload(manifest))
        };
        return manifest;
    },

    /** Verifies a local digest-bound release manifest. */
    verifyReleaseManifest: function (manifest) {
        if (!manifest?.signature?.value) {
            return { valid: false, errors: ['Builder release manifest is unsigned'] };
        }
        const expected = catalogueService.digest(this.releasePayload(manifest));
        const errors = [];
        if (manifest.signature.algorithm !== 'LOCAL_SHA256_DIGEST') {
            errors.push('Unsupported Builder release signature algorithm: ' + manifest.signature.algorithm);
        }
        if (manifest.signature.value !== expected) {
            errors.push('Builder release manifest signature digest is invalid');
        }
        return { valid: errors.length === 0, errors: errors };
    },

    /** Compares current and target package entries. */
    comparePackages: function (currentPackages, targetPackages) {
        const current = new Map((currentPackages || []).map(item => [item.code, item]));
        const target = new Map((targetPackages || []).map(item => [item.code, item]));
        const added = [];
        const removed = [];
        const changed = [];
        target.forEach((targetPackage, code) => {
            const currentPackage = current.get(code);
            if (!currentPackage) {
                added.push(code);
            } else if (currentPackage.digest !== targetPackage.digest || currentPackage.version !== targetPackage.version) {
                changed.push(code);
            }
        });
        current.forEach((currentPackage, code) => {
            if (!target.has(code)) {
                removed.push(code);
            }
        });
        return { added: added.sort(), removed: removed.sort(), changed: changed.sort() };
    },

    /** Creates a non-mutating safe upgrade plan from one lock to a target release. */
    createUpgradePlan: function (currentLock, targetManifest, targetPlan, targetSolution, catalogue, options = {}) {
        const manifestValidation = this.verifyReleaseManifest(targetManifest);
        const errors = manifestValidation.errors.slice();
        const lockValidation = contractService.validateDocument('lock', currentLock);
        const planValidation = contractService.validateDocument('plan', targetPlan);
        const solutionValidation = contractService.validateDocument('solution', targetSolution);
        errors.push(...lockValidation.errors, ...planValidation.errors, ...solutionValidation.errors);
        if (targetManifest.planDigest !== targetPlan?.approval?.approvedPlanDigest) {
            errors.push('Target release manifest does not match the supplied approved plan');
        }
        if (targetManifest.solutionDigest !== catalogueService.digest(targetSolution)) {
            errors.push('Target release manifest does not match the supplied solution');
        }
        if (targetManifest.catalogueDigest !== catalogue.catalogueDigest) {
            errors.push('Target release manifest does not match the current catalogue');
        }
        const packageDiff = this.comparePackages(currentLock.packages, targetManifest.packages);
        const currentDataPacks = new Set((currentLock.dataPacks || []).map(item => item.code));
        const targetDataPacks = new Set(targetManifest.dataPacks || []);
        const dataPackDiff = {
            added: Array.from(targetDataPacks).filter(code => !currentDataPacks.has(code)).sort(),
            removed: Array.from(currentDataPacks).filter(code => !targetDataPacks.has(code)).sort()
        };
        const changed = currentLock.solutionDigest !== targetManifest.solutionDigest ||
            currentLock.planDigest !== targetManifest.planDigest ||
            packageDiff.added.length > 0 || packageDiff.removed.length > 0 || packageDiff.changed.length > 0 ||
            dataPackDiff.added.length > 0 || dataPackDiff.removed.length > 0;
        const createdAt = options.createdAt || new Date().toISOString();
        return {
            contractVersion: 0,
            upgradePlanId: 'builder-upgrade-' + catalogueService.digest({
                from: currentLock.planDigest,
                to: targetManifest.planDigest,
                createdAt: createdAt
            }).slice('sha256:'.length, 'sha256:'.length + 32),
            createdAt: createdAt,
            state: errors.length > 0 ? 'REJECTED' : changed ? 'READY' : 'NOOP',
            mutationPerformed: false,
            current: {
                solutionDigest: currentLock.solutionDigest,
                planDigest: currentLock.planDigest,
                qualification: currentLock.qualification
            },
            target: {
                releaseId: targetManifest.releaseId,
                solutionDigest: targetManifest.solutionDigest,
                planDigest: targetManifest.planDigest,
                releaseChannel: targetManifest.releaseChannel
            },
            diff: {
                packages: packageDiff,
                dataPacks: dataPackDiff
            },
            operations: errors.length > 0 || !changed ? [] : [
                { sequence: 1, operation: 'VERIFY_CURRENT_LOCK', precondition: 'LOCKED_HASH_MATCH' },
                { sequence: 2, operation: 'BACKUP_CURRENT_GENERATED_ARTIFACTS', precondition: 'DIRECTORY_EXISTS' },
                { sequence: 3, operation: 'APPLY_APPROVED_GENERATED_ARTIFACTS', precondition: 'GENERATED_REGION_MATCH' },
                { sequence: 4, operation: 'RUN_BUILDER_QUALIFICATION', precondition: 'DIRECTORY_EXISTS' }
            ],
            errors: Array.from(new Set(errors)).sort(),
            notes: [
                'Upgrade planning is non-mutating.',
                'Customer-owned files must never be overwritten by Builder upgrade.',
                'External production release signing can replace LOCAL_SHA256_DIGEST when release authority exists.'
            ]
        };
    }
};
