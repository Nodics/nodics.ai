/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const CONTRACT_SOURCE = 'nodics.platform/modules/installer/llm/contracts/installer-api-scope-contract.md';

const OPERATION_GROUPS = Object.freeze([
    'DISCOVERY',
    'WORKSPACE_READINESS',
    'SETUP_PLANNING',
    'EVIDENCE_READ',
    'LIFECYCLE',
    'EXPANSION',
    'MAINTENANCE'
]);

const OPERATION_STATES = Object.freeze([
    'AVAILABLE',
    'PREVIEW',
    'DISABLED',
    'RESERVED',
    'HIDDEN'
]);

const OPERATION_INTENTS = Object.freeze([
    'READ',
    'VERIFY',
    'PLAN',
    'EXPORT',
    'REPAIR',
    'LIFECYCLE',
    'EXPAND'
]);

const OPERATION_RISK_LEVELS = Object.freeze([
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
]);

const OPERATION_PHASES = Object.freeze([
    'READ_ONLY_DISCOVERY',
    'RESERVED_MUTATING'
]);

const REQUIRED_OPERATION_FIELDS = Object.freeze([
    'code',
    'label',
    'group',
    'state',
    'intent',
    'mutating',
    'permission',
    'route',
    'method',
    'summary',
    'riskLevel',
    'requiresWorkspace',
    'requiresIdempotencyKey',
    'phase',
    'ownerModule',
    'sourceOfTruth'
]);

const GROUP_ORDER = OPERATION_GROUPS.reduce((index, group, position) => {
    index[group] = position;
    return index;
}, {});

/**
 * @module installer/service/DefaultInstallerOperationCatalogValidationService
 * @description Validates Application Builder operation metadata before it can be exposed to Axis or APIs.
 * @layer service
 * @owner installer
 * @override Add new states or mutating operation rules only after the installer API scope contract and action ledger are updated.
 */
