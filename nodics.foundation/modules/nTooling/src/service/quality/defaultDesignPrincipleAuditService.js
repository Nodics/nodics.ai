/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const aiGovernanceValidationService = require('./defaultAiGovernanceValidationService');

/**
 * @module nTooling/service/quality/defaultDesignPrincipleAuditService
 * @description Runs a repeatable static audit over Nodics principle, governance,
 * LLM, command, generated-context, and report-location contracts so periodic
 * platform reviews can detect drift before broader manual or test-suite review.
 * @layer tooling
 * @owner nTooling
 * @override Project modules may add stricter principle-audit scripts, but must
 * preserve the core framework principle checks and avoid making generated
 * reports or temporary folders a source of truth.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const corePrefix = fs.existsSync(path.join(rootPath, 'nodics.foundation')) ? 'nodics.foundation/' : '';

/**
 * Reads a UTF-8 file relative to the repository root.
 *
 * @param {string} relativePath Repository-relative file path.
 * @returns {string} File content.
 */


/**
 * Resolves a path owned by the core framework module group from either the
 * framework repository root or the nodics.foundation package root.
 *
 * @param {string} relativePath Path below nodics.foundation.
 * @returns {string} Repository-relative path appropriate for the command home.
 */


/**
 * Records an audit failure.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {string} message Failure message.
 * @returns {void}
 */


/**
 * Requires a file to contain all supplied clauses.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {string} relativePath Repository-relative file path.
 * @param {string[]} clauses Required clauses.
 * @returns {void}
 */


/**
 * Parses package.json scripts.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {Object} Script map.
 */


/**
 * Parses nTooling properties.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {Object} Tooling configuration.
 */


/**
 * Validates that required command gates remain available.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */


/**
 * Runs the canonical AI-governance checks as a prerequisite for the broader
 * design-principle audit.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {Object} validator AI-governance validator, injectable for focused tests.
 * @returns {void}
 */


/**
 * Validates source-of-truth principle and contract files.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */


/**
 * Validates LLM guidance that keeps AI and human developers on the same rules.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */


/**
 * Validates generated module-context entrypoints and manifest availability.
 *
 * @param {string[]} failures Mutable failure list.
 * @returns {void}
 */


/**
 * Returns framework-owned source files currently governed by the strict
 * mergeable service export style check.
 *
 * @returns {string[]} Repository-relative source file paths.
 */


/**
 * Reads a JavaScript source file for style governance.
 *
 * @param {string} relativePath Repository-relative source file path.
 * @returns {string} Source file content.
 */


/**
 * Validates that governed service files avoid non-mergeable function styles.
 *
 * @param {string[]} failures Mutable failure list.
 * @param {string[]} [relativePaths] Repository-relative source file paths.
 * @returns {void}
 */


/**
 * Runs the design-principle audit.
 *
 * @returns {string[]} Validation failures.
 */


/**
 * Executes the audit from the command line.
 *
 * @returns {void}
 */






