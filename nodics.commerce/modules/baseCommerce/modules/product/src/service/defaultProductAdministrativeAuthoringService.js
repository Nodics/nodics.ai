/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
/** @module product/service/defaultProductAdministrativeAuthoringService
 * @description Exact same-tenant Product targets under fresh native Profile proof, without changing signed identity.
 * @layer service @owner product @override Preserve original credentials, native proof, bounded targets and prewrite revalidation.
 */
module.exports = {
    /** Rejects unavailable native or target authority. */
    fail: function () {
        throw new CLASSES.NodicsError('ERR_PRODUCT_AUTHORING_SCOPE');
    },
    /** Unwraps only affirmative bounded owner envelopes. */
    unwrap: function (value) {
        for (let i = 0; i < 8; i++) {
            if (
                !value ||
                typeof value !== 'object' ||
                value.error ||
                value.success === false ||
                value.acknowledged === false ||
                (value.code !== undefined && !/^SUC_/.test(value.code)) ||
                (value.errors !== undefined && (!Array.isArray(value.errors) || value.errors.length))
            )
                this.fail();
            if (value.data === undefined && value.result === undefined) return value;
            if (value.data !== undefined && value.result !== undefined) this.fail();
            value = value.data ?? value.result;
        }
        this.fail();
    },
    /** Calls Profile using the original native human bearer and Platform enterprise, not the business target. */
    profile: async function (request, policy, route, body) {
        return this.unwrap(
            await SERVICE.DefaultModuleService.invokeModule({
                local: false,
                ...policy.identityTarget,
                apiName: route,
                methodName: 'POST',
                requestBody: body,
                tenant: request.authData.tenant,
                request: { tenant: request.authData.tenant },
                header: { Authorization: request.authorization, 'X-Enterprise-Code': request.authData.entCode },
                timeoutMs: policy.timeoutMs,
                maxAttempts: 1,
            }),
        );
    },
    /** Creates a request-bound proof context. No body or role-name flag can mint it. */
    context: async function (request, operation) {
        const owner = SERVICE.DefaultProductBusinessAuthoringService;
        const permissions = {
            capabilities: 'readPermission',
            search: 'readPermission',
            read: 'readPermission',
            graphRead: 'readPermission',
            create: 'writePermission',
            update: 'writePermission',
            graphCreate: 'writePermission',
            graphContinue: 'writePermission',
            archive: 'archivePermission',
        };
        if (!permissions[operation]) this.fail();
        const policy = structuredClone(CONFIG.get('product')?.administrativeAuthoring);
        const permissionPolicy = structuredClone(owner.policy());
        const permission = permissionPolicy[permissions[operation]],
            auth = structuredClone(request.authData || {});
        const raw = owner.object(
            request.httpRequest?.body ?? request.payload,
            operation === 'capabilities' ? ['targetEnterpriseCode'] : ['targetEnterpriseCode', 'command'],
        );
        SERVICE.DefaultProductAdministrativeCatalogueService.bounded(raw, policy);
        const input = structuredClone(raw);
        const target = owner.code(input.targetEnterpriseCode),
            authorization = request.authorization;
        const headers = () =>
            [request.headers, request.header, request.httpRequest?.headers].map((h) =>
                h && typeof h === 'object' ? h : {},
            );
        const headerPin = structuredClone(headers());
        const bound = () => {
            if (
                !isDeepStrictEqual(auth, request.authData) ||
                request.tenant !== auth.tenant ||
                !auth.tenant ||
                !auth.entCode ||
                !auth.loginId ||
                auth.principalType !== 'human' ||
                auth.tokenType !== 'access' ||
                auth.authenticationMethod !== 'PASSWORD' ||
                auth.isSystem ||
                auth.runtimeScope !== undefined ||
                auth.sessionContext !== undefined ||
                auth.externalIdentityLinkCode !== undefined ||
                !Number.isSafeInteger(auth.authVersion) ||
                auth.authVersion < 1 ||
                [auth.principalId, auth.userId, request.actorId].some((x) => x !== undefined && x !== auth.loginId) ||
                [auth.tenantCode, request.tenantCode].some((x) => x !== undefined && x !== auth.tenant) ||
                [auth.enterpriseCode, request.enterpriseCode, request.entCode].some(
                    (x) => x !== undefined && x !== auth.entCode,
                ) ||
                request.authorization !== authorization ||
                typeof authorization !== 'string' ||
                !/^Bearer \S+$/i.test(authorization) ||
                !isDeepStrictEqual(headers(), headerPin) ||
                [request.payload, request.body, request.httpRequest?.body].some(
                    (x) => x !== undefined && !isDeepStrictEqual(x, input),
                ) ||
                [request.query, request.httpRequest?.query].some((x) => x && Object.keys(x).length) ||
                !isDeepStrictEqual(CONFIG.get('product')?.administrativeAuthoring, policy) ||
                !isDeepStrictEqual(owner.policy(), permissionPolicy) ||
                headerPin.some((h) =>
                    Object.entries(h).some(
                        ([k, v]) =>
                            (k.toLowerCase() === 'authorization' && v !== authorization) ||
                            (k.toLowerCase() === 'x-enterprise-code' && v !== auth.entCode) ||
                            (k.toLowerCase() === 'x-tenant-code' && v !== auth.tenant),
                    ),
                )
            )
                this.fail();
        };
        if (
            !policy ||
            typeof permission !== 'string' ||
            !permission ||
            policy.identityTarget?.moduleName !== 'profile' ||
            !policy.identityTarget.connectionName ||
            policy.identityTarget.targetAuthority?.runtimeRole !== 'PLATFORM' ||
            !/^v\d+$/.test(policy.identityTarget.apiVersion) ||
            !Number.isSafeInteger(policy.timeoutMs) ||
            policy.timeoutMs < 1 ||
            policy.timeoutMs > 60000 ||
            [policy.evidencePath, policy.recipientPath].some(
                (p) => typeof p !== 'string' || !/^\/[A-Za-z0-9/_-]+$/.test(p),
            )
        )
            this.fail();
        const provePermission = async (key = permissions[operation]) => {
            if (!['readPermission', 'writePermission', 'archivePermission'].includes(key)) this.fail();
            const selectedPermission = permissionPolicy[key];
            if (typeof selectedPermission !== 'string' || !selectedPermission) this.fail();
            bound();
            const nonce = crypto.randomUUID();
            const proof = await this.profile(request, policy, policy.evidencePath, {
                nonce,
                permission: selectedPermission,
            });
            bound();
            if (
                proof?.contractVersion !== 1 ||
                proof.nonce !== nonce ||
                proof.permission !== selectedPermission ||
                proof.tenant !== auth.tenant ||
                proof.enterpriseCode !== auth.entCode ||
                proof.actorCode !== auth.loginId ||
                proof.authVersion !== auth.authVersion ||
                proof.principalType !== 'human' ||
                proof.platformAdministrator !== true
            )
                this.fail();
        };
        const revalidate = async () => {
            await provePermission();
            const selected = await this.profile(request, policy, policy.recipientPath, {
                ownerType: 'ENTERPRISE',
                ownerCode: target,
            });
            bound();
            if (
                selected?.contractVersion !== 1 ||
                selected.tenant !== auth.tenant ||
                selected.recipient?.ownerType !== 'ENTERPRISE' ||
                selected.recipient.ownerCode !== target
            )
                this.fail();
        };
        await revalidate();
        return {
            input,
            policy,
            revalidate,
            provePermission,
            bound,
            operation,
            scope: () => {
                bound();
                return { tenant: auth.tenant, enterpriseCode: target, principal: auth.loginId };
            },
            audit: {
                tenant: auth.tenant,
                actorCode: auth.loginId,
                actorEnterpriseCode: auth.entCode,
                targetEnterpriseCode: target,
                permission,
                authVersion: auth.authVersion,
            },
        };
    },
};
