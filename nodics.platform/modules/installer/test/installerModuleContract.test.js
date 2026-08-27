/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '../../../..');
const platformPackage = require(path.join(root, 'nodics.platform/package.json'));
const modulePackage = require(path.resolve(__dirname, '../package.json'));
const lifecycle = require(path.resolve(__dirname, '../nodics.js'));
const properties = require(path.resolve(__dirname, '../config/properties.js'));
const router = require(path.resolve(__dirname, '../src/router/routers.js'));
const apiContracts = require(path.resolve(__dirname, '../src/schemas/apiContracts.js'));
const controller = require(path.resolve(__dirname, '../src/controller/defaultInstallerApplicationBuilderController.js'));
const facade = require(path.resolve(__dirname, '../src/facade/defaultInstallerApplicationBuilderFacade.js'));
const operationCatalog = require(path.resolve(__dirname, '../src/service/defaultInstallerOperationCatalogService.js'));
const operationValidator = require(path.resolve(
    __dirname,
    '../src/service/defaultInstallerOperationCatalogValidationService.js'
));
const permissionService = require(path.resolve(__dirname, '../src/service/defaultInstallerPermissionService.js'));
const redactionService = require(path.resolve(__dirname, '../src/service/defaultInstallerRedactionService.js'));
const responseService = require(path.resolve(__dirname, '../src/service/defaultInstallerResponseService.js'));
const workspaceBoundary = require(path.resolve(__dirname, '../src/service/defaultInstallerWorkspaceBoundaryService.js'));
const backofficeProvider = require(path.resolve(__dirname, '../src/service/defaultInstallerBackofficeCapabilityService.js'));
const contract = require(path.join(root, 'nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService.js'));
const applicationBuilderServiceSource = fs.readFileSync(path.resolve(
    __dirname,
    '../src/service/defaultInstallerApplicationBuilderService.js'
), 'utf8');

function allRoutes(registry) {
    return Object.values(registry.installer).flatMap(group => Object.values(group));
}

function allowedRequest(workspaceRoot, permissions) {
    return {
        requestId: 'installer-test-request',
        authTokenType: 'access',
        permissions: permissions || [
            'installer.workspace.view',
            'installer.workspace.plan',
            'installer.workspace.evidence.read'
        ],
        payload: {
            workspaceRoot
        }
    };
}

function collectFiles(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }
    const files = [];
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const absolutePath = path.join(directory, entry.name);
        files.push(path.relative(directory, absolutePath));
        if (entry.isDirectory()) {
            collectFiles(absolutePath).forEach(child => files.push(path.join(entry.name, child)));
        }
    });
    return files.sort();
}

async function assertControllerSuccess(operation, request) {
    const result = await controller[operation](request);
    assert(['SUCCESS', 'WARNING'].includes(result.status), `${operation} should succeed or warn`);
    assert.equal(result.contractVersion, responseService.CONTRACT_VERSION);
    assert.equal(result.requestId, 'installer-test-request');
    return result;
}

assert(platformPackage.requiredModules.includes('installer'),
    'nodics.platform must compose the installed-runtime installer capability');

assert.equal(modulePackage.name, 'installer');
assert.equal(modulePackage.nodics.kind, 'capability');
assert.equal(modulePackage.nodics.runtimeModule, true);
assert.equal(modulePackage.nodics.loadableByNodicsModuleLoader, true);
assert.equal(modulePackage.nodics.runtime.router, true,
    'installer read-only APIs must be routable after contract validation');
assert.equal(modulePackage.nodics.runtime.web, false,
    'installer must not contain Axis frontend or browser source');
['schema', 'router', 'controller', 'facade', 'service', 'test', 'llm'].forEach(owner =>
    assert(modulePackage.nodics.owns.includes(owner), `installer must declare ${owner} ownership`));

assert.equal(properties.installer.applicationBuilder.standaloneBootstrapRepository, 'Nodics/nodics.installer');
assert.equal(properties.installer.applicationBuilder.standaloneBootstrapCommand,
    'npx github:Nodics/nodics.installer');
