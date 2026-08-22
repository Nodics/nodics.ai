/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/command/defaultApplicationBuilderCommandService
 * @description Adapts Builder discover, guided creation, validation, planning, approval, generation, and qualification commands to merged nTooling services with explicit repository coordinates.
 * @layer tooling
 * @owner nTooling
 * @override Projects may extend the underlying merged services; command replacements must preserve read-only operation and explicit repository coordinates through the tooling override contract.
 */
const fs = require('fs');
const path = require('path');
const toolingCommandService = require('../defaultToolingCommandService');

module.exports = {
    /**
     * Reads one command-line option in `--name=value` form.
     * @param {string[]} args CLI arguments.
     * @param {string} name Option name.
     * @param {*} defaultValue Fallback value.
     * @returns {*} Parsed value or fallback.
     */
    readOption: function (args, name, defaultValue) {
        const prefix = name + '=';
        const match = (args || []).find(argument => argument.startsWith(prefix));
        return match ? match.slice(prefix.length) : defaultValue;
    },

    /**
     * Loads a JSON solution document from an explicitly supplied path.
     * @param {string[]} args CLI arguments.
     * @returns {Object} Parsed solution document.
     */
    loadSolution: function (args) {
        const configuredPath = this.readOption(args, '--solution', '');
        if (!configuredPath) {
            throw new Error('Application Builder command requires --solution=/absolute/or/relative/solution.json');
        }
        const solutionPath = path.resolve(configuredPath);
        if (!fs.existsSync(solutionPath) || !fs.statSync(solutionPath).isFile()) {
            throw new Error('Application Builder solution file is unavailable: ' + solutionPath);
        }
        return JSON.parse(fs.readFileSync(solutionPath, 'utf8'));
    },

    /** Loads a generation plan from an explicitly supplied path. */
    loadPlan: function (args) {
        const configuredPath = this.readOption(args, '--plan', '');
        if (!configuredPath) {
            throw new Error('Application Builder command requires --plan=/absolute/or/relative/generation-plan.json');
        }
        const planPath = path.resolve(configuredPath);
        if (!fs.existsSync(planPath) || !fs.statSync(planPath).isFile()) {
            throw new Error('Application Builder plan file is unavailable: ' + planPath);
        }
        return JSON.parse(fs.readFileSync(planPath, 'utf8'));
    },

    /** Loads a generated solution lock from an explicitly supplied path. */
    loadLock: function (args) {
        const configuredPath = this.readOption(args, '--current-lock', '');
        if (!configuredPath) {
            throw new Error('Application Builder upgrade command requires --current-lock=/absolute/or/relative/solution-lock.json');
        }
        const lockPath = path.resolve(configuredPath);
        if (!fs.existsSync(lockPath) || !fs.statSync(lockPath).isFile()) {
            throw new Error('Application Builder current lock file is unavailable: ' + lockPath);
        }
        return JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    },

    /** Loads a release manifest from an explicitly supplied path. */
    loadReleaseManifest: function (args) {
        const configuredPath = this.readOption(args, '--release', '');
        if (!configuredPath) {
            throw new Error('Application Builder upgrade command requires --release=/absolute/or/relative/release-manifest.json');
        }
        const manifestPath = path.resolve(configuredPath);
        if (!fs.existsSync(manifestPath) || !fs.statSync(manifestPath).isFile()) {
            throw new Error('Application Builder release manifest is unavailable: ' + manifestPath);
        }
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    },

    /** Loads beginner-facing Builder answers from an explicitly supplied path. */
    loadGuidedAnswers: function (args) {
        const configuredPath = this.readOption(args, '--answers', '');
        if (!configuredPath) {
            throw new Error('Application Builder guided command requires --answers=/absolute/or/relative/answers.json');
        }
        const answersPath = path.resolve(configuredPath);
        if (!fs.existsSync(answersPath) || !fs.statSync(answersPath).isFile()) {
            throw new Error('Application Builder guided answers file is unavailable: ' + answersPath);
        }
        return JSON.parse(fs.readFileSync(answersPath, 'utf8'));
    },

    /**
     * Parses a comma-separated option into normalized values.
     * @param {string[]} args CLI arguments.
     * @param {string} name Option name.
     * @param {string[]} defaultValue Fallback values.
     * @returns {string[]} Parsed values.
     */
    readCsvOption: function (args, name, defaultValue) {
        const raw = this.readOption(args, name, '');
        if (!raw) {
            return defaultValue;
        }
        return raw.split(',').map(item => item.trim()).filter(Boolean);
    },

    /**
     * Parses a boolean option from beginner command-line flags.
     * @param {string[]} args CLI arguments.
     * @param {string} name Option name.
     * @param {boolean} defaultValue Fallback value.
     * @returns {boolean} Parsed boolean.
     */
    readBooleanOption: function (args, name, defaultValue) {
        const raw = this.readOption(args, name, '');
        if (!raw) {
            return defaultValue;
        }
        return !['false', '0', 'no', 'off'].includes(String(raw).toLowerCase());
    },

    /**
     * Reads beginner answer-template flags without requiring a hand-authored JSON file.
     * @param {string[]} args CLI arguments.
     * @returns {Object} Answer-template options.
     */
    readAnswerTemplateOptions: function (args) {
        return {
            projectCode: this.readOption(args, '--project-code', 'myCommerceApp'),
            customerCode: this.readOption(args, '--customer-code', 'myCustomer'),
            displayName: this.readOption(args, '--display-name', ''),
            preset: this.readOption(args, '--preset', 'commerce'),
            country: this.readOption(args, '--country', 'AE'),
            locale: this.readOption(args, '--locale', 'en-AE'),
            currency: this.readOption(args, '--currency', 'AED'),
            frontends: this.readCsvOption(args, '--frontends', ['AGORA', 'AXIS'])
                .map(frontend => frontend.toUpperCase()),
            sampleData: this.readBooleanOption(args, '--sample-data', true),
            outputRoot: this.readOption(args, '--output-root', ''),
            approvalReference: this.readOption(args, '--approval-reference', '')
        };
    },

    /**
     * Returns a beginner-readable command workflow while preserving JSON automation output.
     * @param {string} operation Current Builder operation.
     * @returns {Object} Ordered workflow guidance.
     */
    workflow: function (operation) {
        const steps = [
            { step: 1, operation: 'answers-template', command: 'builder:answers-template --output=/path/to/answers.json',
                purpose: 'Create editable beginner answers.' },
            { step: 2, operation: 'dry-run', command: 'builder:dry-run --answers=/path/to/answers.json',
                purpose: 'Review selected capabilities, frontends, renderers, and data packs without writing an application.' },
            { step: 3, operation: 'guide', command: 'builder:guide --answers=/path/to/answers.json --workspace=/path/to/review',
                purpose: 'Write review artifacts for approval.' },
            { step: 4, operation: 'approve', command: 'builder:approve --plan=/path/to/generation-plan.json --approval-reference=CHANGE-ID',
                purpose: 'Bind explicit human approval to the immutable plan.' },
            { step: 5, operation: 'generate', command: 'builder:generate --solution=/path/to/solution.json --plan=/path/to/approved-plan.json --output=/absent/output/root',
                purpose: 'Generate the customer starter into an absent root.' },
            { step: 6, operation: 'qualify', command: 'builder:qualify --solution=/path/to/solution.json --plan=/path/to/approved-plan.json --output=/generated/root',
                purpose: 'Run generated tests, runtime probes, evidence gates, and lock update.' }
        ];
        const current = steps.find(step => step.operation === operation);
        return {
            currentOperation: operation,
            recommendedNext: current && current.step < steps.length ? steps[current.step] : null,
            steps: steps
        };
    },

    /**
     * Resolves explicit repository coordinates for workspace discovery.
     * @param {Object} context Tooling command context.
     * @returns {{framework:string,agora:string,kickoff:string,exp:string}} Repository roots.
     */
    repositoryCoordinates: function (context) {
        return {
            framework: context.home,
            agora: this.readOption(context.args, '--agora', ''),
            kickoff: this.readOption(context.args, '--kickoff', ''),
            exp: this.readOption(context.args, '--exp', '')
        };
    },

    /** Returns the canonical experience workspace root. */
    experienceRoot: function (context) {
        return this.readOption(context.args, '--exp', '');
    },

    /**
     * Resolves the merged catalogue service.
     * @param {Object} context Tooling command context.
     * @returns {Object} Catalogue service.
     */
    resolveCatalogueService: function (context) {
        return toolingCommandService.loadMergedService(context.home,
            context.command.catalogueService || 'defaultApplicationBuilderCatalogueService');
    },

    /**
     * Resolves the merged planning service.
     * @param {Object} context Tooling command context.
     * @returns {Object} Planning service.
     */
    resolvePlanningService: function (context) {
        return toolingCommandService.loadMergedService(context.home,
            context.command.planningService || 'defaultApplicationBuilderPlanningService');
    },

    /** Resolves the merged beginner-guided service. */
    resolveGuidedService: function (context) {
        return toolingCommandService.loadMergedService(context.home,
            context.command.guidedService || 'defaultApplicationBuilderGuidedService');
    },

    /** Resolves the merged guarded generation service. */
    resolveGenerationService: function (context) {
        return toolingCommandService.loadMergedService(context.home,
            context.command.generationService || 'defaultApplicationBuilderGenerationService');
    },

    /** Resolves the merged qualification service. */
    resolveQualificationService: function (context) {
        return toolingCommandService.loadMergedService(context.home,
            context.command.qualificationService || 'defaultApplicationBuilderQualificationService');
    },

    /** Resolves the merged upgrade service. */
    resolveUpgradeService: function (context) {
        return toolingCommandService.loadMergedService(context.home,
            context.command.upgradeService || 'defaultApplicationBuilderUpgradeService');
    },

    /**
     * Executes a read-only Builder command and prints structured JSON.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after printing the result.
     */
    run: async function (context) {
        const catalogue = this.resolveCatalogueService(context).discover(this.repositoryCoordinates(context));
        let result;
        if (context.command.operation === 'discover') {
            result = catalogue;
        } else if (context.command.operation === 'questionnaire') {
            const guidedService = this.resolveGuidedService(context);
            const questionnaireOptions = { defaults: this.readAnswerTemplateOptions(context.args) };
            if (process.stdin && process.stdin.isTTY !== true) {
                questionnaireOptions.scriptedAnswers = fs.readFileSync(0, 'utf8').split(/\r?\n/);
            }
            const answers = await guidedService.runQuestionnaire(questionnaireOptions);
            result = {
                contractVersion: 0,
                operation: 'questionnaire',
                writePerformed: false,
                answers: answers,
                nextCommand: 'builder:dry-run --answers=/path/to/guided-answers.json'
            };
            const outputPath = this.readOption(context.args, '--output', '');
            if (outputPath) {
                result.artifact = guidedService.writeAnswersTemplate(outputPath, answers, {
                    protectedRoots: [context.home, this.readOption(context.args, '--agora', ''),
                        this.readOption(context.args, '--kickoff', ''), this.experienceRoot(context)]
                });
                result.writePerformed = true;
                result.nextCommand = 'builder:dry-run --answers=' + result.artifact.path;
            }
            if (this.readBooleanOption(context.args, '--dry-run', false)) {
                result.dryRunResult = guidedService.dryRun(answers, catalogue);
            }
        } else if (context.command.operation === 'answers-template') {
            const guidedService = this.resolveGuidedService(context);
            const answers = guidedService.createAnswersTemplate(this.readAnswerTemplateOptions(context.args));
            result = {
                contractVersion: 0,
                operation: 'answers-template',
                writePerformed: false,
                answers: answers,
                nextCommand: 'builder:dry-run --answers=/path/to/guided-answers.json'
            };
            const outputPath = this.readOption(context.args, '--output', '');
            if (outputPath) {
                result.artifact = guidedService.writeAnswersTemplate(outputPath, answers, {
                    protectedRoots: [context.home, this.readOption(context.args, '--agora', ''),
                        this.readOption(context.args, '--kickoff', ''), this.experienceRoot(context)]
                });
                result.writePerformed = true;
                result.nextCommand = 'builder:dry-run --answers=' + result.artifact.path;
            }
            if (this.readBooleanOption(context.args, '--dry-run', false)) {
                result.dryRunResult = guidedService.dryRun(answers, catalogue);
            }
        } else if (context.command.operation === 'guide') {
            result = this.resolveGuidedService(context).guide(this.loadGuidedAnswers(context.args), catalogue, {
                workspaceRoot: this.readOption(context.args, '--workspace', ''),
                protectedRoots: [context.home, this.readOption(context.args, '--agora', ''),
                    this.readOption(context.args, '--kickoff', ''), this.experienceRoot(context)]
            });
        } else if (context.command.operation === 'dry-run') {
            result = this.resolveGuidedService(context).dryRun(this.loadGuidedAnswers(context.args), catalogue);
        } else if (context.command.operation === 'approve') {
            const approvalReference = this.readOption(context.args, '--approval-reference', '');
            result = this.resolveGenerationService(context).approvePlan(this.loadPlan(context.args), approvalReference);
        } else if (context.command.operation === 'generate') {
            const outputRoot = this.readOption(context.args, '--output', '');
            result = this.resolveGenerationService(context).generate(this.loadPlan(context.args),
                this.loadSolution(context.args), catalogue, outputRoot, {
                    protectedRoots: [context.home, this.readOption(context.args, '--agora', ''),
                        this.readOption(context.args, '--kickoff', ''), this.experienceRoot(context)]
                });
        } else if (context.command.operation === 'qualify') {
            const outputRoot = this.readOption(context.args, '--output', '');
            const referenceEvidencePath = this.readOption(context.args, '--reference-evidence', '');
            result = this.resolveQualificationService(context).qualify(this.loadPlan(context.args),
                this.loadSolution(context.args), catalogue, outputRoot, {
                    referenceEvidencePath: referenceEvidencePath || undefined,
                    executeCommands: this.readOption(context.args, '--execute-commands', 'true') !== 'false'
                });
        } else if (context.command.operation === 'release-manifest') {
            result = this.resolveUpgradeService(context).createReleaseManifest(this.loadSolution(context.args),
                this.loadPlan(context.args), catalogue, {
                    releaseChannel: this.readOption(context.args, '--release-channel', 'LOCAL_BUILDER'),
                    signer: this.readOption(context.args, '--signer', 'nodics.local.builder')
                });
        } else if (context.command.operation === 'upgrade-plan') {
            result = this.resolveUpgradeService(context).createUpgradePlan(this.loadLock(context.args),
                this.loadReleaseManifest(context.args), this.loadPlan(context.args), this.loadSolution(context.args),
                catalogue);
        } else {
            const solution = this.loadSolution(context.args);
            const planningService = this.resolvePlanningService(context);
            if (context.command.operation === 'validate') {
                result = planningService.validateSolution(solution, catalogue);
            } else if (context.command.operation === 'plan') {
                result = planningService.createPlan(solution, catalogue);
            } else {
                throw new Error('Unsupported Application Builder command operation: ' + context.command.operation);
            }
        }
        if (result && typeof result === 'object' && !Array.isArray(result) &&
            ['questionnaire', 'answers-template', 'guide', 'dry-run', 'approve', 'generate', 'qualify']
                .includes(context.command.operation)) {
            result.beginnerWorkflow = this.workflow(context.command.operation);
        }
        console.log(JSON.stringify(result, null, 2));
        return true;
    }
};
