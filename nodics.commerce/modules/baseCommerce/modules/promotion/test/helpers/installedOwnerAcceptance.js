/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/helpers/installedOwnerAcceptance
 * @description Opt-in acceptance entrypoint for an already booted LOCAL owner runtime and its genuine signed installer context. Replays only existing immutable issuance; never selects policy, grants, keys, first-use setup or replacement stock.
 * @layer test @owner promotion
 * @sideEffects Original owner replay only. No configuration writes, generic business seeds, provider replacement or credential acquisition.
 */
const crypto = require('node:crypto');
const { serialize } = require('node:v8');
const fingerprint = value => crypto.createHash('sha256').update(serialize(value)).digest('hex');

/** Refuses with a fixed message, never private owner values or assertion diffs. */
function requireEvidence(condition, message) {
    if (!condition) throw new Error('Native owner acceptance: ' + message);
}

/** Confirms opt-in, actual selected runtime and live loopback provider topology before owner work. */
async function assertNativeLocal(tenant, moduleName, schemaNames) {
    requireEvidence(process.env.NODICS_COMMERCE_INSTALLED_ACCEPTANCE === '1', 'explicit opt-in required');
    requireEvidence(typeof CONFIG !== 'undefined' && typeof NODICS !== 'undefined' && typeof SERVICE !== 'undefined', 'booted owner runtime required');
    const role = CONFIG.get('runtimeRole');
    requireEvidence((typeof role === 'string' ? role : role?.code) === 'COMMERCE' && CONFIG.get('environment')?.class === 'LOCAL', 'LOCAL COMMERCE runtime required');
    requireEvidence(typeof NODICS.getServerState === 'function' && ['ready', 'started'].includes(String(NODICS.getServerState()).toLowerCase()), 'ready runtime required');
    requireEvidence(typeof tenant === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(tenant), 'exact tenant required');
    const models = NODICS.getModels(moduleName, tenant) || {};
    const connections = new Set();
    for (const name of schemaNames) {
        const model = models[UTILS.createModelName(name)];
        requireEvidence(model?.moduleName === moduleName && model.schemaName === name && model.versioned === false &&
            typeof model.compareAndSetItem === 'function', 'actual unversioned generated owner required');
        const database = model.dataBase;
        requireEvidence(/^mongodb:\/\/127\.0\.0\.1:\d+\/?(?:\?replicaSet=[A-Za-z0-9._-]+)?$/.test(database?.getRUI?.() || ''), 'credential-free loopback database required');
        if (!connections.has(database)) {
            const hello = await database.getConnection().command({ hello: 1 });
            requireEvidence(hello.isWritablePrimary === true && typeof hello.setName === 'string' &&
                Array.isArray(hello.hosts) && hello.hosts.length > 0 && hello.hosts.every(host => /^127\.0\.0\.1:\d+$/.test(host)) &&
                !hello.passives?.length && !hello.arbiters?.length, 'writable loopback replica set required');
            connections.add(database);
        }
    }
    return models;
}

/** Requires the actual module resolver's selected endpoint to be loopback; never changes routing or installs a transport double. */
async function assertLocalTarget(options) {
    const owner = await SERVICE.DefaultModuleService.resolveRuntimeOwner(options);
    const endpoint = owner?.endpoint || SERVICE.DefaultModuleService.buildRequest({ ...options, apiName: options.apiName || '/identity/scopes/me' }).uri;
    let url;
    try { url = new URL(endpoint); } catch (_) { requireEvidence(false, 'native target endpoint unavailable'); }
    requireEvidence(['http:', 'https:'].includes(url.protocol) && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) &&
        !url.username && !url.password, 'native loopback owner target required');
}

