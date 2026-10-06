/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotProvider/service/DefaultCopilotUsageService @description Enforces bounded shared-pool token accounting through one atomic generated period record, retaining ambiguous provider outcomes. @layer service @owner copilotProvider @override Preserve trusted scope, unique period identity, atomic updates and unresolved reservations. */
module.exports = {
    /** Resolves a bounded historical window using calendar boundaries, including DST and leap years. @param {Object} policy Effective policy. @param {Object} query Inert query. @param {Date} now Observed clock. @returns {Object} Selected and preceding periods. */
    historyWindow: function (policy, query, now) {
        const limit =
            policy.historyPeriods === undefined ? 12 : policy.historyPeriods;
        if (!Number.isInteger(limit) || limit < 1 || limit > 24)
            this.reject('ERR_CPP_00001');
        if (
            query.periodOffset !== undefined &&
            !['string', 'number'].includes(typeof query.periodOffset)
        )
            this.reject('ERR_CPP_00005');
        const raw =
            query.periodOffset === undefined ? '0' : String(query.periodOffset);
        if (!/^(0|[1-9][0-9]?)$/.test(raw)) this.reject('ERR_CPP_00005');
        const offset = Number(raw);
        if (offset >= limit) this.reject('ERR_CPP_00005');
        const periods = [this.period(policy, now)];
        for (let index = 0; index < limit; index += 1) {
            periods.push(
                this.period(
                    policy,
                    new Date(Date.parse(periods[index].startsAt) - 1),
                ),
            );
        }
        return {
            offset,
            periods: periods.slice(0, limit),
            selected: periods[offset],
            previous: periods[offset + 1],
        };
    },
    /** Selects only authorized calls before analytics, queue enrichment or comparison. @param {Object|null} record Private period. @param {Object} scope Trusted identity. @param {string} view Authorized view. @param {Object} query Exact filters. @returns {Array} Scoped entries. */
    filterEntries: function (record, scope, view, query) {
        return (record ? record.journal.items : []).filter(
            (item) =>
                item.enterpriseCode === scope.enterpriseCode &&
                (view === 'ENTERPRISE' ||
                    item.principalCode === scope.principalCode) &&
                ['principalCode', 'model', 'purpose'].every(
                    (key) =>
                        query[key] === undefined || item[key] === query[key],
                ) &&
                (query.calls !== 'UNRESOLVED' || item.state !== 'MEASURED'),
        );
    },
    /** Enriches at most one queue page with scoped evidence, never measurements supplied by an operator. @param {Array} items Authorized visible calls. @param {Object} request Trusted reader. @param {Object} scope Scope. @param {Object} period Original period. @param {Object} policy Policy. @returns {Promise<Array>} Safe queue metadata. */
    queueEvidence: async function (items, request, scope, period, policy) {
        const result = [];
        for (const item of items) {
            let evidence = 'DISABLED';
            if (
                policy.reconciliation &&
                policy.reconciliation.enabled === true
            ) {
                const service = SERVICE.DefaultCopilotReconciliationService;
                if (!service || typeof service.receipt !== 'function')
                    this.reject('ERR_CPP_00001');
                const receipt = await service.receipt(
                    request,
                    { ...scope, principalCode: item.principalCode },
                    period,
                    item.callId,
                );
                evidence = receipt ? 'AVAILABLE' : 'MISSING';
            }
            result.push({ callId: item.callId, evidence });
        }
        return result;
    },
    /** Builds scoped current-period daily and ranked breakdowns from the full filtered ledger, not just visible call rows. @param {Array} items Authorized entries. @param {Object} period Calendar window. @returns {Object} Bounded analytics. */
    insights: function (items, period) {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: period.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const dates = new Map();
        for (const item of items) {
            if (!Number.isFinite(Date.parse(item.createdAt)))
                this.reject('ERR_CPP_00001');
            const parts = Object.fromEntries(
                formatter
                    .formatToParts(new Date(item.createdAt))
                    .map((part) => [part.type, part.value]),
            );
            const day = [parts.year, parts.month, parts.day].join('-');
            if (!dates.has(day)) dates.set(day, []);
            dates.get(day).push(item);
        }
        if (dates.size > 31) this.reject('ERR_CPP_00001');
        const breakdowns = {};
        for (const field of ['principalCode', 'model', 'purpose']) {
            const groups = new Map();
            for (const item of items) {
                if (!this.identifier(item[field])) this.reject('ERR_CPP_00001');
                if (!groups.has(item[field])) groups.set(item[field], []);
                groups.get(item[field]).push(item);
            }
            const rows = [...groups]
                .map(([value, entries]) => ({ value, ...this.totals(entries) }))
                .sort(
                    (a, b) =>
                        b.consumed - a.consumed ||
                        b.reserved - a.reserved ||
                        a.value.localeCompare(b.value),
                );
            breakdowns[field] = {
                items: rows.slice(0, 20),
                hasMore: rows.length > 20,
            };
        }
        return {
            daily: [...dates]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, entries]) => ({ day, ...this.totals(entries) })),
            breakdowns,
        };
    },
    /** Validates operational allocation metadata without treating malformed persistence as defaults. @param {Object} journal Period journal. @returns {void} No return value. */
    validateAllocations: function (journal) {
        for (const key of ['allocations', 'allocationChanges']) {
            if (
                journal[key] !== undefined &&
                (!Array.isArray(journal[key]) || journal[key].length > 500)
            )
                this.reject('ERR_CPP_00001');
        }
        const identities = new Set();
        for (const item of journal.allocations || []) {
            if (
                !item ||
                !this.identifier(item.enterpriseCode) ||
                (item.principalCode !== null &&
                    !this.identifier(item.principalCode)) ||
                !this.count(item.limit)
            )
                this.reject('ERR_CPP_00001');
            const key = JSON.stringify([
                item.enterpriseCode,
                item.principalCode,
            ]);
            if (identities.has(key)) this.reject('ERR_CPP_00001');
            identities.add(key);
        }
        const changes = new Set();
        for (const change of journal.allocationChanges || []) {
            if (
                !change ||
                !this.identifier(change.changeId) ||
                changes.has(change.changeId) ||
                !this.identifier(change.enterpriseCode) ||
                !this.identifier(change.actor) ||
                !this.count(change.before) ||
                !this.count(change.after) ||
                !['ENTERPRISE', 'USER'].includes(change.target) ||
                (change.target === 'USER'
                    ? !this.identifier(change.principalCode)
                    : change.principalCode !== null) ||
                typeof change.digest !== 'string' ||
                !/^[a-f0-9]{64}$/.test(change.digest) ||
                typeof change.reason !== 'string' ||
                !change.reason.trim() ||
                change.reason.length > 500 ||
                typeof change.createdAt !== 'string' ||
                !Number.isFinite(Date.parse(change.createdAt))
            )
                this.reject('ERR_CPP_00001');
            changes.add(change.changeId);
        }
    },
    /** Intersects current-period allocations or recurring defaults with configured ceilings and eligibility. @param {Object} policy Configured ceilings and defaults. @param {Object} scope Trusted scope. @param {Object} journal Period journal. @returns {Object} Effective enterprise and employee limits. */
    limits: function (policy, scope, journal) {
        const configured = policy.enterprises.find(
            (item) =>
                item.tenantCode === scope.tenantCode &&
                item.enterpriseCode === scope.enterpriseCode,
        );
        if (!configured) return { enterprise: null, user: null };
        const values = ((journal && journal.allocations) || []).filter(
            (item) => item.enterpriseCode === scope.enterpriseCode,
        );
        const enterprise = {
            ...configured,
            limit: Math.min(
                configured.limit,
                values.find((item) => item.principalCode === null)?.limit ??
                    configured.defaultLimit ??
                    configured.limit,
            ),
        };
        const selected = configured.users.find(
            (item) => item.principalCode === scope.principalCode,
        );
        const user = selected
            ? {
                  ...selected,
                  limit: Math.min(
                      selected.limit,
                      values.find(
                          (item) => item.principalCode === scope.principalCode,
                      )?.limit ??
                          selected.defaultLimit ??
                          selected.limit,
                  ),
              }
            : null;
        return { enterprise, user };
    },
    /** Throws a stable safe accounting status. @param {string} code Status identity. @returns {never} Always throws. */
    reject: function (code) {
        throw new CLASSES.NodicsError(code);
    },
    /** Validates token counts without coercion or implicit unlimited values. @param {unknown} value Candidate count. @returns {boolean} Whether bounded. */
    count: function (value) {
        return Number.isSafeInteger(value) && value >= 0;
    },
    /** Validates identifiers used only as values, never query operators or object keys. @param {unknown} value Candidate identity. @returns {boolean} Whether bounded. */
    identifier: function (value) {
        return (
            typeof value === 'string' &&
            value.trim().length > 0 &&
            value.length <= 128
        );
    },
    /** Resolves trusted employee scope before touching storage. @param {Object} request Trusted request, not body input. @returns {Object} Accounting scope. */
    scope: function (request) {
        const auth = (request || {}).authData || {};
        const scope = {
            tenantCode: (request || {}).tenant,
            enterpriseCode: auth.enterpriseCode || auth.entCode,
            principalCode: auth.loginId,
        };
        if (Object.values(scope).some((value) => !this.identifier(value)))
            this.reject('ERR_CPP_00002');
        return scope;
    },
    /** Validates effective policy; missing allocations never grant implicit capacity. @param {Object} policy Effective accounting policy. @returns {Object} Validated policy. */
    validate: function (policy) {
        if (
            policy &&
            policy.reconciliation !== undefined &&
            (!policy.reconciliation ||
                typeof policy.reconciliation.enabled !== 'boolean')
        )
            this.reject('ERR_CPP_00001');
        if (
            !policy ||
            policy.enabled !== true ||
            !['MONTH', 'DAY'].includes(policy.period) ||
            !this.count(policy.tenantLimit) ||
            !Number.isInteger(policy.maximumEntries) ||
            policy.maximumEntries < 1 ||
            policy.maximumEntries > 5000 ||
            !Number.isInteger(policy.maximumAttempts) ||
            policy.maximumAttempts < 1 ||
            policy.maximumAttempts > 20 ||
            !Array.isArray(policy.enterprises) ||
            policy.enterprises.length > 100 ||
            !Array.isArray(policy.warningPercentages) ||
            policy.warningPercentages.length > 10 ||
            policy.warningPercentages.some(
                (value) => !Number.isInteger(value) || value < 1 || value > 100,
            )
        )
            this.reject('ERR_CPP_00001');
        try {
            new Intl.DateTimeFormat('en', {
                timeZone: policy.timezone,
            }).format();
        } catch {
            this.reject('ERR_CPP_00001');
        }
        if (!this.identifier(policy.timezone)) this.reject('ERR_CPP_00001');
        const seen = new Set();
        for (const enterprise of policy.enterprises) {
            if (
                !enterprise ||
                !this.identifier(enterprise.tenantCode) ||
                !this.identifier(enterprise.enterpriseCode) ||
                !this.count(enterprise.limit) ||
                (enterprise.defaultLimit !== undefined &&
                    (!this.count(enterprise.defaultLimit) ||
                        enterprise.defaultLimit > enterprise.limit)) ||
                enterprise.limit > policy.tenantLimit ||
                !Array.isArray(enterprise.users) ||
                enterprise.users.length > 1000 ||
                !Array.isArray(enterprise.adapters) ||
                enterprise.adapters.length > 100 ||
                new Set(enterprise.adapters).size !== enterprise.adapters.length ||
                enterprise.adapters.some((value) => !this.identifier(value)) ||
                !Array.isArray(enterprise.profiles) ||
                enterprise.profiles.length > 100 ||
                new Set(enterprise.profiles).size !== enterprise.profiles.length ||
                enterprise.profiles.some((value) => !this.identifier(value))
            )
                this.reject('ERR_CPP_00001');
            const key = JSON.stringify([
                enterprise.tenantCode,
                enterprise.enterpriseCode,
            ]);
            if (seen.has(key)) this.reject('ERR_CPP_00001');
            seen.add(key);
            const users = new Set();
            for (const user of enterprise.users) {
                if (
                    !user ||
                    !this.identifier(user.principalCode) ||
                    !this.count(user.limit) ||
                    (user.defaultLimit !== undefined &&
                        (!this.count(user.defaultLimit) ||
                            user.defaultLimit > user.limit)) ||
                    user.limit > enterprise.limit ||
                    users.has(user.principalCode)
                )
                    this.reject('ERR_CPP_00001');
                users.add(user.principalCode);
            }
        }
        return policy;
    },
    /** Converts a local calendar boundary to UTC without assuming a fixed timezone offset. @param {Date} calendar UTC-shaped calendar components. @param {string} timezone IANA timezone. @returns {string} Boundary instant. */
    boundary: function (calendar, timezone) {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        });
        let timestamp = calendar.getTime();
        for (let attempt = 0; attempt < 5; attempt++) {
            const parts = Object.fromEntries(
                formatter
                    .formatToParts(new Date(timestamp))
                    .map((part) => [part.type, part.value]),
            );
            const rendered = Date.UTC(
                +parts.year,
                +parts.month - 1,
                +parts.day,
                +parts.hour,
                +parts.minute,
                +parts.second,
            );
            const delta = calendar.getTime() - rendered;
            if (delta === 0) return new Date(timestamp).toISOString();
            timestamp += delta;
        }
        return this.reject('ERR_CPP_00001');
    },
    /** Computes one immutable calendar period and explicit reset timestamp. @param {Object} policy Validated policy. @param {Date} now Current clock. @returns {Object} Period metadata. */
    period: function (policy, now) {
        const parts = Object.fromEntries(
            new Intl.DateTimeFormat('en-GB', {
                timeZone: policy.timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            })
                .formatToParts(now || new Date())
                .map((part) => [part.type, part.value]),
        );
        const day = policy.period === 'MONTH' ? 1 : +parts.day;
        const start = new Date(Date.UTC(+parts.year, +parts.month - 1, day));
        const end = new Date(start);
        if (policy.period === 'MONTH') end.setUTCMonth(end.getUTCMonth() + 1);
        else end.setUTCDate(end.getUTCDate() + 1);
        return {
            key:
                policy.period +
                ':' +
                policy.timezone +
                ':' +
                start.toISOString().slice(0, 10),
            timezone: policy.timezone,
            startsAt: this.boundary(start, policy.timezone),
            resetsAt: this.boundary(end, policy.timezone),
        };
    },
    /** Builds a deterministic tenant-period envelope key. @param {Object} scope Trusted scope. @param {Object} period Calendar period. @returns {string} Generated record identity. */
    key: function (scope, period) {
        return (
            'usage-' +
            require('node:crypto')
                .createHash('sha256')
                .update(JSON.stringify([scope.tenantCode, period.key]))
                .digest('hex')
        );
    },
    /** Requires generated persistence with no volatile fallback. @returns {Object} Owning generated service. */
    storage: function () {
        const service = SERVICE.DefaultCopilotUsagePeriodService;
        if (
            !service ||
            ['get', 'save', 'update'].some(
                (method) => typeof service[method] !== 'function',
            )
        )
            this.reject('ERR_CPP_00001');
        return service;
    },
    /** Reads and rechecks a private period record; unsuccessful envelopes never mean empty usage. @param {Object} request Trusted request. @param {Object} scope Trusted scope. @param {Object} period Calendar period. @returns {Promise<Object|null>} Period record. */
    read: async function (request, scope, period) {
        const code = this.key(scope, period);
        const response = await this.storage().get({
            tenant: scope.tenantCode,
            authData: request.authData,
            query: {
                code,
                tenantCode: scope.tenantCode,
                periodKey: period.key,
            },
            searchOptions: { pageNumber: 1, pageSize: 2 },
        });
        if (
            !response ||
            !/^SUC_/u.test(response.code || '') ||
            !Array.isArray(response.result)
        )
            this.reject('ERR_CPP_00001');
        if (!response.result.length) return null;
        const row = response.result[0];
        if (
            response.result.length !== 1 ||
            row.code !== code ||
            row.tenantCode !== scope.tenantCode ||
            row.periodKey !== period.key ||
            !this.count(row.revision) ||
            !row.journal ||
            !Array.isArray(row.journal.items) ||
            row.journal.items.length > 5000
        )
            this.reject('ERR_CPP_00001');
        const ids = new Set();
        this.validateAllocations(row.journal);
        for (const item of row.journal.items) {
            if (
                !item ||
                !this.identifier(item.callId) ||
                ids.has(item.callId) ||
                !this.identifier(item.enterpriseCode) ||
                !this.identifier(item.principalCode) ||
                !this.count(item.reservation) ||
                !['RESERVED', 'PENDING', 'MEASURED'].includes(item.state) ||
                (item.state === 'MEASURED' && !this.count(item.totalTokens))
            )
                this.reject('ERR_CPP_00001');
            ids.add(item.callId);
            if (item.reconciliation) {
                const audit = item.reconciliation;
                if (
                    item.state !== 'MEASURED' ||
                    !this.identifier(audit.changeId) ||
                    !this.identifier(audit.actor) ||
                    typeof audit.reason !== 'string' ||
                    !audit.reason.trim() ||
                    audit.reason.length > 500 ||
                    !['evidenceDigest', 'commandDigest'].every(
                        (key) =>
                            typeof audit[key] === 'string' &&
                            /^[a-f0-9]{64}$/.test(audit[key]),
                    ) ||
                    !['RESERVED', 'PENDING'].includes(audit.beforeState) ||
                    !this.count(audit.beforeReservation) ||
                    audit.measured !== item.totalTokens ||
                    typeof audit.createdAt !== 'string' ||
                    !Number.isFinite(Date.parse(audit.createdAt))
                )
                    this.reject('ERR_CPP_00001');
            }
        }
        return row;
    },
    /** Atomically writes the whole bounded journal; unknown acknowledgements fail closed without retry. @param {Object|null} current Prior record. @param {Object} next Replacement journal. @param {Object} request Trusted request. @param {Object} scope Scope. @param {Object} period Period. @returns {Promise<boolean>} True only for acknowledged write, false only for definite revision conflict. */
    write: async function (current, next, request, scope, period) {
        const service = this.storage();
        if (!current) {
            // Explicit insert intent lets the unique code index arbitrate competing initializers.
            try {
                const response = await service.save({
                    tenant: scope.tenantCode,
                    authData: request.authData,
                    options: { insertOnly: true },
                    model: {
                        code: this.key(scope, period),
                        active: true,
                        tenantCode: scope.tenantCode,
                        periodKey: period.key,
                        revision: 0,
                        journal: next,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                if (
                    !response ||
                    !/^SUC_/u.test(response.code || '') ||
                    !response.result ||
                    response.result.code !== this.key(scope, period)
                )
                    this.reject('ERR_CPP_00001');
                return true;
            } catch {
                return this.reject('ERR_CPP_00001');
            }
        }
        const response = await service.update({
            tenant: scope.tenantCode,
            authData: request.authData,
            query: {
                code: current.code,
                tenantCode: scope.tenantCode,
                periodKey: period.key,
                revision: current.revision,
            },
            model: {
                journal: next,
                revision: current.revision + 1,
                updatedAt: new Date(),
            },
        });
        if (
            !response ||
            !/^SUC_/u.test(response.code || '') ||
            !response.result ||
            ![0, 1].includes(response.result.matchedCount)
        )
            this.reject('ERR_CPP_00001');
        return response.result.matchedCount === 1;
    },
    /** Sums measured and unresolved capacity without counting subcategories twice. @param {Array} entries Ledger entries. @returns {Object} Usage totals. */
    totals: function (entries) {
        const result = {
            consumed: 0,
            reserved: 0,
            pending: 0,
            calls: entries.length,
        };
        for (const entry of entries) {
            if (entry.state === 'MEASURED')
                result.consumed += entry.totalTokens;
            else {
                result.reserved += entry.reservation;
                if (entry.state === 'PENDING')
                    result.pending += entry.reservation;
            }
        }
        if (!Object.values(result).every((value) => this.count(value)))
            this.reject('ERR_CPP_00001');
        return result;
    },
    /** Reserves all applicable caps in one compare-and-swap before provider dispatch. @param {Object} input Trusted call attribution. @param {Object} policy Accounting policy. @returns {Promise<Object>} Reservation handle with original period binding. */
    reserve: async function (input, policy) {
        this.validate(policy);
        const scope = this.scope(input.request);
        if (
            !this.identifier(input.callId) ||
            !this.identifier(input.adapter) ||
            !this.identifier(input.profile) ||
            !this.identifier(input.model) ||
            ![
                'CONVERSATION',
                'INDEXING',
                'EVALUATION',
                'RETRY',
                'PLANNING',
            ].includes(input.purpose) ||
            !this.count(input.tokens) ||
            input.tokens < 1
        )
            this.reject('ERR_CPP_00005');
        const enterprise = policy.enterprises.find(
            (item) =>
                item.tenantCode === scope.tenantCode &&
                item.enterpriseCode === scope.enterpriseCode,
        );
        const user =
            enterprise &&
            enterprise.users.find(
                (item) => item.principalCode === scope.principalCode,
            );
        if (
            !user ||
            !enterprise.adapters.includes(input.adapter) ||
            !enterprise.profiles.includes(input.profile)
        )
            this.reject('ERR_CPP_00002');
        const observedAt = new Date();
        const period = this.period(policy, observedAt);
        for (let attempt = 0; attempt < policy.maximumAttempts; attempt++) {
            const current = await this.read(input.request, scope, period);
            const entries = current ? current.journal.items : [];
            if (entries.some((item) => item.callId === input.callId))
                this.reject('ERR_CPP_00004');
            if (entries.length >= policy.maximumEntries)
                this.reject('ERR_CPP_00001');
            const enterpriseEntries = entries.filter(
                (item) => item.enterpriseCode === scope.enterpriseCode,
            );
            const allocated = this.limits(
                policy,
                scope,
                current && current.journal,
            );
            for (const [selected, limit] of [
                [entries, policy.tenantLimit],
                [enterpriseEntries, allocated.enterprise.limit],
                [
                    enterpriseEntries.filter(
                        (item) => item.principalCode === scope.principalCode,
                    ),
                    allocated.user.limit,
                ],
            ]) {
                const totals = this.totals(selected);
                if (input.tokens > limit - totals.consumed - totals.reserved)
                    this.reject('ERR_CPP_00003');
            }
            const entry = {
                callId: input.callId,
                enterpriseCode: scope.enterpriseCode,
                principalCode: scope.principalCode,
                adapter: input.adapter,
                profile: input.profile,
                model: input.model,
                purpose: input.purpose,
                reservation: input.tokens,
                state: 'RESERVED',
                totalTokens: null,
                createdAt: observedAt.toISOString(),
            };
            if (
                await this.write(
                    current,
                    {
                        ...(current && current.journal),
                        items: entries.concat(entry),
                    },
                    input.request,
                    scope,
                    period,
                )
            )
                return { scope, period, callId: input.callId };
        }
        return this.reject('ERR_CPP_00001');
    },
    /** Settles measured totals or preserves the full uncertain reservation, including after a period reset. @param {Object} handle Original reservation. @param {Object|null} usage Normalized usage, null for ambiguous failure. @param {Object} request Trusted original request. @param {Object} policy Current accounting configuration. @returns {Promise<Object>} Settled entry. */
    settle: async function (handle, usage, request, policy) {
        const scope = this.scope(request);
        if (JSON.stringify(scope) !== JSON.stringify(handle.scope))
            this.reject('ERR_CPP_00002');
        for (let attempt = 0; attempt < policy.maximumAttempts; attempt++) {
            const current = await this.read(request, scope, handle.period);
            const entries = current && current.journal.items;
            const entry =
                entries &&
                entries.find(
                    (item) =>
                        item.callId === handle.callId &&
                        item.enterpriseCode === scope.enterpriseCode &&
                        item.principalCode === scope.principalCode,
                );
            if (!entry) this.reject('ERR_CPP_00001');
            if (entry.state === 'MEASURED') return entry;
            const measured = usage && this.count(usage.totalTokens);
            const next = {
                ...entry,
                state: measured ? 'MEASURED' : 'PENDING',
                totalTokens: measured ? usage.totalTokens : null,
                completedAt: new Date().toISOString(),
            };
            if (
                await this.write(
                    current,
                    {
                        ...current.journal,
                        items: entries.map((item) =>
                            item.callId === handle.callId ? next : item,
                        ),
                    },
                    request,
                    scope,
                    handle.period,
                )
            )
                return next;
        }
        return this.reject('ERR_CPP_00001');
    },
    /** Projects personal capacity without exposing other employee records. @param {Object} request Trusted principal request. @param {Object} policy Effective policy. @returns {Promise<Object>} Personal budget projection. */
    summary: async function (request, policy) {
        if (!policy || policy.enabled !== true)
            return {
                state: 'UNAVAILABLE',
                allowance: null,
                consumed: null,
                reserved: null,
                available: null,
            };
        this.validate(policy);
        const scope = this.scope(request),
            period = this.period(policy);
        const enterprise = policy.enterprises.find(
            (item) =>
                item.tenantCode === scope.tenantCode &&
                item.enterpriseCode === scope.enterpriseCode,
        );
        const user =
            enterprise &&
            enterprise.users.find(
                (item) => item.principalCode === scope.principalCode,
            );
        if (!user)
            return {
                state: 'UNASSIGNED',
                allowance: null,
                consumed: null,
                reserved: null,
                available: null,
                period,
            };
        const current = await this.read(request, scope, period),
            entries = current ? current.journal.items : [];
        const allocated = this.limits(
            policy,
            scope,
            current && current.journal,
        );
        const enterpriseEntries = entries.filter(
            (item) => item.enterpriseCode === scope.enterpriseCode,
        );
        const own = this.totals(
            enterpriseEntries.filter(
                (item) => item.principalCode === scope.principalCode,
            ),
        );
        const pool = this.totals(enterpriseEntries),
            tenant = this.totals(entries);
        const available = Math.max(
            0,
            Math.min(
                allocated.user.limit - own.consumed - own.reserved,
                allocated.enterprise.limit - pool.consumed - pool.reserved,
                policy.tenantLimit - tenant.consumed - tenant.reserved,
            ),
        );
        const percentage = Math.max(
            ...[
                [own, allocated.user.limit],
                [pool, allocated.enterprise.limit],
                [tenant, policy.tenantLimit],
            ].map(([totals, limit]) =>
                limit === 0
                    ? 100
                    : Math.min(
                          100,
                          Math.floor(
                              (100 * (totals.consumed + totals.reserved)) /
                                  limit,
                          ),
                      ),
            ),
        );
        return {
            state: available === 0 ? 'EXHAUSTED' : 'AVAILABLE',
            allowance: allocated.user.limit,
            consumed: own.consumed,
            reserved: own.reserved,
            available,
            pending: own.pending,
            period,
            warningPercentage: Math.max(
                0,
                ...policy.warningPercentages.filter(
                    (value) => percentage >= value,
                ),
            ),
        };
    },
    /** Projects bounded personal or explicitly permissioned enterprise usage, with only exact inert filters. @param {Object} request Trusted API request. @param {Object} policy Effective policy. @returns {Promise<Object>} Scoped usage dashboard. */
    dashboard: async function (request, policy) {
        const scope = this.scope(request);
        const permissions = (request.authData || {}).permissions || [];
        const permitted = (permission) =>
            Array.isArray(permissions) &&
            (permissions.includes('*') || permissions.includes(permission));
        if (!permitted('copilot.assistant.read')) this.reject('ERR_CPP_00002');
        const query = request.query || {};
        const view = query.scope === undefined ? 'PERSONAL' : query.scope;
        const canViewEnterprise = permitted('copilot.usage.read');
        if (
            !['PERSONAL', 'ENTERPRISE'].includes(view) ||
            (view === 'ENTERPRISE' && !canViewEnterprise)
        )
            this.reject('ERR_CPP_00002');
        for (const key of ['principalCode', 'model', 'purpose'])
            if (query[key] !== undefined && !this.identifier(query[key]))
                this.reject('ERR_CPP_00005');
        const calls = query.calls === undefined ? 'ALL' : query.calls;
        if (
            query.page !== undefined &&
            !['string', 'number'].includes(typeof query.page)
        )
            this.reject('ERR_CPP_00005');
        const pageValue = query.page === undefined ? '0' : String(query.page);
        if (
            !['ALL', 'UNRESOLVED'].includes(calls) ||
            !/^(0|[1-9][0-9]{0,2})$/.test(pageValue)
        )
            this.reject('ERR_CPP_00005');
        const page = Number(pageValue),
            pageSize = calls === 'UNRESOLVED' ? 25 : 100;
        if (page * pageSize >= 5000) this.reject('ERR_CPP_00005');
        if (
            view === 'PERSONAL' &&
            query.principalCode !== undefined &&
            query.principalCode !== scope.principalCode
        )
            this.reject('ERR_CPP_00002');
        const base = {
            contractVersion: 1,
            context: scope,
            scope: view,
            canViewEnterprise,
            presentation: { ...(policy || {}).presentation },
            observedAt: new Date().toISOString(),
        };
        if (!policy || policy.enabled !== true)
            return {
                ...base,
                state: 'UNAVAILABLE',
                period: null,
                totals: null,
                items: [],
                hasMore: false,
            };
        this.validate(policy);
        const window = this.historyWindow(
            policy,
            query,
            new Date(base.observedAt),
        );
        const period = window.selected;
        const current = await this.read(request, scope, period);
        const previous = await this.read(request, scope, window.previous);
        const items = this.filterEntries(current, scope, view, query);
        const previousItems = this.filterEntries(previous, scope, view, query);
        const ordered = items
            .slice()
            .sort(
                (a, b) =>
                    (calls === 'UNRESOLVED'
                        ? a.createdAt.localeCompare(b.createdAt)
                        : b.createdAt.localeCompare(a.createdAt)) ||
                    a.callId.localeCompare(b.callId),
            );
        const visible = ordered.slice(page * pageSize, (page + 1) * pageSize);
        const queue =
            calls === 'UNRESOLVED'
                ? await this.queueEvidence(
                      visible,
                      request,
                      scope,
                      period,
                      policy,
                  )
                : [];
        return {
            ...base,
            state: 'AVAILABLE',
            period,
            history: {
                offset: window.offset,
                // A tenant journal may contain only other enterprises; never disclose that fact.
                recorded: items.length > 0,
                periods: window.periods,
                previous: {
                    period: window.previous,
                    totals: previousItems.length
                        ? this.totals(previousItems)
                        : null,
                },
            },
            pagination: { page, pageSize, calls },
            queue,
            totals: this.totals(items),
            insights: this.insights(items, period),
            hasMore: items.length > (page + 1) * pageSize,
            items: visible.map((item) => ({
                callId: item.callId,
                principalCode: item.principalCode,
                model: item.model,
                purpose: item.purpose,
                state: item.state,
                consumed: item.state === 'MEASURED' ? item.totalTokens : null,
                reserved: item.state === 'MEASURED' ? 0 : item.reservation,
                createdAt: item.createdAt,
            })),
        };
    },
};
