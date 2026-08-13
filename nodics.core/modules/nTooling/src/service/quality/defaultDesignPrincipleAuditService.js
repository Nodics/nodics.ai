/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');
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
const corePrefix = fs.existsSync(path.join(rootPath, 'nodics.core')) ? 'nodics.core/' : '';

/**
 * Reads a UTF-8 file relative to the repository root.
 *
 * @param {string} relativePath Repository-relative file path.
 * @returns {string} File content.
 */


/**
 * Resolves a path owned by the core framework module group from either the
 * framework repository root or the nodics.core package root.
 *
 * @param {string} relativePath Path below nodics.core.
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
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/contracts/nodics-principles.md'), [
        'capabilities are sacred, implementations are negotiable',
        'AI Role And Responsibility Boundary',
        'Pre-Implementation Framework Study Gate',
        'Strict Nodics Coding Principles',
        'provide default capabilities',
        'root `package.json` is the only npm dependency installation authority',
        'Security, access control, validation, audit, rollback, diagnostics, and test'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/standards/module-standard.md'), [
        'Module `package.json` files must not declare `dependencies` or',
        '`nodics.dependencyGovernance.ownedDependencies` metadata'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/nodics-principles.md'), [
        'compatibility pointer',
        'modules/nSetup/llm/contracts/nodics-principles.md',
        'Do not add or maintain separate principles here'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/playbooks/change-gate-contract.md'), [
        '## Gate 1A: Implementation Readiness',
        '## Gate 4: Periodic Platform Audit',
        'module structure and naming standards',
        'duplicate or parallel runtime mechanisms',
        'runtime activation, audit, rollback, and diagnostics',
        'Do not use repository `temp` or the refactor-only',
        'active server/node generated-report location'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/contracts/developer-implementation-contract.md'), [
        'AI Expert-Council Responsibility',
        'Pre-Implementation Study And Readiness',
        'security, access, validation, audit, rollback, diagnostics, and test',
        'Apply `integration-governance-contract.md`'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/contracts/human-maintainability-contract.md'), [
        'understandable, diagnosable, safely changeable, and',
        'AI-generated code has no special exemption'
    ]);
},

    /** Implements auditLlmGuidance as an overrideable service operation. */
    auditLlmGuidance: function (failures) {
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/ai-enablement-index.md'), [
        'root-to-leaf README/AGENTS chain',
        'AI Role And Study Gate',
        'Framework-maintainer mode',
        'Application-developer mode',
        'prompts/runtime-governance-prompt.md',
        'contracts/integration-governance-contract.md'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/prompts/runtime-governance-prompt.md'), [
        'preview before mutation',
        'rollback through the owning service',
        'Do not add a parallel activation channel'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/prompts/refactor-prompt.md'), [
        'without changing platform capability',
        'do not create a second loader'
    ]);
    (this.requireClauses || exportedService.requireClauses).call(this, failures, this.corePath('modules/nSetup/llm/prompts/testing-prompt.md'), [
        'later-loaded project modules can override behavior',
        'separate live'
    ]);
},

    /** Implements auditGeneratedContextEntrypoints as an overrideable service operation. */
    auditGeneratedContextEntrypoints: function (failures) {
    [
        'nodics.core/modules/nConfig',
        'nodics.core/modules/nCommon',
        'nodics.core/modules/nTooling',
        'nodics.core/modules/nDynamo',
        'nodics.core/modules/nData/nImport/import',
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

    /** Implements audit as an overrideable service operation. */
    audit: function () {
    const failures = [];
    (this.auditAiGovernance || exportedService.auditAiGovernance).call(this, failures);
    (this.auditCommandGates || exportedService.auditCommandGates).call(this, failures);
    (this.auditPrincipleContracts || exportedService.auditPrincipleContracts).call(this, failures);
    (this.auditLlmGuidance || exportedService.auditLlmGuidance).call(this, failures);
    (this.auditGeneratedContextEntrypoints || exportedService.auditGeneratedContextEntrypoints).call(this, failures);
    return failures;
},

    /** Implements run as an overrideable service operation. */
    run: function () {
    const failures = (this.audit || exportedService.audit).call(this, );
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
