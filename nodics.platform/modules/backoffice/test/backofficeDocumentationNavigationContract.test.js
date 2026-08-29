/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');

const platformProperties = require('../../../config/properties');
const backofficeCapability = require('../src/service/defaultBackofficeBackofficeCapabilityService').getCapability();
const axisCapability = require('../../axis/src/service/defaultAxisBackofficeCapabilityService').getCapability();
const apiContracts = require('../src/schemas/apiContracts');

const backofficeNavigation = backofficeCapability.navigation;
const axisNavigation = axisCapability.navigation;
const navigation = backofficeNavigation.concat(axisNavigation).sort((left, right) =>
    (left.order || 0) - (right.order || 0));
const documentation = navigation.find(item => item.id === 'documentation');
const documentationLinks = navigation.filter(item =>
    item.group && item.group.id === 'documentation' && item.featureState === 'ACTIVE');
const sources = backofficeCapability.documentation
    .concat(axisCapability.documentation)
    .sort((left, right) => left.order - right.order);
const allowedBackofficeRoles = new Set(apiContracts.moduleRole.enum);

assert(documentation, 'BackOffice must contribute the documentation navigation entry');
assert.strictEqual(documentation.label, 'Nodics Documentation');
assert.strictEqual(documentation.route, '/docs');
assert.strictEqual(documentation.group.id, 'documentation');
assert.strictEqual(documentation.group.label, 'Documentation');
assert.strictEqual(documentation.group.order, 1600);
assert.strictEqual(documentation.featureState, 'HIDDEN');
assert.deepStrictEqual(documentation.contexts, ['environment', 'tenant', 'enterprise']);
assert.strictEqual(documentation.requiredPermissions, undefined,
    'authenticated employees must not require an unrelated operational permission to read help');
assert.deepStrictEqual(documentationLinks.map(item => item.id), [
    'documentation-dashboard',
    'documentation-management',
    'documentation-navigation',
    'documentation-pages',
    'documentation-access-policies',
    'documentation-publication-queue',
    'documentation-search-preview',
    'documentation-governance-readiness',
    'documentation-source-evidence',
    'documentation-framework',
    'documentation-swaggers',
    'documentation-nodics-axis',
    'documentation-nodics-kickoff'
]);
assert.deepStrictEqual(documentationLinks.map(item => item.label), [
    'Dashboard',
    'Documentation Designer',
    'Navigation Builder',
    'Pages and Topic Content',
    'Audience and Access Policies',
    'Review and Publication Queue',
    'Search Metadata Preview',
    'Governance and Readiness',
    'Source Evidence Review',
    'Framework',
    'Swaggers',
    'Nodics Axis',
    'Nodics Kickoff'
]);
assert.deepStrictEqual(documentationLinks.map(item => item.route), [
    '/docs',
    '/docs/designer',
    '/docs/designer/navigation',
    '/docs/designer/pages',
    '/docs/designer/access-policies',
    '/docs/designer/publication',
    '/docs/designer/search',
    '/docs/designer/governance',
    '/docs/designer/source-evidence',
    '/docs/framework',
    '/docs/swaggers',
    '/docs/nodics-axis',
    '/docs/nodics-kickoff'
]);
assert.deepStrictEqual(
    documentationLinks.find(item => item.id === 'documentation-management').requiredPermissions,
    [
        'documentation.draft.create',
        'documentation.navigation.update',
        'documentation.dashboard.update',
        'documentation.accessPolicy.update',
        'documentation.submitReview'
    ],
    'Documentation Designer must be visible only to documentation authors or administrators'
);
assert.deepStrictEqual(
    Object.fromEntries(documentationLinks.filter(item => item.parentId === 'documentation-management').map(item => [
        item.id,
        item.workbenchTarget
    ])),
    {
        'documentation-navigation': { moduleName: 'cms', schemaName: 'cmsDocumentationNode' },
        'documentation-pages': { moduleName: 'cms', schemaName: 'cmsDocumentationPage' },
        'documentation-access-policies': { moduleName: 'cms', schemaName: 'cmsDocumentationAccessPolicy' },
        'documentation-publication-queue': { moduleName: 'cms', schemaName: 'cmsDocumentationPublicationState' },
        'documentation-search-preview': { moduleName: 'cms', schemaName: 'cmsDocumentationSearchMetadata' },
        'documentation-governance-readiness': {
            moduleName: 'cms',
            schemaName: 'cmsDocumentationPublicationState',
            governanceService: 'DefaultCmsDocumentationGovernanceService',
            authoringModelRoute: '/documentation/governance/model',
            validationRoute: '/documentation/governance/validate',
            renderProjectionRoute: '/documentation/governance/render-projection',
            searchRoute: '/documentation/governance/search',
            publicationHandoffRoute: '/documentation/governance/publication-handoff',
            migrationPlanRoute: '/documentation/governance/migration-plan'
        },
        'documentation-source-evidence': { moduleName: 'cms', schemaName: 'cmsDocumentationPage' }
    },
    'Documentation management children must resolve through CMS-owned documentation schemas'
);
assert.deepStrictEqual(
    documentationLinks.find(item => item.id === 'documentation-publication-queue').requiredPermissions,
    ['documentation.review', 'documentation.approve', 'documentation.publish'],
    'Documentation publication queue must require explicit documentation review, approval, and publish permissions'
);
assert.strictEqual(
    axisNavigation.find(item => item.id === 'documentation-nodics-axis').group.id,
    'documentation',
    'Axis documentation navigation must remain grouped under BackOffice documentation'
);
assert(documentationLinks.every(item => item.group.id === 'documentation'),
    'documentation child links must remain grouped under the documentation navigation area');
