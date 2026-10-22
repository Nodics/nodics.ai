/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual } = require('node:util');
/** @module promotion/service/defaultCouponAcquisitionReportingService @description Persists bounded complete-source acquisition projections and returns protected issuer/redeemer aggregates with explicit coverage. @layer service @owner promotion */
module.exports = {
    /** Rejects uncertain coverage without changing the last successful projection. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_REPORT_UNCONFIRMED'); },
    /** Central policy is framework-defined; absent privacy settings never expose rows. */
    settings: function () {
        const p = CONFIG.get('promotion')?.acquisitionReporting;
        if (!p || typeof p.enabled !== 'boolean' ||
            !['pageSize', 'maximumPages', 'minimumDistinctOwners', 'refreshIntervalSeconds', 'maximumProjectionBytes'].every(key =>
                Number.isSafeInteger(p[key]) && p[key] > 0) || p.minimumDistinctOwners < 2) this.fail();
        return p;
    },
    /** Tenant-scoped projection identity; it grants no cross-Enterprise report access. */
    code: function (r) {
        SERVICE.DefaultCouponOfferService.identifier(r.channelCode);
        return SERVICE.DefaultCouponOfferAllocationService.code('report', [r.tenant, r.channelCode]);
    },
    /** Validates canonical confirmed facts from Digital, including actual redeemer and event-time owner identity. */
    event: function (row) {
        const rules = SERVICE.DefaultCouponOfferService;
        rules.object(row, ['sourceId', 'kind', 'confirmedAt', 'promotionCode', 'issuerEnterpriseCode', 'redeemerEnterpriseCode',
            'storeCode', 'ownerRef', 'channel', 'confirmed', 'historyKnown', 'acquisitionCode']);
        for (const key of ['sourceId', 'promotionCode', 'issuerEnterpriseCode']) rules.identifier(row[key]);
        rules.identifier(row.channel);
        if (!['ISSUANCE', 'PURCHASE', 'REDEMPTION'].includes(row.kind) || row.confirmed !== true ||
            typeof row.historyKnown !== 'boolean' || typeof row.confirmedAt !== 'string' ||
            !Number.isFinite(Date.parse(row.confirmedAt)) || new Date(row.confirmedAt).toISOString() !== row.confirmedAt) this.fail();
        if (row.kind === 'REDEMPTION') {
            if (row.redeemerEnterpriseCode !== null) rules.identifier(row.redeemerEnterpriseCode);
            if (row.storeCode !== null) rules.identifier(row.storeCode);
        }
        if (row.acquisitionCode !== undefined) rules.identifier(row.acquisitionCode);
        const ownerRef = row.ownerRef === null ? null : SERVICE.DefaultCouponOfferAllocationService.owner({ ownerRef: row.ownerRef });
        return { ...structuredClone(row), ownerRef };
    },
    /** Reconciles late events by authoritative event time; an employee never splits an Enterprise cohort. */
    classify: function (events, scope) {
        const seen = new Set();
        return events.slice().sort((a, b) => a.confirmedAt.localeCompare(b.confirmedAt) || a.sourceId.localeCompare(b.sourceId)).map(event => {
            if (event.kind !== 'REDEMPTION') return event;
            if (!event.ownerRef || !event.redeemerEnterpriseCode || scope?.type === 'OUTLET' && !event.storeCode)
                return { ...event, classification: 'UNKNOWN' };
            const dimension = scope?.type === 'GROUP' ? scope.code : scope?.type === 'OUTLET' ? event.storeCode : event.redeemerEnterpriseCode;
            const key = JSON.stringify([dimension, event.ownerRef.type, event.ownerRef.code]);
            const classification = seen.has(key) ? 'RETURNING_THROUGH_CHANNEL' : !event.historyKnown ? 'UNKNOWN' : 'NEW_THROUGH_CHANNEL';
            seen.add(key);
            return { ...event, classification };
        });
    },
    /** Reads a stable bounded complete snapshot from Digital's canonical confirmed-event source. */
    refresh: async function (request) {
        const p = structuredClone(this.settings()), auth = structuredClone(request.authData);
        if (!p.enabled || auth?.principalType !== 'service' || !['service', 'internal'].includes(auth.tokenType) ||
            auth.tenant !== request.tenant || !SERVICE.DefaultDigitalCommerceCouponAcquisitionService?.reportingEvents) this.fail();
        SERVICE.DefaultCouponOfferService.identifier(request.channelCode);
        const r = { tenant: request.tenant, channelCode: request.channelCode, authData: structuredClone(auth) }, rows = [], seen = new Map(), cursors = new Set();
        const bound = () => {
            if (!isDeepStrictEqual(p, this.settings()) || !isDeepStrictEqual(auth, request.authData) ||
                request.tenant !== r.tenant || request.channelCode !== r.channelCode) this.fail();
        };
        let cursor, snapshotId, coverageThrough, complete = false;
        for (let page = 0; page < p.maximumPages; page++) {
            const response = await SERVICE.DefaultDigitalCommerceCouponAcquisitionService.reportingEvents({ ...r,
                pageSize: p.pageSize, cursor, snapshotId });
            bound();
            if (!response || !Array.isArray(response.events) || response.events.length > p.pageSize ||
                response.tenant !== r.tenant || response.historyComplete !== true || typeof response.snapshotId !== 'string' ||
                !Number.isFinite(Date.parse(response.coverageThrough)) || Date.parse(response.coverageThrough) > Date.now() ||
                snapshotId && (snapshotId !== response.snapshotId || coverageThrough !== response.coverageThrough)) this.fail();
            snapshotId = response.snapshotId; coverageThrough = response.coverageThrough;
            for (const source of response.events) {
                const event = this.event(source);
                if (event.channel !== r.channelCode) this.fail();
                if (Date.parse(event.confirmedAt) > Date.parse(coverageThrough)) this.fail();
                if (seen.has(event.sourceId)) {
                    if (!isDeepStrictEqual(seen.get(event.sourceId), event)) this.fail();
                } else { seen.set(event.sourceId, event); rows.push(event); }
            }
            if (response.complete === true && response.nextCursor == null) { complete = true; break; }
            if (typeof response.nextCursor !== 'string' || !response.nextCursor || cursors.has(response.nextCursor)) this.fail();
            cursor = response.nextCursor; cursors.add(cursor);
        }
        if (!complete) this.fail();
        const evidence = { snapshotId, coverageThrough: new Date(coverageThrough).toISOString(), timezone: 'UTC',
            events: this.classify(rows), refreshedAt: new Date().toISOString() };
        if (Buffer.byteLength(JSON.stringify(evidence)) > p.maximumProjectionBytes) this.fail();
        const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
        await persistence.transaction(r, ['couponAcquisitionProjection'], async scoped => {
            bound();
            const code = this.code(r), current = await persistence.read('couponAcquisitionProjection', scoped, code);
            bound();
            if (current && Date.parse(current.evidence.coverageThrough) > Date.parse(evidence.coverageThrough)) this.fail();
            await persistence.write('couponAcquisitionProjection', scoped, current, { code, tenant: r.tenant,
                revision: current ? current.revision + 1 : 0, evidence });
            bound();
        });
        return { dataUpdatedThrough: evidence.coverageThrough, timezone: 'UTC' };
    },
    /** Resolves complete framework query defaults without customer copies or caller-selected privacy limits. */
    querySettings: function () {
        const p = CONFIG.get('promotion')?.acquisitionReportQuery;
        if (!p || !p.validation || !['ISSUER', 'REDEEMER'].includes(p.defaultView) ||
            !['ENTERPRISE', 'GROUP', 'OUTLET'].includes(p.defaultScope) ||
            !['NONE', 'DAY', 'OUTLET', 'ENTERPRISE'].includes(p.defaultBreakdown)) this.fail();
        for (const key of ['maximumDays', 'maximumBreakdownRows', 'maximumScopeMembers', 'rateScale']) {
            const limit = p.validation[key];
            if (!limit || !Number.isSafeInteger(limit.minimum) || !Number.isSafeInteger(limit.maximum) ||
                limit.minimum < 0 || limit.maximum < limit.minimum || !Number.isSafeInteger(p[key]) ||
                p[key] < limit.minimum || p[key] > limit.maximum) this.fail();
        }
        return p;
    },
    /** Admits whole UTC days only, so neighboring windows cannot expose sub-day protected activity. End date is exclusive. */
    filters: function (request, context) {
        const p = this.querySettings(), input = request.payload || {}, rules = SERVICE.DefaultCouponOfferService;
        rules.object(input, ['promotionCode', 'channelCode', 'view', 'fromDate', 'toDate', 'scopeType', 'scopeCode', 'breakdown']);
        rules.identifier(input.channelCode); rules.identifier(context.promotionCode);
        const view = input.view === undefined ? p.defaultView : input.view,
            type = input.scopeType === undefined ? p.defaultScope : input.scopeType,
            breakdown = input.breakdown === undefined ? p.defaultBreakdown : input.breakdown;
        if (!['ISSUER', 'REDEEMER'].includes(view) || !['ENTERPRISE', 'GROUP', 'OUTLET'].includes(type) ||
            !['NONE', 'DAY', 'OUTLET', 'ENTERPRISE'].includes(breakdown)) this.fail();
        const code = input.scopeCode === undefined && type === 'ENTERPRISE' ? context.enterpriseCode : input.scopeCode;
        rules.identifier(code);
        if (type === 'ENTERPRISE' && code !== context.enterpriseCode) this.fail();
        const date = value => {
            if (value === undefined || value === null) return null;
            if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
                !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) this.fail();
            return value;
        };
        const fromDate = date(input.fromDate), toDate = date(input.toDate);
        if (fromDate && toDate && (fromDate >= toDate ||
            (Date.parse(toDate) - Date.parse(fromDate)) / 86400000 > p.maximumDays)) this.fail();
        return { view, channelCode: input.channelCode, promotionCode: context.promotionCode,
            scope: { type, code }, period: { fromDate, toDate }, breakdown };
    },
    /** Stable typed owner key keeps Enterprise purchasers distinct from customers and never counts employee actors. */
    ownerKey: function (event) { return event.ownerRef ? JSON.stringify([event.ownerRef.type, event.ownerRef.code]) : null; },
    /** Suppresses small equivalence groups across the complete history, not only the selected window, preventing related filter subtraction. */
    privacy: function (events, threshold) {
        const owners = new Map();
        for (const event of events.filter(e => e.kind !== 'ISSUANCE')) {
            const owner = this.ownerKey(event);
            if (!owner) return true;
            const cells = owners.get(owner) || new Map();
            const key = JSON.stringify([event.kind, event.confirmedAt.slice(0, 10), event.promotionCode,
                event.issuerEnterpriseCode, event.redeemerEnterpriseCode || null, event.storeCode || null, event.classification || null]);
            cells.set(key, (cells.get(key) || 0) + 1); owners.set(owner, cells);
        }
        const groups = new Map();
        for (const cells of owners.values()) {
            const signature = JSON.stringify([...cells].sort(([a], [b]) => a.localeCompare(b)));
            groups.set(signature, (groups.get(signature) || 0) + 1);
        }
        return [...groups.values()].some(size => size < threshold);
    },
    /** Produces exact count-derived percentage evidence, never floating financial arithmetic or an inferred denominator. */
    rate: function (numerator, denominator) {
        if (numerator === null || denominator === null) return { numerator: null, denominator: null, percent: null };
        if (![numerator, denominator].every(n => Number.isSafeInteger(n) && n >= 0) || numerator > denominator) this.fail();
        const scale = this.querySettings().rateScale, factor = 10n ** BigInt(scale);
        const units = denominator ? BigInt(numerator) * 100n * factor / BigInt(denominator) : null;
        const value = units === null ? null : units.toString().padStart(scale + 1, '0');
        return { numerator, denominator, percent: value === null ? null : scale ? value.slice(0, -scale) + '.' + value.slice(-scale) : value };
    },
    /** Computes distinct redeemed-owner cohorts and linked purchase-cohort redemption rates; all related fields share suppression. */
    aggregate: function (events, threshold, view, history = events, forceProtected = false, issuanceKnown = false) {
        const purchases = events.filter(e => e.kind === 'PURCHASE'), redemptions = events.filter(e => e.kind === 'REDEMPTION'), cohorts = new Map();
        for (const event of redemptions) {
            const key = this.ownerKey(event);
            if (!key) continue;
            const previous = cohorts.get(key), next = event.classification || 'UNKNOWN';
            if (!previous || next === 'NEW_THROUGH_CHANNEL' || previous === 'UNKNOWN') cohorts.set(key, next);
        }
        const counts = { issuances: view === 'ISSUER' && issuanceKnown ? events.filter(e => e.kind === 'ISSUANCE').length : null,
            purchases: view === 'ISSUER' ? purchases.length : null, redemptions: redemptions.length,
            distinctOwners: cohorts.size,
            newThroughChannel: [...cohorts.values()].filter(c => c === 'NEW_THROUGH_CHANNEL').length,
            returningThroughChannel: [...cohorts.values()].filter(c => c === 'RETURNING_THROUGH_CHANNEL').length,
            unknown: [...cohorts.values()].filter(c => c === 'UNKNOWN').length };
        const protect = forceProtected || this.privacy(events, threshold);
        let numerator = null, denominator = null;
        if (view === 'ISSUER' && purchases.every(e => e.acquisitionCode)) {
            const purchased = new Map();
            for (const e of purchases) {
                if (purchased.has(e.acquisitionCode)) this.fail();
                purchased.set(e.acquisitionCode, e);
            }
            const redeemed = new Set();
            for (const e of history.filter(e => e.kind === 'REDEMPTION')) {
                const purchase = purchased.get(e.acquisitionCode);
                if (!purchase) continue;
                if (purchase.promotionCode !== e.promotionCode || purchase.issuerEnterpriseCode !== e.issuerEnterpriseCode ||
                    this.ownerKey(purchase) !== this.ownerKey(e) || purchase.confirmedAt > e.confirmedAt) this.fail();
                redeemed.add(e.acquisitionCode);
            }
            // An unlinked redemption can belong to this cohort; do not represent incomplete linkage as zero conversion.
            if (!history.some(e => e.kind === 'REDEMPTION' && !e.acquisitionCode)) { numerator = redeemed.size; denominator = purchases.length; }
        }
        const rates = { redemptionRate: this.rate(numerator, denominator),
            newThroughChannelRate: this.rate(counts.newThroughChannel, counts.distinctOwners),
            returningThroughChannelRate: this.rate(counts.returningThroughChannel, counts.distinctOwners),
            unknownRate: this.rate(counts.unknown, counts.distinctOwners) };
        if (protect) {
            for (const key of Object.keys(counts)) counts[key] = null;
            for (const key of Object.keys(rates)) rates[key] = this.rate(null, null);
        }
        return { protected: protect, counts, rates, label: protect ? 'PROTECTED' : 'AGGREGATE' };
    },
    /** Dashboard and exports share this exact server-side aggregate, never raw attribution rows. */
    query: async function (request) {
        const context = SERVICE.DefaultPromotionOperationService.analyticsContext(request), p = this.settings(), q = this.querySettings();
        const filters = this.filters(request, context), original = structuredClone({ authData: request.authData, payload: request.payload,
            authorization: request.authorization, promotionCode: request.promotionCode });
        const bound = () => {
            if (!isDeepStrictEqual(SERVICE.DefaultPromotionOperationService.analyticsContext(request), context) ||
                !isDeepStrictEqual({ authData: request.authData, payload: request.payload, authorization: request.authorization,
                    promotionCode: request.promotionCode }, original)) this.fail();
        };
        const saved = await SERVICE.DefaultCouponAcquisitionPersistenceService.read('couponAcquisitionProjection', context,
            this.code({ ...context, channelCode: filters.channelCode }));
        bound();
        const scopeOwner = SERVICE.DefaultCouponAcquisitionReportScopeService;
        if (!scopeOwner?.resolve) this.fail();
        const proof = await scopeOwner.resolve(request, filters.scope);
        bound();
        const base = { contractVersion: 2, ...filters, scope: { ...filters.scope, basis: proof.basis },
            timezone: 'UTC', meaning: 'NEW_OR_RETURNING_THROUGH_CHANNEL' };
        if (!saved) return { ...base, status: 'UNKNOWN', dataUpdatedThrough: null, protected: true, counts: null, rates: null, rows: [] };
        if (!Array.isArray(saved.evidence?.events) || !Number.isFinite(Date.parse(saved.evidence.coverageThrough))) this.fail();
        const unique = new Map();
        for (const row of saved.evidence.events) {
            const { classification, ...source } = row, e = this.event(source);
            if (e.channel !== filters.channelCode || e.confirmedAt > saved.evidence.coverageThrough ||
                unique.has(e.sourceId) && !isDeepStrictEqual(unique.get(e.sourceId), e)) this.fail();
            unique.set(e.sourceId, e);
        }
        const all = [...unique.values()], members = new Set(proof.enterpriseCodes);
        const relevant = e => filters.view === 'ISSUER' ? members.has(e.issuerEnterpriseCode) : members.has(e.redeemerEnterpriseCode);
        const history = this.classify(all.filter(e => filters.view === 'ISSUER' || members.has(e.redeemerEnterpriseCode)),
            filters.view === 'REDEEMER' ? filters.scope : undefined);
        const campaign = history.filter(e => e.promotionCode === context.promotionCode && relevant(e));
        const period = e => (!filters.period.fromDate || e.confirmedAt.slice(0, 10) >= filters.period.fromDate) &&
            (!filters.period.toDate || e.confirmedAt.slice(0, 10) < filters.period.toDate);
        const selected = campaign.filter(e => period(e) && (filters.scope.type !== 'OUTLET' || e.storeCode === filters.scope.code));
        const protect = this.privacy(campaign, p.minimumDistinctOwners);
        const result = this.aggregate(selected, p.minimumDistinctOwners, filters.view, history, protect, saved.evidence.issuanceComplete === true);
        const buckets = new Map();
        if (filters.breakdown !== 'NONE') for (const e of selected) {
            const key = filters.breakdown === 'DAY' ? e.confirmedAt.slice(0, 10) :
                filters.breakdown === 'OUTLET' ? e.storeCode || 'UNKNOWN' : e.redeemerEnterpriseCode || 'UNKNOWN';
            const rows = buckets.get(key) || []; rows.push(e); buckets.set(key, rows);
            if (buckets.size > q.maximumBreakdownRows) this.fail();
        }
        let rows = [...buckets].sort(([a], [b]) => a.localeCompare(b)).map(([key, events]) => ({ key,
            ...this.aggregate(events, p.minimumDistinctOwners, filters.view, history, result.protected, saved.evidence.issuanceComplete === true) }));
        if (rows.some(row => row.protected)) Object.assign(result, this.aggregate(selected, p.minimumDistinctOwners,
            filters.view, history, true, saved.evidence.issuanceComplete === true));
        if (result.protected) rows = [];
        if (!isDeepStrictEqual(await scopeOwner.resolve(request, filters.scope), proof)) this.fail();
        bound();
        return { ...base, status: 'AVAILABLE', ...result, rows, dataUpdatedThrough: saved.evidence.coverageThrough };
    },
};
