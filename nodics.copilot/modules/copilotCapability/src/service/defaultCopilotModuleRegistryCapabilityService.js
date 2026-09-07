/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotCapability/service/DefaultCopilotModuleRegistryCapabilityService @description Provides bounded read-only Copilot projections over the authorized BackOffice Module Registry. @layer service @owner copilotCapability @override Projects may tighten limits and fields without bypassing BackOffice authority. */
module.exports = {
    /** Resolves the caller-authorized module registry projection. */
    snapshot: async function (request, configuration) {
        const permissions = request && request.authData && request.authData.permissions || [];
        if (!permissions.includes('*') && !permissions.includes('backoffice.registry.view')) throw new Error('COPILOT_CAPABILITY_FORBIDDEN');
        const response = await SERVICE.DefaultBackofficeRegistryService.list(request);
        const modules = response && response.data && response.data.modules || {};
        const maximum = Number((configuration || {}).maximumModuleRows || 500);
        const names = Object.keys(modules).sort();
        const items = names.slice(0, maximum).map(moduleName => ({
            moduleName: moduleName,
            activeInstances: modules[moduleName].length,
            states: Array.from(new Set(modules[moduleName].map(instance => instance.state || 'UNKNOWN'))).sort()
        }));
        return { count: names.length, truncated: names.length > maximum, modules: items, observedAt: new Date().toISOString() };
    },
    /** Returns a bounded list or exact current count without provider inference. */
    invoke: async function (operation, request, configuration) {
        const snapshot = await this.snapshot(request, configuration);
        if (operation === 'framework.modules.count') return { count: snapshot.count, truncated: snapshot.truncated, observedAt: snapshot.observedAt };
        if (operation === 'framework.modules.list') return snapshot;
        const requested = String(request.moduleName || '').trim();
        if (operation === 'framework.modules.describe' && requested) {
            const item = snapshot.modules.find(module => module.moduleName.toLowerCase() === requested.toLowerCase());
            if (!item) throw new Error('COPILOT_MODULE_NOT_FOUND');
            return item;
        }
        throw new Error('COPILOT_CAPABILITY_UNAVAILABLE');
    }
};