let exportedService;
module.exports = exportedService = {
    /** Implements read as an overrideable service operation. */
    read: function (relativePath) {
        return fs.readFileSync(path.join(rootPath, relativePath), 'utf8');
    },

    /** Implements corePath as an overrideable service operation. */
    corePath: function (relativePath) {
        return corePrefix + relativePath;
    },

    /** Implements fail as an overrideable service operation. */
    fail: function (failures, message) {
        failures.push(message);
    },

    /** Implements requireClauses as an overrideable service operation. */
    requireClauses: function (failures, relativePath, clauses) {
        let content = '';
        try {
            content = (this.read || exportedService.read).call(this, relativePath);
        } catch (error) {
            (this.fail || exportedService.fail).call(this, failures, 'Missing principle audit file: ' + relativePath);
            return;
        }
        clauses.forEach(clause => {
            if (!content.includes(clause)) {
                (this.fail || exportedService.fail).call(this, failures, relativePath + ' is missing principle audit clause: ' + clause);
            }
        });
    },

    /** Implements readScripts as an overrideable service operation. */
    readScripts: function (failures) {
        try {
            return JSON.parse((this.read || exportedService.read).call(this, 'package.json')).scripts || {};
        } catch (error) {
            (this.fail || exportedService.fail).call(this, failures, 'package.json must be readable JSON: ' + error.message);
            return {};
        }
    },

    /** Implements readToolingProperties as an overrideable service operation. */
    readToolingProperties: function (failures) {
        try {
            return require(path.join(rootPath, (this.corePath || exportedService.corePath).call(this, 'modules/nTooling/config/properties.js'))).tooling || {};
        } catch (error) {
            (this.fail || exportedService.fail).call(this, failures, 'nTooling properties must be readable: ' + error.message);
            return {};
        }
    },

    /** Implements auditCommandGates as an overrideable service operation. */
    auditCommandGates: function (failures) {
        const scripts = (this.readScripts || exportedService.readScripts).call(this, failures);
        const tooling = (this.readToolingProperties || exportedService.readToolingProperties).call(this, failures);
        [
            'ai:validate',
            'ai:principle-audit',
            'llm:validate',
            'quality:docs',
            'quality:copyright',
            'quality:ownership',
            'test:basic',
            'test:full',
            'test:topology:consolidated',
            'test:topology:modular',
            'governance:report',
            'build'
        ].forEach(scriptName => {
            if (!scripts[scriptName]) {
                (this.fail || exportedService.fail).call(this, failures, 'Missing principle audit command gate: ' + scriptName);
            }
        });
        if (scripts.build && !scripts.build.includes('nodics-tool.js build')) {
            (this.fail || exportedService.fail).call(this, failures, 'build must delegate to the governed nTooling lifecycle command');
        }
        const buildSteps = (((tooling.commands || {}).build || {}).steps || []);
        const llmGenerateIndex = buildSteps.findIndex(step => (step.tool || []).includes('llm:generate'));
        const principleAuditIndex = buildSteps.findIndex(step => (step.tool || []).includes('ai:principle-audit'));
        const includesGovernanceReport = buildSteps.some(step => (step.tool || []).includes('governance:report'));
        if (llmGenerateIndex === -1) {
            (this.fail || exportedService.fail).call(this, failures, 'nTooling build lifecycle must generate LLM context before generated-context audit');
        }
        if (principleAuditIndex === -1) {
            (this.fail || exportedService.fail).call(this, failures, 'nTooling build lifecycle must include ai:principle-audit after generated LLM context is available');
        }
        if (llmGenerateIndex !== -1 && principleAuditIndex !== -1 && principleAuditIndex < llmGenerateIndex) {
            (this.fail || exportedService.fail).call(this, failures, 'nTooling build lifecycle must run llm:generate before ai:principle-audit');
        }
        if (!includesGovernanceReport) {
            (this.fail || exportedService.fail).call(this, failures, 'nTooling build lifecycle must keep governance:report in the generated-artifact gate');
        }
    },

    /** Implements auditAiGovernance as an overrideable service operation. */
    auditAiGovernance: function (failures, validator = aiGovernanceValidationService) {
        validator.validateRootFiles(failures);
        validator.validatePackageFiles(failures);
        validator.validateReadmeCasing(failures);
        validator.validateAgentFiles(failures);
    },

    /** Implements auditPrincipleContracts as an overrideable service operation. */
    auditPrincipleContracts: function (failures) {
        // Protect the canonical gate and its discovery routes; this is not proof
        // that a batch's semantic review has been performed or passed.
        ['nodics-principles.md', 'ai-coding-and-customization-contract.md'].forEach(fileName => {
            (this.requireClauses || exportedService.requireClauses).call(this, failures,
                (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/' + fileName),
                ['## Mandatory Ownership, Placement And Scope Review']);
        });
        [
            'contracts/developer-implementation-contract.md',
            'contracts/customer-config-classification-contract.md',
            'contracts/module-structure-contract.md',
            'playbooks/change-gate-contract.md',
            'playbooks/daily-change-checklist.md',
            'prompts/review-prompt.md',
            'ai-enablement-index.md'
        ].forEach(relativePath => {
            (this.requireClauses || exportedService.requireClauses).call(this, failures,
                (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/' + relativePath),
                ['ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review']);
        });
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/nodics-principles.md'), [
            'capabilities are sacred, implementations are negotiable',
            '### Framework defaults, customer deltas',
            'customer-config-classification-contract.md#mandatory-default-ownership-gate',
            'Framework, Accelerator And Partner Ownership',
            '### Lightweight customer modules and runtimes',
            'Separate a reusable mechanism from the customer',
            'customer-project-mode-contract.md',
            'AI Role And Responsibility Boundary',
            'Pre-Implementation Framework Study Gate',
            'Strict Nodics Coding Principles',
            'provide default capabilities',
            'root `package.json` is the only npm dependency installation authority',
            'Security, access control, validation, audit, rollback, diagnostics, and test'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures,
            (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/customer-config-classification-contract.md'), [
                '## Mandatory Default Ownership Gate',
                'Customer configuration is an override, not a',
                'Registration is not activation or authorization.',
                'Do not limit ownership review to equal-value or duplicate-line detection.'
            ]);
        [
            'contracts/ai-coding-and-customization-contract.md',
            'playbooks/change-gate-contract.md',
            'prompts/review-prompt.md'
        ].forEach(relativePath => {
            (this.requireClauses || exportedService.requireClauses).call(this, failures,
                (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/' + relativePath),
                ['customer-config-classification-contract.md#mandatory-default-ownership-gate']);
        });
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/customer-project-mode-contract.md'), [
            '## Partner Write Boundary',
            'Partners write only to their customer-owned backend and frontend repositories.',
            '## Ownership And Dependency Direction',
            '### Mechanism and policy extraction',
            '## Schema Ownership And Data Contributions',
            '## Supported Customization',
            '## Separate Contribution And Release Channel',
            'Promotion is never an automatic partner action.',
            '## Acceptance Evidence'
        ]);
        ['ai-coding-and-customization-contract.md', 'developer-implementation-contract.md'].forEach(fileName => {
            (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/' + fileName), [
                'customer-project-mode-contract.md'
            ]);
        });
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/ai-enablement-index.md'), [
            'customer-project-mode-contract.md',
            'Partners write only to customer-owned repositories'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/standards/module-standard.md'), [
            'Module `package.json` files must not declare `dependencies` or',
            '`nodics.dependencyGovernance.ownedDependencies` metadata'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/nodics-principles.md'), [
            'compatibility pointer',
            'modules/nSetup/llm/contracts/nodics-principles.md',
            'Do not add or maintain separate principles here'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/playbooks/change-gate-contract.md'), [
            '## Gate 1A: Implementation Readiness',
            '## Gate 4: Periodic Platform Audit',
            'module structure and naming standards',
            'duplicate or parallel runtime mechanisms',
            'runtime activation, audit, rollback, and diagnostics',
            'Do not use repository `temp` or the refactor-only',
            'active server/node generated-report location'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/developer-implementation-contract.md'), [
            'AI Expert-Council Responsibility',
            'Pre-Implementation Study And Readiness',
            'security, access, validation, audit, rollback, diagnostics, and test',
            'Apply `integration-governance-contract.md`'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/human-maintainability-contract.md'), [
            'understandable, diagnosable, safely changeable, and',
            'AI-generated code has no special exemption'
        ]);
    },

    /** Implements auditLlmGuidance as an overrideable service operation. */
    auditLlmGuidance: function (failures) {
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/ai-enablement-index.md'), [
            'root-to-leaf README/AGENTS chain',
            'AI Role And Study Gate',
            'Framework-maintainer mode',
            'Application-developer mode',
            'prompts/runtime-governance-prompt.md',
            'contracts/integration-governance-contract.md'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/prompts/runtime-governance-prompt.md'), [
            'preview before mutation',
            'rollback through the owning service',
            'Do not add a parallel activation channel'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/prompts/refactor-prompt.md'), [
            'without changing platform capability',
            'do not create a second loader'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/prompts/testing-prompt.md'), [
            'later-loaded project modules can override behavior',
            'separate live'
        ]);
    },

    /** Implements auditGeneratedContextEntrypoints as an overrideable service operation. */
    auditGeneratedContextEntrypoints: function (failures) {
        [
            'nodics.foundation/modules/nConfig',
            'nodics.foundation/modules/nCommon',
            'nodics.foundation/modules/nTooling',
            'nodics.foundation/modules/nDynamo',
            'nodics.foundation/modules/nData/nImport/import',
            'nodics.platform/modules/profile'
        ].forEach(modulePath => {
            [
                'llm/generated/manifest.json',
                'llm/generated/module-context.md'
            ].forEach(relativeFile => {
                const fullPath = path.join(rootPath, modulePath, relativeFile);
                if (!fs.existsSync(fullPath)) {
                    (this.fail || exportedService.fail).call(this, failures, 'Missing generated context entrypoint: ' + modulePath + '/' + relativeFile);
                }
            });
        });
    },

    /** Implements getServiceExportStyleGovernancePaths as an overrideable service operation. */
    getServiceExportStyleGovernancePaths: function (frameworkRoot = rootPath) {
        const paths = new Set();
        const excluded = new Set(['.git', 'node_modules', 'data', 'test', 'tests', 'llm', 'generated', 'gen', 'dist']);
        const visit = (directory, runtime = false) => {
            const packageFile = path.join(directory, 'package.json');
            if (fs.existsSync(packageFile)) {
                const metadata = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
                if (metadata.nodics) runtime = metadata.nodics.runtimeModule === true && metadata.nodics.loadableByNodicsModuleLoader === true;
            }
            for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                if (entry.name.startsWith('.') || excluded.has(entry.name)) continue;
                const full = path.join(directory, entry.name);
                if (entry.isDirectory()) { visit(full, runtime); continue; }
                if (!runtime || !entry.name.endsWith('.js')) continue;
                const relative = path.relative(frameworkRoot, full).split(path.sep).join('/');
                if ((relative.includes('/src/') && !relative.includes('/src/lib/')) || relative.includes('/config/') || entry.name === 'nodics.js') paths.add(relative);
            }
        };
        visit(frameworkRoot);
        // Keep the existing non-runtime command boundary in addition to complete runtime coverage.
        for (const relative of [
            'nodics.foundation/modules/nTooling/src/service/project/defaultProjectRuntimeStartService.js',
            'nodics.foundation/modules/nTooling/src/service/project/defaultProjectFrameworkLinkService.js',
            'nodics.foundation/modules/nTooling/src/service/command/defaultProjectCommandService.js',
            'nodics.foundation/modules/nTooling/src/service/quality/defaultDesignPrincipleAuditService.js',
            'nodics.js'
        ]) if (fs.existsSync(path.join(frameworkRoot, relative))) paths.add(relative);
        return Array.from(paths).sort();
    },

    /** Implements readSourceForStyleGovernance as an overrideable service operation. */
    readSourceForStyleGovernance: function (relativePath) {
        return fs.readFileSync(path.join(rootPath, relativePath), 'utf8');
    },

    /** Implements auditServiceExportStyle as an overrideable service operation. */
    auditServiceExportStyle: function (failures, relativePaths) {
        const governedPaths = relativePaths || (this.getServiceExportStyleGovernancePaths || exportedService.getServiceExportStyleGovernancePaths).call(this);
        governedPaths.forEach(relativePath => {
            let ast;
            try {
                const content = (this.readSourceForStyleGovernance || exportedService.readSourceForStyleGovernance).call(this, relativePath);
                ast = acorn.parse(content, { ecmaVersion: 'latest', sourceType: 'module', locations: true, allowReturnOutsideFunction: true });
            } catch (error) {
                (this.fail || exportedService.fail).call(this, failures, 'Cannot parse source export governance file: ' + relativePath + ': ' + error.message);
                return;
            }
            const report = (node, name) => (this.fail || exportedService.fail).call(this, failures,
                relativePath + ':' + node.loc.start.line + ' uses ' + name + '; use mergeable `methodName: function (...)` service members instead.');
            const declarations = new Map(ast.body.filter(node => node.type === 'VariableDeclaration')
                .flatMap(node => node.declarations.map(item => [item.id.name, item.init])));
            for (const statement of ast.body) {
                if (statement.type === 'FunctionDeclaration') report(statement, 'top-level named function');
                if (statement.type === 'VariableDeclaration') for (const item of statement.declarations) {
                    if (['FunctionExpression', 'ArrowFunctionExpression'].includes(item.init && item.init.type)) report(item, 'top-level behavioral helper');
                }
                if (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration') {
                    if (['FunctionDeclaration', 'ObjectExpression'].includes(statement.declaration && statement.declaration.type)) report(statement, 'ESM function/default object export');
                }
                const expression = statement.type === 'ExpressionStatement' && statement.expression;
                if (!expression || expression.type !== 'AssignmentExpression' || expression.left.type !== 'MemberExpression' ||
                    expression.left.object.name !== 'module' || expression.left.property.name !== 'exports') continue;
                let exported = expression.right;
                while (exported.type === 'AssignmentExpression') exported = exported.right;
                if (exported.type === 'Identifier') exported = declarations.get(exported.name) || exported;
                if (exported.type !== 'ObjectExpression') continue;
                for (const member of exported.properties) {
                    if (member.method) report(member, 'shorthand object method');
                    else if (member.value && member.value.type === 'ArrowFunctionExpression') report(member, 'arrow function member');
                }
            }
        });
    },

    /** Checks customer runtime placement on parsed syntax, never by executing project configuration. */
    auditCustomerPropertyPlacement: function (failures, node, propertyPath, file) {
        const server = /^envs\/[^/]+\/[^/]+\/(?:[^/]+\/)?config\/properties\.js$/.test(file);
        const environment = /^envs\/[^/]+\/config\/properties\.js$/.test(file);
        const name = propertyPath.join('.');
        const misplaced = new Set([
            'runtimeIdentity', 'localResetProvider', 'backofficeLocalReset', 'copilot',
            'profileExternalIdentity', 'runtimeConfigurationSchemas', 'profileCustomerBrowserSession',
            'profileBrowserSession', 'defaultAuthDetail', 'apiExposure', 'search', 'publishEnabled',
            'stripeProvider', 'httpHardening', 'product', 'cart', 'fulfillmentCore',
        ]);
        const report = reason => failures.push(file + ': ' + reason + ' at ' + (name || '<root>'));
        if (server && propertyPath.length === 1 && misplaced.has(name))
            report('keep capability policy in module-owned runtime-role profiles or the environment');
        if (server && ['data.dataReleases', 'tooling.runtime'].includes(name))
            report('use owning module contributions or server package metadata');
        if (environment && name === 'data.dataReleases.runtimeRoleProfiles')
            report('release inventories belong to their module, not the environment');
        if (name === 'backofficeRegistry.clientEndpoints')
            report('browser endpoint ownership belongs to each runtime server');
        if (server && propertyPath.at(-1) === 'mediaDeliveryBaseUrl')
            report('media delivery policy belongs to its capability');
        if (server && node.type === 'ObjectExpression' && !node.properties.length)
            report('remove empty runtime override objects');
        if (server && node.type === 'ObjectExpression') {
            const fields = new Map(node.properties.filter(p => p.type === 'Property')
                .map(p => [p.key.type === 'Identifier' ? p.key.name : p.key.value, p.value]));
            if (name.startsWith('servers.') && name.endsWith('.endpoint') && fields.get('$config')?.value === 'runtime')
                report('derive peer endpoints from server metadata');
            if (/^servers\.[^.]+$/.test(name) && !['servers.default', 'servers.options'].includes(name) &&
                fields.size === 1 && fields.get('remoteOnly')?.value === true)
                report('derive peer remoteness from environment topology');
        }
        if (name === 'apiExposure.categories.serviceRegistry.enabled' && node.type === 'Literal' && node.value === true)
            report('inherit the secured nSystem service-registry exposure default');
    },

    /** Rejects retired authorities and literal authentication secrets without executing properties. @param {string[]} failures Findings. @param {string} directory Framework or customer root. @param {Object} options Explicit caller scope. @returns {void} */
    auditConfigurationSources: function (failures, directory = rootPath, options = {}) {
        const skip = new Set(['node_modules', '.git', 'generated', 'data', 'test', 'tests', 'temp', 'dist', 'build', 'coverage', 'llm']);
        const customerProjectRootNamespaces = new Set([
            'apiExposure',
            'backofficeApplicationInitialization',
            'backofficeFunctionalModuleCatalogue',
            'backofficeRegistry',
            'data',
            'localResetProvider',
            'profileBrowserSession',
            'profileCustomerBrowserSession',
            'profileExternalIdentity',
            'servers'
        ]);
        ['search', 'stripeProvider', 'httpHardening', 'product', 'cart', 'fulfillmentCore']
            .forEach(name => customerProjectRootNamespaces.add(name));
        const inspectObject = (node, propertyPath, file) => {
            if (!node || node.type !== 'ObjectExpression') return;
            for (const property of node.properties) {
                if (property.type !== 'Property') continue;
                const key = property.key.type === 'Identifier' ? property.key.name : property.key.value;
                const current = propertyPath.concat(String(key));
                const name = current.join('.');
                const value = property.value;
                if (/^copilot\.(?:runtimeRoleProfiles\.[^.]+\.)?knowledge\.(?:sourceRegistry\.definitions|groups\.(?:definitions|assignments)|externalLogs\.sources)$/.test(name) &&
                    !(value.type === 'ArrayExpression' && value.elements.length === 0))
                    failures.push(file + ': Copilot knowledge selections are governed runtime data, not authored module configuration: ' + name);
                if (options.customerProject === true)
                    (this.auditCustomerPropertyPlacement || exportedService.auditCustomerPropertyPlacement).call(this, failures, value, current, file);
                if (options.customerProject === true && file === 'config/properties.js' && current.length === 1 &&
                    customerProjectRootNamespaces.has(String(key))) failures.push(file + ': customer project root must not carry framework/runtime default namespace ' + key + '; move defaults to the owning framework module and keep only true environment/server/customer overrides');
                if (name === 'frontends' || name === 'tooling.topology.groups.frontends') failures.push(file + ': frontend lifecycle belongs to frontend applications, not backend properties');
                if (key === '$config' && value.type === 'Literal' && value.value === 'profile') failures.push(file + ': retired profile binding; use existing layered properties');
                if (['configurationValues.remoteEndpoints', 'configurationValues.runtimeAuthentication'].includes(name)) failures.push(file + ': duplicated configuration authority ' + name);
                if (/^(?:authSecurity\.(?:jwt\.secret|apiKey\.pepper)|bootstrapIdentity\.(?:adminPassword|servicePassword|serviceApiKey)|defaultAuthDetail\.apiKey)(?:\.fallback)?$/.test(name) && value.type === 'Literal' && typeof value.value === 'string' && value.value.length) failures.push(file + ': authentication secret must use deployment input at ' + name);
                inspectObject(value, current, file);
                if (value.type === 'ArrayExpression') value.elements.forEach(item => inspectObject(item, current, file));
            }
        };
        const inspectExports = (node, file) => {
            if (!node || typeof node !== 'object') return;
            if (node.type === 'AssignmentExpression' && node.left?.type === 'MemberExpression' && node.left.object?.name === 'module' && node.left.property?.name === 'exports') inspectObject(node.right, [], file);
            for (const value of Object.values(node)) {
                if (Array.isArray(value)) value.forEach(item => inspectExports(item, file));
                else if (value && typeof value === 'object') inspectExports(value, file);
            }
        };
        const walk = folder => {
            for (const entry of fs.readdirSync(folder, {withFileTypes:true})) {
                if (entry.name.startsWith('.') || skip.has(entry.name) || entry.isSymbolicLink()) continue;
                const absolute = path.join(folder, entry.name), relative = path.relative(directory, absolute);
                if (entry.isDirectory()) walk(absolute);
                else if (entry.name === 'nodics.environment.json') failures.push(relative + ': environment descriptors are prohibited; use existing module configuration');
                else if (entry.name === 'properties.js' && path.basename(folder) === 'config') {
                    try { inspectExports(acorn.parse(fs.readFileSync(absolute, 'utf8'), {ecmaVersion:'latest',sourceType:'script'}), relative); }
                    catch (error) { failures.push(relative + ': configuration syntax must be valid'); }
                }
            }
        };
        walk(directory);
    },

    /**
     * Statically reads a reference demo configuration. Only literal composition,
     * local constants and sample JSON references are admitted; nothing is executed.
     * @param {Object} node Parsed expression.
     * @param {Map} declarations File-local constants.
     * @param {string} file Absolute configuration path.
     * @param {Set} seen Circular-reference guard.
     * @returns {*} Declarative value; throws for executable or unresolved source.
     */
    readReferenceDemoValue: function (node, declarations, file, seen = new Set()) {
        if (!node) throw new Error('missing declarative value');
        if (node.type === 'Literal') return node.value;
        if (node.type === 'Identifier' && declarations.has(node.name) && !seen.has(node.name))
            return this.readReferenceDemoValue(declarations.get(node.name), declarations, file, new Set([...seen, node.name]));
        if (node.type === 'ArrayExpression') return node.elements.map(value => this.readReferenceDemoValue(value, declarations, file, seen));
        if (node.type === 'ObjectExpression') {
            const entries = node.properties.map(property => {
                if (property.type !== 'Property' || property.computed || property.method || property.kind !== 'init')
                    throw new Error('dynamic composition is not demo data');
                return [property.key.name ?? property.key.value, this.readReferenceDemoValue(property.value, declarations, file, seen)];
            });
            if (new Set(entries.map(([key]) => key)).size !== entries.length) throw new Error('duplicate composition key');
            return Object.fromEntries(entries);
        }
        if (node.type === 'CallExpression' && node.callee.name === 'require' && node.arguments.length === 1 &&
            node.arguments[0].type === 'Literal' && typeof node.arguments[0].value === 'string') {
            const target = path.resolve(path.dirname(file), node.arguments[0].value);
            const dataRoot = path.resolve(path.dirname(file), '../data');
            const relative = path.relative(dataRoot, target).split(path.sep).join('/');
            if (!/^sample-v\d+\/.+\.json$/.test(relative) ||
                !fs.realpathSync(target).startsWith(fs.realpathSync(dataRoot) + path.sep))
                throw new Error('composition may require only its own sample JSON');
            return JSON.parse(fs.readFileSync(target, 'utf8'));
        }
        throw new Error('executable or unresolved composition');
    },

    /** Accepts identity/display values and bounded nConfig envelopes, not nested definitions. */
    isReferenceDemoSelection: function (value) {
        const scalar = item => ['string', 'number', 'boolean'].includes(typeof item);
        const literal = item => scalar(item) || Array.isArray(item) && item.every(scalar);
        if (literal(value)) return true;
        if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
        const only = keys => Object.keys(value).every(key => keys.includes(key));
        if (value.$config === 'replace') return only(['$config', 'value']) && literal(value.value);
        if (value.$config === 'ref') return only(['$config', 'path']) && typeof value.path === 'string';
        return value.$config === 'env' && only(['$config', 'name', 'type', 'fallback']) &&
            typeof value.name === 'string' && ['string', 'number', 'boolean'].includes(value.type) &&
            (value.fallback === undefined || scalar(value.fallback));
    },

    /**
     * Rejects capability policy and access in marked demo properties.
     * @param {Object} value Declarative configuration.
     * @param {Object} policy Canonical nTooling ownership policy.
     * @param {string[]} failures Findings without source values.
     * @param {string} file Diagnostic path.
     * @param {string[]} keys Current property path.
     * @returns {void} Appends findings; does not load configuration.
     */
    auditReferenceDemoConfiguration: function (value, policy, failures, file, keys = []) {
        if (!value || typeof value !== 'object') return;
        for (const [key, child] of Object.entries(value)) {
            const current = keys.concat(key);
            const matchesPath = pattern => {
                const parts = pattern.split('.');
                return current.length <= parts.length && current.every((part, index) => parts[index] === '*' || parts[index] === part);
            };
            const leaves = (policy.configurationLeafPaths || []).filter(matchesPath);
            if (!policy.accessKeys.includes(key) && leaves.some(pattern => pattern.split('.').length === current.length)) {
                if (!this.isReferenceDemoSelection(child))
                    failures.push(file + ': reference demo requires a literal selection: ' + current.join('.'));
                continue;
            }
            let selected = false;
            const matches = leaves.length > 0 || policy.configurationPaths.some(pattern => {
                const parts = pattern.split('.');
                const match = current.slice(0, parts.length).every((part, index) => parts[index] === '*' || parts[index] === part);
                if (match && current.length >= parts.length) selected = true;
                return match;
            });
            if (!matches || policy.accessKeys.includes(key) || (!selected && (!child || typeof child !== 'object' || Array.isArray(child))))
                failures.push(file + ': reference demo cannot own capability/access configuration: ' + current.join('.'));
            else this.auditReferenceDemoConfiguration(child, policy, failures, file, current);
        }
    },

    /**
     * Checks one explicitly marked reference module using existing package discovery.
     * Runtime source and access definitions stay with capability owners; sample
     * records, assets and inert composition stay selectable. Partner modules are
     * not implicitly marked. Parses files without requiring customer JavaScript.
     * @param {string[]} failures Mutable diagnostics.
     * @param {string} directory Repository/project root.
     * @returns {void} Read-only source audit; no runtime/import operations.
     */
    auditReferenceDemoModules: function (failures, directory = rootPath) {
        directory = path.resolve(directory);
        const policy = require('../../../config/properties').tooling.referenceDemoOwnership;
        const ignored = new Set(['node_modules', '.git', 'generated', 'gen', 'test', 'tests', 'llm', 'dist', 'coverage']);
        const inspectModule = (moduleRoot, metadata) => {
            const report = (file, reason) => failures.push(path.relative(directory, file) + ': reference demo ' + reason);
            const allowedOwners = new Set(['composition', 'configuration', 'data', 'test', 'documentation', 'llm']);
            if (metadata.nodics.kind !== 'content-pack' || (metadata.nodics.owns || []).some(owner => !allowedOwners.has(owner)) ||
                Object.values(metadata.nodics.runtime || {}).some(value => value === true) || Object.keys(metadata.scripts || {}).length)
                report(path.join(moduleRoot, 'package.json'), 'must own only inert data/composition');
            if (!fs.existsSync(path.join(moduleRoot, 'data/manifest.json')))
                report(path.join(moduleRoot, 'data/manifest.json'), 'requires a governed optional data manifest');
            const inspect = folder => {
                for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
                    if (ignored.has(entry.name) || entry.name.startsWith('.')) continue;
                    const file = path.join(folder, entry.name);
                    const relative = path.relative(moduleRoot, file).split(path.sep).join('/');
                    if (entry.isSymbolicLink()) { report(file, 'cannot link to capability source'); continue; }
                    if (relative === 'src' || relative === 'modules') { report(file, 'cannot own runtime source or nested modules'); continue; }
                    if (entry.isDirectory()) {
                        if (/^data\/[^/]+$/.test(relative) && !/^data\/(sample|docs)-v\d+$/.test(relative))
                            report(file, 'data must be optional sample or documentation');
                        inspect(file); continue;
                    }
                    if (relative === 'package.json') continue;
                    if (relative === 'data/manifest.json') {
                        try {
                            const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
                            for (const section of Object.values(manifest.sections || {})) {
                                const sample = section.kind === 'DATA_RELEASE' && section.dataType === 'sample' && section.selectionPolicy === 'EXPLICIT';
                                const documentation = section.kind === 'CONTENT_PACK' && /^docs-v\d+$/.test(section.contentPath || '') &&
                                    section.installationPolicy === 'OPTIONAL_AXIS_INITIATED';
                                if (!sample && !documentation)
                                    report(file, 'releases must be explicitly selected sample/docs data');
                            }
                        } catch (error) { report(file, 'manifest must be readable JSON'); }
                        continue;
                    }
                    if (!/\.(?:js|cjs|mjs|ts|json)$/.test(entry.name)) continue;
                    try {
                        const source = fs.readFileSync(file, 'utf8');
                        if (/^config\/setup-observation\/(?:history\/)?[^/]+\.json$/.test(relative)) {
                            const observation = JSON.parse(source);
                            if (!observation || observation.contractVersion !== 1 || typeof observation.code !== 'string' ||
                                !Number.isSafeInteger(observation.revision) || observation.revision < 1 ||
                                !['tenant', 'profileCode', 'baselineCode', 'profileDigest'].every(key => typeof observation[key] === 'string') ||
                                !Array.isArray(observation.stages) || !observation.baseline || typeof observation.baseline !== 'object' ||
                                Array.isArray(observation.baseline) || Object.keys(observation).some(key =>
                                    !['contractVersion', 'code', 'revision', 'tenant', 'profileCode', 'baselineCode', 'profileDigest', 'stages', 'baseline'].includes(key)))
                                throw new Error('setup observation must be an inert receipt envelope');
                            continue;
                        }
                        if (relative.startsWith('data/')) {
                            const json = entry.name.endsWith('.json');
                            const tree = json ? JSON.parse(source) : acorn.parse(source, { ecmaVersion: 'latest' });
                            const references = new Set();
                            const inspectData = node => {
                                if (!node || typeof node !== 'object' || references.has(node)) return;
                                if (!json && node.type === 'Identifier' && ['SERVICE', 'DAO', 'CONFIG', 'process', 'global', 'globalThis'].includes(node.name))
                                    throw new Error('sample data cannot execute runtime capability code');
                                if (node.type === 'CallExpression' && node.callee?.name === 'require') {
                                    const target = node.arguments[0]?.value;
                                    if (typeof target !== 'string' || !target.startsWith('.') ||
                                        !path.resolve(path.dirname(file), target).startsWith(path.join(moduleRoot, 'data') + path.sep))
                                        throw new Error('sample data cannot import capability code');
                                }
                                if (node.type === 'ImportExpression' || node.type === 'ImportDeclaration')
                                    throw new Error('sample data cannot import executable modules');
                                if (!json && node.type === 'Literal' && policy.accessSchemas.includes(node.value) &&
                                    !(relative.includes('/headers/') && node.value === 'principalScopeAssignment'))
                                    throw new Error('access definitions belong to capability owners');
                                if (json || node.type === 'ObjectExpression') {
                                    const properties = json ? node : Object.fromEntries(node.properties.filter(item => item.type === 'Property')
                                        .map(item => [item.key.name ?? item.key.value, item.value]));
                                    const read = key => {
                                        if (json) return properties[key];
                                        try { return this.readReferenceDemoValue(properties[key], new Map(), file); }
                                        catch { return undefined; }
                                    };
                                    const header = relative.includes('/headers/') && typeof read('schemaName') === 'string' &&
                                        typeof read('operation') === 'string' && typeof read('dataFilePrefix') === 'string';
                                    const identity = relative.includes('/records/') && typeof read('loginId') === 'string';
                                    if (policy.accessSchemas.includes(read('schemaName')) && !(header && read('schemaName') === 'principalScopeAssignment'))
                                        throw new Error('access definitions belong to capability owners');
                                    if (header && read('schemaName') === 'principalScopeAssignment') references.add(properties.schemaName);
                                    for (const key of Object.keys(properties)) {
                                        const reference = (key === 'userGroups' && (header || identity)) ||
                                            (key === 'groupCodes' && identity) || (key === 'requiredRoles' && header);
                                        if (policy.accessKeys.includes(key) || key === 'requiredRoles') {
                                            const codes = read(key);
                                            if (!reference || !Array.isArray(codes) || codes.some(code => typeof code !== 'string' || !code))
                                                throw new Error('access definitions belong to capability owners');
                                            references.add(properties[key]);
                                        }
                                    }
                                }
                                for (const child of Object.values(node)) {
                                    if (Array.isArray(child)) child.forEach(inspectData);
                                    else inspectData(child);
                                }
                            };
                            inspectData(tree); continue;
                        }
                        if (!['nodics.js', 'config/properties.js', 'config/prescripts.js', 'config/postscripts.js'].includes(relative))
                            throw new Error('executable files belong to capability owners');
                        const tree = acorn.parse(source, { ecmaVersion: 'latest' });
                        const declarations = new Map();
                        let exports = 0;
                        for (const statement of tree.body) {
                            if (statement.directive) continue;
                            if (statement.type === 'VariableDeclaration' && statement.kind === 'const') {
                                for (const item of statement.declarations) {
                                    if (item.id.type !== 'Identifier') throw new Error('composition constants must be named');
                                    declarations.set(item.id.name, item.init);
                                    this.readReferenceDemoValue(item.init, declarations, file);
                                }
                                continue;
                            }
                            const expression = statement.expression;
                            if (expression?.type !== 'AssignmentExpression' || expression.operator !== '=' ||
                                expression.left.type !== 'MemberExpression' || expression.left.computed ||
                                expression.left.object.name !== 'module' || expression.left.property.name !== 'exports' || ++exports !== 1)
                                throw new Error('only declarative module.exports is permitted');
                            if (relative === 'nodics.js') {
                                const members = expression.right;
                                if (members.type !== 'ObjectExpression') throw new Error('lifecycle must be inert');
                                for (const member of members.properties) {
                                    const body = member.value?.body?.body;
                                    const returned = body?.[0]?.argument;
                                    if (member.type !== 'Property' || member.computed || !['init', 'postInit'].includes(member.key.name ?? member.key.value) ||
                                        member.value.type !== 'FunctionExpression' || body?.length !== 1 || body[0].type !== 'ReturnStatement' ||
                                        returned?.type !== 'CallExpression' || returned.callee.type !== 'MemberExpression' || returned.callee.computed ||
                                        returned.callee.object.name !== 'Promise' || returned.callee.property.name !== 'resolve' ||
                                        returned.arguments.length !== 1 || returned.arguments[0].value !== true ||
                                        member.value.params.some(param => param.type !== 'Identifier'))
                                        throw new Error('lifecycle hooks must remain inert');
                                }
                            } else {
                                const value = this.readReferenceDemoValue(expression.right, declarations, file);
                                if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('composition must export an object');
                                if (relative !== 'config/properties.js' && Object.keys(value).length) throw new Error('startup scripts belong to capability owners');
                                this.auditReferenceDemoConfiguration(value, policy, failures, path.relative(directory, file));
                            }
                        }
                        if (exports !== 1) throw new Error('composition requires one export');
                    } catch (error) { report(file, error.message); }
                }
            };
            inspect(moduleRoot);
        };
        try {
            const catalogue = require('../applicationBuilder/defaultApplicationBuilderCatalogueService');
            for (const item of catalogue.collectPackages(directory, directory, [])) {
                if (item.nodics.referenceDemo !== true) continue;
                const moduleRoot = path.resolve(directory, item.moduleRoot);
                inspectModule(moduleRoot, JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8')));
            }
        } catch (error) { failures.push('Reference ownership discovery requires readable package metadata'); }
    },

    /** Implements audit as an overrideable service operation. */
    audit: function () {
        const failures = [];
        (this.auditAiGovernance || exportedService.auditAiGovernance).call(this, failures);
        (this.auditCommandGates || exportedService.auditCommandGates).call(this, failures);
        (this.auditPrincipleContracts || exportedService.auditPrincipleContracts).call(this, failures);
        (this.auditLlmGuidance || exportedService.auditLlmGuidance).call(this, failures);
        (this.auditGeneratedContextEntrypoints || exportedService.auditGeneratedContextEntrypoints).call(this, failures);
        (this.auditServiceExportStyle || exportedService.auditServiceExportStyle).call(this, failures);
        (this.auditConfigurationSources || exportedService.auditConfigurationSources).call(this, failures);
        (this.auditReferenceDemoModules || exportedService.auditReferenceDemoModules).call(this, failures);
        return failures;
    },

    /** Implements run as an overrideable service operation. */
    run: function () {
        const failures = (this.audit || exportedService.audit).call(this);
        if (failures.length > 0) {
            console.error('Nodics design-principle audit failed:');
            failures.forEach(failure => console.error('- ' + failure));
            process.exit(1);
        }
        console.log('Nodics design-principle audit validated');
    }
};

if (require.main === module) {
    exportedService.run();
}
