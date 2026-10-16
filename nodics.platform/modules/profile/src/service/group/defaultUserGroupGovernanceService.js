/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/group/DefaultUserGroupGovernanceService
 * @description Validates active user-group inheritance, permission catalog membership, and acyclic group graphs before persistence.
 * @layer service
 * @owner profile
 * @override Project modules may extend the permission catalog and graph policy through later layers.
 */
module.exports = {
    /** Requires fresh Platform authority for shared group removal; existing removal stamp hooks remain mandatory. */
    validateRemoval: async function (request) {
        await SERVICE.DefaultIdentityCatalogueGovernanceService.authorize(request);
        return true;
    },
    /** Normalizes referenced parent-group codes. */
    normalizeParents: function (parents) {
        return (parents || []).map(parent => UTILS.isObject(parent) ? parent.code : parent).filter(Boolean);
    },
    /** Normalizes update operators into validation models. */
    normalizeModels: function (model) {
        return Array.isArray(model) ? model : [model || {}];
    },
    /** Applies update operators to a persisted group for effective-state validation. */
    applyUpdate: function (existing, update) {
        if (Object.keys(update || {}).some(key => key.startsWith('$') && !['$set', '$unset'].includes(key)) ||
            [update || {}, update && update.$set || {}, update && update.$unset || {}].some(values =>
                Object.keys(values).some(key => key.includes('.'))))
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Group updates require complete governed field values');
        let effective = Object.assign({}, existing || {});
        Object.keys(update || {}).filter(key => !key.startsWith('$')).forEach(key => { effective[key] = update[key]; });
        Object.assign(effective, update && update.$set || {});
        Object.keys(update && update.$unset || {}).forEach(key => { delete effective[key]; });
        return effective;
    },
    /** Rejects permissions absent from the effective catalog. */
    validatePermissions: async function (models) {
        for (const model of models) {
            SERVICE.DefaultIdentityCatalogueService.codes(model.permissions || [], true, true);
            if ((model.permissions || []).includes('*') && model.code !== 'platformAdministratorUserGroup')
                throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Full access is reserved for the human Platform administrator group');
        }
        await SERVICE.DefaultIdentityCatalogueService.requirePermissions([...new Set(models.flatMap(model => model.permissions || []))]);
    },
    /** Validates parent existence, activity, and graph acyclicity. */
    validateGraph: function (models, existingGroups) {
        let graph = {}, active = {};
        (existingGroups || []).concat(models).forEach(group => {
            if (!group || !group.code) return;
            graph[group.code] = this.normalizeParents(group.parentGroups);
            active[group.code] = group.active !== false;
        });
        Object.keys(graph).forEach(code => graph[code].forEach(parent => {
            if (parent === 'platformAdministratorUserGroup') throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Platform administration cannot be inherited');
            if (parent === code) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'User group cannot inherit itself: ' + code);
            if (!Object.prototype.hasOwnProperty.call(graph, parent)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Unknown parent user group: ' + parent);
            if (active[parent] === false) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Inactive parent user group: ' + parent);
        }));
        let visiting = new Set(), visited = new Set();
        let visit = code => {
            if (visiting.has(code)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Cyclic user-group inheritance detected at: ' + code);
            if (visited.has(code)) return;
            visiting.add(code);
            (graph[code] || []).forEach(visit);
            visiting.delete(code);
            visited.add(code);
        };
        Object.keys(graph).forEach(visit);
    },
    /** Runs complete group governance for save and update requests. */
    validate: async function (request) {
        await SERVICE.DefaultIdentityCatalogueGovernanceService.authorizeGroupMutation(request);
        let updates = this.normalizeModels(request.model);
        let queryCode = request.query && request.query.code;
        let governance = CONFIG.get('identityGovernance') || {};
        return SERVICE.DefaultUserGroupService.get({
            tenant: request.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            options: { recursive: false, skipItemCache: true },
            query: {},
            searchOptions: {
                pageSize: governance.groupValidationPageSize || 10000,
                pageNumber: 1
            }
        }).then(async result => {
            if (!/^SUC_/.test(result?.code || '') || result.success === false || result.error ||
                result.errors && (!Array.isArray(result.errors) || result.errors.length) ||
                !Array.isArray(result.result) || result.count !== result.result.length)
                throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Complete fresh group inventory is required');
            let existingGroups = result && result.result || [];
            let targets = [];
            if (request.query) {
                const selected = await SERVICE.DefaultUserGroupService.get({
                    tenant: request.tenant, authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                    query: request.query, options: { recursive: false, skipItemCache: true },
                    searchOptions: { pageSize: governance.groupValidationPageSize || 10000, pageNumber: 1 }
                });
                if (!/^SUC_/.test(selected?.code || '') || selected.success === false || selected.error ||
                    selected.errors && (!Array.isArray(selected.errors) || selected.errors.length) ||
                    !Array.isArray(selected.result) || selected.count !== selected.result.length)
                    throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Complete fresh group targets are required');
                targets = selected.result;
            }
            let models = targets.length ? targets.map(existing => {
                const update = updates.find(model => model.code === existing.code) || updates[0];
                const next = this.applyUpdate(existing, update);
                if (next.code !== existing.code) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Group identity cannot change');
                return next;
            }) : updates.map(update => {
                let code = update.code || update.$set && update.$set.code || queryCode;
                let existing = existingGroups.find(group => group.code === code);
                return this.applyUpdate(existing, Object.assign({}, update, code ? { code: code } : {}));
            });
            await this.validatePermissions(models);
            this.validateGraph(models, existingGroups);
            return true;
        });
    }
};
