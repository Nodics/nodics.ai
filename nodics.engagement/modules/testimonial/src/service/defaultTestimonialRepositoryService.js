/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('crypto');
/** @module testimonial/src/service/defaultTestimonialRepositoryService @description Adapts generated testimonial persistence with mandatory tenant filters and internal service identity. @layer service @owner testimonial @override Storage adapters may replace this service without weakening tenant or immutable-version boundaries. */
module.exports = {
    /** Returns the internal generated-service access identity. */
    internalAccess: function () { return { userGroups: ['serviceAccountUserGroup'] }; },
    /** Resolves one generated schema service by testimonial record type. */
    service: function (type) { let name = 'Default' + type.charAt(0).toUpperCase() + type.slice(1) + 'Service'; if (!SERVICE[name]) { let error = new Error('testimonial persistence service unavailable: ' + name); error.code = 'ERR_TESTIMONIAL_00001'; throw error; } return SERVICE[name]; },
    /** Normalizes base persistence fields and date values. */
    model: function (value) { let now = new Date(); return Object.assign({ active: true, code: crypto.randomUUID(), created: now, updated: now }, value); },
    /** Saves one tenant-scoped testimonial record. */
    save: function (type, tenant, value, authData) { if (!tenant || value.tenant !== tenant) return Promise.reject(SERVICE.DefaultTestimonialPolicyService.error('ERR_TESTIMONIAL_00008', 'tenant mismatch')); return this.service(type).save({ tenant: tenant, authData: authData || this.internalAccess(), model: this.model(value) }).then(response => response.result || response); },
    /** Gets one tenant-scoped testimonial record by code. */
    get: function (type, tenant, code, authData) { return this.service(type).get({ tenant: tenant, authData: authData || this.internalAccess(), query: { tenant: tenant, code: code }, searchOptions: { limit: 1 } }).then(response => (response.result || [])[0]); },
    /** Lists a bounded tenant-scoped testimonial record set. */
    list: function (type, tenant, query, authData, limit) { return this.service(type).get({ tenant: tenant, authData: authData || this.internalAccess(), query: Object.assign({ tenant: tenant }, query || {}), searchOptions: { limit: Math.min(Number(limit || 25), 100) } }).then(response => response.result || []); }
};