/** Verifies existing real encrypted stock and original immutable setup with fresh Profile authority and zero replenishment. */
async function replayContribution(request) {
    await assertNativeLocal(request?.tenant, 'promotion', ['promotion', 'coupon', 'couponBatch']);
    requireEvidence(request.authData?.principalType === 'human' && request.authData.tokenType === 'access' &&
        /^Bearer [^\s]{1,16384}$/i.test(request.authorization || ''), 'original signed human installer context required');
    await assertLocalTarget({ moduleName: 'profile', connectionName: 'profile', tenant: request.tenant,
        targetAuthority: { runtimeRole: 'PLATFORM' } });
    const setup = SERVICE.DefaultPromotionSetupContributionService, secure = SERVICE.DefaultCouponSecureIssuanceService;
    requireEvidence(setup?.payload && setup.preflightContribution && setup.installContribution && secure?.prepare && secure.persistence && secure.privateOperation,
        'installed setup and private issuance owners required');
    return secure.privateOperation(request, async () => {
    await secure.persistence({ tenant: request.tenant });
    const payload = await setup.payload(request);
    requireEvidence(payload.couponBatches.length > 0, 'original immutable issuance selection required');
    const plan = await setup.preflightContribution(request);
    requireEvidence(plan.ready === true && plan.plan.campaigns.every(item => item.action === 'CURRENT') &&
        plan.plan.couponBatches.every(item => item.action === 'CURRENT'), 'only existing admitted campaigns and encrypted batches may replay');
    const original = [];
    for (const intent of payload.couponBatches) {
        const campaign = payload.campaigns.find(value => value.promotionCode === intent.promotionCode);
        const prepared = await secure.prepare(request, intent, campaign);
        requireEvidence(!!prepared.original, 'original private receipt required');
        // prepare authenticates every original ciphertext, grant and scope; retain only a digest outside that owner call.
        const rows = await secure.read('DefaultCouponService', prepared.r, { tenant: request.tenant, batchCode: intent.batchCode }, intent.quantity);
        original.push({ batchCode: intent.batchCode, quantity: intent.quantity,
            digest: fingerprint({ batch: prepared.original, rows: rows.sort((a, b) => a.code.localeCompare(b.code)) }) });
    }
    const results = await Promise.all([
        setup.installContribution(request), setup.installContribution(request),
    ]);
    requireEvidence(results.every(value => value.code === 'SUC_PROMOTION_SETUP_00001' &&
        value.data.couponBatches.every(batch => batch.replayed === true)), 'exact concurrent replay unconfirmed');
    for (const intent of payload.couponBatches) {
        const campaign = payload.campaigns.find(value => value.promotionCode === intent.promotionCode);
        const prepared = await secure.prepare(request, intent, campaign);
        const rows = await secure.read('DefaultCouponService', prepared.r, { tenant: request.tenant, batchCode: intent.batchCode }, intent.quantity);
        const saved = original.find(value => value.batchCode === intent.batchCode);
        requireEvidence(saved.digest === fingerprint({ batch: prepared.original, rows: rows.sort((a, b) => a.code.localeCompare(b.code)) }),
            'original stock/provenance/lifecycle changed during replay');
        const generic = await SERVICE.DefaultCouponService.get({ tenant: request.tenant, authData: request.authData,
            query: { tenant: request.tenant, batchCode: intent.batchCode }, options: { recursive: false, skipItemCache: true },
            searchOptions: { pageSize: intent.quantity + 1, limit: intent.quantity + 1 } });
        requireEvidence(/^SUC_/.test(generic?.code || '') && Array.isArray(generic.result) && generic.result.length === intent.quantity &&
            generic.result.every(row => !Object.hasOwn(row, 'protectedToken') && !Object.hasOwn(row, 'secureIssuance') && !Object.hasOwn(row, 'secureIssuanceCode')),
            'complete generic redaction readback unconfirmed');
        let denied = false;
        try { await secure.prepare(request, { ...intent, quantity: intent.quantity + 1 }, campaign); } catch (_) { denied = true; }
        requireEvidence(denied, 'changed original issuance quantity admitted');
    }
    // A conflicting alias must be denied by the actual signed issuer owner, with the same original bearer.
    let denied = false;
    try { await SERVICE.DefaultCouponSellerAuthorizationService.issuer({ ...request, entCode: '__foreign_acceptance_enterprise' }, request.enterpriseCode); }
    catch (_) { denied = true; }
    requireEvidence(denied, 'conflicting signed enterprise alias admitted');
    return { contractVersion: 1, acceptance: 'INSTALLED_ORIGINAL_ISSUANCE_REPLAY', releaseCode: request.contribution.releaseCode,
        checksum: request.contribution.checksum, batches: original.map(({ digest, ...safe }) => safe),
        originalStockPreserved: true, concurrentReplay: true, genericRedaction: true, changedQuantityDenied: true,
        conflictingIssuerAliasDenied: true, firstIssuanceRaceQualified: false, purchasedRightsQualified: false };
    });
}
/** Executes only an explicitly reviewed original issuer GRANT, then proves immutable replay and conflicting-command refusal. */
async function manageSellerConsent(request, reviewed) {
    await assertNativeLocal(request?.tenant, 'promotion', ['promotion', 'coupon', 'couponBatch']);
    requireEvidence(request.authData?.principalType === 'human' && request.authData.tokenType === 'access' &&
        reviewed?.confirmed === true && reviewed.promotionCode === request.promotionCode &&
        require('node:util').isDeepStrictEqual(reviewed.command, request.payload) &&
        request.payload?.action === 'GRANT' && request.payload.benefitConsumption === 'ISSUED_COUPON_BENEFIT_V1',
        'reviewed original signed issuer benefit grant required');
    await assertLocalTarget({ moduleName: 'profile', connectionName: 'profile', tenant: request.tenant,
        targetAuthority: { runtimeRole: 'PLATFORM' } });
    const owner = SERVICE.DefaultCouponSellerAuthorizationService;
    return SERVICE.DefaultCouponSecureIssuanceService.privateOperation(request, async () => {
        const original = await owner.manage(request);
        requireEvidence(original.seller?.status === 'ACTIVE' &&
            original.seller.sellerEnterpriseCode === request.payload.sellerEnterpriseCode,
            'original consent commit unconfirmed');
        const committed = fingerprint(await owner.campaign(request, request.promotionCode));
        const replays = await Promise.all([owner.manage(request), owner.manage(request)]);
        requireEvidence(replays.every(value => fingerprint(value) === fingerprint(original)), 'original consent replay changed');
        const inspection = await owner.inspect({ ...request, payload: {}, query: {} });
        requireEvidence(inspection.promotionRevision === original.promotionRevision &&
            inspection.sellers.filter(value => value.sellerEnterpriseCode === original.seller.sellerEnterpriseCode).length === 1 &&
            fingerprint(inspection.sellers.find(value => value.sellerEnterpriseCode === original.seller.sellerEnterpriseCode)) === fingerprint(original.seller),
            'canonical consent readback unconfirmed');
        let denied = false;
        try {
            await owner.manage({ ...request, payload: { ...request.payload,
                expiresAt: new Date(Date.parse(request.payload.expiresAt) + 1000).toISOString() } });
        } catch (_) { denied = true; }
        requireEvidence(denied, 'changed original consent expiry admitted');
        requireEvidence(committed === fingerprint(await owner.campaign(request, request.promotionCode)),
            'consent replay/conflict changed original campaign');
        return { contractVersion: 1, acceptance: 'INSTALLED_ORIGINAL_SELLER_CONSENT',
            promotionCode: original.promotionCode, promotionRevision: original.promotionRevision,
            sellerEnterpriseCode: original.seller.sellerEnterpriseCode, originalConsentPreserved: true,
            concurrentReplay: true, changedExpiryDenied: true, deploymentQualified: false };
    });
}
module.exports = { assertNativeLocal, assertLocalTarget, requireEvidence, fingerprint, replayContribution, manageSellerConsent };
