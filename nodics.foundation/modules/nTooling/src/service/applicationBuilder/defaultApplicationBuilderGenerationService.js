/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderGenerationService
 * @description Approves and executes deterministic minimal Builder plans inside a new explicit output root with containment, hash, ownership, and rollback guards.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling may contribute templates, but must preserve plan binding, absent-root generation, symlink rejection, customer-owned non-overwrite, artifact hashing, and created-root-only rollback.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const contractService = require('./defaultApplicationBuilderContractService');
const catalogueService = require('./defaultApplicationBuilderCatalogueService');
const planningService = require('./defaultApplicationBuilderPlanningService');

module.exports = {
    /** Returns a JSON-safe copy of a value. */
    clone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    /** Returns the plan payload bound by approval, excluding mutable approval evidence. */
    approvalPayload: function (plan) {
        const payload = this.clone(plan);
        payload.approval = { required: true, state: 'PENDING' };
        return payload;
    },

    /** Returns the digest that an approval binds. */
    approvalDigest: function (plan) {
        return catalogueService.digest(this.approvalPayload(plan));
    },

    /** Creates an approved plan copy without mutating the planned artifact. */
    approvePlan: function (plan, approvalReference, approvedAt = new Date().toISOString()) {
        const structural = contractService.validateDocument('plan', plan);
        if (!structural.valid) {
            throw new Error('Cannot approve invalid Builder plan:\n- ' + structural.errors.join('\n- '));
        }
        if (plan.approval.state !== 'PENDING') {
            throw new Error('Only a PENDING Builder plan can be approved');
        }
        if (!approvalReference || !String(approvalReference).trim()) {
            throw new Error('Builder approval requires a non-empty approval reference');
        }
        if (Date.parse(plan.expiresAt) <= Date.parse(approvedAt)) {
            throw new Error('Builder plan has expired and cannot be approved');
        }
        const approved = this.clone(plan);
        approved.approval = {
            required: true,
            state: 'APPROVED',
            approvedPlanDigest: this.approvalDigest(plan),
            approvedAt: approvedAt,
            approvalReference: String(approvalReference).trim()
        };
        const approvedStructural = contractService.validateDocument('plan', approved);
        if (!approvedStructural.valid) {
            throw new Error('Builder approval produced an invalid plan:\n- ' + approvedStructural.errors.join('\n- '));
        }
        return Object.freeze(approved);
    },

    /** Validates that approval still binds the current solution, catalogue, and canonical plan. */
    validateApprovedPlan: function (plan, solution, catalogue, now = new Date().toISOString()) {
        const errors = contractService.validateDocument('plan', plan).errors.slice();
        if (plan?.approval?.state !== 'APPROVED') {
            errors.push('Builder generation requires an APPROVED plan');
        }
        if (Date.parse(plan?.expiresAt) <= Date.parse(now)) {
            errors.push('Approved Builder plan has expired');
        }
        if (plan?.solutionDigest !== catalogueService.digest(solution)) {
            errors.push('Approved Builder plan does not match the supplied solution');
        }
        if (plan?.catalogueDigest !== catalogue.catalogueDigest) {
            errors.push('Approved Builder plan does not match the current capability catalogue');
        }
        if (plan?.approval?.approvedPlanDigest !== this.approvalDigest(plan)) {
            errors.push('Approved Builder plan digest is invalid');
        }
        try {
            const canonical = planningService.createPlan(solution, catalogue, {
                createdAt: plan.createdAt,
                expiresAt: plan.expiresAt
            });
            if (this.approvalDigest(canonical) !== this.approvalDigest(plan)) {
                errors.push('Approved Builder plan differs from the current canonical plan');
            }
        } catch (error) {
            errors.push(error.message);
        }
        return { valid: errors.length === 0, errors: Array.from(new Set(errors)).sort() };
    },

    /** Resolves and validates an absent absolute generation root with non-symlink ancestors. */
    resolveOutputRoot: function (configuredRoot, protectedRoots = []) {
        if (!configuredRoot || !path.isAbsolute(configuredRoot)) {
            throw new Error('Builder generation requires --output as an absolute path');
        }
        const requestedRoot = path.resolve(configuredRoot);
        const forbidden = new Set([path.parse(requestedRoot).root, path.resolve(os.homedir())]
            .concat(protectedRoots.filter(Boolean).map(root => path.resolve(root))));
        if (forbidden.has(requestedRoot)) {
            throw new Error('Builder generation output is a protected root: ' + requestedRoot);
        }
        if (fs.existsSync(requestedRoot)) {
            throw new Error('Builder generation output must be absent: ' + requestedRoot);
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
            throw new Error('Builder generation output has no available parent directory');
        }
        if (fs.lstatSync(ancestor).isSymbolicLink()) {
            throw new Error('Builder generation rejects symlinked output ancestors: ' + ancestor);
        }
        const realAncestor = fs.realpathSync(ancestor);
        const outputRoot = path.resolve(realAncestor, path.relative(ancestor, requestedRoot));
        return outputRoot;
    },

    /** Returns deterministic sample products for the selected domains without copying customer data. */
    starterProducts: function (solution) {
        const domains = (solution.capabilities.domains || []).map(domain => domain.toLowerCase());
        const products = [];
        if (domains.length === 0) {
            products.push({
                code: solution.identity.projectCode + '-commerce-product-001',
                domain: 'commerce',
                name: 'Starter Commerce Product',
                price: { amount: 49, currency: (solution.commerce.currencies || ['USD'])[0] },
                attributes: { catalogue: (solution.commerce.catalogs || ['mainProductCatalog'])[0], stockStatus: 'in-stock' },
                rendererKey: 'commerce.product.card'
            });
        }
        if (domains.includes('apparel')) {
            products.push({
                code: solution.identity.projectCode + '-apparel-look-001',
                domain: 'apparel',
                name: 'Starter Apparel Look',
                price: { amount: 79, currency: (solution.commerce.currencies || ['USD'])[0] },
                attributes: { brand: 'Customer brand', sizeRange: ['S', 'M', 'L'], colors: ['black', 'sand'] },
                rendererKey: 'agora.apparel.product-card'
            });
        }
        if (domains.includes('electronics')) {
            products.push({
                code: solution.identity.projectCode + '-electronics-device-001',
                domain: 'electronics',
                name: 'Starter Smart Device',
                price: { amount: 499, currency: (solution.commerce.currencies || ['USD'])[0] },
                attributes: { brand: 'Customer electronics', warrantyMonths: 24, specs: ['OLED display', '128GB storage'] },
                rendererKey: 'agora.electronics.product-card'
            });
        }
        if (domains.includes('telco')) {
            products.push({
                code: solution.identity.projectCode + '-telco-device-plan-001',
                domain: 'telco',
                name: 'Starter Device + Mobile Plan',
                price: { amount: 125, currency: (solution.commerce.currencies || ['USD'])[0], recurring: 'MONTHLY' },
                attributes: { device: '5G smartphone', planType: 'postpaid', dataAllowance: '25GB',
                    minutes: 'unlimited', provisioning: 'SIM_OR_ESIM' },
                rendererKey: 'agora.telco.product-card'
            });
        }
        return products;
    },

    /** Returns frontend wiring metadata for generated handoff files. */
    frontendWiring: function (solution) {
        const frontends = solution.topology.frontends || [];
        return {
            contractVersion: 1,
            orchestration: 'nodics.exp may coordinate workspaces and scripts only; app repositories remain separately owned.',
            generatedApps: {
                agora: { selected: frontends.includes('AGORA'), repository: 'nodics.agora',
                    role: 'Customer commerce storefront experience' },
                axis: { selected: frontends.includes('AXIS'), repository: 'nodics.axis',
                    role: 'BackOffice and operational administration' },
                nexus: { selected: frontends.includes('NEXUS'), repository: 'nodics.nexus',
                    role: 'Corporate website and content experience' }
            },
            extensionRoots: ['storefront/customer', 'backend/customer'].concat((solution.data.packs || [])
                .slice().sort().map(dataPack => 'data/' + dataPack))
        };
    },

    /** Returns a markdown list for the generated starter products. */
    starterProductLines: function (solution) {
        return this.starterProducts(solution).map(product => '- `' + product.code + '` — ' +
            product.domain + ' via `' + product.rendererKey + '`').join('\n');
    },

    /** Returns a beginner-safe list of customer-owned extension roots. */
    customizationRoots: function (solution) {
        return ['backend/customer', 'storefront/customer'].concat((solution.data.packs || [])
            .slice().sort().map(dataPack => 'data/' + dataPack));
    },

    /** Returns the domain represented by a generated data pack. */
    dataPackDomain: function (dataPack) {
        if (dataPack === 'nexus.web') {
            return 'web';
        }
        return dataPack.split('.').pop();
    },

    /** Returns starter products that belong in a customer-owned data pack. */
    dataPackProducts: function (solution, dataPack) {
        const domain = this.dataPackDomain(dataPack);
        if (domain === 'web') {
            return [];
        }
        return this.starterProducts(solution).filter(product => product.domain === domain);
    },

    /** Returns deterministic starter data-pack content for generated customer roots. */
    dataPackDocument: function (solution, dataPack, documentPath) {
        const projectCode = solution.identity.projectCode;
        const domain = this.dataPackDomain(dataPack);
        const products = this.dataPackProducts(solution, dataPack);
        const base = {
            contractVersion: 1,
            projectCode: projectCode,
            dataPack: dataPack,
            domain: domain,
            ownership: 'CUSTOMER_OWNED'
        };
        if (documentPath === 'manifest.json') {
            return Object.assign({}, base, {
                description: dataPack === 'nexus.web' ? 'Corporate website starter content data pack' :
                        'Domain storefront starter data pack for ' + domain,
                catalogs: solution.commerce.catalogs || [],
                files: [
                    'pages/home.json',
                    'components/hero.json',
                    'content/sections.json',
                    'products/starter-products.json',
                    'prices/starter-prices.json',
                    'inventory/starter-inventory.json'
                ]
            });
        }
        if (documentPath === 'pages/home.json') {
            return Object.assign({}, base, {
                code: dataPack.replace(/\./g, '-') + '-home',
                route: dataPack === 'nexus.web' ? '/' : (domain === 'common' ? '/' : '/' + domain),
                title: dataPack === 'nexus.web' ? 'Welcome to ' + projectCode :
                    domain === 'common' ? 'Shop ' + projectCode : 'Shop ' + domain,
                slots: ['hero', 'featured-products', 'trust-band']
            });
        }
        if (documentPath === 'components/hero.json') {
            return Object.assign({}, base, {
                code: dataPack.replace(/\./g, '-') + '-hero',
                componentType: 'hero',
                headline: dataPack === 'nexus.web' ? 'Customer website starter' :
                    domain === 'common' ? 'Commerce starter experience' : 'Curated ' + domain + ' experience',
                cta: dataPack === 'nexus.web' ? 'Explore company' : 'Shop now',
                rendererHint: domain === 'web' ? 'nexus.hero' : 'agora.hero'
            });
        }
        if (documentPath === 'content/sections.json') {
            return Object.assign({}, base, {
                sections: [
                    { code: 'hero', title: domain === 'web' ? 'Corporate story' : 'Storefront hero' },
                    { code: 'featured-products', title: products.length ? 'Featured ' + domain : 'Featured content' },
                    { code: 'trust-band', title: 'Delivery, support, and returns' }
                ]
            });
        }
        if (documentPath === 'products/starter-products.json') {
            return Object.assign({}, base, { products: products });
        }
        if (documentPath === 'prices/starter-prices.json') {
            return Object.assign({}, base, {
                prices: products.map(product => ({
                    productCode: product.code,
                    currency: product.price.currency,
                    amount: product.price.amount,
                    recurring: product.price.recurring || null
                }))
            });
        }
        if (documentPath === 'inventory/starter-inventory.json') {
            return Object.assign({}, base, {
                inventory: products.map(product => ({
                    productCode: product.code,
                    stockStatus: product.domain === 'telco' ? 'available-with-provisioning' : 'in-stock',
                    quantity: product.domain === 'telco' ? null : 25
                }))
            });
        }
        throw new Error('Unknown generated data-pack document: ' + dataPack + '/' + documentPath);
    },

    /** Returns starter data-pack summaries for runtime and docs. */
    dataPackSummaries: function (solution) {
        return (solution.data.packs || []).slice().sort().map(dataPack => ({
            dataPack: dataPack,
            domain: this.dataPackDomain(dataPack),
            productCount: this.dataPackProducts(solution, dataPack).length,
            root: 'data/' + dataPack
        }));
    },

    /** Renders the generated first-30-minutes guide. */
    firstThirtyMinutesGuide: function (solution, plan) {
        const projectCode = solution.identity.projectCode;
        return '# First 30 minutes\n\n' +
            'This guide is for a developer who has just received this generated Nodics starter and does not know the framework yet.\n\n' +
            '## 0-5 minutes: prove the generated files\n\n' +
            '```bash\nnpm test\n```\n\n' +
            'This runs the generated file verifier, backend contracts, and storefront contracts.\n\n' +
            '## 5-10 minutes: prove the runtime\n\n' +
            '```bash\nnpm run verify:runtime\n```\n\n' +
            'This starts the generated backend and storefront on ephemeral local ports and probes health, composition, products, and the Agora page.\n\n' +
            '## 10-20 minutes: understand what was selected\n\n' +
            '- Project: `' + projectCode + '`\n' +
            '- Backend capabilities: `' + plan.backendGraph.nodes.join('`, `') + '`\n' +
            '- Frontends: `' + solution.topology.frontends.join('`, `') + '`\n' +
            '- Active domains: `' + (solution.capabilities.domains.length ? solution.capabilities.domains.join('`, `') : 'BASE_COMMERCE') + '`\n' +
            '- Data packs: `' + solution.data.packs.slice().sort().join('`, `') + '`\n\n' +
            'Read `builder-handoff.json` for the machine-readable summary and `solution-lock.json` for the approved generated state.\n\n' +
            '## 20-30 minutes: know where to work\n\n' +
            '- Backend starter APIs are explained in `docs/api-catalogue.md`.\n' +
            '- Storefront renderer hierarchy is explained in `docs/frontend-guide.md`.\n' +
            '- Safe and managed customization areas are explained in `docs/customization-map.md`.\n' +
            '- Starter pages, components, products, prices, inventory, and content live under each selected `data/*` pack.\n' +
            '- Optional frontend repository wiring is in `integrations/`.\n\n' +
            'Rule of thumb: customer data and project-specific hooks live here; reusable framework and domain behavior belongs in `nodics.ai`.\n';
    },

    /** Renders the generated backend API catalogue. */
    apiCatalogueGuide: function (solution) {
        return '# Backend API catalogue\n\n' +
            'The generated backend is a small runnable customer starter. It is not the full Nodics framework runtime.\n\n' +
            '## Endpoints\n\n' +
            '| Method | Path | Purpose |\n' +
            '| --- | --- | --- |\n' +
            '| GET | `/health` | Runtime readiness probe. |\n' +
            '| GET | `/api/commerce/composition` | Selected project, backend graph, frontend graph, commerce, security, and data-pack summary. |\n' +
            '| GET | `/api/commerce/catalogs` | Selected product/content catalog names and data packs. |\n' +
            '| GET | `/api/commerce/data-packs` | Generated customer data-pack roots and starter product counts. |\n' +
            '| GET | `/api/commerce/products` | Starter products for selected domains. |\n' +
            '| GET | `/api/commerce/products/:code` | One starter product by code. |\n' +
            '| GET | `/api/commerce/cart/preview` | Cart preview using generated starter products. |\n' +
            '| GET | `/api/commerce/checkout/preview` | Checkout step preview and backend-owned authorization marker. |\n\n' +
            '## Starter products\n\n' +
            this.starterProductLines(solution) + '\n\n' +
            '## Data-pack source files\n\n' +
            this.dataPackSummaries(solution).map(summary => '- `' + summary.root +
                '` — domain `' + summary.domain + '`, starter products `' + summary.productCount + '`').join('\n') + '\n\n' +
            '## Domain notes\n\n' +
            '- Apparel starter products include brand, size, and color attributes.\n' +
            '- Electronics starter products include specification and warranty attributes.\n' +
            '- Telco starter products model a device plus mobile plan, because telco combines electronics-style device context with subscription/plan behavior.\n' +
            '- Combined starters include one product per selected domain.\n\n' +
            '## Customization rule\n\n' +
            'Use `backend/src/customerHooks.js` for project-specific enrichment. Move reusable domain behavior back into `nodics.ai` before it becomes a framework capability.\n';
    },

    /** Renders the generated frontend guide. */
    frontendGuide: function (solution) {
        return '# Frontend guide\n\n' +
            'The generated storefront is an Agora starter, intentionally small enough to inspect in one sitting.\n\n' +
            '## Selected renderer hierarchy\n\n' +
            '- Composition: `agora.' + solution.experience.composition + '`\n' +
            '- Renderer keys: `' + solution.experience.rendererKeys.join('`, `') + '`\n\n' +
            'The storefront renders only the selected renderer keys. Unselected domain renderers are kept out of the generated page and are protected by `storefront/test/domain-rendering-contract.test.js`.\n\n' +
            '## Key files\n\n' +
            '- `storefront/src/server.js`: bootable local storefront server.\n' +
            '- `storefront/src/pages.js`: page assembly for the selected composition.\n' +
            '- `storefront/src/renderers.js`: small generated renderer map for selected starter products.\n' +
            '- `storefront/generated/agora-composition.ts`: generated composition snapshot for the selected hierarchy.\n' +
            '- `storefront/customer`: customer-owned extension root.\n\n' +
            '## Frontend repository roles\n\n' +
            '- `nodics.agora`: customer commerce storefront.\n' +
            '- `nodics.axis`: BackOffice/admin application when selected.\n' +
            '- `nodics.nexus`: corporate/content website when selected.\n' +
            '- `nodics.exp`: optional workspace orchestration only; it does not own application source.\n';
    },

    /** Renders the generated customization map. */
    customizationMap: function (solution) {
        return '# Customization map\n\n' +
            'This file separates safe project customization from generated or framework-owned behavior.\n\n' +
            '## Safe customer-owned roots\n\n' +
            this.customizationRoots(solution).map(root => '- `' + root + '`').join('\n') + '\n\n' +
            'Use these roots for customer-specific data, hooks, page/component content, product catalogues, prices, inventory, and local project wiring.\n\n' +
            'Each generated `data/*` pack starts with `manifest.json`, `pages/home.json`, `components/hero.json`, `content/sections.json`, `products/starter-products.json`, `prices/starter-prices.json`, and `inventory/starter-inventory.json`.\n\n' +
            '## Managed generated roots\n\n' +
            '- `backend/src/server.js`\n' +
            '- `backend/src/starterData.js`\n' +
            '- `storefront/src/server.js`\n' +
            '- `storefront/src/pages.js`\n' +
            '- `storefront/src/renderers.js`\n' +
            '- `verify-generated.js`\n' +
            '- `verify-runtime.js`\n' +
            '- `solution-lock.json`\n\n' +
            'These files may be regenerated from the approved Builder plan. Treat edits here as disposable unless intentionally promoted into a governed template.\n\n' +
            '## Framework-owned behavior\n\n' +
            '- Commerce/domain rules shared across customers belong in `nodics.ai`.\n' +
            '- Axis, Nexus, and Agora source remains in their own repositories.\n' +
            '- Customer data packs remain customer-owned and are expected to vary by project.\n';
    },

    /** Produces deterministic content for one planned generated file. */
    renderFile: function (relativePath, solution, plan, catalogue) {
        const projectCode = solution.identity.projectCode;
        const displayName = solution.identity.displayName || projectCode;
        const locale = (solution.commerce.locales || ['en'])[0];
        const currency = (solution.commerce.currencies || ['USD'])[0];
        const market = (solution.commerce.markets || ['LOCAL'])[0];
        const capability = code => plan.resolvedCapabilities.find(item => item.code === code);
        if (relativePath === 'package.json') {
            return JSON.stringify({ name: projectCode, version: '0.0.0', private: true,
                scripts: {
                    test: 'node verify-generated.js && npm --prefix backend test && npm --prefix storefront test',
                    'verify:runtime': 'node verify-runtime.js'
                },
                workspaces: ['backend', 'storefront'] }, null, 2) + '\n';
        }
        if (relativePath === '.env.example') {
            return 'NODE_ENV=development\n' +
                'BACKEND_HOST=127.0.0.1\n' +
                'BACKEND_PORT=4300\n' +
                'STOREFRONT_HOST=127.0.0.1\n' +
                'STOREFRONT_PORT=3300\n' +
                'NODICS_CUSTOMER_CODE=' + solution.identity.customerCode + '\n' +
                'NODICS_PROJECT_CODE=' + projectCode + '\n';
        }
        if (relativePath === '.gitignore') {
            return 'node_modules/\n.env\nlogs/\ntmp/\ndist/\ncoverage/\n.DS_Store\n';
        }
        if (relativePath === 'builder-handoff.json') {
            return JSON.stringify({
                contractVersion: 1,
                project: {
                    projectCode: projectCode,
                    customerCode: solution.identity.customerCode,
                    displayName: displayName
                },
                builder: {
                    planId: plan.planId,
                    approvalReference: plan.approval.approvalReference,
                    solutionDigest: plan.solutionDigest,
                    catalogueDigest: catalogue.catalogueDigest,
                    qualificationState: 'NOT_RUN'
                },
                selected: {
                    backendCapabilities: plan.backendGraph.nodes,
                    frontends: solution.topology.frontends,
                    activeDomains: solution.capabilities.domains,
                    storefrontComposition: solution.experience.composition,
                    rendererKeys: solution.experience.rendererKeys,
                    dataPacks: solution.data.packs.slice().sort()
                },
                ownership: {
                    framework: 'Reusable framework and domain behavior stays in nodics.ai.',
                    projectData: 'Customer-owned product, content, page, component, price, inventory, and catalogue data belongs in customer data packs.',
                    frontend: 'Frontend orchestration may use nodics.exp; Axis, Nexus, and Agora remain separate application repositories.',
                    generatedRoot: 'Generated files may be regenerated from the approved plan; customer-owned roots are extension points.'
                },
                nextCommands: [
                    'npm test',
                    'npm run verify:runtime',
                    'builder:qualify --solution=/path/to/solution.json --plan=/path/to/approved-plan.json --output=' + projectCode
                ],
                customizationRoots: [
                    'backend/customer',
                    'storefront/customer'
                ].concat((solution.data.packs || []).slice().sort().map(dataPack => 'data/' + dataPack))
            }, null, 2) + '\n';
        }
        if (relativePath === 'README.md') {
            return '# ' + displayName + '\n\n' +
                'This project was generated by the Nodics Application Builder from an approved plan.\n\n' +
                'It is intentionally small: it references the selected framework/domain/frontend/data boundaries and gives a new team a runnable backend, Agora storefront, wiring notes, and local deployment draft.\n\n' +
                '## What was selected\n\n' +
                '- Project code: `' + projectCode + '`\n' +
                '- Storefront: `Agora ' + solution.experience.composition + '`\n' +
                '- Frontends: `' + solution.topology.frontends.join('`, `') + '`\n' +
                '- Backend capabilities: `' + plan.backendGraph.nodes.join('`, `') + '`\n' +
                '- Active domains: `' + (solution.capabilities.domains.length ? solution.capabilities.domains.join('`, `') : 'BASE_COMMERCE') + '`\n' +
                '- Data packs: `' + solution.data.packs.join('`, `') + '`\n\n' +
                '## First commands\n\n' +
                '```bash\nnpm test\nnpm run verify:runtime\n```\n\n' +
                'If this is your first time with Nodics, start with `docs/first-30-minutes.md` and then open the API, frontend, and customization guides in `docs/`.\n\n' +
                'Run Builder qualification after those commands pass:\n\n' +
                '```bash\nbuilder:qualify --solution=/path/to/solution.json --plan=/path/to/approved-plan.json --output=' + projectCode + '\n```\n\n' +
                '## Ownership\n\n' +
                '- Reusable framework and domain behavior stays in `nodics.ai`.\n' +
                '- Customer-owned catalogue, page, component, price, inventory, and content data belongs in selected data packs.\n' +
                '- `backend/customer` and `storefront/customer` are safe customization roots.\n' +
                '- `nodics.exp` can orchestrate frontends, but it does not own Axis, Nexus, or Agora source.\n\n' +
                '## Handoff file\n\n' +
                'Read `builder-handoff.json` for the machine-readable Builder decision summary, ownership rules, selected capabilities, and next commands.\n\n' +
                '## Generated starter depth\n\n' +
                '- Backend exposes health, composition, catalogue, product, cart preview, and checkout preview APIs.\n' +
                '- Storefront renders domain-specific Agora product cards from selected renderer keys.\n' +
                '- `integrations/` explains optional Axis/Nexus wiring without copying those repositories.\n' +
                '- `deployment/local-compose.yaml` is a local packaging draft, not a production deployment contract.\n';
        }
        if (relativePath === 'verify-generated.js') {
            const expected = plan.operations.filter(operation => operation.operation !== 'CREATE_DIRECTORY')
                .map(operation => operation.targetPath).sort();
            const excluded = plan.excludedCapabilityAssertions.slice().sort();
            return "const fs = require('fs');\nconst path = require('path');\n" +
                'const expected = ' + JSON.stringify(expected, null, 2) + ';\n' +
                'const excluded = ' + JSON.stringify(excluded, null, 2) + ';\n' +
                "expected.forEach(file => { if (!fs.existsSync(path.join(__dirname, file))) throw new Error('Missing generated artifact: ' + file); });\n" +
                "const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');\n" +
                "if (!readme.includes('Nodics Application Builder') || !readme.includes('## Ownership') || !readme.includes('docs/first-30-minutes.md')) throw new Error('Generated README handoff is incomplete');\n" +
                "['docs/first-30-minutes.md', 'docs/api-catalogue.md', 'docs/frontend-guide.md', 'docs/customization-map.md'].forEach(file => {\n" +
                "  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');\n" +
                "  if (!content.includes('customer') && !content.includes('Customer')) throw new Error('Generated beginner guide is incomplete: ' + file);\n" +
                "});\n" +
                "const handoff = JSON.parse(fs.readFileSync(path.join(__dirname, 'builder-handoff.json'), 'utf8'));\n" +
                "if (handoff.project.projectCode !== '" + projectCode + "') throw new Error('Builder handoff project identity mismatch');\n" +
                "if (!handoff.ownership.framework.includes('nodics.ai')) throw new Error('Builder handoff ownership boundary is incomplete');\n" +
                "const graph = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend/generated/" + projectCode + "-module-graph.json'), 'utf8'));\n" +
                "excluded.forEach(code => { if (graph.capabilities.includes(code)) throw new Error('Excluded capability generated: ' + code); });\n" +
                "['backend/src/server.js', 'storefront/src/server.js', 'verify-runtime.js'].forEach(file => { if (!fs.existsSync(path.join(__dirname, file))) throw new Error('Missing bootable artifact: ' + file); });\n" +
                "console.log('Generated Nodics application verified: " + projectCode + "');\n";
        }
        if (relativePath === 'verify-runtime.js') {
            return "const http = require('http');\n" +
                "const backend = require('./backend/src/server');\n" +
                "const storefront = require('./storefront/src/server');\n\n" +
                "function listen(app, port) { return new Promise(resolve => { const server = app.createServer().listen(port, '127.0.0.1', () => resolve(server)); }); }\n" +
                "function get(port, pathname) { return new Promise((resolve, reject) => {\n" +
                "  const request = http.get({ hostname: '127.0.0.1', port, path: pathname, timeout: 5000 }, response => {\n" +
                "    let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });\n" +
                "    response.on('end', () => resolve({ statusCode: response.statusCode, body }));\n" +
                "  });\n" +
                "  request.on('error', reject); request.on('timeout', () => request.destroy(new Error('Runtime probe timed out: ' + pathname)));\n" +
                "}); }\n\n" +
                "(async () => {\n" +
                "  const backendServer = await listen(backend, 0);\n" +
                "  const storefrontServer = await listen(storefront, 0);\n" +
                "  try {\n" +
                "    const backendPort = backendServer.address().port;\n" +
                "    const storefrontPort = storefrontServer.address().port;\n" +
                "    const health = await get(backendPort, '/health');\n" +
                "    const composition = await get(backendPort, '/api/commerce/composition');\n" +
                "    const products = await get(backendPort, '/api/commerce/products');\n" +
                "    const dataPacks = await get(backendPort, '/api/commerce/data-packs');\n" +
                "    const page = await get(storefrontPort, '/');\n" +
                "    if (health.statusCode !== 200 || !health.body.includes('\"status\":\"READY\"')) throw new Error('Backend health probe failed');\n" +
                "    if (composition.statusCode !== 200 || !composition.body.includes('\"projectCode\":\"" + projectCode + "\"')) throw new Error('Backend composition probe failed');\n" +
                "    if (products.statusCode !== 200 || !products.body.includes('\"products\"')) throw new Error('Backend product API probe failed');\n" +
                "    if (dataPacks.statusCode !== 200 || !dataPacks.body.includes('\"dataPacks\"')) throw new Error('Backend data-pack API probe failed');\n" +
                "    if (page.statusCode !== 200 || !page.body.includes('data-agora-composition=\"true\"')) throw new Error('Storefront page probe failed');\n" +
                "    if (!page.body.includes('data-pack-summary=\"true\"')) throw new Error('Storefront data-pack summary probe failed');\n" +
                "    console.log('Generated Nodics runtime verified: " + projectCode + "');\n" +
                "  } finally {\n" +
                "    await Promise.all([new Promise(resolve => backendServer.close(resolve)), new Promise(resolve => storefrontServer.close(resolve))]);\n" +
                "  }\n" +
                "})().catch(error => { console.error(error.message); process.exit(1); });\n";
        }
        if (relativePath === 'backend/package.json' || relativePath === 'storefront/package.json') {
            const area = relativePath.split('/')[0];
            return JSON.stringify({ name: projectCode + '-' + area, version: '0.0.0', private: true,
                scripts: { start: 'node src/server.js',
                    test: area === 'backend' ? 'node test/runtime-contract.test.js && node test/api-contract.test.js' :
                        'node test/storefront-contract.test.js && node test/domain-rendering-contract.test.js' } }, null, 2) + '\n';
        }
        if (relativePath === 'backend/src/customerHooks.js') {
            return "'use strict';\n\n" +
                "// Customer-owned extension hooks. Keep reusable framework/domain behavior in nodics.ai.\n" +
                "function enrichProduct(product) {\n" +
                "  return product;\n" +
                "}\n\n" +
                "function beforeCartPreview(cart) {\n" +
                "  return cart;\n" +
                "}\n\n" +
                "function beforeCheckoutPreview(checkout) {\n" +
                "  return checkout;\n" +
                "}\n\n" +
                "module.exports = { enrichProduct, beforeCartPreview, beforeCheckoutPreview };\n";
        }
        if (relativePath === 'backend/src/starterData.js') {
            return "'use strict';\n\n" +
                'const composition = ' + JSON.stringify({
                    contractVersion: 1,
                    projectCode: projectCode,
                    customerCode: solution.identity.customerCode,
                    displayName: displayName,
                    backendGraph: plan.backendGraph,
                    frontendGraph: plan.frontendGraph,
                    commerce: solution.commerce,
                    experience: solution.experience,
                    security: solution.security,
                    dataPacks: solution.data.packs
                }, null, 2) + ";\n\n" +
                'const products = ' + JSON.stringify(this.starterProducts(solution), null, 2) + ";\n\n" +
                'const dataPackSamples = ' + JSON.stringify(this.dataPackSummaries(solution), null, 2) + ";\n\n" +
                "const catalogs = { catalogs: composition.commerce.catalogs, dataPacks: composition.dataPacks };\n\n" +
                "module.exports = { composition, products, catalogs, dataPackSamples };\n";
        }
        if (relativePath === 'backend/src/server.js') {
            return "const http = require('http');\n" +
                "const starterData = require('./starterData');\n" +
                "const hooks = require('./customerHooks');\n\n" +
                "const composition = starterData.composition;\n\n" +
                "function send(response, statusCode, payload) {\n" +
                "  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);\n" +
                "  response.writeHead(statusCode, { 'content-type': typeof payload === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8', 'cache-control': 'no-store' });\n" +
                "  response.end(body);\n" +
                "}\n\n" +
                "function productPayload(product) {\n" +
                "  return hooks.enrichProduct(Object.assign({}, product), { composition });\n" +
                "}\n\n" +
                "function createServer() {\n" +
                "  return http.createServer((request, response) => {\n" +
                "    const url = new URL(request.url, 'http://127.0.0.1');\n" +
                "    if (request.method === 'GET' && url.pathname === '/health') return send(response, 200, { status: 'READY', projectCode: composition.projectCode });\n" +
                "    if (request.method === 'GET' && url.pathname === '/api/commerce/composition') return send(response, 200, composition);\n" +
                "    if (request.method === 'GET' && url.pathname === '/api/commerce/catalogs') return send(response, 200, starterData.catalogs);\n" +
                "    if (request.method === 'GET' && url.pathname === '/api/commerce/data-packs') return send(response, 200, { dataPacks: starterData.dataPackSamples });\n" +
                "    if (request.method === 'GET' && url.pathname === '/api/commerce/products') return send(response, 200, { products: starterData.products.map(productPayload) });\n" +
                "    if (request.method === 'GET' && url.pathname.startsWith('/api/commerce/products/')) {\n" +
                "      const code = decodeURIComponent(url.pathname.replace('/api/commerce/products/', ''));\n" +
                "      const product = starterData.products.find(item => item.code === code);\n" +
                "      return product ? send(response, 200, productPayload(product)) : send(response, 404, { error: 'PRODUCT_NOT_FOUND', code });\n" +
                "    }\n" +
                "    if (request.method === 'GET' && url.pathname === '/api/commerce/cart/preview') return send(response, 200, hooks.beforeCartPreview({ projectCode: composition.projectCode, currency: composition.commerce.currencies[0], entries: starterData.products.map(product => ({ productCode: product.code, quantity: 1 })) }, { composition }));\n" +
                "    if (request.method === 'GET' && url.pathname === '/api/commerce/checkout/preview') return send(response, 200, hooks.beforeCheckoutPreview({ projectCode: composition.projectCode, steps: ['cart', 'address', 'delivery', 'payment', 'review'], security: composition.security.authorization }, { composition }));\n" +
                "    return send(response, 404, { error: 'NOT_FOUND', path: url.pathname });\n" +
                "  });\n" +
                "}\n\n" +
                "if (require.main === module) {\n" +
                "  const port = Number(process.env.PORT || 4300);\n" +
                "  createServer().listen(port, '127.0.0.1', () => console.log('Generated backend ready on http://127.0.0.1:' + port));\n" +
                "}\n\n" +
                "module.exports = { createServer, composition, starterData };\n";
        }
        if (relativePath === 'backend/test/runtime-contract.test.js') {
            return "const assert = require('assert');\n" +
                "const backend = require('../src/server');\n\n" +
                "assert.strictEqual(typeof backend.createServer, 'function', 'Backend must expose a bootable server factory');\n" +
                "assert.strictEqual(backend.composition.projectCode, '" + projectCode + "', 'Backend composition must preserve project identity');\n" +
                "assert.deepStrictEqual(backend.composition.backendGraph.nodes, " + JSON.stringify(plan.backendGraph.nodes) + ", 'Backend graph must match the approved plan');\n" +
                "assert.strictEqual(backend.composition.security.authorization, 'BACKEND_OWNED', 'Backend must own authorization');\n" +
                "console.log('Generated backend contract validated: " + projectCode + "');\n";
        }
        if (relativePath === 'backend/test/api-contract.test.js') {
            const expectedDomains = Array.from(new Set(this.starterProducts(solution).map(product => product.domain))).sort();
            return "const assert = require('assert');\n" +
                "const backend = require('../src/server');\n" +
                "const hooks = require('../src/customerHooks');\n\n" +
                "assert.strictEqual(typeof hooks.enrichProduct, 'function', 'Customer product enrichment hook must be available');\n" +
                "assert.strictEqual(typeof hooks.beforeCartPreview, 'function', 'Customer cart hook must be available');\n" +
                "assert.strictEqual(typeof hooks.beforeCheckoutPreview, 'function', 'Customer checkout hook must be available');\n" +
                "assert(backend.starterData.products.length > 0, 'Generated backend must include starter product data');\n" +
                "assert.deepStrictEqual(backend.starterData.dataPackSamples.map(item => item.dataPack).sort(), " + JSON.stringify(solution.data.packs.slice().sort()) + ", 'Generated backend must expose selected data-pack samples');\n" +
                "assert.deepStrictEqual(Array.from(new Set(backend.starterData.products.map(product => product.domain))).sort(), " + JSON.stringify(expectedDomains) + ", 'Starter products must match selected domains');\n" +
                "backend.starterData.products.forEach(product => {\n" +
                "  assert(product.code && product.name && product.price && product.rendererKey, 'Starter product must be API-ready');\n" +
                "});\n" +
                "console.log('Generated backend API depth validated: " + projectCode + "');\n";
        }
        if (relativePath === 'backend/generated/' + projectCode + '-module-graph.json') {
            return JSON.stringify({ contractVersion: 1, projectCode: projectCode,
                capabilities: plan.backendGraph.nodes, edges: plan.backendGraph.edges,
                runtimeRoles: solution.topology.backendRuntimes }, null, 2) + '\n';
        }
        if (relativePath.startsWith('backend/generated/dependencies/') && relativePath.endsWith('.json')) {
            const code = path.basename(relativePath, '.json');
            const resolved = capability(code);
            if (!resolved) {
                throw new Error('Planned dependency has no resolved capability: ' + code);
            }
            return JSON.stringify(resolved, null, 2) + '\n';
        }
        if (relativePath === 'storefront/generated/agora-composition.ts') {
            const content = { contractVersion: 1, projectCode: projectCode,
                composition: solution.experience.composition, routes: solution.experience.routes,
                rendererKeys: solution.experience.rendererKeys, frontendGraph: plan.frontendGraph };
            return 'const composition = ' + JSON.stringify(content, null, 2) + ' as const;\n\nexport { composition };\nexport default composition;\n';
        }
        if (relativePath === 'storefront/index.html') {
            return '<!doctype html>\n<html lang="' + locale + '">\n<head>\n' +
                '  <meta charset="utf-8">\n' +
                '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
                '  <title>' + displayName + '</title>\n' +
                '</head>\n<body>\n' +
                '  <main id="root" data-agora-composition="true"></main>\n' +
                '  <script src="/src/server.js" defer></script>\n' +
                '</body>\n</html>\n';
        }
        if (relativePath === 'storefront/src/renderers.js') {
            return "'use strict';\n\n" +
                "const rendererLabels = {\n" +
                "  'commerce.product.card': 'Base commerce card with price and availability',\n" +
                "  'agora.apparel.product-card': 'Apparel card with brand, size, and color selectors',\n" +
                "  'agora.electronics.product-card': 'Electronics card with specs and warranty summary',\n" +
                "  'agora.telco.product-card': 'Telco card combining device/plan/subscription cues'\n" +
                "};\n\n" +
                "function escapeHtml(value) {\n" +
                "  return String(value).replace(/[&<>\\\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\\\"': '&quot;' }[character]));\n" +
                "}\n\n" +
                "function renderProductCard(product, composition) {\n" +
                "  const rendererKey = composition.rendererKeys.includes(product.rendererKey) ? product.rendererKey : composition.rendererKeys[0];\n" +
                "  return '<article class=\"product-card\" data-renderer=\"' + escapeHtml(rendererKey) + '\">' +\n" +
                "    '<h2>' + escapeHtml(product.name) + '</h2>' +\n" +
                "    '<p>' + escapeHtml(rendererLabels[rendererKey] || 'Commerce product card') + '</p>' +\n" +
                "    '<p><strong>' + escapeHtml(product.price.currency) + ' ' + escapeHtml(product.price.amount) + '</strong></p>' +\n" +
                "    '<pre>' + escapeHtml(JSON.stringify(product.attributes, null, 2)) + '</pre>' +\n" +
                "    '</article>';\n" +
                "}\n\n" +
                "module.exports = { rendererLabels, renderProductCard };\n";
        }
        if (relativePath === 'storefront/src/pages.js') {
            return "'use strict';\n\n" +
                "const { renderProductCard } = require('./renderers');\n\n" +
                "function renderDataPackSummary(dataPackSamples) {\n" +
                "  return '<section class=\"data-packs\" data-pack-summary=\"true\"><h2>Customer data packs</h2>' +\n" +
                "    dataPackSamples.map(dataPack => '<article data-pack=\"' + dataPack.dataPack + '\"><h3>' + dataPack.dataPack + '</h3><p>Domain: ' + dataPack.domain + ', products: ' + dataPack.productCount + '</p></article>').join('') +\n" +
                "    '</section>';\n" +
                "}\n\n" +
                "function page(composition, products, dataPackSamples) {\n" +
                "  const cards = products.map(product => renderProductCard(product, composition)).join('');\n" +
                "  return '<!doctype html><html lang=\"' + composition.locale + '\"><head><meta charset=\"utf-8\"><title>" + displayName + "</title></head>' +\n" +
                "    '<body><main id=\"root\" data-agora-composition=\"true\"><section class=\"hero\"><h1>" + displayName + "</h1>' +\n" +
                "    '<p>Agora ' + composition.composition + ' storefront for ' + composition.market + '</p></section>' +\n" +
                "    '<section class=\"catalogue\" data-domain-renderers=\"true\">' + cards + '</section>' +\n" +
                "    renderDataPackSummary(dataPackSamples) +\n" +
                "    '<section class=\"handoff\"><p>Customize content/data in customer data packs and reusable behavior in nodics.ai.</p></section>' +\n" +
                "    '</main></body></html>';\n" +
                "}\n\n" +
                "module.exports = { page, renderDataPackSummary };\n";
        }
        if (relativePath === 'storefront/src/server.js') {
            return "const http = require('http');\n" +
                "const { page } = require('./pages');\n\n" +
                'const composition = ' + JSON.stringify({
                    contractVersion: 1,
                    projectCode: projectCode,
                    composition: solution.experience.composition,
                    routes: solution.experience.routes,
                    rendererKeys: solution.experience.rendererKeys,
                    dataPacks: solution.data.packs,
                    catalogs: solution.commerce.catalogs,
                    market: market,
                    locale: locale,
                    currency: currency
                }, null, 2) + ";\n\n" +
                'const products = ' + JSON.stringify(this.starterProducts(solution), null, 2) + ";\n\n" +
                'const dataPackSamples = ' + JSON.stringify(this.dataPackSummaries(solution), null, 2) + ";\n\n" +
                "function renderPage() { return page(composition, products, dataPackSamples); }\n\n" +
                "function createServer() {\n" +
                "  return http.createServer((request, response) => {\n" +
                "    const url = new URL(request.url, 'http://127.0.0.1');\n" +
                "    if (request.method === 'GET' && url.pathname === '/') {\n" +
                "      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });\n" +
                "      response.end(renderPage());\n" +
                "      return;\n" +
                "    }\n" +
                "    if (request.method === 'GET' && url.pathname === '/composition.json') {\n" +
                "      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });\n" +
                "      response.end(JSON.stringify(composition));\n" +
                "      return;\n" +
                "    }\n" +
                "    if (request.method === 'GET' && url.pathname === '/data-packs.json') {\n" +
                "      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });\n" +
                "      response.end(JSON.stringify({ dataPacks: dataPackSamples }));\n" +
                "      return;\n" +
                "    }\n" +
                "    response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });\n" +
                "    response.end(JSON.stringify({ error: 'NOT_FOUND', path: url.pathname }));\n" +
                "  });\n" +
                "}\n\n" +
                "if (require.main === module) {\n" +
                "  const port = Number(process.env.PORT || 3300);\n" +
                "  createServer().listen(port, '127.0.0.1', () => console.log('Generated Agora storefront ready on http://127.0.0.1:' + port));\n" +
                "}\n\n" +
                "module.exports = { createServer, composition, products, dataPackSamples, page: renderPage };\n";
        }
        if (relativePath === 'storefront/test/storefront-contract.test.js') {
            return "const assert = require('assert');\n" +
                "const storefront = require('../src/server');\n\n" +
                "assert.strictEqual(typeof storefront.createServer, 'function', 'Storefront must expose a bootable server factory');\n" +
                "assert.strictEqual(storefront.composition.projectCode, '" + projectCode + "', 'Storefront composition must preserve project identity');\n" +
                "assert.deepStrictEqual(storefront.composition.rendererKeys, " + JSON.stringify(solution.experience.rendererKeys) + ", 'Storefront renderers must match selected hierarchy');\n" +
                "assert(storefront.page().includes('data-agora-composition=\"true\"'), 'Storefront page must expose the Agora composition marker');\n" +
                "assert(storefront.page().includes('data-pack-summary=\"true\"'), 'Storefront page must expose customer data-pack summaries');\n" +
                "console.log('Generated Agora storefront contract validated: " + projectCode + "');\n";
        }
        if (relativePath === 'storefront/test/domain-rendering-contract.test.js') {
            return "const assert = require('assert');\n" +
                "const storefront = require('../src/server');\n" +
                "const renderers = require('../src/renderers');\n\n" +
                "const html = storefront.page();\n" +
                "storefront.composition.rendererKeys.forEach(rendererKey => {\n" +
                "  assert(html.includes('data-renderer=\"' + rendererKey + '\"'), 'Generated storefront must render selected domain renderer: ' + rendererKey);\n" +
                "  assert(renderers.rendererLabels[rendererKey], 'Selected renderer must have a starter renderer label: ' + rendererKey);\n" +
                "});\n" +
                "['agora.apparel.product-card', 'agora.electronics.product-card', 'agora.telco.product-card']\n" +
                "  .filter(rendererKey => !storefront.composition.rendererKeys.includes(rendererKey))\n" +
                "  .forEach(rendererKey => assert(!html.includes('data-renderer=\"' + rendererKey + '\"'), 'Unselected renderer must not render: ' + rendererKey));\n" +
                "assert(html.includes('data-domain-renderers=\"true\"'), 'Generated storefront must expose domain renderer section');\n" +
                "console.log('Generated Agora domain rendering depth validated: " + projectCode + "');\n";
        }
        if (relativePath === 'solution.yaml') {
            return JSON.stringify(solution, null, 2) + '\n';
        }
        if (relativePath.startsWith('data/')) {
            const match = relativePath.match(/^data\/([^/]+)\/(.+)$/);
            if (!match) {
                throw new Error('Invalid generated data-pack path: ' + relativePath);
            }
            return JSON.stringify(this.dataPackDocument(solution, match[1], match[2]), null, 2) + '\n';
        }
        if (relativePath === 'docs/first-30-minutes.md') {
            return this.firstThirtyMinutesGuide(solution, plan);
        }
        if (relativePath === 'docs/api-catalogue.md') {
            return this.apiCatalogueGuide(solution);
        }
        if (relativePath === 'docs/frontend-guide.md') {
            return this.frontendGuide(solution);
        }
        if (relativePath === 'docs/customization-map.md') {
            return this.customizationMap(solution);
        }
        if (relativePath === 'integrations/frontend-wiring.json') {
            return JSON.stringify(this.frontendWiring(solution), null, 2) + '\n';
        }
        if (relativePath === 'integrations/axis-wiring.md') {
            return '# Axis wiring\n\n' +
                '- Selected: `AXIS`\n' +
                '- Repository reference: `nodics.axis`\n' +
                '- Purpose: BackOffice administration for the generated backend APIs and selected customer data packs.\n' +
                '- Boundary: this generated project does not copy Axis source; wire environment and API endpoint configuration from the customer workspace.\n';
        }
        if (relativePath === 'integrations/nexus-wiring.md') {
            return '# Nexus wiring\n\n' +
                '- Selected: `NEXUS`\n' +
                '- Repository reference: `nodics.nexus`\n' +
                '- Purpose: corporate website/content journey using `nexus.web` customer data.\n' +
                '- Boundary: this generated project does not copy Nexus source; wire content delivery and route configuration from the customer workspace.\n';
        }
        if (relativePath === 'deployment/README.md') {
            return '# Local deployment draft\n\n' +
                'This folder gives a beginner-friendly local packaging sketch for the generated backend and Agora storefront.\n\n' +
                '- Start locally with `npm test` and `npm run verify:runtime` before containerizing.\n' +
                '- Treat `local-compose.yaml` as a draft. Production deployment, secrets, TLS, observability, and scaling must be handled by the customer delivery platform.\n' +
                '- Axis, Nexus, and Agora repositories remain independently managed; this generated project only records how they are expected to connect.\n';
        }
        if (relativePath === 'deployment/local-compose.yaml') {
            return 'version: "3.9"\n' +
                'services:\n' +
                '  backend:\n' +
                '    image: node:20-alpine\n' +
                '    working_dir: /workspace/backend\n' +
                '    command: ["npm", "start"]\n' +
                '    ports:\n' +
                '      - "4300:4300"\n' +
                '    environment:\n' +
                '      PORT: "4300"\n' +
                '      NODICS_PROJECT_CODE: "' + projectCode + '"\n' +
                '    volumes:\n' +
                '      - ../:/workspace\n' +
                '  storefront:\n' +
                '    image: node:20-alpine\n' +
                '    working_dir: /workspace/storefront\n' +
                '    command: ["npm", "start"]\n' +
                '    ports:\n' +
                '      - "3300:3300"\n' +
                '    environment:\n' +
                '      PORT: "3300"\n' +
                '      BACKEND_URL: "http://backend:4300"\n' +
                '    volumes:\n' +
                '      - ../:/workspace\n';
        }
        if (relativePath === 'generation-and-validation-report.md') {
            return '# Generated Nodics application\n\n' +
                '- Project: `' + projectCode + '`\n' +
                '- Plan: `' + plan.planId + '`\n' +
                '- Approval: `' + plan.approval.approvalReference + '`\n' +
                '- Qualification: `NOT_RUN`\n' +
                '- Catalogue: `' + catalogue.catalogueDigest + '`\n' +
                '- Runtime scope: `FULL_GENERATED_APPLICATION` after `npm run verify:runtime` passes.\n';
        }
        throw new Error('Builder has no deterministic template for planned file: ' + relativePath);
    },

    /** Executes an approved minimal plan and returns generation evidence. */
    generate: function (plan, solution, catalogue, configuredRoot, options = {}) {
        const validation = this.validateApprovedPlan(plan, solution, catalogue, options.now);
        if (!validation.valid) {
            throw new Error('Builder generation validation failed:\n- ' + validation.errors.join('\n- '));
        }
        const outputRoot = this.resolveOutputRoot(configuredRoot, options.protectedRoots || []);
        const artifacts = [];
        let createdRoot = false;
        try {
            fs.mkdirSync(outputRoot);
            createdRoot = true;
            plan.operations.forEach((operation, index) => {
                const target = path.resolve(outputRoot, operation.targetPath);
                if (target !== outputRoot && !target.startsWith(outputRoot + path.sep)) {
                    throw new Error('Planned target escapes generation root: ' + operation.targetPath);
                }
                if (operation.operation === 'CREATE_DIRECTORY') {
                    fs.mkdirSync(target, { recursive: true });
                    return;
                }
                if (operation.targetPath === 'solution-lock.json') {
                    return;
                }
                fs.mkdirSync(path.dirname(target), { recursive: true });
                const content = this.renderFile(operation.targetPath, solution, plan, catalogue);
                fs.writeFileSync(target, content, { encoding: 'utf8', flag: 'wx' });
                artifacts.push({ path: operation.targetPath, ownership: operation.ownership,
                    digest: catalogueService.digest(content) });
                if (options.failAfterOperation === index + 1) {
                    throw new Error('Injected Builder generation failure');
                }
            });
            const generatedAt = options.now || new Date().toISOString();
            const lock = {
                contractVersion: 1,
                solutionDigest: plan.solutionDigest,
                planDigest: plan.approval.approvedPlanDigest,
                builder: { engineVersion: '0.1.0', contractVersion: 1, mode: solution.environment.mode },
                packages: plan.resolvedCapabilities.map(item => ({ code: item.code, version: item.version,
                    digest: item.descriptorDigest, source: solution.environment.mode })),
                templates: [{ code: 'builder.minimal', version: '0.0.0',
                    digest: catalogueService.digest('builder.minimal@0.1.0'), source: solution.environment.mode }],
                artifacts: artifacts.sort((left, right) => left.path.localeCompare(right.path)),
                effectiveGraphs: {
                    backend: { nodes: plan.backendGraph.nodes, digest: catalogueService.digest(plan.backendGraph) },
                    frontend: { nodes: plan.frontendGraph.nodes, digest: catalogueService.digest(plan.frontendGraph) }
                },
                dataPacks: solution.data.packs.slice().sort().map(code => ({ code: code, version: '0.0.0',
                    manifestDigest: catalogueService.digest((catalogue.customerDataPacks || []).find(pack => pack.code === code)) })),
                qualification: { state: 'NOT_RUN', verifiedAt: generatedAt,
                    evidenceDigest: catalogueService.digest(plan.qualification), gates: plan.qualification.expectedEvidence,
                    scope: 'GENERATED_SKELETON' }
            };
            const lockValidation = contractService.validateDocument('lock', lock);
            if (!lockValidation.valid) {
                throw new Error('Builder produced an invalid solution lock:\n- ' + lockValidation.errors.join('\n- '));
            }
            fs.writeFileSync(path.join(outputRoot, 'solution-lock.json'), JSON.stringify(lock, null, 2) + '\n',
                { encoding: 'utf8', flag: 'wx' });
            return { generated: true, outputRoot: outputRoot, planId: plan.planId,
                planDigest: plan.approval.approvedPlanDigest, artifactCount: artifacts.length + 1,
                qualification: 'NOT_RUN' };
        } catch (error) {
            if (createdRoot && fs.existsSync(outputRoot)) {
                fs.rmSync(outputRoot, { recursive: true, force: true });
            }
            throw error;
        }
    }
};
