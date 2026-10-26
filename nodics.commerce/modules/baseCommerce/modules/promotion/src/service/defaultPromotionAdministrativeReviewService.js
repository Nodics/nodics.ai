/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
/** @module promotion/service/defaultPromotionAdministrativeReviewService
 * @description Native Platform review proof for an explicit same-tenant issuer, without identity or ownership substitution.
 * @layer service @owner promotion
 * @override Preserve original bearer, fresh native Profile proof, exact target, and revalidation before persistence.
 */
module.exports = {
    /** Refuses unknown native authority without exposing identity evidence. */
    fail: function () { throw new CLASSES.NodicsError("ERR_PROMOTION_DRAFT_UNCONFIRMED"); },
    /** Uses the original bearer against the configured Profile owner, never the target issuer's context. */
    profile: async function (request, policy, path, body) {
        const target = policy.identityTarget;
        return SERVICE.DefaultCouponSellerAuthorizationService.profileResult(await SERVICE.DefaultModuleService.invokeModule({
            local: false, ...target, apiName: path, methodName: "POST", requestBody: body,
            tenant: request.authData.tenant, request: { tenant: request.authData.tenant },
            header: { Authorization: request.authorization, "X-Enterprise-Code": request.authData.entCode },
            timeoutMs: policy.timeoutMs, maxAttempts: 1,
        }));
    },
    /** Pins source identity and explicit target; revalidation never alters the request's signed aliases. */
    context: async function (request, approving = false, discovery = false, operation) {
        const draft = SERVICE.DefaultPromotionDraftService, workbench = SERVICE.DefaultPromotionBusinessWorkbenchService;
        const operations = { read: 'commerce.promotion.read', create: 'commerce.promotion.draft.write',
            update: 'commerce.promotion.draft.write', submit: 'commerce.promotion.manage', schedule: 'commerce.promotion.manage' };
        if (operation !== undefined && (!Object.hasOwn(operations, operation) || approving || discovery)) this.fail();
        const original = workbench.context(request), auth = structuredClone(request.authData);
        const input = structuredClone(draft.object(request.httpRequest?.body ?? request.payload ?? {}, operation
            ? ['issuerEnterpriseCode', 'command'] : discovery ? [] : approving
            ? ["issuerEnterpriseCode", "expectedVersionId", "expectedRevision", "reasonCode"] : ["issuerEnterpriseCode"]));
        const issuer = discovery ? original.enterpriseCode : draft.code(input.issuerEnterpriseCode);
        const code = discovery || operation ? undefined : draft.code(request.promotionCode);
        if (operation && request.promotionCode !== undefined) this.fail();
        const permissions = [operation ? operations[operation] : 'commerce.promotion.approve'];
        if (operation) {
            draft.object(input.command, operation === 'create' ? Object.keys(input.command || {}) : operation === 'read' ? ['code'] :
                operation === 'update' ? ['query', 'model', 'options'] : ['code', 'expectedVersionId', 'expectedRevision', 'reasonCode']);
            if (operation === 'create' && input.command.couponOffer) permissions.push('commerce.promotion.manage');
        }
        const policy = structuredClone(CONFIG.get("promotion")?.administrativeReview);
        const authorization = request.authorization;
        const headers = () => [request.headers, request.header, request.httpRequest?.headers].map(h => typeof h === "object" && h !== null ? h : {});
        const headerPin = structuredClone(headers());
        const bound = () => {
            if (!isDeepStrictEqual(workbench.context(request), original) || !isDeepStrictEqual(request.authData, auth) ||
                request.payload !== undefined && !isDeepStrictEqual(request.payload, input) || request.promotionCode !== code ||
                !isDeepStrictEqual(headers(), headerPin) || request.authorization !== authorization ||
                typeof authorization !== "string" || !/^Bearer \S+$/i.test(authorization) ||
                request.tenant !== auth.tenant || auth.authenticationMethod !== "PASSWORD" ||
                auth.sessionContext !== undefined || auth.externalIdentityLinkCode !== undefined ||
                !Number.isSafeInteger(auth.authVersion) || auth.authVersion < 1 || !auth.loginId || original.actorId !== auth.loginId ||
                !isDeepStrictEqual(CONFIG.get("promotion")?.administrativeReview, policy) ||
                [request.query, request.httpRequest?.query].some(v => v && Object.keys(v).length) ||
                [request.body, request.httpRequest?.body].some(v => v !== undefined && !isDeepStrictEqual(v, input)) ||
                headerPin.some(h => Object.entries(h).some(([k,v]) => k.toLowerCase() === "authorization" && v !== authorization ||
                    k.toLowerCase() === "x-enterprise-code" && v !== auth.entCode || k.toLowerCase() === "x-tenant-code" && v !== auth.tenant))) this.fail();
        };
        if (!policy || policy.identityTarget?.moduleName !== "profile" || !policy.identityTarget.connectionName ||
            policy.identityTarget.targetAuthority?.runtimeRole !== "PLATFORM" || !/^v\d+$/.test(policy.identityTarget.apiVersion) ||
            !Number.isSafeInteger(policy.timeoutMs) || policy.timeoutMs < 1 || policy.timeoutMs > 60000 ||
            [policy.evidencePath, policy.recipientPath].some(p => typeof p !== "string" || !/^\/[A-Za-z0-9/_-]+$/.test(p))) this.fail();
        const revalidate = async () => {
            bound();
            for (const permission of permissions) {
                const nonce = crypto.randomUUID();
                const proof = await this.profile(request, policy, policy.evidencePath, { nonce, permission });
                bound();
                if (proof?.contractVersion !== 1 || proof.nonce !== nonce || proof.permission !== permission ||
                    proof.tenant !== original.tenant || proof.enterpriseCode !== auth.entCode || proof.actorCode !== auth.loginId ||
                    proof.authVersion !== auth.authVersion || proof.principalType !== "human" || proof.platformAdministrator !== true) this.fail();
            }
            const target = await this.profile(request, policy, policy.recipientPath, { ownerType: "ENTERPRISE", ownerCode: issuer });
            bound();
            if (target?.contractVersion !== 1 || target.tenant !== original.tenant ||
                target.recipient?.ownerType !== "ENTERPRISE" || target.recipient.ownerCode !== issuer) this.fail();
        };
        await revalidate();
        return { input, code, operation, authoring: operation !== undefined, revalidate, scope: () => { bound(); return { ...original, enterpriseCode: issuer }; },
            audit: { actorCode: original.actorId, actorEnterpriseCode: original.enterpriseCode, issuerEnterpriseCode: issuer,
                tenant: original.tenant, permission: permissions[0], ...(operation ? { operation, permissions: [...permissions] } : {}), authVersion: auth.authVersion } };
    },
    /** Offers explicit target review only after fresh native proof and qualified Staged storage. */
    capabilities: async function (request) {
        const context = await this.context(request, false, true);
        SERVICE.DefaultPromotionDraftService.storage(context.scope());
        const labels = SERVICE.DefaultPromotionBackofficeCapabilityService.couponOfferPresentationData()?.labels;
        const keys = ['administrativeReview', 'issuerEnterpriseCode', 'reviewOffer', 'approve', 'reasonCode', 'confirmApproval'];
        if (!labels || keys.some(k => typeof labels[k] !== 'string' || !labels[k] || labels[k].length > 512)) this.fail();
        return { contractVersion: 1, crossEnterpriseReview: true,
            labels: Object.fromEntries(keys.map(k => [k, labels[k]])),
            review: { method: 'POST', route: '/promotions/:promotionCode/administrative-review', targetField: 'issuerEnterpriseCode' } };
    },
};