assert.equal(properties.installer.applicationBuilder.latestVerifiedStandaloneVersion, '0.7.2');
assert.equal(properties.installer.applicationBuilder.apiOperationsEnabled, true);
assert.equal(properties.installer.applicationBuilder.mutatingOperationsEnabled, false);
assert.deepEqual(properties.installer.applicationBuilder.protectVendorRepositories, [
    'nodics.ai',
    'nodics.axis'
]);
assert.deepEqual(properties.installer.applicationBuilder.workspace.allowedRoots, []);
[
    'InstallerInfoResponse',
    'InstallerOperationCatalogResponse',
    'WorkspaceStatusRequest',
    'WorkspaceStatusResponse',
    'WorkspaceInventoryRequest',
    'WorkspaceInventoryResponse',
    'WorkspacePreflightRequest',
    'WorkspacePreflightResponse',
    'SetupPlanPreviewRequest',
    'SetupPlanPreviewResponse',
    'EvidenceReadRequest',
    'EvidenceReadResponse',
    'InstallerErrorResponse'
].forEach(contractName => assert(apiContracts[contractName], `Missing installer API contract ${contractName}`));
assert(!applicationBuilderServiceSource.includes('child_process'),
    'read-only installer services must not execute shell commands');

const operations = operationCatalog.listOperations();
assert(operations.some(operation => operation.code === 'workspace.status' && operation.mutating === false));
assert(operations.some(operation => operation.code === 'maintenance.repair' && operation.mutating === true));
assert.equal(operationCatalog.apiOperationsEnabled(), true);

operationValidator.validateOperationCatalog(operations);
assert.deepEqual(operationValidator.OPERATION_GROUPS, [
    'DISCOVERY',
    'WORKSPACE_READINESS',
    'SETUP_PLANNING',
    'EVIDENCE_READ',
    'LIFECYCLE',
    'EXPANSION',
    'MAINTENANCE'
]);
assert.deepEqual(operationValidator.OPERATION_STATES, [
    'AVAILABLE',
    'PREVIEW',
    'DISABLED',
    'RESERVED',
    'HIDDEN'
]);
assert.deepEqual(operationValidator.OPERATION_INTENTS, [
    'READ',
    'VERIFY',
    'PLAN',
    'EXPORT',
    'REPAIR',
    'LIFECYCLE',
    'EXPAND'
]);
assert.deepEqual(operationValidator.OPERATION_RISK_LEVELS, [
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
]);

const expectedFields = [
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
    'sourceOfTruth',
    'executable'
];
operations.forEach(operation => {
    expectedFields.forEach(field => assert(Object.prototype.hasOwnProperty.call(operation, field),
        `operation ${operation.code} must expose ${field}`));
    assert.equal(operation.ownerModule, 'installer');
    assert.equal(operation.sourceOfTruth, operationValidator.CONTRACT_SOURCE);
    assert(operation.route.startsWith('/nodics/installer/v0/'));
});

const sortedOperationCodes = operations.map(operation => operation.code);
assert.deepEqual(sortedOperationCodes, operationValidator.sortOperations(operations).map(operation => operation.code),
    'installer operations must be sorted by group and code');

const readOnlyOperations = operations.filter(operation => operation.phase === 'READ_ONLY_DISCOVERY');
assert(readOnlyOperations.length > 0);
assert(readOnlyOperations.every(operation => operation.mutating === false));
assert(readOnlyOperations.every(operation => operation.requiresIdempotencyKey === false));
assert(readOnlyOperations.every(operation => operation.state === 'AVAILABLE'));
assert(readOnlyOperations.every(operation => operation.executable === true),
    'read-only operations are executable only because secured routes now exist');
assert(readOnlyOperations.every(operation => operation.intent !== 'REPAIR' &&
    operation.intent !== 'LIFECYCLE' &&
    operation.intent !== 'EXPAND'));

const reservedMutatingOperations = operations.filter(operation => operation.phase === 'RESERVED_MUTATING');
assert(reservedMutatingOperations.length > 0);
assert(reservedMutatingOperations.every(operation => operation.mutating === true));
assert(reservedMutatingOperations.every(operation => operation.state === 'RESERVED'));
assert(reservedMutatingOperations.every(operation => operation.executable === false));
assert(reservedMutatingOperations.every(operation => operation.requiresIdempotencyKey === true));
assert(reservedMutatingOperations.every(operation => [
    'installer.workspace.operate',
    'installer.workspace.support',
    'installer.workspace.expand'
].includes(operation.permission)));

