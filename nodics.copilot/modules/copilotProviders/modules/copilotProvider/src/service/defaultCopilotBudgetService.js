/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module copilotProvider/service/DefaultCopilotBudgetService @description Administers current-period operational limits and atomic change evidence within the canonical usage journal, never deployment configuration. @layer service @owner copilotProvider @override Preserve configured ceilings, exact trusted scope, independent grants and atomic audit. */
module.exports = {
    /** Resolves the canonical accounting owner. @returns {Object} Usage service. */
    usage: function () {
        return SERVICE.DefaultCopilotUsageService;
    },
    /** Checks resolved employee grants, never body-supplied roles. @param {Object} request Trusted request. @param {string} permission Required grant. @returns {boolean} Whether permitted. */
    permitted: function (request, permission) {
        const values = (request.authData || {}).permissions;
        return (
            Array.isArray(values) &&
            (values.includes('*') || values.includes(permission))
        );
    },
    /** Requires administrative read and, for commands, the exact management grant before persistence. @param {Object} request Trusted request. @param {string} target Optional command target. @returns {Object} Trusted scope. */
    authorize: function (request, target) {
        const owner = this.usage(),
            scope = owner.scope(request);
        if (
            !this.permitted(request, 'copilot.assistant.read') ||
            !this.permitted(request, 'copilot.usage.read') ||
            (target &&
                !this.permitted(
                    request,
                    target === 'ENTERPRISE'
                        ? 'copilot.budget.enterprise.manage'
                        : 'copilot.budget.user.manage',
                ))
        )
            owner.reject('ERR_CPP_00002');
        return scope;
    },
    /** Hashes only inert deterministic budget contracts. @param {Object} value Contract. @returns {string} Digest. */
    digest: function (value) {
        return require('node:crypto')
            .createHash('sha256')
            .update(JSON.stringify(value))
            .digest('hex');
    },
    /** Binds previews to effective eligibility and ceilings without returning other enterprises. @param {Object} policy Effective policy. @param {Object} scope Trusted scope. @returns {string} Policy digest. */
    policyDigest: function (policy, scope) {
        return this.digest({
            period: policy.period,
            timezone: policy.timezone,
            tenantLimit: policy.tenantLimit,
            enterprise: policy.enterprises.find(
                (item) =>
                    item.tenantCode === scope.tenantCode &&
                    item.enterpriseCode === scope.enterpriseCode,
            ),
        });
    },
    /** Returns the current enterprise's last allocation revision, unaffected by other enterprises or usage calls. @param {Object} journal Period journal. @param {Object} scope Trusted scope. @returns {string} Revision identity. */
    revision: function (journal, scope) {
        return (
            (journal.allocationChanges || [])
                .filter((item) => item.enterpriseCode === scope.enterpriseCode)
                .at(-1)?.changeId || 'initial'
        );
    },
    /** Projects authorized limits, commitments and the latest bounded audit rows. @param {Object} request Trusted request. @param {Object} policy Deployment ceilings. @param {Object} scope Scope. @param {Object} period Calendar period. @param {Object|null} current Period envelope. @returns {Object} Admin projection. */
    project: function (request, policy, scope, period, current) {
        const owner = this.usage(),
            journal = current ? current.journal : { items: [] };
        const configured = policy.enterprises.find(
            (item) =>
                item.tenantCode === scope.tenantCode &&
                item.enterpriseCode === scope.enterpriseCode,
        );
        if (!configured) owner.reject('ERR_CPP_00002');
        const enterpriseEntries = journal.items.filter(
            (item) => item.enterpriseCode === scope.enterpriseCode,
        );
        const enterprise = owner.limits(policy, scope, journal).enterprise;
        const totals = owner.totals(enterpriseEntries);
        const changes = (journal.allocationChanges || []).filter(
            (item) => item.enterpriseCode === scope.enterpriseCode,
        );
        return {
            contractVersion: 1,
            context: scope,
            period,
            policyDigest: this.policyDigest(policy, scope),
            revision: this.revision(journal, scope),
            presentation: { ...policy.budgetPresentation },
            permissions: {
                enterprise: this.permitted(
                    request,
                    'copilot.budget.enterprise.manage',
                ),
                users: this.permitted(request, 'copilot.budget.user.manage'),
            },
            enterprise: {
                limit: enterprise.limit,
                ceiling: configured.limit,
                consumed: totals.consumed,
                reserved: totals.reserved,
            },
            users: configured.users.map((user) => {
                const totals = owner.totals(
                    enterpriseEntries.filter(
                        (item) => item.principalCode === user.principalCode,
                    ),
                );
                return {
                    principalCode: user.principalCode,
                    limit: owner.limits(
                        policy,
                        { ...scope, principalCode: user.principalCode },
                        journal,
                    ).user.limit,
                    ceiling: Math.min(user.limit, enterprise.limit),
                    consumed: totals.consumed,
                    reserved: totals.reserved,
                };
            }),
            changes: changes
                .slice(-50)
                .reverse()
                .map(
                    ({
                        changeId,
                        actor,
                        target,
                        principalCode,
                        before,
                        after,
                        reason,
                        createdAt,
                    }) => ({
                        changeId,
                        actor,
                        target,
                        principalCode,
                        before,
                        after,
                        reason,
                        createdAt,
                    }),
                ),
            hasMoreChanges: changes.length > 50,
        };
    },
    /** Reads current-enterprise allocations without invoking a provider. @param {Object} request Trusted request. @param {Object} policy Effective accounting policy. @returns {Promise<Object>} Allocation projection. */
    get: async function (request, policy) {
        const scope = this.authorize(request),
            owner = this.usage();
        owner.validate(policy);
        if (
            !policy.enterprises.some(
                (item) =>
                    item.tenantCode === scope.tenantCode &&
                    item.enterpriseCode === scope.enterpriseCode,
            )
        )
            owner.reject('ERR_CPP_00002');
        const period = owner.period(policy);
        return this.project(
            request,
            policy,
            scope,
            period,
            await owner.read(request, scope, period),
        );
    },
    /** Validates inert command values without accepting identity, grants or runtime settings. @param {Object} request Trusted request with body. @returns {Object} Normalized command. */
    command: function (request) {
        const input = request.body,
            owner = this.usage();
        const keys = [
            'target',
            'principalCode',
            'limit',
            'reason',
            'changeId',
            'periodKey',
            'policyDigest',
            'expectedRevision',
            'confirmed',
        ];
        if (
            !input ||
            typeof input !== 'object' ||
            Array.isArray(input) ||
            Object.keys(input).some((key) => !keys.includes(key)) ||
            !['ENTERPRISE', 'USER'].includes(input.target) ||
            !owner.count(input.limit) ||
            typeof input.reason !== 'string' ||
            !input.reason.trim() ||
            input.reason.length > 500 ||
            !owner.identifier(input.changeId) ||
            input.changeId === 'initial' ||
            !owner.identifier(input.expectedRevision) ||
            !owner.identifier(input.periodKey) ||
            typeof input.policyDigest !== 'string' ||
            !/^[a-f0-9]{64}$/.test(input.policyDigest) ||
            (input.target === 'USER'
                ? !owner.identifier(input.principalCode)
                : input.principalCode !== null)
        )
            owner.reject('ERR_CPP_00005');
        return {
            target: input.target,
            principalCode: input.principalCode,
            limit: input.limit,
            reason: input.reason.trim(),
            changeId: input.changeId,
            periodKey: input.periodKey,
            policyDigest: input.policyDigest,
            expectedRevision: input.expectedRevision,
        };
    },
    /** Revalidates a command against current policy, period and allocation revision. @param {Object} command Normalized command. @param {Object} snapshot Current authorized projection. @returns {Object} Bounded impact. */
    impact: function (command, snapshot) {
        const owner = this.usage();
        if (
            command.periodKey !== snapshot.period.key ||
            command.policyDigest !== snapshot.policyDigest ||
            command.expectedRevision !== snapshot.revision
        )
            owner.reject('ERR_CPP_00006');
        const target =
            command.target === 'ENTERPRISE'
                ? snapshot.enterprise
                : snapshot.users.find(
                      (item) => item.principalCode === command.principalCode,
                  );
        if (!target || command.limit > target.ceiling)
            owner.reject('ERR_CPP_00005');
        return {
            before: target.limit,
            after: command.limit,
            committed: target.consumed + target.reserved,
            belowCommitted: command.limit < target.consumed + target.reserved,
        };
    },
    /** Previews a permissioned change without modifying data. @param {Object} request Trusted command request. @param {Object} policy Effective policy. @returns {Promise<Object>} Confirmation impact. */
    preview: async function (request, policy) {
        const command = this.command(request);
        this.authorize(request, command.target);
        const snapshot = await this.get(request, policy);
        return {
            contractVersion: 1,
            context: snapshot.context,
            command,
            impact: this.impact(command, snapshot),
        };
    },
    /** Saves one explicitly confirmed allocation and its audit atomically; uncertain acknowledgements never trigger a second write. @param {Object} request Trusted command request. @param {Object} policy Effective policy. @returns {Promise<Object>} Fresh authorized projection. */
    change: async function (request, policy) {
        const command = this.command(request),
            scope = this.authorize(request, command.target),
            owner = this.usage();
        if (request.body.confirmed !== true) owner.reject('ERR_CPP_00005');
        owner.validate(policy);
        const period = owner.period(policy);
        if (
            period.key !== command.periodKey ||
            command.policyDigest !== this.policyDigest(policy, scope)
        )
            owner.reject('ERR_CPP_00006');
        const digest = this.digest({ scope, command });
        for (let attempt = 0; attempt < policy.maximumAttempts; attempt++) {
            const current = await owner.read(request, scope, period),
                journal = current ? current.journal : { items: [] };
            const existing = (journal.allocationChanges || []).find(
                (item) => item.changeId === command.changeId,
            );
            if (existing) {
                if (existing.digest !== digest) owner.reject('ERR_CPP_00006');
                return this.project(request, policy, scope, period, current);
            }
            const snapshot = this.project(
                    request,
                    policy,
                    scope,
                    period,
                    current,
                ),
                impact = this.impact(command, snapshot);
            if ((journal.allocationChanges || []).length >= 500)
                owner.reject('ERR_CPP_00001');
            const allocation = {
                enterpriseCode: scope.enterpriseCode,
                principalCode: command.principalCode,
                limit: command.limit,
            };
            const next = {
                ...journal,
                allocations: (journal.allocations || [])
                    .filter(
                        (item) =>
                            item.enterpriseCode !== scope.enterpriseCode ||
                            item.principalCode !== command.principalCode,
                    )
                    .concat(allocation),
                allocationChanges: (journal.allocationChanges || []).concat({
                    changeId: command.changeId,
                    enterpriseCode: scope.enterpriseCode,
                    actor: scope.principalCode,
                    target: command.target,
                    principalCode: command.principalCode,
                    before: impact.before,
                    after: impact.after,
                    reason: command.reason,
                    createdAt: new Date().toISOString(),
                    digest,
                }),
            };
            if (await owner.write(current, next, request, scope, period))
                return this.project(request, policy, scope, period, {
                    journal: next,
                });
        }
        return owner.reject('ERR_CPP_00001');
    },
};
