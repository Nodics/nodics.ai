/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderPlanningService
 * @description Validates Builder solution specifications against a source-backed catalogue, resolves dependencies, enforces backend/frontend/data symmetry, and emits immutable non-executable generation plans.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may add domain-specific semantic validation through mergeable methods, but must preserve fail-closed dependency, secret, path, ownership, approval, and exclusion invariants.
 */
const contractService = require('./defaultApplicationBuilderContractService');
const catalogueService = require('./defaultApplicationBuilderCatalogueService');

module.exports = {
    /**
     * Returns the source-backed capability lookup for dependency resolution.
     * @param {Object} catalogue Builder capability catalogue.
     * @returns {Map<string,Object>} Capability lookup by code.
     */
    capabilityLookup: function (catalogue) {
        return new Map((catalogue.capabilities || []).map(capability => [capability.code, capability]));
    },

    /**
     * Resolves selected capability dependencies through package metadata `extends` relationships.
     * @param {string[]} selected Explicit capability codes.
     * @param {Object} catalogue Builder catalogue.
     * @returns {{capabilities:Object[],edges:Object[],errors:string[]}} Resolution result.
     */
    resolveCapabilities: function (selected, catalogue) {
        const lookup = this.capabilityLookup(catalogue);
        const resolved = new Map();
        const edges = [];
        const errors = [];
        const visiting = new Set();
        const visit = code => {
            if (resolved.has(code)) {
                return;
            }
            if (visiting.has(code)) {
                errors.push('Capability dependency cycle detected at: ' + code);
                return;
            }
            const capability = lookup.get(code);
            if (!capability) {
                errors.push('Selected or required capability is not available: ' + code);
                return;
            }
            visiting.add(code);
            (capability.extends || []).forEach(parentCode => {
                edges.push({ from: code, to: parentCode, relation: 'EXTENDS' });
                visit(parentCode);
            });
            visiting.delete(code);
            resolved.set(code, capability);
        };
        selected.forEach(visit);
        return {
            capabilities: Array.from(resolved.values()).sort((left, right) => left.code.localeCompare(right.code)),
            edges: edges.sort((left, right) => (left.from + left.to).localeCompare(right.from + right.to)),
            errors: errors
        };
    },

    /**
     * Applies cross-document semantic rules that JSON Schema cannot express alone.
     * @param {Object} solution Solution specification.
     * @param {Object} catalogue Source-backed catalogue.
     * @param {Object} resolution Resolved capability graph.
     * @returns {string[]} Semantic diagnostics.
     */
    validateSemantics: function (solution, catalogue, resolution) {
        const errors = resolution.errors.slice();
        const selected = new Set(solution.capabilities.selected || []);
        const resolved = new Set(resolution.capabilities.map(capability => capability.code));
        const excluded = new Set(solution.capabilities.excluded || []);
        const dataPacks = new Set((catalogue.customerDataPacks || []).map(dataPack => dataPack.code));
        const composition = (catalogue.frontendCompositions || [])
            .find(candidate => candidate.code === solution.experience.composition);
        if ((solution.decisions.unresolved || []).length > 0) {
            errors.push('Material solution decisions remain unresolved');
        }
        selected.forEach(code => {
            if (excluded.has(code)) {
                errors.push('Capability cannot be both selected and excluded: ' + code);
            }
        });
        resolved.forEach(code => {
            if (excluded.has(code)) {
                errors.push('Excluded capability is required by the resolved graph: ' + code);
            }
        });
        if (!resolved.has('nodics.commerce')) {
            errors.push('Commerce applications must resolve nodics.commerce');
        }
        if (!solution.topology.backendRuntimes.includes('COMMERCE')) {
            errors.push('Commerce capability requires the COMMERCE runtime role');
        }
        if (!solution.topology.frontends.includes('AGORA')) {
            errors.push('An Agora storefront experience requires the AGORA frontend role');
        }
        if (!composition) {
            errors.push('Requested Agora composition is unavailable: ' + solution.experience.composition);
        } else {
            (solution.experience.rendererKeys || []).forEach(rendererKey => {
                if (!(composition.rendererKeys || []).includes(rendererKey)) {
                    errors.push('Requested renderer is unavailable in the Agora composition: ' + rendererKey);
                }
            });
        }
        const domainCodes = (solution.capabilities.domains || []).map(domain => domain.toLowerCase());
        const expectedComposition = domainCodes.length === 0 ? 'commerce' :
            domainCodes.length === 1 ? domainCodes[0] : 'combined';
        if (solution.experience.composition !== expectedComposition &&
            !(solution.experience.composition === 'telco' && domainCodes.includes('telco'))) {
            errors.push('Frontend composition does not match selected domains: expected ' + expectedComposition);
        }
        domainCodes.forEach(domainCode => {
            if (!resolved.has(domainCode)) {
                errors.push('Selected domain is absent from the backend capability graph: ' + domainCode);
            }
        });
        if (composition) {
            const activeDomains = (composition.domains || []).slice().sort();
            const selectedDomains = domainCodes.slice().sort();
            if (JSON.stringify(activeDomains) !== JSON.stringify(selectedDomains)) {
                errors.push('Agora composition active domains do not match selected domains');
            }
        }
        if (resolved.has('telco') && !resolved.has('electronics')) {
            errors.push('Telco must resolve its Electronics dependency');
        }
        (solution.data.packs || []).forEach(dataPack => {
            if (!dataPacks.has(dataPack)) {
                errors.push('Selected customer data pack is unavailable: ' + dataPack);
            }
        });
        domainCodes.forEach(domainCode => {
            const expectedPack = 'agora.' + domainCode;
            if (!(solution.data.packs || []).includes(expectedPack)) {
                errors.push('Selected domain requires customer data pack: ' + expectedPack);
            }
        });
        const expectedDataPacks = new Set(['agora.common'].concat(domainCodes.map(code => 'agora.' + code)));
        if ((solution.topology.frontends || []).includes('NEXUS')) {
            expectedDataPacks.add('nexus.web');
        }
        (solution.data.packs || []).forEach(dataPack => {
            if (!expectedDataPacks.has(dataPack)) {
                errors.push('Customer data pack is not required by the selected experience: ' + dataPack);
            }
        });
        expectedDataPacks.forEach(dataPack => {
            if (!(solution.data.packs || []).includes(dataPack)) {
                errors.push('Selected experience requires customer data pack: ' + dataPack);
            }
        });
        return Array.from(new Set(errors)).sort();
    },

    /**
     * Validates a solution against structural and source-backed semantic contracts.
     * @param {Object} solution Candidate solution.
     * @param {Object} catalogue Source-backed catalogue.
     * @returns {{valid:boolean,errors:string[],resolution:Object}} Validation result.
     */
    validateSolution: function (solution, catalogue) {
        const structural = contractService.validateDocument('solution', solution);
        if (!structural.valid) {
            return { valid: false, errors: structural.errors, resolution: { capabilities: [], edges: [], errors: [] } };
        }
        const resolution = this.resolveCapabilities(solution.capabilities.selected, catalogue);
        const errors = this.validateSemantics(solution, catalogue, resolution);
        return { valid: errors.length === 0, errors: errors, resolution: resolution };
    },

    /**
     * Builds ordered non-mutating plan operations for the selected customer composition.
     * @param {Object} solution Validated solution specification.
     * @param {Object} resolution Resolved dependency graph.
     * @param {string} sourceDigest Catalogue-backed source digest.
     * @returns {Object[]} Ordered planned operations.
     */
    buildOperations: function (solution, resolution, sourceDigest) {
        const projectCode = solution.identity.projectCode;
        const operations = [];
        const add = (operation, targetRoot, targetPath, ownership, precondition) => {
            operations.push({
                sequence: operations.length + 1,
                operation: operation,
                targetRoot: targetRoot,
                targetPath: targetPath,
                ownership: ownership,
                precondition: precondition,
                sourceDigest: sourceDigest
            });
        };
        add('CREATE_FILE', 'EVIDENCE', 'package.json', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', '.env.example', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', '.gitignore', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'README.md', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'builder-handoff.json', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'verify-generated.js', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'EVIDENCE', 'deployment', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'EVIDENCE', 'docs', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'EVIDENCE', 'integrations', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'BACKEND', 'backend/generated', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'BACKEND', 'backend/src', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'BACKEND', 'backend/test', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'BACKEND', 'backend/customer', 'CUSTOMER_OWNED', 'ABSENT');
        add('CREATE_FILE', 'BACKEND', 'backend/package.json', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'BACKEND', 'backend/src/customerHooks.js', 'CUSTOMER_OWNED', 'ABSENT');
        add('CREATE_FILE', 'BACKEND', 'backend/src/server.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'BACKEND', 'backend/src/starterData.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'BACKEND', 'backend/test/api-contract.test.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'BACKEND', 'backend/test/runtime-contract.test.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'BACKEND', 'backend/generated/' + projectCode + '-module-graph.json', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'STOREFRONT', 'storefront/generated', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'STOREFRONT', 'storefront/src', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'STOREFRONT', 'storefront/test', 'GENERATED', 'ABSENT');
        add('CREATE_DIRECTORY', 'STOREFRONT', 'storefront/customer', 'CUSTOMER_OWNED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/package.json', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/index.html', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/src/pages.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/src/renderers.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/src/server.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/test/domain-rendering-contract.test.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/test/storefront-contract.test.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'STOREFRONT', 'storefront/generated/agora-composition.ts', 'GENERATED', 'ABSENT');
        (solution.data.packs || []).slice().sort().forEach(dataPack => {
            add('CREATE_DIRECTORY', 'DATA', 'data/' + dataPack, 'CUSTOMER_OWNED', 'ABSENT');
            add('CREATE_FILE', 'DATA', 'data/' + dataPack + '/manifest.json', 'CUSTOMER_OWNED', 'ABSENT');
            add('CREATE_FILE', 'DATA', 'data/' + dataPack + '/pages/home.json', 'CUSTOMER_OWNED', 'ABSENT');
            add('CREATE_FILE', 'DATA', 'data/' + dataPack + '/components/hero.json', 'CUSTOMER_OWNED', 'ABSENT');
            add('CREATE_FILE', 'DATA', 'data/' + dataPack + '/content/sections.json', 'CUSTOMER_OWNED', 'ABSENT');
            add('CREATE_FILE', 'DATA', 'data/' + dataPack + '/products/starter-products.json', 'CUSTOMER_OWNED', 'ABSENT');
            add('CREATE_FILE', 'DATA', 'data/' + dataPack + '/prices/starter-prices.json', 'CUSTOMER_OWNED', 'ABSENT');
            add('CREATE_FILE', 'DATA', 'data/' + dataPack + '/inventory/starter-inventory.json', 'CUSTOMER_OWNED', 'ABSENT');
        });
        add('CREATE_FILE', 'EVIDENCE', 'deployment/README.md', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'deployment/local-compose.yaml', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'docs/api-catalogue.md', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'docs/customization-map.md', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'docs/first-30-minutes.md', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'docs/frontend-guide.md', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'integrations/frontend-wiring.json', 'GENERATED', 'ABSENT');
        if ((solution.topology.frontends || []).includes('AXIS')) {
            add('CREATE_FILE', 'EVIDENCE', 'integrations/axis-wiring.md', 'GENERATED', 'ABSENT');
        }
        if ((solution.topology.frontends || []).includes('NEXUS')) {
            add('CREATE_FILE', 'EVIDENCE', 'integrations/nexus-wiring.md', 'GENERATED', 'ABSENT');
        }
        add('CREATE_FILE', 'EVIDENCE', 'solution.yaml', 'CUSTOMER_OWNED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'solution-lock.json', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'verify-runtime.js', 'GENERATED', 'ABSENT');
        add('CREATE_FILE', 'EVIDENCE', 'generation-and-validation-report.md', 'GENERATED', 'ABSENT');
        resolution.capabilities.forEach(capability => {
            add('REGISTER_DEPENDENCY', 'BACKEND', 'backend/generated/dependencies/' + capability.code + '.json',
                'GENERATED', 'ABSENT');
        });
        return operations;
    },

    /**
     * Creates an immutable approval-required generation plan without writing application files.
     * @param {Object} solution Valid solution specification.
     * @param {Object} catalogue Source-backed capability catalogue.
     * @param {Object} options Planning options including an injectable clock.
     * @returns {Object} Structurally valid non-executable generation plan.
     */
    createPlan: function (solution, catalogue, options = {}) {
        const validation = this.validateSolution(solution, catalogue);
        if (!validation.valid) {
            throw new Error('Application Builder solution is invalid:\n- ' + validation.errors.join('\n- '));
        }
        const createdAt = options.createdAt || new Date().toISOString();
        const expiresAt = options.expiresAt || new Date(Date.parse(createdAt) + 24 * 60 * 60 * 1000).toISOString();
        const solutionDigest = catalogueService.digest(solution);
        const planSeed = catalogueService.digest({ solutionDigest: solutionDigest, catalogueDigest: catalogue.catalogueDigest });
        const explicit = new Set(solution.capabilities.selected);
        const plan = {
            contractVersion: 0,
            planId: 'builder-plan-' + planSeed.slice('sha256:'.length, 'sha256:'.length + 32),
            createdAt: createdAt,
            expiresAt: expiresAt,
            solutionDigest: solutionDigest,
            catalogueDigest: catalogue.catalogueDigest,
            builderVersion: '0.1.0',
            approval: { required: true, state: 'PENDING' },
            resolvedCapabilities: validation.resolution.capabilities.map(capability => ({
                code: capability.code,
                version: capability.version,
                descriptorDigest: capability.metadataDigest,
                selectionReason: explicit.has(capability.code) ? 'EXPLICIT' : 'EXTENDED'
            })),
            backendGraph: {
                nodes: validation.resolution.capabilities.map(capability => capability.code),
                edges: validation.resolution.edges
            },
            frontendGraph: {
                nodes: ['agora.' + solution.experience.composition].concat(solution.experience.rendererKeys).sort(),
                edges: solution.experience.rendererKeys.map(rendererKey => ({
                    from: rendererKey,
                    to: 'agora.' + solution.experience.composition,
                    relation: 'CONTRIBUTES'
                }))
            },
            operations: this.buildOperations(solution, validation.resolution, catalogue.catalogueDigest),
            excludedCapabilityAssertions: (solution.capabilities.excluded || []).slice().sort(),
            qualification: {
                commands: ['npm test', 'npm run verify:runtime', 'npm run structure:audit -- --fail',
                    'npm run llm:validate'],
                expectedEvidence: ['backend.graph', 'frontend.composition', 'customer.ownership',
                    'security.boundary', 'generated.handoff', 'generated.self-test', 'generated.runtime']
            }
        };
        const structural = contractService.validateDocument('plan', plan);
        if (!structural.valid) {
            throw new Error('Application Builder produced an invalid plan:\n- ' + structural.errors.join('\n- '));
        }
        return Object.freeze(plan);
    }
};