assert(documentationLinks.every(item => item.group.order === 1600),
    'documentation child links must keep the top-level documentation group order');
assert(documentationLinks.every(item => item.contexts.join('|') === 'environment|tenant|enterprise'),
    'documentation child links must keep the same context boundary as the documentation landing');
assert(documentationLinks.every(item => item.featureState === 'ACTIVE'),
    'documentation child links must be active direct destinations');
assert.deepStrictEqual(sources.map(source => source.id), ['framework', 'swaggers', 'nodics-axis']);
assert.deepStrictEqual(
    backofficeCapability.documentation.map(source => source.id),
    ['framework', 'swaggers'],
    'BackOffice must not own Axis product documentation content'
);
assert.deepStrictEqual(
    axisCapability.documentation.map(source => source.id),
    ['nodics-axis'],
    'Platform axis module must own Axis product documentation content'
);
assert(axisCapability.roles.every(role => allowedBackofficeRoles.has(role)),
    'Platform axis module must use BackOffice provider roles accepted by runtime registration');
assert(axisCapability.roles.includes('UI_COMPOSITION_PROVIDER'),
    'Platform axis module contributes UI composition and documentation metadata');
assert.strictEqual(platformProperties.apiExposure.categories.dataImport.enabled, true,
    'Platform keeps dataImport available for governed platform initialization APIs');
assert(sources.every(source => source.connectionModule),
    'every documentation source must resolve its runtime through the BackOffice registry');
assert.strictEqual(sources.find(source => source.id === 'nodics-axis').packCode, 'axisDocumentation');
assert.strictEqual(sources.find(source => source.id === 'framework').site, 'nodicsDocumentationSite',
    'Framework documentation must resolve through the nodics.docs-owned CMS site');
assert.strictEqual(sources.find(source => source.id === 'framework').catalog, 'documentationContentCatalog',
    'Framework documentation must resolve through the shared documentation content catalog');
assert.strictEqual(sources.find(source => source.id === 'framework').defaultPage, '/docs/framework',
    'Framework documentation must default to the generated framework landing route');
assert.strictEqual(sources.find(source => source.id === 'nodics-axis').site, 'axisDocumentationSite',
    'Axis product documentation must resolve through the Platform axis module CMS site');
assert(sources.every(source => source.dashboard && source.dashboard.summary),
    'every documentation source must provide dashboard summary metadata');
assert.deepStrictEqual(sources.map(source => source.dashboard.coverage.score), [92, 100, 78]);
assert.deepStrictEqual(sources.map(source => source.dashboard.coverage.status), ['STRONG', 'REFERENCE', 'STRONG']);
assert(sources.find(source => source.id === 'framework').dashboard.coverage.signals.includes('Docs module ownership'),
    'Framework documentation metadata must advertise the Docs module ownership page');
assert(sources.every(source => Array.isArray(source.dashboard.coverage.gaps)),
    'documentation dashboard coverage must expose bounded gap lists for the landing dashboard');

console.log('BackOffice documentation navigation contract tests passed');
