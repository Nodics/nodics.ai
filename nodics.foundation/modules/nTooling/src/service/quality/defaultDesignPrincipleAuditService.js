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
            'Framework, Accelerator And Partner Ownership',
            'customer-project-mode-contract.md',
            'AI Role And Responsibility Boundary',
            'Pre-Implementation Framework Study Gate',
            'Strict Nodics Coding Principles',
            'provide default capabilities',
            'root `package.json` is the only npm dependency installation authority',
            'Security, access control, validation, audit, rollback, diagnostics, and test'
        ]);
        (this.requireClauses || exportedService.requireClauses).call(this, failures, (this.corePath || exportedService.corePath).call(this, 'modules/nSetup/llm/contracts/customer-project-mode-contract.md'), [
            '## Partner Write Boundary',
            'Partners write only to their customer-owned backend and frontend repositories.',
            '## Ownership And Dependency Direction',
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

    /** Rejects retired authorities and framework/service secrets without executing properties. Customer validation permits its direct administrator bootstrap override; nAuth still validates the effective value. @param {string[]} failures Findings. @param {string} directory Framework or customer root. @param {Object} options Explicit caller scope; customerProject is set only by customer-project validation. @returns {void} */
    auditConfigurationSources: function (failures, directory = rootPath, options = {}) {
        const skip = new Set(['node_modules', '.git', 'generated', 'data', 'test', 'tests', 'temp', 'dist', 'build', 'coverage', 'llm']);
        const inspectObject = (node, propertyPath, file) => {
            if (!node || node.type !== 'ObjectExpression') return;
            for (const property of node.properties) {
                if (property.type !== 'Property') continue;
                const key = property.key.type === 'Identifier' ? property.key.name : property.key.value;
                const current = propertyPath.concat(String(key));
                const name = current.join('.');
                const value = property.value;
                if (name === 'frontends' || name === 'tooling.topology.groups.frontends') failures.push(file + ': frontend lifecycle belongs to frontend applications, not backend properties');
                if (key === '$config' && value.type === 'Literal' && value.value === 'profile') failures.push(file + ': retired profile binding; use existing layered properties');
                if (['configurationValues.remoteEndpoints', 'configurationValues.runtimeAuthentication'].includes(name)) failures.push(file + ': duplicated configuration authority ' + name);
                const customerAdminOverride = options.customerProject === true && name === 'bootstrapIdentity.adminPassword';
                if (!customerAdminOverride && /^(?:authSecurity\.(?:jwt\.secret|apiKey\.pepper)|bootstrapIdentity\.(?:adminPassword|servicePassword|serviceApiKey)|defaultAuthDetail\.apiKey)(?:\.fallback)?$/.test(name) && value.type === 'Literal' && typeof value.value === 'string' && value.value.length) failures.push(file + ': authentication secret must use deployment input at ' + name);
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
