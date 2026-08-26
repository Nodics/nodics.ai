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
    'FUTURE',
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
    'PHASE_1_READ_ONLY',
    'FUTURE_MUTATING'
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

function fail(message) {
    throw new Error(message);
}

function assertString(operation, field) {
    if (typeof operation[field] !== 'string' || operation[field].trim() === '') {
        fail(`Installer operation ${operation.code || '<unknown>'} must define string field ${field}`);
    }
}

function assertBoolean(operation, field) {
    if (typeof operation[field] !== 'boolean') {
        fail(`Installer operation ${operation.code || '<unknown>'} must define boolean field ${field}`);
    }
}

function deriveExecutable(operation) {
    return operation.state === 'AVAILABLE' && operation.mutating === false;
}

function validatePermission(operation) {
    if (operation.group === 'SETUP_PLANNING' && operation.permission !== 'installer.workspace.plan') {
        fail(`Installer operation ${operation.code} must use installer.workspace.plan`);
    }
    if (operation.group === 'EVIDENCE_READ' && operation.permission !== 'installer.workspace.evidence.read') {
        fail(`Installer operation ${operation.code} must use installer.workspace.evidence.read`);
    }
    if (operation.group === 'WORKSPACE_READINESS' && operation.permission !== 'installer.workspace.view') {
        fail(`Installer operation ${operation.code} must use installer.workspace.view`);
    }
    if (operation.phase === 'FUTURE_MUTATING' &&
        ![
            'installer.workspace.operate',
            'installer.workspace.support',
            'installer.workspace.expand'
        ].includes(operation.permission)) {
        fail(`Future mutating installer operation ${operation.code} must use a reserved mutating permission`);
    }
}

function validateOperation(operation) {
    REQUIRED_OPERATION_FIELDS.forEach(field => {
        if (!Object.prototype.hasOwnProperty.call(operation, field)) {
            fail(`Installer operation ${operation.code || '<unknown>'} is missing field ${field}`);
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
    ].forEach(field => assertString(operation, field));

    [
        'mutating',
        'requiresWorkspace',
        'requiresIdempotencyKey'
    ].forEach(field => assertBoolean(operation, field));

    if (!OPERATION_GROUPS.includes(operation.group)) {
        fail(`Installer operation ${operation.code} has invalid group ${operation.group}`);
    }
    if (!OPERATION_STATES.includes(operation.state)) {
        fail(`Installer operation ${operation.code} has invalid state ${operation.state}`);
    }
    if (!OPERATION_INTENTS.includes(operation.intent)) {
        fail(`Installer operation ${operation.code} has invalid intent ${operation.intent}`);
    }
    if (!OPERATION_RISK_LEVELS.includes(operation.riskLevel)) {
        fail(`Installer operation ${operation.code} has invalid riskLevel ${operation.riskLevel}`);
    }
    if (!OPERATION_PHASES.includes(operation.phase)) {
        fail(`Installer operation ${operation.code} has invalid phase ${operation.phase}`);
    }
    if (operation.ownerModule !== 'installer') {
        fail(`Installer operation ${operation.code} must be owned by installer`);
    }
    if (operation.sourceOfTruth !== CONTRACT_SOURCE) {
        fail(`Installer operation ${operation.code} must reference ${CONTRACT_SOURCE}`);
    }
    if (!operation.route.startsWith('/nodics/installer/v0/')) {
        fail(`Installer operation ${operation.code} route must stay under /nodics/installer/v0`);
    }
    if (!['GET', 'POST'].includes(operation.method)) {
        fail(`Installer operation ${operation.code} must use GET or POST`);
    }
    if (operation.method === 'GET' && operation.requiresWorkspace === true) {
        fail(`Workspace-sensitive installer operation ${operation.code} must use POST`);
    }
    if (operation.state === 'AVAILABLE' && operation.mutating === true) {
        fail(`Mutating installer operation ${operation.code} cannot be AVAILABLE`);
    }
    if (operation.phase === 'PHASE_1_READ_ONLY' && operation.mutating === true) {
        fail(`Phase 1 installer operation ${operation.code} must be read-only`);
    }
    if (operation.phase === 'PHASE_1_READ_ONLY' && operation.requiresIdempotencyKey === true) {
        fail(`Phase 1 installer operation ${operation.code} must not require idempotency`);
    }
    if (operation.phase === 'FUTURE_MUTATING' && operation.mutating === false) {
        fail(`Future mutating installer operation ${operation.code} must be marked mutating`);
    }
    if (operation.phase === 'FUTURE_MUTATING' && operation.requiresIdempotencyKey === false) {
        fail(`Future mutating installer operation ${operation.code} must require idempotency`);
    }

    validatePermission(operation);

    return true;
}

function normalizeOperation(operation) {
    validateOperation(operation);
    return Object.freeze(Object.assign({}, operation, {
        executable: deriveExecutable(operation)
    }));
}

function sortOperations(operations) {
    return operations.slice().sort((left, right) => {
        const groupResult = GROUP_ORDER[left.group] - GROUP_ORDER[right.group];
        if (groupResult !== 0) {
            return groupResult;
        }
        return left.code.localeCompare(right.code);
    });
}

function validateOperationCatalog(operations) {
    const seenCodes = new Set();
    operations.forEach(operation => {
        validateOperation(operation);
        if (seenCodes.has(operation.code)) {
            fail(`Installer operation catalog contains duplicate code ${operation.code}`);
        }
        seenCodes.add(operation.code);
    });
    return true;
}

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
    deriveExecutable,
    normalizeOperation,
    sortOperations,
    validateOperation,
    validateOperationCatalog
};