assert.equal(operations.find(operation => operation.code === 'installer.info').method, 'GET');
assert.equal(operations.find(operation => operation.code === 'installer.operations').method, 'GET');
assert(operations.filter(operation => operation.requiresWorkspace).every(operation => operation.method === 'POST'));
assert.equal(operations.find(operation => operation.code === 'setup.plan').permission,
    'installer.workspace.plan');
assert.equal(operations.find(operation => operation.code === 'evidence.read').permission,
    'installer.workspace.evidence.read');

const validOperation = Object.assign({}, operations.find(operation => operation.code === 'workspace.status'));
delete validOperation.executable;
assert.equal(operationCatalog.validateOperation(validOperation), true);
assert.equal(operationCatalog.normalizeOperation(validOperation).executable, true);

function assertInvalidOperation(overrides, expectedMessage) {
    const invalidOperation = Object.assign({}, validOperation, overrides);
    assert.throws(() => operationCatalog.validateOperation(invalidOperation), expectedMessage);
}

assertInvalidOperation({ state: 'UNKNOWN' }, /invalid state/);
assertInvalidOperation({ intent: 'UNKNOWN' }, /invalid intent/);
assertInvalidOperation({ group: 'UNKNOWN' }, /invalid group/);
assertInvalidOperation({ riskLevel: 'UNKNOWN' }, /invalid riskLevel/);
assertInvalidOperation({ route: '/outside/installer/v0/workspace/status' }, /route must stay under/);
assertInvalidOperation({ mutating: true }, /Mutating installer operation workspace.status cannot be AVAILABLE/);
assertInvalidOperation({ requiresIdempotencyKey: true }, /must not require idempotency/);
assertInvalidOperation({
    group: 'SETUP_PLANNING',
    code: 'setup.bad',
    route: '/nodics/installer/v0/setup/bad',
    permission: 'installer.workspace.view'
}, /must use installer.workspace.plan/);
assertInvalidOperation({
    group: 'EVIDENCE_READ',
    code: 'evidence.bad',
    route: '/nodics/installer/v0/evidence/bad',
    permission: 'installer.workspace.view'
}, /must use installer.workspace.evidence.read/);
assertInvalidOperation({
    method: 'GET',
    requiresWorkspace: true
}, /Workspace-sensitive installer operation workspace.status must use POST/);
assertInvalidOperation({
    sourceOfTruth: 'README.md'
}, /must reference/);

const invalidReservedOperation = Object.assign({}, reservedMutatingOperations[0], {
    requiresIdempotencyKey: false
});
delete invalidReservedOperation.executable;
assert.throws(() => operationCatalog.validateOperation(invalidReservedOperation), /must require idempotency/);

assert.deepEqual(permissionService.listPermissions().currentReadOnly, [
    'installer.workspace.view',
    'installer.workspace.plan',
    'installer.workspace.evidence.read'
]);
assert.throws(() => permissionService.assertPermission({
    authTokenType: 'access',
    permissions: []
}, 'installer.workspace.view'), /Missing installer permission/);
assert.throws(() => permissionService.assertPermission({
    authTokenType: 'service',
    permissions: ['installer.workspace.view']
}, 'installer.workspace.view'), /Service and internal tokens are not accepted/);
assert.throws(() => permissionService.assertPermission({
    authTokenType: 'access',
    permissions: ['installer.workspace.operate']
}, 'installer.workspace.operate'), /current read-only installer surface/);

const routes = allRoutes(router);
assert.equal(routes.length, readOnlyOperations.length,
    'Every read-only operation must have exactly one router entry');
