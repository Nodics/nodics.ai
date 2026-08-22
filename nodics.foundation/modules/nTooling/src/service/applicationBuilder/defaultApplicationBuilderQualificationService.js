/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderQualificationService
 * @description Qualifies generated Builder outputs through deterministic artifact checks, allowlisted local commands, optional reference-workspace evidence, and lock-state updates.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling may contribute additional evidence gates, but must preserve explicit roots, lock binding, command allowlisting, generated-skeleton honesty, and schema-validated reports.
 */
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const catalogueService = require('./defaultApplicationBuilderCatalogueService');
const contractService = require('./defaultApplicationBuilderContractService');

module.exports = {
    /** Returns a JSON-safe copy of a value. */
    clone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    /** Resolves an existing generated output root. */
    resolveGeneratedRoot: function (configuredRoot) {
        if (!configuredRoot || !path.isAbsolute(configuredRoot)) {
            throw new Error('Builder qualification requires --output as an absolute path');
        }
        const outputRoot = path.resolve(configuredRoot);
        if (!fs.existsSync(outputRoot) || !fs.statSync(outputRoot).isDirectory()) {
            throw new Error('Builder qualification output root is unavailable: ' + outputRoot);
        }
        return outputRoot;
    },

    /** Loads and validates the generated solution lock. */
    loadLock: function (outputRoot) {
        const lockPath = path.join(outputRoot, 'solution-lock.json');
        if (!fs.existsSync(lockPath) || !fs.statSync(lockPath).isFile()) {
            throw new Error('Builder qualification requires a generated solution-lock.json');
        }
        const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        const validation = contractService.validateDocument('lock', lock);
        if (!validation.valid) {
            throw new Error('Generated solution lock is invalid:\n- ' + validation.errors.join('\n- '));
        }
        return lock;
    },

    /** Validates that the generated output still binds to the supplied solution, plan, and catalogue. */
    validateBinding: function (lock, solution, plan, catalogue) {
        const errors = [];
        if (lock.solutionDigest !== catalogueService.digest(solution)) {
            errors.push('Generated lock does not match the supplied solution');
        }
        if (lock.planDigest !== plan?.approval?.approvedPlanDigest) {
            errors.push('Generated lock does not match the approved plan');
        }
        if (plan.catalogueDigest !== catalogue.catalogueDigest) {
            errors.push('Plan does not match the current capability catalogue');
        }
        if (plan.solutionDigest !== catalogueService.digest(solution)) {
            errors.push('Plan does not match the supplied solution');
        }
        if (errors.length > 0) {
            throw new Error('Builder qualification binding failed:\n- ' + errors.join('\n- '));
        }
    },

    /** Creates one evidence entry with a deterministic digest. */
    evidence: function (gate, kind, state, summary, details = {}) {
        const entry = Object.assign({
            gate: gate,
            kind: kind,
            state: state,
            summary: summary
        }, details);
        entry.digest = catalogueService.digest(entry);
        return entry;
    },

    /** Reads the generated backend graph for the project. */
    readGeneratedBackendGraph: function (outputRoot, solution) {
        const graphPath = path.join(outputRoot, 'backend', 'generated',
            solution.identity.projectCode + '-module-graph.json');
        if (!fs.existsSync(graphPath)) {
            throw new Error('Generated backend graph is missing: ' + path.relative(outputRoot, graphPath));
        }
        return JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    },

    /** Reads the generated Agora composition object from the TypeScript artifact. */
    readGeneratedComposition: function (outputRoot) {
        const compositionPath = path.join(outputRoot, 'storefront', 'generated', 'agora-composition.ts');
        if (!fs.existsSync(compositionPath)) {
            throw new Error('Generated Agora composition is missing: storefront/generated/agora-composition.ts');
        }
        const source = fs.readFileSync(compositionPath, 'utf8');
        const match = source.match(/const composition = ([\s\S]+) as const;/);
        if (!match) {
            throw new Error('Generated Agora composition does not contain a parseable composition object');
        }
        return JSON.parse(match[1]);
    },

    /** Verifies the generated backend graph and records evidence. */
    qualifyBackendGraph: function (outputRoot, solution, plan, lock) {
        const graph = this.readGeneratedBackendGraph(outputRoot, solution);
        const actual = {
            nodes: graph.capabilities,
            edges: graph.edges
        };
        if (JSON.stringify(actual.nodes) !== JSON.stringify(plan.backendGraph.nodes) ||
            JSON.stringify(actual.edges) !== JSON.stringify(plan.backendGraph.edges) ||
            catalogueService.digest(plan.backendGraph) !== lock.effectiveGraphs.backend.digest) {
            return this.evidence('backend.graph', 'ARTIFACT', 'FAILED',
                'Generated backend graph differs from the approved plan or lock.');
        }
        return this.evidence('backend.graph', 'ARTIFACT', 'PASSED',
            'Generated backend graph matches the approved dependency closure and lock.');
    },

    /** Verifies the generated frontend composition and records evidence. */
    qualifyFrontendComposition: function (outputRoot, solution, plan, lock) {
        const composition = this.readGeneratedComposition(outputRoot);
        if (composition.composition !== solution.experience.composition ||
            JSON.stringify(composition.rendererKeys) !== JSON.stringify(solution.experience.rendererKeys) ||
            catalogueService.digest(plan.frontendGraph) !== lock.effectiveGraphs.frontend.digest) {
            return this.evidence('frontend.composition', 'ARTIFACT', 'FAILED',
                'Generated Agora composition differs from the selected solution or lock.');
        }
        return this.evidence('frontend.composition', 'ARTIFACT', 'PASSED',
            'Generated Agora composition matches the selected experience and frontend graph.');
    },

    /** Verifies that generated customer-owned extension directories are present and empty. */
    qualifyCustomerOwnership: function (outputRoot, solution) {
        const requiredDirectories = ['backend/customer', 'storefront/customer']
            .concat((solution.data.packs || []).map(dataPack => 'data/' + dataPack));
        const missingOrPopulated = requiredDirectories.filter(relativePath => {
            const target = path.join(outputRoot, relativePath);
            return !fs.existsSync(target) || !fs.statSync(target).isDirectory() ||
                (relativePath.endsWith('/customer') && fs.readdirSync(target).length > 0);
        });
        if (missingOrPopulated.length > 0) {
            return this.evidence('customer.ownership', 'ARTIFACT', 'FAILED',
                'Customer-owned generated roots are missing or pre-populated: ' + missingOrPopulated.join(', '));
        }
        return this.evidence('customer.ownership', 'ARTIFACT', 'PASSED',
            'Customer-owned extension and data-pack roots exist without framework business logic.');
    },

    /** Verifies the generated solution still carries backend-owned security and no inline secrets. */
    qualifySecurityBoundary: function (solution) {
        const validation = contractService.validateDocument('solution', solution);
        if (!validation.valid || solution.security.authorization !== 'BACKEND_OWNED') {
            return this.evidence('security.boundary', 'SEMANTIC', 'FAILED',
                'Solution security contract failed: ' + validation.errors.join('; '));
        }
        return this.evidence('security.boundary', 'SEMANTIC', 'PASSED',
            'Solution remains secret-free with backend-owned authorization.');
    },

    /** Verifies beginner and machine-readable generated handoff artifacts. */
    qualifyGeneratedHandoff: function (outputRoot, solution, plan) {
        const readmePath = path.join(outputRoot, 'README.md');
        const handoffPath = path.join(outputRoot, 'builder-handoff.json');
        if (!fs.existsSync(readmePath) || !fs.existsSync(handoffPath)) {
            return this.evidence('generated.handoff', 'ARTIFACT', 'FAILED',
                'Generated handoff README.md or builder-handoff.json is missing.');
        }
        try {
            const readme = fs.readFileSync(readmePath, 'utf8');
            const handoff = JSON.parse(fs.readFileSync(handoffPath, 'utf8'));
            const expectedPacks = (solution.data.packs || []).slice().sort();
            if (!readme.includes('Nodics Application Builder') || !readme.includes('## Ownership')) {
                return this.evidence('generated.handoff', 'ARTIFACT', 'FAILED',
                    'Generated README does not explain Builder origin and ownership.');
            }
            if (handoff.project.projectCode !== solution.identity.projectCode ||
                JSON.stringify(handoff.selected.backendCapabilities) !== JSON.stringify(plan.backendGraph.nodes) ||
                JSON.stringify(handoff.selected.dataPacks) !== JSON.stringify(expectedPacks) ||
                !String(handoff.ownership.framework || '').includes('nodics.ai') ||
                !(handoff.nextCommands || []).includes('npm test')) {
                return this.evidence('generated.handoff', 'ARTIFACT', 'FAILED',
                    'Generated handoff JSON does not match the approved project, graph, data packs, ownership, or next commands.');
            }
            return this.evidence('generated.handoff', 'ARTIFACT', 'PASSED',
                'Generated README and builder-handoff.json explain identity, ownership, selected graph, data packs, and next commands.',
                { source: 'builder-handoff.json' });
        } catch (error) {
            return this.evidence('generated.handoff', 'ARTIFACT', 'FAILED',
                'Generated handoff could not be parsed or validated: ' + error.message);
        }
    },

    /** Runs the generated-root self-test through an allowlisted command. */
    qualifyGeneratedSelfTest: function (outputRoot, executeCommands) {
        const command = 'npm test';
        if (!executeCommands) {
            return this.evidence('generated.self-test', 'COMMAND', 'PASSED',
                'Generated self-test command was verified as allowlisted but not executed in report-only mode.',
                { command: command });
        }
        try {
            childProcess.execFileSync('npm', ['test'], { cwd: outputRoot, stdio: 'pipe' });
            return this.evidence('generated.self-test', 'COMMAND', 'PASSED',
                'Generated self-test completed successfully.', { command: command });
        } catch (error) {
            return this.evidence('generated.self-test', 'COMMAND', 'FAILED',
                'Generated self-test failed.', { command: command });
        }
    },

    /** Runs the generated backend and storefront runtime probe through an allowlisted command. */
    qualifyGeneratedRuntime: function (outputRoot, executeCommands) {
        const command = 'npm run verify:runtime';
        if (!executeCommands) {
            return this.evidence('generated.runtime', 'COMMAND', 'PASSED',
                'Generated runtime probe command was verified as allowlisted but not executed in report-only mode.',
                { command: command });
        }
        try {
            childProcess.execFileSync('npm', ['run', 'verify:runtime'], { cwd: outputRoot, stdio: 'pipe' });
            return this.evidence('generated.runtime', 'COMMAND', 'PASSED',
                'Generated backend and storefront runtime probes completed successfully.', { command: command });
        } catch (error) {
            return this.evidence('generated.runtime', 'COMMAND', 'FAILED',
                'Generated backend or storefront runtime probe failed.', { command: command });
        }
    },

    /** Adds optional reference-workspace evidence without treating it as generated-app runtime proof. */
    qualifyReferenceWorkspace: function (referenceEvidencePath, outputRoot) {
        if (!referenceEvidencePath) {
            return [];
        }
        const resolved = path.resolve(referenceEvidencePath);
        if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
            throw new Error('Reference qualification evidence is unavailable: ' + resolved);
        }
        const source = fs.readFileSync(resolved, 'utf8');
        const passed = /Status:\s*\*\*PASSED\*\*/.test(source) &&
            /all nine runtimes READY/i.test(source) &&
            /fresh-database qualification/i.test(source);
        return [this.evidence('reference.workspace.nine-runtimes', 'REFERENCE_DOCUMENT',
            passed ? 'PASSED' : 'FAILED',
            passed ? 'Reference workspace fresh-database nine-runtime qualification is recorded as passed.' :
                'Reference workspace evidence does not prove fresh-database nine-runtime qualification.',
            { source: path.basename(resolved) })];
    },

    /** Builds a schema-validated qualification report. */
    createReport: function (outputRoot, solution, plan, catalogue, lock, evidence, options = {}) {
        const createdAt = options.now || new Date().toISOString();
        const allPassed = evidence.every(entry => entry.state === 'PASSED');
        const gates = evidence.map(entry => entry.gate);
        const seed = catalogueService.digest({
            solutionDigest: lock.solutionDigest,
            planDigest: lock.planDigest,
            gates: gates,
            createdAt: createdAt
        });
        const evidenceDigest = catalogueService.digest(evidence);
        const reportPath = options.reportPath || 'qualification/builder-qualification-report.json';
        const fullGeneratedApplication = allPassed && gates.includes('generated.runtime');
        const scope = fullGeneratedApplication ? 'FULL_GENERATED_APPLICATION' :
            options.referenceEvidencePath ? 'REFERENCE_WORKSPACE' : 'GENERATED_SKELETON';
        const report = {
            contractVersion: 0,
            qualificationId: 'builder-qualification-' + seed.slice('sha256:'.length, 'sha256:'.length + 32),
            createdAt: createdAt,
            solutionDigest: lock.solutionDigest,
            planDigest: lock.planDigest,
            catalogueDigest: catalogue.catalogueDigest,
            projectCode: solution.identity.projectCode,
            scope: scope,
            state: allPassed ? 'PASSED' : 'FAILED',
            gates: gates,
            evidence: evidence,
            evidenceDigest: evidenceDigest,
            lockUpdate: {
                state: allPassed ? 'PASSED' : 'FAILED',
                verifiedAt: createdAt,
                evidenceDigest: evidenceDigest,
                gates: gates,
                scope: scope,
                reportPath: reportPath
            }
        };
        const validation = contractService.validateDocument('qualification', report);
        if (!validation.valid) {
            throw new Error('Builder produced an invalid qualification report:\n- ' + validation.errors.join('\n- '));
        }
        return report;
    },

    /** Renders a human-readable qualification summary next to the JSON report. */
    renderHumanSummary: function (report, solution, outputRoot) {
        const passed = report.evidence.filter(entry => entry.state === 'PASSED').map(entry => entry.gate);
        const failed = report.evidence.filter(entry => entry.state === 'FAILED');
        const handoffPath = path.join(outputRoot, 'builder-handoff.json');
        let nextCommands = ['npm test', 'npm run verify:runtime'];
        if (fs.existsSync(handoffPath)) {
            try {
                const handoff = JSON.parse(fs.readFileSync(handoffPath, 'utf8'));
                nextCommands = handoff.nextCommands || nextCommands;
            } catch {}
        }
        return '# Builder qualification summary\n\n' +
            '- Project: `' + solution.identity.projectCode + '`\n' +
            '- State: `' + report.state + '`\n' +
            '- Scope: `' + report.scope + '`\n' +
            '- JSON report: `' + report.lockUpdate.reportPath + '`\n' +
            '- Evidence digest: `' + report.evidenceDigest + '`\n\n' +
            '## Passed gates\n\n' +
            (passed.length ? passed.map(gate => '- `' + gate + '`').join('\n') : '- None') + '\n\n' +
            '## Failed gates\n\n' +
            (failed.length ? failed.map(entry => '- `' + entry.gate + '`: ' + entry.summary).join('\n') : '- None') + '\n\n' +
            '## Next commands\n\n' +
            nextCommands.map(command => '- `' + command + '`').join('\n') + '\n\n' +
            '## Handoff\n\n' +
            '- Beginner README: `README.md`\n' +
            '- Machine handoff: `builder-handoff.json`\n';
    },

    /** Writes the qualification report and updates solution-lock.json. */
    writeQualification: function (outputRoot, lock, report) {
        const reportTarget = path.join(outputRoot, report.lockUpdate.reportPath);
        fs.mkdirSync(path.dirname(reportTarget), { recursive: true });
        fs.writeFileSync(reportTarget, JSON.stringify(report, null, 2) + '\n', { encoding: 'utf8' });
        const summaryPath = path.join(path.dirname(report.lockUpdate.reportPath), 'builder-qualification-summary.md');
        fs.writeFileSync(path.join(outputRoot, summaryPath), this.renderHumanSummary(report,
            { identity: { projectCode: report.projectCode } }, outputRoot), { encoding: 'utf8' });
        const nextLock = this.clone(lock);
        nextLock.qualification = report.lockUpdate;
        const lockValidation = contractService.validateDocument('lock', nextLock);
        if (!lockValidation.valid) {
            throw new Error('Builder qualification produced an invalid solution lock:\n- ' +
                lockValidation.errors.join('\n- '));
        }
        fs.writeFileSync(path.join(outputRoot, 'solution-lock.json'), JSON.stringify(nextLock, null, 2) + '\n',
            { encoding: 'utf8' });
        return nextLock;
    },

    /** Qualifies one generated output root and returns the report plus updated lock state. */
    qualify: function (plan, solution, catalogue, configuredRoot, options = {}) {
        const outputRoot = this.resolveGeneratedRoot(configuredRoot);
        const lock = this.loadLock(outputRoot);
        this.validateBinding(lock, solution, plan, catalogue);
        const evidence = [
            this.qualifyBackendGraph(outputRoot, solution, plan, lock),
            this.qualifyFrontendComposition(outputRoot, solution, plan, lock),
            this.qualifyCustomerOwnership(outputRoot, solution),
            this.qualifySecurityBoundary(solution),
            this.qualifyGeneratedHandoff(outputRoot, solution, plan),
            this.qualifyGeneratedSelfTest(outputRoot, options.executeCommands !== false),
            this.qualifyGeneratedRuntime(outputRoot, options.executeCommands !== false)
        ].concat(this.qualifyReferenceWorkspace(options.referenceEvidencePath, outputRoot));
        const report = this.createReport(outputRoot, solution, plan, catalogue, lock, evidence, options);
        const nextLock = options.write === false ? Object.assign({}, lock, { qualification: report.lockUpdate }) :
            this.writeQualification(outputRoot, lock, report);
        return {
            qualified: report.state === 'PASSED',
            state: report.state,
            scope: report.scope,
            outputRoot: outputRoot,
            reportPath: report.lockUpdate.reportPath,
            summaryPath: path.join(path.dirname(report.lockUpdate.reportPath), 'builder-qualification-summary.md'),
            evidenceDigest: report.evidenceDigest,
            gates: report.gates,
            lockQualification: nextLock.qualification
        };
    }
};