module.exports = {
    CONTRACT_SOURCE,
    OPERATION_GROUPS,
    OPERATION_STATES,
    OPERATION_INTENTS,
    OPERATION_RISK_LEVELS,
    OPERATION_PHASES,
    REQUIRED_OPERATION_FIELDS,

    /** Throws a validation error with a concise catalog message. */
    fail: function (message) {
        throw new Error(message);
    },

    /** Requires a non-empty string field on an operation record. */
    assertString: function (operation, field) {
        if (typeof operation[field] !== 'string' || operation[field].trim() === '') {
            this.fail(`Installer operation ${operation.code || '<unknown>'} must define string field ${field}`);
        }
    },

    /** Requires a boolean field on an operation record. */
    assertBoolean: function (operation, field) {
        if (typeof operation[field] !== 'boolean') {
            this.fail(`Installer operation ${operation.code || '<unknown>'} must define boolean field ${field}`);
        }
    },

    /** Derives whether the operation is currently executable through secured APIs. */
    deriveExecutable: function (operation) {
        return operation.state === 'AVAILABLE' && operation.mutating === false;
    },

    /** Validates permission alignment for operation group and lifecycle state. */
    validatePermission: function (operation) {
        if (operation.group === 'SETUP_PLANNING' && operation.permission !== 'installer.workspace.plan') {
            this.fail(`Installer operation ${operation.code} must use installer.workspace.plan`);
        }
        if (operation.group === 'EVIDENCE_READ' && operation.permission !== 'installer.workspace.evidence.read') {
            this.fail(`Installer operation ${operation.code} must use installer.workspace.evidence.read`);
        }
        if (operation.group === 'WORKSPACE_READINESS' && operation.permission !== 'installer.workspace.view') {
            this.fail(`Installer operation ${operation.code} must use installer.workspace.view`);
        }
        if (operation.phase === 'RESERVED_MUTATING' &&
            ![
                'installer.workspace.operate',
                'installer.workspace.support',
                'installer.workspace.expand'
            ].includes(operation.permission)) {
            this.fail(`Reserved mutating installer operation ${operation.code} must use a reserved mutating permission`);
        }
    },

    /** Validates one operation catalog record against the installer API scope contract. */
    validateOperation: function (operation) {
        REQUIRED_OPERATION_FIELDS.forEach(field => {
            if (!Object.prototype.hasOwnProperty.call(operation, field)) {
                this.fail(`Installer operation ${operation.code || '<unknown>'} is missing field ${field}`);
            }
        });

        [
            'code',
            'label',
            'group',
            'state',
            'intent',
            'permission',
            'route',
            'method',
            'summary',
            'riskLevel',
            'phase',
            'ownerModule',
            'sourceOfTruth'
        ].forEach(field => this.assertString(operation, field));

        [
            'mutating',
            'requiresWorkspace',
            'requiresIdempotencyKey'
        ].forEach(field => this.assertBoolean(operation, field));

        if (!OPERATION_GROUPS.includes(operation.group)) {
            this.fail(`Installer operation ${operation.code} has invalid group ${operation.group}`);
        }
        if (!OPERATION_STATES.includes(operation.state)) {
            this.fail(`Installer operation ${operation.code} has invalid state ${operation.state}`);
        }
        if (!OPERATION_INTENTS.includes(operation.intent)) {
            this.fail(`Installer operation ${operation.code} has invalid intent ${operation.intent}`);
        }
        if (!OPERATION_RISK_LEVELS.includes(operation.riskLevel)) {
            this.fail(`Installer operation ${operation.code} has invalid riskLevel ${operation.riskLevel}`);
        }
        if (!OPERATION_PHASES.includes(operation.phase)) {
            this.fail(`Installer operation ${operation.code} has invalid phase ${operation.phase}`);
        }
        if (operation.ownerModule !== 'installer') {
            this.fail(`Installer operation ${operation.code} must be owned by installer`);
        }
        if (operation.sourceOfTruth !== CONTRACT_SOURCE) {
            this.fail(`Installer operation ${operation.code} must reference ${CONTRACT_SOURCE}`);
        }
        if (!operation.route.startsWith('/nodics/installer/v0/')) {
            this.fail(`Installer operation ${operation.code} route must stay under /nodics/installer/v0`);
        }
        if (!['GET', 'POST'].includes(operation.method)) {
            this.fail(`Installer operation ${operation.code} must use GET or POST`);
        }
        if (operation.method === 'GET' && operation.requiresWorkspace === true) {
            this.fail(`Workspace-sensitive installer operation ${operation.code} must use POST`);
        }
        if (operation.state === 'AVAILABLE' && operation.mutating === true) {
            this.fail(`Mutating installer operation ${operation.code} cannot be AVAILABLE`);
        }
        if (operation.phase === 'READ_ONLY_DISCOVERY' && operation.mutating === true) {
            this.fail(`Read-only discovery installer operation ${operation.code} must be read-only`);
        }
        if (operation.phase === 'READ_ONLY_DISCOVERY' && operation.requiresIdempotencyKey === true) {
            this.fail(`Read-only discovery installer operation ${operation.code} must not require idempotency`);
        }
        if (operation.phase === 'RESERVED_MUTATING' && operation.mutating === false) {
            this.fail(`Reserved mutating installer operation ${operation.code} must be marked mutating`);
        }
        if (operation.phase === 'RESERVED_MUTATING' && operation.requiresIdempotencyKey === false) {
            this.fail(`Reserved mutating installer operation ${operation.code} must require idempotency`);
        }

        this.validatePermission(operation);

        return true;
    },

    /** Normalizes executable metadata after validation. */
    normalizeOperation: function (operation) {
        this.validateOperation(operation);
        return Object.freeze(Object.assign({}, operation, {
            executable: this.deriveExecutable(operation)
        }));
    },

    /** Sorts operation records into the stable Axis navigation order. */
    sortOperations: function (operations) {
        return operations.slice().sort((left, right) => {
            const groupResult = GROUP_ORDER[left.group] - GROUP_ORDER[right.group];
            if (groupResult !== 0) {
                return groupResult;
            }
            return left.code.localeCompare(right.code);
        });
    },

    /** Validates the full operation catalog and rejects duplicate operation codes. */
    validateOperationCatalog: function (operations) {
        const seenCodes = new Set();
        operations.forEach(operation => {
            this.validateOperation(operation);
            if (seenCodes.has(operation.code)) {
                this.fail(`Installer operation catalog contains duplicate code ${operation.code}`);
            }
            seenCodes.add(operation.code);
        });
        return true;
    }
};
