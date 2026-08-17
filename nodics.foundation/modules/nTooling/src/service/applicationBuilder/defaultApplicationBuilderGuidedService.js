/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderGuidedService
 * @description Converts beginner-facing Builder answers into governed solution and plan documents while preserving the same validation, approval, and generation contracts as advanced commands.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling may add presets or wording, but must preserve schema validation, beginner summaries, corrective diagnostics, and delegation to the canonical planning service.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const contractService = require('./defaultApplicationBuilderContractService');
const catalogueService = require('./defaultApplicationBuilderCatalogueService');
const planningService = require('./defaultApplicationBuilderPlanningService');

module.exports = {
    /** Returns a JSON-safe copy of a value. */
    clone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    /** Returns preset metadata used to translate beginner choices. */
    getPresets: function () {
        return {
            commerce: {
                label: 'Commerce storefront',
                selected: ['nodics.commerce'],
                domains: [],
                excluded: ['apparel', 'electronics', 'telco'],
                composition: 'commerce',
                routes: ['/', '/products'],
                renderers: ['commerce.product.card'],
                catalogs: ['mainProductCatalog', 'mainContentCatalog'],
                packs: ['agora.common'],
                journeys: ['commerce.discovery', 'commerce.checkout'],
                explanation: 'Base Commerce storefront with shared product discovery and checkout foundations.'
            },
            apparel: {
                label: 'Apparel commerce storefront',
                selected: ['nodics.commerce', 'apparel'],
                domains: ['APPAREL'],
                excluded: ['electronics', 'telco'],
                composition: 'apparel',
                routes: ['/', '/apparel'],
                renderers: ['agora.apparel.product-card'],
                catalogs: ['apparelProductCatalog', 'apparelContentCatalog'],
                packs: ['agora.common', 'agora.apparel'],
                journeys: ['apparel.size-colour-checkout'],
                explanation: 'Apparel storefront with size, colour, style, brand, and fit-oriented product behavior.'
            },
            electronics: {
                label: 'Electronics commerce storefront',
                selected: ['nodics.commerce', 'electronics'],
                domains: ['ELECTRONICS'],
                excluded: ['apparel', 'telco'],
                composition: 'electronics',
                routes: ['/', '/electronics'],
                renderers: ['agora.electronics.product-card'],
                catalogs: ['electronicsProductCatalog', 'electronicsContentCatalog'],
                packs: ['agora.common', 'agora.electronics'],
                journeys: ['electronics.warranty-checkout'],
                explanation: 'Electronics storefront with device specification, compatibility, and warranty behavior.'
            },
            telco: {
                label: 'Telco commerce storefront',
                selected: ['nodics.commerce', 'telco'],
                domains: ['TELCO'],
                excluded: ['apparel'],
                composition: 'telco',
                routes: ['/', '/telco'],
                renderers: ['agora.telco.product-card'],
                catalogs: ['telcoProductCatalog', 'telcoContentCatalog'],
                packs: ['agora.common', 'agora.telco'],
                journeys: ['telco.device-plan-provisioning'],
                integrations: [{ code: 'localProvisioning', kind: 'PROVISIONING',
                    certificationState: 'LOCAL_ADAPTER', required: true }],
                explanation: 'Telco storefront with device behavior plus subscription-plan and provisioning behavior.'
            },
            combined: {
                label: 'Combined multi-domain commerce storefront',
                selected: ['nodics.commerce', 'apparel', 'electronics', 'telco'],
                domains: ['APPAREL', 'ELECTRONICS', 'TELCO'],
                excluded: [],
                composition: 'combined',
                routes: ['/', '/apparel', '/electronics', '/telco'],
                renderers: ['agora.apparel.product-card', 'agora.electronics.product-card',
                    'agora.telco.product-card'],
                catalogs: ['apparelCatalog', 'electronicsCatalog', 'telcoCatalog', 'contentCatalog'],
                packs: ['agora.common', 'agora.apparel', 'agora.electronics', 'agora.telco'],
                journeys: ['apparel.size-colour-checkout', 'electronics.warranty-checkout',
                    'telco.device-plan-provisioning', 'commerce.mixed-cart'],
                integrations: [{ code: 'localProvisioning', kind: 'PROVISIONING',
                    certificationState: 'LOCAL_ADAPTER', required: true }],
                explanation: 'One storefront combining Apparel, Electronics, and Telco customer journeys.'
            }
        };
    },

    /** Validates guided answers before translation. */
    validateGuidedRequest: function (request) {
        const structural = contractService.validateDocument('guided', request);
        const errors = structural.errors.slice();
        if (request?.frontends && !request.frontends.includes('AGORA')) {
            errors.push('Guided Builder requires AGORA because the storefront experience is Agora.');
        }
        if (request?.outputRoot && !path.isAbsolute(request.outputRoot)) {
            errors.push('Guided Builder output folder must be an absolute path when supplied.');
        }
        return { valid: errors.length === 0, errors: errors };
    },

    /**
     * Creates a guided answer document from beginner-friendly command options.
     * @param {Object} options Answer-template options.
     * @returns {Object} Schema-valid guided request document.
     */
    createAnswersTemplate: function (options = {}) {
        const projectCode = options.projectCode || 'myCommerceApp';
        const customerCode = options.customerCode || 'myCustomer';
        const answers = {
            contractVersion: 1,
            project: {
                projectCode: projectCode,
                customerCode: customerCode,
                displayName: options.displayName || projectCode
            },
            preset: options.preset || 'commerce',
            market: {
                country: options.country || 'AE',
                locale: options.locale || 'en-AE',
                currency: options.currency || 'AED'
            },
            frontends: Array.from(new Set(options.frontends || ['AGORA', 'AXIS'])),
            sampleData: options.sampleData !== false
        };
        if (options.outputRoot) {
            answers.outputRoot = options.outputRoot;
        }
        if (options.approvalReference) {
            answers.approvalReference = options.approvalReference;
        }
        const validation = this.validateGuidedRequest(answers);
        if (!validation.valid) {
            throw new Error('Builder answers template needs correction:\n- ' + validation.errors.join('\n- '));
        }
        return answers;
    },

    /**
     * Resolves a safe absent absolute output file for a guided answers template.
     * @param {string} outputPath Requested output file.
     * @param {string[]} protectedRoots Roots that must not receive the file.
     * @returns {string} Canonical output file path.
     */
    resolveAnswersOutputPath: function (outputPath, protectedRoots = []) {
        if (!outputPath || !path.isAbsolute(outputPath)) {
            throw new Error('Builder answers template output requires an absolute file path when supplied');
        }
        const requestedPath = path.resolve(outputPath);
        const forbiddenRoots = [path.parse(requestedPath).root, path.resolve(os.homedir())]
            .concat(protectedRoots.filter(Boolean).map(root => path.resolve(root)));
        if (forbiddenRoots.some(root => requestedPath === root || requestedPath.startsWith(root + path.sep))) {
            throw new Error('Builder answers template output is a protected root: ' + requestedPath);
        }
        if (fs.existsSync(requestedPath)) {
            throw new Error('Builder answers template output must be absent: ' + requestedPath);
        }
        const parent = path.dirname(requestedPath);
        if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory()) {
            throw new Error('Builder answers template output parent is unavailable: ' + parent);
        }
        if (fs.lstatSync(parent).isSymbolicLink()) {
            throw new Error('Builder answers template rejects symlinked output parent: ' + parent);
        }
        return path.join(fs.realpathSync(parent), path.basename(requestedPath));
    },

    /**
     * Writes guided answers to one absent file using create-only semantics.
     * @param {string} outputPath Absolute output file path.
     * @param {Object} answers Guided answers document.
     * @param {Object} options Write options.
     * @returns {Object} Written artifact metadata.
     */
    writeAnswersTemplate: function (outputPath, answers, options = {}) {
        const target = this.resolveAnswersOutputPath(outputPath, options.protectedRoots || []);
        fs.writeFileSync(target, JSON.stringify(answers, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
        return { path: target, digest: catalogueService.digest(answers) };
    },

    /**
     * Returns beginner questionnaire fields and defaults.
     * @param {Object} defaults Seed values.
     * @returns {Object[]} Ordered questionnaire fields.
     */
    getQuestionnaireFields: function (defaults = {}) {
        return [
            { key: 'projectCode', label: 'Project code', defaultValue: defaults.projectCode || 'myCommerceApp' },
            { key: 'customerCode', label: 'Customer code', defaultValue: defaults.customerCode || 'myCustomer' },
            { key: 'displayName', label: 'Display name', defaultValue: defaults.displayName || defaults.projectCode || 'My Commerce App' },
            { key: 'preset', label: 'Commerce preset (commerce/apparel/electronics/telco/combined)',
                defaultValue: defaults.preset || 'commerce' },
            { key: 'country', label: 'Market country', defaultValue: defaults.country || 'AE' },
            { key: 'locale', label: 'Locale', defaultValue: defaults.locale || 'en-AE' },
            { key: 'currency', label: 'Currency', defaultValue: defaults.currency || 'AED' },
            { key: 'frontends', label: 'Frontends (AGORA,AXIS,NEXUS)', defaultValue: (defaults.frontends || ['AGORA', 'AXIS']).join(',') },
            { key: 'sampleData', label: 'Include sample data? (yes/no)', defaultValue: defaults.sampleData === false ? 'no' : 'yes' },
            { key: 'outputRoot', label: 'Generated output root (optional absolute path)', defaultValue: defaults.outputRoot || '' },
            { key: 'approvalReference', label: 'Approval reference (optional)', defaultValue: defaults.approvalReference || '' }
        ];
    },

    /**
     * Normalizes one questionnaire answer according to its target option.
     * @param {string} key Answer key.
     * @param {string} value Raw answer.
     * @returns {*} Normalized value.
     */
    normalizeQuestionnaireAnswer: function (key, value) {
        if (key === 'frontends') {
            return String(value || '').split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
        }
        if (key === 'sampleData') {
            return !['false', '0', 'no', 'n', 'off'].includes(String(value || '').trim().toLowerCase());
        }
        return String(value || '').trim();
    },

    /**
     * Prompts one question through an injected readline interface.
     * @param {Object} lineReader Readline interface.
     * @param {Object} field Questionnaire field.
     * @returns {Promise<*>} Normalized answer.
     */
    promptField: function (lineReader, field) {
        const prompt = field.label + (field.defaultValue !== '' ? ' [' + field.defaultValue + ']' : '') + ': ';
        return new Promise(resolve => {
            lineReader.question(prompt, answer => {
                const raw = answer === '' ? field.defaultValue : answer;
                resolve(this.normalizeQuestionnaireAnswer(field.key, raw));
            });
        });
    },

    /**
     * Runs the beginner questionnaire and returns a guided answers document.
     * @param {Object} options Questionnaire options and IO overrides.
     * @returns {Promise<Object>} Guided answers document.
     */
    runQuestionnaire: async function (options = {}) {
        const fields = this.getQuestionnaireFields(options.defaults || {});
        if (Array.isArray(options.scriptedAnswers)) {
            const collected = {};
            fields.forEach((field, index) => {
                const answer = options.scriptedAnswers[index] === '' || options.scriptedAnswers[index] === undefined ?
                    field.defaultValue : options.scriptedAnswers[index];
                collected[field.key] = this.normalizeQuestionnaireAnswer(field.key, answer);
            });
            return this.createAnswersTemplate(collected);
        }
        const lineReader = options.lineReader || readline.createInterface({
            input: options.input || process.stdin,
            output: options.output || process.stderr,
            terminal: false
        });
        const closeWhenDone = !options.lineReader;
        const collected = {};
        try {
            for (const field of fields) {
                collected[field.key] = await this.promptField(lineReader, field);
            }
        } finally {
            if (closeWhenDone) {
                lineReader.close();
            }
        }
        return this.createAnswersTemplate(collected);
    },

    /** Converts beginner answers into a full Builder solution document. */
    createSolution: function (request) {
        const validation = this.validateGuidedRequest(request);
        if (!validation.valid) {
            throw new Error('Guided Builder answers need correction:\n- ' + validation.errors.join('\n- '));
        }
        const preset = this.getPresets()[request.preset];
        const frontends = Array.from(new Set(request.frontends)).sort();
        const packs = preset.packs.concat(frontends.includes('NEXUS') ? ['nexus.web'] : []);
        const backendRuntimes = ['PLATFORM', 'WCMS_STAGED', 'WCMS_ONLINE', 'PROCESS', 'COMMERCE'];
        if (frontends.includes('NEXUS') || request.preset === 'combined') {
            backendRuntimes.splice(4, 0, 'ENGAGEMENT');
        }
        return {
            contractVersion: 1,
            identity: {
                solutionCode: request.project.projectCode,
                customerCode: request.project.customerCode,
                projectCode: request.project.projectCode,
                displayName: request.project.displayName || request.project.projectCode
            },
            environment: { mode: 'WORKSPACE', class: 'LOCAL', deploymentShape: 'MODULAR_PROCESSES' },
            capabilities: { selected: preset.selected, domains: preset.domains, excluded: preset.excluded },
            commerce: {
                stores: ['mainStore'],
                catalogs: preset.catalogs,
                locales: [request.market.locale],
                currencies: [request.market.currency],
                markets: [request.market.country]
            },
            topology: { backendRuntimes: backendRuntimes, frontends: frontends },
            experience: { storefront: 'AGORA', composition: preset.composition, routes: preset.routes,
                rendererKeys: preset.renderers, themeCode: request.project.projectCode + 'Theme' },
            security: { authentication: 'PASSWORD', authorization: 'BACKEND_OWNED', session: 'BEARER',
                corsOrigins: ['http://127.0.0.1:3300'], publicApiCategories: ['customer', 'contentDelivery'] },
            integrations: preset.integrations || [],
            data: { packs: packs, customerOwnedRoots: packs.map(pack => 'modules/' + pack + '/data'),
                sampleData: request.sampleData },
            qualification: { profile: 'LOCAL_END_TO_END', journeys: preset.journeys,
                freshDatabaseRequired: true, browserRequired: true },
            decisions: { unresolved: [], assumptions: ['Guided Builder selected local defaults and adapters.'] }
        };
    },

    /** Creates beginner-facing summary text and clear next commands. */
    createBeginnerSummary: function (request, solution, plan, workspaceRoot) {
        const preset = this.getPresets()[request.preset];
        const output = request.outputRoot || '/absolute/path/to/generated/' + solution.identity.projectCode;
        const solutionPath = workspaceRoot ? path.join(workspaceRoot, 'solution.json') : 'the saved solution JSON';
        const planPath = workspaceRoot ? path.join(workspaceRoot, 'generation-plan.json') : 'the saved plan JSON';
        return {
            title: preset.label,
            explanation: preset.explanation,
            project: solution.identity.projectCode,
            backend: plan.backendGraph.nodes,
            storefront: 'Agora ' + solution.experience.composition,
            dataPacks: solution.data.packs,
            customerOwned: solution.data.customerOwnedRoots,
            nextCommands: [
                workspaceRoot ? 'Review the generated files in ' + workspaceRoot + '.'
                    : 'Review this generated solution and plan.',
                'Approve the plan with builder:approve --approval-reference=' +
                    (request.approvalReference || 'CHANGE-REFERENCE') + ' --plan=' + planPath,
                'Generate into ' + output + ' with builder:generate --solution=' + solutionPath +
                    ' --plan=/path/to/approved-generation-plan.json --output=' + output,
                'Run builder:qualify after generation with the same solution, approved plan, and output folder.'
            ],
            beginnerNotes: [
                'You do not need to know Nodics module names to use this preset.',
                'The backend graph and digests are included as audit evidence.',
                workspaceRoot ? 'builder:guide wrote review artifacts only, not generated application files.'
                    : 'No project files are written by builder:guide.'
            ]
        };
    },

    /**
     * Creates a beginner-readable dry-run projection from the governed solution and plan.
     * @param {Object} request Beginner guided request.
     * @param {Object} solution Governed Builder solution.
     * @param {Object} plan Approval-required generation plan.
     * @param {Object} catalogue Source-backed capability catalogue.
     * @returns {Object} Read-only dry-run projection.
     */
    createDryRunProjection: function (request, solution, plan, catalogue) {
        const preset = this.getPresets()[request.preset];
        const explicit = new Set(solution.capabilities.selected || []);
        const resolved = plan.resolvedCapabilities.map(capability => capability.code);
        const transitive = resolved.filter(code => !explicit.has(code));
        const frontendApps = (solution.topology.frontends || []).map(frontend => ({
            code: frontend,
            included: true,
            reason: frontend === 'AGORA' ? 'Selected commerce storefront experience' :
                frontend === 'AXIS' ? 'Selected BackOffice/admin experience' :
                    'Selected corporate website experience'
        }));
        return {
            contractVersion: 1,
            dryRun: true,
            writePerformed: false,
            generatedApplication: false,
            safety: {
                mode: 'READ_ONLY_PLAN',
                approvalRequired: plan.approval.required === true,
                generationBlocked: plan.approval.state !== 'APPROVED',
                message: 'No backend, frontend, data, or customer project files are written by this dry run.'
            },
            beginnerQuestions: [
                { id: 'project', question: 'What is the application or project name?', answer: solution.identity.projectCode },
                { id: 'customer', question: 'Who is this application for?', answer: solution.identity.customerCode },
                { id: 'domain', question: 'Which commerce journey do you want?', answer: preset.label },
                { id: 'frontends', question: 'Which user experiences do you need?', answer: solution.topology.frontends },
                { id: 'sampleData', question: 'Should the generated project include sample catalogues?', answer: request.sampleData }
            ],
            selectedResult: {
                backendCapabilities: resolved,
                explicitBackendSelections: Array.from(explicit).sort(),
                transitiveBackendDependencies: transitive.sort(),
                frontends: frontendApps,
                activeDomains: solution.capabilities.domains,
                storefrontComposition: solution.experience.composition,
                rendererKeys: solution.experience.rendererKeys,
                dataPacks: solution.data.packs,
                sampleData: solution.data.sampleData
            },
            customerProjectOutputs: {
                backend: plan.operations.filter(operation => operation.targetRoot === 'BACKEND')
                    .map(operation => operation.targetPath),
                storefront: plan.operations.filter(operation => operation.targetRoot === 'STOREFRONT')
                    .map(operation => operation.targetPath),
                data: plan.operations.filter(operation => operation.targetRoot === 'DATA')
                    .map(operation => operation.targetPath),
                evidence: plan.operations.filter(operation => operation.targetRoot === 'EVIDENCE')
                    .map(operation => operation.targetPath)
            },
            ownershipRules: [
                'Reusable framework and domain behavior stays in nodics.ai.',
                'Customer-owned product, content, page, component, price, inventory, and catalogue data stays in selected Kickoff/customer data packs.',
                'Frontend orchestration may use nodics.exp, but Axis, Nexus, and Agora remain separate application repositories.',
                'Generation cannot run until the plan is approved explicitly.'
            ],
            validationGates: plan.qualification.commands,
            source: {
                catalogueDigest: catalogue.catalogueDigest,
                solutionDigest: plan.solutionDigest,
                planId: plan.planId,
                approvalState: plan.approval.state
            }
        };
    },

    /** Resolves and validates an absent absolute review workspace with non-symlink ancestors. */
    resolveReviewWorkspace: function (configuredRoot, protectedRoots = []) {
        if (!configuredRoot || !path.isAbsolute(configuredRoot)) {
            throw new Error('Builder guided review requires --workspace as an absolute path when supplied');
        }
        const requestedRoot = path.resolve(configuredRoot);
        const forbidden = new Set([path.parse(requestedRoot).root, path.resolve(os.homedir())]
            .concat(protectedRoots.filter(Boolean).map(root => path.resolve(root))));
        if (forbidden.has(requestedRoot)) {
            throw new Error('Builder guided review workspace is a protected root: ' + requestedRoot);
        }
        if (fs.existsSync(requestedRoot)) {
            throw new Error('Builder guided review workspace must be absent: ' + requestedRoot);
        }
        let ancestor = path.dirname(requestedRoot);
        while (!fs.existsSync(ancestor)) {
            const parent = path.dirname(ancestor);
            if (parent === ancestor) {
                break;
            }
            ancestor = parent;
        }
        if (!fs.existsSync(ancestor) || !fs.statSync(ancestor).isDirectory()) {
            throw new Error('Builder guided review workspace has no available parent directory');
        }
        if (fs.lstatSync(ancestor).isSymbolicLink()) {
            throw new Error('Builder guided review rejects symlinked workspace ancestors: ' + ancestor);
        }
        const realAncestor = fs.realpathSync(ancestor);
        return path.resolve(realAncestor, path.relative(ancestor, requestedRoot));
    },

    /** Renders the beginner summary as a plain Markdown review artifact. */
    renderSummaryMarkdown: function (summary, solution, plan) {
        return '# Nodics Application Builder review\n\n' +
            'Project: `' + summary.project + '`\n\n' +
            summary.explanation + '\n\n' +
            '## Selected result\n\n' +
            '- Backend capabilities: `' + summary.backend.join('`, `') + '`\n' +
            '- Storefront: `' + summary.storefront + '`\n' +
            '- Data packs: `' + summary.dataPacks.join('`, `') + '`\n' +
            '- Plan: `' + plan.planId + '`\n' +
            '- Approval state: `' + plan.approval.state + '`\n' +
            '- Solution digest: `' + plan.solutionDigest + '`\n\n' +
            '## Customer-owned roots\n\n' +
            summary.customerOwned.map(item => '- `' + item + '`').join('\n') + '\n\n' +
            '## Next commands\n\n' +
            summary.nextCommands.map(item => '- ' + item).join('\n') + '\n\n' +
            '## Beginner notes\n\n' +
            summary.beginnerNotes.map(item => '- ' + item).join('\n') + '\n';
    },

    /** Writes the guided review artifacts into an absent review workspace. */
    writeReviewWorkspace: function (workspaceRoot, request, solution, plan, summary, options = {}) {
        const reviewRoot = this.resolveReviewWorkspace(workspaceRoot, options.protectedRoots || []);
        const artifacts = [];
        const writeArtifact = (relativePath, content) => {
            const target = path.resolve(reviewRoot, relativePath);
            if (target !== reviewRoot && !target.startsWith(reviewRoot + path.sep)) {
                throw new Error('Guided review artifact escapes workspace: ' + relativePath);
            }
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, content, { encoding: 'utf8', flag: 'wx' });
            artifacts.push({ path: relativePath, absolutePath: target, digest: catalogueService.digest(content) });
        };
        let createdRoot = false;
        try {
            fs.mkdirSync(reviewRoot);
            createdRoot = true;
            writeArtifact('guided-answers.json', JSON.stringify(request, null, 2) + '\n');
            writeArtifact('solution.json', JSON.stringify(solution, null, 2) + '\n');
            writeArtifact('generation-plan.json', JSON.stringify(plan, null, 2) + '\n');
            writeArtifact('beginner-summary.md', this.renderSummaryMarkdown(summary, solution, plan));
            writeArtifact('builder-guide-report.json', JSON.stringify({
                contractVersion: 1,
                createdAt: options.createdAt || options.now || new Date().toISOString(),
                projectCode: solution.identity.projectCode,
                workspaceRoot: reviewRoot,
                writeScope: 'GUIDED_REVIEW_ONLY',
                generatedApplication: false,
                solutionDigest: plan.solutionDigest,
                planId: plan.planId,
                planApprovalState: plan.approval.state,
                artifacts: artifacts
            }, null, 2) + '\n');
            return { workspaceRoot: reviewRoot, artifacts: artifacts };
        } catch (error) {
            if (createdRoot && fs.existsSync(reviewRoot)) {
                fs.rmSync(reviewRoot, { recursive: true, force: true });
            }
            throw error;
        }
    },

    /** Produces the governed guided Builder response. */
    guide: function (request, catalogue, options = {}) {
        const solution = this.createSolution(request);
        const plan = planningService.createPlan(solution, catalogue, options);
        const workspaceRoot = options.workspaceRoot ? this.resolveReviewWorkspace(options.workspaceRoot,
            options.protectedRoots || []) : undefined;
        const summary = this.createBeginnerSummary(request, solution, plan, workspaceRoot);
        const result = {
            guided: true,
            writePerformed: false,
            summary: summary,
            solution: solution,
            plan: plan
        };
        if (workspaceRoot) {
            const review = this.writeReviewWorkspace(workspaceRoot, request, solution, plan, summary, options);
            result.writePerformed = true;
            result.workspaceRoot = review.workspaceRoot;
            result.artifacts = review.artifacts;
        }
        return result;
    },

    /** Produces a read-only beginner dry run from guided answers without review or generation writes. */
    dryRun: function (request, catalogue, options = {}) {
        const solution = this.createSolution(request);
        const plan = planningService.createPlan(solution, catalogue, options);
        const summary = this.createBeginnerSummary(request, solution, plan);
        return {
            guided: true,
            dryRun: true,
            writePerformed: false,
            summary: summary,
            dryRunPlan: this.createDryRunProjection(request, solution, plan, catalogue),
            solution: solution,
            plan: plan
        };
    }
};