routes.forEach(route => {
    assert.equal(route.secured, true);
    assert.deepEqual(route.authTokenTypes, ['access']);
    assert.deepEqual(route.accessGroups, ['employeeUserGroup']);
    assert(route.permission.startsWith('installer.workspace.'));
    assert.equal(route.controller, 'DefaultInstallerApplicationBuilderController');
    assert(route.key.startsWith('/nodics/installer/v0/'));
    const matchingOperation = readOnlyOperations.find(operation => operation.route === route.key);
    assert(matchingOperation, `Route ${route.key} must map to a read-only operation`);
    assert.equal(route.method, matchingOperation.method);
    assert.equal(route.permission, matchingOperation.permission);
});
assert(reservedMutatingOperations.every(operation => !routes.some(route => route.key === operation.route)),
    'Reserved mutating operations must not have router entries');

const capability = backofficeProvider.getCapability();
assert.equal(capability.capabilityId, 'platform-installer');
assert(capability.roles.includes('CONTROL_PLANE_PROVIDER'));
assert(contract.validateBackofficeMetadata(capability),
    'installer must publish valid BackOffice metadata for future Axis discovery');
assert(capability.navigation.every(entry => entry.featureState === 'PREVIEW'),
    'installer navigation may be previewed only after secured read-only APIs are validated');
assert(capability.navigation[0].lifecycleActions.every(action => action.featureState === 'PREVIEW'));
assert(capability.navigation[0].lifecycleActions.every(action => {
    const operation = operations.find(candidate => candidate.code === action.handlerAction);
    return operation && operation.route === action.operationRoute && operation.method === action.httpMethod;
}), 'BackOffice lifecycle actions must reference normalized installer operation catalog entries');

global.SERVICE = {
    DefaultModuleRegistrationAgentService: {
        registrations: [],
        registerBackofficeCapabilityProvider: function (moduleName, provider) {
            this.registrations.push({ moduleName, provider });
        }
    }
};

backofficeProvider.init();
assert.equal(global.SERVICE.DefaultModuleRegistrationAgentService.registrations[0].moduleName, 'installer');
assert.equal(global.SERVICE.DefaultModuleRegistrationAgentService.registrations[0].provider, backofficeProvider);

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-installer-api-test-'));
const workspaceRoot = path.join(tmpRoot, 'acme.workspace');
const vendorRoot = path.join(tmpRoot, 'nodics.ai');
const previousAllowedRoots = process.env.NODICS_INSTALLER_WORKSPACE_ROOTS;

fs.mkdirSync(workspaceRoot);
fs.mkdirSync(vendorRoot);
fs.mkdirSync(path.join(workspaceRoot, '.nodics-installer'));
fs.mkdirSync(path.join(workspaceRoot, 'acme.web'));
fs.mkdirSync(path.join(workspaceRoot, 'acme.apparel'));
fs.writeFileSync(path.join(workspaceRoot, '.nodics-workspace.json'), JSON.stringify({ code: 'acme' }));
fs.writeFileSync(path.join(workspaceRoot, '.nodics-installer-identity.json'), JSON.stringify({ application: 'acme.apparel' }));
fs.writeFileSync(path.join(workspaceRoot, '.nodics-installer-lock.json'), JSON.stringify({ locked: true }));
fs.writeFileSync(path.join(workspaceRoot, '.nodics-installer', 'setup.log'),
    'Authorization: Bearer abc.def.ghi\npassword=super-secret\ncallback=http://local.test?token=secret-token');
process.env.NODICS_INSTALLER_WORKSPACE_ROOTS = tmpRoot;

const beforeFiles = collectFiles(workspaceRoot);

