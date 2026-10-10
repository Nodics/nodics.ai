/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module promotion/service/defaultPromotionSetupContributionService
 * @description Processes immutable, explicitly selected nImport setup instructions
 * through Promotion owners. No payload executes as code and no operational snapshot is imported.
 * @layer service
 * @owner promotion
 * @override Later layers may narrow bounds and eligibility via exported members;
 * retain the fixed nImport reader, provenance, private writes and security gates.
 */
module.exports = {
    /** Resolves trusted transport pacing, never caller-selected delays or authority. @returns {Object} Bounded delays before fresh batch admission. */
    batchPacing: function () {
        const configured = CONFIG.get('promotion')?.setupPacing;
        if (configured !== undefined && (!configured || typeof configured !== 'object' || Array.isArray(configured)))
            throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        const pacing = { preflightDelayMs: configured?.preflightDelayMs ?? 0, issuanceDelayMs: configured?.issuanceDelayMs ?? 0 };
        if (Object.values(pacing).some(value => !Number.isSafeInteger(value) || value < 0 || value > 10000))
            throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        return pacing;
    },
    /** Waits outside transactions before fresh admission; no scope, consent or persistence check is cached. @param {number} milliseconds Trusted bounded delay. @returns {Promise<void>} Batch may begin its normal checks. */
    waitBeforeBatch: function (milliseconds) {
        return milliseconds === 0 ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, milliseconds));
    },
    /** Snapshots mutable caller scope and descriptor before asynchronous qualification. @param {Object} request Installer context. @returns {Object} Detached security and provenance context. */
    snapshot: function (request) {
        const header = request.httpRequest?.headers?.authorization, original = request.authorization;
        const bearer = value => typeof value === 'string' && /^Bearer [^\s\u0000-\u001f\u007f]{1,16384}$/i.test(value);
        if (header !== undefined && !bearer(header) || original !== undefined && !bearer(original) ||
            header !== undefined && original !== undefined && header !== original)
            throw new CLASSES.NodicsError('ERR_PROMOTION_SELLER_UNCONFIRMED');
        // nImport retains the original HTTP request; seller issuance consumes a detached bearer field.
        return { ...request, authorization: header === undefined ? original : header,
            authData: structuredClone(request.authData || {}), contribution: structuredClone(request.contribution) };
    },
    /** Projects bounded immutable provenance, excluding descriptor fields and any caller authority. @param {Object} contribution Qualified descriptor or explicit original receipt reference. @returns {Object} Detached four-field identity. */
    contributionIdentity: function (contribution) {
        if (!contribution || typeof contribution !== 'object' || Array.isArray(contribution) ||
            typeof contribution.moduleName !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(contribution.moduleName) ||
            typeof contribution.releaseCode !== 'string' ||
            !/^[A-Za-z][A-Za-z0-9._-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(contribution.releaseCode) ||
            typeof contribution.version !== 'string' || contribution.version.length > 128 ||
            !/^\d+\.\d+\.\d+$/.test(contribution.version) ||
            typeof contribution.checksum !== 'string' || !/^[a-f0-9]{64}$/.test(contribution.checksum))
            throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        return Object.fromEntries(['moduleName', 'releaseCode', 'version', 'checksum'].map(key => [key, contribution[key]]));
    },
    /** Requalifies the exact immutable JSON release via nImport before reading instructions. @param {Object} request Qualified contribution and signed operator. @returns {Promise<Object>} Detached validated payload. */
    payload: async function (request) {
        const contribution = request.contribution;
        if (!contribution || contribution.installer !== 'PROMOTION_CAMPAIGN_ISSUANCE' ||
            contribution.dataType !== 'sample' || contribution.selectionPolicy !== 'EXPLICIT' ||
            contribution.destinationRole !== 'COMMERCE' || contribution.lifecycle !== 'OPERATIONAL_VERSIONED' ||
            typeof SERVICE.DefaultDataReleaseService?.readContributionPayload !== 'function')
            throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        const payload = await SERVICE.DefaultDataReleaseService.readContributionPayload(
            contribution, 'PROMOTION_CAMPAIGN_ISSUANCE', 'promotionSetup.json');
        const maximum = CONFIG.get('promotion')?.budgetAdmission?.maximumCampaignsPerContribution;
        if (!payload || Object.keys(payload).sort().join(',') !== 'campaigns,couponBatches' ||
            !Number.isSafeInteger(maximum) || maximum < 1 || maximum > 50 ||
            !Array.isArray(payload.campaigns) || !payload.campaigns.length || payload.campaigns.length > maximum ||
            !Array.isArray(payload.couponBatches) || payload.couponBatches.length > 50 ||
            new Set(payload.campaigns.map(item => item?.promotionCode)).size !== payload.campaigns.length)
            throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(value);
        for (const campaign of payload.campaigns) {
            this.campaignRequest(request, campaign);
            if (!['promotionCode', 'storeCode', 'rootCode', 'commandReference'].every(key => identifier(campaign[key])) ||
                !/^[a-f0-9]{64}$/.test(campaign.policyFingerprint || ''))
                throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        }
        const campaignCodes = new Set(payload.campaigns.map(item => item.promotionCode));
        const batchCodes = new Set(), commands = new Set();
        for (const intent of payload.couponBatches) {
            if (!intent || typeof intent !== 'object' || Array.isArray(intent) ||
                Object.keys(intent).sort().join(',') !== 'batchCode,commandReference,promotionCode,quantity' ||
                !['promotionCode', 'batchCode', 'commandReference'].every(key => identifier(intent[key])) ||
                !Number.isSafeInteger(intent.quantity) || intent.quantity < 1 || intent.quantity > 1000 ||
                !campaignCodes.has(intent.promotionCode) || batchCodes.has(intent.batchCode) || commands.has(intent.commandReference))
                throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
            batchCodes.add(intent.batchCode); commands.add(intent.commandReference);
        }
        return payload;
    },
    /** Builds fixed owner input from detached instruction and qualified immutable provenance. @param {Object} request Signed context. @param {Object} instruction Pack instruction. @returns {Object} Budget admission input. */
    campaignRequest: function (request, instruction) {
        if (!instruction || typeof instruction !== 'object' || Array.isArray(instruction) ||
            !['commandReference,policyFingerprint,promotionCode,rootCode,storeCode',
                'admissionContribution,commandReference,policyFingerprint,promotionCode,rootCode,storeCode']
                .includes(Object.keys(instruction).sort().join(',')))
            throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        const { promotionCode, admissionContribution, ...payload } = instruction;
        const currentContribution = this.contributionIdentity(request.contribution);
        if (Object.hasOwn(instruction, 'admissionContribution') &&
            (!admissionContribution || typeof admissionContribution !== 'object' || Array.isArray(admissionContribution) ||
                Object.keys(admissionContribution).sort().join(',') !== 'checksum,moduleName,releaseCode,version'))
            throw new CLASSES.NodicsError('ERR_PROMOTION_SETUP_INVALID');
        return { ...request, promotionCode, payload, query: {}, storeCode: payload.storeCode,
            setupContribution: admissionContribution ? this.contributionIdentity(admissionContribution) : currentContribution };
    },
    /** Verifies a pinned campaign; an explicit original admission reference is replay-only, never opening-budget authority. @param {Object} request Signed installer context. @param {Object} instruction Immutable campaign intent. @returns {Promise<Object>} Current admission or first-use plan. */
    prepareCampaign: async function (request, instruction) {
        const prepared = await SERVICE.DefaultPromotionBudgetAdmissionService.prepare(this.campaignRequest(request, instruction));
        if (Object.hasOwn(instruction, 'admissionContribution') && !prepared.current)
            throw new CLASSES.NodicsError('ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED');
        return prepared;
    },
    /** Plans every campaign without writes; unsupported secure issuance blocks the whole contribution. @param {Object} request Qualified immutable contribution. @returns {Promise<Object>} Read-only readiness and pinned plan. */
    preflightContribution: async function (request) {
        request = this.snapshot(request);
        const pacing = this.batchPacing();
        const payload = await this.payload(request);
        if (payload.couponBatches.length && !SERVICE.DefaultCouponSecureIssuanceService?.prepare) return { ready: false,
            blocker: { code: 'ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED', message: 'Generated coupon issuance requires a qualified private token retention owner' } };
        const campaigns = [];
        for (const instruction of payload.campaigns) {
            const prepared = await this.prepareCampaign(request, instruction);
            campaigns.push({ promotionCode: instruction.promotionCode, action: prepared.current ? 'CURRENT' : 'INITIALIZE',
                policyFingerprint: instruction.policyFingerprint });
        }
        const couponBatches = [];
        for (const intent of payload.couponBatches) {
            await this.waitBeforeBatch(pacing.preflightDelayMs);
            try {
                const prepared = await SERVICE.DefaultCouponSecureIssuanceService.prepare(request, intent,
                    payload.campaigns.find(campaign => campaign.promotionCode === intent.promotionCode));
                couponBatches.push({ batchCode: intent.batchCode, quantity: intent.quantity, action: prepared.original ? 'CURRENT' : 'ISSUE' });
            } catch (error) {
                if (error.code !== 'ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED') throw error;
                return { ready: false, blocker: { code: 'ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED',
                    message: 'Generated coupon issuance requires a qualified private token retention owner' } };
            }
        }
        return { ready: true, plan: { releaseCode: request.contribution.releaseCode, campaigns, couponBatches } };
    },
    /** Rechecks all immutable bytes and campaign admissions before owner mutation, then rechecks each insert. @param {Object} request nImport install request. @returns {Promise<Object>} Verified owner receipts, not publication or coupon sales. */
    installContribution: async function (request) {
        request = this.snapshot(request);
        const pacing = this.batchPacing();
        const preflight = await this.preflightContribution(request);
        if (!preflight.ready) throw new CLASSES.NodicsError(preflight.blocker.code);
        const payload = await this.payload(request), campaigns = [], couponBatches = [];
        for (const instruction of payload.campaigns) {
            if (Object.hasOwn(instruction, 'admissionContribution')) {
                const prepared = await this.prepareCampaign(request, instruction);
                campaigns.push({ ...prepared.current, replayed: true });
            } else campaigns.push(await SERVICE.DefaultPromotionBudgetAdmissionService.initialize(this.campaignRequest(request, instruction)));
        }
        for (const intent of payload.couponBatches) {
            await this.waitBeforeBatch(pacing.issuanceDelayMs);
            couponBatches.push(await SERVICE.DefaultCouponSecureIssuanceService.issue(request, intent,
                payload.campaigns.find(campaign => campaign.promotionCode === intent.promotionCode)));
        }
        return { code: 'SUC_PROMOTION_SETUP_00001', data: { releaseCode: request.contribution.releaseCode,
            checksum: request.contribution.checksum, campaigns, couponBatches } };
    },
};
