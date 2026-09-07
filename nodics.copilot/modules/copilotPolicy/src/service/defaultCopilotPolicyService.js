/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

const crypto = require('node:crypto');

/** @module copilotPolicy/src/service/defaultCopilotPolicyService @description Produces immutable, provider-neutral, fail-closed security decisions for Copilot channels, knowledge, capabilities, confirmations, and execution. @layer service @owner copilotPolicy @override Projects may tighten policy but must not weaken public, tenant, permission, or execution invariants. */
module.exports = {
    /** Returns whether the trusted permission projection grants one permission. */
    hasPermission: function (context, permission) { const values = context && context.permissions || []; return values.includes('*') || values.includes(permission); },
    /** Produces a deterministic digest binding confirmation to the exact mutation payload. */
    planDigest: function (plan) {
        const value = { id: plan.id, schema: plan.schema, records: plan.records, preview: plan.preview };
        return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
    },
    /** Recursively freezes policy inputs and decisions. @param {*} value Value to freeze. @returns {*} Frozen value. */
    deepFreeze: function (value) {
        if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
        Object.keys(value).forEach(key => this.deepFreeze(value[key]));
        return Object.freeze(value);
    },
    /** Normalizes one trusted caller context. @param {Object} input Trusted identity projection. @param {Object} configuration Effective policy configuration. @returns {Object} Immutable security context. */
    normalizeSecurityContext: function (input, configuration) {
        const source = input || {};
        const allowedChannels = (configuration || {}).channels || ['NEXUS_PUBLIC', 'NEXUS_CUSTOMER', 'AXIS_EMPLOYEE', 'SYSTEM'];
        const channel = String(source.channel || '').trim().toUpperCase();
        if (!allowedChannels.includes(channel)) throw new Error('COPILOT_SECURITY_CONTEXT_INVALID');
        const actor = source.actor === undefined || source.actor === null ? null : String(source.actor).trim();
        const tenant = source.tenant === undefined || source.tenant === null ? null : String(source.tenant).trim();
        const customer = source.customer === undefined || source.customer === null ? null : String(source.customer).trim();
        if (channel !== 'NEXUS_PUBLIC' && !actor) throw new Error('COPILOT_SECURITY_CONTEXT_INVALID');
        if (['NEXUS_CUSTOMER', 'AXIS_EMPLOYEE'].includes(channel) && !tenant) throw new Error('COPILOT_SECURITY_CONTEXT_INVALID');
        if (channel === 'NEXUS_CUSTOMER' && !customer) throw new Error('COPILOT_SECURITY_CONTEXT_INVALID');
        return this.deepFreeze({
            channel: channel,
            actor: actor || 'anonymous',
            principalType: channel === 'NEXUS_PUBLIC' ? 'ANONYMOUS' : String(source.principalType || (channel === 'SYSTEM' ? 'SERVICE' : 'USER')).toUpperCase(),
            tenant: tenant,
            enterprise: source.enterprise ? String(source.enterprise) : null,
            customer: customer,
            customerProject: source.customerProject ? String(source.customerProject) : null,
            environment: source.environment ? String(source.environment) : null,
            permissions: channel === 'NEXUS_PUBLIC' ? [] : Array.from(new Set(Array.isArray(source.permissions) ? source.permissions.map(String) : [])).sort(),
            roles: channel === 'NEXUS_PUBLIC' ? [] : Array.from(new Set(Array.isArray(source.roles) ? source.roles.map(String) : [])).sort(),
            groups: channel === 'NEXUS_PUBLIC' ? [] : Array.from(new Set(Array.isArray(source.groups) ? source.groups.map(String) : [])).sort(),
            correlationId: source.correlationId ? String(source.correlationId) : null
        });
    },
    /** Builds an immutable allow or deny decision. @param {boolean} allowed Result. @param {string} reason Stable reason. @param {Object} context Decision metadata. @returns {Object} Decision. */
    decision: function (allowed, reason, context) {
        return this.deepFreeze({ allowed: allowed === true, reason: reason, context: Object.assign({}, context || {}) });
    },
    /** Checks that all descriptor restrictions match the security context. @param {Object} descriptor Restricted descriptor. @param {Object} context Security context. @returns {Object} Decision. */
    assessRestrictions: function (descriptor, context) {
        const source = descriptor || {};
        if (Array.isArray(source.allowedChannels) && source.allowedChannels.length && !source.allowedChannels.includes(context.channel)) return this.decision(false, 'CHANNEL_FORBIDDEN');
        if (Array.isArray(source.tenantScopes) && source.tenantScopes.length && !source.tenantScopes.includes(context.tenant)) return this.decision(false, 'TENANT_SCOPE_FORBIDDEN');
        if (Array.isArray(source.enterpriseScopes) && source.enterpriseScopes.length && !source.enterpriseScopes.includes(context.enterprise)) return this.decision(false, 'ENTERPRISE_SCOPE_FORBIDDEN');
        if (Array.isArray(source.customerScopes) && source.customerScopes.length && !source.customerScopes.includes(context.customer)) return this.decision(false, 'CUSTOMER_SCOPE_FORBIDDEN');
        if (Array.isArray(source.customerProjectScopes) && source.customerProjectScopes.length && !source.customerProjectScopes.includes(context.customerProject)) return this.decision(false, 'CUSTOMER_PROJECT_SCOPE_FORBIDDEN');
        if (Array.isArray(source.environmentScopes) && source.environmentScopes.length && !source.environmentScopes.includes(context.environment)) return this.decision(false, 'ENVIRONMENT_SCOPE_FORBIDDEN');
        if (Array.isArray(source.requiredPermissions) && source.requiredPermissions.some(permission => !context.permissions.includes(permission))) return this.decision(false, 'PERMISSION_FORBIDDEN');
        if (Array.isArray(source.requiredRoles) && source.requiredRoles.some(role => !context.roles.includes(role))) return this.decision(false, 'ROLE_FORBIDDEN');
        if (Array.isArray(source.requiredGroups) && source.requiredGroups.some(group => !context.groups.includes(group))) return this.decision(false, 'GROUP_FORBIDDEN');
        return this.decision(true, 'RESTRICTIONS_SATISFIED');
    },
    /** Decides whether one classified source may be retrieved. @param {Object} source Source descriptor. @param {Object} context Security context. @param {Object} configuration Effective policy configuration. @returns {Object} Immutable decision. */
    decideSourceAccess: function (source, context, configuration) {
        if (!source || !source.classification || !context || !context.channel) return this.decision(false, 'SECURITY_METADATA_MISSING');
        const classification = String(source.classification).toUpperCase();
        if (!['PUBLIC', 'CUSTOMER', 'INTERNAL', 'RESTRICTED'].includes(classification)) return this.decision(false, 'CLASSIFICATION_INVALID');
        if (context.channel === 'NEXUS_PUBLIC') {
            const publicAllowed = classification === 'PUBLIC' && source.public === true && source.lifecycle === 'ONLINE' && source.mutates !== true;
            if (!publicAllowed) return this.decision(false, 'PUBLIC_SOURCE_FORBIDDEN');
            const publicRestrictions = this.assessRestrictions(source, context);
            return publicRestrictions.allowed ? this.decision(true, 'PUBLIC_SOURCE_ALLOWED') : publicRestrictions;
        }
        if (context.channel === 'NEXUS_CUSTOMER' && !['PUBLIC', 'CUSTOMER'].includes(classification)) return this.decision(false, 'CUSTOMER_SOURCE_FORBIDDEN');
        const permissionNames = (configuration || {}).permissions || {};
        if (classification === 'CUSTOMER' && context.channel === 'AXIS_EMPLOYEE' && !context.permissions.includes(permissionNames.customerKnowledge || 'copilot.knowledge.customer.read')) return this.decision(false, 'CUSTOMER_KNOWLEDGE_PERMISSION_REQUIRED');
        if (classification === 'INTERNAL' && !context.permissions.includes(permissionNames.internalKnowledge || 'copilot.knowledge.internal.read') && context.channel !== 'SYSTEM') return this.decision(false, 'INTERNAL_KNOWLEDGE_PERMISSION_REQUIRED');
        if (classification === 'RESTRICTED' && !context.permissions.includes(permissionNames.restrictedKnowledge || 'copilot.knowledge.restricted.read') && context.channel !== 'SYSTEM') return this.decision(false, 'RESTRICTED_KNOWLEDGE_PERMISSION_REQUIRED');
        const restrictions = this.assessRestrictions(source, context);
        return restrictions.allowed ? this.decision(true, 'SOURCE_ALLOWED', { classification: classification }) : restrictions;
    },
    /** Decides whether a capability may be shown or invoked. @param {Object} capability Capability descriptor. @param {Object} context Security context. @returns {Object} Immutable decision. */
    decideCapabilityAccess: function (capability, context) {
        if (!capability || !capability.code || !capability.riskClass || !context || !context.channel) return this.decision(false, 'CAPABILITY_SECURITY_METADATA_MISSING');
        const riskClass = String(capability.riskClass).toUpperCase();
        if (!['PUBLIC_READ', 'AUTHENTICATED_SELF_READ', 'INTERNAL_READ', 'SENSITIVE_READ', 'EXPORT', 'CREATE', 'UPDATE', 'DELETE', 'ADMINISTRATIVE'].includes(riskClass)) return this.decision(false, 'CAPABILITY_RISK_CLASS_INVALID');
        if (riskClass === 'PUBLIC_READ' && capability.public !== true) return this.decision(false, 'PUBLIC_CAPABILITY_METADATA_INVALID');
        const mutating = capability.mutates === true || ['CREATE', 'UPDATE', 'DELETE', 'ADMINISTRATIVE'].includes(riskClass);
        if (context.channel === 'NEXUS_PUBLIC') {
            const allowed = riskClass === 'PUBLIC_READ' && capability.public === true && !mutating && capability.export !== true;
            return this.decision(allowed, allowed ? 'PUBLIC_CAPABILITY_ALLOWED' : 'PUBLIC_CAPABILITY_FORBIDDEN');
        }
        if (context.channel === 'NEXUS_CUSTOMER' && !['PUBLIC_READ', 'AUTHENTICATED_SELF_READ'].includes(riskClass)) return this.decision(false, 'CUSTOMER_CAPABILITY_FORBIDDEN');
        if (capability.permission && !this.hasPermission(context, capability.permission)) return this.decision(false, 'CAPABILITY_PERMISSION_REQUIRED');
        if (riskClass !== 'PUBLIC_READ' && !capability.permission && context.channel !== 'SYSTEM') return this.decision(false, 'CAPABILITY_PERMISSION_MISSING');
        const restrictions = this.assessRestrictions(capability, context);
        return restrictions.allowed ? this.decision(true, 'CAPABILITY_ALLOWED', { riskClass: riskClass }) : restrictions;
    },
    /** Throws a stable error when a decision denies access. @param {Object} decision Policy decision. @param {string} errorCode Stable error code. @returns {true} True when allowed. */
    assertAllowed: function (decision, errorCode) {
        if (!decision || decision.allowed !== true) throw new Error(errorCode || 'COPILOT_POLICY_FORBIDDEN');
        return true;
    },
    /** Detects materially incomplete intent. @param {Object} intent Parsed intent. @returns {Object} Clarification decision. */
    assessAmbiguity: function (intent) {
        const missing = intent && Array.isArray(intent.required) ? intent.required.filter(key => !intent.values || intent.values[key] === undefined || intent.values[key] === null || intent.values[key] === '') : [];
        return { ambiguous: missing.length > 0, missing: missing, questions: missing.map(key => 'Please provide ' + key + '.') };
    },
    /** Creates a confirmation challenge. @param {Object} plan Prepared plan. @param {Object} context Actor context. @returns {Object} Challenge. */
    createConfirmation: function (plan, context) {
        if (!this.hasPermission(context, 'copilot.mutation.prepare')) throw new Error('COPILOT_MUTATION_PREPARE_FORBIDDEN');
        return { planId: plan.id, planDigest: this.planDigest(plan), tenant: context.tenant, actor: context.actor, preview: plan.preview, expiresAt: Date.now() + 300000, confirmed: false };
    },
    /** Validates execution confirmation. @param {Object} confirmation Challenge. @param {Object} context Actor context. @returns {boolean} True when executable. */
    authorizeExecution: function (confirmation, context, plan) {
        if (!confirmation || confirmation.confirmed !== true) throw new Error('COPILOT_MUTATION_CONFIRMATION_REQUIRED');
        if (confirmation.expiresAt < Date.now()) throw new Error('COPILOT_MUTATION_CONFIRMATION_EXPIRED');
        if (confirmation.tenant !== context.tenant || confirmation.actor !== context.actor) throw new Error('COPILOT_MUTATION_CONTEXT_MISMATCH');
        if (!plan || confirmation.planId !== plan.id || confirmation.planDigest !== this.planDigest(plan)) throw new Error('COPILOT_MUTATION_PLAN_MISMATCH');
        if (!this.hasPermission(context, 'copilot.mutation.execute')) throw new Error('COPILOT_MUTATION_EXECUTE_FORBIDDEN');
        return true;
    }
};