Promise.resolve()
    .then(() => lifecycle.init())
    .then(result => assert.equal(result, true))
    .then(() => lifecycle.postInit())
    .then(result => assert.equal(result, true))
    .then(() => facade.info(allowedRequest(workspaceRoot, ['installer.workspace.view'])))
    .then(result => {
        assert.equal(result.status, 'SUCCESS');
        assert.equal(result.data.standaloneBootstrap.repository, 'Nodics/nodics.installer');
    })
    .then(() => assertControllerSuccess('operations', allowedRequest(workspaceRoot, ['installer.workspace.view'])))
    .then(result => assert.equal(result.data.operations.length, operations.length))
    .then(() => assertControllerSuccess('workspaceStatus', allowedRequest(workspaceRoot, ['installer.workspace.view'])))
    .then(result => {
        assert.equal(result.operation, 'workspace.status');
        assert.equal(result.data.workspace.workspaceName, 'acme.workspace');
        assert.equal(result.data.workspace.markers.workspaceManifest, true);
    })
    .then(() => assertControllerSuccess('workspaceInventory', allowedRequest(workspaceRoot, ['installer.workspace.view'])))
    .then(result => {
        assert(result.data.repositories.some(repository => repository.name === 'acme.web'));
        assert(result.data.repositories.some(repository => repository.name === 'acme.apparel'));
    })
    .then(() => assertControllerSuccess('workspacePreflight', Object.assign(allowedRequest(workspaceRoot, [
        'installer.workspace.view'
    ]), {
        payload: { workspaceRoot, ports: [4300, 'bad'] }
    })))
    .then(result => {
        assert(result.data.checks.some(check => check.code === 'node.runtime' && check.status === 'PASS'));
        assert.deepEqual(result.data.ports.map(port => port.valid), [true, false]);
    })
    .then(() => assertControllerSuccess('setupPlan', Object.assign(allowedRequest(workspaceRoot, [
        'installer.workspace.plan'
    ]), {
        payload: {
            workspaceRoot,
            companySiteName: 'acme.web',
            applicationName: 'acme.apparel',
            accelerator: 'apparel',
            environment: 'local'
        }
    })))
    .then(result => {
        assert.equal(result.data.valid, true);
        assert.deepEqual(result.data.plan.customerProjects, ['acme.web', 'acme.apparel']);
        assert.equal(result.data.plan.dryRunOnly, true);
    })
    .then(() => assertControllerSuccess('evidenceRead', Object.assign(allowedRequest(workspaceRoot, [
        'installer.workspace.evidence.read'
    ]), {
        payload: {
            workspaceRoot,
            evidenceFile: 'setup.log'
        }
    })))
    .then(result => {
        assert.equal(result.operation, 'evidence.read');
        assert.equal(result.data.evidence.length, 1);
        assert(result.data.evidence[0].content.includes('Bearer [REDACTED]'));
        assert(!result.data.evidence[0].content.includes('super-secret'));
        assert(result.redactions.includes('bearer-token'));
        assert(result.redactions.includes('password-assignment'));
        assert(result.redactions.includes('secret-query'));
    })
    .then(() => controller.workspaceStatus(allowedRequest(workspaceRoot, [])))
    .then(result => assert.equal(result.status, 'FAILED'))
    .then(() => {
        assert.throws(() => workspaceBoundary.resolveWorkspace(allowedRequest('/', [
            'installer.workspace.view'
        ])), /Filesystem root is not a valid installer workspace/);
        assert.throws(() => workspaceBoundary.resolveWorkspace(allowedRequest(os.homedir(), [
            'installer.workspace.view'
        ])), /Home directory is not a valid installer workspace/);
        assert.throws(() => workspaceBoundary.resolveWorkspace(allowedRequest(`${workspaceRoot}/../outside`, [
            'installer.workspace.view'
        ])), /Workspace path traversal is not allowed/);
        assert.throws(() => workspaceBoundary.resolveWorkspace(allowedRequest(vendorRoot, [
            'installer.workspace.view'
        ])), /Vendor-owned Nodics repositories are not customer workspaces/);
        const redacted = redactionService.redactText('api_key=abc123\n-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----', 1000);
        assert(!redacted.value.includes('abc123'));
        assert(!redacted.value.includes('PRIVATE KEY-----\nsecret'));
    })
    .then(() => assert.deepEqual(collectFiles(workspaceRoot), beforeFiles,
        'Read-only installer APIs must not write or delete workspace files'))
    .finally(() => {
        if (previousAllowedRoots === undefined) {
            delete process.env.NODICS_INSTALLER_WORKSPACE_ROOTS;
        } else {
            process.env.NODICS_INSTALLER_WORKSPACE_ROOTS = previousAllowedRoots;
        }
        fs.rmSync(tmpRoot, { recursive: true, force: true });
    })
    .then(() => console.log('Installer platform module contract validated'));
